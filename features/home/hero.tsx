import { ArrowRight } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import type { Banner } from "@/types/catalog";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { buttonVariants } from "@/components/ui/button";
import { Container, Tape } from "@/components/ui/primitives";
import { SearchBar } from "@/features/search/search-bar";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";
import { HeroCarousel } from "./hero-carousel";

/** Imagem com direção de arte (mobile/desktop) sem JavaScript */
function BannerPicture({ banner, priority }: { banner: Banner; priority: boolean }) {
  const common = { alt: banner.imageAlt, fill: true, priority, quality: 75 } as const;
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: banner.desktopImageUrl, sizes: "100vw" });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({ ...common, src: banner.mobileImageUrl ?? banner.desktopImageUrl, sizes: "100vw" });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <source media="(max-width: 767px)" srcSet={mobile} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- props de getImageProps incluem alt */}
      <img {...rest} className="absolute inset-0 size-full object-cover" />
    </picture>
  );
}

function Slide({ banner, index }: { banner: Banner; index: number }) {
  const align =
    banner.textPosition === "center"
      ? "items-center text-center mx-auto"
      : banner.textPosition === "right"
        ? "items-end text-right ml-auto"
        : "items-start text-left";
  const HeadingTag = index === 0 ? "h1" : "h2";
  return (
    <div className="relative h-full w-full shrink-0 snap-start overflow-hidden" data-slide={index}>
      <BannerPicture banner={banner} priority={index === 0} />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/70 to-secondary/10"
        style={{ opacity: Math.min(Math.max(banner.overlayOpacity / 60, 0.35), 1) }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/70 to-transparent" />
      <Container className="relative flex h-full flex-col justify-end pt-16 pb-16 sm:pb-20 lg:justify-center lg:pb-10">
        <div className={cn("flex max-w-3xl flex-col gap-5 text-white", align)}>
          {banner.eyebrow ? (
            <p className="flex items-center gap-3 font-mono text-xs font-medium tracking-[0.16em] uppercase">
              <span aria-hidden="true" className="tape-thin w-10" />
              {banner.eyebrow}
            </p>
          ) : null}
          {banner.title ? (
            <HeadingTag className="font-display text-[2.35rem] leading-[0.98] font-extrabold text-balance sm:text-6xl lg:text-[4.6rem]">
              {banner.title}
            </HeadingTag>
          ) : null}
          {banner.subtitle ? (
            <p className="max-w-xl text-base leading-relaxed text-pretty text-white/85 sm:text-lg">{banner.subtitle}</p>
          ) : null}
          {banner.buttonText && banner.buttonUrl ? (
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href={banner.buttonUrl}
                data-banner-id={banner.id}
                className={buttonVariants({ variant: "accent", size: "lg" })}
              >
                {banner.buttonText}
                <ArrowRight aria-hidden="true" />
              </Link>
              {index === 0 ? (
                <WhatsAppLink
                  origin="hero"
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white backdrop-blur hover:border-white hover:bg-white/15"
                >
                  Falar com um especialista
                </WhatsAppLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}

/** Hero: banners do painel. Sem banners, exibe a versão tipográfica com busca. */
export function Hero({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) {
    return (
      <section className="relative overflow-hidden bg-secondary text-secondary-foreground">
        <Container className="py-20 sm:py-28">
          <p className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.16em] uppercase">
            <span aria-hidden="true" className="tape-thin w-10" />
            Materiais de construção em Bauru/SP
          </p>
          <h1 className="font-display max-w-4xl text-[2.5rem] leading-[0.98] font-extrabold text-balance sm:text-6xl lg:text-7xl">
            Do alicerce ao acabamento, em um só lugar.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-secondary-foreground/80">
            Encontre o produto, confira as especificações e consulte disponibilidade direto com a nossa equipe.
          </p>
          <div className="mt-8 max-w-2xl text-foreground">
            <SearchBar />
          </div>
          <Link href={routes.products()} className="mt-6 inline-flex items-center gap-2 font-semibold text-accent hover:underline">
            Ver todos os produtos <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Container>
        <Tape />
      </section>
    );
  }

  return (
    <section aria-roledescription="carrossel" aria-label="Destaques" className="relative bg-secondary">
      <HeroCarousel count={banners.length}>
        {banners.map((banner, index) => (
          <Slide key={banner.id} banner={banner} index={index} />
        ))}
      </HeroCarousel>
      <Tape />
    </section>
  );
}
