import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";
import { PostForm } from "@/features/admin/content/forms";
import { AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Novo artigo" };

export default async function NewPostPage() {
  const session = await requireAdmin("editor");
  const supabase = await createServerSupabase();
  const { data: categories } = await supabase.from("blog_categories").select("id, name").order("sort_order");
  return (
    <>
      <AdminPageHeader title="Novo artigo" crumbs={[{ label: "Blog", href: "/admin/dicas" }, { label: "Novo" }]} />
      <PostForm
        categories={categories ?? []}
        values={{
          id: null,
          title: "",
          slug: "",
          excerpt: null,
          content: "",
          cover_image_url: null,
          cover_alt: null,
          author_name: session.name,
          category_id: null,
          status: "draft",
          published_at: null,
          is_featured: false,
          reading_minutes: null,
          seo_title: null,
          seo_description: null,
        }}
      />
    </>
  );
}
