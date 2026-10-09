import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFoundOrRedirect } from "@/lib/redirects";
import { routes } from "@/lib/routes";
import { listingMetadata, metaDescription } from "@/lib/seo";
import { getBrandBySlug, getBrands } from "@/services/catalog";
import { Container, Skeleton } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { TrackView } from "@/features/analytics/track-view";
import { CatalogSkeleton, CatalogView } from "@/features/catalog/catalog-view";

type Props = PageProps<"/marca/[slug]">;

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.length ? brands.map((b) => ({ slug: b.slug })) : [{ slug: "__sem-marcas__" }];
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Marca não encontrada", robots: { index: false } };
  return listingMetadata(routes.brand(slug), await searchParams, {
    title: brand.seoTitle ?? `Produtos ${brand.name}`,
    description: metaDescription(brand.seoDescription, `Produtos ${brand.name} no catálogo da Cerigatto Materiais de Construção, em Bauru/SP.`),
    image: brand.bannerUrl ?? brand.logoUrl,
  });
}

async function BrandContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return notFoundOrRedirect(routes.brand(slug));
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Marcas", href: routes.brands() }, { label: brand.name }]}
        eyebrow="Marca"
        title={brand.name}
        description={brand.description}
        imageUrl={brand.bannerUrl}
      >
        {brand.websiteUrl ? (
          <a
            href={brand.websiteUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          >
            Site do fabricante <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </PageHeader>
      <Container className="py-8 sm:py-10">
        <CatalogView searchParams={await searchParams} basePath={routes.brand(slug)} locked={{ brand: slug }} />
      </Container>
      <TrackView event="brand_view" brandId={brand.id} />
    </>
  );
}

export default function BrandPage(props: Props) {
  return (
    <Suspense
      fallback={
        <Container className="space-y-6 py-10">
          <Skeleton className="h-12 w-72" />
          <CatalogSkeleton />
        </Container>
      }
    >
      <BrandContent {...props} />
    </Suspense>
  );
}
