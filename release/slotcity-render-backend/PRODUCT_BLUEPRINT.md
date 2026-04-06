# SlotCity Web App Blueprint

## Goal

Build a new web application from scratch that keeps the visual DNA of `slotcity.ua`, but runs as an app-first product with:

- premium motion-heavy frontend
- no-code admin workflows for content and merchandising
- strong experimentation and analytics
- strict observability and performance controls

## Recommended Stack

- `Next.js` + `React` + `TypeScript` for `apps/web`
- `Directus` for admin, content, shelves, geo overrides, and workflows
- `PostgreSQL` for primary data
- `Redis` for storefront cache and shelf invalidation
- `PostHog` for product analytics, feature flags, A/B tests, session replay, and data pipelines
- `Braze` for CRM, lifecycle journeys, and marketing orchestration
- `Sentry` + `OpenTelemetry` for errors, tracing, and operational visibility
- `Motion` for app UI animation
- `GSAP` for premium hero and landing motion
- `Turborepo` for monorepo management

## Monorepo Layout

```text
apps/
  web/
  directus/
  events/
packages/
  ui/
  theme/
  analytics-schema/
  tracking/
  cms-sdk/
  flags-sdk/
  config/
  types/
infra/
  docker/
  ci/
  scripts/
```

## Service Responsibilities

### apps/web

- public storefront
- app shell for logged-in users
- catalog, live, search, bonus, promo pages
- BFF routes for storefront aggregation
- PWA behavior and install experience

### apps/directus

- banners, hero slides, text blocks, promo tiles
- shelves and merchandising rules
- geo, locale, device, and audience overrides
- role-based editorial access
- publish workflows and preview support

### apps/events

- canonical event ingestion
- event validation against schema
- enrichment with user, geo, campaign, experiment metadata
- forwarding to PostHog and Braze
- server-side capture of money and KYC events

## Frontend Principles

- visually close to current SlotCity brand language
- mobile-first and app-like navigation
- expensive-looking motion without harming interaction speed
- only one high-cost hero scene at most
- zero heavy WebGL inside catalog and search
- `prefers-reduced-motion` supported everywhere

## Animation System

- `Motion` for route transitions, shelves, cards, tabs, modals, overlays
- `GSAP` for hero sequences, scroll scenes, promo storytelling
- shared timing tokens in `packages/theme`
- motion levels:
  - `subtle`
  - `immersive`
  - `reduced`

## Directus Collections

- `games`
- `providers`
- `game_assets`
- `hero_slides`
- `banners`
- `promo_tiles`
- `pages`
- `globals_navigation`
- `globals_brand`
- `shelves`
- `shelf_items`
- `merch_rules`
- `geo_targets`
- `locale_targets`
- `audience_targets`
- `campaigns`
- `seo_pages`
- `redirects`
- `release_snapshots`

## Directus Roles

- `content_manager`
- `merchandiser`
- `marketing_manager`
- `compliance_reviewer`
- `analyst_readonly`
- `admin`

## Directus Flows

- publish content -> revalidate Next.js cache tags
- publish content -> invalidate Redis storefront keys
- activate campaign on schedule
- expire campaign on schedule
- send release notifications to Slack
- require approval for restricted promo changes
- precompute shelf payload after merchandising update

## Merchandising Model

Do not maintain full manual ordering for every game in every geo.

Use:

- `base_ranking`
- `pin`
- `boost`
- `hide`
- `replace`
- curated shelves for homepage and key landing pages

Overrides can target:

- country
- locale
- device type
- audience segment
- date window

## Event Schema Rules

All events use:

- `snake_case`
- past tense for completed facts
- noun + verb structure
- stable required properties

Required properties on nearly every event:

- `event_id`
- `occurred_at`
- `session_id`
- `anonymous_id`
- `user_id`
- `country`
- `locale`
- `device_type`
- `traffic_source`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `page_type`
- `experiment_key`
- `experiment_variant`

Commerce and storefront context where relevant:

- `banner_id`
- `hero_id`
- `shelf_id`
- `position`
- `game_id`
- `provider_id`
- `promo_id`

## Core Event Taxonomy

### Acquisition

- `landing_viewed`
- `cta_clicked`
- `registration_started`
- `registration_completed`

### Discovery

- `hero_impression`
- `hero_clicked`
- `banner_impression`
- `banner_clicked`
- `shelf_viewed`
- `game_card_viewed`
- `game_card_clicked`
- `search_submitted`
- `filter_changed`

