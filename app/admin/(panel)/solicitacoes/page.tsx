import { ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { AdminPageHeader, LeadBadge, Table, Td, Th } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Solicitações" };

const PAGE_SIZE = 25;

export default async function AdminQuotesPage({ searchParams }: PageProps<"/admin/solicitacoes">) {
  await requireAdmin("editor");
  const page = Math.max(Number((await searchParams).pagina) || 1, 1);
  const supabase = await createServerSupabase();
  const { data, count } = await supabase
    .from("quote_requests")
    .select("id, items_count, note, status, utm, created_at, items:quote_request_items(product_name, quantity, unit)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const rows = data ?? [];

  return (
    <>
      <AdminPageHeader
        title="Solicitações de orçamento"
        description="Registro anônimo das Listas de Orçamento enviadas ao WhatsApp. A conversa e os dados do cliente ficam no WhatsApp."
        crumbs={[{ label: "Solicitações" }]}
      />
      {rows.length ? (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Enviada</Th>
                <Th>Itens</Th>
                <Th>Origem</Th>
                <Th>Situação</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => {
                const utm = (q.utm ?? {}) as Record<string, string>;
                return (
                  <tr key={q.id} className="hover:bg-muted/40">
                    <Td className="whitespace-nowrap">
                      <Link href={`/admin/solicitacoes/${q.id}`} className="font-semibold hover:text-primary">
                        {formatDateTime(q.created_at)}
                      </Link>
                    </Td>
                    <Td className="max-w-md">
                      <span className="line-clamp-2 text-sm">
                        {q.items.slice(0, 3).map((i) => `${i.quantity} ${i.unit ?? ""} ${i.product_name}`).join(" · ")}
                        {q.items_count > 3 ? ` +${q.items_count - 3}` : ""}
                      </span>
                    </Td>
                    <Td className="text-xs">{utm.utm_source ?? (utm.referrer ? "Referência" : "Direto")}</Td>
                    <Td>
                      <LeadBadge status={q.status} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination className="mt-6" page={page} totalPages={Math.max(Math.ceil((count ?? 0) / PAGE_SIZE), 1)} buildHref={(n) => (n > 1 ? `/admin/solicitacoes?pagina=${n}` : "/admin/solicitacoes")} />
        </>
      ) : (
        <EmptyState icon={ClipboardList} title="Nenhuma solicitação recebida" description="Quando um visitante enviar a Lista de Orçamento pelo WhatsApp, o registro aparece aqui." />
      )}
    </>
  );
}
