import { FolderTree, Package, Search, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/feedback";
import { sanitizeFilterTerm } from "@/features/admin/queries";
import { AdminCard, AdminPageHeader, StatusBadge } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Busca" };

export default async function AdminSearchPage({ searchParams }: PageProps<"/admin/busca">) {
  await requireAdmin("editor");
  const raw = (await searchParams).q;
  const term = sanitizeFilterTerm(typeof raw === "string" ? raw : "");
  if (term.length < 2) {
    return (
      <>
        <AdminPageHeader title="Busca" crumbs={[{ label: "Busca" }]} />
        <EmptyState icon={Search} title="Digite ao menos 2 caracteres" description="Busque por nome ou SKU de produto, categoria ou marca." />
      </>
    );
  }
  const supabase = await createServerSupabase();
  const [products, categories, brands] = await Promise.all([
    supabase.from("products").select("id, name, sku, status").is("deleted_at", null).or(`name.ilike.%${term}%,sku.ilike.%${term}%`).order("name").limit(30),
    supabase.from("categories").select("id, name").is("deleted_at", null).ilike("name", `%${term}%`).limit(10),
    supabase.from("brands").select("id, name").is("deleted_at", null).ilike("name", `%${term}%`).limit(10),
  ]);
  const total = (products.data?.length ?? 0) + (categories.data?.length ?? 0) + (brands.data?.length ?? 0);

  return (
    <>
      <AdminPageHeader title={`Resultados para “${term}”`} description={`${total} resultado(s)`} crumbs={[{ label: "Busca" }]} />
      {total === 0 ? (
        <EmptyState icon={Search} title="Nada encontrado" description="Confira a grafia ou busque pelo SKU." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <AdminCard title="Produtos">
            {products.data?.length ? (
              <ul className="divide-y">
                {products.data.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3 py-2.5 hover:text-primary">
                      <Package className="size-4 text-muted-foreground" aria-hidden="true" />
                      <span className="flex-1 font-medium">{p.name}</span>
                      {p.sku ? <span className="font-mono text-xs text-muted-foreground">{p.sku}</span> : null}
                      <StatusBadge status={p.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum produto.</p>
            )}
          </AdminCard>
          <div className="grid content-start gap-6">
            <AdminCard title="Categorias">
              {categories.data?.length ? (
                <ul className="space-y-2">
                  {categories.data.map((c) => (
                    <li key={c.id}>
                      <Link href={`/admin/categorias/${c.id}`} className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                        <FolderTree className="size-4 text-muted-foreground" aria-hidden="true" /> {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma categoria.</p>
              )}
            </AdminCard>
            <AdminCard title="Marcas">
              {brands.data?.length ? (
                <ul className="space-y-2">
                  {brands.data.map((b) => (
                    <li key={b.id}>
                      <Link href={`/admin/marcas/${b.id}`} className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                        <Tag className="size-4 text-muted-foreground" aria-hidden="true" /> {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma marca.</p>
              )}
            </AdminCard>
          </div>
        </div>
      )}
    </>
  );
}
