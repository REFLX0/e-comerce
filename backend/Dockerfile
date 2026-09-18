# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build tools needed for native modules (bcrypt, etc.)
RUN apk add --no-cache make gcc g++ python3

# Prevent Puppeteer from attempting to download Chromium during docker build
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy manifests & Prisma schema first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# `npm ci` (not `npm install`) so the build is reproducible from the lockfile
# instead of silently drifting to newer semver-compatible releases.
RUN npm ci

# Generate Prisma client against the schema
RUN npx prisma generate

# Copy the rest of the source and build
COPY . .
RUN npm run build

# ── Stage 2: Production dependencies ──────────────────────────────────────────
# Installed separately so the runtime image never carries the dev toolchain
# (puppeteer, jest, typescript, eslint, xlsx...), which was several hundred MB
# of extra image and attack surface. `prisma` stays because `prisma migrate
# deploy` is run inside this container on every deploy.
FROM node:20-alpine AS prod-deps

WORKDIR /app

RUN apk add --no-cache make gcc g++ python3
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# wget is used by the docker-compose healthcheck.
# fontconfig + a real sans-serif font are needed for sharp's bundled librsvg to
# render SVG <text> (product-photo watermarking): Alpine ships neither by
# default, so every watermark call silently rendered blank or as "tofu box"
# missing-glyph placeholders instead of readable text.
#
# dumb-init is PID 1 so SIGTERM reaches node directly. Previously `npm run
# start:prod` was PID 1 and swallowed the signal, so every container was
# SIGKILLed after the stop grace period with requests still in flight.
RUN apk add --no-cache wget fontconfig ttf-dejavu dumb-init \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nodejs

# Copy only what the production runtime needs
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder   --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder   --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder   --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder   --chown=nodejs:nodejs /app/uploads ./uploads
COPY --from=builder   --chown=nodejs:nodejs /app/scripts ./scripts

ENV NODE_ENV=production
ENV PORT=4000

# Unprivileged. NOTE: /app/uploads is a bind mount in docker-compose, so the
# host directory must be owned by uid 1001 for local-disk uploads to work -
# the deploy workflow chowns it before bringing the stack up.
USER nodejs

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"]
