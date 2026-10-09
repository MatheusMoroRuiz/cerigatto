-- =============================================================================
-- Funções do catálogo: filtros, busca (FTS + trigramas, sem acentos),
-- facetas, autocomplete, relacionados e estatísticas administrativas.
--
-- As funções públicas são SECURITY INVOKER: o RLS das tabelas continua valendo.
-- Além disso filtram explicitamente status = 'published' para que, mesmo um
-- administrador logado, veja no site apenas o que é público.
-- =============================================================================

-- Converte texto livre em tsquery com prefixo (ex.: "porcel 60" -> 'porcel':* & '60':*)
create or replace function public.prefix_tsquery(p_query text)
returns tsquery
language sql
immutable
set search_path = ''
as $$
  select case
    when string_agg(word, '') is null then null
    else to_tsquery('public.pt_unaccent', string_agg(word || ':*', ' & '))
  end
  from (
    select w as word
    from regexp_split_to_table(public.normalize_search_term(coalesce(p_query, '')), '[^a-z0-9]+') as w
    where w <> ''
    limit 8
  ) words
$$;

-- IDs de todas as categorias descendentes (inclui a própria)
create or replace function public.category_descendant_ids(p_category_id uuid)
returns setof uuid
language sql
stable
set search_path = ''
as $$
  with recursive tree as (
    select c.id from public.categories c
    where c.id = p_category_id and c.deleted_at is null
    union all
    select c.id from public.categories c
    join tree t on c.parent_id = t.id
    where c.deleted_at is null
  )
  select id from tree
$$;

-- Núcleo compartilhado: produtos públicos que atendem aos filtros, com relevância
create or replace function public.catalog_filter(
  p_query text default null,
  p_category_slug text default null,
  p_brand_slugs text[] default null,
  p_environment_slug text default null,
  p_on_sale boolean default false,
  p_is_new boolean default false,
  p_availability text[] default null,
  p_attributes jsonb default '{}'::jsonb,
  p_price_min numeric default null,
  p_price_max numeric default null,
  p_ignore_brand_filter boolean default false,
  p_ignore_attribute_filter boolean default false
)
returns table (product_id uuid, rank real)
language plpgsql
stable
set search_path = public, extensions
as $$
declare
  q_norm text := nullif(public.normalize_search_term(coalesce(p_query, '')), '');
  q_ts tsquery;
  q_prefix tsquery;
  v_category_id uuid;
begin
  if q_norm is not null then
    q_ts := websearch_to_tsquery('public.pt_unaccent', p_query);
    q_prefix := public.prefix_tsquery(p_query);
  end if;

  if p_category_slug is not null then
    select c.id into v_category_id from public.categories c
    where c.slug = p_category_slug and c.is_active and c.deleted_at is null;
    if v_category_id is null then
      return;
    end if;
  end if;

  return query
  select
    p.id,
    (case when q_norm is null then 0
      else
        ts_rank_cd(p.search_vector, q_ts) * 4
        + coalesce(ts_rank_cd(p.search_vector, q_prefix), 0) * 2
        + word_similarity(q_norm, p.search_text)
        + case when p.sku is not null and lower(p.sku) = q_norm then 10 else 0 end
     end)::real as rank
  from public.products p
  where p.status = 'published'
    and p.deleted_at is null
    and (
      q_norm is null
      or p.search_vector @@ q_ts
      or (q_prefix is not null and p.search_vector @@ q_prefix)
      or q_norm <% p.search_text
      or (p.sku is not null and lower(p.sku) like q_norm || '%')
    )
    and (v_category_id is null or p.category_id in (select public.category_descendant_ids(v_category_id)))
    and (
      p_ignore_brand_filter
      or p_brand_slugs is null
      or cardinality(p_brand_slugs) = 0
      or exists (
        select 1 from public.brands b
        where b.id = p.brand_id and b.slug = any (p_brand_slugs) and b.is_active and b.deleted_at is null
      )
    )
    and (
      p_environment_slug is null
      or exists (
        select 1 from public.product_environments pe
        join public.environments e on e.id = pe.environment_id
        where pe.product_id = p.id and e.slug = p_environment_slug
      )
    )
    and (not coalesce(p_on_sale, false) or public.sale_active(p))
    and (not coalesce(p_is_new, false) or p.is_new)
    and (
      p_availability is null or cardinality(p_availability) = 0
      or p.availability::text = any (p_availability)
    )
    and (
      p_ignore_attribute_filter
      or p_attributes is null
      or p_attributes = '{}'::jsonb
      or not exists (
        -- Para cada atributo filtrado, o produto precisa ter ao menos um dos valores
        select 1
        from jsonb_each(p_attributes) as f(attr_slug, attr_values)
        where jsonb_typeof(f.attr_values) = 'array'
          and jsonb_array_length(f.attr_values) > 0
          and not exists (
            select 1 from public.product_specifications ps
            join public.attributes a on a.id = ps.attribute_id
            where ps.product_id = p.id
              and a.slug = f.attr_slug
              and ps.value_slug in (select jsonb_array_elements_text(f.attr_values))
          )
      )
    )
    and (
      (p_price_min is null and p_price_max is null)
      or (
        p.price_display = 'show'
        and p.price is not null
        and (case when public.sale_active(p) and p.sale_price is not null then p.sale_price else p.price end)
          between coalesce(p_price_min, 0) and coalesce(p_price_max, 99999999)
      )
    );
