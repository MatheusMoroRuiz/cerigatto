import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { serverEnv } from "@/lib/env.server";
import { createServerSupabase } from "@/lib/supabase/server";
import { Notice } from "@/components/ui/feedback";
import { removeAdmin } from "@/features/admin/system/actions";
import { InviteAdminForm, RoleSelect } from "@/features/admin/system/forms";
import { AdminCard, AdminPageHeader, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Administradores" };

export default async function AdminUsersPage() {
  const session = await requireAdmin("super_admin");
  const supabase = await createServerSupabase();
  const [{ data: roles }, { data: profiles }] = await Promise.all([
    supabase.from("user_roles").select("user_id, role, created_at").order("created_at"),
    supabase.from("profiles").select("id, full_name, email"),
  ]);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <>
      <AdminPageHeader
        title="Administradores"
        description="Editor: catálogo e conteúdo. Administrador: + configurações, SEO e contatos. Super administrador: + gestão de acessos."
        crumbs={[{ label: "Administradores" }]}
      />
      <div className="grid gap-6">
        <AdminCard title="Convidar pessoa" description="A pessoa recebe um e-mail para criar a senha.">
          {serverEnv.serviceRoleKey ? null : (
            <Notice tone="warning" className="mb-4">
              Configure SUPABASE_SERVICE_ROLE_KEY no servidor para enviar convites.
            </Notice>
          )}
          <InviteAdminForm />
        </AdminCard>
        <Table>
          <thead>
            <tr>
              <Th>Pessoa</Th>
              <Th>Papel</Th>
              <Th>Desde</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {(roles ?? []).map((r) => {
              const profile = profileById.get(r.user_id);
              const self = r.user_id === session.userId;
              return (
                <tr key={r.user_id}>
                  <Td>
                    <p className="font-semibold">{profile?.full_name ?? profile?.email ?? r.user_id}</p>
                    {profile?.full_name ? <p className="text-xs text-muted-foreground">{profile.email}</p> : null}
                    {self ? <p className="text-xs text-primary">Você</p> : null}
                  </Td>
                  <Td>
                    <RoleSelect userId={r.user_id} role={r.role} disabled={self} />
                  </Td>
                  <Td className="text-xs">{formatDateTime(r.created_at)}</Td>
                  <Td className="text-right">
                    {!self ? (
                      <DeleteButton compact action={removeAdmin.bind(null, r.user_id)} entityLabel={`o acesso de ${profile?.email ?? "este usuário"}`} description="A pessoa não poderá mais entrar no painel. A conta continua existindo no Supabase Auth." />
                    ) : null}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
}
