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
