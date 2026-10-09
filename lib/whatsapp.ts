/**
 * Montagem de links e mensagens do WhatsApp (wa.me).
 * Funções puras — usadas no servidor e no navegador, cobertas por testes.
 */
import type { BusinessHour } from "@/types/settings";
import { formatQuantity, onlyDigits, TIME_ZONE } from "./format";

/** Junta código do país e número, aceitando entradas com ou sem DDI/formatação */
export function normalizeWhatsAppNumber(countryCode: string, phone: string | null | undefined): string | null {
  const digits = onlyDigits(phone);
  if (!digits) return null;
  const country = onlyDigits(countryCode) || "55";
  // Já contém DDI (ex.: 5514999999999)
  if (digits.startsWith(country) && digits.length >= country.length + 10) return digits;
  if (digits.length < 10 || digits.length > 11) return null;
  return `${country}${digits}`;
}

/** Prioridade: produto > categoria > configuração global */
export function resolveWhatsAppNumber(options: {
  countryCode: string;
  productNumber?: string | null;
  categoryNumber?: string | null;
  globalNumber?: string | null;
}): string | null {
  for (const candidate of [options.productNumber, options.categoryNumber, options.globalNumber]) {
    const normalized = normalizeWhatsAppNumber(options.countryCode, candidate);
    if (normalized) return normalized;
  }
  return null;
}

/**
 * Gera https://wa.me/<numero>?text=<mensagem>.
 * Sem número configurado, gera https://wa.me/?text=... (o WhatsApp pede para
 * escolher o contato) — o site nunca fica sem caminho de contato.
 */
export function buildWhatsAppUrl(number: string | null, message: string): string {
  const text = encodeURIComponent(message.trim());
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

export type ProductMessageInput = {
  intro: string;
  outro: string;
  productName: string;
  sku?: string | null;
  brand?: string | null;
  variant?: string | null;
  quantity?: number | null;
  unit?: string | null;
  url?: string | null;
};

export function pluralizeUnit(unit: string, quantity: number): string {
  if (quantity === 1) return unit;
  const irregular: Record<string, string> = {
    unidade: "unidades",
    caixa: "caixas",
    saco: "sacos",
    lata: "latas",
    barra: "barras",
    rolo: "rolos",
    pote: "potes",
    kit: "kits",
    jogo: "jogos",
    conjunto: "conjuntos",
    milheiro: "milheiros",
    galão: "galões",
    peça: "peças",
    metro: "metros",
  };
  return irregular[unit.toLowerCase()] ?? unit;
}

export function formatQuantityWithUnit(quantity: number, unit?: string | null): string {
  return unit ? `${formatQuantity(quantity)} ${pluralizeUnit(unit, quantity)}` : formatQuantity(quantity);
}

/**
 * Exemplo de saída:
 * Olá! ... gostaria de consultar este produto:
 *
 * Produto: Porcelanato Calacata Premium
 * Código: 000123
 * Marca: Marca X
 * Variação: 90x90 Acetinado
 * Quantidade desejada: 5 caixas
 * Link: https://...
 *
 * Gostaria de verificar disponibilidade e condições.
 */
export function buildProductMessage(input: ProductMessageInput): string {
  const lines = [`Produto: ${input.productName}`];
  if (input.sku) lines.push(`Código: ${input.sku}`);
  if (input.brand) lines.push(`Marca: ${input.brand}`);
  if (input.variant) lines.push(`Variação: ${input.variant}`);
  if (input.quantity && input.quantity > 0) {
    lines.push(`Quantidade desejada: ${formatQuantityWithUnit(input.quantity, input.unit)}`);
  }
  if (input.url) lines.push(`Link: ${input.url}`);
  return [input.intro.trim(), "", ...lines, "", input.outro.trim()].join("\n").trim();
}

export type QuoteMessageItem = {
  name: string;
  sku?: string | null;
  brand?: string | null;
  variant?: string | null;
  quantity: number;
  unit?: string | null;
  url?: string | null;
};

export function buildQuoteListMessage(input: {
  intro: string;
  items: QuoteMessageItem[];
  note?: string | null;
  listUrl?: string | null;
}): string {
  const blocks = input.items.map((item, index) => {
    const details = [
      item.sku ? `Código: ${item.sku}` : null,
      item.brand ? `Marca: ${item.brand}` : null,
      item.variant ? `Variação: ${item.variant}` : null,
    ].filter(Boolean);
    const head = `${index + 1}. ${formatQuantityWithUnit(item.quantity, item.unit)} — ${item.name}`;
    const tail = [details.length ? `   ${details.join(" · ")}` : null, item.url ? `   ${item.url}` : null].filter(
      Boolean,
    );
    return [head, ...tail].join("\n");
  });
  const parts = [input.intro.trim(), "", ...blocks];
  if (input.note?.trim()) parts.push("", `Observações: ${input.note.trim()}`);
  parts.push("", `Total de itens: ${input.items.length}`);
  if (input.listUrl) parts.push(`Lista: ${input.listUrl}`);
  parts.push("", "Aguardo retorno sobre disponibilidade e condições. Obrigado!");
  return parts.join("\n").trim();
}

/** Minutos desde 00:00 em America/Sao_Paulo e dia da semana (0 = domingo) */
export function getLocalTime(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  return { day: Math.max(day, 0), minutes: hour * 60 + minute };
}

function toMinutes(time: string): number {
  const [h = "0", m = "0"] = time.split(":");
  return Number(h) * 60 + Number(m);
}

/**
 * Retorna null quando não há horário configurado (não inventamos horário),
 * true/false caso contrário.
 */
export function isWithinBusinessHours(hours: BusinessHour[], now: Date = new Date()): boolean | null {
  if (hours.length === 0) return null;
  const { day, minutes } = getLocalTime(now);
  return hours.some(
    (h) =>
      h.dayOfWeek === day &&
      !h.isClosed &&
      h.opensAt != null &&
      h.closesAt != null &&
      minutes >= toMinutes(h.opensAt) &&
      minutes < toMinutes(h.closesAt),
  );
}
