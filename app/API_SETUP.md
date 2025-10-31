# Rai AI Mobile App - API Setup Guide

## Real Data Integration

The app now uses **real APIs** instead of mock data for all agricultural price information. Here's how to set up the APIs:

## Required API Keys

### 1. Weather API (Required)
- **Service**: OpenWeatherMap
- **Purpose**: Weather forecasts and spray window calculations
- **Get Key**: https://openweathermap.org/api
- **Environment Variable**: `EXPO_PUBLIC_OPENWEATHERMAP_API_KEY`

### 2. Price APIs (Required)
- **Service**: Commodities-API
- **Purpose**: Real-time Thai rice and durian prices
- **Get Key**: https://commodities-api.com (free tier available)
- **Environment Variable**: `EXPO_PUBLIC_COMMODITIES_API_KEY`

### 3. AI Disease Detection (Required)
- **Service**: Plantix Vision API
- **Purpose**: Real-time plant disease and nutrient deficiency detection
- **Get Key**: https://plantix.net/en/api/ (free tier available)
- **Environment Variable**: `PLANTIX_API_KEY`

## Optional API Keys

### 4. AI/ML APIs (Optional)
- **PlantNet**: Plant identification
- **Google Vision**: Image analysis
- **Environment Variables**: `EXPO_PUBLIC_PLANTNET_API_KEY`, `EXPO_PUBLIC_GOOGLE_VISION_API_KEY`

### 5. Map APIs (Optional)
- **Google Maps**: Location services
- **Mapbox**: Alternative map provider
- **Environment Variables**: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, `EXPO_PUBLIC_MAPBOX_API_KEY`

## Setup Instructions

1. **Create Environment File**:
   ```bash
   cp .env.example .env
   ```

2. **Add Your API Keys**:
   ```bash
   # Required APIs
   EXPO_PUBLIC_OPENWEATHERMAP_API_KEY=your_key_here
   EXPO_PUBLIC_COMMODITIES_API_KEY=your_key_here
   PLANTIX_API_KEY=your_key_here
   
   # Optional APIs
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```

3. **Restart Development Server**:
   ```bash
   npm start
   ```

## Real Price Data Sources

The app tries multiple Thai agricultural price APIs in order:

1. **Commodities-API** (Primary) - Real-time global commodity prices
2. **Bank of Thailand** - Official Thai farm price indices
3. **USDA Foreign Agricultural Service** - Thai rice export prices
4. **Thai Rice Exporters Association** - Industry price data
5. **Department of Internal Trade (DIT)** - Government price data
6. **Ministry of Agriculture** - Agricultural price statistics
7. **Open Data Thailand** - Public agricultural data

## Fallback Behavior

- If real APIs fail, the app uses realistic generated data based on current market trends
- All data is cached locally for offline use
- Price data is province-specific when location is available
- Automatic refresh every 2 hours

## Testing API Integration

The app includes built-in API testing:
- Check browser console for API test results
- Look for "✅ API Test SUCCESS" messages
- "⚠️ API Test WARNING" means using fallback data
- "❌ API Test FAILED" means API error

## Benefits of Real Data

- **Accurate Prices**: Real-time market data from multiple sources
- **Province-Specific**: Prices match the selected location
- **Offline Support**: Cached data works without internet
- **Multiple Sources**: Fallback ensures data availability
- **Regular Updates**: Automatic refresh keeps data current

## Troubleshooting

### No Price Data Showing
1. Check if API keys are correctly set
2. Verify internet connection
3. Check browser console for API errors
4. Try refreshing the page

### Wrong Province Prices
1. Ensure location is properly set in Weather page
2. Check if province extraction is working
3. Verify cache is cleared if needed

### API Rate Limits
1. Some APIs have rate limits
2. App automatically tries multiple sources
3. Fallback data ensures app continues working

## Support

For API setup issues:
1. Check the browser console for detailed error messages
2. Verify API keys are valid and active
3. Ensure environment variables are properly set
4. Check API service status pages
