import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getDataMode, serverEnv } from "@/lib/env.server";
import { createPublicSupabase } from "@/lib/supabase/public";

/** IP do cliente a partir dos cabeçalhos do proxy/CDN */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "0.0.0.0";
}

/** Hash irreversível: nunca armazenamos IPs em texto puro */
export function hashKey(...parts: string[]): string {
  return createHash("sha256").update([serverEnv.rateLimitSalt, ...parts].join("|")).digest("hex").slice(0, 48);
}

// Fallback em memória (desenvolvimento/demonstração, instância única)
const memory = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, max: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    if (memory.size > 5000) {
      for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

/**
 * Retorna true se a ação é permitida.
 * Em produção usa a função SQL check_rate_limit (compartilhada entre instâncias).
 */
export async function rateLimit(scope: string, options: { max: number; windowSeconds: number }): Promise<boolean> {
  const ip = await getClientIp();
  const key = hashKey(scope, ip);
  if (getDataMode() !== "supabase") return memoryLimit(key, options.max, options.windowSeconds);
  try {
    const { data, error } = await createPublicSupabase().rpc("check_rate_limit", {
      p_key: key,
      p_max: options.max,
      p_window_seconds: options.windowSeconds,
    });
    if (error) return memoryLimit(key, options.max, options.windowSeconds);
    return data === true;
  } catch {
    return memoryLimit(key, options.max, options.windowSeconds);
  }
}
