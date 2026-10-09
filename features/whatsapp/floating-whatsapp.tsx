"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useWhatsApp } from "./use-whatsapp";
import { WhatsAppIcon } from "./whatsapp-icon";

/**
 * Botão flutuante do WhatsApp. Na página de produto (mobile) cede lugar à
 * barra fixa de CTA para não cobrir conteúdo; respeita a safe-area do iOS.
 */
export function FloatingWhatsApp() {
  const { buildUrl, trackClick, config } = useWhatsApp();
  const pathname = usePathname();
  const settings = config.whatsapp;
  if (!settings.isEnabled || !settings.showFloatingButton) return null;
  if (pathname.startsWith("/admin")) return null;
  const onProductPage = pathname.startsWith("/produto/");
  const onQuoteList = pathname.startsWith("/lista-de-orcamento");

  return (
    <a
      href={buildUrl(settings.defaultMessage)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackClick({ origin: "floating_button" })}
      aria-label={`${settings.floatingLabel} pelo WhatsApp`}
      className={cn(
        "fixed right-4 z-30 inline-flex items-center gap-2 rounded-full bg-whatsapp p-3.5 text-whatsapp-foreground shadow-[0_12px_32px_-8px_rgb(14_122_61/0.55)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-whatsapp-hover sm:right-6 sm:px-5",
        "bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6",
        (onProductPage || onQuoteList) && "hidden lg:inline-flex",
      )}
    >
      <WhatsAppIcon className="size-6 shrink-0" />
      <span className={cn("text-sm font-semibold", settings.showFloatingLabelMobile ? "inline" : "hidden sm:inline")}>
        {settings.floatingLabel}
      </span>
    </a>
  );
}
