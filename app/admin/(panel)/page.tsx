import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { formatDate, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { createServerSupabase } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { AdminCard, AdminPageHeader } from "@/features/admin/ui/admin-ui";

export const metadata: Metadata = { title: "Dashboard" };

const PERIODS = [
  { days: 1, label: "Hoje" },
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
] as const;

type Ranked = { id?: string; name?: string; slug?: string; term?: string; path?: string; source?: string; total: number; avg_results?: number };
type Dashboard = {
  products_total: number;
  products_published: number;
  products_draft: number;
  products_archived: number;
  categories_total: number;
  brands_total: number;
  contacts_period: number;
  contacts_new: number;
  quotes_period: number;
  whatsapp_clicks: number;
  product_views: number;
  searches: number;
  top_viewed: Ranked[];
  top_consulted: Ranked[];
  top_searches: Ranked[];
  zero_result_searches: Ranked[];
  top_pages: Ranked[];
  whatsapp_by_source: Ranked[];
  daily_whatsapp: { day: string; total: number }[];
};

function Stat({ label, value, hint, href }: { label: string; value: number; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-3xl font-bold">{formatNumber(value)}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );
  return href ? (
    <Link href={href} className="rounded-xl border bg-surface p-5 transition-colors hover:border-foreground">
      {body}
    </Link>
  ) : (
    <div className="rounded-xl border bg-surface p-5">{body}</div>
  );
}

function RankList({ items, empty, render }: { items: Ranked[]; empty: string; render: (item: Ranked) => React.ReactNode }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...items.map((i) => i.total), 1);
  return (
    <ol className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate">{render(item)}</span>
            <span className="font-mono text-xs text-muted-foreground">{formatNumber(item.total)}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary/70" style={{ width: `${(item.total / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  const session = await requireAdmin("editor");
  const requested = Number((await searchParams).periodo);
  const days = PERIODS.some((p) => p.days === requested) ? requested : 30;
  const supabase = await createServerSupabase();
  const [{ data, error }, site, business, whatsapp, hours] = await Promise.all([
    supabase.rpc("admin_dashboard", { p_days: days }),
    supabase.from("site_settings").select("logo_url, demo_notice_enabled").eq("id", 1).single(),
    supabase.from("business_information").select("street, phone").eq("id", 1).single(),
    supabase.from("whatsapp_settings").select("phone_number").eq("id", 1).single(),
    supabase.from("business_hours").select("id", { count: "exact", head: true }),
  ]);
  const d = (data ?? null) as Dashboard | null;

  const setup = [
    { done: Boolean(whatsapp.data?.phone_number), label: "Número do WhatsApp", href: "/admin/configuracoes?aba=whatsapp" },
    { done: Boolean(business.data?.street), label: "Endereço da loja", href: "/admin/configuracoes?aba=empresa" },
    { done: Boolean(business.data?.phone), label: "Telefone", href: "/admin/configuracoes?aba=empresa" },
    { done: Boolean(hours.count), label: "Horário de atendimento", href: "/admin/configuracoes?aba=horarios" },
    { done: Boolean(site.data?.logo_url), label: "Logotipo oficial", href: "/admin/configuracoes" },
    { done: !site.data?.demo_notice_enabled, label: "Desligar aviso de demonstração", href: "/admin/configuracoes" },
  ];
  const pending = setup.filter((s) => !s.done);
  const maxDaily = Math.max(...(d?.daily_whatsapp ?? []).map((x) => x.total), 1);

  return (
    <>
      <AdminPageHeader
        title={`Olá${session.name ? `, ${session.name.split(" ")[0]}` : ""}`}
        description="Resumo do catálogo e do interesse dos visitantes."
        actions={
          <nav className="flex gap-1 rounded-lg border bg-surface p-1" aria-label="Período">
            {PERIODS.map((p) => (
              <Link
                key={p.days}
                href={`/admin?periodo=${p.days}`}
                aria-current={days === p.days ? "page" : undefined}
                className={cn("rounded-md px-3 py-1.5 text-sm font-medium", days === p.days ? "bg-secondary text-secondary-foreground" : "hover:bg-muted")}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        }
      />

      {pending.length ? (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-5">
          <p className="flex items-center gap-2 font-semibold text-warning">
            <AlertTriangle className="size-5" aria-hidden="true" /> Complete a configuração para publicar o site
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {setup.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className="flex items-center gap-2 text-sm hover:underline">
                  {s.done ? <CheckCircle2 className="size-4 text-success" aria-hidden="true" /> : <span className="size-4 rounded-full border-2 border-warning" aria-hidden="true" />}
                  <span className={s.done ? "text-muted-foreground line-through" : ""}>{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error || !d ? (
        <AdminCard>
          <p className="text-sm text-muted-foreground">Não foi possível carregar os indicadores agora.</p>
        </AdminCard>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Cliques no WhatsApp" value={d.whatsapp_clicks} hint="No período" />
            <Stat label="Visualizações de produto" value={d.product_views} hint="No período" />
            <Stat label="Listas de orçamento" value={d.quotes_period} hint="Enviadas no período" href="/admin/solicitacoes" />
            <Stat label="Contatos" value={d.contacts_period} hint={`${d.contacts_new} aguardando resposta`} href="/admin/contatos?status=new" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Produtos" value={d.products_total} hint={`${d.products_published} publicados · ${d.products_draft} rascunhos · ${d.products_archived} arquivados`} href="/admin/produtos" />
            <Stat label="Inativos (rascunho)" value={d.products_draft} href="/admin/produtos?status=draft" />
            <Stat label="Categorias" value={d.categories_total} href="/admin/categorias" />
            <Stat label="Marcas" value={d.brands_total} href="/admin/marcas" />
          </div>

          <AdminCard title="Cliques no WhatsApp por dia">
            {d.daily_whatsapp.length ? (
              <div className="flex h-40 items-end gap-1" role="img" aria-label="Gráfico de cliques no WhatsApp por dia">
                {d.daily_whatsapp.map((point) => (
                  <div key={point.day} className="group relative flex-1">
                    <div className="rounded-t bg-whatsapp/80 transition-colors group-hover:bg-whatsapp" style={{ height: `${Math.max((point.total / maxDaily) * 144, 3)}px` }} />
                    <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded bg-secondary px-1.5 py-0.5 text-xs whitespace-nowrap text-secondary-foreground group-hover:block">
                      {formatDate(`${point.day}T12:00:00`)}: {point.total}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem cliques registrados no período.</p>
            )}
          </AdminCard>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <AdminCard title="Produtos mais acessados">
              <RankList items={d.top_viewed} empty="Sem dados no período." render={(i) => <Link href={`/admin/produtos/${i.id}`} className="hover:text-primary">{i.name}</Link>} />
            </AdminCard>
            <AdminCard title="Produtos mais consultados" description="WhatsApp + Lista de Orçamento">
              <RankList items={d.top_consulted} empty="Sem dados no período." render={(i) => <Link href={`/admin/produtos/${i.id}`} className="hover:text-primary">{i.name}</Link>} />
            </AdminCard>
            <AdminCard title="Origem dos contatos no WhatsApp">
              <RankList items={d.whatsapp_by_source} empty="Sem dados no período." render={(i) => i.source} />
            </AdminCard>
            <AdminCard title="Termos mais pesquisados">
              <RankList items={d.top_searches} empty="Sem buscas no período." render={(i) => <a href={routes.search(i.term ?? "")} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{i.term}</a>} />
            </AdminCard>
            <AdminCard title="Buscas sem resultado" description="Oportunidades de cadastro">
              <RankList items={d.zero_result_searches} empty="Nenhuma busca sem resultado." render={(i) => i.term} />
            </AdminCard>
            <AdminCard title="Páginas mais acessadas">
              <RankList items={d.top_pages} empty="Sem dados no período." render={(i) => <span className="font-mono text-xs">{i.path}</span>} />
            </AdminCard>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/produtos/novo" className={buttonVariants()}>Novo produto</Link>
            <Link href="/admin/banners" className={buttonVariants({ variant: "outline" })}>Gerenciar banners</Link>
            <Link href="/admin/ofertas" className={buttonVariants({ variant: "outline" })}>Ofertas</Link>
          </div>
        </div>
      )}
    </>
  );
}
