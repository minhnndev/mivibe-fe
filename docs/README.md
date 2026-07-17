# Documentation

This directory documents the current Mivibe Studio Landing application and its operational boundaries.

| Document | Scope |
| --- | --- |
| [Architecture](architecture.md) | SPA routes, admin data flow, React Query, and current implementation limits |
| [Admin Auth and Security](admin-auth-and-security.md) | Supabase authentication, role provisioning, RLS setup, and verification |
| [Mobile Remote Config](mobile-remote-config.md) | Published row contract and admin Save, Regroup, and export behavior |
| [Environment and Deployment](environment-and-deployment.md) | Environment precedence, local builds, Docker/Nginx, health checks, and CI/CD |

Start with the root [README](../README.md) for local onboarding. Operators configuring Supabase should then read the security and remote-config documents before enabling admin access or mobile reads.
