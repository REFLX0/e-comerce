# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build tools needed for native modules (bcrypt, etc.)
RUN apk add --no-cache make gcc g++ python3

# Copy manifests & Prisma schema first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all deps (including devDependencies for the build)
RUN npm ci

# Generate Prisma client against the schema
RUN npx prisma generate

# Copy the rest of the source and build
COPY . .
RUN npm run build

# ── Stage 2: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# wget is used by the docker-compose healthcheck
RUN apk add --no-cache wget

# Copy only what the production runtime needs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
