# Environment and Deployment

## Public Environment

The application recognizes three browser-visible variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_LUTS_BASE_URL` | Public base URL used to construct LUT download paths |

For each value, runtime configuration in `window.__MIVIBE_ENV__` takes precedence over Vite build-time environment values. This allows one built image to be configured per environment without rebuilding it.

All `VITE_*` values are public. Never provide a Supabase service-role key.

## Local Build

Use npm because CI and Docker both use `package-lock.json`:

```bash
npm ci
cp .env.example .env.local
npm run lint
npm run build
```

Vite reads `.env.local` for local build-time values. The repository also tracks `yarn.lock`, but yarn is not the canonical install path. There is no test or standalone type-check script.

## Docker Runtime

The Dockerfile builds the SPA with Node.js 20, then serves `dist` from Nginx. At container startup, `envsubst` renders `/usr/share/nginx/html/env.template.js` to `/usr/share/nginx/html/env.js` from the container environment.

Provide all required runtime values to the container:

```bash
docker run --rm -p 8080:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-anon-key \
  -e VITE_LUTS_BASE_URL=https://your-lut-host.example \
  ghcr.io/minhnndev/mivibe-fe:latest
```

Check readiness with `GET /healthz`; Nginx returns `200` with `ok`.

## Nginx Behavior

- Unknown application routes fall back to `/index.html`, enabling direct navigation to SPA routes such as `/admin` and `/privacy`.
- `/env.js` is served with `Cache-Control: no-store` so runtime values are not retained across deployments.
- Fingerprinted `/assets/` files are cached publicly for one year with `immutable`.
- `/healthz` is handled directly by Nginx and is not an application health check for Supabase or the LUT host.

## CI/CD

A push to `main` runs `.github/workflows/publish.yml`:

1. Install dependencies with Node.js 20 and `npm ci`.
2. Run `npm run lint` and `npm run build`.
3. Build the Docker image tagged `v0.0.<github-run-number>` and `latest`.
4. Push both tags to `ghcr.io/minhnndev/mivibe-fe`.
5. Check out `meetdy/infrastructure` using `INFRA_REPO_PAT`.
6. Update `manifests/mivibe-fe/deployment.yaml` to the versioned image and commit/push the change when needed.

The infrastructure repository performs the deployment handoff. Runtime variables belong in that deployment configuration or its secret/config mechanism; they are not baked into the image by this workflow.
