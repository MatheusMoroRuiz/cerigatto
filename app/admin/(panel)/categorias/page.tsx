import { FolderTree, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { deleteCategory } from "@/features/admin/catalog/actions";
import { ActiveBadge, AdminPageHeader, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Categorias" };

export default async function AdminCategoriesPage() {
  await requireAdmin("editor");
  const supabase = await createServerSupabase();
  const [{ data: categories }, { data: counts }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, is_active, show_in_menu, is_featured, sort_order")
      .is("deleted_at", null)
      .order("sort_order")
      .order("name"),
    supabase.from("products").select("category_id").is("deleted_at", null),
  ]);
  const productCount = new Map<string, number>();
  for (const row of counts ?? []) if (row.category_id) productCount.set(row.category_id, (productCount.get(row.category_id) ?? 0) + 1);

  const list = categories ?? [];
  const ordered: { row: (typeof list)[number]; depth: number }[] = [];
  const walk = (parent: string | null, depth: number) => {
    for (const row of list.filter((c) => c.parent_id === parent)) {
      ordered.push({ row, depth });
      walk(row.id, depth + 1);
    }
  };
  walk(null, 0);

  return (
    <>
      <AdminPageHeader
        title="Categorias"
        description="Departamentos e subcategorias em árvore. A ordem define o mega menu."
        crumbs={[{ label: "Categorias" }]}
        actions={
          <Link href="/admin/categorias/novo" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Nova categoria
          </Link>
        }
      />
      {ordered.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Endereço</Th>
              <Th>Produtos</Th>
              <Th>Situação</Th>
              <Th>Ordem</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {ordered.map(({ row, depth }) => (
              <tr key={row.id} className="hover:bg-muted/40">
                <Td>
                  <Link href={`/admin/categorias/${row.id}`} className="font-semibold hover:text-primary" style={{ paddingLeft: depth * 20 }}>
                    {depth > 0 ? "↳ " : ""}
                    {row.name}
                  </Link>
                </Td>
                <Td className="font-mono text-xs">/categoria/{row.slug}</Td>
                <Td>{productCount.get(row.id) ?? 0}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    <ActiveBadge active={row.is_active} on="Ativa" off="Inativa" />
                    {!row.show_in_menu ? <ActiveBadge active={false} off="Fora do menu" /> : null}
                    {row.is_featured ? <ActiveBadge active on="Destaque" /> : null}
                  </div>
                </Td>
                <Td>{row.sort_order}</Td>
                <Td className="text-right">
                  <DeleteButton
                    compact
                    action={deleteCategory.bind(null, row.id)}
                    entityLabel={`a categoria "${row.name}"`}
                    description="A categoria deixa de aparecer no site. Só é possível excluir categorias sem subcategorias e sem produtos."
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          icon={FolderTree}
          title="Nenhuma categoria cadastrada"
          description="Crie os departamentos principais e depois as subcategorias."
          action={
            <Link href="/admin/categorias/novo" className={buttonVariants()}>
              Criar primeira categoria
            </Link>
          }
        />
      )}
    </>
  );
}
