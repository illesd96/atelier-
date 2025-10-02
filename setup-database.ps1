# PowerShell script to setup database
# Usage: .\setup-database.ps1

Write-Host "🗄️  Setting up Atelier Archilles database..." -ForegroundColor Cyan

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host "Please set it to your Neon connection string:" -ForegroundColor Yellow
    Write-Host '$env:DATABASE_URL = "your_neon_connection_string_here"' -ForegroundColor Yellow
    exit 1
}

# Run the SQL script
Get-Content NEON_DATABASE_SETUP.sql | psql $env:DATABASE_URL

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Verifying tables..." -ForegroundColor Cyan
    psql $env:DATABASE_URL -c "\dt"
} else {
    Write-Host "❌ Database setup failed!" -ForegroundColor Red
    exit 1
}

