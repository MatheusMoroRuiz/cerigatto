import { History } from "lucide-react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { AdminPageHeader, Table, Td, Th } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Auditoria" };

const PAGE_SIZE = 50;

export default async function AdminAuditPage({ searchParams }: PageProps<"/admin/auditoria">) {
  await requireAdmin("admin");
  const page = Math.max(Number((await searchParams).pagina) || 1, 1);
  const supabase = await createServerSupabase();
  const [{ data, count }, { data: profiles }] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
    supabase.from("profiles").select("id, full_name, email"),
  ]);
  const who = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? p.email ?? p.id]));

  return (
    <>
      <AdminPageHeader title="Auditoria" description="Registro das alterações feitas no painel." crumbs={[{ label: "Auditoria" }]} />
      {data?.length ? (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Quando</Th>
                <Th>Quem</Th>
                <Th>Ação</Th>
                <Th>Item</Th>
                <Th>Detalhes</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((log) => (
                <tr key={log.id}>
                  <Td className="text-xs whitespace-nowrap">{formatDateTime(log.created_at)}</Td>
                  <Td>{log.user_id ? (who.get(log.user_id) ?? "—") : "—"}</Td>
                  <Td className="font-mono text-xs">{log.action}</Td>
                  <Td className="font-mono text-xs">
                    {log.entity_type}
                    {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}
                  </Td>
                  <Td className="max-w-sm truncate font-mono text-xs text-muted-foreground">
                    {JSON.stringify(log.metadata) === "{}" ? "" : JSON.stringify(log.metadata)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination className="mt-6" page={page} totalPages={Math.max(Math.ceil((count ?? 0) / PAGE_SIZE), 1)} buildHref={(n) => (n > 1 ? `/admin/auditoria?pagina=${n}` : "/admin/auditoria")} />
        </>
      ) : (
        <EmptyState icon={History} title="Nenhuma alteração registrada ainda" />
      )}
    </>
  );
}
