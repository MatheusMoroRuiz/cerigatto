import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Estado vazio com orientação de próxima ação */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      ) : null}
      <p className="font-display text-lg font-bold">{title}</p>
      {description ? <div className="mt-2 max-w-md text-sm text-muted-foreground">{description}</div> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "warning" | "success" | "danger";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        tone === "info" && "border-primary/20 bg-primary-soft text-primary",
        tone === "warning" && "border-warning/25 bg-warning/10 text-warning",
        tone === "success" && "border-success/25 bg-success/10 text-success",
        tone === "danger" && "border-danger/25 bg-danger/10 text-danger",
        className,
      )}
    >
      {children}
    </div>
  );
}
