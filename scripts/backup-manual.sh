#!/bin/bash

# Manual Database Backup Script
# Usage: ./scripts/backup-manual.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Database Backup Script${NC}"
echo "================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo ""
    echo "Please set it using:"
    echo "  export DATABASE_URL='your-neon-connection-string'"
    exit 1
fi

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ Error: pg_dump is not installed${NC}"
    echo ""
    echo "Please install PostgreSQL client:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Create backups directory
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ Backup directory ready: $BACKUP_DIR${NC}"

# Generate filename with timestamp
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo ""
echo "📦 Starting database backup..."
echo "📝 Backup file: $BACKUP_FILE"
echo ""

# Create backup
if pg_dump "$DATABASE_URL" --no-owner --no-acl -f "$BACKUP_FILE"; then
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo ""
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo "📊 Backup size: $SIZE"
    echo "📁 Location: $BACKUP_FILE"
    
    # Optionally compress
    read -p "Would you like to compress the backup? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗜️ Compressing backup..."
        gzip "$BACKUP_FILE"
        COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
        echo -e "${GREEN}✅ Compressed: $COMPRESSED_SIZE${NC}"
        echo "📁 Location: $BACKUP_FILE.gz"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Backup process completed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Backup failed!${NC}"
    echo "Please check the error messages above."
    exit 1
fi

