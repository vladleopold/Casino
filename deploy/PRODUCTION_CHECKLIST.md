# Production Checklist

## 1. Prepare Render

Deploy [render.yaml](/Volumes/Work/Casino/deploy/render/render.yaml).

Directus envs:

- copy [env.shared.example](/Volumes/Work/Casino/deploy/render/env.shared.example)
- set `PUBLIC_URL=https://cms.slotcity.ua`
- set `CORS_ORIGIN=https://slotcity.ua`
- set `ADMIN_EMAIL`
- set `ADMIN_PASSWORD`
- set Postgres credentials
- set `REDIS`
- set S3/R2 credentials

Events envs:

- `POSTHOG_API_KEY`
- `POSTHOG_HOST`
- `BRAZE_REST_API_KEY`
- `BRAZE_ENDPOINT`

## 2. Bootstrap Directus

Run once on Render:

```bash
corepack pnpm --filter directus bootstrap
```

After first login:

1. create a static API token in Directus
2. create the `storefront_route_payloads` collection
3. create fields:
   - `slug` string, unique
   - `payload` json
   - `status` string or status field

Use [storefront-model.json](/Volumes/Work/Casino/apps/directus/schema/storefront-model.json) as the field blueprint.

## 3. Push Route Payloads

Generate seed:

```bash
corepack pnpm --filter directus seed:route-payloads
```

Dry run:

```bash
DIRECTUS_DRY_RUN=true corepack pnpm --filter directus seed:push-route-payloads
```

Push to Directus:

```bash
DIRECTUS_URL=https://cms.slotcity.ua \
DIRECTUS_TOKEN=replace-me \
corepack pnpm --filter directus seed:push-route-payloads
```

## 4. Configure Vercel

Use [env.production.example](/Volumes/Work/Casino/deploy/vercel/env.production.example).

Required values:

- `NEXT_PUBLIC_SITE_URL=https://slotcity.ua`
- `DIRECTUS_URL=https://slotcity.ua/cms`
- `EVENTS_API_URL=https://slotcity.ua/events`
- `STOREFRONT_CONTENT_MODE=directus`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ENVIRONMENT=production`
- `OTEL_SERVICE_NAME=slotcity-web`

Project settings:

- Framework preset: `Next.js`
- Root Directory: `apps/web`
- Install Command: `corepack pnpm install --frozen-lockfile`
- Build Command: `corepack pnpm --filter web build`

## 5. Configure Cloudflare Worker

Use [vars.production.example](/Volumes/Work/Casino/deploy/cloudflare/vars.production.example).

Set:

- `WEB_ORIGIN=https://slotcity-web.vercel.app`
- `DIRECTUS_ORIGIN=https://slotcity-directus.onrender.com`
- `EVENTS_ORIGIN=https://slotcity-events.onrender.com`

Deploy:

```bash
cd deploy/cloudflare
pnpm install
pnpm deploy
```

Route behavior:

- `https://slotcity.ua/*` -> Vercel
- `https://slotcity.ua/cms/*` -> Directus
- `https://slotcity.ua/assets/*` -> Directus
- `https://slotcity.ua/events` -> events ingestion
- `https://slotcity.ua/events/health` -> events health
- `https://slotcity.ua/edge/health` -> worker health

## 6. Smoke Test

Run:

```bash
SITE_URL=https://slotcity.ua \
EDGE_HEALTH_URL=https://slotcity.ua/edge/health \
DIRECTUS_HEALTH_URL=https://slotcity.ua/cms/server/health \
EVENTS_HEALTH_URL=https://slotcity.ua/events/health \
corepack pnpm smoke:deploy
```

Expected:

- `/`, `/catalog`, `/live` return 200
- edge health returns 200
- Directus health returns 200
- events health returns 200

## 7. Final UI Check

Open in Google Chrome and compare against the control screenshots:

- [home](/Volumes/Work/Casino/Temp/slotcity-web-home-check-v32.png)
- [catalog](/Volumes/Work/Casino/Temp/slotcity-catalog-check-v11.png)
- [live](/Volumes/Work/Casino/Temp/slotcity-live-check-v8.png)

If the domain is already on Cloudflare, verify through the public URL, not the raw Vercel preview URL.
