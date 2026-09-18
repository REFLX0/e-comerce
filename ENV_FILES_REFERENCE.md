# 🔐 Environment Variables Reference (`.env`)

This document aggregates every `.env` file structure in the project, explains all variables, and provides templates for local development and production.

---

## 📁 1. Root Local `.env` (`/.env`)

Used by Docker Compose for local development:

```env
# ── Application ───────────────────────────────────────────────────
NODE_ENV=production
DOMAIN=localhost
FRONTEND_URL=http://localhost:3000

# ── Database ──────────────────────────────────────────────────────
POSTGRES_USER=kiosquetn
POSTGRES_PASSWORD=kiosquetn_local_secret
POSTGRES_DB=kiosquetn
DATABASE_URL=postgresql://kiosquetn:kiosquetn_local_secret@db:5432/kiosquetn?schema=public

# ── Authentication ────────────────────────────────────────────────
JWT_SECRET=super_secret_jwt_for_local_development_only
NEXTAUTH_URL=http://localhost:8082
NEXTAUTH_SECRET=super_secret_nextauth_for_local_development_only

# ── Google OAuth (optional) ───────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ── Cloudinary (image uploads) ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ── Resend (transactional email) ──────────────────────────────────
RESEND_API_KEY=local
RESEND_FROM="Specpart <noreply@specpart.tn>"
ADMIN_NOTIFICATION_EMAIL="specpart@hotmail.com"

# ── Redis ─────────────────────────────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379

# ── Backups (Oracle / S3 Object Storage) ──────────────────────────
BACKUP_S3_ENDPOINT=
BACKUP_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# ── WhatsApp Integration ──────────────────────────────────────────
NEXT_PUBLIC_WHATSAPP_NUMBER=+21655000000

# ── AI Chatbot (OpenRouter) ───────────────────────────────────────
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini

# ── MinIO ─────────────────────────────────────────────────────────
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password
```

---

## 📁 2. Backend Standalone `.env` (`/backend/.env`)

Used when running the NestJS backend directly with `npm run start:dev`:

```env
DATABASE_URL="postgresql://kiosquetn:kiosquetn_local_secret@localhost:5433/kiosquetn?schema=public"
JWT_SECRET="test_secret_key_for_testing"
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="openai/gpt-4o-mini"
RESEND_API_KEY="local"
RESEND_FROM="Specpart <noreply@specpart.tn>"
ADMIN_NOTIFICATION_EMAIL="specpart@hotmail.com"
FRONTEND_URL="http://localhost:8082"
```

---

## 📁 3. Frontend Next.js `.env.local` (`/frontend/.env.local`)

