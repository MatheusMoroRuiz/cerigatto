"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { SORT_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SortSelect({ value, hasQuery }: { value: string; hasQuery: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const options = SORT_OPTIONS.filter((o) => hasQuery || o.value !== "relevance");
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted-foreground sm:inline">Ordenar por</span>
      <select
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("pagina");
          if (event.target.value === "relevance") params.delete("ordem");
          else params.set("ordem", event.target.value);
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="h-10 rounded-md border border-border-strong bg-surface px-3 text-sm font-medium"
        aria-label="Ordenar produtos"
      >
        {!hasQuery ? <option value="relevance">Destaques</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Filtros no mobile: o mesmo painel (renderizado no servidor) dentro de um Sheet */
export function MobileFilters({ children, activeCount, resultCount }: { children: ReactNode; activeCount: number; resultCount: number }) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const [lastParams, setLastParams] = useState(searchParams.toString());
  if (lastParams !== searchParams.toString()) {
    setLastParams(searchParams.toString());
    setOpen(false);
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal aria-hidden="true" />
          Filtros{activeCount ? ` (${activeCount})` : ""}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        title="Filtrar produtos"
        footer={
          <Button className="w-full" variant="secondary" onClick={() => setOpen(false)}>
            Ver {resultCount} {resultCount === 1 ? "produto" : "produtos"}
          </Button>
        }
      >
        <div className="px-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
