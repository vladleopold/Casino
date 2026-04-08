import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  mockCatalogPageData,
  mockHomePageData,
  mockLivePageData
} from "../../../packages/cms-sdk/src/mock-content.ts";
import {
  mockCatalogRouteContent,
  mockHomeRouteContent,
  mockLiveRouteContent
} from "../../../packages/cms-sdk/src/route-content.ts";

interface RoutePayloadRecord {
  slug: string;
  payload: unknown;
}

interface RouteSeedFile {
  storefront_route_payloads: RoutePayloadRecord[];
}

interface BannerRecord {
  slug: string;
  route: "home" | "catalog" | "live";
  kind: "promo_strip" | "hero_slider" | "promo_slider" | "feature_banner" | "partner_banner";
  position: number;
  kicker?: string;
  title?: string;
  body?: string;
  href?: string;
  primary_label?: string;
  primary_href?: string;
  secondary_label?: string;
  secondary_href?: string;
  accent?: string;
  color?: string;
  cta_label?: string;
  cta_caption?: string;
  tags?: string[];
  chips?: string[];
  stats?: Array<{ label: string; value: string }>;
  image?: string | null;
  image_url?: string | null;
}

interface SectionRecord {
  slug: string;
  route: "home" | "catalog" | "live";
  section_key:
    | "bonus_bar"
    | "app_card"
    | "social_card"
    | "legal_card"
    | "mobile_info_hub"
    | "seo_lead"
    | "bonus_seo_card"
    | "app_seo_card"
    | "responsible_seo_card"
    | "footer_brand"
    | "footer_meta"
    | "catalog_hero"
    | "catalog_console"
    | "live_hero"
    | "live_console"
    | "home_top_slots_header"
    | "home_live_header"
    | "home_bonus_header"
    | "home_monthly_top_header"
    | "home_promotions_header"
    | "catalog_game_hall_header"
    | "catalog_discovery_header"
    | "catalog_live_header"
    | "catalog_bonus_header"
    | "catalog_monthly_top_header"
    | "home_monthly_featured_card"
    | "live_main_lobby_header"
    | "live_comeback_header"
    | "live_prime_tables_header"
    | "live_cross_sell_header";
  position: number;
  kicker?: string;
  title?: string;
  body?: string;
  note?: string;
  badge?: string;
  image_alt?: string;
  search_placeholder?: string;
  search_shortcut?: string;
  pill_label?: string;
  href?: string;
  primary_label?: string;
  primary_href?: string;
  secondary_label?: string;
  secondary_href?: string;
  cta_label?: string;
  cta_caption?: string;
  email?: string;
  phone?: string;
  address?: string;
  locale?: string;
  hours?: string;
  age?: string;
  bottom_email?: string;
  bottom_note?: string;
  meta?: string[];
  paragraphs?: string[];
  image?: string | null;
  image_url?: string | null;
}

interface SectionItemRecord {
  slug: string;
  route: "home" | "catalog" | "live";
  section_key:
    | "top_slots"
    | "bonus_games"
    | "live_games"
    | "monthly_top"
    | "quick_picks"
    | "welcome_gifts"
    | "mobile_info_links"
    | "social_links"
    | "faq_items"
    | "provider_highlights"
    | "contact_points"
    | "footer_links"
    | "store_buttons"
    | "footer_group_links"
    | "payment_methods"
    | "seo_intro"
    | "bonus_matrix"
    | "bonus_slot_plan"
    | "app_requirements"
    | "android_steps"
    | "ios_steps"
    | "responsible_points"
    | "discovery_games"
    | "prime_tables"
    | "comeback_tables"
    | "slot_cross_sell"
    | "footer_signals"
    | "catalog_hero_actions"
    | "catalog_hero_chips"
    | "catalog_console_chips"
    | "catalog_console_footer_cards"
    | "live_hero_actions"
    | "live_hero_points"
    | "live_console_footer_cards"
    | "live_quick_return"
    | "side_rail_items"
    | "mobile_dock_items";
  item_type:
    | "game_tile"
    | "mini_game_pill"
    | "gift_card"
    | "mobile_info_link"
    | "social_link"
    | "faq_item"
    | "text_chip"
    | "contact_point"
    | "footer_link"
    | "store_button"
    | "footer_group_link"
    | "matrix_row"
    | "app_requirement"
    | "text_entry"
    | "cta_link"
    | "surface_chip"
    | "info_card"
    | "nav_item";
  position: number;
  group_label?: string;
  label?: string;
  title?: string;
  body?: string;
  value?: string;
  href?: string;
  provider?: string;
  rank?: string;
  mark?: string;
  tone?: string;
  variant?: string;
  is_active?: boolean;
  caption?: string;
  width?: number;
  height?: number;
  values?: string[];
  image?: string | null;
  image_url?: string | null;
}

interface FieldDefinition {
  field: string;
  type: "alias" | "boolean" | "integer" | "json" | "string" | "text" | "uuid";
  meta: Record<string, unknown>;
  schema: Record<string, unknown> | null;
}

interface CollectionDefinition {
  collection: string;
  icon: string;
  displayTemplate: string;
  note: string;
  fields: FieldDefinition[];
}

const storefrontRouteChoices = [
  { text: "Home", value: "home" },
  { text: "Catalog", value: "catalog" },
  { text: "Live", value: "live" }
];

const storefrontSectionChoices = [
  { text: "Home bonus bar", value: "bonus_bar" },
  { text: "Home app card", value: "app_card" },
  { text: "Home social card", value: "social_card" },
  { text: "Home legal card", value: "legal_card" },
  { text: "Home mobile info hub", value: "mobile_info_hub" },
  { text: "Home SEO lead", value: "seo_lead" },
  { text: "Home bonus SEO card", value: "bonus_seo_card" },
  { text: "Home app SEO card", value: "app_seo_card" },
  { text: "Home responsible SEO card", value: "responsible_seo_card" },
  { text: "Home footer brand", value: "footer_brand" },
  { text: "Home footer meta", value: "footer_meta" },
  { text: "Catalog hero", value: "catalog_hero" },
  { text: "Catalog console", value: "catalog_console" },
  { text: "Live hero", value: "live_hero" },
  { text: "Live console", value: "live_console" },
  { text: "Home top slots header", value: "home_top_slots_header" },
  { text: "Home live shelf header", value: "home_live_header" },
  { text: "Home bonus shelf header", value: "home_bonus_header" },
  { text: "Home monthly top header", value: "home_monthly_top_header" },
  { text: "Home promotions header", value: "home_promotions_header" },
  { text: "Catalog game hall header", value: "catalog_game_hall_header" },
  { text: "Catalog discovery header", value: "catalog_discovery_header" },
  { text: "Catalog live header", value: "catalog_live_header" },
  { text: "Catalog bonus header", value: "catalog_bonus_header" },
  { text: "Catalog monthly top header", value: "catalog_monthly_top_header" },
  { text: "Home monthly featured card", value: "home_monthly_featured_card" },
  { text: "Live main lobby header", value: "live_main_lobby_header" },
  { text: "Live comeback header", value: "live_comeback_header" },
  { text: "Live prime tables header", value: "live_prime_tables_header" },
  { text: "Live cross-sell header", value: "live_cross_sell_header" }
];

const storefrontItemSectionChoices = [
  { text: "Top slots", value: "top_slots" },
  { text: "Bonus games", value: "bonus_games" },
  { text: "Live games", value: "live_games" },
  { text: "Monthly top", value: "monthly_top" },
  { text: "Quick picks", value: "quick_picks" },
  { text: "Welcome gifts", value: "welcome_gifts" },
  { text: "Mobile info links", value: "mobile_info_links" },
  { text: "Social links", value: "social_links" },
  { text: "FAQ items", value: "faq_items" },
  { text: "Provider highlights", value: "provider_highlights" },
  { text: "Contact points", value: "contact_points" },
  { text: "Footer links", value: "footer_links" },
  { text: "Store buttons", value: "store_buttons" },
  { text: "Footer group links", value: "footer_group_links" },
  { text: "Payment methods", value: "payment_methods" },
  { text: "SEO intro", value: "seo_intro" },
  { text: "Bonus matrix", value: "bonus_matrix" },
  { text: "Bonus slot plan", value: "bonus_slot_plan" },
  { text: "App requirements", value: "app_requirements" },
  { text: "Android steps", value: "android_steps" },
  { text: "iOS steps", value: "ios_steps" },
  { text: "Responsible points", value: "responsible_points" },
  { text: "Discovery games", value: "discovery_games" },
  { text: "Prime tables", value: "prime_tables" },
  { text: "Comeback tables", value: "comeback_tables" },
  { text: "Slot cross-sell", value: "slot_cross_sell" },
  { text: "Footer signals", value: "footer_signals" },
  { text: "Catalog hero actions", value: "catalog_hero_actions" },
  { text: "Catalog hero chips", value: "catalog_hero_chips" },
  { text: "Catalog console chips", value: "catalog_console_chips" },
  { text: "Catalog console footer cards", value: "catalog_console_footer_cards" },
  { text: "Live hero actions", value: "live_hero_actions" },
  { text: "Live hero points", value: "live_hero_points" },
  { text: "Live console footer cards", value: "live_console_footer_cards" },
  { text: "Live quick return", value: "live_quick_return" },
  { text: "Side rail items", value: "side_rail_items" },
  { text: "Mobile dock items", value: "mobile_dock_items" }
];

