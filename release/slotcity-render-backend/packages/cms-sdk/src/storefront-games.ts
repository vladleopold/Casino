import { load } from "cheerio";

import { getImportedPagePayload } from "./imported-pages";
import { buildSlotcityDemoLookupKeys, findSlotcityDemoFallbackUrl } from "./slotcity-demo-fallbacks";
import {
  getCatalogRouteContent,
  getHomeRouteContent,
  getLiveRouteContent,
  getPromotionsRouteContent,
  getTournamentsRouteContent,
  getVipRouteContent
} from "./client";
import type {
  GameTileContent,
  StorefrontGameFactContent,
  StorefrontGameLaunchContent,
  StorefrontGamePage,
  StorefrontGameType
} from "./types";

declare const process: {
  env: Record<string, string | undefined>;
};

type NextFetchInit = RequestInit & {
  next?: {
    revalidate: number;
  };
};

function getTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timeoutId)
  };
}

type DirectusImageRef = string | { id?: string } | null | undefined;

interface DirectusStorefrontGameRecord {
  slug?: string;
  name?: string;
  heading?: string;
  kicker?: string;
  description?: string;
  provider_name?: string;
  provider_slug?: string;
  provider_game_id?: string;
  game_type?: StorefrontGameType;
  accent?: string;
  hero_image?: DirectusImageRef;
  hero_image_url?: string | null;
  hero_image_alt?: string | null;
  badges?: unknown;
  highlights?: unknown;
  facts?: unknown;
  content_html?: string | null;
  related_game_slugs?: unknown;
  launch_mode?: string;
  launch_url?: string | null;
  demo_url?: string | null;
  launch_label?: string | null;
  demo_label?: string | null;
  requires_auth?: boolean | null;
  open_in_new_tab?: boolean | null;
  seo_title?: string | null;
  seo_description?: string | null;
  source_url?: string | null;
  extracted_at?: string | null;
}

interface SlotcityDemoApiResponse {
  status?: boolean;
  url?: string;
}

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const CONTENT_MODE = process.env.STOREFRONT_CONTENT_MODE ?? "mock";
const DIRECTUS_FETCH_TIMEOUT_MS = Number.parseInt(
  process.env.DIRECTUS_FETCH_TIMEOUT_MS ?? "6000",
  10
);
const SOURCE_SITE_URL = (process.env.SLOTCITY_SOURCE_SITE_URL ?? "https://slotcity.ua").replace(
  /\/$/,
  ""
);
const FALLBACK_DEMO_SOURCE_LABEL = "Демо";

let gamePoolPromise: Promise<Map<string, GameTileContent>> | null = null;

async function fetchDirectus(input: string, init: NextFetchInit) {
  const { signal, cancel } = getTimeoutSignal(DIRECTUS_FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal
    });
  } finally {
    cancel();
  }
}

function getImageId(image: DirectusImageRef) {
  if (typeof image === "string" && image.length > 0) {
    return image;
  }

  if (image && typeof image === "object" && typeof image.id === "string" && image.id.length > 0) {
    return image.id;
  }

  return null;
}

function buildAssetUrl(image?: DirectusImageRef, imageUrl?: string | null) {
  const imageId = getImageId(image);

  if (imageId && DIRECTUS_URL) {
    return `${DIRECTUS_URL}/assets/${imageId}`;
  }

  return imageUrl ?? "";
}

function normalizeLaunchValue(value?: string | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  if (
    !normalized ||
    normalized === "$undefined" ||
    normalized === "undefined" ||
    normalized === "$null" ||
    normalized === "null"
  ) {
    return undefined;
  }

  return normalized;
}

function normalizeTextArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

function normalizeFactArray(value: unknown): StorefrontGameFactContent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const label = "label" in entry && typeof entry.label === "string" ? entry.label : "";
    const factValue = "value" in entry && typeof entry.value === "string" ? entry.value : "";

    if (!label || !factValue) {
      return [];
    }

    return [
      {
        label,
        value: factValue
      }
    ];
  });
}

