import { Sofa } from "lucide-react";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/env";
import { routes } from "@/lib/routes";
import { getEnvironments } from "@/services/content";
import { EmptyState } from "@/components/ui/feedback";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { EnvironmentCard } from "@/features/home/sections";

export const metadata: Metadata = {
  title: "Ambientes e inspiração",
  description: "Ideias para banheiro, cozinha, sala, área externa e outros ambientes, com os materiais certos para cada reforma.",
  alternates: { canonical: absoluteUrl(routes.environments()) },
};

export default async function EnvironmentsPage() {
  const environments = await getEnvironments();
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Ambientes" }]}
        eyebrow="Inspiração"
        title="Ambientes"
        description="Escolha o cômodo e veja materiais e acabamentos que combinam com o seu projeto."
      />
      <Container className="py-10 sm:py-14">
        {environments.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {environments.map((env) => (
              <li key={env.id}>
                <EnvironmentCard environment={env} />
                {env.summary ? <p className="mt-3 text-sm text-muted-foreground">{env.summary}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Sofa} title="Nenhum ambiente publicado" description="Os ambientes aparecerão aqui quando forem cadastrados no painel." />
        )}
      </Container>
    </>
  );
}
