"use server";

import { z } from "zod";
import type { ActionResult } from "@/lib/admin/action-result";
import { logAudit } from "@/lib/admin/audit";
import { invalidate } from "@/lib/admin/cache";
import { authorizeAction } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createServerSupabase } from "@/lib/supabase/server";
import { normalizeText } from "@/lib/text";
import { importRowSchema } from "@/lib/validation/import";

export type ImportReport = {
  created: number;
  updated: number;
  skipped: number;
  errors: { line: number; message: string }[];
};

const inputSchema = z.object({
  rows: z.array(z.record(z.string(), z.string())).min(1).max(2000),
  mode: z.enum(["create_only", "create_and_update"]),
});

/**
 * Importa produtos do CSV. O SKU identifica o produto: com "create_only",
 * linhas com SKU existente são ignoradas (nunca sobrescreve silenciosamente).
 */
export async function importProducts(input: unknown): Promise<ActionResult<ImportReport>> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Arquivo inválido ou com mais de 2000 linhas." };

  const supabase = await createServerSupabase();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").is("deleted_at", null),
    supabase.from("brands").select("id, name, slug").is("deleted_at", null),
  ]);
  const findId = (list: { id: string; name: string; slug: string }[] | null, value: string | null) => {
    if (!value) return null;
    const n = normalizeText(value);
    return list?.find((x) => x.slug === slugify(value) || normalizeText(x.name) === n)?.id ?? undefined;
  };

  const report: ImportReport = { created: 0, updated: 0, skipped: 0, errors: [] };
  const skus = parsed.data.rows.map((r) => (r.sku ?? "").trim()).filter(Boolean);
  const { data: existing } = skus.length
    ? await supabase.from("products").select("id, sku").in("sku", skus).is("deleted_at", null)
    : { data: [] as { id: string; sku: string | null }[] };
  const bySku = new Map((existing ?? []).map((p) => [p.sku, p.id]));
  const { data: slugRows } = await supabase.from("products").select("slug");
  const takenSlugs = new Set((slugRows ?? []).map((r) => r.slug));

  for (const [index, raw] of parsed.data.rows.entries()) {
    const line = index + 2; // linha 1 = cabeçalho
    const row = importRowSchema.safeParse(raw);
    if (!row.success) {
      report.errors.push({ line, message: row.error.issues.map((i) => i.message).join(" ") });
      continue;
    }
    const data = row.data;
    const categoryId = findId(categories, data.category);
    const brandId = findId(brands, data.brand);
    if (categoryId === undefined) {
      report.errors.push({ line, message: `Categoria "${data.category}" não encontrada. Cadastre-a antes de importar.` });
      continue;
    }
    if (brandId === undefined) {
      report.errors.push({ line, message: `Marca "${data.brand}" não encontrada. Cadastre-a antes de importar.` });
      continue;
    }
    if (data.status === "published" && !categoryId) {
      report.errors.push({ line, message: "Para publicar, informe a categoria." });
      continue;
    }
    const values = {
      name: data.name,
      sku: data.sku,
      category_id: categoryId,
      brand_id: brandId,
      description: data.description,
      short_description: data.shortDescription,
      price: data.price,
      sale_price: data.salePrice,
      price_display: data.priceDisplay,
      unit: data.unit,
      status: data.status,
      updated_by: auth.session.userId,
    };
    const existingId = data.sku ? bySku.get(data.sku) : undefined;
    if (existingId) {
      if (parsed.data.mode === "create_only") {
        report.skipped += 1;
        continue;
      }
      const { error } = await supabase.from("products").update(values).eq("id", existingId);
      if (error) report.errors.push({ line, message: "Não foi possível atualizar (verifique preços e campos)." });
      else report.updated += 1;
      continue;
    }
    let slug = slugify(data.name) || "produto";
    for (let n = 2; takenSlugs.has(slug); n++) slug = `${slugify(data.name)}-${n}`;
    takenSlugs.add(slug);
    const { error } = await supabase.from("products").insert({ ...values, slug, created_by: auth.session.userId });
    if (error) report.errors.push({ line, message: error.code === "23505" ? "SKU duplicado." : "Não foi possível criar (verifique os campos)." });
    else report.created += 1;
  }

  await logAudit(supabase, {
    userId: auth.session.userId,
    action: "product.import",
    entityType: "product",
    metadata: { created: report.created, updated: report.updated, skipped: report.skipped, errors: report.errors.length },
  });
  invalidate(CACHE_TAGS.products, CACHE_TAGS.collections);
  return { ok: true, message: `Importação concluída: ${report.created} criado(s), ${report.updated} atualizado(s).`, data: report };
}
