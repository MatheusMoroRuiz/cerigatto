"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { CATEGORY_ICON_OPTIONS } from "@/components/layout/category-icon";
import { ImageField } from "@/features/admin/upload/image-field";
import { FormSection } from "@/features/admin/ui/admin-ui";
import { EntityForm } from "@/features/admin/ui/entity-form";
import { saveAttribute, saveBrand, saveCategory, saveEnvironment } from "./actions";

/** Nome + slug com geração automática (até o slug ser editado manualmente) */
export function NameSlugFields({
  defaultName,
  defaultSlug,
  errors,
  prefix,
}: {
  defaultName?: string | null;
  defaultSlug?: string | null;
  errors: Record<string, string>;
  prefix: string;
}) {
  const [name, setName] = useState(defaultName ?? "");
  const [slug, setSlug] = useState(defaultSlug ?? "");
  const [touched, setTouched] = useState(Boolean(defaultSlug));
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="name" label="Nome" required error={errors.name}>
        <Input
          id="name"
          name="name"
          value={name}
          aria-invalid={Boolean(errors.name)}
          onChange={(e) => {
            setName(e.target.value);
            if (!touched) setSlug(slugify(e.target.value));
          }}
        />
      </Field>
      <Field
        id="slug"
        label="Endereço (slug)"
        required
        error={errors.slug}
        hint={defaultSlug && slug !== defaultSlug ? "O endereço antigo redirecionará (301) para o novo." : `${prefix}${slug || "…"}`}
      >
        <Input
          id="slug"
          name="slug"
          value={slug}
          aria-invalid={Boolean(errors.slug)}
          onChange={(e) => {
            setTouched(true);
            setSlug(slugify(e.target.value));
          }}
        />
      </Field>
    </div>
  );
}

function SeoFields({ errors, title, description }: { errors: Record<string, string>; title?: string | null; description?: string | null }) {
  return (
    <FormSection title="SEO" description="Opcional. Sem preenchimento, usamos nome e descrição.">
      <Field id="seo_title" label="Título para buscadores" error={errors.seo_title} hint="Até 70 caracteres">
        <Input id="seo_title" name="seo_title" maxLength={70} defaultValue={title ?? ""} />
      </Field>
      <Field id="seo_description" label="Descrição para buscadores" error={errors.seo_description} hint="Até 170 caracteres">
        <Textarea id="seo_description" name="seo_description" rows={2} maxLength={170} defaultValue={description ?? ""} />
      </Field>
    </FormSection>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2.5 text-sm">
      <Checkbox name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

export type CategoryFormValues = {
  id: string | null;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  icon: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  show_in_menu: boolean;
  is_featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_content: string | null;
  attribute_ids: string[];
};

export function CategoryForm({
  values,
  parents,
  attributes,
}: {
  values: CategoryFormValues;
  parents: { id: string; label: string }[];
  attributes: { id: string; name: string }[];
}) {
  const folder = values.id ?? "nova";
  return (
    <EntityForm action={saveCategory} submitLabel="Salvar categoria">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={values.id ?? ""} />
          <FormSection title="Informações">
            <NameSlugFields defaultName={values.name} defaultSlug={values.slug || null} errors={errors} prefix="/categoria/" />
            <Field id="parent_id" label="Categoria mãe" hint="Deixe vazio para um departamento principal." error={errors.parent_id}>
              <Select id="parent_id" name="parent_id" defaultValue={values.parent_id ?? ""}>
                <option value="">— Departamento principal —</option>
                {parents
                  .filter((p) => p.id !== values.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field id="description" label="Descrição" error={errors.description}>
              <Textarea id="description" name="description" rows={3} maxLength={600} defaultValue={values.description ?? ""} />
            </Field>
          </FormSection>
          <FormSection title="Imagens" description="Imagem (cards e mega menu) e banner (topo da página da categoria).">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField name="image_url" label="Imagem" bucket="categories" folder={folder} defaultValue={values.image_url} aspect="aspect-[4/3]" />
              <ImageField name="banner_url" label="Banner" bucket="categories" folder={folder} defaultValue={values.banner_url} aspect="aspect-[3/1]" />
            </div>
            {errors.image_url || errors.banner_url ? <p className="text-xs text-danger">{errors.image_url ?? errors.banner_url}</p> : null}
          </FormSection>
          <FormSection title="Exibição">
            <div className="grid gap-3 sm:grid-cols-3">
              <Toggle name="is_active" label="Ativa no site" defaultChecked={values.is_active} />
              <Toggle name="show_in_menu" label="Mostrar no menu" defaultChecked={values.show_in_menu} />
              <Toggle name="is_featured" label="Destaque na Home" defaultChecked={values.is_featured} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="icon" label="Ícone">
                <Select id="icon" name="icon" defaultValue={values.icon ?? ""}>
                  <option value="">Padrão</option>
                  {CATEGORY_ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="sort_order" label="Ordem" hint="Menor aparece primeiro">
                <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={values.sort_order} />
              </Field>
              <Field id="whatsapp_number" label="WhatsApp do setor" hint="Opcional. Ex.: 5514999999999" error={errors.whatsapp_number}>
                <Input id="whatsapp_number" name="whatsapp_number" inputMode="tel" defaultValue={values.whatsapp_number ?? ""} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Atributos sugeridos" description="Campos de especificação sugeridos ao cadastrar produtos desta categoria.">
            <div className="grid gap-2 sm:grid-cols-3">
              {attributes.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <Checkbox name="attribute_ids" value={a.id} defaultChecked={values.attribute_ids.includes(a.id)} />
                  {a.name}
                </label>
              ))}
            </div>
          </FormSection>
          <SeoFields errors={errors} title={values.seo_title} description={values.seo_description} />
          <FormSection title="Texto para SEO" description="Conteúdo exibido no fim da página da categoria (Markdown). Escreva para pessoas, sem repetir palavras-chave.">
            <Textarea name="seo_content" rows={6} defaultValue={values.seo_content ?? ""} aria-label="Texto para SEO" className="font-mono text-sm" />
          </FormSection>
        </>
      )}
    </EntityForm>
  );
}

export type BrandFormValues = {
  id: string | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export function BrandForm({ values }: { values: BrandFormValues }) {
  const folder = values.id ?? "nova";
  return (
    <EntityForm action={saveBrand} submitLabel="Salvar marca">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={values.id ?? ""} />
          <FormSection title="Informações">
            <NameSlugFields defaultName={values.name} defaultSlug={values.slug || null} errors={errors} prefix="/marca/" />
            <Field id="description" label="Descrição" error={errors.description}>
              <Textarea id="description" name="description" rows={4} defaultValue={values.description ?? ""} />
            </Field>
            <Field id="website_url" label="Site do fabricante" error={errors.website_url}>
              <Input id="website_url" name="website_url" type="url" placeholder="https://" defaultValue={values.website_url ?? ""} />
            </Field>
          </FormSection>
          <FormSection title="Imagens" description="Logo em PNG/WebP com fundo transparente funciona melhor.">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField name="logo_url" label="Logo" bucket="brands" folder={folder} defaultValue={values.logo_url} aspect="aspect-[5/2]" />
              <ImageField name="banner_url" label="Banner" bucket="brands" folder={folder} defaultValue={values.banner_url} aspect="aspect-[3/1]" />
            </div>
          </FormSection>
          <FormSection title="Exibição">
            <div className="grid gap-3 sm:grid-cols-3">
              <Toggle name="is_active" label="Ativa no site" defaultChecked={values.is_active} />
              <Toggle name="is_featured" label="Destaque na Home" defaultChecked={values.is_featured} />
              <Field id="sort_order" label="Ordem">
                <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={values.sort_order} />
              </Field>
            </div>
          </FormSection>
          <SeoFields errors={errors} title={values.seo_title} description={values.seo_description} />
        </>
      )}
    </EntityForm>
  );
}

