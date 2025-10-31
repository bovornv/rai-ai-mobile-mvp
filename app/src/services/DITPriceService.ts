// DIT (กรมการค้าภายใน) Price Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_KEYS, API_ENDPOINTS } from '../config/apiKeys';
import { CommodityKey, PriceItem, PricePayload } from '../types/Weather';

const BASE = API_ENDPOINTS.DIT_BASE;
const REGION = process.env.EXPO_PUBLIC_PRICE_REGION || '';
const STORAGE_KEY = 'rai.prices.latest.v1';
const TTL_MS = 24 * 60 * 60 * 1000; // refresh once per day

async function fetchWithTimeout(url: string, ms = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if available
    if (API_KEYS.DIT_API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEYS.DIT_API_KEY}`;
    }
    
    const r = await fetch(url, { 
      signal: ctrl.signal,
      headers
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(id);
  }
}

/** Map raw DIT/MoC rows → PriceItem (adjust this mapper to the actual dataset). */
function mapRice(row: any): PriceItem | null {
  // Example fields you may see in MoC open data: product, variety, unit, price_min, price_max, province, date
  if (!row) return null;
  const variety = row.variety || row.product || "หอมมะลิ";
  return {
    commodity: "rice",
    variety: variety.includes("หอม") ? "หอมมะลิ" : variety,
    unit: "บาท/ตัน",
    priceMin: Number(row.price_min ?? row.min ?? row.price ?? 0),
    priceMax: Number(row.price_max ?? row.max ?? row.price ?? 0),
    province: row.province || undefined,
    dateISO: (row.date || row.updated_at || new Date().toISOString()).slice(0,10),
    source: "กรมการค้าภายใน (DIT)",
  };
}

function mapDurian(row: any): PriceItem | null {
  if (!row) return null;
  const variety = row.variety || row.product || "หมอนทอง";
  return {
    commodity: "durian",
    variety: variety.includes("หมอนทอง") ? "หมอนทอง" : variety,
    unit: "บาท/กก.",
    priceMin: Number(row.price_min ?? row.min ?? row.price ?? 0),
    priceMax: Number(row.price_max ?? row.max ?? row.price ?? 0),
    province: row.province || undefined,
    dateISO: (row.date || row.updated_at || new Date().toISOString()).slice(0,10),
    source: "กรมการค้าภายใน (DIT)",
  };
}

/** Replace these endpoints with the concrete dataset you adopt from MoC Open Data (data.go.th / DIT). */
function riceUrl() {
  // e.g., ?product=rice&variety=jasmine&province=<code>
  const q = new URLSearchParams({ 
    product: "rice", 
    variety: "jasmine", 
    ...(REGION ? { province: REGION } : {})
  });
  return `${BASE}/agriculture-price?${q.toString()}`;
}

function durianUrl() {
  const q = new URLSearchParams({ 
    product: "durian", 
    variety: "monthong", 
    ...(REGION ? { province: REGION } : {})
  });
  return `${BASE}/agriculture-price?${q.toString()}`;
}

async function fetchPricesLive(): Promise<PricePayload> {
  console.log('DITPriceService: Fetching live prices from DIT API');
  
  const [rRice, rDurian] = await Promise.allSettled([
    fetchWithTimeout(riceUrl()), 
    fetchWithTimeout(durianUrl())
  ]);

  const rice = rRice.status === "fulfilled"
    ? mapRice((Array.isArray(rRice.value) ? rRice.value[0] : (rRice.value?.data?.[0] ?? rRice.value)))
    : null;

  const durian = rDurian.status === "fulfilled"
    ? mapDurian((Array.isArray(rDurian.value) ? rDurian.value[0] : (rDurian.value?.data?.[0] ?? rDurian.value)))
    : null;

  console.log('DITPriceService: Live data fetched', { rice: !!rice, durian: !!durian });

  const payload: PricePayload = { rice, durian, fetchedAt: new Date().toISOString() };
  return payload;
}

const MOCK: PricePayload = {
  rice: { 
    commodity: "rice", 
    variety: "หอมมะลิ", 
    unit: "บาท/ตัน", 
    priceMin: 14800, 
    priceMax: 15200, 
    province: "นครราชสีมา", 
    dateISO: new Date().toISOString().slice(0,10), 
    source: "กรมการค้าภายใน (DIT)" 
  },
  durian: { 
    commodity: "durian", 
    variety: "หมอนทอง", 
    unit: "บาท/กก.", 
    priceMin: 110, 
    priceMax: 130, 
    province: "จันทบุรี", 
    dateISO: new Date().toISOString().slice(0,10), 
    source: "กรมการค้าภายใน (DIT)" 
  },
  fetchedAt: new Date().toISOString()
};

export async function getPrices(forceRefresh = false): Promise<PricePayload> {
  console.log('DITPriceService: getPrices called', { forceRefresh });
  
  const cachedRaw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!forceRefresh && cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw) as PricePayload;
      if (cached && cached.fetchedAt) {
        const age = Date.now() - new Date(cached.fetchedAt).getTime();
        if (age < TTL_MS) {
          console.log('DITPriceService: Using cached data (age:', Math.round(age / 1000 / 60), 'minutes)');
          return cached;
        }
      }
    } catch (parseError) {
      console.error('DITPriceService: Error parsing cached data, will fetch fresh:', parseError);
      // Continue to fetch fresh data
    }
  }

  try {
    const live = await fetchPricesLive();
    // If both null, fallback to mock
    const final = (live.rice || live.durian) ? live : MOCK;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(final));
    console.log('DITPriceService: Data cached successfully');
    return final;
  } catch (error) {
    console.error('DITPriceService: Error fetching live data', error);
    if (cachedRaw) {
      try {
        console.log('DITPriceService: Using stale cached data as fallback');
        const stale = JSON.parse(cachedRaw);
        if (stale && typeof stale === 'object') {
          return stale;
        }
      } catch (parseError) {
        console.error('DITPriceService: Error parsing stale cache, using mock data:', parseError);
      }
    }
    console.log('DITPriceService: Using mock data as final fallback');
    return MOCK;
  }
}

// Helper function to format price display
export function formatPrice(priceItem: PriceItem | null, language: 'th' | 'en' = 'th'): string {
  if (!priceItem) return language === 'th' ? 'ไม่พบข้อมูล' : 'No data';
  
  const { priceMin, priceMax, unit } = priceItem;
  
  if (priceMin === priceMax) {
    return `${priceMin.toLocaleString()} ${unit}`;
  } else {
    return `${priceMin.toLocaleString()}-${priceMax.toLocaleString()} ${unit}`;
  }
}

// Helper function to format last updated time
export function formatLastUpdated(fetchedAt: string, language: 'th' | 'en' = 'th'): string {
  const date = new Date(fetchedAt);
  
  if (language === 'th') {
    // Thai format: 20 ก.ย. 68 06:00 น.
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543; // Convert to Buddhist Era
    const time = date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    return `อัปเดต: ${day} ${month} ${year} ${time} น.`;
  } else {
    // English format: Updated: 20 Sep 2025 06:00
    return `Updated: ${date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })} ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  }
}
