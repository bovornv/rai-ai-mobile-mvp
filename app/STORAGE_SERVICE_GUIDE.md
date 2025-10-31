# Storage Service Guide for Rai AI Mobile App

## Overview

The Rai AI mobile app now includes a comprehensive storage service with proper TypeScript types, data migration, and advanced features for handling real data types. The service provides both backward compatibility and enhanced functionality.

## Architecture

### Core Services

#### 1. StorageService (Legacy)
- **File**: `app/src/services/storage.ts`
- **Purpose**: Backward-compatible storage with typed data
- **Features**: Basic CRUD operations with proper TypeScript types

#### 2. EnhancedStorageService (Advanced)
- **File**: `app/src/services/EnhancedStorageService.ts`
- **Purpose**: Advanced storage with caching, metadata, and batch operations
- **Features**: 
  - Cache management with TTL
  - Storage statistics and health monitoring
  - Batch operations
  - Data export/import
  - Compression and encryption support

#### 3. StorageMigrationService (Data Management)
- **File**: `app/src/services/StorageMigrationService.ts`
- **Purpose**: Handle data versioning and migration
- **Features**:
  - Automatic data migration between versions
  - Backup and restore functionality
  - Data integrity checks
  - Version management

### Data Types

#### 1. Core Data Types
- **WeatherData**: Current weather and 7-day forecast
- **PriceData**: Agricultural commodity prices
- **LocationData**: GPS coordinates with address information
- **AppSettings**: User preferences and app configuration

#### 2. Domain-Specific Types
- **Field**: Farm field information
- **ScanState**: Plant disease scan results
- **CacheMetadata**: Storage cache information
- **StorageStats**: Storage usage statistics

## Usage Examples

### Basic Storage Operations

```typescript
import { StorageService } from './services/storage';

// Save weather data
const weatherData: WeatherData = {
  current: { /* ... */ },
  forecast: [ /* ... */ ],
  location: { /* ... */ },
  lastUpdated: new Date().toISOString(),
};
await StorageService.saveWeatherData(weatherData);

// Retrieve weather data
const weather = await StorageService.getWeatherData();
if (weather) {
  console.log('Current temperature:', weather.current.temperature);
}
```

### Enhanced Storage Operations

```typescript
import { EnhancedStorageService } from './services/EnhancedStorageService';

// Save with result handling
const result = await EnhancedStorageService.saveWeatherData(weatherData);
if (result.success) {
  console.log('Data saved successfully');
} else {
  console.error('Save failed:', result.error);
}

// Batch operations
const items = [
  { key: StorageKeys.WEATHER_DATA, value: weatherData },
  { key: StorageKeys.PRICE_DATA, value: priceData },
];
const batchResult = await EnhancedStorageService.setMultiple(items);
```

### Data Migration

```typescript
import { StorageMigrationService } from './services/StorageMigrationService';

// Initialize with migration
const migrationResult = await StorageMigrationService.initialize();
if (migrationResult.success) {
  console.log('Migration completed:', migrationResult.migratedItems);
} else {
  console.error('Migration failed:', migrationResult.errors);
}

// Check storage health
const health = await StorageMigrationService.getHealthStatus();
console.log('Storage version:', health.version);
console.log('Data integrity:', health.dataIntegrity);
```

## Data Type Definitions

### WeatherData

```typescript
interface WeatherData {
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
    temperature: { min: number; max: number };
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
```

### PriceData

```typescript
interface PriceData {
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
```

### LocationData

```typescript
interface LocationData {
  lat: number;
  lng: number;
  subdistrict: string;
  province: string;
  address: string;
  accuracy?: number;
  timestamp: string;
}
```

## Storage Keys

### Core Data Keys
- `WEATHER_DATA`: Weather information
- `PRICE_DATA`: Agricultural prices
- `FIELD_DATA`: Farm field data
- `SCAN_DATA`: Plant disease scan results

### Location Keys
- `CURRENT_LOCATION`: Device GPS location
- `WEATHER_LOCATION`: Weather-specific location
- `FIELD_LOCATION`: Field-specific location

### Settings Keys
- `APP_SETTINGS`: Application settings
- `LANGUAGE`: User language preference
- `THEME`: UI theme preference

## Advanced Features

### 1. Cache Management

```typescript
// Configure cache settings
EnhancedStorageService.setConfig({
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  enableCompression: true,
  enableEncryption: false,
});

// Cleanup expired cache
const cleanupResult = await EnhancedStorageService.cleanupExpiredCache();
console.log('Cleaned up items:', cleanupResult.data);
```

### 2. Storage Statistics

```typescript
// Get storage statistics
const stats = await EnhancedStorageService.getStorageStats();
console.log('Total size:', stats.data?.totalSize);
console.log('Item count:', stats.data?.itemCount);
console.log('Cache hit rate:', stats.data?.cacheHitRate);
```

