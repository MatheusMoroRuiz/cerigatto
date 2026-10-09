"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/action-result";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "./client-ui";

/** Botão de exclusão com confirmação. Recebe uma Server Action já vinculada ao ID. */
export function DeleteButton({
  action,
  entityLabel,
  description,
  redirectTo,
  compact = false,
}: {
  action: () => Promise<ActionResult<unknown>>;
  entityLabel: string;
  description?: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  return (
    <ConfirmAction
      trigger={
        compact ? (
          <button type="button" aria-label={`Excluir ${entityLabel}`} title="Excluir" className="inline-flex size-9 items-center justify-center rounded-md text-danger hover:bg-danger/10">
            <Trash2 className="size-4" />
          </button>
        ) : (
          <Button variant="ghost" className="text-danger hover:bg-danger/10">
            <Trash2 aria-hidden="true" /> Excluir
          </Button>
        )
      }
      title={`Excluir ${entityLabel}?`}
      description={description ?? "Esta ação remove o item do site. Confira antes de continuar."}
      confirmLabel="Excluir"
      action={action}
      onDone={() => (redirectTo ? router.push(redirectTo) : router.refresh())}
    />
  );
}
