"use client";

import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { CategoryNode } from "@/types/catalog";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { CategoryIcon } from "./category-icon";

/**
 * Mega menu de departamentos (desktop). Categorias vêm do banco, em árvore.
 * Abre por clique ou passagem do mouse; fecha com Esc, clique fora ou navegação.
 */
export function MegaMenu({ tree }: { tree: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState(tree[0]?.slug ?? "");
  const pathname = usePathname();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (tree.length === 0) return null;
  const active = tree.find((c) => c.slug === activeSlug) ?? tree[0]!;

  const scheduleOpen = (value: boolean) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(value), value ? 120 : 220);
  };

  return (
    <div ref={rootRef} onMouseLeave={() => scheduleOpen(false)} className="static">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => scheduleOpen(true)}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
          open ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:bg-primary-hover",
        )}
      >
        <Menu className="size-4" aria-hidden="true" />
        Departamentos
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      <div
        id={panelId}
        hidden={!open}
        onMouseEnter={() => window.clearTimeout(hoverTimer.current)}
        className="absolute inset-x-0 top-full z-40 border-t border-b bg-surface shadow-[0_24px_48px_-24px_rgb(20_25_31/0.35)]"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-[280px_1fr] px-10">
          <ul className="border-r py-4 pr-4" aria-label="Departamentos">
            {tree.map((category) => (
              <li key={category.id}>
                <Link
                  href={routes.category(category.slug)}
                  onMouseEnter={() => setActiveSlug(category.slug)}
                  onFocus={() => setActiveSlug(category.slug)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    category.slug === active.slug ? "bg-muted text-foreground" : "text-foreground/80 hover:bg-muted",
                  )}
                >
                  <CategoryIcon name={category.icon} className="size-[18px] text-primary" />
                  <span className="flex-1">{category.name}</span>
                  {category.children.length ? <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" /> : null}
                </Link>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-[1fr_260px] gap-8 py-6 pl-8">
            <div>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <p className="font-display text-xl font-bold">{active.name}</p>
                <Link href={routes.category(active.slug)} className="text-sm font-semibold text-primary hover:underline">
                  Ver tudo em {active.name}
                </Link>
              </div>
              {active.children.length ? (
                <ul className="grid grid-cols-2 gap-x-8 gap-y-5 xl:grid-cols-3">
                  {active.children.map((child) => (
                    <li key={child.id}>
                      <Link href={routes.category(child.slug)} className="font-semibold hover:text-primary">
                        {child.name}
                      </Link>
                      {child.children.length ? (
                        <ul className="mt-2 space-y-1.5">
                          {child.children.map((grandchild) => (
                            <li key={grandchild.id}>
                              <Link
                                href={routes.category(grandchild.slug)}
                                className="text-sm text-muted-foreground hover:text-foreground"
                              >
                                {grandchild.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : child.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{child.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{active.description}</p>
              )}
            </div>
            {active.imageUrl ? (
              <Link
                href={routes.category(active.slug)}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={active.imageUrl}
                  alt=""
                  fill
                  sizes="260px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary/85 to-transparent p-4 text-sm font-semibold text-white">
                  Explorar {active.name}
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
