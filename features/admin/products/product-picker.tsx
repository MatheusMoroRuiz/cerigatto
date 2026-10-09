"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/form-controls";
import { searchProductsForPicker } from "./picker-actions";

export type PickedProduct = { id: string; name: string; sku: string | null };

/** Seleciona produtos por busca (nome ou SKU) */
export function ProductPicker({
  value,
  onChange,
  excludeId,
  max = 12,
  label = "Buscar produto",
}: {
  value: PickedProduct[];
  onChange: (value: PickedProduct[]) => void;
  excludeId?: string;
  max?: number;
  label?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedProduct[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = window.setTimeout(() => {
      startTransition(async () => setResults(await searchProductsForPicker(query)));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const available = query.trim().length < 2 ? [] : results.filter((r) => r.id !== excludeId && !value.some((v) => v.id === r.id));

  return (
    <div className="grid gap-3">
      {value.length ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((p) => (
            <li key={p.id} className="inline-flex items-center gap-2 rounded-full border bg-muted/60 py-1 pr-1 pl-3 text-sm">
              {p.name}
              <button type="button" onClick={() => onChange(value.filter((v) => v.id !== p.id))} className="inline-flex size-6 items-center justify-center rounded-full hover:bg-surface" aria-label={`Remover ${p.name}`}>
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {value.length < max ? (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input aria-label={label} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Digite nome ou SKU" className="pl-9" />
          {available.length ? (
            <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-md border bg-surface py-1 shadow-xl">
              {available.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange([...value, p]);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span>{p.name}</span>
                    {p.sku ? <span className="font-mono text-xs text-muted-foreground">{p.sku}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : pending ? (
            <p className="mt-1 text-xs text-muted-foreground">Buscando…</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
