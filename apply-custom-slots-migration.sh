#!/bin/bash
# Apply Special Events Custom Slots Migration
# This script applies migration 011 to add custom slots and optional rooms

echo "================================"
echo "Special Events Custom Slots Migration"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "ERROR: backend/.env file not found!"
    echo "Please create backend/.env with DATABASE_URL"
    exit 1
fi

# Load DATABASE_URL from .env
echo "Loading database connection..."
export $(grep -v '^#' backend/.env | grep DATABASE_URL | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not found in backend/.env"
    exit 1
fi

echo "✓ Database URL loaded"
echo ""

# Check if migration file exists
MIGRATION_FILE="backend/src/database/migrations/011-special-events-custom-slots.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "ERROR: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✓ Migration file found"
echo ""

# Ask for confirmation
echo "This will:"
echo "  1. Make room_id nullable (allow events without rooms)"
echo "  2. Add use_custom_slots boolean field"
echo "  3. Add custom_slots jsonb field"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "Applying migration..."

# Check if psql is available
if command -v psql &> /dev/null; then
    echo "Using psql to apply migration..."
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "================================"
        echo "✓ Migration applied successfully!"
        echo "================================"
        echo ""
        echo "Next steps:"
        echo "  1. Deploy backend changes"
        echo "  2. Deploy frontend changes"
        echo "  3. Test creating an event with custom slots"
        echo ""
        echo "See SPECIAL_EVENTS_CUSTOM_SLOTS.md for detailed documentation"
    else
        echo ""
        echo "ERROR: Migration failed!"
        echo ""
        echo "Try running manually:"
        echo "  psql \$DATABASE_URL -f $MIGRATION_FILE"
        exit 1
    fi
else
    echo "ERROR: psql not found. Please install PostgreSQL client tools"
    echo ""
    echo "Alternative: Run migration manually:"
    echo "  psql \$DATABASE_URL -f $MIGRATION_FILE"
    echo ""
    echo "Or copy the SQL from $MIGRATION_FILE"
    echo "and run it in your PostgreSQL admin panel"
    exit 1
fi
