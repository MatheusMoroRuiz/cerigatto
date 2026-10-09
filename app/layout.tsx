import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Public_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { absoluteUrl, publicEnv } from "@/lib/env";
import { getSiteConfig } from "@/services/settings";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-display-face",
  display: "swap",
});

const body = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-face",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { site, seo } = await getSiteConfig();
  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    applicationName: site.siteName,
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: site.siteName,
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      ...(seo.defaultOgImageUrl ? { images: [{ url: seo.defaultOgImageUrl }] } : {}),
    },
    twitter: { card: "summary_large_image" },
    robots: seo.noindexSite ? { index: false, follow: false } : { index: true, follow: true },
    verification: {
      ...(seo.googleSiteVerification ? { google: seo.googleSiteVerification } : {}),
      ...(seo.bingSiteVerification ? { other: { "msvalidate.01": seo.bingSiteVerification } } : {}),
    },
    ...(site.faviconUrl ? { icons: { icon: site.faviconUrl } } : {}),
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#18204a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}
