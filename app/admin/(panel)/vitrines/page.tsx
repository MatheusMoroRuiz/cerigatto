import { LayoutGrid, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { deleteCollection } from "@/features/admin/content/actions";
import { ActiveBadge, AdminPageHeader, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Vitrines" };

const SOURCE_LABEL: Record<string, string> = {
  manual: "Seleção manual",
  featured: "Destaques",
  on_sale: "Ofertas vigentes",
  new: "Novidades",
  recommended: "Recomendados",
  most_viewed: "Mais acessados",
  category: "Categoria",
};

export default async function AdminCollectionsPage() {
  await requireAdmin("editor");
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("collections").select("*, items:collection_products(product_id)").order("sort_order");
  const rows = data ?? [];
  return (
    <>
      <AdminPageHeader
        title="Coleções / Vitrines"
        description="Blocos de produtos da Home. As automáticas se atualizam sozinhas conforme os marcadores dos produtos."
        crumbs={[{ label: "Vitrines" }]}
        actions={
          <Link href="/admin/vitrines/novo" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Nova vitrine
          </Link>
        }
      />
      {rows.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Vitrine</Th>
              <Th>Origem</Th>
              <Th>Itens</Th>
              <Th>Exibição</Th>
              <Th>Ordem</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-muted/40">
                <Td>
                  <Link href={`/admin/vitrines/${c.id}`} className="font-semibold hover:text-primary">
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{c.name}</p>
                </Td>
                <Td>{SOURCE_LABEL[c.source] ?? c.source}</Td>
                <Td>{c.source === "manual" ? `${c.items.length} selecionado(s)` : `até ${c.max_items}`}</Td>
                <Td>
                  <ActiveBadge active={c.is_active && c.placement === "home"} on="Na Home" off="Oculta" />
                </Td>
                <Td>{c.sort_order}</Td>
                <Td className="text-right">
                  <DeleteButton compact action={deleteCollection.bind(null, c.id)} entityLabel={`a vitrine "${c.title}"`} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          icon={LayoutGrid}
          title="Nenhuma vitrine cadastrada"
          action={
            <Link href="/admin/vitrines/novo" className={buttonVariants()}>
              Criar vitrine
            </Link>
          }
        />
      )}
    </>
  );
}
