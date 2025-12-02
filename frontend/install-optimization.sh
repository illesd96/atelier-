#!/bin/bash
# Bash script to install image optimization dependencies

echo "📦 Installing image optimization dependencies..."
echo ""

# Install dependencies
npm install --save-dev vite-plugin-image-optimizer
npm install --save-dev sharp

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run build' to optimize images during build"
echo "2. Or run 'npm run optimize-images' for manual optimization"
echo ""

