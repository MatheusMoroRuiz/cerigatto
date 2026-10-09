"use client";

import { ExternalLink, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AVAILABILITY_LABELS, CTA_PRESETS } from "@/lib/constants";
import { formatQuantity, parseDecimal } from "@/lib/format";
import { routes } from "@/lib/routes";
import { slugify } from "@/lib/slug";
import { toDateTimeLocal } from "@/lib/validation/common";
import { productInputSchema, type ProductInput } from "@/lib/validation/product";
import { zodFieldErrors } from "@/lib/admin/action-result";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormSection } from "@/features/admin/ui/admin-ui";
import { saveProduct } from "./actions";
import { ProductImagesField } from "./product-images-field";
import { ProductPicker, type PickedProduct } from "./product-picker";

type Lookups = {
  categories: { id: string; label: string }[];
  brands: { id: string; name: string }[];
  attributes: { id: string; name: string; unit: string | null; group_name: string }[];
  environments: { id: string; name: string }[];
  categoryAttributes: Record<string, string[]>;
};

const UNITS = ["unidade", "caixa", "m²", "metro", "saco", "lata", "galão", "barra", "rolo", "kit", "jogo", "conjunto", "milheiro", "peça", "pote"];

function numberInput(value: number | null) {
  return value == null ? "" : formatQuantity(value);
}