function normalizeSlug(input: string) {
  return input
    .replace(/^\/+|\/+$/g, "")
    .replace(/^game\//, "")
    .trim();
}

function isSlotcityGamePageUrl(value?: string) {
  if (!value) {
    return false;
  }

  return (
    value.startsWith(`${SOURCE_SITE_URL}/game/`) ||
    value.startsWith("/game/")
  );
}

function toEmbeddableUrl(value?: string) {
  const normalized = normalizeLaunchValue(value);

  if (!normalized || isSlotcityGamePageUrl(normalized)) {
    return undefined;
  }

  return normalized;
}

function stripGamePrefix(value: string) {
  return value
    .replace(/^ігровий автомат\s+/i, "")
    .replace(/^игровой автомат\s+/i, "")
    .replace(/^slot machine\s+/i, "")
    .trim();
}

function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveAccent(provider: string, gameType: StorefrontGameType) {
  if (gameType === "live") {
    return "violet" as const;
  }

  const normalizedProvider = provider.toLowerCase();

  if (normalizedProvider.includes("evolution")) {
    return "blue" as const;
  }

  if (normalizedProvider.includes("oak")) {
    return "green" as const;
  }

  return "gold" as const;
}

function extractHighlights(html: string) {
  if (!html) {
    return [];
  }

  const $ = load(`<div>${html}</div>`);
  const headings = $("h2, h3")
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean);

  if (headings.length) {
    return headings.slice(0, 3);
  }

  const bulletItems = $("li")
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean);

  return bulletItems.slice(0, 3);
}

