import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { getPage } from "@/services/content";
import { Markdown } from "@/components/ui/markdown";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";

export async function legalPageMetadata(slug: string, path: string): Promise<Metadata> {
  const page = await getPage(slug);
  return {
    title: page?.seoTitle ?? page?.title ?? "Página",
    description: page?.seoDescription ?? page?.summary ?? undefined,
    alternates: { canonical: absoluteUrl(path) },
  };
}

/** Página institucional editável pelo painel (Conteúdo → Páginas) */
export async function LegalPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <>
      <PageHeader crumbs={[{ label: page.title }]} title={page.title} description={page.summary} />
      <Container className="max-w-3xl py-12">
        {page.content ? <Markdown>{page.content}</Markdown> : null}
        <p className="mt-12 border-t pt-6 text-sm text-muted-foreground">Última atualização: {formatDate(page.updatedAt)}</p>
      </Container>
    </>
  );
}
