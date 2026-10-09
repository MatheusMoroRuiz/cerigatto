"use client";

import { slugify } from "@/lib/slug";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_INPUT_BYTES = 15 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type StorageBucket = "products" | "categories" | "brands" | "banners" | "blog" | "site";

export type UploadedImage = { url: string; path: string; width: number; height: number };

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return `"${file.name}": formato não aceito. Use JPG, PNG, WebP ou AVIF.`;
  }
  if (file.size > MAX_INPUT_BYTES) return `"${file.name}": arquivo maior que 15 MB.`;
  return null;
}

/**
 * Redimensiona (lado maior até maxSize) e converte para WebP no navegador.
 * Reduz o peso das imagens antes do upload sem depender de serviços externos.
 */
export async function compressImage(file: File, maxSize = 2000, quality = 0.85): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  // Se o navegador não gerar WebP menor, mantém o original
  if (!blob || (blob.size >= file.size && scale === 1)) return { blob: file, width, height };
  return { blob, width, height };
}

/** Nome seguro: {pasta}/{timestamp}-{nome-em-slug}-{aleatório}.{ext} */
export function buildObjectPath(folder: string, originalName: string, mime: string): string {
  const base = slugify(originalName.replace(/\.[^.]+$/, "")).slice(0, 60) || "imagem";
  const ext = mime === "image/webp" ? "webp" : mime === "image/png" ? "png" : mime === "image/avif" ? "avif" : "jpg";
  const random = crypto.randomUUID().slice(0, 8);
  const safeFolder = folder.replace(/[^a-zA-Z0-9-_/]/g, "").replace(/^\/+|\/+$/g, "") || "geral";
  return `${safeFolder}/${Date.now()}-${base}-${random}.${ext}`;
}

export async function uploadImage(bucket: StorageBucket, folder: string, file: File): Promise<UploadedImage> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);
  const { blob, width, height } = await compressImage(file);
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}" continua maior que 8 MB após a compressão.`);
  const path = buildObjectPath(folder, file.name, blob.type || file.type);
  const supabase = getBrowserSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Falha no envio de "${file.name}". Verifique sua conexão e tente novamente.`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path, width, height };
}
