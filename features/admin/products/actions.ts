"use server";

import { z } from "zod";
import { friendlyDbError, zodFieldErrors, type ActionResult } from "@/lib/admin/action-result";
import { logAudit } from "@/lib/admin/audit";
import { invalidate, invalidateProduct } from "@/lib/admin/cache";
import { authorizeAction } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase/server";
import { productInputSchema, toProductPayload } from "@/lib/validation/product";
import type { Json } from "@/types/database.types";

const idsSchema = z.array(z.uuid()).min(1, "Selecione ao menos um produto.").max(500);

export async function saveProduct(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const product = parsed.data;
  const supabase = await createServerSupabase();

  const { data: previous } = await supabase
    .from("products")
    .select("slug, images:product_images(storage_path)")
    .eq("id", product.id)
    .maybeSingle();

  const { error } = await supabase.rpc("admin_save_product", { p: toProductPayload(product) as unknown as Json });
  if (error) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar o produto.") };

  // Remove do Storage as imagens que saíram do produto
  const kept = new Set(product.images.map((i) => i.storagePath).filter(Boolean));
  const removed = (previous?.images ?? []).map((i) => i.storage_path).filter((p): p is string => Boolean(p) && !kept.has(p));
  if (removed.length) await supabase.storage.from("products").remove(removed);

  await logAudit(supabase, {
    userId: auth.session.userId,
    action: previous ? "product.update" : "product.create",
    entityType: "product",
    entityId: product.id,
    metadata: { name: product.name, status: product.status, removedImages: removed.length },
  });
  invalidateProduct(product.slug, previous && previous.slug !== product.slug ? previous.slug : null);

  return { ok: true, message: previous ? "Produto atualizado" : "Produto criado", data: { id: product.id, slug: product.slug } };
}

export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Produto inválido." };
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc("admin_duplicate_product", { p_id: id });
  if (error || !data) return { ok: false, error: friendlyDbError(error, "Não foi possível duplicar.") };
  await logAudit(supabase, { userId: auth.session.userId, action: "product.duplicate", entityType: "product", entityId: data, metadata: { from: id } });
  return { ok: true, message: "Cópia criada como rascunho", data: { id: data } };
}

export async function setProductsStatus(ids: string[], status: "draft" | "published" | "archived"): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Seleção inválida." };
  const supabase = await createServerSupabase();
  if (status === "published") {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .in("id", parsed.data)
      .is("category_id", null);
    if (count) return { ok: false, error: `${count} produto(s) sem categoria. Defina a categoria antes de publicar.` };
  }
  const { error } = await supabase.from("products").update({ status }).in("id", parsed.data);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: `product.status.${status}`, entityType: "product", metadata: { ids: parsed.data } });
  invalidate(CACHE_TAGS.products, CACHE_TAGS.collections);
  const labels = { published: "publicados", draft: "movidos para rascunho", archived: "arquivados" };
  return { ok: true, message: `${parsed.data.length} produto(s) ${labels[status]}` };
}

export async function setProductsFeatured(ids: string[], featured: boolean): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: "Seleção inválida." };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("products").update({ is_featured: featured }).in("id", parsed.data);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: featured ? "product.feature" : "product.unfeature", entityType: "product", metadata: { ids: parsed.data } });
  invalidate(CACHE_TAGS.products, CACHE_TAGS.collections);
  return { ok: true, message: featured ? "Marcados como destaque" : "Destaque removido" };
}

export async function setProductsCategory(ids: string[], categoryId: string): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success || !z.uuid().safeParse(categoryId).success) return { ok: false, error: "Seleção inválida." };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("products").update({ category_id: categoryId }).in("id", parsed.data);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "product.category", entityType: "product", metadata: { ids: parsed.data, categoryId } });
  invalidate(CACHE_TAGS.products, CACHE_TAGS.collections);
  return { ok: true, message: "Categoria alterada" };
}

/** Exclusão segura: soft delete (some do site e do painel, mas pode ser recuperada no banco) */
export async function deleteProducts(ids: string[]): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: "Seleção inválida." };
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .in("id", parsed.data);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "product.delete", entityType: "product", metadata: { ids: parsed.data } });
  invalidate(CACHE_TAGS.products, CACHE_TAGS.collections);
  return { ok: true, message: `${parsed.data.length} produto(s) excluído(s)` };
}
