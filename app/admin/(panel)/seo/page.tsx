import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { absoluteUrl } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { deleteRedirect } from "@/features/admin/system/actions";
import { RedirectForm, SeoForm } from "@/features/admin/system/forms";
import { AdminCard, AdminPageHeader, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "SEO e redirects" };

export default async function AdminSeoPage() {
  await requireAdmin("admin");
  const supabase = await createServerSupabase();
  const [{ data: seo }, { data: redirects }] = await Promise.all([
    supabase.from("seo_settings").select("*").eq("id", 1).single(),
    supabase.from("redirects").select("*").order("created_at", { ascending: false }).limit(200),
  ]);

  return (
    <>
      <AdminPageHeader
        title="SEO e redirects"
        description={
          <>
            Sitemap: <a href={absoluteUrl("/sitemap.xml")} target="_blank" rel="noopener noreferrer" className="text-primary underline">{absoluteUrl("/sitemap.xml")}</a> · envie-o no Google Search Console.
          </>
        }
        crumbs={[{ label: "SEO" }]}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Padrões de SEO">{seo ? <SeoForm values={seo} /> : null}</AdminCard>
        <div className="grid content-start gap-6">
          <AdminCard
            title="Redirects 301"
            description="Criados automaticamente quando o endereço de um produto, categoria, marca, ambiente ou artigo publicado muda. Adicione manuais para URLs de um site antigo."
          >
            <RedirectForm />
          </AdminCard>
          {redirects?.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>De</Th>
                  <Th>Para</Th>
                  <Th>Tipo</Th>
                  <Th>Criado</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {redirects.map((r) => (
                  <tr key={r.id}>
                    <Td className="font-mono text-xs break-all">{r.source_path}</Td>
                    <Td className="font-mono text-xs break-all">{r.destination_path}</Td>
                    <Td>{r.status_code}</Td>
                    <Td className="text-xs whitespace-nowrap">{formatDateTime(r.created_at)}</Td>
                    <Td className="text-right">
                      <DeleteButton compact action={deleteRedirect.bind(null, r.id)} entityLabel="este redirect" description="O endereço antigo voltará a mostrar “página não encontrada”." />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum redirect cadastrado.</p>
          )}
        </div>
      </div>
    </>
  );
}
