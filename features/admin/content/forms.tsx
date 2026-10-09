"use client";

import { useState } from "react";
import { toDateTimeLocal } from "@/lib/validation/common";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { ImageField } from "@/features/admin/upload/image-field";
import { FormSection } from "@/features/admin/ui/admin-ui";
import { EntityForm } from "@/features/admin/ui/entity-form";
import { NameSlugFields } from "@/features/admin/catalog/forms";
import { ProductPicker, type PickedProduct } from "@/features/admin/products/product-picker";
import { saveBanner, saveCollection, savePage, savePost } from "./actions";

const PLACEMENTS = {
  home_hero: "Home — carrossel principal",
  home_middle: "Home — faixa intermediária",
  home_specialist: "Home — fale com especialistas",
  catalog_top: "Catálogo — topo (reservado)",
} as const;

export type BannerValues = {
  id: string | null;
  internal_name: string;
  placement: keyof typeof PLACEMENTS;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  image_alt: string | null;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_url: string | null;
  text_position: "left" | "center" | "right";
  overlay_opacity: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
};

export function BannerForm({ values }: { values: BannerValues }) {
  const folder = values.id ?? "novo";
  return (
    <EntityForm action={saveBanner} submitLabel="Salvar banner">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={values.id ?? ""} />
          <FormSection title="Identificação">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="internal_name" label="Nome interno" required error={errors.internal_name} hint="Só aparece no painel.">
                <Input id="internal_name" name="internal_name" defaultValue={values.internal_name} />
              </Field>
              <Field id="placement" label="Posição">
                <Select id="placement" name="placement" defaultValue={values.placement}>
                  {Object.entries(PLACEMENTS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </FormSection>
          <FormSection title="Imagens" description="Desktop: 2400×1000 px. Mobile (opcional): 900×1200 px. JPG/WebP.">
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <ImageField name="desktop_image_url" label="Imagem desktop *" bucket="banners" folder={folder} defaultValue={values.desktop_image_url} aspect="aspect-[12/5]" />
              <ImageField name="mobile_image_url" label="Imagem mobile" bucket="banners" folder={folder} defaultValue={values.mobile_image_url} aspect="aspect-[3/4]" />
            </div>
            {errors.desktop_image_url ? <p className="text-xs text-danger">{errors.desktop_image_url}</p> : null}
            <Field id="image_alt" label="Descrição da imagem (acessibilidade)" error={errors.image_alt}>
              <Input id="image_alt" name="image_alt" defaultValue={values.image_alt ?? ""} />
            </Field>
          </FormSection>
          <FormSection title="Texto e botão" description="Todos opcionais.">
            <Field id="eyebrow" label="Chamada curta (acima do título)">
              <Input id="eyebrow" name="eyebrow" maxLength={80} defaultValue={values.eyebrow ?? ""} />
            </Field>
            <Field id="title" label="Título" error={errors.title}>
              <Input id="title" name="title" maxLength={140} defaultValue={values.title ?? ""} />
            </Field>
            <Field id="subtitle" label="Subtítulo" error={errors.subtitle}>
              <Textarea id="subtitle" name="subtitle" rows={2} maxLength={300} defaultValue={values.subtitle ?? ""} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="button_text" label="Texto do botão">
                <Input id="button_text" name="button_text" maxLength={40} defaultValue={values.button_text ?? ""} />
              </Field>
              <Field id="button_url" label="Link do botão" hint="Ex.: /ofertas ou https://…" error={errors.button_url}>
                <Input id="button_url" name="button_url" defaultValue={values.button_url ?? ""} />
              </Field>
              <Field id="text_position" label="Posição do texto">
                <Select id="text_position" name="text_position" defaultValue={values.text_position}>
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </Select>
              </Field>
              <Field id="overlay_opacity" label="Escurecimento da imagem (%)" hint="Aumente se o texto estiver difícil de ler.">
                <Input id="overlay_opacity" name="overlay_opacity" type="number" min={0} max={90} defaultValue={values.overlay_opacity} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Publicação" description="Banners fora do período não aparecem no site (horário de Brasília).">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="starts_at" label="Início" error={errors.starts_at}>
                <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={toDateTimeLocal(values.starts_at)} />
              </Field>
              <Field id="ends_at" label="Fim" error={errors.ends_at}>
                <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toDateTimeLocal(values.ends_at)} />
              </Field>
              <Field id="sort_order" label="Ordem">
                <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={values.sort_order} />
              </Field>
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox name="is_active" defaultChecked={values.is_active} />
              Banner ativo
            </label>
          </FormSection>
        </>
      )}
    </EntityForm>
  );
}

