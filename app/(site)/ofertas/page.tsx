import type { Metadata } from "next";
import { Suspense } from "react";
import { routes } from "@/lib/routes";
import { listingMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { CatalogSkeleton, CatalogView } from "@/features/catalog/catalog-view";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";

export async function generateMetadata({ searchParams }: PageProps<"/ofertas">): Promise<Metadata> {
  return listingMetadata(routes.offers(), await searchParams, {
    title: "Ofertas em materiais de construção",
    description:
      "Ofertas da Cerigatto em pisos, tintas, ferramentas, elétrica e hidráulica em Bauru/SP. Consulte condições e disponibilidade pelo WhatsApp.",
  });
}

async function Results({ searchParams }: { searchParams: PageProps<"/ofertas">["searchParams"] }) {
  return (
    <CatalogView
      searchParams={await searchParams}
      basePath={routes.offers()}
      locked={{ onSale: true }}
      emptyAction={<WhatsAppLink origin="offers_empty">Perguntar sobre condições especiais</WhatsAppLink>}
    />
  );
}

export default function OffersPage({ searchParams }: PageProps<"/ofertas">) {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Ofertas" }]}
        eyebrow="Por tempo limitado"
        title="Ofertas da Cerigatto"
        description="Condições especiais válidas pelo período indicado em cada produto. Confirme disponibilidade e valores com a nossa equipe."
      />
      <Container className="py-8 sm:py-10">
        <Suspense fallback={<CatalogSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}
