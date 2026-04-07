# SlotCity Platform

New storefront platform for SlotCity, built from scratch around:

- `Next.js` for the public app
- `Directus` for admin and merchandising
- `PostHog` for analytics, flags, and experiments
- `Braze` for CRM and journeys
- `Sentry` for observability

## Workspace Layout

```text
apps/
  web/
  directus/
  events/
packages/
  ui/
  theme/
  analytics-schema/
  tracking/
  cms-sdk/
  flags-sdk/
  config/
  types/
```

## Quick Start

1. `corepack enable`
2. `corepack pnpm install`
3. `cp .env.example .env`
4. `corepack pnpm dev:web`

Use `PRODUCT_BLUEPRINT.md` as the architecture baseline.

## Validation

- `corepack pnpm --filter web typecheck`
- `corepack pnpm --filter web build`
- `corepack pnpm --filter events build`
- `corepack pnpm budget:web`

## Deployment

- Frontend: `deploy/vercel`
- Directus + events: `deploy/render`
- Edge proxy: `deploy/cloudflare`
