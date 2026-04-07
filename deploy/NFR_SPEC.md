# NFR Specification

This document defines the non-functional requirements for the SlotCity storefront platform.

Scope:

- `apps/web` on `Vercel`
- `apps/directus` on `Render`
- `apps/events` on `Render`
- `deploy/cloudflare` Worker in front of public traffic

## 1. Availability

Targets:

- public storefront availability: `>= 99.9%` monthly
- Directus admin availability: `>= 99.5%` monthly
- events ingestion availability: `>= 99.9%` monthly

Requirements:

- `Cloudflare Worker` must stay lightweight and stateless
- `apps/events` must expose `/health`
- `Directus` must expose `server/health`
- launch and rollback must follow [LAUNCH_DAY_RUNBOOK.md](/Volumes/Work/Casino/deploy/LAUNCH_DAY_RUNBOOK.md)

Failure policy:

- storefront degradation is acceptable only for non-critical promo widgets
- game shelves, header, auth CTA, and navigation must remain available during CMS or analytics incidents
- if `Directus` is unavailable, storefront must fall back to cached or seeded payloads

## 2. Performance

Budgets:

- home route first-load JS: `<= 180 kB`
- catalog route first-load JS: `<= 220 kB`
- live route first-load JS: `<= 220 kB`
- home `LCP p75 <= 2.5s`
- catalog `LCP p75 <= 2.8s`
- live `LCP p75 <= 2.8s`
- `INP p75 <= 200ms`
- `CLS <= 0.05`

Requirements:

- route budgets must be enforced in CI
- Lighthouse assertions must block regressions
- image-heavy shelves must use optimized assets and stable aspect ratios
- no experiment, animation, or marketing widget may bypass route budgets

Evidence in repo:

- [route-budgets.json](/Volumes/Work/Casino/infra/ci/route-budgets.json)
- [check-route-budgets.mjs](/Volumes/Work/Casino/infra/scripts/check-route-budgets.mjs)
- [lighthouserc.json](/Volumes/Work/Casino/infra/ci/lighthouserc.json)
- [platform-ci.yml](/Volumes/Work/Casino/.github/workflows/platform-ci.yml)

## 3. Security

Requirements:

- client secrets must never be embedded in `apps/web`
- only `NEXT_PUBLIC_*` values may be exposed to the browser
- vendor write keys for `Braze`, `Directus`, and server-side analytics must stay server-side
- content management access must be role-based in `Directus`
- all admin actions must be auditable in production

Operational rules:

- `Directus` admin must require authenticated access
- `Render` services must use managed secrets, not committed `.env`
- `Cloudflare` secrets must be stored as Worker secrets or vars, not in client code

## 4. Privacy And Consent

Requirements:

- browser analytics must default to `pending` consent
- sensitive PII must be sanitized before vendor forwarding
- money events must be server-side only
- user identity stitching must happen only after authenticated handoff

Evidence in repo:

- [analytics-schema](/Volumes/Work/Casino/packages/analytics-schema/src/index.ts)
- [events service](/Volumes/Work/Casino/apps/events/src/index.ts)
- [consent-banner.tsx](/Volumes/Work/Casino/apps/web/app/components/consent-banner.tsx)
- [analytics-context.tsx](/Volumes/Work/Casino/apps/web/app/components/analytics-context.tsx)

## 5. Observability

Requirements:

- all production services must emit health endpoints
- browser and server errors must report to `Sentry`
- tracing must be enabled through `OpenTelemetry`
- releases must be diagnosable by route, service, and environment

Targets:

- critical client errors visible in `Sentry` within `<= 5 minutes`
- events ingestion failures visible in logs or monitoring within `<= 5 minutes`

Evidence in repo:

- [providers.tsx](/Volumes/Work/Casino/apps/web/app/providers.tsx)
- [instrumentation.ts](/Volumes/Work/Casino/apps/web/instrumentation.ts)
- [sentry.server.config.ts](/Volumes/Work/Casino/apps/web/sentry.server.config.ts)
- [sentry.edge.config.ts](/Volumes/Work/Casino/apps/web/sentry.edge.config.ts)

## 6. Analytics Quality

Requirements:

- all tracked events must exist in the canonical schema
- every event must have an owner
- unknown events must be rejected
- canonical fields must include `user_id`, `anonymous_id`, `session_id`, `geo`, `locale`, `device`, `campaign`, `experiment`, and `variant` where applicable

