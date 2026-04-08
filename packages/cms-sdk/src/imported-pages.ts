import { load } from "cheerio";

import type { ImportedPageBreadcrumb, ImportedPagePayload } from "./types";

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

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const SOURCE_SITE_URL = (process.env.SLOTCITY_SOURCE_SITE_URL ?? "https://slotcity.ua").replace(
  /\/$/,
  ""
);
const REMOTE_FETCH_TIMEOUT_MS = Number.parseInt(
  process.env.REMOTE_FETCH_TIMEOUT_MS ?? "8000",
  10
);
const POPULAR_GAMES_LIMIT = Number.parseInt(
  process.env.SLOTCITY_POPULAR_GAMES_LIMIT ?? "500",
  10
);

type DirectusImageRef = string | { id?: string } | null | undefined;

interface DirectusImportedPageRecord {
  slug?: string;
  locale?: "uk" | "ru";
  page_type?: ImportedPagePayload["pageType"];
  shell_route?: string;
  kicker?: string;
  source_url?: string;
  canonical_url?: string;
  title?: string;
  heading?: string;
  description?: string;
  hero_image?: DirectusImageRef;
  hero_image_url?: string | null;
  content_html?: string;
  extracted_at?: string;
}

interface DirectusImportedBreadcrumbRecord {
  label?: string;
  href?: string;
}

let popularGamePathsPromise: Promise<Set<string>> | null = null;

async function fetchRemote(input: string, init: NextFetchInit) {
  const { signal, cancel } = getTimeoutSignal(REMOTE_FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal
    });
  } finally {
    cancel();
  }
}

function normalizeSitePath(input: string) {
  const url = input.startsWith("http")
    ? new URL(input)
    : new URL(input.startsWith("/") ? input : `/${input}`, SOURCE_SITE_URL);
  const pathname = `${url.pathname || "/"}`.replace(/\/+$/, "") || "/";

  return pathname === "" ? "/" : pathname;
}

function toAbsoluteUrl(value: string | undefined | null) {
  if (!value) {
    return "";
  }

  if (value.startsWith("data:")) {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("/")) {
    return `${SOURCE_SITE_URL}${value}`;
  }

  return `${SOURCE_SITE_URL}/${value.replace(/^\/+/, "")}`;
}

function toLocalHref(value: string | undefined | null) {
  if (!value) {
    return "";
  }

  if (value.startsWith("#") || value.startsWith("mailto:") || value.startsWith("tel:")) {
    return value;
  }

  const absolute = toAbsoluteUrl(value);

  try {
    const url = new URL(absolute);

    if (url.origin === SOURCE_SITE_URL) {
      return `${url.pathname}${url.search}${url.hash}`;
    }

    return absolute;
  } catch {
    return value;
  }
}

function safeJsonParse<T>(value: string) {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getDirectusImageId(image: DirectusImageRef) {
  if (typeof image === "string" && image.length > 0) {
    return image;
  }

  if (image && typeof image === "object" && typeof image.id === "string" && image.id.length > 0) {
    return image.id;
  }

  return null;
}

function buildDirectusAssetUrl(image?: DirectusImageRef, imageUrl?: string | null) {
  const imageId = getDirectusImageId(image);

  if (imageId && DIRECTUS_URL) {
    return `${DIRECTUS_URL}/assets/${imageId}`;
  }

  return imageUrl ?? "";
}

function extractBreadcrumbs(html: string): ImportedPageBreadcrumb[] {
  const $ = load(html);
  const breadcrumbs: ImportedPageBreadcrumb[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text().trim();

    if (!raw) {
      return;
    }

    const parsed = safeJsonParse<unknown>(raw);
    const entries = Array.isArray(parsed) ? parsed : [parsed];

    for (const entry of entries) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      const record = entry as {
        "@type"?: string;
        itemListElement?: Array<{
          name?: string;
          item?: string | { "@id"?: string };
        }>;
      };

      if (record["@type"] !== "BreadcrumbList" || !Array.isArray(record.itemListElement)) {
        continue;
      }

      for (const item of record.itemListElement) {
        const href =
          typeof item.item === "string"
            ? item.item
            : item.item && typeof item.item === "object"
              ? item.item["@id"]
              : undefined;

        if (!item.name) {
          continue;
        }

        breadcrumbs.push({
          label: item.name,
          href: toLocalHref(href || "#")
        });
      }
    }
  });

  return breadcrumbs;
}

function inferPageType(path: string): ImportedPagePayload["pageType"] {
  if (path.startsWith("/game/")) {
    return "game";
  }

  if (path.startsWith("/promotions/")) {
    return "promotion";
  }

  if (path.startsWith("/provider/") || path.startsWith("/providers/")) {
    return "provider";
  }

  if (path.startsWith("/collection/") || path.startsWith("/collections/")) {
    return "collection";
  }

  if (path.startsWith("/slots/")) {
    return "slot";
  }

  if (path.startsWith("/live/") || path === "/live") {
    return "live";
  }

  if (path.startsWith("/info/") || path === "/faq" || path === "/foundation") {
    return "info";
  }

  return "page";
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetchRemote(url, {
      next: {
        revalidate: 300
      }
    } as NextFetchInit);

    if (!response.ok) {
      return null;
    }

    return response.text();
  } catch {
    return null;
  }
}

