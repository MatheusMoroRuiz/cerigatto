import "server-only";
/**
 * Fonte de dados de DEMONSTRAÇÃO (somente leitura, em memória).
 * Ativada apenas com CERIGATTO_DEMO_MODE=true e sem Supabase configurado.
 * Reproduz em JavaScript as regras das funções SQL do catálogo.
 */
import {
  demoBanners,
  demoBlogCategories,
  demoBrands,
  demoCategories,
  demoEnvironments,
  demoFaqs,
  demoId,
  demoPages,
  demoPosts,
  demoProducts,
  demoAttributes,
  unsplash,
  type DemoProduct,
} from "@/supabase/seed/demo-data";
import type {
  Availability,
  BannerPlacement,
  BlogPost,
  BlogPostSummary,
  Brand,
  CatalogFacets,
  CatalogFilters,
  CatalogPage,
  Category,
  Collection,
  Environment,
  ProductCard,
  ProductDetail,
} from "@/types/catalog";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { isSaleActive } from "@/lib/pricing";
import { slugify } from "@/lib/slug";
import { normalizeText } from "@/lib/text";
import { withActive } from "../mappers";
import { DEFAULT_SITE_CONFIG } from "../settings-defaults";
import type { DataSource, ProductSource, SitemapData } from "./types";

const DAY = 86_400_000;
const BASE_TIME = Date.parse("2026-10-01T12:00:00.000Z");

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = temp;
    }
  }
  return prev[b.length]!;
}

/** Pontua o quanto um texto corresponde à busca (0 = não corresponde) */
export function matchScore(query: string, haystack: string): number {
  const words = normalizeText(query).split(" ").filter(Boolean);
  if (words.length === 0) return 0;
  const tokens = normalizeText(haystack).split(" ");
  let score = 0;
  for (const word of words) {
    let best = 0;
    for (const token of tokens) {
      if (token === word) best = Math.max(best, 3);
      else if (token.startsWith(word)) best = Math.max(best, 2);
      else if (word.length >= 5 && Math.abs(token.length - word.length) <= 2 && levenshtein(word, token) <= 2)
        best = Math.max(best, 1);
    }
    if (best === 0) return 0;
    score += best;
  }
  return score;
}

const categories: Category[] = demoCategories.map((c, i) => ({
  id: demoId("category", i + 1),
  name: c.name,
  slug: c.slug,
  parentId: c.parent ? demoId("category", demoCategories.findIndex((p) => p.slug === c.parent) + 1) : null,
  description: c.description,
  imageUrl: c.photo ? unsplash(c.photo, 900) : null,
  bannerUrl: c.photo ? unsplash(c.photo, 2000) : null,
  icon: c.icon ?? null,
  seoTitle: null,
  seoDescription: null,
  seoContent: null,
  whatsappNumber: null,
  isFeatured: c.featured ?? false,
  showInMenu: true,
  sortOrder: i,
}));

const brands: Brand[] = demoBrands.map((b, i) => ({
  id: demoId("brand", i + 1),
  name: b.name,
  slug: b.slug,
  logoUrl: null,
  description: b.description,
  websiteUrl: null,
  bannerUrl: null,
  seoTitle: null,
  seoDescription: null,
  isFeatured: b.featured ?? false,
}));

const environments: Environment[] = demoEnvironments.map((e, i) => ({
  id: demoId("environment", i + 1),
  name: e.name,
  slug: e.slug,
  summary: e.summary,
  content: e.content,
  imageUrl: unsplash(e.photo, 1200),
  bannerUrl: unsplash(e.photo, 2000),
  seoTitle: null,
  seoDescription: null,
}));

function categoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug) ?? null;
}

function descendantIds(categoryId: string): Set<string> {
  const ids = new Set([categoryId]);
  let added = true;
  while (added) {
    added = false;
    for (const c of categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        added = true;
      }
    }
  }
  return ids;
}

type IndexedProduct = { source: DemoProduct; card: ProductCard; publishedAt: string; haystack: string };

