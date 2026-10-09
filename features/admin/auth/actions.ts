"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { absoluteUrl, isSupabaseConfigured } from "@/lib/env";
import { hashKey, rateLimit } from "@/lib/security/rate-limit";
import { createServerSupabase } from "@/lib/supabase/server";

export type AuthFormState = { error?: string; message?: string };

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido.").max(160),
  password: z.string().min(1, "Informe a senha.").max(200),
  next: z.string().max(200).optional(),
});

function safeNext(next: string | undefined): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { error: "O Supabase ainda não foi configurado neste ambiente." };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  // Limite por IP e por conta (bloqueia força bruta distribuída em um e-mail)
  const [ipOk, accountOk] = await Promise.all([
    rateLimit("login-ip", { max: 10, windowSeconds: 900 }),
    rateLimit(`login-account:${hashKey(parsed.data.email.toLowerCase())}`, { max: 8, windowSeconds: 900 }),
  ]);
  if (!ipOk || !accountOk) return { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) return { error: "E-mail ou senha incorretos." };

  const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
  if (!role) {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem acesso ao painel. Peça acesso a um administrador." };
  }
  redirect(safeNext(parsed.data.next));
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { error: "O Supabase ainda não foi configurado neste ambiente." };
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Informe um e-mail válido." };
  if (!(await rateLimit("password-reset", { max: 5, windowSeconds: 3600 }))) {
    return { error: "Muitas solicitações. Tente novamente mais tarde." };
  }
  const supabase = await createServerSupabase();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: absoluteUrl("/admin/auth/callback?next=/admin/nova-senha"),
  });
  // Resposta idêntica exista ou não a conta (evita enumeração de e-mails)
  return { message: "Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha." };
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(10, "A senha precisa ter ao menos 10 caracteres.")
      .regex(/[a-z]/, "Inclua letras minúsculas.")
      .regex(/[A-Z]/, "Inclua letras maiúsculas.")
      .regex(/\d/, "Inclua números."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "As senhas não conferem.", path: ["confirm"] });

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Senha inválida." };
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "Não foi possível atualizar a senha. Solicite um novo link." };
  redirect("/admin");
}
