import type { ProductCard as ProductCardData } from "@/types/catalog";
import { Rail, RailItem } from "@/components/ui/rail";
import { ProductCard } from "./product-card";

export function ProductRail({ products, label }: { products: ProductCardData[]; label: string }) {
  if (products.length === 0) return null;
  return (
    <Rail label={label}>
      {products.map((product) => (
        <RailItem key={product.id}>
          <ProductCard product={product} />
        </RailItem>
      ))}
    </Rail>
  );
}
