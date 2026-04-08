import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { load } from "cheerio";

import type { ImportedPagePayload } from "../../../packages/cms-sdk/src/types.ts";
import {
  getImportedPagePayload,
  getSlotCityPopularGamePaths
} from "../../../packages/cms-sdk/src/imported-pages.ts";
import {
  mockCatalogRouteContent,
  mockHomeRouteContent,
  mockLiveRouteContent,
  mockPromotionsRouteContent,
  mockTournamentsRouteContent,
  mockVipRouteContent
} from "../../../packages/cms-sdk/src/route-content.ts";

interface StorefrontGameRecord {
  slug: string;
  status: string;
  game_type: "slot" | "live";
  provider_name: string;
  provider_slug?: string;
  provider_game_id?: string;
  name: string;
  heading: string;
  kicker: string;
  description: string;
  accent: "gold" | "green" | "blue" | "violet";
  hero_image_url?: string;
  hero_image_alt?: string;
  badges: string[];
  highlights: string[];
  facts: Array<{ label: string; value: string }>;
  launch_mode: "none" | "iframe" | "external";
  launch_url?: string;
  demo_url?: string;
  launch_label: string;
  demo_label: string;
  requires_auth: boolean;
  open_in_new_tab: boolean;
  content_html: string;
  related_game_slugs: string[];
  seo_title: string;
  seo_description: string;
  source_url: string;
  extracted_at: string;
}

interface StorefrontGameSeedFile {
  storefront_games: StorefrontGameRecord[];
}

interface FallbackGame {
  id: string;
  title: string;
  provider: string;
  image: string;
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultOutputPath = resolve(currentDir, "../seed/imported-games.json");
const args = process.argv.slice(2);
const isPush = args.includes("--push");
const limitGamesArg = args.find((arg) => arg.startsWith("--limit-games="));
const outputArg = args.find((arg) => arg.startsWith("--output="));
const pathsArg = args.find((arg) => arg.startsWith("--paths="));
const concurrencyArg = args.find((arg) => arg.startsWith("--concurrency="));
const limitGames = Number.parseInt(limitGamesArg?.split("=")[1] ?? "500", 10);
const concurrency = Number.parseInt(concurrencyArg?.split("=")[1] ?? "6", 10);
const outputPath = resolve(currentDir, outputArg?.split("=")[1] ?? defaultOutputPath);
const requestedPaths = pathsArg
  ? pathsArg
      .split("=")[1]
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  : null;

const directusUrl = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const directusToken = process.env.DIRECTUS_TOKEN;
const contentStatus = process.env.DIRECTUS_CONTENT_STATUS ?? "published";

function normalizeSlug(input: string) {
  return input
    .replace(/^\/+|\/+$/g, "")
    .replace(/^game\//, "")
    .trim();
}

function normalizeSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripGamePrefix(value: string) {
  return value
    .replace(/^ігровий автомат\s+/i, "")
    .replace(/^игровой автомат\s+/i, "")
    .replace(/^slot machine\s+/i, "")
    .trim();
}

function resolveAccent(provider: string, gameType: "slot" | "live") {
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

  return $("li")
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 3);
}

function buildFallbackGameMap() {
  const items: FallbackGame[] = [
    ...mockHomeRouteContent.topSlots,
    ...mockHomeRouteContent.bonusGames,
    ...mockHomeRouteContent.liveGames,
    ...mockHomeRouteContent.monthlyTop,
    ...mockCatalogRouteContent.topSlots,
    ...mockCatalogRouteContent.discoveryGames,
    ...mockCatalogRouteContent.bonusGames,
    ...mockCatalogRouteContent.liveGames,
    ...mockCatalogRouteContent.monthlyTop,
    ...mockLiveRouteContent.liveGames,
    ...mockLiveRouteContent.primeTables,
    ...mockLiveRouteContent.comebackTables,
    ...mockLiveRouteContent.slotCrossSell,
    ...mockPromotionsRouteContent.welcomeGames,
    ...mockPromotionsRouteContent.seasonalGames,
    ...mockVipRouteContent.vipGames,
    ...mockVipRouteContent.loungeGames,
    ...mockTournamentsRouteContent.tournamentGames,
    ...mockTournamentsRouteContent.prizeGames
  ];

  const map = new Map<string, FallbackGame>();

  for (const item of items) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }

  return map;
}

const fallbackGames = buildFallbackGameMap();

