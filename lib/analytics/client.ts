"use client";

/**
 * Analytics comercial no navegador.
 * - Identificador de sessão ANÔNIMO (sessionStorage), sem dados pessoais.
 * - Preserva UTMs e referência de origem durante a sessão.
 * - Envia para /api/events (sendBeacon) e, se habilitados e consentidos,
 *   repassa para GA4 / Meta Pixel.
 */
import { hasAnalyticsConsent } from "./consent";
import { META_PIXEL_EVENT, type AnalyticsEventName, type AnalyticsPayload } from "./events";

const SESSION_KEY = "cerigatto:sid";
const UTM_KEY = "cerigatto:utm";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

type Attribution = Partial<Record<(typeof UTM_FIELDS)[number], string>> & { referrer?: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function safeSession(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getSessionId(): string {
  const storage = safeSession();
  const existing = storage?.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storage?.setItem(SESSION_KEY, id);
  return id;
}

/** Guarda UTMs da URL atual (a campanha mais recente vence) e a origem externa */
export function captureAttribution(): Attribution {
  const storage = safeSession();
  let stored: Attribution = {};
  try {
    stored = JSON.parse(storage?.getItem(UTM_KEY) ?? "{}") as Attribution;
  } catch {
    stored = {};
  }
  const params = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {};
  for (const field of UTM_FIELDS) {
    const value = params.get(field);
    if (value) fromUrl[field] = value.slice(0, 160);
  }
  const hasNewCampaign = Object.keys(fromUrl).length > 0;
  const next: Attribution = hasNewCampaign ? { ...fromUrl } : { ...stored };
  if (!next.referrer && !stored.referrer && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      // Apenas a origem (sem caminho/consulta) para não registrar dados pessoais
      if (ref.host !== window.location.host) next.referrer = ref.origin;
    } catch {
      // referrer inválido
    }
  } else if (stored.referrer && !next.referrer) {
    next.referrer = stored.referrer;
  }
  storage?.setItem(UTM_KEY, JSON.stringify(next));
  return next;
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(safeSession()?.getItem(UTM_KEY) ?? "{}") as Attribution;
  } catch {
    return {};
  }
}

export type TrackOptions = Omit<AnalyticsPayload, "event" | "sessionId" | "path"> & { path?: string };

export function trackEvent(event: AnalyticsEventName, options: TrackOptions = {}) {
  if (typeof window === "undefined") return;
  const attribution = getAttribution();
  const payload: AnalyticsPayload = {
    event,
    sessionId: getSessionId(),
    path: options.path ?? window.location.pathname,
    utmSource: attribution.utm_source ?? null,
    utmMedium: attribution.utm_medium ?? null,
    utmCampaign: attribution.utm_campaign ?? null,
    utmTerm: attribution.utm_term ?? null,
    utmContent: attribution.utm_content ?? null,
    referrer: attribution.referrer ?? null,
    ...options,
  };

  const body = JSON.stringify(payload);
  try {
    const sent = navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch("/api/events", {
        method: "POST",
        body,
        keepalive: true,
        headers: { "content-type": "application/json" },
      }).catch(() => undefined);
    }
  } catch {
    // Analytics nunca deve quebrar a navegação
  }

  if (!hasAnalyticsConsent()) return;
  window.gtag?.("event", event, {
    product_id: options.productId ?? undefined,
    search_term: options.query ?? undefined,
  });
  const pixelEvent = META_PIXEL_EVENT[event];
  if (pixelEvent) window.fbq?.("track", pixelEvent, options.query ? { search_string: options.query } : undefined);
}