const storefrontItemTypeChoices = [
  { text: "Game tile", value: "game_tile" },
  { text: "Mini game pill", value: "mini_game_pill" },
  { text: "Gift card", value: "gift_card" },
  { text: "Mobile info link", value: "mobile_info_link" },
  { text: "Social link", value: "social_link" },
  { text: "FAQ item", value: "faq_item" },
  { text: "Text chip", value: "text_chip" },
  { text: "Contact point", value: "contact_point" },
  { text: "Footer link", value: "footer_link" },
  { text: "Store button", value: "store_button" },
  { text: "Footer group link", value: "footer_group_link" },
  { text: "Matrix row", value: "matrix_row" },
  { text: "App requirement", value: "app_requirement" },
  { text: "Text entry", value: "text_entry" },
  { text: "CTA link", value: "cta_link" },
  { text: "Surface chip", value: "surface_chip" },
  { text: "Info card", value: "info_card" },
  { text: "Nav item", value: "nav_item" }
];

const storefrontImportedLocaleChoices = [
  { text: "Ukrainian", value: "uk" },
  { text: "Russian", value: "ru" }
];

const storefrontImportedPageTypeChoices = [
  { text: "Page", value: "page" },
  { text: "Promotion", value: "promotion" },
  { text: "Provider", value: "provider" },
  { text: "Collection", value: "collection" },
  { text: "Slot", value: "slot" },
  { text: "Live", value: "live" },
  { text: "Game", value: "game" },
  { text: "Info", value: "info" }
];

const storefrontImportedShellRouteChoices = [
  { text: "Home", value: "home" },
  { text: "Catalog", value: "catalog" },
  { text: "Live", value: "live" },
  { text: "Bonuses", value: "bonuses" },
  { text: "VIP", value: "vip" },
  { text: "Promotions", value: "promotions" },
  { text: "Registration", value: "registration" },
  { text: "Tournaments", value: "tournaments" }
];

const currentDir = dirname(fileURLToPath(import.meta.url));
const routeSeedPath = resolve(currentDir, "../seed/route-payloads.json");
const directusUrl = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const directusToken = process.env.DIRECTUS_TOKEN;
const directusSessionToken = process.env.DIRECTUS_SESSION_TOKEN;
const contentStatus = process.env.DIRECTUS_CONTENT_STATUS ?? "published";

if (!directusUrl) {
  console.error("DIRECTUS_URL is required.");
  process.exit(1);
}

if (!directusToken && !directusSessionToken) {
  console.error("DIRECTUS_TOKEN or DIRECTUS_SESSION_TOKEN is required.");
  process.exit(1);
}

const buildHeaders = (headers?: HeadersInit) => ({
  "Content-Type": "application/json",
  ...(directusToken ? { Authorization: `Bearer ${directusToken}` } : {}),
  ...(directusSessionToken
    ? { Cookie: `directus_session_token=${directusSessionToken}` }
    : {}),
  ...(headers ?? {})
});

async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(`${directusUrl}${path}`, {
      ...init,
      headers: buildHeaders(init?.headers)
    });

    if (response.ok) {
      return (await response.json()) as T;
    }

    const body = await response.text();
    const isRetriable = response.status === 429 || response.status === 503;

    if (isRetriable && attempt < maxAttempts) {
      await delay(500 * attempt);
      continue;
    }

    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }

  throw new Error(`Failed to request ${path}`);
}

function createSlugField(
  collection: string,
  options?: {
    width?: "half" | "half-left" | "half-right" | "full";
    group?: string;
    readonly?: boolean;
  }
): FieldDefinition {
  return {
    field: "slug",
    type: "string",
    meta: {
      interface: "input",
      width: options?.width ?? "half",
      required: true,
      note: "Unique route slug used by the storefront",
      group: options?.group ?? null,
      readonly: options?.readonly ?? false
    },
    schema: {
      name: "slug",
      table: collection,
      data_type: "character varying",
      max_length: 255,
      is_nullable: false,
      is_unique: true
    }
  };
}

function createStringField(
  collection: string,
  field: string,
  note: string,
  options?: {
    width?: "half" | "half-left" | "half-right" | "full";
    required?: boolean;
    maxLength?: number;
    defaultValue?: string;
    interface?: string;
    interfaceOptions?: Record<string, unknown>;
    group?: string;
    readonly?: boolean;
  }
): FieldDefinition {
  return {
    field,
    type: "string",
    meta: {
      interface: options?.interface ?? "input",
      width: options?.width ?? "half",
      required: options?.required ?? false,
      note,
      options: options?.interfaceOptions ?? null,
      group: options?.group ?? null,
      readonly: options?.readonly ?? false
    },
    schema: {
      name: field,
      table: collection,
      data_type: "character varying",
      max_length: options?.maxLength ?? 255,
      is_nullable: !(options?.required ?? false),
      default_value: options?.defaultValue ?? null
    }
  };
}

function createTextField(
  collection: string,
  field: string,
  note: string,
  options?: {
    width?: "half" | "half-left" | "half-right" | "full";
    interface?: string;
    interfaceOptions?: Record<string, unknown>;
    group?: string;
    readonly?: boolean;
  }
): FieldDefinition {
  return {
    field,
    type: "text",
    meta: {
      interface: options?.interface ?? "input-multiline",
      width: options?.width ?? "full",
      note,
      options: options?.interfaceOptions ?? null,
      group: options?.group ?? null,
      readonly: options?.readonly ?? false
    },
    schema: {
      name: field,
      table: collection,
      data_type: "text",
      is_nullable: true
    }
  };
}

function createCodeField(
  collection: string,
  field: string,
  note: string,
  language: string,
  options?: {
    group?: string;
    readonly?: boolean;
  }
): FieldDefinition {
  return {
    field,
    type: "text",
    meta: {
      interface: "input-code",
      width: "full",
      note,
      options: {
        language,
        lineNumber: true
      },
      group: options?.group ?? null,
      readonly: options?.readonly ?? false
    },
    schema: {
      name: field,
      table: collection,
      data_type: "text",
      is_nullable: true
    }
  };
}

function createJsonField(
  collection: string,
  field: string,
  note: string,
  template = "[]"
): FieldDefinition {
  return {
    field,
    type: "json",
    meta: {
      interface: "input-code",
      width: "full",
      note,
      options: {
        language: "json",
        lineNumber: true,
        template
      }
    },
    schema: {
      name: field,
      table: collection,
      data_type: "json",
      is_nullable: true
    }
  };
}

function createIntegerField(collection: string, field: string, note: string): FieldDefinition {
  return {
    field,
    type: "integer",
    meta: {
      interface: "input",
      width: "half",
      note
    },
    schema: {
      name: field,
      table: collection,
      data_type: "integer",
      is_nullable: false,
      default_value: 0
    }
  };
}

function createBooleanField(collection: string, field: string, note: string): FieldDefinition {
  return {
    field,
    type: "boolean",
    meta: {
      interface: "boolean",
      width: "half",
      note
    },
    schema: {
      name: field,
      table: collection,
      data_type: "boolean",
      is_nullable: false,
      default_value: false
    }
  };
}

function createFileField(
  collection: string,
  field: string,
  note: string,
  options?: {
    group?: string;
    readonly?: boolean;
  }
): FieldDefinition {
  return {
    field,
    type: "uuid",
    meta: {
      interface: "file",
      display: "image",
      width: "full",
      note,
      group: options?.group ?? null,
      readonly: options?.readonly ?? false
    },
    schema: {
      name: field,
      table: collection,
      data_type: "uuid",
      is_nullable: true
    }
  };
}

