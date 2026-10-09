import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime, formatQuantity } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { LeadStatusForm } from "@/features/admin/system/forms";
import { AdminCard, AdminPageHeader, LeadBadge, Table, Td, Th } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Solicitação" };

export default async function QuoteDetailPage({ params }: PageProps<"/admin/solicitacoes/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: q } = await supabase.from("quote_requests").select("*, items:quote_request_items(*)").eq("id", id).maybeSingle();
  if (!q) notFound();
  const utm = Object.entries((q.utm ?? {}) as Record<string, string>);

  return (
    <>
      <AdminPageHeader
        title={`Lista com ${q.items_count} item(ns)`}
        description={<span className="inline-flex items-center gap-2"><LeadBadge status={q.status} /> Enviada em {formatDateTime(q.created_at)}</span>}
        crumbs={[{ label: "Solicitações", href: "/admin/solicitacoes" }, { label: "Detalhe" }]}
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6">
          <Table>
            <thead>
              <tr>
                <Th>Produto</Th>
                <Th>Código</Th>
                <Th>Variação</Th>
                <Th className="text-right">Quantidade</Th>
              </tr>
            </thead>
            <tbody>
              {q.items.map((i) => (
                <tr key={i.id}>
                  <Td>{i.product_id ? <Link href={`/admin/produtos/${i.product_id}`} className="font-semibold hover:text-primary">{i.product_name}</Link> : i.product_name}</Td>
                  <Td className="font-mono text-xs">{i.sku ?? "—"}</Td>
                  <Td>{i.variant_label ?? "—"}</Td>
                  <Td className="text-right">
                    {formatQuantity(i.quantity)} {i.unit}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          {q.note ? (
            <AdminCard title="Observações do visitante">
              <p className="text-sm whitespace-pre-wrap">{q.note}</p>
            </AdminCard>
          ) : null}
          {utm.length || q.source_page ? (
            <AdminCard title="Origem">
              <dl className="grid gap-2 text-sm">
                {q.source_page ? (
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Página:</dt>
                    <dd>{q.source_page}</dd>
                  </div>
                ) : null}
                {utm.map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="text-muted-foreground">{k}:</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </AdminCard>
          ) : null}
        </div>
        <AdminCard title="Acompanhamento" description="Use para marcar o andamento da conversa no WhatsApp.">
          <LeadStatusForm kind="quote" id={q.id} status={q.status} notes={q.internal_notes} />
        </AdminCard>
      </div>
    </>
  );
}
