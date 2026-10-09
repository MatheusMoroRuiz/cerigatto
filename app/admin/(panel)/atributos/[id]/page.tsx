import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { AttributeForm } from "@/features/admin/catalog/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Editar atributo" };

export default async function EditAttributePage({ params }: PageProps<"/admin/atributos/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("attributes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <AdminPageHeader title={data.name} crumbs={[{ label: "Atributos", href: "/admin/atributos" }, { label: "Editar" }]} />
      <AttributeForm key={data.updated_at} values={data} />
    </>
  );
}
