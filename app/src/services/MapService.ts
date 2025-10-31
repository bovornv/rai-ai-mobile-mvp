// Map service using Mapbox
import { API_KEYS, API_ENDPOINTS } from '../config/apiKeys';

export interface MapLocation {
  lat: number;
  lng: number;
  subdistrict: string;
  province: string;
  address: string;
}

export class MapService {
  private static readonly ACCESS_TOKEN = API_KEYS.MAPBOX_RAI_AI;
  private static readonly BASE_URL = API_ENDPOINTS.MAPBOX;

  static async reverseGeocode(lat: number, lng: number): Promise<MapLocation> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.ACCESS_TOKEN}&language=th&country=TH`
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
          address: feature.place_name || `${lat}, ${lng}`
        };
      } else {
        throw new Error('No location data found');
      }
    } catch (error) {
      console.error('Error reverse geocoding with Mapbox:', error);
      throw error;
    }
  }

  static async geocodeAddress(address: string): Promise<MapLocation | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.ACCESS_TOKEN}&language=th&country=TH&limit=1`
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
          address: feature.place_name
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error geocoding address with Mapbox:', error);
      return null;
    }
  }

  static getMapboxStyleUrl(): string {
    return `mapbox://styles/mapbox/streets-v11?access_token=${this.ACCESS_TOKEN}`;
  }

  static getMapboxAccessToken(): string {
    return this.ACCESS_TOKEN;
  }
}
