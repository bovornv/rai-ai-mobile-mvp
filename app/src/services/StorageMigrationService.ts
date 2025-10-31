// Storage Migration Service for handling data versioning and migration
import { StorageService } from './storage';
import { EnhancedStorageService } from './EnhancedStorageService';
import { WeatherData, PriceData, LocationData, AppSettings } from '../types/Storage';
import { Field } from '../types/Field';
import { ScanState } from '../types/ScanEntry';

export interface MigrationResult {
  success: boolean;
  migratedItems: string[];
  errors: string[];
  version: string;
}

export interface DataVersion {
  version: string;
  timestamp: string;
  items: string[];
}

export class StorageMigrationService {
  private static readonly CURRENT_VERSION = '2.0.0';
  private static readonly VERSION_KEY = 'storage_version';

  // Initialize storage with version check
  static async initialize(): Promise<MigrationResult> {
    try {
      const currentVersion = await this.getCurrentVersion();
      
      if (!currentVersion) {
        // First time setup
        await this.setVersion(this.CURRENT_VERSION);
        return {
          success: true,
          migratedItems: [],
          errors: [],
          version: this.CURRENT_VERSION,
        };
      }

      if (currentVersion === this.CURRENT_VERSION) {
        // Already up to date
        return {
          success: true,
          migratedItems: [],
          errors: [],
          version: this.CURRENT_VERSION,
        };
      }

      // Perform migration
      return await this.migrateFromVersion(currentVersion);
    } catch (error) {
      return {
        success: false,
        migratedItems: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        version: this.CURRENT_VERSION,
      };
    }
  }

  // Get current storage version
  private static async getCurrentVersion(): Promise<string | null> {
    try {
      return await StorageService.getItem(this.VERSION_KEY);
    } catch (error) {
      console.warn('Error getting storage version:', error);
      return null;
    }
  }

  // Set storage version
  private static async setVersion(version: string): Promise<void> {
    try {
      await StorageService.saveItem(this.VERSION_KEY, version);
    } catch (error) {
      console.error('Error setting storage version:', error);
      throw error;
    }
  }

  // Migrate from specific version
  private static async migrateFromVersion(fromVersion: string): Promise<MigrationResult> {
    const migratedItems: string[] = [];
    const errors: string[] = [];

    try {
      // Migrate from version 1.x.x to 2.0.0
      if (fromVersion.startsWith('1.')) {
        await this.migrateFromV1();
        migratedItems.push('weather_data', 'price_data', 'field_data', 'scan_data');
      }

      // Set new version
      await this.setVersion(this.CURRENT_VERSION);

      return {
        success: true,
        migratedItems,
        errors,
        version: this.CURRENT_VERSION,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        migratedItems,
        errors,
        version: this.CURRENT_VERSION,
      };
    }
  }

  // Migrate from version 1.x.x
  private static async migrateFromV1(): Promise<void> {
    try {
      // Migrate weather data
      const oldWeatherData = await StorageService.getWeatherData();
      if (oldWeatherData) {
        const newWeatherData = this.migrateWeatherData(oldWeatherData);
        await StorageService.saveWeatherData(newWeatherData);
      }

      // Migrate price data
      const oldPriceData = await StorageService.getPriceData();
      if (oldPriceData) {
        const newPriceData = this.migratePriceData(oldPriceData);
        await StorageService.savePriceData(newPriceData);
      }

      // Migrate field data
      const oldFieldData = await StorageService.getFieldData();
      if (oldFieldData) {
        const newFieldData = this.migrateFieldData(oldFieldData);
        await StorageService.saveFieldData(newFieldData);
      }

      // Migrate scan data
      const oldScanData = await StorageService.getScanData();
      if (oldScanData) {
        const newScanData = this.migrateScanData(oldScanData);
        await StorageService.saveScanData(newScanData);
      }

      // Migrate weather location (string to LocationData)
      const oldWeatherLocation = await StorageService.getItem('weather_location');
      if (oldWeatherLocation && typeof oldWeatherLocation === 'string') {
        const newLocationData: LocationData = {
          lat: 0,
          lng: 0,
          subdistrict: 'ไม่ระบุ',
          province: 'ไม่ระบุ',
          address: oldWeatherLocation,
          timestamp: new Date().toISOString(),
        };
        await StorageService.saveWeatherLocation(newLocationData);
      }

    } catch (error) {
      console.error('Error migrating from v1:', error);
      throw error;
    }
  }

