import Link from "next/link";
import type { Collection } from "@/types/catalog";
import { routes } from "@/lib/routes";
import { getBrands, getCategoryTree, getHomeCollections } from "@/services/catalog";
import { getBanners, getBlogPosts, getEnvironments } from "@/services/content";
import { getSiteConfig } from "@/services/settings";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { ProductRail } from "@/components/product/product-rail";
import { Hero } from "@/features/home/hero";
import {
  BrandStrip,
  CategoryMosaic,
  DepartmentShortcuts,
  EnvironmentsShowcase,
  HowItWorks,
  PopularCategories,
  PromoBand,
  TipsSection,
  VisitSection,
} from "@/features/home/sections";

const COLLECTION_LINKS: Record<string, { href: string; label: string }> = {
  on_sale: { href: routes.offers(), label: "Ver todas as ofertas" },
  new: { href: `${routes.products()}?novidades=1`, label: "Ver novidades" },
};

const COLLECTION_EYEBROW: Record<string, string> = {
  featured: "Seleção",
  on_sale: "Ofertas",
  most_viewed: "Em alta",
  new: "Novidades",
  recommended: "Recomendados",
  manual: "Vitrine",
};

function CollectionSection({ collection, className }: { collection: Collection | undefined; className?: string }) {
  if (!collection || collection.products.length === 0) return null;
  const link = COLLECTION_LINKS[collection.source] ?? { href: routes.products(), label: "Ver catálogo" };
  return (
    <Section className={className}>
      <Container>
        <SectionHeading
          eyebrow={COLLECTION_EYEBROW[collection.source] ?? "Vitrine"}
          title={collection.title}
          description={collection.subtitle}
          action={
            <Link href={link.href} className={buttonVariants({ variant: "outline" })}>
              {link.label}
            </Link>
          }
        />
        <ProductRail products={collection.products} label={collection.title} />
      </Container>
    </Section>
  );
}

export default async function HomePage() {
  const [config, tree, collections, heroBanners, middleBanners, specialistBanners, environments, brands, posts] =
    await Promise.all([
      getSiteConfig(),
      getCategoryTree(),
      getHomeCollections(),
      getBanners("home_hero"),
      getBanners("home_middle"),
      getBanners("home_specialist"),
      getEnvironments(),
      getBrands(),
      getBlogPosts({ limit: 3 }),
    ]);

  const [first, second, ...others] = collections.filter((c) => c.products.length > 0);
  const featuredBrands = brands.filter((b) => b.isFeatured);

  return (
    <>
      <Hero banners={heroBanners} />
      <DepartmentShortcuts tree={tree.filter((c) => c.showInMenu)} />
      <CategoryMosaic tree={tree.filter((c) => c.isFeatured)} />
      <CollectionSection collection={first} className="pt-0 sm:pt-0 lg:pt-0" />
      <PromoBand banner={middleBanners[0]} />
      <CollectionSection collection={second} className="bg-surface-sunken" />
      <PopularCategories tree={tree} />
      {others.map((collection) => (
        <CollectionSection key={collection.id} collection={collection} />
      ))}
      <EnvironmentsShowcase environments={environments} />
      <BrandStrip brands={featuredBrands.length ? featuredBrands : brands} />
      <PromoBand banner={specialistBanners[0]} tone="light" />
      <HowItWorks />
      <TipsSection posts={posts.posts} />
      <VisitSection config={config} />
    </>
  );
}
