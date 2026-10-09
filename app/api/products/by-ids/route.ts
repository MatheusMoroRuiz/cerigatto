import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/security/rate-limit";
import { getProductsByIds } from "@/services/catalog";

const idsSchema = z.array(z.uuid()).max(100);

/** Cards de produtos públicos por ID (usado pela página de Favoritos) */
export async function GET(request: NextRequest) {
  const raw = (request.nextUrl.searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const parsed = idsSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Parâmetro inválido" }, { status: 400 });
  if (!(await rateLimit("by-ids", { max: 60, windowSeconds: 60 }))) {
    return NextResponse.json({ error: "Muitas requisições" }, { status: 429 });
  }
  const products = await getProductsByIds([...new Set(parsed.data)].sort());
  return NextResponse.json({ products });
}
