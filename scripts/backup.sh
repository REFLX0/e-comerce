#!/bin/bash
set -e

BACKUP_DIR="/opt/specpart/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="specpart-db"
DB_USER="specpart"
DB_NAME="specpart"
BACKUP_FILE="$BACKUP_DIR/specpart_db_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

echo "Starting specpart Database Backup: $TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "Dumping PostgreSQL database..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -F c | gzip > "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"

echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "specpart_db_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
echo "Backup script finished successfully at $(date +"%Y-%m-%d %H:%M:%S")"
