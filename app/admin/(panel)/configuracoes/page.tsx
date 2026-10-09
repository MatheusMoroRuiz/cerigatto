import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { createServerSupabase } from "@/lib/supabase/server";
import { mapSiteConfig } from "@/services/mappers";
import { BusinessForm, HoursForm, SiteSettingsForm, SocialForm, WhatsappForm } from "@/features/admin/system/forms";
import { AdminCard, AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Configurações" };

const TABS = [
  { id: "geral", label: "Geral" },
  { id: "empresa", label: "Empresa e endereço" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "horarios", label: "Horários e redes" },
] as const;

export default async function AdminSettingsPage({ searchParams }: PageProps<"/admin/configuracoes">) {
  await requireAdmin("admin");
  const tabParam = (await searchParams).aba;
  const tab = TABS.find((t) => t.id === tabParam)?.id ?? "geral";
  const supabase = await createServerSupabase();
  const [site, business, whatsapp, hours, social] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("business_information").select("*").eq("id", 1).single(),
    supabase.from("whatsapp_settings").select("*").eq("id", 1).single(),
    supabase.from("business_hours").select("*").order("day_of_week").order("opens_at"),
    supabase.from("social_links").select("*"),
  ]);
  const config = mapSiteConfig({
    site: site.data,
    business: business.data,
    hours: hours.data ?? [],
    social: social.data ?? [],
    whatsapp: whatsapp.data,
    seo: null,
  });

  return (
    <>
      <AdminPageHeader title="Configurações" description="Tudo que aparece no site e pode mudar sem mexer em código." crumbs={[{ label: "Configurações" }]} />
      <nav className="mb-6 flex flex-wrap gap-1 border-b" aria-label="Seções">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/configuracoes?aba=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "geral" && site.data ? (
        <SiteSettingsForm
          values={{ ...site.data, nav_links: config.site.navLinks, theme: config.site.theme }}
        />
      ) : null}
      {tab === "empresa" && business.data ? <BusinessForm values={business.data} /> : null}
      {tab === "whatsapp" && whatsapp.data ? <WhatsappForm values={whatsapp.data} /> : null}
      {tab === "horarios" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <AdminCard title="Horário de atendimento" description="Aparece no topo, rodapé, contato e no Google. Vários intervalos por dia são permitidos.">
            <HoursForm initial={hours.data ?? []} />
          </AdminCard>
          <AdminCard title="Redes sociais" description="Deixe vazio para não exibir.">
            <SocialForm values={Object.fromEntries((social.data ?? []).map((s) => [s.platform, s.url]))} />
          </AdminCard>
        </div>
      ) : null}
    </>
  );
}
