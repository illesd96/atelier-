# Manual Database Backup Script for Windows PowerShell
# Usage: .\scripts\backup-manual.ps1

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set it using:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL = "your-neon-connection-string"' -ForegroundColor Yellow
    exit 1
}

# Check if pg_dump is available
$pgDumpPath = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDumpPath) {
    Write-Host "❌ Error: pg_dump is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL:" -ForegroundColor Yellow
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "  Or install via Chocolatey: choco install postgresql" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Database Backup Script" -ForegroundColor Green
Write-Host "================================"

# Create backups directory
$backupDir = ".\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}
Write-Host "✅ Backup directory ready: $backupDir" -ForegroundColor Green

# Generate filename with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\backup_$timestamp.sql"

Write-Host ""
Write-Host "📦 Starting database backup..."
Write-Host "📝 Backup file: $backupFile"
Write-Host ""

# Create backup
try {
    & pg_dump $env:DATABASE_URL --no-owner --no-acl -f $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        # Get file size
        $fileSize = (Get-Item $backupFile).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        
        Write-Host ""
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host "📊 Backup size: $fileSizeMB MB"
        Write-Host "📁 Location: $backupFile"
        
        # Ask about compression
        $compress = Read-Host "Would you like to compress the backup? (y/n)"
        if ($compress -eq 'y' -or $compress -eq 'Y') {
            Write-Host "🗜️ Compressing backup..."
            Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip"
            
            $compressedSize = (Get-Item "$backupFile.zip").Length
            $compressedSizeMB = [math]::Round($compressedSize / 1MB, 2)
            
            Write-Host "✅ Compressed: $compressedSizeMB MB" -ForegroundColor Green
            Write-Host "📁 Location: $backupFile.zip"
            
            # Optionally remove uncompressed file
            $remove = Read-Host "Remove uncompressed file? (y/n)"
            if ($remove -eq 'y' -or $remove -eq 'Y') {
                Remove-Item $backupFile
                Write-Host "✅ Uncompressed file removed" -ForegroundColor Green
            }
        }
        
        Write-Host ""
        Write-Host "🎉 Backup process completed!" -ForegroundColor Green
        exit 0
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Backup failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

