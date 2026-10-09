"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/form-controls";
import { uploadImage, type StorageBucket } from "./upload";

/**
 * Campo de imagem única (logo, capa, banner). Envia ao Storage e guarda a
 * URL pública em um input oculto com o nome informado — funciona com forms
 * comuns e Server Actions. Também aceita colar uma URL https.
 */
export function ImageField({
  name,
  label,
  bucket,
  folder,
  defaultValue,
  aspect = "aspect-video",
  hint,
}: {
  name: string;
  label: string;
  bucket: StorageBucket;
  folder: string;
  defaultValue?: string | null;
  aspect?: string;
  hint?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadImage(bucket, folder, file);
      setUrl(uploaded.url);
      toast.success("Imagem enviada");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative overflow-hidden rounded-lg border-2 border-dashed bg-muted/40 transition-colors",
          aspect,
          dragging ? "border-primary bg-primary-soft" : "border-border-strong",
        )}
      >
        {url ? (
          <>
            <Image src={url} alt="" fill sizes="400px" className="object-cover" />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md bg-surface/95 px-2.5 py-1.5 text-xs font-semibold shadow"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={() => setUrl("")}
                className="rounded-md bg-surface/95 p-1.5 text-danger shadow"
                aria-label={`Remover ${label}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full min-h-32 flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground hover:text-foreground"
          >
            {uploading ? <Loader2 className="size-6 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-6" aria-hidden="true" />}
            {uploading ? "Enviando…" : "Arraste uma imagem ou clique para escolher"}
          </button>
        )}
        {uploading && url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70">
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <Input
        aria-label={`URL de ${label}`}
        placeholder="…ou cole uma URL https://"
        value={url}
        onChange={(e) => setUrl(e.target.value.trim())}
        className="h-9 text-xs"
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
