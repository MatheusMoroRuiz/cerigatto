import type { ProductDetail } from "@/types/catalog";
import { absoluteUrl } from "./env";
import { presentPrice } from "./pricing";
import { routes } from "./routes";
import { stripMarkdown, truncate } from "./text";

const AVAILABILITY_SCHEMA: Partial<Record<ProductDetail["availability"], string>> = {
  made_to_order: "https://schema.org/MadeToOrder",
  temporarily_unavailable: "https://schema.org/OutOfStock",
  discontinued: "https://schema.org/Discontinued",
  // "disponível sob consulta" não é estoque garantido: omitido para não informar falsamente
};

/**
 * Product (Schema.org). Oferta (preço) só é informada quando o preço é
 * exibido no site; disponibilidade só quando há um equivalente fiel.
 */
export function buildProductSchema(product: ProductDetail): Record<string, unknown> {
  const url = absoluteUrl(product.canonicalUrl ?? routes.product(product.slug));
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#produto`,
    name: product.name,
    url,
    description: truncate(stripMarkdown(product.shortDescription ?? product.description ?? product.name), 500),
    image: product.images.map((i) => i.url),
  };
  if (product.sku) data.sku = product.sku;
  if (product.model) data.model = product.model;
  if (product.brand) data.brand = { "@type": "Brand", name: product.brand.name };
  if (product.manufacturer) data.manufacturer = { "@type": "Organization", name: product.manufacturer };
  if (product.categoryPath.length) data.category = product.categoryPath.map((c) => c.name).join(" > ");

  const presentation = presentPrice(product.price, product.sale);
  if (presentation.kind === "price") {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: presentation.current.toFixed(2),
      seller: { "@id": absoluteUrl("/#empresa") },
    };
    const availability = AVAILABILITY_SCHEMA[product.availability];
    if (availability) offer.availability = availability;
    if (presentation.original && product.sale.endsAt) offer.priceValidUntil = product.sale.endsAt.slice(0, 10);
    data.offers = offer;
  }
  return data;
}
