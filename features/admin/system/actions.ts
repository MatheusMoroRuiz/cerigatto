"use server";

import { z } from "zod";
import { friendlyDbError, zodFieldErrors, type ActionResult } from "@/lib/admin/action-result";
import { logAudit } from "@/lib/admin/audit";
import { invalidate } from "@/lib/admin/cache";
import { authorizeAction } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/env";
import { createServiceSupabase } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { Constants, type Json } from "@/types/database.types";
import {
  checkbox,
  dateTimeField,
  emptyToNull,
  httpsUrlField,
  imageUrlField,
  linkField,
  moneyField,
  optionalText,
  requiredText,
} from "@/lib/validation/common";

type Result = ActionResult<{ redirectTo?: string }>;
const invalid = (issues: z.core.$ZodIssue[]): Result => ({
  ok: false,
  error: "Revise os campos destacados.",
  fieldErrors: zodFieldErrors(issues),
});
const digits = (min: number, max: number, message: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.replace(/\D+/g, "") || null : v),
    z.string().min(min, message).max(max, message).nullable(),
  );

// -----------------------------------------------------------------------------
// Contatos e solicitações
// -----------------------------------------------------------------------------
const leadUpdateSchema = z.object({
  id: z.uuid(),
  status: z.enum(Constants.public.Enums.lead_status),
  internal_notes: optionalText(4000),
});

export async function updateContact(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = leadUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("contacts").update({ ...values, handled_by: auth.session.userId }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "contact.update", entityType: "contact", entityId: id, metadata: { status: values.status } });
  return { ok: true, message: "Contato atualizado" };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "contact.delete", entityType: "contact", entityId: id });
  return { ok: true, message: "Contato excluído (dados pessoais removidos)" };
}

export async function updateQuoteRequest(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = leadUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("quote_requests").update(values).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  return { ok: true, message: "Solicitação atualizada" };
}

// -----------------------------------------------------------------------------
// Ofertas
// -----------------------------------------------------------------------------
const offerSchema = z
  .object({
    id: z.uuid(),
    sale_price: moneyField,
    sale_label: optionalText(60),
    sale_starts_at: dateTimeField,
    sale_ends_at: dateTimeField,
  })
  .superRefine((o, ctx) => {
    if (o.sale_starts_at && o.sale_ends_at && Date.parse(o.sale_ends_at) <= Date.parse(o.sale_starts_at)) {
      ctx.addIssue({ code: "custom", path: ["sale_ends_at"], message: "O fim deve ser depois do início." });
    }
  });

export async function saveOffer(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = offerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .update({ ...values, is_on_sale: true, updated_by: auth.session.userId })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar a oferta. O preço promocional deve ser menor que o preço normal.") };
  await logAudit(supabase, { userId: auth.session.userId, action: "offer.update", entityType: "product", entityId: id, metadata: values });
  invalidate(CACHE_TAGS.products, CACHE_TAGS.collections, CACHE_TAGS.product(data.slug));
  return { ok: true, message: "Oferta salva" };
}

export async function endOffer(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .update({ is_on_sale: false, sale_starts_at: null, sale_ends_at: null })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "offer.end", entityType: "product", entityId: id });
  invalidate(CACHE_TAGS.products, CACHE_TAGS.collections, CACHE_TAGS.product(data.slug));
  return { ok: true, message: "Oferta encerrada" };
}

// -----------------------------------------------------------------------------
// SEO e redirects
// -----------------------------------------------------------------------------
const seoSchema = z.object({
  default_title: requiredText(120, "Informe o título padrão."),
  title_template: requiredText(120).refine((v) => v.includes("%s"), "O modelo precisa conter %s (onde entra o título da página)."),
  default_description: requiredText(300, "Informe a descrição padrão."),
  default_og_image_url: imageUrlField,
  google_site_verification: optionalText(200),
  bing_site_verification: optionalText(200),
  noindex_site: checkbox,
  local_business_type: z.enum(["HardwareStore", "HomeAndConstructionBusiness", "Store", "LocalBusiness"]),
});

export async function saveSeoSettings(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const parsed = seoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("seo_settings").update({ ...parsed.data, updated_by: auth.session.userId }).eq("id", 1);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "settings.seo", entityType: "settings" });
  invalidate(CACHE_TAGS.settings);
  return { ok: true, message: "SEO atualizado" };
}

const redirectSchema = z
  .object({
    source_path: z
      .string()
      .trim()
      .regex(/^\/[^\s?#]*$/, "Origem deve começar com / (ex.: /produto/nome-antigo)."),
    destination_path: z
      .string()
      .trim()
      .regex(/^(\/[^\s]*|https:\/\/[^\s]+)$/, "Destino deve começar com / ou https://"),
    status_code: z.coerce.number().pipe(z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)])),
  })
  .refine((r) => r.source_path !== r.destination_path, { message: "Origem e destino não podem ser iguais.", path: ["destination_path"] });

