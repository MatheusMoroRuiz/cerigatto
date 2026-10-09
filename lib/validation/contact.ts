import { z } from "zod";
import { onlyDigits } from "@/lib/format";

const phone = z
  .string()
  .trim()
  .transform((v) => onlyDigits(v))
  .refine((v) => v === "" || (v.length >= 10 && v.length <= 13), "Informe DDD + número (ex.: 14 99999-9999).");

/** Validação compartilhada (navegador e servidor) do formulário de contato */
export const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome.").max(120, "Nome muito longo."),
    phone: phone.optional().default(""),
    whatsapp: phone.optional().default(""),
    email: z
      .string()
      .trim()
      .max(160)
      .refine((v) => v === "" || z.email().safeParse(v).success, "Informe um e-mail válido.")
      .optional()
      .default(""),
    subject: z.string().trim().min(2, "Informe o assunto.").max(160, "Assunto muito longo."),
    message: z.string().trim().min(5, "Escreva sua mensagem.").max(4000, "Mensagem muito longa (máx. 4000 caracteres)."),
    consent: z.literal(true, { error: "É preciso concordar com o uso dos dados para responder ao contato." }),
    // Honeypot: precisa ficar vazio
    company: z.string().max(0).optional().default(""),
  })
  .refine((data) => data.phone || data.whatsapp || data.email, {
    message: "Informe ao menos um meio de contato: WhatsApp, telefone ou e-mail.",
    path: ["whatsapp"],
  });

export type ContactInput = z.input<typeof contactSchema>;
