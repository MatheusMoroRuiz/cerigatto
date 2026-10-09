/**
 * Banco PostgreSQL em memória (PGlite) com as migrations do projeto aplicadas.
 * Usado para validar migrations, gerar tipos e rodar testes de integração
 * sem Docker. Emula apenas o mínimo do Supabase (roles, auth, storage).
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { unaccent } from "@electric-sql/pglite/contrib/unaccent";

const ROOT = path.resolve(__dirname, "..", "..");
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");

export function listMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
}

export async function createMigratedDatabase(options: { seed?: boolean } = {}) {
  const db = new PGlite({ extensions: { pg_trgm, unaccent } });
  await db.exec(readFileSync(path.join(__dirname, "supabase-stubs.sql"), "utf8"));

  for (const file of listMigrations()) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    try {
      await db.exec(sql);
    } catch (error) {
      throw new Error(`Falha na migration ${file}: ${(error as Error).message}`);
    }
  }

  if (options.seed) {
    const seedPath = path.join(ROOT, "supabase", "seed.sql");
    await db.exec(readFileSync(seedPath, "utf8"));
  }

  return db;
}

/** Executa um bloco como um papel do Supabase (anon/authenticated) com um usuário opcional. */
export async function asRole<T>(
  db: PGlite,
  role: "anon" | "authenticated",
  userId: string | null,
  fn: () => Promise<T>,
): Promise<T> {
  await db.exec(`set request.jwt.claim.sub = '${userId ?? ""}'`);
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.exec("set request.jwt.claim.sub = ''");
  }
}
