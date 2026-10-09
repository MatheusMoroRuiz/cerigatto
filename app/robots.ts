import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/env";
import { getSiteConfig } from "@/services/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { seo } = await getSiteConfig();
  if (seo.noindexSite) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/busca", "/lista-de-orcamento", "/favoritos", "/*?*preco_min=", "/*?*ordem="],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
