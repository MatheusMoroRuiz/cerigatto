import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Cliente com service role — IGNORA RLS. Uso restrito a operações que exigem
 * a API administrativa do Auth (convidar/remover administradores).
 * Nunca importe em Client Components.
 */
export function createServiceSupabase() {
  if (!serverEnv.serviceRoleKey) return null;
  return createClient<Database>(publicEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
