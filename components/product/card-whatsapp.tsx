"use client";

import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { buildProductMessage } from "@/lib/whatsapp";
import { useWhatsApp } from "@/features/whatsapp/use-whatsapp";
import { WhatsAppIcon } from "@/features/whatsapp/whatsapp-icon";

/** Botão rápido de consulta no card (sem variação — para variações obrigatórias o card leva à página) */
export function CardWhatsApp({
  product,
  className,
}: {
  product: { id: string; name: string; slug: string; sku: string | null; brand: string | null; whatsappNumber: string | null };
  className?: string;
}) {
  const { buildUrl, trackClick, config } = useWhatsApp();
  if (!config.whatsapp.isEnabled) return null;
  const message = buildProductMessage({
    intro: config.whatsapp.productIntro,
    outro: config.whatsapp.productOutro,
    productName: product.name,
    sku: product.sku,
    brand: product.brand,
    url: `${config.siteUrl}${routes.product(product.slug)}`,
  });
  return (
    <a
      href={buildUrl(message, { productNumber: product.whatsappNumber })}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackClick({ productId: product.id, origin: "product_card" })}
      aria-label={`Consultar ${product.name} no WhatsApp`}
      className={cn(
        "relative z-10 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-whatsapp px-3 text-sm font-semibold text-whatsapp-foreground transition-colors hover:bg-whatsapp-hover",
        className,
      )}
    >
      <WhatsAppIcon className="size-[18px]" />
      <span>Consultar</span>
    </a>
  );
}
