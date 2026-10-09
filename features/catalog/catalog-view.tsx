import { PackageSearch } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CatalogFilters } from "@/types/catalog";
import { buildCatalogHref, countActiveFilters, parseCatalogParams, type RawSearchParams } from "@/lib/catalog-params";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/env";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getFacets, listProducts } from "@/services/catalog";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/primitives";
import { ProductGrid } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";
import { MobileFilters, SortSelect } from "./catalog-controls";
import { ActiveFilters, FilterPanel, type LockedFilters } from "./filter-panel";

/**
 * Listagem do catálogo reutilizada por /produtos, /categoria, /marca,
 * /ofertas, /busca e /ambientes. Filtros "travados" vêm da própria página.
 */
export async function CatalogView({
  searchParams,
  basePath,
  locked = {},
  subcategories,
  header,
  emptyAction,
}: {
  searchParams: RawSearchParams;
  basePath: string;
  locked?: LockedFilters;
  subcategories?: { name: string; slug: string; href: string }[];
  header?: ReactNode;
  emptyAction?: ReactNode;
}) {
  const parsed = parseCatalogParams(searchParams, PRODUCTS_PER_PAGE);
  const filters: CatalogFilters = {
    ...parsed,
    category: locked.category ?? parsed.category,
    brands: locked.brand ? [locked.brand] : parsed.brands,
    onSale: locked.onSale ?? parsed.onSale,
    environment: locked.environment ?? parsed.environment,
  };

  const [page, facets] = await Promise.all([listProducts(filters), getFacets(filters)]);
  const activeCount = countActiveFilters(filters, { category: locked.category, onSale: locked.onSale });

  const panel = (
    <FilterPanel
      facets={facets}
      filters={filters}
      current={searchParams}
      basePath={basePath}
      locked={locked}
      subcategories={subcategories}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] xl:gap-12">
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+5rem)] max-h-[calc(100dvh-10rem)] overflow-y-auto pr-2">
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        {header}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <strong className="font-semibold text-foreground">{formatNumber(page.total)}</strong>{" "}
            {page.total === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
          <div className="flex items-center gap-2">
            <MobileFilters activeCount={activeCount} resultCount={page.total}>
              {panel}
            </MobileFilters>
            <SortSelect value={filters.sort ?? "relevance"} hasQuery={Boolean(filters.query)} />
          </div>
        </div>
        <div className="mb-5">
          <ActiveFilters facets={facets} filters={filters} current={searchParams} basePath={basePath} locked={locked} />
        </div>

        {page.products.length ? (
          <>
            <ProductGrid products={page.products} priorityCount={4} className="xl:grid-cols-3 2xl:grid-cols-4" />
            <Pagination
              className="mt-10"
              page={page.page}
              totalPages={page.totalPages}
              buildHref={(n) => buildCatalogHref(basePath, searchParams, { pagina: n > 1 ? String(n) : null })}
            />
            <JsonLd
              data={{
                "@context": "https://schema.org",
                "@type": "ItemList",
                numberOfItems: page.products.length,
                itemListElement: page.products.map((p, i) => ({
                  "@type": "ListItem",
                  position: (page.page - 1) * page.perPage + i + 1,
                  url: absoluteUrl(routes.product(p.slug)),
                  name: p.name,
                })),
              }}
            />
          </>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="Nenhum produto encontrado"
            description={
              activeCount > 0
                ? "Tente remover alguns filtros. Se preferir, fale com a nossa equipe: muitos itens são vendidos sob encomenda."
                : "Não encontrou o que procurava? Nossa equipe pode verificar o produto para você."
            }
            action={
              emptyAction ?? (
                <div className="flex flex-wrap justify-center gap-3">
                  {activeCount > 0 ? (
                    <Link href={buildCatalogHref(basePath, {}, { q: filters.query ?? null })} className={buttonVariants({ variant: "outline" })}>
                      Limpar filtros
                    </Link>
                  ) : null}
                  <WhatsAppLink
                    origin="empty_catalog"
                    message={
                      filters.query
                        ? `Olá! Procurei por "${filters.query}" no site da Cerigatto e não encontrei. Vocês trabalham com esse produto?`
                        : undefined
                    }
                  >
                    Perguntar no WhatsApp
                  </WhatsAppLink>
                </div>
              )
            }
          />
        )}
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] xl:gap-12">
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      <div>
        <Skeleton className="mb-6 h-10 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-lg border bg-surface p-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
