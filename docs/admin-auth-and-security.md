# Admin Auth and Security

## Authentication and Authorization

The admin login uses Supabase Auth email/password authentication. A session is admitted to the admin UI only when the JWT-backed user metadata contains:

```json
{
  "role": "admin"
}
```

This value must be in `app_metadata`, not user-editable `user_metadata`. Provision it through a trusted Supabase administrative path, never from this browser application.

For an existing Auth user, the Supabase SQL Editor can assign the claim by UUID:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where id = '<ADMIN_USER_UUID>'::uuid;
```

Sign out and sign back in after changing the claim so the browser receives a new JWT.

The client role gate is not sufficient security. A user can bypass browser routing and call Supabase directly with the public anon key. RLS policies on `categories`, `luts`, and `remote_configs` are the real authorization boundary and must restrict writes to authenticated JWTs whose `app_metadata.role` is `admin`.

## Setup Order

The repository contains the reviewed setup artifacts; this documentation deliberately does not duplicate executable policy SQL.

1. Inspect the deployed `categories` and `luts` tables. Confirm their columns and ID types match the application before enabling CRUD.
2. Inspect all existing policies on those tables, especially anonymous or authenticated read policies. Decide whether mobile/public reads should include all categories and only active LUTs.
3. Run [`supabase_remote_config.sql`](../supabase_remote_config.sql). It creates `remote_configs`, enables RLS, permits public reads, and limits writes to the admin role claim.
4. Create the admin user in Supabase Auth and set `app_metadata.role` to `admin` using a trusted administrative mechanism.
5. Sign out and sign back in. Existing access tokens do not automatically gain a newly assigned role; reauthentication refreshes the JWT claim.
6. Run [`supabase_admin_rls.sql`](../supabase_admin_rls.sql). It replaces admin write policies on all three managed tables with role-checked policies.
7. Verify access using separate anonymous, authenticated non-admin, and authenticated admin sessions.

The admin RLS script deliberately does not create or replace public read policies for `categories` and `luts`. Existing public reads remain unchanged, so they must be verified rather than assumed safe.

## Verification Checklist

| Actor | Expected result |
| --- | --- |
| Anonymous/mobile client | Read the intended public LUT/category data and `mivibe_lut_remote_config`; cannot insert, update, or delete |
| Authenticated non-admin | Cannot enter the admin UI and cannot write through the Supabase API |
| Authenticated admin | Can read the admin data and perform permitted writes |

Also verify that inactive LUT visibility matches the mobile policy. The web admin currently queries active LUTs only regardless of broader admin read permission.

## Secrets

The Supabase URL and anon key are public browser configuration and still rely on RLS for safety. Never place a service-role key in any `VITE_*` variable, `.env` file delivered to the browser, Docker runtime environment for this image, `window.__MIVIBE_ENV__`, or CI build argument. A service-role key bypasses RLS.