export function ProductForm({
  initial,
  lookups,
  isNew,
  initialRelated,
}: {
  initial: ProductInput;
  lookups: Lookups;
  isNew: boolean;
  initialRelated: PickedProduct[];
}) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [related, setRelated] = useState<PickedProduct[]>(initialRelated);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const originalSlug = initial.slug;

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setP((prev) => ({ ...prev, [key]: value }));
  const err = (key: string) => errors[key];

  const attributeById = useMemo(() => new Map(lookups.attributes.map((a) => [a.id, a])), [lookups.attributes]);
  const suggested = p.categoryId ? (lookups.categoryAttributes[p.categoryId] ?? []) : [];
  const missingSuggested = suggested.filter((id) => !p.specifications.some((s) => s.attributeId === id));

  function submit(status?: ProductInput["status"]) {
    const payload: ProductInput = { ...p, status: status ?? p.status, relatedIds: related.map((r) => r.id) };
    const parsed = productInputSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = zodFieldErrors(parsed.error.issues);
      setErrors(fieldErrors);
      toast.error("Revise os campos destacados.");
      document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveProduct(payload);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Produto salvo");
      setP(payload);
      if (isNew) router.replace(`/admin/produtos/${payload.id}`);
      else router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      {Object.keys(errors).length ? (
        <Notice tone="danger" className="mb-6">
          Há {Object.keys(errors).length} campo(s) para revisar.
        </Notice>
      ) : null}

      <div className="rounded-xl border bg-surface px-5 py-6 sm:px-8">
        <FormSection title="Informações básicas" description="Nome, endereço da página e código interno.">
          <Field id="name" label="Nome do produto" required error={err("name")}>
            <Input
              id="name"
              value={p.name}
              maxLength={200}
              aria-invalid={Boolean(err("name"))}
              onChange={(e) => {
                const name = e.target.value;
                setP((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
              }}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="slug"
              label="Endereço (slug)"
              required
              error={err("slug")}
              hint={!isNew && p.slug !== originalSlug ? "Ao salvar, o endereço antigo redirecionará (301) para o novo." : `/produto/${p.slug || "…"}`}
            >
              <Input
                id="slug"
                value={p.slug}
                aria-invalid={Boolean(err("slug"))}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field id="sku" label="SKU / código" error={err("sku")} hint="Usado na busca e na importação CSV.">
              <Input id="sku" value={p.sku ?? ""} maxLength={64} onChange={(e) => set("sku", e.target.value || null)} />
            </Field>
          </div>
          <Field id="short" label="Descrição curta" error={err("shortDescription")} hint={`${(p.shortDescription ?? "").length}/400 — aparece no topo da página do produto.`}>
            <Textarea id="short" rows={2} maxLength={400} value={p.shortDescription ?? ""} onChange={(e) => set("shortDescription", e.target.value || null)} />
          </Field>
        </FormSection>

        <FormSection title="Categoria e marca">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="category" label="Categoria" error={err("categoryId")} hint="Use a subcategoria mais específica.">
              <Select id="category" value={p.categoryId ?? ""} aria-invalid={Boolean(err("categoryId"))} onChange={(e) => set("categoryId", e.target.value || null)}>
                <option value="">Selecione…</option>
                {lookups.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="brand" label="Marca">
              <Select id="brand" value={p.brandId ?? ""} onChange={(e) => set("brandId", e.target.value || null)}>
                <option value="">Sem marca</option>
                {lookups.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Descrição completa" description="Aceita Markdown: ## título, **negrito**, listas com - e tabelas.">
          <Textarea rows={10} aria-label="Descrição completa" value={p.description ?? ""} onChange={(e) => set("description", e.target.value || null)} className="font-mono text-sm" />
        </FormSection>

        <FormSection title="Imagens" description="A primeira imagem marcada como capa aparece nos cards e no compartilhamento.">
          <ProductImagesField productId={p.id} productName={p.name} images={p.images as never} onChange={(images) => set("images", images)} />
          {err("images") ? <p className="text-xs text-danger">{err("images")}</p> : null}
        </FormSection>

        <FormSection title="Preço" description="O site nunca vende on-line: o preço é informativo e a conversão é pelo WhatsApp.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="priceDisplay" label="Exibição do preço" className="sm:col-span-3">
              <Select id="priceDisplay" value={p.priceDisplay} onChange={(e) => set("priceDisplay", e.target.value as ProductInput["priceDisplay"])}>
                <option value="show">Exibir preço</option>
                <option value="consult">“Consulte o preço”</option>
                <option value="on_request">“Preço sob consulta”</option>
                <option value="hidden">Não mostrar nada sobre preço</option>
              </Select>
            </Field>
            <Field id="price" label="Preço (R$)" error={err("price")}>
              <Input id="price" inputMode="decimal" defaultValue={numberInput(p.price ?? null)} aria-invalid={Boolean(err("price"))} onBlur={(e) => set("price", parseDecimal(e.target.value))} placeholder="0,00" />
            </Field>
            <Field id="salePrice" label="Preço promocional (R$)" error={err("salePrice")}>
              <Input id="salePrice" inputMode="decimal" defaultValue={numberInput(p.salePrice ?? null)} aria-invalid={Boolean(err("salePrice"))} onBlur={(e) => set("salePrice", parseDecimal(e.target.value))} placeholder="0,00" />
            </Field>
            <Field id="unit" label="Unidade de venda" error={err("unit")}>
              <Input id="unit" list="units" value={p.unit} onChange={(e) => set("unit", e.target.value)} />
              <datalist id="units">
                {UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Disponibilidade e marcadores" description="Status comercial informativo (não é estoque em tempo real).">
          <Field id="availability" label="Status comercial">
            <Select id="availability" value={p.availability} onChange={(e) => set("availability", e.target.value as ProductInput["availability"])}>
              {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["isFeatured", "Destaque"],
                ["isNew", "Lançamento / novidade"],
                ["isRecommended", "Recomendado pela equipe"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2.5 text-sm">
                <Checkbox checked={Boolean(p[key])} onChange={(e) => set(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
          <div className="rounded-lg border bg-background p-4">
            <label className="flex items-center gap-2.5 text-sm font-semibold">
              <Checkbox checked={Boolean(p.isOnSale)} onChange={(e) => set("isOnSale", e.target.checked)} />
              Produto em oferta
            </label>
            {p.isOnSale ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field id="saleStart" label="Início (opcional)">
                  <Input id="saleStart" type="datetime-local" defaultValue={toDateTimeLocal(p.saleStartsAt)} onChange={(e) => set("saleStartsAt", e.target.value ? new Date(`${e.target.value}:00-03:00`).toISOString() : null)} />
                </Field>
                <Field id="saleEnd" label="Fim (opcional)" error={err("saleEndsAt")} hint="Depois do fim, sai das ofertas automaticamente.">
                  <Input id="saleEnd" type="datetime-local" defaultValue={toDateTimeLocal(p.saleEndsAt)} onChange={(e) => set("saleEndsAt", e.target.value ? new Date(`${e.target.value}:00-03:00`).toISOString() : null)} />
                </Field>
                <Field id="saleLabel" label="Selo da oferta" hint="Ex.: Oferta especial">
                  <Input id="saleLabel" maxLength={60} value={p.saleLabel ?? ""} onChange={(e) => set("saleLabel", e.target.value || null)} />
                </Field>
              </div>
            ) : null}
          </div>
        </FormSection>

        <FormSection title="Variações" description="Ex.: Tamanho (60x60, 90x90), Cor, Voltagem. Opções obrigatórias precisam ser escolhidas antes de consultar.">
          {p.variantGroups.map((group, gi) => (
            <div key={gi} className="rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-end gap-3">
                <Field id={`vg-${gi}`} label="Nome da variação" error={err(`variantGroups.${gi}.name`)} className="min-w-48 flex-1">
                  <Input
                    id={`vg-${gi}`}
                    value={group.name}
                    maxLength={60}
                    aria-invalid={Boolean(err(`variantGroups.${gi}.name`))}
                    onChange={(e) => set("variantGroups", p.variantGroups.map((g, i) => (i === gi ? { ...g, name: e.target.value } : g)))}
                  />
                </Field>
                <label className="flex h-11 items-center gap-2 text-sm">
                  <Checkbox checked={group.isRequired} onChange={(e) => set("variantGroups", p.variantGroups.map((g, i) => (i === gi ? { ...g, isRequired: e.target.checked } : g)))} />
                  Obrigatória
                </label>
                <Button type="button" variant="ghost" size="sm" className="text-danger" onClick={() => set("variantGroups", p.variantGroups.filter((_, i) => i !== gi))}>
                  <Trash2 aria-hidden="true" /> Remover grupo
                </Button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Opção</th>
                      <th className="pb-2 font-medium">SKU</th>
                      <th className="pb-2 font-medium">Preço</th>
                      <th className="pb-2 font-medium">Promo</th>
                      <th className="pb-2 font-medium">Disponibilidade</th>
                      <th className="pb-2 font-medium">Ativa</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {group.values.map((value, vi) => {
                      const updateValue = (patch: Partial<typeof value>) =>
                        set(
                          "variantGroups",
                          p.variantGroups.map((g, i) => (i === gi ? { ...g, values: g.values.map((v, j) => (j === vi ? { ...v, ...patch } : v)) } : g)),
                        );
                      return (
                        <tr key={vi}>
                          <td className="py-1 pr-2">
                            <Input aria-label="Opção" className="h-9" value={value.label} aria-invalid={Boolean(err(`variantGroups.${gi}.values.${vi}.label`))} onChange={(e) => updateValue({ label: e.target.value })} />
                          </td>
                          <td className="py-1 pr-2">
                            <Input aria-label="SKU da opção" className="h-9 w-32" value={value.sku ?? ""} onChange={(e) => updateValue({ sku: e.target.value || null })} />
                          </td>
                          <td className="py-1 pr-2">
                            <Input aria-label="Preço da opção" className="h-9 w-24" inputMode="decimal" defaultValue={numberInput(value.price ?? null)} onBlur={(e) => updateValue({ price: parseDecimal(e.target.value) })} />
                          </td>
                          <td className="py-1 pr-2">
                            <Input aria-label="Preço promocional da opção" className="h-9 w-24" inputMode="decimal" defaultValue={numberInput(value.salePrice ?? null)} onBlur={(e) => updateValue({ salePrice: parseDecimal(e.target.value) })} />
                          </td>
                          <td className="py-1 pr-2">
                            <Select aria-label="Disponibilidade da opção" className="h-9 w-44" value={value.availability ?? ""} onChange={(e) => updateValue({ availability: (e.target.value || null) as typeof value.availability })}>
                              <option value="">Igual ao produto</option>
                              {Object.entries(AVAILABILITY_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>
                                  {l}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="py-1 pr-2 text-center">
                            <Checkbox aria-label="Opção ativa" checked={value.isActive} onChange={(e) => updateValue({ isActive: e.target.checked })} />
                          </td>
                          <td className="py-1">
                            <button
                              type="button"
                              aria-label="Remover opção"
                              className="inline-flex size-9 items-center justify-center rounded-md text-danger hover:bg-danger/10"
                              onClick={() => set("variantGroups", p.variantGroups.map((g, i) => (i === gi ? { ...g, values: g.values.filter((_, j) => j !== vi) } : g)))}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {err(`variantGroups.${gi}.values`) ? <p className="mt-1 text-xs text-danger">{err(`variantGroups.${gi}.values`)}</p> : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() =>
                  set(
                    "variantGroups",
                    p.variantGroups.map((g, i) =>
                      i === gi ? { ...g, values: [...g.values, { label: "", sku: null, price: null, salePrice: null, availability: null, isActive: true }] } : g,
                    ),
                  )
                }
              >
                <Plus aria-hidden="true" /> Adicionar opção
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            disabled={p.variantGroups.length >= 5}
            onClick={() =>
              set("variantGroups", [
                ...p.variantGroups,
                { name: "", isRequired: true, values: [{ label: "", sku: null, price: null, salePrice: null, availability: null, isActive: true }] },
              ])
            }
          >
            <Plus aria-hidden="true" /> Adicionar variação
          </Button>
        </FormSection>

        <FormSection title="Especificações técnicas" description="Atributos marcados como filtráveis viram filtros no catálogo.">
          {missingSuggested.length ? (
            <Notice tone="info">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  Sugestões para esta categoria: {missingSuggested.map((id) => attributeById.get(id)?.name).filter(Boolean).join(", ")}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => set("specifications", [...p.specifications, ...missingSuggested.map((id) => ({ attributeId: id, label: null, value: "" }))])}
                >
                  <Wand2 aria-hidden="true" /> Adicionar campos sugeridos
                </Button>
              </div>
            </Notice>
          ) : null}
          {p.specifications.map((spec, si) => {
            const attr = spec.attributeId ? attributeById.get(spec.attributeId) : null;
            const update = (patch: Partial<typeof spec>) => set("specifications", p.specifications.map((s, i) => (i === si ? { ...s, ...patch } : s)));
            return (
              <div key={si} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Select
                  aria-label="Atributo"
                  value={spec.attributeId ?? "__custom"}
                  onChange={(e) => update({ attributeId: e.target.value === "__custom" ? null : e.target.value, label: e.target.value === "__custom" ? (spec.label ?? "") : null })}
                >
                  {lookups.attributes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                      {a.unit ? ` (${a.unit})` : ""}
                    </option>
                  ))}
                  <option value="__custom">Outro (nome livre)…</option>
                </Select>
                {spec.attributeId ? (
                  <Input aria-label={`Valor de ${attr?.name ?? "atributo"}`} placeholder={attr?.unit ? `Valor em ${attr.unit}` : "Valor"} value={spec.value} onChange={(e) => update({ value: e.target.value })} />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Input aria-label="Nome da especificação" placeholder="Nome" value={spec.label ?? ""} aria-invalid={Boolean(err(`specifications.${si}.label`))} onChange={(e) => update({ label: e.target.value })} />
                    <Input aria-label="Valor da especificação" placeholder="Valor" value={spec.value} onChange={(e) => update({ value: e.target.value })} />
                  </div>
                )}
                <button type="button" aria-label="Remover especificação" onClick={() => set("specifications", p.specifications.filter((_, i) => i !== si))} className="inline-flex size-11 items-center justify-center rounded-md text-danger hover:bg-danger/10">
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() => set("specifications", [...p.specifications, { attributeId: lookups.attributes[0]?.id ?? null, label: lookups.attributes[0] ? null : "", value: "" }])}
          >
            <Plus aria-hidden="true" /> Adicionar especificação
          </Button>
        </FormSection>

        <FormSection title="Informações universais" description="Exibidas em “Medidas” e “Informações adicionais”.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="manufacturer" label="Fabricante">
              <Input id="manufacturer" value={p.manufacturer ?? ""} onChange={(e) => set("manufacturer", e.target.value || null)} />
            </Field>
            <Field id="model" label="Modelo">
              <Input id="model" value={p.model ?? ""} onChange={(e) => set("model", e.target.value || null)} />
            </Field>
            <Field id="dimensions" label="Dimensões" hint="Ex.: 90 x 90 cm">
              <Input id="dimensions" value={p.dimensions ?? ""} onChange={(e) => set("dimensions", e.target.value || null)} />
            </Field>
            <Field id="weight" label="Peso (kg)">
              <Input id="weight" inputMode="decimal" defaultValue={numberInput(p.weightKg ?? null)} onBlur={(e) => set("weightKg", parseDecimal(e.target.value))} />
            </Field>
            <Field id="warranty" label="Garantia">
              <Input id="warranty" value={p.warranty ?? ""} onChange={(e) => set("warranty", e.target.value || null)} />
            </Field>
            <Field id="package" label="Conteúdo da embalagem">
              <Input id="package" value={p.packageContents ?? ""} onChange={(e) => set("packageContents", e.target.value || null)} />
            </Field>
          </div>
          <Field id="video" label="Vídeo (YouTube ou Vimeo)" error={err("videoUrl")}>
            <Input id="video" type="url" placeholder="https://www.youtube.com/watch?v=…" value={p.videoUrl ?? ""} onChange={(e) => set("videoUrl", e.target.value || null)} />
          </Field>
          <Field id="notes" label="Observações">
            <Textarea id="notes" rows={3} value={p.notes ?? ""} onChange={(e) => set("notes", e.target.value || null)} />
          </Field>
        </FormSection>

        <FormSection title="Relacionamentos" description="Ajudam a montar produtos relacionados e páginas de ambiente.">
          <Field id="tags" label="Tags" hint="Separe por vírgula. Ex.: antiderrapante, retificado">
            <Input id="tags" defaultValue={p.tags.join(", ")} onBlur={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} />
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Ambientes indicados</legend>
            <div className="flex flex-wrap gap-2">
              {lookups.environments.map((env) => (
                <label key={env.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                  <Checkbox
                    checked={p.environmentIds.includes(env.id)}
                    onChange={(e) => set("environmentIds", e.target.checked ? [...p.environmentIds, env.id] : p.environmentIds.filter((id) => id !== env.id))}
                  />
                  {env.name}
                </label>
              ))}
              {lookups.environments.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum ambiente cadastrado.</p> : null}
            </div>
          </fieldset>
          <div>
            <p className="mb-2 text-sm font-semibold">Produtos que combinam</p>
            <ProductPicker value={related} onChange={setRelated} excludeId={p.id} />
          </div>
        </FormSection>

        <FormSection title="Atendimento" description="Personalize o botão e, se necessário, o WhatsApp deste produto.">
          <Field id="cta" label="Texto do botão" hint="Vazio = texto padrão das Configurações.">
            <Input id="cta" list="cta-presets" maxLength={60} value={p.ctaLabel ?? ""} onChange={(e) => set("ctaLabel", e.target.value || null)} />
            <datalist id="cta-presets">
              {CTA_PRESETS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field id="wa" label="WhatsApp específico (opcional)" error={err("whatsappNumber")} hint="Com DDI e DDD, ex.: 5514999999999. Prioridade: produto › categoria › padrão.">
            <Input id="wa" inputMode="tel" value={p.whatsappNumber ?? ""} onChange={(e) => set("whatsappNumber", e.target.value || null)} />
          </Field>
        </FormSection>

        <FormSection title="SEO" description="Opcional. Sem preenchimento, usamos nome, descrição curta e imagem de capa.">
          <Field id="seoTitle" label="Título para buscadores" hint={`${(p.seoTitle ?? "").length}/70`} error={err("seoTitle")}>
            <Input id="seoTitle" maxLength={70} value={p.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value || null)} />
          </Field>
          <Field id="seoDescription" label="Descrição para buscadores" hint={`${(p.seoDescription ?? "").length}/170`} error={err("seoDescription")}>
            <Textarea id="seoDescription" rows={2} maxLength={170} value={p.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value || null)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="canonical" label="URL canônica" hint="Raramente necessário." error={err("canonicalUrl")}>
              <Input id="canonical" value={p.canonicalUrl ?? ""} onChange={(e) => set("canonicalUrl", e.target.value || null)} />
            </Field>
            <Field id="og" label="Imagem de compartilhamento (URL)" error={err("ogImageUrl")}>
              <Input id="og" value={p.ogImageUrl ?? ""} onChange={(e) => set("ogImageUrl", e.target.value || null)} placeholder="Vazio = imagem de capa" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Perguntas frequentes" description="Exibidas na página do produto.">
          {p.faqs.map((faq, fi) => (
            <div key={fi} className="grid gap-2 rounded-lg border bg-background p-3">
              <Input aria-label="Pergunta" placeholder="Pergunta" value={faq.question} onChange={(e) => set("faqs", p.faqs.map((f, i) => (i === fi ? { ...f, question: e.target.value } : f)))} />
              <Textarea aria-label="Resposta" placeholder="Resposta" rows={2} value={faq.answer} onChange={(e) => set("faqs", p.faqs.map((f, i) => (i === fi ? { ...f, answer: e.target.value } : f)))} />
              <Button type="button" variant="ghost" size="sm" className="w-fit text-danger" onClick={() => set("faqs", p.faqs.filter((_, i) => i !== fi))}>
                <Trash2 aria-hidden="true" /> Remover pergunta
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" className="w-fit" onClick={() => set("faqs", [...p.faqs, { question: "", answer: "" }])}>
            <Plus aria-hidden="true" /> Adicionar pergunta
          </Button>
        </FormSection>
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t bg-surface/95 backdrop-blur sm:-mx-6 lg:-mx-8">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-8">
          <Select aria-label="Status de publicação" value={p.status} onChange={(e) => set("status", e.target.value as ProductInput["status"])} className="h-11 w-44">
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </Select>
          {!isNew && initial.status === "published" ? (
            <Link href={routes.product(originalSlug)} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              Ver no site <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
          <div className="ml-auto flex gap-2">
            {p.status !== "published" ? (
              <Button type="button" variant="outline" disabled={pending} onClick={() => submit("published")}>
                Salvar e publicar
              </Button>
            ) : null}
            <Button type="submit" variant="primary" disabled={pending} data-testid="save-product">
              {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {pending ? "Salvando…" : "Salvar produto"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
