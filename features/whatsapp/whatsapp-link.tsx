"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { useWhatsApp } from "./use-whatsapp";
import { WhatsAppIcon } from "./whatsapp-icon";

/**
 * Link genérico para o WhatsApp. Sem mensagem informada usa a mensagem padrão
 * configurada no painel.
 */
export function WhatsAppLink({
  message,
  origin,
  children,
  className,
  variant = "whatsapp",
  size = "md",
  showIcon = true,
  categoryNumber,
}: {
  message?: string;
  origin: string;
  children?: ReactNode;
  className?: string;
  variant?: "whatsapp" | "outline" | "ghost" | "plain";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  categoryNumber?: string | null;
}) {
  const { buildUrl, trackClick, config } = useWhatsApp();
  if (!config.whatsapp.isEnabled) return null;
  return (
    <a
      href={buildUrl(message ?? config.whatsapp.defaultMessage, { categoryNumber })}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackClick({ origin })}
      className={cn(variant === "plain" ? "inline-flex items-center gap-2" : buttonVariants({ variant, size }), className)}
    >
      {showIcon ? <WhatsAppIcon className={cn("shrink-0", size === "lg" ? "size-5" : "size-[18px]")} /> : null}
      {children ?? config.whatsapp.buttonLabel}
    </a>
  );
}
