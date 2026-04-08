# Directus Page Map

Use this when you need to change a visible block on the storefront and want the
fastest path to the right Directus item.

## Home

Collections:

- `storefront_banners`
- `storefront_sections`
- `storefront_section_items`

Banner records in `storefront_banners` with `route = home`:

- `kind = promo_strip` -> top promo strip cards
- `kind = hero_slider` -> main hero slider
- `kind = promo_slider` -> lower promo slider
- `kind = feature_banner` -> middle wide banner
- `kind = partner_banner` -> partner banner

Singleton text blocks in `storefront_sections` with `route = home`:

- `section_key = bonus_bar` -> welcome bonus strip under hero
- `section_key = home_top_slots_header` -> top slots section title and CTA
- `section_key = home_live_header` -> live shelf title and CTA
- `section_key = home_bonus_header` -> bonus shelf title and CTA
- `section_key = home_monthly_top_header` -> monthly top title and CTA
- `section_key = home_promotions_header` -> promotions slider title and CTA
- `section_key = home_monthly_featured_card` -> featured monthly card badge, body, CTA, link
- `section_key = app_card` -> app download card
- `section_key = social_card` -> social follow card
- `section_key = legal_card` -> responsible gaming / legal card
- `section_key = mobile_info_hub` -> mobile info hub header
- `section_key = seo_lead` -> SEO lead title block
- `section_key = bonus_seo_card` -> bonus SEO text card
- `section_key = app_seo_card` -> app SEO text card
- `section_key = responsible_seo_card` -> responsible gaming SEO text card
- `section_key = footer_brand` -> footer brand text
- `section_key = footer_meta` -> footer contacts, locale, hours, age, bottom note

Shared footer note:

- `catalog`, `live`, `promotions`, `vip`, `tournaments`, and `registration` now reuse the same footer brand, footer groups, and footer meta records from `home`

Repeatable content in `storefront_section_items` with `route = home`:

- `section_key = top_slots` -> top slots grid
- `section_key = bonus_games` -> bonus slots shelf
- `section_key = live_games` -> live shelf
- `section_key = monthly_top` -> monthly top shelf
- `section_key = quick_picks` -> quick pill row
- `section_key = welcome_gifts` -> welcome gift cards
- `section_key = mobile_info_links` -> links inside mobile info hub
- `section_key = social_links` -> social network buttons
- `section_key = faq_items` -> FAQ list
- `section_key = provider_highlights` -> provider pills in partner banner area
- `section_key = contact_points` -> contact rows
- `section_key = footer_links` -> footer quick links
- `section_key = store_buttons` -> App Store / Google Play buttons
- `section_key = footer_group_links` -> grouped footer navigation
- `section_key = payment_methods` -> payment logos text row
- `section_key = seo_intro` -> short SEO paragraphs
- `section_key = bonus_matrix` -> deposit bonus matrix rows
- `section_key = bonus_slot_plan` -> bonus slot plan list
- `section_key = app_requirements` -> app requirements comparison rows
- `section_key = android_steps` -> Android install steps
- `section_key = ios_steps` -> iOS install steps
- `section_key = responsible_points` -> responsible gaming points
- `section_key = side_rail_items` -> quick side rail buttons on storefront pages
- `section_key = mobile_dock_items` -> shared mobile dock links for all pages

## Catalog

Collections:

- `storefront_banners`
- `storefront_sections`
- `storefront_section_items`
- `storefront_pages`

Banner records in `storefront_banners` with `route = catalog`:

- `kind = promo_strip` -> top promo strip cards
- `kind = feature_banner` -> middle wide feature banner
- `kind = partner_banner` -> partner banner

Singleton chrome blocks in `storefront_sections` with `route = catalog`:

- `section_key = catalog_hero` -> top hero copy and image
- `section_key = catalog_console` -> right console copy, image, search shell, badge
- `section_key = catalog_game_hall_header` -> game hall title and CTA
- `section_key = catalog_discovery_header` -> discovery shelf title, body, and CTA
- `section_key = catalog_live_header` -> live shelf title and CTA
- `section_key = catalog_bonus_header` -> bonus shelf title and CTA
- `section_key = catalog_monthly_top_header` -> monthly top title and CTA

Repeatable content in `storefront_section_items` with `route = catalog`:

- `section_key = side_rail_items` -> catalog side rail buttons
- `section_key = catalog_hero_actions` -> hero CTA buttons
- `section_key = catalog_hero_chips` -> hero chips
- `section_key = catalog_console_chips` -> console filter chips
- `section_key = catalog_console_footer_cards` -> console metric cards
- `section_key = top_slots` -> game hall top slots
- `section_key = discovery_games` -> discovery shelf
- `section_key = bonus_games` -> bonus shelf
- `section_key = live_games` -> live shelf in catalog
- `section_key = quick_picks` -> quick pick pills
- `section_key = monthly_top` -> monthly top shelf
- `section_key = provider_highlights` -> provider pills
- `section_key = footer_signals` -> footer signal row

