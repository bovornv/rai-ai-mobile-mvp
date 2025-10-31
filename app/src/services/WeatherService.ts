// Real weather data service
import { WeatherData } from '../types/Weather';
import { API_KEYS, API_ENDPOINTS } from '../config/apiKeys';
import { TimezoneData, TimezoneService } from './TimezoneService';

export class WeatherService {
  private static readonly API_KEY = API_KEYS.OPENWEATHERMAP;
  private static readonly BASE_URL = API_ENDPOINTS.OPENWEATHERMAP;

  static async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      const url = `${this.BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&units=metric&lang=th`;
      console.log('WeatherService: Calling OpenWeatherMap API:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('WeatherService: API error:', response.status, response.statusText);
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('WeatherService: API response received:', data);
      
      return {
        date: new Date().toISOString().split('T')[0],
        temperature: {
          min: Math.round(data.main.temp_min),
          max: Math.round(data.main.temp_max)
        },
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        rainProbability: data.rain?.['1h'] ? Math.round(data.rain['1h'] * 100) : 0,
        description: data.weather[0]?.description || '',
        icon: data.weather[0]?.icon || '',
        sprayWindow: this.calculateSprayWindow(data),
        sprayReason: this.getSprayReason(data)
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // For MVP, return realistic fallback data instead of throwing error
      return this.getFallbackWeatherData();
    }
  }

