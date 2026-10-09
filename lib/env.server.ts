import "server-only";
import { isSupabaseConfigured } from "./env";

export const serverEnv = {
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
  rateLimitSalt: process.env.RATE_LIMIT_SALT || "cerigatto-dev-salt",
  demoModeRequested: process.env.CERIGATTO_DEMO_MODE === "true",
} as const;

export type DataMode = "supabase" | "demo" | "unconfigured";

/**
 * Fonte de dados do site:
 * - "supabase": produção/desenvolvimento normal
 * - "demo": dados fictícios em memória (somente leitura), apenas se solicitado
 *   explicitamente e sem Supabase configurado
 * - "unconfigured": sem banco — páginas exibem estados vazios
 */
export function getDataMode(): DataMode {
  if (isSupabaseConfigured()) return "supabase";
  if (serverEnv.demoModeRequested) return "demo";
  return "unconfigured";
}
