# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./

FROM base AS prod-deps
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod

FROM base AS dev-deps
ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile

FROM base AS production
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3006
USER node
CMD ["pnpm", "start"]

FROM dev-deps AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3006
CMD ["pnpm", "run", "dev"]