export type EnvironmentFormValues = {
  id: string | null;
  name: string;
  slug: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export function EnvironmentForm({ values }: { values: EnvironmentFormValues }) {
  const folder = `ambientes/${values.id ?? "novo"}`;
  return (
    <EntityForm action={saveEnvironment} submitLabel="Salvar ambiente">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={values.id ?? ""} />
          <FormSection title="Informações" description="Os produtos aparecem conforme o campo “Ambientes indicados” de cada produto.">
            <NameSlugFields defaultName={values.name} defaultSlug={values.slug || null} errors={errors} prefix="/ambientes/" />
            <Field id="summary" label="Resumo" error={errors.summary}>
              <Textarea id="summary" name="summary" rows={2} maxLength={400} defaultValue={values.summary ?? ""} />
            </Field>
            <Field id="content" label="Conteúdo (Markdown)" error={errors.content}>
              <Textarea id="content" name="content" rows={8} defaultValue={values.content ?? ""} className="font-mono text-sm" />
            </Field>
          </FormSection>
          <FormSection title="Imagens">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField name="image_url" label="Imagem" bucket="site" folder={folder} defaultValue={values.image_url} aspect="aspect-[4/3]" />
              <ImageField name="banner_url" label="Banner" bucket="site" folder={folder} defaultValue={values.banner_url} aspect="aspect-[3/1]" />
            </div>
          </FormSection>
          <FormSection title="Exibição">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle name="is_active" label="Ativo no site" defaultChecked={values.is_active} />
              <Field id="sort_order" label="Ordem">
                <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={values.sort_order} />
              </Field>
            </div>
          </FormSection>
          <SeoFields errors={errors} title={values.seo_title} description={values.seo_description} />
        </>
      )}
    </EntityForm>
  );
}

export type AttributeFormValues = {
  id: string | null;
  name: string;
  slug: string;
  unit: string | null;
  group_name: string;
  is_filterable: boolean;
  sort_order: number;
};

export function AttributeForm({ values }: { values: AttributeFormValues }) {
  return (
    <EntityForm action={saveAttribute} submitLabel="Salvar atributo">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={values.id ?? ""} />
          <FormSection title="Atributo" description="Ex.: Acabamento, Voltagem, Rendimento. O slug vira o nome do filtro na URL (?acabamento=acetinado).">
            <NameSlugFields defaultName={values.name} defaultSlug={values.slug || null} errors={errors} prefix="?" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="unit" label="Unidade" hint="Ex.: mm, m², W, L" error={errors.unit}>
                <Input id="unit" name="unit" maxLength={20} defaultValue={values.unit ?? ""} />
              </Field>
              <Field id="group_name" label="Grupo na ficha técnica" error={errors.group_name}>
                <Input id="group_name" name="group_name" defaultValue={values.group_name} list="attr-groups" />
                <datalist id="attr-groups">
                  {["Especificações", "Dimensões", "Embalagem", "Desempenho"].map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </Field>
              <Field id="sort_order" label="Ordem">
                <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={values.sort_order} />
              </Field>
            </div>
            <Toggle name="is_filterable" label="Usar como filtro no catálogo" defaultChecked={values.is_filterable} />
          </FormSection>
        </>
      )}
    </EntityForm>
  );
}
