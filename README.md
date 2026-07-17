# Mivibe Studio Landing

Mivibe Studio Landing is one Vite-powered React single-page application (SPA). It serves the public landing and legal pages together with an authenticated LUT administration workspace.

## Routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Marketing landing page | Public |
| `/privacy` | Privacy policy | Public |
| `/terms` | Terms of service | Public |
| `/admin/*` | LUT, category, and mobile remote-config administration | Supabase email/password session with `app_metadata.role=admin` |

The client-side admin role check improves the user experience, but it is not the authorization boundary. Supabase Row Level Security (RLS) must enforce every read and write policy.

## Local Development

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173`. The admin is at `http://localhost:5173/admin`.

Set the three public client variables in `.env.local` as needed:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_LUTS_BASE_URL`

Never expose a Supabase service-role key in a Vite variable, browser bundle, runtime `env.js`, or repository file. Admin login is disabled when Supabase is unconfigured.

Useful commands:

```bash
npm run lint
npm run build
npm run preview
```

There is currently no test script or standalone type-check script.

## Supabase Setup

Do not copy database policies from old README versions. Use and review the repository SQL files in this order:

1. Verify the existing `categories` and `luts` schema and their intended public read policies.
2. Run `supabase_remote_config.sql` to create and protect `remote_configs`.
3. Create the admin Auth user and provision `app_metadata.role` as `admin` through a trusted Supabase administrative path.
4. Sign out and back in so the refreshed JWT contains the role claim.
5. Run `supabase_admin_rls.sql` to install admin-only write policies for `categories`, `luts`, and `remote_configs`.
6. Test both anonymous mobile reads and authenticated admin writes before production use.

The scripts intentionally leave existing public read policies for `categories` and `luts` unchanged. Verify those policies explicitly; their presence and scope cannot be assumed. See [Admin Auth and Security](docs/admin-auth-and-security.md).

## Documentation

- [Documentation index](docs/README.md)
- [Architecture](docs/architecture.md)
- [Admin Auth and Security](docs/admin-auth-and-security.md)
- [Mobile Remote Config](docs/mobile-remote-config.md)
- [Environment and Deployment](docs/environment-and-deployment.md)

## Current Limitations

- The Supabase-backed admin LUT list fetches active LUTs only. Inactive rows are not available to the current list UI.
- Generated CRUD IDs are text values such as `cat-<timestamp>` and `lut-<timestamp>`. A UUID-only database schema will reject new records.
- The LUT edit form exposes fields that the current Supabase save payload does not all persist. Confirm the schema and persistence path before relying on edits.
- Both `package-lock.json` and `yarn.lock` are tracked, but npm and `package-lock.json` are canonical in CI and the Docker build.
- No automated tests or dedicated type-check command are configured.