export async function saveRedirect(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const parsed = redirectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("redirects")
    .upsert({ ...parsed.data, is_active: true, created_by: auth.session.userId }, { onConflict: "source_path" });
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "redirect.save", entityType: "redirect", metadata: parsed.data });
  invalidate(CACHE_TAGS.redirects);
  return { ok: true, message: "Redirect salvo" };
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("redirects").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "redirect.delete", entityType: "redirect", entityId: id });
  invalidate(CACHE_TAGS.redirects);
  return { ok: true, message: "Redirect removido" };
}

// -----------------------------------------------------------------------------
// Configurações do site
// -----------------------------------------------------------------------------
const navLinkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  href: z.string().trim().regex(/^(\/[^\s]*|https:\/\/[^\s]+)$/),
  enabled: z.boolean(),
});
const hexColor = z.preprocess(emptyToNull, z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use uma cor em hexadecimal (#1B3F8F).").nullable());

const siteSchema = z.object({
  site_name: requiredText(120, "Informe o nome da empresa."),
  short_name: requiredText(40, "Informe o nome curto."),
  tagline: optionalText(160),
  description: optionalText(500),
  logo_url: imageUrlField,
  logo_dark_url: imageUrlField,
  favicon_url: imageUrlField,
  topbar_enabled: checkbox,
  topbar_message: optionalText(160),
  topbar_link: linkField,
  ga4_id: z.preprocess(emptyToNull, z.string().trim().regex(/^G-[A-Z0-9]{4,20}$/, "Formato: G-XXXXXXX").nullable()),
  gtm_id: z.preprocess(emptyToNull, z.string().trim().regex(/^GTM-[A-Z0-9]{4,12}$/, "Formato: GTM-XXXXXX").nullable()),
  meta_pixel_id: z.preprocess(emptyToNull, z.string().trim().regex(/^[0-9]{6,20}$/, "Somente números").nullable()),
  demo_notice_enabled: checkbox,
  nav_links: z.preprocess((v) => {
    try {
      return JSON.parse(String(v));
    } catch {
      return null;
    }
  }, z.array(navLinkSchema).max(12, "Máximo de 12 links.")),
  theme_primary: hexColor,
  theme_accent: hexColor,
  theme_secondary: hexColor,
});

export async function saveSiteSettings(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const parsed = siteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const { theme_primary, theme_accent, theme_secondary, nav_links, ...values } = parsed.data;
  const theme = Object.fromEntries(
    Object.entries({ primary: theme_primary, accent: theme_accent, secondary: theme_secondary }).filter(([, v]) => v),
  );
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("site_settings")
    .update({ ...values, nav_links: nav_links as Json, theme: theme as Json, updated_by: auth.session.userId })
    .eq("id", 1);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "settings.site", entityType: "settings" });
  invalidate(CACHE_TAGS.settings);
  return { ok: true, message: "Configurações salvas" };
}

const businessSchema = z.object({
  legal_name: optionalText(160),
  trade_name: optionalText(160),
  cnpj: digits(14, 14, "CNPJ deve ter 14 dígitos."),
  phone: digits(10, 13, "Telefone com DDD (10 ou 11 dígitos)."),
  email: z.preprocess(emptyToNull, z.email("E-mail inválido.").nullable()),
  street: optionalText(160),
  street_number: optionalText(20),
  complement: optionalText(80),
  district: optionalText(80),
  city: requiredText(80),
  state: z.string().trim().toUpperCase().length(2, "UF com 2 letras."),
  postal_code: digits(8, 8, "CEP deve ter 8 dígitos."),
  latitude: z.preprocess((v) => (v === "" || v == null ? null : Number(String(v).replace(",", "."))), z.number().min(-90).max(90).nullable()),
  longitude: z.preprocess((v) => (v === "" || v == null ? null : Number(String(v).replace(",", "."))), z.number().min(-180).max(180).nullable()),
  google_maps_url: httpsUrlField,
  founded_year: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(1800).max(2100).nullable()),
  about_title: optionalText(160),
  about_summary: optionalText(600),
  history: optionalText(10000),
  mission: optionalText(2000),
  values_text: optionalText(2000),
});

export async function saveBusinessInfo(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const parsed = businessSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("business_information").update({ ...parsed.data, updated_by: auth.session.userId }).eq("id", 1);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "settings.business", entityType: "settings" });
  invalidate(CACHE_TAGS.settings);
  return { ok: true, message: "Dados da empresa salvos" };
}

const whatsappSchema = z.object({
  is_enabled: checkbox,
  country_code: z.string().trim().regex(/^\d{1,3}$/, "Somente números (Brasil: 55)."),
  phone_number: digits(10, 11, "Informe DDD + número (10 ou 11 dígitos)."),
  default_message: requiredText(500),
  product_intro: requiredText(500),
  product_outro: requiredText(300),
  quote_intro: requiredText(500),
  button_label: requiredText(60),
  floating_label: requiredText(40),
  show_floating_button: checkbox,
  show_floating_label_mobile: checkbox,
  show_out_of_hours_notice: checkbox,
  out_of_hours_message: requiredText(300),
});

