# Deployment Layout

This repository is prepared for a split deployment model:

- `Vercel` for `apps/web`
- `Render` for `apps/directus` and `apps/events`
- `Cloudflare Worker` for edge proxying, cache normalization, and geo headers

## Start here

- `deploy/ENV_REFERENCE.md`: copy/paste production env values for Render, Vercel, and Cloudflare
- `deploy/SECRETS_CHECKLIST.md`: where each production key comes from and where it must be stored
- `deploy/NFR_SPEC.md`: measurable non-functional requirements for availability, performance, security, analytics, and content operations
- `deploy/LAUNCH_DAY_RUNBOOK.md`: preflight, cutover, rollback, and post-launch checks
- `deploy/DIRECTUS_OPERATOR_CHECKLIST.md`: what content editors can change safely in launch week
- `deploy/STACK_FULFILLMENT_MATRIX.md`: exact status of each agreed stack requirement

## Release bundles

- run `corepack pnpm release:prepare`
- output folder: `release/`
- generated bundles:
  - `release/slotcity-platform-monorepo`
  - `release/slotcity-web-vercel`
  - `release/slotcity-render-backend`
  - `release/slotcity-cloudflare-worker`

## Folders

- `deploy/vercel`: Vercel project settings and production env template
- `deploy/render`: Render Blueprint and shared env template for Node services
- `deploy/cloudflare`: Worker project for edge proxy and lightweight cache orchestration

## Operational scripts

- `pnpm --filter directus seed:route-payloads`: regenerate Directus route payload seed
- `pnpm --filter directus seed:push-route-payloads -- --dry-run`: preview upserts
- `pnpm --filter directus seed:push-route-payloads`: push `home`, `catalog`, `live` payloads to Directus

## Recommended topology

1. Deploy `apps/web` to Vercel with project root set to `apps/web`.
2. Deploy `apps/directus` and `apps/events` to Render from `deploy/render/render.yaml`.
3. Publish the Worker from `deploy/cloudflare` and point your production domain through Cloudflare.
4. Configure Directus media storage to S3 or Cloudflare R2.
5. Keep `NEXT_PUBLIC_*` variables in Vercel and server-side secrets in Render/Cloudflare secrets only.
