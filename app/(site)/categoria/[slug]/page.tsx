import type { Metadata } from "next";
import { Suspense } from "react";
import { findNode } from "@/lib/category-tree";
import { notFoundOrRedirect } from "@/lib/redirects";
import { routes } from "@/lib/routes";
import { listingMetadata, metaDescription } from "@/lib/seo";
import { getCategoryTree } from "@/services/catalog";
import { Container, Skeleton } from "@/components/ui/primitives";
import { Markdown } from "@/components/ui/markdown";
import { PageHeader } from "@/components/layout/page-header";
import { TrackView } from "@/features/analytics/track-view";
import { CatalogSkeleton, CatalogView } from "@/features/catalog/catalog-view";

type Props = PageProps<"/categoria/[slug]">;

export async function generateStaticParams() {
  const tree = await getCategoryTree();
  const slugs = tree.flatMap((c) => [c.slug, ...c.children.map((child) => child.slug)]);
  // Cache Components exige ao menos um parâmetro; o placeholder resulta em 404
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__sem-categorias__" }];
}

async function findCategory(slug: string) {
  const tree = await getCategoryTree();
  return { tree, category: findNode(tree, slug) };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await findCategory(slug);
  if (!category) return { title: "Categoria não encontrada", robots: { index: false } };
  return listingMetadata(routes.category(slug), await searchParams, {
    title: category.seoTitle ?? `${category.name} em Bauru`,
    description: metaDescription(
      category.seoDescription,
      category.description ? `${category.description} Consulte disponibilidade na Cerigatto, em Bauru/SP.` : null,
    ),
    image: category.bannerUrl ?? category.imageUrl,
  });
}

async function CategoryContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tree, category } = await findCategory(slug);
  if (!category) return notFoundOrRedirect(routes.category(slug));

  // Caminho para o breadcrumb
  const path: { name: string; slug: string }[] = [];
  const walk = (nodes: typeof tree, trail: { name: string; slug: string }[]): boolean => {
    for (const node of nodes) {
      const next = [...trail, { name: node.name, slug: node.slug }];
      if (node.slug === slug) {
        path.push(...next);
        return true;
      }
      if (walk(node.children, next)) return true;
    }
    return false;
  };
  walk(tree, []);

  return (
    <>
      <PageHeader
        crumbs={path.map((p, i) => ({
          label: p.name,
          href: i < path.length - 1 ? routes.category(p.slug) : undefined,
        }))}
        eyebrow={path.length > 1 ? path[path.length - 2]!.name : "Departamento"}
        title={category.name}
        description={category.description}
        imageUrl={category.bannerUrl}
      />
      <Container className="py-8 sm:py-10">
        <CatalogView
          searchParams={await searchParams}
          basePath={routes.category(slug)}
          locked={{ category: slug }}
          subcategories={category.children.map((child) => ({
            name: child.name,
            slug: child.slug,
            href: routes.category(child.slug),
          }))}
        />
        {category.seoContent ? (
          <section className="mt-16 max-w-3xl border-t pt-10">
            <Markdown>{category.seoContent}</Markdown>
          </section>
        ) : null}
      </Container>
      <TrackView event="category_view" categoryId={category.id} />
    </>
  );
}

export default function CategoryPage(props: Props) {
  return (
    <Suspense
      fallback={
        <>
          <div className="border-b bg-surface">
            <Container className="space-y-4 py-10">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-12 w-72" />
            </Container>
          </div>
          <Container className="py-10">
            <CatalogSkeleton />
          </Container>
        </>
      }
    >
      <CategoryContent {...props} />
    </Suspense>
  );
}
