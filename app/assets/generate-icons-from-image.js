/**
 * Generate app icons from an image file
 * 
 * Usage:
 * 1. Place your icon image (PNG format, square, at least 1024x1024) in app/assets/
 * 2. Name it: icon-source.png
 * 3. Run: node app/assets/generate-icons-from-image.js
 * 
 * This will generate:
 * - icon.png (1024x1024)
 * - adaptive-icon.png (1024x1024)
 * - splash-icon.png (2048x2048)
 * - favicon.png (512x512)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname);
const SOURCE_IMAGE = path.join(ASSETS_DIR, 'icon-source.png');

// Required sizes
const ICON_SIZES = {
  'icon.png': 1024,
  'adaptive-icon.png': 1024,
  'splash-icon.png': 2048,
  'favicon.png': 512,
};

async function generateIcons() {
  try {
    // Check if source image exists
    if (!fs.existsSync(SOURCE_IMAGE)) {
      console.error('❌ Source image not found!');
      console.error(`   Please place your icon image at: ${SOURCE_IMAGE}`);
      console.error('   The image should be a PNG file, square, at least 1024x1024 pixels');
      console.error('   It should show the Thai character "ไร่" on a green background');
      process.exit(1);
    }

    console.log('✅ Source image found');
    console.log('📦 Generating icons...\n');

    // Generate each icon size
    for (const [filename, size] of Object.entries(ICON_SIZES)) {
      const outputPath = path.join(ASSETS_DIR, filename);
      
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${filename} (${size}x${size})`);
    }

    console.log('\n✨ All icons generated successfully!');
    console.log('\n📱 Next steps:');
    console.log('   1. Verify the icons look correct');
    console.log('   2. Run: npm run build:android (or eas build)');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

