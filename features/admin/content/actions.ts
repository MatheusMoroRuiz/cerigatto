"use server";

import { z } from "zod";
import { friendlyDbError, zodFieldErrors, type ActionResult } from "@/lib/admin/action-result";
import { logAudit } from "@/lib/admin/audit";
import { invalidate } from "@/lib/admin/cache";
import { authorizeAction } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase/server";
import { Constants } from "@/types/database.types";
import {
  checkbox,
  dateTimeField,
  emptyToNull,
  imageUrlField,
  intField,
  linkField,
  optionalText,
  requiredText,
  slugField,
} from "@/lib/validation/common";

type Result = ActionResult<{ redirectTo?: string }>;
const uuidOrNull = z.preprocess(emptyToNull, z.uuid().nullable());

// -----------------------------------------------------------------------------
// Banners
// -----------------------------------------------------------------------------
const bannerSchema = z
  .object({
    id: uuidOrNull,
    internal_name: requiredText(120, "Informe um nome interno."),
    placement: z.enum(Constants.public.Enums.banner_placement),
    desktop_image_url: z.preprocess(emptyToNull, imageUrlField.refine((v) => v !== null, "Envie a imagem desktop.")),
    mobile_image_url: imageUrlField,
    image_alt: optionalText(200),
    eyebrow: optionalText(80),
    title: optionalText(140),
    subtitle: optionalText(300),
    button_text: optionalText(40),
    button_url: linkField,
    text_position: z.enum(Constants.public.Enums.text_position),
    overlay_opacity: intField(0, 90),
    starts_at: dateTimeField,
    ends_at: dateTimeField,
    is_active: checkbox,
    sort_order: intField(0, 9999),
  })
  .superRefine((b, ctx) => {
    if (b.starts_at && b.ends_at && Date.parse(b.ends_at) <= Date.parse(b.starts_at)) {
      ctx.addIssue({ code: "custom", path: ["ends_at"], message: "O fim deve ser depois do início." });
    }
    if (b.button_text && !b.button_url) ctx.addIssue({ code: "custom", path: ["button_url"], message: "Informe o link do botão." });
  });

export async function saveBanner(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = bannerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const payload = { ...values, desktop_image_url: values.desktop_image_url as string };
  const { data, error } = await (id
    ? supabase.from("banners").update(payload).eq("id", id).select("id").single()
    : supabase.from("banners").insert({ ...payload, created_by: auth.session.userId }).select("id").single());
  if (error || !data) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar o banner.") };
  await logAudit(supabase, {
    userId: auth.session.userId,
    action: id ? "banner.update" : "banner.create",
    entityType: "banner",
    entityId: data.id,
    metadata: { name: values.internal_name, active: values.is_active },
  });
  invalidate(CACHE_TAGS.banners);
  return { ok: true, message: id ? "Banner atualizado" : "Banner publicado", data: { redirectTo: "/admin/banners" } };
}

export async function toggleBanner(id: string, active: boolean): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("banners").update({ is_active: active }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: active ? "banner.activate" : "banner.deactivate", entityType: "banner", entityId: id });
  invalidate(CACHE_TAGS.banners);
  return { ok: true, message: active ? "Banner ativado" : "Banner desativado" };
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "banner.delete", entityType: "banner", entityId: id });
  invalidate(CACHE_TAGS.banners);
  return { ok: true, message: "Banner excluído" };
}

// -----------------------------------------------------------------------------
// Vitrines (coleções)
// -----------------------------------------------------------------------------
const collectionSchema = z.object({
  id: uuidOrNull,
  name: requiredText(120, "Informe o nome interno."),
  slug: slugField,
  title: requiredText(120, "Informe o título exibido."),
  subtitle: optionalText(200),
  source: z.enum(["manual", "featured", "on_sale", "new", "recommended", "most_viewed"]),
  placement: z.enum(["home", "none"]),
  max_items: intField(1, 48),
  is_active: checkbox,
  sort_order: intField(0, 9999),
});

export async function saveCollection(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = collectionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const productIds = z.array(z.uuid()).max(48).safeParse(formData.getAll("product_ids"));
  if (!productIds.success) return { ok: false, error: "Lista de produtos inválida." };
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const { data, error } = await (id
    ? supabase.from("collections").update(values).eq("id", id).select("id").single()
    : supabase.from("collections").insert({ ...values, created_by: auth.session.userId }).select("id").single());
  if (error || !data) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar a vitrine.") };
  await supabase.from("collection_products").delete().eq("collection_id", data.id);
  if (values.source === "manual" && productIds.data.length) {
    await supabase
      .from("collection_products")
      .insert(productIds.data.map((product_id, sort_order) => ({ collection_id: data.id, product_id, sort_order })));
  }
  await logAudit(supabase, { userId: auth.session.userId, action: id ? "collection.update" : "collection.create", entityType: "collection", entityId: data.id });
  invalidate(CACHE_TAGS.collections);
  return { ok: true, message: "Vitrine salva", data: { redirectTo: "/admin/vitrines" } };
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "collection.delete", entityType: "collection", entityId: id });
  invalidate(CACHE_TAGS.collections);
  return { ok: true, message: "Vitrine excluída" };
}

