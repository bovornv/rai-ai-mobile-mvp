// Custom hook for variety-based DIT price data
import { useEffect, useState } from 'react';
import { getPricesByVariety, PricesByVariety } from '../services/VarietyPriceService';

export function useVarietyPrices(selectedProvince?: string) {
  const [data, setData] = useState<PricesByVariety | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      console.log('useVarietyPrices: Refresh button pressed, starting refresh...', { selectedProvince });
      setLoading(true);
      setError(null);
      const result = await getPricesByVariety(true, selectedProvince);
      console.log('useVarietyPrices: Refresh completed, new data:', result);
      setData(result);
    } catch (err) {
      console.error('Error refreshing variety prices:', err);
      setError('ไม่สามารถอัปเดตข้อมูลราคาได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getPricesByVariety(false, selectedProvince);
        setData(result);
      } catch (err) {
        console.error('Error loading variety prices:', err);
        setError('ไม่สามารถโหลดข้อมูลราคาได้');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedProvince]);

  return { 
    data, 
    loading, 
    error, 
    refresh,
    isOffline: data?.fetchedAt && (Date.now() - new Date(data.fetchedAt).getTime()) > 24 * 60 * 60 * 1000
  };
}
