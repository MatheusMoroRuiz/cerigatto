"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin/action-result";
import { LEAD_STATUS_LABELS, WEEKDAY_LABELS } from "@/lib/constants";
import { formatPhone } from "@/lib/format";
import { toDateTimeLocal } from "@/lib/validation/common";
import type { LeadStatus } from "@/types/catalog";
import type { NavLink } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { ImageField } from "@/features/admin/upload/image-field";
import { FormSection } from "@/features/admin/ui/admin-ui";
import { SubmitButton } from "@/features/admin/ui/client-ui";
import { EntityForm } from "@/features/admin/ui/entity-form";
import {
  inviteAdmin,
  saveBusinessHours,
  saveBusinessInfo,
  saveOffer,
  saveRedirect,
  saveSeoSettings,
  saveSiteSettings,
  saveSocialLinks,
  saveWhatsappSettings,
  updateAdminRole,
  updateContact,
  updateQuoteRequest,
} from "./actions";

type Result = ActionResult<{ redirectTo?: string }>;

/** Formulário compacto (sem barra fixa), com reset opcional após sucesso */
function InlineForm({
  action,
  children,
  submitLabel,
  resetOnSuccess = false,
  className,
}: {
  action: (prev: Result | null, formData: FormData) => Promise<Result>;
  children: (errors: Record<string, string>) => React.ReactNode;
  submitLabel: string;
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "Salvo");
      if (resetOnSuccess) formRef.current?.reset();
      router.refresh();
    } else toast.error(state.error);
  }, [state, router, resetOnSuccess]);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  return (
    <form ref={formRef} action={formAction} noValidate className={className}>
      {children(errors)}
      <SubmitButton className="mt-4">{submitLabel}</SubmitButton>
    </form>
  );
}

