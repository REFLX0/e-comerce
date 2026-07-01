#!/bin/bash
# KiosqueTN - Automated Database Backup Script
# This script should be added to the crontab of the Oracle VM to run daily.
# Example: 0 3 * * * /opt/kiosquetn/scripts/backup.sh >> /var/log/kiosquetn-backup.log 2>&1

set -e

# Configuration
BACKUP_DIR="/opt/kiosquetn/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="e-commerce-postgres-1"
DB_USER="achref"
DB_NAME="e_commerce"
BACKUP_FILE="$BACKUP_DIR/kiosquetn_db_$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

# Object Storage Configuration (to be filled by user)
S3_BUCKET=""
S3_ENDPOINT=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

echo "Starting KiosqueTN Database Backup: $TIMESTAMP"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Dump database directly from the docker container and compress
echo "Dumping PostgreSQL database..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -F c | gzip > "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"

# Upload to Object Storage (S3-compatible API like Oracle Object Storage)
if [ -n "$S3_BUCKET" ]; then
    echo "Uploading to Object Storage..."
    # requires aws-cli installed on host
    AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/" --endpoint-url "$S3_ENDPOINT"
    echo "Upload complete."
fi

# Clean up old backups locally
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "kiosquetn_db_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup script finished successfully at $(date +"%Y-%m-%d %H:%M:%S")"