function buildRelatedGameSlugs(currentSlug: string, provider: string) {
  if (!provider) {
    return Array.from(fallbackGames.keys()).filter((slug) => slug !== currentSlug).slice(0, 8);
  }

  const sameProvider = Array.from(fallbackGames.values())
    .filter((game) => game.id !== currentSlug && game.provider.toLowerCase() === provider.toLowerCase())
    .map((game) => game.id);

  return sameProvider.slice(0, 8);
}

function toProviderSlug(provider: string) {
  return normalizeSlugPart(provider);
}

function toGameRecord(payload: ImportedPagePayload): StorefrontGameRecord {
  const slug = normalizeSlug(payload.path);
  const fallbackGame = fallbackGames.get(slug);
  const provider = fallbackGame?.provider ?? "";
  const gameType = provider.toLowerCase().includes("live") ? "live" : "slot";
  const name = stripGamePrefix(payload.heading) || fallbackGame?.title || slug;
  const badges = [provider, "Demo"].filter(Boolean);

  return {
    slug,
    status: contentStatus,
    game_type: gameType,
    provider_name: provider,
    provider_slug: provider ? toProviderSlug(provider) : undefined,
    provider_game_id: slug,
    name,
    heading: payload.heading || name,
    kicker: gameType === "live" ? "Live casino" : "Слот SlotCity",
    description: payload.description,
    accent: resolveAccent(provider, gameType),
    hero_image_url: payload.heroImage,
    hero_image_alt: payload.heading || name,
    badges,
    highlights: extractHighlights(payload.html),
    facts: [
      ...(provider ? [{ label: "Provider", value: provider }] : []),
      { label: "Type", value: gameType === "live" ? "Live casino" : "Slot" },
      { label: "Slug", value: slug }
    ],
    launch_mode: "none",
    launch_label: "Грати",
    demo_label: "Демо на SlotCity",
    demo_url: payload.sourceUrl,
    requires_auth: true,
    open_in_new_tab: true,
    content_html: payload.html,
    related_game_slugs: buildRelatedGameSlugs(slug, provider),
    seo_title: payload.title,
    seo_description: payload.description,
    source_url: payload.sourceUrl,
    extracted_at: payload.extractedAt
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!directusUrl || !directusToken) {
    throw new Error("DIRECTUS_URL and DIRECTUS_TOKEN are required when using --push.");
  }

  const response = await fetch(`${directusUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${directusToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }

  return (await response.json()) as T;
}

async function upsertGame(record: StorefrontGameRecord) {
  const existing = await request<{ data?: Array<{ id: number | string }> }>(
    `/items/storefront_games?filter[slug][_eq]=${encodeURIComponent(record.slug)}&fields=id`
  );

  const body = JSON.stringify(record);

  if (existing.data?.[0]?.id) {
    await request(`/items/storefront_games/${existing.data[0].id}`, {
      method: "PATCH",
      body
    });
    console.log(`updated storefront_games:${record.slug}`);
    return;
  }

  await request(`/items/storefront_games`, {
    method: "POST",
    body
  });
  console.log(`created storefront_games:${record.slug}`);
}

async function collectPayloads(paths: string[]) {
  const queue = [...paths];
  const payloads: ImportedPagePayload[] = [];
  let processed = 0;

  async function worker() {
    while (queue.length) {
      const path = queue.shift();

      if (!path) {
        return;
      }

      const payload = await getImportedPagePayload(path);
      processed += 1;

      if (payload) {
        payloads.push(payload);
      }

      console.log(`[${processed}/${paths.length}] ${path}${payload ? "" : " skipped"}`);
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Number.isFinite(concurrency) ? concurrency : 6) }, () =>
      worker()
    )
  );

  return payloads.sort((left, right) => left.path.localeCompare(right.path));
}

const paths = requestedPaths?.length
  ? requestedPaths
  : await getSlotCityPopularGamePaths(Number.isFinite(limitGames) ? limitGames : 500);

console.log(`Preparing ${paths.length} SlotCity game pages.`);

const payloads = await collectPayloads(paths);
const gameRecords = payloads.map(toGameRecord);

if (isPush) {
  for (const record of gameRecords) {
    await upsertGame(record);
  }

  console.log(`Pushed ${gameRecords.length} game pages to Directus.`);
} else {
  const output: StorefrontGameSeedFile = {
    storefront_games: gameRecords
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");
  console.log(`Wrote ${gameRecords.length} game pages to ${outputPath}`);
}