function normalizeGameEditorialHtml(html: string) {
  if (!html) {
    return "";
  }

  const $ = load(`<div>${html}</div>`);
  $("script, style, noscript, iframe, svg, picture, source, img, video, form, button, input").remove();

  const blocks: string[] = [];
  const seen = new Set<string>();

  $("h2, h3, h4, p, ul, ol").each((_, element) => {
    const tagName = element.tagName.toLowerCase();

    if (tagName === "ul" || tagName === "ol") {
      const items = $(element)
        .find("li")
        .map((__, item) => $(item).text().replace(/\s+/g, " ").trim())
        .get()
        .filter((entry) => entry.length > 0)
        .slice(0, 8);

      if (!items.length) {
        return;
      }

      const key = `${tagName}:${items.join("|")}`;

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      blocks.push(
        `<${tagName}>${items.map((item) => `<li>${item}</li>`).join("")}</${tagName}>`
      );
      return;
    }

    const text = $(element).text().replace(/\s+/g, " ").trim();

    if (!text || text.length < 24) {
      return;
    }

    const key = `${tagName}:${text}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    blocks.push(`<${tagName}>${text}</${tagName}>`);
  });

  const normalizedHtml = blocks.slice(0, 14).join("");
  const normalizedText = load(`<div>${normalizedHtml}</div>`)("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return normalizedText.length >= 120 ? normalizedHtml : "";
}

function dedupeGames(items: GameTileContent[]) {
  const map = new Map<string, GameTileContent>();

  for (const item of items) {
    if (!item.id || map.has(item.id)) {
      continue;
    }

    map.set(item.id, item);
  }

  return map;
}

async function getGamePool() {
  if (!gamePoolPromise) {
    gamePoolPromise = (async () => {
      const [home, catalog, live, promotions, vip, tournaments] = await Promise.all([
        getHomeRouteContent(),
        getCatalogRouteContent(),
        getLiveRouteContent(),
        getPromotionsRouteContent(),
        getVipRouteContent(),
        getTournamentsRouteContent()
      ]);

      return dedupeGames([
        ...home.topSlots,
        ...home.bonusGames,
        ...home.liveGames,
        ...home.monthlyTop,
        ...catalog.topSlots,
        ...catalog.discoveryGames,
        ...catalog.bonusGames,
        ...catalog.liveGames,
        ...catalog.monthlyTop,
        ...live.liveGames,
        ...live.primeTables,
        ...live.comebackTables,
        ...live.slotCrossSell,
        ...promotions.welcomeGames,
        ...promotions.seasonalGames,
        ...vip.vipGames,
        ...vip.loungeGames,
        ...tournaments.tournamentGames,
        ...tournaments.prizeGames
      ]);
    })();
  }

  return gamePoolPromise;
}

async function fetchDirectusGame(slug: string): Promise<DirectusStorefrontGameRecord | null> {
  if (!DIRECTUS_URL || CONTENT_MODE === "mock") {
    return null;
  }

  try {
    const response = await fetchDirectus(
      `${DIRECTUS_URL}/items/storefront_games?filter[slug][_eq]=${encodeURIComponent(
        slug
      )}&filter[status][_eq]=published&fields=*`,
      {
        next: {
          revalidate: 60
        }
      } as NextFetchInit
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: DirectusStorefrontGameRecord[];
    };

    return payload.data?.[0] ?? null;
  } catch {
    return null;
  }
}

function buildFactFallback(
  provider: string,
  gameType: StorefrontGameType,
  slug: string
): StorefrontGameFactContent[] {
  const facts: StorefrontGameFactContent[] = [];

  if (provider) {
    facts.push({
      label: "Провайдер",
      value: provider
    });
  }

  facts.push({
    label: "Тип",
    value: gameType === "live" ? "Live casino" : "Slot"
  });
  facts.push({
    label: "Код гри",
    value: slug
  });

  return facts;
}

function buildRelatedGames(
  currentSlug: string,
  currentProvider: string,
  explicitSlugs: string[],
  pool: Map<string, GameTileContent>
) {
  const explicit = explicitSlugs
    .map((slug) => pool.get(slug))
    .filter((entry): entry is GameTileContent => Boolean(entry))
    .filter((entry) => entry.id !== currentSlug);

  if (explicit.length) {
    return explicit.slice(0, 8);
  }

  const sameProvider = Array.from(pool.values()).filter((game) => {
    if (game.id === currentSlug) {
      return false;
    }

    if (!currentProvider) {
      return false;
    }

    return game.provider.toLowerCase() === currentProvider.toLowerCase();
  });

  if (sameProvider.length) {
    return sameProvider.slice(0, 8);
  }

  return Array.from(pool.values())
    .filter((game) => game.id !== currentSlug)
    .slice(0, 8);
}

async function resolveSlotcityDemoSource(
  slug: string,
  name?: string,
  explicitDemoUrl?: string,
  sourceUrl?: string
) {
  const directDemoUrl = normalizeLaunchValue(explicitDemoUrl);
  const embeddableDirectDemoUrl = toEmbeddableUrl(directDemoUrl);

  if (embeddableDirectDemoUrl) {
    return embeddableDirectDemoUrl;
  }

  const fallbackSourceUrl = normalizeLaunchValue(sourceUrl);
  const embeddableFallbackSourceUrl = toEmbeddableUrl(fallbackSourceUrl);

  if (embeddableFallbackSourceUrl) {
    return embeddableDirectDemoUrl ?? embeddableFallbackSourceUrl;
  }

  const providerFallback = findSlotcityDemoFallbackUrl(slug, name);

  if (providerFallback?.url) {
    return providerFallback.url;
  }

  for (const lookupTerm of buildSlotcityDemoLookupKeys(slug, name)) {
    try {
      const response = await fetchDirectus(
        `${SOURCE_SITE_URL}/apiv2/games/demo?term=${encodeURIComponent(
          lookupTerm
        )}&language=uk&check_limits=1&version=desktop`,
        {
          next: {
            revalidate: 300
          }
        } as NextFetchInit
      );

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as SlotcityDemoApiResponse;
      const resolvedUrl = normalizeLaunchValue(payload.url);
      const embeddableResolvedUrl = toEmbeddableUrl(resolvedUrl);

      if (embeddableResolvedUrl) {
        return embeddableResolvedUrl;
      }
    } catch {
      continue;
    }
  }

  return embeddableDirectDemoUrl ?? embeddableFallbackSourceUrl;
}

async function buildLaunchConfig(
  slug: string,
  name: string,
  sourceUrl: string | undefined,
  record: DirectusStorefrontGameRecord | null
): Promise<StorefrontGameLaunchContent> {
  const fallbackDemoUrl = normalizeLaunchValue(sourceUrl);
  const demoSourceUrl = await resolveSlotcityDemoSource(
    slug,
    name,
    normalizeLaunchValue(record?.demo_url),
    fallbackDemoUrl
  );
  const explicitLaunchUrl = normalizeLaunchValue(record?.launch_url);

  return {
    mode:
      record?.launch_mode === "iframe" || record?.launch_mode === "external"
        ? record.launch_mode
        : "none",
    launchUrl: explicitLaunchUrl,
    demoUrl: demoSourceUrl ? `/game/${slug}/demo` : undefined,
    demoSourceUrl,
    launchLabel:
      (typeof record?.launch_label === "string" && record.launch_label.length > 0
        ? record.launch_label
        : "Грати") || "Грати",
    demoLabel:
      (typeof record?.demo_label === "string" &&
      record.demo_label.length > 0 &&
      !/slotcity/i.test(record.demo_label)
        ? record.demo_label
        : FALLBACK_DEMO_SOURCE_LABEL) || FALLBACK_DEMO_SOURCE_LABEL,
    requiresAuth: record?.requires_auth ?? true,
    openInNewTab: record?.open_in_new_tab ?? false,
    providerGameId:
      normalizeLaunchValue(record?.provider_game_id),
    providerSlug:
      normalizeLaunchValue(record?.provider_slug)
  };
}

export async function getStorefrontGamePage(slugInput: string): Promise<StorefrontGamePage | null> {
  const slug = normalizeSlug(slugInput);

  if (!slug) {
    return null;
  }

  const [record, importedPage, pool] = await Promise.all([
    fetchDirectusGame(slug),
    getImportedPagePayload(`/game/${slug}`, {
      allowUnlistedGame: true
    }),
    getGamePool()
  ]);

  if (!record && !importedPage && !pool.has(slug)) {
    return null;
  }

  const fallbackTile = pool.get(slug);
  const provider = record?.provider_name || fallbackTile?.provider || "";
  const gameType = (record?.game_type ?? (provider.toLowerCase().includes("live") ? "live" : "slot")) as StorefrontGameType;
  const name =
    (typeof record?.name === "string" && record.name.length > 0
      ? record.name
      : importedPage?.heading
        ? stripGamePrefix(importedPage.heading)
        : fallbackTile?.title || humanizeSlug(slug)) || humanizeSlug(slug);
  const heading =
    (typeof record?.heading === "string" && record.heading.length > 0
      ? record.heading
      : importedPage?.heading || name) || name;
  const description =
    (typeof record?.description === "string" && record.description.length > 0
      ? record.description
      : importedPage?.description || "") || "";
  const heroImage =
    buildAssetUrl(record?.hero_image, record?.hero_image_url) ||
    importedPage?.heroImage ||
    fallbackTile?.image ||
    undefined;
  const rawContentHtml =
    (typeof record?.content_html === "string" && record.content_html.length > 0
      ? record.content_html
      : importedPage?.html || "") || "";
  const contentHtml = normalizeGameEditorialHtml(rawContentHtml);
  const explicitRelated = normalizeTextArray(record?.related_game_slugs);
  const highlights = normalizeTextArray(record?.highlights);
  const facts = normalizeFactArray(record?.facts);
  const sourceUrl =
    (typeof record?.source_url === "string" && record.source_url.length > 0
      ? record.source_url
      : importedPage?.sourceUrl) || undefined;

  return {
    slug,
    path: `/game/${slug}`,
    name,
    title:
      (typeof record?.seo_title === "string" && record.seo_title.length > 0
        ? record.seo_title
        : importedPage?.title || heading) || heading,
    heading,
    kicker:
      (typeof record?.kicker === "string" && record.kicker.length > 0
        ? record.kicker
        : gameType === "live"
          ? "Live casino"
          : "Слот SlotCity") || "Слот SlotCity",
    description,
    provider,
    gameType,
    accent:
      record?.accent === "green" ||
      record?.accent === "blue" ||
      record?.accent === "violet" ||
      record?.accent === "gold"
        ? record.accent
        : resolveAccent(provider, gameType),
    heroImage,
    heroImageAlt:
      (typeof record?.hero_image_alt === "string" && record.hero_image_alt.length > 0
        ? record.hero_image_alt
        : heading) || heading,
    badges: normalizeTextArray(record?.badges),
    highlights: highlights.length ? highlights : extractHighlights(contentHtml || rawContentHtml),
    facts: facts.length ? facts : buildFactFallback(provider, gameType, slug),
    contentHtml,
    sourceUrl,
    extractedAt:
      (typeof record?.extracted_at === "string" && record.extracted_at.length > 0
        ? record.extracted_at
        : importedPage?.extractedAt) || undefined,
    launch: await buildLaunchConfig(slug, name, sourceUrl, record),
    relatedGames: buildRelatedGames(slug, provider, explicitRelated, pool)
  };
}