const Toggle = ({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) => (
  <label className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2.5 text-sm">
    <Checkbox name={name} defaultChecked={defaultChecked} />
    {label}
  </label>
);

// -----------------------------------------------------------------------------
// Configurações gerais
// -----------------------------------------------------------------------------
export type SiteSettingsValues = {
  site_name: string;
  short_name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  topbar_enabled: boolean;
  topbar_message: string | null;
  topbar_link: string | null;
  ga4_id: string | null;
  gtm_id: string | null;
  meta_pixel_id: string | null;
  demo_notice_enabled: boolean;
  nav_links: NavLink[];
  theme: Record<string, string>;
};

function NavLinksEditor({ initial }: { initial: NavLink[] }) {
  const [links, setLinks] = useState(initial);
  const update = (i: number, patch: Partial<NavLink>) => setLinks((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) =>
    setLinks((l) => {
      const n = [...l];
      const [x] = n.splice(i, 1);
      n.splice(i + d, 0, x!);
      return n;
    });
  return (
    <div className="grid gap-2">
      <input type="hidden" name="nav_links" value={JSON.stringify(links)} />
      {links.map((link, i) => (
        <div key={i} className="grid items-center gap-2 sm:grid-cols-[auto_1fr_1fr_auto]">
          <Checkbox aria-label="Exibir link" checked={link.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} />
          <Input aria-label="Texto do link" value={link.label} onChange={(e) => update(i, { label: e.target.value })} />
          <Input aria-label="Endereço do link" value={link.href} onChange={(e) => update(i, { href: e.target.value })} />
          <div className="flex">
            <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30">
              <ArrowUp className="size-4" />
            </button>
            <button type="button" aria-label="Descer" disabled={i === links.length - 1} onClick={() => move(i, 1)} className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted disabled:opacity-30">
              <ArrowDown className="size-4" />
            </button>
            <button type="button" aria-label="Remover link" onClick={() => setLinks((l) => l.filter((_, j) => j !== i))} className="inline-flex size-9 items-center justify-center rounded-md text-danger hover:bg-danger/10">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setLinks((l) => [...l, { label: "", href: "/", enabled: true }])}>
        <Plus aria-hidden="true" /> Adicionar link
      </Button>
    </div>
  );
}

export function SiteSettingsForm({ values }: { values: SiteSettingsValues }) {
  return (
    <EntityForm action={saveSiteSettings} submitLabel="Salvar configurações">
      {(errors) => (
        <>
          <FormSection title="Empresa">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="site_name" label="Nome da empresa" required error={errors.site_name}>
                <Input id="site_name" name="site_name" defaultValue={values.site_name} />
              </Field>
              <Field id="short_name" label="Nome curto" required error={errors.short_name}>
                <Input id="short_name" name="short_name" defaultValue={values.short_name} />
              </Field>
            </div>
            <Field id="tagline" label="Slogan">
              <Input id="tagline" name="tagline" defaultValue={values.tagline ?? ""} />
            </Field>
            <Field id="description" label="Descrição (rodapé)">
              <Textarea id="description" name="description" rows={3} defaultValue={values.description ?? ""} />
            </Field>
          </FormSection>
          <FormSection title="Identidade visual" description="Sem logo cadastrado, o site usa a marca tipográfica provisória.">
            <div className="grid gap-4 sm:grid-cols-3">
              <ImageField name="logo_url" label="Logo" bucket="site" folder="marca" defaultValue={values.logo_url} aspect="aspect-[3/1]" />
              <ImageField name="logo_dark_url" label="Logo negativo (rodapé)" bucket="site" folder="marca" defaultValue={values.logo_dark_url} aspect="aspect-[3/1]" />
              <ImageField name="favicon_url" label="Favicon (PNG 512×512)" bucket="site" folder="marca" defaultValue={values.favicon_url} aspect="aspect-square" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["theme_primary", "Cor principal", values.theme.primary ?? "#1b3f8f"],
                  ["theme_accent", "Cor de destaque", values.theme.accent ?? "#f2b705"],
                  ["theme_secondary", "Cor escura", values.theme.secondary ?? "#14191f"],
                ] as const
              ).map(([name, label, color]) => (
                <Field key={name} id={name} label={label} error={errors[name]}>
                  <div className="flex gap-2">
                    <input type="color" aria-label={label} defaultValue={color} onChange={(e) => ((document.getElementById(name) as HTMLInputElement).value = e.target.value)} className="h-11 w-12 cursor-pointer rounded-md border" />
                    <Input id={name} name={name} defaultValue={values.theme[name.replace("theme_", "")] ?? ""} placeholder={`Padrão ${color}`} />
                  </div>
                </Field>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Deixe as cores vazias para usar a paleta padrão. Verifique o contraste do texto ao trocar.</p>
          </FormSection>
          <FormSection title="Menu principal" description="Marque para exibir. Arraste a ordem com as setas.">
            <NavLinksEditor initial={values.nav_links} />
            {errors.nav_links ? <p className="text-xs text-danger">{errors.nav_links}</p> : null}
          </FormSection>
          <FormSection title="Aviso no topo" description="Faixa fina acima do cabeçalho (ex.: comunicado de feriado).">
            <Toggle name="topbar_enabled" label="Exibir aviso" defaultChecked={values.topbar_enabled} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="topbar_message" label="Mensagem">
                <Input id="topbar_message" name="topbar_message" maxLength={160} defaultValue={values.topbar_message ?? ""} />
              </Field>
              <Field id="topbar_link" label="Link (opcional)" error={errors.topbar_link}>
                <Input id="topbar_link" name="topbar_link" defaultValue={values.topbar_link ?? ""} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Medição" description="Carregados somente após o visitante aceitar cookies.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="ga4_id" label="Google Analytics 4" error={errors.ga4_id}>
                <Input id="ga4_id" name="ga4_id" placeholder="G-XXXXXXX" defaultValue={values.ga4_id ?? ""} />
              </Field>
              <Field id="gtm_id" label="Google Tag Manager" error={errors.gtm_id}>
                <Input id="gtm_id" name="gtm_id" placeholder="GTM-XXXXXX" defaultValue={values.gtm_id ?? ""} />
              </Field>
              <Field id="meta_pixel_id" label="Meta Pixel" error={errors.meta_pixel_id}>
                <Input id="meta_pixel_id" name="meta_pixel_id" placeholder="123456789" defaultValue={values.meta_pixel_id ?? ""} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Demonstração">
            <Toggle name="demo_notice_enabled" label="Exibir faixa “Ambiente de demonstração” (desligue ao publicar dados reais)" defaultChecked={values.demo_notice_enabled} />
          </FormSection>
        </>
      )}
    </EntityForm>
  );
}

export type BusinessValues = Record<
  | "legal_name" | "trade_name" | "cnpj" | "phone" | "email" | "street" | "street_number" | "complement" | "district"
  | "postal_code" | "google_maps_url" | "about_title" | "about_summary" | "history" | "mission" | "values_text",
  string | null
> & { city: string; state: string; latitude: number | null; longitude: number | null; founded_year: number | null };

export function BusinessForm({ values }: { values: BusinessValues }) {
  const text = (name: keyof BusinessValues, label: string, errors: Record<string, string>, hint?: string) => (
    <Field id={name} label={label} error={errors[name]} hint={hint}>
      <Input id={name} name={name} defaultValue={(values[name] as string | number | null) ?? ""} />
    </Field>
  );
  return (
    <EntityForm action={saveBusinessInfo} submitLabel="Salvar dados da empresa">
      {(errors) => (
        <>
          <FormSection title="Dados cadastrais" description="Preencha apenas com informações reais. Campos vazios não aparecem no site.">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("legal_name", "Razão social", errors)}
              {text("trade_name", "Nome fantasia", errors)}
              {text("cnpj", "CNPJ", errors, "Somente números ou formatado")}
              {text("phone", "Telefone", errors, "Com DDD")}
              {text("email", "E-mail", errors)}
            </div>
          </FormSection>
          <FormSection title="Endereço" description="Usado no rodapé, na página de contato, no mapa e nos dados para o Google (LocalBusiness).">
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              {text("street", "Rua / avenida", errors)}
              {text("street_number", "Número", errors)}
              {text("complement", "Complemento", errors)}
              {text("district", "Bairro", errors)}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {text("city", "Cidade", errors)}
              {text("state", "UF", errors)}
              {text("postal_code", "CEP", errors)}
              {text("latitude", "Latitude", errors, "Ex.: -22.3145")}
              {text("longitude", "Longitude", errors, "Ex.: -49.0587")}
            </div>
            {text("google_maps_url", "Link do Google Maps", errors, "Botão “Abrir no Google Maps”")}
          </FormSection>
          <FormSection title="Página Sobre" description="Exibido somente o que for preenchido.">
            {text("about_title", "Título", errors)}
            <Field id="about_summary" label="Resumo">
              <Textarea id="about_summary" name="about_summary" rows={2} defaultValue={values.about_summary ?? ""} />
            </Field>
            {text("founded_year", "Ano de fundação", errors)}
            <Field id="history" label="História (Markdown)">
              <Textarea id="history" name="history" rows={6} defaultValue={values.history ?? ""} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="mission" label="Missão">
                <Textarea id="mission" name="mission" rows={3} defaultValue={values.mission ?? ""} />
              </Field>
              <Field id="values_text" label="Valores">
                <Textarea id="values_text" name="values_text" rows={3} defaultValue={values.values_text ?? ""} />
              </Field>
            </div>
          </FormSection>
        </>
      )}
    </EntityForm>
  );
}

export type WhatsappValues = {
  is_enabled: boolean;
  country_code: string;
  phone_number: string | null;
  default_message: string;
  product_intro: string;
  product_outro: string;
  quote_intro: string;
  button_label: string;
  floating_label: string;
  show_floating_button: boolean;
  show_floating_label_mobile: boolean;
  show_out_of_hours_notice: boolean;
  out_of_hours_message: string;
};

export function WhatsappForm({ values }: { values: WhatsappValues }) {
  return (
    <EntityForm action={saveWhatsappSettings} submitLabel="Salvar WhatsApp">
      {(errors) => (
        <>
          <FormSection title="Número" description="Sem número, os botões abrem o WhatsApp para o visitante escolher o contato.">
            <Toggle name="is_enabled" label="Atendimento por WhatsApp ativo" defaultChecked={values.is_enabled} />
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <Field id="country_code" label="DDI" error={errors.country_code}>
                <Input id="country_code" name="country_code" defaultValue={values.country_code} />
              </Field>
              <Field id="phone_number" label="DDD + número" error={errors.phone_number} hint={values.phone_number ? `Atual: ${formatPhone(values.phone_number)}` : "Ex.: 14 99999-9999"}>
                <Input id="phone_number" name="phone_number" inputMode="tel" defaultValue={values.phone_number ?? ""} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Mensagens" description="O produto, código, marca, variação, quantidade e link são adicionados automaticamente.">
            <Field id="default_message" label="Mensagem padrão (botão flutuante e rodapé)" error={errors.default_message}>
              <Textarea id="default_message" name="default_message" rows={2} defaultValue={values.default_message} />
            </Field>
            <Field id="product_intro" label="Início da mensagem de produto" error={errors.product_intro}>
              <Textarea id="product_intro" name="product_intro" rows={2} defaultValue={values.product_intro} />
            </Field>
            <Field id="product_outro" label="Final da mensagem de produto" error={errors.product_outro}>
              <Input id="product_outro" name="product_outro" defaultValue={values.product_outro} />
            </Field>
            <Field id="quote_intro" label="Início da Lista de Orçamento" error={errors.quote_intro}>
              <Textarea id="quote_intro" name="quote_intro" rows={2} defaultValue={values.quote_intro} />
            </Field>
          </FormSection>
          <FormSection title="Botões">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="button_label" label="Texto do botão do produto" error={errors.button_label}>
                <Input id="button_label" name="button_label" defaultValue={values.button_label} />
              </Field>
              <Field id="floating_label" label="Texto do botão flutuante" error={errors.floating_label}>
                <Input id="floating_label" name="floating_label" defaultValue={values.floating_label} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle name="show_floating_button" label="Mostrar botão flutuante" defaultChecked={values.show_floating_button} />
              <Toggle name="show_floating_label_mobile" label="Mostrar texto do botão no celular" defaultChecked={values.show_floating_label_mobile} />
            </div>
          </FormSection>
          <FormSection title="Fora do horário" description="Nunca bloqueia o contato; apenas informa. Requer horários cadastrados.">
            <Toggle name="show_out_of_hours_notice" label="Mostrar aviso fora do horário" defaultChecked={values.show_out_of_hours_notice} />
            <Field id="out_of_hours_message" label="Mensagem" error={errors.out_of_hours_message}>
              <Textarea id="out_of_hours_message" name="out_of_hours_message" rows={2} defaultValue={values.out_of_hours_message} />
            </Field>
          </FormSection>
        </>
      )}
    </EntityForm>
  );
}

type HourRow = { day_of_week: number; opens_at: string | null; closes_at: string | null; is_closed: boolean };

export function HoursForm({ initial }: { initial: HourRow[] }) {
  const [rows, setRows] = useState<HourRow[]>(initial.map((h) => ({ ...h, opens_at: h.opens_at?.slice(0, 5) ?? null, closes_at: h.closes_at?.slice(0, 5) ?? null })));
  const update = (i: number, patch: Partial<HourRow>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <InlineForm action={saveBusinessHours} submitLabel="Salvar horários">
      {() => (
        <div className="grid gap-2">
          <input type="hidden" name="hours" value={JSON.stringify(rows)} />
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum horário cadastrado. O site não exibe horários até que sejam informados.</p> : null}
          {rows.map((row, i) => (
            <div key={i} className="grid items-center gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
              <Select aria-label="Dia da semana" value={row.day_of_week} onChange={(e) => update(i, { day_of_week: Number(e.target.value) })}>
                {WEEKDAY_LABELS.map((label, d) => (
                  <option key={d} value={d}>
                    {label}
                  </option>
                ))}
              </Select>
              <Input aria-label="Abre às" type="time" className="w-32" disabled={row.is_closed} value={row.opens_at ?? ""} onChange={(e) => update(i, { opens_at: e.target.value || null })} />
              <Input aria-label="Fecha às" type="time" className="w-32" disabled={row.is_closed} value={row.closes_at ?? ""} onChange={(e) => update(i, { closes_at: e.target.value || null })} />
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={row.is_closed} onChange={(e) => update(i, { is_closed: e.target.checked })} /> Fechado
              </label>
              <button type="button" aria-label="Remover dia" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} className="inline-flex size-9 items-center justify-center rounded-md text-danger hover:bg-danger/10">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setRows((r) => [...r, { day_of_week: 1, opens_at: "08:00", closes_at: "18:00", is_closed: false }])}>
              <Plus aria-hidden="true" /> Adicionar dia/intervalo
            </Button>
            {rows.length === 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRows([1, 2, 3, 4, 5].map((d) => ({ day_of_week: d, opens_at: "08:00", closes_at: "18:00", is_closed: false })))}
              >
                Preencher segunda a sexta (edite antes de salvar)
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </InlineForm>
  );
}

export function SocialForm({ values }: { values: Record<string, string> }) {
  const platforms = [
    ["instagram", "Instagram"],
    ["facebook", "Facebook"],
    ["youtube", "YouTube"],
    ["linkedin", "LinkedIn"],
    ["tiktok", "TikTok"],
    ["pinterest", "Pinterest"],
    ["x", "X (Twitter)"],
  ] as const;
  return (
    <InlineForm action={saveSocialLinks} submitLabel="Salvar redes sociais">
      {() => (
        <div className="grid gap-3 sm:grid-cols-2">
          {platforms.map(([key, label]) => (
            <Field key={key} id={`social-${key}`} label={label}>
              <Input id={`social-${key}`} name={key} type="url" placeholder="https://" defaultValue={values[key] ?? ""} />
            </Field>
          ))}
        </div>
      )}
    </InlineForm>
  );
}

// -----------------------------------------------------------------------------
// SEO
// -----------------------------------------------------------------------------
export type SeoValues = {
  default_title: string;
  title_template: string;
  default_description: string;
  default_og_image_url: string | null;
  google_site_verification: string | null;
  bing_site_verification: string | null;
  noindex_site: boolean;
  local_business_type: string;
};

export function SeoForm({ values }: { values: SeoValues }) {
  return (
    <InlineForm action={saveSeoSettings} submitLabel="Salvar SEO">
      {(errors) => (
        <div className="grid gap-4">
          <Field id="default_title" label="Título padrão (Home)" error={errors.default_title}>
            <Input id="default_title" name="default_title" defaultValue={values.default_title} />
          </Field>
          <Field id="title_template" label="Modelo de título" hint="%s é substituído pelo título de cada página." error={errors.title_template}>
            <Input id="title_template" name="title_template" defaultValue={values.title_template} />
          </Field>
          <Field id="default_description" label="Descrição padrão" error={errors.default_description}>
            <Textarea id="default_description" name="default_description" rows={3} defaultValue={values.default_description} />
          </Field>
          <ImageField name="default_og_image_url" label="Imagem padrão de compartilhamento (1200×630)" bucket="site" folder="seo" defaultValue={values.default_og_image_url} aspect="aspect-[1200/630]" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="google_site_verification" label="Verificação Google Search Console">
              <Input id="google_site_verification" name="google_site_verification" defaultValue={values.google_site_verification ?? ""} />
            </Field>
            <Field id="bing_site_verification" label="Verificação Bing">
              <Input id="bing_site_verification" name="bing_site_verification" defaultValue={values.bing_site_verification ?? ""} />
            </Field>
            <Field id="local_business_type" label="Tipo de negócio (Schema.org)">
              <Select id="local_business_type" name="local_business_type" defaultValue={values.local_business_type}>
                <option value="HardwareStore">Loja de materiais (HardwareStore)</option>
                <option value="HomeAndConstructionBusiness">Construção e casa</option>
                <option value="Store">Loja</option>
                <option value="LocalBusiness">Negócio local</option>
              </Select>
            </Field>
          </div>
          <label className="flex items-start gap-2.5 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm">
            <Checkbox name="noindex_site" defaultChecked={values.noindex_site} className="mt-0.5" />
            <span>
              <strong>Bloquear indexação do site inteiro.</strong> Use apenas em homologação — em produção, isso remove o site do Google.
            </span>
          </label>
        </div>
      )}
    </InlineForm>
  );
}

export function RedirectForm() {
  return (
    <InlineForm action={saveRedirect} submitLabel="Adicionar redirect" resetOnSuccess>
      {(errors) => (
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
          <Field id="source_path" label="De (caminho antigo)" error={errors.source_path}>
            <Input id="source_path" name="source_path" placeholder="/produto/nome-antigo" />
          </Field>
          <Field id="destination_path" label="Para" error={errors.destination_path}>
            <Input id="destination_path" name="destination_path" placeholder="/produto/nome-novo" />
          </Field>
          <Field id="status_code" label="Tipo">
            <Select id="status_code" name="status_code" defaultValue="301">
              <option value="301">301 permanente</option>
              <option value="302">302 temporário</option>
            </Select>
          </Field>
        </div>
      )}
    </InlineForm>
  );
}

// -----------------------------------------------------------------------------
// Atendimento
// -----------------------------------------------------------------------------
export function LeadStatusForm({
  kind,
  id,
  status,
  notes,
}: {
  kind: "contact" | "quote";
  id: string;
  status: LeadStatus;
  notes: string | null;
}) {
  return (
    <InlineForm action={kind === "contact" ? updateContact : updateQuoteRequest} submitLabel="Salvar atendimento">
      {() => (
        <div className="grid gap-4">
          <input type="hidden" name="id" value={id} />
          <Field id="status" label="Situação">
            <Select id="status" name="status" defaultValue={status}>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="internal_notes" label="Anotações internas" hint="Visíveis apenas para a equipe.">
            <Textarea id="internal_notes" name="internal_notes" rows={4} defaultValue={notes ?? ""} />
          </Field>
        </div>
      )}
    </InlineForm>
  );
}

// -----------------------------------------------------------------------------
// Ofertas
// -----------------------------------------------------------------------------
export function OfferForm({
  product,
}: {
  product: { id: string; sale_price: number | null; sale_label: string | null; sale_starts_at: string | null; sale_ends_at: string | null };
}) {
  return (
    <InlineForm action={saveOffer} submitLabel="Salvar oferta">
      {(errors) => (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="hidden" name="id" value={product.id} />
          <Field id={`sp-${product.id}`} label="Preço promocional" error={errors.sale_price}>
            <Input id={`sp-${product.id}`} name="sale_price" inputMode="decimal" defaultValue={product.sale_price?.toFixed(2).replace(".", ",") ?? ""} />
          </Field>
          <Field id={`sl-${product.id}`} label="Selo">
            <Input id={`sl-${product.id}`} name="sale_label" defaultValue={product.sale_label ?? ""} />
          </Field>
          <Field id={`ss-${product.id}`} label="Início" error={errors.sale_starts_at}>
            <Input id={`ss-${product.id}`} name="sale_starts_at" type="datetime-local" defaultValue={toDateTimeLocal(product.sale_starts_at)} />
          </Field>
          <Field id={`se-${product.id}`} label="Fim" error={errors.sale_ends_at}>
            <Input id={`se-${product.id}`} name="sale_ends_at" type="datetime-local" defaultValue={toDateTimeLocal(product.sale_ends_at)} />
          </Field>
        </div>
      )}
    </InlineForm>
  );
}

// -----------------------------------------------------------------------------
// Administradores
// -----------------------------------------------------------------------------
export function InviteAdminForm() {
  return (
    <InlineForm action={inviteAdmin} submitLabel="Enviar convite" resetOnSuccess>
      {(errors) => (
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_180px]">
          <Field id="invite-email" label="E-mail" error={errors.email}>
            <Input id="invite-email" name="email" type="email" required />
          </Field>
          <Field id="invite-name" label="Nome">
            <Input id="invite-name" name="full_name" />
          </Field>
          <Field id="invite-role" label="Papel">
            <Select id="invite-role" name="role" defaultValue="editor">
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
              <option value="super_admin">Super administrador</option>
            </Select>
          </Field>
        </div>
      )}
    </InlineForm>
  );
}

export function RoleSelect({ userId, role, disabled }: { userId: string; role: "super_admin" | "admin" | "editor"; disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Select
      aria-label="Papel"
      defaultValue={role}
      disabled={disabled || pending}
      className="h-9 w-48 text-sm"
      onChange={(e) => {
        const next = e.target.value as typeof role;
        startTransition(async () => {
          const result = await updateAdminRole(userId, next);
          if (result.ok) toast.success(result.message ?? "Atualizado");
          else toast.error(result.error);
          router.refresh();
        });
      }}
    >
      <option value="editor">Editor</option>
      <option value="admin">Administrador</option>
      <option value="super_admin">Super administrador</option>
    </Select>
  );
}
