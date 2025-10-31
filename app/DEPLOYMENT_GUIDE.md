# Rai AI Mobile App - Deployment Guide

## 🚀 **Current Status: Ready for Deployment!**

Your Rai AI mobile app is now configured with real data and ready for deployment. Here are your options:

## 📱 **Option 1: Web Deployment (Immediate)**

### Deploy to Vercel (Recommended)
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd /Users/bovorn/Desktop/aurasea/Projects/raiai/rai-al-mobile/app
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   ```
   EXPO_PUBLIC_OPENWEATHERMAP_API_KEY=29e794ca05b243e559caf94c5a638d02
   EXPO_PUBLIC_SCAN_USE_MOCK=false
   ```

### Deploy to Netlify
1. **Build the app:**
   ```bash
   cd /Users/bovorn/Desktop/aurasea/Projects/raiai/rai-al-mobile/app
   npx expo export --platform web
   ```

2. **Deploy the `dist` folder to Netlify**

## 📱 **Option 2: APK Generation (Requires Expo Account)**

### Step 1: Create Expo Account
1. Go to https://expo.dev/
2. Sign up for a free account
3. Note your username

### Step 2: Login to EAS
```bash
cd /Users/bovorn/Desktop/aurasea/Projects/raiai/rai-al-mobile/app
npx eas login
# Enter your Expo username/email and password
```

### Step 3: Configure EAS Build
```bash
npx eas build:configure
```

### Step 4: Build APK
```bash
npx eas build --platform android --profile preview
```

### Step 5: Download APK
- EAS will provide a download link
- APK will be available in your Expo dashboard

## 📱 **Option 3: Local APK Build (Advanced)**

### Prerequisites
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK)

### Build Steps
1. **Install Expo CLI:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Create development build:**
   ```bash
   cd /Users/bovorn/Desktop/aurasea/Projects/raiai/rai-al-mobile/app
   npx expo run:android
   ```

3. **Generate APK:**
   - Open Android Studio
   - Import the `android` folder
   - Build → Generate Signed Bundle/APK

## 🌐 **Option 4: PWA Deployment (Recommended for Mobile)**

### Create PWA Build
```bash
cd /Users/bovorn/Desktop/aurasea/Projects/raiai/rai-al-mobile/app
npx expo export --platform web
```

### Deploy to any static hosting:
- **Vercel**: `vercel --prod`
- **Netlify**: Upload `dist` folder
- **GitHub Pages**: Push to GitHub and enable Pages
- **Firebase Hosting**: `firebase deploy`

## 🔧 **Environment Variables for Production**

Set these in your deployment platform:

```bash
# Weather API (Working)
EXPO_PUBLIC_OPENWEATHERMAP_API_KEY=29e794ca05b243e559caf94c5a638d02

# Scan Configuration
EXPO_PUBLIC_SCAN_USE_MOCK=false

# Optional APIs (for full functionality)
EXPO_PUBLIC_DIT_API_KEY=your_dit_api_key_here
PLANTIX_API_KEY=your_plantix_api_key_here
```

## 📱 **App Features Ready for Deployment**

### ✅ **Working Features:**
- **Weather Page**: Real weather forecasts and spray recommendations
- **Home Page**: Real weather-based calculations
- **Fields Page**: Real GPS location services
- **Settings Page**: Language switching
- **Navigation**: All pages accessible

### ⚠️ **Features that need additional API keys:**
- **Price Page**: Agricultural prices (shows error until DIT API key added)
- **Scan Page**: Disease detection (shows error until Plantix API key added)

## 🚀 **Quick Start (Web Deployment)**

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   cd /Users/bovorn/Desktop/aurasea/Projects/raiai/rai-al-mobile/app
   vercel --prod
   ```

2. **Set environment variables in Vercel dashboard**

3. **Your app is live!** 🌐

## 📱 **For APK Generation:**

1. **Create Expo account at https://expo.dev/**
2. **Run:**
   ```bash
   npx eas login
   npx eas build:configure
   npx eas build --platform android --profile preview
   ```

## 🎉 **Your App is Ready!**

The Rai AI mobile app is now production-ready with:
- ✅ Real weather data
- ✅ Real spray recommendations
- ✅ Real location services
- ✅ Professional UI/UX
- ✅ Thai/English localization
- ✅ Error handling for missing APIs

**Choose your deployment method and go live! 🚀**
