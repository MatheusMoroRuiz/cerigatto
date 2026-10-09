import "server-only";
import { createPublicSupabase, type PublicSupabase } from "@/lib/supabase/public";
import type {
  Availability,
  BannerPlacement,
  BlogPost,
  BlogPostSummary,
  CatalogFacets,
  CatalogFilters,
  CatalogPage,
  Collection,
  ProductCard,
  ProductDetail,
  SearchSuggestions,
} from "@/types/catalog";
import type { Json } from "@/types/database.types";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import {
  mapBanner,
  mapBrand,
  mapCategory,
  mapEnvironment,
  mapImage,
  mapProductCard,
  mapSiteConfig,
  PRODUCT_CARD_SELECT,
  sortImages,
  type ProductCardRow,
} from "../mappers";
import type { DataSource, ProductSource, SitemapData } from "./types";

const PRODUCT_DETAIL_SELECT = `
  ${PRODUCT_CARD_SELECT},
  description, manufacturer, model, dimensions, weight_kg, warranty, package_contents, notes,
  video_url, seo_title, seo_description, canonical_url, og_image_url, published_at, updated_at,
  option_groups:product_variant_options(id, name, is_required, sort_order,
    variants:product_variants(id, label, sku, price, sale_price, availability, sort_order, is_active)),
  specifications:product_specifications(label, value, sort_order,
    attribute:attributes(name, slug, unit, group_name, sort_order)),
  tags:product_tags(tag:tags(name, slug)),
  environments:product_environments(environment:environments(name, slug)),
  faqs(id, question, answer, sort_order, is_active),
  relations:product_relations!product_relations_product_id_fkey(relation_type, sort_order,
    related:products!product_relations_related_product_id_fkey(${PRODUCT_CARD_SELECT}))
` as const;

const POST_SUMMARY_SELECT = `
  id, title, slug, excerpt, cover_image_url, cover_alt, published_at, reading_minutes, author_name,
  category:blog_categories(name, slug)
` as const;

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`[supabase] ${context}: ${error?.message ?? "erro desconhecido"}`);
}

function catalogArgs(filters: CatalogFilters) {
  return {
    p_query: filters.query?.trim() || undefined,
    p_category_slug: filters.category || undefined,
    p_brand_slugs: filters.brands?.length ? filters.brands : undefined,
    p_environment_slug: filters.environment || undefined,
    p_on_sale: filters.onSale ?? false,
    p_is_new: filters.isNew ?? false,
    p_availability: filters.availability?.length ? filters.availability : undefined,
    p_attributes: (filters.attributes && Object.keys(filters.attributes).length
      ? filters.attributes
      : {}) as Json,
  };
}

type PostSummaryRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_alt: string | null;
  published_at: string | null;
  reading_minutes: number | null;
  author_name: string | null;
  category: { name: string; slug: string } | null;
};

function mapPostSummary(row: PostSummaryRow): BlogPostSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    coverAlt: row.cover_alt,
    category: row.category,
    publishedAt: row.published_at,
    readingMinutes: row.reading_minutes,
    authorName: row.author_name,
  };
}

export class SupabaseSource implements DataSource {
  private readonly db: PublicSupabase;

  constructor() {
    this.db = createPublicSupabase();
  }

