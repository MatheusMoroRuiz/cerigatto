"use client";

import { ClipboardPlus, Clock, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import type { Availability, PriceInfo, SaleInfo, VariantGroup } from "@/types/catalog";
import { trackEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/cn";
import { DEFAULT_CTA_LABEL } from "@/lib/constants";
import { formatQuantity, parseDecimal } from "@/lib/format";
import { routes } from "@/lib/routes";
import { buildProductMessage, pluralizeUnit } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import { AvailabilityStatus } from "@/components/product/product-badges";
import { quoteListActions } from "@/features/quote-list/store";
import { useWhatsApp } from "@/features/whatsapp/use-whatsapp";
import { WhatsAppIcon } from "@/features/whatsapp/whatsapp-icon";

export type ConsultProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  price: PriceInfo;
  sale: SaleInfo;
  availability: Availability;
  variants: VariantGroup[];
  ctaLabel: string | null;
  whatsappNumber: string | null;
  categoryWhatsappNumber: string | null;
};

/** Monta "Formato: 90x90 · Cor: Branco" a partir da seleção */
export function describeSelection(groups: VariantGroup[], selected: Record<string, string>): string | null {
  const parts = groups.flatMap((group) => {
    const value = group.values.find((v) => v.id === selected[group.id]);
    return value ? [`${group.name}: ${value.label}`] : [];
  });
  return parts.length ? parts.join(" · ") : null;
}

/**
 * Painel comercial do produto: variações, quantidade, preço, status,
 * WhatsApp e Lista de Orçamento. Variações obrigatórias precisam ser
 * escolhidas antes de consultar.
 */
export function ConsultPanel({ product }: { product: ConsultProduct }) {
  const router = useRouter();
  const baseId = useId();
  const { buildUrl, trackClick, config, outOfHours } = useWhatsApp();
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.variants.filter((g) => g.values.length === 1).map((g) => [g.id, g.values[0]!.id]),
    ),
  );
  const [quantityText, setQuantityText] = useState("1");
  const [showErrors, setShowErrors] = useState(false);

  const quantity = Math.max(parseDecimal(quantityText) ?? 1, 0.01);
  const missing = product.variants.filter((g) => g.isRequired && !selected[g.id]);
  const selectedValues = product.variants.flatMap((g) => {
    const value = g.values.find((v) => v.id === selected[g.id]);
    return value ? [value] : [];
  });
  const priced = [...selectedValues].reverse().find((v) => v.price != null);
  const variantSku = [...selectedValues].reverse().find((v) => v.sku)?.sku ?? null;
  const availability = [...selectedValues].reverse().find((v) => v.availability)?.availability ?? product.availability;
  const selectionLabel = describeSelection(product.variants, selected);
  const productUrl = `${config.siteUrl}${routes.product(product.slug)}`;

  const message = buildProductMessage({
    intro: config.whatsapp.productIntro,
    outro: config.whatsapp.productOutro,
    productName: product.name,
    sku: variantSku ?? product.sku,
    brand: product.brand,
    variant: selectionLabel,
    quantity,
    unit: product.price.unit,
    url: productUrl,
  });
  const href = buildUrl(message, {
    productNumber: product.whatsappNumber,
    categoryNumber: product.categoryWhatsappNumber,
  });
  const ctaLabel = product.ctaLabel || config.whatsapp.buttonLabel || DEFAULT_CTA_LABEL;

  function validate(): boolean {
    if (missing.length === 0) return true;
    setShowErrors(true);
    document.getElementById(`${baseId}-${missing[0]!.id}`)?.focus();
    toast.error(`Escolha ${missing.map((g) => g.name.toLowerCase()).join(" e ")} antes de continuar.`);
    return false;
  }

  function addToList() {
    if (!validate()) return;
    quoteListActions.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: variantSku ?? product.sku,
      brand: product.brand,
      imageUrl: product.imageUrl,
      unit: product.price.unit,
      variant: selectionLabel,
      quantity,
    });
    trackEvent("quote_list_add", { productId: product.id });
    toast.success("Adicionado à sua Lista de Orçamento", {
      action: { label: "Ver lista", onClick: () => router.push(routes.quoteList()) },
    });
  }

  const step = (delta: number) => {
    const next = Math.max(1, Math.round(quantity) + delta);
    setQuantityText(String(next));
  };

  const whatsappButton = (className?: string, compact = false) =>
    config.whatsapp.isEnabled ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={compact ? "product-whatsapp-mobile" : "product-whatsapp"}
        onClick={(event) => {
          if (!validate()) {
            event.preventDefault();
            return;
          }
          trackClick({ productId: product.id, categoryId: product.categoryId, origin: compact ? "product_sticky" : "product_page" });
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2.5 rounded-md bg-whatsapp font-semibold text-whatsapp-foreground transition-colors hover:bg-whatsapp-hover",
          className,
        )}
      >
        <WhatsAppIcon className="size-5 shrink-0" />
        <span className="truncate">{compact ? "Consultar no WhatsApp" : ctaLabel}</span>
      </a>
    ) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Price
          price={product.price}
          sale={product.sale}
          variantPrice={priced?.price}
          variantSalePrice={priced?.salePrice}
          size="lg"
        />
        <AvailabilityStatus value={availability} />
      </div>

      {product.variants.map((group) => {
        const groupError = showErrors && group.isRequired && !selected[group.id];
        return (
          <fieldset key={group.id} aria-describedby={groupError ? `${baseId}-${group.id}-error` : undefined}>
            <legend className="mb-2.5 text-sm font-semibold">
              {group.name}
              {group.isRequired ? <span className="ml-1 text-muted-foreground">(obrigatório)</span> : null}
              {selected[group.id] ? (
                <span className="ml-2 font-normal text-muted-foreground">
                  {group.values.find((v) => v.id === selected[group.id])?.label}
                </span>
              ) : null}
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={group.name}>
              {group.values.map((value, i) => {
                const active = selected[group.id] === value.id;
                return (
                  <button
                    key={value.id}
                    id={i === 0 ? `${baseId}-${group.id}` : undefined}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setSelected((s) => ({ ...s, [group.id]: value.id }));
                    }}
                    className={cn(
                      "min-h-11 rounded-md border px-4 text-sm font-medium transition-colors",
                      active
                        ? "border-secondary bg-secondary text-secondary-foreground"
                        : "border-border-strong bg-surface hover:border-foreground",
                      groupError && !active && "border-danger",
                    )}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
            {groupError ? (
              <p id={`${baseId}-${group.id}-error`} role="alert" className="mt-2 text-xs font-medium text-danger">
                Escolha uma opção de {group.name.toLowerCase()}.
              </p>
            ) : null}
          </fieldset>
        );
      })}

      <div>
        <label htmlFor={`${baseId}-qty`} className="mb-2.5 block text-sm font-semibold">
          Quantidade desejada <span className="font-normal text-muted-foreground">({pluralizeUnit(product.price.unit, 2)})</span>
        </label>
        <div className="flex h-12 w-44 items-stretch overflow-hidden rounded-md border border-border-strong bg-surface">
          <button type="button" onClick={() => step(-1)} className="w-12 hover:bg-muted" aria-label="Diminuir quantidade">
            <Minus className="mx-auto size-4" aria-hidden="true" />
          </button>
          <input
            id={`${baseId}-qty`}
            inputMode="decimal"
            value={quantityText}
            onChange={(event) => setQuantityText(event.target.value.replace(/[^\d.,]/g, "").slice(0, 8))}
            onBlur={() => setQuantityText(formatQuantity(quantity))}
            className="w-full min-w-0 border-x border-border text-center font-mono text-base font-semibold outline-none focus-visible:bg-primary-soft"
          />
          <button type="button" onClick={() => step(1)} className="w-12 hover:bg-muted" aria-label="Aumentar quantidade">
            <Plus className="mx-auto size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {whatsappButton("h-14 px-6 text-base")}
        <Button variant="outline" size="lg" onClick={addToList} data-testid="add-to-quote">
          <ClipboardPlus aria-hidden="true" />
          Adicionar à Lista de Orçamento
        </Button>
        {outOfHours ? (
          <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {outOfHours}
          </p>
        ) : null}
        <p className="text-xs leading-relaxed text-muted-foreground">
          Sem compra on-line: nossa equipe confirma disponibilidade, valores e entrega pelo WhatsApp.
        </p>
      </div>

      {/* Barra fixa no mobile — não esconde conteúdo (a página reserva espaço) */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-surface/95 px-4 pt-3 backdrop-blur lg:hidden">
        <div className="mb-3 flex gap-2">
          <Button variant="outline" size="icon" onClick={addToList} aria-label="Adicionar à Lista de Orçamento">
            <ClipboardPlus aria-hidden="true" />
          </Button>
          {whatsappButton("h-11 flex-1 px-4 text-sm", true)}
        </div>
      </div>
    </div>
  );
}
