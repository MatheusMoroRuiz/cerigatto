import { z } from "zod";
import { Constants } from "@/types/database.types";
import { isAllowedImageUrl } from "./common";
import { SLUG_PATTERN } from "@/lib/slug";

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .nullable()
    .transform((v) => (v === "" ? null : v));

const money = z.number().min(0, "Valor não pode ser negativo.").max(9_999_999).nullable();
const isoDate = z
  .string()
  .nullable()
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Data inválida.");

export const productImageSchema = z.object({
  url: z.string().refine(isAllowedImageUrl, "Imagem com endereço não permitido."),
  storagePath: z.string().max(400).nullable(),
  alt: nullableText(200),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  isCover: z.boolean(),
});

export const variantValueSchema = z.object({
  label: z.string().trim().min(1, "Informe o valor da opção.").max(80),
  sku: nullableText(64),
  price: money,
  salePrice: money,
  availability: z.enum(Constants.public.Enums.availability_status).nullable(),
  isActive: z.boolean(),
});

export const variantGroupSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da variação (ex.: Tamanho).").max(60),
  isRequired: z.boolean(),
  values: z.array(variantValueSchema).min(1, "Adicione ao menos uma opção.").max(60),
});

export const specificationSchema = z
  .object({
    attributeId: z.uuid().nullable(),
    label: nullableText(80),
    value: z.string().trim().max(300),
  })
  .refine((s) => s.attributeId || s.label, { message: "Escolha um atributo ou informe o nome.", path: ["label"] });

export const productInputSchema = z
  .object({
    id: z.uuid(),
    name: z.string().trim().min(2, "Informe o nome do produto.").max(200),
    slug: z.string().trim().toLowerCase().max(120).regex(SLUG_PATTERN, "Use letras minúsculas, números e hífens."),
    sku: nullableText(64),
    shortDescription: nullableText(400),
    description: nullableText(20000),
    categoryId: z.uuid().nullable(),
    brandId: z.uuid().nullable(),
    status: z.enum(Constants.public.Enums.content_status),
    isFeatured: z.boolean(),
    isNew: z.boolean(),
    isOnSale: z.boolean(),
    isRecommended: z.boolean(),
    saleStartsAt: isoDate,
    saleEndsAt: isoDate,
    saleLabel: nullableText(60),
    priceDisplay: z.enum(Constants.public.Enums.price_display),
    price: money,
    salePrice: money,
    unit: z.string().trim().min(1, "Informe a unidade (ex.: caixa, saco, m²).").max(40),
    availability: z.enum(Constants.public.Enums.availability_status),
    manufacturer: nullableText(120),
    model: nullableText(120),
    dimensions: nullableText(120),
    weightKg: z.number().min(0).max(100000).nullable(),
    warranty: nullableText(160),
    packageContents: nullableText(400),
    notes: nullableText(4000),
    videoUrl: nullableText(500).refine((v) => v === null || /^https:\/\//.test(v), "Use um link https (YouTube ou Vimeo)."),
    ctaLabel: nullableText(60),
    whatsappNumber: z
      .string()
      .transform((v) => v.replace(/\D+/g, ""))
      .refine((v) => v === "" || (v.length >= 10 && v.length <= 15), "Número de WhatsApp inválido (inclua DDI e DDD).")
      .transform((v) => (v === "" ? null : v))
      .nullable(),
    seoTitle: nullableText(70),
    seoDescription: nullableText(170),
    canonicalUrl: nullableText(300).refine((v) => v === null || /^(https:\/\/|\/)/.test(v), "Use uma URL https ou caminho iniciado por /."),
    ogImageUrl: nullableText(1000).refine((v) => v === null || isAllowedImageUrl(v), "Imagem com endereço não permitido."),
    images: z.array(productImageSchema).max(20, "Máximo de 20 imagens por produto."),
    variantGroups: z.array(variantGroupSchema).max(5, "Máximo de 5 grupos de variação."),
    specifications: z.array(specificationSchema).max(60),
    tags: z.array(z.string().trim().min(1).max(60)).max(30),
    environmentIds: z.array(z.uuid()).max(20),
    relatedIds: z.array(z.uuid()).max(12),
    faqs: z.array(z.object({ question: z.string().trim().max(300), answer: z.string().trim().max(2000) })).max(20),
  })
  .superRefine((p, ctx) => {
    if (p.salePrice != null && p.price != null && p.salePrice > p.price) {
      ctx.addIssue({ code: "custom", path: ["salePrice"], message: "O preço promocional deve ser menor que o preço normal." });
    }
    if (p.saleStartsAt && p.saleEndsAt && Date.parse(p.saleEndsAt) <= Date.parse(p.saleStartsAt)) {
      ctx.addIssue({ code: "custom", path: ["saleEndsAt"], message: "O fim da oferta deve ser depois do início." });
    }
    if (p.priceDisplay === "show" && p.price == null) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Informe o preço ou escolha outra forma de exibição." });
    }
    if (p.status === "published" && !p.categoryId) {
      ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Escolha uma categoria antes de publicar." });
    }
    const names = new Set<string>();
    p.variantGroups.forEach((g, i) => {
      const key = g.name.toLowerCase();
      if (names.has(key)) ctx.addIssue({ code: "custom", path: ["variantGroups", i, "name"], message: "Nome de variação repetido." });
      names.add(key);
    });
  });

export type ProductInput = z.input<typeof productInputSchema>;
export type ProductData = z.output<typeof productInputSchema>;

/** Converte para o JSON esperado pela função SQL admin_save_product */
export function toProductPayload(p: ProductData) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    short_description: p.shortDescription,
    description: p.description,
    brand_id: p.brandId,
    category_id: p.categoryId,
    status: p.status,
    is_featured: p.isFeatured,
    is_new: p.isNew,
    is_on_sale: p.isOnSale,
    is_recommended: p.isRecommended,
    sale_starts_at: p.saleStartsAt,
    sale_ends_at: p.saleEndsAt,
    sale_label: p.saleLabel,
    price_display: p.priceDisplay,
    price: p.price,
    sale_price: p.salePrice,
    unit: p.unit,
    availability: p.availability,
    manufacturer: p.manufacturer,
    model: p.model,
    dimensions: p.dimensions,
    weight_kg: p.weightKg,
    warranty: p.warranty,
    package_contents: p.packageContents,
    notes: p.notes,
    video_url: p.videoUrl,
    cta_label: p.ctaLabel,
    whatsapp_number: p.whatsappNumber,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
    canonical_url: p.canonicalUrl,
    og_image_url: p.ogImageUrl,
    images: p.images.map((i) => ({
      url: i.url,
      storage_path: i.storagePath,
      alt: i.alt,
      width: i.width,
      height: i.height,
      is_cover: i.isCover,
    })),
    variant_groups: p.variantGroups.map((g) => ({
      name: g.name,
      is_required: g.isRequired,
      values: g.values.map((v) => ({
        label: v.label,
        sku: v.sku,
        price: v.price,
        sale_price: v.salePrice,
        availability: v.availability,
        is_active: v.isActive,
      })),
    })),
    specifications: p.specifications.map((s) => ({ attribute_id: s.attributeId, label: s.label, value: s.value })),
    tags: p.tags,
    environment_ids: p.environmentIds,
    related_ids: p.relatedIds,
    faqs: p.faqs,
  };
}
