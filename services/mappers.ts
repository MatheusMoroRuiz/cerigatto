/**
 * Conversão de linhas do banco (snake_case) para tipos de domínio (camelCase).
 */
import type { Tables } from "@/types/database.types";
import type {
  Banner,
  Brand,
  BrandSummary,
  Category,
  CategorySummary,
  Environment,
  ImageAsset,
  ProductCard,
} from "@/types/catalog";
import type { NavLink, SiteConfig } from "@/types/settings";
import { isSaleActive } from "@/lib/pricing";
import { DEFAULT_SITE_CONFIG } from "./settings-defaults";

export const PRODUCT_CARD_SELECT = `
  id, name, slug, sku, short_description, price_display, price, sale_price, unit,
  is_on_sale, sale_starts_at, sale_ends_at, sale_label, is_featured, is_new,
  availability, cta_label, whatsapp_number,
  brand:brands(id, name, slug, logo_url),
  category:categories(id, name, slug, parent_id),
  images:product_images(url, alt, width, height, is_cover, sort_order),
  variant_options:product_variant_options(is_required)
` as const;

type ProductCardBase = Pick<
  Tables<"products">,
  | "id"
  | "name"
  | "slug"
  | "sku"
  | "short_description"
  | "price_display"
  | "price"
  | "sale_price"
  | "unit"
  | "is_on_sale"
  | "sale_starts_at"
  | "sale_ends_at"
  | "sale_label"
  | "is_featured"
  | "is_new"
  | "availability"
  | "cta_label"
  | "whatsapp_number"
>;

export type ProductCardRow = ProductCardBase & {
  brand: Pick<Tables<"brands">, "id" | "name" | "slug" | "logo_url"> | null;
  category: Pick<Tables<"categories">, "id" | "name" | "slug" | "parent_id"> | null;
  images: Pick<Tables<"product_images">, "url" | "alt" | "width" | "height" | "is_cover" | "sort_order">[];
  variant_options: Pick<Tables<"product_variant_options">, "is_required">[];
};

export function sortImages<T extends { is_cover: boolean; sort_order: number }>(images: T[]): T[] {
  return [...images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
}

/** Alt de imagem: usa o texto cadastrado ou um fallback coerente (produto + marca) */
export function imageAlt(alt: string | null | undefined, productName: string, brandName?: string | null) {
  const trimmed = alt?.trim();
  if (trimmed) return trimmed;
  return brandName ? `${productName} — ${brandName}` : productName;
}

export function mapImage(
  row: Pick<Tables<"product_images">, "url" | "alt" | "width" | "height">,
  productName: string,
  brandName?: string | null,
): ImageAsset {
  return { url: row.url, alt: imageAlt(row.alt, productName, brandName), width: row.width, height: row.height };
}

export function mapBrandSummary(row: ProductCardRow["brand"]): BrandSummary | null {
  return row ? { id: row.id, name: row.name, slug: row.slug, logoUrl: row.logo_url } : null;
}

export function mapCategorySummary(row: ProductCardRow["category"]): CategorySummary | null {
  return row ? { id: row.id, name: row.name, slug: row.slug, parentId: row.parent_id } : null;
}

/** Calcula se a oferta está vigente (chamado dentro de funções com cache) */
export function withActive(sale: Omit<ProductCard["sale"], "active">): ProductCard["sale"] {
  return { ...sale, active: isSaleActive(sale) };
}

export function mapProductCard(row: ProductCardRow): ProductCard {
  const cover = sortImages(row.images ?? [])[0];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    shortDescription: row.short_description,
    brand: mapBrandSummary(row.brand),
    category: mapCategorySummary(row.category),
    image: cover ? mapImage(cover, row.name, row.brand?.name) : null,
    price: {
      display: row.price_display,
      price: row.price,
      salePrice: row.sale_price,
      unit: row.unit,
    },
    sale: withActive({
      isOnSale: row.is_on_sale,
      startsAt: row.sale_starts_at,
      endsAt: row.sale_ends_at,
      label: row.sale_label,
    }),
    isFeatured: row.is_featured,
    isNew: row.is_new,
    availability: row.availability,
    ctaLabel: row.cta_label,
    whatsappNumber: row.whatsapp_number,
    hasRequiredVariants: (row.variant_options ?? []).some((o) => o.is_required),
  };
}

export function mapCategory(row: Tables<"categories">): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    description: row.description,
    imageUrl: row.image_url,
    bannerUrl: row.banner_url,
    icon: row.icon,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoContent: row.seo_content,
    whatsappNumber: row.whatsapp_number,
    isFeatured: row.is_featured,
    showInMenu: row.show_in_menu,
    sortOrder: row.sort_order,
  };
}

export function mapBrand(row: Tables<"brands">): Brand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    description: row.description,
    websiteUrl: row.website_url,
    bannerUrl: row.banner_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    isFeatured: row.is_featured,
  };
}

