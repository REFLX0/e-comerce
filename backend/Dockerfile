FROM node:22-slim AS builder

WORKDIR /app

# Install build tools
RUN apt-get update && apt-get install -y make gcc g++ python3 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate prisma client
RUN npm ci
RUN npx prisma generate

COPY . .

# Build the application
RUN npm run build

FROM node:22-slim AS production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
