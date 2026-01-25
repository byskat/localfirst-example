# Backup script for PostgreSQL database

#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/electric_backup_$DATE.sql"
KEEP_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating backup: $BACKUP_FILE"
docker compose -f /home/deploy/demo-electric/docker-compose.prod.yaml exec -T postgres \
    pg_dump -U postgres electric > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
echo "Backup compressed: $BACKUP_FILE.gz"

# Remove old backups
echo "Removing backups older than $KEEP_DAYS days..."
find "$BACKUP_DIR" -name "electric_backup_*.sql.gz" -mtime +$KEEP_DAYS -delete

# Show backup size
du -h "$BACKUP_FILE.gz"

echo "✅ Backup complete!"
