"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics/client";

/** Web Share API no mobile; nos demais, copia o link */
export function ShareButton({ url, title, productId, className }: { url: string; title: string; productId?: string; className?: string }) {
  async function share() {
    trackEvent("share", { productId });
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar. Copie o endereço na barra do navegador.");
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-sm font-semibold hover:border-foreground",
        className,
      )}
    >
      <Share2 className="size-[18px]" aria-hidden="true" />
      Compartilhar
    </button>
  );
}