### 3. Data Export/Import

```typescript
// Export all data
const exportResult = await EnhancedStorageService.exportData();
if (exportResult.success) {
  // Save to file or send to server
  const backupData = exportResult.data;
}

// Import data
const importResult = await EnhancedStorageService.importData(backupData);
if (importResult.success) {
  console.log('Data restored successfully');
}
```

### 4. Health Monitoring

```typescript
// Check storage health
const health = await EnhancedStorageService.healthCheck();
console.log('Storage status:', health.data?.status);
console.log('Platform:', health.data?.details.platform);
```

## Migration Guide

### From Version 1.x to 2.0

The storage service automatically migrates data from version 1.x to 2.0:

1. **Weather Data**: Converts array format to structured format
2. **Price Data**: Adds currency and source information
3. **Location Data**: Converts string locations to structured data
4. **Field Data**: Ensures all required fields are present
5. **Scan Data**: Normalizes scan result structure

### Manual Migration

```typescript
// Initialize migration
const migration = await StorageMigrationService.initialize();

// Check migration status
if (migration.success) {
  console.log('Migration completed successfully');
  console.log('Migrated items:', migration.migratedItems);
} else {
  console.error('Migration failed:', migration.errors);
}
```

## Error Handling

### Storage Errors

```typescript
try {
  const result = await StorageService.saveWeatherData(weatherData);
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Storage error:', error.message);
  }
  // Handle error
}
```

### Migration Errors

```typescript
const migration = await StorageMigrationService.initialize();
if (!migration.success) {
  console.error('Migration errors:', migration.errors);
  // Handle migration failure
}
```

## Performance Optimization

### 1. Batch Operations

```typescript
// Use batch operations for multiple items
const items = [
  { key: StorageKeys.WEATHER_DATA, value: weatherData },
  { key: StorageKeys.PRICE_DATA, value: priceData },
];
await EnhancedStorageService.setMultiple(items);
```

### 2. Cache Management

```typescript
// Regular cache cleanup
setInterval(async () => {
  await EnhancedStorageService.cleanupExpiredCache();
}, 60 * 60 * 1000); // Every hour
```

### 3. Data Compression

```typescript
// Enable compression for large data
EnhancedStorageService.setConfig({
  enableCompression: true,
  maxCacheSize: 100 * 1024 * 1024, // 100MB
});
```

## Security Considerations

### 1. Data Encryption

```typescript
// Enable encryption for sensitive data
EnhancedStorageService.setConfig({
  enableEncryption: true,
});
```

### 2. Data Validation

```typescript
// Validate data before saving
const isValid = validateWeatherData(weatherData);
if (isValid) {
  await StorageService.saveWeatherData(weatherData);
} else {
  throw new Error('Invalid weather data');
}
```

### 3. Access Control

```typescript
// Implement access control for sensitive operations
if (userHasPermission('admin')) {
  await StorageMigrationService.resetStorage();
}
```

## Testing

### Unit Tests

```typescript
describe('StorageService', () => {
  it('should save and retrieve weather data', async () => {
    const weatherData: WeatherData = { /* ... */ };
    await StorageService.saveWeatherData(weatherData);
    const retrieved = await StorageService.getWeatherData();
    expect(retrieved).toEqual(weatherData);
  });
});
```

### Integration Tests

```typescript
describe('StorageMigrationService', () => {
  it('should migrate data from v1 to v2', async () => {
    // Setup old data format
    // Run migration
    // Verify new format
  });
});
```

## Troubleshooting

### Common Issues

1. **"Storage quota exceeded"**
   - Clean up expired cache
   - Reduce cache size limit
   - Remove unused data

2. **"Data migration failed"**
   - Check data integrity
   - Verify version compatibility
   - Reset storage if necessary

3. **"Type error in storage"**
   - Verify data types match interfaces
   - Check migration status
   - Update type definitions

### Debug Mode

```typescript
// Enable debug logging
console.log('Storage health:', await StorageMigrationService.getHealthStatus());
console.log('Storage stats:', await EnhancedStorageService.getStorageStats());
```

## Future Enhancements

### Planned Features

1. **Cloud Sync**: Automatic data synchronization
2. **Conflict Resolution**: Handle data conflicts
3. **Data Analytics**: Usage patterns and insights
4. **Advanced Encryption**: End-to-end encryption
5. **Data Compression**: Advanced compression algorithms

### Integration Opportunities

1. **Backup Services**: Cloud backup integration
2. **Analytics**: Data usage analytics
3. **Monitoring**: Real-time storage monitoring
4. **Optimization**: Automatic performance optimization

## Support

For technical support or questions about storage service:

- **Email**: support@raiai.app
- **LINE OA**: @raiai
- **Documentation**: This guide and inline code comments

## License

This storage service follows the same license as the main Rai AI mobile app.
