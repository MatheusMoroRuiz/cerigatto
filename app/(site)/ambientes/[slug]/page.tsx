import type { Metadata } from "next";
import { Suspense } from "react";
import { notFoundOrRedirect } from "@/lib/redirects";
import { routes } from "@/lib/routes";
import { listingMetadata, metaDescription } from "@/lib/seo";
import { getEnvironmentBySlug, getEnvironments } from "@/services/content";
import { Markdown } from "@/components/ui/markdown";
import { Container, Skeleton } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { CatalogSkeleton, CatalogView } from "@/features/catalog/catalog-view";

type Props = PageProps<"/ambientes/[slug]">;

export async function generateStaticParams() {
  const environments = await getEnvironments();
  return environments.length ? environments.map((e) => ({ slug: e.slug })) : [{ slug: "__sem-ambientes__" }];
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const environment = await getEnvironmentBySlug(slug);
  if (!environment) return { title: "Ambiente não encontrado", robots: { index: false } };
  return listingMetadata(routes.environment(slug), await searchParams, {
    title: environment.seoTitle ?? `Materiais para ${environment.name.toLowerCase()}`,
    description: metaDescription(environment.seoDescription, environment.summary),
    image: environment.bannerUrl ?? environment.imageUrl,
  });
}

async function EnvironmentContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const environment = await getEnvironmentBySlug(slug);
  if (!environment) return notFoundOrRedirect(routes.environment(slug));
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Ambientes", href: routes.environments() }, { label: environment.name }]}
        eyebrow="Ambiente"
        title={environment.name}
        description={environment.summary}
        imageUrl={environment.bannerUrl ?? environment.imageUrl}
      />
      <Container className="py-10 sm:py-12">
        {environment.content ? (
          <div className="mb-12 max-w-3xl">
            <Markdown>{environment.content}</Markdown>
          </div>
        ) : null}
        <h2 className="font-display mb-6 text-2xl font-bold">Produtos para {environment.name.toLowerCase()}</h2>
        <CatalogView searchParams={await searchParams} basePath={routes.environment(slug)} locked={{ environment: slug }} />
      </Container>
    </>
  );
}

export default function EnvironmentPage(props: Props) {
  return (
    <Suspense
      fallback={
        <Container className="space-y-6 py-10">
          <Skeleton className="h-64 w-full" />
          <CatalogSkeleton />
        </Container>
      }
    >
      <EnvironmentContent {...props} />
    </Suspense>
  );
}