// -----------------------------------------------------------------------------
// Blog / Dicas
// -----------------------------------------------------------------------------
const postSchema = z.object({
  id: uuidOrNull,
  title: requiredText(200, "Informe o título."),
  slug: slugField,
  excerpt: optionalText(500),
  content: z.string().max(100000).default(""),
  cover_image_url: imageUrlField,
  cover_alt: optionalText(200),
  author_name: optionalText(120),
  category_id: uuidOrNull,
  status: z.enum(Constants.public.Enums.content_status),
  published_at: dateTimeField,
  is_featured: checkbox,
  reading_minutes: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(1).max(120).nullable()),
  seo_title: optionalText(70),
  seo_description: optionalText(170),
});

export async function savePost(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = postSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const { id, ...values } = parsed.data;
  // Estimativa de leitura: ~200 palavras por minuto
  const readingMinutes = values.reading_minutes ?? Math.max(1, Math.round(values.content.split(/\s+/).filter(Boolean).length / 200));
  const supabase = await createServerSupabase();
  const payload = { ...values, reading_minutes: readingMinutes };
  const { data, error } = await (id
    ? supabase.from("blog_posts").update(payload).eq("id", id).select("id").single()
    : supabase.from("blog_posts").insert({ ...payload, created_by: auth.session.userId }).select("id").single());
  if (error || !data) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar o artigo.") };
  await logAudit(supabase, {
    userId: auth.session.userId,
    action: values.status === "published" ? "post.publish" : id ? "post.update" : "post.create",
    entityType: "blog_post",
    entityId: data.id,
    metadata: { title: values.title },
  });
  invalidate(CACHE_TAGS.blog, CACHE_TAGS.redirects);
  return { ok: true, message: "Artigo salvo", data: id ? {} : { redirectTo: `/admin/dicas/${data.id}` } };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("blog_posts").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  await logAudit(supabase, { userId: auth.session.userId, action: "post.delete", entityType: "blog_post", entityId: id });
  invalidate(CACHE_TAGS.blog);
  return { ok: true, message: "Artigo excluído" };
}

const blogCategorySchema = z.object({ name: requiredText(60, "Informe o nome."), slug: slugField });

export async function createBlogCategory(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = blogCategorySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("blog_categories").insert(parsed.data);
  if (error) return { ok: false, error: friendlyDbError(error) };
  invalidate(CACHE_TAGS.blog);
  return { ok: true, message: "Categoria criada" };
}

export async function deleteBlogCategory(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("admin");
  if (!auth.ok) return auth;
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  invalidate(CACHE_TAGS.blog);
  return { ok: true, message: "Categoria removida (artigos ficam sem categoria)" };
}

// -----------------------------------------------------------------------------
// Páginas institucionais
// -----------------------------------------------------------------------------
const pageSchema = z.object({
  id: uuidOrNull,
  slug: slugField,
  title: requiredText(160, "Informe o título."),
  summary: optionalText(400),
  content: optionalText(100000),
  seo_title: optionalText(70),
  seo_description: optionalText(170),
  status: z.enum(Constants.public.Enums.content_status),
});

export async function savePage(_prev: Result | null, formData: FormData): Promise<Result> {
  const auth = await authorizeAction("editor");
  if (!auth.ok) return auth;
  const parsed = pageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Revise os campos destacados.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const { id, ...values } = parsed.data;
  const supabase = await createServerSupabase();
  const { data, error } = await (id
    ? supabase.from("pages").update(values).eq("id", id).select("id").single()
    : supabase.from("pages").insert({ ...values, created_by: auth.session.userId }).select("id").single());
  if (error || !data) return { ok: false, error: friendlyDbError(error, "Não foi possível salvar a página.") };
  await logAudit(supabase, { userId: auth.session.userId, action: "page.update", entityType: "page", entityId: data.id, metadata: { slug: values.slug } });
  invalidate(CACHE_TAGS.pages);
  return { ok: true, message: "Página salva", data: { redirectTo: "/admin/paginas" } };
}
