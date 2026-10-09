"use client";

import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import type { ImageAsset } from "@/types/catalog";
import { cn } from "@/lib/cn";

/**
 * Galeria: trilho com scroll-snap (swipe no mobile), miniaturas e
 * visualização ampliada com zoom por posição do cursor/toque.
 */
export function ProductGallery({ images, productName }: { images: ImageAsset[]; productName: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setIndex(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const target = (i + images.length) % images.length;
    setIndex(target);
    track?.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
  };

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border bg-surface text-muted-foreground">
        <ImageOff className="size-10" aria-hidden="true" />
        <span className="sr-only">Imagem indisponível</span>
      </div>
    );
  }

  const current = images[index] ?? images[0]!;

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative min-w-0 flex-1">
        <div
          ref={trackRef}
          className="scrollbar-none flex aspect-square snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl border bg-[#f7f7f5]"
          aria-roledescription="galeria"
          aria-label={`Fotos de ${productName}`}
        >
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setZoomOpen(true)}
              className="relative size-full shrink-0 cursor-zoom-in snap-start"
              aria-label={`Ampliar foto ${i + 1} de ${images.length}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium shadow-sm">
          <ZoomIn className="size-3.5" aria-hidden="true" />
          {images.length > 1 ? `${index + 1}/${images.length}` : "Ampliar"}
        </span>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Foto anterior"
              className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow hover:bg-surface md:inline-flex"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Próxima foto"
              className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow hover:bg-surface md:inline-flex"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto lg:w-20 lg:flex-col" aria-label="Miniaturas">
          {images.map((image, i) => (
            <li key={image.url} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-md border-2 bg-[#f7f7f5] transition-colors lg:size-20",
                  i === index ? "border-primary" : "border-transparent hover:border-border-strong",
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <DialogPrimitive.Root open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="sheet-overlay fixed inset-0 z-50 bg-secondary/90" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-50 flex flex-col outline-none"
            aria-describedby={undefined}
          >
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <DialogPrimitive.Title className="truncate text-sm font-medium">{current.alt}</DialogPrimitive.Title>
              <DialogPrimitive.Close
                className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Fechar"
              >
                <X className="size-6" />
              </DialogPrimitive.Close>
            </div>
            <div
              className="relative flex-1 cursor-zoom-in overflow-hidden"
              onPointerMove={(event) => {
                if (event.pointerType !== "mouse") return;
                const rect = event.currentTarget.getBoundingClientRect();
                setOrigin({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
              }}
              onPointerLeave={() => setOrigin(null)}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setOrigin((o) =>
                  o ? null : { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 },
                );
              }}
            >
              <Image
                src={current.url}
                alt={current.alt}
                fill
                sizes="100vw"
                quality={85}
                className="object-contain transition-transform duration-200"
                style={origin ? { transform: "scale(2)", transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
              />
            </div>
            {images.length > 1 ? (
              <div className="flex justify-center gap-3 py-4">
                <button type="button" onClick={() => goTo(index - 1)} className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Foto anterior">
                  <ChevronLeft className="size-5" />
                </button>
                <span className="self-center font-mono text-sm text-white/80">
                  {index + 1} / {images.length}
                </span>
                <button type="button" onClick={() => goTo(index + 1)} className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Próxima foto">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
