-- =============================================================================
-- Configurações administráveis (sem dados inventados — tudo começa vazio)
-- Tabelas singleton usam id = 1.
-- =============================================================================

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'Cerigatto Materiais de Construção',
  short_name text not null default 'Cerigatto',
  tagline text,
  description text,
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  topbar_enabled boolean not null default false,
  topbar_message text,
  topbar_link text,
  -- Links do menu principal: [{ "label": "Ofertas", "href": "/ofertas", "enabled": true }]
  nav_links jsonb not null default '[
    {"label": "Produtos", "href": "/produtos", "enabled": true},
    {"label": "Ofertas", "href": "/ofertas", "enabled": true},
    {"label": "Marcas", "href": "/marcas", "enabled": true},
    {"label": "Ambientes", "href": "/ambientes", "enabled": true},
    {"label": "Dicas", "href": "/dicas", "enabled": true},
    {"label": "Sobre a Cerigatto", "href": "/sobre", "enabled": true},
    {"label": "Contato", "href": "/contato", "enabled": true}
  ]'::jsonb check (jsonb_typeof(nav_links) = 'array'),
  -- Sobrescritas opcionais de tokens de cor: { "primary": "#1B3F8F" }
  theme jsonb not null default '{}'::jsonb check (jsonb_typeof(theme) = 'object'),
  ga4_id text check (ga4_id is null or ga4_id ~ '^G-[A-Z0-9]{4,20}$'),
  gtm_id text check (gtm_id is null or gtm_id ~ '^GTM-[A-Z0-9]{4,12}$'),
  meta_pixel_id text check (meta_pixel_id is null or meta_pixel_id ~ '^[0-9]{6,20}$'),
  newsletter_enabled boolean not null default false,
  -- Exibe a faixa "conteúdo de demonstração" enquanto os dados reais não forem cadastrados
  demo_notice_enabled boolean not null default false,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.business_information (
  id smallint primary key default 1 check (id = 1),
  legal_name text,
  trade_name text,
  cnpj text check (cnpj is null or cnpj ~ '^[0-9]{14}$'),
  phone text check (phone is null or phone ~ '^[0-9]{10,13}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  street text,
  street_number text,
  complement text,
  district text,
  city text not null default 'Bauru',
  state text not null default 'SP' check (char_length(state) = 2),
  postal_code text check (postal_code is null or postal_code ~ '^[0-9]{8}$'),
  latitude numeric(9, 6) check (latitude is null or latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude is null or longitude between -180 and 180),
  google_maps_url text,
  -- Somente informações reais (deixe vazio enquanto não houver)
  founded_year smallint check (founded_year is null or founded_year between 1800 and 2100),
  about_title text,
  about_summary text,
  history text,
  mission text,
  values_text text,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger business_information_set_updated_at
  before update on public.business_information
  for each row execute function public.set_updated_at();

-- Horário de atendimento (0 = domingo ... 6 = sábado). Vários intervalos por dia são permitidos.
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_hours_interval check (
    is_closed or (opens_at is not null and closes_at is not null and closes_at > opens_at)
  )
);

create index business_hours_day_idx on public.business_hours (day_of_week, opens_at);

create trigger business_hours_set_updated_at
  before update on public.business_hours
  for each row execute function public.set_updated_at();

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'facebook', 'youtube', 'linkedin', 'tiktok', 'pinterest', 'x')),
  url text not null check (url ~ '^https://'),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform)
);

create trigger social_links_set_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

