"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form-controls";
import { requestPasswordReset, signIn, updatePassword, type AuthFormState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signIn, {});
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetState, resetAction, resetPending] = useActionState<AuthFormState, FormData>(requestPasswordReset, {});

  if (mode === "reset") {
    return (
      <form action={resetAction} className="grid gap-5">
        {resetState.error ? <Notice tone="danger">{resetState.error}</Notice> : null}
        {resetState.message ? <Notice tone="success">{resetState.message}</Notice> : null}
        <Field id="reset-email" label="E-mail cadastrado" required>
          <Input id="reset-email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Button type="submit" variant="secondary" size="lg" disabled={resetPending}>
          {resetPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Enviar link de redefinição
        </Button>
        <button type="button" onClick={() => setMode("login")} className="text-sm font-semibold text-primary hover:underline">
          Voltar para o login
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="grid gap-5">
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" label="E-mail" required>
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field id="password" label="Senha" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" variant="secondary" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <button type="button" onClick={() => setMode("reset")} className="text-sm font-semibold text-primary hover:underline">
        Esqueci minha senha
      </button>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(updatePassword, {});
  return (
    <form action={action} className="grid gap-5">
      {state.error ? <Notice tone="danger">{state.error}</Notice> : null}
      <Field id="password" label="Nova senha" hint="Mínimo de 10 caracteres, com maiúsculas, minúsculas e números." required>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field id="confirm" label="Confirme a nova senha" required>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" variant="secondary" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Salvar nova senha
      </Button>
    </form>
  );
}
