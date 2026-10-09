import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Marca da Cerigatto. Enquanto não houver logotipo oficial cadastrado no painel,
 * usa a apresentação tipográfica provisória.
 */
export function Logo({
  logoUrl,
  siteName,
  inverted = false,
  className,
}: {
  logoUrl?: string | null;
  siteName: string;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex shrink-0 items-center rounded-sm", className)}
      aria-label={`${siteName} — página inicial`}
    >
      {logoUrl ? (
        <Image src={logoUrl} alt={siteName} width={180} height={48} className="h-10 w-auto sm:h-12" priority />
      ) : (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[1.45rem] font-extrabold tracking-[-0.01em] sm:text-[1.7rem]",
              inverted ? "text-secondary-foreground" : "text-foreground",
            )}
            style={{ fontStretch: "125%" }}
          >
            CERIGATTO
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span aria-hidden="true" className="tape-thin w-6 transition-[width] duration-300 group-hover:w-9" />
            <span
              className={cn(
                "font-mono text-[0.6rem] font-medium tracking-[0.16em] uppercase sm:text-[0.65rem]",
                inverted ? "text-secondary-foreground/70" : "text-muted-foreground",
              )}
            >
              Materiais de Construção
            </span>
          </span>
        </span>
      )}
    </Link>
  );
}
