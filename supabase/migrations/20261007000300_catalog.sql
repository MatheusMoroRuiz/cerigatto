-- =============================================================================
-- Catálogo: categorias, marcas, ambientes, produtos, imagens, variações,
-- atributos/especificações, tags, relacionamentos e vitrines.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Categorias (árvore com parent_id, múltiplos níveis)
-- -----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  image_url text,
  banner_url text,
  icon text,
  seo_title text,
  seo_description text,
  seo_content text,
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{10,15}$'),
  is_active boolean not null default true,
  show_in_menu boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_not_self_parent check (parent_id is null or parent_id <> id)
);

create index categories_parent_idx on public.categories (parent_id, sort_order);
create index categories_menu_idx on public.categories (is_active, show_in_menu) where deleted_at is null;

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- Impede ciclos na árvore de categorias (A -> B -> A)
create or replace function public.prevent_category_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is null then
    return new;
  end if;
  if exists (
    with recursive ancestors as (
      select c.id, c.parent_id from public.categories c where c.id = new.parent_id
      union all
      select c.id, c.parent_id
      from public.categories c
      join ancestors a on c.id = a.parent_id
    )
    select 1 from ancestors where id = new.id
  ) then
    raise exception 'Categoria não pode ser filha de si mesma ou de uma subcategoria própria.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger categories_prevent_cycle
  before insert or update of parent_id on public.categories
  for each row execute function public.prevent_category_cycle();

-- -----------------------------------------------------------------------------
-- Marcas
-- -----------------------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  logo_url text,
  description text,
  website_url text,
  banner_url text,
  seo_title text,
  seo_description text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index brands_active_idx on public.brands (is_active, sort_order) where deleted_at is null;

create trigger brands_set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Ambientes / inspiração (banheiro, cozinha, área externa...)
-- -----------------------------------------------------------------------------
create table public.environments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text,
  content text,
  image_url text,
  banner_url text,
  seo_title text,
  seo_description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger environments_set_updated_at
  before update on public.environments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Produtos — apenas dados universais. Características específicas por categoria
-- ficam em product_specifications (modelo atributo/valor).
-- -----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sku text unique check (sku is null or char_length(sku) between 1 and 64),
  short_description text check (short_description is null or char_length(short_description) <= 400),
  description text,
  brand_id uuid references public.brands (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,

  -- Estado editorial
  status public.content_status not null default 'draft',
  published_at timestamptz,

  -- Marcadores comerciais (independentes do estado editorial)
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_on_sale boolean not null default false,
  is_recommended boolean not null default false,
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  sale_label text,

  -- Preço (opcional e informativo — nunca há checkout)
  price_display public.price_display not null default 'consult',
  price numeric(12, 2) check (price is null or price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  unit text not null default 'unidade',

  availability public.availability_status not null default 'available_on_request',

  -- Informações universais
  manufacturer text,
  model text,
  dimensions text,
  weight_kg numeric(10, 3) check (weight_kg is null or weight_kg >= 0),
  warranty text,
  package_contents text,
  notes text,
  video_url text,

  -- Conversão
  cta_label text check (cta_label is null or char_length(cta_label) <= 60),
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{10,15}$'),

  -- SEO
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_url text,

  -- Busca (mantido por trigger)
  search_text text not null default '',
  search_vector tsvector,

  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_sale_window check (
    sale_starts_at is null or sale_ends_at is null or sale_ends_at > sale_starts_at
  ),
  constraint products_sale_price_lower check (
    sale_price is null or price is null or sale_price <= price
  )
);

create index products_public_idx on public.products (status, published_at desc) where deleted_at is null;
create index products_category_idx on public.products (category_id) where deleted_at is null;
create index products_brand_idx on public.products (brand_id) where deleted_at is null;
create index products_featured_idx on public.products (is_featured) where is_featured and deleted_at is null;
create index products_on_sale_idx on public.products (is_on_sale, sale_ends_at) where is_on_sale and deleted_at is null;
create index products_new_idx on public.products (is_new) where is_new and deleted_at is null;
create index products_created_idx on public.products (created_at desc);
create index products_name_idx on public.products (name);
create index products_search_idx on public.products using gin (search_vector);
create index products_search_trgm_idx on public.products using gin (search_text extensions.gin_trgm_ops);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Define published_at automaticamente ao publicar
create or replace function public.products_set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger products_published_at
  before insert or update of status on public.products
  for each row execute function public.products_set_published_at();

-- Oferta vigente: marcador + janela de datas. Exposto ao PostgREST como coluna computada.
create or replace function public.sale_active(p public.products)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p.is_on_sale
    and (p.sale_starts_at is null or p.sale_starts_at <= now())
    and (p.sale_ends_at is null or p.sale_ends_at > now())
$$;

-- -----------------------------------------------------------------------------
-- Imagens de produto
-- -----------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  storage_path text,
  alt text check (alt is null or char_length(alt) <= 200),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, sort_order);
create unique index product_images_one_cover on public.product_images (product_id) where is_cover;

