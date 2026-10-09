-- =============================================================================
-- Conteúdo: banners, páginas institucionais, blog/dicas e depoimentos
-- =============================================================================

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  internal_name text not null check (char_length(internal_name) between 2 and 120),
  placement public.banner_placement not null default 'home_hero',
  desktop_image_url text not null,
  mobile_image_url text,
  image_alt text,
  eyebrow text,
  title text,
  subtitle text,
  button_text text,
  button_url text check (button_url is null or button_url ~ '^(/|https://)'),
  text_position public.text_position not null default 'left',
  overlay_opacity integer not null default 40 check (overlay_opacity between 0 and 90),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_window check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index banners_placement_idx on public.banners (placement, is_active, sort_order);

create trigger banners_set_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

-- Páginas institucionais/legais editáveis (sobre, privacidade, termos, cookies)
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text,
  content text,
  seo_title text,
  seo_description text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text check (excerpt is null or char_length(excerpt) <= 500),
  content text not null default '',
  cover_image_url text,
  cover_alt text,
  author_name text,
  category_id uuid references public.blog_categories (id) on delete set null,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  is_featured boolean not null default false,
  reading_minutes integer check (reading_minutes is null or reading_minutes > 0),
  seo_title text,
  seo_description text,
  og_image_url text,
  deleted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_public_idx on public.blog_posts (status, published_at desc) where deleted_at is null;
create index blog_posts_category_idx on public.blog_posts (category_id);

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create or replace function public.content_set_published_at()
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

create trigger blog_posts_published_at
  before insert or update of status on public.blog_posts
  for each row execute function public.content_set_published_at();

create trigger pages_published_at
  before insert or update of status on public.pages
  for each row execute function public.content_set_published_at();

create table public.blog_post_tags (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Produtos citados em um artigo
create table public.blog_post_products (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (post_id, product_id)
);

-- Depoimentos: somente depoimentos reais autorizados pelos clientes.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_context text,
  content text not null check (char_length(content) between 10 and 1000),
  rating smallint check (rating is null or rating between 1 and 5),
  source text,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();
