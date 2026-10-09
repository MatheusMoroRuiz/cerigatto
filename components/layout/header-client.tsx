"use client";

import { ChevronDown, ClipboardList, Heart, Menu, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CategoryNode } from "@/types/catalog";
import type { NavLink } from "@/types/settings";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useFavorites } from "@/features/favorites/store";
import { useQuoteList } from "@/features/quote-list/store";
import { CategoryIcon } from "./category-icon";

/** Adiciona sombra discreta ao cabeçalho fixo depois de rolar a página */
export function StickyHeader({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;";
    element.parentElement?.insertBefore(sentinel, element);
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.scrolled = entry && !entry.isIntersecting ? "true" : "false";
    });
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);
  return (
    <header
      ref={ref}
      data-scrolled="false"
      className={cn(
        "sticky top-0 z-40 border-b bg-surface/95 backdrop-blur-md transition-shadow duration-300 supports-[backdrop-filter]:bg-surface/85 data-[scrolled=true]:shadow-[0_8px_24px_-16px_rgb(20_25_31/0.35)]",
        className,
      )}
    >
      {children}
    </header>
  );
}

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={label}
      className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[0.65rem] leading-5 font-bold text-accent-foreground"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function HeaderActions({ compact = false }: { compact?: boolean }) {
  const favorites = useFavorites();
  const quote = useQuoteList();
  const itemClass =
    "relative inline-flex items-center gap-2 rounded-md text-sm font-semibold text-foreground transition-colors hover:bg-muted";
  return (
    <div className="flex items-center gap-1">
      <Link
        href={routes.favorites()}
        className={cn(itemClass, compact ? "size-11 justify-center" : "h-11 px-3")}
        aria-label={`Favoritos${favorites.length ? ` (${favorites.length})` : ""}`}
      >
        <span className="relative">
          <Heart className="size-5" aria-hidden="true" />
          <CountBadge count={favorites.length} label={`${favorites.length} favoritos`} />
        </span>
        {!compact ? <span className="hidden xl:inline">Favoritos</span> : null}
      </Link>
      <Link
        href={routes.quoteList()}
        className={cn(itemClass, compact ? "size-11 justify-center" : "h-11 px-3")}
        aria-label={`Minha Lista de Orçamento${quote.items.length ? ` (${quote.items.length} itens)` : ""}`}
        data-testid="quote-list-link"
      >
        <span className="relative">
          <ClipboardList className="size-5" aria-hidden="true" />
          <CountBadge count={quote.items.length} label={`${quote.items.length} itens na lista`} />
        </span>
        {!compact ? <span className="hidden lg:inline">Lista de Orçamento</span> : null}
      </Link>
    </div>
  );
}

export function MobileMenu({
  tree,
  navLinks,
  phoneHref,
  phoneLabel,
}: {
  tree: CategoryNode[];
  navLinks: NavLink[];
  phoneHref: string | null;
  phoneLabel: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-11 items-center justify-center rounded-md hover:bg-muted lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" title="Menu">
        <nav aria-label="Departamentos" className="px-3 py-3">
          <p className="px-2 pb-2 font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
            Departamentos
          </p>
          <ul>
            {tree.map((category) => (
              <li key={category.id}>
                {category.children.length ? (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-2 py-3 font-medium hover:bg-muted [&::-webkit-details-marker]:hidden">
                      <CategoryIcon name={category.icon} className="size-5 text-primary" />
                      <span className="flex-1">{category.name}</span>
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ul className="mb-2 ml-10 border-l pl-3">
                      <li>
                        <Link href={routes.category(category.slug)} className="block py-2 text-sm font-semibold text-primary">
                          Ver tudo
                        </Link>
                      </li>
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link href={routes.category(child.slug)} className="block py-2 text-sm">
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={routes.category(category.slug)}
                    className="flex items-center gap-3 rounded-md px-2 py-3 font-medium hover:bg-muted"
                  >
                    <CategoryIcon name={category.icon} className="size-5 text-primary" />
                    {category.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Institucional" className="border-t px-3 py-3">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block rounded-md px-2 py-3 font-medium hover:bg-muted">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {phoneHref && phoneLabel ? (
          <div className="border-t px-5 py-4">
            <a href={phoneHref} className="inline-flex items-center gap-2 font-semibold">
              <Phone className="size-4" aria-hidden="true" />
              {phoneLabel}
            </a>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
