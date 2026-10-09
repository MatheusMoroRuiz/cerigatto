import type { Availability, ProductCard } from "@/types/catalog";
import { AVAILABILITY_LABELS, AVAILABILITY_TONE } from "@/lib/constants";
import { discountPercent, presentPrice } from "@/lib/pricing";
import { Badge } from "@/components/ui/primitives";

export function ProductBadges({ product, className }: { product: ProductCard; className?: string }) {
  const presentation = presentPrice(product.price, product.sale);
  const off =
    presentation.kind === "price" && presentation.original
      ? discountPercent(presentation.original, presentation.current)
      : 0;
  const badges = [
    product.sale.active ? (
      <Badge key="sale" tone="danger">
        {product.sale.label ?? (off > 0 ? `Oferta −${off}%` : "Oferta")}
      </Badge>
    ) : null,
    product.isNew ? (
      <Badge key="new" tone="ink">
        Novidade
      </Badge>
    ) : null,
    product.isFeatured && !product.sale.active ? (
      <Badge key="featured" tone="accent">
        Destaque
      </Badge>
    ) : null,
  ].filter(Boolean);
  if (badges.length === 0) return null;
  return <div className={className}>{badges}</div>;
}

const DOT: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  muted: "bg-muted-foreground",
  danger: "bg-danger",
};

export function AvailabilityStatus({ value, className }: { value: Availability; className?: string }) {
  return (
    <p className={className}>
      <span className="inline-flex items-center gap-2 text-sm font-medium">
        <span aria-hidden="true" className={`size-2 rounded-full ${DOT[AVAILABILITY_TONE[value]]}`} />
        {AVAILABILITY_LABELS[value]}
      </span>
    </p>
  );
}
