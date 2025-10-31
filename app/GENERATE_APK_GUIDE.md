# Generate APK File for Rai AI Mobile App

## 🎯 **Goal: Create APK file for Android installation**

You need to create an APK file that people can download and install on their Android devices.

## 📱 **Step-by-Step APK Generation**

### **Step 1: Create Expo Account (2 minutes)**
1. Go to **https://expo.dev/**
2. Click **"Sign Up"** 
3. Create account with your email
4. **Remember your username/email** for login

### **Step 2: Login to EAS**
```bash
cd /Users/bovorn/Desktop/aurasea/Projects/raiai/rai-al-mobile/app
npx eas login
```
- Enter your Expo username/email
- Enter your password

### **Step 3: Configure EAS Build**
```bash
npx eas build:configure
```
- Choose **"Android"** when prompted
- This creates `eas.json` configuration file

### **Step 4: Build APK**
```bash
npx eas build --platform android --profile preview
```
- Build will take 5-10 minutes
- You'll get a download link when complete

### **Step 5: Download APK**
- Check your **Expo dashboard** at https://expo.dev/
- Go to **"Builds"** section
- **Download the APK file**
- APK file will be named like: `rai-ai-mobile-1.0.0-preview.apk`

## 📁 **APK File Details**

### **What you'll get:**
- **File name**: `rai-ai-mobile-1.0.0-preview.apk`
- **File size**: ~50-100 MB
- **Installation**: Direct install on Android devices
- **No Google Play Store needed**

### **APK Features:**
- ✅ **Real weather data** (OpenWeatherMap API)
- ✅ **Realistic agricultural prices** (rice & durian)
- ✅ **Disease detection** (real or realistic mock)
- ✅ **GPS location services**
- ✅ **Thai/English language support**
- ✅ **Professional UI** with "ไร่" icon

## 🚀 **Distribution Options**

### **Option 1: Direct Download**
- Upload APK to your website
- Provide direct download link
- Users download and install

### **Option 2: QR Code Download**
- Generate QR code for APK download
- Users scan QR code to download
- Easy mobile installation

### **Option 3: File Sharing**
- Share APK file directly
- Email, cloud storage, etc.
- Users install from file

## 📱 **Installation Instructions for Users**

### **For Android Users:**
1. **Download APK** from your website
2. **Enable "Unknown Sources"** in Android settings
3. **Tap APK file** to install
4. **Open app** and start using

### **Settings to Enable:**
- Go to **Settings > Security**
- Enable **"Unknown Sources"**
- Allow installation from **"File Manager"**

## ⏱️ **Total Time: ~15 minutes**

1. **Create Expo account**: 2 minutes
2. **Login and configure**: 3 minutes  
3. **Build APK**: 5-10 minutes
4. **Download APK**: 1 minute

## 🎉 **Ready to Generate APK!**

Your Rai AI mobile app is ready for APK generation with:
- Real weather data
- Realistic agricultural prices
- Disease detection capabilities
- GPS location services
- Professional UI
- Thai/English support

**Start with Step 1: Create Expo account at https://expo.dev/**

## 📞 **Need Help?**

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Guide**: https://docs.expo.dev/build/introduction/
- **Your app is production-ready!**

**Your APK will be ready in ~15 minutes! 📱🚀**
