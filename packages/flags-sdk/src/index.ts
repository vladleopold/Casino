export const featureFlags = {
  heroRevamp: "ui.hero_revamp",
  homeShelfExperiment: "ranking.home_shelf_experiment",
  streamlinedSignup: "onboarding.streamlined_signup",
  stickyDepositCta: "payments.sticky_deposit_cta"
} as const;

export type FeatureFlagKey = (typeof featureFlags)[keyof typeof featureFlags];

export const experimentFlags = {
  homeHeroLayout: "experiments.home_hero_layout",
  catalogCards: "experiments.catalog_cards_v2",
  depositCta: "experiments.deposit_cta_v1"
} as const;

export const flagOwners: Record<
  FeatureFlagKey | (typeof experimentFlags)[keyof typeof experimentFlags],
  "growth" | "product" | "payments"
> = {
  "ui.hero_revamp": "growth",
  "ranking.home_shelf_experiment": "product",
  "onboarding.streamlined_signup": "growth",
  "payments.sticky_deposit_cta": "payments",
  "experiments.home_hero_layout": "growth",
  "experiments.catalog_cards_v2": "product",
  "experiments.deposit_cta_v1": "payments"
};