export function mapEnvironment(row: Tables<"environments">): Environment {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    bannerUrl: row.banner_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

export function mapBanner(row: Tables<"banners">): Banner {
  return {
    id: row.id,
    placement: row.placement,
    desktopImageUrl: row.desktop_image_url,
    mobileImageUrl: row.mobile_image_url,
    imageAlt: row.image_alt ?? row.title ?? row.internal_name,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    buttonText: row.button_text,
    buttonUrl: row.button_url,
    textPosition: row.text_position,
    overlayOpacity: row.overlay_opacity,
  };
}

function parseNavLinks(value: unknown): NavLink[] {
  if (!Array.isArray(value)) return DEFAULT_SITE_CONFIG.site.navLinks;
  return value
    .filter(
      (item): item is NavLink =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as NavLink).label === "string" &&
        typeof (item as NavLink).href === "string",
    )
    .map((item) => ({ label: item.label, href: item.href, enabled: item.enabled !== false }));
}

function parseTheme(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

export function mapSiteConfig(rows: {
  site: Tables<"site_settings"> | null;
  business: Tables<"business_information"> | null;
  hours: Tables<"business_hours">[];
  social: Tables<"social_links">[];
  whatsapp: Tables<"whatsapp_settings"> | null;
  seo: Tables<"seo_settings"> | null;
}): SiteConfig {
  const d = DEFAULT_SITE_CONFIG;
  const s = rows.site;
  const b = rows.business;
  const w = rows.whatsapp;
  const seo = rows.seo;
  return {
    site: s
      ? {
          siteName: s.site_name,
          shortName: s.short_name,
          tagline: s.tagline,
          description: s.description,
          logoUrl: s.logo_url,
          logoDarkUrl: s.logo_dark_url,
          faviconUrl: s.favicon_url,
          topbarEnabled: s.topbar_enabled,
          topbarMessage: s.topbar_message,
          topbarLink: s.topbar_link,
          navLinks: parseNavLinks(s.nav_links),
          theme: parseTheme(s.theme),
          ga4Id: s.ga4_id,
          gtmId: s.gtm_id,
          metaPixelId: s.meta_pixel_id,
          newsletterEnabled: s.newsletter_enabled,
          demoNoticeEnabled: s.demo_notice_enabled,
        }
      : d.site,
    business: b
      ? {
          legalName: b.legal_name,
          tradeName: b.trade_name,
          cnpj: b.cnpj,
          phone: b.phone,
          email: b.email,
          street: b.street,
          streetNumber: b.street_number,
          complement: b.complement,
          district: b.district,
          city: b.city,
          state: b.state,
          postalCode: b.postal_code,
          latitude: b.latitude,
          longitude: b.longitude,
          googleMapsUrl: b.google_maps_url,
          foundedYear: b.founded_year,
          aboutTitle: b.about_title,
          aboutSummary: b.about_summary,
          history: b.history,
          mission: b.mission,
          valuesText: b.values_text,
        }
      : d.business,
    hours: rows.hours
      .map((h) => ({
        id: h.id,
        dayOfWeek: h.day_of_week,
        opensAt: h.opens_at,
        closesAt: h.closes_at,
        isClosed: h.is_closed,
        note: h.note,
      }))
      .sort((a, b2) => a.dayOfWeek - b2.dayOfWeek || (a.opensAt ?? "").localeCompare(b2.opensAt ?? "")),
    social: rows.social
      .sort((a, b2) => a.sort_order - b2.sort_order)
      .map((l) => ({ id: l.id, platform: l.platform as SiteConfig["social"][number]["platform"], url: l.url })),
    whatsapp: w
      ? {
          isEnabled: w.is_enabled,
          countryCode: w.country_code,
          phoneNumber: w.phone_number,
          defaultMessage: w.default_message,
          productIntro: w.product_intro,
          productOutro: w.product_outro,
          quoteIntro: w.quote_intro,
          buttonLabel: w.button_label,
          floatingLabel: w.floating_label,
          showFloatingButton: w.show_floating_button,
          showFloatingLabelMobile: w.show_floating_label_mobile,
          showOutOfHoursNotice: w.show_out_of_hours_notice,
          outOfHoursMessage: w.out_of_hours_message,
        }
      : d.whatsapp,
    seo: seo
      ? {
          defaultTitle: seo.default_title,
          titleTemplate: seo.title_template,
          defaultDescription: seo.default_description,
          defaultOgImageUrl: seo.default_og_image_url,
          googleSiteVerification: seo.google_site_verification,
          bingSiteVerification: seo.bing_site_verification,
          noindexSite: seo.noindex_site,
          localBusinessType: seo.local_business_type,
        }
      : d.seo,
  };
}
