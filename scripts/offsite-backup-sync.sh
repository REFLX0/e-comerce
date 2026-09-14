#!/usr/bin/env bash
# Pulls production's daily/weekly/monthly PostgreSQL dumps down to a local
# folder inside the OneDrive sync path, verifying checksum on each copy and
# pruning local copies to match the VPS's own retention (7 daily / 4 weekly /
# 6 monthly). Local backups on the VPS are never touched or deleted.
#
# Off-site here means "leaves the VPS disk, lands in Microsoft's cloud via
# OneDrive sync" - not a cron job on the VPS itself. This script must be run
# (manually, or via a Windows Scheduled Task) on a machine with OneDrive
# signed in and syncing; it does not push directly to OneDrive's API.
#
# This script does not touch the production database - it only reads
# already-produced backup files over SSH.

set -euo pipefail

SSH_KEY="/c/Users/Asus/.ssh/specpart_vm"
REMOTE="ubuntu@13.49.134.212"
REMOTE_DIR="/home/ubuntu/e-comerce/backups"
LOCAL_DIR="/c/Users/Asus/OneDrive/specpart-offsite-backups"
RETAIN_DAILY=7
RETAIN_WEEKLY=4
RETAIN_MONTHLY=6

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

sync_tier() {
  local tier="$1" retain="$2"
  local remote_path="$REMOTE_DIR/$tier"
  local local_path="$LOCAL_DIR/$tier"
  mkdir -p "$local_path"

  log "=== $tier ==="
  # List remote files (excluding the 'latest' symlink) newest-first.
  local files
  files=$(ssh -n -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE" \
    "cd $remote_path && ls -t *.sql.gz 2>/dev/null | grep -v -- '-latest.sql.gz'")

  if [ -z "$files" ]; then
    log "$tier: no backup files found remotely"
    return
  fi

  local count=0
  while IFS= read -r f; do
    count=$((count + 1))
    if [ "$count" -gt "$retain" ]; then
      continue
    fi
    if [ -f "$local_path/$f" ]; then
      log "$tier/$f already present locally, verifying checksum"
    else
      log "$tier/$f fetching..."
      scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -q "$REMOTE:$remote_path/$f" "$local_path/$f.part"
      mv "$local_path/$f.part" "$local_path/$f"
    fi

    local remote_sum local_sum
    remote_sum=$(ssh -n -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE" "sha256sum $remote_path/$f | cut -d' ' -f1")
    local_sum=$(sha256sum "$local_path/$f" | cut -d' ' -f1)
    if [ "$remote_sum" != "$local_sum" ]; then
      log "CHECKSUM MISMATCH for $tier/$f — remote=$remote_sum local=$local_sum"
      rm -f "$local_path/$f"
      exit 1
    fi
    log "$tier/$f OK (sha256 $local_sum)"
  done <<< "$files"

  # Prune local copies beyond retention (files this run didn't just verify/fetch).
  local kept
  kept=$(echo "$files" | head -n "$retain")
  for existing in "$local_path"/*.sql.gz; do
    [ -e "$existing" ] || continue
    local base
    base=$(basename "$existing")
    if ! echo "$kept" | grep -qx "$base"; then
      log "$tier: pruning out-of-retention local copy $base"
      rm -f "$existing"
    fi
  done
}

sync_tier daily "$RETAIN_DAILY"
sync_tier weekly "$RETAIN_WEEKLY"
sync_tier monthly "$RETAIN_MONTHLY"

log "Done. Local off-site copies live under $LOCAL_DIR (synced to the cloud by the OneDrive client running on this machine - verify actual cloud upload via onedrive.com or the sync icon, this script cannot confirm that step)."
