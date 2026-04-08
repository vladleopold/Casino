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
  href: string;
}

export interface MobileDockItemContent {
  id: string;
  label: string;
  href: string;
  icon: string;
  modal?: string;
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

export interface ImportedPageBreadcrumb {
  label: string;
  href: string;
}

export interface ImportedPagePayload {
  slug: string;
  path: string;
  locale: "uk" | "ru";
  pageType:
    | "page"
    | "promotion"
    | "provider"
    | "collection"
    | "slot"
    | "live"
    | "game"
    | "info";
  sourceUrl: string;
  title: string;
  kicker?: string;
  heading: string;
  description: string;
  canonicalUrl: string;
  heroImage?: string;
  shellRoute?: string;
  breadcrumbs: ImportedPageBreadcrumb[];
  html: string;
  extractedAt: string;
}

export interface MarketingHeroContent {
  kicker: string;
  title: string;
  body: string;
  image: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  chips: string[];
}

export interface HeroSliderStatContent {
  label: string;
  value: string;
}

export interface HeroSliderSlideContent {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  accent: "gold" | "violet" | "green";
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  chips: string[];
  stats: HeroSliderStatContent[];
}

export interface ActionBannerContent {
  id: string;
  kicker: string;
  title: string;
  body: string;
  image: string;
  href: string;
}

export interface PromoSliderSlideContent {
  id: string;
  kicker: string;
  title: string;
  body: string;
  image: string;
  href: string;
  color: string;
  ctaLabel: string;
}

export interface ActionStripContent {
  kicker: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface FeatureBannerContent {
  kicker: string;
  title: string;
  body: string;
  image: string;
  href: string;
  ctaLabel: string;
  ctaCaption?: string;
  tags?: string[];
}

export interface EditorialCardContent {
  id: string;
  kicker: string;
  title: string;
  body: string;
}

export interface SectionIntroContent {
  kicker: string;
  title: string;
  body: string;
}

export interface HomeAppCardContent extends SectionIntroContent {
  meta: string[];
  actionLabel: string;
  actionHref: string;
}

export interface LegalCardContent extends SectionIntroContent {
  meta: string[];
}

export interface MobileInfoLinkContent {
  id: string;
  title: string;
  body: string;
  href: string;
}

export interface MobileInfoHubContent extends SectionIntroContent {
  links: MobileInfoLinkContent[];
}

export interface SeoLeadContent {
  kicker: string;
  title: string;
}

export interface SeoCardContent extends SectionIntroContent {
  paragraphs?: string[];
  note?: string;
}

export interface SectionHeaderContent {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  body?: string;
}

export interface MonthlyFeaturedCardContent {
  badge: string;
  body: string;
  ctaLabel: string;
  href: string;
}

export interface FooterBrandContent {
  title: string;
  body: string;
}

export interface FooterMetaContent {
  email: string;
  phone: string;
  address: string;
  locale: string;
  hours: string;
  age: string;
  bottomEmail: string;
  bottomNote: string;
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
    image: string;
    imageAlt: string;
    actions: CtaLink[];
    chips: SurfaceChip[];
  };
  console: {
    label: string;
    badge: string;
    image: string;
    imageAlt: string;
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
    image: string;
    imageAlt: string;
    actions: CtaLink[];
    points: string[];
  };
  console: {
    featuredLabel: string;
    featuredTitle: string;
    featuredBody: string;
    image: string;
    imageAlt: string;
    pillLabel: string;
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
  featureBanner: FeatureBannerContent;
  partnerBanner: FeatureBannerContent;
  gameHallHeader: SectionHeaderContent;
  discoveryHeader: SectionHeaderContent;
  liveHeader: SectionHeaderContent;
  bonusHeader: SectionHeaderContent;
  monthlyTopHeader: SectionHeaderContent;
  topSlots: GameTileContent[];
  discoveryGames: GameTileContent[];
  bonusGames: GameTileContent[];
  liveGames: GameTileContent[];
  quickPicks: MiniGamePillContent[];
  monthlyTop: GameTileContent[];
  sideRailItems: SideRailItemContent[];
  providerHighlights: string[];
  footerSignals: string[];
}

export interface LiveRouteContent {
  heroPromos: PromoCardContent[];
  featureBanner: FeatureBannerContent;
  partnerBanner: FeatureBannerContent;
  mainLobbyHeader: SectionHeaderContent;
  comebackHeader: SectionHeaderContent;
  primeTablesHeader: SectionHeaderContent;
  crossSellHeader: SectionHeaderContent;
  liveGames: GameTileContent[];
  primeTables: GameTileContent[];
  comebackTables: GameTileContent[];
  slotCrossSell: GameTileContent[];
  sideRailItems: SideRailItemContent[];
  providerHighlights: string[];
  footerSignals: string[];
}

export interface HomeRouteContent {
  heroSliderSlides: HeroSliderSlideContent[];
  promotionSliderSlides: PromoSliderSlideContent[];
  bonusBar: ActionStripContent;
  middleBanner: FeatureBannerContent;
  partnerBanner: FeatureBannerContent;
  topSlotsHeader: SectionHeaderContent;
  liveHeader: SectionHeaderContent;
  bonusGamesHeader: SectionHeaderContent;
  monthlyTopHeader: SectionHeaderContent;
  promotionsHeader: SectionHeaderContent;
  monthlyFeaturedCard: MonthlyFeaturedCardContent;
  appCard: HomeAppCardContent;
  socialCard: SectionIntroContent;
  legalCard: LegalCardContent;
  mobileInfoHub: MobileInfoHubContent;
  seoLead: SeoLeadContent;
  bonusSeoCard: SeoCardContent;
  appSeoCard: SeoCardContent;
  responsibleSeoCard: SeoCardContent;
  footerBrand: FooterBrandContent;
  footerMeta: FooterMetaContent;
  topSlots: GameTileContent[];
  bonusGames: GameTileContent[];
  liveGames: GameTileContent[];
  monthlyTop: GameTileContent[];
  quickPicks: MiniGamePillContent[];
  heroPromos: PromoCardContent[];
  welcomeGifts: GiftCardContent[];
  sideRailItems: SideRailItemContent[];
  mobileDockItems: MobileDockItemContent[];
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

export interface PromotionsRouteContent {
  heroPromos: PromoCardContent[];
  hero: MarketingHeroContent;
  featuredPromotions: ActionBannerContent[];
  welcomeGames: GameTileContent[];
  seasonalGames: GameTileContent[];
  missions: EditorialCardContent[];
  footerSignals: string[];
}

export interface VipRouteContent {
  heroPromos: PromoCardContent[];
  hero: MarketingHeroContent;
  featuredPromotions: ActionBannerContent[];
  vipGames: GameTileContent[];
  loungeGames: GameTileContent[];
  benefits: EditorialCardContent[];
  footerSignals: string[];
}

export interface TournamentsRouteContent {
  heroPromos: PromoCardContent[];
  hero: MarketingHeroContent;
  featuredPromotions: ActionBannerContent[];
  tournamentGames: GameTileContent[];
  prizeGames: GameTileContent[];
  mechanics: EditorialCardContent[];
  footerSignals: string[];
}
