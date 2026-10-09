import type { Metadata } from "next";
import { Suspense } from "react";
import { listingMetadata } from "@/lib/seo";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { CatalogSkeleton, CatalogView } from "@/features/catalog/catalog-view";

export async function generateMetadata({ searchParams }: PageProps<"/produtos">): Promise<Metadata> {
  return listingMetadata(routes.products(), await searchParams, {
    title: "Produtos",
    description:
      "Catálogo completo de materiais de construção em Bauru/SP: pisos, tintas, elétrica, hidráulica, ferramentas e mais. Consulte disponibilidade pelo WhatsApp.",
  });
}

async function Results({ searchParams }: { searchParams: PageProps<"/produtos">["searchParams"] }) {
  return <CatalogView searchParams={await searchParams} basePath={routes.products()} />;
}

export default function ProductsPage({ searchParams }: PageProps<"/produtos">) {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Produtos" }]}
        eyebrow="Catálogo"
        title="Todos os produtos"
        description="Filtre por departamento, marca e características. Encontrou? Consulte disponibilidade direto no WhatsApp."
      />
      <Container className="py-8 sm:py-10">
        <Suspense fallback={<CatalogSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}
