import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { WeatherData, PriceData, LocationData, AppSettings } from '../types/Storage';
import { Field } from '../types/Field';
import { ScanState } from '../types/ScanEntry';

// Web-compatible storage helper
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      },
      getItem: (key: string) => {
        try {
          const value = localStorage.getItem(key);
          return Promise.resolve(value);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      multiRemove: (keys: string[]) => {
        try {
          keys.forEach(key => localStorage.removeItem(key));
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      }
    };
  }
  return AsyncStorage;
};

const STORAGE_KEYS = {
  WEATHER_DATA: 'weather_data',
  PRICE_DATA: 'price_data',
  FIELD_DATA: 'field_data',
  SCAN_RESULT: 'scan_result',
  LANGUAGE: 'language',
  LAST_SYNC: 'last_sync',
  WEATHER_LOCATION: 'weather_location',
  CURRENT_LOCATION: 'current_location',
  APP_SETTINGS: 'app_settings',
} as const;

export class StorageService {
  private static storage = getStorage();

  // Weather data
  static async saveWeatherData(data: WeatherData): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.WEATHER_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving weather data:', error);
      throw error;
    }
  }

  static async getWeatherData(): Promise<WeatherData | null> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.WEATHER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting weather data:', error);
      return null;
    }
  }

  // Price data
  static async savePriceData(data: PriceData): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.PRICE_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving price data:', error);
      throw error;
    }
  }

  static async getPriceData(): Promise<PriceData | null> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.PRICE_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting price data:', error);
      return null;
    }
  }

  // Field data
  static async saveFieldData(data: Field): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.FIELD_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving field data:', error);
      throw error;
    }
  }

  static async getFieldData(): Promise<Field | null> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.FIELD_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting field data:', error);
      return null;
    }
  }

  // Scan data
  static async saveScanData(data: ScanState): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.SCAN_RESULT, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving scan data:', error);
      throw error;
    }
  }

  static async getScanData(): Promise<ScanState | null> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.SCAN_RESULT);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting scan data:', error);
      return null;
    }
  }

  // Backward compatibility
  static async saveScanResult(data: any): Promise<void> {
    return this.saveScanData(data);
  }

  static async getScanResult(): Promise<any | null> {
    return this.getScanData();
  }

  // Language preference
  static async saveLanguage(language: string): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }

  static async getLanguage(): Promise<string> {
    try {
      const language = await this.storage.getItem(STORAGE_KEYS.LANGUAGE);
      return language || 'th';
    } catch (error) {
      console.error('Error getting language:', error);
      return 'th';
    }
  }

  // Last sync time
  static async saveLastSync(timestamp: string): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error saving last sync:', error);
    }
  }

  static async getLastSync(): Promise<string | null> {
    try {
      return await this.storage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  // Weather location
  static async saveWeatherLocation(location: LocationData): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.WEATHER_LOCATION, JSON.stringify(location));
    } catch (error) {
      console.error('Error saving weather location:', error);
      throw error;
    }
  }

  static async getWeatherLocation(): Promise<LocationData | null> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.WEATHER_LOCATION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting weather location:', error);
      return null;
    }
  }

  // Current location
  static async saveCurrentLocation(location: LocationData): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify(location));
    } catch (error) {
      console.error('Error saving current location:', error);
      throw error;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // App settings
  static async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await this.storage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
      throw error;
    }
  }

  static async getAppSettings(): Promise<AppSettings | null> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting app settings:', error);
      return null;
    }
  }

  // Generic storage methods
  static async saveItem(key: string, value: string): Promise<void> {
    try {
      await this.storage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving item ${key}:`, error);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      return await this.storage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await this.storage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}
