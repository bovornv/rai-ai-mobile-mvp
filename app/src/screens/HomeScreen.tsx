import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SprayWindow } from '../components/SprayWindow';
import { PriceCard } from '../components/PriceCard';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';
import { WeatherService } from '../services/WeatherService';
import { useVarietyPrices } from '../hooks/useVarietyPrices';
import { formatLastUpdated } from '../services/VarietyPriceService';
import { StorageService } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SprayWindowService, SprayWindowResult } from '../services/SprayWindowService';
import { formatThaiTime } from '../utils/dateTH';

interface NavigationProp {
  navigate: (screen: string) => void;
}

interface HomeScreenProps {
  navigation: NavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sprayWindowData, setSprayWindowData] = useState<SprayWindowResult | null>(null);
  const [sprayWindowLoading, setSprayWindowLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<'rice' | 'durian'>('rice');

  // Basic spray recommendation function
  const getBasicSprayRecommendation = (): SprayWindowResult => {
    return {
      status: 'good',
      reasonTH: 'อากาศดี เหมาะสำหรับพ่นยา-ปุ๋ย',
      reasonEN: 'Good weather, suitable for spraying',
      bestTH: '06:00–09:00 น.',
      updatedAt: new Date().toISOString(),
      icon: '☀️',
      factor: 'อากาศดี'
    };
  };
  
  // Extract province from location for price data
  const getProvinceFromLocation = (location: string | null | undefined): string | undefined => {
    if (!location || typeof location !== 'string') return undefined;
    
    try {
    // Try comma format first (e.g., "ต.ตาจั่น, จ.นครราชสีมา" -> "นครราชสีมา")
      const commaParts = location.split(',');
      if (commaParts && commaParts.length >= 2) {
        const parts = commaParts.map(part => part.trim());
      const provincePart = parts[1];
        if (provincePart && typeof provincePart === 'string') {
      const province = provincePart.replace(/^(จ\.|จังหวัด)/, '');
      return province;
        }
      }
      
      // Try space format
      const spaceParts = location.split(' ');
      if (spaceParts && spaceParts.length >= 2) {
        const parts = spaceParts.filter(part => part && part.trim());
        const provincePart = parts.find((part: string) => part && (part.startsWith('จ.') || part.startsWith('จังหวัด')));
        if (provincePart && typeof provincePart === 'string') {
        const province = provincePart.replace(/^(จ\.|จังหวัด)/, '');
        return province;
        }
      }
    } catch (error) {
      console.error('Error extracting province:', error);
    }
    
    return undefined;
  };

  const selectedProvince = getProvinceFromLocation(location);
  
  // Use the variety-based DIT price hook with selected province
  const { data: priceData, loading: priceLoading, error: priceError, refresh: refreshPrices, isOffline } = useVarietyPrices(selectedProvince);

  const loadLocationFromStorage = async () => {
    try {
      // Prefer Weather page selection
      const last = await AsyncStorage.getItem('weather:last');
      if (last) {
        try {
          const parsed = JSON.parse(last);
          if (parsed?.point?.label) {
            setLocation(parsed.point.label);
            return;
          }
        } catch {}
      }
      const locationData = await StorageService.getCurrentLocation();
      if (locationData?.address) setLocation(locationData.address);
      else setLocation('ต.เทพาลัย อ.คง จ.นครราชสีมา');
    } catch (error) {
      console.error('Error loading location:', error);
      setLocation('ต.เทพาลัย อ.คง จ.นครราชสีมา');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load location
      await loadLocationFromStorage();

      // Prefer Weather page's cached 5-day forecast for consistency
      try {
        const last = await AsyncStorage.getItem('weather:last');
        if (last) {
          const parsed = JSON.parse(last);
          const today = Array.isArray(parsed?.forecast) ? parsed.forecast[0] : null;
          if (today && typeof today.rainProb === 'number' && typeof today.wind === 'number') {
            const rec = (() => {
              if (today.rainProb < 35 && today.wind <= 15) {
                return { status: 'good' as const, reasonTH: 'เช้า (06:00–09:00)', reasonEN: 'Morning (06–09)' };
              }
              if (today.rainProb < 35 && today.wind <= 18) {
                return { status: 'good' as const, reasonTH: 'บ่าย (15:00–17:00)', reasonEN: 'Afternoon (15–17)' };
              }
              return { status: 'dont' as const, reasonTH: 'วันนี้ไม่แนะนำ', reasonEN: 'Not recommended today' };
            })();
            setSprayWindowData({
              status: rec.status,
              reasonTH: rec.reasonTH,
              reasonEN: rec.reasonEN,
              bestTH: rec.reasonTH,
              updatedAt: new Date().toISOString(),
              icon: today.rainProb >= 40 ? '🌧️' : (today.rainProb >= 15 ? '🌦️' : '☀️'),
              factor: 'forecast'
            });
          }
        }
      } catch (e) {
        console.error('Weather cache parse error:', e);
      }
      
      // Load weather data if location is available
      try {
        const locationData = await StorageService.getCurrentLocation();
        if (locationData?.lat && locationData?.lng) {
          const weather = await WeatherService.getCurrentWeather(locationData.lat, locationData.lng);
          setWeatherData(weather);
          try {
            setLastUpdated(new Date().toLocaleString('th-TH'));
          } catch (error) {
            setLastUpdated(formatThaiTime(new Date()));
          }
          
          // Update spray window based on weather
          try {
            const sprayResult = getBasicSprayRecommendation();
            if (weather.sprayWindow) {
              sprayResult.status = weather.sprayWindow;
              sprayResult.reasonTH = weather.sprayReason || sprayResult.reasonTH;
            }
            setSprayWindowData(sprayResult);
          } catch (error) {
            console.error('Error setting spray window:', error);
            setSprayWindowData(getBasicSprayRecommendation());
        }
      } else {
          setSprayWindowData(getBasicSprayRecommendation());
        }
      } catch (error) {
        console.error('Error loading weather:', error);
        setSprayWindowData(getBasicSprayRecommendation());
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setSprayWindowData(getBasicSprayRecommendation());
    } finally {
      setLoading(false);
      setSprayWindowLoading(false);
    }
  };

  useEffect(() => {
    // Initialize spray window data immediately
    try {
      const initialRecommendation = getBasicSprayRecommendation();
      setSprayWindowData(initialRecommendation);
    } catch (error) {
      console.error('Error initializing spray window:', error);
    }
    
    // Wrap loadData in try-catch to prevent unhandled promise rejections
    loadData().catch((error) => {
      console.error('Unhandled error in loadData:', error);
      setLoading(false);
      setSprayWindowLoading(false);
    });
  }, []);

  // Get price data for selected crop
  const getCurrentPrice = () => {
    if (!priceData || priceLoading) return null;
    
    try {
      if (selectedCrop === 'rice') {
        const ricePrice = priceData.rice?.jasmine || priceData.rice?.white || null;
        if (ricePrice && typeof ricePrice.priceMin === 'number' && typeof ricePrice.priceMax === 'number') {
          // PriceItem has priceMin and priceMax, use average or min - safely calculate
          const priceMin = ricePrice.priceMin || 0;
          const priceMax = ricePrice.priceMax || priceMin;
          const avgPrice = Math.round((priceMin + priceMax) / 2);
          return {
            price: avgPrice || priceMin || 0,
            unit: ricePrice.unit || t('home.priceUnitRice'),
            lastUpdated: formatLastUpdated(priceData.fetchedAt || '', 'th')
          };
        }
      } else {
        const durianPrice = priceData.durian?.monthong || null;
        if (durianPrice && typeof durianPrice.priceMin === 'number' && typeof durianPrice.priceMax === 'number') {
          const priceMin = durianPrice.priceMin || 0;
          const priceMax = durianPrice.priceMax || priceMin;
          const avgPrice = Math.round((priceMin + priceMax) / 2);
          return {
            price: avgPrice || priceMin || 0,
            unit: durianPrice.unit || t('home.priceUnitDurian'),
            lastUpdated: formatLastUpdated(priceData.fetchedAt || '', 'th')
          };
        }
      }
    } catch (error) {
      console.error('Error getting current price:', error);
    }
    
    return null;
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Location card removed (spray window already shows location) */}

        {/* Spray Window */}
        {sprayWindowData && (() => {
          // Map WindowStatus ("good" | "caution" | "bad") to SprayWindowStatus ("good" | "caution" | "dont")
          let mappedStatus: 'good' | 'caution' | 'dont' = 'good';
          if (sprayWindowData.status === 'bad') {
            mappedStatus = 'dont';
          } else if (sprayWindowData.status === 'caution') {
            mappedStatus = 'caution';
          } else if (sprayWindowData.status === 'good') {
            mappedStatus = 'good';
          }
          
          return (
          <SprayWindow
              status={mappedStatus}
              reason={sprayWindowData.reasonTH || sprayWindowData.reasonEN || ''}
            nextUpdate={(() => {
              try {
                if (sprayWindowData.updatedAt) {
                  const date = new Date(sprayWindowData.updatedAt);
                  if (!isNaN(date.getTime())) {
                    return formatThaiTime(date);
                  }
                }
              } catch (error) {
                console.error('Error formatting updatedAt:', error);
              }
              return formatThaiTime(new Date());
            })()}
              location={location || undefined}
          />
          );
        })()}

        {/* Weather Today */}
        {weatherData && (
          <Card style={styles.weatherCard}>
            <Text style={styles.cardTitle}>{t('home.weatherToday')}</Text>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>{t('home.temperature')}:</Text>
              <Text style={styles.weatherValue}>
                {typeof weatherData.temperature?.min === 'number' && typeof weatherData.temperature?.max === 'number' 
                  ? `${weatherData.temperature.min}°C - ${weatherData.temperature.max}°C`
                  : weatherData.temperature ? `${weatherData.temperature}°C` : 'N/A'}
              </Text>
            </View>
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>{t('home.rainChance')}:</Text>
              <Text style={styles.weatherValue}>
                {weatherData.rainProbability || 0}%
              </Text>
            </View>
              <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>{t('home.wind')}:</Text>
              <Text style={styles.weatherValue}>
                {Math.round(weatherData.windSpeed || 0)} {t('home.windSpeedUnit')}
              </Text>
            </View>
          </Card>
        )}

        {/* Crop Selection */}
        <View style={styles.cropSelector}>
              <TouchableOpacity
            style={[styles.cropButton, selectedCrop === 'rice' && styles.cropButtonActive]}
            onPress={() => setSelectedCrop('rice')}
              >
            <Text style={[styles.cropButtonText, selectedCrop === 'rice' && styles.cropButtonTextActive]}>
              {t('home.rice')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
            style={[styles.cropButton, styles.cropButtonSecond, selectedCrop === 'durian' && styles.cropButtonActive]}
            onPress={() => setSelectedCrop('durian')}
              >
            <Text style={[styles.cropButtonText, selectedCrop === 'durian' && styles.cropButtonTextActive]}>
              {t('home.durian')}
                </Text>
              </TouchableOpacity>
            </View>
            
        {/* Price Card */}
        {(() => {
          try {
            const currentPrice = getCurrentPrice();
            if (currentPrice) {
              return (
                <PriceCard
                  crop={selectedCrop}
                  price={currentPrice.price}
                  unit={currentPrice.unit}
                  lastUpdated={currentPrice.lastUpdated}
                />
              );
            }
          } catch (error) {
            console.error('Error rendering price card:', error);
          }
          return (
            <Card>
              <Text style={styles.loadingText}>
                {priceLoading ? t('common.loading') : t('home.weatherLocationRequired')}
              </Text>
            </Card>
          );
        })()}
            </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing(2),
  },
  headerCard: {
    marginBottom: theme.spacing(2),
  },
  location: {
    fontSize: theme.type.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5),
  },
  weatherCard: {
    marginBottom: theme.spacing(2),
  },
  cardTitle: {
    fontSize: theme.type.title,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(1),
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5),
  },
  weatherLabel: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
  },
  weatherValue: {
    fontSize: theme.type.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cropSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing(2),
  },
  cropButton: {
    flex: 1,
    padding: theme.spacing(1.5),
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cropButtonSecond: {
    marginLeft: theme.spacing(1),
  },
  cropButtonActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  cropButtonText: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
  },
  cropButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
    textAlign: 'center',
    padding: theme.spacing(2),
  },
});
