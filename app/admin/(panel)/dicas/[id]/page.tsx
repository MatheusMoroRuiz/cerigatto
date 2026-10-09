import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { deletePost } from "@/features/admin/content/actions";
import { PostForm } from "@/features/admin/content/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Editar artigo" };

export default async function EditPostPage({ params }: PageProps<"/admin/dicas/[id]">) {
  await requireAdmin("editor");
  const { id } = await params;
  const supabase = await createServerSupabase();
  const [{ data }, { data: categories }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).is("deleted_at", null).maybeSingle(),
    supabase.from("blog_categories").select("id, name").order("sort_order"),
  ]);
  if (!data) notFound();
  return (
    <>
      <AdminPageHeader
        title={data.title}
        crumbs={[{ label: "Blog", href: "/admin/dicas" }, { label: "Editar" }]}
        actions={<DeleteButton action={deletePost.bind(null, id)} entityLabel={`o artigo "${data.title}"`} redirectTo="/admin/dicas" />}
      />
      <PostForm key={data.updated_at} values={data} categories={categories ?? []} />
    </>
  );
}