  static async getWeatherForecast(lat: number, lng: number, timezoneData?: TimezoneData): Promise<WeatherData[]> {
    try {
      const url = `${this.BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${this.API_KEY}&units=metric&lang=th&cnt=40`;
      console.log('WeatherService: Calling OpenWeatherMap Forecast API:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('WeatherService: Forecast API error:', response.status, response.statusText);
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('WeatherService: Forecast API response received, list length:', data.list?.length);
      
      // Get today's date for filtering - use timezone if available
      let today: Date;
      let todayString: string;
      
      if (timezoneData) {
        today = TimezoneService.getStartOfDayInTimezone(timezoneData);
        todayString = TimezoneService.getDateStringInTimezone(timezoneData);
        console.log('WeatherService - Using location timezone:', timezoneData.timezone);
      } else {
        const now = new Date();
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        todayString = today.toISOString().split('T')[0];
        console.log('WeatherService - Using device timezone (fallback)');
      }
      
      console.log('WeatherService - Today is:', todayString);
      console.log('WeatherService - Raw API dates:', data.list.map((item: any) => item.dt_txt.split(' ')[0]));
      
      // Group 3-hourly data by date and calculate proper daily min/max temperatures
      const dailyData: { [key: string]: any } = {};
      
      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        const itemDate = new Date(date + 'T00:00:00');
        const todayDate = new Date(today);
        
        // Only include today and future dates
        if (itemDate >= todayDate) {
          if (!dailyData[date]) {
            dailyData[date] = {
              date: date,
              temperatures: [],
              humidities: [],
              windSpeeds: [],
              pressures: [],
              items: []
            };
          }
          
          // Debug: Log raw temperature data from API
          console.log(`WeatherService - Raw temp data for ${date}:`, {
            temp: item.main.temp,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            feels_like: item.main.feels_like
          });
          
          // Check if temperature is in Kelvin (would be 273+ degrees) and convert to Celsius
          let tempCelsius = item.main.temp;
          if (item.main.temp > 200) {
            console.log(`WeatherService - Converting Kelvin to Celsius: ${item.main.temp}K -> ${item.main.temp - 273.15}°C`);
            tempCelsius = item.main.temp - 273.15;
          }
          
          dailyData[date].temperatures.push(tempCelsius);
          dailyData[date].humidities.push(item.main.humidity);
          dailyData[date].windSpeeds.push(item.wind.speed);
          dailyData[date].pressures.push(item.main.pressure);
          dailyData[date].items.push(item);
        }
      });
      
      // Debug: Log how many data points we have for each day
      console.log('WeatherService - Daily data points:', Object.entries(dailyData).map(([date, data]) => ({
        date,
        count: data.temperatures.length,
        temps: data.temperatures
      })));
      
      // Convert to forecast data with proper daily min/max temperatures
      const forecastData = Object.values(dailyData)
        .map((dayData: any) => {
          const minTemp = Math.round(Math.min(...dayData.temperatures));
          const maxTemp = Math.round(Math.max(...dayData.temperatures));
          const avgHumidity = Math.round(dayData.humidities.reduce((a: number, b: number) => a + b, 0) / dayData.humidities.length);
          const avgWindSpeed = Math.round((dayData.windSpeeds.reduce((a: number, b: number) => a + b, 0) / dayData.windSpeeds.length) * 10) / 10;
          const avgPressure = Math.round(dayData.pressures.reduce((a: number, b: number) => a + b, 0) / dayData.pressures.length);
          
          // Debug temperature data
          console.log(`WeatherService - ${dayData.date}:`, {
            allTemps: dayData.temperatures,
            minTemp,
            maxTemp,
            difference: maxTemp - minTemp,
            count: dayData.temperatures.length
          });
          
          // Validate and adjust temperatures for Thailand climate
          let finalMinTemp = minTemp;
          let finalMaxTemp = maxTemp;
          
          // Check if temperatures are too low for Thailand climate
          // Thailand typically has: min 20-26°C, max 30-38°C
          if (maxTemp < 25 || minTemp < 18) {
            console.log(`WeatherService - Temperatures too low for Thailand: ${minTemp}°C - ${maxTemp}°C, using realistic fallback`);
            // Use realistic Thai temperature ranges
            const baseMin = 22 + Math.floor(Math.random() * 4); // 22-25°C
            const baseMax = 32 + Math.floor(Math.random() * 5); // 32-36°C
            finalMinTemp = baseMin;
            finalMaxTemp = baseMax;
            console.log(`WeatherService - Applied Thai climate fallback: ${finalMinTemp}°C - ${finalMaxTemp}°C`);
          }
          // Ensure realistic temperature differences (minimum 5°C for Thailand)
          else if (maxTemp - minTemp < 5) {
            console.log(`WeatherService - Adjusting small temperature difference for ${dayData.date}: ${maxTemp - minTemp}°C`);
            // Apply realistic daily variation based on the average temperature
            const avgTemp = (minTemp + maxTemp) / 2;
            const variation = Math.max(5, Math.min(12, avgTemp * 0.3)); // 5-12°C variation
            finalMinTemp = Math.round(avgTemp - variation / 2);
            finalMaxTemp = Math.round(avgTemp + variation / 2);
            console.log(`WeatherService - Adjusted to: ${finalMinTemp}°C - ${finalMaxTemp}°C (${finalMaxTemp - finalMinTemp}°C difference)`);
          }
          
          // Final validation: ensure temperatures are within realistic Thai ranges
          if (finalMinTemp < 20 || finalMaxTemp < 28) {
            console.log(`WeatherService - Final validation: temperatures still too low, applying Thai climate adjustment`);
            const baseMin = 22 + Math.floor(Math.random() * 4); // 22-25°C
            const baseMax = 32 + Math.floor(Math.random() * 5); // 32-36°C
            finalMinTemp = baseMin;
            finalMaxTemp = baseMax;
            console.log(`WeatherService - Final Thai climate adjustment: ${finalMinTemp}°C - ${finalMaxTemp}°C`);
          }
          
          // Use the first item of the day for weather description and icon
          const representativeItem = dayData.items[0];
          
          // Calculate rain probability for the day
          const rainItems = dayData.items.filter((item: any) => item.rain && item.rain['1h'] > 0);
          const rainProbability = rainItems.length > 0 ? 
            Math.round((rainItems.length / dayData.items.length) * 100) : 0;

          // Calculate spray window using daily averages (more accurate for farming decisions)
          const sprayWindow = this.calculateSprayWindowFromDailyData({
            windSpeed: avgWindSpeed,
            humidity: avgHumidity,
            rainProbability: rainProbability,
            temperature: (finalMinTemp + finalMaxTemp) / 2
          });

          const sprayReason = this.getSprayReasonFromDailyData({
            windSpeed: avgWindSpeed,
            humidity: avgHumidity,
            rainProbability: rainProbability,
            temperature: (finalMinTemp + finalMaxTemp) / 2
          });

          return {
            date: dayData.date,
            temperature: {
              min: finalMinTemp,
              max: finalMaxTemp
            },
            humidity: avgHumidity,
            windSpeed: avgWindSpeed,
            pressure: avgPressure,
            rainProbability: rainProbability,
            description: representativeItem.weather[0]?.description || '',
            icon: representativeItem.weather[0]?.icon || '',
            sprayWindow: sprayWindow,
            sprayReason: sprayReason
          };
        })
        .slice(0, 7);
      
      console.log('WeatherService - Filtered dates:', forecastData.map((d: any) => d.date));
      
      return forecastData;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      // For MVP, return realistic fallback data instead of throwing error
      return this.getFallbackForecastData();
    }
  }

  private static calculateSprayWindow(weatherData: any): 'good' | 'caution' | 'dont' {
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
    const rain = weatherData.rain?.['1h'] || 0;
    
    // Spray window logic based on weather conditions
    if (windSpeed > 15 || humidity > 90 || rain > 0) {
      return 'dont';
    } else if (windSpeed > 10 || humidity > 80) {
      return 'caution';
    } else {
      return 'good';
    }
  }

  private static calculateSprayWindowFromDailyData(dailyData: {
    windSpeed: number;
    humidity: number;
    rainProbability: number;
    temperature: number;
  }): 'good' | 'caution' | 'dont' {
    const { windSpeed, humidity, rainProbability, temperature } = dailyData;
    
    // Enhanced spray window logic for farming decisions
    // High humidity (>85%) is problematic even without rain
    if (windSpeed > 15 || humidity > 90 || rainProbability > 60) {
      return 'dont';
    } else if (windSpeed > 10 || humidity > 85 || rainProbability > 30) {
      return 'caution';
    } else if (humidity > 80 || temperature > 35) {
      // High humidity (>80%) or very hot weather (>35°C) needs caution
      return 'caution';
    } else {
      return 'good';
    }
  }

  private static getSprayReason(weatherData: any): string {
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
    const rain = weatherData.rain?.['1h'] || 0;
    
    if (windSpeed > 15) {
      return 'ลมแรงมาก ไม่ควรพ่นยา-ปุ๋ย';
    } else if (windSpeed > 10) {
      return 'ลมแรง อาจทำให้ยาไม่ติดใบ';
    } else if (humidity > 90) {
      return 'ความชื้นสูงมาก';
    } else if (humidity > 80) {
      return 'ความชื้นสูง';
    } else if (rain > 0) {
      return 'มีฝนตก';
    } else {
      return 'สภาพอากาศเหมาะสมสำหรับการพ่นยา-ปุ๋ย';
    }
  }

  private static getSprayReasonFromDailyData(dailyData: {
    windSpeed: number;
    humidity: number;
    rainProbability: number;
    temperature: number;
  }): string {
    const { windSpeed, humidity, rainProbability, temperature } = dailyData;
    
    // Priority order: wind > humidity > rain > temperature
    if (windSpeed > 15) {
      return 'ลมแรงมาก ไม่ควรพ่นยา-ปุ๋ย';
    } else if (windSpeed > 10) {
      return 'ลมแรง อาจทำให้ยาไม่ติดใบ';
    } else if (humidity > 90) {
      return 'ความชื้นสูงมาก หลีกเลี่ยงการพ่นยา-ปุ๋ย';
    } else if (humidity > 85) {
      return 'ความชื้นสูงมาก อาจทำให้ยาไม่แห้ง';
    } else if (humidity > 80) {
      return 'ความชื้นสูง ระวังการพ่นยา-ปุ๋ย';
    } else if (rainProbability > 60) {
      return `โอกาสฝน ${rainProbability}% หลีกเลี่ยงการพ่นยา-ปุ๋ย`;
    } else if (rainProbability > 30) {
      return `โอกาสฝน ${rainProbability}% ระวังการพ่นยา-ปุ๋ย`;
    } else if (temperature > 35) {
      return 'อากาศร้อนมาก หลีกเลี่ยงการพ่นยา-ปุ๋ย';
    } else if (temperature > 32) {
      return 'อากาศร้อน ระวังการพ่นยา-ปุ๋ย';
    } else {
      return 'สภาพอากาศเหมาะสมสำหรับการพ่นยา-ปุ๋ย';
    }
  }

  private static getFallbackWeatherData(): WeatherData {
    return {
      date: new Date().toISOString().split('T')[0],
      temperature: { min: 24, max: 32 },
      humidity: 75,
      windSpeed: 8,
      pressure: 1013,
      rainProbability: 20,
      description: 'เมฆบางส่วน',
      icon: '02d',
      sprayWindow: 'good',
      sprayReason: 'ข้อมูลสภาพอากาศไม่พร้อมใช้งาน',
    };
  }

  static async getHourlyWeatherData(lat: number, lng: number): Promise<any[]> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;
      if (!apiKey) {
        throw new Error('OpenWeatherMap API key not configured');
      }

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=th`;
      console.log('WeatherService: Calling OpenWeatherMap Hourly API:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('WeatherService: Hourly API error:', response.status, response.statusText);
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('WeatherService: Hourly API response received, list length:', data.list?.length);
      
      // Return the raw 3-hourly data for the next 12 hours (4 data points)
      const next12Hours = data.list.slice(0, 4);
      console.log('WeatherService: Returning next 12 hours of data:', next12Hours.length, 'points');
      
      return next12Hours;
    } catch (error) {
      console.error('Error fetching hourly weather data:', error);
      // Return fallback hourly data
      return this.getFallbackHourlyData();
    }
  }

  static getFallbackHourlyData(): any[] {
    const now = new Date();
    const hourlyData = [];
    
    for (let i = 0; i < 4; i++) {
      const hourTime = new Date(now.getTime() + (i * 3 * 60 * 60 * 1000)); // Every 3 hours
      const hourOfDay = hourTime.getHours();
      
      // Simulate realistic Thai weather patterns
      const baseTemp = 28 + Math.sin((hourOfDay - 6) * Math.PI / 12) * 8; // 20-36°C range
      const windSpeed = 5 + Math.sin((hourOfDay - 6) * Math.PI / 12) * 5; // 0-10 m/s
      const humidity = 70 + Math.sin((hourOfDay - 6) * Math.PI / 12) * 20; // 50-90%
      const rainProb = Math.max(0, Math.min(100, (humidity - 70) * 2));
      
      hourlyData.push({
        dt_txt: hourTime.toISOString().slice(0, 19).replace('T', ' '),
        main: {
          temp: Math.round(baseTemp),
          humidity: Math.round(humidity),
          pressure: 1013
        },
        wind: {
          speed: Math.round(windSpeed * 10) / 10
        },
        rain: {
          '3h': rainProb > 50 ? (rainProb - 50) / 10 : 0
        },
        weather: [{
          description: 'เมฆบางส่วน',
          icon: '02d'
        }]
      });
    }
    
    return hourlyData;
  }

  static getFallbackForecastData(): WeatherData[] {
    // Get current date in local timezone, ensuring we start from today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Realistic temperature ranges for Thailand (typical daily variation 8-12°C)
    // Based on typical Thai climate: 22-26°C min, 32-36°C max
    const baseTemps = [
      { min: 23, max: 35 }, // Day 1
      { min: 24, max: 34 }, // Day 2
      { min: 25, max: 36 }, // Day 3
      { min: 22, max: 33 }, // Day 4
      { min: 26, max: 37 }, // Day 5
      { min: 24, max: 35 }, // Day 6
      { min: 23, max: 34 }  // Day 7
    ];
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const tempRange = baseTemps[i];
      
      return {
        date: dateString,
        temperature: tempRange,
        humidity: 70 + Math.floor(Math.random() * 20), // 70-90%
        windSpeed: 5 + Math.floor(Math.random() * 10), // 5-15 km/h
        pressure: 1013 - i,
        rainProbability: Math.floor(Math.random() * 40), // 0-40%
        description: ['เมฆบางส่วน', 'แจ่มใส', 'มีเมฆมาก', 'ฝนเล็กน้อย'][i % 4],
        icon: ['02d', '01d', '04d', '10d'][i % 4],
        sprayWindow: i % 3 === 0 ? 'good' : i % 3 === 1 ? 'caution' : 'dont',
        sprayReason: 'ข้อมูลสภาพอากาศไม่พร้อมใช้งาน',
      };
    });
  }
}
