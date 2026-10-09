-- =============================================================================
-- Supabase Storage: buckets públicos de imagens (somente imagens raster)
-- Organização: {bucket}/{entidadeId}/{timestamp}-{nome-seguro}.{ext}
-- SVG não é aceito (pode conter scripts).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('categories', 'categories', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('brands', 'brands', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('banners', 'banners', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('blog', 'blog', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('site', 'site', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/x-icon', 'image/vnd.microsoft.icon'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura: buckets públicos servem arquivos pela URL pública sem precisar de
-- política de SELECT (evitamos listagem pública de objetos).

create policy "storage: staff upload images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('products', 'categories', 'brands', 'banners', 'blog', 'site')
    and public.is_staff()
    and (storage.foldername(name))[1] is not null
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'avif', 'ico')
  );

create policy "storage: staff read images" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('products', 'categories', 'brands', 'banners', 'blog', 'site')
    and public.is_staff()
  );

create policy "storage: staff update images" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('products', 'categories', 'brands', 'banners', 'blog', 'site')
    and public.is_staff()
  );

create policy "storage: staff delete images" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('products', 'categories', 'brands', 'banners', 'blog', 'site')
    and public.is_staff()
  );
