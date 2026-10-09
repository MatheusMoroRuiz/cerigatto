"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { routes } from "@/lib/routes";
import { contactSchema } from "@/lib/validation/contact";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form-controls";
import { submitContact, type ContactState } from "./actions";

const INITIAL: ContactState = { status: "idle" };

export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const errors = { ...(state.status === "error" ? (state.fieldErrors ?? {}) : {}), ...clientErrors };

  useEffect(() => {
    if (state.status === "success") trackEvent("contact_submit");
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-xl border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden="true" />
        <p className="font-display mt-4 text-xl font-bold">Mensagem enviada</p>
        <p className="mt-2 text-muted-foreground">Recebemos seu contato e responderemos pelo canal informado.</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());
        const parsed = contactSchema.safeParse({ ...data, consent: data.consent === "on" });
        if (!parsed.success) {
          event.preventDefault();
          const next: Record<string, string> = {};
          for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
          setClientErrors(next);
          return;
        }
        setClientErrors({});
      }}
      className="grid gap-5"
    >
      {state.status === "error" ? <Notice tone="danger">{state.message}</Notice> : null}

      <Field id="name" label="Nome" required error={errors.name}>
        <Input id="name" name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} maxLength={120} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="whatsapp" label="WhatsApp" hint="Com DDD" error={errors.whatsapp}>
          <Input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.whatsapp)} />
        </Field>
        <Field id="phone" label="Telefone" hint="Opcional" error={errors.phone}>
          <Input id="phone" name="phone" type="tel" inputMode="tel" aria-invalid={Boolean(errors.phone)} />
        </Field>
      </div>
      <Field id="email" label="E-mail" hint="Opcional se informar WhatsApp ou telefone" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />
      </Field>
      <Field id="subject" label="Assunto" required error={errors.subject}>
        <Input id="subject" name="subject" defaultValue={defaultSubject} aria-invalid={Boolean(errors.subject)} maxLength={160} />
      </Field>
      <Field id="message" label="Mensagem" required error={errors.message}>
        <Textarea id="message" name="message" rows={5} aria-invalid={Boolean(errors.message)} maxLength={4000} />
      </Field>

      {/* Honeypot anti-spam: invisível para pessoas */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="company">Empresa</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="source_page" value={routes.contact()} />

      <div>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox name="consent" className="mt-0.5" aria-invalid={Boolean(errors.consent)} />
          <span>
            Concordo com o uso dos meus dados para receber resposta a este contato, conforme a{" "}
            <Link href={routes.privacy()} className="font-semibold text-primary underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.consent ? (
          <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" variant="secondary" disabled={pending} className="sm:w-fit">
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? "Enviando…" : "Enviar mensagem"}
      </Button>
    </form>
  );
}