end;
$$;

-- Página de produtos (retorna linhas de products para permitir embeds do PostgREST)
create or replace function public.catalog_products(
  p_query text default null,
  p_category_slug text default null,
  p_brand_slugs text[] default null,
  p_environment_slug text default null,
  p_on_sale boolean default false,
  p_is_new boolean default false,
  p_availability text[] default null,
  p_attributes jsonb default '{}'::jsonb,
  p_price_min numeric default null,
  p_price_max numeric default null,
  p_sort text default 'relevance',
  p_limit integer default 24,
  p_offset integer default 0
)
returns setof public.products
language sql
stable
set search_path = ''
as $$
  select p.*
  from public.catalog_filter(
    p_query, p_category_slug, p_brand_slugs, p_environment_slug, p_on_sale, p_is_new,
    p_availability, p_attributes, p_price_min, p_price_max
  ) f
  join public.products p on p.id = f.product_id
  order by
    case when p_sort = 'relevance' and p_query is not null then f.rank end desc nulls last,
    case when p_sort = 'name_asc' then p.name end asc,
    case when p_sort = 'name_desc' then p.name end desc,
    case when p_sort = 'price_asc' then
      case when p.price_display = 'show' then coalesce(p.sale_price, p.price) end end asc nulls last,
    case when p_sort = 'price_desc' then
      case when p.price_display = 'show' then coalesce(p.sale_price, p.price) end end desc nulls last,
    case when p_sort = 'newest' then p.published_at end desc nulls last,
    p.is_featured desc,
    p.published_at desc nulls last,
    p.name asc,
    p.id
  limit least(greatest(coalesce(p_limit, 24), 1), 96)
  offset greatest(coalesce(p_offset, 0), 0)
$$;

create or replace function public.catalog_count(
  p_query text default null,
  p_category_slug text default null,
  p_brand_slugs text[] default null,
  p_environment_slug text default null,
  p_on_sale boolean default false,
  p_is_new boolean default false,
  p_availability text[] default null,
  p_attributes jsonb default '{}'::jsonb,
  p_price_min numeric default null,
  p_price_max numeric default null
)
returns bigint
language sql
stable
set search_path = ''
as $$
  select count(*)
  from public.catalog_filter(
    p_query, p_category_slug, p_brand_slugs, p_environment_slug, p_on_sale, p_is_new,
    p_availability, p_attributes, p_price_min, p_price_max
  )
$$;

