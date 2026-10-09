import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Monta a sequência 1 … 4 5 6 … 12 */
export function paginationRange(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1]! > 1) result.push("gap");
    result.push(page);
  });
  return result;
}

/** Paginação por links (indexável). buildHref recebe o número da página. */
export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const itemClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors";
  return (
    <nav aria-label="Paginação" className={cn("flex justify-center", className)}>
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={buildHref(page - 1)} rel="prev" className={cn(itemClass, "bg-surface hover:border-foreground")}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Anterior</span>
            </Link>
          ) : null}
        </li>
        {paginationRange(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={buildHref(item)}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  itemClass,
                  item === page
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "bg-surface hover:border-foreground",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < totalPages ? (
            <Link href={buildHref(page + 1)} rel="next" className={cn(itemClass, "bg-surface hover:border-foreground")}>
              <span className="sr-only sm:not-sr-only sm:mr-1">Próxima</span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </li>
      </ul>
    </nav>
  );
}
