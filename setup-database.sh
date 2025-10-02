#!/bin/bash

# Setup Database Script
# Usage: ./setup-database.sh

echo "🗄️  Setting up Atelier Archilles database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it to your Neon connection string:"
    echo "export DATABASE_URL='your_neon_connection_string_here'"
    exit 1
fi

# Run the SQL script
psql "$DATABASE_URL" < NEON_DATABASE_SETUP.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "📊 Verifying tables..."
    psql "$DATABASE_URL" -c "\dt"
else
    echo "❌ Database setup failed!"
    exit 1
fi

