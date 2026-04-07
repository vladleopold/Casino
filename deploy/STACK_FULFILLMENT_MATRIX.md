# Stack Fulfillment Matrix

This file maps the agreed platform plan to the current repository state.

Status legend:

- `implemented`: present in code or deploy config
- `partial`: scaffolded in code, but still needs vendor setup or product integration
- `pending`: planned but not yet implemented in this repository

## Core stack

### Next.js + React + TypeScript

- status: `implemented`
- evidence:
  - [apps/web/package.json](/Volumes/Work/Casino/apps/web/package.json)
  - [apps/web/app/layout.tsx](/Volumes/Work/Casino/apps/web/app/layout.tsx)
  - [apps/web/app/page.tsx](/Volumes/Work/Casino/apps/web/app/page.tsx)

### Directus for admin, banners, headings, geo-aware merchandising

- status: `partial`
- implemented:
  - Directus app scaffold: [apps/directus/package.json](/Volumes/Work/Casino/apps/directus/package.json)
  - schema blueprint: [apps/directus/schema/storefront-model.json](/Volumes/Work/Casino/apps/directus/schema/storefront-model.json)
  - route payload import/push flow: [apps/directus/scripts/export-route-payloads.ts](/Volumes/Work/Casino/apps/directus/scripts/export-route-payloads.ts), [apps/directus/scripts/push-route-payloads.ts](/Volumes/Work/Casino/apps/directus/scripts/push-route-payloads.ts)
  - route content reading in frontend: [packages/cms-sdk/src/client.ts](/Volumes/Work/Casino/packages/cms-sdk/src/client.ts)
- still needed for full completion:
  - real Directus roles/policies in the instance
  - no-code geo override UI, not just schema/types
  - custom extensions listed in [apps/directus/extensions/README.md](/Volumes/Work/Casino/apps/directus/extensions/README.md)

### PostHog for analytics, feature flags, A/B, session replay, event pipeline

- status: `partial`
- implemented:
  - browser init + replay gating: [apps/web/app/components/analytics-context.tsx](/Volumes/Work/Casino/apps/web/app/components/analytics-context.tsx)
  - canonical event schema: [packages/analytics-schema/src/index.ts](/Volumes/Work/Casino/packages/analytics-schema/src/index.ts)
  - HTTP tracking adapter: [packages/tracking/src/index.ts](/Volumes/Work/Casino/packages/tracking/src/index.ts)
  - ingestion pipeline to PostHog: [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)
  - shared flag catalog and owners: [packages/flags-sdk/src/index.ts](/Volumes/Work/Casino/packages/flags-sdk/src/index.ts)
  - client-side flag evaluation and experiment surface tracking: [apps/web/app/components/flag-surface.tsx](/Volumes/Work/Casino/apps/web/app/components/flag-surface.tsx)
- still needed for full completion:
  - live dashboards/cohorts configured in PostHog workspace

### Braze for CRM and journeys

- status: `partial`
- implemented:
  - server-side event forwarding to Braze `/users/track`: [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)
  - env/deploy scaffolding: [deploy/render/env.shared.example](/Volumes/Work/Casino/deploy/render/env.shared.example)
- still needed for full completion:
  - actual Braze segments and Canvas journeys in vendor workspace
  - launch-time validation against real Braze keys and endpoint

### Sentry + OpenTelemetry

- status: `implemented`
- evidence:
  - OTEL registration: [apps/web/instrumentation.ts](/Volumes/Work/Casino/apps/web/instrumentation.ts)
  - Sentry init in browser: [apps/web/app/providers.tsx](/Volumes/Work/Casino/apps/web/app/providers.tsx)
  - Next.js Sentry configs: [apps/web/sentry.server.config.ts](/Volumes/Work/Casino/apps/web/sentry.server.config.ts), [apps/web/sentry.edge.config.ts](/Volumes/Work/Casino/apps/web/sentry.edge.config.ts)

### Lighthouse CI + route bundle budgets