Used by Next.js for client and server rendering:

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Specpart Tunisie"
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=100
NEXT_PUBLIC_TVA_RATE=0.19
NEXT_PUBLIC_CURRENCY="TND"
DATABASE_URL=postgresql://kiosquetn:kiosquetn_local_secret@localhost:5433/kiosquetn?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super_secret_nextauth_for_local_development_only
AUTH_SECRET=super_secret_nextauth_for_local_development_only
AUTH_TRUST_HOST=true
```

---

## 📁 4. Root Production `.env`

**Single source of truth: [`.env.production.example`](.env.production.example).**

This section used to inline a second copy of the production template, which had
drifted from the real one (stale domain, `RESEND_*` instead of `BREVO_*`, and
none of the `MINIO_ROOT_*` variables `docker-compose.yml` requires). Copy the
example file instead, or let the generator fill the secrets in for you:

```bash
# Fills POSTGRES_PASSWORD / JWT_SECRET / NEXTAUTH_SECRET / MINIO_ROOT_* and
# writes .env with mode 0600. Pass --domain to set every URL at once.
node scripts/generate-secrets.js --domain yourdomain.com
```

> `docker compose` reads `.env` at the repo root — not `.env.production`.

### Changing domain

`DOMAIN`, `FRONTEND_URL`, `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` all move
together. Two things are easy to miss:

1. **`NEXT_PUBLIC_*` are inlined at build time.** Restarting the frontend is not
   enough — the image must be rebuilt (`docker compose build frontend`) or
   canonical URLs, the sitemap, `robots.txt` and the legal pages keep pointing at
   the old domain. The deploy workflow rebuilds, so updating `.env` before
   deploying is sufficient.
2. **Issue the TLS certificate for the new host first.** `DOMAIN` drives both
   nginx's `server_name` and the `/etc/letsencrypt/live/<DOMAIN>/` certificate
   path, so nginx will refuse to start if the certificate is not there yet.

## 📋 5. Summary Table of Environment Variables

| Variable | Category | Required | Description |
|---|---|---|---|
| `NODE_ENV` | App | Yes | `production` or `development` |
| `DOMAIN` | App | **Yes** | Primary domain. Drives nginx `server_name` **and** the Let's Encrypt certificate path. |
| `FRONTEND_URL` | App | Yes | Base frontend URL |
| `DATABASE_URL` | Database | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Auth | **Yes** | Secret key for signing backend JWTs (**min 16 chars** — validated by Joi at startup) |
| `NEXTAUTH_SECRET` | Auth | Yes | NextAuth session encryption secret |
| `NEXTAUTH_URL` | Auth | Yes | Canonical URL for NextAuth callbacks |
| `OPENROUTER_API_KEY` | AI Chatbot | Yes | OpenRouter API Key for the GPT-4o chatbot |
| `OPENROUTER_MODEL` | AI Chatbot | No | Model override (default: `openai/gpt-4o-mini`) |
| `RESEND_API_KEY` | Mail | Yes (Prod) | API key for transactional emails & OTP |
| `RESEND_FROM` | Mail | Yes | Verified sender address (e.g. `Specpart <noreply@specpart.tn>`) |
| `ADMIN_NOTIFICATION_EMAIL`| Mail | Yes | Destination inbox for new order alerts (`specpart@hotmail.com`) |
| `CLOUDINARY_CLOUD_NAME` | Media | Optional | Cloudinary storage bucket name |
| `CLOUDINARY_API_KEY` | Media | Optional | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Media | Optional | Cloudinary Secret |
| `MINIO_ROOT_USER` | Media | **Yes** | MinIO root user. `docker-compose.yml` fails to start without it. |
| `MINIO_ROOT_PASSWORD` | Media | **Yes** | MinIO root password. `docker-compose.yml` fails to start without it. |
| `MINIO_ENDPOINT` | Media | Optional | Full MinIO S3-compatible endpoint URL (e.g. `http://minio:9000`). If set, uploads go to MinIO instead of Cloudinary. |
| `MINIO_BUCKET` | Media | Optional | MinIO bucket name (default: `specpart`) |
| `MINIO_ACCESS_KEY` | Media | Optional | MinIO access key ID (default: `admin`) |
| `MINIO_SECRET_KEY` | Media | Optional | MinIO secret key |
| `MINIO_REGION` | Media | Optional | MinIO region (default: `us-east-1`) |
| `REDIS_HOST` / `REDIS_PORT` | Cache | Yes | Redis cache host (`redis`) and port (`6379`) |
| `KAFKA_BROKERS` | Messaging | Yes | Kafka broker address (`kafka:9092`) |
| `OPENSEARCH_HOST` | Search | Optional | OpenSearch endpoint URL (e.g. `http://opensearch:9200`). Required for full-text product search. |
| `SENTRY_DSN` | Observability | Optional | Sentry DSN for error tracking |

> **Note on upload priority:** The backend tries `MinIO → Cloudinary → local disk` in that order. If neither `MINIO_ENDPOINT` nor `CLOUDINARY_*` are set, images are saved to `backend/uploads/products/` on the server — this is fine for development but should not be used in production.
