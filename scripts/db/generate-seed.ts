/**
 * Gera supabase/seed.sql a partir de supabase/seed/demo-data.ts.
 * Uso: pnpm db:seed:generate
 *
 * O seed contém APENAS dados de demonstração e liga a faixa
 * "conteúdo de demonstração" no site (site_settings.demo_notice_enabled).
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  demoAttributes,
  demoBanners,
  demoBlogCategories,
  demoBrands,
  demoCategories,
  demoEnvironments,
  demoFaqs,
  demoId,
  demoPosts,
  demoProducts,
  unsplash,
} from "../../supabase/seed/demo-data";

const OUTPUT = path.resolve(__dirname, "..", "..", "supabase", "seed.sql");

type SqlValue = string | number | boolean | null | undefined | { raw: string };

function lit(value: SqlValue): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") return value.raw;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return `'${value.replace(/'/g, "''")}'`;
}

function insert(table: string, rows: Record<string, SqlValue>[]): string {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]!);
  const values = rows
    .map((row) => `  (${columns.map((column) => lit(row[column])).join(", ")})`)
    .join(",\n");
  return `insert into public.${table} (${columns.join(", ")}) values\n${values};\n\n`;
}

const raw = (sql: string) => ({ raw: sql });

function main() {
  const out: string[] = [];
  out.push("-- =============================================================================");
  out.push("-- SEED DE DEMONSTRAÇÃO — gerado por scripts/db/generate-seed.ts");
  out.push("-- Marcas, produtos e banners são FICTÍCIOS. Não use em produção como dados reais.");
  out.push("-- Para regenerar: pnpm db:seed:generate");
  out.push("-- =============================================================================\n");

  const categoryIds = new Map(demoCategories.map((c, i) => [c.slug, demoId("category", i + 1)]));
  const brandIds = new Map(demoBrands.map((b, i) => [b.slug, demoId("brand", i + 1)]));
  const attributeIds = new Map(demoAttributes.map((a, i) => [a.slug, demoId("attribute", i + 1)]));
  const environmentIds = new Map(demoEnvironments.map((e, i) => [e.slug, demoId("environment", i + 1)]));
  const productIds = new Map(demoProducts.map((p, i) => [p.slug, demoId("product", i + 1)]));

  // Categorias: pais primeiro
  const ordered = [...demoCategories].sort((a, b) => Number(Boolean(a.parent)) - Number(Boolean(b.parent)));
  out.push(
    insert(
      "categories",
      ordered.map((c) => ({
        id: categoryIds.get(c.slug)!,
        parent_id: c.parent ? categoryIds.get(c.parent)! : null,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image_url: c.photo ? unsplash(c.photo, 900) : null,
        banner_url: c.photo ? unsplash(c.photo, 2000) : null,
        icon: c.icon ?? null,
        is_featured: c.featured ?? false,
        sort_order: demoCategories.indexOf(c),
      })),
    ),
  );

  out.push(
    insert(
      "brands",
      demoBrands.map((b, i) => ({
        id: brandIds.get(b.slug)!,
        name: b.name,
        slug: b.slug,
        description: b.description,
        is_featured: b.featured ?? false,
        sort_order: i,
      })),
    ),
  );

  out.push(
    insert(
      "attributes",
      demoAttributes.map((a, i) => ({
        id: attributeIds.get(a.slug)!,
        name: a.name,
        slug: a.slug,
        unit: a.unit ?? null,
        group_name: a.group ?? "Especificações",
        is_filterable: a.filterable ?? false,
        sort_order: i,
      })),
    ),
  );

  out.push(
    insert(
      "category_attributes",
      demoCategories.flatMap((c) =>
        (c.attributes ?? []).map((slug, i) => ({
          category_id: categoryIds.get(c.slug)!,
          attribute_id: attributeIds.get(slug)!,
          sort_order: i,
        })),
      ),
    ),
  );

  out.push(
    insert(
      "environments",
      demoEnvironments.map((e, i) => ({
        id: environmentIds.get(e.slug)!,
        name: e.name,
        slug: e.slug,
        summary: e.summary,
        content: e.content,
        image_url: unsplash(e.photo, 1200),
        banner_url: unsplash(e.photo, 2000),
        sort_order: i,
      })),
    ),
  );

  // Tags
  const tagSlugs = [...new Set(demoProducts.flatMap((p) => p.tags ?? []))].sort();
  const tagIds = new Map(tagSlugs.map((slug, i) => [slug, demoId("tag", i + 1)]));
  out.push(
    insert(
      "tags",
      tagSlugs.map((slug) => ({
        id: tagIds.get(slug)!,
        slug,
        name: slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      })),
    ),
  );

  // Produtos
  out.push(
    insert(
      "products",
      demoProducts.map((p, i) => ({
        id: productIds.get(p.slug)!,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        short_description: p.short,
        description: p.description,
        brand_id: brandIds.get(p.brand)!,
        category_id: categoryIds.get(p.category)!,
        status: "published",
        published_at: raw(`now() - interval '${(demoProducts.length - i) * 2} days'`),
        is_featured: p.featured ?? false,
        is_new: p.isNew ?? false,
        is_on_sale: p.onSale ?? false,
        is_recommended: p.recommended ?? false,
        sale_starts_at: p.onSale ? raw("now() - interval '1 day'") : null,
        sale_ends_at: p.onSale && p.saleDays ? raw(`now() + interval '${p.saleDays} days'`) : null,
        sale_label: p.saleLabel ?? null,
        price_display: p.priceDisplay,
        price: p.price ?? null,
        sale_price: p.salePrice ?? null,
        unit: p.unit,
        availability: p.availability ?? "available_on_request",
        manufacturer: null,
        model: p.model ?? null,
        dimensions: p.dimensions ?? null,
        weight_kg: p.weightKg ?? null,
        warranty: p.warranty ?? null,
        package_contents: p.packageContents ?? null,
        cta_label: p.ctaLabel ?? null,
      })),
    ),
  );

  let imageCounter = 0;
  out.push(
    insert(
      "product_images",
      demoProducts.flatMap((p) =>
        p.images.map((img, i) => ({
          id: demoId("image", ++imageCounter),
          product_id: productIds.get(p.slug)!,
          url: unsplash(img.photo, 1400),
          alt: img.alt,
          is_cover: i === 0,
          sort_order: i,
        })),
      ),
    ),
  );

  let optionCounter = 0;
  let variantCounter = 0;
  const options: Record<string, SqlValue>[] = [];
  const variants: Record<string, SqlValue>[] = [];
  for (const p of demoProducts) {
    (p.variants ?? []).forEach((group, gi) => {
      const optionId = demoId("option", ++optionCounter);
      options.push({
        id: optionId,
        product_id: productIds.get(p.slug)!,
        name: group.name,
        is_required: group.required ?? true,
        sort_order: gi,
      });
      group.values.forEach((value, vi) => {
        variants.push({
          id: demoId("variant", ++variantCounter),
          product_id: productIds.get(p.slug)!,
          option_id: optionId,
          label: value.label,
          sku: value.sku ?? null,
          price: value.price ?? null,
          sale_price: value.salePrice ?? null,
          sort_order: vi,
        });
      });
    });
  }
  out.push(insert("product_variant_options", options));
  out.push(insert("product_variants", variants));

  let specCounter = 0;
  out.push(
    insert(
      "product_specifications",
      demoProducts.flatMap((p) =>
        (p.specs ?? []).map((s, i) => ({
          id: demoId("spec", ++specCounter),
          product_id: productIds.get(p.slug)!,
          attribute_id: attributeIds.get(s.attribute)!,
          value: s.value,
          sort_order: i,
        })),
      ),
    ),
  );

  out.push(
    insert(
      "product_tags",
      demoProducts.flatMap((p) =>
        (p.tags ?? []).map((slug) => ({ product_id: productIds.get(p.slug)!, tag_id: tagIds.get(slug)! })),
      ),
    ),
  );

  out.push(
    insert(
      "product_environments",
      demoProducts.flatMap((p) =>
        (p.environments ?? []).map((slug) => ({
          product_id: productIds.get(p.slug)!,
          environment_id: environmentIds.get(slug)!,
        })),
      ),
    ),
  );

  // Produtos que combinam (relação manual)
  out.push(
    insert("product_relations", [
      { product_id: productIds.get("porcelanato-acetinado-calacata-90x90")!, related_product_id: productIds.get("argamassa-ac-iii-porcelanato-20kg")!, relation_type: "combines", sort_order: 0 },
      { product_id: productIds.get("porcelanato-acetinado-calacata-90x90")!, related_product_id: productIds.get("rejunte-acrilico-cinza-platina-1kg")!, relation_type: "combines", sort_order: 1 },
      { product_id: productIds.get("tinta-acrilica-premium-fosca-branco-neve")!, related_product_id: productIds.get("kit-rolo-de-la-23cm-com-bandeja")!, relation_type: "combines", sort_order: 0 },
      { product_id: productIds.get("tinta-acrilica-premium-fosca-branco-neve")!, related_product_id: productIds.get("trincha-cerdas-gris-2-polegadas")!, relation_type: "combines", sort_order: 1 },
      { product_id: productIds.get("cuba-de-apoio-retangular-branca")!, related_product_id: productIds.get("misturador-monocomando-lavatorio-preto")!, relation_type: "combines", sort_order: 0 },
      { product_id: productIds.get("cuba-inox-gourmet-60x40")!, related_product_id: productIds.get("torneira-gourmet-bica-movel")!, relation_type: "combines", sort_order: 0 },
    ]),
  );

  // Vitrines da Home
  out.push(
    insert("collections", [
      { id: demoId("collection", 1), name: "Destaques da Home", slug: "destaques", title: "Produtos em destaque", subtitle: "Seleção da equipe para quem está construindo ou reformando.", source: "featured", sort_order: 0, max_items: 8 },
      { id: demoId("collection", 2), name: "Ofertas da Home", slug: "ofertas-home", title: "Ofertas da Cerigatto", subtitle: "Condições especiais por tempo limitado. Consulte disponibilidade.", source: "on_sale", sort_order: 1, max_items: 8 },
      { id: demoId("collection", 3), name: "Mais procurados", slug: "mais-procurados", title: "Mais procurados", subtitle: "Os itens mais consultados no site e as recomendações da equipe.", source: "most_viewed", sort_order: 2, max_items: 8 },
      { id: demoId("collection", 4), name: "Lançamentos", slug: "lancamentos", title: "Novidades no catálogo", subtitle: null, source: "new", sort_order: 3, max_items: 8 },
    ]),
  );

  out.push(
    insert(
      "banners",
      demoBanners.map((b, i) => ({
        id: demoId("banner", i + 1),
        internal_name: b.internalName,
        placement: b.placement,
        desktop_image_url: unsplash(b.photo, 2400),
        mobile_image_url: unsplash(b.photo, 900).replace("fit=crop", "fit=crop&h=1200"),
        image_alt: b.alt,
        eyebrow: b.eyebrow ?? null,
        title: b.title,
        subtitle: b.subtitle ?? null,
        button_text: b.buttonText ?? null,
        button_url: b.buttonUrl ?? null,
        text_position: b.textPosition ?? "left",
        overlay_opacity: b.overlay ?? 40,
        sort_order: i,
      })),
    ),
  );

  // Blog
  const blogCategoryIds = new Map(demoBlogCategories.map((c, i) => [c.slug, demoId("blogCategory", i + 1)]));
  out.push(
    insert(
      "blog_categories",
      demoBlogCategories.map((c, i) => ({ id: blogCategoryIds.get(c.slug)!, name: c.name, slug: c.slug, sort_order: i })),
    ),
  );
  out.push(
    insert(
      "blog_posts",
      demoPosts.map((p, i) => ({
        id: demoId("post", i + 1),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        cover_image_url: unsplash(p.photo, 1600),
        cover_alt: p.alt,
        author_name: "Equipe editorial (demonstração)",
        category_id: blogCategoryIds.get(p.category)!,
        status: "published",
        published_at: raw(`now() - interval '${p.daysAgo} days'`),
        is_featured: p.featured ?? false,
        reading_minutes: p.readingMinutes,
      })),
    ),
  );
  out.push(
    insert(
      "blog_post_products",
      demoPosts.flatMap((p, i) =>
        (p.products ?? []).map((slug, order) => ({
          post_id: demoId("post", i + 1),
          product_id: productIds.get(slug)!,
          sort_order: order,
        })),
      ),
    ),
  );

  // Páginas legais vêm da migration 20261007001000_default_pages.sql

  out.push(
    insert(
      "faqs",
      demoFaqs.map((f, i) => ({ id: demoId("faq", i + 1), question: f.question, answer: f.answer, sort_order: i })),
    ),
  );

  out.push("-- Liga a faixa de aviso de conteúdo de demonstração\n");
  out.push(
    "update public.site_settings set demo_notice_enabled = true, tagline = 'Materiais de construção em Bauru/SP' where id = 1;\n",
  );

  writeFileSync(OUTPUT, out.join("\n"));
  console.info(`✔ Seed gerado em ${path.relative(process.cwd(), OUTPUT)} (${demoProducts.length} produtos)`);
}

main();
