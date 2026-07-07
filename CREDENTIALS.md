# Credentials & Environment Setup

Hand this file to any teammate joining the project. It documents every env variable, where to get the value, and how the Dockerfiles use them.

---

## Quick Start

```bash
# 1. Copy the example env file
cp .env.production.example .env

# 2. Fill in every value (see table below)
# 3. Start the stack
docker-compose up -d --build
```

---

## Environment Variables

### Application

| Variable | Where to get it | Notes |
|---|---|---|
| `NODE_ENV` | Set it yourself | `production` or `development` |
| `DOMAIN` | Your domain | e.g. `kiosquetn.tn` or `localhost` |
| `FRONTEND_URL` | Your domain with protocol | e.g. `https://kiosquetn.tn` |

### Database (PostgreSQL)

| Variable | Where to get it | Notes |
|---|---|---|
| `POSTGRES_USER` | Choose a username | Default: `kiosquetn` |
| `POSTGRES_PASSWORD` | **Generate a strong one** | `openssl rand -base64 32` |
| `POSTGRES_DB` | Choose a DB name | Default: `kiosquetn` |
| `DATABASE_URL` | Construct from the 3 values above | Format: `postgresql://USER:PASS@db:5432/DB?schema=public` |

> **Docker**: The `db` service uses `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` directly. The `backend` and `frontend` services connect via `DATABASE_URL`. All are loaded from the `.env` file via `env_file: .env` in `docker-compose.yml`.

### Authentication

| Variable | Where to get it | Notes |
|---|---|---|
| `JWT_SECRET` | `openssl rand -base64 64` | Used by NestJS backend to sign JWTs |
| `NEXTAUTH_SECRET` | `openssl rand -base64 64` | Used by NextAuth on the frontend |
| `NEXTAUTH_URL` | Your frontend URL | e.g. `https://kiosquetn.tn` |

### Cloudinary (Image Uploads)

Required for product/admin image uploads.

| Variable | Where to get it |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → Account Details |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → Account Details |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → Account Details |

Register at https://cloudinary.com (free tier works).

### Resend (Transactional Emails)

Required for password reset, order confirmation, etc.

| Variable | Where to get it |
|---|---|
| `RESEND_API_KEY` | Resend Dashboard → API Keys |

Register at https://resend.com (free tier: 100 emails/day).

### Redis

| Variable | Where to get it | Notes |
|---|---|---|
| `REDIS_HOST` | Docker service name | `redis` (defined in docker-compose) |
| `REDIS_PORT` | Default Redis port | `6379` |

### Upstash (Optional — Rate Limiting)

Only needed if you use Upstash for serverless Redis rate limiting on Next.js API routes.

| Variable | Where to get it |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Console → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Console → REST API |

### Backups (Oracle Object Storage)

Used by `scripts/backup.sh` for automated DB dumps.

| Variable | Where to get it |
|---|---|
| `BACKUP_S3_ENDPOINT` | Oracle Cloud → Object Storage → Bucket Details |
| `BACKUP_S3_BUCKET` | Oracle Cloud → Object Storage → Bucket name |
| `AWS_ACCESS_KEY_ID` | Oracle Cloud → Customer Secret Keys |
| `AWS_SECRET_ACCESS_KEY` | Oracle Cloud → Customer Secret Keys |

---

## Docker Setup Reference

### docker-compose.yml

The compose file at the repo root references `.env` via `env_file: .env` on every service that needs secrets:
- `backend` service: loads all env vars from `.env`
- `frontend` service: loads all env vars from `.env`
- `db` service: loads `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `migrate` service: loads `DATABASE_URL`

Build args passed to frontend:
```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=${NEXTAUTH_URL}
```

### Backend Dockerfile (`backend/Dockerfile`)

Multi-stage build (builder → production):
- Stage 1: Installs deps, runs `prisma generate`, builds NestJS
- Stage 2: Copies `dist/`, `node_modules/`, `prisma/` — runs `npm run start:prod`
- Expects env vars at runtime (injected by docker-compose from `.env`)
- Exposes port `4000`

### Frontend Dockerfile (`frontend/Dockerfile`)

Multi-stage build (deps → builder → runner):
- Stage 1 (deps): Installs npm dependencies
- Stage 2 (builder): Copies `frontend/` + `backend/prisma/`, runs `prisma generate`, builds Next.js
- Stage 3 (runner): Runs as `nextjs` user, serves standalone build via `node server.js`
- Expects `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` as build args
- Exposes port `3000`

> **Note**: `backend/prisma/` is copied into the frontend build context so Prisma Client can be generated for shared types. Make sure `@prisma/client` versions match between frontend and backend.

---

## Local Development

For local dev without Docker, create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=BestLub Tunisie
NEXT_PUBLIC_CURRENCY=DT
NEXT_PUBLIC_TVA_RATE=0.19
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=100
DATABASE_URL=postgresql://kiosquetn:kiosquetn_local_secret@localhost:5433/kiosquetn?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super_secret_nextauth_for_local_development_only
AUTH_SECRET=super_secret_nextauth_for_local_development_only
AUTH_TRUST_HOST=true
```

Start backend + database + redis via Docker, then run frontend standalone:

```bash
cd frontend && npm run dev
```

---

## Security Rules

- **Never commit `.env` or `.env.local`** to git (already in `.gitignore`)
- Rotate secrets if they are ever exposed
- Use different secrets for development vs production
- Keep this file out of the repository or restrict access to it

---

## Services & Ports

| Service | Port (host) | Port (container) | Notes |
|---|---|---|---|
| NGINX | 8082 | 8082 | Reverse proxy for all traffic |
| Frontend (Next.js) | — | 3000 | Accessed through NGINX |
| Backend (NestJS) | — | 4000 | Accessed through NGINX |
| PostgreSQL | 5433 | 5432 | Mapped to host for direct access |
| Redis | 6380 | 6379 | Mapped to host for direct access |
