import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ProductCard as ProductCardData } from "@/types/catalog";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { CardWhatsApp } from "./card-whatsapp";
import { FavoriteButton } from "./favorite-button";
import { Price } from "./price";
import { ProductBadges } from "./product-badges";

/**
 * Card de produto. O card inteiro é clicável (link "esticado"); os botões
 * internos ficam acima do link. No mobile nada depende de hover.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
}) {
  const href = routes.product(product.slug);
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-surface transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-[#f7f7f5]">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" aria-hidden="true" />
            <span className="sr-only">Imagem indisponível</span>
          </div>
        )}
        <ProductBadges product={product} className="absolute top-3 left-3 flex flex-col items-start gap-1.5" />
        <FavoriteButton productId={product.id} productName={product.name} className="absolute top-2.5 right-2.5" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.brand ? (
          <p className="font-mono text-[0.68rem] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            {product.brand.name}
          </p>
        ) : null}
        <h3 className="line-clamp-2 text-[0.95rem] leading-snug font-semibold text-foreground">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        {product.sku ? <p className="font-mono text-[0.7rem] text-muted-foreground">Cód. {product.sku}</p> : null}
        <div className="mt-auto pt-2">
          <Price price={product.price} sale={product.sale} size="sm" />
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          {product.hasRequiredVariants ? (
            <span className="relative z-10 inline-flex h-10 items-center justify-center rounded-md border border-border-strong px-3 text-sm font-semibold transition-colors group-hover:border-foreground">
              Ver opções
            </span>
          ) : (
            <>
              <span className="hidden h-10 items-center justify-center rounded-md border border-border-strong px-3 text-sm font-semibold transition-colors group-hover:border-foreground sm:inline-flex">
                Ver produto
              </span>
              <CardWhatsApp
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  brand: product.brand?.name ?? null,
                  whatsappNumber: product.whatsappNumber,
                }}
                className="lg:opacity-90 lg:group-hover:opacity-100"
              />
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  priorityCount = 0,
  className,
}: {
  products: ProductCardData[];
  priorityCount?: number;
  className?: string;
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
