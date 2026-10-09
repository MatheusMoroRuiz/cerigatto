import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { QuoteListView } from "@/features/quote-list/quote-list-view";

export const metadata: Metadata = {
  title: "Minha Lista de Orçamento",
  description: "Monte sua lista de materiais e envie para a equipe da Cerigatto pelo WhatsApp.",
  robots: { index: false, follow: true },
};

export default function QuoteListPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Minha Lista de Orçamento" }]}
        eyebrow="Sem cadastro, sem pagamento on-line"
        title="Minha Lista de Orçamento"
        description="Revise os itens e quantidades e envie tudo de uma vez. Nossa equipe confirma disponibilidade, valores e entrega."
      />
      <Container className="py-8 sm:py-12">
        <QuoteListView />
      </Container>
    </>
  );
}
