"use client";

import { Loader2, Search, Tag, LayoutGrid, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchSuggestions } from "@/types/catalog";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

const EMPTY: SearchSuggestions = { products: [], categories: [], brands: [] };
const DEBOUNCE_MS = 250;

type Option = { id: string; href: string; label: string; kind: "product" | "category" | "brand" | "all" };

/**
 * Busca com autocomplete (combobox ARIA). Funciona sem JavaScript: o
 * formulário envia GET para /busca.
 */
export function SearchBar({ className, autoFocus = false, size = "lg" }: { className?: string; autoFocus?: boolean; size?: "md" | "lg" }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [fetched, setFetched] = useState<{ term: string; data: SearchSuggestions } | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const term = query.trim();
  const hasTerm = term.length >= 2;
  const results = hasTerm && fetched ? fetched.data : EMPTY;
  const loading = hasTerm && fetched?.term !== term;

  useEffect(() => {
    if (!hasTerm) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (response.ok) setFetched({ term, data: (await response.json()) as SearchSuggestions });
      } catch {
        // requisição cancelada ou falha de rede: mantém resultados anteriores
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term, hasTerm]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const options = useMemo<Option[]>(() => {
    if (!hasTerm) return [];
    return [
      ...results.products.map((p) => ({ id: `p-${p.id}`, href: routes.product(p.slug), label: p.name, kind: "product" as const })),
      ...results.categories.map((c) => ({ id: `c-${c.slug}`, href: routes.category(c.slug), label: c.name, kind: "category" as const })),
      ...results.brands.map((b) => ({ id: `b-${b.slug}`, href: routes.brand(b.slug), label: b.name, kind: "brand" as const })),
      { id: "all", href: routes.search(term), label: `Ver todos os resultados para “${term}”`, kind: "all" as const },
    ];
  }, [results, term, hasTerm]);

  const showPanel = open && hasTerm;

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (event.key === "Enter" && active >= 0 && options[active]) {
      event.preventDefault();
      go(options[active]!.href);
    }
  }

  const productImage = (id: string) => results.products.find((p) => `p-${p.id}` === id);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        action={routes.search()}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (term) go(routes.search(term));
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Buscar produtos, marcas ou códigos
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={`${listId}-input`}
            name="q"
            type="search"
            autoComplete="off"
            autoFocus={autoFocus}
            enterKeyHint="search"
            placeholder="Busque por produto, marca ou código"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={`${listId}-list`}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${options[active]?.id}` : undefined}
            className={cn(
              "w-full rounded-md border border-border-strong bg-surface pr-24 pl-12 text-[0.95rem] shadow-[inset_0_1px_0_rgb(0_0_0/0.02)] transition-colors placeholder:text-muted-foreground hover:border-foreground/40 focus:border-primary focus:outline-2 focus:outline-offset-0 focus:outline-primary/25 [&::-webkit-search-cancel-button]:hidden",
              size === "lg" ? "h-12" : "h-11",
            )}
          />
          <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1">
            {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-sm bg-secondary px-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/85"
            >
              Buscar
            </button>
          </div>
        </div>
      </form>

      {showPanel ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border bg-surface shadow-2xl">
          <ul id={`${listId}-list`} role="listbox" aria-label="Sugestões de busca" className="max-h-[70vh] overflow-y-auto py-2">
            {options.length === 1 && !loading ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">Nenhuma sugestão. Tente outro termo ou o código do produto.</li>
            ) : null}
            {options.map((option, index) => {
              const product = option.kind === "product" ? productImage(option.id) : null;
              const showGroup = index === 0 || options[index - 1]?.kind !== option.kind;
              return (
                <li key={option.id} role="presentation">
                  {showGroup && option.kind !== "all" ? (
                    <p className="px-4 pt-2 pb-1 font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
                      {option.kind === "product" ? "Produtos" : option.kind === "category" ? "Categorias" : "Marcas"}
                    </p>
                  ) : null}
                  <a
                    id={`${listId}-${option.id}`}
                    role="option"
                    aria-selected={index === active}
                    href={option.href}
                    onClick={(event) => {
                      event.preventDefault();
                      go(option.href);
                    }}
                    onMouseEnter={() => setActive(index)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm",
                      index === active && "bg-muted",
                      option.kind === "all" && "mt-1 border-t pt-3 font-semibold text-primary",
                    )}
                  >
                    {option.kind === "product" ? (
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-sm bg-muted">
                        {product?.imageUrl ? (
                          <Image src={product.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                        ) : null}
                      </span>
                    ) : option.kind === "category" ? (
                      <LayoutGrid className="size-4 text-muted-foreground" aria-hidden="true" />
                    ) : option.kind === "brand" ? (
                      <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="size-4" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1">{option.label}</span>
                      {product?.brand || product?.sku ? (
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {[product.brand, product.sku ? `Cód. ${product.sku}` : null].filter(Boolean).join(" · ")}
                        </span>
                      ) : null}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
