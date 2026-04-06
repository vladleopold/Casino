export const directusStorefrontCollections = [
  {
    collection: "storefront_pages",
    purpose: "page-level entries for home, catalog, and live",
    fields: ["slug", "title", "kicker", "body", "navigation", "actions"]
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
