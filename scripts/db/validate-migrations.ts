/**
 * Aplica todas as migrations (e o seed, se existir) em um PostgreSQL em memória.
 * Uso: pnpm db:validate
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { createMigratedDatabase, listMigrations } from "./pglite";

async function main() {
  const hasSeed = existsSync(path.resolve(__dirname, "..", "..", "supabase", "seed.sql"));
  const db = await createMigratedDatabase({ seed: hasSeed });
  const tables = await db.query<{ count: number }>(
    "select count(*)::int as count from pg_tables where schemaname = 'public'",
  );
  const withoutRls = await db.query<{ tablename: string }>(
    "select tablename from pg_tables where schemaname = 'public' and not rowsecurity",
  );

  console.info(`✔ ${listMigrations().length} migrations aplicadas${hasSeed ? " + seed" : ""}`);
  console.info(`✔ ${tables.rows[0]?.count ?? 0} tabelas no schema public`);

  if (withoutRls.rows.length > 0) {
    console.error("✖ Tabelas sem RLS:", withoutRls.rows.map((r) => r.tablename).join(", "));
    process.exit(1);
  }
  console.info("✔ RLS habilitado em todas as tabelas");
  await db.close();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
