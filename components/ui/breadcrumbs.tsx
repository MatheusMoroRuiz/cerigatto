import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { absoluteUrl } from "@/lib/env";
import { JsonLd } from "@/components/seo/json-ld";

export type Crumb = { label: string; href?: string };

/** Breadcrumb acessível + BreadcrumbList (Schema.org) */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all: Crumb[] = [{ label: "Início", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Trilha de navegação" className={cn("text-sm text-muted-foreground", className)}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {all.map((item, index) => {
            const isLast = index === all.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                {item.href && !isLast ? (
                  <Link href={item.href} className="truncate hover:text-foreground hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined} className="truncate font-medium text-foreground">
                    {item.label}
                  </span>
                )}
                {!isLast ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: absoluteUrl(item.href) } : {}),
          })),
        }}
      />
    </>
  );
}