## Live

Collections:

- `storefront_banners`
- `storefront_sections`
- `storefront_section_items`
- `storefront_pages`

Banner records in `storefront_banners` with `route = live`:

- `kind = promo_strip` -> top promo strip cards
- `kind = feature_banner` -> middle feature banner
- `kind = partner_banner` -> partner banner

Singleton chrome blocks in `storefront_sections` with `route = live`:

- `section_key = live_hero` -> live hero copy and image
- `section_key = live_console` -> featured live console copy, image, pill label
- `section_key = live_main_lobby_header` -> live lobby title and CTA
- `section_key = live_comeback_header` -> comeback shelf title and CTA
- `section_key = live_prime_tables_header` -> premium tables title and CTA
- `section_key = live_cross_sell_header` -> slot cross-sell title and CTA

Repeatable content in `storefront_section_items` with `route = live`:

- `section_key = side_rail_items` -> live side rail buttons
- `section_key = live_hero_actions` -> hero CTA buttons
- `section_key = live_hero_points` -> hero point chips
- `section_key = live_console_footer_cards` -> console footer cards
- `section_key = live_quick_return` -> quick return cards
- `section_key = live_games` -> main live lobby grid
- `section_key = prime_tables` -> premium tables shelf
- `section_key = comeback_tables` -> return-to table shelf
- `section_key = slot_cross_sell` -> cross-sell slots shelf
- `section_key = provider_highlights` -> provider pills
- `section_key = footer_signals` -> footer signal row

## Image Rules

- banner images -> edit `storefront_banners.image`
- card or tile images -> edit `storefront_section_items.image`
- catalog/live hero or console images -> edit `storefront_sections.image`
- if `image` is empty, storefront falls back to `image_url`
- `storefront_pages` is now fallback only for page JSON that has not yet been decomposed

## Practical Rule

- if it looks like a banner or slider -> `storefront_banners`
- if it is one text block or one CTA area -> `storefront_sections`
- if it is a list of cards, links, pills, FAQ, games, or buttons -> `storefront_section_items`
- use `storefront_pages` only if engineering explicitly tells you to edit fallback JSON

## Quick Recipes

Use these when you know what you want to change on the page, but do not want to
trace the schema manually.

### Home

- change top promo cards above the hero:
  open `storefront_banners` -> `route = home` -> `kind = promo_strip`
- change the main hero slider:
  open `storefront_banners` -> `route = home` -> `kind = hero_slider`
- change the bonus strip under the hero:
  open `storefront_sections` -> `slug = home-bonus-bar`
- change the middle wide banner:
  open `storefront_banners` -> `slug = home-feature-banner`
- change the partner banner:
  open `storefront_banners` -> `slug = home-partner-banner`
- change the promo slider lower on the page:
  open `storefront_banners` -> `route = home` -> `kind = promo_slider`
- change the app download card:
  open `storefront_sections` -> `slug = home-app-card`
- change the social follow block:
  open `storefront_sections` -> `slug = home-social-card`
- change the legal / responsible gaming card:
  open `storefront_sections` -> `slug = home-legal-card`
- change the top slots grid:
  open `storefront_section_items` -> `route = home` -> `section_key = top_slots`
- change the top slots shelf title or "Усі" link:
  open `storefront_sections` -> `slug = home-top-slots-header`
- change the featured “game of the month” badge, body, CTA, or link:
  open `storefront_sections` -> `slug = home-monthly-featured-card`
- change the bonus games shelf:
  open `storefront_section_items` -> `route = home` -> `section_key = bonus_games`
- change the bonus games shelf title or CTA:
  open `storefront_sections` -> `slug = home-bonus-header`
- change the live games shelf:
  open `storefront_section_items` -> `route = home` -> `section_key = live_games`
- change the live shelf title or CTA:
  open `storefront_sections` -> `slug = home-live-header`
- change the monthly top shelf:
  open `storefront_section_items` -> `route = home` -> `section_key = monthly_top`
- change the monthly top title or CTA:
  open `storefront_sections` -> `slug = home-monthly-top-header`
- change the promotions slider title or CTA:
  open `storefront_sections` -> `slug = home-promotions-header`
- change the quick pick pills:
  open `storefront_section_items` -> `route = home` -> `section_key = quick_picks`
- change the left side rail buttons:
  open `storefront_section_items` -> `route = home` -> `section_key = side_rail_items`
- change the bottom mobile dock labels or targets:
  open `storefront_section_items` -> `route = home` -> `section_key = mobile_dock_items`
  note: `mark` = dock icon, `value` = modal key only for profile/auth
- change the FAQ:
  open `storefront_section_items` -> `route = home` -> `section_key = faq_items`
- change the social buttons:
  open `storefront_section_items` -> `route = home` -> `section_key = social_links`
- change App Store / Google Play buttons:
  open `storefront_section_items` -> `route = home` -> `section_key = store_buttons`
- change footer contacts:
  open `storefront_sections` -> `slug = home-footer-meta`
