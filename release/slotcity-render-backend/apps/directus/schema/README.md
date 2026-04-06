# Directus Storefront Schema Blueprint

Current frontend routes now read content through `@slotcity/cms-sdk` instead of
hardcoded arrays inside route files.

Target pages:

- `home`
- `catalog`
- `live`

Target collections:

- `storefront_pages`
- `storefront_route_payloads`
- `storefront_navigation_links`
- `storefront_actions`
- `storefront_chips`
- `storefront_stat_cards`
- `storefront_feature_cards`
- `storefront_showcase_cards`
- `storefront_info_cards`
- `storefront_shelves`
- `storefront_shelf_items`
- `storefront_activity_items`

Runtime mode:

- if `DIRECTUS_URL` is configured and `STOREFRONT_CONTENT_MODE != mock`, the
  app tries Directus first
- `catalog` and `live` also try `storefront_route_payloads.payload` before
  falling back to local typed route content
- otherwise `@slotcity/cms-sdk` falls back to typed mock content

Seed files:

- `apps/directus/seed/route-payloads.json` contains import-ready payloads for
  `home`, `catalog`, and `live`

This lets us keep the UI stable while moving to a real CMS contract.
