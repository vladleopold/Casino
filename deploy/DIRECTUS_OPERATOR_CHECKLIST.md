# Directus Operator Checklist

Use this for the content or merchandising team during launch week.

## Current model

At the moment the storefront reads route content from:

- `storefront_imported_pages`
- `storefront_imported_breadcrumbs`
- `storefront_banners`
- `storefront_sections`
- `storefront_section_items`
- `storefront_route_payloads`
- `storefront_pages`

Expected items:

- `slug = home`
- `slug = catalog`
- `slug = live`

Expected banner routes:

- `route = home`
- `route = catalog`
- `route = live`

The frontend contract is strict:

- keep each item in the correct slug
- keep `route`, `section_key`, and `item_type` in the correct bucket
- keep banner records in the correct `route` and `kind`

Reference files:

- [storefront-model.json](/Volumes/Work/Casino/apps/directus/schema/storefront-model.json)
- [route-payloads.json](/Volumes/Work/Casino/apps/directus/seed/route-payloads.json)
- [types.ts](/Volumes/Work/Casino/packages/cms-sdk/src/types.ts)

## Safe edits

These changes are safe in launch week if done carefully:

- change game titles
- change provider labels
- change promo titles and kicker text
- change button target links
- reorder cards with `position`
- swap a game or promo item for another item with the same object shape
- update FAQ text
- update footer link labels and href values
- update contact values
- update mirrored page `title`, `heading`, `description`, `hero_image_url`, and `content_html`
- update mirrored page breadcrumbs

Examples of safe arrays:

- `topSlots`
- `bonusGames`
- `liveGames`
- `monthlyTop`
- `quickPicks`
- `faqItems`
- `footerGroups`

Safe banner edits in `storefront_banners`:

- change `title`, `kicker`, `body`
- change CTA labels and href values
- reorder using `position`
- replace uploaded image in `image`
- keep `image_url` only as fallback

Safe section edits in `storefront_sections`:

- bonus bar copy and CTA labels
- app / social / legal card copy
- SEO block titles, body text, notes
- footer brand and footer meta fields
- `catalog/live` hero copy, image, badge, search text, and console labels

Safe item edits in `storefront_section_items`:

- game card titles, providers, ranks, and images
- mobile info links
- social links
- FAQ rows
- store buttons
- footer group links
- provider pills and footer signals
- `catalog/live` hero CTA buttons and chips
- `catalog/live` console cards and quick-return rows

## Safe-with-care edits

These are allowed, but only if the asset or URL is real and already available:

- changing `image`
- changing promo `href`
- changing store button assets
- changing social links

Rules:

- prefer uploading banner images into `storefront_banners.image`
- use `image_url` only when engineering intentionally keeps a static asset path
- image URLs must point to a valid public asset
- do not paste temporary URLs
- prefer existing `/slotcity/...` assets unless engineering explicitly moved the asset to Directus `/assets/...`
- after every image change, open the page in Google Chrome and verify the image really renders

## Do not change without developer approval

- `slug`
- `section_key`
- `item_type`
- object field names such as `title`, `provider`, `image`, `href`, `rank`
- collection schema in Directus
- item permissions or roles
- environment variables
- Cloudflare routes
- Vercel project settings
- Render service settings

## Do not do at all in launch week

- delete the `home`, `catalog`, or `live` item
- move records to another `route` or `section_key` blindly
- remove required object fields
- switch image paths blindly
- introduce new event names in frontend copy or tracking docs without product approval

## Editing workflow

1. If the change is on a mirrored SlotCity page or top-500 game page: open `storefront_imported_pages`.
2. If you need breadcrumb labels or order on a mirrored page: open `storefront_imported_breadcrumbs`.
3. If the change is a banner, slider, or banner image: open `storefront_banners`.
4. If the change is a singleton text block or CTA section: open `storefront_sections`.
5. If the change is cards, FAQ, links, tiles, pills, or other repeatable content: open `storefront_section_items`.
6. Use `storefront_route_payloads` only as a fallback source when engineering explicitly asks for JSON editing.
7. Confirm `route`, `section_key`, or `slug` before editing.
8. Copy the current value to a local backup note.
9. Make one logical change at a time.
10. Save the item.
11. Publish the item if your workflow uses status.
12. Open the affected page in Google Chrome.
13. Compare to the control screenshot and verify no layout break.

Control screenshots:

- [home](/Volumes/Work/Casino/Temp/slotcity-web-home-check-v32.png)
- [catalog](/Volumes/Work/Casino/Temp/slotcity-catalog-check-v11.png)
- [live](/Volumes/Work/Casino/Temp/slotcity-live-check-v8.png)

## Page-by-page guidance

### `home`

Safe zones:

- promo strip cards
- hero slider cards
- promo slider cards
- banner images
- `storefront_sections` entries
- `storefront_section_items` shelves and lists
- top slots shelf
- live shelf
- bonus shelf
- monthly top shelf
- FAQ
- footer groups

High-risk zones:

- hero image paths
- store button assets
- legal and responsible gaming copy blocks

### `catalog`

Safe zones:

- promo cards
- feature banner
- partner banner
- `storefront_sections` hero and console records
- `storefront_section_items` shelves and provider pills
- top slots
- discovery games
- bonus games
- provider pills
- quick picks

High-risk zones:

- hero search shell copy if it changes layout
- mixed promo/banner image paths

### `live`

Safe zones:

- live shelves
- feature banner
- partner banner
- `storefront_sections` hero and console records
- `storefront_section_items` tables and footer signals
- return shelf
- cross-sell blocks
- quick return items

High-risk zones:

- live hero copy if it becomes too long
- VIP labels that imply unsupported backend logic

## Publish rules

- one editor changes, one second person reviews
- do not batch-edit `home`, `catalog`, and `live` at the same time unless planned
- do not publish right before a deploy unless the deploy owner confirms
- if two people need to edit, work on separate pages, not the same payload item

## Mandatory checks after publish

Open in Google Chrome:

- `/`
- `/catalog`
- `/live`

Verify:

- page loads without broken cards
- no empty shelf section
- images load
- buttons still render
- footer still renders
- no obvious spacing collapse

## Escalate to engineering if

- JSON validation becomes unclear
- an image path is missing
- a page renders empty after publish
- a button route is unknown
- you need a new field, a new section, or a new schema key
- you need geo-specific logic not already represented in the model

## Fast rollback

If a content publish breaks a page:

1. reopen the same `slug`
2. restore the previous payload from your backup copy
3. save and publish
4. reopen the page in Google Chrome
5. if still broken, escalate to engineering and stop further edits
