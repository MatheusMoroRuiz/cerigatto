import { z } from "zod";
import { publicEnv } from "@/lib/env";
import { onlyDigits, parseDecimal } from "@/lib/format";
import { SLUG_PATTERN } from "@/lib/slug";

/** Hosts aceitos para imagens (precisam estar em images.remotePatterns) */
export function isAllowedImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const supabaseHost = publicEnv.supabaseUrl ? new URL(publicEnv.supabaseUrl).hostname : null;
    return (
      url.hostname === "images.unsplash.com" ||
      url.hostname.endsWith(".supabase.co") ||
      (supabaseHost !== null && url.hostname === supabaseHost)
    );
  } catch {
    return false;
  }
}

/** Converte "" em null (campos opcionais vindos de formulários) */
export const emptyToNull = (value: unknown) => (typeof value === "string" && value.trim() === "" ? null : value);

export const optionalText = (max: number) =>
  z.preprocess(emptyToNull, z.string().trim().max(max, `Máximo de ${max} caracteres.`).nullable());

export const requiredText = (max: number, message = "Campo obrigatório.") =>
  z.string().trim().min(1, message).max(max, `Máximo de ${max} caracteres.`);

export const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe o endereço (slug).")
  .max(120)
  .regex(SLUG_PATTERN, "Use apenas letras minúsculas, números e hífens (ex.: porcelanato-calacata).");

export const imageUrlField = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .max(1000)
    .refine(isAllowedImageUrl, "Use uma imagem enviada pelo painel (ou URL https do Storage).")
    .nullable(),
);

export const httpsUrlField = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .max(500)
    .refine((v) => /^https:\/\/[^\s]+$/.test(v), "Informe uma URL começando com https://")
    .nullable(),
);

/** Link interno (/produtos) ou externo https */
export const linkField = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .max(500)
    .refine((v) => /^(\/[^\s]*|https:\/\/[^\s]+)$/.test(v), "Use um caminho do site (ex.: /ofertas) ou URL https://")
    .nullable(),
);

export const moneyField = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : parseDecimal(v as string | number)),
  z.number({ error: "Valor inválido." }).min(0, "Valor não pode ser negativo.").max(9_999_999).nullable(),
);

export const phoneDigitsField = (min = 10, max = 13) =>
  z.preprocess(
    (v) => (typeof v === "string" ? onlyDigits(v) || null : v),
    z
      .string()
      .min(min, "Número incompleto (inclua o DDD).")
      .max(max, "Número muito longo.")
      .nullable(),
  );

export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const intField = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v === null || v === undefined ? 0 : Number(v)), z.number().int().min(min).max(max));

/** datetime-local (horário de Brasília) -> ISO UTC */
export const dateTimeField = z.preprocess((v) => {
  if (typeof v !== "string" || v.trim() === "") return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return new Date(`${v}:00-03:00`).toISOString();
  const date = new Date(v);
  return Number.isNaN(date.getTime()) ? "invalid" : date.toISOString();
}, z.string().refine((v) => v !== "invalid", "Data inválida.").nullable());

/** ISO -> valor para <input type="datetime-local"> em America/Sao_Paulo */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
