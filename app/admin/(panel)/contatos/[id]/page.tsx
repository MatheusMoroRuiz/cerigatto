import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin, roleAtLeast } from "@/lib/auth/session";
import { formatDateTime, formatPhone, onlyDigits } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { deleteContact } from "@/features/admin/system/actions";
import { LeadStatusForm } from "@/features/admin/system/forms";
import { AdminCard, AdminPageHeader, LeadBadge } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Contato" };

export default async function ContactDetailPage({ params }: PageProps<"/admin/contatos/[id]">) {
  const session = await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: c } = await supabase.from("contacts").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();
  const whatsapp = c.whatsapp ?? c.phone;

  return (
    <>
      <AdminPageHeader
        title={c.subject}
        description={<span className="inline-flex items-center gap-2"><LeadBadge status={c.status} /> Recebido em {formatDateTime(c.created_at)}</span>}
        crumbs={[{ label: "Contatos", href: "/admin/contatos" }, { label: c.name }]}
        actions={
          roleAtLeast(session.role, "admin") ? (
            <DeleteButton action={deleteContact.bind(null, id)} entityLabel="este contato" description="Remove definitivamente os dados pessoais deste contato (atende a pedidos de exclusão da LGPD)." redirectTo="/admin/contatos" />
          ) : null
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard title="Mensagem">
          <dl className="mb-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-semibold">{c.name}</dd>
            </div>
            {c.email ? (
              <div>
                <dt className="text-muted-foreground">E-mail</dt>
                <dd>
                  <a href={`mailto:${c.email}`} className="font-semibold text-primary hover:underline">
                    {c.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {c.whatsapp ? (
              <div>
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="font-semibold">{formatPhone(c.whatsapp)}</dd>
              </div>
            ) : null}
            {c.phone ? (
              <div>
                <dt className="text-muted-foreground">Telefone</dt>
                <dd>
                  <a href={`tel:+55${onlyDigits(c.phone)}`} className="font-semibold">
                    {formatPhone(c.phone)}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">{c.message}</p>
          {whatsapp ? (
            <a
              href={buildWhatsAppUrl(`55${onlyDigits(whatsapp)}`, `Olá, ${c.name.split(" ")[0]}! Aqui é da Cerigatto, sobre sua mensagem "${c.subject}".`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonVariants({ variant: "whatsapp" })} mt-5`}
            >
              Responder pelo WhatsApp
            </a>
          ) : null}
        </AdminCard>
        <AdminCard title="Atendimento">
          <LeadStatusForm kind="contact" id={c.id} status={c.status} notes={c.internal_notes} />
        </AdminCard>
      </div>
    </>
  );
}
