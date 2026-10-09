import { cacheLife } from "next/cache";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { formatAddress } from "@/lib/address";
import { formatCnpj, formatPhone, onlyDigits } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getCategoryTree } from "@/services/catalog";
import { getSiteConfig } from "@/services/settings";
import { Container, Tape } from "@/components/ui/primitives";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";
import { formatHoursByDay } from "./hours";
import { Logo } from "./logo";
import { SOCIAL_LABELS, SocialIcon } from "./social-icon";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 font-mono text-[0.68rem] font-medium tracking-[0.16em] text-secondary-foreground/60 uppercase">{title}</p>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-secondary-foreground/85 transition-colors hover:text-accent">
        {children}
      </Link>
    </li>
  );
}

export async function SiteFooter() {
  const [config, tree] = await Promise.all([getSiteConfig(), getCategoryTree()]);
  const { site, business, hours, social } = config;
  const address = formatAddress(business);
  const hoursRows = formatHoursByDay(hours);

  return (
    <footer className="mt-auto bg-secondary text-secondary-foreground">
      <Tape />
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12">
        <div className="max-w-sm">
          <Logo logoUrl={site.logoDarkUrl} siteName={site.siteName} inverted />
          <p className="mt-5 text-sm leading-relaxed text-secondary-foreground/75">
            {site.description ??
              "Catálogo de materiais de construção, acabamento e ferramentas. Encontre o produto, monte sua lista e fale com nossa equipe pelo WhatsApp."}
          </p>
          {social.length ? (
            <ul className="mt-6 flex gap-2" aria-label="Redes sociais">
              {social.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[link.platform]}
                    className="inline-flex size-10 items-center justify-center rounded-md border border-secondary-foreground/15 transition-colors hover:border-accent hover:text-accent"
                  >
                    <SocialIcon platform={link.platform} className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <FooterColumn title="Departamentos">
          {tree.slice(0, 8).map((category) => (
            <FooterLink key={category.id} href={routes.category(category.slug)}>
              {category.name}
            </FooterLink>
          ))}
          <FooterLink href={routes.products()}>Todos os produtos</FooterLink>
        </FooterColumn>

        <FooterColumn title="Institucional">
          <FooterLink href={routes.about()}>Sobre a Cerigatto</FooterLink>
          <FooterLink href={routes.offers()}>Ofertas</FooterLink>
          <FooterLink href={routes.brands()}>Marcas</FooterLink>
          <FooterLink href={routes.environments()}>Ambientes</FooterLink>
          <FooterLink href={routes.blog()}>Dicas para obra</FooterLink>
          <FooterLink href={routes.quoteList()}>Minha Lista de Orçamento</FooterLink>
          <FooterLink href={routes.favorites()}>Favoritos</FooterLink>
        </FooterColumn>

        <div>
          <p className="mb-4 font-mono text-[0.68rem] font-medium tracking-[0.16em] text-secondary-foreground/60 uppercase">
            Atendimento
          </p>
          <WhatsAppLink origin="footer" size="md" className="mb-5 w-full sm:w-auto">
            Fale com a Cerigatto
          </WhatsAppLink>
          <ul className="space-y-3 text-sm text-secondary-foreground/85">
            {business.phone ? (
              <li>
                <a href={`tel:+55${onlyDigits(business.phone)}`} className="inline-flex items-center gap-2 hover:text-accent">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  {formatPhone(business.phone)}
                </a>
              </li>
            ) : null}
            {business.email ? (
              <li>
                <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2 break-all hover:text-accent">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {business.email}
                </a>
              </li>
            ) : null}
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{address ?? `${business.city}/${business.state}`}</span>
            </li>
          </ul>
          {hoursRows.length ? (
            <dl className="mt-5 space-y-1 text-sm">
              {hoursRows.map((row) => (
                <div key={row.day} className="flex justify-between gap-4">
                  <dt className="text-secondary-foreground/60">{row.day}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </Container>

      <div className="border-t border-secondary-foreground/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-secondary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>
            © <CurrentYear /> {business.legalName ?? site.siteName}
            {business.cnpj ? ` · CNPJ ${formatCnpj(business.cnpj)}` : null}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href={routes.privacy()} className="hover:text-accent">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href={routes.terms()} className="hover:text-accent">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link href={routes.cookies()} className="hover:text-accent">
                Política de Cookies
              </Link>
            </li>
          </ul>
          <p>Catálogo digital — preços e disponibilidade confirmados no atendimento.</p>
        </Container>
      </div>
    </footer>
  );
}