async function getPopularGamePaths(limit = POPULAR_GAMES_LIMIT): Promise<Set<string>> {
  if (!popularGamePathsPromise) {
    popularGamePathsPromise = (async () => {
      const html = await fetchText(`${SOURCE_SITE_URL}/all-games`);

      if (!html) {
        return new Set<string>();
      }

      const $ = load(html);
      const paths: string[] = [];

      $("main a[href^='/game/']").each((_, element) => {
        const href = normalizeSitePath($(element).attr("href") ?? "");

        if (!href.startsWith("/game/")) {
          return;
        }

        if (!paths.includes(href)) {
          paths.push(href);
        }
      });

      return new Set(paths.slice(0, limit));
    })();
  }

  return popularGamePathsPromise;
}

async function sanitizeMainHtml(path: string, html: string) {
  const allowedGames = await getPopularGamePaths();
  const $ = load(`<div data-import-root="true">${html}</div>`);
  const root = $('[data-import-root="true"]').first();

  root.find("script, style, noscript, iframe, form").remove();

  root.find("*").each((_, element) => {
    const node = $(element);

    for (const attributeName of Object.keys(element.attribs ?? {})) {
      if (
        attributeName === "href" ||
        attributeName === "src" ||
        attributeName === "srcset" ||
        attributeName === "alt" ||
        attributeName === "title" ||
        attributeName === "colspan" ||
        attributeName === "rowspan" ||
        attributeName === "target" ||
        attributeName === "rel"
      ) {
        continue;
      }

      node.removeAttr(attributeName);
    }
  });

  root.find("[href]").each((_, element) => {
    const node = $(element);
    const href = normalizeSitePath(node.attr("href") ?? "");

    if (href.startsWith("/game/") && !allowedGames.has(href)) {
      const removableParent = node.closest("li, article, section, div");

      if (removableParent.length) {
        removableParent.remove();
      } else {
        node.remove();
      }

      return;
    }

    node.attr("href", toLocalHref(node.attr("href")));
  });

  root.find("[src]").each((_, element) => {
    const node = $(element);
    node.attr("src", toAbsoluteUrl(node.attr("src")));
  });

  root.find("[srcset]").each((_, element) => {
    const node = $(element);
    const srcset = node.attr("srcset");

    if (!srcset) {
      return;
    }

    const rewritten = srcset
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [url, descriptor] = entry.split(/\s+/, 2);
        const absolute = toAbsoluteUrl(url);

        return descriptor ? `${absolute} ${descriptor}` : absolute;
      })
      .join(", ");

    node.attr("srcset", rewritten);
  });

  if (path === "/all-games" || path === "/ru/all-games") {
    const extraGames = root.find("a[href^='/game/'], a[href^='/ru/game/']");
    let index = 0;

    extraGames.each((_, element) => {
      index += 1;

      if (index <= POPULAR_GAMES_LIMIT) {
        return;
      }

      const node = $(element);
      const removableParent = node.closest("li, article, section, div");

      if (removableParent.length) {
        removableParent.remove();
      } else {
        node.remove();
      }
    });
  }

  return root.html()?.trim() ?? "";
}

function buildPayload(path: string, html: string): Promise<ImportedPagePayload | null> {
  return (async () => {
    const $ = load(html);
    const main = $("main").first();
    const fallbackRoot = $('[id^="required-page-id-"]').first();
    const contentRoot = main.length ? main : fallbackRoot.length ? fallbackRoot : $("body").first();

    if (!contentRoot.length) {
      return null;
    }

    const title = $("title").first().text().trim();
    const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
    const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() ?? `${SOURCE_SITE_URL}${path}`;
    const heading = contentRoot.find("h1").first().text().trim() || title;
    const heroImage =
      toAbsoluteUrl($('meta[property="og:image"]').attr("content")) ||
      toAbsoluteUrl(contentRoot.find("img").first().attr("src"));
    const locale = path.startsWith("/ru") ? "ru" : "uk";
    const contentHtml = await sanitizeMainHtml(path, contentRoot.html() ?? "");

    if (!contentHtml) {
      return null;
    }

    return {
      slug: path,
      path,
      locale,
      pageType: inferPageType(path),
      sourceUrl: `${SOURCE_SITE_URL}${path}`,
      title,
      heading,
      description: description || contentRoot.find("p").first().text().trim(),
      canonicalUrl,
      heroImage,
      breadcrumbs: extractBreadcrumbs(html),
      html: contentHtml,
      extractedAt: new Date().toISOString()
    };
  })();
}

