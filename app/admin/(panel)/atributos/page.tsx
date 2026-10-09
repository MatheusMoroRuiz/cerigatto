import { ListChecks, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { deleteAttribute } from "@/features/admin/catalog/actions";
import { ActiveBadge, AdminPageHeader, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Atributos" };

export default async function AdminAttributesPage() {
  await requireAdmin("editor");
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("attributes").select("*").order("sort_order").order("name");
  const rows = data ?? [];
  return (
    <>
      <AdminPageHeader
        title="Atributos de especificação"
        description="Modelo flexível: cada categoria usa os atributos que fizerem sentido (ex.: Tintas → Rendimento; Porcelanatos → Formato)."
        crumbs={[{ label: "Atributos" }]}
        actions={
          <Link href="/admin/atributos/novo" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Novo atributo
          </Link>
        }
      />
      {rows.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Atributo</Th>
              <Th>Parâmetro na URL</Th>
              <Th>Unidade</Th>
              <Th>Grupo</Th>
              <Th>Filtro</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-muted/40">
                <Td>
                  <Link href={`/admin/atributos/${a.id}`} className="font-semibold hover:text-primary">
                    {a.name}
                  </Link>
                </Td>
                <Td className="font-mono text-xs">?{a.slug}=</Td>
                <Td>{a.unit ?? "—"}</Td>
                <Td>{a.group_name}</Td>
                <Td>
                  <ActiveBadge active={a.is_filterable} on="Filtrável" off="Não" />
                </Td>
                <Td className="text-right">
                  <DeleteButton compact action={deleteAttribute.bind(null, a.id)} entityLabel={`o atributo "${a.name}"`} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="Nenhum atributo cadastrado"
          action={
            <Link href="/admin/atributos/novo" className={buttonVariants()}>
              Criar atributo
            </Link>
          }
        />
      )}
    </>
  );
}
