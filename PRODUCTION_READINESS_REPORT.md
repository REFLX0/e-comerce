# specpart.tech — Production Readiness Report

Date: 2026-09-14
Scope: full 27-phase directive — DB/query optimization, Redis caching, connection
pooling, Postgres tuning, Docker resource limits, nginx/rate limiting, health
checks, logging, frontend review, and a load-test design.

**Read this first — the target VPS does not match the real box.** The directive
was scoped for 6 vCPU / 12 GB RAM / 300 Mbit/s. The actual SSH-accessible
production host (13.49.134.212) is **2 vCPU / 7.6 GB RAM** (confirmed via
`nproc` / `free -h`). Every resource number in this report is scaled to the
real box, not the described target. If the intent is to actually run this on a
6 vCPU/12 GB VPS, the Docker memory budget in section F should be redone against
that box's real `docker stats` output, not copy-pasted from this report.

---

## A. What changed

1. Redis caching wired into Oil Finder's 5 read endpoints (makes/models/generations/engines/vehicle).
2. 8 new indexes on `tecdoc.manufacturers`/`models`/`passengercars` (6 from the spec + 2 more to close a measured gap).
3. Explicit DB connection pool limits (backend Prisma, frontend pg.Pool) instead of implicit defaults.
4. Postgres memory/planner config tuned off factory defaults.
5. Docker `mem_limit`/`cpus` added to all 13 services (previously none existed) + explicit Kafka JVM heap cap.
6. nginx: tiered rate limiting for Oil Finder (dropdown vs. expensive lookup vs. general API).
7. New `/api/readiness` endpoint (DB-gated) alongside the existing `/api/health` (liveness-only).
8. Fixed a password-reset-token logging leak in the mail service's mock path.
9. Fixed a stale-response race condition in `VehicleFinder.tsx`'s cascading dropdowns.
10. k6 load-test script designed (not run against production — see section N).

Everything below is either **measured** (real command output, shown or summarized) or marked **NOT MEASURED**.

---

## B. Files changed

- `backend/src/oil-finder/oil-finder.service.ts` — caching wrappers + eslint --fix reformat (see commit `29b0c80a`)
- `backend/src/oil-finder/oil-finder.service.spec.ts` — CacheService test mock
- `backend/src/cache/cache.service.ts` — added `isReady()` accessor
- `backend/src/health/health.controller.ts` — added `/liveness`, `/readiness`
- `backend/src/mail/mail.service.ts` — stopped logging the reset token
- `frontend/lib/db.ts` — explicit `pg.Pool` max
- `frontend/features/oil-finder/components/VehicleFinder.tsx` — request-sequencing guard
- `docker-compose.yml` — connection_limit, Postgres tuning, resource limits, Kafka heap
- `nginx/nginx.prod.conf` — rate-limit tiers
- `k6/oil-finder-load-test.js` — new file, load-test design

Commits (main): `29b0c80a`, `a2959531`, `75fc249c`, `32cc5ba3`, `c07e342a`. All pushed and deployed live.

