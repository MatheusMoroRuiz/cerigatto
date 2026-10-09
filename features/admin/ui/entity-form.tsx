"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin/action-result";
import { Notice } from "@/components/ui/feedback";
import { SubmitButton } from "./client-ui";

export type FormAction = (prev: ActionResult<{ redirectTo?: string }> | null, formData: FormData) => Promise<ActionResult<{ redirectTo?: string }>>;

/**
 * Formulário padrão do painel: Server Action + useActionState, mensagens de
 * erro por campo (via contexto de render prop) e toast de sucesso.
 */
export function EntityForm({
  action,
  children,
  submitLabel = "Salvar",
  footer,
}: {
  action: FormAction;
  children: (errors: Record<string, string>) => ReactNode;
  submitLabel?: string;
  footer?: ReactNode;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, null);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Salvo");
      if (state.data?.redirectTo) router.push(state.data.redirectTo);
      else router.refresh();
    } else {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} noValidate>
      {state && !state.ok ? (
        <Notice tone="danger" className="mb-6">
          {state.error}
        </Notice>
      ) : null}
      <div className="rounded-xl border bg-surface px-5 py-6 sm:px-8">{children(errors)}</div>
      <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center gap-3 border-t bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {footer}
        <SubmitButton className="ml-auto">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
