import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { EnvironmentForm } from "@/features/admin/catalog/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Novo ambiente" };

export default async function NewEnvironmentPage() {
  await requireAdmin("editor");
  return (
    <>
      <AdminPageHeader title="Novo ambiente" crumbs={[{ label: "Ambientes", href: "/admin/ambientes" }, { label: "Novo" }]} />
      <EnvironmentForm
        values={{
          id: null,
          name: "",
          slug: "",
          summary: null,
          content: null,
          image_url: null,
          banner_url: null,
          is_active: true,
          sort_order: 0,
          seo_title: null,
          seo_description: null,
        }}
      />
    </>
  );
}
