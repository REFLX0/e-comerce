# KiosqueTN — Tunisian E-commerce Platform

> **Production-grade** full-stack e-commerce platform built for the Tunisian market, featuring a Next.js 16 storefront, NestJS REST API, and enterprise DevOps infrastructure.

[![Deploy to Oracle VM](https://github.com/REFLX0/e-comerce/actions/workflows/deploy.yml/badge.svg)](https://github.com/REFLX0/e-comerce/actions/workflows/deploy.yml)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Oracle Cloud VM                  │
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

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, TypeScript, TailwindCSS, TanStack Query |
| **Backend** | NestJS, Prisma ORM, PostgreSQL 16, Redis 7 |
| **Auth** | JWT (HttpOnly cookies), Bcrypt |
| **Infrastructure** | Docker Compose, NGINX, Oracle Cloud VM |
| **CI/CD** | GitHub Actions — auto-deploy on push to `main` |
| **Observability** | Structured JSON logging, `/api/health` endpoint |

---

## ⚙️ Local Development

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
docker exec kiosquetn-backend npx prisma db seed
```

---

## 🔑 Required Environment Variables

See [`.env.production.example`](.env.production.example) for the full reference.

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | NextAuth session secret |
| `CLOUDINARY_*` | ✅ | Image upload credentials |
| `RESEND_API_KEY` | ✅ | Transactional email |

---

## 🚢 Production Deployment (Oracle VM)

### GitHub Actions Secrets required

| Secret | Value |
|---|---|
| `ORACLE_SSH_KEY` | Content of your Oracle VM private key |
| `REPO_URL` | `git@github.com:REFLX0/e-comerce.git` |

### First-time setup on the Oracle VM

```bash
# SSH into your VM
ssh ubuntu@84.8.254.244

# Open port 8080
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
sudo firewall-cmd --reload

# Create deploy directory
sudo mkdir -p /opt/kiosquetn
sudo chown ubuntu:ubuntu /opt/kiosquetn

# Clone the repo
cd /opt/kiosquetn
git clone https://github.com/REFLX0/e-comerce.git .

# Set up .env
cp .env.production.example .env
nano .env  # Fill in your secrets

# Launch
docker-compose up -d --build
```

After that, every `git push` to `main` auto-deploys via GitHub Actions.

---

## 📋 Available Scripts

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

## 🛡️ Security

- JWT stored in **HttpOnly cookies** (XSS-proof)
- NGINX **rate limiting** on all API routes (10r/s general, 5r/min auth)
- Helmet.js security headers on NestJS
- Input validation via `class-validator` DTOs
- Prisma parameterised queries (SQL injection proof)
- Automated daily DB backups via `scripts/backup.sh`

---

## 📁 Project Structure

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
