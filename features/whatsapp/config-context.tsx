"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BusinessHour, WhatsAppSettings } from "@/types/settings";

/** Configuração pública do WhatsApp disponível para Client Components */
export type ClientSiteConfig = {
  siteUrl: string;
  siteName: string;
  whatsapp: WhatsAppSettings;
  hours: BusinessHour[];
};

const ConfigContext = createContext<ClientSiteConfig | null>(null);

export function SiteConfigProvider({ value, children }: { value: ClientSiteConfig; children: ReactNode }) {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useSiteConfig(): ClientSiteConfig {
  const value = useContext(ConfigContext);
  if (!value) throw new Error("useSiteConfig precisa estar dentro de <SiteConfigProvider>");
  return value;
}
