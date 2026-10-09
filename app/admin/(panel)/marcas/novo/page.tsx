import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { BrandForm } from "@/features/admin/catalog/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Nova marca" };

export default async function NewBrandPage() {
  await requireAdmin("editor");
  return (
    <>
      <AdminPageHeader title="Nova marca" crumbs={[{ label: "Marcas", href: "/admin/marcas" }, { label: "Nova" }]} />
      <BrandForm
        values={{
          id: null,
          name: "",
          slug: "",
          description: null,
          logo_url: null,
          banner_url: null,
          website_url: null,
          is_active: true,
          is_featured: false,
          sort_order: 0,
          seo_title: null,
          seo_description: null,
        }}
      />
    </>
  );
}
