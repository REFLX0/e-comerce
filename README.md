# specpart — Tunisian E-commerce Platform

> **Production-grade** full-stack e-commerce platform built for the Tunisian market, featuring a Next.js 16 storefront, NestJS REST API, and enterprise DevOps infrastructure.

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

- JWT stored in **HttpOnly cookies** (XSS-proof)
- NGINX **rate limiting** on all API routes (10r/s general, 5r/min auth)
- Helmet.js security headers on NestJS
- Input validation via `class-validator` DTOs
- Prisma parameterised queries (SQL injection proof)
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

### Dead Code

| File | Issue |
|---|---|
| `backend/src/app.controller.ts` | Not imported in any NestJS module — completely inactive |
| `backend/src/app.service.ts` | Only referenced by dead AppController — completely inactive |
| `backend/prisma/import-vehicle-compat.ts` | Standalone one-shot import script (legacy) |
| `backend/prisma/import-lubricant-data.ts` | Standalone one-shot import script; TS errors break frontend build because prisma/ is copied into the frontend Docker image |
| `backend/prisma/seed-test-db.ts` | Standalone test seed script (not the official seed) |
| `backend/src/products/dto/oil-recommendations.dto.spec.ts` | Test file for a removed feature |
| `backend/src/app.controller.spec.ts` | Test for dead controller |
| `backend/src/specificity.spec.ts` | Unclear purpose |
| `frontend/tests/example.spec.ts` | Default Playwright example — not a real test |
| `scripts/fix-frontend.sh` | One-shot fix script |
| `scripts/fix-frontend2.sh` | One-shot fix script |
| `scripts/fix-commandes.sh` | One-shot fix script |
| `scripts/fix-api.sh` | One-shot fix script |
| `scripts/fix-types.js` | One-shot fix script |
| `scripts/fix-tokens.js` | One-shot fix script |
| `scripts/deploy-setup.sh` | One-shot script |
| `scripts/deploy-setup-vm.sh` | One-shot script |
| `scripts/deploy-frontend.sh` | One-shot script |
| `scripts/download-logos.js` | One-shot utility |
| `scripts/generate-logos.js` | One-shot utility |

### Console.log Leaks in Production Code

| File | Line | Code | Severity |
|---|---|---|---|
| `backend/src/auth/auth.service.ts` | 132 | `console.log([DEV] Password reset link for ${email}: ${resetUrl})` | **High** — leaks reset tokens in production logs |
| `backend/src/auth/auth.service.ts` | 135 | `console.log(Email send failed for ${email}: ...)` | Medium — should use proper logger |
| `backend/src/main.ts` | 50 | `console.log(Backend running on ...)` | Low — acceptable startup log |
| `backend/src/app.controller.ts` | 15 | `console.log(Received contact message: ...)` | Low — dead code anyway |

### Broken Navigation Links

These routes are linked in the UI but have no matching page file:

| File | Broken Path |
|---|---|
| `frontend/components/layout/Footer.tsx:94` | `/compte/favoris` (only `/compte/wishlist` exists) |
| `frontend/app/[locale]/(store)/compte/layout.tsx:18` | `/compte/avis` |
| `frontend/app/[locale]/(store)/compte/layout.tsx:21` | `/compte/notifications` |
| `frontend/app/[locale]/admin/layout.tsx:64` | `/admin/payments` |
| `frontend/app/[locale]/admin/layout.tsx:69` | `/admin/reviews` |

Clicking any of these links navigates to a 404 page.

### Unused Dependencies

| Package | Location | Notes |
|---|---|---|
| `bullmq` | `backend/package.json` | Never imported anywhere — background jobs were planned but not implemented |
| `isomorphic-dompurify` | `frontend/package.json` | Never imported — was likely intended for review HTML sanitization |
| `next-sitemap` | `frontend/package.json` | Not imported; no config file; no npm script usage. A manual `app/sitemap.ts` exists instead |
| `dotenv` | `frontend/package.json` | Only appears in commented-out lines in `playwright.config.ts` |

### Unused Stores

| Store | Notes |
|---|---|
| `frontend/lib/store/vehicle.store.ts` | Zustand persist store for selected vehicle — created but never consumed by any component |
| `frontend/lib/store/settings.store.ts` | Created but may not be consumed |

### Missing Error Boundaries

No React error boundaries (`ErrorBoundary` component) are used anywhere in the frontend. A runtime crash in any component will either:
- Blank the whole page (client components)
- Show Next.js default error overlay (dev) or generic error screen (prod)

### Hardcoded Values

- `backend/src/main.ts` — CORS origin `http://localhost:3000` is hardcoded (should read from env)
- `frontend/lib/api/*.ts` — Base URLs may be hardcoded in multiple API client files
- Admin layout `admin/layout.tsx` — Locale detection splits `pathname` manually instead of using next-intl

### Accessibility Gaps

- No `aria-label` or `role` attributes on icon-only admin sidebar links (when collapsed)
- No focus trap in mobile drawer overlays
- Search input in admin has no associated `label` element
- Color contrast may be insufficient in several places (gray-400 text on dark backgrounds)

### No Unit Tests

- 5 test files exist but are either dead (backend) or example boilerplate (frontend Playwright)
- No meaningful unit tests for API controllers, services, or frontend components
- No integration or E2E tests for critical flows (auth, checkout, oil finder)

### Stale Prisma Client

The `@prisma/client` in the frontend is from an earlier schema generation and does not match the current backend schema. When the `prisma/` directory is copied into the frontend Docker image, Next.js type-checks it and may fail on enum/type mismatches unless workarounds are applied.

### Missing Environment Validation

- No runtime validation that all required env vars are present at startup
- Missing env vars cause cryptic runtime errors instead of clear startup messages
- No `.env.example` for every required variable with documentation

### TODO / FIXME Comments

None found anywhere in the codebase — the codebase is clean of these annotations.

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
