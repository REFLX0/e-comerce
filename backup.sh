#!/bin/bash

# Define variables
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILE_NAME="specpart_db_$DATE.sql"

echo "Starting backup: $FILE_NAME"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Dump the database from the docker container
# Make sure "specpart-db" and "specparttn" match your docker-compose.yml configuration
docker exec specpart-db pg_dump -U specparttn -d specparttn > "$BACKUP_DIR/$FILE_NAME"

# Compress the backup to save space
gzip "$BACKUP_DIR/$FILE_NAME"

# Find and delete backups older than 7 days to save disk space
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;

echo "Backup completed successfully."
