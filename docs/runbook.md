# specpart — Disaster Recovery Runbook

> **Audience:** On-call engineers, DevOps team  
> **Last updated:** See Git history  
> **RTO (Recovery Time Objective):** < 30 minutes for all scenarios below  
> **RPO (Recovery Point Objective):** < 1 hour (daily DB backups, WAL archiving)

---

## Before You Start — Diagnostics First

Always run diagnostics before making changes:

```bash
# Health check
curl -s http://localhost:3000/api/health | jq .

# Container status
docker compose ps

# Recent logs
docker compose logs --tail=100 frontend
docker compose logs --tail=100 backend
docker compose logs --tail=100 db

# System resources
docker stats --no-stream
df -h
free -h
```

---

## Scenario 1 — Database Down

### Symptoms
- `/api/health` returns `{ "status": "error", "checks": { "database": { "status": "error" } } }`
- Frontend shows OfflineIndicator toast: "Serveur indisponible"
- `500` errors on any data-fetching page
- Logs: `DB transaction FAILED` or `Connection refused`

### Diagnosis

```bash
# Check container
docker compose ps db

# Check logs
docker compose logs --tail=50 db

# Try manual connection
docker exec -it specpart-db psql -U postgres -c "SELECT 1;"
```

### Recovery Steps

**Step 1 — Restart the DB container**
```bash
docker compose restart db
sleep 15
curl -s http://localhost:3000/api/health | jq .checks.database
```

**Step 2 — If data volume is corrupted, restore from backup**
```bash
# List available backups
ls -lt /opt/specpart/backups/*.sql.gz

# Restore most recent
BACKUP=/opt/specpart/backups/$(ls -t /opt/specpart/backups/*.sql.gz | head -1)
gunzip -c "$BACKUP" | docker exec -i specpart-db psql -U postgres specpart
```

**Step 3 — Run pending migrations after restore**
```bash
docker exec -it specpart-frontend npx prisma migrate deploy
```

**Step 4 — Verify**
```bash
curl -s http://localhost:3000/api/health | jq .
```

---

## Scenario 2 — Frontend Deploy Failure / Rollback

### Symptoms
- Build failed in CI
- Site returns 502/503 after deploy
- Health check fails after deploy

### Recovery Steps

**Immediate rollback (Docker)**

```bash
# See image history
docker image ls specpart-frontend

# Roll back to previous image (replace TAG with the previous working tag)
docker compose stop frontend
docker compose rm -f frontend
docker image tag specpart-frontend:previous specpart-frontend:latest
docker compose up -d frontend

# Verify
sleep 10
curl -sf http://localhost:3000/api/health
```

**Git-based rollback**

```bash
# Find last known-good commit
git log --oneline -10

# Revert
git revert HEAD --no-edit
git push origin main
# CI will build and redeploy automatically
```

---

## Scenario 3 — Rate Limit False Positive (Upstash Redis)

### Symptoms
- Legitimate users getting `429 Too Many Requests`
- Customer support reports login failures for a specific user/IP

### Diagnosis

```bash
# Check which rate limiter is triggering
# Look for "rate_limit_exceeded" in logs
docker compose logs frontend | grep -i rate
```

### Recovery Steps

**Option A — Flush specific key via Upstash Console**

