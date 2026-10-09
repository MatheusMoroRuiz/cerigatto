import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { formatAddress } from "@/lib/address";
import { absoluteUrl } from "@/lib/env";
import { formatPhone, onlyDigits } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getSiteConfig } from "@/services/settings";
import { Container, Heading, Section } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/page-header";
import { formatHoursByDay } from "@/components/layout/hours";
import { SOCIAL_LABELS, SocialIcon } from "@/components/layout/social-icon";
import { ContactForm } from "@/features/contact/contact-form";
import { VisitSection } from "@/features/home/sections";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Cerigatto Materiais de Construção, em Bauru/SP: WhatsApp, telefone, e-mail e formulário de contato.",
  alternates: { canonical: absoluteUrl(routes.contact()) },
};

export default async function ContactPage() {
  const config = await getSiteConfig();
  const { business, hours, social } = config;
  const address = formatAddress(business);
  const hoursRows = formatHoursByDay(hours);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Contato" }]}
        eyebrow="Atendimento"
        title="Fale com a Cerigatto"
        description="O jeito mais rápido é pelo WhatsApp. Se preferir, envie uma mensagem pelo formulário."
      />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div className="space-y-8">
            <div className="rounded-xl bg-secondary p-6 text-secondary-foreground sm:p-8">
              <p className="font-display text-2xl font-bold">Atendimento pelo WhatsApp</p>
              <p className="mt-2 text-secondary-foreground/75">
                Consulte disponibilidade, peça orçamento e combine entrega direto com um vendedor.
              </p>
              <WhatsAppLink origin="contact_page" size="lg" className="mt-6">
                Chamar no WhatsApp
              </WhatsAppLink>
            </div>

            <ul className="space-y-5">
              {business.phone ? (
                <li className="flex gap-4">
                  <Phone className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <a href={`tel:+55${onlyDigits(business.phone)}`} className="font-semibold hover:text-primary">
                      {formatPhone(business.phone)}
                    </a>
                  </div>
                </li>
              ) : null}
              {business.email ? (
                <li className="flex gap-4">
                  <Mail className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <a href={`mailto:${business.email}`} className="font-semibold break-all hover:text-primary">
                      {business.email}
                    </a>
                  </div>
                </li>
              ) : null}
              <li className="flex gap-4">
                <MapPin className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-semibold">{address ?? `${business.city}/${business.state}`}</p>
                </div>
              </li>
              {hoursRows.length ? (
                <li className="flex gap-4">
                  <Clock className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Horário de atendimento</p>
                    <dl className="mt-1 grid max-w-xs gap-1 text-sm">
                      {hoursRows.map((row) => (
                        <div key={row.day} className="flex justify-between gap-4">
                          <dt>{row.day}</dt>
                          <dd className="font-medium">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </li>
              ) : null}
            </ul>

            {social.length ? (
              <ul className="flex flex-wrap gap-2" aria-label="Redes sociais">
                {social.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-sm font-medium hover:border-foreground"
                    >
                      <SocialIcon platform={link.platform} className="size-4" />
                      {SOCIAL_LABELS[link.platform]}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="rounded-xl border bg-surface p-6 sm:p-8">
            <Heading size="sm" className="mb-6">
              Envie uma mensagem
            </Heading>
            <ContactForm />
          </div>
        </Container>
      </Section>
      <VisitSection config={config} />
    </>
  );
}