const indexed: IndexedProduct[] = demoProducts.map((p, i) => {
  const brand = brands.find((b) => b.slug === p.brand) ?? null;
  const category = categoryBySlug(p.category);
  const parent = category?.parentId ? categories.find((c) => c.id === category.parentId) : null;
  const card: ProductCard = {
    id: demoId("product", i + 1),
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    shortDescription: p.short,
    brand: brand ? { id: brand.id, name: brand.name, slug: brand.slug, logoUrl: null } : null,
    category: category ? { id: category.id, name: category.name, slug: category.slug, parentId: category.parentId } : null,
    image: p.images[0] ? { url: unsplash(p.images[0].photo, 1400), alt: p.images[0].alt } : null,
    price: { display: p.priceDisplay, price: p.price ?? null, salePrice: p.salePrice ?? null, unit: p.unit },
    sale: withActive({
      isOnSale: p.onSale ?? false,
      startsAt: p.onSale ? new Date(BASE_TIME - DAY).toISOString() : null,
      endsAt: p.onSale && p.saleDays ? new Date(Date.now() + p.saleDays * DAY).toISOString() : null,
      label: p.saleLabel ?? null,
    }),
    isFeatured: p.featured ?? false,
    isNew: p.isNew ?? false,
    availability: p.availability ?? "available_on_request",
    ctaLabel: p.ctaLabel ?? null,
    whatsappNumber: null,
    hasRequiredVariants: (p.variants ?? []).some((v) => v.required !== false),
  };
  const haystack = [
    p.name,
    p.sku,
    brand?.name,
    category?.name,
    parent?.name,
    (p.tags ?? []).join(" "),
    p.short,
    (p.specs ?? []).map((s) => s.value).join(" "),
  ].join(" ");
  return { source: p, card, publishedAt: new Date(BASE_TIME - (demoProducts.length - i) * 2 * DAY).toISOString(), haystack };
});

function effectivePrice(card: ProductCard): number | null {
  if (card.price.display !== "show" || card.price.price == null) return null;
  return isSaleActive(card.sale) && card.price.salePrice != null ? card.price.salePrice : card.price.price;
}

function filterProducts(filters: CatalogFilters, ignore: { brands?: boolean; attributes?: boolean } = {}) {
  const category = filters.category ? categoryBySlug(filters.category) : null;
  if (filters.category && !category) return [];
  const allowed = category ? descendantIds(category.id) : null;

  return indexed
    .map((item) => ({ item, rank: filters.query ? matchScore(filters.query, item.haystack) : 0 }))
    .filter(({ item, rank }) => {
      const { source, card } = item;
      if (filters.query && rank === 0 && normalizeText(card.sku ?? "") !== normalizeText(filters.query)) return false;
      if (allowed && (!card.category || !allowed.has(card.category.id))) return false;
      if (!ignore.brands && filters.brands?.length && !filters.brands.includes(card.brand?.slug ?? "")) return false;
      if (filters.environment && !(source.environments ?? []).includes(filters.environment)) return false;
      if (filters.onSale && !isSaleActive(card.sale)) return false;
      if (filters.isNew && !card.isNew) return false;
      if (filters.availability?.length && !filters.availability.includes(card.availability)) return false;
      if (!ignore.attributes && filters.attributes) {
        for (const [attr, values] of Object.entries(filters.attributes)) {
          if (values.length === 0) continue;
          const productValues = (source.specs ?? []).filter((s) => s.attribute === attr).map((s) => slugify(s.value));
          if (!values.some((v) => productValues.includes(v))) return false;
        }
      }
      if (filters.priceMin != null || filters.priceMax != null) {
        const price = effectivePrice(card);
        if (price == null) return false;
        if (filters.priceMin != null && price < filters.priceMin) return false;
        if (filters.priceMax != null && price > filters.priceMax) return false;
      }
      return true;
    });
}

function sortResults(results: ReturnType<typeof filterProducts>, filters: CatalogFilters) {
  const sort = filters.sort ?? "relevance";
  return [...results].sort((a, b) => {
    switch (sort) {
      case "name_asc":
        return a.item.card.name.localeCompare(b.item.card.name, "pt-BR");
      case "name_desc":
        return b.item.card.name.localeCompare(a.item.card.name, "pt-BR");
      case "price_asc":
        return (effectivePrice(a.item.card) ?? Infinity) - (effectivePrice(b.item.card) ?? Infinity);
      case "price_desc":
        return (effectivePrice(b.item.card) ?? -Infinity) - (effectivePrice(a.item.card) ?? -Infinity);
      case "newest":
        return b.item.publishedAt.localeCompare(a.item.publishedAt);
      default:
        return (
          b.rank - a.rank ||
          Number(b.item.card.isFeatured) - Number(a.item.card.isFeatured) ||
          b.item.publishedAt.localeCompare(a.item.publishedAt)
        );
    }
  });
}

