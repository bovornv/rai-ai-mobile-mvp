// Storage data types for the Rai AI mobile app

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    description: string;
    icon: string;
    lastUpdated: string;
  };
  forecast: Array<{
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    humidity: number;
    windSpeed: number;
    pressure: number;
    description: string;
    icon: string;
    sprayWindow: 'good' | 'caution' | 'dont';
    sprayReason?: string;
  }>;
  location: {
    name: string;
    subdistrict: string;
    province: string;
    lat: number;
    lng: number;
  };
  lastUpdated: string;
}

export interface PriceData {
  rice: {
    price: number;
    unit: string;
    currency: string;
    lastUpdated: string;
    source: string;
  };
  durian: {
    price: number;
    unit: string;
    currency: string;
    lastUpdated: string;
    source: string;
  };
  lastUpdated: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  subdistrict: string;
  province: string;
  address: string;
  accuracy?: number;
  timestamp: string;
}

export interface AppSettings {
  language: 'th' | 'en';
  offlineMode: boolean;
  notifications: {
    weather: boolean;
    price: boolean;
    scan: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  lastSync: string;
  version: string;
}

export interface CacheMetadata {
  key: string;
  timestamp: string;
  expiresAt: string;
  size: number;
  version: string;
}

export interface StorageStats {
  totalSize: number;
  itemCount: number;
  lastCleanup: string;
  cacheHitRate: number;
}

// Storage keys enum for type safety
export enum StorageKeys {
  // Core data
  WEATHER_DATA = 'weather_data',
  PRICE_DATA = 'price_data',
  FIELD_DATA = 'field_data',
  SCAN_DATA = 'scan_data',
  
  // Location data
  CURRENT_LOCATION = 'current_location',
  WEATHER_LOCATION = 'weather_location',
  FIELD_LOCATION = 'field_location',
  
  // App settings
  APP_SETTINGS = 'app_settings',
  LANGUAGE = 'language',
  THEME = 'theme',
  OFFLINE_MODE = 'offline_mode',
  
  // Cache metadata
  CACHE_METADATA = 'cache_metadata',
  LAST_SYNC = 'last_sync',
  STORAGE_STATS = 'storage_stats',
  
  // User preferences
  USER_PREFERENCES = 'user_preferences',
  NOTIFICATION_SETTINGS = 'notification_settings',
  
  // Temporary data
  TEMP_DATA = 'temp_data',
  UPLOAD_QUEUE = 'upload_queue',
  SYNC_QUEUE = 'sync_queue',
}

// Storage operation result types
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface StorageBatchResult {
  success: boolean;
  results: Array<{
    key: string;
    success: boolean;
    error?: string;
  }>;
  timestamp: string;
}

// Storage configuration
export interface StorageConfig {
  maxCacheSize: number; // in bytes
  defaultTTL: number; // in milliseconds
  enableCompression: boolean;
  enableEncryption: boolean;
  backupEnabled: boolean;
  syncEnabled: boolean;
}

// Default storage configuration
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  enableCompression: true,
  enableEncryption: false, // Enable in production
  backupEnabled: true,
  syncEnabled: true,
};
