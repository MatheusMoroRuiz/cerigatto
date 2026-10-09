import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { BannerForm } from "@/features/admin/content/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Editar banner" };

export default async function EditBannerPage({ params }: PageProps<"/admin/banners/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("banners").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <AdminPageHeader title={data.internal_name} crumbs={[{ label: "Banners", href: "/admin/banners" }, { label: "Editar" }]} />
      <BannerForm key={data.updated_at} values={data} />
    </>
  );
}
