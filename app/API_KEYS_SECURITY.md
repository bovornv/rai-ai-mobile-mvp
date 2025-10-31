# API Keys Security Guide

## 🔐 Current API Keys Configuration

The API keys are currently stored in `src/config/apiKeys.ts` for development purposes. 

**⚠️ IMPORTANT: For production deployment, you MUST move these to environment variables!**

## 🚀 Production Security Steps

### 1. Create Environment Variables File
Create a `.env` file in the app root directory:

```bash
# Weather APIs
OPENWEATHERMAP_API_KEY=29e794ca05b243e559caf94c5a638d02
METEOSOURCE_API_KEY=69z56nx86o9g7ut24iwuzq5p1ik9rek8v61ggigg

# Location APIs
GOOGLE_MAPS_API_KEY=AIzaSyA0c40zoJGzs-Eaq5Pn5a80KRDMsyU5d9k
MAPBOX_PUBLIC_TOKEN=pk.eyJ1IjoiYm92b3JuIiwiYSI6ImNtZjl3ZWY3dzA3Ym8ycm9lbTQzcmo5ankifQ.LvMa5fl8cpeXL8Za5Vroug
MAPBOX_RAI_AI_TOKEN=pk.eyJ1IjoiYm92b3JuIiwiYSI6ImNtZjl6Mzg2MTBjamMya3FvcHN2eWlodDEifQ.SAxZlQ8LLiRlfpZk8UB-XA
```

### 2. Update API Keys Configuration
Modify `src/config/apiKeys.ts` to use environment variables:

```typescript
export const API_KEYS = {
  OPENWEATHERMAP: process.env.OPENWEATHERMAP_API_KEY || '29e794ca05b243e559caf94c5a638d02',
  METEOSOURCE: process.env.METEOSOURCE_API_KEY || '69z56nx86o9g7ut24iwuzq5p1ik9rek8v61ggigg',
  GOOGLE_MAPS: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyA0c40zoJGzs-Eaq5Pn5a80KRDMsyU5d9k',
  MAPBOX_PUBLIC: process.env.MAPBOX_PUBLIC_TOKEN || 'pk.eyJ1IjoiYm92b3JuIiwiYSI6ImNtZjl3ZWY3dzA3Ym8ycm9lbTQzcmo5ankifQ.LvMa5fl8cpeXL8Za5Vroug',
  MAPBOX_RAI_AI: process.env.MAPBOX_RAI_AI_TOKEN || 'pk.eyJ1IjoiYm92b3JuIiwiYSI6ImNtZjl6Mzg2MTBjamMya3FvcHN2eWlodDEifQ.SAxZlQ8LLiRlfpZk8UB-XA',
} as const;
```

### 3. Add .env to .gitignore
Ensure `.env` is in your `.gitignore` file to prevent committing API keys.

### 4. Production Deployment
For production apps (Expo EAS Build, App Store, etc.):
- Use Expo's environment variables: `expo env:set`
- Or use your deployment platform's secure environment variable system
- Never commit API keys to version control

## 🔒 Security Best Practices

1. **Rotate API keys regularly**
2. **Monitor API usage** for unusual activity
3. **Use API key restrictions** (IP, domain, app bundle ID)
4. **Set up billing alerts** to prevent unexpected charges
5. **Use different keys** for development and production

## 📊 Current API Usage

- **OpenWeatherMap**: Weather data and forecasts
- **Google Maps**: Geocoding and reverse geocoding (primary)
- **Mapbox**: Map rendering and geocoding (fallback)
- **OpenStreetMap**: Free geocoding fallback

## 🚨 Emergency Actions

If API keys are compromised:
1. Immediately regenerate keys in the respective service dashboards
2. Update the configuration files
3. Redeploy the application
4. Monitor for unauthorized usage
