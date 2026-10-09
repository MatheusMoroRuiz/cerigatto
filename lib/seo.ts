import type { Metadata } from "next";
import { countActiveFilters, parseCatalogParams, type RawSearchParams } from "./catalog-params";
import { absoluteUrl } from "./env";
import { stripMarkdown, truncate } from "./text";

/** Descrição para meta tags: texto puro, até 160 caracteres */
export function metaDescription(...candidates: (string | null | undefined)[]): string | undefined {
  const text = candidates.find((c) => c && c.trim());
  return text ? truncate(stripMarkdown(text), 160) : undefined;
}

/**
 * Metadados de listagens: canônica sem filtros (mantém apenas a página) e
 * noindex quando há filtros/ordenação/busca — evita conteúdo duplicado.
 */
export function listingMetadata(
  path: string,
  searchParams: RawSearchParams,
  base: { title: string; description?: string; image?: string | null },
): Metadata {
  const filters = parseCatalogParams(searchParams);
  const page = filters.page ?? 1;
  const filtered = countActiveFilters(filters) > 0 || Boolean(filters.sort) || Boolean(filters.query);
  const canonical = absoluteUrl(page > 1 ? `${path}?pagina=${page}` : path);
  const title = page > 1 ? `${base.title} — página ${page}` : base.title;
  return {
    title,
    description: base.description,
    alternates: { canonical },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description: base.description,
      url: canonical,
      ...(base.image ? { images: [{ url: base.image }] } : {}),
    },
  };
}