- change footer grouped links:
  open `storefront_section_items` -> `route = home` -> `section_key = footer_group_links`
- change the shared footer shown on inner pages:
  edit `home-footer-brand`, `home-footer-meta`, and `footer_group_links`

### Catalog

- change top promo cards:
  open `storefront_banners` -> `route = catalog` -> `kind = promo_strip`
- change the big hero on catalog:
  open `storefront_sections` -> `slug = catalog-hero`
- change hero buttons:
  open `storefront_section_items` -> `route = catalog` -> `section_key = catalog_hero_actions`
- change hero chips:
  open `storefront_section_items` -> `route = catalog` -> `section_key = catalog_hero_chips`
- change the right console block:
  open `storefront_sections` -> `slug = catalog-console`
- change console filter chips:
  open `storefront_section_items` -> `route = catalog` -> `section_key = catalog_console_chips`
- change console metric cards:
  open `storefront_section_items` -> `route = catalog` -> `section_key = catalog_console_footer_cards`
- change the feature banner:
  open `storefront_banners` -> `slug = catalog-feature-banner`
- change the partner banner:
  open `storefront_banners` -> `slug = catalog-partner-banner`
- change the main slot grid:
  open `storefront_section_items` -> `route = catalog` -> `section_key = top_slots`
- change the catalog side rail buttons:
  open `storefront_section_items` -> `route = catalog` -> `section_key = side_rail_items`
- change the game hall title or CTA:
  open `storefront_sections` -> `slug = catalog-game-hall-header`
- change discovery games:
  open `storefront_section_items` -> `route = catalog` -> `section_key = discovery_games`
- change the discovery shelf title, intro text, or CTA:
  open `storefront_sections` -> `slug = catalog-discovery-header`
- change bonus games:
  open `storefront_section_items` -> `route = catalog` -> `section_key = bonus_games`
- change the bonus shelf title or CTA:
  open `storefront_sections` -> `slug = catalog-bonus-header`
- change live games inside catalog:
  open `storefront_section_items` -> `route = catalog` -> `section_key = live_games`
- change the live shelf title or CTA:
  open `storefront_sections` -> `slug = catalog-live-header`
- change the monthly top title or CTA:
  open `storefront_sections` -> `slug = catalog-monthly-top-header`
- change quick pick pills:
  open `storefront_section_items` -> `route = catalog` -> `section_key = quick_picks`
- change provider pills:
  open `storefront_section_items` -> `route = catalog` -> `section_key = provider_highlights`
- change footer signals:
  open `storefront_section_items` -> `route = catalog` -> `section_key = footer_signals`

### Live

- change top promo cards:
  open `storefront_banners` -> `route = live` -> `kind = promo_strip`
- change the live hero:
  open `storefront_sections` -> `slug = live-hero`
- change live hero buttons:
  open `storefront_section_items` -> `route = live` -> `section_key = live_hero_actions`
- change live hero point chips:
  open `storefront_section_items` -> `route = live` -> `section_key = live_hero_points`
- change the right console block:
  open `storefront_sections` -> `slug = live-console`
- change live console metric cards:
  open `storefront_section_items` -> `route = live` -> `section_key = live_console_footer_cards`
- change quick return cards:
  open `storefront_section_items` -> `route = live` -> `section_key = live_quick_return`
- change the feature banner:
  open `storefront_banners` -> `slug = live-feature-banner`
- change the partner banner:
  open `storefront_banners` -> `slug = live-partner-banner`
- change the main live lobby grid:
  open `storefront_section_items` -> `route = live` -> `section_key = live_games`
- change the live side rail buttons:
  open `storefront_section_items` -> `route = live` -> `section_key = side_rail_items`
- change the live lobby title or CTA:
  open `storefront_sections` -> `slug = live-main-lobby-header`
- change premium tables:
  open `storefront_section_items` -> `route = live` -> `section_key = prime_tables`
- change premium tables title or CTA:
  open `storefront_sections` -> `slug = live-prime-tables-header`
- change comeback tables:
  open `storefront_section_items` -> `route = live` -> `section_key = comeback_tables`
- change comeback shelf title or CTA:
  open `storefront_sections` -> `slug = live-comeback-header`
- change slot cross-sell:
  open `storefront_section_items` -> `route = live` -> `section_key = slot_cross_sell`
- change slot cross-sell title or CTA:
  open `storefront_sections` -> `slug = live-cross-sell-header`
- change provider pills:
  open `storefront_section_items` -> `route = live` -> `section_key = provider_highlights`
- change footer signals:
  open `storefront_section_items` -> `route = live` -> `section_key = footer_signals`

## Fast Rule

- want to change text inside one large block:
  usually `storefront_sections`
- want to change one card inside a list:
  usually `storefront_section_items`
- want to change a full-width visual promo:
  usually `storefront_banners`
- want to change an image for hero/console on `catalog` or `live`:
  open the matching `catalog-hero`, `catalog-console`, `live-hero`, or `live-console` in `storefront_sections`
