create table if not exists public.remote_configs (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.remote_configs enable row level security;

drop policy if exists "remote_configs_read" on public.remote_configs;
create policy "remote_configs_read"
on public.remote_configs
for select
to anon, authenticated
using (true);

drop policy if exists "remote_configs_write" on public.remote_configs;
drop policy if exists "remote_configs_admin_insert" on public.remote_configs;
drop policy if exists "remote_configs_admin_update" on public.remote_configs;
drop policy if exists "remote_configs_admin_delete" on public.remote_configs;

-- Mark the web admin user once from the SQL Editor before using these policies:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where id = '<ADMIN_USER_UUID>'::uuid;

create policy "remote_configs_write"
on public.remote_configs
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.lut_package_download_stats (
  package_id text primary key,
  download_count integer not null default 0 check (download_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lut_package_download_stats enable row level security;

drop policy if exists "lut_package_download_stats_read" on public.lut_package_download_stats;
create policy "lut_package_download_stats_read"
on public.lut_package_download_stats
for select
to anon, authenticated
using (true);

create or replace function public.sync_lut_package_download_stats()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lut_package_download_stats (package_id, download_count)
  select
    package_item ->> 'id' as package_id,
    floor(50 + random() * 101)::integer as download_count
  from public.remote_configs remote_config
  cross join lateral jsonb_array_elements(
    coalesce(remote_config.config -> 'packages', '[]'::jsonb)
  ) package_item
  where remote_config.id = 'mivibe_lut_remote_config'
    and nullif(package_item ->> 'id', '') is not null
  on conflict (package_id) do nothing;
end;
$$;

create or replace function public.increment_lut_package_download(target_package_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count integer;
begin
  if nullif(target_package_id, '') is null then
    raise exception 'Package ID is required';
  end if;

  if not exists (
    select 1
    from public.remote_configs remote_config
    cross join lateral jsonb_array_elements(
      coalesce(remote_config.config -> 'packages', '[]'::jsonb)
    ) package_item
    where remote_config.id = 'mivibe_lut_remote_config'
      and package_item ->> 'id' = target_package_id
  ) then
    raise exception 'Unknown LUT package ID: %', target_package_id;
  end if;

  insert into public.lut_package_download_stats (package_id, download_count)
  values (target_package_id, floor(50 + random() * 101)::integer)
  on conflict (package_id) do nothing;

  update public.lut_package_download_stats
  set
    download_count = download_count + 1,
    updated_at = now()
  where package_id = target_package_id
  returning download_count into next_count;

  return next_count;
end;
$$;

grant execute on function public.sync_lut_package_download_stats() to anon, authenticated;
grant execute on function public.increment_lut_package_download(text) to anon, authenticated;

select public.sync_lut_package_download_stats();
