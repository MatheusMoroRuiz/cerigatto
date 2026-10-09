import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { parseCatalogParams } from "@/lib/catalog-params";
import { routes } from "@/lib/routes";
import { getSearchSuggestions, listProducts } from "@/services/catalog";
import { Container, Skeleton } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { TrackView } from "@/features/analytics/track-view";
import { CatalogSkeleton, CatalogView } from "@/features/catalog/catalog-view";
import { SearchBar } from "@/features/search/search-bar";

export const metadata: Metadata = {
  title: "Busca",
  robots: { index: false, follow: true },
};

async function SearchResults({ searchParams }: { searchParams: PageProps<"/busca">["searchParams"] }) {
  const params = await searchParams;
  const filters = parseCatalogParams(params);
  const query = filters.query;

  if (!query) {
    return (
      <>
        <PageHeader crumbs={[{ label: "Busca" }]} title="O que você procura?" description="Busque por nome do produto, marca ou código." />
        <Container className="py-10">
          <div className="max-w-2xl">
            <SearchBar autoFocus />
          </div>
        </Container>
      </>
    );
  }

  const [suggestions, total] = await Promise.all([
    getSearchSuggestions(query.toLowerCase()),
    listProducts({ ...filters, page: 1, perPage: 1 }).then((r) => r.total),
  ]);
  const related = [
    ...suggestions.categories.map((c) => ({ label: c.name, href: routes.category(c.slug), kind: "Categoria" })),
    ...suggestions.brands.map((b) => ({ label: b.name, href: routes.brand(b.slug), kind: "Marca" })),
  ];

  return (
    <>
      <PageHeader crumbs={[{ label: "Busca" }]} eyebrow="Resultados da busca" title={`“${query}”`}>
        {related.length ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Veja também:</span>
            {related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-border-strong bg-background px-3 py-1 text-sm font-medium hover:border-foreground"
              >
                <span className="text-muted-foreground">{item.kind}:</span> {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </PageHeader>
      <Container className="py-8 sm:py-10">
        <CatalogView searchParams={params} basePath={routes.search()} />
      </Container>
      {filters.page === 1 ? <TrackView event="search" query={query} resultsCount={total} /> : null}
    </>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/busca">) {
  return (
    <Suspense
      fallback={
        <Container className="space-y-6 py-10">
          <Skeleton className="h-12 w-80" />
          <CatalogSkeleton />
        </Container>
      }
    >
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}
