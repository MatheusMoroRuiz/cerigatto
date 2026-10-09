/**
 * Gera types/database.types.ts a partir das migrations, sem Docker:
 * aplica as migrations em PGlite e introspecta o catálogo do PostgreSQL,
 * produzindo o mesmo formato de `supabase gen types typescript`.
 *
 * Uso: pnpm db:types:local
 * Com um projeto Supabase linkado, prefira: pnpm db:types (CLI oficial).
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { createMigratedDatabase } from "./pglite";

type Column = {
  table_name: string;
  column_name: string;
  udt_name: string;
  data_type: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
  is_identity: "YES" | "NO";
  is_generated: "ALWAYS" | "NEVER";
};

const OUTPUT = path.resolve(__dirname, "..", "..", "types", "database.types.ts");

function scalarType(udt: string, enums: Set<string>): string {
  const base = udt.startsWith("_") ? udt.slice(1) : udt;
  let ts: string;
  if (enums.has(base)) ts = `Database["public"]["Enums"]["${base}"]`;
  else if (["int2", "int4", "int8", "float4", "float8", "numeric"].includes(base)) ts = "number";
  else if (base === "bool") ts = "boolean";
  else if (base === "json" || base === "jsonb") ts = "Json";
  else if (["text", "varchar", "uuid", "timestamptz", "timestamp", "date", "time", "bpchar", "citext"].includes(base))
    ts = "string";
  else ts = "unknown";
  return udt.startsWith("_") ? `${ts}[]` : ts;
}

function key(name: string) {
  return /^[a-z_][a-z0-9_]*$/i.test(name) ? name : JSON.stringify(name);
}

async function main() {
  const db = await createMigratedDatabase();

  const enums = await db.query<{ name: string; values: string[] }>(`
    select t.typname as name, array_agg(e.enumlabel order by e.enumsortorder) as values
    from pg_type t join pg_enum e on e.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' group by t.typname order by t.typname`);
  const enumNames = new Set(enums.rows.map((e) => e.name));

  const columns = await db.query<Column>(`
    select c.table_name, c.column_name, c.udt_name, c.data_type, c.is_nullable,
           c.column_default, c.is_identity, c.is_generated
    from information_schema.columns c
    join information_schema.tables t on t.table_name = c.table_name and t.table_schema = c.table_schema
    where c.table_schema = 'public' and t.table_type = 'BASE TABLE'
    order by c.table_name, c.column_name`);

  const relationships = await db.query<{
    constraint_name: string;
    table_name: string;
    columns: string[];
    ref_table: string;
    ref_columns: string[];
    is_one_to_one: boolean;
  }>(`
    select con.conname as constraint_name,
           rel.relname as table_name,
           array(select att.attname from unnest(con.conkey) k join pg_attribute att
                 on att.attrelid = con.conrelid and att.attnum = k order by att.attname) as columns,
           frel.relname as ref_table,
           array(select att.attname from unnest(con.confkey) k join pg_attribute att
                 on att.attrelid = con.confrelid and att.attnum = k order by att.attname) as ref_columns,
           exists (
             select 1 from pg_index i
             where i.indrelid = con.conrelid and i.indisunique and i.indpred is null
               and (select array_agg(x order by x) from unnest(i.indkey::int2[]) x)
                 = (select array_agg(x order by x) from unnest(con.conkey) x)
           ) as is_one_to_one
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_class frel on frel.oid = con.confrelid
    join pg_namespace n on n.oid = rel.relnamespace
    join pg_namespace fn on fn.oid = frel.relnamespace
    where con.contype = 'f' and n.nspname = 'public' and fn.nspname = 'public'
    order by rel.relname, con.conname`);

  const functions = await db.query<{
    name: string;
    arg_names: string[] | null;
    arg_types: string[];
    arg_modes: string[] | null;
    num_defaults: number;
    returns_set: boolean;
    return_type: string;
    return_type_kind: string;
    return_relation: string | null;
  }>(`
    select p.proname as name, p.proargnames as arg_names,
           array(select t.typname from unnest(coalesce(p.proallargtypes, p.proargtypes::oid[])) with ordinality as a(oid, pos)
                 join pg_type t on t.oid = a.oid order by a.pos) as arg_types,
           p.proargmodes::text[] as arg_modes,
           p.pronargdefaults as num_defaults,
           p.proretset as returns_set,
           rt.typname as return_type,
           rt.typtype as return_type_kind,
           rc.relname as return_relation
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    join pg_type rt on rt.oid = p.prorettype
    left join pg_class rc on rc.oid = rt.typrelid and rt.typtype = 'c'
    where n.nspname = 'public' and rt.typname not in ('trigger', 'event_trigger')
    order by p.proname`);

  const tables = [...new Set(columns.rows.map((c) => c.table_name))];
  const tableNames = new Set(tables);
  const lines: string[] = [];
  lines.push("// Gerado por scripts/db/generate-types.ts — não edite manualmente.");
  lines.push("// Para regenerar: pnpm db:types:local (offline) ou pnpm db:types (Supabase CLI).");
  lines.push("");
  lines.push("export type Json =\n  | string\n  | number\n  | boolean\n  | null\n  | { [key: string]: Json | undefined }\n  | Json[]");
  lines.push("");
  lines.push("export type Database = {");
  lines.push("  __InternalSupabase: {\n    PostgrestVersion: \"13.0.5\"\n  }");
  lines.push("  public: {");
  lines.push("    Tables: {");
  for (const table of tables) {
    const cols = columns.rows.filter((c) => c.table_name === table);
    lines.push(`      ${key(table)}: {`);
    for (const kind of ["Row", "Insert", "Update"] as const) {
      lines.push(`        ${kind}: {`);
      for (const col of cols) {
        const type = scalarType(col.udt_name, enumNames);
        const nullable = col.is_nullable === "YES";
        const fullType = nullable ? `${type} | null` : type;
        if (kind === "Row") {
          lines.push(`          ${key(col.column_name)}: ${fullType}`);
        } else {
          const generatedAlways = col.is_generated === "ALWAYS" || col.is_identity === "YES";
          if (generatedAlways) {
            lines.push(`          ${key(col.column_name)}?: never`);
            continue;
          }
          const optional = kind === "Update" || nullable || col.column_default !== null;
          lines.push(`          ${key(col.column_name)}${optional ? "?" : ""}: ${fullType}`);
        }
      }
      lines.push("        }");
    }
    const rels = relationships.rows.filter((r) => r.table_name === table);
    lines.push("        Relationships: [");
    for (const rel of rels) {
      lines.push("          {");
      lines.push(`            foreignKeyName: "${rel.constraint_name}"`);
      lines.push(`            columns: [${rel.columns.map((c) => `"${c}"`).join(", ")}]`);
      lines.push(`            isOneToOne: ${rel.is_one_to_one}`);
      lines.push(`            referencedRelation: "${rel.ref_table}"`);
      lines.push(`            referencedColumns: [${rel.ref_columns.map((c) => `"${c}"`).join(", ")}]`);
      lines.push("          },");
    }
    lines.push("        ]");
    lines.push("      }");
  }
  lines.push("    }");
  lines.push("    Views: {\n      [_ in never]: never\n    }");
  lines.push("    Functions: {");
  for (const fn of functions.rows) {
    const names = fn.arg_names ?? [];
    const modes = fn.arg_modes ?? names.map(() => "i");
    const inputs: { name: string; type: string; optional: boolean }[] = [];
    const outputs: { name: string; type: string }[] = [];
    const inputCount = modes.filter((m) => m === "i").length;
    let inputIndex = 0;
    let skip = false;
    names.forEach((name, i) => {
      const udt = fn.arg_types[i] ?? "unknown";
      if (tableNames.has(udt)) skip = true; // colunas computadas (ex.: sale_active(products))
      const mode = modes[i];
      if (mode === "i") {
        inputs.push({
          name,
          type: scalarType(udt, enumNames),
          optional: inputIndex >= inputCount - fn.num_defaults,
        });
        inputIndex += 1;
      } else if (mode === "t" || mode === "o") {
        outputs.push({ name, type: scalarType(udt, enumNames) });
      }
    });
    if (skip) continue;

    const args =
      inputs.length === 0
        ? "never"
        : `{ ${inputs.map((a) => `${key(a.name)}${a.optional ? "?" : ""}: ${a.type}`).join("; ")} }`;
    let returns: string;
    let setof: string | null = null;
    if (fn.return_relation && tableNames.has(fn.return_relation)) {
      returns = `Database["public"]["Tables"]["${fn.return_relation}"]["Row"]${fn.returns_set ? "[]" : ""}`;
      setof = `{ from: "*"; to: "${fn.return_relation}"; isOneToOne: ${!fn.returns_set}; isSetofReturn: ${fn.returns_set} }`;
    } else if (outputs.length > 0) {
      returns = `{ ${outputs.map((o) => `${key(o.name)}: ${o.type}`).join("; ")} }${fn.returns_set ? "[]" : ""}`;
    } else if (fn.return_type === "void") {
      returns = "undefined";
    } else {
      returns = `${scalarType(fn.return_type, enumNames)}${fn.returns_set ? "[]" : ""}`;
    }
    lines.push(`      ${key(fn.name)}: {`);
    lines.push(`        Args: ${args}`);
    lines.push(`        Returns: ${returns}`);
    if (setof) lines.push(`        SetofOptions: ${setof}`);
    lines.push("      }");
  }
  lines.push("    }");
  lines.push("    Enums: {");
  for (const e of enums.rows) {
    lines.push(`      ${key(e.name)}: ${e.values.map((v) => `"${v}"`).join(" | ")}`);
  }
  lines.push("    }");
  lines.push("    CompositeTypes: {\n      [_ in never]: never\n    }");
  lines.push("  }");
  lines.push("}");
  lines.push("");
  lines.push('type PublicSchema = Database["public"]');
  lines.push("");
  lines.push('export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]');
  lines.push('export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]');
  lines.push('export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]');
  lines.push('export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]');
  lines.push("");
  lines.push("export const Constants = {");
  lines.push("  public: {");
  lines.push("    Enums: {");
  for (const e of enums.rows) {
    lines.push(`      ${key(e.name)}: [${e.values.map((v) => `"${v}"`).join(", ")}],`);
  }
  lines.push("    },");
  lines.push("  },");
  lines.push("} as const");
  lines.push("");

  writeFileSync(OUTPUT, lines.join("\n"));
  console.info(`✔ Tipos gerados em ${path.relative(process.cwd(), OUTPUT)} (${tables.length} tabelas, ${functions.rows.length} funções)`);
  await db.close();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
