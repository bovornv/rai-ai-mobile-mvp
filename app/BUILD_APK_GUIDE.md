# Building Android APK for Rai AI Mobile App

## Current Status: Configuration Ready ✅

The app is configured for EAS (Expo Application Services) builds. To generate an APK, you need to run the build command with interactive mode.

## Steps to Generate APK:

### Option 1: EAS Cloud Build (Recommended - Creates signed APK)

1. **Log in to EAS** (already done ✅):
   ```bash
   cd app
   npx eas-cli whoami
   ```

2. **Start the build**:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```
   
3. **Answer prompts interactively**:
   - When asked: "Generate a new Android Keystore?" → **Type: `y` and press Enter**
   - The build will start on EAS servers
   - You'll get a URL to monitor progress
   - Build typically takes 10-20 minutes

4. **Download the APK**:
   - After build completes, you'll get a download link
   - APK will be signed and ready to install on Android devices

### Option 2: Local Development Build (Requires Android Studio)

If you want to build locally, you need:
1. Android Studio installed
2. Android SDK configured
3. Run: `npx expo run:android`

### Option 3: Use Existing APK

Check the Downloads folder for `rai-ai-v1.0.1 (1).apk` (95.7 MB)
- This is the older version
- Missing recent fixes

## Current App Configuration:

- **App Name**: ไร่ AI (Rai AI)
- **Package**: com.raiai.mobile
- **Version**: 1.0.0
- **Permissions**: Camera, Location, Storage
- **Plugins**: expo-camera, expo-image-picker, expo-location

## To Build Now:

Open terminal in the app directory and run:
```bash
npx eas-cli build --platform android --profile preview
```

Then follow the interactive prompts. The first time will take longer as it generates credentials.

