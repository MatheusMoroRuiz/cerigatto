import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { formatPhone, onlyDigits } from "@/lib/format";
import { getCategoryTree } from "@/services/catalog";
import { getSiteConfig } from "@/services/settings";
import { Container } from "@/components/ui/primitives";
import { SearchBar } from "@/features/search/search-bar";
import { WhatsAppLink } from "@/features/whatsapp/whatsapp-link";
import { HeaderActions, MobileMenu, StickyHeader } from "./header-client";
import { Logo } from "./logo";
import { MegaMenu } from "./mega-menu";
import { summarizeHours } from "./hours";

export async function SiteHeader() {
  const [config, tree] = await Promise.all([getSiteConfig(), getCategoryTree()]);
  const menuTree = tree.filter((c) => c.showInMenu);
  const { site, business, hours } = config;
  const navLinks = site.navLinks.filter((link) => link.enabled);
  const phone = business.phone ? formatPhone(business.phone) : null;
  const phoneHref = business.phone ? `tel:+55${onlyDigits(business.phone)}` : null;
  const hoursSummary = summarizeHours(hours);

  return (
    <>
      {site.topbarEnabled || phone || hoursSummary ? (
        <div className="bg-secondary text-secondary-foreground">
          <Container className="flex h-9 items-center justify-between gap-4 text-xs">
            <p className="flex min-w-0 items-center gap-2 truncate">
              <MapPin className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="truncate">
                {business.city}/{business.state}
                {hoursSummary ? <span className="hidden sm:inline"> · {hoursSummary}</span> : null}
              </span>
            </p>
            {site.topbarEnabled && site.topbarMessage ? (
              site.topbarLink ? (
                <Link href={site.topbarLink} className="hidden truncate font-medium hover:underline md:block">
                  {site.topbarMessage}
                </Link>
              ) : (
                <p className="hidden truncate font-medium md:block">{site.topbarMessage}</p>
              )
            ) : null}
            {phone && phoneHref ? (
              <a href={phoneHref} className="hidden shrink-0 items-center gap-1.5 font-medium hover:underline sm:inline-flex">
                <Phone className="size-3.5" aria-hidden="true" />
                {phone}
              </a>
            ) : null}
          </Container>
        </div>
      ) : null}

      <StickyHeader>
        <Container className="flex items-center gap-3 py-3 lg:gap-8 lg:py-4">
          <MobileMenu tree={menuTree} navLinks={navLinks} phoneHref={phoneHref} phoneLabel={phone} />
          <Logo logoUrl={site.logoUrl} siteName={site.siteName} />
          <SearchBar className="hidden max-w-2xl flex-1 lg:block" />
          <div className="ml-auto flex items-center gap-2">
            <WhatsAppLink origin="header" size="md" className="hidden xl:inline-flex">
              Atendimento no WhatsApp
            </WhatsAppLink>
            <HeaderActions />
          </div>
        </Container>
        <Container className="pb-3 lg:hidden">
          <SearchBar size="md" />
        </Container>
        <div className="relative hidden border-t lg:block">
          <Container className="flex h-14 items-center gap-6">
            <MegaMenu tree={menuTree} />
            <nav aria-label="Principal" className="min-w-0">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap text-foreground/85 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </div>
      </StickyHeader>
    </>
  );
}
