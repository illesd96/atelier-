# Apply Special Events Custom Slots Migration
# This script applies migration 011 to add custom slots and optional rooms

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Special Events Custom Slots Migration" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path "backend/.env")) {
    Write-Host "ERROR: backend/.env file not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env with DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Load DATABASE_URL from .env
Write-Host "Loading database connection..." -ForegroundColor Yellow
Get-Content backend/.env | ForEach-Object {
    if ($_ -match '^DATABASE_URL=(.+)$') {
        $env:DATABASE_URL = $matches[1]
    }
}

if (-Not $env:DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL not found in backend/.env" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database URL loaded" -ForegroundColor Green
Write-Host ""

# Check if migration file exists
$migrationFile = "backend/src/database/migrations/011-special-events-custom-slots.sql"
if (-Not (Test-Path $migrationFile)) {
    Write-Host "ERROR: Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Migration file found" -ForegroundColor Green
Write-Host ""

# Ask for confirmation
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Make room_id nullable (allow events without rooms)" -ForegroundColor White
Write-Host "  2. Add use_custom_slots boolean field" -ForegroundColor White
Write-Host "  3. Add custom_slots jsonb field" -ForegroundColor White
Write-Host ""
$confirmation = Read-Host "Continue? (y/n)"

if ($confirmation -ne 'y') {
    Write-Host "Migration cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Applying migration..." -ForegroundColor Yellow

# Try to run migration using Node.js
try {
    # Check if psql is available
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    
    if ($psqlPath) {
        Write-Host "Using psql to apply migration..." -ForegroundColor Cyan
        $migrationContent = Get-Content $migrationFile -Raw
        $migrationContent | & psql $env:DATABASE_URL
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "================================" -ForegroundColor Green
            Write-Host "✓ Migration applied successfully!" -ForegroundColor Green
            Write-Host "================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "  1. Deploy backend changes" -ForegroundColor White
            Write-Host "  2. Deploy frontend changes" -ForegroundColor White
            Write-Host "  3. Test creating an event with custom slots" -ForegroundColor White
            Write-Host ""
            Write-Host "See SPECIAL_EVENTS_CUSTOM_SLOTS.md for detailed documentation" -ForegroundColor Cyan
        } else {
            throw "psql command failed"
        }
    } else {
        Write-Host "psql not found. Please install PostgreSQL client tools" -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative: Run migration manually:" -ForegroundColor Yellow
        Write-Host "  psql `$DATABASE_URL -f $migrationFile" -ForegroundColor White
        Write-Host ""
        Write-Host "Or copy the SQL from $migrationFile" -ForegroundColor White
        Write-Host "and run it in your PostgreSQL admin panel" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Migration failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "  psql `$DATABASE_URL -f $migrationFile" -ForegroundColor White
    exit 1
}