Targets:

- schema validation failure rate: `< 0.5%` of submitted events
- client event delivery success: `>= 99%`
- server conversion event delivery success: `>= 99.5%`

Rules:

- no custom event enters production without schema update
- all money events are accepted only from server source
- all experiments must emit exposure context

## 7. Content Operations

Requirements:

- content editors must be able to update banners, headings, and shelves without developer involvement
- publish workflow must support preview and rollback
- route payloads for `home`, `catalog`, and `live` must be reproducible from seed

Targets:

- standard content change publish time: `<= 10 minutes`
- emergency rollback to previous payload: `<= 15 minutes`

Evidence in repo:

- [storefront-model.json](/Volumes/Work/Casino/apps/directus/schema/storefront-model.json)
- [export-route-payloads.ts](/Volumes/Work/Casino/apps/directus/scripts/export-route-payloads.ts)
- [push-route-payloads.ts](/Volumes/Work/Casino/apps/directus/scripts/push-route-payloads.ts)
- [DIRECTUS_OPERATOR_CHECKLIST.md](/Volumes/Work/Casino/deploy/DIRECTUS_OPERATOR_CHECKLIST.md)

## 8. Release And Rollback

Requirements:

- every release must have a generated bundle and checksum
- deploy instructions must exist for `Vercel`, `Render`, and `Cloudflare`
- rollout must be smoke-tested on `/`, `/catalog`, `/live`, `/events/health`, and `/cms/server/health`

Targets:

- rollback decision window after cutover: `<= 15 minutes`
- smoke validation after deploy: `<= 10 minutes`

Evidence in repo:

- [PRODUCTION_CHECKLIST.md](/Volumes/Work/Casino/deploy/PRODUCTION_CHECKLIST.md)
- [LAUNCH_DAY_RUNBOOK.md](/Volumes/Work/Casino/deploy/LAUNCH_DAY_RUNBOOK.md)
- [release/README.md](/Volumes/Work/Casino/release/README.md)
- [CHECKSUMS.sha256](/Volumes/Work/Casino/release/CHECKSUMS.sha256)

## 9. Content Integrity

Requirements:

- game cards must never render broken image placeholders in production
- all shelf assets must be valid image files, not HTML or fallback documents
- control screenshots in Google Chrome must be captured after major storefront changes

Targets:

- broken asset rate on visible shelves: `0`
- visual regression checks on key routes after major UI change: `100%`

Operational rule:

- if an asset is invalid, replace or remove it from payload before release

## 10. Accessibility

Requirements:

- interactive controls must remain keyboard reachable
- hero, promo, and action cards must keep meaningful accessible names
- decorative media must not become the only text carrier

Targets:

- no critical accessibility blocker on primary routes in pre-release review

## 11. Scalability

Requirements:

- storefront must serve high read traffic independently from Directus write load
- promo-heavy home page must remain cache-friendly through Cloudflare and Vercel
- analytics and events pipeline must degrade independently from storefront rendering

Rules:

- `Directus` is the source of truth for content
- `Cloudflare` and app-side caching are allowed for delivery
- `events` service failure must not block route rendering

## 12. Ownership

Ownership split:

- storefront reliability and performance: web/platform engineering
- content integrity and publish workflow: content ops + Directus admin owners
- analytics schema and event correctness: product analytics owner
- journeys and lifecycle execution: CRM/marketing owner
- release health and incident response: platform owner

## 13. Acceptance

This NFR is considered met for launch when:

- CI budgets pass
- smoke checks pass
- release bundle and checksum exist
- `Sentry`, `PostHog`, and `Braze` keys are configured in production
- `Directus` route payloads are loaded
- Chrome control screenshots are current for key routes

Related documents:

- [STACK_FULFILLMENT_MATRIX.md](/Volumes/Work/Casino/deploy/STACK_FULFILLMENT_MATRIX.md)
- [PRODUCTION_CHECKLIST.md](/Volumes/Work/Casino/deploy/PRODUCTION_CHECKLIST.md)
- [ENV_REFERENCE.md](/Volumes/Work/Casino/deploy/ENV_REFERENCE.md)
- [SECRETS_CHECKLIST.md](/Volumes/Work/Casino/deploy/SECRETS_CHECKLIST.md)
