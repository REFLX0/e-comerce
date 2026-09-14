#!/usr/bin/env bash
# Lightweight operational monitor - no Prometheus/Grafana stack, just a script
# run on a schedule (see the cron line below) that checks the thresholds this
# session was asked to watch and emails an alert (via the existing Brevo API
# key already used for transactional mail) when one is crossed. Each alert has
# a 1-hour cooldown (state file under /tmp) so a sustained problem pages once,
# not every run.
#
# Install: crontab -e, then add:
#   */5 * * * * /home/ubuntu/e-comerce/scripts/monitor.sh >> /home/ubuntu/e-comerce/logs/monitor.log 2>&1
#
# Reads BREVO_API_KEY and ADMIN_NOTIFICATION_EMAIL from backend/.env (same
# credentials the app already uses to mail admins - no new secret).

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

BREVO_API_KEY=$(grep -oP '(?<=^BREVO_API_KEY=).*' backend/.env)
ADMIN_EMAIL=$(grep -oP '(?<=^ADMIN_NOTIFICATION_EMAIL=).*' backend/.env)
STATE_DIR="/tmp/specpart-monitor-state"
mkdir -p "$STATE_DIR"
NOW=$(date +%s)
COOLDOWN=3600

alert() {
  local key="$1" subject="$2" body="$3"
  local statefile="$STATE_DIR/$key"
  local last=0
  [ -f "$statefile" ] && last=$(cat "$statefile")
  if [ $((NOW - last)) -lt $COOLDOWN ]; then
    echo "[$(date -u +%FT%TZ)] SUPPRESSED (cooldown): $subject"
    return
  fi
  echo "$NOW" > "$statefile"
  echo "[$(date -u +%FT%TZ)] ALERT: $subject - $body"
  if [ -n "${BREVO_API_KEY:-}" ] && [ -n "${ADMIN_EMAIL:-}" ]; then
    curl -s -X POST https://api.brevo.com/v3/smtp/email \
      -H "api-key: $BREVO_API_KEY" -H "Content-Type: application/json" \
      -d "{\"sender\":{\"email\":\"specpart.tn@gmail.com\",\"name\":\"Specpart Monitor\"},\"to\":[{\"email\":\"$ADMIN_EMAIL\"}],\"subject\":\"[Specpart Alert] $subject\",\"textContent\":\"$body\"}" \
      -o /dev/null
  fi
}

# ── Host CPU / RAM / disk ────────────────────────────────────────────────────
MEM_PCT=$(free | awk '/Mem:/ {printf "%.0f", ($2-$7)/$2*100}')
[ "$MEM_PCT" -gt 85 ] 2>/dev/null && alert "ram" "Host RAM above 85%" "Current: ${MEM_PCT}%"

DISK_PCT=$(df / | awk 'NR==2 {gsub("%","",$5); print $5}')
[ "$DISK_PCT" -gt 80 ] 2>/dev/null && alert "disk" "Disk usage above 80%" "Current: ${DISK_PCT}%"

CPU_LOAD=$(awk '{print $1}' /proc/loadavg)
NPROC=$(nproc)
CPU_PCT=$(awk -v l="$CPU_LOAD" -v n="$NPROC" 'BEGIN{printf "%.0f", l/n*100}')
[ "$CPU_PCT" -gt 85 ] 2>/dev/null && alert "cpu" "Host CPU load above 85%" "1-min load avg ${CPU_LOAD} / ${NPROC} cores = ${CPU_PCT}%"

# ── Container restarts ───────────────────────────────────────────────────────
for c in specpart-backend specpart-frontend specpart-db specpart-db-replica specpart-redis specpart-nginx; do
  restarts=$(docker inspect "$c" --format '{{.RestartCount}}' 2>/dev/null || echo 0)
  prev_file="$STATE_DIR/restarts_$c"
  prev=0
  [ -f "$prev_file" ] && prev=$(cat "$prev_file")
  echo "$restarts" > "$prev_file"
  if [ "$restarts" -gt "$prev" ]; then
    alert "restart_$c" "$c restarted" "RestartCount went from $prev to $restarts"
  fi
done

# ── Postgres connections ─────────────────────────────────────────────────────
PG_STATS=$(docker compose exec -T db psql -U specparttn -d specparttn -t -c \
  "SELECT count(*), (SELECT setting::int FROM pg_settings WHERE name='max_connections') FROM pg_stat_activity;" 2>/dev/null)
PG_TOTAL=$(echo "$PG_STATS" | awk -F'|' '{print $1}' | tr -d ' ')
PG_MAX=$(echo "$PG_STATS" | awk -F'|' '{print $2}' | tr -d ' ')
if [ -n "$PG_TOTAL" ] && [ -n "$PG_MAX" ]; then
  PG_PCT=$(awk -v t="$PG_TOTAL" -v m="$PG_MAX" 'BEGIN{printf "%.0f", t/m*100}')
  [ "$PG_PCT" -gt 80 ] 2>/dev/null && alert "pg_conn" "Postgres connections above 80% of max_connections" "$PG_TOTAL / $PG_MAX ($PG_PCT%)"
fi

# ── Oil Finder latency (readiness + a real cached endpoint) ────────────────
READY_MS=$(curl -s -o /dev/null -w '%{time_total}' --max-time 5 -A "monitor" http://localhost:4000/api/readiness 2>/dev/null)
READY_MS_INT=$(awk -v t="${READY_MS:-99}" 'BEGIN{printf "%.0f", t*1000}')
[ "$READY_MS_INT" -gt 1000 ] 2>/dev/null && alert "readiness_slow" "Backend readiness check slow" "${READY_MS_INT}ms (expected well under 100ms)"

# ── HTTP 5xx spike (last 5 minutes of nginx access log) ─────────────────────
FIVE_MIN_AGO=$(date -d '5 minutes ago' '+%d/%b/%Y:%H:%M' 2>/dev/null || date -v-5M '+%d/%b/%Y:%H:%M')
FIVEXX_COUNT=$(docker compose exec -T nginx sh -c "grep -c ' 5[0-9][0-9] ' /var/log/nginx/access.log 2>/dev/null" 2>/dev/null || echo 0)
[ "${FIVEXX_COUNT:-0}" -gt 20 ] 2>/dev/null && alert "5xx_spike" "Elevated 5xx count in nginx access log" "$FIVEXX_COUNT total 5xx lines currently in the log"

echo "[$(date -u +%FT%TZ)] monitor run complete: mem=${MEM_PCT}% disk=${DISK_PCT}% cpu=${CPU_PCT}% pg=${PG_TOTAL:-?}/${PG_MAX:-?} ready=${READY_MS_INT:-?}ms"