function countBy<T>(items: T[], key: (item: T) => { slug: string; label: string } | null) {
  const map = new Map<string, { slug: string; label: string; count: number }>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    const entry = map.get(k.slug) ?? { ...k, count: 0 };
    entry.count += 1;
    map.set(k.slug, entry);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

function toDetail(item: IndexedProduct): ProductDetail {
  const { source, card } = item;
  const index = demoProducts.indexOf(source);
  const path: ProductDetail["categoryPath"] = [];
  let current = card.category ? categories.find((c) => c.id === card.category!.id) : undefined;
  while (current) {
    path.unshift({ id: current.id, name: current.name, slug: current.slug, parentId: current.parentId });
    current = current.parentId ? categories.find((c) => c.id === current!.parentId) : undefined;
  }
  return {
    ...card,
    description: source.description,
    images: source.images.map((img) => ({ url: unsplash(img.photo, 1400), alt: img.alt })),
    variants: (source.variants ?? []).map((group, gi) => ({
      id: demoId("option", index * 10 + gi + 1),
      name: group.name,
      isRequired: group.required ?? true,
      values: group.values.map((v, vi) => ({
        id: demoId("variant", index * 100 + gi * 10 + vi + 1),
        label: v.label,
        sku: v.sku ?? null,
        price: v.price ?? null,
        salePrice: v.salePrice ?? null,
        availability: null,
      })),
    })),
    specifications: (source.specs ?? []).map((s) => {
      const attr = demoAttributes.find((a) => a.slug === s.attribute);
      return {
        label: attr?.name ?? s.attribute,
        value: s.value,
        unit: attr?.unit ?? null,
        group: attr?.group ?? "Especificações",
        attributeSlug: s.attribute,
      };
    }),
    tags: (source.tags ?? []).map((slug) => ({ slug, name: slug.replace(/-/g, " ") })),
    environments: (source.environments ?? []).flatMap((slug) => {
      const env = environments.find((e) => e.slug === slug);
      return env ? [{ name: env.name, slug: env.slug }] : [];
    }),
    categoryPath: path,
    manufacturer: source.manufacturer ?? null,
    model: source.model ?? null,
    dimensions: source.dimensions ?? null,
    weightKg: source.weightKg ?? null,
    warranty: source.warranty ?? null,
    packageContents: source.packageContents ?? null,
    notes: null,
    videoUrl: null,
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    ogImageUrl: null,
    publishedAt: item.publishedAt,
    updatedAt: item.publishedAt,
    faqs: [],
    combinesWith: [],
    categoryWhatsappNumber: null,
  };
}

const COMBINES: Record<string, string[]> = {
  "porcelanato-acetinado-calacata-90x90": ["argamassa-ac-iii-porcelanato-20kg", "rejunte-acrilico-cinza-platina-1kg"],
  "tinta-acrilica-premium-fosca-branco-neve": ["kit-rolo-de-la-23cm-com-bandeja", "trincha-cerdas-gris-2-polegadas"],
  "cuba-de-apoio-retangular-branca": ["misturador-monocomando-lavatorio-preto"],
  "cuba-inox-gourmet-60x40": ["torneira-gourmet-bica-movel"],
};

const posts: BlogPost[] = demoPosts.map((p, i) => ({
  id: demoId("post", i + 1),
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt,
  coverImageUrl: unsplash(p.photo, 1600),
  coverAlt: p.alt,
  category: demoBlogCategories.find((c) => c.slug === p.category) ?? null,
  publishedAt: new Date(BASE_TIME - p.daysAgo * DAY).toISOString(),
  readingMinutes: p.readingMinutes,
  authorName: "Equipe editorial (demonstração)",
  content: p.content,
  seoTitle: null,
  seoDescription: null,
  ogImageUrl: null,
  updatedAt: new Date(BASE_TIME - p.daysAgo * DAY).toISOString(),
  tags: [],
  products: (p.products ?? []).flatMap((slug) => indexed.filter((x) => x.source.slug === slug).map((x) => x.card)),
}));

function summary(post: BlogPost): BlogPostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    coverAlt: post.coverAlt,
    category: post.category,
    publishedAt: post.publishedAt,
    readingMinutes: post.readingMinutes,
    authorName: post.authorName,
  };
}

