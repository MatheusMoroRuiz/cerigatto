import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ContentStatus } from "@/types/catalog";

/** Remove caracteres com significado na sintaxe de filtros do PostgREST */
export function sanitizeFilterTerm(value: string): string {
  return value.replace(/[%,()*\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export const ADMIN_PAGE_SIZE = 25;

export type AdminProductFilters = {
  q?: string;
  status?: ContentStatus;
  category?: string;
  brand?: string;
  flag?: "featured" | "on_sale" | "new";
  sort?: "updated" | "name" | "created";
  page?: number;
};

export async function listAdminProducts(filters: AdminProductFilters) {
  const supabase = await createServerSupabase();
  const page = Math.max(filters.page ?? 1, 1);
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, sku, status, is_featured, is_on_sale, is_new, sale_ends_at, updated_at, price_display, price, category:categories(name), brand:brands(name), images:product_images(url, is_cover, sort_order)",
      { count: "exact" },
    )
    .is("deleted_at", null);

  const term = filters.q ? sanitizeFilterTerm(filters.q) : "";
  if (term) query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,slug.ilike.%${term}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.brand) query = query.eq("brand_id", filters.brand);
  if (filters.flag === "featured") query = query.eq("is_featured", true);
  if (filters.flag === "on_sale") query = query.eq("is_on_sale", true);
  if (filters.flag === "new") query = query.eq("is_new", true);

  const sort = filters.sort ?? "updated";
  query =
    sort === "name"
      ? query.order("name")
      : sort === "created"
        ? query.order("created_at", { ascending: false })
        : query.order("updated_at", { ascending: false });

  const { data, count, error } = await query.range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return { rows, total: count ?? 0, page, totalPages: Math.max(Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE), 1) };
}

/** Opções para selects do painel (inclui inativos) */
export async function getAdminLookups() {
  const supabase = await createServerSupabase();
  const [categories, brands, attributes, environments] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id, is_active").is("deleted_at", null).order("sort_order").order("name"),
    supabase.from("brands").select("id, name, slug, is_active").is("deleted_at", null).order("name"),
    supabase.from("attributes").select("id, name, slug, unit, group_name, is_filterable").order("sort_order").order("name"),
    supabase.from("environments").select("id, name, slug").is("deleted_at", null).order("sort_order"),
  ]);
  return {
    categories: categories.data ?? [],
    brands: brands.data ?? [],
    attributes: attributes.data ?? [],
    environments: environments.data ?? [],
  };
}

export type AdminLookups = Awaited<ReturnType<typeof getAdminLookups>>;

/** Categorias com indentação para selects: "Pisos › Porcelanatos" */
export function categoryOptions(categories: AdminLookups["categories"]) {
  const byParent = new Map<string | null, AdminLookups["categories"]>();
  for (const c of categories) byParent.set(c.parent_id, [...(byParent.get(c.parent_id) ?? []), c]);
  const result: { id: string; label: string; depth: number }[] = [];
  const walk = (parent: string | null, depth: number, prefix: string) => {
    for (const c of byParent.get(parent) ?? []) {
      const label = prefix ? `${prefix} › ${c.name}` : c.name;
      result.push({ id: c.id, label: c.is_active ? label : `${label} (inativa)`, depth });
      walk(c.id, depth + 1, label);
    }
  };
  walk(null, 0, "");
  return result;
}
