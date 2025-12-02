# PowerShell script to install image optimization dependencies

Write-Host "📦 Installing image optimization dependencies..." -ForegroundColor Cyan
Write-Host ""

# Install dependencies
npm install --save-dev vite-plugin-image-optimizer
npm install --save-dev sharp

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run build' to optimize images during build"
Write-Host "2. Or run 'npm run optimize-images' for manual optimization"
Write-Host ""

