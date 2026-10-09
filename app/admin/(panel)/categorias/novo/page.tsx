import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { categoryOptions, getAdminLookups } from "@/features/admin/queries";
import { CategoryForm } from "@/features/admin/catalog/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Nova categoria" };

export default async function NewCategoryPage() {
  await requireAdmin("editor");
  const lookups = await getAdminLookups();
  return (
    <>
      <AdminPageHeader title="Nova categoria" crumbs={[{ label: "Categorias", href: "/admin/categorias" }, { label: "Nova" }]} />
      <CategoryForm
        parents={categoryOptions(lookups.categories)}
        attributes={lookups.attributes}
        values={{
          id: null,
          name: "",
          slug: "",
          parent_id: null,
          description: null,
          image_url: null,
          banner_url: null,
          icon: null,
          whatsapp_number: null,
          is_active: true,
          show_in_menu: true,
          is_featured: false,
          sort_order: 0,
          seo_title: null,
          seo_description: null,
          seo_content: null,
          attribute_ids: [],
        }}
      />
    </>
  );
}