function createPayloadField(collection: string): FieldDefinition {
  return createJsonField(
    collection,
    "payload",
    "JSON payload consumed by the storefront",
    "{}"
  );
}

function createStatusField(
  collection: string,
  options?: {
    group?: string;
  }
): FieldDefinition {
  return {
    field: "status",
    type: "string",
    meta: {
      interface: "select-dropdown",
      width: "half",
      required: true,
      note: "Editorial status for storefront content",
      options: {
        choices: [
          { text: "Draft", value: "draft" },
          { text: "Published", value: "published" }
        ]
      },
      group: options?.group ?? null
    },
    schema: {
      name: "status",
      table: collection,
      data_type: "character varying",
      max_length: 32,
      is_nullable: false,
      default_value: "published"
    }
  };
}

function createGroupField(
  collection: string,
  field: string,
  title: string,
  options?: {
    icon?: string;
    color?: string;
    start?: "open" | "closed";
  }
): FieldDefinition {
  return {
    field,
    type: "alias",
    meta: {
      interface: "group-detail",
      special: ["alias", "no-data", "group"],
      width: "full",
      note: title,
      options: {
        start: options?.start ?? "open",
        headerIcon: options?.icon ?? "edit_note",
        headerColor: options?.color ?? "var(--theme--foreground-accent)"
      }
    },
    schema: null
  };
}

function serializeFieldDefinition(field: FieldDefinition, sort: number) {
  return {
    field: field.field,
    type: field.type,
    meta: {
      ...field.meta,
      sort
    },
    ...(field.schema ? { schema: field.schema } : {})
  };
}

const collections: CollectionDefinition[] = [
  {
    collection: "storefront_pages",
    icon: "article",
    displayTemplate: "{{slug}}",
    note: "Page-level JSON payloads for catalog and live page chrome",
    fields: [
      createSlugField("storefront_pages"),
      createPayloadField("storefront_pages"),
      createStatusField("storefront_pages")
    ]
  },
  {
    collection: "storefront_route_payloads",
    icon: "data_object",
    displayTemplate: "{{slug}}",
    note: "Route payloads for home, catalog, live, promotions, vip, and tournaments",
    fields: [
      createSlugField("storefront_route_payloads"),
      createPayloadField("storefront_route_payloads"),
      createStatusField("storefront_route_payloads")
    ]
  },
  {
    collection: "storefront_imported_pages",
    icon: "newsstand",
    displayTemplate: "{{slug}} / {{heading}}",
    note: "Field-based imported SlotCity pages with editable hero and HTML body",
    fields: [
      createGroupField("storefront_imported_pages", "route_settings", "Route settings", {
        icon: "route"
      }),
      createSlugField("storefront_imported_pages", {
        width: "full",
        group: "route_settings",
        readonly: true
      }),
      createStringField("storefront_imported_pages", "locale", "Page locale", {
        required: true,
        defaultValue: "uk",
        interface: "select-dropdown",
        interfaceOptions: {
          choices: storefrontImportedLocaleChoices
        },
        group: "route_settings"
      }),
      createStringField("storefront_imported_pages", "page_type", "Imported page type", {
        required: true,
        defaultValue: "page",
        interface: "select-dropdown",
        interfaceOptions: {
          choices: storefrontImportedPageTypeChoices
        },
        group: "route_settings"
      }),
      createStringField("storefront_imported_pages", "shell_route", "Shell route override", {
        interface: "select-dropdown",
        interfaceOptions: {
          choices: storefrontImportedShellRouteChoices
        },
        group: "route_settings"
      }),
      createStatusField("storefront_imported_pages", {
        group: "route_settings"
      }),
      createGroupField("storefront_imported_pages", "hero_content", "Hero & SEO", {
        icon: "image"
      }),
      createStringField("storefront_imported_pages", "kicker", "Small label above the heading", {
        width: "full",
        group: "hero_content"
      }),
      createStringField("storefront_imported_pages", "title", "Meta title", {
        width: "full",
        required: true,
        group: "hero_content"
      }),
      createStringField("storefront_imported_pages", "heading", "Visible H1 heading", {
        width: "full",
        required: true,
        group: "hero_content"
      }),
      createTextField(
        "storefront_imported_pages",
        "description",
        "Hero description / meta description",
        {
          group: "hero_content"
        }
      ),
      createFileField(
        "storefront_imported_pages",
        "hero_image",
        "Optional Directus file for the hero image",
        {
          group: "hero_content"
        }
      ),
      createStringField(
        "storefront_imported_pages",
        "hero_image_url",
        "Fallback absolute hero image URL",
        {
          width: "full",
          group: "hero_content"
        }
      ),
      createGroupField("storefront_imported_pages", "body_content", "Body HTML", {
        icon: "code"
      }),
      createTextField(
        "storefront_imported_pages",
        "content_html",
        "Editable HTML body rendered inside the mobile shell",
        {
          interface: "input-rich-text-html",
          group: "body_content"
        }
      ),
      createGroupField("storefront_imported_pages", "imported_source", "Imported source", {
        icon: "travel_explore",
        start: "closed"
      }),
      createStringField("storefront_imported_pages", "source_url", "Original SlotCity page URL", {
        width: "full",
        group: "imported_source",
        readonly: true
      }),
      createStringField(
        "storefront_imported_pages",
        "canonical_url",
        "Canonical URL for the mirrored page",
        {
          width: "full",
          group: "imported_source",
          readonly: true
        }
      ),
      createStringField("storefront_imported_pages", "extracted_at", "Timestamp of the last source import", {
        width: "full",
        group: "imported_source",
        readonly: true
      })
    ]
  },
  {
    collection: "storefront_imported_breadcrumbs",
    icon: "format_list_bulleted",
    displayTemplate: "{{page_slug}} / {{label}}",
    note: "Repeatable breadcrumbs for imported SlotCity pages",
    fields: [
      createSlugField("storefront_imported_breadcrumbs"),
      createStringField(
        "storefront_imported_breadcrumbs",
        "page_slug",
        "Exact imported page slug this breadcrumb belongs to",
        {
          required: true,
          width: "full"
        }
      ),
      createIntegerField(
        "storefront_imported_breadcrumbs",
        "position",
        "Breadcrumb order inside the page"
      ),
      createStringField("storefront_imported_breadcrumbs", "label", "Breadcrumb label", {
        required: true,
        width: "full"
      }),
      createStringField("storefront_imported_breadcrumbs", "href", "Breadcrumb href", {
        required: true,
        width: "full"
      }),
      createStatusField("storefront_imported_breadcrumbs")
    ]
  },
  {
    collection: "storefront_banners",
    icon: "photo_library",
    displayTemplate: "{{route}} / {{kind}} / {{title}}",
    note: "Banner and slider records with uploadable images for the storefront",
    fields: [
      createSlugField("storefront_banners"),
      createStringField("storefront_banners", "route", "Storefront route", {
        required: true,
        interface: "select-dropdown",
        interfaceOptions: {
          choices: storefrontRouteChoices
        }
      }),
      createStringField("storefront_banners", "kind", "Banner kind", {
        required: true,
        interface: "select-dropdown",
        interfaceOptions: {
          choices: [
            { text: "Promo strip", value: "promo_strip" },
            { text: "Hero slider", value: "hero_slider" },
            { text: "Promo slider", value: "promo_slider" },
            { text: "Feature banner", value: "feature_banner" },
            { text: "Partner banner", value: "partner_banner" }
          ]
        }
      }),
      createIntegerField("storefront_banners", "position", "Sort position inside the banner group"),
      createStringField("storefront_banners", "kicker", "Small label above the title"),
      createStringField("storefront_banners", "title", "Primary banner title", {
        width: "full"
      }),
      createTextField("storefront_banners", "body", "Banner body copy"),
      createStringField("storefront_banners", "href", "Primary link target", {
        width: "full"
      }),
      createStringField("storefront_banners", "primary_label", "Primary CTA label"),
      createStringField("storefront_banners", "primary_href", "Primary CTA URL", {
        width: "full"
      }),
      createStringField("storefront_banners", "secondary_label", "Secondary CTA label"),
      createStringField("storefront_banners", "secondary_href", "Secondary CTA URL", {
        width: "full"
      }),
      createStringField("storefront_banners", "accent", "Accent token"),
      createStringField("storefront_banners", "color", "Accent color"),
      createStringField("storefront_banners", "cta_label", "CTA label"),
      createStringField("storefront_banners", "cta_caption", "Secondary CTA caption"),
      createJsonField("storefront_banners", "tags", "Array of banner tags"),
      createJsonField("storefront_banners", "chips", "Array of chips"),
      createJsonField("storefront_banners", "stats", "Array of stat objects"),
      createFileField("storefront_banners", "image", "Uploadable banner image from Directus Files"),
      createStringField("storefront_banners", "image_url", "Fallback static image URL", {
        width: "full"
      }),
      createStatusField("storefront_banners")
    ]
  },
  {
    collection: "storefront_sections",
    icon: "edit_note",
    displayTemplate: "{{route}} / {{section_key}} / {{title}}",
    note: "Operator-friendly text and card sections for the storefront",
    fields: [
      createSlugField("storefront_sections"),
      createStringField("storefront_sections", "route", "Storefront route", {
        required: true,
        interface: "select-dropdown",
        interfaceOptions: {
          choices: storefrontRouteChoices
        }
      }),
      createStringField("storefront_sections", "section_key", "Section slot in the storefront", {
        required: true,
        interface: "select-dropdown",
        interfaceOptions: {
          choices: storefrontSectionChoices
        }
      }),
      createIntegerField("storefront_sections", "position", "Sort position inside the section group"),
      createStringField("storefront_sections", "kicker", "Small label above the title"),
      createStringField("storefront_sections", "title", "Primary section title", {
        width: "full"
      }),
      createTextField("storefront_sections", "body", "Section body copy"),
      createTextField("storefront_sections", "note", "Optional extra note or disclaimer"),
      createStringField("storefront_sections", "badge", "Badge or short pill label"),
      createStringField("storefront_sections", "image_alt", "Accessible alt text", {
        width: "full"
      }),
      createStringField("storefront_sections", "search_placeholder", "Search field placeholder", {
        width: "full"
      }),
      createStringField("storefront_sections", "search_shortcut", "Search shortcut or hint"),
      createStringField("storefront_sections", "pill_label", "Short pill label"),
      createStringField("storefront_sections", "href", "Primary target link", {
        width: "full"
      }),
      createStringField("storefront_sections", "primary_label", "Primary CTA label"),
      createStringField("storefront_sections", "primary_href", "Primary CTA URL", {
        width: "full"
      }),
      createStringField("storefront_sections", "secondary_label", "Secondary CTA label"),
      createStringField("storefront_sections", "secondary_href", "Secondary CTA URL", {
        width: "full"
      }),
      createStringField("storefront_sections", "cta_label", "CTA label"),
      createStringField("storefront_sections", "cta_caption", "CTA caption"),
      createStringField("storefront_sections", "email", "Email value", {
        width: "full"
      }),
      createStringField("storefront_sections", "phone", "Phone value"),
      createStringField("storefront_sections", "address", "Postal address", {
        width: "full"
      }),
      createStringField("storefront_sections", "locale", "Locale label"),
      createStringField("storefront_sections", "hours", "Opening hours", {
        width: "full"
      }),
      createStringField("storefront_sections", "age", "Age mark"),
      createStringField("storefront_sections", "bottom_email", "Bottom footer email", {
        width: "full"
      }),
      createTextField("storefront_sections", "bottom_note", "Bottom footer note"),
      createJsonField("storefront_sections", "meta", "Array of short badges or meta rows"),
      createJsonField(
        "storefront_sections",
        "paragraphs",
        "Array of supporting paragraphs",
        "[]"
      ),
      createFileField("storefront_sections", "image", "Optional Directus file for future editorial use"),
      createStringField("storefront_sections", "image_url", "Fallback static image URL", {
        width: "full"
      }),
      createStatusField("storefront_sections")
    ]
  },
  {
    collection: "storefront_section_items",
    icon: "view_carousel",
    displayTemplate: "{{route}} / {{section_key}} / {{title}} {{label}}",
    note: "Cards, list items, shelves, and supporting rows rendered across the storefront",
    fields: [
      createSlugField("storefront_section_items"),
      createStringField("storefront_section_items", "route", "Storefront route", {
        required: true,
        interface: "select-dropdown",
        interfaceOptions: {
          choices: storefrontRouteChoices
        }
      }),
      createStringField(
        "storefront_section_items",
        "section_key",
        "Section slot or shelf key in the storefront",
        {
          required: true,
          interface: "select-dropdown",
          interfaceOptions: {
            choices: storefrontItemSectionChoices
          }
        }
      ),
      createStringField("storefront_section_items", "item_type", "Item rendering type", {
        required: true,
        interface: "select-dropdown",
        interfaceOptions: {
          choices: storefrontItemTypeChoices
        }
      }),
      createIntegerField("storefront_section_items", "position", "Sort position inside the item group"),
      createStringField("storefront_section_items", "group_label", "Optional group title", {
        width: "full"
      }),
      createStringField("storefront_section_items", "label", "Short label"),
      createStringField("storefront_section_items", "title", "Primary title", {
        width: "full"
      }),
      createTextField("storefront_section_items", "body", "Body copy"),
      createStringField("storefront_section_items", "value", "Secondary value", {
        width: "full"
      }),
      createStringField("storefront_section_items", "href", "Link target", {
        width: "full"
      }),
      createStringField("storefront_section_items", "provider", "Provider or subtitle"),
      createStringField("storefront_section_items", "rank", "Rank or badge"),
      createStringField("storefront_section_items", "mark", "Short mark"),
      createStringField("storefront_section_items", "tone", "Visual tone token"),
      createStringField("storefront_section_items", "variant", "Button or chip variant"),
      createBooleanField("storefront_section_items", "is_active", "Whether the chip is active"),
      createStringField("storefront_section_items", "caption", "Caption or store badge note", {
        width: "full"
      }),
      createIntegerField("storefront_section_items", "width", "Preferred media width"),
      createIntegerField("storefront_section_items", "height", "Preferred media height"),
      createJsonField("storefront_section_items", "values", "Array of supporting values", "[]"),
      createFileField("storefront_section_items", "image", "Uploadable Directus image or artwork"),
      createStringField("storefront_section_items", "image_url", "Fallback static image URL", {
        width: "full"
      }),
      createStatusField("storefront_section_items")
    ]
  }
];

