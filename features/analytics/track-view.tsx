"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName } from "@/lib/analytics/events";

/** Registra a visualização de produto/categoria/marca ou uma busca (uma vez por montagem) */
export function TrackView({
  event,
  productId,
  categoryId,
  brandId,
  query,
  resultsCount,
}: {
  event: Extract<AnalyticsEventName, "product_view" | "category_view" | "brand_view" | "search">;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  query?: string;
  resultsCount?: number;
}) {
  useEffect(() => {
    trackEvent(event, { productId, categoryId, brandId, query, resultsCount });
  }, [event, productId, categoryId, brandId, query, resultsCount]);
  return null;
}
