import type {
  ActionStripContent,
  AppRequirementContent,
  BonusMatrixRowContent,
  CatalogPageData,
  CatalogRouteContent,
  ContactPointContent,
  CtaLink,
  FaqItemContent,
  FeatureBannerContent,
  FooterBrandContent,
  FooterGroupContent,
  FooterLinkContent,
  FooterMetaContent,
  GameTileContent,
  GiftCardContent,
  HeroSliderSlideContent,
  HomeAppCardContent,
  HomePageData,
  HomeRouteContent,
  InfoCard,
  LegalCardContent,
  LivePageData,
  LiveRouteContent,
  MobileDockItemContent,
  MiniGamePillContent,
  MobileInfoHubContent,
  MobileInfoLinkContent,
  MonthlyFeaturedCardContent,
  PromoCardContent,
  PromotionsRouteContent,
  PromoSliderSlideContent,
  SeoCardContent,
  SeoLeadContent,
  SectionHeaderContent,
  SideRailItemContent,
  SocialLinkContent,
  StoreButtonContent,
  SurfaceChip,
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

declare const process: {
  env: Record<string, string | undefined>;
};

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const CONTENT_MODE = process.env.STOREFRONT_CONTENT_MODE ?? "mock";
const DIRECTUS_FETCH_TIMEOUT_MS = Number.parseInt(
  process.env.DIRECTUS_FETCH_TIMEOUT_MS ?? "6000",
  10
);

type StorefrontRoute = "home" | "catalog" | "live";

type DirectusImageRef = string | { id?: string } | null | undefined;

interface DirectusBannerRecord {
  slug?: string;
  route?: string;
  kind?: string;
  position?: number;
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
  stats?: Array<{ label?: string; value?: string }>;
  image?: DirectusImageRef;
  image_url?: string | null;
}

interface DirectusSectionRecord {
  slug?: string;
  route?: string;
  section_key?: string;
  position?: number;
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
  image?: DirectusImageRef;
  image_url?: string | null;
}

interface DirectusSectionItemRecord {
  slug?: string;
  route?: string;
  section_key?: string;
  item_type?: string;
  position?: number;
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
  width?: number | string;
  height?: number | string;
  values?: string[];
  image?: DirectusImageRef;
  image_url?: string | null;
}

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

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter(
    (entry): entry is string => typeof entry === "string" && entry.length > 0
  );

  return items.length ? items : undefined;
}

function pickText(...values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === "string" && value.length > 0) ?? "";
}

