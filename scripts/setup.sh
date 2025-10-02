#!/bin/bash

# Photo Studio Booking System Setup Script
# This script helps set up the development environment

set -e

echo "🎬 Photo Studio Booking System Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed and accessible."
    echo "   You can install it with:"
    echo "   - macOS: brew install postgresql"
    echo "   - Ubuntu: sudo apt-get install postgresql postgresql-client"
    echo "   - Windows: Download from https://www.postgresql.org/download/"
fi

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install frontend dependencies
echo "📱 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Install backend dependencies  
echo "🖥️  Installing backend dependencies..."
cd backend && npm install && cd ..

echo ""
echo "⚙️  Setting up configuration..."

# Copy environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please edit backend/.env with your actual configuration values"
else
    echo "✅ backend/.env already exists"
fi

echo ""
echo "🗄️  Database setup"
echo "==================="

# Check if database URL is set
if grep -q "your_database_url" backend/.env 2>/dev/null; then
    echo "⚠️  Please update DATABASE_URL in backend/.env before proceeding"
    echo ""
    echo "Example PostgreSQL URLs:"
    echo "  Local: postgresql://username:password@localhost:5432/photo_studio"
    echo "  Heroku: postgres://user:pass@host:5432/database"
    echo "  Supabase: postgresql://postgres:password@host:5432/postgres"
    echo ""
    echo "After updating the DATABASE_URL, run:"
    echo "  psql \$DATABASE_URL < backend/src/database/schema.sql"
else
    echo "✅ DATABASE_URL is configured"
    
    # Ask if user wants to run database setup
    read -p "🗄️  Do you want to run database schema setup now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📊 Setting up database schema..."
        
        # Extract database URL from .env file
        DB_URL=$(grep DATABASE_URL backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        
        if [ -n "$DB_URL" ] && [ "$DB_URL" != "your_database_url" ]; then
            psql "$DB_URL" < backend/src/database/schema.sql
            echo "✅ Database schema created successfully"
        else
            echo "❌ Invalid DATABASE_URL. Please check your configuration."
        fi
    fi
fi

echo ""
echo "🔧 Configuration checklist"
echo "=========================="
echo ""
echo "Please ensure the following are configured in backend/.env:"
echo ""
echo "📊 Database:"
echo "   ✓ DATABASE_URL - PostgreSQL connection string"
echo ""
echo "📅 Internal Booking System:"
echo "   ✓ STUDIOS - JSON array of your studio configurations"
echo "   ✓ Business hours configured in backend/src/config/index.ts"
echo ""
echo "💳 Barion Payment:"
echo "   ✓ BARION_POS_KEY - Your Barion merchant POS key"
echo "   ✓ BARION_ENVIRONMENT - 'test' for development, 'prod' for production"
echo ""
echo "📧 Email Service:"
echo "   ✓ SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS - SMTP configuration"
echo "   ✓ FROM_EMAIL, FROM_NAME - Sender information"
echo ""

echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your actual API keys and configuration"
echo "2. Configure your Barion merchant account"
echo "3. Customize business hours and studio settings if needed"
echo "4. Test the application with: npm run dev"
echo ""
echo "Development commands:"
echo "  npm run dev          - Start both frontend and backend"
echo "  npm run dev:frontend - Start only frontend (port 3000)"
echo "  npm run dev:backend  - Start only backend (port 3001)"
echo ""
echo "📚 See README.md for detailed setup instructions"


