-- Run after assigning {"role":"admin"} to the web admin user's app_metadata.
-- Existing public read policies remain unchanged.

alter table public.categories enable row level security;
alter table public.luts enable row level security;
alter table public.remote_configs enable row level security;
alter table public.lut_package_download_stats enable row level security;

drop policy if exists "admin_all_categories" on public.categories;
create policy "admin_all_categories"
on public.categories
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admin_all_luts" on public.luts;
create policy "admin_all_luts"
on public.luts
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "remote_configs_write" on public.remote_configs;
drop policy if exists "remote_configs_admin_insert" on public.remote_configs;
drop policy if exists "remote_configs_admin_update" on public.remote_configs;
drop policy if exists "remote_configs_admin_delete" on public.remote_configs;
create policy "remote_configs_write"
on public.remote_configs
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "lut_package_download_stats_read" on public.lut_package_download_stats;
create policy "lut_package_download_stats_read"
on public.lut_package_download_stats
for select
to anon, authenticated
using (true);