-- Facetas dinâmicas para a barra de filtros
create or replace function public.catalog_facets(
  p_query text default null,
  p_category_slug text default null,
  p_brand_slugs text[] default null,
  p_environment_slug text default null,
  p_on_sale boolean default false,
  p_is_new boolean default false,
  p_availability text[] default null,
  p_attributes jsonb default '{}'::jsonb
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with
  base as (
    select product_id from public.catalog_filter(
      p_query, p_category_slug, p_brand_slugs, p_environment_slug, p_on_sale, p_is_new,
      p_availability, p_attributes, null, null, false, false
    )
  ),
  without_brand as (
    select product_id from public.catalog_filter(
      p_query, p_category_slug, p_brand_slugs, p_environment_slug, p_on_sale, p_is_new,
      p_availability, p_attributes, null, null, true, false
    )
  ),
  without_attributes as (
    select product_id from public.catalog_filter(
      p_query, p_category_slug, p_brand_slugs, p_environment_slug, p_on_sale, p_is_new,
      p_availability, p_attributes, null, null, false, true
    )
  ),
  brand_facet as (
    select b.slug, b.name, count(*) as total
    from without_brand wb
    join public.products p on p.id = wb.product_id
    join public.brands b on b.id = p.brand_id and b.is_active and b.deleted_at is null
    group by b.slug, b.name
  ),
  category_facet as (
    select c.slug, c.name, count(*) as total
    from base
    join public.products p on p.id = base.product_id
    join public.categories c on c.id = p.category_id and c.is_active and c.deleted_at is null
    group by c.slug, c.name
  ),
  attribute_facet as (
    select a.slug as attr_slug, a.name as attr_name, a.unit, a.sort_order,
           ps.value_slug, min(ps.value) as value_label, count(distinct ps.product_id) as total
    from without_attributes wa
    join public.product_specifications ps on ps.product_id = wa.product_id
    join public.attributes a on a.id = ps.attribute_id and a.is_filterable
    group by a.slug, a.name, a.unit, a.sort_order, ps.value_slug
  ),
  availability_facet as (
    select p.availability::text as value, count(*) as total
    from base join public.products p on p.id = base.product_id
    group by p.availability
  ),
  price_range as (
    select
      min(case when public.sale_active(p) and p.sale_price is not null then p.sale_price else p.price end) as min_price,
      max(case when public.sale_active(p) and p.sale_price is not null then p.sale_price else p.price end) as max_price
    from base join public.products p on p.id = base.product_id
    where p.price_display = 'show' and p.price is not null
  )
  select jsonb_build_object(
    'brands', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'name', name, 'count', total) order by name) from brand_facet), '[]'::jsonb),
    'categories', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'name', name, 'count', total) order by name) from category_facet), '[]'::jsonb),
    'attributes', coalesce((
      select jsonb_agg(jsonb_build_object('slug', attr_slug, 'name', attr_name, 'unit', unit, 'values', vals) order by sort_order, attr_name)
      from (
        select attr_slug, attr_name, unit, sort_order,
               jsonb_agg(jsonb_build_object('slug', value_slug, 'label', value_label, 'count', total) order by value_label) as vals
        from attribute_facet
        group by attr_slug, attr_name, unit, sort_order
      ) grouped
    ), '[]'::jsonb),
    'availability', coalesce((select jsonb_agg(jsonb_build_object('value', value, 'count', total)) from availability_facet), '[]'::jsonb),
    'price', (select jsonb_build_object('min', min_price, 'max', max_price) from price_range)
  )
$$;

-- Autocomplete: produtos, categorias e marcas
create or replace function public.search_suggestions(p_query text, p_limit integer default 6)
returns jsonb
language sql
stable
set search_path = public, extensions
as $$
  with q as (
    select public.normalize_search_term(coalesce(p_query, '')) as term
  ),
  products_found as (
    select p.id, p.name, p.slug, p.sku, b.name as brand_name,
      (select pi.url from public.product_images pi
        where pi.product_id = p.id order by pi.is_cover desc, pi.sort_order limit 1) as image_url,
      f.rank
    from public.catalog_filter(p_query) f
    join public.products p on p.id = f.product_id
    left join public.brands b on b.id = p.brand_id
    order by f.rank desc, p.name
    limit least(greatest(coalesce(p_limit, 6), 1), 12)
  ),
  categories_found as (
    select c.name, c.slug
    from public.categories c, q
    where c.is_active and c.deleted_at is null and q.term <> ''
      and (public.normalize_search_term(c.name) like '%' || q.term || '%' or q.term <% public.normalize_search_term(c.name))
    order by word_similarity(q.term, public.normalize_search_term(c.name)) desc, c.name
    limit 4
  ),
  brands_found as (
    select b.name, b.slug
    from public.brands b, q
    where b.is_active and b.deleted_at is null and q.term <> ''
      and (public.normalize_search_term(b.name) like '%' || q.term || '%' or q.term <% public.normalize_search_term(b.name))
    order by word_similarity(q.term, public.normalize_search_term(b.name)) desc, b.name
    limit 4
  )
  select jsonb_build_object(
    'products', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id, 'name', name, 'slug', slug, 'sku', sku, 'brand', brand_name, 'image_url', image_url
    ) order by rank desc, name) from products_found), '[]'::jsonb),
    'categories', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'slug', slug)) from categories_found), '[]'::jsonb),
    'brands', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'slug', slug)) from brands_found), '[]'::jsonb)
  )
$$;