async function fetchDirectusImportedPage(path: string): Promise<ImportedPagePayload | null> {
  if (!DIRECTUS_URL) {
    return null;
  }

  try {
    const [pageResponse, breadcrumbsResponse] = await Promise.all([
      fetchRemote(
        `${DIRECTUS_URL}/items/storefront_imported_pages?filter[slug][_eq]=${encodeURIComponent(
          path
        )}&fields=*`,
        {
          next: {
            revalidate: 60
          }
        } as NextFetchInit
      ),
      fetchRemote(
        `${DIRECTUS_URL}/items/storefront_imported_breadcrumbs?filter[page_slug][_eq]=${encodeURIComponent(
          path
        )}&sort=position&fields=label,href`,
        {
          next: {
            revalidate: 60
          }
        } as NextFetchInit
      )
    ]);

    if (pageResponse.ok) {
      const pagePayload = (await pageResponse.json()) as {
        data?: DirectusImportedPageRecord[];
      };
      const page = pagePayload.data?.[0];

      if (page?.content_html) {
        const breadcrumbsPayload = breadcrumbsResponse.ok
          ? ((await breadcrumbsResponse.json()) as {
              data?: DirectusImportedBreadcrumbRecord[];
            })
          : { data: [] };

        return {
          slug: page.slug ?? path,
          path: page.slug ?? path,
          locale: page.locale === "ru" ? "ru" : "uk",
          pageType: page.page_type ?? inferPageType(path),
          sourceUrl: page.source_url ?? `${SOURCE_SITE_URL}${path}`,
          title: page.title ?? "",
          kicker: page.kicker ?? undefined,
          heading: page.heading ?? page.title ?? "",
          description: page.description ?? "",
          canonicalUrl: page.canonical_url ?? `${SOURCE_SITE_URL}${path}`,
          heroImage:
            buildDirectusAssetUrl(page.hero_image, page.hero_image_url) || undefined,
          shellRoute: page.shell_route ?? undefined,
          breadcrumbs: (breadcrumbsPayload.data ?? []).flatMap((entry) =>
            entry.label
              ? [
                  {
                    label: entry.label,
                    href: toLocalHref(entry.href || "#")
                  }
                ]
              : []
          ),
          html: page.content_html,
          extractedAt: page.extracted_at ?? new Date(0).toISOString()
        };
      }
    }
  } catch {
    // Fall through to legacy JSON payload lookup.
  }

  try {
    const response = await fetchRemote(
      `${DIRECTUS_URL}/items/storefront_route_payloads?filter[slug][_eq]=${encodeURIComponent(
        path
      )}&fields=payload`,
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
      data?: Array<{ payload?: ImportedPagePayload }>;
    };

    return payload.data?.[0]?.payload ?? null;
  } catch {
    return null;
  }
}

async function fetchRemoteImportedPage(path: string): Promise<ImportedPagePayload | null> {
  const html = await fetchText(`${SOURCE_SITE_URL}${path}`);

  if (!html) {
    return null;
  }

  return buildPayload(path, html);
}

export async function getImportedPagePayload(path: string): Promise<ImportedPagePayload | null> {
  const normalizedPath = normalizeSitePath(path);

  if (normalizedPath.startsWith("/game/")) {
    const allowedGames = await getPopularGamePaths();

    if (!allowedGames.has(normalizedPath)) {
      return null;
    }
  }

  const directusPayload = await fetchDirectusImportedPage(normalizedPath);

  if (directusPayload) {
    return directusPayload;
  }

  return fetchRemoteImportedPage(normalizedPath);
}

export async function getSlotCityPopularGamePaths(limit = POPULAR_GAMES_LIMIT): Promise<string[]> {
  const paths = await getPopularGamePaths(limit);

  return Array.from(paths).slice(0, limit);
}

export async function getSlotCityMirrorPaths(limitGames = POPULAR_GAMES_LIMIT): Promise<string[]> {
  const sitemapIndex = await fetchText(`${SOURCE_SITE_URL}/sitemap.xml`);

  if (!sitemapIndex) {
    return [];
  }

  const $ = load(sitemapIndex, { xmlMode: true });
  const sitemapUrls = $("sitemap > loc")
    .map((_, element) => $(element).text().trim())
    .get();

  const paths = new Set<string>();

  for (const sitemapUrl of sitemapUrls) {
    if (sitemapUrl.includes("sitemap_games-")) {
      continue;
    }

    const xml = await fetchText(sitemapUrl);

    if (!xml) {
      continue;
    }

    const sitemap = load(xml, { xmlMode: true });

    sitemap("url > loc")
      .map((_, element) => normalizeSitePath(sitemap(element).text().trim()))
      .get()
      .forEach((path) => {
        paths.add(path);
      });
  }

  const gamePaths = await getSlotCityPopularGamePaths(limitGames);

  for (const gamePath of gamePaths) {
    paths.add(gamePath);
  }

  return Array.from(paths);
}
