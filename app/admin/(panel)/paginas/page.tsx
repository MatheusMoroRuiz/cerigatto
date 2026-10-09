import { ExternalLink, FileText, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { MANAGED_PAGES } from "@/features/admin/content/managed-pages";
import { AdminPageHeader, StatusBadge, Table, Td, Th } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Páginas" };

export default async function AdminPagesPage() {
  await requireAdmin("editor");
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("pages").select("id, slug, title, status, updated_at");
  const bySlug = new Map((data ?? []).map((p) => [p.slug, p]));

  return (
    <>
      <AdminPageHeader
        title="Páginas"
        description="Textos institucionais e legais. Dados da empresa (história, missão, endereço) ficam em Configurações."
        crumbs={[{ label: "Páginas" }]}
      />
      <Table>
        <thead>
          <tr>
            <Th>Página</Th>
            <Th>Endereço</Th>
            <Th>Status</Th>
            <Th>Atualizada</Th>
            <Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(MANAGED_PAGES).map(([slug, info]) => {
            const page = bySlug.get(slug);
            return (
              <tr key={slug} className="hover:bg-muted/40">
                <Td>
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                    {page ? (
                      <Link href={`/admin/paginas/${page.id}`} className="hover:text-primary">
                        {info.label}
                      </Link>
                    ) : (
                      info.label
                    )}
                  </span>
                </Td>
                <Td className="font-mono text-xs">{info.path}</Td>
                <Td>{page ? <StatusBadge status={page.status} /> : <span className="text-sm text-muted-foreground">Não criada</span>}</Td>
                <Td>{page ? formatDateTime(page.updated_at) : "—"}</Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    {page ? (
                      <>
                        <Link href={`/admin/paginas/${page.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Editar
                        </Link>
                        <a href={info.path} target="_blank" rel="noopener noreferrer" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted" aria-label="Ver no site">
                          <ExternalLink className="size-4" />
                        </a>
                      </>
                    ) : (
                      <Link href={`/admin/paginas/nova?slug=${slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        <Plus aria-hidden="true" /> Criar
                      </Link>
                    )}
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <p className="mt-4 text-sm text-muted-foreground">
        Os modelos legais são um ponto de partida. Revise-os com a assessoria jurídica da empresa.
      </p>
    </>
  );
}
