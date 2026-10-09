/**
 * Primitivas de layout e tipografia do design system Cerigatto.
 */
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10", className)} {...props} />;
}

export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("py-12 sm:py-16 lg:py-20", className)} {...props} />;
}

/** Faixa de trena — assinatura visual */
export function Tape({ className, thin = false }: { className?: string; thin?: boolean }) {
  return <div aria-hidden="true" className={cn(thin ? "tape-thin" : "tape", "w-full", className)} />;
}

export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn("font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase", className)}>
      {children}
    </p>
  );
}

const headingVariants = cva("font-display font-bold text-balance text-foreground", {
  variants: {
    size: {
      xl: "text-[2.25rem] leading-[1.02] sm:text-5xl lg:text-[4rem]",
      lg: "text-3xl leading-[1.08] sm:text-4xl lg:text-[2.75rem]",
      md: "text-2xl leading-tight sm:text-3xl",
      sm: "text-xl leading-snug sm:text-2xl",
    },
  },
  defaultVariants: { size: "md" },
});

type HeadingProps = ComponentProps<"h2"> &
  VariantProps<typeof headingVariants> & { as?: "h1" | "h2" | "h3" | "p" };

export function Heading({ as: Tag = "h2", size, className, ...props }: HeadingProps) {
  return <Tag className={cn(headingVariants({ size }), className)} {...props} />;
}

/** Cabeçalho de seção: rótulo, título, descrição e ação opcional */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  action?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <div className="mb-3 flex items-center gap-3">
            <Tape thin className="w-10" />
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        ) : null}
        <Heading id={id} size="md">
          {title}
        </Heading>
        {description ? <p className="mt-3 text-base text-pretty text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[0.7rem] leading-5 font-semibold tracking-wide uppercase",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-foreground",
        primary: "bg-primary-soft text-primary",
        accent: "bg-accent text-accent-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
        muted: "bg-muted text-muted-foreground",
        ink: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  tone,
  className,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden="true" className={cn("skeleton rounded-md", className)} {...props} />;
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
