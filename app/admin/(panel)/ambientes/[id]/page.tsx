import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { deleteEnvironment } from "@/features/admin/catalog/actions";
import { EnvironmentForm } from "@/features/admin/catalog/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Editar ambiente" };

export default async function EditEnvironmentPage({ params }: PageProps<"/admin/ambientes/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("environments").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <AdminPageHeader
        title={data.name}
        crumbs={[{ label: "Ambientes", href: "/admin/ambientes" }, { label: "Editar" }]}
        actions={<DeleteButton action={deleteEnvironment.bind(null, id)} entityLabel={`o ambiente "${data.name}"`} redirectTo="/admin/ambientes" />}
      />
      <EnvironmentForm key={data.updated_at} values={data} />
    </>
  );
}
