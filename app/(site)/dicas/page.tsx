import { Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { listingMetadata } from "@/lib/seo";
import { routes } from "@/lib/routes";
import { getBlogCategories, getBlogPosts } from "@/services/content";
import { EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { Container, Skeleton } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { PostCard } from "@/features/home/sections";

export async function generateMetadata({ searchParams }: PageProps<"/dicas">): Promise<Metadata> {
  return listingMetadata(routes.blog(), await searchParams, {
    title: "Dicas para construção e reforma",
    description: "Guias práticos sobre pisos, tintas, elétrica, hidráulica, ferramentas e manutenção para sua obra ou reforma.",
  });
}

async function PostList({ searchParams }: { searchParams: PageProps<"/dicas">["searchParams"] }) {
  const params = await searchParams;
  const category = typeof params.categoria === "string" ? params.categoria : undefined;
  const page = Math.max(Number.parseInt(typeof params.pagina === "string" ? params.pagina : "1", 10) || 1, 1);
  const [{ posts, totalPages }, categories] = await Promise.all([
    getBlogPosts({ category, page, limit: 9 }),
    getBlogCategories(),
  ]);
  const chip = "rounded-full border px-4 py-2 text-sm font-medium transition-colors";

  return (
    <>
      <nav aria-label="Categorias de dicas" className="scrollbar-none -mx-4 mb-10 overflow-x-auto px-4">
        <ul className="flex gap-2">
          <li>
            <Link
              href={routes.blog()}
              aria-current={!category ? "page" : undefined}
              className={cn(chip, !category ? "border-secondary bg-secondary text-secondary-foreground" : "border-border-strong bg-surface hover:border-foreground")}
            >
              Todas
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link
                href={routes.blogCategory(c.slug)}
                aria-current={category === c.slug ? "page" : undefined}
                className={cn(
                  chip,
                  category === c.slug ? "border-secondary bg-secondary text-secondary-foreground" : "border-border-strong bg-surface hover:border-foreground",
                )}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {posts.length ? (
        <>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
          <Pagination
            className="mt-12"
            page={page}
            totalPages={totalPages}
            buildHref={(n) => {
              const qs = new URLSearchParams();
              if (category) qs.set("categoria", category);
              if (n > 1) qs.set("pagina", String(n));
              const s = qs.toString();
              return s ? `${routes.blog()}?${s}` : routes.blog();
            }}
          />
        </>
      ) : (
        <EmptyState icon={Newspaper} title="Nenhuma dica publicada nesta categoria" description="Volte em breve ou veja todas as dicas." />
      )}
    </>
  );
}

export default function BlogPage({ searchParams }: PageProps<"/dicas">) {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Dicas" }]}
        eyebrow="Dicas para obra"
        title="Dicas para construir e reformar"
        description="Conteúdo prático para planejar, comprar o material certo e evitar retrabalho."
      />
      <Container className="py-10 sm:py-14">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PostList searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}