  async getSiteConfig() {
    const [site, business, hours, social, whatsapp, seo] = await Promise.all([
      this.db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      this.db.from("business_information").select("*").eq("id", 1).maybeSingle(),
      this.db.from("business_hours").select("*"),
      this.db.from("social_links").select("*"),
      this.db.from("whatsapp_settings").select("*").eq("id", 1).maybeSingle(),
      this.db.from("seo_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (site.error) fail("site_settings", site.error);
    return mapSiteConfig({
      site: site.data,
      business: business.data,
      hours: hours.data ?? [],
      social: social.data ?? [],
      whatsapp: whatsapp.data,
      seo: seo.data,
    });
  }

  async getCategories() {
    const { data, error } = await this.db
      .from("categories")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order")
      .order("name");
    if (error) fail("categories", error);
    return data.map(mapCategory);
  }

  async getBrands() {
    const { data, error } = await this.db
      .from("brands")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order")
      .order("name");
    if (error) fail("brands", error);
    return data.map(mapBrand);
  }

  async listProducts(filters: CatalogFilters): Promise<CatalogPage> {
    const perPage = Math.min(Math.max(filters.perPage ?? PRODUCTS_PER_PAGE, 1), 96);
    const page = Math.max(filters.page ?? 1, 1);
    const args = catalogArgs(filters);
    const priceArgs = { p_price_min: filters.priceMin, p_price_max: filters.priceMax };

    const [rows, count] = await Promise.all([
      this.db
        .rpc("catalog_products", {
          ...args,
          ...priceArgs,
          p_sort: filters.sort ?? (filters.query ? "relevance" : "relevance"),
          p_limit: perPage,
          p_offset: (page - 1) * perPage,
        })
        .select(PRODUCT_CARD_SELECT),
      this.db.rpc("catalog_count", { ...args, ...priceArgs }),
    ]);
    if (rows.error) fail("catalog_products", rows.error);
    if (count.error) fail("catalog_count", count.error);

    const total = Number(count.data ?? 0);
    return {
      products: (rows.data as unknown as ProductCardRow[]).map(mapProductCard),
      total,
      page,
      perPage,
      totalPages: Math.max(Math.ceil(total / perPage), 1),
    };
  }

  async getFacets(filters: CatalogFilters): Promise<CatalogFacets> {
    const { data, error } = await this.db.rpc("catalog_facets", catalogArgs(filters));
    if (error) fail("catalog_facets", error);
    const raw = (data ?? {}) as {
      brands?: { slug: string; name: string; count: number }[];
      categories?: { slug: string; name: string; count: number }[];
      attributes?: {
        slug: string;
        name: string;
        unit: string | null;
        values: { slug: string; label: string; count: number }[];
      }[];
      availability?: { value: Availability; count: number }[];
      price?: { min: number | null; max: number | null } | null;
    };
    return {
      brands: (raw.brands ?? []).map((b) => ({ slug: b.slug, label: b.name, count: b.count })),
      categories: (raw.categories ?? []).map((c) => ({ slug: c.slug, label: c.name, count: c.count })),
      attributes: raw.attributes ?? [],
      availability: raw.availability ?? [],
      price: raw.price ?? { min: null, max: null },
    };
  }

  async getProductBySlug(slug: string): Promise<ProductDetail | null> {
    const { data, error } = await this.db
      .from("products")
      .select(PRODUCT_DETAIL_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) fail("product", error);
    if (!data) return null;

    const card = mapProductCard(data as unknown as ProductCardRow);
    const images = sortImages(data.images ?? []).map((img) => mapImage(img, data.name, data.brand?.name));
    const relations = (data.relations ?? [])
      .filter((r) => r.relation_type === "combines" && r.related)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => mapProductCard(r.related as unknown as ProductCardRow));

    return {
      ...card,
      description: data.description,
      images,
      variants: (data.option_groups ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((option) => ({
          id: option.id,
          name: option.name,
          isRequired: option.is_required,
          values: (option.variants ?? [])
            .filter((v) => v.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((v) => ({
              id: v.id,
              label: v.label,
              sku: v.sku,
              price: v.price,
              salePrice: v.sale_price,
              availability: v.availability,
            })),
        }))
        .filter((group) => group.values.length > 0),
      specifications: (data.specifications ?? [])
        .sort(
          (a, b) =>
            (a.attribute?.sort_order ?? 999) - (b.attribute?.sort_order ?? 999) || a.sort_order - b.sort_order,
        )
        .map((s) => ({
          label: s.attribute?.name ?? s.label ?? "",
          value: s.value,
          unit: s.attribute?.unit ?? null,
          group: s.attribute?.group_name ?? "Especificações",
          attributeSlug: s.attribute?.slug ?? null,
        })),
      tags: (data.tags ?? []).flatMap((t) => (t.tag ? [t.tag] : [])),
      environments: (data.environments ?? []).flatMap((e) => (e.environment ? [e.environment] : [])),
      categoryPath: [],
      manufacturer: data.manufacturer,
      model: data.model,
      dimensions: data.dimensions,
      weightKg: data.weight_kg,
      warranty: data.warranty,
      packageContents: data.package_contents,
      notes: data.notes,
      videoUrl: data.video_url,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      canonicalUrl: data.canonical_url,
      ogImageUrl: data.og_image_url,
      publishedAt: data.published_at,
      updatedAt: data.updated_at,
      faqs: (data.faqs ?? [])
        .filter((f) => f.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
      combinesWith: relations,
      categoryWhatsappNumber: null,
    };
  }

  async getProductsByIds(ids: string[]): Promise<ProductCard[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.db
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .in("id", ids.slice(0, 100))
      .eq("status", "published")
      .is("deleted_at", null);
    if (error) fail("products by ids", error);
    const byId = new Map((data as unknown as ProductCardRow[]).map((row) => [row.id, mapProductCard(row)]));
    return ids.flatMap((id) => {
      const product = byId.get(id);
      return product ? [product] : [];
    });
  }

  async getProductsBySource(source: ProductSource, limit: number): Promise<ProductCard[]> {
    if (source === "most_viewed") {
      const { data, error } = await this.db.rpc("most_viewed_product_ids", { p_days: 60, p_limit: limit });
      if (error) fail("most_viewed", error);
      const products = await this.getProductsByIds((data ?? []).map((row) => row.product_id));
      if (products.length >= Math.min(4, limit)) return products;
      // Sem dados de acesso suficientes: usa os recomendados pela equipe
      return this.getProductsBySource("recommended", limit);
    }
    if (source === "on_sale") {
      return (await this.listProducts({ onSale: true, perPage: limit })).products;
    }
    const column = { featured: "is_featured", new: "is_new", recommended: "is_recommended" } as const;
    const { data, error } = await this.db
      .from("products")
      .select(PRODUCT_CARD_SELECT)
      .eq("status", "published")
      .is("deleted_at", null)
      .eq(column[source], true)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) fail(`products ${source}`, error);
    return (data as unknown as ProductCardRow[]).map(mapProductCard);
  }

  async getRelatedProducts(productId: string, limit: number): Promise<ProductCard[]> {
    const { data, error } = await this.db
      .rpc("related_products", { p_product_id: productId, p_limit: limit })
      .select(PRODUCT_CARD_SELECT);
    if (error) fail("related_products", error);
    return (data as unknown as ProductCardRow[]).map(mapProductCard);
  }

  async getCollections(): Promise<Collection[]> {
    const { data, error } = await this.db
      .from("collections")
      .select(`id, slug, title, subtitle, source, max_items, placement,
        items:collection_products(sort_order, product:products(${PRODUCT_CARD_SELECT}))`)
      .eq("placement", "home")
      .order("sort_order");
    if (error) fail("collections", error);

    return Promise.all(
      data.map(async (collection) => {
        let products: ProductCard[];
        if (collection.source === "manual") {
          products = (collection.items ?? [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .flatMap((item) => (item.product ? [mapProductCard(item.product as unknown as ProductCardRow)] : []))
            .slice(0, collection.max_items);
        } else if (collection.source === "category") {
          products = [];
        } else {
          products = await this.getProductsBySource(collection.source as ProductSource, collection.max_items);
        }
        return {
          id: collection.id,
          slug: collection.slug,
          title: collection.title,
          subtitle: collection.subtitle,
          source: collection.source,
          products,
        };
      }),
    );
  }

  async getBanners(placement: BannerPlacement) {
    const { data, error } = await this.db.from("banners").select("*").eq("placement", placement).order("sort_order");
    if (error) fail("banners", error);
    return data.map(mapBanner);
  }

  async getEnvironments() {
    const { data, error } = await this.db
      .from("environments")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order");
    if (error) fail("environments", error);
    return data.map(mapEnvironment);
  }

  async getBlogPosts(options: { category?: string; limit: number; offset: number }) {
    let query = this.db
      .from("blog_posts")
      .select(options.category ? `${POST_SUMMARY_SELECT}, filter_category:blog_categories!inner(slug)` : POST_SUMMARY_SELECT, {
        count: "exact",
      })
      .order("published_at", { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);
    if (options.category) query = query.eq("filter_category.slug", options.category);
    const { data, error, count } = await query;
    if (error) fail("blog_posts", error);
    return { posts: (data as unknown as PostSummaryRow[]).map(mapPostSummary), total: count ?? 0 };
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await this.db
      .from("blog_posts")
      .select(`${POST_SUMMARY_SELECT}, content, seo_title, seo_description, og_image_url, updated_at,
        tags:blog_post_tags(tag:tags(name, slug)),
        products:blog_post_products(sort_order, product:products(${PRODUCT_CARD_SELECT}))`)
      .eq("slug", slug)
      .maybeSingle();
    if (error) fail("blog_post", error);
    if (!data) return null;
    return {
      ...mapPostSummary(data as unknown as PostSummaryRow),
      content: data.content,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      ogImageUrl: data.og_image_url,
      updatedAt: data.updated_at,
      tags: (data.tags ?? []).flatMap((t) => (t.tag ? [t.tag] : [])),
      products: (data.products ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .flatMap((p) => (p.product ? [mapProductCard(p.product as unknown as ProductCardRow)] : [])),
    };
  }

  async getBlogCategories() {
    const { data, error } = await this.db.from("blog_categories").select("name, slug").order("sort_order");
    if (error) fail("blog_categories", error);
    return data;
  }

  async getPage(slug: string) {
    const { data, error } = await this.db.from("pages").select("*").eq("slug", slug).maybeSingle();
    if (error) fail("page", error);
    if (!data) return null;
    return {
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      content: data.content,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      updatedAt: data.updated_at,
    };
  }

  async getGeneralFaqs() {
    const { data, error } = await this.db
      .from("faqs")
      .select("id, question, answer")
      .is("product_id", null)
      .is("category_id", null)
      .order("sort_order");
    if (error) fail("faqs", error);
    return data;
  }

  async searchSuggestions(query: string): Promise<SearchSuggestions> {
    const { data, error } = await this.db.rpc("search_suggestions", { p_query: query, p_limit: 6 });
    if (error) fail("search_suggestions", error);
    const raw = (data ?? {}) as {
      products?: { id: string; name: string; slug: string; sku: string | null; brand: string | null; image_url: string | null }[];
      categories?: { name: string; slug: string }[];
      brands?: { name: string; slug: string }[];
    };
    return {
      products: (raw.products ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand: p.brand,
        imageUrl: p.image_url,
      })),
      categories: raw.categories ?? [],
      brands: raw.brands ?? [],
    };
  }

  async getRedirect(path: string) {
    const { data, error } = await this.db
      .from("redirects")
      .select("destination_path, status_code")
      .eq("source_path", path)
      .maybeSingle();
    if (error) fail("redirects", error);
    return data ? { destination: data.destination_path, statusCode: data.status_code } : null;
  }

  async getSitemapData(): Promise<SitemapData> {
    const [products, categories, brands, environments, posts, pages] = await Promise.all([
      this.db.from("products").select("slug, updated_at").eq("status", "published").is("deleted_at", null).limit(45000),
      this.db.from("categories").select("slug, updated_at").is("deleted_at", null),
      this.db.from("brands").select("slug, updated_at").is("deleted_at", null),
      this.db.from("environments").select("slug, updated_at").is("deleted_at", null),
      this.db.from("blog_posts").select("slug, updated_at"),
      this.db.from("pages").select("slug, updated_at"),
    ]);
    const map = (rows: { slug: string; updated_at: string }[] | null) =>
      (rows ?? []).map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
    return {
      products: map(products.data),
      categories: map(categories.data),
      brands: map(brands.data),
      environments: map(environments.data),
      posts: map(posts.data),
      pages: map(pages.data),
    };
  }
}
