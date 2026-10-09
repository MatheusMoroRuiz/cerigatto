import { ArrowRight, ArrowUpRight, ClipboardList, MapPin, MessageCircle, PackageSearch, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Banner, BlogPostSummary, Brand, CategoryNode, Environment } from "@/types/catalog";
import type { SiteConfig } from "@/types/settings";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow, Heading, Section, SectionHeading, Tape } from "@/components/ui/primitives";
import { CategoryIcon } from "@/components/layout/category-icon";
import { formatAddress } from "@/lib/address";
import { formatHoursByDay } from "@/components/layout/hours";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";

/** Atalhos de departamentos logo abaixo do hero */
export function DepartmentShortcuts({ tree }: { tree: CategoryNode[] }) {
  if (tree.length === 0) return null;
  return (
    <div className="border-b bg-surface">
      <Container>
        <nav aria-label="Atalhos de departamentos">
          <ul className="scrollbar-none -mx-4 flex snap-x gap-1 overflow-x-auto px-4 py-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-8 lg:px-0">
            {tree.slice(0, 8).map((category) => (
              <li key={category.id} className="shrink-0 snap-start">
                <Link
                  href={routes.category(category.slug)}
                  className="group flex w-24 flex-col items-center gap-2 rounded-md px-2 py-3 text-center transition-colors hover:bg-muted lg:w-auto"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <CategoryIcon name={category.icon} className="size-6" />
                  </span>
                  <span className="text-xs leading-tight font-semibold">{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}

/**
 * "Encontre tudo para sua obra": grade editorial de departamentos separada
 * por linhas finas — como peças assentadas com rejunte.
 */
export function CategoryMosaic({ tree }: { tree: CategoryNode[] }) {
  const items = tree.filter((c) => c.imageUrl).slice(0, 8);
  if (items.length === 0) return null;
  // Preenche a grade sem "buracos": a última linha estica os itens restantes.
  // Desktop: 4 colunas, o primeiro item ocupa 2x2. Mobile: 2 colunas.
  const desktopRemainder = (4 + items.length - 1) % 4;
  const lastRowStart = items.length - desktopRemainder;
  const desktopSpan = (index: number) => {
    if (index === 0 || desktopRemainder === 0 || index < lastRowStart) return "";
    if (desktopRemainder === 1) return "md:col-span-4";
    if (desktopRemainder === 2) return "md:col-span-2";
    return index === lastRowStart ? "md:col-span-2" : "";
  };
  const mobileOdd = (items.length - 1) % 2 === 1;
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Departamentos"
          title="Encontre tudo para sua obra"
          description="Da fundação ao acabamento: navegue pelos departamentos e encontre o que precisa para cada etapa."
          action={
            <Link href={routes.products()} className={buttonVariants({ variant: "outline" })}>
              Ver todos os produtos
            </Link>
          }
        />
        <ul className="grout-grid grid grid-cols-2 overflow-hidden rounded-xl border md:grid-cols-4">
          {items.map((category, index) => (
            <li
              key={category.id}
              className={cn(
                "relative bg-surface",
                index === 0 && "col-span-2 md:row-span-2",
                mobileOdd && index === items.length - 1 && "col-span-2",
                desktopSpan(index),
              )}
            >
              <Link
                href={routes.category(category.slug)}
                className={cn(
                  "group relative block h-full overflow-hidden",
                  index === 0 ? "aspect-[4/3] md:aspect-auto md:min-h-[500px]" : "aspect-[4/3] md:aspect-auto md:min-h-[249px]",
                )}
              >
                <Image
                  src={category.imageUrl!}
                  alt=""
                  fill
                  sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-6">
                  <span>
                    <span className={cn("font-display block font-bold", index === 0 ? "text-2xl sm:text-4xl" : "text-base sm:text-xl")}>
                      {category.name}
                    </span>
                    {index === 0 && category.description ? (
                      <span className="mt-2 hidden max-w-sm text-sm text-white/80 sm:block">{category.description}</span>
                    ) : null}
                  </span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Faixa promocional intermediária (banner do painel) */
export function PromoBand({ banner, tone = "dark" }: { banner: Banner | undefined; tone?: "dark" | "light" }) {
  if (!banner) return null;
  return (
    <Section className="py-6 sm:py-8">
      <Container>
        <div className="relative isolate overflow-hidden rounded-xl bg-secondary">
          <Image
            src={banner.desktopImageUrl}
            alt={banner.imageAlt}
            fill
            sizes="(min-width: 1440px) 1360px, 100vw"
            className="-z-10 object-cover"
          />
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 -z-10",
              tone === "dark"
                ? "bg-gradient-to-r from-secondary via-secondary/80 to-secondary/20"
                : "bg-gradient-to-r from-primary via-primary/85 to-primary/20",
            )}
          />
          <div className="grid gap-6 px-6 py-10 text-white sm:px-10 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:px-14">
            <div>
              {banner.eyebrow ? (
                <p className="mb-3 flex items-center gap-3 font-mono text-xs tracking-[0.16em] uppercase">
                  <span aria-hidden="true" className="tape-thin w-8" />
                  {banner.eyebrow}
                </p>
              ) : null}
              {banner.title ? (
                <p className="font-display max-w-2xl text-3xl leading-tight font-bold text-balance sm:text-4xl">{banner.title}</p>
              ) : null}
              {banner.subtitle ? <p className="mt-4 max-w-xl text-white/85">{banner.subtitle}</p> : null}
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {banner.buttonText && banner.buttonUrl ? (
                <Link href={banner.buttonUrl} className={buttonVariants({ variant: "accent", size: "lg" })}>
                  {banner.buttonText}
                  <ArrowRight aria-hidden="true" />
                </Link>
              ) : null}
              {tone === "light" || banner.placement === "home_specialist" ? (
                <WhatsAppLink origin="specialist_band" size="lg">
                  Enviar pelo WhatsApp
                </WhatsAppLink>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** Subcategorias populares em chips com miniatura */
export function PopularCategories({ tree }: { tree: CategoryNode[] }) {
  const items = tree.flatMap((c) => c.children).filter((c) => c.imageUrl).slice(0, 12);
  if (items.length === 0) return null;
  return (
    <Section className="bg-surface">
      <Container>
        <SectionHeading eyebrow="Mais acessadas" title="Categorias populares" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((category) => (
            <li key={category.id}>
              <Link
                href={routes.category(category.slug)}
                className="group flex items-center gap-3 rounded-lg border bg-background p-2 pr-3 transition-colors hover:border-foreground"
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-md">
                  <Image src={category.imageUrl!} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="text-sm leading-tight font-semibold">{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function EnvironmentsShowcase({ environments }: { environments: Environment[] }) {
  if (environments.length === 0) return null;
  const [first, ...rest] = environments;
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Inspiração"
          title="Ambientes para planejar sua reforma"
          description="Ideias e combinações de produtos para cada cômodo da casa."
          action={
            <Link href={routes.environments()} className={buttonVariants({ variant: "outline" })}>
              Ver ambientes
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          {first ? <EnvironmentCard environment={first} large /> : null}
          <ul className="grid grid-cols-2 gap-4">
            {rest.slice(0, 4).map((env) => (
              <li key={env.id}>
                <EnvironmentCard environment={env} />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

export function EnvironmentCard({ environment, large = false }: { environment: Environment; large?: boolean }) {
  return (
    <Link
      href={routes.environment(environment.slug)}
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-muted",
        large ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[480px]" : "aspect-[4/5] sm:aspect-[4/3]",
      )}
    >
      {environment.imageUrl ? (
        <Image
          src={environment.imageUrl}
          alt=""
          fill
          sizes={large ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 22vw, 50vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : null}
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-transparent to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
        <span className={cn("font-display block font-bold", large ? "text-3xl" : "text-lg")}>{environment.name}</span>
        {large && environment.summary ? (
          <span className="mt-2 block max-w-md text-sm text-white/85">{environment.summary}</span>
        ) : null}
      </span>
    </Link>
  );
}

export function BrandStrip({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;
  return (
    <Section className="border-y bg-surface py-12 sm:py-14">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Marcas</Eyebrow>
            <Heading size="sm" className="mt-2">
              Marcas que você encontra aqui
            </Heading>
          </div>
          <Link href={routes.brands()} className="text-sm font-semibold text-primary hover:underline">
            Ver todas as marcas
          </Link>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px overflow-hidden rounded-lg border bg-border">
          {brands.slice(0, 8).map((brand) => (
            <li key={brand.id} className="bg-surface">
              <Link
                href={routes.brand(brand.slug)}
                className="flex h-24 items-center justify-center px-4 text-center transition-colors hover:bg-muted"
              >
                {brand.logoUrl ? (
                  <Image src={brand.logoUrl} alt={brand.name} width={140} height={56} className="max-h-12 w-auto object-contain" />
                ) : (
                  <span className="font-display text-sm font-bold tracking-tight text-foreground/80" style={{ fontStretch: "118%" }}>
                    {brand.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Como funciona — sequência real de uso do catálogo (por isso numerada) */
export function HowItWorks() {
  const steps = [
    { icon: PackageSearch, title: "Encontre o produto", text: "Busque por nome, marca ou código e confira fotos e especificações técnicas." },
    { icon: ClipboardList, title: "Monte sua lista", text: "Adicione itens à Lista de Orçamento com variação e quantidade — sem cadastro." },
    { icon: MessageCircle, title: "Envie pelo WhatsApp", text: "A lista vai organizada para nossa equipe confirmar disponibilidade e valores." },
    { icon: Truck, title: "Combine a entrega", text: "Defina retirada ou entrega diretamente com o vendedor, no seu tempo." },
  ];
  return (
    <Section className="bg-secondary text-secondary-foreground">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <Eyebrow className="text-secondary-foreground/60">Como funciona</Eyebrow>
            <Heading size="lg" className="mt-3 text-secondary-foreground">
              Orçamento sem complicação, atendimento de gente.
            </Heading>
            <p className="mt-5 max-w-md text-secondary-foreground/75">
              O site é o nosso catálogo. Você escolhe com calma, e um especialista da Cerigatto confirma tudo com você
              antes de fechar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={routes.quoteList()} className={buttonVariants({ variant: "accent", size: "lg" })}>
                Abrir minha lista
              </Link>
              <WhatsAppLink
                origin="how_it_works"
                size="lg"
                variant="outline"
                className="border-secondary-foreground/25 bg-transparent text-secondary-foreground hover:border-secondary-foreground hover:bg-transparent"
              >
                Falar agora
              </WhatsAppLink>
            </div>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-xl bg-secondary-foreground/10 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="bg-secondary p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <step.icon className="size-7 text-accent" aria-hidden="true" />
                  <span className="font-mono text-sm text-secondary-foreground/40">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <p className="font-display mt-6 text-xl font-bold">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-secondary-foreground/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

export function TipsSection({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null;
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Dicas"
          title="Para quem está construindo ou reformando"
          action={
            <Link href={routes.blog()} className={buttonVariants({ variant: "outline" })}>
              Todas as dicas
            </Link>
          }
        />
        <ul className="grid gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function PostCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.coverAlt ?? ""}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase">
        {post.category ? <span>{post.category.name}</span> : null}
        {post.publishedAt ? (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </>
        ) : null}
      </div>
      <h3 className="font-display mt-2 text-xl leading-snug font-bold text-balance">
        <Link href={routes.blogPost(post.slug)} className="after:absolute after:inset-0 hover:text-primary">
          {post.title}
        </Link>
      </h3>
      {post.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p> : null}
    </article>
  );
}

/** "Visite a Cerigatto" — exibe apenas dados realmente cadastrados */
export function VisitSection({ config }: { config: SiteConfig }) {
  const { business, hours } = config;
  const address = formatAddress(business);
  const hoursRows = formatHoursByDay(hours);
  const mapsQuery = address ? encodeURIComponent(`${config.site.siteName}, ${address}`) : null;
  const directions =
    business.latitude != null && business.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      : mapsQuery
        ? `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`
        : null;
  const openMaps = business.googleMapsUrl ?? (mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : null);

  return (
    <Section className="bg-surface">
      <Container>
        <div className="grid overflow-hidden rounded-xl border lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <Tape thin className="mb-6 w-16" />
            <Heading size="lg">Visite a Cerigatto</Heading>
            <p className="mt-4 flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{address ?? `${business.city}/${business.state}`}</span>
            </p>
            {hoursRows.length ? (
              <dl className="mt-6 grid max-w-sm gap-1.5 text-sm">
                {hoursRows.map((row) => (
                  <div key={row.day} className="flex justify-between gap-6 border-b border-dashed pb-1.5">
                    <dt className="text-muted-foreground">{row.day}</dt>
                    <dd className="font-medium">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              {directions ? (
                <a href={directions} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "primary" })}>
                  Traçar rota
                </a>
              ) : null}
              {openMaps ? (
                <a href={openMaps} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
                  Abrir no Google Maps
                </a>
              ) : null}
              <WhatsAppLink origin="visit_section" variant={directions ? "ghost" : "whatsapp"}>
                Pedir informações
              </WhatsAppLink>
            </div>
          </div>
          <div className="relative min-h-72 bg-muted">
            {mapsQuery ? (
              <iframe
                title={`Mapa: ${config.site.siteName}`}
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                className="absolute inset-0 size-full border-0 grayscale-[30%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] p-8 text-center">
                <p className="max-w-xs rounded-lg bg-surface/90 p-4 text-sm text-muted-foreground shadow">
                  Fale com a nossa equipe pelo WhatsApp para saber como chegar.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
