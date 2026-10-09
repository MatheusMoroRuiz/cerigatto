import { z } from "zod";

/** Eventos comerciais registrados (espelha o CHECK da tabela analytics_events) */
export const ANALYTICS_EVENTS = [
  "page_view",
  "product_view",
  "category_view",
  "brand_view",
  "search",
  "whatsapp_click",
  "quote_list_add",
  "quote_list_remove",
  "quote_list_submit",
  "contact_submit",
  "banner_click",
  "favorite_add",
  "share",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

const uuid = z.uuid().nullish();
const shortText = (max: number) => z.string().trim().max(max).nullish();

/** Validação no servidor de tudo que chega em /api/events */
export const analyticsPayloadSchema = z.object({
  event: z.enum(ANALYTICS_EVENTS),
  productId: uuid,
  categoryId: uuid,
  brandId: uuid,
  bannerId: uuid,
  path: shortText(500),
  sessionId: z
    .string()
    .regex(/^[a-zA-Z0-9-]{8,64}$/)
    .nullish(),
  utmSource: shortText(120),
  utmMedium: shortText(120),
  utmCampaign: shortText(160),
  utmTerm: shortText(160),
  utmContent: shortText(160),
  referrer: shortText(500),
  query: shortText(120),
  resultsCount: z.number().int().min(0).max(1_000_000).nullish(),
  metadata: z
    .record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean(), z.null()]))
    .refine((value) => Object.keys(value).length <= 12, "metadata muito grande")
    .nullish(),
});

export type AnalyticsPayload = z.infer<typeof analyticsPayloadSchema>;

/** Mapeamento para Meta Pixel — nunca "Purchase", pois não há compra no site */
export const META_PIXEL_EVENT: Partial<Record<AnalyticsEventName, string>> = {
  product_view: "ViewContent",
  whatsapp_click: "Contact",
  contact_submit: "Contact",
  quote_list_submit: "Contact",
  search: "Search",
};
