"use server";

import { authorizeAction } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { sanitizeFilterTerm } from "@/features/admin/queries";

/** Busca produtos para o seletor "Produtos que combinam" e vitrines */
export async function searchProductsForPicker(query: string): Promise<{ id: string; name: string; sku: string | null }[]> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return [];
  const term = sanitizeFilterTerm(query);
  if (term.length < 2) return [];
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("id, name, sku")
    .is("deleted_at", null)
    .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
    .order("name")
    .limit(12);
  return data ?? [];
}
