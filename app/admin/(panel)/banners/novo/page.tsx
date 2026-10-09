import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { BannerForm } from "@/features/admin/content/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Novo banner" };

export default async function NewBannerPage() {
  await requireAdmin("editor");
  return (
    <>
      <AdminPageHeader title="Novo banner" crumbs={[{ label: "Banners", href: "/admin/banners" }, { label: "Novo" }]} />
      <BannerForm
        values={{
          id: null,
          internal_name: "",
          placement: "home_hero",
          desktop_image_url: null,
          mobile_image_url: null,
          image_alt: null,
          eyebrow: null,
          title: null,
          subtitle: null,
          button_text: null,
          button_url: null,
          text_position: "left",
          overlay_opacity: 45,
          starts_at: null,
          ends_at: null,
          is_active: true,
          sort_order: 0,
        }}
      />
    </>
  );
}
