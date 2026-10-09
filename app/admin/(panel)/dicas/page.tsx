import { ExternalLink, Newspaper, Plus, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin, roleAtLeast } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { deleteBlogCategory, deletePost } from "@/features/admin/content/actions";
import { BlogCategoryForm } from "@/features/admin/content/blog-category-form";
import { AdminCard, AdminPageHeader, StatusBadge, Table, Td, Th } from "@/features/admin/ui/admin-ui";
import { ConfirmAction } from "@/features/admin/ui/client-ui";
import { DeleteButton } from "@/features/admin/ui/delete-button";

export const metadata: Metadata = { title: "Blog / Dicas" };

export default async function AdminBlogPage() {
  const session = await requireAdmin("editor");
  const supabase = await createServerSupabase();
  const [{ data: posts }, { data: categories }] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, title, slug, status, published_at, updated_at, category:blog_categories(name)")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    supabase.from("blog_categories").select("id, name, slug").order("sort_order").order("name"),
  ]);
  const rows = posts ?? [];

  return (
    <>
      <AdminPageHeader
        title="Blog / Dicas"
        description="Conteúdo educativo para SEO e autoridade."
        crumbs={[{ label: "Blog" }]}
        actions={
          <Link href="/admin/dicas/novo" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Novo artigo
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          {rows.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Título</Th>
                  <Th>Categoria</Th>
                  <Th>Status</Th>
                  <Th>Publicação</Th>
                  <Th className="text-right">Ações</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/40">
                    <Td>
                      <Link href={`/admin/dicas/${post.id}`} className="font-semibold hover:text-primary">
                        {post.title}
                      </Link>
                    </Td>
                    <Td>{post.category?.name ?? "—"}</Td>
                    <Td>
                      <StatusBadge status={post.status} />
                    </Td>
                    <Td>{post.published_at ? formatDate(post.published_at) : "—"}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        {post.status === "published" ? (
                          <a
                            href={routes.blogPost(post.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted"
                            aria-label="Ver no site"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        ) : null}
                        <DeleteButton compact action={deletePost.bind(null, post.id)} entityLabel={`o artigo "${post.title}"`} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              icon={Newspaper}
              title="Nenhum artigo publicado"
              description="Dicas ajudam clientes a escolher o material certo e atraem visitas pelo Google."
              action={
                <Link href="/admin/dicas/novo" className={buttonVariants()}>
                  Escrever primeiro artigo
                </Link>
              }
            />
          )}
        </div>
        <AdminCard title="Categorias do blog">
          <ul className="mb-4 flex flex-wrap gap-2">
            {(categories ?? []).map((c) => (
              <li key={c.id} className="inline-flex items-center gap-1 rounded-full border bg-background py-1 pr-1 pl-3 text-sm">
                {c.name}
                {roleAtLeast(session.role, "admin") ? (
                  <ConfirmAction
                    trigger={
                      <button type="button" className="inline-flex size-6 items-center justify-center rounded-full hover:bg-muted" aria-label={`Remover ${c.name}`}>
                        <X className="size-3.5" />
                      </button>
                    }
                    title={`Remover a categoria "${c.name}"?`}
                    description="Os artigos dessa categoria ficarão sem categoria."
                    confirmLabel="Remover"
                    action={deleteBlogCategory.bind(null, c.id)}
                  />
                ) : null}
              </li>
            ))}
          </ul>
          <BlogCategoryForm />
        </AdminCard>
      </div>
    </>
  );
}
