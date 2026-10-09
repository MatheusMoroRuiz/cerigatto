import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { FavoritesView } from "@/features/favorites/favorites-view";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Favoritos" }]}
        title="Seus favoritos"
        description="Produtos salvos neste navegador. Adicione-os à Lista de Orçamento quando quiser cotar."
      />
      <Container className="py-8 sm:py-12">
        <FavoritesView />
      </Container>
    </>
  );
}
