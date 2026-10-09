/**
 * Filtros do catálogo <-> parâmetros de URL.
 * Ex.: /produtos?categoria=pisos&marca=portobello&acabamento=acetinado&pagina=2
 * Parâmetros desconhecidos com formato de slug são tratados como atributos
 * (acabamento, cor, formato...). Tudo é validado — a URL é entrada do usuário.
 */
import type { Availability, CatalogFilters, SortOption } from "@/types/catalog";
import { SORT_OPTIONS } from "./constants";
import { parseDecimal } from "./format";
import { SLUG_PATTERN } from "./slug";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const RESERVED_PARAMS = new Set([
  "q",
  "categoria",
  "marca",
  "ordem",
  "pagina",
  "preco_min",
  "preco_max",
  "oferta",
  "novidades",
  "disponibilidade",
  "ambiente",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
]);

const AVAILABILITY_VALUES: Availability[] = [
  "available_on_request",
  "made_to_order",
  "temporarily_unavailable",
  "discontinued",
];

const MAX_ATTRIBUTE_FILTERS = 8;
const MAX_VALUES_PER_FILTER = 12;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Aceita "a,b" e parâmetros repetidos; mantém apenas slugs válidos */
export function parseList(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const items = raw.flatMap((v) => v.split(",")).map((v) => v.trim().toLowerCase());
  return [...new Set(items.filter((v) => v.length <= 80 && SLUG_PATTERN.test(v)))].slice(0, MAX_VALUES_PER_FILTER);
}

export function parseCatalogParams(params: RawSearchParams, perPage = 24): CatalogFilters {
  const query = first(params.q)?.trim().slice(0, 100) || undefined;
  const sortValue = first(params.ordem);
  const sort = SORT_OPTIONS.some((o) => o.value === sortValue) ? (sortValue as SortOption) : undefined;
  const pageNumber = Number.parseInt(first(params.pagina) ?? "1", 10);
  const priceMin = parseDecimal(first(params.preco_min) ?? null);
  const priceMax = parseDecimal(first(params.preco_max) ?? null);
  const category = parseList(params.categoria)[0];
  const environment = parseList(params.ambiente)[0];
  const availability = parseList(params.disponibilidade)
    .map((v) => v.replace(/-/g, "_"))
    .filter((v): v is Availability => AVAILABILITY_VALUES.includes(v as Availability));

  const attributes: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(params)) {
    if (RESERVED_PARAMS.has(key) || !SLUG_PATTERN.test(key) || key.length > 60) continue;
    const values = parseList(value);
    if (values.length) attributes[key] = values;
    if (Object.keys(attributes).length >= MAX_ATTRIBUTE_FILTERS) break;
  }

  return {
    query,
    category,
    brands: parseList(params.marca),
    environment,
    onSale: first(params.oferta) === "1",
    isNew: first(params.novidades) === "1",
    availability,
    attributes,
    priceMin: priceMin != null && priceMin >= 0 ? priceMin : undefined,
    priceMax: priceMax != null && priceMax >= 0 ? priceMax : undefined,
    sort,
    page: Number.isFinite(pageNumber) && pageNumber > 0 ? Math.min(pageNumber, 500) : 1,
    perPage,
  };
}

/** Quantos filtros o visitante aplicou (para o botão "Filtros (3)") */
export function countActiveFilters(filters: CatalogFilters, locked: Partial<CatalogFilters> = {}): number {
  let count = 0;
  if (filters.category && !locked.category) count += 1;
  count += locked.brands?.length ? 0 : (filters.brands?.length ?? 0);
  if (filters.onSale && !locked.onSale) count += 1;
  if (filters.isNew) count += 1;
  count += filters.availability?.length ?? 0;
  count += Object.values(filters.attributes ?? {}).reduce((acc, v) => acc + v.length, 0);
  if (filters.priceMin != null || filters.priceMax != null) count += 1;
  return count;
}

/** Constrói uma URL do catálogo aplicando alterações aos parâmetros atuais */
export function buildCatalogHref(
  basePath: string,
  current: RawSearchParams,
  changes: Record<string, string | string[] | null | undefined>,
): string {
  const params = new URLSearchParams();
  const merged: Record<string, string | string[] | undefined | null> = { ...current, ...changes };
  // Qualquer mudança de filtro volta para a página 1
  if (!("pagina" in changes)) delete merged.pagina;
  for (const [key, value] of Object.entries(merged)) {
    if (value === null || value === undefined || value === "") continue;
    const list = Array.isArray(value) ? value : [value];
    const joined = list.filter(Boolean).join(",");
    if (joined) params.set(key, joined);
  }
  const keys = [...params.keys()].sort();
  const sorted = new URLSearchParams(keys.map((k) => [k, params.get(k)!]));
  const qs = sorted.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Liga/desliga um valor dentro de um parâmetro de lista */
export function toggleListValue(current: string | string[] | undefined, value: string): string[] {
  const list = parseList(current);
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
