import "server-only";
import { DEFAULT_SITE_CONFIG } from "../settings-defaults";
import type { DataSource } from "./types";

/** Usada quando o Supabase não está configurado: o site renderiza estados vazios. */
export class EmptySource implements DataSource {
  async getSiteConfig() {
    return DEFAULT_SITE_CONFIG;
  }
  async getCategories() {
    return [];
  }
  async getBrands() {
    return [];
  }
  async listProducts() {
    return { products: [], total: 0, page: 1, perPage: 24, totalPages: 1 };
  }
  async getFacets() {
    return { brands: [], categories: [], attributes: [], availability: [], price: { min: null, max: null } };
  }
  async getProductBySlug() {
    return null;
  }
  async getProductsByIds() {
    return [];
  }
  async getProductsBySource() {
    return [];
  }
  async getRelatedProducts() {
    return [];
  }
  async getCollections() {
    return [];
  }
  async getBanners() {
    return [];
  }
  async getEnvironments() {
    return [];
  }
  async getBlogPosts() {
    return { posts: [], total: 0 };
  }
  async getBlogPostBySlug() {
    return null;
  }
  async getBlogCategories() {
    return [];
  }
  async getPage() {
    return null;
  }
  async getGeneralFaqs() {
    return [];
  }
  async searchSuggestions() {
    return { products: [], categories: [], brands: [] };
  }
  async getRedirect() {
    return null;
  }
  async getSitemapData() {
    return { products: [], categories: [], brands: [], environments: [], posts: [], pages: [] };
  }
}
