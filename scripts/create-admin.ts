/**
 * Cria (ou promove) um usuário do painel.
 *
 * Uso:
 *   pnpm admin:create email@empresa.com.br "Nome da Pessoa" [super_admin|admin|editor]
 *
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.
 * Gera uma senha temporária forte e a exibe UMA vez no terminal; a pessoa
 * deve trocá-la em "Esqueci minha senha" no primeiro acesso.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]!]) process.env[match[1]!] = match[2]!.replace(/^["']|["']$/g, "");
  }
}

function tempPassword() {
  // Garante minúscula, maiúscula e número (regra do Supabase Auth configurada)
  return `${randomBytes(12).toString("base64url")}aA9`;
}

async function main() {
  loadEnv();
  const [email, fullName = "", role = "super_admin"] = process.argv.slice(2);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('Uso: pnpm admin:create email@empresa.com.br "Nome" [super_admin|admin|editor]');
    process.exit(1);
  }
  if (!["super_admin", "admin", "editor"].includes(role)) {
    console.error("Papel inválido. Use super_admin, admin ou editor.");
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const password = tempPassword();
  let userId: string | undefined;
  let created = false;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || null },
  });
  if (data?.user) {
    userId = data.user.id;
    created = true;
  } else {
    const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
    if (!userId) {
      console.error(`Não foi possível criar o usuário: ${error?.message ?? "erro desconhecido"}`);
      process.exit(1);
    }
  }

  await supabase.from("profiles").upsert({ id: userId, email, full_name: fullName || null });
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: role as "super_admin" | "admin" | "editor" }, { onConflict: "user_id" });
  if (roleError) {
    console.error(`Usuário criado, mas falhou ao definir o papel: ${roleError.message}`);
    process.exit(1);
  }

  console.info(`✔ ${email} agora é ${role}.`);
  if (created) {
    console.info(`  Senha temporária: ${password}`);
    console.info("  Entre em /admin/login e troque a senha em “Esqueci minha senha”.");
  } else {
    console.info("  O usuário já existia; a senha atual foi mantida.");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
