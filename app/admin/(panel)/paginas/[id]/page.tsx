import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { PageForm } from "@/features/admin/content/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Editar página" };

export default async function EditPagePage({ params }: PageProps<"/admin/paginas/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <AdminPageHeader title={data.title} crumbs={[{ label: "Páginas", href: "/admin/paginas" }, { label: "Editar" }]} />
      <PageForm key={data.updated_at} values={data} />
    </>
  );
}
