"use server";

import { z } from "zod";
import { getDataMode } from "@/lib/env.server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createPublicSupabase } from "@/lib/supabase/public";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        variant: z.string().max(200).nullable(),
        quantity: z.number().positive().max(100000),
      }),
    )
    .min(1)
    .max(100),
  note: z.string().max(1000).optional(),
  sessionId: z.string().regex(/^[a-zA-Z0-9-]{8,64}$/).optional(),
  sourcePage: z.string().max(300).optional(),
  utm: z.record(z.string().max(30), z.string().max(160)).optional(),
});

/**
 * Registra (anonimamente) que uma lista foi enviada ao WhatsApp, para o
 * relatório de "Solicitações" no painel. Não guarda nome, telefone ou e-mail.
 */
export async function recordQuoteRequest(input: unknown): Promise<{ ok: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false };
  if (!(await rateLimit("quote-submit", { max: 10, windowSeconds: 600 }))) return { ok: false };
  if (getDataMode() !== "supabase") return { ok: true };

  const { error } = await createPublicSupabase().rpc("submit_quote_request", {
    p_items: parsed.data.items.map((i) => ({ product_id: i.productId, variant_label: i.variant, quantity: i.quantity })),
    p_note: parsed.data.note ?? undefined,
    p_session_id: parsed.data.sessionId ?? undefined,
    p_source_page: parsed.data.sourcePage ?? undefined,
    p_utm: parsed.data.utm ?? {},
  });
  return { ok: !error };
}
