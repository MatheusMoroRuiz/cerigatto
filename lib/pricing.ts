import type { PriceInfo, SaleInfo } from "@/types/catalog";
import { formatCurrency } from "./format";

/** Oferta vigente: marcador ativo e dentro da janela de datas */
export function isSaleActive(sale: Omit<SaleInfo, "active">, now: Date = new Date()): boolean {
  if (!sale.isOnSale) return false;
  if (sale.startsAt && new Date(sale.startsAt) > now) return false;
  if (sale.endsAt && new Date(sale.endsAt) <= now) return false;
  return true;
}

export type PricePresentation =
  | { kind: "price"; current: number; original: number | null; unit: string }
  | { kind: "label"; text: string; isSale: boolean }
  | { kind: "hidden"; isSale: boolean };

export const PRICE_LABELS = {
  consult: "Consulte o preço",
  on_request: "Preço sob consulta",
  saleNoPrice: "Oferta especial — consulte condições",
} as const;

/**
 * Decide como o preço aparece. Nunca há checkout: o preço é informativo.
 * Uma variação selecionada pode sobrescrever preço e preço promocional.
 */
export function presentPrice(
  price: PriceInfo,
  sale: SaleInfo,
  options: { variantPrice?: number | null; variantSalePrice?: number | null } = {},
): PricePresentation {
  const saleActive = sale.active;
  const basePrice = options.variantPrice ?? price.price;
  const baseSale = options.variantPrice != null ? (options.variantSalePrice ?? null) : price.salePrice;

  if (price.display === "show" && basePrice != null) {
    if (saleActive && baseSale != null && baseSale < basePrice) {
      return { kind: "price", current: baseSale, original: basePrice, unit: price.unit };
    }
    return { kind: "price", current: basePrice, original: null, unit: price.unit };
  }
  if (saleActive && price.display !== "hidden") {
    return { kind: "label", text: PRICE_LABELS.saleNoPrice, isSale: true };
  }
  if (price.display === "consult") return { kind: "label", text: PRICE_LABELS.consult, isSale: false };
  if (price.display === "on_request") return { kind: "label", text: PRICE_LABELS.on_request, isSale: false };
  if (price.display === "show") return { kind: "label", text: PRICE_LABELS.consult, isSale: false };
  return { kind: "hidden", isSale: saleActive };
}

export function discountPercent(original: number, current: number): number {
  if (original <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
}

/** Texto curto de preço para mensagens (WhatsApp, lista de orçamento) */
export function priceToText(presentation: PricePresentation): string | null {
  if (presentation.kind === "price") return `${formatCurrency(presentation.current)} / ${presentation.unit}`;
  return null;
}
