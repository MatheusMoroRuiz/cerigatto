import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Marca da Cerigatto. Enquanto não houver arquivo oficial cadastrado no painel,
 * reproduz a placa da loja em código: barras crescentes, faixas vermelhas,
 * CERIGATTO em itálico com "TT" vermelho e "MAT. DE CONSTRUÇÃO".
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
        <Image src={logoUrl} alt={siteName} width={180} height={56} className="h-11 w-auto sm:h-13" priority />
      ) : (
        <span className="flex w-max flex-col leading-none">
          <span
            aria-hidden="true"
            className={cn("brand-bars h-3.5 w-full sm:h-4", inverted ? "bg-white" : "bg-primary")}
          />
          <span aria-hidden="true" className="mt-[3px] h-[2px] w-full bg-accent" />
          <span
            className={cn(
              "font-display mt-[3px] text-[1.45rem] font-extrabold italic sm:text-[1.7rem]",
              inverted ? "text-white" : "text-primary",
            )}
            style={{ fontStretch: "112%", letterSpacing: "-0.015em" }}
          >
            CERIGA<span className="text-accent">TT</span>O
          </span>
          <span aria-hidden="true" className="mt-[2px] h-[2px] w-full bg-accent" />
          <span
            className={cn(
              "mt-[3px] text-[0.58rem] font-semibold tracking-[0.1em] uppercase sm:text-[0.66rem]",
              inverted ? "text-white/80" : "text-primary",
            )}
          >
            Mat. de Construção
          </span>
        </span>
      )}
    </Link>
  );
}
