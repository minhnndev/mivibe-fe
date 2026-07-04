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
create policy "remote_configs_write"
on public.remote_configs
for all
to authenticated
using (true)
with check (true);
