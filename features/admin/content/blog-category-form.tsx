"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin/action-result";
import { slugify } from "@/lib/slug";
import { Input } from "@/components/ui/form-controls";
import { SubmitButton } from "@/features/admin/ui/client-ui";
import { createBlogCategory } from "./actions";

/** Formulário compacto para criar categorias do blog */
export function BlogCategoryForm() {
  const [state, action] = useActionState<ActionResult<{ redirectTo?: string }> | null, FormData>(createBlogCategory, null);
  const [name, setName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Categoria criada");
      formRef.current?.reset();
    } else toast.error(state.error);
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      onReset={() => setName("")}
      className="flex flex-wrap items-end gap-2"
    >
      <Input name="name" aria-label="Nome da categoria" placeholder="Nova categoria" value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-48" />
      <input type="hidden" name="slug" value={slugify(name)} />
      <SubmitButton size="sm" variant="outline" pendingLabel="Criando…" disabled={!name.trim()}>
        Adicionar
      </SubmitButton>
    </form>
  );
}
