import type { AudienceTarget, GeoTarget } from "@slotcity/types";

export interface NavigationLink {
  id: string;
  label: string;
  href: string;
}

export interface CtaLink {
  id: string;
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  mediaUrl: string;
}

export interface ShelfItem {
  id: string;
  gameId: string;
  title: string;
  provider: string;
  imageUrl: string;
  position: number;
}

export interface Shelf {
  id: string;
  slug: string;
  title: string;
  items: ShelfItem[];
  geo?: GeoTarget;
  audience?: AudienceTarget;
}

export interface SurfaceChip {
  id: string;
  label: string;
  active?: boolean;
}

export interface StatCard {
  id: string;
  label: string;
  value: string;
  body: string;
}

export interface FeatureCard {
  id: string;
  kicker?: string;
  title: string;
  body?: string;
  points?: string[];
}

export interface ShowcaseCard {
  id: string;
  title: string;
  meta: string;
  accent: "gold" | "green" | "blue";
}

export interface InfoCard {
  id: string;
  label: string;
  value: string;
  body: string;
}

export interface ShelfPreview {
  id: string;
  title: string;
  countLabel: string;
  items: string[];
}

export interface PromoCardContent {
  id: string;
  kicker: string;
  title: string;
  href: string;
  image: string;
}

export interface GameTileContent {
  id: string;
  title: string;
  provider: string;
  image: string;
  rank?: string;
}

export interface MiniGamePillContent {
  id: string;
  title: string;
  image: string;
}

export interface GiftCardContent {
  id: string;
  title: string;
  body: string;
  image: string;
  tone: string;
}

export interface SideRailItemContent {
  id: string;
  label: string;
  short: string;
}

export interface SocialLinkContent {
  id: string;
  label: string;
  href: string;
  mark: string;
  tone: string;
}

export interface FaqItemContent {
  id: string;
  question: string;
  answer: string;
}

export interface ContactPointContent {
  id: string;
  label: string;
  value: string;
  href?: string;
}

export interface FooterLinkContent {
  id: string;
  label: string;
  href: string;
}

export interface FooterGroupContent {
  id: string;
  title: string;
  links: FooterLinkContent[];
}

export interface StoreButtonContent {
  id: string;
  title: string;
  caption: string;
  image: string;
  width: number;
  height: number;
}

export interface BonusMatrixRowContent {
  id: string;
  label: string;
  values: string[];
}

export interface AppRequirementContent {
  id: string;
  label: string;
  android: string;
  ios: string;
}

export interface StorefrontPayload {
  hero: HeroSlide[];
  shelves: Shelf[];
}

export interface HomePageData {
  navigation: NavigationLink[];
  brandSubtitle: string;
  hero: {
    kicker: string;
    title: string;
    body: string;
    actions: CtaLink[];
    signals: string[];
  };
  infrastructureStats: StatCard[];
  capabilityCards: FeatureCard[];
  operatingLayers: FeatureCard[];
  architecture: {
    label: string;
    title: string;
    body: string;
    items: InfoCard[];
  };
  footerPanels: FeatureCard[];
  footerNote: string;
}

export interface CatalogPageData {
  navigation: NavigationLink[];
  hero: {
    kicker: string;
    title: string;
    body: string;
    actions: CtaLink[];
    chips: SurfaceChip[];
  };
  console: {
    label: string;
    badge: string;
    searchPlaceholder: string;
    searchShortcut: string;
    chips: SurfaceChip[];
    featuredGames: ShowcaseCard[];
    footerCards: InfoCard[];
  };
  stats: StatCard[];
  shelves: ShelfPreview[];
  operationsFeed: string[];
  floorCards: FeatureCard[];
}

export interface LivePageData {
  navigation: NavigationLink[];
  hero: {
    kicker: string;
    title: string;
    body: string;
    actions: CtaLink[];
    points: string[];
  };
  console: {
    featuredLabel: string;
    featuredTitle: string;
    featuredBody: string;
    tables: ShowcaseCard[];
    footerCards: InfoCard[];
  };
  stats: StatCard[];
  timeline: string[];
  quickReturn: InfoCard[];
  floorCards: FeatureCard[];
}

export interface CatalogRouteContent {
  heroPromos: PromoCardContent[];
  topSlots: GameTileContent[];
  discoveryGames: GameTileContent[];
  bonusGames: GameTileContent[];
  liveGames: GameTileContent[];
  quickPicks: MiniGamePillContent[];
  monthlyTop: GameTileContent[];
  providerHighlights: string[];
  footerSignals: string[];
}

export interface LiveRouteContent {
  heroPromos: PromoCardContent[];
  liveGames: GameTileContent[];
  primeTables: GameTileContent[];
  comebackTables: GameTileContent[];
  slotCrossSell: GameTileContent[];
  providerHighlights: string[];
  footerSignals: string[];
}

export interface HomeRouteContent {
  topSlots: GameTileContent[];
  bonusGames: GameTileContent[];
  liveGames: GameTileContent[];
  monthlyTop: GameTileContent[];
  quickPicks: MiniGamePillContent[];
  heroPromos: PromoCardContent[];
  welcomeGifts: GiftCardContent[];
  sideRailItems: SideRailItemContent[];
  socialLinks: SocialLinkContent[];
  faqItems: FaqItemContent[];
  providerHighlights: string[];
  contactPoints: ContactPointContent[];
  footerLinks: FooterLinkContent[];
  storeButtons: StoreButtonContent[];
  footerGroups: FooterGroupContent[];
  paymentMethods: string[];
  seoIntro: string[];
  bonusMatrix: BonusMatrixRowContent[];
  bonusSlotPlan: string[];
  appRequirements: AppRequirementContent[];
  androidSteps: string[];
  iosSteps: string[];
  responsiblePoints: string[];
}