export class DemoSource implements DataSource {
  async getSiteConfig() {
    return {
      ...DEFAULT_SITE_CONFIG,
      site: { ...DEFAULT_SITE_CONFIG.site, demoNoticeEnabled: true },
    };
  }

  async getCategories() {
    return categories;
  }

  async getBrands() {
    return brands;
  }

  async listProducts(filters: CatalogFilters): Promise<CatalogPage> {
    const perPage = Math.min(Math.max(filters.perPage ?? PRODUCTS_PER_PAGE, 1), 96);
    const page = Math.max(filters.page ?? 1, 1);
    const results = sortResults(filterProducts(filters), filters);
    return {
      products: results.slice((page - 1) * perPage, page * perPage).map((r) => r.item.card),
      total: results.length,
      page,
      perPage,
      totalPages: Math.max(Math.ceil(results.length / perPage), 1),
    };
  }

  async getFacets(filters: CatalogFilters): Promise<CatalogFacets> {
    const base = filterProducts({ ...filters, priceMin: undefined, priceMax: undefined }).map((r) => r.item);
    const withoutBrand = filterProducts({ ...filters, priceMin: undefined, priceMax: undefined }, { brands: true }).map(
      (r) => r.item,
    );
    const withoutAttributes = filterProducts(
      { ...filters, priceMin: undefined, priceMax: undefined },
      { attributes: true },
    ).map((r) => r.item);

    const attributes = demoAttributes
      .filter((a) => a.filterable)
      .map((attr) => ({
        slug: attr.slug,
        name: attr.name,
        unit: attr.unit ?? null,
        values: countBy(
          withoutAttributes.flatMap((p) => (p.source.specs ?? []).filter((s) => s.attribute === attr.slug)),
          (s) => ({ slug: slugify(s.value), label: s.value }),
        ),
      }))
      .filter((a) => a.values.length > 0);

    const prices = base.map((p) => effectivePrice(p.card)).filter((v): v is number => v != null);
    const availability = new Map<Availability, number>();
    for (const p of base) availability.set(p.card.availability, (availability.get(p.card.availability) ?? 0) + 1);

    return {
      brands: countBy(withoutBrand, (p) => (p.card.brand ? { slug: p.card.brand.slug, label: p.card.brand.name } : null)),
      categories: countBy(base, (p) =>
        p.card.category ? { slug: p.card.category.slug, label: p.card.category.name } : null,
      ),
      attributes,
      availability: [...availability.entries()].map(([value, count]) => ({ value, count })),
      price: { min: prices.length ? Math.min(...prices) : null, max: prices.length ? Math.max(...prices) : null },
    };
  }

  async getProductBySlug(slug: string) {
    const item = indexed.find((p) => p.source.slug === slug);
    if (!item) return null;
    const detail = toDetail(item);
    detail.combinesWith = (COMBINES[slug] ?? []).flatMap((s) => indexed.filter((p) => p.source.slug === s).map((p) => p.card));
    return detail;
  }

  async getProductsByIds(ids: string[]) {
    return ids.flatMap((id) => indexed.filter((p) => p.card.id === id).map((p) => p.card));
  }

  async getProductsBySource(source: ProductSource, limit: number) {
    const predicate: Record<ProductSource, (p: IndexedProduct) => boolean> = {
      featured: (p) => p.card.isFeatured,
      on_sale: (p) => isSaleActive(p.card.sale),
      new: (p) => p.card.isNew,
      recommended: (p) => Boolean(p.source.recommended),
      most_viewed: (p) => Boolean(p.source.recommended),
    };
    return indexed.filter(predicate[source]).slice(0, limit).map((p) => p.card);
  }

