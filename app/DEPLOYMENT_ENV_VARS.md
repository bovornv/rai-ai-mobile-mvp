# Rai AI Mobile App - Environment Variables for Deployment

## ✅ OpenWeatherMap API Key (Configured)
Your OpenWeatherMap API key is already set in the code:
```
EXPO_PUBLIC_OPENWEATHERMAP_API_KEY=29e794ca05b243e559caf94c5a638d02
```

## 🔧 Required Environment Variables for Live Deployment

Set these environment variables in your deployment platform (Vercel, Netlify, etc.):

### Weather API (✅ Ready)
```bash
EXPO_PUBLIC_OPENWEATHERMAP_API_KEY=29e794ca05b243e559caf94c5a638d02
```

### Price APIs (❌ Need to be set)
```bash
EXPO_PUBLIC_DIT_API_BASE=https://dataapi.moc.go.th
EXPO_PUBLIC_DIT_API_KEY=your_dit_api_key_here
EXPO_PUBLIC_PRICE_REGION=thailand
EXPO_PUBLIC_COMMODITIES_API_KEY=your_commodities_api_key_here
```

### AI/ML APIs (❌ Need to be set)
```bash
EXPO_PUBLIC_PLANTIX_API=https://api.plantix.net/v2/diagnosis
PLANTIX_API_KEY=your_plantix_api_key_here
```

### Scan Configuration (✅ Ready)
```bash
EXPO_PUBLIC_SCAN_USE_MOCK=false
```

### Location APIs (Optional)
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EXPO_PUBLIC_MAPBOX_API_KEY=your_mapbox_api_key_here
```

## 🚀 How to Get API Keys

### 1. OpenWeatherMap (✅ Already have)
- **Status**: ✅ Configured
- **Key**: `29e794ca05b243e559caf94c5a638d02`
- **Website**: https://openweathermap.org/api

### 2. Plantix API (❌ Need to get)
- **Status**: ❌ Not configured
- **Website**: https://plantix.net/
- **Purpose**: Plant disease detection
- **Required for**: Scan page functionality

### 3. DIT API (❌ Need to get)
- **Status**: ❌ Not configured
- **Website**: https://dataapi.moc.go.th
- **Purpose**: Thai agricultural price data
- **Required for**: Price page functionality

### 4. Commodities-API (❌ Need to get)
- **Status**: ❌ Not configured
- **Website**: https://commodities-api.com/
- **Purpose**: International commodity prices
- **Required for**: Price page fallback

## 📱 Current App Status

### ✅ Working Features (with your OpenWeatherMap key):
- **Weather Page**: Real weather data and forecasts
- **Home Page**: Real weather-based spray recommendations
- **Fields Page**: Real GPS location services
- **Basic functionality**: All core features work

### ❌ Features that need API keys:
- **Price Page**: Agricultural prices (rice/durian)
- **Scan Page**: Plant disease detection

## 🔧 Quick Test

To test the app with your current API key:

```bash
cd /Users/bovorn/Desktop/aurasea/Projects/raiai/rai-al-mobile/app
npm run web
```

The weather features should work perfectly! The price and scan features will show error messages until you add the other API keys.

## 🎯 Next Steps

1. **Test current functionality** with OpenWeatherMap API
2. **Get Plantix API key** for disease detection
3. **Get DIT API key** for agricultural prices
4. **Deploy with all API keys** for full functionality

Your app is ready to go live with weather functionality! 🌤️
