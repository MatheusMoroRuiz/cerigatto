import { Check, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import type { CatalogFacets, CatalogFilters } from "@/types/catalog";
import { AVAILABILITY_LABELS } from "@/lib/constants";
import { buildCatalogHref, countActiveFilters, toggleListValue, type RawSearchParams } from "@/lib/catalog-params";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";

export type LockedFilters = { category?: string; brand?: string; onSale?: boolean; environment?: string };

type PanelProps = {
  facets: CatalogFacets;
  filters: CatalogFilters;
  current: RawSearchParams;
  basePath: string;
  locked: LockedFilters;
  subcategories?: { name: string; slug: string; href: string }[];
};

function FacetGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b py-4 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function FacetLink({ href, active, label, count, noFollow }: { href: string; active: boolean; label: string; count?: number; noFollow: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      rel={noFollow ? "nofollow" : undefined}
      aria-current={active ? "true" : undefined}
      className="group flex items-center gap-2.5 rounded-sm py-1.5 text-sm hover:text-primary"
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors",
          active ? "border-primary bg-primary text-primary-foreground" : "border-border-strong bg-surface group-hover:border-primary",
        )}
      >
        {active ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
      <span className="flex-1">{label}</span>
      {count != null ? <span className="font-mono text-xs text-muted-foreground">{count}</span> : null}
    </Link>
  );
}

