import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { CollectionForm } from "@/features/admin/content/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Nova vitrine" };

export default async function NewCollectionPage() {
  await requireAdmin("editor");
  return (
    <>
      <AdminPageHeader title="Nova vitrine" crumbs={[{ label: "Vitrines", href: "/admin/vitrines" }, { label: "Nova" }]} />
      <CollectionForm
        values={{ id: null, name: "", slug: "", title: "", subtitle: null, source: "manual", placement: "home", max_items: 8, is_active: true, sort_order: 0, products: [] }}
      />
    </>
  );
}
