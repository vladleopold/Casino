# Cloudflare Worker

This Worker sits in front of Vercel and Render:

- proxies the public storefront to `WEB_ORIGIN`
- proxies Directus public assets and content paths to `DIRECTUS_ORIGIN`
- proxies `/events` to the Render-hosted events service
- adds a lightweight edge marker header for troubleshooting

## Secrets and vars

Set these before deploy:

- `WEB_ORIGIN`
- `DIRECTUS_ORIGIN`
- `EVENTS_ORIGIN`

Use [vars.production.example](/Volumes/Work/Casino/deploy/cloudflare/vars.production.example) as the starter template.

## Typical routes

- `slotcity.ua/*` -> Vercel storefront
- `slotcity.ua/events/*` -> Render events
- `slotcity.ua/events/health` -> Render events `/health`
- `slotcity.ua/assets/*` and `slotcity.ua/cms/*` -> Directus
