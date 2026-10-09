import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { absoluteUrl } from "@/lib/env";
import { buildProductSchema } from "@/lib/product-schema";
import { notFoundOrRedirect } from "@/lib/redirects";
import { routes } from "@/lib/routes";
import { metaDescription } from "@/lib/seo";
import {
  getCategoryTree,
  getPopularProductSlugs,
  getProductBySlug,
  getRelatedProducts,
  listProducts,
} from "@/services/catalog";
import { findNode } from "@/lib/category-tree";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container, Section, SectionHeading, Skeleton } from "@/components/ui/primitives";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductBadges } from "@/components/product/product-badges";
import { ProductRail } from "@/components/product/product-rail";
import { JsonLd } from "@/components/seo/json-ld";
import { TrackView } from "@/features/analytics/track-view";
import { ConsultPanel } from "@/features/product/consult-panel";
import { ProductDetails } from "@/features/product/product-details";
import { ProductGallery } from "@/features/product/product-gallery";
import { ShareButton } from "@/features/product/share-button";

type Props = PageProps<"/produto/[slug]">;

export async function generateStaticParams() {
  const slugs = await getPopularProductSlugs(24);
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__sem-produtos__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado", robots: { index: false } };
  const title = product.seoTitle ?? [product.name, product.brand?.name].filter(Boolean).join(" — ");
  const description = metaDescription(
    product.seoDescription,
    product.shortDescription,
    product.description,
    `${product.name} na Cerigatto Materiais de Construção, em Bauru/SP. Consulte disponibilidade pelo WhatsApp.`,
  );
  const image = product.ogImageUrl ?? product.images[0]?.url;
  const canonical = absoluteUrl(product.canonicalUrl ?? routes.product(product.slug));
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      ...(image ? { images: [{ url: image, alt: product.images[0]?.alt ?? product.name }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
  };
}

async function ProductContent({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return notFoundOrRedirect(routes.product(slug));

  const [related, sameBrand, tree] = await Promise.all([
    getRelatedProducts(product.id, 8),
    product.brand ? listProducts({ brands: [product.brand.slug], perPage: 9 }) : Promise.resolve(null),
    getCategoryTree(),
  ]);
  const brandProducts = (sameBrand?.products ?? []).filter((p) => p.id !== product.id).slice(0, 8);
  const parentSlug = product.categoryPath.at(-2)?.slug;
  const siblingCategories = parentSlug ? (findNode(tree, parentSlug)?.children ?? []) : [];
  const productUrl = absoluteUrl(routes.product(product.slug));

  return (
    <>
      <Container className="pt-6 pb-10 sm:pt-8">
        <Breadcrumbs
          items={[
            ...product.categoryPath.map((c) => ({ label: c.name, href: routes.category(c.slug) })),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <ProductBadges product={product} className="mb-3 flex flex-wrap gap-1.5" />
              {product.brand ? (
                <Link
                  href={routes.brand(product.brand.slug)}
                  className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase hover:text-primary"
                >
                  {product.brand.name}
                </Link>
              ) : null}
              <h1 className="font-display mt-2 text-[1.75rem] leading-tight font-bold text-balance sm:text-4xl">{product.name}</h1>
              {product.sku ? (
                <p className="mt-2 font-mono text-sm text-muted-foreground">Código: {product.sku}</p>
              ) : null}
              {product.shortDescription ? (
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{product.shortDescription}</p>
              ) : null}
            </div>

            <div className="rounded-xl border bg-surface p-5 sm:p-6">
              <ConsultPanel
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  brand: product.brand?.name ?? null,
                  imageUrl: product.images[0]?.url ?? null,
                  categoryId: product.category?.id ?? null,
                  price: product.price,
                  sale: product.sale,
                  availability: product.availability,
                  variants: product.variants,
                  ctaLabel: product.ctaLabel,
                  whatsappNumber: product.whatsappNumber,
                  categoryWhatsappNumber: product.categoryWhatsappNumber,
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FavoriteButton productId={product.id} productName={product.name} withLabel />
              <ShareButton url={productUrl} title={product.name} productId={product.id} />
            </div>

            {product.tags.length ? (
              <ul className="flex flex-wrap gap-1.5" aria-label="Etiquetas">
                {product.tags.map((tag) => (
                  <li key={tag.slug}>
                    <Link
                      href={routes.search(tag.name)}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      #{tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Container>

      <div className="border-t bg-background">
        <Container className="py-12 sm:py-16">
          <ProductDetails product={product} />
        </Container>
      </div>

      {product.combinesWith.length ? (
        <Section className="bg-surface">
          <Container>
            <SectionHeading eyebrow="Complete a compra" title="Produtos que combinam" />
            <ProductRail products={product.combinesWith} label="Produtos que combinam" />
          </Container>
        </Section>
      ) : null}

      {related.length ? (
        <Section>
          <Container>
            <SectionHeading eyebrow="Você também pode precisar" title="Produtos relacionados" />
            <ProductRail products={related} label="Produtos relacionados" />
          </Container>
        </Section>
      ) : null}

      {brandProducts.length && product.brand ? (
        <Section className="bg-surface pt-0 sm:pt-0 lg:pt-0">
          <Container className="pt-12 sm:pt-16">
            <SectionHeading
              eyebrow="Mesma marca"
              title={`Mais de ${product.brand.name}`}
              action={
                <Link href={routes.brand(product.brand.slug)} className="text-sm font-semibold text-primary hover:underline">
                  Ver todos
                </Link>
              }
            />
            <ProductRail products={brandProducts} label={`Produtos ${product.brand.name}`} />
          </Container>
        </Section>
      ) : null}

      {siblingCategories.length > 1 ? (
        <Section className="py-10 sm:py-12">
          <Container>
            <h2 className="mb-4 text-sm font-semibold">Categorias relacionadas</h2>
            <ul className="flex flex-wrap gap-2">
              {siblingCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={routes.category(c.slug)}
                    className="inline-flex rounded-full border border-border-strong bg-surface px-4 py-2 text-sm font-medium hover:border-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* Espaço para a barra fixa de CTA no mobile */}
      <div aria-hidden="true" className="h-20 lg:hidden" />
      <JsonLd data={buildProductSchema(product)} />
      <TrackView event="product_view" productId={product.id} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <Container className="py-8">
      <Skeleton className="h-4 w-64" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </Container>
  );
}

export default function ProductPage(props: Props) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent {...props} />
    </Suspense>
  );
}
