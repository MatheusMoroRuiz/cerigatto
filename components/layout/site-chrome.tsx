import type { ReactNode } from "react";
import { publicEnv } from "@/lib/env";
import { getSiteConfig } from "@/services/settings";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AnalyticsProvider } from "@/features/analytics/analytics-provider";
import { FloatingWhatsApp } from "@/features/whatsapp/floating-whatsapp";
import { SiteConfigProvider } from "@/features/whatsapp/config-context";
import { LocalBusinessJsonLd } from "@/components/seo/local-business";

/** Tokens de cor que o painel pode sobrescrever (somente hex válidos) */
const THEMEABLE = ["primary", "primary-hover", "accent", "secondary", "background", "foreground", "whatsapp"] as const;

function themeCss(theme: Record<string, string>): string | null {
  const rules = THEMEABLE.filter((key) => /^#[0-9a-fA-F]{6}$/.test(theme[key] ?? "")).map(
    (key) => `--${key}:${theme[key]};`,
  );
  return rules.length ? `:root{${rules.join("")}}` : null;
}

/** Estrutura pública: cabeçalho, rodapé, WhatsApp flutuante e analytics */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const config = await getSiteConfig();
  const css = themeCss(config.site.theme);

  return (
    <SiteConfigProvider
      value={{
        siteUrl: publicEnv.siteUrl,
        siteName: config.site.siteName,
        whatsapp: config.whatsapp,
        hours: config.hours,
      }}
    >
      {css ? <style>{css}</style> : null}
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-md bg-secondary px-4 py-2 text-secondary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      {config.site.demoNoticeEnabled ? (
        <div className="bg-primary text-primary-foreground">
          <p className="mx-auto max-w-[1440px] px-4 py-1.5 text-center text-xs font-medium sm:px-6 lg:px-10">
            Ambiente de demonstração: produtos, marcas, preços e banners são fictícios.
          </p>
        </div>
      ) : null}
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
      <AnalyticsProvider
        ga4Id={config.site.ga4Id ?? publicEnv.ga4Id}
        gtmId={config.site.gtmId ?? publicEnv.gtmId}
        metaPixelId={config.site.metaPixelId ?? publicEnv.metaPixelId}
      />
      <LocalBusinessJsonLd config={config} />
    </SiteConfigProvider>
  );
}
