"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics/client";
import { favoritesActions, useFavorites } from "@/features/favorites/store";

export function FavoriteButton({
  productId,
  productName,
  className,
  withLabel = false,
}: {
  productId: string;
  productName: string;
  className?: string;
  withLabel?: boolean;
}) {
  const favorites = useFavorites();
  const active = favorites.includes(productId);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remover ${productName} dos favoritos` : `Salvar ${productName} nos favoritos`}
      onClick={() => {
        const added = favoritesActions.toggle(productId);
        if (added) {
          trackEvent("favorite_add", { productId });
          toast.success("Salvo nos favoritos");
        }
      }}
      className={cn(
        "relative z-10 inline-flex items-center justify-center gap-2 rounded-full transition-colors",
        withLabel
          ? "h-11 border border-border-strong bg-surface px-4 text-sm font-semibold hover:border-foreground"
          : "size-10 bg-surface/90 shadow-sm backdrop-blur hover:bg-surface",
        className,
      )}
    >
      <Heart
        className={cn("size-[18px] transition-colors", active ? "fill-danger text-danger" : "text-foreground")}
        aria-hidden="true"
      />
      {withLabel ? (active ? "Salvo" : "Favoritar") : null}
    </button>
  );
}
