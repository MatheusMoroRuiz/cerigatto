import { cacheLife, cacheTag } from "next/cache";
import type { BannerPlacement } from "@/types/catalog";
import { CACHE_TAGS } from "@/lib/constants";
import { getSource } from "./sources";

export async function getBanners(placement: BannerPlacement) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.banners);
  return getSource().getBanners(placement);
}

export async function getEnvironments() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.environments);
  return getSource().getEnvironments();
}

export async function getEnvironmentBySlug(slug: string) {
  const environments = await getEnvironments();
  return environments.find((e) => e.slug === slug) ?? null;
}

export async function getBlogPosts(options: { category?: string; limit?: number; page?: number } = {}) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.blog);
  const limit = options.limit ?? 9;
  const page = Math.max(options.page ?? 1, 1);
  const result = await getSource().getBlogPosts({ category: options.category, limit, offset: (page - 1) * limit });
  return { ...result, page, totalPages: Math.max(Math.ceil(result.total / limit), 1) };
}

export async function getBlogPostBySlug(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.blog);
  return getSource().getBlogPostBySlug(slug);
}

export async function getBlogCategories() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.blog);
  return getSource().getBlogCategories();
}

export async function getPage(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.pages);
  return getSource().getPage(slug);
}

export async function getGeneralFaqs() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.faqs);
  return getSource().getGeneralFaqs();
}

export async function getRedirect(path: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.redirects);
  return getSource().getRedirect(path);
}

export async function getSitemapData() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories, CACHE_TAGS.brands, CACHE_TAGS.blog, CACHE_TAGS.pages);
  return getSource().getSitemapData();
}