## C. Database indexes added (all `CREATE INDEX CONCURRENTLY`, live on production `tecdoc` schema)

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tecdoc_mfr_matchcode_norm ON tecdoc.manufacturers (LOWER(REGEXP_REPLACE(matchcode, '[^a-zA-Z0-9]+', '-', 'g')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tecdoc_mfr_desc_norm ON tecdoc.manufacturers (LOWER(REGEXP_REPLACE(COALESCE(NULLIF(description,''), matchcode), '[^a-zA-Z0-9]+', '-', 'g')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tecdoc_models_desc_norm ON tecdoc.models (LOWER(REGEXP_REPLACE(description, '[^a-zA-Z0-9]+', '-', 'g')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tecdoc_models_desc_trgm ON tecdoc.models USING gin (LOWER(description) gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tecdoc_mfr_desc_trgm ON tecdoc.manufacturers USING gin (LOWER(COALESCE(NULLIF(description,''), matchcode)) gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tecdoc_pc_model_id ON tecdoc.passengercars (model_id);
-- added beyond the original list, to close a measured gap:
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tecdoc_mfr_matchcode_lower ON tecdoc.manufacturers (LOWER(matchcode));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tecdoc_models_desc_lower ON tecdoc.models (LOWER(description));
```

**Not scripted as a Prisma migration** — `tecdoc` is an unmanaged schema outside Prisma's migration tracking. If you rebuild this database from scratch, re-run the block above manually. All 8 confirmed `indisvalid = t`.

**Measured impact:** the `passengercars` join query went from ~33.6ms → 0.32ms (~100x), re-confirmed post-tuning today at 3.0ms including planning (`Index Scan using idx_tecdoc_pc_model_id`, not `Seq Scan`).

**Known incomplete case:** the manufacturer/model classification query (the one with an `OR` across multiple `ILIKE` branches) is only partially accelerated. Postgres can only turn an `OR` into a `BitmapOr` index scan if *every* branch has index support — one branch is a reverse-direction substring match (`$2 ILIKE '%' || column || '%'`) that is structurally impossible to index in Postgres. Fully fixing this needs an app-level query rewrite, which I did not make — it risks the classification logic itself, and correctness was prioritized over the remaining milliseconds here, per your own Phase 26 instruction.

## D. Redis caching implemented

Cache-aside pattern via the existing `CacheService`, added to `backend/src/oil-finder/oil-finder.service.ts`:

| Endpoint | Key pattern | TTL |
|---|---|---|
| `getMakes` | `oil-finder:makes:{category}` | 6h |
| `getModels` | `oil-finder:models:{make}:{category}` | 6h |
| `getGenerations` | `oil-finder:generations:{make}:{model}` | 6h |
| `getEngines` | `oil-finder:engines:{make}:{model}:{generation}` | 1h |
| `findByVehicle` | `oil-finder:vehicle:{make}:{model}:{generation}:{engine}` | 1h — **only when `status:'found'`** |

`not_found`/`ambiguous`/error results are never cached (manual get/set, not the generic `wrap()` helper, specifically to enforce this). Cache failure degrades to a direct DB lookup — verified: `CacheService.isReady()` gates every call, and every method already had this graceful-degradation contract before this change.

**Live-verified on production today:**
```
before: (no oil-finder:* keys)
GET /api/oil-finder/makes  →  200, real data
after:  oil-finder:makes:_   TTL=21600  (matches the coded 6h TTL exactly)

GET /api/oil-finder/vehicle?make=Nonexistentbrandxyz&model=Nonexistentmodelxyz
  → {"status":"not_found", ...}
  → redis-cli KEYS 'oil-finder:vehicle:*' → (empty) — confirms not_found is never cached
```

## E. Postgres configuration changes

Measured before changing anything: `shared_buffers=128MB`, `work_mem=4MB`,
`effective_cache_size=4GB`, `random_page_cost=4`, `effective_io_concurrency=1` —
all untouched factory defaults, tuned for spinning disks on a box that is
actually EBS SSD-backed.

```
shared_buffers = 512MB        (was 128MB)
effective_cache_size = 2GB    (was 4GB — now matches real buff/cache, ~3.1GB measured)
work_mem = 8MB                (was 4MB)
maintenance_work_mem = 128MB  (was 64MB)
random_page_cost = 1.1        (was 4 — SSD-appropriate)
effective_io_concurrency = 200 (was 1 — SSD-appropriate)
```

Kept conservative deliberately — this host runs 12 other containers, not a
dedicated DB box. `max_connections` left at 100 (measured only 7 live
connections at idle — no justification to raise it).

## F. Docker resource limits (scaled to the REAL 7.6GB box, not the 12GB target)

No container had `mem_limit`/`cpus` before this change — every container could
consume the full host. Measured idle usage via `docker stats` first, then set
limits with headroom for growth, not as a reservation:

| Service | mem_limit | cpus | measured idle (before) |
|---|---|---|---|
| db (primary) | 1536m | 1.5 | 156MB |
| db-replica | 1024m | 1.0 | 160MB |
| backend | 768m | 1.5 | 154MB |
| frontend | 512m | 1.0 | 88MB |
| opensearch | 1536m | 1.0 | 1017MB |
| kafka | 1280m | 1.0 | 953MB |
| redis | 256m | 0.5 | 6MB |
| minio | 384m | 0.5 | 175MB |
| kafka-ui | 384m | 0.5 | 305MB |
| opensearch-dashboards | 384m | 0.5 | 167MB |
| nginx | 128m | 0.5 | 8MB |
| certbot | 128m | 0.25 | 5MB |
| pg-backups | 256m | 0.5 | 6MB |

Sum of limits ≈ 8.6GB against a 7.6GB physical ceiling (~1.13x overcommit) —
these are hard per-container ceilings, not reservations, and real steady-state
usage today is ~3.6GB. This is a safety net against one runaway container, not
a claim that all 13 could peak simultaneously.

Kafka previously had **no JVM heap limit at all** (image default `-Xmx1G`,
unbounded relative to the container). Added `KAFKA_HEAP_OPTS=-Xms768m -Xmx768m`
explicitly.

**Kafka/OpenSearch necessity check (measured, not assumed):** both are in real
use. Kafka has 2 real topics (`order.created`: 10 messages, `product.updated`:
225 messages) with 2 active consumer groups. OpenSearch has a live
`specpart_products` index with 1,396 docs. Neither is vestigial — kept both.

## G. nginx changes

- General API rate limit: 10r/s burst 30 → **20r/s burst 40** (per spec).
- New tier — Oil Finder dropdowns (`makes`/`models*`): **10r/s burst 20**. Cheap, now Redis-cached.
- New tier — Oil Finder vehicle/spec lookup: **3r/s burst 6**. Uncached DB work on every not_found/ambiguous miss — the actual worst case.
- Auth (`5r/m`) and chat (`5r/m`) tiers already existed and were left as-is — already appropriately strict.
- **No dead `proxy_cache_valid` directive was found in this file.** Grepped the full config — only `proxy_cache_bypass` exists (a correct no-op guard on websocket-upgrade routes, not an actual cache zone). Either this was already fixed in an earlier commit, or the directive's description didn't match the current state of this file. Nothing to fix here.

## H. Tiered rate limiting — final values

| Tier | Rate | Burst |
|---|---|---|
| General API | 20r/s | 40 |
| Oil Finder dropdown | 10r/s | 20 |
| Oil Finder vehicle/spec lookup | 3r/s | 6 |
| Auth (login/register) | 5r/m | 5 |
| Chat | 5r/m | 5 |
| Site (frontend catch-all) | 20r/s | 40 |

## I. Cloudflare/CDN prep

**Not implemented.** nginx already sets `Cache-Control` on static assets
(`_next/static` 1y immutable, `/media/` 30d, `/uploads/` 30d, `/storage/`
1y immutable) — these are the headers a CDN would key off. No caching was
added or changed for `/api/` routes, auth routes, or any personalized
response — all of those still flow through untouched. If Cloudflare is put in
front of this site, verify its cache rules respect these headers and never
cache `/api/auth/*`, `/api/oil-finder/vehicle`, or any route that reads
cookies — I did not audit a live Cloudflare config because none is attached
to this deployment right now. **NOT MEASURED.**

## J. Next.js / ISR

Already correctly scoped before this session touched it: `generateStaticParams`
on both `huile-moteur/[make]/page.tsx` and `huile-moteur/[make]/[model]/page.tsx`
caps at the top 200 make/model pairs (`take: 200`), `revalidate = 86400` (24h),
default `dynamicParams` (on-demand generation + cache for the rest). **No
change made** — this already satisfies "don't blindly pre-generate all 3,626
pages." Last real build (from an earlier point in this session): 28.4s,
completed successfully. **Peak build memory: NOT MEASURED.**

## K. Image optimization

`next/image` is used in 26 files; only 4 raw `<img>` tags remain, all trivial
fixed-size icons (chat widget logo, a Google favicon) where `next/image`
would add complexity for zero benefit. Not changed.

**Real finding:** `next.config.ts` has `images.unoptimized: true` — deliberately
disabled, per an existing code comment, because the frontend container can't
reach the `uploads/` volume the way the backend/nginx can. This means product
images are served byte-for-byte as uploaded, with no server-side resize/
re-encode/WebP conversion. Measured: `uploads/products/` is 137MB, **59 files
over 500KB**, several over 3MB (e.g. `mannol-liquide-de-frein-dot-4-450ml.png`
at 3.3MB). nginx does cache these for 30 days, but first-load cost for new
visitors is real.

**Not fixed in this session** — the safe fix (mount `./uploads` read-only into
the frontend container too, then flip `unoptimized` off) touches the image
pipeline and would need its own build/deploy/verify cycle plus a check that
on-the-fly image transcoding doesn't add meaningful CPU load on this 2 vCPU
box. Flagged as the top concrete follow-up (see section Q).

## L. VehicleFinder.tsx review

Already well-optimized: dropdown search filters client-side via `useMemo`
against already-loaded data (no per-keystroke API calls), and the initial
makes-fetch already guards against a stale response with an `active` flag.

**Found and fixed:** `loadModels`/`loadGenerations`/`loadEngines` had no
request-sequencing — selecting Make A then quickly Make B before A's response
arrived could let A's stale result land after B's and overwrite the correct
state. Added a shared monotonic request-id ref; a superseded response is now
dropped. Zero UX change, purely defensive.

## M. Error handling / resilience

- Redis: `CacheService` already degrades to a DB lookup on any error (pre-existing, confirmed by reading the full service — not changed).
- Postgres: `/api/readiness` now reports it explicitly and gates readiness (new, this session).
- Kafka/OpenSearch: consumers/producers were not audited line-by-line for try/catch coverage in this session — **NOT MEASURED**. Given both are confirmed in active, low-volume use (section F), a full resilience audit of their call sites is a reasonable next step but wasn't done here given scope.

## N. Health checks

- `/api/health` — liveness only (process alive; does not fail on a DB blip). Unchanged, still what the Docker healthcheck and `depends_on: service_healthy` gate on.
- `/api/liveness` — new alias, same semantics.
- `/api/readiness` — **new**. Returns 503 when Postgres is unreachable; reports Redis status without gating on it (matches its documented graceful-degradation contract).

**Live-verified today** (browser User-Agent — curl's default UA is blocked by
the bot filter, which applies globally including to these endpoints; worth
knowing before pointing an external uptime monitor at them):
```
GET /api/health     → {"status":"ok","info":{"db":{"status":"up"}}}
GET /api/readiness  → {"status":"ready","details":{"db":{"status":"up","required":true},"redis":{"status":"up","required":false}}}
GET /api/liveness   → {"status":"ok"}
```

## O. Logging

Swept for `password|token|authorization|secret|jwt` in log statements.
**Found one real leak:** the mail service's "not configured" mock path for
password reset logged the full reset URL — which embeds the reset token, a
bearer credential for the account. This only fires when `BREVO_API_KEY` is
unset (not the case in production today, per `.env`), but would have silently
started leaking tokens into logs during any future mail-provider outage or
misconfiguration. **Fixed** — now logs only that a reset was requested, no
token. No other secret-logging patterns found (Authorization headers, raw
JWTs, etc. — none matched).

## P. Monitoring

Sentry is already wired in (`instrument.ts`, imported first in `main.ts`).
**Not added:** dashboards, alerting rules, or uptime monitoring — none of
that infrastructure exists to configure, and standing one up (Grafana,
Prometheus, an external uptime service) is a real new dependency, not a
config tweak. **NOT MEASURED / NOT IMPLEMENTED** — flagged as a next step,
not attempted.

## Q. Load test — results

**Design only. Not run against production.** `k6/oil-finder-load-test.js`
implements the 100/250/500/1000-VU ramping scenario with the specified
journey mix (60% Oil Finder happy path, 20% catalogue, 20% deliberate
not_found/bogus-vehicle misses) and the stated thresholds (dropdown p95
<200ms, lookup/catalogue p95 <300ms, error rate <1%).

k6 is not installed anywhere in this environment, and actually running it —
even the lowest stage — means generating real concurrent load against live
production traffic serving real users, which was explicitly ruled out. I did
not install k6 on the production box to do this.

**What I do have — single-request, unloaded, real measurements today:**
```
GET /api/oil-finder/makes (Redis-cached)          ~12ms
GET /api/oil-finder/vehicle?make=Toyota&model=Corolla   ~90-105ms (steady state)
                                                          493ms on the very first call (cold TLS/connection — not representative)
GET /api/products?page=1&limit=24                 ~35ms
```
These are one client, zero concurrency — not a substitute for the load test.
**Actual behavior under 100-1000 concurrent users: NOT MEASURED.**

## R. Before vs. after performance

| Query | Before | After | Measured how |
|---|---|---|---|
| `passengercars` join by model_id | ~33.6ms | 0.32ms (0.3-3ms re-confirmed post-tuning) | `EXPLAIN (ANALYZE, BUFFERS)`, live |
| Oil Finder makes/models/generations/engines | ~35-40ms (seq scan, CPU-bound) per uncached call | ~12ms cached; DB path unchanged for cache misses | Redis TTL/key confirmed live; DB-side timing from indexes above |
| Classification query (manufacturer/model OR) | Full seq scan | Partially accelerated — see section C | `EXPLAIN`, live |

No before/after figures were fabricated — anything not re-measured after the
Postgres/Docker config changes is marked as such above.

## S. Remaining bottlenecks

1. **Image delivery** — 59 unoptimized product images, some >3MB (section K). Highest-impact, not-yet-fixed item.
2. **Classification query** — still partially seq-scan for one `ILIKE` branch (section C). Requires a query rewrite to fully fix; deferred on correctness grounds.
3. **Backups are same-VPS only** — see section T. Not a performance bottleneck, but the single biggest resilience gap.
4. **No load test has actually been run** — every capacity number in this report is inferred from idle/single-request measurements, not from behavior under concurrency.

## T. Is 6 vCPU/12GB/300Mbit sufficient? Is 600Mbit necessary?

The real box is 2 vCPU/7.6GB, not 6 vCPU/12GB — so this question as posed
doesn't apply to what's actually deployed. Answering both readings:

- **On the real 2 vCPU/7.6GB box:** CPU is the more likely first bottleneck
  under real concurrent load, not memory (headroom exists: 2.5GB available,
  confirmed) and not bandwidth. This is inference from idle measurements, not
  from a load test — **capacity in requests/sec: NOT MEASURED.**
- **300 Mbit/s bandwidth:** 300 Mbit/s ≈ 37.5 MB/s. Even the worst-case 3MB
  product image fully saturating one connection is under 100ms of transfer
  time; normal API/HTML responses are KB-sized. Nothing measured in this
  session suggests bandwidth is a constraint at any traffic level this app
  is likely to see. **Do not pay for 600 Mbit/s on bandwidth grounds** — no
  evidence supports it. This conclusion doesn't require a load test to reach;
  it's arithmetic on response sizes.
- **If traffic grows:** vCPU count is the first thing to add, not RAM or
  bandwidth, based on where headroom is thinnest today (2 cores total, no
  spare) vs. memory (2.5GB free) and bandwidth (essentially unconstrained at
  this response-size profile).

## U. Security review

- CORS: explicit origin allowlist + `credentials: true`, no wildcard. Unchanged, already correct.
- Helmet applied, `X-Powered-By` removed, cookie parser present. Unchanged.
- `ValidationPipe`: `whitelist` + `forbidNonWhitelisted` + `transform`. Unchanged, already correct.
- HTTPS: HTTP→HTTPS redirect confirmed in nginx config; TLS 1.2/1.3 only, `HIGH:!aNULL:!MD5` ciphers.
- Secrets: `JWT_SECRET` on production is 48 characters (length-checked only, value never read/exposed) — not the local dev placeholder.
- Password-reset token logging leak — found and fixed (section O).
- No new endpoints were added without auth consideration; `/readiness` and `/liveness` intentionally expose no sensitive data (status booleans only).
- **Did not weaken anything for performance** — every caching decision explicitly excludes `not_found`/`ambiguous`/error results, and no `Authorization`/cookie-bearing response was made cacheable.

**SECURITY: PASS**, with the logging fix applied. A full penetration-test-style review (dependency CVEs, admin-endpoint auth coverage line-by-line) was **NOT MEASURED** — out of scope for this session's time budget.

---

## Deploy commands (already executed against production; recorded for reproducibility)

```bash
# On the box, from /home/ubuntu/e-comerce:
git pull
docker compose build --no-cache backend frontend   # --no-cache used deliberately this run to rule out stale-layer doubt
docker compose up -d
```

The 8 TecDoc indexes (section C) are **not** part of this deploy flow — they
were applied directly against the live `tecdoc` schema via `psql` and are not
tracked by any migration. Re-run the SQL block in section C manually if this
database is ever rebuilt from scratch.

## Manual production action still needed

1. Decide on the image-optimization fix (section K/Q) and schedule it — it needs its own deploy/verify cycle.
2. If Cloudflare/CDN goes in front of this site, verify its cache rules against section I before enabling.
3. Consider off-site backup replication (section below) — currently backups live on the same disk as the data they protect.
4. Run the k6 script (section Q) against a staging copy, or during a pre-announced low-traffic window, before trusting any concurrency number for this app.

## Backup / DR

Daily `pg_dump` via `pg-backups`, confirmed running (today's dump exists,
gzip-integrity-checked, valid `pg_dump` SQL header read back). Retention
config: 7 daily / 4 weekly / 6 monthly.

**Full restore-to-scratch-instance was NOT performed** in this session (would
need a throwaway Postgres instance — reasonable next step, not done here).

**Real gap, stated plainly:** the primary, the replica, AND the backups all
live on the same VPS disk. A full disk/VPS failure loses all three
simultaneously. This is not high availability and not disaster recovery in
the meaningful sense, regardless of the replica's existence — matching
exactly the caution in the original directive. Off-site backup
replication (S3/equivalent) is the missing piece, not yet implemented.

---

## FINAL VERDICT

```
PRODUCTION STATUS: READY WITH CONDITIONS
VPS: 2 vCPU / 7.6GB RAM / EBS SSD (NOT the 6 vCPU/12GB target described — verify which box is actually intended for production before trusting any capacity number below)
EXPECTED CAPACITY: NOT MEASURED (no load test was run; idle/single-request measurements only)
MAIN BOTTLENECK: CPU headroom (2 cores total, no spare) — inferred, not load-tested
SECONDARY BOTTLENECK: Unoptimized product images (59 files >500KB, several >3MB) inflating page weight
300 MBIT/S: SUFFICIENT (response-size analysis; not bandwidth-constrained at any realistic traffic level for this app)
REDIS: IMPLEMENTED (live-verified: cache writes, correct TTLs, not_found correctly never cached, graceful degradation pre-existing)
DATABASE: OPTIMIZED (8 new indexes live and verified in use; memory/planner config tuned and justified; connection pool made explicit) — WITH ONE KNOWN GAP (partial classification-query fix, section C)
OIL FINDER: OPTIMIZED (caching live-verified end-to-end; stale-response race fixed in the frontend; correctness preserved — all 221 backend tests pass, zero business logic touched)
SECURITY: PASS (one real logging leak found and fixed; CORS/helmet/validation already correct; full pen-test NOT MEASURED)
BACKUPS: NEEDS WORK (running and integrity-verified, but same-VPS only — no off-site replication, no restore drill performed)
MOST IMPORTANT NEXT STEP: Run the k6 load test (k6/oil-finder-load-test.js) against a staging copy of this box to get a real concurrency ceiling — every capacity claim in this report is currently inferred from idle measurements, not observed under load.
```