-- -----------------------------------------------------------------------------
-- Variações: grupos de opção (ex.: "Medida") com valores (ex.: "90x90").
-- Cada valor pode ter SKU, preço e disponibilidade próprios.
-- -----------------------------------------------------------------------------
create table public.product_variant_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  is_required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, name)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  option_id uuid not null references public.product_variant_options (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  sku text,
  price numeric(12, 2) check (price is null or price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  availability public.availability_status,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (option_id, label)
);

create index product_variants_product_idx on public.product_variants (product_id, sort_order);

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Atributos (definições reutilizáveis) e especificações (valores por produto)
-- -----------------------------------------------------------------------------
create table public.attributes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  unit text,
  group_name text not null default 'Especificações',
  is_filterable boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger attributes_set_updated_at
  before update on public.attributes
  for each row execute function public.set_updated_at();

-- Modelo de atributos sugeridos por categoria (ex.: Tintas -> Rendimento, Volume)
create table public.category_attributes (
  category_id uuid not null references public.categories (id) on delete cascade,
  attribute_id uuid not null references public.attributes (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (category_id, attribute_id)
);

create table public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  attribute_id uuid references public.attributes (id) on delete restrict,
  label text check (label is null or char_length(label) <= 80),
  value text not null check (char_length(value) between 1 and 300),
  value_slug text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint product_specifications_label_or_attribute check (attribute_id is not null or label is not null)
);

create index product_specifications_product_idx on public.product_specifications (product_id, sort_order);
create index product_specifications_filter_idx on public.product_specifications (attribute_id, value_slug);

create or replace function public.product_specifications_set_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.value_slug = public.slugify(new.value);
  return new;
end;
$$;

create trigger product_specifications_slug
  before insert or update of value on public.product_specifications
  for each row execute function public.product_specifications_set_slug();

-- -----------------------------------------------------------------------------
-- Tags
-- -----------------------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (product_id, tag_id)
);

create index product_tags_tag_idx on public.product_tags (tag_id);

-- -----------------------------------------------------------------------------
-- Produto x ambiente e relacionamentos manuais
-- -----------------------------------------------------------------------------
create table public.product_environments (
  product_id uuid not null references public.products (id) on delete cascade,
  environment_id uuid not null references public.environments (id) on delete cascade,
  primary key (product_id, environment_id)
);

create index product_environments_env_idx on public.product_environments (environment_id);

create table public.product_relations (
  product_id uuid not null references public.products (id) on delete cascade,
  related_product_id uuid not null references public.products (id) on delete cascade,
  relation_type text not null default 'combines' check (relation_type in ('related', 'combines')),
  sort_order integer not null default 0,
  primary key (product_id, related_product_id, relation_type),
  check (product_id <> related_product_id)
);

-- -----------------------------------------------------------------------------
-- Vitrines (coleções) — manuais ou automáticas
-- -----------------------------------------------------------------------------
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  subtitle text,
  source text not null default 'manual'
    check (source in ('manual', 'featured', 'on_sale', 'new', 'recommended', 'most_viewed', 'category')),
  category_id uuid references public.categories (id) on delete set null,
  placement text not null default 'home' check (placement in ('home', 'none')),
  max_items integer not null default 8 check (max_items between 1 and 48),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

create table public.collection_products (
  collection_id uuid not null references public.collections (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, product_id)
);

-- -----------------------------------------------------------------------------
-- FAQ (geral, por produto ou por categoria)
-- -----------------------------------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 3 and 300),
  answer text not null,
  product_id uuid references public.products (id) on delete cascade,
  category_id uuid references public.categories (id) on delete cascade,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_product_idx on public.faqs (product_id) where product_id is not null;
create index faqs_category_idx on public.faqs (category_id) where category_id is not null;

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Documento de busca do produto
-- Pesos: A = nome/SKU, B = marca/categoria/tags, C = resumo/especificações, D = descrição
-- -----------------------------------------------------------------------------
create or replace function public.products_build_search()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  brand_name text;
  category_names text;
  tag_names text;
  spec_values text;
begin
  select b.name into brand_name from public.brands b where b.id = new.brand_id;

  with recursive tree as (
    select c.id, c.parent_id, c.name from public.categories c where c.id = new.category_id
    union all
    select c.id, c.parent_id, c.name from public.categories c join tree t on c.id = t.parent_id
  )
  select string_agg(name, ' ') into category_names from tree;

  select string_agg(t.name, ' ') into tag_names
  from public.product_tags pt join public.tags t on t.id = pt.tag_id
  where pt.product_id = new.id;

  select string_agg(ps.value, ' ') into spec_values
  from public.product_specifications ps where ps.product_id = new.id;

  new.search_text = public.normalize_search_term(concat_ws(' ',
    new.name, new.sku, brand_name, category_names, tag_names, new.manufacturer, new.model
  ));

  new.search_vector =
    setweight(to_tsvector('public.pt_unaccent', coalesce(new.name, '') || ' ' || coalesce(new.sku, '')), 'A') ||
    setweight(to_tsvector('public.pt_unaccent', concat_ws(' ', brand_name, category_names, tag_names)), 'B') ||
    setweight(to_tsvector('public.pt_unaccent', concat_ws(' ', new.short_description, spec_values, new.manufacturer, new.model)), 'C') ||
    setweight(to_tsvector('public.pt_unaccent', coalesce(left(new.description, 4000), '')), 'D');
  return new;
end;
$$;

create trigger products_search_document
  before insert or update on public.products
  for each row execute function public.products_build_search();

-- Reprocessa o documento de busca quando dados relacionados mudam
create or replace function public.touch_product_search()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name in ('product_tags', 'product_specifications') then
    update public.products set search_text = search_text
    where id = coalesce(new.product_id, old.product_id);
  elsif tg_table_name = 'brands' then
    update public.products set search_text = search_text where brand_id = new.id;
  elsif tg_table_name = 'categories' then
    update public.products set search_text = search_text where category_id = new.id;
  end if;
  return null;
end;
$$;

create trigger product_tags_touch_search
  after insert or delete on public.product_tags
  for each row execute function public.touch_product_search();

create trigger product_specifications_touch_search
  after insert or update or delete on public.product_specifications
  for each row execute function public.touch_product_search();

create trigger brands_touch_search
  after update of name on public.brands
  for each row execute function public.touch_product_search();

create trigger categories_touch_search
  after update of name on public.categories
  for each row execute function public.touch_product_search();
