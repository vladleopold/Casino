# Render Rollout

Use Render for:

- `apps/directus`
- `apps/events`

## Directus

1. Deploy [render.yaml](/Volumes/Work/Casino/deploy/render/render.yaml).
2. Set runtime envs from [env.shared.example](/Volumes/Work/Casino/deploy/render/env.shared.example).
3. For the first boot, set `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. Run a one-off bootstrap on Render:
   - `corepack pnpm --filter directus bootstrap`
5. Generate and push route payloads:
   - `corepack pnpm --filter directus seed:route-payloads`
   - `DIRECTUS_URL=https://cms.slotcity.ua DIRECTUS_TOKEN=... corepack pnpm --filter directus seed:push-route-payloads`

## Events

Required envs:

- `POSTHOG_API_KEY`
- `POSTHOG_HOST`
- `BRAZE_REST_API_KEY`
- `BRAZE_ENDPOINT`

## Frontend handoff to Vercel

After Directus is live and payloads are imported:

1. Set `DIRECTUS_URL` in Vercel to the public Directus origin.
2. Set `STOREFRONT_CONTENT_MODE=directus`.
3. Re-deploy `apps/web`.
4. Verify `/`, `/catalog`, `/live` in Chrome against control screenshots.
