import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { PageForm } from "@/features/admin/content/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";
import { MANAGED_PAGES } from "@/features/admin/content/managed-pages";

export const metadata: Metadata = { title: "Nova página" };

export default async function NewPagePage({ searchParams }: PageProps<"/admin/paginas/nova">) {
  await requireAdmin("editor");
  const { slug } = await searchParams;
  if (typeof slug !== "string" || !MANAGED_PAGES[slug]) notFound();
  const supabase = await createServerSupabase();
  const { data: existing } = await supabase.from("pages").select("id").eq("slug", slug).maybeSingle();
  if (existing) redirect(`/admin/paginas/${existing.id}`);
  return (
    <>
      <AdminPageHeader title={MANAGED_PAGES[slug].label} crumbs={[{ label: "Páginas", href: "/admin/paginas" }, { label: "Nova" }]} />
      <PageForm
        values={{
          id: null,
          slug,
          title: MANAGED_PAGES[slug].label.replace(/ \(.*\)$/, ""),
          summary: null,
          content: null,
          seo_title: null,
          seo_description: null,
          status: "published",
        }}
      />
    </>
  );
}