const SOURCES = {
  manual: "Seleção manual",
  featured: "Produtos em destaque",
  on_sale: "Ofertas vigentes",
  new: "Novidades",
  recommended: "Recomendados pela equipe",
  most_viewed: "Mais acessados (analytics)",
} as const;

export type CollectionValues = {
  id: string | null;
  name: string;
  slug: string;
  title: string;
  subtitle: string | null;
  source: keyof typeof SOURCES;
  placement: "home" | "none";
  max_items: number;
  is_active: boolean;
  sort_order: number;
  products: PickedProduct[];
};

export function CollectionForm({ values }: { values: CollectionValues }) {
  const [source, setSource] = useState(values.source);
  const [products, setProducts] = useState(values.products);
  return (
    <EntityForm action={saveCollection} submitLabel="Salvar vitrine">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={values.id ?? ""} />
          {products.map((p) => (
            <input key={p.id} type="hidden" name="product_ids" value={p.id} />
          ))}
          <FormSection title="Vitrine" description="Blocos de produtos exibidos na Home, na ordem definida.">
            <NameSlugFields defaultName={values.name} defaultSlug={values.slug || null} errors={errors} prefix="vitrine: " />
            <Field id="title" label="Título exibido" required error={errors.title}>
              <Input id="title" name="title" defaultValue={values.title} />
            </Field>
            <Field id="subtitle" label="Subtítulo">
              <Input id="subtitle" name="subtitle" defaultValue={values.subtitle ?? ""} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="source" label="Origem dos produtos">
                <Select id="source" name="source" value={source} onChange={(e) => setSource(e.target.value as keyof typeof SOURCES)}>
                  {Object.entries(SOURCES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="max_items" label="Máximo de produtos">
                <Input id="max_items" name="max_items" type="number" min={1} max={48} defaultValue={values.max_items} />
              </Field>
              <Field id="placement" label="Exibir em">
                <Select id="placement" name="placement" defaultValue={values.placement}>
                  <option value="home">Home</option>
                  <option value="none">Oculta</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="sort_order" label="Ordem na Home">
                <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={values.sort_order} />
              </Field>
              <label className="flex items-center gap-2.5 self-end pb-3 text-sm">
                <Checkbox name="is_active" defaultChecked={values.is_active} />
                Vitrine ativa
              </label>
            </div>
          </FormSection>
          {source === "manual" ? (
            <FormSection title="Produtos da vitrine" description="Na ordem em que forem adicionados.">
              <ProductPicker value={products} onChange={setProducts} max={48} />
            </FormSection>
          ) : null}
        </>
      )}
    </EntityForm>
  );
}

export type PostValues = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_alt: string | null;
  author_name: string | null;
  category_id: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  is_featured: boolean;
  reading_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
};

