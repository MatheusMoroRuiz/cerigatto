import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { deleteBrand } from "@/features/admin/catalog/actions";
import { BrandForm } from "@/features/admin/catalog/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Editar marca" };

export default async function EditBrandPage({ params }: PageProps<"/admin/marcas/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("brands").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <AdminPageHeader
        title={data.name}
        crumbs={[{ label: "Marcas", href: "/admin/marcas" }, { label: "Editar" }]}
        actions={<DeleteButton action={deleteBrand.bind(null, id)} entityLabel={`a marca "${data.name}"`} redirectTo="/admin/marcas" />}
      />
      <BrandForm key={data.updated_at} values={data} />
    </>
  );
}
