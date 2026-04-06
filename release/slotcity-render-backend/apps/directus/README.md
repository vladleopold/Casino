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
