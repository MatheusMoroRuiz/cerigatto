/**
 * Minha Lista de Orçamento — NÃO é carrinho: não há preço total, pagamento
 * ou checkout. Serve para montar uma cotação e enviá-la pelo WhatsApp.
 * Lógica pura (testável); a persistência fica em store.ts.
 */
import { z } from "zod";

export const MAX_QUOTE_ITEMS = 100;
export const MAX_QUANTITY = 100000;

export const quoteItemSchema = z.object({
  productId: z.string().min(1).max(64),
  slug: z.string().min(1).max(160),
  name: z.string().min(1).max(200),
  sku: z.string().max(64).nullable(),
  brand: z.string().max(120).nullable(),
  imageUrl: z.string().max(1000).nullable(),
  unit: z.string().max(40),
  variant: z.string().max(200).nullable(),
  quantity: z.number().positive().max(MAX_QUANTITY),
  addedAt: z.number(),
});

export type QuoteItem = z.infer<typeof quoteItemSchema>;

export type QuoteList = { items: QuoteItem[]; note: string };

export const EMPTY_QUOTE_LIST: QuoteList = { items: [], note: "" };

export function parseQuoteList(raw: unknown): QuoteList {
  const result = z
    .object({ items: z.array(z.unknown()).max(MAX_QUOTE_ITEMS * 2), note: z.string().max(1000).catch("") })
    .safeParse(raw);
  if (!result.success) return EMPTY_QUOTE_LIST;
  const items = result.data.items.flatMap((item) => {
    const parsed = quoteItemSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
  return { items: items.slice(0, MAX_QUOTE_ITEMS), note: result.data.note };
}

export function itemKey(item: Pick<QuoteItem, "productId" | "variant">): string {
  return `${item.productId}::${item.variant ?? ""}`;
}

export function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.min(Math.round(value * 100) / 100, MAX_QUANTITY);
}

/** Adiciona; se já existir o mesmo produto + variação, soma a quantidade */
export function addItem(list: QuoteList, item: Omit<QuoteItem, "addedAt">, now = Date.now()): QuoteList {
  const key = itemKey(item);
  const existing = list.items.find((i) => itemKey(i) === key);
  if (existing) {
    return {
      ...list,
      items: list.items.map((i) =>
        itemKey(i) === key ? { ...i, quantity: normalizeQuantity(i.quantity + item.quantity) } : i,
      ),
    };
  }
  if (list.items.length >= MAX_QUOTE_ITEMS) return list;
  return { ...list, items: [...list.items, { ...item, quantity: normalizeQuantity(item.quantity), addedAt: now }] };
}

export function updateQuantity(list: QuoteList, key: string, quantity: number): QuoteList {
  return {
    ...list,
    items: list.items.map((i) => (itemKey(i) === key ? { ...i, quantity: normalizeQuantity(quantity) } : i)),
  };
}

export function removeItem(list: QuoteList, key: string): QuoteList {
  return { ...list, items: list.items.filter((i) => itemKey(i) !== key) };
}

export function countItems(list: QuoteList): number {
  return list.items.length;
}
