export const directusStorefrontCollections = [
  {
    collection: "storefront_imported_pages",
    purpose: "field-based mirrored SlotCity pages rendered inside the mobile shell",
    fields: [
      "slug",
      "locale",
      "page_type",
      "shell_route",
      "title",
      "heading",
      "description",
      "hero_image",
      "hero_image_url",
      "content_html"
    ]
  },
  {
    collection: "storefront_imported_breadcrumbs",
    purpose: "repeatable breadcrumb rows for mirrored SlotCity pages",
    fields: ["page_slug", "position", "label", "href"]
  },
  {
    collection: "storefront_games",
    purpose: "Directus-managed game pages with hero, launch, demo, and provider fields",
    fields: [
      "slug",
      "name",
      "heading",
      "provider_name",
      "game_type",
      "launch_mode",
      "launch_url",
      "demo_url",
      "hero_image",
      "hero_image_url",
      "content_html"
    ]
  },
  {
    collection: "storefront_banners",
    purpose: "banner, hero slider, promo slider, and visual promo records",
    fields: ["route", "kind", "position", "title", "body", "image", "image_url"]
  },
  {
    collection: "storefront_pages",
    purpose: "fallback page-level JSON entries for home, catalog, and live",
    fields: ["slug", "payload", "status"]
  },
  {
    collection: "storefront_sections",
    purpose: "singleton text and chrome sections for home, catalog, and live",
    fields: ["route", "section_key", "title", "body", "image", "badge", "pill_label"]
  },
  {
    collection: "storefront_section_items",
    purpose: "repeatable cards, links, chips, CTA buttons, and info rows",
    fields: ["route", "section_key", "item_type", "label", "title", "href", "position"]
  },
  {
    collection: "storefront_navigation_links",
    purpose: "top navigation managed by editors",
    fields: ["label", "href", "position"]
  },
  {
    collection: "storefront_actions",
    purpose: "CTA buttons for hero and section blocks",
    fields: ["label", "href", "variant", "position"]
  },
  {
    collection: "storefront_chips",
    purpose: "surface chips and filter pills",
    fields: ["label", "active", "position"]
  },
  {
    collection: "storefront_stat_cards",
    purpose: "numeric or label-based KPI cards",
    fields: ["label", "value", "body", "position"]
  },
  {
    collection: "storefront_feature_cards",
    purpose: "generic feature, ops, and floor cards",
    fields: ["kicker", "title", "body", "points", "position"]
  },
  {
    collection: "storefront_showcase_cards",
    purpose: "catalog and live preview cards with accent metadata",
    fields: ["title", "meta", "accent", "position"]
  },
  {
    collection: "storefront_info_cards",
    purpose: "console and footer support cards",
    fields: ["label", "value", "body", "position"]
  },
  {
    collection: "storefront_shelves",
    purpose: "homepage and catalog shelves",
    fields: ["title", "slug", "count_label", "geo_target", "audience_target"]
  },
  {
    collection: "storefront_shelf_items",
    purpose: "items within a shelf",
    fields: ["title", "provider", "game_id", "position", "pin", "boost", "hide"]
  },
  {
    collection: "storefront_activity_items",
    purpose: "ops feed and timeline items",
    fields: ["text", "position"]
  }
] as const;