  // Migrate weather data structure
  private static migrateWeatherData(oldData: any): WeatherData {
    // Handle old weather data format and convert to new format
    if (Array.isArray(oldData)) {
      // Old format was an array of daily data
      const latest = oldData[oldData.length - 1] || {};
      return {
        current: {
          temperature: latest.temperature?.max || 0,
          humidity: latest.humidity || 0,
          windSpeed: latest.windSpeed || 0,
          pressure: latest.pressure || 0,
          description: 'Unknown',
          icon: '01d',
          lastUpdated: new Date().toISOString(),
        },
        forecast: oldData.map((day: any) => ({
          date: day.date || new Date().toISOString().split('T')[0],
          temperature: {
            min: day.temperature?.min || 0,
            max: day.temperature?.max || 0,
          },
          humidity: day.humidity || 0,
          windSpeed: day.windSpeed || 0,
          pressure: day.pressure || 0,
          description: 'Unknown',
          icon: '01d',
          sprayWindow: day.sprayWindow || 'good',
          sprayReason: day.sprayReason,
        })),
        location: {
          name: 'Unknown Location',
          subdistrict: 'ไม่ระบุ',
          province: 'ไม่ระบุ',
          lat: 0,
          lng: 0,
        },
        lastUpdated: new Date().toISOString(),
      };
    }

    // If already in new format, return as is
    return oldData as WeatherData;
  }

  // Migrate price data structure
  private static migratePriceData(oldData: any): PriceData {
    // Handle old price data format
    if (oldData.rice && oldData.durian) {
      return {
        rice: {
          price: oldData.rice.price || 0,
          unit: oldData.rice.unit || 'บาท/กิโลกรัม',
          currency: 'THB',
          lastUpdated: oldData.rice.lastUpdated || new Date().toISOString(),
          source: 'Unknown',
        },
        durian: {
          price: oldData.durian.price || 0,
          unit: oldData.durian.unit || 'บาท/กิโลกรัม',
          currency: 'THB',
          lastUpdated: oldData.durian.lastUpdated || new Date().toISOString(),
          source: 'Unknown',
        },
        lastUpdated: new Date().toISOString(),
      };
    }

    // If already in new format, return as is
    return oldData as PriceData;
  }

  // Migrate field data structure
  private static migrateFieldData(oldData: any): Field {
    // Handle old field data format
    if (oldData && typeof oldData === 'object') {
      return {
        id: oldData.id || 'my-field',
        name: oldData.name || 'Unknown Field',
        crop: oldData.crop || 'rice',
        areaRai: oldData.areaRai || 0,
        plantedAt: oldData.plantedAt || new Date().toISOString().split('T')[0],
        status: oldData.status || 'preplant',
        location: oldData.location || null,
        useForWeather: oldData.useForWeather || false,
      };
    }

    // If already in new format, return as is
    return oldData as Field;
  }

  // Migrate scan data structure
  private static migrateScanData(oldData: any): ScanState {
    // Handle old scan data format
    if (oldData && typeof oldData === 'object') {
      return {
        today: oldData.today || oldData, // Handle both old and new formats
      };
    }

    // If already in new format, return as is
    return oldData as ScanState;
  }

  // Backup current data
  static async backupData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const data = await EnhancedStorageService.exportData();
      return {
        success: data.success,
        data: data.data,
        error: data.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Restore data from backup
  static async restoreData(backupData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await EnhancedStorageService.importData(backupData);
      return {
        success: result.success,
        error: result.success ? undefined : 'Failed to restore data',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Clear all data and reset to initial state
  static async resetStorage(): Promise<{ success: boolean; error?: string }> {
    try {
      await StorageService.clearAllData();
      await this.setVersion(this.CURRENT_VERSION);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get storage health status
  static async getHealthStatus(): Promise<{
    version: string;
    isUpToDate: boolean;
    dataIntegrity: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let dataIntegrity = true;

    try {
      const version = await this.getCurrentVersion();
      const isUpToDate = version === this.CURRENT_VERSION;

      // Check data integrity
      try {
        await StorageService.getWeatherData();
        await StorageService.getPriceData();
        await StorageService.getFieldData();
        await StorageService.getScanData();
      } catch (error) {
        dataIntegrity = false;
        errors.push('Data integrity check failed');
      }

      return {
        version: version || 'unknown',
        isUpToDate,
        dataIntegrity,
        errors,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        version: 'unknown',
        isUpToDate: false,
        dataIntegrity: false,
        errors,
      };
    }
  }
}
