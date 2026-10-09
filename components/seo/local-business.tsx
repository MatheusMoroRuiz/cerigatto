import type { SiteConfig } from "@/types/settings";
import { absoluteUrl } from "@/lib/env";
import { onlyDigits } from "@/lib/format";
import { JsonLd } from "./json-ld";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * LocalBusiness (Schema.org). Só inclui campos realmente cadastrados — nada
 * de endereço, telefone ou horário inventados.
 */
export function buildLocalBusiness(config: SiteConfig): Record<string, unknown> {
  const { business, site, seo, hours, social } = config;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": seo.localBusinessType || "HardwareStore",
    "@id": absoluteUrl("/#empresa"),
    name: business.tradeName ?? site.siteName,
    url: absoluteUrl("/"),
    areaServed: { "@type": "City", name: `${business.city}, ${business.state}` },
  };
  if (business.legalName) data.legalName = business.legalName;
  if (site.logoUrl) data.logo = site.logoUrl;
  if (site.description) data.description = site.description;
  if (business.phone) data.telephone = `+55${onlyDigits(business.phone)}`;
  if (business.email) data.email = business.email;
  if (business.street) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: [business.street, business.streetNumber, business.complement].filter(Boolean).join(", "),
      ...(business.district ? { addressNeighborhood: business.district } : {}),
      addressLocality: business.city,
      addressRegion: business.state,
      ...(business.postalCode ? { postalCode: business.postalCode } : {}),
      addressCountry: "BR",
    };
  }
  if (business.latitude != null && business.longitude != null) {
    data.geo = { "@type": "GeoCoordinates", latitude: business.latitude, longitude: business.longitude };
  }
  if (business.googleMapsUrl) data.hasMap = business.googleMapsUrl;
  const open = hours.filter((h) => !h.isClosed && h.opensAt && h.closesAt);
  if (open.length) {
    data.openingHoursSpecification = open.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAMES[h.dayOfWeek],
      opens: h.opensAt!.slice(0, 5),
      closes: h.closesAt!.slice(0, 5),
    }));
  }
  if (social.length) data.sameAs = social.map((s) => s.url);
  return data;
}

export function LocalBusinessJsonLd({ config }: { config: SiteConfig }) {
  return <JsonLd data={buildLocalBusiness(config)} />;
}
