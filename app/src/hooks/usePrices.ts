// Custom hook for DIT price data
import { useEffect, useState } from 'react';
import { getPrices, PricePayload } from '../services/DITPriceService';

export function usePrices() {
  const [data, setData] = useState<PricePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPrices(true);
      setData(result);
    } catch (err) {
      console.error('Error refreshing prices:', err);
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
        const result = await getPrices(false);
        setData(result);
      } catch (err) {
        console.error('Error loading prices:', err);
        setError('ไม่สามารถโหลดข้อมูลราคาได้');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refresh,
    isOffline: data?.fetchedAt && (Date.now() - new Date(data.fetchedAt).getTime()) > 24 * 60 * 60 * 1000
  };
}
