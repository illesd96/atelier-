/**
 * Image Optimization Script
 * 
 * This script uses Sharp to optimize images in the public/images directory.
 * Run with: node scripts/optimize-images.js
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGES_DIR = join(__dirname, '../public/images');
const OUTPUT_DIR = join(__dirname, '../public/images-optimized');

// Optimization settings
const JPEG_QUALITY = 80;
const PNG_QUALITY = 85;
const WEBP_QUALITY = 80;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1440;

async function getAllImages(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = join(dir, file.name);
    
    if (file.isDirectory()) {
      await getAllImages(fullPath, fileList);
    } else if (/\.(jpg|jpeg|png)$/i.test(file.name)) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

async function optimizeImage(inputPath) {
  try {
    const relativePath = inputPath.replace(IMAGES_DIR, '');
    const outputPath = join(OUTPUT_DIR, relativePath);
    const outputDir = dirname(outputPath);
    
    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Optimizing: ${relativePath}`);
    console.log(`  Original size: ${metadata.width}x${metadata.height}`);
    
    // Resize if too large
    let pipeline = image;
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Optimize based on format
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      await pipeline
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toFile(outputPath);
      
      // Also create WebP version
      const webpPath = outputPath.replace(/\.(jpg|jpeg)$/i, '.webp');
      await sharp(inputPath)
        .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);
      
      console.log(`  ✓ Optimized JPEG`);
      console.log(`  ✓ Created WebP`);
    } else if (metadata.format === 'png') {
      await pipeline
        .png({ quality: PNG_QUALITY, compressionLevel: 9 })
        .toFile(outputPath);
      
      // Also create WebP version
      const webpPath = outputPath.replace(/\.png$/i, '.webp');
      await sharp(inputPath)
        .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);
      
      console.log(`  ✓ Optimized PNG`);
      console.log(`  ✓ Created WebP`);
    }
    
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');
  console.log(`Input directory: ${IMAGES_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);
  
  try {
    // Get all images
    const images = await getAllImages(IMAGES_DIR);
    console.log(`Found ${images.length} images to optimize\n`);
    
    // Create output directory
    if (!existsSync(OUTPUT_DIR)) {
      await mkdir(OUTPUT_DIR, { recursive: true });
    }
    
    // Optimize each image
    for (const imagePath of images) {
      await optimizeImage(imagePath);
      console.log('');
    }
    
    console.log('✅ Image optimization complete!');
    console.log('\nNext steps:');
    console.log('1. Check the images-optimized folder');
    console.log('2. Compare file sizes');
    console.log('3. Replace original images if satisfied');
    console.log('4. Delete the images-optimized folder');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

