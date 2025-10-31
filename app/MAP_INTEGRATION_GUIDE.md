# Map Integration Guide for Rai AI Mobile App

## Overview

The Rai AI mobile app now includes comprehensive real map integration for field location management. The system combines Google Maps and Mapbox services to provide accurate location selection, geocoding, and reverse geocoding capabilities.

## Supported Map Services

### 1. Google Maps Geocoding API
- **Provider**: Google Cloud Platform
- **API Key**: `AIzaSyA0c40zoJGzs-Eaq5Pn5a80KRDMsyU5d9k`
- **Features**: 
  - Geocoding (address to coordinates)
  - Reverse geocoding (coordinates to address)
  - Thai language support
  - High accuracy for Thai locations
- **Priority**: Primary service

### 2. Mapbox Public Token
- **Provider**: Mapbox
- **Token**: `pk.eyJ1IjoiYm92b3JuIiwiYSI6ImNtZjl3ZWY3dzA3Ym8ycm9lbTQzcmo5ankifQ.LvMa5fl8cpeXL8Za5Vroug`
- **Features**:
  - Geocoding and reverse geocoding
  - Map tiles and styling
  - Global coverage
- **Priority**: Secondary service

### 3. Mapbox Rai AI Secret Token
- **Provider**: Mapbox (Rai AI specific)
- **Token**: `pk.eyJ1IjoiYm92b3JuIiwiYSI6ImNtZjl6Mzg2MTBjamMya3FvcHN2eWlodDEifQ.SAxZlQ8LLiRlfpZk8UB-XA`
- **Features**:
  - Enhanced geocoding capabilities
  - Custom map styling
  - Higher rate limits
- **Priority**: Primary Mapbox service

## Architecture

### Core Services

#### 1. MapIntegrationService
- **File**: `app/src/services/MapIntegrationService.ts`
- **Purpose**: Unified interface for all map operations
- **Features**:
  - Automatic provider fallback (Google → Mapbox)
  - Current location detection
  - Geocoding and reverse geocoding
  - Distance calculations
  - Thailand bounds validation

#### 2. MapPicker Component
- **File**: `app/src/components/MapPicker.tsx`
- **Purpose**: User interface for location selection
- **Features**:
  - Current location detection
  - Address search functionality
  - Location preview and confirmation
  - Real-time geocoding
  - Accuracy display

### Data Flow

```
User Input → MapPicker → MapIntegrationService → API Provider → Response Processing → UI Update
```

## Key Features

### 1. Location Selection
- **Current Location**: Automatic GPS detection
- **Search**: Text-based location search
- **Validation**: Thailand bounds checking
- **Accuracy**: GPS accuracy display

### 2. Geocoding Services
- **Primary**: Google Maps Geocoding API
- **Fallback**: Mapbox Geocoding API
- **Language**: Thai language support
- **Format**: Standardized address components

### 3. Reverse Geocoding
- **Input**: Latitude and longitude coordinates
- **Output**: Formatted address with subdistrict and province
- **Fallback**: Multiple provider support
- **Error Handling**: Graceful degradation

### 4. Field Integration
- **Location Binding**: Link field to specific coordinates
- **Weather Integration**: Use field location for weather data
- **Validation**: Ensure location is within Thailand
- **Persistence**: Save location data locally

## Usage Examples

### Basic Location Selection

```typescript
import { MapIntegrationService } from './services/MapIntegrationService';

// Get current location
const location = await MapIntegrationService.getCurrentLocation();

// Search for location
const searchResult = await MapIntegrationService.geocodeAddress('บางใหญ่ นนทบุรี');

// Reverse geocode coordinates
const address = await MapIntegrationService.reverseGeocode(13.7563, 100.5018);
```

### MapPicker Component Usage

```typescript
import { MapPicker } from './components/MapPicker';

<MapPicker
  visible={showMapPicker}
  onClose={() => setShowMapPicker(false)}
  onLocationSelected={(location) => {
    console.log('Selected location:', location);
  }}
  initialLocation={currentLocation}
/>
```

### Field Location Management

```typescript
// In FieldsScreen
const handleLocationSelected = (location: MapLocation) => {
  setMapLocation(location);
  // Location is automatically used when saving field
};
```

## API Integration Details

### Google Maps Geocoding API

**Endpoint**: `https://maps.googleapis.com/maps/api/geocode/json`

