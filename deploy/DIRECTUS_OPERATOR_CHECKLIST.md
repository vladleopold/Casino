# Directus Operator Checklist

Use this for the content or merchandising team during launch week.

## Current model

At the moment the storefront reads route content from:

- `storefront_route_payloads`

Expected items:

- `slug = home`
- `slug = catalog`
- `slug = live`

The frontend contract is strict:

- keep each item in the correct slug
- keep `payload` as valid JSON
- do not rename top-level keys inside `payload`

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
- reorder cards inside arrays
- swap a game or promo item for another item with the same object shape
- update FAQ text
- update footer link labels and href values
- update contact values

Examples of safe arrays:

- `heroPromos`
- `topSlots`
- `bonusGames`
- `liveGames`
- `monthlyTop`
- `quickPicks`
- `faqItems`
- `footerGroups`

## Safe-with-care edits

These are allowed, but only if the asset or URL is real and already available:

- changing `image`
- changing promo `href`
- changing store button assets
- changing social links

Rules:

- image URLs must point to a valid public asset
- do not paste temporary URLs
- prefer existing `/slotcity/...` assets unless engineering explicitly moved the asset to Directus `/assets/...`
- after every image change, open the page in Google Chrome and verify the image really renders

## Do not change without developer approval

- `slug`
- top-level payload keys
- object field names such as `title`, `provider`, `image`, `href`, `rank`
- collection schema in Directus
- item permissions or roles
- environment variables
- Cloudflare routes
- Vercel project settings
- Render service settings

## Do not do at all in launch week

- delete the `home`, `catalog`, or `live` item
- replace `payload` with partial JSON
- rename arrays
- remove required object fields
- switch image paths blindly
- introduce new event names in frontend copy or tracking docs without product approval

## Editing workflow

1. Open the correct item in `storefront_route_payloads`.
2. Confirm the `slug` before editing.
3. Copy the current `payload` to a local backup note.
4. Make one logical change at a time.
5. Save the item.
6. Publish the item if your workflow uses status.
7. Open the affected page in Google Chrome.
8. Compare to the control screenshot and verify no layout break.

Control screenshots:

- [home](/Volumes/Work/Casino/Temp/slotcity-web-home-check-v32.png)
- [catalog](/Volumes/Work/Casino/Temp/slotcity-catalog-check-v11.png)
- [live](/Volumes/Work/Casino/Temp/slotcity-live-check-v8.png)

## Page-by-page guidance

### `home`

Safe zones:

- top promo cards
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
- you need geo-specific logic not already represented in the payload

## Fast rollback

If a content publish breaks a page:

1. reopen the same `slug`
2. restore the previous payload from your backup copy
3. save and publish
4. reopen the page in Google Chrome
5. if still broken, escalate to engineering and stop further edits
