# Icon Update Instructions

## To use your custom icon image with Thai character "ไร่":

1. **Prepare your image:**
   - Format: PNG
   - Size: At least 1024x1024 pixels (square)
   - Content: Thai character "ไร่" on green background (matching your design)

2. **Place the image:**
   - Save it as `icon-source.png` in the `app/assets/` directory
   - Make sure it's a square image with the Thai character centered on green background

3. **Generate icons:**
   ```bash
   cd app
   npm install sharp --save-dev
   node assets/generate-icons-from-image.js
   ```

4. **Verify:**
   - Check that these files were created/updated:
     - `app/assets/icon.png`
     - `app/assets/adaptive-icon.png`
     - `app/assets/splash-icon.png`
     - `app/assets/favicon.png`

5. **Rebuild APK:**
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

## Alternative: Manual replacement

If you prefer to manually replace the icons:

1. Create these icon files with the correct sizes:
   - `icon.png`: 1024x1024
   - `adaptive-icon.png`: 1024x1024
   - `splash-icon.png`: 2048x2048
   - `favicon.png`: 512x512

2. Replace the files in `app/assets/` directory

3. Rebuild the APK

## Notes:

- The `app.json` already points to these icon files, so no configuration changes needed
- Make sure your source image has good contrast and the Thai character is clearly visible
- The green background color should match your brand (#15803D or similar)

