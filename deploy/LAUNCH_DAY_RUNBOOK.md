# Launch-Day Runbook

Use this on the day you switch `slotcity.ua` to the new stack.

## T-60 minutes

1. Confirm Render services are healthy:
   - `slotcity-directus`
   - `slotcity-events`
2. Confirm Vercel production deployment is green for `apps/web`.
3. Confirm Cloudflare Worker deploy is published.
4. Confirm all required env values are filled:
   - [ENV_REFERENCE.md](/Volumes/Work/Casino/deploy/ENV_REFERENCE.md)
   - [SECRETS_CHECKLIST.md](/Volumes/Work/Casino/deploy/SECRETS_CHECKLIST.md)
5. Confirm Directus payloads are already pushed:

```bash
DIRECTUS_DRY_RUN=true corepack pnpm --filter directus seed:push-route-payloads
```

## T-45 minutes

Run a public preflight against raw service origins.

Check Directus health:

```bash
curl -i https://cms.slotcity.ua/server/health
```

Check events health on the raw Render origin:

```bash
curl -i https://slotcity-events.onrender.com/health
```

Check the Vercel deployment URL manually in Chrome:

- `/`
- `/catalog`
- `/live`

Compare against:

- [home](/Volumes/Work/Casino/Temp/slotcity-web-home-check-v32.png)
- [catalog](/Volumes/Work/Casino/Temp/slotcity-catalog-check-v11.png)
- [live](/Volumes/Work/Casino/Temp/slotcity-live-check-v8.png)

## T-30 minutes

Freeze risky admin changes:

- no schema changes in Directus
- no env edits unless required for launch
- no last-minute design edits on `apps/web`
- no event name changes

If payload content changed, push one last time:

```bash
corepack pnpm --filter directus seed:route-payloads
DIRECTUS_URL=https://cms.slotcity.ua \
DIRECTUS_TOKEN=replace-me \
corepack pnpm --filter directus seed:push-route-payloads
```

## T-15 minutes

Deploy the final production versions:

1. Re-deploy Vercel production.
2. Verify Render services are still healthy.
3. Re-deploy the Cloudflare Worker.

Double-check Worker routes:

- `slotcity.ua/*` -> `WEB_ORIGIN`
- `slotcity.ua/cms/*` -> `DIRECTUS_ORIGIN`
- `slotcity.ua/assets/*` -> `DIRECTUS_ORIGIN`
- `slotcity.ua/events` -> `EVENTS_ORIGIN/events`
- `slotcity.ua/events/health` -> `EVENTS_ORIGIN/health`
- `slotcity.ua/edge/health` -> Worker health

## Cutover

Switch public traffic through Cloudflare to the new Worker and origins.

As soon as the route is live, run:

```bash
SITE_URL=https://slotcity.ua \
EDGE_HEALTH_URL=https://slotcity.ua/edge/health \
DIRECTUS_HEALTH_URL=https://slotcity.ua/cms/server/health \
EVENTS_HEALTH_URL=https://slotcity.ua/events/health \
corepack pnpm smoke:deploy
```

Expected:

- `home` returns `200`
- `catalog` returns `200`
- `live` returns `200`
- `edge health` returns `200`
- `directus health` returns `200`
- `events health` returns `200`

## T+5 minutes

Open `https://slotcity.ua` in Google Chrome and manually verify:

- home hero renders correctly
- `catalog` opens and shelves are populated
- `live` opens and live cards render
- login/register buttons render
- no broken media URLs under `/assets`
- no visible hydration/layout break

Use the saved control screenshots:

- [home](/Volumes/Work/Casino/Temp/slotcity-web-home-check-v32.png)
- [catalog](/Volumes/Work/Casino/Temp/slotcity-catalog-check-v11.png)
- [live](/Volumes/Work/Casino/Temp/slotcity-live-check-v8.png)

## T+10 minutes

Check telemetry:

- PostHog is receiving browser events
- events service logs show accepted events
- Braze requests are not returning auth errors
- Sentry is receiving frontend errors if a test event is triggered

Minimal checks:

- visit the site and confirm at least one `page_viewed` event in PostHog
- hit `https://slotcity.ua/events/health`
- inspect Render logs for `slotcity-events`

## T+15 minutes

Check business-critical flows:

- content is coming from Directus and not empty
- hero and shelf content match expected launch content
- `catalog` and `live` are navigable on mobile width
- no `400` rejections for valid client events
- no money event is being sent client-side

## Rollback triggers

Rollback immediately if any of these is true:

- `/`, `/catalog`, or `/live` fail smoke with non-`200`
- `slotcity.ua/events/health` fails
- `slotcity.ua/cms/server/health` fails
- key media under `/assets` is broken
- pages render without content because Directus fetch fails
- Cloudflare is routing storefront traffic to the wrong upstream

## Rollback path

1. Repoint Cloudflare storefront traffic back to the previous production target.
2. Keep Directus and events online for inspection.
3. Export logs from:
   - Vercel
   - Render `slotcity-directus`
   - Render `slotcity-events`
   - Cloudflare Worker
4. Re-run:

```bash
SITE_URL=https://slotcity.ua \
EDGE_HEALTH_URL=https://slotcity.ua/edge/health \
DIRECTUS_HEALTH_URL=https://slotcity.ua/cms/server/health \
EVENTS_HEALTH_URL=https://slotcity.ua/events/health \
corepack pnpm smoke:deploy
```

5. Fix upstream routing or env mismatches before a second cutover attempt.

## Useful references

- [PRODUCTION_CHECKLIST.md](/Volumes/Work/Casino/deploy/PRODUCTION_CHECKLIST.md)
- [ENV_REFERENCE.md](/Volumes/Work/Casino/deploy/ENV_REFERENCE.md)
- [SECRETS_CHECKLIST.md](/Volumes/Work/Casino/deploy/SECRETS_CHECKLIST.md)