/** Painel de filtros 100% em links (indexável e funcional sem JavaScript) */
export function FilterPanel({ facets, filters, current, basePath, locked, subcategories }: PanelProps) {
  const hasFilters = countActiveFilters(filters, { category: locked.category, onSale: locked.onSale }) > 0;
  const noFollow = hasFilters;
  const href = (changes: Record<string, string | string[] | null>) => buildCatalogHref(basePath, current, changes);

  return (
    <div>
      {subcategories?.length ? (
        <FacetGroup title="Subcategorias">
          <ul className="space-y-1">
            {subcategories.map((sub) => (
              <li key={sub.slug}>
                <Link href={sub.href} className="block py-1 text-sm hover:text-primary">
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </FacetGroup>
      ) : null}

      {!locked.category && facets.categories.length > 0 ? (
        <FacetGroup title="Categoria">
          <ul>
            {facets.categories.map((c) => {
              const active = filters.category === c.slug;
              return (
                <li key={c.slug}>
                  <FacetLink
                    href={href({ categoria: active ? null : c.slug })}
                    active={active}
                    label={c.label}
                    count={c.count}
                    noFollow={noFollow}
                  />
                </li>
              );
            })}
          </ul>
        </FacetGroup>
      ) : null}

      {!locked.brand && facets.brands.length > 0 ? (
        <FacetGroup title="Marca">
          <ul>
            {facets.brands.map((b) => {
              const active = filters.brands?.includes(b.slug) ?? false;
              return (
                <li key={b.slug}>
                  <FacetLink
                    href={href({ marca: toggleListValue(current.marca, b.slug) })}
                    active={active}
                    label={b.label}
                    count={b.count}
                    noFollow={noFollow}
                  />
                </li>
              );
            })}
          </ul>
        </FacetGroup>
      ) : null}

      {facets.attributes.map((attribute, index) => (
        <FacetGroup key={attribute.slug} title={attribute.name} defaultOpen={index < 3}>
          <ul className="max-h-64 overflow-y-auto pr-1">
            {attribute.values.map((value) => {
              const active = filters.attributes?.[attribute.slug]?.includes(value.slug) ?? false;
              return (
                <li key={value.slug}>
                  <FacetLink
                    href={href({ [attribute.slug]: toggleListValue(current[attribute.slug], value.slug) })}
                    active={active}
                    label={attribute.unit && /^[\d.,x/ ]+$/i.test(value.label) ? `${value.label} ${attribute.unit}` : value.label}
                    count={value.count}
                    noFollow
                  />
                </li>
              );
            })}
          </ul>
        </FacetGroup>
      ))}

      {facets.price.min != null && facets.price.max != null && facets.price.max > facets.price.min ? (
        <FacetGroup title="Faixa de preço">
          <form action={basePath} className="space-y-3">
            {Object.entries(current)
              .filter(([key]) => !["preco_min", "preco_max", "pagina"].includes(key))
              .map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={Array.isArray(value) ? value.join(",") : (value ?? "")} />
              ))}
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">
                Mínimo
                <input
                  name="preco_min"
                  inputMode="decimal"
                  defaultValue={filters.priceMin ?? ""}
                  placeholder={formatCurrency(Math.floor(facets.price.min))}
                  className="mt-1 h-10 w-full rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Máximo
                <input
                  name="preco_max"
                  inputMode="decimal"
                  defaultValue={filters.priceMax ?? ""}
                  placeholder={formatCurrency(Math.ceil(facets.price.max))}
                  className="mt-1 h-10 w-full rounded-md border border-border-strong bg-surface px-2 text-sm text-foreground"
                />
              </label>
            </div>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Aplicar faixa de preço
            </Button>
            <p className="text-xs text-muted-foreground">Considera apenas produtos com preço exibido no site.</p>
          </form>
        </FacetGroup>
      ) : null}

      <FacetGroup title="Condições">
        <ul>
          {!locked.onSale ? (
            <li>
              <FacetLink href={href({ oferta: filters.onSale ? null : "1" })} active={Boolean(filters.onSale)} label="Em oferta" noFollow={noFollow} />
            </li>
          ) : null}
          <li>
            <FacetLink href={href({ novidades: filters.isNew ? null : "1" })} active={Boolean(filters.isNew)} label="Novidades" noFollow={noFollow} />
          </li>
          {facets.availability
            .filter((a) => a.value !== "discontinued")
            .map((a) => {
              const slug = a.value.replace(/_/g, "-");
              const active = filters.availability?.includes(a.value) ?? false;
              return (
                <li key={a.value}>
                  <FacetLink
                    href={href({ disponibilidade: toggleListValue(current.disponibilidade, slug) })}
                    active={active}
                    label={AVAILABILITY_LABELS[a.value]}
                    count={a.count}
                    noFollow
                  />
                </li>
              );
            })}
        </ul>
      </FacetGroup>
    </div>
  );
}

/** Chips dos filtros ativos com remoção individual */
export function ActiveFilters({
  facets,
  filters,
  current,
  basePath,
  locked,
}: Omit<PanelProps, "subcategories">) {
  const chips: { label: string; href: string }[] = [];
  const href = (changes: Record<string, string | string[] | null>) => buildCatalogHref(basePath, current, changes);
  
  if (filters.category && !locked.category) {
    const name = facets.categories.find((c) => c.slug === filters.category)?.label ?? filters.category;
    chips.push({ label: name, href: href({ categoria: null }) });
  }
  if (!locked.brand) {
    for (const slug of filters.brands ?? []) {
      const name = facets.brands.find((b) => b.slug === slug)?.label ?? slug;
      chips.push({ label: name, href: href({ marca: toggleListValue(current.marca, slug) }) });
    }
  }
  for (const [attr, values] of Object.entries(filters.attributes ?? {})) {
    const facet = facets.attributes.find((a) => a.slug === attr);
    for (const value of values) {
      const label = facet?.values.find((v) => v.slug === value)?.label ?? value;
      chips.push({ label: `${facet?.name ?? attr}: ${label}`, href: href({ [attr]: toggleListValue(current[attr], value) }) });
    }
  }
  if (filters.onSale && !locked.onSale) chips.push({ label: "Em oferta", href: href({ oferta: null }) });
  if (filters.isNew) chips.push({ label: "Novidades", href: href({ novidades: null }) });
  for (const a of filters.availability ?? []) {
    chips.push({
      label: AVAILABILITY_LABELS[a],
      href: href({ disponibilidade: toggleListValue(current.disponibilidade, a.replace(/_/g, "-")) }),
    });
  }
  if (filters.priceMin != null || filters.priceMax != null) {
    const min = filters.priceMin != null ? formatCurrency(filters.priceMin) : "—";
    const max = filters.priceMax != null ? formatCurrency(filters.priceMax) : "—";
    chips.push({ label: `Preço: ${min} a ${max}`, href: href({ preco_min: null, preco_max: null }) });
  }
  if (chips.length === 0) return null;

  const clearAll = buildCatalogHref(basePath, {}, { q: filters.query ?? null });
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          scroll={false}
          rel="nofollow"
          className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface py-1 pr-2 pl-3 text-xs font-medium hover:border-foreground"
        >
          {chip.label}
          <X className="size-3.5" aria-label="Remover filtro" />
        </Link>
      ))}
      <Link href={clearAll} scroll={false} className="text-xs font-semibold text-primary hover:underline">
        Limpar filtros
      </Link>
    </div>
  );
}