1. Go to [console.upstash.com](https://console.upstash.com)
2. Navigate to your Redis database → Data Browser
3. Find key matching `@upstash/ratelimit/login:<identifier>`
4. Delete the key

**Option B — Flush all rate limit keys via CLI**

```bash
# Using upstash-cli or redis-cli pointed at Upstash
redis-cli -u "$UPSTASH_REDIS_REST_URL" DEL "@upstash/ratelimit/login:<IP_OR_USER>"
```

**Option C — Temporary escalation (if widespread)**

In `lib/rate-limit.ts`, temporarily increase the window:
```typescript
// Temporarily: 50 requests per 1 minute
limiter: Ratelimit.slidingWindow(50, '1 m'),
```

Deploy → monitor → revert to normal limits.

---

## Scenario 4 — Secrets Rotation

> [!CAUTION]
> Rotating secrets causes active sessions to be invalidated. Plan during low-traffic periods.

### NEXTAUTH_SECRET rotation

```bash
# 1. Generate new secret
openssl rand -base64 32

# 2. Update in production env
# (via your secrets manager / deployment platform)
NEW_SECRET="<generated>"

# 3. Update docker-compose or deployment config
# Set NEXTAUTH_SECRET=<NEW_SECRET>

# 4. Restart frontend (invalidates all active sessions — users must re-login)
docker compose restart frontend

# 5. Verify login still works
curl -sf http://localhost:3000/api/health
```

### Google OAuth credential rotation

1. Go to [Google Cloud Console](https://console.cloud.google.com) → Credentials
2. Create new OAuth 2.0 Client ID
3. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your secrets manager
4. Restart frontend: `docker compose restart frontend`
5. Delete old credentials from Google Cloud Console
6. Test Google sign-in

### Database password rotation

```bash
# 1. Connect to DB
docker exec -it specpart-db psql -U postgres

# 2. Change password
ALTER USER postgres PASSWORD 'new-strong-password';
\q

# 3. Update DATABASE_URL in all services
# 4. Restart backend and frontend
docker compose restart backend frontend

# 5. Verify health
curl -s http://localhost:3000/api/health | jq .checks.database
```

---

## Scenario 5 — Full Service Restore from Backup (3-2-1 Rule)

> Use this for: datacenter outage, ransomware, accidental data deletion.

### Backup strategy (implement this — it's not automatic yet)

```bash
# /etc/cron.d/specpart-backup — runs daily at 02:00
0 2 * * * root /opt/specpart/scripts/backup.sh
```

```bash
#!/bin/bash
# /opt/specpart/scripts/backup.sh
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/specpart/backups"
REMOTE_BUCKET="s3://specpart-backups"  # or your off-site location

# 1. Database dump
docker exec specpart-db pg_dump -U postgres specpart | \
  gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

# 2. Copy to off-site (S3 / rclone / rsync)
aws s3 cp "$BACKUP_DIR/db_${DATE}.sql.gz" "$REMOTE_BUCKET/db/"

# 3. Prune local backups older than 7 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "[backup] Done: db_${DATE}.sql.gz"
```

### Full restore procedure

```bash
# 1. Spin up infrastructure
docker compose up -d db redis
sleep 15

# 2. Restore database from off-site backup
aws s3 cp s3://specpart-backups/db/<LATEST>.sql.gz /tmp/restore.sql.gz
gunzip -c /tmp/restore.sql.gz | docker exec -i specpart-db psql -U postgres specpart

# 3. Run any pending migrations
docker compose run --rm frontend npx prisma migrate deploy

# 4. Start application services
docker compose up -d backend frontend

# 5. Smoke test
sleep 20
curl -s http://localhost:3000/api/health | jq .
curl -s http://localhost:4000/api/health | jq .

# 6. Announce resolution
# (update status page, notify team)
```

---

## Postmortem Template

After every incident lasting > 15 minutes, complete this template:

```markdown
## Incident Postmortem — [Date] — [Title]

### Timeline (UTC)
- HH:MM — Issue detected
- HH:MM — On-call notified
- HH:MM — Root cause identified
- HH:MM — Mitigation applied
- HH:MM — Service restored

### Impact
- Duration: X minutes
- Users affected: ~N
- Features affected:

### Root Cause
<!-- What fundamentally caused this? -->

### Contributing Factors
<!-- What made this worse or harder to detect? -->

### Resolution
<!-- What specifically fixed it? -->

### Action Items
| Action | Owner | Due Date |
|---|---|---|
| | | |

### What Went Well
<!-- What did the team do well? -->
```

> **Culture note:** Postmortems are blameless. The goal is system improvement, not fault assignment.

---

## Quick Reference

| Command | Purpose |
|---|---|
| `curl -s localhost:3000/api/health \| jq .` | Full health check |
| `docker compose ps` | Container status |
| `docker compose logs -f frontend` | Live frontend logs |
| `docker compose restart frontend` | Restart frontend |
| `docker compose up -d --no-deps frontend` | Redeploy frontend only |
| `docker exec -it specpart-db psql -U postgres` | DB console |
| `npx prisma migrate deploy` | Run pending migrations |
| `npx prisma studio` | Browse DB (dev only!) |

