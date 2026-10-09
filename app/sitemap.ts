import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/env";
import { routes } from "@/lib/routes";
import { getSitemapData } from "@/services/content";

/** Sitemap dinâmico: somente conteúdo publicado/ativo (o RLS já filtra rascunhos) */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData();
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl(routes.products()), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl(routes.offers()), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl(routes.brands()), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl(routes.environments()), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl(routes.blog()), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl(routes.about()), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl(routes.contact()), changeFrequency: "monthly", priority: 0.5 },
  ];
  const entry = (path: string, updatedAt: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: updatedAt,
    priority,
  });
  return [
    ...staticPages,
    ...data.categories.map((c) => entry(routes.category(c.slug), c.updatedAt, 0.8)),
    ...data.products.map((p) => entry(routes.product(p.slug), p.updatedAt, 0.7)),
    ...data.brands.map((b) => entry(routes.brand(b.slug), b.updatedAt, 0.5)),
    ...data.environments.map((e) => entry(routes.environment(e.slug), e.updatedAt, 0.5)),
    ...data.posts.map((p) => entry(routes.blogPost(p.slug), p.updatedAt, 0.6)),
    ...data.pages.filter((p) => p.slug !== "sobre").map((p) => entry(`/${p.slug}`, p.updatedAt, 0.2)),
  ];
}
