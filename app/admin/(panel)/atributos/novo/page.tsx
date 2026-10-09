import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { AttributeForm } from "@/features/admin/catalog/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Novo atributo" };

export default async function NewAttributePage() {
  await requireAdmin("editor");
  return (
    <>
      <AdminPageHeader title="Novo atributo" crumbs={[{ label: "Atributos", href: "/admin/atributos" }, { label: "Novo" }]} />
      <AttributeForm values={{ id: null, name: "", slug: "", unit: null, group_name: "Especificações", is_filterable: false, sort_order: 0 }} />
    </>
  );
}
