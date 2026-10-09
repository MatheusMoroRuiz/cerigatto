import { Plus, Tag } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { deleteBrand } from "@/features/admin/catalog/actions";
import { ActiveBadge, AdminPageHeader, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Marcas" };

export default async function AdminBrandsPage() {
  await requireAdmin("editor");
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, is_active, is_featured")
    .is("deleted_at", null)
    .order("name");
  const brands = data ?? [];
  return (
    <>
      <AdminPageHeader
        title="Marcas"
        crumbs={[{ label: "Marcas" }]}
        actions={
          <Link href="/admin/marcas/novo" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Nova marca
          </Link>
        }
      />
      {brands.length ? (
        <Table>
          <thead>
            <tr>
              <Th>Marca</Th>
              <Th>Endereço</Th>
              <Th>Situação</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="hover:bg-muted/40">
                <Td>
                  <Link href={`/admin/marcas/${b.id}`} className="flex items-center gap-3 font-semibold hover:text-primary">
                    <span className="relative flex h-9 w-16 items-center justify-center overflow-hidden rounded border bg-background">
                      {b.logo_url ? (
                        <Image src={b.logo_url} alt="" fill sizes="64px" className="object-contain p-1" />
                      ) : (
                        <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </span>
                    {b.name}
                  </Link>
                </Td>
                <Td className="font-mono text-xs">/marca/{b.slug}</Td>
                <Td>
                  <div className="flex gap-1">
                    <ActiveBadge active={b.is_active} on="Ativa" off="Inativa" />
                    {b.is_featured ? <ActiveBadge active on="Destaque" /> : null}
                  </div>
                </Td>
                <Td className="text-right">
                  <DeleteButton compact action={deleteBrand.bind(null, b.id)} entityLabel={`a marca "${b.name}"`} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          icon={Tag}
          title="Nenhuma marca encontrada"
          action={
            <Link href="/admin/marcas/novo" className={buttonVariants()}>
              Cadastrar marca
            </Link>
          }
        />
      )}
    </>
  );
}
