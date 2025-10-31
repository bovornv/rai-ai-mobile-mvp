// Real location data service
import { API_KEYS, API_ENDPOINTS } from '../config/apiKeys';

export interface LocationData {
  lat: number;
  lng: number;
  subdistrict: string;
  province: string;
  address: string;
}

export class LocationService {
  static async getCurrentLocation(): Promise<LocationData> {
    console.log('LocationService.getCurrentLocation called');
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser');
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      console.log('Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Got GPS position:', position.coords);
            const { latitude, longitude } = position.coords;
            console.log('Coordinates:', latitude, longitude);
            
            const addressData = await this.reverseGeocode(latitude, longitude);
            console.log('Reverse geocoded address:', addressData);
            
            const result = {
              lat: latitude,
              lng: longitude,
              subdistrict: addressData.subdistrict,
              province: addressData.province,
              address: addressData.address
            };
            
            console.log('Final location data:', result);
            resolve(result);
          } catch (error) {
            console.error('Error getting location data:', error);
            reject(error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // Convert geolocation error codes to meaningful messages
          let errorMessage = 'Unknown geolocation error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permission denied - user denied location access';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position unavailable - location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout - location request timed out';
              break;
            default:
              errorMessage = `Unknown error (code: ${error.code})`;
              break;
          }
          
          console.error('Converted error message:', errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  static async reverseGeocode(lat: number, lng: number): Promise<{ subdistrict: string; province: string; address: string }> {
    try {
      // Try Google Maps Geocoding API first (more accurate for Thailand)
      try {
        const googleResponse = await fetch(
          `${API_ENDPOINTS.GOOGLE_MAPS}/geocode/json?latlng=${lat},${lng}&key=${API_KEYS.GOOGLE_MAPS}&language=th`
        );
        
        if (googleResponse.ok) {
          const data = await googleResponse.json();
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const addressComponents = result.address_components;
            
            let subdistrict = 'ไม่ระบุ';
            let province = 'ไม่ระบุ';
            
            for (const component of addressComponents) {
              if (component.types.includes('sublocality') || component.types.includes('administrative_area_level_3')) {
                subdistrict = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                province = component.long_name;
              }
            }
            
            return {
              subdistrict,
              province,
              address: result.formatted_address || `${lat}, ${lng}`
            };
          }
        }
      } catch (googleError) {
        console.log('Google Maps API failed, trying fallback:', googleError);
      }
      
      // Fallback to OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `${API_ENDPOINTS.NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=th`
      );
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.address) {
        return {
          subdistrict: data.address.suburb || data.address.village || data.address.town || 'ไม่ระบุ',
          province: data.address.state || data.address.province || 'ไม่ระบุ',
          address: data.display_name || `${lat}, ${lng}`
        };
      } else {
        throw new Error('No address data found');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Return fallback data
      return {
        subdistrict: 'ไม่ระบุ',
        province: 'ไม่ระบุ',
        address: `${lat}, ${lng}`
      };
    }
  }

  static async geocodeAddress(address: string): Promise<LocationData | null> {
    try {
      // Try Google Maps Geocoding API first
      try {
        const googleResponse = await fetch(
          `${API_ENDPOINTS.GOOGLE_MAPS}/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEYS.GOOGLE_MAPS}&language=th`
        );
        
        if (googleResponse.ok) {
          const data = await googleResponse.json();
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const location = result.geometry.location;
            const addressComponents = result.address_components;
            
            let subdistrict = 'ไม่ระบุ';
            let province = 'ไม่ระบุ';
            
            for (const component of addressComponents) {
              if (component.types.includes('sublocality') || component.types.includes('administrative_area_level_3')) {
                subdistrict = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                province = component.long_name;
              }
            }
            
            return {
              lat: location.lat,
              lng: location.lng,
              subdistrict,
              province,
              address: result.formatted_address
            };
          }
        }
      } catch (googleError) {
        console.log('Google Maps API failed, trying fallback:', googleError);
      }
      
      // Fallback to OpenStreetMap Nominatim API
      const response = await fetch(
        `${API_ENDPOINTS.NOMINATIM}/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&accept-language=th&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          subdistrict: result.address.suburb || result.address.village || result.address.town || 'ไม่ระบุ',
          province: result.address.state || result.address.province || 'ไม่ระบุ',
          address: result.display_name
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  static getFallbackLocation(): LocationData {
    return {
      lat: 14.9799, // Nakhon Ratchasima coordinates
      lng: 102.0978,
      subdistrict: 'ตาจั่น',
      province: 'นครราชสีมา',
      address: 'ต.ตาจั่น จ.นครราชสีมา'
    };
  }
}