-- Produtos relacionados por categoria, categoria-mãe, marca, tags e ambientes
create or replace function public.related_products(p_product_id uuid, p_limit integer default 8)
returns setof public.products
language sql
stable
set search_path = ''
as $$
  with source as (
    select p.id, p.category_id, p.brand_id, c.parent_id as parent_category_id
    from public.products p
    left join public.categories c on c.id = p.category_id
    where p.id = p_product_id
  ),
  scored as (
    select p.id,
      (case when p.category_id = s.category_id then 4 else 0 end)
      + (case when s.parent_category_id is not null and c.parent_id = s.parent_category_id then 1 else 0 end)
      + (case when p.brand_id = s.brand_id then 2 else 0 end)
      + (select count(*) from public.product_tags t1
          join public.product_tags t2 on t2.tag_id = t1.tag_id
          where t1.product_id = s.id and t2.product_id = p.id)
      + (select count(*) from public.product_environments e1
          join public.product_environments e2 on e2.environment_id = e1.environment_id
          where e1.product_id = s.id and e2.product_id = p.id) as score
    from public.products p
    cross join source s
    left join public.categories c on c.id = p.category_id
    where p.id <> s.id
      and p.status = 'published'
      and p.deleted_at is null
      and p.availability <> 'discontinued'
  )
  select p.*
  from scored
  join public.products p on p.id = scored.id
  where scored.score > 0
  order by scored.score desc, p.is_featured desc, p.name
  limit least(greatest(coalesce(p_limit, 8), 1), 24)
$$;

-- Mais acessados (agrega analytics sem expor eventos individuais)
create or replace function public.most_viewed_product_ids(p_days integer default 30, p_limit integer default 8)
returns table (product_id uuid, views bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select e.product_id, count(*) as views
  from public.analytics_events e
  join public.products p on p.id = e.product_id
  where e.event_name = 'product_view'
    and e.created_at >= now() - make_interval(days => least(greatest(p_days, 1), 365))
    and p.status = 'published'
    and p.deleted_at is null
  group by e.product_id
  order by views desc
  limit least(greatest(coalesce(p_limit, 8), 1), 48)
$$;

-- -----------------------------------------------------------------------------
-- Dashboard administrativo (somente equipe)
-- -----------------------------------------------------------------------------
create or replace function public.admin_dashboard(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  since timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365));
  result jsonb;
begin
  if not public.is_staff() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'products_total', (select count(*) from public.products where deleted_at is null),
    'products_published', (select count(*) from public.products where deleted_at is null and status = 'published'),
    'products_draft', (select count(*) from public.products where deleted_at is null and status = 'draft'),
    'products_archived', (select count(*) from public.products where deleted_at is null and status = 'archived'),
    'categories_total', (select count(*) from public.categories where deleted_at is null),
    'brands_total', (select count(*) from public.brands where deleted_at is null),
    'contacts_period', (select count(*) from public.contacts where created_at >= since),
    'contacts_new', (select count(*) from public.contacts where status = 'new'),
    'quotes_period', (select count(*) from public.quote_requests where created_at >= since),
    'whatsapp_clicks', (select count(*) from public.analytics_events where event_name = 'whatsapp_click' and created_at >= since),
    'product_views', (select count(*) from public.analytics_events where event_name = 'product_view' and created_at >= since),
    'searches', (select count(*) from public.search_events where created_at >= since),
    'top_viewed', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select p.id, p.name, p.slug, count(*) as total
        from public.analytics_events e join public.products p on p.id = e.product_id
        where e.event_name = 'product_view' and e.created_at >= since
        group by p.id, p.name, p.slug order by total desc limit 10
      ) t), '[]'::jsonb),
    'top_consulted', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select p.id, p.name, p.slug, count(*) as total
        from public.analytics_events e join public.products p on p.id = e.product_id
        where e.event_name in ('whatsapp_click', 'quote_list_add') and e.created_at >= since
        group by p.id, p.name, p.slug order by total desc limit 10
      ) t), '[]'::jsonb),
    'top_searches', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select normalized_query as term, count(*) as total, round(avg(results_count))::int as avg_results
        from public.search_events where created_at >= since
        group by normalized_query order by total desc limit 15
      ) t), '[]'::jsonb),
    'zero_result_searches', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select normalized_query as term, count(*) as total
        from public.search_events where created_at >= since and results_count = 0
        group by normalized_query order by total desc limit 10
      ) t), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select page_path as path, count(*) as total
        from public.analytics_events
        where event_name = 'page_view' and created_at >= since and page_path is not null
        group by page_path order by total desc limit 10
      ) t), '[]'::jsonb),
    'whatsapp_by_source', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select coalesce(utm_source, case when referrer is null then 'direto' else 'referência' end) as source,
               count(*) as total
        from public.analytics_events
        where event_name = 'whatsapp_click' and created_at >= since
        group by 1 order by total desc limit 10
      ) t), '[]'::jsonb),
    'daily_whatsapp', coalesce((
      select jsonb_agg(row_to_json(t) order by t.day) from (
        select (created_at at time zone 'America/Sao_Paulo')::date as day, count(*) as total
        from public.analytics_events
        where event_name = 'whatsapp_click' and created_at >= since
        group by 1
      ) t), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke execute on function public.admin_dashboard(integer) from public, anon;