function toPositiveNumber(value: number | string | undefined, fallback: number) {
  const numeric =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizeId(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "item";
}

function groupItemsBySection(items: DirectusSectionItemRecord[] | null) {
  const map = new Map<string, DirectusSectionItemRecord[]>();

  for (const item of items ?? []) {
    if (!item.section_key) {
      continue;
    }

    const records = map.get(item.section_key) ?? [];
    records.push(item);
    map.set(item.section_key, records);
  }

  return map;
}

function mapSectionItems<T>(
  itemMap: Map<string, DirectusSectionItemRecord[]>,
  sectionKey: string,
  transform: (record: DirectusSectionItemRecord) => T,
  fallback: T[]
) {
  const records = itemMap.get(sectionKey);
  return records?.length ? records.map(transform) : fallback;
}

function findFallbackById<T extends { id: string }>(
  item: T,
  fallback: T[],
  index: number
) {
  return fallback.find((entry) => entry.id === item.id) ?? fallback[index];
}

function normalizeSideRailItems(
  items: SideRailItemContent[] | undefined,
  fallback: SideRailItemContent[]
): SideRailItemContent[] {
  if (!items?.length) {
    return fallback;
  }

  return items.map((item, index) => {
    const fallbackItem = findFallbackById(item, fallback, index);

    return {
      id: item.id,
      label: item.label ?? fallbackItem?.label ?? "",
      short: item.short ?? fallbackItem?.short ?? "",
      href: item.href ?? fallbackItem?.href ?? "/"
    };
  });
}

function normalizeMobileDockItems(
  items: MobileDockItemContent[] | undefined,
  fallback: MobileDockItemContent[]
): MobileDockItemContent[] {
  const publicDockFallback: MobileDockItemContent[] = [
    {
      id: "games",
      label: "Ігри",
      href: "/catalog",
      icon: "games"
    },
    {
      id: "live",
      label: "Live",
      href: "/live",
      icon: "live"
    },
    {
      id: "bonuses",
      label: "Бонуси",
      href: "/bonuses",
      icon: "bonuses"
    },
    {
      id: "search",
      label: "Пошук",
      href: "/catalog#catalog-search",
      icon: "search"
    }
  ];

  if (!items?.length) {
    return publicDockFallback;
  }

  const usesLegacyPublicDock = items.some(
    (item) =>
      item.id === "home" ||
      item.id === "catalog" ||
      item.id === "profile" ||
      item.icon === "home" ||
      item.icon === "profile" ||
      item.modal === "auth"
  );

  if (usesLegacyPublicDock) {
    return publicDockFallback;
  }

  return items.map((item, index) => {
    const fallbackItem = findFallbackById(item, fallback, index);

    return {
      id: item.id,
      label: item.label ?? fallbackItem?.label ?? "",
      href: item.href ?? fallbackItem?.href ?? "/",
      icon: item.icon ?? fallbackItem?.icon ?? "home",
      modal: item.modal ?? fallbackItem?.modal
    };
  });
}

function normalizeMobileInfoLinks(
  items: MobileInfoLinkContent[] | undefined,
  fallback: MobileInfoLinkContent[]
): MobileInfoLinkContent[] {
  if (!items?.length) {
    return fallback;
  }

  return items.map((item, index) => {
    const fallbackItem = findFallbackById(item, fallback, index);

    return {
      id: item.id,
      title: item.title ?? fallbackItem?.title ?? "",
      body: item.body ?? fallbackItem?.body ?? "",
      href: item.href ?? fallbackItem?.href ?? "/"
    };
  });
}

function normalizeSocialLinks(
  items: SocialLinkContent[] | undefined,
  fallback: SocialLinkContent[]
): SocialLinkContent[] {
  if (!items?.length) {
    return fallback;
  }

  return items.map((item, index) => {
    const fallbackItem = findFallbackById(item, fallback, index);

    return {
      id: item.id,
      label: item.label ?? fallbackItem?.label ?? "",
      href: item.href ?? fallbackItem?.href ?? "/",
      mark: item.mark ?? fallbackItem?.mark ?? "",
      tone: item.tone ?? fallbackItem?.tone ?? ""
    };
  });
}

function normalizeFooterLinks(
  items: FooterLinkContent[] | undefined,
  fallback: FooterLinkContent[]
): FooterLinkContent[] {
  if (!items?.length) {
    return fallback;
  }

  return items.map((item, index) => {
    const fallbackItem = findFallbackById(item, fallback, index);

    return {
      id: item.id,
      label: item.label ?? fallbackItem?.label ?? "",
      href: item.href ?? fallbackItem?.href ?? "/"
    };
  });
}

function normalizeHomeRouteContent(content: HomeRouteContent): HomeRouteContent {
  return {
    ...content,
    sideRailItems: normalizeSideRailItems(
      content.sideRailItems,
      mockHomeRouteContent.sideRailItems
    ),
    mobileDockItems: normalizeMobileDockItems(
      content.mobileDockItems,
      mockHomeRouteContent.mobileDockItems
    ),
    socialLinks: normalizeSocialLinks(content.socialLinks, mockHomeRouteContent.socialLinks),
    footerLinks: normalizeFooterLinks(content.footerLinks, mockHomeRouteContent.footerLinks),
    mobileInfoHub: {
      ...content.mobileInfoHub,
      links: normalizeMobileInfoLinks(
        content.mobileInfoHub?.links,
        mockHomeRouteContent.mobileInfoHub.links
      )
    }
  };
}

function normalizeCatalogRouteContent(content: CatalogRouteContent): CatalogRouteContent {
  return {
    ...content,
    sideRailItems: normalizeSideRailItems(
      content.sideRailItems,
      mockCatalogRouteContent.sideRailItems
    )
  };
}

function normalizeLiveRouteContent(content: LiveRouteContent): LiveRouteContent {
  return {
    ...content,
    sideRailItems: normalizeSideRailItems(content.sideRailItems, mockLiveRouteContent.sideRailItems)
  };
}

function toPromoCard(record: DirectusBannerRecord): PromoCardContent {
  return {
    id: record.slug ?? record.title ?? "promo-card",
    kicker: record.kicker ?? "",
    title: record.title ?? "",
    href: record.href ?? "/promotions",
    image: buildAssetUrl(record.image, record.image_url)
  };
}

function toHeroSliderSlide(record: DirectusBannerRecord): HeroSliderSlideContent {
  const accent =
    record.accent === "gold" || record.accent === "violet" || record.accent === "green"
      ? record.accent
      : "gold";

  return {
    id: record.slug ?? record.title ?? "hero-slide",
    eyebrow: record.kicker ?? "",
    title: record.title ?? "",
    body: record.body ?? "",
    image: buildAssetUrl(record.image, record.image_url),
    accent,
    primaryHref: record.primary_href ?? "/",
    primaryLabel: record.primary_label ?? "",
    secondaryHref: record.secondary_href ?? "/",
    secondaryLabel: record.secondary_label ?? "",
    chips: Array.isArray(record.chips) ? record.chips : [],
    stats: Array.isArray(record.stats)
      ? record.stats.map((item) => ({
          label: item.label ?? "",
          value: item.value ?? ""
        }))
      : []
  };
}

function toPromoSliderSlide(record: DirectusBannerRecord): PromoSliderSlideContent {
  return {
    id: record.slug ?? record.title ?? "promo-slide",
    kicker: record.kicker ?? "",
    title: record.title ?? "",
    body: record.body ?? "",
    image: buildAssetUrl(record.image, record.image_url),
    href: record.href ?? "/promotions",
    color: record.color ?? "#FFD15A",
    ctaLabel: record.cta_label ?? "Детальніше"
  };
}

function toFeatureBanner(
  record: DirectusBannerRecord,
  fallback: FeatureBannerContent
): FeatureBannerContent {
  return {
    kicker: record.kicker ?? fallback.kicker,
    title: record.title ?? fallback.title,
    body: record.body ?? fallback.body,
    image: buildAssetUrl(record.image, record.image_url) || fallback.image,
    href: record.href ?? fallback.href,
    ctaLabel: record.cta_label ?? fallback.ctaLabel,
    ctaCaption: record.cta_caption ?? fallback.ctaCaption,
    tags: Array.isArray(record.tags) ? record.tags : fallback.tags
  };
}

function toActionStrip(
  record: DirectusSectionRecord,
  fallback: ActionStripContent
): ActionStripContent {
  return {
    kicker: record.kicker ?? fallback.kicker,
    title: record.title ?? fallback.title,
    body: record.body ?? fallback.body,
    primaryLabel: record.primary_label ?? fallback.primaryLabel,
    primaryHref: record.primary_href ?? fallback.primaryHref,
    secondaryLabel: record.secondary_label ?? fallback.secondaryLabel,
    secondaryHref: record.secondary_href ?? fallback.secondaryHref
  };
}

function toHomeAppCard(
  record: DirectusSectionRecord,
  fallback: HomeAppCardContent
): HomeAppCardContent {
  return {
    kicker: record.kicker ?? fallback.kicker,
    title: record.title ?? fallback.title,
    body: record.body ?? fallback.body,
    meta: toStringArray(record.meta) ?? fallback.meta,
    actionLabel: record.cta_label ?? fallback.actionLabel,
    actionHref: record.href ?? fallback.actionHref
  };
}

function toLegalCard(
  record: DirectusSectionRecord,
  fallback: LegalCardContent
): LegalCardContent {
  return {
    kicker: record.kicker ?? fallback.kicker,
    title: record.title ?? fallback.title,
    body: record.body ?? fallback.body,
    meta: toStringArray(record.meta) ?? fallback.meta
  };
}

function toSeoLead(record: DirectusSectionRecord, fallback: SeoLeadContent): SeoLeadContent {
  return {
    kicker: record.kicker ?? fallback.kicker,
    title: record.title ?? fallback.title
  };
}

function toSeoCard(record: DirectusSectionRecord, fallback: SeoCardContent): SeoCardContent {
  return {
    kicker: record.kicker ?? fallback.kicker,
    title: record.title ?? fallback.title,
    body: record.body ?? fallback.body,
    paragraphs: toStringArray(record.paragraphs) ?? fallback.paragraphs,
    note: record.note ?? fallback.note
  };
}

function toSectionHeader(
  record: DirectusSectionRecord | undefined,
  fallback?: SectionHeaderContent
): SectionHeaderContent {
  return {
    title: record?.title ?? fallback?.title ?? "",
    ctaLabel: record?.cta_label ?? fallback?.ctaLabel,
    ctaHref: record?.href ?? fallback?.ctaHref,
    body: record?.body ?? fallback?.body
  };
}

function toFooterBrand(
  record: DirectusSectionRecord,
  fallback: FooterBrandContent
): FooterBrandContent {
  return {
    title: record.title ?? fallback.title,
    body: record.body ?? fallback.body
  };
}

function toFooterMeta(
  record: DirectusSectionRecord,
  fallback: FooterMetaContent
): FooterMetaContent {
  return {
    email: record.email ?? fallback.email,
    phone: record.phone ?? fallback.phone,
    address: record.address ?? fallback.address,
    locale: record.locale ?? fallback.locale,
    hours: record.hours ?? fallback.hours,
    age: record.age ?? fallback.age,
    bottomEmail: record.bottom_email ?? fallback.bottomEmail,
    bottomNote: record.bottom_note ?? fallback.bottomNote
  };
}

function toMobileInfoLink(record: DirectusSectionItemRecord): MobileInfoLinkContent {
  return {
    id: record.slug ?? record.title ?? "mobile-info-link",
    title: pickText(record.title, record.label),
    body: record.body ?? "",
    href: record.href ?? "/"
  };
}

function toMobileInfoHub(
  record: DirectusSectionRecord | undefined,
  links: MobileInfoLinkContent[],
  fallback: MobileInfoHubContent
): MobileInfoHubContent {
  return {
    kicker: record?.kicker ?? fallback.kicker,
    title: record?.title ?? fallback.title,
    body: record?.body ?? fallback.body,
    links
  };
}

function toGameTile(record: DirectusSectionItemRecord): GameTileContent {
  return {
    id: record.slug ?? record.title ?? "game-tile",
    title: record.title ?? "",
    provider: record.provider ?? "",
    image: buildAssetUrl(record.image, record.image_url),
    rank: record.rank ?? undefined
  };
}

function toMiniGamePill(record: DirectusSectionItemRecord): MiniGamePillContent {
  return {
    id: record.slug ?? record.title ?? "mini-game-pill",
    title: pickText(record.title, record.label),
    image: buildAssetUrl(record.image, record.image_url)
  };
}

function toGiftCard(record: DirectusSectionItemRecord): GiftCardContent {
  return {
    id: record.slug ?? record.title ?? "gift-card",
    title: record.title ?? "",
    body: record.body ?? "",
    image: buildAssetUrl(record.image, record.image_url),
    tone: record.tone ?? "green"
  };
}

function toSocialLink(record: DirectusSectionItemRecord): SocialLinkContent {
  return {
    id: record.slug ?? record.label ?? "social-link",
    label: pickText(record.label, record.title),
    href: record.href ?? "/",
    mark: record.mark ?? "",
    tone: record.tone ?? ""
  };
}

function toFaqItem(record: DirectusSectionItemRecord): FaqItemContent {
  return {
    id: record.slug ?? record.title ?? "faq-item",
    question: pickText(record.title, record.label),
    answer: record.body ?? ""
  };
}

function toContactPoint(record: DirectusSectionItemRecord): ContactPointContent {
  return {
    id: record.slug ?? record.label ?? "contact-point",
    label: pickText(record.label, record.title),
    value: record.value ?? "",
    href: record.href ?? undefined
  };
}

function toFooterLink(record: DirectusSectionItemRecord): FooterLinkContent {
  return {
    id: record.slug ?? record.label ?? "footer-link",
    label: pickText(record.label, record.title),
    href: record.href ?? "/"
  };
}

function toStoreButton(record: DirectusSectionItemRecord): StoreButtonContent {
  return {
    id: record.slug ?? record.title ?? "store-button",
    title: record.title ?? "",
    caption: record.caption ?? "",
    image: buildAssetUrl(record.image, record.image_url),
    width: toPositiveNumber(record.width, 220),
    height: toPositiveNumber(record.height, 66)
  };
}

function toSideRailItem(record: DirectusSectionItemRecord): SideRailItemContent {
  return {
    id: record.slug ?? record.label ?? "side-rail-item",
    label: pickText(record.label, record.title),
    short: pickText(record.value, record.mark, record.label?.slice(0, 1)),
    href: record.href ?? "/"
  };
}

function toMobileDockItem(record: DirectusSectionItemRecord): MobileDockItemContent {
  return {
    id: record.slug ?? record.label ?? "mobile-dock-item",
    label: pickText(record.label, record.title),
    href: record.href ?? "/",
    icon: pickText(record.mark, "home"),
    modal: record.variant === "modal" ? pickText(record.value) : undefined
  };
}

function toBonusMatrixRow(record: DirectusSectionItemRecord): BonusMatrixRowContent {
  return {
    id: record.slug ?? record.label ?? "bonus-matrix-row",
    label: pickText(record.label, record.title),
    values: toStringArray(record.values) ?? []
  };
}

function toMonthlyFeaturedCard(
  record: DirectusSectionRecord | undefined,
  fallback: MonthlyFeaturedCardContent
): MonthlyFeaturedCardContent {
  return {
    badge: record?.kicker ?? fallback.badge,
    body: record?.body ?? fallback.body,
    ctaLabel: record?.cta_label ?? fallback.ctaLabel,
    href: record?.href ?? fallback.href
  };
}

function toAppRequirement(record: DirectusSectionItemRecord): AppRequirementContent {
  const values = toStringArray(record.values) ?? [];

  return {
    id: record.slug ?? record.label ?? "app-requirement",
    label: pickText(record.label, record.title),
    android: values[0] ?? "",
    ios: values[1] ?? ""
  };
}

function toCtaLink(record: DirectusSectionItemRecord): CtaLink {
  const variant = record.variant === "primary" || record.variant === "secondary"
    ? record.variant
    : "primary";

  return {
    id: record.slug ?? record.label ?? "cta-link",
    label: pickText(record.label, record.title),
    href: record.href ?? "/",
    variant
  };
}

function toSurfaceChip(record: DirectusSectionItemRecord): SurfaceChip {
  return {
    id: record.slug ?? record.label ?? "surface-chip",
    label: pickText(record.label, record.title),
    active: record.is_active ?? false
  };
}

function toInfoCard(record: DirectusSectionItemRecord): InfoCard {
  return {
    id: record.slug ?? record.label ?? "info-card",
    label: pickText(record.label, record.title),
    value: record.value ?? "",
    body: record.body ?? ""
  };
}

function toTextEntry(record: DirectusSectionItemRecord) {
  return pickText(record.label, record.title, record.body, record.value);
}

function toFooterGroups(records: DirectusSectionItemRecord[]): FooterGroupContent[] {
  const orderedGroups: FooterGroupContent[] = [];
  const groupMap = new Map<string, FooterGroupContent>();

  for (const record of records) {
    const title = pickText(record.group_label, "Links");
    const key = normalizeId(title);
    let group = groupMap.get(key);

    if (!group) {
      group = {
        id: key,
        title,
        links: []
      };
      orderedGroups.push(group);
      groupMap.set(key, group);
    }

    group.links.push({
      id: record.slug ?? normalizeId(pickText(record.label, record.title, record.href)),
      label: pickText(record.label, record.title),
      href: record.href ?? "/"
    });
  }

  return orderedGroups;
}

async function fetchDirectusBanners(route: StorefrontRoute): Promise<DirectusBannerRecord[] | null> {
  if (!DIRECTUS_URL || CONTENT_MODE === "mock") {
    return null;
  }

  try {
    const response = await fetchDirectus(
      `${DIRECTUS_URL}/items/storefront_banners?filter[route][_eq]=${route}&filter[status][_eq]=published&sort=position&fields=*`,
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
      data?: DirectusBannerRecord[];
    };

    return payload.data ?? null;
  } catch {
    return null;
  }
}

async function fetchDirectusSections(
  route: StorefrontRoute
): Promise<DirectusSectionRecord[] | null> {
  if (!DIRECTUS_URL || CONTENT_MODE === "mock") {
    return null;
  }

  try {
    const response = await fetchDirectus(
      `${DIRECTUS_URL}/items/storefront_sections?filter[route][_eq]=${route}&filter[status][_eq]=published&sort=position,slug&fields=*`,
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
      data?: DirectusSectionRecord[];
    };

    return payload.data ?? null;
  } catch {
    return null;
  }
}

async function fetchDirectusSectionItems(
  route: StorefrontRoute
): Promise<DirectusSectionItemRecord[] | null> {
  if (!DIRECTUS_URL || CONTENT_MODE === "mock") {
    return null;
  }

  try {
    const response = await fetchDirectus(
      `${DIRECTUS_URL}/items/storefront_section_items?filter[route][_eq]=${route}&filter[status][_eq]=published&sort=section_key,position,slug&fields=*`,
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
      data?: DirectusSectionItemRecord[];
    };

    return payload.data ?? null;
  } catch {
    return null;
  }
}

function applyHomeBannerOverrides(
  content: HomeRouteContent,
  banners: DirectusBannerRecord[] | null
): HomeRouteContent {
  if (!banners?.length) {
    return content;
  }

  const promoStrip = banners.filter((record) => record.kind === "promo_strip");
  const heroSlider = banners.filter((record) => record.kind === "hero_slider");
  const promoSlider = banners.filter((record) => record.kind === "promo_slider");
  const middleBanner = banners.find((record) => record.kind === "feature_banner");
  const partnerBanner = banners.find((record) => record.kind === "partner_banner");

  return {
    ...content,
    heroPromos: promoStrip.length ? promoStrip.map(toPromoCard) : content.heroPromos,
    heroSliderSlides: heroSlider.length
      ? heroSlider.map(toHeroSliderSlide)
      : content.heroSliderSlides,
    promotionSliderSlides: promoSlider.length
      ? promoSlider.map(toPromoSliderSlide)
      : content.promotionSliderSlides,
    middleBanner: middleBanner
      ? toFeatureBanner(middleBanner, content.middleBanner)
      : content.middleBanner,
    partnerBanner: partnerBanner
      ? toFeatureBanner(partnerBanner, content.partnerBanner)
      : content.partnerBanner
  };
}

function applyCatalogBannerOverrides(
  content: CatalogRouteContent,
  banners: DirectusBannerRecord[] | null
): CatalogRouteContent {
  if (!banners?.length) {
    return content;
  }

  const promoStrip = banners.filter((record) => record.kind === "promo_strip");
  const featureBanner = banners.find((record) => record.kind === "feature_banner");
  const partnerBanner = banners.find((record) => record.kind === "partner_banner");

  return {
    ...content,
    heroPromos: promoStrip.length ? promoStrip.map(toPromoCard) : content.heroPromos,
    featureBanner: featureBanner
      ? toFeatureBanner(featureBanner, content.featureBanner)
      : content.featureBanner,
    partnerBanner: partnerBanner
      ? toFeatureBanner(partnerBanner, content.partnerBanner)
      : content.partnerBanner
  };
}

function applyLiveBannerOverrides(
  content: LiveRouteContent,
  banners: DirectusBannerRecord[] | null
): LiveRouteContent {
  if (!banners?.length) {
    return content;
  }

  const promoStrip = banners.filter((record) => record.kind === "promo_strip");
  const featureBanner = banners.find((record) => record.kind === "feature_banner");
  const partnerBanner = banners.find((record) => record.kind === "partner_banner");

  return {
    ...content,
    heroPromos: promoStrip.length ? promoStrip.map(toPromoCard) : content.heroPromos,
    featureBanner: featureBanner
      ? toFeatureBanner(featureBanner, content.featureBanner)
      : content.featureBanner,
    partnerBanner: partnerBanner
      ? toFeatureBanner(partnerBanner, content.partnerBanner)
      : content.partnerBanner
  };
}

function applyHomeSectionOverrides(
  content: HomeRouteContent,
  sections: DirectusSectionRecord[] | null,
  items: DirectusSectionItemRecord[] | null
): HomeRouteContent {
  if (!sections?.length && !items?.length) {
    return content;
  }

  const sectionMap = new Map(
    (sections ?? [])
      .filter((section): section is DirectusSectionRecord & { section_key: string } =>
        typeof section.section_key === "string"
      )
      .map((section) => [section.section_key, section] as const)
  );
  const itemMap = groupItemsBySection(items);
  const mobileInfoLinks = mapSectionItems(
    itemMap,
    "mobile_info_links",
    toMobileInfoLink,
    content.mobileInfoHub.links
  );
  const footerGroupRecords = itemMap.get("footer_group_links");

  const bonusBar = sectionMap.get("bonus_bar");
  const appCard = sectionMap.get("app_card");
  const socialCard = sectionMap.get("social_card");
  const legalCard = sectionMap.get("legal_card");
  const mobileInfoHub = sectionMap.get("mobile_info_hub");
  const seoLead = sectionMap.get("seo_lead");
  const bonusSeoCard = sectionMap.get("bonus_seo_card");
  const appSeoCard = sectionMap.get("app_seo_card");
  const responsibleSeoCard = sectionMap.get("responsible_seo_card");
  const footerBrand = sectionMap.get("footer_brand");
  const footerMeta = sectionMap.get("footer_meta");
  const topSlotsHeader = sectionMap.get("home_top_slots_header");
  const liveHeader = sectionMap.get("home_live_header");
  const bonusGamesHeader = sectionMap.get("home_bonus_header");
  const monthlyTopHeader = sectionMap.get("home_monthly_top_header");
  const promotionsHeader = sectionMap.get("home_promotions_header");
  const monthlyFeaturedCard = sectionMap.get("home_monthly_featured_card");

  return {
    ...content,
    bonusBar: bonusBar ? toActionStrip(bonusBar, content.bonusBar) : content.bonusBar,
    topSlotsHeader: toSectionHeader(topSlotsHeader, content.topSlotsHeader),
    liveHeader: toSectionHeader(liveHeader, content.liveHeader),
    bonusGamesHeader: toSectionHeader(bonusGamesHeader, content.bonusGamesHeader),
    monthlyTopHeader: toSectionHeader(monthlyTopHeader, content.monthlyTopHeader),
    promotionsHeader: toSectionHeader(promotionsHeader, content.promotionsHeader),
    monthlyFeaturedCard: toMonthlyFeaturedCard(
      monthlyFeaturedCard,
      content.monthlyFeaturedCard
    ),
    appCard: appCard ? toHomeAppCard(appCard, content.appCard) : content.appCard,
    socialCard: socialCard
      ? {
          kicker: socialCard.kicker ?? content.socialCard.kicker,
          title: socialCard.title ?? content.socialCard.title,
          body: socialCard.body ?? content.socialCard.body
        }
      : content.socialCard,
    legalCard: legalCard ? toLegalCard(legalCard, content.legalCard) : content.legalCard,
    mobileInfoHub:
      mobileInfoHub || itemMap.get("mobile_info_links")?.length
        ? toMobileInfoHub(mobileInfoHub, mobileInfoLinks, content.mobileInfoHub)
        : content.mobileInfoHub,
    seoLead: seoLead ? toSeoLead(seoLead, content.seoLead) : content.seoLead,
    bonusSeoCard: bonusSeoCard
      ? toSeoCard(bonusSeoCard, content.bonusSeoCard)
      : content.bonusSeoCard,
    appSeoCard: appSeoCard ? toSeoCard(appSeoCard, content.appSeoCard) : content.appSeoCard,
    responsibleSeoCard: responsibleSeoCard
      ? toSeoCard(responsibleSeoCard, content.responsibleSeoCard)
      : content.responsibleSeoCard,
    footerBrand: footerBrand
      ? toFooterBrand(footerBrand, content.footerBrand)
      : content.footerBrand,
    footerMeta: footerMeta ? toFooterMeta(footerMeta, content.footerMeta) : content.footerMeta,
    topSlots: mapSectionItems(itemMap, "top_slots", toGameTile, content.topSlots),
    bonusGames: mapSectionItems(itemMap, "bonus_games", toGameTile, content.bonusGames),
    liveGames: mapSectionItems(itemMap, "live_games", toGameTile, content.liveGames),
    monthlyTop: mapSectionItems(itemMap, "monthly_top", toGameTile, content.monthlyTop),
    quickPicks: mapSectionItems(itemMap, "quick_picks", toMiniGamePill, content.quickPicks),
    welcomeGifts: mapSectionItems(
      itemMap,
      "welcome_gifts",
      toGiftCard,
      content.welcomeGifts
    ),
    socialLinks: mapSectionItems(itemMap, "social_links", toSocialLink, content.socialLinks),
    faqItems: mapSectionItems(itemMap, "faq_items", toFaqItem, content.faqItems),
    providerHighlights: mapSectionItems(
      itemMap,
      "provider_highlights",
      toTextEntry,
      content.providerHighlights
    ),
    contactPoints: mapSectionItems(
      itemMap,
      "contact_points",
      toContactPoint,
      content.contactPoints
    ),
    footerLinks: mapSectionItems(itemMap, "footer_links", toFooterLink, content.footerLinks),
    sideRailItems: mapSectionItems(
      itemMap,
      "side_rail_items",
      toSideRailItem,
      content.sideRailItems
    ),
    mobileDockItems: mapSectionItems(
      itemMap,
      "mobile_dock_items",
      toMobileDockItem,
      content.mobileDockItems
    ),
    storeButtons: mapSectionItems(
      itemMap,
      "store_buttons",
      toStoreButton,
      content.storeButtons
    ),
    footerGroups: footerGroupRecords?.length
      ? toFooterGroups(footerGroupRecords)
      : content.footerGroups,
    paymentMethods: mapSectionItems(
      itemMap,
      "payment_methods",
      toTextEntry,
      content.paymentMethods
    ),
    seoIntro: mapSectionItems(itemMap, "seo_intro", toTextEntry, content.seoIntro),
    bonusMatrix: mapSectionItems(
      itemMap,
      "bonus_matrix",
      toBonusMatrixRow,
      content.bonusMatrix
    ),
    bonusSlotPlan: mapSectionItems(
      itemMap,
      "bonus_slot_plan",
      toTextEntry,
      content.bonusSlotPlan
    ),
    appRequirements: mapSectionItems(
      itemMap,
      "app_requirements",
      toAppRequirement,
      content.appRequirements
    ),
    androidSteps: mapSectionItems(
      itemMap,
      "android_steps",
      toTextEntry,
      content.androidSteps
    ),
    iosSteps: mapSectionItems(itemMap, "ios_steps", toTextEntry, content.iosSteps),
    responsiblePoints: mapSectionItems(
      itemMap,
      "responsible_points",
      toTextEntry,
      content.responsiblePoints
    )
  };
}

function applyCatalogSectionOverrides(
  content: CatalogRouteContent,
  sections: DirectusSectionRecord[] | null
): CatalogRouteContent {
  if (!sections?.length) {
    return content;
  }

  const sectionMap = new Map(
    sections
      .filter((section): section is DirectusSectionRecord & { section_key: string } =>
        typeof section.section_key === "string"
      )
      .map((section) => [section.section_key, section] as const)
  );

  return {
    ...content,
    gameHallHeader: toSectionHeader(
      sectionMap.get("catalog_game_hall_header"),
      content.gameHallHeader
    ),
    discoveryHeader: toSectionHeader(
      sectionMap.get("catalog_discovery_header"),
      content.discoveryHeader
    ),
    liveHeader: toSectionHeader(sectionMap.get("catalog_live_header"), content.liveHeader),
    bonusHeader: toSectionHeader(sectionMap.get("catalog_bonus_header"), content.bonusHeader),
    monthlyTopHeader: toSectionHeader(
      sectionMap.get("catalog_monthly_top_header"),
      content.monthlyTopHeader
    )
  };
}

function applyCatalogItemOverrides(
  content: CatalogRouteContent,
  items: DirectusSectionItemRecord[] | null
): CatalogRouteContent {
  if (!items?.length) {
    return content;
  }

  const itemMap = groupItemsBySection(items);

  return {
    ...content,
    sideRailItems: mapSectionItems(
      itemMap,
      "side_rail_items",
      toSideRailItem,
      content.sideRailItems
    ),
    topSlots: mapSectionItems(itemMap, "top_slots", toGameTile, content.topSlots),
    discoveryGames: mapSectionItems(
      itemMap,
      "discovery_games",
      toGameTile,
      content.discoveryGames
    ),
    bonusGames: mapSectionItems(itemMap, "bonus_games", toGameTile, content.bonusGames),
    liveGames: mapSectionItems(itemMap, "live_games", toGameTile, content.liveGames),
    quickPicks: mapSectionItems(itemMap, "quick_picks", toMiniGamePill, content.quickPicks),
    monthlyTop: mapSectionItems(itemMap, "monthly_top", toGameTile, content.monthlyTop),
    providerHighlights: mapSectionItems(
      itemMap,
      "provider_highlights",
      toTextEntry,
      content.providerHighlights
    ),
    footerSignals: mapSectionItems(
      itemMap,
      "footer_signals",
      toTextEntry,
      content.footerSignals
    )
  };
}

function applyLiveSectionOverrides(
  content: LiveRouteContent,
  sections: DirectusSectionRecord[] | null
): LiveRouteContent {
  if (!sections?.length) {
    return content;
  }

  const sectionMap = new Map(
    sections
      .filter((section): section is DirectusSectionRecord & { section_key: string } =>
        typeof section.section_key === "string"
      )
      .map((section) => [section.section_key, section] as const)
  );

  return {
    ...content,
    mainLobbyHeader: toSectionHeader(
      sectionMap.get("live_main_lobby_header"),
      content.mainLobbyHeader
    ),
    comebackHeader: toSectionHeader(
      sectionMap.get("live_comeback_header"),
      content.comebackHeader
    ),
    primeTablesHeader: toSectionHeader(
      sectionMap.get("live_prime_tables_header"),
      content.primeTablesHeader
    ),
    crossSellHeader: toSectionHeader(
      sectionMap.get("live_cross_sell_header"),
      content.crossSellHeader
    )
  };
}

function applyLiveItemOverrides(
  content: LiveRouteContent,
  items: DirectusSectionItemRecord[] | null
): LiveRouteContent {
  if (!items?.length) {
    return content;
  }

  const itemMap = groupItemsBySection(items);

  return {
    ...content,
    sideRailItems: mapSectionItems(
      itemMap,
      "side_rail_items",
      toSideRailItem,
      content.sideRailItems
    ),
    liveGames: mapSectionItems(itemMap, "live_games", toGameTile, content.liveGames),
    primeTables: mapSectionItems(itemMap, "prime_tables", toGameTile, content.primeTables),
    comebackTables: mapSectionItems(
      itemMap,
      "comeback_tables",
      toGameTile,
      content.comebackTables
    ),
    slotCrossSell: mapSectionItems(
      itemMap,
      "slot_cross_sell",
      toGameTile,
      content.slotCrossSell
    ),
    providerHighlights: mapSectionItems(
      itemMap,
      "provider_highlights",
      toTextEntry,
      content.providerHighlights
    ),
    footerSignals: mapSectionItems(
      itemMap,
      "footer_signals",
      toTextEntry,
      content.footerSignals
    )
  };
}

function applyCatalogPageOverrides(
  content: CatalogPageData,
  sections: DirectusSectionRecord[] | null,
  items: DirectusSectionItemRecord[] | null
): CatalogPageData {
  if (!sections?.length && !items?.length) {
    return content;
  }

  const sectionMap = new Map(
    (sections ?? [])
      .filter((section): section is DirectusSectionRecord & { section_key: string } =>
        typeof section.section_key === "string"
      )
      .map((section) => [section.section_key, section] as const)
  );
  const itemMap = groupItemsBySection(items);
  const hero = sectionMap.get("catalog_hero");
  const consoleSection = sectionMap.get("catalog_console");

  return {
    ...content,
    hero: {
      ...content.hero,
      kicker: hero?.kicker ?? content.hero.kicker,
      title: hero?.title ?? content.hero.title,
      body: hero?.body ?? content.hero.body,
      image: buildAssetUrl(hero?.image, hero?.image_url) || content.hero.image,
      imageAlt: hero?.image_alt ?? content.hero.imageAlt,
      actions: mapSectionItems(
        itemMap,
        "catalog_hero_actions",
        toCtaLink,
        content.hero.actions
      ),
      chips: mapSectionItems(
        itemMap,
        "catalog_hero_chips",
        toSurfaceChip,
        content.hero.chips
      )
    },
    console: {
      ...content.console,
      label: consoleSection?.kicker ?? content.console.label,
      badge: consoleSection?.badge ?? content.console.badge,
      image: buildAssetUrl(consoleSection?.image, consoleSection?.image_url) || content.console.image,
      imageAlt: consoleSection?.image_alt ?? content.console.imageAlt,
      searchPlaceholder: consoleSection?.search_placeholder ?? content.console.searchPlaceholder,
      searchShortcut: consoleSection?.search_shortcut ?? content.console.searchShortcut,
      chips: mapSectionItems(
        itemMap,
        "catalog_console_chips",
        toSurfaceChip,
        content.console.chips
      ),
      footerCards: mapSectionItems(
        itemMap,
        "catalog_console_footer_cards",
        toInfoCard,
        content.console.footerCards
      )
    }
  };
}

function applyLivePageOverrides(
  content: LivePageData,
  sections: DirectusSectionRecord[] | null,
  items: DirectusSectionItemRecord[] | null
): LivePageData {
  if (!sections?.length && !items?.length) {
    return content;
  }

  const sectionMap = new Map(
    (sections ?? [])
      .filter((section): section is DirectusSectionRecord & { section_key: string } =>
        typeof section.section_key === "string"
      )
      .map((section) => [section.section_key, section] as const)
  );
  const itemMap = groupItemsBySection(items);
  const hero = sectionMap.get("live_hero");
  const consoleSection = sectionMap.get("live_console");

  return {
    ...content,
    hero: {
      ...content.hero,
      kicker: hero?.kicker ?? content.hero.kicker,
      title: hero?.title ?? content.hero.title,
      body: hero?.body ?? content.hero.body,
      image: buildAssetUrl(hero?.image, hero?.image_url) || content.hero.image,
      imageAlt: hero?.image_alt ?? content.hero.imageAlt,
      actions: mapSectionItems(itemMap, "live_hero_actions", toCtaLink, content.hero.actions),
      points: mapSectionItems(itemMap, "live_hero_points", toTextEntry, content.hero.points)
    },
    console: {
      ...content.console,
      featuredLabel: consoleSection?.kicker ?? content.console.featuredLabel,
      featuredTitle: consoleSection?.title ?? content.console.featuredTitle,
      featuredBody: consoleSection?.body ?? content.console.featuredBody,
      image: buildAssetUrl(consoleSection?.image, consoleSection?.image_url) || content.console.image,
      imageAlt: consoleSection?.image_alt ?? content.console.imageAlt,
      pillLabel: consoleSection?.pill_label ?? content.console.pillLabel,
      footerCards: mapSectionItems(
        itemMap,
        "live_console_footer_cards",
        toInfoCard,
        content.console.footerCards
      )
    },
    quickReturn: mapSectionItems(itemMap, "live_quick_return", toInfoCard, content.quickReturn)
  };
}

async function fetchDirectusPage<T>(
  slug: "home" | "catalog" | "live",
  fallback: T
): Promise<T> {
  if (!DIRECTUS_URL || CONTENT_MODE === "mock") {
    return fallback;
  }

  try {
    const response = await fetchDirectus(
      `${DIRECTUS_URL}/items/storefront_pages?filter[slug][_eq]=${slug}&fields=*.*.*`,
      {
        next: {
          revalidate: 60
        }
      } as NextFetchInit
    );

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as {
      data?: Array<T & { payload?: T }>;
    };

    const entry = payload.data?.[0];

    if (!entry) {
      return fallback;
    }

    const value = entry.payload ?? entry;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      fallback &&
      typeof fallback === "object" &&
      !Array.isArray(fallback)
    ) {
      return {
        ...(fallback as Record<string, unknown>),
        ...(value as Record<string, unknown>)
      } as T;
    }

    return value;
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
    const response = await fetchDirectus(
      `${DIRECTUS_URL}/items/storefront_route_payloads?filter[slug][_eq]=${slug}&fields=payload`,
      {
        next: {
          revalidate: 60
        }
      } as NextFetchInit
    );

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as {
      data?: Array<{ payload?: T }>;
    };

    const value = payload.data?.[0]?.payload;

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      fallback &&
      typeof fallback === "object" &&
      !Array.isArray(fallback)
    ) {
      return {
        ...(fallback as Record<string, unknown>),
        ...(value as Record<string, unknown>)
      } as T;
    }

    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  return fetchDirectusPage("home", mockHomePageData);
}

