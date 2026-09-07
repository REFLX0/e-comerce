# 🚗 SpecPart TecDoc Vehicle Harvest & Oil Specification Enrichment Guide

This document is the **single source of truth** for extracting all vehicles from the PostgreSQL `tecdoc` database schema on the production VM, enriching them with genuine engine oil specifications (OEM approvals, viscosities, ACEA/API standards, capacities in liters, and oil change intervals), and ensuring the **SpecPart Oil Finder** functions with 100% catalog coverage without wasting tokens or guessing specs.

---

## ⚡ 1. Fast Track: Instructions for the VM AI (Zero-Token-Waste Prompt)

> **Copy and paste the prompt block below directly into your AI assistant on the VM.**  
> It instructs the AI to execute the pre-built, tested harvester script directly without exploratory file scanning or wasted tokens.

```text
You are working on the SpecPart production server.
Your goal is to populate and enrich ALL vehicles from the PostgreSQL `tecdoc` schema with authentic lubrication specifications (viscosities, OEM approvals, ACEA/API standards, capacities in liters, and change intervals) so the Oil Finder works for every car.

DO NOT waste tokens searching the repository, exploring file trees, or rewriting harvesting logic. Everything has already been pre-built, audited, and tested in `scripts/tecdoc-catalog-harvester.ts`.

Follow these 4 execution steps strictly:

Step 1: Pull latest changes and ensure stack is running
  git pull origin main
  docker compose up -d --build

Step 2: Deploy database schema updates
  docker compose exec -T backend npx prisma migrate deploy

Step 3: Run the Turnkey TecDoc Harvester & Spec Enrichment
  docker compose exec -T backend npx tsx scripts/tecdoc-catalog-harvester.ts

  This script will:
  - Query tecdoc.manufacturers, tecdoc.models, tecdoc.passengercars, and tecdoc.engines.
  - Preserve the cleanly normalized Dacia & VAG catalogs (never overwriting audited entries).
  - Apply authentic OEM standards (Renault RN17/RN0720, VAG 504/507, PSA B71 2290/2312/2010, BMW LL-04, MB 229.51/229.52, Fiat 9.55535, Ford, Asian OEM C2/C3, Volvo, JLR) with strict DPF Low-SAPS safety (no A3/B4 on diesel >= 2011).
  - Update `clean-catalog-hierarchy.json` and sync Prisma tables (VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine, OilFinderOilSpec, OilFinderVehicle).

Step 4: Verify Oil Finder API Responses
  curl -s http://localhost:4000/api/oil-finder/models/peugeot/208/generations
  curl -s http://localhost:4000/api/oil-finder/models/renault/clio/generations
  curl -s http://localhost:4000/api/oil-finder/models/bmw/serie-3/generations
  curl -s "http://localhost:4000/api/oil-finder/vehicle?make=Peugeot&model=208"

Output the summary of makes, models, generations, and engines synced, and confirm the API test results.
```

---

## 🛠️ 2. Manual Execution (Step-by-Step Commands)

If running the commands directly in your terminal on the VM:

### Step 2.1 — Pull Latest Code from GitHub
```bash
cd ~/e-comerce   # Or your repo folder
git pull origin main
```

### Step 2.2 — Restore & Build Containers (Fixes 502 Bad Gateway)
```bash
docker compose up -d --build
```
*Note: This brings up `specpart-backend` and `specpart-nginx`. Ensure `docker compose ps` shows both running.*

### Step 2.3 — Run Prisma Schema Migrations
```bash
docker compose exec -T backend npx prisma migrate deploy
```

### Step 2.4 — Execute the Harvester & Spec Enricher
```bash
docker compose exec -T backend npx tsx scripts/tecdoc-catalog-harvester.ts
```

---

## 🔬 3. How the Harvester & Enrichment Works Under the Hood

