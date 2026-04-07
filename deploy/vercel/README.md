# Vercel Frontend

Use Vercel only for `apps/web`.

## Project settings

- Framework preset: `Next.js`
- Root Directory: `apps/web`
- Install Command: `corepack pnpm install --frozen-lockfile`
- Build Command: `corepack pnpm --filter web build`
- Output Directory: leave empty and let Next.js handle it

## Production domains

- `slotcity.ua`
- `www.slotcity.ua`

## Notes

- `EVENTS_API_URL` should point to the Render-hosted `apps/events` service.
- `DIRECTUS_URL` should point to the public Directus origin behind Cloudflare.
- `NEXT_PUBLIC_SITE_URL` should be the final production URL.
