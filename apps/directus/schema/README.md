# Directus Storefront Schema Blueprint

Current frontend routes now read content through `@slotcity/cms-sdk` instead of
hardcoded arrays inside route files.

Target pages:

- `home`
- `catalog`
- `live`

Target collections:

- `storefront_imported_pages`
- `storefront_imported_breadcrumbs`
- `storefront_banners`
- `storefront_pages`
- `storefront_sections`
- `storefront_section_items`
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
- for mirrored SlotCity routes, the app first checks `storefront_imported_pages`
  and `storefront_imported_breadcrumbs`
- the app overlays `storefront_banners`, `storefront_sections`, and
  `storefront_section_items` on top of `storefront_route_payloads.payload`
- `storefront_route_payloads` now acts as a fallback safety net while the CMS
  migrates away from page-level JSON editing
- otherwise `@slotcity/cms-sdk` falls back to typed mock content

Seed files:

- `apps/directus/seed/route-payloads.json` contains import-ready payloads for
  `home`, `catalog`, and `live`

This lets us keep the UI stable while moving to a real CMS contract.

Current live setup:

- `storefront_imported_pages` stores mirrored page metadata as normal fields plus `content_html`
- `storefront_imported_breadcrumbs` stores repeatable breadcrumb rows per mirrored page
- `storefront_banners` stores editable banner and slider records with uploadable Directus images
- `storefront_sections` stores singleton text sections like bonus bars, app/legal blocks, footer meta, and `catalog/live` hero or console chrome
- `storefront_section_items` stores repeatable cards and list rows like game shelves, FAQ, social links, store buttons, hero actions, chips, and console cards
- `storefront_route_payloads` remains as a fallback JSON source for route content that has not been decomposed yet
- `storefront_pages` now remains mainly as a fallback for page-level JSON that has not yet been decomposed
