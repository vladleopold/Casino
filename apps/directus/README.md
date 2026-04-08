# Directus App

This workspace owns:

- banners and hero content
- route payloads for `home`, `catalog`, and `live`
- shelves and merchandising rules
- geo and audience overrides
- editorial roles and publish workflows

Use `extensions/` for custom interfaces and operations once the merchandising UI moves beyond vanilla collection editing.

Starter content for route payload collections lives in `seed/`.

Generate route payload seed:

- `pnpm --filter directus seed:route-payloads`
- `pnpm --filter directus seed:slotcity-pages -- --limit-games=500`

## Local Admin

Local Directus is configured to use the same admin credentials as Render on first bootstrap:

- `Email: leopolds2010@gmail.com`
- `Password: Directus*2026`

Typical local startup flow:

- `docker compose -f infra/docker/docker-compose.dev.yml up -d`
- `pnpm --filter directus bootstrap`
- `pnpm --filter directus dev`

If the local database was already initialized before these credentials were set, changing `.env` alone will not rotate the existing admin password. In that case, re-bootstrap against a fresh local database or reset the admin user manually.

## Imported SlotCity pages

For copied live pages and the reduced top 500 game catalog, use field-based collections in Directus:

- `storefront_imported_pages`: `title`, `heading`, `description`, `hero_image_url`, `content_html`, and related metadata
- `storefront_imported_breadcrumbs`: repeatable breadcrumb rows per `page_slug`

`storefront_route_payloads` remains only as a fallback source for older JSON-driven routes.

Typical import flows:

- write a seed file locally:
  `pnpm --filter directus seed:slotcity-pages -- --limit-games=500`
- push directly into Directus:
  `DIRECTUS_URL=https://cms.slotcity.ua DIRECTUS_TOKEN=... pnpm --filter directus seed:slotcity-pages -- --limit-games=500 --push`
