-- =============================================================================
-- Cerigatto — Fundação do banco
-- Extensões, enums, funções utilitárias (slug, unaccent imutável, updated_at)
-- e configuração de busca textual em português sem acentos.
-- =============================================================================

create schema if not exists extensions;
-- No Supabase estes grants já existem; mantidos para ambientes locais/CI.
grant usage on schema extensions to anon, authenticated, service_role;

create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums de domínio
-- -----------------------------------------------------------------------------
create type public.app_role as enum ('super_admin', 'admin', 'editor');

-- Estado editorial (não misturar com marcadores comerciais)
create type public.content_status as enum ('draft', 'published', 'archived');

-- Como o preço é exibido no site. Nunca há checkout.
create type public.price_display as enum ('show', 'consult', 'on_request', 'hidden');

-- Status comercial informativo (não representa estoque em tempo real)
create type public.availability_status as enum (
  'available_on_request',
  'made_to_order',
  'temporarily_unavailable',
  'discontinued'
);

create type public.lead_status as enum ('new', 'in_progress', 'answered', 'archived');

create type public.banner_placement as enum (
  'home_hero',
  'home_middle',
  'home_specialist',
  'catalog_top'
);

create type public.text_position as enum ('left', 'center', 'right');

-- -----------------------------------------------------------------------------
-- Funções utilitárias
-- -----------------------------------------------------------------------------

-- unaccent() não é IMMUTABLE; este wrapper permite uso em índices.
create or replace function public.f_unaccent(value text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, value)
$$;

-- Slug seguro: minúsculas, sem acentos, apenas [a-z0-9-]
create or replace function public.slugify(value text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(
    regexp_replace(lower(public.f_unaccent(value)), '[^a-z0-9]+', '-', 'g'),
    '-{2,}', '-', 'g'
  ))
$$;

-- Normalização de termos de busca (para agrupar pesquisas no analytics)
create or replace function public.normalize_search_term(value text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select regexp_replace(trim(lower(public.f_unaccent(value))), '\s+', ' ', 'g')
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Configuração de busca: português + remoção de acentos
create text search configuration public.pt_unaccent (copy = pg_catalog.portuguese);
alter text search configuration public.pt_unaccent
  alter mapping for hword, hword_part, word
  with extensions.unaccent, portuguese_stem;
