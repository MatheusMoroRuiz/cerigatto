"use client";

import { useCallback, useSyncExternalStore } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { buildWhatsAppUrl, isWithinBusinessHours, resolveWhatsAppNumber } from "@/lib/whatsapp";
import { useSiteConfig } from "./config-context";

const noopSubscribe = () => () => {};

/** Abre o WhatsApp com uma mensagem e registra o clique (sem dados pessoais) */
export function useWhatsApp() {
  const config = useSiteConfig();

  const resolveNumber = useCallback(
    (overrides?: { productNumber?: string | null; categoryNumber?: string | null }) =>
      resolveWhatsAppNumber({
        countryCode: config.whatsapp.countryCode,
        productNumber: overrides?.productNumber,
        categoryNumber: overrides?.categoryNumber,
        globalNumber: config.whatsapp.phoneNumber,
      }),
    [config.whatsapp.countryCode, config.whatsapp.phoneNumber],
  );

  const open = useCallback(
    (
      message: string,
      options: {
        productId?: string | null;
        categoryId?: string | null;
        productNumber?: string | null;
        categoryNumber?: string | null;
        origin?: string;
      } = {},
    ) => {
      const url = buildWhatsAppUrl(resolveNumber(options), message);
      trackEvent("whatsapp_click", {
        productId: options.productId ?? null,
        categoryId: options.categoryId ?? null,
        metadata: options.origin ? { origin: options.origin } : null,
      });
      window.open(url, "_blank", "noopener,noreferrer");
      return url;
    },
    [resolveNumber],
  );

  // Calculado só no navegador (horário local do visitante convertido para São Paulo)
  const closedNow = useSyncExternalStore(
    noopSubscribe,
    () => isWithinBusinessHours(config.hours) === false,
    () => false,
  );
  const outOfHours = config.whatsapp.showOutOfHoursNotice && closedNow ? config.whatsapp.outOfHoursMessage : null;

  const buildUrl = useCallback(
    (message: string, overrides?: { productNumber?: string | null; categoryNumber?: string | null }) =>
      buildWhatsAppUrl(resolveNumber(overrides), message),
    [resolveNumber],
  );

  const trackClick = useCallback(
    (options: { productId?: string | null; categoryId?: string | null; origin?: string } = {}) =>
      trackEvent("whatsapp_click", {
        productId: options.productId ?? null,
        categoryId: options.categoryId ?? null,
        metadata: options.origin ? { origin: options.origin } : null,
      }),
    [],
  );

  return { open, buildUrl, trackClick, resolveNumber, config, outOfHours };
}
