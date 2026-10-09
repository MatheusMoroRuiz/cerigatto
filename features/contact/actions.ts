"use server";

import { getDataMode } from "@/lib/env.server";
import { rateLimit } from "@/lib/security/rate-limit";
import { createPublicSupabase } from "@/lib/supabase/public";
import { contactSchema } from "@/lib/validation/contact";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

/** Recebe o formulário de contato: valida, aplica anti-spam e grava no banco. */
export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse({ ...raw, consent: raw.consent === "on" });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (key === "company") return { status: "success" }; // bot: responde sucesso sem gravar
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Revise os campos destacados.", fieldErrors };
  }

  if (!(await rateLimit("contact", { max: 5, windowSeconds: 3600 }))) {
    return { status: "error", message: "Recebemos várias mensagens em sequência. Tente novamente mais tarde ou fale pelo WhatsApp." };
  }

  if (getDataMode() !== "supabase") {
    return { status: "error", message: "O envio está indisponível no modo de demonstração. Use o WhatsApp." };
  }

  const data = parsed.data;
  const source = typeof raw.source_page === "string" ? raw.source_page.slice(0, 300) : null;
  const { error } = await createPublicSupabase()
    .from("contacts")
    .insert({
      name: data.name,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      subject: data.subject,
      message: data.message,
      source_page: source,
    });

  if (error) {
    return { status: "error", message: "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp." };
  }
  return { status: "success" };
}
