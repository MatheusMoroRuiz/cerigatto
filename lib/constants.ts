import type { Availability, ContentStatus, LeadStatus, SortOption } from "@/types/catalog";

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available_on_request: "Disponível sob consulta",
  made_to_order: "Sob encomenda",
  temporarily_unavailable: "Indisponível temporariamente",
  discontinued: "Fora de linha",
};

export const AVAILABILITY_TONE: Record<Availability, "success" | "warning" | "muted" | "danger"> = {
  available_on_request: "success",
  made_to_order: "warning",
  temporarily_unavailable: "muted",
  discontinued: "danger",
};

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  in_progress: "Em atendimento",
  answered: "Respondido",
  archived: "Arquivado",
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Mais relevantes" },
  { value: "newest", label: "Novidades" },
  { value: "name_asc", label: "Nome (A–Z)" },
  { value: "name_desc", label: "Nome (Z–A)" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

export const DEFAULT_CTA_LABEL = "Consultar disponibilidade no WhatsApp";

export const CTA_PRESETS = [
  "Consultar disponibilidade",
  "Solicitar orçamento",
  "Falar com especialista",
  "Consultar condições",
] as const;

export const PRODUCTS_PER_PAGE = 24;

export const WEEKDAY_LABELS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/** Etiquetas de cache usadas por 'use cache' + updateTag/revalidateTag */
export const CACHE_TAGS = {
  products: "products",
  product: (slug: string) => `product:${slug}`,
  categories: "categories",
  brands: "brands",
  banners: "banners",
  collections: "collections",
  environments: "environments",
  blog: "blog",
  pages: "pages",
  settings: "settings",
  redirects: "redirects",
  faqs: "faqs",
} as const;
