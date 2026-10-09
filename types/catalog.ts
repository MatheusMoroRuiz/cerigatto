/**
 * Tipos de domínio usados pela interface. São independentes do formato das
 * tabelas (types/database.types.ts) — os mapeadores em services/ fazem a ponte.
 */
import type { Enums } from "./database.types";

export type PriceDisplay = Enums<"price_display">;
export type Availability = Enums<"availability_status">;
export type ContentStatus = Enums<"content_status">;
export type AppRole = Enums<"app_role">;
export type BannerPlacement = Enums<"banner_placement">;
export type TextPosition = Enums<"text_position">;
export type LeadStatus = Enums<"lead_status">;

export type ImageAsset = {
  url: string;
  alt: string;
  width?: number | null;
  height?: number | null;
};

export type BrandSummary = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type Brand = BrandSummary & {
  description: string | null;
  websiteUrl: string | null;
  bannerUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

export type Category = CategorySummary & {
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  icon: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoContent: string | null;
  whatsappNumber: string | null;
  isFeatured: boolean;
  showInMenu: boolean;
  sortOrder: number;
};

export type CategoryNode = Category & { children: CategoryNode[] };

export type PriceInfo = {
  display: PriceDisplay;
  price: number | null;
  salePrice: number | null;
  unit: string;
};

export type SaleInfo = {
  isOnSale: boolean;
  /** Oferta vigente no momento em que o dado foi carregado (marcador + janela de datas) */
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  label: string | null;
};

/** Dados mínimos para cards e listagens */
export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string | null;
  brand: BrandSummary | null;
  category: CategorySummary | null;
  image: ImageAsset | null;
  price: PriceInfo;
  sale: SaleInfo;
  isFeatured: boolean;
  isNew: boolean;
  availability: Availability;
  ctaLabel: string | null;
  whatsappNumber: string | null;
  hasRequiredVariants: boolean;
};

export type VariantValue = {
  id: string;
  label: string;
  sku: string | null;
  price: number | null;
  salePrice: number | null;
  availability: Availability | null;
};

export type VariantGroup = {
  id: string;
  name: string;
  isRequired: boolean;
  values: VariantValue[];
};

export type ProductSpecification = {
  label: string;
  value: string;
  unit: string | null;
  group: string;
  attributeSlug: string | null;
};

export type Faq = { id: string; question: string; answer: string };

export type ProductDetail = ProductCard & {
  description: string | null;
  images: ImageAsset[];
  variants: VariantGroup[];
  specifications: ProductSpecification[];
  tags: { name: string; slug: string }[];
  environments: { name: string; slug: string }[];
  categoryPath: CategorySummary[];
  manufacturer: string | null;
  model: string | null;
  dimensions: string | null;
  weightKg: number | null;
  warranty: string | null;
  packageContents: string | null;
  notes: string | null;
  videoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string;
  faqs: Faq[];
  combinesWith: ProductCard[];
  categoryWhatsappNumber: string | null;
};

export type SortOption = "relevance" | "newest" | "name_asc" | "name_desc" | "price_asc" | "price_desc";

export type CatalogFilters = {
  query?: string;
  category?: string;
  brands?: string[];
  environment?: string;
  onSale?: boolean;
  isNew?: boolean;
  availability?: Availability[];
  attributes?: Record<string, string[]>;
  priceMin?: number;
  priceMax?: number;
  sort?: SortOption;
  page?: number;
  perPage?: number;
};

export type FacetValue = { slug: string; label: string; count: number };

export type CatalogFacets = {
  brands: FacetValue[];
  categories: FacetValue[];
  attributes: { slug: string; name: string; unit: string | null; values: FacetValue[] }[];
  availability: { value: Availability; count: number }[];
  price: { min: number | null; max: number | null };
};

export type CatalogPage = {
  products: ProductCard[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type Banner = {
  id: string;
  placement: BannerPlacement;
  desktopImageUrl: string;
  mobileImageUrl: string | null;
  imageAlt: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  textPosition: TextPosition;
  overlayOpacity: number;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  source: string;
  products: ProductCard[];
};

export type Environment = {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverAlt: string | null;
  category: { name: string; slug: string } | null;
  publishedAt: string | null;
  readingMinutes: number | null;
  authorName: string | null;
};

export type BlogPost = BlogPostSummary & {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  updatedAt: string;
  tags: { name: string; slug: string }[];
  products: ProductCard[];
};

export type Page = {
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

export type SearchSuggestions = {
  products: { id: string; name: string; slug: string; sku: string | null; brand: string | null; imageUrl: string | null }[];
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
};
