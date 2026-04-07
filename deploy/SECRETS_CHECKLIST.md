# Secrets Checklist

Use this as the operator checklist for production credentials.

## Rule of thumb

- `Vercel`: only browser-safe public values and frontend runtime config.
- `Render`: server-side secrets for `Directus` and `events`.
- `Cloudflare`: origin routing vars only.
- never put `Braze REST API keys`, `Directus static tokens`, DB passwords, or storage secrets into Vercel.

## PostHog

### `NEXT_PUBLIC_POSTHOG_KEY`

- put in: `Vercel`
- used by: `apps/web`
- take from: PostHog project settings
- what it is: browser project key for `posthog-js`

Where to find it:
- open your PostHog project
- go to project settings
- copy the project token / project key shown for web SDK setup

### `POSTHOG_API_KEY`

- put in: `Render` on `slotcity-events`
- used by: `apps/events`
- take from: the same PostHog project token used for capture
- what it is: current backend ingestion key for the `/capture/` API in this codebase

Important:
- in this project, `apps/events` sends server events to PostHog's capture endpoint with `api_key`
- that means `POSTHOG_API_KEY` is currently the same project capture token format, not a Sentry-style secret token and not a PostHog personal API token

Code reference:
- [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)

### `NEXT_PUBLIC_POSTHOG_HOST`

- put in: `Vercel`
- default now: `https://us.i.posthog.com`
- change only if your PostHog project is in another region

### `POSTHOG_HOST`

- put in: `Render` on `slotcity-events`
- default now: `https://us.i.posthog.com`
- should match the same PostHog region as the frontend

## Sentry

### `NEXT_PUBLIC_SENTRY_DSN`

- put in: `Vercel`
- used by: `apps/web`
- take from: Sentry project client key / DSN
- what it is: the public DSN for the frontend project

Where to find it:
- open the Sentry project for the frontend
- go to `Project Settings`
- open `Client Keys (DSN)`
- copy the public DSN

Code references:
- [apps/web/app/providers.tsx](/Volumes/Work/Casino/apps/web/app/providers.tsx)
- [apps/web/sentry.server.config.ts](/Volumes/Work/Casino/apps/web/sentry.server.config.ts)

### `SENTRY_ENVIRONMENT`

- put in: `Vercel`
- recommended: `production`

## Braze

### `BRAZE_REST_API_KEY`

- put in: `Render` on `slotcity-events`
- used by: `apps/events`
- take from: Braze REST API key with `users.track` permission
- what it is: server-side bearer key for Braze user/event ingestion

Where to find it:
- create or copy a REST API key in Braze for the workspace you are using
- grant access to the `users.track` endpoint because this project posts to `/users/track`

Important:
- this key must stay server-side only
- do not expose it to the browser

### `BRAZE_ENDPOINT`

- put in: `Render` on `slotcity-events`
- used by: `apps/events`
- take from: your Braze REST base URL for the workspace / instance
- example: `https://rest.iad-01.braze.com`

Important:
- the exact hostname depends on your Braze instance
- keep the base URL only, without `/users/track`

Code reference:
- [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)

## Directus

### `DIRECTUS_TOKEN`

- put in: local shell for seed push, CI secret, or protected operator environment
- used by: payload push command
- take from: Directus static API token created after first admin login

Where it is used:
- `DIRECTUS_URL=https://cms.slotcity.ua DIRECTUS_TOKEN=... corepack pnpm --filter directus seed:push-route-payloads`

### `DIRECTUS_URL`

- `Vercel`: use public routed URL `https://slotcity.ua/cms`
- operator scripts: use admin/public CMS URL such as `https://cms.slotcity.ua`

## Render-generated secrets

### `SECRET`

- put in: `Render` on `slotcity-directus`
- use Render generated value

### `KEY`

- put in: `Render` on `slotcity-directus`
- use Render generated value

## Infrastructure credentials

### Postgres

- put in: `Render` on `slotcity-directus`
- keys:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_DATABASE`
  - `DB_USER`
  - `DB_PASSWORD`

### Redis

- put in: `Render` on `slotcity-directus`
- key:
  - `REDIS`

### S3 / R2

- put in: `Render` on `slotcity-directus`
- keys:
  - `STORAGE_S3_BUCKET`
  - `STORAGE_S3_ENDPOINT`
  - `STORAGE_S3_KEY`
  - `STORAGE_S3_SECRET`

## Cloudflare vars

These are routing vars, not high-risk secrets:

- `WEB_ORIGIN`
- `DIRECTUS_ORIGIN`
- `EVENTS_ORIGIN`

Put them in:
- `Cloudflare Worker`

## Fast verification

After secrets are filled:

```bash
DIRECTUS_DRY_RUN=true corepack pnpm --filter directus seed:push-route-payloads
SITE_URL=https://slotcity.ua \
EDGE_HEALTH_URL=https://slotcity.ua/edge/health \
DIRECTUS_HEALTH_URL=https://slotcity.ua/cms/server/health \
EVENTS_HEALTH_URL=https://slotcity.ua/events/health \
corepack pnpm smoke:deploy
```

## Official references

- PostHog JS setup: https://posthog.com/docs/libraries/js
- PostHog capture API: https://posthog.com/docs/api/capture
- Sentry client keys / DSN: https://docs.sentry.io/product/relay/projects/
- Sentry project keys API shape: https://docs.sentry.io/api/projects/list-a-projects-client-keys/
- Braze `/users/track`: https://www.braze.com/docs/api/endpoints/user_data/post_user_track/

Inference note:
- the exact Braze dashboard menu for creating the REST API key and finding the workspace endpoint can vary by workspace setup; the required permission and endpoint format above are derived from Braze's official API docs and this repository's current `apps/events` implementation.
