import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { absoluteUrl } from "@/lib/env";
import { formatLongDate } from "@/lib/format";
import { notFoundOrRedirect } from "@/lib/redirects";
import { routes } from "@/lib/routes";
import { metaDescription } from "@/lib/seo";
import { getBlogPostBySlug, getBlogPosts } from "@/services/content";
import { getSiteConfig } from "@/services/settings";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Markdown } from "@/components/ui/markdown";
import { Container, Section, SectionHeading, Skeleton, Tape } from "@/components/ui/primitives";
import { ProductRail } from "@/components/product/product-rail";
import { JsonLd } from "@/components/seo/json-ld";
import { PostCard } from "@/features/home/sections";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";

type Props = PageProps<"/dicas/[slug]">;

export async function generateStaticParams() {
  const { posts } = await getBlogPosts({ limit: 30 });
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__sem-dicas__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Conteúdo não encontrado", robots: { index: false } };
  const description = metaDescription(post.seoDescription, post.excerpt, post.content);
  const image = post.ogImageUrl ?? post.coverImageUrl;
  return {
    title: post.seoTitle ?? post.title,
    description,
    alternates: { canonical: absoluteUrl(routes.blogPost(slug)) },
    openGraph: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description,
      url: absoluteUrl(routes.blogPost(slug)),
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

async function PostContent({ params }: Props) {
  const { slug } = await params;
  const [post, config, latest] = await Promise.all([getBlogPostBySlug(slug), getSiteConfig(), getBlogPosts({ limit: 4 })]);
  if (!post) return notFoundOrRedirect(routes.blogPost(slug));
  const more = latest.posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article>
        <Container className="max-w-4xl pt-8 pb-10">
          <Breadcrumbs
            items={[
              { label: "Dicas", href: routes.blog() },
              ...(post.category ? [{ label: post.category.name, href: routes.blogCategory(post.category.slug) }] : []),
              { label: post.title },
            ]}
          />
          <header className="mt-8">
            <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
              {[post.category?.name, post.publishedAt ? formatLongDate(post.publishedAt) : null, post.readingMinutes ? `${post.readingMinutes} min de leitura` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1 className="font-display mt-4 text-3xl leading-[1.1] font-bold text-balance sm:text-5xl">{post.title}</h1>
            {post.excerpt ? <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p> : null}
            {post.authorName ? <p className="mt-4 text-sm">Por {post.authorName}</p> : null}
          </header>
        </Container>
        {post.coverImageUrl ? (
          <Container className="max-w-6xl">
            <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-muted">
              <Image src={post.coverImageUrl} alt={post.coverAlt ?? ""} fill priority sizes="(min-width: 1200px) 1150px, 100vw" className="object-cover" />
            </div>
          </Container>
        ) : null}
        <Container className="max-w-3xl py-12">
          <Markdown className="text-[1.05rem]">{post.content}</Markdown>
          {post.tags.length ? (
            <ul className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <li key={t.slug} className="rounded-full bg-muted px-3 py-1 text-xs">
                  #{t.name}
                </li>
              ))}
            </ul>
          ) : null}
          <aside className="mt-12 overflow-hidden rounded-xl border bg-surface">
            <Tape thin />
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-bold">Ficou com dúvida sobre o material?</p>
                <p className="text-sm text-muted-foreground">Nossa equipe ajuda a escolher e calcular quantidades.</p>
              </div>
              <WhatsAppLink origin="blog_post" message={`Olá! Li a dica "${post.title}" no site da Cerigatto e gostaria de ajuda.`}>
                Falar com especialista
              </WhatsAppLink>
            </div>
          </aside>
        </Container>
      </article>

      {post.products.length ? (
        <Section className="bg-surface">
          <Container>
            <SectionHeading eyebrow="Citados neste conteúdo" title="Produtos para esta etapa" />
            <ProductRail products={post.products} label="Produtos citados" />
          </Container>
        </Section>
      ) : null}

      {more.length ? (
        <Section>
          <Container>
            <SectionHeading
              title="Mais dicas"
              action={
                <Link href={routes.blog()} className="text-sm font-semibold text-primary hover:underline">
                  Ver todas
                </Link>
              }
            />
            <ul className="grid gap-6 md:grid-cols-3">
              {more.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
          datePublished: post.publishedAt ?? undefined,
          dateModified: post.updatedAt,
          author: post.authorName ? { "@type": "Organization", name: post.authorName } : undefined,
          publisher: { "@type": "Organization", name: config.site.siteName, ...(config.site.logoUrl ? { logo: config.site.logoUrl } : {}) },
          mainEntityOfPage: absoluteUrl(routes.blogPost(post.slug)),
        }}
      />
    </>
  );
}

export default function BlogPostPage(props: Props) {
  return (
    <Suspense
      fallback={
        <Container className="max-w-3xl space-y-5 py-12">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-72 w-full" />
        </Container>
      }
    >
      <PostContent {...props} />
    </Suspense>
  );
}
