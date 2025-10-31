/**
 * Fix Android Adaptive Icon - Ensure text is in safe zone
 * 
 * Android adaptive icons crop the foreground image. The safe zone is the central 66%,
 * so text must be well-centered with padding to avoid being cropped.
 * 
 * Usage: node assets/fix-adaptive-icon.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname);
const ICON_PATH = path.join(ASSETS_DIR, 'icon.png');
const ADAPTIVE_ICON_PATH = path.join(ASSETS_DIR, 'adaptive-icon.png');

async function createAdaptiveIcon() {
  try {
    if (!fs.existsSync(ICON_PATH)) {
      console.error('❌ icon.png not found!');
      process.exit(1);
    }

    console.log('📱 Creating Android adaptive icon with safe zone...');
    console.log('   (Text will be centered in the safe 66% zone)\n');

    // Read the original icon
    const originalIcon = sharp(ICON_PATH);
    const metadata = await originalIcon.metadata();
    
    const size = 1024;
    const safeZonePercent = 0.66; // 66% safe zone
    const safeZoneSize = Math.floor(size * safeZonePercent);
    const padding = Math.floor((size - safeZoneSize) / 2);

    // Create adaptive icon:
    // 1. Resize original to fit safe zone (66% of canvas)
    // 2. Center it on transparent background
    // 3. The backgroundColor in app.json will provide the green background
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      }
    })
    .composite([
      {
        input: await originalIcon
          .resize(safeZoneSize, safeZoneSize, { fit: 'contain' })
          .png()
          .toBuffer(),
        left: padding,
        top: padding
      }
    ])
    .png()
    .toFile(ADAPTIVE_ICON_PATH);

    console.log(`✅ Created adaptive-icon.png`);
    console.log(`   - Size: ${size}x${size}`);
    console.log(`   - Safe zone: ${safeZoneSize}x${safeZoneSize} (66%)`);
    console.log(`   - Text centered with ${padding}px padding`);
    console.log('\n✨ Adaptive icon ready!');
    console.log('\n📱 Next: Rebuild APK with: npx eas-cli build -p android --profile preview');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdaptiveIcon();

