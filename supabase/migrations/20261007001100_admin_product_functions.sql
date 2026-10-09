-- =============================================================================
-- Funções administrativas transacionais (SECURITY INVOKER: o RLS se aplica).
-- O painel envia o produto completo em JSON; tudo é gravado em uma única
-- transação — nada fica pela metade se algum item for inválido.
-- =============================================================================

create or replace function public.admin_save_product(p jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := (p ->> 'id')::uuid;
  v_user uuid := auth.uid();
  v_group jsonb;
  v_value jsonb;
  v_option_id uuid;
  v_tag text;
  v_tag_id uuid;
  v_index integer;
begin
  if not public.is_staff() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;
  if v_id is null then
    raise exception 'ID do produto ausente' using errcode = '22023';
  end if;

  insert into public.products as t (
    id, name, slug, sku, short_description, description, brand_id, category_id,
    status, is_featured, is_new, is_on_sale, is_recommended, sale_starts_at, sale_ends_at, sale_label,
    price_display, price, sale_price, unit, availability,
    manufacturer, model, dimensions, weight_kg, warranty, package_contents, notes, video_url,
    cta_label, whatsapp_number, seo_title, seo_description, canonical_url, og_image_url,
    created_by, updated_by
  ) values (
    v_id, p ->> 'name', p ->> 'slug', nullif(p ->> 'sku', ''), p ->> 'short_description', p ->> 'description',
    (p ->> 'brand_id')::uuid, (p ->> 'category_id')::uuid,
    (p ->> 'status')::public.content_status,
    coalesce((p ->> 'is_featured')::boolean, false), coalesce((p ->> 'is_new')::boolean, false),
    coalesce((p ->> 'is_on_sale')::boolean, false), coalesce((p ->> 'is_recommended')::boolean, false),
    (p ->> 'sale_starts_at')::timestamptz, (p ->> 'sale_ends_at')::timestamptz, p ->> 'sale_label',
    (p ->> 'price_display')::public.price_display, (p ->> 'price')::numeric, (p ->> 'sale_price')::numeric,
    coalesce(nullif(p ->> 'unit', ''), 'unidade'), (p ->> 'availability')::public.availability_status,
    p ->> 'manufacturer', p ->> 'model', p ->> 'dimensions', (p ->> 'weight_kg')::numeric, p ->> 'warranty',
    p ->> 'package_contents', p ->> 'notes', p ->> 'video_url',
    p ->> 'cta_label', p ->> 'whatsapp_number', p ->> 'seo_title', p ->> 'seo_description',
    p ->> 'canonical_url', p ->> 'og_image_url',
    v_user, v_user
  )
  on conflict (id) do update set
    name = excluded.name, slug = excluded.slug, sku = excluded.sku,
    short_description = excluded.short_description, description = excluded.description,
    brand_id = excluded.brand_id, category_id = excluded.category_id, status = excluded.status,
    is_featured = excluded.is_featured, is_new = excluded.is_new, is_on_sale = excluded.is_on_sale,
    is_recommended = excluded.is_recommended, sale_starts_at = excluded.sale_starts_at,
    sale_ends_at = excluded.sale_ends_at, sale_label = excluded.sale_label,
    price_display = excluded.price_display, price = excluded.price, sale_price = excluded.sale_price,
    unit = excluded.unit, availability = excluded.availability, manufacturer = excluded.manufacturer,
    model = excluded.model, dimensions = excluded.dimensions, weight_kg = excluded.weight_kg,
    warranty = excluded.warranty, package_contents = excluded.package_contents, notes = excluded.notes,
    video_url = excluded.video_url, cta_label = excluded.cta_label, whatsapp_number = excluded.whatsapp_number,
    seo_title = excluded.seo_title, seo_description = excluded.seo_description,
    canonical_url = excluded.canonical_url, og_image_url = excluded.og_image_url,
    updated_by = v_user,
    deleted_at = null;

  -- Imagens (a ordem do array define sort_order; apenas uma capa)
  delete from public.product_images where product_id = v_id;
  insert into public.product_images (product_id, url, storage_path, alt, width, height, is_cover, sort_order)
  select v_id, img ->> 'url', img ->> 'storage_path', nullif(img ->> 'alt', ''),
         (img ->> 'width')::integer, (img ->> 'height')::integer,
         coalesce((img ->> 'is_cover')::boolean, false) and ord = (
           select min(o2) from jsonb_array_elements(coalesce(p -> 'images', '[]'::jsonb)) with ordinality as x(i2, o2)
           where coalesce((i2 ->> 'is_cover')::boolean, false)
         ),
         ord - 1
  from jsonb_array_elements(coalesce(p -> 'images', '[]'::jsonb)) with ordinality as e(img, ord);

  -- Garante uma capa quando houver imagens
  update public.product_images set is_cover = true
  where id = (select id from public.product_images where product_id = v_id order by sort_order limit 1)
    and not exists (select 1 from public.product_images where product_id = v_id and is_cover);

  -- Variações
  delete from public.product_variant_options where product_id = v_id;
  v_index := 0;
  for v_group in select * from jsonb_array_elements(coalesce(p -> 'variant_groups', '[]'::jsonb)) loop
    insert into public.product_variant_options (product_id, name, is_required, sort_order)
    values (v_id, v_group ->> 'name', coalesce((v_group ->> 'is_required')::boolean, true), v_index)
    returning id into v_option_id;
    insert into public.product_variants (product_id, option_id, label, sku, price, sale_price, availability, is_active, sort_order)
    select v_id, v_option_id, val ->> 'label', nullif(val ->> 'sku', ''), (val ->> 'price')::numeric,
           (val ->> 'sale_price')::numeric, (nullif(val ->> 'availability', ''))::public.availability_status,
           coalesce((val ->> 'is_active')::boolean, true), ord - 1
    from jsonb_array_elements(coalesce(v_group -> 'values', '[]'::jsonb)) with ordinality as e(val, ord);
    v_index := v_index + 1;
  end loop;

  -- Especificações
  delete from public.product_specifications where product_id = v_id;
  insert into public.product_specifications (product_id, attribute_id, label, value, sort_order)
  select v_id, (s ->> 'attribute_id')::uuid, nullif(s ->> 'label', ''), s ->> 'value', ord - 1
  from jsonb_array_elements(coalesce(p -> 'specifications', '[]'::jsonb)) with ordinality as e(s, ord)
  where coalesce(trim(s ->> 'value'), '') <> '';

  -- Tags (cria as que não existem)
  delete from public.product_tags where product_id = v_id;
  for v_tag in select distinct trim(t) from jsonb_array_elements_text(coalesce(p -> 'tags', '[]'::jsonb)) as t where trim(t) <> '' loop
    insert into public.tags (name, slug) values (v_tag, public.slugify(v_tag))
    on conflict (slug) do update set name = public.tags.name
    returning id into v_tag_id;
    insert into public.product_tags (product_id, tag_id) values (v_id, v_tag_id) on conflict do nothing;
  end loop;

  -- Ambientes
  delete from public.product_environments where product_id = v_id;
  insert into public.product_environments (product_id, environment_id)
  select distinct v_id, (x)::uuid from jsonb_array_elements_text(coalesce(p -> 'environment_ids', '[]'::jsonb)) as x;

  -- Produtos que combinam
  delete from public.product_relations where product_id = v_id and relation_type = 'combines';
  insert into public.product_relations (product_id, related_product_id, relation_type, sort_order)
  select v_id, (x)::uuid, 'combines', ord - 1
  from jsonb_array_elements_text(coalesce(p -> 'related_ids', '[]'::jsonb)) with ordinality as e(x, ord)
  where (x)::uuid <> v_id
  on conflict do nothing;

  -- FAQ do produto
  delete from public.faqs where product_id = v_id;
  insert into public.faqs (product_id, question, answer, sort_order)
  select v_id, f ->> 'question', f ->> 'answer', ord - 1
  from jsonb_array_elements(coalesce(p -> 'faqs', '[]'::jsonb)) with ordinality as e(f, ord)
  where coalesce(trim(f ->> 'question'), '') <> '' and coalesce(trim(f ->> 'answer'), '') <> '';

  -- Reprocessa o documento de busca com tags/especificações finais
  update public.products set search_text = search_text where id = v_id;

  return v_id;
end;
$$;

revoke execute on function public.admin_save_product(jsonb) from public, anon;

-- Duplicar produto (cópia em rascunho, com novo slug/SKU)
create or replace function public.admin_duplicate_product(p_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_new uuid := gen_random_uuid();
  v_slug text;
  v_option record;
  v_new_option uuid;
begin
  if not public.is_staff() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  select slug || '-copia' into v_slug from public.products where id = p_id;
  if v_slug is null then
    raise exception 'Produto não encontrado' using errcode = 'P0001';
  end if;
  while exists (select 1 from public.products where slug = v_slug) loop
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.products (
    id, name, slug, sku, short_description, description, brand_id, category_id, status,
    is_featured, is_new, is_on_sale, is_recommended, sale_starts_at, sale_ends_at, sale_label,
    price_display, price, sale_price, unit, availability, manufacturer, model, dimensions, weight_kg,
    warranty, package_contents, notes, video_url, cta_label, whatsapp_number,
    seo_title, seo_description, created_by, updated_by
  )
  select v_new, name || ' (cópia)', v_slug, null, short_description, description, brand_id, category_id, 'draft',
         false, is_new, false, false, null, null, null,
         price_display, price, sale_price, unit, availability, manufacturer, model, dimensions, weight_kg,
         warranty, package_contents, notes, video_url, cta_label, whatsapp_number,
         null, null, auth.uid(), auth.uid()
  from public.products where id = p_id;

  insert into public.product_images (product_id, url, storage_path, alt, width, height, is_cover, sort_order)
  select v_new, url, null, alt, width, height, is_cover, sort_order from public.product_images where product_id = p_id;

  for v_option in select * from public.product_variant_options where product_id = p_id order by sort_order loop
    insert into public.product_variant_options (product_id, name, is_required, sort_order)
    values (v_new, v_option.name, v_option.is_required, v_option.sort_order)
    returning id into v_new_option;
    insert into public.product_variants (product_id, option_id, label, sku, price, sale_price, availability, is_active, sort_order)
    select v_new, v_new_option, label, null, price, sale_price, availability, is_active, sort_order
    from public.product_variants where option_id = v_option.id;
  end loop;

  insert into public.product_specifications (product_id, attribute_id, label, value, sort_order)
  select v_new, attribute_id, label, value, sort_order from public.product_specifications where product_id = p_id;
  insert into public.product_tags (product_id, tag_id) select v_new, tag_id from public.product_tags where product_id = p_id;
  insert into public.product_environments (product_id, environment_id)
  select v_new, environment_id from public.product_environments where product_id = p_id;

  return v_new;
end;
$$;

revoke execute on function public.admin_duplicate_product(uuid) from public, anon;
