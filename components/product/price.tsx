import type { PriceInfo, SaleInfo } from "@/types/catalog";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { discountPercent, presentPrice } from "@/lib/pricing";

/** Exibe preço, "De/Por", rótulo de consulta ou nada — conforme configuração do produto */
export function Price({
  price,
  sale,
  variantPrice,
  variantSalePrice,
  size = "md",
  className,
}: {
  price: PriceInfo;
  sale: SaleInfo;
  variantPrice?: number | null;
  variantSalePrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const presentation = presentPrice(price, sale, { variantPrice, variantSalePrice });

  if (presentation.kind === "hidden") return null;

  if (presentation.kind === "label") {
    return (
      <p
        className={cn(
          "font-semibold",
          presentation.isSale ? "text-danger" : "text-foreground",
          size === "lg" ? "text-lg" : "text-sm",
          className,
        )}
      >
        {presentation.text}
      </p>
    );
  }

  const off = presentation.original ? discountPercent(presentation.original, presentation.current) : 0;
  return (
    <div className={cn("flex flex-col", className)}>
      {presentation.original ? (
        <p className={cn("text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>
          De <span className="line-through">{formatCurrency(presentation.original)}</span>
          {off > 0 ? <span className="ml-1.5 font-semibold text-danger">−{off}%</span> : null}
        </p>
      ) : null}
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        {presentation.original ? (
          <span className={cn("text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>Por</span>
        ) : null}
        <span
          className={cn(
            "font-display font-bold tracking-tight",
            presentation.original ? "text-danger" : "text-foreground",
            size === "lg" ? "text-[2rem] leading-none" : size === "md" ? "text-xl" : "text-base",
          )}
        >
          {formatCurrency(presentation.current)}
        </span>
        <span className={cn("text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>/ {presentation.unit}</span>
      </p>
    </div>
  );
}
