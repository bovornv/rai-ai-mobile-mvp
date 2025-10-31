#!/bin/bash

# Rai AI Mobile App - Deployment Script
echo "🚀 Rai AI Mobile App - Deployment Script"
echo "========================================"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist folder not found. Building web app first..."
    npx expo export --platform web
fi

echo "✅ Web build found in dist/ folder"
echo "📁 Contents:"
ls -la dist/

echo ""
echo "🌐 Deployment Options:"
echo "1. Deploy to Vercel (Recommended)"
echo "2. Deploy to Netlify"
echo "3. Deploy to any static hosting"
echo ""

echo "📱 For APK Generation:"
echo "1. Create Expo account at https://expo.dev/"
echo "2. Run: npx eas login"
echo "3. Run: npx eas build:configure"
echo "4. Run: npx eas build --platform android --profile preview"
echo ""

echo "🔧 Environment Variables to set:"
echo "EXPO_PUBLIC_OPENWEATHERMAP_API_KEY=29e794ca05b243e559caf94c5a638d02"
echo "EXPO_PUBLIC_SCAN_USE_MOCK=false"
echo ""

echo "✅ Your app is ready for deployment!"
echo "📁 Deploy the 'dist' folder to any static hosting service"
