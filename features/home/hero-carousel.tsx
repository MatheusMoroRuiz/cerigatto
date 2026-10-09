"use client";

import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/cn";

const INTERVAL_MS = 7000;

/**
 * Carrossel leve: os slides são HTML do servidor num trilho com scroll-snap
 * (swipe nativo). Este componente só adiciona autoplay discreto, indicadores
 * e pausa — o primeiro banner aparece sem depender de JavaScript.
 */
export function HeroCarousel({ children, count }: { children: ReactNode; count: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setCurrent(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return;
    const timer = window.setInterval(() => goTo((current + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, reducedMotion, current, goTo]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onClickCapture={(event) => {
        const bannerId = (event.target as HTMLElement).closest<HTMLElement>("[data-banner-id]")?.dataset.bannerId;
        if (bannerId) trackEvent("banner_click", { bannerId });
      }}
    >
      <div
        ref={trackRef}
        className="scrollbar-none flex h-[min(82svh,640px)] snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:h-[min(78vh,700px)]"
      >
        {children}
      </div>
      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-6 z-10">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-10">
            <div className="flex gap-2" role="group" aria-label="Escolher banner">
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Banner ${i + 1} de ${count}`}
                  aria-current={i === current}
                  onClick={() => goTo(i)}
                  className="group flex h-6 items-center"
                >
                  <span
                    className={cn(
                      "block h-1 rounded-full transition-all duration-500",
                      i === current ? "w-10 bg-accent" : "w-5 bg-white/50 group-hover:bg-white/80",
                    )}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Retomar troca automática" : "Pausar troca automática"}
              className="inline-flex size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
