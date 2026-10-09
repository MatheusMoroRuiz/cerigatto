/** Formatação pt-BR (moeda BRL, datas em America/Sao_Paulo, telefones) */
export const TIME_ZONE = "America/Sao_Paulo";
export const LOCALE = "pt-BR";

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "BRL" });
const numberFormatter = new Intl.NumberFormat(LOCALE);
const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const longDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** R$ 1.299,90 (normaliza o espaço não separável do Intl para espaço comum) */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value).replace(/ /g, " ");
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** dd/mm/aaaa */
export function formatDate(value: string | Date): string {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatLongDate(value: string | Date): string {
  return longDateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function onlyDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D+/g, "");
}

/** (14) 99999-9999 / (14) 3333-3333 */
export function formatPhone(value: string | null | undefined): string {
  const digits = onlyDigits(value).replace(/^55(?=\d{10,11}$)/, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value ?? "";
}

export function formatPostalCode(value: string | null | undefined): string {
  const digits = onlyDigits(value);
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : (value ?? "");
}

export function formatCnpj(value: string | null | undefined): string {
  const d = onlyDigits(value);
  if (d.length !== 14) return value ?? "";
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** Quantidade com vírgula decimal: 2.5 -> "2,5" */
export function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toLocaleString(LOCALE, { maximumFractionDigits: 2 });
}

/** Converte "1.299,90" ou "1299.90" em número */
export function parseDecimal(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = value.trim().replace(/\s|R\$/g, "");
  const parsed = normalized.includes(",")
    ? Number(normalized.replace(/\./g, "").replace(",", "."))
    : Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
