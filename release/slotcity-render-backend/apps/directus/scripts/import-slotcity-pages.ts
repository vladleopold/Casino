import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { ImportedPagePayload } from "../../../packages/cms-sdk/src/types.ts";
import {
  getImportedPagePayload,
  getSlotCityMirrorPaths
} from "../../../packages/cms-sdk/src/imported-pages.ts";

interface ImportedPageRecord {
  slug: string;
  locale: "uk" | "ru";
  page_type: ImportedPagePayload["pageType"];
  status: string;
  shell_route?: string;
  kicker?: string;
  source_url: string;
  canonical_url: string;
  title: string;
  heading: string;
  description: string;
  hero_image_url?: string;
  content_html: string;
  extracted_at: string;
}

interface ImportedBreadcrumbRecord {
  slug: string;
  page_slug: string;
  position: number;
  status: string;
  label: string;
  href: string;
}

interface ImportedSeedFile {
  storefront_imported_pages: ImportedPageRecord[];
  storefront_imported_breadcrumbs: ImportedBreadcrumbRecord[];
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultOutputPath = resolve(currentDir, "../seed/imported-pages.json");
const args = process.argv.slice(2);
const isPush = args.includes("--push");
const limitGamesArg = args.find((arg) => arg.startsWith("--limit-games="));
const outputArg = args.find((arg) => arg.startsWith("--output="));
const pathsArg = args.find((arg) => arg.startsWith("--paths="));
const concurrencyArg = args.find((arg) => arg.startsWith("--concurrency="));
const limitGames = Number.parseInt(limitGamesArg?.split("=")[1] ?? "500", 10);
const concurrency = Number.parseInt(concurrencyArg?.split("=")[1] ?? "5", 10);
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

function normalizeSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildRecordSlug(...parts: Array<string | number>) {
  return parts
    .map((part) => normalizeSlugPart(String(part)))
    .filter(Boolean)
    .join("-");
}

function inferShellRoute(path: string) {
  if (path === "/") {
    return "home";
  }

  if (path.startsWith("/live")) {
    return "live";
  }

  if (
    path.startsWith("/bonuses") ||
    path.startsWith("/promotions") ||
    path.startsWith("/registration") ||
    path.startsWith("/casino-app")
  ) {
    return "bonuses";
  }

  if (
    path.startsWith("/tournaments") ||
    path.startsWith("/raffles") ||
    path.startsWith("/promotions/city-vip") ||
    path.startsWith("/levels")
  ) {
    return "vip";
  }

  return "catalog";
}

function toPageRecord(payload: ImportedPagePayload): ImportedPageRecord {
  return {
    slug: payload.path,
    locale: payload.locale,
    page_type: payload.pageType,
    status: contentStatus,
    shell_route: payload.shellRoute ?? inferShellRoute(payload.path),
    kicker: payload.kicker,
    source_url: payload.sourceUrl,
    canonical_url: payload.canonicalUrl,
    title: payload.title,
    heading: payload.heading,
    description: payload.description,
    hero_image_url: payload.heroImage,
    content_html: payload.html,
    extracted_at: payload.extractedAt
  };
}

function toBreadcrumbRecords(payload: ImportedPagePayload): ImportedBreadcrumbRecord[] {
  return payload.breadcrumbs.map((breadcrumb, index) => ({
    slug: buildRecordSlug(payload.path, "breadcrumb", index + 1),
    page_slug: payload.path,
    position: index + 1,
    status: contentStatus,
    label: breadcrumb.label,
    href: breadcrumb.href
  }));
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

async function upsertImportedPage(record: ImportedPageRecord) {
  const existing = await request<{ data?: Array<{ id: number | string }> }>(
    `/items/storefront_imported_pages?filter[slug][_eq]=${encodeURIComponent(record.slug)}&fields=id`
  );

  const body = JSON.stringify({
    ...record
  });

  if (existing.data?.[0]?.id) {
    await request(`/items/storefront_imported_pages/${existing.data[0].id}`, {
      method: "PATCH",
      body
    });
    console.log(`updated storefront_imported_pages:${record.slug}`);
    return;
  }

  await request(`/items/storefront_imported_pages`, {
    method: "POST",
    body
  });
  console.log(`created storefront_imported_pages:${record.slug}`);
}

async function replaceBreadcrumbs(pageSlug: string, records: ImportedBreadcrumbRecord[]) {
  const existing = await request<{ data?: Array<{ id: number | string }> }>(
    `/items/storefront_imported_breadcrumbs?filter[page_slug][_eq]=${encodeURIComponent(
      pageSlug
    )}&fields=id`
  );

  for (const entry of existing.data ?? []) {
    await request(`/items/storefront_imported_breadcrumbs/${entry.id}`, {
      method: "DELETE"
    });
  }

  for (const record of records) {
    await request(`/items/storefront_imported_breadcrumbs`, {
      method: "POST",
      body: JSON.stringify({
        ...record
      })
    });
  }

  console.log(`synced storefront_imported_breadcrumbs:${pageSlug} (${records.length})`);
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
    Array.from({ length: Math.max(1, Number.isFinite(concurrency) ? concurrency : 5) }, () =>
      worker()
    )
  );

  return payloads.sort((left, right) => left.path.localeCompare(right.path));
}

const paths = requestedPaths?.length
  ? requestedPaths
  : await getSlotCityMirrorPaths(Number.isFinite(limitGames) ? limitGames : 500);

console.log(`Preparing ${paths.length} SlotCity routes with top ${limitGames} games.`);

const payloads = await collectPayloads(paths);
const pageRecords = payloads.map(toPageRecord);
const breadcrumbRecords = payloads.flatMap(toBreadcrumbRecords);

if (isPush) {
  for (const payload of payloads) {
    await upsertImportedPage(toPageRecord(payload));
    await replaceBreadcrumbs(payload.path, toBreadcrumbRecords(payload));
  }

  console.log(
    `Pushed ${pageRecords.length} pages and ${breadcrumbRecords.length} breadcrumbs to Directus.`
  );
  process.exit(0);
}

const seedFile: ImportedSeedFile = {
  storefront_imported_pages: pageRecords,
  storefront_imported_breadcrumbs: breadcrumbRecords
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(seedFile, null, 2)}\n`, "utf8");

console.log(
  `Wrote ${pageRecords.length} pages and ${breadcrumbRecords.length} breadcrumbs to ${outputPath}`
);
