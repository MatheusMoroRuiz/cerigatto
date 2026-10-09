import { NextResponse, type NextRequest } from "next/server";
import { getDataMode } from "@/lib/env.server";
import { analyticsPayloadSchema } from "@/lib/analytics/events";
import { rateLimit } from "@/lib/security/rate-limit";
import { createPublicSupabase } from "@/lib/supabase/public";
import { normalizeText } from "@/lib/text";

/**
 * Coleta de eventos comerciais anônimos (product_view, whatsapp_click...).
 * Sem dados pessoais: apenas IDs de conteúdo, caminho, sessão anônima e UTMs.
 */
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8192) return new NextResponse(null, { status: 413 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = analyticsPayloadSchema.safeParse(json);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  if (!(await rateLimit("events", { max: 120, windowSeconds: 60 }))) {
    return new NextResponse(null, { status: 429 });
  }
  if (getDataMode() !== "supabase") return new NextResponse(null, { status: 204 });

  const e = parsed.data;
  const db = createPublicSupabase();

  if (e.event === "search" && e.query) {
    await db.from("search_events").insert({
      query: e.query,
      normalized_query: normalizeText(e.query),
      results_count: e.resultsCount ?? 0,
      session_id: e.sessionId ?? null,
    });
  }

  await db.from("analytics_events").insert({
    event_name: e.event,
    product_id: e.productId ?? null,
    category_id: e.categoryId ?? null,
    brand_id: e.brandId ?? null,
    banner_id: e.bannerId ?? null,
    page_path: e.path ?? null,
    session_id: e.sessionId ?? null,
    utm_source: e.utmSource ?? null,
    utm_medium: e.utmMedium ?? null,
    utm_campaign: e.utmCampaign ?? null,
    utm_term: e.utmTerm ?? null,
    utm_content: e.utmContent ?? null,
    referrer: e.referrer ?? null,
    metadata: e.metadata ?? {},
  });

  return new NextResponse(null, { status: 204 });
}
