import "server-only";
import { getDataMode } from "@/lib/env.server";
import { DemoSource } from "./demo-source";
import { EmptySource } from "./empty-source";
import { SupabaseSource } from "./supabase-source";
import type { DataSource } from "./types";

let instance: DataSource | null = null;

export function getSource(): DataSource {
  if (instance) return instance;
  const mode = getDataMode();
  instance = mode === "supabase" ? new SupabaseSource() : mode === "demo" ? new DemoSource() : new EmptySource();
  return instance;
}
