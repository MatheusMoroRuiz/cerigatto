-- =============================================================================
-- Row Level Security
--
-- Público (anon): SELECT apenas de conteúdo publicado/ativo; INSERT apenas
--   onde há formulário público (contatos, eventos, pesquisas).
-- editor: gerencia catálogo e conteúdo.
-- admin: + configurações, contatos, redirects, SEO, auditoria.
-- super_admin: + gestão de administradores.
-- =============================================================================

-- Habilita RLS em todas as tabelas do schema public
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Perfis e papéis
-- -----------------------------------------------------------------------------
create policy "profiles: self or admin read" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_min_role('admin'));

create policy "profiles: self update" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles: super admin manage" on public.profiles
  for all to authenticated
  using (public.has_min_role('super_admin')) with check (public.has_min_role('super_admin'));

create policy "user_roles: self or admin read" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_min_role('admin'));

create policy "user_roles: super admin insert" on public.user_roles
  for insert to authenticated
  with check (public.has_min_role('super_admin'));

create policy "user_roles: super admin update" on public.user_roles
  for update to authenticated
  using (public.has_min_role('super_admin')) with check (public.has_min_role('super_admin'));

create policy "user_roles: super admin delete" on public.user_roles
  for delete to authenticated
  using (public.has_min_role('super_admin') and user_id <> auth.uid());

-- -----------------------------------------------------------------------------
-- Catálogo — leitura pública
-- -----------------------------------------------------------------------------
create policy "categories: public read active" on public.categories
  for select to anon, authenticated
  using (is_active and deleted_at is null);

create policy "brands: public read active" on public.brands
  for select to anon, authenticated
  using (is_active and deleted_at is null);

create policy "environments: public read active" on public.environments
  for select to anon, authenticated
  using (is_active and deleted_at is null);

create policy "products: public read published" on public.products
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);

-- Tabelas filhas: visíveis quando o produto pai é visível (a subconsulta respeita o RLS de products)
create policy "product_images: public read" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));

create policy "product_variant_options: public read" on public.product_variant_options
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));

create policy "product_variants: public read" on public.product_variants
  for select to anon, authenticated
  using (is_active and exists (select 1 from public.products p where p.id = product_id));

create policy "product_specifications: public read" on public.product_specifications
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));

create policy "product_tags: public read" on public.product_tags
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));

create policy "product_environments: public read" on public.product_environments
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));

create policy "product_relations: public read" on public.product_relations
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = related_product_id));

create policy "attributes: public read" on public.attributes
  for select to anon, authenticated using (true);

create policy "category_attributes: public read" on public.category_attributes
  for select to anon, authenticated using (true);

create policy "tags: public read" on public.tags
  for select to anon, authenticated using (true);

create policy "collections: public read active" on public.collections
  for select to anon, authenticated using (is_active);

create policy "collection_products: public read" on public.collection_products
  for select to anon, authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id));

create policy "faqs: public read active" on public.faqs
  for select to anon, authenticated using (is_active);

-- -----------------------------------------------------------------------------
-- Conteúdo — leitura pública
-- -----------------------------------------------------------------------------
create policy "banners: public read live" on public.banners
  for select to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

create policy "pages: public read published" on public.pages
  for select to anon, authenticated
  using (status = 'published');

create policy "blog_categories: public read" on public.blog_categories
  for select to anon, authenticated using (true);

create policy "blog_posts: public read published" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null and published_at <= now());

create policy "blog_post_tags: public read" on public.blog_post_tags
  for select to anon, authenticated
  using (exists (select 1 from public.blog_posts b where b.id = post_id));

create policy "blog_post_products: public read" on public.blog_post_products
  for select to anon, authenticated
  using (exists (select 1 from public.blog_posts b where b.id = post_id));

create policy "testimonials: public read active" on public.testimonials
  for select to anon, authenticated using (is_active);

-- -----------------------------------------------------------------------------
-- Configurações — leitura pública (nenhum segredo é armazenado nestas tabelas)
-- -----------------------------------------------------------------------------
create policy "site_settings: public read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "business_information: public read" on public.business_information
  for select to anon, authenticated using (true);
create policy "business_hours: public read" on public.business_hours
  for select to anon, authenticated using (true);
create policy "social_links: public read active" on public.social_links
  for select to anon, authenticated using (is_active);
create policy "whatsapp_settings: public read" on public.whatsapp_settings
  for select to anon, authenticated using (true);
create policy "seo_settings: public read" on public.seo_settings
  for select to anon, authenticated using (true);
create policy "redirects: public read active" on public.redirects
  for select to anon, authenticated using (is_active);

-- -----------------------------------------------------------------------------
-- Escrita pela equipe (editor+) — catálogo e conteúdo
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'brands', 'environments', 'products', 'product_images',
    'product_variant_options', 'product_variants', 'attributes', 'category_attributes',
    'product_specifications', 'tags', 'product_tags', 'product_environments',
    'product_relations', 'collections', 'collection_products', 'faqs',
    'banners', 'pages', 'blog_categories', 'blog_posts', 'blog_post_tags',
    'blog_post_products', 'testimonials', 'redirects'
  ] loop
    execute format(
      'create policy "%1$s: staff read all" on public.%1$I for select to authenticated using (public.is_staff())',
      t
    );
    execute format(
      'create policy "%1$s: staff insert" on public.%1$I for insert to authenticated with check (public.is_staff())',
      t
    );
    execute format(
      'create policy "%1$s: staff update" on public.%1$I for update to authenticated using (public.is_staff()) with check (public.is_staff())',
      t
    );
  end loop;
