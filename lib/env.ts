/**
 * Variáveis de ambiente PÚBLICAS (podem ir para o navegador).
 * Segredos ficam em lib/env.server.ts.
 */
function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const publicEnv = {
  siteUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || null,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || null,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || null,
} as const;

export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabasePublishableKey);
}

/** URL absoluta a partir de um caminho do site */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${publicEnv.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
