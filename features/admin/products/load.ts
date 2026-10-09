import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ProductInput } from "@/lib/validation/product";

export function emptyProduct(id: string): ProductInput {
  return {
    id,
    name: "",
    slug: "",
    sku: null,
    shortDescription: null,
    description: null,
    categoryId: null,
    brandId: null,
    status: "draft",
    isFeatured: false,
    isNew: false,
    isOnSale: false,
    isRecommended: false,
    saleStartsAt: null,
    saleEndsAt: null,
    saleLabel: null,
    priceDisplay: "consult",
    price: null,
    salePrice: null,
    unit: "unidade",
    availability: "available_on_request",
    manufacturer: null,
    model: null,
    dimensions: null,
    weightKg: null,
    warranty: null,
    packageContents: null,
    notes: null,
    videoUrl: null,
    ctaLabel: null,
    whatsappNumber: null,
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    ogImageUrl: null,
    images: [],
    variantGroups: [],
    specifications: [],
    tags: [],
    environmentIds: [],
    relatedIds: [],
    faqs: [],
  };
}

/** Carrega o produto completo para edição (inclui rascunhos — RLS da equipe) */
export async function getProductForEdit(id: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, images:product_images(url, storage_path, alt, width, height, is_cover, sort_order),
       options:product_variant_options(name, is_required, sort_order,
         variants:product_variants(label, sku, price, sale_price, availability, is_active, sort_order)),
       specs:product_specifications(attribute_id, label, value, sort_order),
       tags:product_tags(tag:tags(name)),
       envs:product_environments(environment_id),
       relations:product_relations!product_relations_product_id_fkey(related_product_id, relation_type, sort_order,
         related:products!product_relations_related_product_id_fkey(id, name, sku)),
       faqs(question, answer, sort_order)`,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const input: ProductInput = {
    id: data.id,
    name: data.name,
    slug: data.slug,
    sku: data.sku,
    shortDescription: data.short_description,
    description: data.description,
    categoryId: data.category_id,
    brandId: data.brand_id,
    status: data.status,
    isFeatured: data.is_featured,
    isNew: data.is_new,
    isOnSale: data.is_on_sale,
    isRecommended: data.is_recommended,
    saleStartsAt: data.sale_starts_at,
    saleEndsAt: data.sale_ends_at,
    saleLabel: data.sale_label,
    priceDisplay: data.price_display,
    price: data.price,
    salePrice: data.sale_price,
    unit: data.unit,
    availability: data.availability,
    manufacturer: data.manufacturer,
    model: data.model,
    dimensions: data.dimensions,
    weightKg: data.weight_kg,
    warranty: data.warranty,
    packageContents: data.package_contents,
    notes: data.notes,
    videoUrl: data.video_url,
    ctaLabel: data.cta_label,
    whatsappNumber: data.whatsapp_number,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    canonicalUrl: data.canonical_url,
    ogImageUrl: data.og_image_url,
    images: [...data.images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ url: i.url, storagePath: i.storage_path, alt: i.alt, width: i.width, height: i.height, isCover: i.is_cover })),
    variantGroups: [...data.options]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({
        name: o.name,
        isRequired: o.is_required,
        values: [...o.variants]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((v) => ({ label: v.label, sku: v.sku, price: v.price, salePrice: v.sale_price, availability: v.availability, isActive: v.is_active })),
      })),
    specifications: [...data.specs]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({ attributeId: s.attribute_id, label: s.label, value: s.value })),
    tags: data.tags.flatMap((t) => (t.tag ? [t.tag.name] : [])),
    environmentIds: data.envs.map((e) => e.environment_id),
    relatedIds: data.relations.filter((r) => r.relation_type === "combines").sort((a, b) => a.sort_order - b.sort_order).map((r) => r.related_product_id),
    faqs: [...data.faqs].sort((a, b) => a.sort_order - b.sort_order).map((f) => ({ question: f.question, answer: f.answer })),
  };
  const relatedProducts = data.relations
    .filter((r) => r.relation_type === "combines" && r.related)
    .map((r) => ({ id: r.related!.id, name: r.related!.name, sku: r.related!.sku }));
  return { input, status: data.status, slug: data.slug, updatedAt: data.updated_at, relatedProducts };
}

export async function getCategoryAttributeMap() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("category_attributes").select("category_id, attribute_id, sort_order").order("sort_order");
  const map: Record<string, string[]> = {};
  for (const row of data ?? []) (map[row.category_id] ??= []).push(row.attribute_id);
  return map;
}
