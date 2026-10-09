import { Plus, Sofa } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { deleteEnvironment } from "@/features/admin/catalog/actions";
import { ActiveBadge, AdminPageHeader, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Ambientes" };

export default async function AdminEnvironmentsPage() {
  await requireAdmin("editor");
  const supabase = await createServerSupabase();
  const [{ data }, { data: links }] = await Promise.all([
    supabase.from("environments").select("id, name, slug, is_active, sort_order").is("deleted_at", null).order("sort_order"),
    supabase.from("product_environments").select("environment_id"),
  ]);
  const count = new Map<string, number>();
  for (const l of links ?? []) count.set(l.environment_id, (count.get(l.environment_id) ?? 0) + 1);
  const rows = data ?? [];
  return (
    <>
      <AdminPageHeader
        title="Ambientes"
        description="Páginas de inspiração (banheiro, cozinha…). Vincule produtos pelo cadastro de cada produto."
        crumbs={[{ label: "Ambientes" }]}
        actions={
          <Link href="/admin/ambientes/novo" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Novo ambiente
          </Link>
        }
      />
      {rows.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Ambiente</Th>
              <Th>Endereço</Th>
              <Th>Produtos</Th>
              <Th>Situação</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="hover:bg-muted/40">
                <Td>
                  <Link href={`/admin/ambientes/${e.id}`} className="font-semibold hover:text-primary">
                    {e.name}
                  </Link>
                </Td>
                <Td className="font-mono text-xs">/ambientes/{e.slug}</Td>
                <Td>{count.get(e.id) ?? 0}</Td>
                <Td>
                  <ActiveBadge active={e.is_active} />
                </Td>
                <Td className="text-right">
                  <DeleteButton compact action={deleteEnvironment.bind(null, e.id)} entityLabel={`o ambiente "${e.name}"`} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          icon={Sofa}
          title="Nenhum ambiente cadastrado"
          action={
            <Link href="/admin/ambientes/novo" className={buttonVariants()}>
              Criar ambiente
            </Link>
          }
        />
      )}
    </>
  );
}
