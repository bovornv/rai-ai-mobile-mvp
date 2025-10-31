// Enhanced Storage Service with TypeScript types and advanced features
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  WeatherData,
  PriceData,
  LocationData,
  AppSettings,
  CacheMetadata,
  StorageStats,
  StorageKeys,
  StorageResult,
  StorageBatchResult,
  StorageConfig,
  DEFAULT_STORAGE_CONFIG,
} from '../types/Storage';
import { Field } from '../types/Field';
import { ScanEntry, ScanState } from '../types/ScanEntry';

// Web-compatible storage helper with enhanced features
const getStorage = () => {
  if (Platform.OS === 'web') {
    return {
      setItem: async (key: string, value: string): Promise<void> => {
        try {
          localStorage.setItem(key, value);
          // Update cache metadata
          await updateCacheMetadata(key, value.length);
        } catch (error) {
          throw new Error(`Failed to set item ${key}: ${error}`);
        }
      },
      getItem: async (key: string): Promise<string | null> => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            // Update access time in metadata
            await updateAccessTime(key);
          }
          return value;
        } catch (error) {
          throw new Error(`Failed to get item ${key}: ${error}`);
        }
      },
      removeItem: async (key: string): Promise<void> => {
        try {
          localStorage.removeItem(key);
          // Remove from cache metadata
          await removeCacheMetadata(key);
        } catch (error) {
          throw new Error(`Failed to remove item ${key}: ${error}`);
        }
      },
      multiGet: async (keys: string[]): Promise<Array<[string, string | null]>> => {
        try {
          return keys.map(key => [key, localStorage.getItem(key)]);
        } catch (error) {
          throw new Error(`Failed to get multiple items: ${error}`);
        }
      },
      multiSet: async (keyValuePairs: Array<[string, string]>): Promise<void> => {
        try {
          keyValuePairs.forEach(([key, value]) => {
            localStorage.setItem(key, value);
            updateCacheMetadata(key, value.length);
          });
        } catch (error) {
          throw new Error(`Failed to set multiple items: ${error}`);
        }
      },
      multiRemove: async (keys: string[]): Promise<void> => {
        try {
          keys.forEach(key => {
            localStorage.removeItem(key);
            removeCacheMetadata(key);
          });
        } catch (error) {
          throw new Error(`Failed to remove multiple items: ${error}`);
        }
      },
      getAllKeys: async (): Promise<string[]> => {
        try {
          return Object.keys(localStorage);
        } catch (error) {
          throw new Error(`Failed to get all keys: ${error}`);
        }
      },
      clear: async (): Promise<void> => {
        try {
          localStorage.clear();
          // Clear cache metadata
          localStorage.removeItem(StorageKeys.CACHE_METADATA);
        } catch (error) {
          throw new Error(`Failed to clear storage: ${error}`);
        }
      },
    };
  }
  return AsyncStorage;
};

// Cache metadata management
const updateCacheMetadata = async (key: string, size: number): Promise<void> => {
  try {
    const metadata = await getCacheMetadata();
    metadata[key] = {
      key,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + DEFAULT_STORAGE_CONFIG.defaultTTL).toISOString(),
      size,
      version: '1.0.0',
    };
    await getStorage().setItem(StorageKeys.CACHE_METADATA, JSON.stringify(metadata));
  } catch (error) {
    console.warn('Failed to update cache metadata:', error);
  }
};

const updateAccessTime = async (key: string): Promise<void> => {
  try {
    const metadata = await getCacheMetadata();
    if (metadata[key]) {
      metadata[key].timestamp = new Date().toISOString();
      await getStorage().setItem(StorageKeys.CACHE_METADATA, JSON.stringify(metadata));
    }
  } catch (error) {
    console.warn('Failed to update access time:', error);
  }
};