- status: `implemented`
- evidence:
  - Lighthouse assertions: [infra/ci/lighthouserc.json](/Volumes/Work/Casino/infra/ci/lighthouserc.json)
  - route-size budgets: [infra/ci/route-budgets.json](/Volumes/Work/Casino/infra/ci/route-budgets.json)
  - budget gate: [infra/scripts/check-route-budgets.mjs](/Volumes/Work/Casino/infra/scripts/check-route-budgets.mjs)
  - CI workflow: [.github/workflows/platform-ci.yml](/Volumes/Work/Casino/.github/workflows/platform-ci.yml)

## Responsibility split

### Directus = what we show

- status: `partial`
- current repo supports content payload delivery through Directus
- still needs the production Directus instance, roles, and content workflows configured

### PostHog = how people behave

- status: `partial`
- current repo captures canonical events, evaluates tracked flags in the browser, and forwards events
- still needs real vendor dashboards, cohorts, and workspace configuration

### Braze = marketing and CRM journeys

- status: `partial`
- current repo can forward events to Braze
- journey orchestration lives in Braze itself and is not stored in this repo

### Sentry = where the product breaks or slows down

- status: `implemented`
- runtime wiring exists in the Next.js app

## Required product infrastructure

### Unified event schema and data contract package

- status: `implemented`
- evidence:
  - [packages/analytics-schema/src/index.ts](/Volumes/Work/Casino/packages/analytics-schema/src/index.ts)

### Client UI events

- status: `implemented`
- schema includes:
  - `page_viewed`
  - `banner_clicked`
  - `search_used`
  - `game_card_opened`
  - `shelf_scrolled`
- evidence:
  - [packages/analytics-schema/src/index.ts](/Volumes/Work/Casino/packages/analytics-schema/src/index.ts)
  - [apps/web/app/components/analytics-context.tsx](/Volumes/Work/Casino/apps/web/app/components/analytics-context.tsx)
  - [apps/web/app/components/tracked-button.tsx](/Volumes/Work/Casino/apps/web/app/components/tracked-button.tsx)
  - [apps/web/app/components/tracked-link.tsx](/Volumes/Work/Casino/apps/web/app/components/tracked-link.tsx)
  - [apps/web/app/components/tracked-game-card.tsx](/Volumes/Work/Casino/apps/web/app/components/tracked-game-card.tsx)
  - [apps/web/app/components/tracked-scroller.tsx](/Volumes/Work/Casino/apps/web/app/components/tracked-scroller.tsx)
  - [apps/web/app/page.tsx](/Volumes/Work/Casino/apps/web/app/page.tsx)
  - [apps/web/app/catalog/page.tsx](/Volumes/Work/Casino/apps/web/app/catalog/page.tsx)
  - [apps/web/app/live/page.tsx](/Volumes/Work/Casino/apps/web/app/live/page.tsx)

### Server business events

- status: `implemented` as schema and validation
- schema includes:
  - `registration_started`
  - `registration_completed`
  - `kyc_started`
  - `kyc_verified`
  - `deposit_started`
  - `deposit_succeeded`
  - `withdrawal_requested`
  - `bonus_activated`
  - `game_launch_succeeded`
- evidence:
  - [packages/analytics-schema/src/index.ts](/Volumes/Work/Casino/packages/analytics-schema/src/index.ts)
  - [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)
- note:
  - backend emitters for auth, KYC, payments, and game-launch systems are outside this repo and still need integration

### Common event properties

- status: `implemented`
- evidence:
  - [packages/analytics-schema/src/index.ts](/Volumes/Work/Casino/packages/analytics-schema/src/index.ts)
  - [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)
  - [apps/web/app/api/events/route.ts](/Volumes/Work/Casino/apps/web/app/api/events/route.ts)

### Identity stitching

- status: `partial`
- implemented:
  - `anonymousId`, `sessionId`, `userId` are part of the contract
  - `distinct_id` fallback logic exists in events service
  - browser analytics provider exposes `identify()` for real auth handoff
- evidence:
  - [apps/web/app/components/analytics-context.tsx](/Volumes/Work/Casino/apps/web/app/components/analytics-context.tsx)
  - [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)
