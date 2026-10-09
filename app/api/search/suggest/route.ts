import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { getSearchSuggestions } from "@/services/catalog";

/** Autocomplete da busca: produtos, categorias e marcas */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (query.length < 2) {
    return NextResponse.json({ products: [], categories: [], brands: [] });
  }
  if (!(await rateLimit("suggest", { max: 90, windowSeconds: 60 }))) {
    return NextResponse.json({ error: "Muitas buscas em sequência. Aguarde alguns segundos." }, { status: 429 });
  }
  const suggestions = await getSearchSuggestions(query.toLowerCase());
  return NextResponse.json(suggestions, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
  });
}
