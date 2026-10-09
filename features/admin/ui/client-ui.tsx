"use client";

import { Loader2 } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { useState, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin/action-result";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({ children, pendingLabel = "Salvando…", ...props }: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}

/**
 * Botão com confirmação para ações destrutivas/sensíveis.
 * Executa a Server Action e mostra o resultado em um toast.
 */
export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  tone = "danger",
  action,
  onDone,
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  action: () => Promise<ActionResult<unknown>>;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="sheet-overlay fixed inset-0 z-50 bg-secondary/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-6 shadow-2xl">
          <AlertDialog.Title className="font-display text-lg font-bold">{title}</AlertDialog.Title>
          <AlertDialog.Description asChild>
            <div className="mt-2 text-sm text-muted-foreground">{description}</div>
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" disabled={pending}>
                Cancelar
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant={tone === "danger" ? "danger" : "primary"}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await action();
                  if (result.ok) {
                    toast.success(result.message ?? "Pronto");
                    setOpen(false);
                    onDone?.();
                  } else {
                    toast.error(result.error);
                  }
                })
              }
            >
              {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/** Executa uma Server Action simples (sem confirmação) com feedback em toast */
export function ActionButton({
  action,
  children,
  ...props
}: Omit<ButtonProps, "onClick" | "action"> & { action: () => Promise<ActionResult<unknown>> }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      onClick={() =>
        startTransition(async () => {
          const result = await action();
          if (result.ok) toast.success(result.message ?? "Pronto");
          else toast.error(result.error);
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