- still needed:
  - explicit identify/alias step when real auth login happens

### Server-side conversion events for attribution

- status: `implemented` as ingestion rule
- evidence:
  - server events are accepted by [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)
  - money events are blocked from client source

### Cohorts and segments

- status: `partial`
- implemented:
  - audience and geo types exist: [packages/types/src/index.ts](/Volumes/Work/Casino/packages/types/src/index.ts)
  - plan and docs mention `vip`, `reactivation`, etc.
- still needed:
  - real PostHog cohorts and Braze segments configured in vendor dashboards

### Consent / PII layer

- status: `implemented`
- implemented:
  - consent field in event schema
  - browser defaults to `pending`
  - consent banner in the storefront
  - PII sanitization before forwarding to vendors
- evidence:
  - [packages/analytics-schema/src/index.ts](/Volumes/Work/Casino/packages/analytics-schema/src/index.ts)
  - [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)
  - [apps/web/app/components/analytics-context.tsx](/Volumes/Work/Casino/apps/web/app/components/analytics-context.tsx)
  - [apps/web/app/components/consent-banner.tsx](/Volumes/Work/Casino/apps/web/app/components/consent-banner.tsx)
- note:
  - a richer preference center can still be added later, but the required banner and consent state handling now exist in the repo

## Hard rules

### All money events only server-side

- status: `implemented`
- evidence:
  - `moneyEventNames` and source validation in [packages/analytics-schema/src/index.ts](/Volumes/Work/Casino/packages/analytics-schema/src/index.ts)
  - enforced in [apps/events/src/index.ts](/Volumes/Work/Casino/apps/events/src/index.ts)

### No custom event without schema and owner

- status: `implemented`
- evidence:
  - event catalog includes `owner`
  - unknown events are rejected by the events service

### New features behind flags

- status: `implemented`
- implemented:
  - shared flag catalog and owners
  - flag-aware surfaces in the storefront: [apps/web/app/components/flag-surface.tsx](/Volumes/Work/Casino/apps/web/app/components/flag-surface.tsx), [apps/web/app/components/sticky-deposit-cta.tsx](/Volumes/Work/Casino/apps/web/app/components/sticky-deposit-cta.tsx)

### Disputed UI changes through experiment

- status: `implemented`
- implemented:
  - experiment keys exist in [packages/flags-sdk/src/index.ts](/Volumes/Work/Casino/packages/flags-sdk/src/index.ts)
  - `experiment` and `variant` are supported in event payloads
  - concrete experiment exposure tracking exists in [apps/web/app/components/flag-surface.tsx](/Volumes/Work/Casino/apps/web/app/components/flag-surface.tsx)

### Key-screen budgets for LCP, INP, CLS, JS-size, image weight

- status: `implemented`
- evidence:
  - LCP, INP, CLS, byte-weight assertions in [infra/ci/lighthouserc.json](/Volumes/Work/Casino/infra/ci/lighthouserc.json)
  - route JS budgets in [infra/ci/route-budgets.json](/Volumes/Work/Casino/infra/ci/route-budgets.json)

### Marketing and CRM have their own workspace

- status: `partial`
- implemented:
  - Directus, Braze, PostHog, Render, Vercel, and Cloudflare rollout artifacts are prepared in `deploy/`
- still needed:
  - actual vendor workspaces, users, and permissions must be configured in production

## Bottom line

Implemented in repository:

- web stack
- deploy topology
- event schema
- server-side event validation
- Braze/PostHog forwarding pipeline
- Sentry + OTel wiring
- route budgets
- Lighthouse CI config and CI workflow
- Directus content transport layer
- consent banner and browser-side consent state
- tracked UI interactions on home, catalog, and live
- flag-aware surfaces and experiment exposure tracking
- release bundles

Still outside repository or still partial:

- final Directus roles/flows/extensions in the live instance
- vendor-side PostHog flags, experiments, dashboards, cohorts
- vendor-side Braze journeys and segments
- real auth-driven identity stitching
- full UI wiring for all canonical events and experiments
