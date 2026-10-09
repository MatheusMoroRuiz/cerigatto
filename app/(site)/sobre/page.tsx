import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/env";
import { routes } from "@/lib/routes";
import { getPage } from "@/services/content";
import { getSiteConfig } from "@/services/settings";
import { buttonVariants } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { Container, Heading, Section, Tape } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { VisitSection } from "@/features/home/sections";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";

export async function generateMetadata(): Promise<Metadata> {
  const [{ business, site }, page] = await Promise.all([getSiteConfig(), getPage("sobre")]);
  return {
    title: page?.seoTitle ?? business.aboutTitle ?? "Sobre a Cerigatto",
    description:
      page?.seoDescription ??
      business.aboutSummary ??
      `${site.siteName}: materiais de construção, acabamento e ferramentas em ${business.city}/${business.state}.`,
    alternates: { canonical: absoluteUrl(routes.about()) },
  };
}

/** Exibe SOMENTE informações cadastradas no painel — nada é inventado. */
export default async function AboutPage() {
  const [config, page] = await Promise.all([getSiteConfig(), getPage("sobre")]);
  const { business, site } = config;
  const blocks = [
    business.history ? { title: "Nossa história", text: business.history } : null,
    business.mission ? { title: "Missão", text: business.mission } : null,
    business.valuesText ? { title: "Valores", text: business.valuesText } : null,
  ].filter((b): b is { title: string; text: string } => b !== null);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Sobre a Cerigatto" }]}
        eyebrow={`${business.city}/${business.state}`}
        title={business.aboutTitle ?? page?.title ?? site.siteName}
        description={business.aboutSummary ?? page?.summary ?? site.description}
      />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-10">
            {page?.content ? <Markdown>{page.content}</Markdown> : null}
            {blocks.map((block) => (
              <section key={block.title}>
                <Tape thin className="mb-4 w-12" />
                <Heading size="sm" className="mb-3">
                  {block.title}
                </Heading>
                <Markdown>{block.text}</Markdown>
              </section>
            ))}
            {!page?.content && blocks.length === 0 ? (
              <div className="max-w-2xl space-y-4 text-lg leading-relaxed">
                <p>
                  A {site.siteName} reúne em um catálogo digital materiais para construção, reforma e acabamento, com
                  atendimento direto pela nossa equipe em {business.city}/{business.state}.
                </p>
                <p className="text-muted-foreground">
                  Navegue pelos departamentos, monte sua Lista de Orçamento e fale com a gente pelo WhatsApp para
                  confirmar disponibilidade, valores e entrega.
                </p>
              </div>
            ) : null}
          </div>
          <aside className="h-fit rounded-xl border bg-surface p-6">
            {business.foundedYear ? (
              <p className="mb-6">
                <span className="font-display block text-5xl font-bold">{business.foundedYear}</span>
                <span className="text-sm text-muted-foreground">ano de fundação</span>
              </p>
            ) : null}
            <p className="font-display text-lg font-bold">Precisa de ajuda com a sua obra?</p>
            <p className="mt-2 text-sm text-muted-foreground">Fale com um especialista ou explore o catálogo.</p>
            <div className="mt-5 flex flex-col gap-2">
              <WhatsAppLink origin="about">Falar no WhatsApp</WhatsAppLink>
              <Link href={routes.products()} className={buttonVariants({ variant: "outline" })}>
                Ver produtos
              </Link>
            </div>
          </aside>
        </Container>
      </Section>
      <VisitSection config={config} />
    </>
  );
}
