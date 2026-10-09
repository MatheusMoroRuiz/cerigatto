import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { categoryOptions, getAdminLookups } from "@/features/admin/queries";
import { deleteCategory } from "@/features/admin/catalog/actions";
import { CategoryForm } from "@/features/admin/catalog/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Editar categoria" };

export default async function EditCategoryPage({ params }: PageProps<"/admin/categorias/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const [{ data }, { data: attrs }, lookups] = await Promise.all([
    supabase.from("categories").select("*").eq("id", id).is("deleted_at", null).maybeSingle(),
    supabase.from("category_attributes").select("attribute_id").eq("category_id", id).order("sort_order"),
    getAdminLookups(),
  ]);
  if (!data) notFound();
  return (
    <>
      <AdminPageHeader
        title={data.name}
        crumbs={[{ label: "Categorias", href: "/admin/categorias" }, { label: "Editar" }]}
        actions={<DeleteButton action={deleteCategory.bind(null, id)} entityLabel={`a categoria "${data.name}"`} redirectTo="/admin/categorias" />}
      />
      <CategoryForm
        key={data.updated_at}
        parents={categoryOptions(lookups.categories)}
        attributes={lookups.attributes}
        values={{ ...data, attribute_ids: (attrs ?? []).map((a) => a.attribute_id) }}
      />
    </>
  );
}
