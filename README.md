# specpart — Tunisian E-commerce Platform

> **Production-ready** full-stack e-commerce platform built for the Tunisian market, featuring a Next.js 16 storefront, NestJS REST API, and enterprise DevOps infrastructure.

[![Deploy to Oracle VM](https://github.com/REFLX0/e-comerce/actions/workflows/deploy.yml/badge.svg)](https://github.com/REFLX0/e-comerce/actions/workflows/deploy.yml)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    AWS EC2 Instance                 │
│                                                     │
│  ┌─────────────┐   ┌──────────────────────────┐    │
│  │   NGINX     │   │  Docker Compose Stack    │    │
│  │  :8080      │──▶│                          │    │
│  │  Rate Limit │   │  frontend  :3000 (Next)  │    │
│  │  Caching    │   │  backend   :4000 (Nest)  │    │
│  │  Proxy      │   │  postgres  :5433         │    │
│  └─────────────┘   │  redis     :6380         │    │
│                    └──────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, TypeScript, TailwindCSS, TanStack Query |
| **Backend** | NestJS, Prisma ORM, PostgreSQL 16, Redis 7 |
| **Auth** | JWT (HttpOnly cookies), Bcrypt |
| **Infrastructure** | Docker Compose, NGINX, AWS EC2 |
| **CI/CD** | GitHub Actions — auto-deploy on push to `main` |
| **Observability** | Structured JSON logging, `/api/health` endpoint |

---

## Local Development

### Prerequisites
- Docker Desktop
- Node.js 20+

### 1. Clone & configure
```bash
git clone https://github.com/REFLX0/e-comerce.git
cd e-comerce
cp .env.production.example .env
# Fill in .env with your values
```

### 2. Start the stack
```bash
docker-compose up -d --build
```

The app will be available at **http://localhost:8080**

### 3. Seed the database (first time, optional)
Migrations run automatically on startup via the `migrate` service.
```bash
docker exec specpart-backend npx prisma db seed
```

---

## Required Environment Variables

See [`.env.production.example`](.env.production.example) for the full reference.

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | NextAuth session secret |
| `CLOUDINARY_*` | ✅ | Image upload credentials |
| `RESEND_API_KEY` | ✅ | Transactional email |

---

## Production Deployment (AWS EC2)

### GitHub Actions Secrets required

| Secret | Value |
|---|---|
| `SERVER_SSH_KEY` | Content of your AWS EC2 private key |
| `REPO_URL` | `git@github.com:REFLX0/e-comerce.git` |

### First-time setup on the AWS EC2

```bash
# SSH into your VM
ssh ubuntu@84.8.254.244

# Open port 8080
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
sudo firewall-cmd --reload

# Create deploy directory
sudo mkdir -p /opt/specpart
sudo chown ubuntu:ubuntu /opt/specpart

# Clone the repo
cd /opt/specpart
git clone https://github.com/REFLX0/e-comerce.git .

# Set up .env
cp .env.production.example .env
nano .env  # Fill in your secrets

# Launch
docker-compose up -d --build
```

After that, every `git push` to `main` auto-deploys via GitHub Actions.

---

## Available Scripts

```bash
# Local dev (without Docker)
cd frontend && npm run dev
cd backend  && npm run start:dev

# Run E2E tests
cd frontend && npx playwright test

# Database operations
cd backend && npx prisma studio
cd backend && npx prisma migrate dev

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Security

- JWT stored in **HttpOnly cookies** (XSS-proof); no fallback secret in any code path
- **NestJS application-layer rate limiting** (`ThrottlerGuard` as `APP_GUARD`) with per-route limits:
  - Login: 5/min · Register: 10/min · Forgot-password: 3/min · Reset-password: 5/min
  - Checkout: 10/min · Coupon validate: 20/min · Review submit: 5/min · Ticket create: 5/min
- NGINX **rate limiting** on all API routes (10r/s general, 5r/min auth) — defence-in-depth
- Helmet.js security headers on NestJS
- Input validation via `class-validator` DTOs (whitelist + forbidNonWhitelisted)
- Prisma parameterised queries (SQL injection proof)
- Multer file upload validation — MIME type filter rejects non-image files (JPEG/PNG/WebP/GIF/AVIF)
- Environment validated at startup via Joi schema; missing `JWT_SECRET` throws immediately
- Structured NestJS logging everywhere — no raw `console.error/log` in production paths
- Automated daily DB backups via `scripts/backup.sh`

---

## Project Structure

```
e-comerce/
├── frontend/          # Next.js 16 storefront + admin dashboard
├── backend/           # NestJS REST API
├── nginx/
│   ├── nginx.conf     # Dev config (port 8080, no SSL)
│   └── nginx.prod.conf# Production config (port 8080, hardened)
├── scripts/
│   └── backup.sh      # Automated PostgreSQL backup
├── .github/workflows/
│   └── deploy.yml     # CI/CD pipeline
└── docker-compose.yml # Full stack orchestration
```

---

## Audit & Known Issues

### Resolved in last hardening pass

| Item | Status |
|---|---|
| `ThrottlerGuard` not registered — `@Throttle()` decorators had no effect | ✅ Fixed |
| JWT strategy used `'fallback-dev-secret'` as default | ✅ Fixed |
| `console.error/log` in production code paths | ✅ Fixed — replaced with `NestJS Logger` |
| No unit tests for `auth`, `orders`, `coupons`, `invoices` | ✅ Fixed — 40 unit tests added |
| No throttle regression test | ✅ Fixed — e2e test asserts 429 on 6th login attempt |
| Multer accepted all file types (no MIME filter) | ✅ Fixed |
| 29 stray dev/scrape files in `backend/` root | ✅ Deleted |
| `.gitignore` had corrupted UTF-16 section | ✅ Fixed |

### Still Open

#### Dead Code

| File | Issue |
|---|---|
| `backend/src/app.controller.ts` | Not imported in any module — inactive |
| `backend/src/app.service.ts` | Only referenced by dead AppController |
| `backend/prisma/import-vehicle-compat.ts` | Legacy one-shot import script |
| `backend/src/products/dto/oil-recommendations.dto.spec.ts` | Test for removed feature |

#### Broken Navigation Links

| File | Broken Path |
|---|---|
| `frontend/components/layout/Footer.tsx:94` | `/compte/favoris` (only `/compte/wishlist` exists) |
| `frontend/app/[locale]/(store)/compte/layout.tsx:18` | `/compte/avis` |
| `frontend/app/[locale]/(store)/compte/layout.tsx:21` | `/compte/notifications` |
| `frontend/app/[locale]/admin/layout.tsx:64` | `/admin/payments` |
| `frontend/app/[locale]/admin/layout.tsx:69` | `/admin/reviews` |

#### Unused Dependencies

| Package | Notes |
|---|---|
| `bullmq` | Never imported — background jobs planned but not implemented |
| `isomorphic-dompurify` | Never imported in frontend |

#### Frontend Gaps

- No React error boundaries anywhere — a crash will blank the whole page
- No `aria-label` on icon-only admin sidebar links
- No focus trap in mobile drawer overlays

---

## Devis (Proposal) vs Current Site

The devis describes a basic MVP e-commerce site for oils and lubricants. The current repository is significantly more advanced.

### What the devis covers
- E-commerce storefront
- Product catalog
- Product pages
- Cart and checkout
- Simple admin area
- SEO basics
- Training and short support period
- Cash on delivery

### What the site already has beyond the devis
- Vehicle-based oil finder for compatible products
- Customer account area with orders, wishlist, profile, addresses, security, and support tickets
- Admin dashboard with orders, catalog management, promotions, shipping, analytics, and settings
- Review and review moderation system
- Coupon and promotion management
- Docker and GitHub Actions deployment pipeline
- Product catalogue with filters, sorting, pagination, and search

### What is in the devis but not fully visible in the site
- The exact commercial packaging of the offer
- The timeline and milestone payment structure
- The guarantee of support and training as a business agreement
- The final legal and commercial document wording

### Main conclusion

The devis is valid as a basic launch proposal, but it underestimates the real scope of the website. If the proposal should match the site, it needs to mention the oil finder, customer account area, wishlist, coupons, reviews, support, shipping tools, analytics, and deployment setup.

---

## Recent Changes (UI & Bug Fixes)

- **Logo Fixes:** Hardcoded the logo path to `/logo.jpg` using a plain `<img>` tag in both `Header.tsx` and `Footer.tsx` to prevent hydration flicker and Next.js image caching issues. Modified `useSiteLogo.ts` to return the static path, bypassing the failing admin API endpoint.
- **Brands Bar:** Replaced the dynamic API-based brand fetching with a static list of 9 known brands (`Yacco`, `Shell`, `TotalEnergies`, `Castrol`, `Liqui Moly`, `Motul`, `Bosch`, `Purflux`, `Wynn's`) that have verified local SVG logos (`/img/b/*.svg`). This prevents empty brand cards from rendering.
- **Header Cleanups:** Removed unused variables and duplicate imports in `Header.tsx`.
- A full diff of all recent modifications is available in `changes.diff`.
