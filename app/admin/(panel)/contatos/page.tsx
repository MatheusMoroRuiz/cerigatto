import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatPhone } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import type { LeadStatus } from "@/types/catalog";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { AdminPageHeader, LeadBadge, Table, Td, Th } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Contatos" };

const PAGE_SIZE = 25;

export default async function AdminContactsPage({ searchParams }: PageProps<"/admin/contatos">) {
  await requireAdmin("editor");
  const params = await searchParams;
  const status = typeof params.status === "string" && params.status in LEAD_STATUS_LABELS ? (params.status as LeadStatus) : undefined;
  const page = Math.max(Number(params.pagina) || 1, 1);
  const supabase = await createServerSupabase();
  let query = supabase
    .from("contacts")
    .select("id, name, subject, whatsapp, phone, email, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  const { data, count } = await query;
  const rows = data ?? [];
  const filters: { label: string; value?: LeadStatus }[] = [{ label: "Todos" }, ...Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ label, value: value as LeadStatus }))];

  return (
    <>
      <AdminPageHeader title="Contatos" description="Mensagens enviadas pelo formulário do site." crumbs={[{ label: "Contatos" }]} />
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Filtrar por situação">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/contatos?status=${f.value}` : "/admin/contatos"}
            aria-current={status === f.value ? "page" : undefined}
            className={buttonVariants({ variant: status === f.value ? "secondary" : "outline", size: "sm" })}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      {rows.length ? (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Recebido</Th>
                <Th>Nome</Th>
                <Th>Assunto</Th>
                <Th>Contato</Th>
                <Th>Situação</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40">
                  <Td className="whitespace-nowrap">{formatDateTime(c.created_at)}</Td>
                  <Td>
                    <Link href={`/admin/contatos/${c.id}`} className="font-semibold hover:text-primary">
                      {c.name}
                    </Link>
                  </Td>
                  <Td className="max-w-xs truncate">{c.subject}</Td>
                  <Td className="text-xs">{c.whatsapp ? formatPhone(c.whatsapp) : c.phone ? formatPhone(c.phone) : c.email}</Td>
                  <Td>
                    <LeadBadge status={c.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination
            className="mt-6"
            page={page}
            totalPages={Math.max(Math.ceil((count ?? 0) / PAGE_SIZE), 1)}
            buildHref={(n) => `/admin/contatos?${new URLSearchParams({ ...(status ? { status } : {}), ...(n > 1 ? { pagina: String(n) } : {}) })}`}
          />
        </>
      ) : (
        <EmptyState icon={Inbox} title="Nenhum contato recebido" description="As mensagens do formulário da página Contato aparecem aqui." />
      )}
    </>
  );
}
