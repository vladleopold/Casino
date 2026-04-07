FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY release/slotcity-render-backend/package.json package.json
COPY release/slotcity-render-backend/pnpm-lock.yaml pnpm-lock.yaml
COPY release/slotcity-render-backend/pnpm-workspace.yaml pnpm-workspace.yaml
COPY release/slotcity-render-backend/tsconfig.base.json tsconfig.base.json
COPY release/slotcity-render-backend/turbo.json turbo.json
COPY release/slotcity-render-backend/apps/events apps/events
COPY release/slotcity-render-backend/packages/analytics-schema packages/analytics-schema

RUN pnpm install --frozen-lockfile
RUN pnpm --filter events build

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["sh", "-lc", "corepack pnpm --filter events start"]