create table public.whatsapp_settings (
  id smallint primary key default 1 check (id = 1),
  is_enabled boolean not null default true,
  country_code text not null default '55' check (country_code ~ '^[0-9]{1,3}$'),
  -- DDD + número, somente dígitos (ex.: 14999999999)
  phone_number text check (phone_number is null or phone_number ~ '^[0-9]{10,11}$'),
  default_message text not null default 'Olá! Estou no site da Cerigatto Materiais de Construção e gostaria de atendimento.',
  product_intro text not null default 'Olá! Estou no site da Cerigatto Materiais de Construção e gostaria de consultar este produto:',
  product_outro text not null default 'Gostaria de verificar disponibilidade e condições.',
  quote_intro text not null default 'Olá! Estou no site da Cerigatto Materiais de Construção e gostaria de solicitar um orçamento para os itens abaixo:',
  button_label text not null default 'Consultar disponibilidade no WhatsApp',
  floating_label text not null default 'Fale com a Cerigatto',
  show_floating_button boolean not null default true,
  show_floating_label_mobile boolean not null default false,
  show_out_of_hours_notice boolean not null default true,
  out_of_hours_message text not null default 'Estamos fora do horário de atendimento, mas envie sua mensagem e responderemos assim que possível.',
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger whatsapp_settings_set_updated_at
  before update on public.whatsapp_settings
  for each row execute function public.set_updated_at();

create table public.seo_settings (
  id smallint primary key default 1 check (id = 1),
  default_title text not null default 'Cerigatto Materiais de Construção em Bauru/SP',
  title_template text not null default '%s | Cerigatto Materiais de Construção' check (position('%s' in title_template) > 0),
  default_description text not null default 'Catálogo de materiais de construção, pisos e revestimentos, tintas, elétrica, hidráulica e ferramentas em Bauru/SP. Consulte disponibilidade e solicite orçamento pelo WhatsApp.',
  default_og_image_url text,
  google_site_verification text,
  bing_site_verification text,
  -- Use true em ambientes de homologação para impedir indexação
  noindex_site boolean not null default false,
  local_business_type text not null default 'HardwareStore',
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger seo_settings_set_updated_at
  before update on public.seo_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (1);
insert into public.business_information (id) values (1);
insert into public.whatsapp_settings (id) values (1);
insert into public.seo_settings (id) values (1);

-- -----------------------------------------------------------------------------
-- Redirects 301 (preservam SEO quando slugs de conteúdo publicado mudam)
-- -----------------------------------------------------------------------------
create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique check (source_path ~ '^/[^\s]*$'),
  destination_path text not null check (destination_path ~ '^(/|https://)[^\s]*$'),
  status_code smallint not null default 301 check (status_code in (301, 302, 307, 308)),
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_path <> destination_path)
);

create trigger redirects_set_updated_at
  before update on public.redirects
  for each row execute function public.set_updated_at();

-- Cria redirect automaticamente quando o slug de um conteúdo publicado muda.
-- tg_argv[0] = prefixo da rota pública (ex.: '/produto/').
create or replace function public.create_slug_redirect()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  prefix text := tg_argv[0];
  old_path text := prefix || old.slug;
  new_path text := prefix || new.slug;
  was_public boolean;
begin
  if new.slug = old.slug then
    return new;
  end if;

  was_public := case tg_table_name
    when 'products' then (to_jsonb(old) ->> 'status') = 'published'
    when 'blog_posts' then (to_jsonb(old) ->> 'status') = 'published'
    else coalesce((to_jsonb(old) ->> 'is_active')::boolean, false)
  end;

  if not was_public then
    return new;
  end if;

  -- O novo caminho não pode continuar redirecionando
  delete from public.redirects where source_path = new_path;
  -- Encurta cadeias: A -> B e agora B -> C vira A -> C
  update public.redirects set destination_path = new_path where destination_path = old_path;
  insert into public.redirects (source_path, destination_path, status_code, created_by)
  values (old_path, new_path, 301, auth.uid())
  on conflict (source_path) do update
    set destination_path = excluded.destination_path, is_active = true;
  return new;
end;
$$;

create trigger products_slug_redirect
  after update of slug on public.products
  for each row execute function public.create_slug_redirect('/produto/');

create trigger categories_slug_redirect
  after update of slug on public.categories
  for each row execute function public.create_slug_redirect('/categoria/');

create trigger brands_slug_redirect
  after update of slug on public.brands
  for each row execute function public.create_slug_redirect('/marca/');

create trigger environments_slug_redirect
  after update of slug on public.environments
  for each row execute function public.create_slug_redirect('/ambientes/');

create trigger blog_posts_slug_redirect
  after update of slug on public.blog_posts
  for each row execute function public.create_slug_redirect('/dicas/');
