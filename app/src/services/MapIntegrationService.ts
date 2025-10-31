// Comprehensive Map Integration Service
import { API_KEYS, API_ENDPOINTS } from '../config/apiKeys';

export interface MapLocation {
  lat: number;
  lng: number;
  subdistrict: string;
  province: string;
  address: string;
  accuracy?: number;
}

export interface MapPickerResult {
  location: MapLocation;
  confirmed: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export class MapIntegrationService {
  private static readonly GOOGLE_API_KEY = API_KEYS.GOOGLE_MAPS;
  private static readonly MAPBOX_PUBLIC_TOKEN = API_KEYS.MAPBOX_PUBLIC;
  private static readonly MAPBOX_RAI_AI_TOKEN = API_KEYS.MAPBOX_RAI_AI;

  // Get current location using browser geolocation
  static async getCurrentLocation(): Promise<MapLocation> {
    console.log('MapIntegrationService: getCurrentLocation called');
    
    // For development/localhost, use a mock location
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost') ||
         window.location.protocol === 'http:')) {
      console.log('MapIntegrationService: Using mock location for development');
      console.log('MapIntegrationService: Hostname:', window.location.hostname);
      console.log('MapIntegrationService: Protocol:', window.location.protocol);
      const mockLocation: MapLocation = {
        lat: 13.7563,
        lng: 100.5018,
        subdistrict: 'บางปะกง',
        province: 'ฉะเชิงเทรา',
        address: 'ตำบลบางปะกง อำเภอบางปะกง จังหวัดฉะเชิงเทรา',
        accuracy: 10
      };
      return Promise.resolve(mockLocation);
    }
    
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('MapIntegrationService: Geolocation not supported');
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      console.log('MapIntegrationService: Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('MapIntegrationService: Got GPS position:', position.coords);
            const { latitude, longitude, accuracy } = position.coords;
            console.log('MapIntegrationService: Coordinates:', latitude, longitude);
            
            const location = await this.reverseGeocode(latitude, longitude);
            console.log('MapIntegrationService: Reverse geocoded:', location);
            location.accuracy = accuracy;
            resolve(location);
          } catch (error) {
            console.error('MapIntegrationService: Error in position callback:', error);
            reject(error);
          }
        },
        (error) => {
          console.error('MapIntegrationService: Geolocation error:', error);
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Reverse geocode coordinates to address (Google Maps primary, Mapbox fallback)
  static async reverseGeocode(lat: number, lng: number): Promise<MapLocation> {
    try {
      // Try Google Maps first
      const googleResult = await this.reverseGeocodeGoogle(lat, lng);
      if (googleResult) {
        return googleResult;
      }
    } catch (error) {
      console.warn('Google reverse geocoding failed, trying Mapbox:', error);
    }

    try {
      // Fallback to Mapbox
      const mapboxResult = await this.reverseGeocodeMapbox(lat, lng);
      if (mapboxResult) {
        return mapboxResult;
      }
    } catch (error) {
      console.warn('Mapbox reverse geocoding failed:', error);
    }

    // Final fallback
    return {
      lat,
      lng,
      subdistrict: 'ไม่ระบุ',
      province: 'ไม่ระบุ',
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    };
  }

  // Geocode address to coordinates (Google Maps primary, Mapbox fallback)
  static async geocodeAddress(address: string): Promise<MapLocation | null> {
    try {
      // Try Google Maps first
      const googleResult = await this.geocodeAddressGoogle(address);
      if (googleResult) {
        return googleResult;
      }
    } catch (error) {
      console.warn('Google geocoding failed, trying Mapbox:', error);
    }

    try {
      // Fallback to Mapbox
      const mapboxResult = await this.geocodeAddressMapbox(address);
      if (mapboxResult) {
        return mapboxResult;
      }
    } catch (error) {
      console.warn('Mapbox geocoding failed:', error);
    }

    return null;
  }

  // Google Maps reverse geocoding
  private static async reverseGeocodeGoogle(lat: number, lng: number): Promise<MapLocation | null> {
    const response = await fetch(
      `${API_ENDPOINTS.GOOGLE_MAPS}/geocode/json?latlng=${lat},${lng}&key=${this.GOOGLE_API_KEY}&language=th&region=th`
    );

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.address_components || [];
      
      let subdistrict = 'ไม่ระบุ';
      let province = 'ไม่ระบุ';
      
      // Parse Google Maps address components for Thai administrative levels
      for (const component of components) {
        if (component.types.includes('sublocality_level_1') || 
            component.types.includes('administrative_area_level_3')) {
          subdistrict = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          province = component.long_name;
        }
      }

      return {
        lat,
        lng,
        subdistrict,
        province,
        address: result.formatted_address,
      };
    }

    return null;
  }

  // Google Maps geocoding
  private static async geocodeAddressGoogle(address: string): Promise<MapLocation | null> {
    const response = await fetch(
      `${API_ENDPOINTS.GOOGLE_MAPS}/geocode/json?address=${encodeURIComponent(address)}&key=${this.GOOGLE_API_KEY}&language=th&region=th`
    );

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      const components = result.address_components || [];
      
      let subdistrict = 'ไม่ระบุ';
      let province = 'ไม่ระบุ';
      
      // Parse Google Maps address components
      for (const component of components) {
        if (component.types.includes('sublocality_level_1') || 
            component.types.includes('administrative_area_level_3')) {
          subdistrict = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          province = component.long_name;
        }
      }

      return {
        lat: location.lat,
        lng: location.lng,
        subdistrict,
        province,
        address: result.formatted_address,
      };
    }

    return null;
  }

  // Mapbox reverse geocoding
  private static async reverseGeocodeMapbox(lat: number, lng: number): Promise<MapLocation | null> {
    const response = await fetch(
      `${API_ENDPOINTS.MAPBOX}/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.MAPBOX_RAI_AI_TOKEN}&language=th&country=TH`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const context = feature.context || [];
      
      let subdistrict = 'ไม่ระบุ';
      let province = 'ไม่ระบุ';
      
      // Parse Mapbox context for Thai administrative levels
      for (const item of context) {
        if (item.id.startsWith('place.') && item.text) {
          subdistrict = item.text;
        } else if (item.id.startsWith('region.') && item.text) {
          province = item.text;
        }
      }

      return {
        lat,
        lng,
        subdistrict,
        province,
        address: feature.place_name || `${lat}, ${lng}`,
      };
    }

    return null;
  }

  // Mapbox geocoding
  private static async geocodeAddressMapbox(address: string): Promise<MapLocation | null> {
    const response = await fetch(
      `${API_ENDPOINTS.MAPBOX}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.MAPBOX_RAI_AI_TOKEN}&language=th&country=TH&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const coordinates = feature.center;
      const context = feature.context || [];
      
      let subdistrict = 'ไม่ระบุ';
      let province = 'ไม่ระบุ';
      
      // Parse Mapbox context for Thai administrative levels
      for (const item of context) {
        if (item.id.startsWith('place.') && item.text) {
          subdistrict = item.text;
        } else if (item.id.startsWith('region.') && item.text) {
          province = item.text;
        }
      }

      return {
        lat: coordinates[1],
        lng: coordinates[0],
        subdistrict,
        province,
        address: feature.place_name,
      };
    }

    return null;
  }

  // Get map configuration for different providers
  static getMapConfig(provider: 'google' | 'mapbox' = 'mapbox') {
    if (provider === 'google') {
      return {
        apiKey: this.GOOGLE_API_KEY,
        center: { lat: 13.7563, lng: 100.5018 }, // Bangkok
        zoom: 10,
        mapTypeId: 'roadmap',
      };
    } else {
      return {
        accessToken: this.MAPBOX_RAI_AI_TOKEN,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [100.5018, 13.7563], // Bangkok [lng, lat]
        zoom: 10,
      };
    }
  }

  // Calculate distance between two points (in kilometers)
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get bounds for a set of locations
  static getBounds(locations: MapLocation[]): MapBounds {
    if (locations.length === 0) {
      return {
        north: 13.7563,
        south: 13.7563,
        east: 100.5018,
        west: 100.5018,
      };
    }

    let north = locations[0].lat;
    let south = locations[0].lat;
    let east = locations[0].lng;
    let west = locations[0].lng;

    for (const location of locations) {
      north = Math.max(north, location.lat);
      south = Math.min(south, location.lat);
      east = Math.max(east, location.lng);
      west = Math.min(west, location.lng);
    }

    return { north, south, east, west };
  }

  // Validate if coordinates are within Thailand bounds
  static isWithinThailand(lat: number, lng: number): boolean {
    // Thailand approximate bounds
    const bounds = {
      north: 20.4648,
      south: 5.6108,
      east: 105.6390,
      west: 97.3434,
    };

    return lat >= bounds.south && lat <= bounds.north &&
           lng >= bounds.west && lng <= bounds.east;
  }

  // Format location for display
  static formatLocation(location: MapLocation): string {
    if (location.subdistrict !== 'ไม่ระบุ' && location.province !== 'ไม่ระบุ') {
      return `${location.subdistrict}, ${location.province}`;
    }
    return location.address;
  }

  // Get map URL for external viewing
  static getMapUrl(location: MapLocation, provider: 'google' | 'mapbox' = 'google'): string {
    if (provider === 'google') {
      return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    } else {
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${location.lng},${location.lat})/${location.lng},${location.lat},10,0/600x400@2x?access_token=${this.MAPBOX_RAI_AI_TOKEN}`;
    }
  }
}