The script [`scripts/tecdoc-catalog-harvester.ts`](file:///scripts/tecdoc-catalog-harvester.ts) handles:

1. **PostgreSQL TecDoc Extraction**:
   - Queries `tecdoc.manufacturers`, `tecdoc.models`, `tecdoc.passengercars`, and `tecdoc.engines` via `tecdoc.passengercars_link_engines`.
   - Normalizes commercial names (e.g. extracts `Golf` from `GOLF VII (5G1)` and names the generation `Golf VII (5G1)`).

2. **Dacia & VAG Preservation**:
   - The verified, hand-audited models for **Dacia, Volkswagen, Audi, Seat, Škoda, Cupra** are preserved 100% without modification or regression.

3. **Deterministic OEM & International Standards Mapping**:
   | Family | Engine / Era | Viscosity | OEM Approval | ACEA / API | Capacity Rule |
   |---|---|---|---|---|---|
   | **Renault / Dacia / Nissan** | Diesel $\ge 2018$ | `5W-30` | Renault RN17 | ACEA C3 / API SN | $3.5\text{L} - 5.5\text{L}$ |
   | **Renault / Dacia / Nissan** | Diesel $2010 - 2017$ | `5W-30` | Renault RN0720 | ACEA C4 / API SM | $4.0\text{L} - 4.8\text{L}$ |
   | **Renault / Dacia / Nissan** | Petrol $\ge 2018$ | `5W-30` | Renault RN17 | ACEA C3 / API SN | $3.2\text{L} - 4.2\text{L}$ |
   | **VAG (VW, Audi, Seat, Škoda)** | Diesel (all DPF) | `5W-30` | VW 504.00 / 507.00 | ACEA C3 / API SN | $3.8\text{L} - 5.0\text{L}$ (V6: $6.5\text{L}$) |
   | **VAG (VW, Audi, Seat, Škoda)** | 1.0/1.5 TSI $\ge 2019$ | `0W-20` | VW 508.00 / 509.00 | ACEA C5 / API SP | $3.6\text{L} - 4.3\text{L}$ |
   | **Stellantis (Peugeot, Citroën, DS, Opel)** | PureTech / BlueHDi $\ge 2018$ | `0W-20` | PSA B71 2010 | ACEA C5 / API SN+ | $3.2\text{L} - 4.0\text{L}$ |
   | **Stellantis (Peugeot, Citroën, DS, Opel)** | BlueHDi $2014 - 2017$ | `0W-30` | PSA B71 2312 | ACEA C2 / API SN | $3.8\text{L} - 4.2\text{L}$ |
   | **Stellantis (Peugeot, Citroën, DS, Opel)** | HDi / THP $2008 - 2013$ | `5W-30` | PSA B71 2290 | ACEA C2 / API SN | $3.8\text{L} - 4.5\text{L}$ |
   | **BMW & Mini** | Diesel (all DPF) | `5W-30` | BMW Longlife-04 (LL-04) | ACEA C3 / API SN | 4-cyl: $5.2\text{L}$, 6-cyl: $6.5\text{L}$ |
   | **BMW & Mini** | 3/4-cyl Petrol $\ge 2017$ | `0W-20` | BMW Longlife-17 FE+ | ACEA C5 / API SP | $4.2\text{L} - 5.2\text{L}$ |
   | **Mercedes-Benz & Smart** | Diesel (all DPF) / BlueTEC | `5W-30` | MB 229.51 / MB 229.52 | ACEA C3 / API SN | 4-cyl: $5.5\text{L}$, V6: $7.5\text{L}$ |
   | **Ford** | EcoBlue Diesel $\ge 2014$ | `0W-30` | Ford WSS-M2C950-A | ACEA C2 / API SN | $4.2\text{L} - 6.0\text{L}$ |
   | **Ford** | 1.0 EcoBoost | `5W-20` | Ford WSS-M2C948-B | ACEA C5 / API SN | $4.1\text{L}$ |
   | **Ford** | Duratorq / Zetec / Duratec | `5W-30` | Ford WSS-M2C913-D | ACEA A5/B5 / API SL | $3.8\text{L} - 4.5\text{L}$ |
   | **Fiat / Alfa / Lancia / Jeep** | MultiJet Diesel $\ge 2016$ | `0W-30` | Fiat 9.55535-DS1 | ACEA C2 / API SN | $3.5\text{L} - 4.5\text{L}$ |
   | **Asian OEMs (Toyota, Hyundai, Kia, Honda)** | Modern $\ge 2018$ Petrol/Hybrid | `0W-20` | Asian OEM Modern | ACEA C5 / API SP | $3.3\text{L} - 4.2\text{L}$ |
   | **Asian OEMs (Toyota, Hyundai, Kia, Honda)** | D-4D / CRDi Diesel | `5W-30` | Asian OEM C2/C3 DPF | ACEA C2 / C3 | $4.2\text{L} - 6.5\text{L}$ |
   | **Universal Fallback (Diesel $\ge 2011$)** | Any modern diesel with DPF | `5W-30` | Low-SAPS DPF Compliant | ACEA C3 / API SN | Displacement-scaled |

4. **Synchronized Output**:
   - Updates `backend/src/oil-finder/clean-catalog-hierarchy.json` and `oil-finder-full-dataset/clean-catalog-hierarchy.json`.
   - Populates database tables: `VehicleMake`, `VehicleModel`, `VehicleGeneration`, `VehicleEngine`, `OilFinderOilSpec`, and `OilFinderVehicle`.

---

## 🧪 4. Automated Verification Commands

After running the harvester, test the live API endpoints directly on the server:

```bash
# 1. Check generations for a freshly harvested model (Peugeot 208)
curl -s http://localhost:4000/api/oil-finder/models/peugeot/208/generations | jq .

# 2. Check engines and preview oil spec for a generation
curl -s http://localhost:4000/api/oil-finder/models/peugeot/208/generations/208-i/engines | jq .

# 3. Check oil recommendation search (Instant DB resolution)
curl -s "http://localhost:4000/api/oil-finder/vehicle?make=Peugeot&model=208" | jq .oilSpec

# 4. Verify preserved Dacia & VAG integrity
curl -s http://localhost:4000/api/oil-finder/models/volkswagen/golf/generations | jq .
curl -s http://localhost:4000/api/oil-finder/models/dacia/dokker/generations/dokker-i/engines | jq .
```
