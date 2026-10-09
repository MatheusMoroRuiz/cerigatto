/**
 * Leituras públicas do catálogo com cache (Cache Components).
 * Invalidação: o painel chama updateTag/revalidateTag com CACHE_TAGS.
 */
import { cacheLife, cacheTag } from "next/cache";
import type { CatalogFilters } from "@/types/catalog";
import { CACHE_TAGS } from "@/lib/constants";
import { buildCategoryTree, getCategoryPath, resolveCategoryWhatsApp } from "@/lib/category-tree";
import { getSource } from "./sources";
import type { ProductSource } from "./sources/types";

export async function getCategories() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.categories);
  return getSource().getCategories();
}

export async function getCategoryTree() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.categories);
  return buildCategoryTree(await getSource().getCategories());
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getBrands() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.brands);
  return getSource().getBrands();
}

export async function getBrandBySlug(slug: string) {
  const brands = await getBrands();
  return brands.find((b) => b.slug === slug) ?? null;
}

export async function listProducts(filters: CatalogFilters) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.products);
  return getSource().listProducts(filters);
}

export async function getFacets(filters: CatalogFilters) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.products);
  return getSource().getFacets(filters);
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.product(slug));
  const [product, categories] = await Promise.all([getSource().getProductBySlug(slug), getCategories()]);
  if (!product) return null;
  return {
    ...product,
    categoryPath: product.categoryPath.length ? product.categoryPath : getCategoryPath(categories, product.category?.id),
    categoryWhatsappNumber: resolveCategoryWhatsApp(categories, product.category?.id),
  };
}

export async function getProductsByIds(ids: string[]) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.products);
  return getSource().getProductsByIds(ids);
}

export async function getProductsBySource(source: ProductSource, limit = 8) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.products);
  return getSource().getProductsBySource(source, limit);
}

export async function getRelatedProducts(productId: string, limit = 8) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.products);
  return getSource().getRelatedProducts(productId, limit);
}

export async function getHomeCollections() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.collections, CACHE_TAGS.products);
  return getSource().getCollections();
}

export async function getSearchSuggestions(query: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories, CACHE_TAGS.brands);
  return getSource().searchSuggestions(query);
}

/** Slugs pré-renderizados no build (generateStaticParams precisa de ao menos 1) */
export async function getPopularProductSlugs(limit = 24) {
  const products = await getProductsBySource("featured", limit);
  return products.map((p) => p.slug);
}
