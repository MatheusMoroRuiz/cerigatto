"use client";

import { ClipboardPlus, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import type { ProductCard as ProductCardData } from "@/types/catalog";
import { routes } from "@/lib/routes";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { ProductGrid } from "@/components/product/product-card";
import { quoteListActions } from "@/features/quote-list/store";
import { favoritesActions, useFavorites } from "./store";

const noopSubscribe = () => () => {};

export function FavoritesView() {
  const ids = useFavorites();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [fetched, setFetched] = useState<{ key: string; products: ProductCardData[] } | null>(null);
  const key = [...ids].sort().join(",");
  const products = !key ? [] : fetched?.key === key ? fetched.products : null;

  useEffect(() => {
    if (!hydrated || !key) return;
    const controller = new AbortController();
    fetch(`/api/products/by-ids?ids=${key}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data: { products: ProductCardData[] }) => setFetched({ key, products: data.products }))
      .catch(() => undefined);
    return () => controller.abort();
  }, [key, hydrated]);

  if (!hydrated || products === null) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton aspect-[3/4] rounded-lg" />
        ))}
      </div>
    );
  }

  // Mantém a ordem em que o visitante salvou
  const ordered = ids.flatMap((id) => products.filter((p) => p.id === id));

  if (ordered.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Nenhum favorito salvo"
        description="Toque no coração dos produtos para guardá-los aqui. Seus favoritos ficam salvos neste navegador."
        action={
          <Link href={routes.products()} className={buttonVariants({ variant: "primary" })}>
            Explorar produtos
          </Link>
        }
      />
    );
  }

  function addAll() {
    let added = 0;
    for (const p of ordered) {
      if (p.hasRequiredVariants) continue;
      quoteListActions.add({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        brand: p.brand?.name ?? null,
        imageUrl: p.image?.url ?? null,
        unit: p.price.unit,
        variant: null,
        quantity: 1,
      });
      added += 1;
    }
    const skipped = ordered.length - added;
    toast.success(`${added} ${added === 1 ? "item adicionado" : "itens adicionados"} à Lista de Orçamento`, {
      description: skipped ? `${skipped} produto(s) precisam de escolha de opção na página do produto.` : undefined,
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {ordered.length} {ordered.length === 1 ? "produto salvo" : "produtos salvos"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={addAll}>
            <ClipboardPlus aria-hidden="true" />
            Adicionar à Lista de Orçamento
          </Button>
          <Button variant="ghost" onClick={() => favoritesActions.clear()}>
            Limpar favoritos
          </Button>
        </div>
      </div>
      <ProductGrid products={ordered} />
    </div>
  );
}
