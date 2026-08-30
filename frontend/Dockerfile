# ── Stage 1: Dependency install ───────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy from root context (build context is the repo root)
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .
COPY backend/prisma ./prisma

ENV NEXT_TELEMETRY_DISABLED=1

# Build-time public env vars (injected from docker-compose build args)
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Generate Prisma client (frontend uses it for server-side DB access)
RUN npx prisma generate

RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# wget for healthcheck + non-root user for security
RUN apk add --no-cache wget \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Public folder & messages
COPY --from=builder /app/public ./public
COPY --from=builder /app/messages ./messages

# Pre-create .next and set ownership
RUN mkdir .next && chown nextjs:nodejs .next

# Standalone output — contains its own minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
