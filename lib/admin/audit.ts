import "server-only";
import type { Json } from "@/types/database.types";
import type { ServerSupabase } from "@/lib/supabase/server";

/** Registro mínimo de auditoria (falhas não interrompem a operação principal) */
export async function logAudit(
  supabase: ServerSupabase,
  entry: { userId: string; action: string; entityType: string; entityId?: string | null; metadata?: Record<string, unknown> },
) {
  await supabase.from("audit_logs").insert({
    user_id: entry.userId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: (entry.metadata ?? {}) as Json,
  });
}