### Activation

- `kyc_started`
- `kyc_completed`
- `deposit_started`
- `deposit_succeeded`
- `game_launch_started`
- `game_launch_succeeded`

### Reliability

- `game_launch_failed`
- `deposit_failed`
- `kyc_failed`
- `api_request_failed`
- `ui_exception_shown`

### Retention

- `session_started`
- `return_visit_recorded`
- `bonus_viewed`
- `bonus_activated`
- `favorite_added`
- `favorite_removed`

## Analytics Routing

- client UI events -> `apps/web` tracker -> `apps/events`
- server conversion events -> backend/domain services -> `apps/events`
- `apps/events` validates and enriches
- enriched events -> `PostHog`
- selected lifecycle events and traits -> `Braze`

## Feature Flags and Experiments

All risky changes ship behind flags.

Flag namespaces:

- `ui.*`
- `promo.*`
- `ranking.*`
- `onboarding.*`
- `payments.*`
- `search.*`

First experiments:

- hero creative
- home shelf order
- registration flow copy
- deposit CTA placement
- search results layout
- game card interaction model

## Braze Segments

- `guest_high_intent_24h`
- `registration_started_not_completed`
- `kyc_pending_24h`
- `deposit_started_not_completed`
- `first_deposit_completed`
- `reactivation_7d`
- `reactivation_30d`
- `live_affinity_users`
- `slots_affinity_users`
- `vip_candidate`
- `responsible_gaming_restricted`

## Braze Journeys

- registration completion journey
- KYC reminder journey
- first deposit conversion journey
- bonus activation journey
- lapsed user reactivation journey
- live preference journey

## Monitoring and Reliability

- Sentry on client, server, and edge runtime
- source maps for production releases
- tracing enabled on critical BFF routes
- replay sampling for issue investigation
- OpenTelemetry spans around cache, API, and search layers
- release health dashboard for every deployment

## Performance Budgets

- home `LCP p75 <= 2.2s`
- catalog `LCP p75 <= 2.5s`
- `INP p75 <= 200ms`
- `CLS <= 0.05`
- home initial JS `<= 180KB gzip`
- catalog initial JS `<= 220KB gzip`
- primary hero image `<= 250KB` on mobile
- route-level Lighthouse checks enforced in CI

## MVP Screens

- homepage
- catalog page
- live page
- search page
- bonuses page
- promo landing page
- game details modal or panel
- auth entry points
- lightweight logged-in app shell

## Sprint Backlog

### Sprint 1

- bootstrap monorepo
- initialize Next.js app
- initialize Directus project
- define design tokens and brand palette
- define canonical event schema

### Sprint 2

- build UI kit foundations
- build homepage layout
- build hero and shelf components
- set up PostHog, Sentry, and base tracking

### Sprint 3

- model Directus collections
- connect homepage banners and shelves to Directus
- add preview and publish flow
- add Redis cache strategy

### Sprint 4

- build catalog, live, and search pages
- build merchandising rules and geo overrides
- add feature flag integration
- add first experiments

### Sprint 5

- connect Braze journeys
- implement core CRM events
- add session replay and key dashboards
- harden admin roles and policies

### Sprint 6

- performance optimization pass
- Lighthouse CI budgets
- polish animation layer
- QA, rollout gates, and launch checklist

## Launch Gates

- all key events validated in production
- publish workflow tested end-to-end
- flag rollback tested
- Sentry release health stable
- no budget regressions in CI
- marketing can change banners and shelves without developer help

## Official References

- Next.js App Router: https://nextjs.org/docs/app
- Next.js BFF guide: https://nextjs.org/docs/app/guides/backend-for-frontend
- Directus Access Control: https://directus.io/docs/guides/auth/access-control
- Directus Flows: https://docs.directus.io/app/flows
- PostHog Product Analytics: https://posthog.com/docs/product-analytics
- PostHog Feature Flags: https://posthog.com/docs/feature-flags
- PostHog Experiments: https://posthog.com/docs/experiments
- PostHog Session Replay: https://posthog.com/docs/session-replay
- PostHog Data Pipelines: https://posthog.com/docs/cdp
- Braze Canvas: https://www.braze.com/docs/user_guide/engagement_tools/canvas
- Sentry for Next.js: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Performance budgets: https://web.dev/articles/performance-budgets-with-the-angular-cli
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
