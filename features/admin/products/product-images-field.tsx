"use client";

import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/form-controls";
import { uploadImage } from "@/features/admin/upload/upload";

export type FormImage = {
  url: string;
  storagePath: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  isCover: boolean;
};

/**
 * Galeria do produto no painel: upload múltiplo com arrastar e soltar,
 * pré-visualização, capa, reordenação (arrastando ou com setas), alt e exclusão.
 */
export function ProductImagesField({
  productId,
  productName,
  images,
  onChange,
}: {
  productId: string;
  productName: string;
  images: FormImage[];
  onChange: (images: FormImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, 20 - images.length);
    if (list.length === 0) return;
    setUploading((n) => n + list.length);
    const uploaded: FormImage[] = [];
    for (const file of list) {
      try {
        const result = await uploadImage("products", productId, file);
        uploaded.push({ url: result.url, storagePath: result.path, alt: null, width: result.width, height: result.height, isCover: false });
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (uploaded.length) {
      const next = [...images, ...uploaded];
      if (!next.some((i) => i.isCover)) next[0] = { ...next[0]!, isCover: true };
      onChange(next);
      toast.success(`${uploaded.length} imagem(ns) enviada(s). Salve o produto para confirmar.`);
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next);
  };

  const update = (index: number, patch: Partial<FormImage>) =>
    onChange(images.map((img, i) => (i === index ? { ...img, ...patch } : img)));

  const setCover = (index: number) => onChange(images.map((img, i) => ({ ...img, isCover: i === index })));

  const remove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    if (next.length && !next.some((i) => i.isCover)) next[0] = { ...next[0]!, isCover: true };
    onChange(next);
  };

  return (
    <div className="grid gap-4">
      <div
        onDragOver={(e) => {
          if (dragIndex !== null) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (dragIndex !== null) return;
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragging ? "border-primary bg-primary-soft" : "border-border-strong bg-muted/30",
        )}
      >
        {uploading > 0 ? <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" /> : <ImagePlus className="size-7 text-muted-foreground" aria-hidden="true" />}
        <p className="text-sm">
          {uploading > 0 ? `Enviando ${uploading} imagem(ns)…` : "Arraste fotos aqui ou"}{" "}
          {uploading === 0 ? (
            <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-primary underline">
              escolha no computador
            </button>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WebP ou AVIF · até 15 MB · convertidas para WebP automaticamente · até 20 fotos</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length ? (
        <ul className="grid gap-3">
          {images.map((image, index) => (
            <li
              key={image.url}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              className={cn("flex items-start gap-3 rounded-lg border bg-surface p-3", dragIndex === index && "opacity-50")}
            >
              <GripVertical className="mt-6 size-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
                {image.isCover ? (
                  <span className="absolute inset-x-0 bottom-0 bg-accent py-0.5 text-center text-[0.65rem] font-bold text-accent-foreground">CAPA</span>
                ) : null}
              </div>
              <div className="grid min-w-0 flex-1 gap-1.5">
                <label className="text-xs font-semibold" htmlFor={`alt-${index}`}>
                  Texto alternativo (descreva a foto)
                </label>
                <Input
                  id={`alt-${index}`}
                  value={image.alt ?? ""}
                  maxLength={200}
                  placeholder={`Ex.: ${productName || "Produto"} instalado em sala ampla`}
                  onChange={(e) => update(index, { alt: e.target.value || null })}
                  className="h-9 text-sm"
                />
                <p className="text-xs text-muted-foreground">Vazio = gerado automaticamente com nome e marca.</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button type="button" onClick={() => setCover(index)} disabled={image.isCover} title="Definir como capa" aria-label="Definir como capa" className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:text-accent">
                  <Star className={cn("size-4", image.isCover && "fill-current")} />
                </button>
                <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Mover para cima" className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(index, index + 1)} disabled={index === images.length - 1} aria-label="Mover para baixo" className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30">
                  <ArrowDown className="size-4" />
                </button>
                <button type="button" onClick={() => remove(index)} aria-label="Excluir imagem" className="inline-flex size-8 items-center justify-center rounded-md text-danger hover:bg-danger/10">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