const removeCacheMetadata = async (key: string): Promise<void> => {
  try {
    const metadata = await getCacheMetadata();
    delete metadata[key];
    await getStorage().setItem(StorageKeys.CACHE_METADATA, JSON.stringify(metadata));
  } catch (error) {
    console.warn('Failed to remove cache metadata:', error);
  }
};

const getCacheMetadata = async (): Promise<Record<string, CacheMetadata>> => {
  try {
    const data = await getStorage().getItem(StorageKeys.CACHE_METADATA);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn('Failed to get cache metadata:', error);
    return {};
  }
};

export class EnhancedStorageService {
  private static storage = getStorage();
  private static config: StorageConfig = DEFAULT_STORAGE_CONFIG;

  // Configuration management
  static setConfig(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): StorageConfig {
    return { ...this.config };
  }

  // Generic typed storage methods
  static async setItem<T>(key: StorageKeys, value: T): Promise<StorageResult<T>> {
    try {
      const serialized = JSON.stringify(value);
      await this.storage.setItem(key, serialized);
      return {
        success: true,
        data: value,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async getItem<T>(key: StorageKeys): Promise<StorageResult<T>> {
    try {
      const data = await this.storage.getItem(key);
      if (data === null) {
        return {
          success: true,
          data: undefined,
          timestamp: new Date().toISOString(),
        };
      }
      const parsed = JSON.parse(data);
      return {
        success: true,
        data: parsed,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async removeItem(key: StorageKeys): Promise<StorageResult> {
    try {
      await this.storage.removeItem(key);
      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Batch operations
  static async setMultiple<T>(items: Array<{ key: StorageKeys; value: T }>): Promise<StorageBatchResult> {
    try {
      const keyValuePairs: Array<[string, string]> = items.map(({ key, value }) => [
        key,
        JSON.stringify(value),
      ]);
      await this.storage.multiSet(keyValuePairs);
      
      return {
        success: true,
        results: items.map(({ key }) => ({ key, success: true })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        results: items.map(({ key }) => ({
          key,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })),
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async getMultiple<T>(keys: StorageKeys[]): Promise<Record<StorageKeys, T | null>> {
    try {
      const results = await this.storage.multiGet(keys);
      const data: Record<StorageKeys, T | null> = {} as Record<StorageKeys, T | null>;
      
      results.forEach(([key, value]) => {
        data[key as StorageKeys] = value ? JSON.parse(value) : null;
      });
      
      return data;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {} as Record<StorageKeys, T | null>;
    }
  }

  // Weather data methods
  static async saveWeatherData(data: WeatherData): Promise<StorageResult<WeatherData>> {
    return this.setItem(StorageKeys.WEATHER_DATA, data);
  }

  static async getWeatherData(): Promise<StorageResult<WeatherData>> {
    return this.getItem<WeatherData>(StorageKeys.WEATHER_DATA);
  }

  // Price data methods
  static async savePriceData(data: PriceData): Promise<StorageResult<PriceData>> {
    return this.setItem(StorageKeys.PRICE_DATA, data);
  }

  static async getPriceData(): Promise<StorageResult<PriceData>> {
    return this.getItem<PriceData>(StorageKeys.PRICE_DATA);
  }

  // Field data methods
  static async saveFieldData(data: Field): Promise<StorageResult<Field>> {
    return this.setItem(StorageKeys.FIELD_DATA, data);
  }

  static async getFieldData(): Promise<StorageResult<Field>> {
    return this.getItem<Field>(StorageKeys.FIELD_DATA);
  }

  // Scan data methods
  static async saveScanData(data: ScanState): Promise<StorageResult<ScanState>> {
    return this.setItem(StorageKeys.SCAN_DATA, data);
  }

  static async getScanData(): Promise<StorageResult<ScanState>> {
    return this.getItem<ScanState>(StorageKeys.SCAN_DATA);
  }

  // Location data methods
  static async saveCurrentLocation(data: LocationData): Promise<StorageResult<LocationData>> {
    return this.setItem(StorageKeys.CURRENT_LOCATION, data);
  }

  static async getCurrentLocation(): Promise<StorageResult<LocationData>> {
    return this.getItem<LocationData>(StorageKeys.CURRENT_LOCATION);
  }

  static async saveWeatherLocation(data: LocationData): Promise<StorageResult<LocationData>> {
    return this.setItem(StorageKeys.WEATHER_LOCATION, data);
  }

  static async getWeatherLocation(): Promise<StorageResult<LocationData>> {
    return this.getItem<LocationData>(StorageKeys.WEATHER_LOCATION);
  }

  // App settings methods
  static async saveAppSettings(data: AppSettings): Promise<StorageResult<AppSettings>> {
    return this.setItem(StorageKeys.APP_SETTINGS, data);
  }

  static async getAppSettings(): Promise<StorageResult<AppSettings>> {
    return this.getItem<AppSettings>(StorageKeys.APP_SETTINGS);
  }

  // Language preference (backward compatibility)
  static async saveLanguage(language: string): Promise<StorageResult<string>> {
    return this.setItem(StorageKeys.LANGUAGE, language);
  }

  static async getLanguage(): Promise<StorageResult<string>> {
    const result = await this.getItem<string>(StorageKeys.LANGUAGE);
    if (!result.success || !result.data) {
      return {
        success: true,
        data: 'th',
        timestamp: new Date().toISOString(),
      };
    }
    return result;
  }

  // Cache management
  static async cleanupExpiredCache(): Promise<StorageResult<number>> {
    try {
      const metadata = await getCacheMetadata();
      const now = new Date();
      const expiredKeys: string[] = [];

      for (const [key, meta] of Object.entries(metadata)) {
        if (new Date(meta.expiresAt) < now) {
          expiredKeys.push(key);
        }
      }

      if (expiredKeys.length > 0) {
        await this.storage.multiRemove(expiredKeys);
        // Remove from metadata
        expiredKeys.forEach(key => delete metadata[key]);
        await this.storage.setItem(StorageKeys.CACHE_METADATA, JSON.stringify(metadata));
      }

      return {
        success: true,
        data: expiredKeys.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async getStorageStats(): Promise<StorageResult<StorageStats>> {
    try {
      const metadata = await getCacheMetadata();
      const allKeys = await this.storage.getAllKeys();
      
      let totalSize = 0;
      let cacheHits = 0;
      const now = new Date();

      for (const [key, meta] of Object.entries(metadata)) {
        totalSize += meta.size;
        if (new Date(meta.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
          cacheHits++;
        }
      }

      const stats: StorageStats = {
        totalSize,
        itemCount: allKeys.length,
        lastCleanup: new Date().toISOString(),
        cacheHitRate: allKeys.length > 0 ? cacheHits / allKeys.length : 0,
      };

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Data migration and backup
  static async exportData(): Promise<StorageResult<Record<string, any>>> {
    try {
      const allKeys = await this.storage.getAllKeys();
      const data: Record<string, any> = {};

      for (const key of allKeys) {
        const value = await this.storage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async importData(data: Record<string, any>): Promise<StorageBatchResult> {
    try {
      const keyValuePairs: Array<[string, string]> = Object.entries(data).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);

      await this.storage.multiSet(keyValuePairs);

      return {
        success: true,
        results: Object.keys(data).map(key => ({ key, success: true })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        results: Object.keys(data).map(key => ({
          key,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Clear all data
  static async clearAllData(): Promise<StorageResult> {
    try {
      await this.storage.clear();
      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Health check
  static async healthCheck(): Promise<StorageResult<{ status: string; details: any }>> {
    try {
      const stats = await this.getStorageStats();
      const metadata = await getCacheMetadata();
      
      const health = {
        status: 'healthy',
        details: {
          storageStats: stats.data,
          cacheMetadata: Object.keys(metadata).length,
          platform: Platform.OS,
          config: this.config,
        },
      };

      return {
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
