import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { toCsv } from "@/lib/csv";
import { createServerSupabase } from "@/lib/supabase/server";
import { EXPORT_COLUMNS } from "@/lib/validation/import";

const DISPLAY = { show: "exibir", consult: "consulte", on_request: "sob-consulta", hidden: "ocultar" } as const;
const STATUS = { draft: "rascunho", published: "publicado", archived: "arquivado" } as const;

/** Exporta produtos (todos ou ?ids=) para CSV — útil para backup e edição em massa */
export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) return new Response("Não autorizado", { status: 401 });
  const idsParam = request.nextUrl.searchParams.get("ids");
  const ids = idsParam ? z.array(z.uuid()).max(1000).safeParse(idsParam.split(",")) : null;
  if (ids && !ids.success) return new Response("Parâmetro inválido", { status: 400 });

  const supabase = await createServerSupabase();
  const rows: unknown[][] = [];
  const pageSize = 1000;
  for (let from = 0; from < 50000; from += pageSize) {
    let query = supabase
      .from("products")
      .select("sku, name, slug, short_description, description, price, sale_price, price_display, unit, availability, status, is_featured, is_on_sale, category:categories(name), brand:brands(name)")
      .is("deleted_at", null)
      .order("name")
      .range(from, from + pageSize - 1);
    if (ids?.success) query = query.in("id", ids.data);
    const { data, error } = await query;
    if (error) return new Response("Falha ao exportar", { status: 500 });
    for (const p of data) {
      rows.push([
        p.sku,
        p.name,
        p.slug,
        p.category?.name ?? "",
        p.brand?.name ?? "",
        p.short_description,
        p.description,
        p.price != null ? p.price.toFixed(2).replace(".", ",") : "",
        p.sale_price != null ? p.sale_price.toFixed(2).replace(".", ",") : "",
        DISPLAY[p.price_display],
        p.unit,
        p.availability,
        STATUS[p.status],
        p.is_featured ? "sim" : "não",
        p.is_on_sale ? "sim" : "não",
      ]);
    }
    if (data.length < pageSize || ids?.success) break;
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv([...EXPORT_COLUMNS], rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="produtos-cerigatto-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
