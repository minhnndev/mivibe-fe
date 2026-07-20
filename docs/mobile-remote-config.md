# Mobile Remote Config

## Published Contract

The mobile configuration is stored in `public.remote_configs` under the fixed row ID:

```text
mivibe_lut_remote_config
```

The row contains the JSON configuration in `config` and a database `updated_at` timestamp. The configuration tree contains its own `version`, `updatedAt`, categories, packages, and LUTs.

Every package object contains the required canonical access field:

```json
{
  "id": "pkg_example",
  "free": false,
  "lutIds": ["lut_example"]
}
```

`free` must be a boolean. `true` means the package can be accessed for free; `false` means access is paid. Mobile clients must use package-level `free` as the source of truth for package access and must not infer package access from LUT metadata. The existing per-LUT `is_free` field remains unchanged wherever it is already exposed, including LUT records and manifest exports.

RLS permits `anon` and `authenticated` clients to read this table so the mobile application can fetch the row with the Supabase anon key. Writes are reserved for authenticated users whose JWT has `app_metadata.role=admin`. Public read access is intentional; do not put secrets in the configuration JSON.

Mobile clients should request only the fixed row and select `config,updated_at`. Treat a missing row as an unpublished configuration, validate the JSON shape before applying it, and retain a previously valid configuration when a fetch or validation fails.

## Admin Operations

### Save

**Save** normalizes and publishes the tree currently shown in the Remote Config editor. It upserts the fixed Supabase row and updates its timestamp. Use Save for intentional category, package, ordering, metadata, and LUT assignment changes.

New packages created manually default to `free: false`. The package editor's Free toggle is the explicit control for manually organized packages. When the admin loads a legacy package without `free`, normalization supplies `free: false`; malformed non-boolean values fail validation.

### Regroup LUTs

**Regroup LUTs** rebuilds categories, packages, and LUT assignments from the LUT/category data and publishes the result immediately. It is destructive to manual remote-config organization: existing package edits and assignments are replaced by generated values.

A generated package has `free: true` only when every included source LUT has `is_free === true`. If any included LUT is paid or has a missing/non-true `is_free` value, the generated package has `free: false`.

The Supabase-backed LUT source currently returns active LUTs only, so a regroup in the configured admin is generated from that active-only list.

### Export JSON

**Export JSON** downloads the current remote-config tree to the operator's browser. It does not publish to Supabase or upload to a CDN.

### Export Manifest

**Export Manifest** creates a separate JSON manifest from active LUTs and categories and downloads it locally. It does not publish the remote-config row or host the manifest. Any CDN upload and mobile manifest rollout are separate operator actions.

## Operational Sequence

1. Confirm the LUT records, public download URLs, and category data are correct.
2. Open Remote Config and review the currently published tree.
3. Use Regroup only when generated packaging should replace manual organization.
4. Review validation errors and the complete tree.
5. Use Save to publish manual tree changes, or rely on Regroup's immediate publication when regeneration is intended.
6. Fetch the fixed row as an anonymous/mobile client and confirm the returned payload and asset URLs before rollout.

## Rollout

1. Deploy the admin contract and publish or regroup the remote config so every package includes boolean `free`.
2. Verify free and paid packages in the published fixed row before enabling package access decisions in mobile clients.
3. Roll out mobile handling that reads only package-level `free` for package access. During a staged rollout, clients should treat a missing or non-boolean value as `false` rather than granting free access.
4. No database migration is required because `free` is stored inside the existing JSON `config` column.

Publishing remote config does not upload `.cube` files. `VITE_LUTS_BASE_URL` must point to the public host where the referenced LUT storage keys are already available.
