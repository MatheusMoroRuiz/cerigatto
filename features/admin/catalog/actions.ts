"use server";

import { z } from "zod";
import { friendlyDbError, zodFieldErrors, type ActionResult } from "@/lib/admin/action-result";
import { logAudit } from "@/lib/admin/audit";
import { invalidate } from "@/lib/admin/cache";
import { authorizeAction } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  checkbox,
  emptyToNull,
  httpsUrlField,
  imageUrlField,
  intField,
  optionalText,
  requiredText,
  slugField,
} from "@/lib/validation/common";

type Result = ActionResult<{ redirectTo?: string }>;

const uuidOrNull = z.preprocess(emptyToNull, z.uuid().nullable());
const whatsapp = z.preprocess(
  (v) => (typeof v === "string" ? v.replace(/\D+/g, "") || null : v),
  z.string().min(10, "Número incompleto (DDI + DDD + número).").max(15).nullable(),
);

// -----------------------------------------------------------------------------
// Categorias
// -----------------------------------------------------------------------------
const categorySchema = z.object({
  id: uuidOrNull,
  name: requiredText(120, "Informe o nome."),
  slug: slugField,
  parent_id: uuidOrNull,
  description: optionalText(600),
  image_url: imageUrlField,
  banner_url: imageUrlField,
  icon: optionalText(40),
  whatsapp_number: whatsapp,
  is_active: checkbox,
  show_in_menu: checkbox,
  is_featured: checkbox,
  sort_order: intField(0, 9999),
  seo_title: optionalText(70),
  seo_description: optionalText(170),
  seo_content: optionalText(20000),
});

export async function saveCategory(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = categorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const { id, ...values } = parsed.data;
  if (id && values.parent_id === id) return { ok: false, error: "A categoria não pode ser mãe dela mesma.", fieldErrors: { parent_id: "Escolha outra categoria." } };
  const attributeIds = formData.getAll("attribute_ids").filter((v): v is string => typeof v === "string" && z.uuid().safeParse(v).success);

  const supabase = await createServerSupabase();
  const query = id
    ? supabase.from("categories").update(values).eq("id", id).select("id").single()
    : supabase.from("categories").insert({ ...values, created_by: auth.session.userId }).select("id").single();
  const { data, error } = await query;
  if (error || !data) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar a categoria.") };

  await supabase.from("category_attributes").delete().eq("category_id", data.id);
  if (attributeIds.length) {
    await supabase.from("category_attributes").insert(attributeIds.map((attribute_id, i) => ({ category_id: data.id, attribute_id, sort_order: i })));
  }
  await logAudit(supabase, { userId: auth.session.userId, action: id ? "category.update" : "category.create", entityType: "category", entityId: data.id, metadata: { name: values.name } });
  invalidate(CACHE_TAGS.categories, CACHE_TAGS.products, CACHE_TAGS.redirects);
  return { ok: true, message: id ? "Categoria atualizada" : "Categoria criada", data: id ? {} : { redirectTo: `/admin/categorias/${data.id}` } };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const [{ count: children }, { count: products }] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id).is("deleted_at", null),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id).is("deleted_at", null),
  ]);
  if (children) return { ok: false, error: `Esta categoria tem ${children} subcategoria(s). Mova-as antes de excluir.` };
  if (products) return { ok: false, error: `Esta categoria tem ${products} produto(s). Mova-os para outra categoria antes de excluir.` };
  const { error } = await supabase.from("categories").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "category.delete", entityType: "category", entityId: id });
  invalidate(CACHE_TAGS.categories);
  return { ok: true, message: "Categoria excluída" };
}

// -----------------------------------------------------------------------------
// Marcas
// -----------------------------------------------------------------------------
const brandSchema = z.object({
  id: uuidOrNull,
  name: requiredText(120, "Informe o nome."),
  slug: slugField,
  description: optionalText(2000),
  logo_url: imageUrlField,
  banner_url: imageUrlField,
  website_url: httpsUrlField,
  is_active: checkbox,
  is_featured: checkbox,
  sort_order: intField(0, 9999),
  seo_title: optionalText(70),
  seo_description: optionalText(170),
});