end;
$$;

-- Exclusão física: apenas admin+ em entidades principais (o painel usa soft delete)
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'brands', 'environments', 'products', 'banners', 'pages',
    'blog_categories', 'blog_posts', 'testimonials', 'redirects', 'attributes', 'tags', 'collections'
  ] loop
    execute format(
      'create policy "%1$s: admin delete" on public.%1$I for delete to authenticated using (public.has_min_role(''admin''))',
      t
    );
  end loop;

  -- Itens filhos podem ser removidos por editores (ex.: excluir imagem, remover variação)
  foreach t in array array[
    'product_images', 'product_variant_options', 'product_variants', 'category_attributes',
    'product_specifications', 'product_tags', 'product_environments', 'product_relations',
    'collection_products', 'faqs', 'blog_post_tags', 'blog_post_products'
  ] loop
    execute format(
      'create policy "%1$s: staff delete" on public.%1$I for delete to authenticated using (public.is_staff())',
      t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Configurações: somente admin+
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['site_settings', 'business_information', 'whatsapp_settings', 'seo_settings'] loop
    execute format(
      'create policy "%1$s: admin update" on public.%1$I for update to authenticated using (public.has_min_role(''admin'')) with check (public.has_min_role(''admin''))',
      t
    );
  end loop;

  foreach t in array array['business_hours', 'social_links'] loop
    execute format(
      'create policy "%1$s: admin manage" on public.%1$I for all to authenticated using (public.has_min_role(''admin'')) with check (public.has_min_role(''admin''))',
      t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Leads
-- -----------------------------------------------------------------------------
create policy "contacts: public insert" on public.contacts
  for insert to anon, authenticated
  with check (status = 'new' and internal_notes is null and handled_by is null);

create policy "contacts: staff read" on public.contacts
  for select to authenticated using (public.is_staff());

create policy "contacts: staff update" on public.contacts
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "contacts: admin delete" on public.contacts
  for delete to authenticated using (public.has_min_role('admin'));

create policy "quote_requests: staff read" on public.quote_requests
  for select to authenticated using (public.is_staff());

create policy "quote_requests: staff update" on public.quote_requests
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "quote_requests: admin delete" on public.quote_requests
  for delete to authenticated using (public.has_min_role('admin'));

create policy "quote_request_items: staff read" on public.quote_request_items
  for select to authenticated using (public.is_staff());

-- Registro atômico de lista de orçamento enviada (anônimo, sem dados pessoais)
create or replace function public.submit_quote_request(
  p_items jsonb,
  p_note text default null,
  p_session_id text default null,
  p_source_page text default null,
  p_utm jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_id uuid;
  item jsonb;
  item_count integer;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Lista inválida' using errcode = '22023';
  end if;
  item_count := jsonb_array_length(p_items);
  if item_count < 1 or item_count > 200 then
    raise exception 'Quantidade de itens inválida' using errcode = '22023';
  end if;

  insert into public.quote_requests (items_count, note, session_id, source_page, utm)
  values (
    item_count,
    left(p_note, 1000),
    left(p_session_id, 64),
    left(p_source_page, 500),
    case when jsonb_typeof(p_utm) = 'object' then p_utm else '{}'::jsonb end
  )
  returning id into request_id;

  for item in select * from jsonb_array_elements(p_items) loop
    insert into public.quote_request_items (quote_request_id, product_id, product_name, sku, variant_label, quantity, unit)
    select
      request_id,
      p.id,
      p.name,
      p.sku,
      left(item ->> 'variant_label', 200),
      greatest(least(coalesce((item ->> 'quantity')::numeric, 1), 100000), 0.01),
      p.unit
    from public.products p
    where p.id = (item ->> 'product_id')::uuid
      and p.status = 'published'
      and p.deleted_at is null;
  end loop;

  return request_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Analytics: inserção anônima, leitura apenas da equipe
-- -----------------------------------------------------------------------------
create policy "analytics_events: public insert" on public.analytics_events
  for insert to anon, authenticated with check (true);

create policy "analytics_events: staff read" on public.analytics_events
  for select to authenticated using (public.is_staff());

create policy "search_events: public insert" on public.search_events
  for insert to anon, authenticated with check (true);

create policy "search_events: staff read" on public.search_events
  for select to authenticated using (public.is_staff());

-- -----------------------------------------------------------------------------
-- Auditoria
-- -----------------------------------------------------------------------------
create policy "audit_logs: staff insert own" on public.audit_logs
  for insert to authenticated
  with check (public.is_staff() and user_id = auth.uid());

create policy "audit_logs: admin read" on public.audit_logs
  for select to authenticated using (public.has_min_role('admin'));

-- rate_limits: sem políticas => sem acesso direto (somente via check_rate_limit)
