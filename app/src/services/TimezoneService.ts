// Timezone service for location-based timezone handling
export interface TimezoneData {
  timezone: string;
  offset: number; // in minutes
  country: string;
  region: string;
}

export class TimezoneService {
  private static readonly API_KEY = 'YOUR_TIMEZONE_API_KEY'; // You'll need to get this from a timezone API service
  private static readonly BASE_URL = 'http://api.timezonedb.com/v2.1/get-time-zone';

  // Get timezone information for given coordinates
  static async getTimezone(lat: number, lng: number): Promise<TimezoneData> {
    try {
      // Using a free timezone API (you can replace with a more reliable one)
      const response = await fetch(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=${this.API_KEY}&format=json&by=position&lat=${lat}&lng=${lng}`
      );
      
      if (!response.ok) {
        throw new Error(`Timezone API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        timezone: data.zoneName,
        offset: data.gmtOffset,
        country: data.countryName,
        region: data.regionName
      };
    } catch (error) {
      console.error('Error fetching timezone:', error);
      // Fallback to UTC+7 (Thailand timezone) for Thai locations
      return this.getFallbackTimezone(lat, lng);
    }
  }

  // Fallback timezone based on coordinates (simple approximation)
  static getFallbackTimezone(lat: number, lng: number): TimezoneData {
    // Thailand is roughly between 97-106°E, 5-20°N
    if (lng >= 97 && lng <= 106 && lat >= 5 && lat <= 20) {
      return {
        timezone: 'Asia/Bangkok',
        offset: 420, // UTC+7 in minutes
        country: 'Thailand',
        region: 'Southeast Asia'
      };
    }
    
    // Default to UTC+7 for Thai agricultural app
    return {
      timezone: 'Asia/Bangkok',
      offset: 420,
      country: 'Thailand',
      region: 'Southeast Asia'
    };
  }

  // Convert UTC date to location timezone
  static convertToLocationTimezone(date: Date, timezoneData: TimezoneData): Date {
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const locationTime = new Date(utcTime + (timezoneData.offset * 60000));
    return locationTime;
  }

  // Get current date in location timezone
  static getCurrentDateInTimezone(timezoneData: TimezoneData): Date {
    const now = new Date();
    return this.convertToLocationTimezone(now, timezoneData);
  }

  // Get start of day in location timezone
  static getStartOfDayInTimezone(timezoneData: TimezoneData): Date {
    const locationNow = this.getCurrentDateInTimezone(timezoneData);
    const startOfDay = new Date(locationNow);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  // Format date string for location timezone (YYYY-MM-DD)
  static getDateStringInTimezone(timezoneData: TimezoneData): string {
    const locationNow = this.getCurrentDateInTimezone(timezoneData);
    return locationNow.toISOString().split('T')[0];
  }

  // Check if a date is today in location timezone
  static isTodayInTimezone(dateString: string, timezoneData: TimezoneData): boolean {
    const locationToday = this.getDateStringInTimezone(timezoneData);
    return dateString === locationToday;
  }

  // Check if a date is tomorrow in location timezone
  static isTomorrowInTimezone(dateString: string, timezoneData: TimezoneData): boolean {
    const locationNow = this.getCurrentDateInTimezone(timezoneData);
    const tomorrow = new Date(locationNow);
    tomorrow.setDate(locationNow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    return dateString === tomorrowString;
  }

  // Generate 7-day forecast dates starting from today in location timezone
  static generateForecastDates(timezoneData: TimezoneData): string[] {
    const today = this.getStartOfDayInTimezone(timezoneData);
    const dates: string[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }
}
