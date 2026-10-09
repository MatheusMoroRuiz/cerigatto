import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { publicEnv } from "@/lib/env";

/**
 * Cliente anônimo SEM cookies, para leituras públicas dentro de 'use cache'.
 * Tudo que ele lê já é filtrado por RLS (somente conteúdo publicado/ativo).
 */
export function createPublicSupabase() {
  return createClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { "x-client-info": "cerigatto-site" } },
  });
}

export type PublicSupabase = ReturnType<typeof createPublicSupabase>;