export async function saveBrand(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = brandSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const { data, error } = await (id
    ? supabase.from("brands").update(values).eq("id", id).select("id").single()
    : supabase.from("brands").insert({ ...values, created_by: auth.session.userId }).select("id").single());
  if (error || !data) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar a marca.") };
  await logAudit(supabase, { userId: auth.session.userId, action: id ? "brand.update" : "brand.create", entityType: "brand", entityId: data.id, metadata: { name: values.name } });
  invalidate(CACHE_TAGS.brands, CACHE_TAGS.products, CACHE_TAGS.redirects);
  return { ok: true, message: id ? "Marca atualizada" : "Marca criada", data: id ? {} : { redirectTo: `/admin/marcas/${data.id}` } };
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("brand_id", id).is("deleted_at", null);
  if (count) return { ok: false, error: `Esta marca tem ${count} produto(s). Altere a marca deles antes de excluir.` };
  const { error } = await supabase.from("brands").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "brand.delete", entityType: "brand", entityId: id });
  invalidate(CACHE_TAGS.brands);
  return { ok: true, message: "Marca excluída" };
}

// -----------------------------------------------------------------------------
// Ambientes
// -----------------------------------------------------------------------------
const environmentSchema = z.object({
  id: uuidOrNull,
  name: requiredText(120, "Informe o nome."),
  slug: slugField,
  summary: optionalText(400),
  content: optionalText(20000),
  image_url: imageUrlField,
  banner_url: imageUrlField,
  is_active: checkbox,
  sort_order: intField(0, 9999),
  seo_title: optionalText(70),
  seo_description: optionalText(170),
});

export async function saveEnvironment(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = environmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const { data, error } = await (id
    ? supabase.from("environments").update(values).eq("id", id).select("id").single()
    : supabase.from("environments").insert({ ...values, created_by: auth.session.userId }).select("id").single());
  if (error || !data) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar o ambiente.") };
  await logAudit(supabase, { userId: auth.session.userId, action: id ? "environment.update" : "environment.create", entityType: "environment", entityId: data.id });
  invalidate(CACHE_TAGS.environments, CACHE_TAGS.redirects);
  return { ok: true, message: id ? "Ambiente atualizado" : "Ambiente criado", data: id ? {} : { redirectTo: `/admin/ambientes/${data.id}` } };
}

export async function deleteEnvironment(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("environments").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "environment.delete", entityType: "environment", entityId: id });
  invalidate(CACHE_TAGS.environments);
  return { ok: true, message: "Ambiente excluído" };
}

// -----------------------------------------------------------------------------
// Atributos (especificações)
// -----------------------------------------------------------------------------
const attributeSchema = z.object({
  id: uuidOrNull,
  name: requiredText(80, "Informe o nome."),
  slug: slugField,
  unit: optionalText(20),
  group_name: requiredText(60, "Informe o grupo (ex.: Especificações)."),
  is_filterable: checkbox,
  sort_order: intField(0, 9999),
});

export async function saveAttribute(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = attributeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = await (id ? supabase.from("attributes").update(values).eq("id", id) : supabase.from("attributes").insert(values));
  if (error) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar o atributo.") };
  await logAudit(supabase, { userId: auth.session.userId, action: id ? "attribute.update" : "attribute.create", entityType: "attribute", entityId: id, metadata: { name: values.name } });
  invalidate(CACHE_TAGS.products);
  return { ok: true, message: id ? "Atributo atualizado" : "Atributo criado", data: { redirectTo: "/admin/atributos" } };
}

export async function deleteAttribute(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { count } = await supabase.from("product_specifications").select("id", { count: "exact", head: true }).eq("attribute_id", id);
  if (count) return { ok: false, error: `Atributo usado em ${count} especificação(ões) de produtos. Remova-as antes.` };
  const { error } = await supabase.from("attributes").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "attribute.delete", entityType: "attribute", entityId: id });
  invalidate(CACHE_TAGS.products);
  return { ok: true, message: "Atributo excluído" };
}
