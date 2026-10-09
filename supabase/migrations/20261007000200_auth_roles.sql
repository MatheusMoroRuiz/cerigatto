-- =============================================================================
-- Perfis administrativos e papéis (RBAC)
-- O público não possui conta. Auth existe apenas para a equipe da Cerigatto.
-- =============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Helpers de autorização (SECURITY DEFINER para evitar recursão de RLS)
-- -----------------------------------------------------------------------------
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select ur.role from public.user_roles ur where ur.user_id = auth.uid()
$$;

-- Hierarquia: super_admin > admin > editor
create or replace function public.has_min_role(required public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select case ur.role
        when 'super_admin' then 3
        when 'admin' then 2
        when 'editor' then 1
      end
      from public.user_roles ur
      where ur.user_id = auth.uid()
    ) >= case required
      when 'super_admin' then 3
      when 'admin' then 2
      when 'editor' then 1
    end,
    false
  )
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_min_role('editor')
$$;

-- Cria perfil automaticamente quando um usuário é criado no Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garante que sempre exista ao menos um super_admin depois que o primeiro for criado
create or replace function public.prevent_last_super_admin_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'DELETE' and old.role = 'super_admin')
     or (tg_op = 'UPDATE' and old.role = 'super_admin' and new.role <> 'super_admin') then
    if (select count(*) from public.user_roles where role = 'super_admin') <= 1 then
      raise exception 'Não é possível remover o último super administrador.'
        using errcode = 'P0001';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger user_roles_keep_super_admin
  before update or delete on public.user_roles
  for each row execute function public.prevent_last_super_admin_removal();

-- Promove um usuário existente a super_admin (usado no setup inicial via SQL Editor)
create or replace function public.bootstrap_super_admin(admin_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  select id into target from auth.users where lower(email) = lower(admin_email);
  if target is null then
    raise exception 'Usuário % não encontrado em auth.users', admin_email;
  end if;
  insert into public.profiles (id, email) values (target, admin_email)
    on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (target, 'super_admin')
    on conflict (user_id) do update set role = 'super_admin';
end;
$$;

revoke execute on function public.bootstrap_super_admin(text) from public, anon, authenticated;