async function ensureCollection(definition: CollectionDefinition) {
  const existingCollections = await request<{ data: Array<{ collection: string }> }>(
    `/collections`
  );
  const existing = existingCollections.data.some(
    (entry) => entry.collection === definition.collection
  );

  if (!existing) {
    await request<{ data: { collection: string } }>(`/collections`, {
      method: "POST",
      body: JSON.stringify({
        collection: definition.collection,
        meta: {
          collection: definition.collection,
          icon: definition.icon,
          note: definition.note,
          hidden: false,
          singleton: false,
          display_template: definition.displayTemplate
        },
        schema: {
          name: definition.collection
        },
        fields: definition.fields.map((field, index) => serializeFieldDefinition(field, index + 1))
      })
    });
    console.log(`created collection ${definition.collection}`);
    return;
  }

  await request<{ data: { collection: string } }>(`/collections/${definition.collection}`, {
    method: "PATCH",
    body: JSON.stringify({
      meta: {
        icon: definition.icon,
        note: definition.note,
        hidden: false,
        singleton: false,
        display_template: definition.displayTemplate
      }
    })
  });

  const fields = await request<{ data: Array<{ field: string }> }>(
    `/fields/${definition.collection}`
  );
  const existingFields = new Set(fields.data.map((field) => field.field));

  for (const [index, field] of definition.fields.entries()) {
    const fieldPayload = serializeFieldDefinition(field, index + 1);

    if (!existingFields.has(field.field)) {
      await request<{ data: { field: string } }>(`/fields/${definition.collection}`, {
        method: "POST",
        body: JSON.stringify(fieldPayload)
      });
      console.log(`created field ${definition.collection}.${field.field}`);
      continue;
    }

    await request<{ data: { field: string } }>(
      `/fields/${definition.collection}/${field.field}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          meta: fieldPayload.meta
        })
      }
    );
    console.log(`updated field meta ${definition.collection}.${field.field}`);
  }
}

async function ensureDirectusRelation(
  collection: string,
  field: string,
  relatedCollection: string
) {
  const relations = await request<{
    data: Array<{ many_collection: string; many_field: string; one_collection?: string | null }>;
  }>(`/relations`);

  const existing = relations.data.find(
    (relation) =>
      relation.many_collection === collection &&
      relation.many_field === field &&
      relation.one_collection === relatedCollection
  );

  if (existing) {
    return;
  }

  try {
    await request(`/relations`, {
      method: "POST",
      body: JSON.stringify({
        collection,
        field,
        related_collection: relatedCollection,
        schema: {
          table: collection,
          column: field,
          foreign_key_table: relatedCollection
        },
        meta: {
          many_collection: collection,
          many_field: field,
          one_collection: relatedCollection,
          one_deselect_action: "nullify"
        }
      })
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("already has an associated relationship")
    ) {
      console.log(`relation ${collection}.${field} already exists`);
      return;
    }

    throw error;
  }

  console.log(`created relation ${collection}.${field} -> ${relatedCollection}`);
}

async function upsertBySlug(
  collection: string,
  records: Array<{ slug: string; payload: unknown }>
) {
  for (const record of records) {
    const existing = await request<{ data?: Array<{ id: number | string }> }>(
      `/items/${collection}?filter[slug][_eq]=${encodeURIComponent(record.slug)}&fields=id`
    );

    const body = JSON.stringify({
      slug: record.slug,
      payload: record.payload,
      status: contentStatus
    });

    if (existing.data?.[0]?.id) {
      await request<{ data?: { id: number | string } }>(
        `/items/${collection}/${existing.data[0].id}`,
        {
          method: "PATCH",
          body
        }
      );
      console.log(`updated ${collection}:${record.slug}`);
      continue;
    }

    await request<{ data?: { id: number | string } }>(`/items/${collection}`, {
      method: "POST",
      body
    });
    console.log(`created ${collection}:${record.slug}`);
  }
}

async function upsertFlatRecords(
  collection: string,
  records: Array<{ slug: string } & Record<string, unknown>>
) {
  for (const record of records) {
    const existing = await request<{ data?: Array<{ id: number | string }> }>(
      `/items/${collection}?filter[slug][_eq]=${encodeURIComponent(record.slug)}&fields=id`
    );

    const body = JSON.stringify({
      ...record,
      status: contentStatus
    });

    if (existing.data?.[0]?.id) {
      await request<{ data?: { id: number | string } }>(
        `/items/${collection}/${existing.data[0].id}`,
        {
          method: "PATCH",
          body
        }
      );
      console.log(`updated ${collection}:${record.slug}`);
      continue;
    }

    await request<{ data?: { id: number | string } }>(`/items/${collection}`, {
      method: "POST",
      body
    });
    console.log(`created ${collection}:${record.slug}`);
  }
}

async function upsertBannerRecords(records: BannerRecord[]) {
  await upsertFlatRecords("storefront_banners", records);
}

async function ensurePublicReadPermission(collection: string) {
  const policies = await request<{
    data: Array<{ id: string; admin_access: boolean; app_access: boolean }>;
  }>(`/policies`);
  const publicPolicy = policies.data.find(
    (policy) => !policy.admin_access && !policy.app_access
  );

  if (!publicPolicy) {
    throw new Error("Public Directus policy was not found.");
  }

  const permissions = await request<{
    data: Array<{ collection: string; action: string; policy: string }>;
  }>(`/permissions`);
  const existing = permissions.data.some(
    (permission) =>
      permission.collection === collection &&
      permission.action === "read" &&
      permission.policy === publicPolicy.id
  );

  if (existing) {
    return;
  }

  await request(`/permissions`, {
    method: "POST",
    body: JSON.stringify({
      collection,
      action: "read",
      permissions: {
        status: {
          _eq: "published"
        }
      },
      validation: null,
      presets: null,
      fields: ["*"],
      policy: publicPolicy.id
    })
  });

  console.log(`created public read permission for ${collection}`);
}

function buildBannerRecords(): BannerRecord[] {
  return [
    ...mockHomeRouteContent.heroPromos.map((promo, index) => ({
      slug: `home-promo-strip-${promo.id}`,
      route: "home" as const,
      kind: "promo_strip" as const,
      position: index + 1,
      kicker: promo.kicker,
      title: promo.title,
      href: promo.href,
      image_url: promo.image
    })),
    ...mockHomeRouteContent.heroSliderSlides.map((slide, index) => ({
      slug: `home-hero-slider-${slide.id}`,
      route: "home" as const,
      kind: "hero_slider" as const,
      position: index + 1,
      kicker: slide.eyebrow,
      title: slide.title,
      body: slide.body,
      primary_label: slide.primaryLabel,
      primary_href: slide.primaryHref,
      secondary_label: slide.secondaryLabel,
      secondary_href: slide.secondaryHref,
      accent: slide.accent,
      chips: slide.chips,
      stats: slide.stats,
      image_url: slide.image
    })),
    ...mockHomeRouteContent.promotionSliderSlides.map((slide, index) => ({
      slug: `home-promo-slider-${slide.id}`,
      route: "home" as const,
      kind: "promo_slider" as const,
      position: index + 1,
      kicker: slide.kicker,
      title: slide.title,
      body: slide.body,
      href: slide.href,
      color: slide.color,
      cta_label: slide.ctaLabel,
      image_url: slide.image
    })),
    {
      slug: "home-feature-banner",
      route: "home",
      kind: "feature_banner",
      position: 1,
      kicker: mockHomeRouteContent.middleBanner.kicker,
      title: mockHomeRouteContent.middleBanner.title,
      body: mockHomeRouteContent.middleBanner.body,
      href: mockHomeRouteContent.middleBanner.href,
      cta_label: mockHomeRouteContent.middleBanner.ctaLabel,
      cta_caption: mockHomeRouteContent.middleBanner.ctaCaption,
      tags: mockHomeRouteContent.middleBanner.tags,
      image_url: mockHomeRouteContent.middleBanner.image
    },
    {
      slug: "home-partner-banner",
      route: "home",
      kind: "partner_banner",
      position: 1,
      kicker: mockHomeRouteContent.partnerBanner.kicker,
      title: mockHomeRouteContent.partnerBanner.title,
      body: mockHomeRouteContent.partnerBanner.body,
      href: mockHomeRouteContent.partnerBanner.href,
      cta_label: mockHomeRouteContent.partnerBanner.ctaLabel,
      cta_caption: mockHomeRouteContent.partnerBanner.ctaCaption,
      image_url: mockHomeRouteContent.partnerBanner.image
    },
    ...mockCatalogRouteContent.heroPromos.map((promo, index) => ({
      slug: `catalog-promo-strip-${promo.id}`,
      route: "catalog" as const,
      kind: "promo_strip" as const,
      position: index + 1,
      kicker: promo.kicker,
      title: promo.title,
      href: promo.href,
      image_url: promo.image
    })),
    {
      slug: "catalog-feature-banner",
      route: "catalog",
      kind: "feature_banner",
      position: 1,
      kicker: mockCatalogRouteContent.featureBanner.kicker,
      title: mockCatalogRouteContent.featureBanner.title,
      body: mockCatalogRouteContent.featureBanner.body,
      href: mockCatalogRouteContent.featureBanner.href,
      cta_label: mockCatalogRouteContent.featureBanner.ctaLabel,
      cta_caption: mockCatalogRouteContent.featureBanner.ctaCaption,
      tags: mockCatalogRouteContent.featureBanner.tags,
      image_url: mockCatalogRouteContent.featureBanner.image
    },
    {
      slug: "catalog-partner-banner",
      route: "catalog",
      kind: "partner_banner",
      position: 1,
      kicker: mockCatalogRouteContent.partnerBanner.kicker,
      title: mockCatalogRouteContent.partnerBanner.title,
      body: mockCatalogRouteContent.partnerBanner.body,
      href: mockCatalogRouteContent.partnerBanner.href,
      cta_label: mockCatalogRouteContent.partnerBanner.ctaLabel,
      cta_caption: mockCatalogRouteContent.partnerBanner.ctaCaption,
      image_url: mockCatalogRouteContent.partnerBanner.image
    },
    ...mockLiveRouteContent.heroPromos.map((promo, index) => ({
      slug: `live-promo-strip-${promo.id}`,
      route: "live" as const,
      kind: "promo_strip" as const,
      position: index + 1,
      kicker: promo.kicker,
      title: promo.title,
      href: promo.href,
      image_url: promo.image
    })),
    {
      slug: "live-feature-banner",
      route: "live",
      kind: "feature_banner",
      position: 1,
      kicker: mockLiveRouteContent.featureBanner.kicker,
      title: mockLiveRouteContent.featureBanner.title,
      body: mockLiveRouteContent.featureBanner.body,
      href: mockLiveRouteContent.featureBanner.href,
      cta_label: mockLiveRouteContent.featureBanner.ctaLabel,
      cta_caption: mockLiveRouteContent.featureBanner.ctaCaption,
      tags: mockLiveRouteContent.featureBanner.tags,
      image_url: mockLiveRouteContent.featureBanner.image
    },
    {
      slug: "live-partner-banner",
      route: "live",
      kind: "partner_banner",
      position: 1,
      kicker: mockLiveRouteContent.partnerBanner.kicker,
      title: mockLiveRouteContent.partnerBanner.title,
      body: mockLiveRouteContent.partnerBanner.body,
      href: mockLiveRouteContent.partnerBanner.href,
      cta_label: mockLiveRouteContent.partnerBanner.ctaLabel,
      cta_caption: mockLiveRouteContent.partnerBanner.ctaCaption,
      image_url: mockLiveRouteContent.partnerBanner.image
    }
  ];
}

function normalizeSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSlug(...parts: Array<string | number | undefined>) {
  return parts
    .map((part) => (part === undefined ? "" : normalizeSlugPart(String(part))))
    .filter(Boolean)
    .join("-");
}

function buildSectionRecords(): SectionRecord[] {
  return [
    {
      slug: "home-bonus-bar",
      route: "home",
      section_key: "bonus_bar",
      position: 1,
      kicker: mockHomeRouteContent.bonusBar.kicker,
      title: mockHomeRouteContent.bonusBar.title,
      body: mockHomeRouteContent.bonusBar.body,
      primary_label: mockHomeRouteContent.bonusBar.primaryLabel,
      primary_href: mockHomeRouteContent.bonusBar.primaryHref,
      secondary_label: mockHomeRouteContent.bonusBar.secondaryLabel,
      secondary_href: mockHomeRouteContent.bonusBar.secondaryHref
    },
    {
      slug: "home-app-card",
      route: "home",
      section_key: "app_card",
      position: 2,
      kicker: mockHomeRouteContent.appCard.kicker,
      title: mockHomeRouteContent.appCard.title,
      body: mockHomeRouteContent.appCard.body,
      meta: mockHomeRouteContent.appCard.meta,
      cta_label: mockHomeRouteContent.appCard.actionLabel,
      href: mockHomeRouteContent.appCard.actionHref
    },
    {
      slug: "home-social-card",
      route: "home",
      section_key: "social_card",
      position: 3,
      kicker: mockHomeRouteContent.socialCard.kicker,
      title: mockHomeRouteContent.socialCard.title,
      body: mockHomeRouteContent.socialCard.body
    },
    {
      slug: "home-legal-card",
      route: "home",
      section_key: "legal_card",
      position: 4,
      kicker: mockHomeRouteContent.legalCard.kicker,
      title: mockHomeRouteContent.legalCard.title,
      body: mockHomeRouteContent.legalCard.body,
      meta: mockHomeRouteContent.legalCard.meta
    },
    {
      slug: "home-mobile-info-hub",
      route: "home",
      section_key: "mobile_info_hub",
      position: 5,
      kicker: mockHomeRouteContent.mobileInfoHub.kicker,
      title: mockHomeRouteContent.mobileInfoHub.title,
      body: mockHomeRouteContent.mobileInfoHub.body
    },
    {
      slug: "home-seo-lead",
      route: "home",
      section_key: "seo_lead",
      position: 6,
      kicker: mockHomeRouteContent.seoLead.kicker,
      title: mockHomeRouteContent.seoLead.title
    },
    {
      slug: "home-bonus-seo-card",
      route: "home",
      section_key: "bonus_seo_card",
      position: 7,
      kicker: mockHomeRouteContent.bonusSeoCard.kicker,
      title: mockHomeRouteContent.bonusSeoCard.title,
      body: mockHomeRouteContent.bonusSeoCard.body,
      note: mockHomeRouteContent.bonusSeoCard.note,
      paragraphs: mockHomeRouteContent.bonusSeoCard.paragraphs
    },
    {
      slug: "home-app-seo-card",
      route: "home",
      section_key: "app_seo_card",
      position: 8,
      kicker: mockHomeRouteContent.appSeoCard.kicker,
      title: mockHomeRouteContent.appSeoCard.title,
      body: mockHomeRouteContent.appSeoCard.body,
      note: mockHomeRouteContent.appSeoCard.note,
      paragraphs: mockHomeRouteContent.appSeoCard.paragraphs
    },
    {
      slug: "home-responsible-seo-card",
      route: "home",
      section_key: "responsible_seo_card",
      position: 9,
      kicker: mockHomeRouteContent.responsibleSeoCard.kicker,
      title: mockHomeRouteContent.responsibleSeoCard.title,
      body: mockHomeRouteContent.responsibleSeoCard.body,
      note: mockHomeRouteContent.responsibleSeoCard.note,
      paragraphs: mockHomeRouteContent.responsibleSeoCard.paragraphs
    },
    {
      slug: "home-footer-brand",
      route: "home",
      section_key: "footer_brand",
      position: 10,
      title: mockHomeRouteContent.footerBrand.title,
      body: mockHomeRouteContent.footerBrand.body
    },
    {
      slug: "home-footer-meta",
      route: "home",
      section_key: "footer_meta",
      position: 11,
      email: mockHomeRouteContent.footerMeta.email,
      phone: mockHomeRouteContent.footerMeta.phone,
      address: mockHomeRouteContent.footerMeta.address,
      locale: mockHomeRouteContent.footerMeta.locale,
      hours: mockHomeRouteContent.footerMeta.hours,
      age: mockHomeRouteContent.footerMeta.age,
      bottom_email: mockHomeRouteContent.footerMeta.bottomEmail,
      bottom_note: mockHomeRouteContent.footerMeta.bottomNote
    },
    {
      slug: "catalog-hero",
      route: "catalog",
      section_key: "catalog_hero",
      position: 12,
      kicker: mockCatalogPageData.hero.kicker,
      title: mockCatalogPageData.hero.title,
      body: mockCatalogPageData.hero.body,
      image_url: mockCatalogPageData.hero.image,
      image_alt: mockCatalogPageData.hero.imageAlt
    },
    {
      slug: "catalog-console",
      route: "catalog",
      section_key: "catalog_console",
      position: 13,
      kicker: mockCatalogPageData.console.label,
      badge: mockCatalogPageData.console.badge,
      image_url: mockCatalogPageData.console.image,
      image_alt: mockCatalogPageData.console.imageAlt,
      search_placeholder: mockCatalogPageData.console.searchPlaceholder,
      search_shortcut: mockCatalogPageData.console.searchShortcut
    },
    {
      slug: "live-hero",
      route: "live",
      section_key: "live_hero",
      position: 14,
      kicker: mockLivePageData.hero.kicker,
      title: mockLivePageData.hero.title,
      body: mockLivePageData.hero.body,
      image_url: mockLivePageData.hero.image,
      image_alt: mockLivePageData.hero.imageAlt
    },
    {
      slug: "live-console",
      route: "live",
      section_key: "live_console",
      position: 15,
      kicker: mockLivePageData.console.featuredLabel,
      title: mockLivePageData.console.featuredTitle,
      body: mockLivePageData.console.featuredBody,
      image_url: mockLivePageData.console.image,
      image_alt: mockLivePageData.console.imageAlt,
      pill_label: mockLivePageData.console.pillLabel
    },
    {
      slug: "home-top-slots-header",
      route: "home",
      section_key: "home_top_slots_header",
      position: 16,
      title: mockHomeRouteContent.topSlotsHeader.title,
      cta_label: mockHomeRouteContent.topSlotsHeader.ctaLabel,
      href: mockHomeRouteContent.topSlotsHeader.ctaHref
    },
    {
      slug: "home-live-header",
      route: "home",
      section_key: "home_live_header",
      position: 17,
      title: mockHomeRouteContent.liveHeader.title,
      cta_label: mockHomeRouteContent.liveHeader.ctaLabel,
      href: mockHomeRouteContent.liveHeader.ctaHref
    },
    {
      slug: "home-bonus-header",
      route: "home",
      section_key: "home_bonus_header",
      position: 18,
      title: mockHomeRouteContent.bonusGamesHeader.title,
      cta_label: mockHomeRouteContent.bonusGamesHeader.ctaLabel,
      href: mockHomeRouteContent.bonusGamesHeader.ctaHref
    },
    {
      slug: "home-monthly-top-header",
      route: "home",
      section_key: "home_monthly_top_header",
      position: 19,
      title: mockHomeRouteContent.monthlyTopHeader.title,
      cta_label: mockHomeRouteContent.monthlyTopHeader.ctaLabel,
      href: mockHomeRouteContent.monthlyTopHeader.ctaHref
    },
    {
      slug: "home-promotions-header",
      route: "home",
      section_key: "home_promotions_header",
      position: 20,
      title: mockHomeRouteContent.promotionsHeader.title,
      cta_label: mockHomeRouteContent.promotionsHeader.ctaLabel,
      href: mockHomeRouteContent.promotionsHeader.ctaHref
    },
    {
      slug: "catalog-game-hall-header",
      route: "catalog",
      section_key: "catalog_game_hall_header",
      position: 21,
      title: mockCatalogRouteContent.gameHallHeader.title,
      cta_label: mockCatalogRouteContent.gameHallHeader.ctaLabel,
      href: mockCatalogRouteContent.gameHallHeader.ctaHref
    },
    {
      slug: "catalog-discovery-header",
      route: "catalog",
      section_key: "catalog_discovery_header",
      position: 22,
      title: mockCatalogRouteContent.discoveryHeader.title,
      body: mockCatalogRouteContent.discoveryHeader.body,
      cta_label: mockCatalogRouteContent.discoveryHeader.ctaLabel,
      href: mockCatalogRouteContent.discoveryHeader.ctaHref
    },
    {
      slug: "catalog-live-header",
      route: "catalog",
      section_key: "catalog_live_header",
      position: 23,
      title: mockCatalogRouteContent.liveHeader.title,
      cta_label: mockCatalogRouteContent.liveHeader.ctaLabel,
      href: mockCatalogRouteContent.liveHeader.ctaHref
    },
    {
      slug: "catalog-bonus-header",
      route: "catalog",
      section_key: "catalog_bonus_header",
      position: 24,
      title: mockCatalogRouteContent.bonusHeader.title,
      cta_label: mockCatalogRouteContent.bonusHeader.ctaLabel,
      href: mockCatalogRouteContent.bonusHeader.ctaHref
    },
    {
      slug: "catalog-monthly-top-header",
      route: "catalog",
      section_key: "catalog_monthly_top_header",
      position: 25,
      title: mockCatalogRouteContent.monthlyTopHeader.title,
      cta_label: mockCatalogRouteContent.monthlyTopHeader.ctaLabel,
      href: mockCatalogRouteContent.monthlyTopHeader.ctaHref
    },
    {
      slug: "home-monthly-featured-card",
      route: "home",
      section_key: "home_monthly_featured_card",
      position: 26,
      kicker: mockHomeRouteContent.monthlyFeaturedCard.badge,
      body: mockHomeRouteContent.monthlyFeaturedCard.body,
      cta_label: mockHomeRouteContent.monthlyFeaturedCard.ctaLabel,
      href: mockHomeRouteContent.monthlyFeaturedCard.href
    },
    {
      slug: "live-main-lobby-header",
      route: "live",
      section_key: "live_main_lobby_header",
      position: 27,
      title: mockLiveRouteContent.mainLobbyHeader.title,
      cta_label: mockLiveRouteContent.mainLobbyHeader.ctaLabel,
      href: mockLiveRouteContent.mainLobbyHeader.ctaHref
    },
    {
      slug: "live-comeback-header",
      route: "live",
      section_key: "live_comeback_header",
      position: 28,
      title: mockLiveRouteContent.comebackHeader.title,
      cta_label: mockLiveRouteContent.comebackHeader.ctaLabel,
      href: mockLiveRouteContent.comebackHeader.ctaHref
    },
    {
      slug: "live-prime-tables-header",
      route: "live",
      section_key: "live_prime_tables_header",
      position: 29,
      title: mockLiveRouteContent.primeTablesHeader.title,
      cta_label: mockLiveRouteContent.primeTablesHeader.ctaLabel,
      href: mockLiveRouteContent.primeTablesHeader.ctaHref
    },
    {
      slug: "live-cross-sell-header",
      route: "live",
      section_key: "live_cross_sell_header",
      position: 30,
      title: mockLiveRouteContent.crossSellHeader.title,
      cta_label: mockLiveRouteContent.crossSellHeader.ctaLabel,
      href: mockLiveRouteContent.crossSellHeader.ctaHref
    }
  ];
}

function createGameTileItemRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: Array<{ id: string; title: string; provider: string; image: string; rank?: string }>
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, item.id || item.title || index + 1),
    route,
    section_key: sectionKey,
    item_type: "game_tile",
    position: index + 1,
    title: item.title,
    provider: item.provider,
    rank: item.rank,
    image_url: item.image
  }));
}

function createMiniGamePillItemRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: Array<{ id: string; title: string; image: string }>
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, item.id || item.title || index + 1),
    route,
    section_key: sectionKey,
    item_type: "mini_game_pill",
    position: index + 1,
    title: item.title,
    image_url: item.image
  }));
}

function createGiftCardItemRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: Array<{ id: string; title: string; body: string; image: string; tone: string }>
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, item.id || item.title || index + 1),
    route,
    section_key: sectionKey,
    item_type: "gift_card",
    position: index + 1,
    title: item.title,
    body: item.body,
    tone: item.tone,
    image_url: item.image
  }));
}

function createTextChipRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: string[]
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, item || index + 1),
    route,
    section_key: sectionKey,
    item_type: "text_chip",
    position: index + 1,
    label: item
  }));
}

function createTextEntryRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: string[]
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, index + 1),
    route,
    section_key: sectionKey,
    item_type: "text_entry",
    position: index + 1,
    body: item
  }));
}

function createCtaLinkRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: Array<{ id: string; label: string; href: string; variant: string }>
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, item.id || item.label || index + 1),
    route,
    section_key: sectionKey,
    item_type: "cta_link",
    position: index + 1,
    label: item.label,
    href: item.href,
    variant: item.variant
  }));
}

function createSurfaceChipRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: Array<{ id: string; label: string; active?: boolean }>
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, item.id || item.label || index + 1),
    route,
    section_key: sectionKey,
    item_type: "surface_chip",
    position: index + 1,
    label: item.label,
    is_active: item.active ?? false
  }));
}

function createInfoCardRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: Array<{ id: string; label: string; value: string; body: string }>
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, item.id || item.label || index + 1),
    route,
    section_key: sectionKey,
    item_type: "info_card",
    position: index + 1,
    label: item.label,
    value: item.value,
    body: item.body
  }));
}

function createNavItemRecords(
  route: "home" | "catalog" | "live",
  sectionKey: SectionItemRecord["section_key"],
  items: Array<{
    id: string;
    label: string;
    href: string;
    value?: string;
    mark?: string;
    variant?: string;
  }>
): SectionItemRecord[] {
  return items.map((item, index) => ({
    slug: buildSlug(route, sectionKey, item.id || item.label || index + 1),
    route,
    section_key: sectionKey,
    item_type: "nav_item",
    position: index + 1,
    label: item.label,
    href: item.href,
    value: item.value,
    mark: item.mark,
    variant: item.variant
  }));
}

function buildSectionItemRecords(): SectionItemRecord[] {
  return [
    ...createNavItemRecords(
      "home",
      "side_rail_items",
      mockHomeRouteContent.sideRailItems.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        value: item.short
      }))
    ),
    ...createNavItemRecords(
      "home",
      "mobile_dock_items",
      mockHomeRouteContent.mobileDockItems.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        mark: item.icon,
        value: item.modal,
        variant: item.modal ? "modal" : "link"
      }))
    ),
    ...createGameTileItemRecords("home", "top_slots", mockHomeRouteContent.topSlots),
    ...createGameTileItemRecords("home", "bonus_games", mockHomeRouteContent.bonusGames),
    ...createGameTileItemRecords("home", "live_games", mockHomeRouteContent.liveGames),
    ...createGameTileItemRecords("home", "monthly_top", mockHomeRouteContent.monthlyTop),
    ...createMiniGamePillItemRecords("home", "quick_picks", mockHomeRouteContent.quickPicks),
    ...createGiftCardItemRecords("home", "welcome_gifts", mockHomeRouteContent.welcomeGifts),
    ...mockHomeRouteContent.mobileInfoHub.links.map((item, index) => ({
      slug: buildSlug("home", "mobile_info_links", item.id || item.title || index + 1),
      route: "home" as const,
      section_key: "mobile_info_links" as const,
      item_type: "mobile_info_link" as const,
      position: index + 1,
      title: item.title,
      body: item.body,
      href: item.href
    })),
    ...mockHomeRouteContent.socialLinks.map((item, index) => ({
      slug: buildSlug("home", "social_links", item.id || item.label || index + 1),
      route: "home" as const,
      section_key: "social_links" as const,
      item_type: "social_link" as const,
      position: index + 1,
      label: item.label,
      href: item.href,
      mark: item.mark,
      tone: item.tone
    })),
    ...mockHomeRouteContent.faqItems.map((item, index) => ({
      slug: buildSlug("home", "faq_items", item.id || index + 1),
      route: "home" as const,
      section_key: "faq_items" as const,
      item_type: "faq_item" as const,
      position: index + 1,
      title: item.question,
      body: item.answer
    })),
    ...createTextChipRecords("home", "provider_highlights", mockHomeRouteContent.providerHighlights),
    ...mockHomeRouteContent.contactPoints.map((item, index) => ({
      slug: buildSlug("home", "contact_points", item.id || item.label || index + 1),
      route: "home" as const,
      section_key: "contact_points" as const,
      item_type: "contact_point" as const,
      position: index + 1,
      label: item.label,
      value: item.value,
      href: item.href
    })),
    ...mockHomeRouteContent.footerLinks.map((item, index) => ({
      slug: buildSlug("home", "footer_links", item.id || item.label || index + 1),
      route: "home" as const,
      section_key: "footer_links" as const,
      item_type: "footer_link" as const,
      position: index + 1,
      label: item.label,
      href: item.href
    })),
    ...mockHomeRouteContent.storeButtons.map((item, index) => ({
      slug: buildSlug("home", "store_buttons", item.id || item.title || index + 1),
      route: "home" as const,
      section_key: "store_buttons" as const,
      item_type: "store_button" as const,
      position: index + 1,
      title: item.title,
      caption: item.caption,
      width: item.width,
      height: item.height,
      image_url: item.image
    })),
    ...mockHomeRouteContent.footerGroups.flatMap((group, groupIndex) =>
      group.links.map((link, linkIndex) => ({
        slug: buildSlug(
          "home",
          "footer_group_links",
          group.id || group.title,
          link.id || link.label || linkIndex + 1
        ),
        route: "home" as const,
        section_key: "footer_group_links" as const,
        item_type: "footer_group_link" as const,
        position: groupIndex * 100 + linkIndex + 1,
        group_label: group.title,
        label: link.label,
        href: link.href
      }))
    ),
    ...createTextChipRecords("home", "payment_methods", mockHomeRouteContent.paymentMethods),
    ...createTextEntryRecords("home", "seo_intro", mockHomeRouteContent.seoIntro),
    ...mockHomeRouteContent.bonusMatrix.map((item, index) => ({
      slug: buildSlug("home", "bonus_matrix", item.id || item.label || index + 1),
      route: "home" as const,
      section_key: "bonus_matrix" as const,
      item_type: "matrix_row" as const,
      position: index + 1,
      label: item.label,
      values: item.values
    })),
    ...createTextEntryRecords("home", "bonus_slot_plan", mockHomeRouteContent.bonusSlotPlan),
    ...mockHomeRouteContent.appRequirements.map((item, index) => ({
      slug: buildSlug("home", "app_requirements", item.id || item.label || index + 1),
      route: "home" as const,
      section_key: "app_requirements" as const,
      item_type: "app_requirement" as const,
      position: index + 1,
      label: item.label,
      values: [item.android, item.ios]
    })),
    ...createTextEntryRecords("home", "android_steps", mockHomeRouteContent.androidSteps),
    ...createTextEntryRecords("home", "ios_steps", mockHomeRouteContent.iosSteps),
    ...createTextEntryRecords(
      "home",
      "responsible_points",
      mockHomeRouteContent.responsiblePoints
    ),
    ...createNavItemRecords(
      "catalog",
      "side_rail_items",
      mockCatalogRouteContent.sideRailItems.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        value: item.short
      }))
    ),
    ...createGameTileItemRecords("catalog", "top_slots", mockCatalogRouteContent.topSlots),
    ...createGameTileItemRecords(
      "catalog",
      "discovery_games",
      mockCatalogRouteContent.discoveryGames
    ),
    ...createGameTileItemRecords("catalog", "bonus_games", mockCatalogRouteContent.bonusGames),
    ...createGameTileItemRecords("catalog", "live_games", mockCatalogRouteContent.liveGames),
    ...createMiniGamePillItemRecords(
      "catalog",
      "quick_picks",
      mockCatalogRouteContent.quickPicks
    ),
    ...createGameTileItemRecords("catalog", "monthly_top", mockCatalogRouteContent.monthlyTop),
    ...createTextChipRecords(
      "catalog",
      "provider_highlights",
      mockCatalogRouteContent.providerHighlights
    ),
    ...createTextChipRecords(
      "catalog",
      "footer_signals",
      mockCatalogRouteContent.footerSignals
    ),
    ...createCtaLinkRecords("catalog", "catalog_hero_actions", mockCatalogPageData.hero.actions),
    ...createSurfaceChipRecords("catalog", "catalog_hero_chips", mockCatalogPageData.hero.chips),
    ...createSurfaceChipRecords(
      "catalog",
      "catalog_console_chips",
      mockCatalogPageData.console.chips
    ),
    ...createInfoCardRecords(
      "catalog",
      "catalog_console_footer_cards",
      mockCatalogPageData.console.footerCards
    ),
    ...createNavItemRecords(
      "live",
      "side_rail_items",
      mockLiveRouteContent.sideRailItems.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        value: item.short
      }))
    ),
    ...createGameTileItemRecords("live", "live_games", mockLiveRouteContent.liveGames),
    ...createGameTileItemRecords("live", "prime_tables", mockLiveRouteContent.primeTables),
    ...createGameTileItemRecords("live", "comeback_tables", mockLiveRouteContent.comebackTables),
    ...createGameTileItemRecords(
      "live",
      "slot_cross_sell",
      mockLiveRouteContent.slotCrossSell
    ),
    ...createTextChipRecords(
      "live",
      "provider_highlights",
      mockLiveRouteContent.providerHighlights
    ),
    ...createTextChipRecords("live", "footer_signals", mockLiveRouteContent.footerSignals),
    ...createCtaLinkRecords("live", "live_hero_actions", mockLivePageData.hero.actions),
    ...createTextEntryRecords("live", "live_hero_points", mockLivePageData.hero.points),
    ...createInfoCardRecords(
      "live",
      "live_console_footer_cards",
      mockLivePageData.console.footerCards
    ),
    ...createInfoCardRecords("live", "live_quick_return", mockLivePageData.quickReturn)
  ];
}

const rawRouteSeed = await readFile(routeSeedPath, "utf8");
const routeSeed = JSON.parse(rawRouteSeed) as RouteSeedFile;
const pageRecords = [
  { slug: "home", payload: mockHomePageData },
  { slug: "catalog", payload: mockCatalogPageData },
  { slug: "live", payload: mockLivePageData }
];

for (const definition of collections) {
  await ensureCollection(definition);
}

await ensureDirectusRelation("storefront_banners", "image", "directus_files");
await ensureDirectusRelation("storefront_sections", "image", "directus_files");
await ensureDirectusRelation("storefront_section_items", "image", "directus_files");
await ensureDirectusRelation("storefront_imported_pages", "hero_image", "directus_files");

await ensurePublicReadPermission("storefront_pages");
await ensurePublicReadPermission("storefront_route_payloads");
await ensurePublicReadPermission("storefront_imported_pages");
await ensurePublicReadPermission("storefront_imported_breadcrumbs");
await ensurePublicReadPermission("storefront_banners");
await ensurePublicReadPermission("storefront_sections");
await ensurePublicReadPermission("storefront_section_items");

await upsertBySlug("storefront_pages", pageRecords);
await upsertBySlug("storefront_route_payloads", routeSeed.storefront_route_payloads);
await upsertBannerRecords(buildBannerRecords());
await upsertFlatRecords("storefront_sections", buildSectionRecords());
await upsertFlatRecords("storefront_section_items", buildSectionItemRecords());

console.log("storefront CMS bootstrap complete");
