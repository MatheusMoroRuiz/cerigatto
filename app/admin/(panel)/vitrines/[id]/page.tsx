import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { CollectionForm, type CollectionValues } from "@/features/admin/content/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Editar vitrine" };

export default async function EditCollectionPage({ params }: PageProps<"/admin/vitrines/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("collections")
    .select("*, items:collection_products(sort_order, product:products(id, name, sku))")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const products = [...data.items]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((i) => (i.product ? [i.product] : []));
  return (
    <>
      <AdminPageHeader title={data.title} crumbs={[{ label: "Vitrines", href: "/admin/vitrines" }, { label: "Editar" }]} />
      <CollectionForm
        key={data.updated_at}
        values={{
          id: data.id,
          name: data.name,
          slug: data.slug,
          title: data.title,
          subtitle: data.subtitle,
          source: (data.source === "category" ? "manual" : data.source) as CollectionValues["source"],
          placement: data.placement as CollectionValues["placement"],
          max_items: data.max_items,
          is_active: data.is_active,
          sort_order: data.sort_order,
          products,
        }}
      />
    </>
  );
}
