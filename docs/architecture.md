# Architecture

## Application Shape

The repository builds one React 19 and Vite SPA. React Router maps four route groups:

- `/` renders the public landing page.
- `/privacy` and `/terms` render public legal pages.
- `/admin/*` renders the protected administration workspace.

Nginx serves the same built application for every route and falls back to `index.html` for client-side routing.

## Admin Boundary

`AdminPage` owns Supabase session discovery, email/password login, the `app_metadata.role=admin` UI gate, and logout. The full admin application and its React Query provider are mounted only after an authenticated admin session passes that gate.

React Query is not used by the public routes. Inside authenticated admin it uses:

- Query retry: `1`
- Query stale time: 30 seconds
- Mutation retry: `0`
- Server-state keys: `luts`, `categories`, and `remote-config` under the `admin` namespace
- Full query-cache clear after successful logout

Mutations update the relevant cache and invalidate remote config when LUT or category data changes. RLS, not the React route or query cache, is the authorization boundary.

## Data Sources

When Supabase is configured, the admin data layer reads and writes Supabase. The admin LUT query currently requests only rows where `is_active=true`; inactive database rows therefore do not appear in the admin list.

When Supabase is unconfigured, the data layer can seed categories, LUTs, and remote config in browser `localStorage` using `lut_admin_*` keys. This is a development fallback, not a usable offline admin mode: the login form is disabled while Supabase is unconfigured, so the admin UI cannot be entered normally.

LUT download URLs are built from `VITE_LUTS_BASE_URL` and the LUT storage key. Browser previews load LUT files from that public base URL.

## Remote Config Flow

The admin maintains one mobile configuration tree containing categories, packages, and LUTs. The published Supabase record is `remote_configs.id=mivibe_lut_remote_config`.

- **Save** validates and publishes the current in-memory tree.
- **Regroup LUTs** regenerates the tree from LUT/category data and immediately publishes it. This replaces manual package and tree edits.
- **Export JSON** downloads the current tree in the browser only.
- **Export Manifest** generates and downloads a separate active-LUT manifest in the browser only.

Neither export uploads a file or changes the published remote-config row.

## Known Implementation Risks

- Current create operations generate text IDs (`cat-<timestamp>` and `lut-<timestamp>`). They are incompatible with UUID-only ID columns unless the application or schema is aligned.
- The current LUT Supabase save payload persists name, slug, filename, storage key, category, active/free flags, intensity, and tags. Form/model fields such as description, sort order, preview URL, and generated download URL are not all included in that payload.
- Because the configured list fetches active LUTs only, inactive records cannot reliably be inspected, updated, or reactivated through the current UI.
- There are no automated tests or dedicated type-check script. `npm run lint` and `npm run build` are the available validation commands.