**Request Parameters**:
- `latlng`: For reverse geocoding
- `address`: For geocoding
- `key`: API key
- `language`: `th` (Thai)
- `region`: `th` (Thailand)

**Response Processing**:
- Extract `address_components` for administrative levels
- Map to Thai subdistrict and province
- Handle multiple result formats

### Mapbox Geocoding API

**Endpoint**: `https://api.mapbox.com/geocoding/v5/mapbox.places/`

**Request Parameters**:
- Coordinates or address in URL path
- `access_token`: Mapbox token
- `language`: `th` (Thai)
- `country`: `TH` (Thailand)

**Response Processing**:
- Extract `context` array for administrative levels
- Map to Thai subdistrict and province
- Handle feature properties

## Error Handling

### 1. API Failures
- **Google Maps fails**: Automatically fallback to Mapbox
- **Mapbox fails**: Use cached or default location
- **Both fail**: Show error message with retry option

### 2. Network Issues
- **Timeout**: 10-second timeout for geolocation
- **Offline**: Use cached location data
- **Rate limiting**: Implement exponential backoff

### 3. Invalid Data
- **Invalid coordinates**: Validate Thailand bounds
- **Empty responses**: Provide default location
- **Malformed data**: Graceful error handling

## Performance Optimization

### 1. Caching
- **Location Cache**: Store recent locations locally
- **Search Cache**: Cache search results
- **API Response Cache**: Reduce redundant API calls

### 2. Network Optimization
- **Request Batching**: Combine multiple requests
- **Timeout Management**: Prevent hanging requests
- **Error Recovery**: Automatic retry with backoff

### 3. User Experience
- **Loading States**: Show progress indicators
- **Offline Support**: Work without internet
- **Real-time Updates**: Immediate feedback

## Security Considerations

### 1. API Key Protection
- **Client-side Keys**: Public keys for client-side usage
- **Rate Limiting**: Monitor API usage
- **Key Rotation**: Regular key updates

### 2. Data Privacy
- **Location Data**: No server-side storage
- **User Privacy**: Respect location permissions
- **Data Minimization**: Only collect necessary data

### 3. Input Validation
- **Coordinate Validation**: Check bounds and format
- **Address Sanitization**: Clean user input
- **SQL Injection Prevention**: Parameterized queries

## Testing

### 1. Unit Tests
```typescript
// Test geocoding functionality
describe('MapIntegrationService', () => {
  it('should geocode address correctly', async () => {
    const result = await MapIntegrationService.geocodeAddress('บางใหญ่ นนทบุรี');
    expect(result).toBeDefined();
    expect(result?.subdistrict).toBe('บางใหญ่');
    expect(result?.province).toBe('นนทบุรี');
  });
});
```

### 2. Integration Tests
- Test API provider fallback
- Test error handling scenarios
- Test offline functionality

### 3. User Acceptance Tests
- Test location selection flow
- Test search functionality
- Test accuracy and performance

## Troubleshooting

### Common Issues

1. **"Unable to get current location"**
   - Check browser geolocation permissions
   - Verify HTTPS connection
   - Check device GPS settings

2. **"Location not found"**
   - Verify search query format
   - Check API key validity
   - Try alternative search terms

3. **"API error"**
   - Check API key configuration
   - Verify network connectivity
   - Check rate limiting

### Debug Mode

Enable detailed logging:

```typescript
// In development
console.log('Map Service Status:', MapIntegrationService.getMapConfig());
console.log('Current Location:', await MapIntegrationService.getCurrentLocation());
```

## Future Enhancements

### Planned Features

1. **Interactive Map**: Full map interface with markers
2. **Offline Maps**: Download map tiles for offline use
3. **Route Planning**: Navigation between field locations
4. **Satellite Imagery**: Aerial view of fields
5. **Field Boundaries**: Draw custom field areas

### Integration Opportunities

1. **Weather Integration**: Link to weather stations
2. **Soil Data**: Integrate soil type information
3. **Crop Monitoring**: Satellite imagery analysis
4. **Market Access**: Distance to markets
5. **Transportation**: Route optimization

## Support

For technical support or questions about map integration:

- **Email**: support@raiai.app
- **LINE OA**: @raiai
- **Documentation**: This guide and inline code comments

## License

This map integration follows the same license as the main Rai AI mobile app. Please ensure compliance with Google Maps and Mapbox terms of service.
