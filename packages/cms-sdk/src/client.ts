import type {
  CatalogPageData,
  CatalogRouteContent,
  HomeRouteContent,
  HomePageData,
  LivePageData,
  LiveRouteContent,
  PromotionsRouteContent,
  TournamentsRouteContent,
  VipRouteContent
} from "./types";
import {
  mockCatalogPageData,
  mockHomePageData,
  mockLivePageData
} from "./mock-content";
import {
  mockCatalogRouteContent,
  mockHomeRouteContent,
  mockLiveRouteContent,
  mockPromotionsRouteContent,
  mockTournamentsRouteContent,
  mockVipRouteContent
} from "./route-content";

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const CONTENT_MODE = process.env.STOREFRONT_CONTENT_MODE ?? "mock";

async function fetchDirectusPage<T>(
  slug: "home" | "catalog" | "live",
  fallback: T
): Promise<T> {
  if (!DIRECTUS_URL || CONTENT_MODE === "mock") {
    return fallback;
  }

  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/storefront_pages?filter[slug][_eq]=${slug}&fields=*.*.*`,
      {
        next: {
          revalidate: 60
        }
      }
    );

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as {
      data?: T[];
    };

    return payload.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}

async function fetchDirectusRoutePayload<T>(
  slug: "home" | "catalog" | "live" | "promotions" | "vip" | "tournaments",
  fallback: T
): Promise<T> {
  if (!DIRECTUS_URL || CONTENT_MODE === "mock") {
    return fallback;
  }

  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/storefront_route_payloads?filter[slug][_eq]=${slug}&fields=payload`,
      {
        next: {
          revalidate: 60
        }
      }
    );

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as {
      data?: Array<{ payload?: T }>;
    };

    return payload.data?.[0]?.payload ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  return fetchDirectusPage("home", mockHomePageData);
}

export async function getCatalogPageData(): Promise<CatalogPageData> {
  return fetchDirectusPage("catalog", mockCatalogPageData);
}

export async function getLivePageData(): Promise<LivePageData> {
  return fetchDirectusPage("live", mockLivePageData);
}

export async function getCatalogRouteContent(): Promise<CatalogRouteContent> {
  return fetchDirectusRoutePayload("catalog", mockCatalogRouteContent);
}

export async function getLiveRouteContent(): Promise<LiveRouteContent> {
  return fetchDirectusRoutePayload("live", mockLiveRouteContent);
}

export async function getHomeRouteContent(): Promise<HomeRouteContent> {
  return fetchDirectusRoutePayload("home", mockHomeRouteContent);
}

export async function getPromotionsRouteContent(): Promise<PromotionsRouteContent> {
  return fetchDirectusRoutePayload("promotions", mockPromotionsRouteContent);
}

export async function getVipRouteContent(): Promise<VipRouteContent> {
  return fetchDirectusRoutePayload("vip", mockVipRouteContent);
}

export async function getTournamentsRouteContent(): Promise<TournamentsRouteContent> {
  return fetchDirectusRoutePayload("tournaments", mockTournamentsRouteContent);
}
