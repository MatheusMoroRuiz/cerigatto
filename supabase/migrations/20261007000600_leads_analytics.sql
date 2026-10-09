-- =============================================================================
-- Leads (contatos e solicitações de orçamento), analytics comercial,
-- pesquisas, auditoria administrativa e rate limit.
-- =============================================================================

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text check (phone is null or phone ~ '^[0-9]{10,13}$'),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,13}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text not null check (char_length(subject) between 2 and 160),
  message text not null check (char_length(message) between 5 and 4000),
  source_page text,
  utm jsonb not null default '{}'::jsonb,
  status public.lead_status not null default 'new',
  internal_notes text,
  handled_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_has_channel check (phone is not null or whatsapp is not null or email is not null)
);

create index contacts_status_idx on public.contacts (status, created_at desc);

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

-- Registro anônimo das listas de orçamento enviadas ao WhatsApp
-- (sem dados pessoais — o contato acontece no WhatsApp)
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'whatsapp' check (channel in ('whatsapp')),
  items_count integer not null check (items_count between 1 and 200),
  note text check (note is null or char_length(note) <= 1000),
  session_id text check (session_id is null or char_length(session_id) <= 64),
  source_page text,
  utm jsonb not null default '{}'::jsonb,
  status public.lead_status not null default 'new',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quote_requests_created_idx on public.quote_requests (created_at desc);

create trigger quote_requests_set_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

create table public.quote_request_items (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  sku text,
  variant_label text,
  quantity numeric(12, 2) not null check (quantity > 0),
  unit text
);

create index quote_request_items_request_idx on public.quote_request_items (quote_request_id);
create index quote_request_items_product_idx on public.quote_request_items (product_id);

-- -----------------------------------------------------------------------------
-- Analytics comercial (sem dados pessoais)
-- -----------------------------------------------------------------------------
create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in (
    'page_view', 'product_view', 'category_view', 'brand_view', 'search',
    'whatsapp_click', 'quote_list_add', 'quote_list_remove', 'quote_list_submit',
    'contact_submit', 'banner_click', 'favorite_add', 'share'
  )),
  product_id uuid references public.products (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  banner_id uuid references public.banners (id) on delete set null,
  page_path text check (page_path is null or char_length(page_path) <= 500),
  session_id text check (session_id is null or char_length(session_id) <= 64),
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 160),
  utm_term text check (utm_term is null or char_length(utm_term) <= 160),
  utm_content text check (utm_content is null or char_length(utm_content) <= 160),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  metadata jsonb not null default '{}'::jsonb check (pg_column_size(metadata) < 4096),
  created_at timestamptz not null default now()
);

create index analytics_events_name_date_idx on public.analytics_events (event_name, created_at desc);
create index analytics_events_product_idx on public.analytics_events (product_id, event_name) where product_id is not null;
create index analytics_events_created_idx on public.analytics_events (created_at desc);

create table public.search_events (
  id bigint generated always as identity primary key,
  query text not null check (char_length(query) between 1 and 120),
  normalized_query text not null,
  results_count integer not null default 0,
  session_id text check (session_id is null or char_length(session_id) <= 64),
  created_at timestamptz not null default now()
);

create index search_events_date_idx on public.search_events (created_at desc);
create index search_events_query_idx on public.search_events (normalized_query);

-- -----------------------------------------------------------------------------
-- Auditoria administrativa
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(action) between 2 and 80),
  entity_type text not null check (char_length(entity_type) between 2 and 60),
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- -----------------------------------------------------------------------------
-- Rate limit por janela fixa (chaves são hashes calculados no servidor)
-- -----------------------------------------------------------------------------
create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

create or replace function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  bucket timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  current_hits integer;
begin
  if p_key is null or char_length(p_key) > 128 or p_max < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.rate_limits as rl (key, window_start, hits)
  values (p_key, bucket, 1)
  on conflict (key, window_start) do update set hits = rl.hits + 1
  returning hits into current_hits;

  -- Limpeza oportunista de janelas antigas
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return current_hits <= p_max;
end;
$$;
