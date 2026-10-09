import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Container, Eyebrow, Heading, Tape } from "@/components/ui/primitives";

/** Cabeçalho padrão de páginas internas (com imagem opcional de banner) */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  description,
  imageUrl,
  children,
  className,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  children?: ReactNode;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={cn("relative isolate overflow-hidden bg-secondary text-white", className)}>
        <Image src={imageUrl} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-secondary via-secondary/70 to-transparent" />
        <Container className="py-10 sm:py-14">
          <Breadcrumbs items={crumbs} className="text-white/70 [&_a:hover]:text-white [&_span[aria-current]]:text-white" />
          <div className="mt-8 max-w-3xl">
            {eyebrow ? <Eyebrow className="mb-3 text-white/70">{eyebrow}</Eyebrow> : null}
            <Heading as="h1" size="lg" className="text-white">
              {title}
            </Heading>
            {description ? <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">{description}</p> : null}
            {children}
          </div>
        </Container>
        <Tape />
      </div>
    );
  }
  return (
    <div className={cn("border-b bg-surface", className)}>
      <Container className="py-8 sm:py-10">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 max-w-3xl">
          {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
          <Heading as="h1" size="lg">
            {title}
          </Heading>
          {description ? <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p> : null}
          {children}
        </div>
      </Container>
    </div>
  );
}
