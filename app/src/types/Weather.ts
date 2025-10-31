// Weather data types
export interface WeatherData {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: number;
  windSpeed: number;
  pressure?: number;
  rainProbability?: number;
  description?: string;
  icon?: string;
  sprayWindow: 'good' | 'caution' | 'dont';
  sprayReason: string;
}

export type CommodityKey = "rice" | "durian";

export interface PriceItem {
  commodity: CommodityKey;
  varietyKey: string;            // "jasmine" | "monthong" ...
  varietyTH: string;
  varietyEN: string;
  unit: "บาท/ตัน" | "บาท/กก.";
  priceMin: number;
  priceMax: number;
  province?: string;
  dateISO: string;
  source: "กรมการค้าภายใน (DIT)";
}

export interface PricePayload {
  rice: PriceItem | null;
  durian: PriceItem | null;
  fetchedAt: string; // ISO
}

export interface PricesByVariety {
  rice: Record<string, PriceItem | null>;
  durian: Record<string, PriceItem | null>;
  fetchedAt: string;
}

// Legacy interface for backward compatibility
export interface PriceData {
  rice: {
    [key: string]: {
      price: number;
      unit: string;
      lastUpdated: string;
    };
  };
  durian: {
    [key: string]: {
      price: number;
      unit: string;
      lastUpdated: string;
    };
  };
}