export async function saveWhatsappSettings(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const parsed = whatsappSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("whatsapp_settings").update({ ...parsed.data, updated_by: auth.session.userId }).eq("id", 1);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "settings.whatsapp", entityType: "settings" });
  invalidate(CACHE_TAGS.settings);
  return { ok: true, message: "WhatsApp atualizado" };
}

const hoursSchema = z.array(
  z
    .object({
      day_of_week: z.number().int().min(0).max(6),
      opens_at: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
      closes_at: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
      is_closed: z.boolean(),
    })
    .refine((h) => h.is_closed || (h.opens_at && h.closes_at && h.closes_at > h.opens_at), "Horário de fechamento deve ser depois da abertura."),
).max(21);

export async function saveBusinessHours(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("hours") ?? "[]"));
  } catch {
    return { ok: false, error: "Dados de horário inválidos." };
  }
  const parsed = hoursSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Horário inválido." };
  const supabase = await createServerSupabase();
  const { error: deleteError } = await supabase.from("business_hours").delete().gte("day_of_week", 0);
  if (deleteError) return { ok: false, error: friendlyDbError(deleteError) };
  if (parsed.data.length) {
    const { error } = await supabase.from("business_hours").insert(parsed.data);
    if (error) return { ok: false, error: friendlyDbError(error) };
  }
  await logAudit(supabase, { userId: auth.session.userId, action: "settings.hours", entityType: "settings" });
  invalidate(CACHE_TAGS.settings);
  return { ok: true, message: "Horários salvos" };
}

const socialSchema = z.array(
  z.object({
    platform: z.enum(["instagram", "facebook", "youtube", "linkedin", "tiktok", "pinterest", "x"]),
    url: z.string().trim().regex(/^https:\/\/[^\s]+$/, "Use um link https://"),
  }),
);

export async function saveSocialLinks(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const links = socialSchema.safeParse(
    ["instagram", "facebook", "youtube", "linkedin", "tiktok", "pinterest", "x"]
      .map((platform) => ({ platform, url: String(formData.get(platform) ?? "").trim() }))
      .filter((l) => l.url),
  );
  if (!links.success) return { ok: false, error: "Use links completos começando com https://" };
  const supabase = await createServerSupabase();
  await supabase.from("social_links").delete().neq("platform", "");
  if (links.data.length) {
    const { error } = await supabase.from("social_links").insert(links.data.map((l, i) => ({ ...l, sort_order: i })));
    if (error) return { ok: false, error: friendlyDbError(error) };
  }
  await logAudit(supabase, { userId: auth.session.userId, action: "settings.social", entityType: "settings" });
  invalidate(CACHE_TAGS.settings);
  return { ok: true, message: "Redes sociais salvas" };
}

// -----------------------------------------------------------------------------
// Administradores (somente super_admin)
// -----------------------------------------------------------------------------
const inviteSchema = z.object({
  email: z.email("E-mail inválido."),
  full_name: optionalText(120),
  role: z.enum(Constants.public.Enums.app_role),
});

export async function inviteAdmin(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("super_admin");
  if (!auth.ok) return auth;
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return invalid(parsed.error.issues);
  const service = createServiceSupabase();
  if (!service) {
    return { ok: false, error: "Defina SUPABASE_SERVICE_ROLE_KEY no servidor para convidar administradores." };
  }
  const { email, full_name, role } = parsed.data;
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
    redirectTo: absoluteUrl("/admin/auth/callback?next=/admin/nova-senha"),
  });
  let userId = data?.user?.id;
  if (error) {
    // Usuário já existe no Auth: apenas concede o papel
    const { data: list } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
    if (!userId) return { ok: false, error: "Não foi possível enviar o convite. Verifique o e-mail e a configuração de SMTP do Supabase." };
  }
  const supabase = await createServerSupabase();
  await supabase.from("profiles").upsert({ id: userId!, email, full_name });
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId!, role, created_by: auth.session.userId }, { onConflict: "user_id" });
  if (roleError) return { ok: false, error: friendlyDbError(roleError) };
  await logAudit(supabase, { userId: auth.session.userId, action: "admin.invite", entityType: "user", entityId: userId, metadata: { email, role } });
  return { ok: true, message: error ? "Acesso concedido ao usuário existente" : "Convite enviado por e-mail" };
}

export async function updateAdminRole(userId: string, role: "super_admin" | "admin" | "editor"): Promise<ActionResult> {
  const auth = await authorizeAction("super_admin");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", userId);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "admin.role", entityType: "user", entityId: userId, metadata: { role } });
  return { ok: true, message: "Papel atualizado" };
}

export async function removeAdmin(userId: string): Promise<ActionResult> {
  const auth = await authorizeAction("super_admin");
  if (!auth.ok) return auth;
  if (userId === auth.session.userId) return { ok: false, error: "Você não pode remover o próprio acesso." };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "admin.remove", entityType: "user", entityId: userId });
  return { ok: true, message: "Acesso ao painel removido" };
}