export function PostForm({ values, categories }: { values: PostValues; categories: { id: string; name: string }[] }) {
  return (
    <EntityForm action={savePost} submitLabel="Salvar artigo">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={values.id ?? ""} />
          <FormSection title="Artigo">
            <Field id="title" label="Título" required error={errors.title}>
              <Input id="title" name="title" defaultValue={values.title} maxLength={200} />
            </Field>
            <Field id="slug" label="Endereço (slug)" required error={errors.slug} hint={`/dicas/${values.slug || "…"}`}>
              <Input id="slug" name="slug" defaultValue={values.slug} placeholder="como-escolher-piso" />
            </Field>
            <Field id="excerpt" label="Resumo" error={errors.excerpt}>
              <Textarea id="excerpt" name="excerpt" rows={2} maxLength={500} defaultValue={values.excerpt ?? ""} />
            </Field>
            <Field id="content" label="Conteúdo (Markdown)" hint="Use ## para subtítulos, - para listas, **negrito** e tabelas." error={errors.content}>
              <Textarea id="content" name="content" rows={18} defaultValue={values.content} className="font-mono text-sm" />
            </Field>
          </FormSection>
          <FormSection title="Capa">
            <ImageField name="cover_image_url" label="Imagem de capa" bucket="blog" folder={values.id ?? "novo"} defaultValue={values.cover_image_url} />
            <Field id="cover_alt" label="Descrição da capa">
              <Input id="cover_alt" name="cover_alt" defaultValue={values.cover_alt ?? ""} />
            </Field>
          </FormSection>
          <FormSection title="Organização">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="category_id" label="Categoria">
                <Select id="category_id" name="category_id" defaultValue={values.category_id ?? ""}>
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="author_name" label="Autor">
                <Input id="author_name" name="author_name" defaultValue={values.author_name ?? ""} />
              </Field>
              <Field id="reading_minutes" label="Minutos de leitura" hint="Vazio = calculado">
                <Input id="reading_minutes" name="reading_minutes" type="number" min={1} defaultValue={values.reading_minutes ?? ""} />
              </Field>
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox name="is_featured" defaultChecked={values.is_featured} />
              Destacar artigo
            </label>
          </FormSection>
          <FormSection title="Publicação">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="status" label="Status">
                <Select id="status" name="status" defaultValue={values.status}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Arquivado</option>
                </Select>
              </Field>
              <Field id="published_at" label="Data de publicação" hint="Vazio = no momento da publicação. Datas futuras ficam agendadas." error={errors.published_at}>
                <Input id="published_at" name="published_at" type="datetime-local" defaultValue={toDateTimeLocal(values.published_at)} />
              </Field>
            </div>
          </FormSection>
          <FormSection title="SEO">
            <Field id="seo_title" label="Título para buscadores" hint="Até 70 caracteres">
              <Input id="seo_title" name="seo_title" maxLength={70} defaultValue={values.seo_title ?? ""} />
            </Field>
            <Field id="seo_description" label="Descrição para buscadores" hint="Até 170 caracteres">
              <Textarea id="seo_description" name="seo_description" rows={2} maxLength={170} defaultValue={values.seo_description ?? ""} />
            </Field>
          </FormSection>
        </>
      )}
    </EntityForm>
  );
}

export type PageValues = {
  id: string | null;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: "draft" | "published" | "archived";
};

export function PageForm({ values }: { values: PageValues }) {
  return (
    <EntityForm action={savePage} submitLabel="Salvar página">
      {(errors) => (
        <>
          <input type="hidden" name="id" value={values.id ?? ""} />
          <input type="hidden" name="slug" value={values.slug} />
          <FormSection title="Conteúdo" description={`Endereço: /${values.slug}`}>
            <Field id="title" label="Título" required error={errors.title}>
              <Input id="title" name="title" defaultValue={values.title} />
            </Field>
            <Field id="summary" label="Resumo">
              <Textarea id="summary" name="summary" rows={2} defaultValue={values.summary ?? ""} />
            </Field>
            <Field id="content" label="Texto (Markdown)">
              <Textarea id="content" name="content" rows={20} defaultValue={values.content ?? ""} className="font-mono text-sm" />
            </Field>
            <Field id="status" label="Status">
              <Select id="status" name="status" defaultValue={values.status}>
                <option value="published">Publicada</option>
                <option value="draft">Rascunho</option>
              </Select>
            </Field>
          </FormSection>
          <FormSection title="SEO">
            <Field id="seo_title" label="Título para buscadores">
              <Input id="seo_title" name="seo_title" maxLength={70} defaultValue={values.seo_title ?? ""} />
            </Field>
            <Field id="seo_description" label="Descrição para buscadores">
              <Textarea id="seo_description" name="seo_description" rows={2} maxLength={170} defaultValue={values.seo_description ?? ""} />
            </Field>
          </FormSection>
        </>
      )}
    </EntityForm>
  );
}