  async getRelatedProducts(productId: string, limit: number) {
    const target = indexed.find((p) => p.card.id === productId);
    if (!target) return [];
    const targetCategory = categories.find((c) => c.id === target.card.category?.id);
    return indexed
      .filter((p) => p.card.id !== productId && p.card.availability !== "discontinued")
      .map((p) => {
        const category = categories.find((c) => c.id === p.card.category?.id);
        let score = 0;
        if (p.card.category?.id === target.card.category?.id) score += 4;
        if (targetCategory?.parentId && category?.parentId === targetCategory.parentId) score += 1;
        if (p.card.brand?.id === target.card.brand?.id) score += 2;
        score += (p.source.tags ?? []).filter((t) => (target.source.tags ?? []).includes(t)).length;
        score += (p.source.environments ?? []).filter((e) => (target.source.environments ?? []).includes(e)).length;
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.p.card.name.localeCompare(b.p.card.name))
      .slice(0, limit)
      .map((x) => x.p.card);
  }

  async getCollections(): Promise<Collection[]> {
    const defs: { slug: string; title: string; subtitle: string | null; source: ProductSource }[] = [
      { slug: "destaques", title: "Produtos em destaque", subtitle: "Seleção da equipe para quem está construindo ou reformando.", source: "featured" },
      { slug: "ofertas-home", title: "Ofertas da Cerigatto", subtitle: "Condições especiais por tempo limitado. Consulte disponibilidade.", source: "on_sale" },
      { slug: "mais-procurados", title: "Mais procurados", subtitle: "Os itens mais consultados no site e as recomendações da equipe.", source: "most_viewed" },
      { slug: "lancamentos", title: "Novidades no catálogo", subtitle: null, source: "new" },
    ];
    return Promise.all(
      defs.map(async (d, i) => ({
        id: demoId("collection", i + 1),
        slug: d.slug,
        title: d.title,
        subtitle: d.subtitle,
        source: d.source,
        products: await this.getProductsBySource(d.source, 8),
      })),
    );
  }

  async getBanners(placement: BannerPlacement) {
    return demoBanners
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => b.placement === placement)
      .map(({ b, i }) => ({
        id: demoId("banner", i + 1),
        placement: b.placement,
        desktopImageUrl: unsplash(b.photo, 2400),
        mobileImageUrl: unsplash(b.photo, 900).replace("fit=crop", "fit=crop&h=1200"),
        imageAlt: b.alt,
        eyebrow: b.eyebrow ?? null,
        title: b.title,
        subtitle: b.subtitle ?? null,
        buttonText: b.buttonText ?? null,
        buttonUrl: b.buttonUrl ?? null,
        textPosition: b.textPosition ?? "left",
        overlayOpacity: b.overlay ?? 40,
      }));
  }

  async getEnvironments() {
    return environments;
  }

  async getBlogPosts(options: { category?: string; limit: number; offset: number }) {
    const filtered = posts.filter((p) => !options.category || p.category?.slug === options.category);
    return { posts: filtered.slice(options.offset, options.offset + options.limit).map(summary), total: filtered.length };
  }

  async getBlogPostBySlug(slug: string) {
    return posts.find((p) => p.slug === slug) ?? null;
  }

  async getBlogCategories() {
    return demoBlogCategories;
  }

  async getPage(slug: string) {
    const page = demoPages.find((p) => p.slug === slug);
    return page
      ? { ...page, seoTitle: null, seoDescription: null, updatedAt: new Date(BASE_TIME).toISOString() }
      : null;
  }

  async getGeneralFaqs() {
    return demoFaqs.map((f, i) => ({ id: demoId("faq", i + 1), ...f }));
  }

  async searchSuggestions(query: string) {
    const results = sortResults(filterProducts({ query }), { query }).slice(0, 6);
    const term = normalizeText(query);
    return {
      products: results.map(({ item }) => ({
        id: item.card.id,
        name: item.card.name,
        slug: item.card.slug,
        sku: item.card.sku,
        brand: item.card.brand?.name ?? null,
        imageUrl: item.card.image?.url ?? null,
      })),
      categories: categories
        .filter((c) => term && (normalizeText(c.name).includes(term) || matchScore(query, c.name) > 0))
        .slice(0, 4)
        .map((c) => ({ name: c.name, slug: c.slug })),
      brands: brands
        .filter((b) => term && (normalizeText(b.name).includes(term) || matchScore(query, b.name) > 0))
        .slice(0, 4)
        .map((b) => ({ name: b.name, slug: b.slug })),
    };
  }

  async getRedirect() {
    return null;
  }

  async getSitemapData(): Promise<SitemapData> {
    const at = new Date(BASE_TIME).toISOString();
    return {
      products: indexed.map((p) => ({ slug: p.card.slug, updatedAt: p.publishedAt })),
      categories: categories.map((c) => ({ slug: c.slug, updatedAt: at })),
      brands: brands.map((b) => ({ slug: b.slug, updatedAt: at })),
      environments: environments.map((e) => ({ slug: e.slug, updatedAt: at })),
      posts: posts.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt })),
      pages: demoPages.map((p) => ({ slug: p.slug, updatedAt: at })),
    };
  }
}
