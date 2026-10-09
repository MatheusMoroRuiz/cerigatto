import type {
  Banner,
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
  Faq,
  Page,
  ProductCard,
  ProductDetail,
  SearchSuggestions,
} from "@/types/catalog";
import type { SiteConfig } from "@/types/settings";

export type ProductSource = "featured" | "on_sale" | "new" | "recommended" | "most_viewed";

export type SitemapEntry = { slug: string; updatedAt: string };

export type SitemapData = {
  products: SitemapEntry[];
  categories: SitemapEntry[];
  brands: SitemapEntry[];
  environments: SitemapEntry[];
  posts: SitemapEntry[];
  pages: SitemapEntry[];
};

/**
 * Contrato de leitura pública. Implementado por:
 * - SupabaseSource (produção)
 * - DemoSource (dados fictícios em memória)
 * - EmptySource (sem banco configurado)
 *
 * Para trocar o mecanismo de busca no futuro (ex.: Typesense/Algolia),
 * basta substituir listProducts/getFacets/searchSuggestions.
 */
export interface DataSource {
  getSiteConfig(): Promise<SiteConfig>;
  getCategories(): Promise<Category[]>;
  getBrands(): Promise<Brand[]>;
  listProducts(filters: CatalogFilters): Promise<CatalogPage>;
  getFacets(filters: CatalogFilters): Promise<CatalogFacets>;
  getProductBySlug(slug: string): Promise<ProductDetail | null>;
  getProductsByIds(ids: string[]): Promise<ProductCard[]>;
  getProductsBySource(source: ProductSource, limit: number): Promise<ProductCard[]>;
  getRelatedProducts(productId: string, limit: number): Promise<ProductCard[]>;
  getCollections(): Promise<Collection[]>;
  getBanners(placement: BannerPlacement): Promise<Banner[]>;
  getEnvironments(): Promise<Environment[]>;
  getBlogPosts(options: { category?: string; limit: number; offset: number }): Promise<{
    posts: BlogPostSummary[];
    total: number;
  }>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
  getBlogCategories(): Promise<{ name: string; slug: string }[]>;
  getPage(slug: string): Promise<Page | null>;
  getGeneralFaqs(): Promise<Faq[]>;
  searchSuggestions(query: string): Promise<SearchSuggestions>;
  getRedirect(path: string): Promise<{ destination: string; statusCode: number } | null>;
  getSitemapData(): Promise<SitemapData>;
}
