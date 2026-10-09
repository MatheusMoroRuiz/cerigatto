import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import type { AppRole } from "@/types/catalog";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

const RANK: Record<AppRole, number> = { editor: 1, admin: 2, super_admin: 3 };

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super administrador",
  admin: "Administrador",
  editor: "Editor",
};

export type AdminSession = {
  userId: string;
  email: string | null;
  name: string | null;
  role: AppRole;
};

export function roleAtLeast(role: AppRole, required: AppRole): boolean {
  return RANK[role] >= RANK[required];
}

/**
 * Sessão administrativa validada no servidor (getClaims verifica o JWT).
 * Memoizada por requisição.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  // Sessão depende da requisição: impede pré-renderização (a lib de auth lê o relógio)
  await connection();
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;
  const [{ data: role }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
  ]);
  if (!role) return null;
  return {
    userId,
    email: profile?.email ?? (typeof data.claims.email === "string" ? data.claims.email : null),
    name: profile?.full_name ?? null,
    role: role.role,
  };
});

/** Exige usuário da equipe com papel mínimo. Use em TODA página e Server Action do painel. */
export async function requireAdmin(minRole: AppRole = "editor"): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roleAtLeast(session.role, minRole)) redirect("/admin/sem-permissao");
  return session;
}

/** Variante para Server Actions: retorna erro em vez de redirecionar */
export async function authorizeAction(
  minRole: AppRole = "editor",
): Promise<{ ok: true; session: AdminSession } | { ok: false; error: string }> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Sua sessão expirou. Entre novamente." };
  if (!roleAtLeast(session.role, minRole)) return { ok: false, error: "Você não tem permissão para esta ação." };
  return { ok: true, session };
}