export async function getCatalogPageData(): Promise<CatalogPageData> {
  const [content, sections, items] = await Promise.all([
    fetchDirectusPage("catalog", mockCatalogPageData),
    fetchDirectusSections("catalog"),
    fetchDirectusSectionItems("catalog")
  ]);

  return applyCatalogPageOverrides(content, sections, items);
}

export async function getLivePageData(): Promise<LivePageData> {
  const [content, sections, items] = await Promise.all([
    fetchDirectusPage("live", mockLivePageData),
    fetchDirectusSections("live"),
    fetchDirectusSectionItems("live")
  ]);

  return applyLivePageOverrides(content, sections, items);
}

export async function getCatalogRouteContent(): Promise<CatalogRouteContent> {
  const [content, banners, sections, items] = await Promise.all([
    fetchDirectusRoutePayload("catalog", mockCatalogRouteContent),
    fetchDirectusBanners("catalog"),
    fetchDirectusSections("catalog"),
    fetchDirectusSectionItems("catalog")
  ]);

  return normalizeCatalogRouteContent(
    applyCatalogItemOverrides(
      applyCatalogSectionOverrides(applyCatalogBannerOverrides(content, banners), sections),
      items
    )
  );
}

export async function getLiveRouteContent(): Promise<LiveRouteContent> {
  const [content, banners, sections, items] = await Promise.all([
    fetchDirectusRoutePayload("live", mockLiveRouteContent),
    fetchDirectusBanners("live"),
    fetchDirectusSections("live"),
    fetchDirectusSectionItems("live")
  ]);

  return normalizeLiveRouteContent(
    applyLiveItemOverrides(
      applyLiveSectionOverrides(applyLiveBannerOverrides(content, banners), sections),
      items
    )
  );
}

export async function getHomeRouteContent(): Promise<HomeRouteContent> {
  const [content, banners, sections, items] = await Promise.all([
    fetchDirectusRoutePayload("home", mockHomeRouteContent),
    fetchDirectusBanners("home"),
    fetchDirectusSections("home"),
    fetchDirectusSectionItems("home")
  ]);

  return normalizeHomeRouteContent(
    applyHomeSectionOverrides(applyHomeBannerOverrides(content, banners), sections, items)
  );
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
