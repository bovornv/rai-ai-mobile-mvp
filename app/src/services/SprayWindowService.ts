// Spray Window Service - Farmer-friendly weather-based spray recommendations
export type Hour = { 
  ts: string; 
  rainProb: number; 
  rainMm?: number; 
  windKmh: number; 
  humidity: number; 
  tempC: number 
};

export type WindowStatus = "good" | "caution" | "bad";

export interface SprayWindowResult {
  status: WindowStatus;
  reasonTH: string;
  reasonEN: string;
  bestTH: string;
  updatedAt: string;
  icon: string;
  factor?: string; // For the first line display (e.g., "ลมแรง", "โอกาสฝนสูง", "ความชื้นสูง")
}

const THRESHOLDS = {
  // Rain thresholds - more conservative for farming
  rainProbBad: 50,      // %       → red if any hour ≥ 50% (was 60%)
  rainProbWarn: 25,     // %       → yellow if median ≥ 25% (was 30%)
  rainMmBad: 0.5,       // mm/hr   → red if any hour ≥ 0.5mm (was 1.0)
  rainMmWarn: 0.2,      // mm/hr   → yellow if any hour ≥ 0.2mm
  
  // Wind thresholds - more conservative for spray drift
  windBad: 12,          // km/h    → red if any hour ≥ 12 (was 15)
  windWarn: 8,          // km/h    → yellow if median ≥ 8 (was 10)
  windIdeal: 5,         // km/h    → ideal wind speed
  
  // Humidity thresholds - more conservative for drying
  humidityBad: 90,      // %       → red if median ≥ 90%
  humidityWarn: 80,     // %       → yellow if median ≥ 80% (was 85%)
  humidityIdeal: 70,    // %       → ideal humidity
  
  // Temperature thresholds - more conservative for evaporation
  tempBad: 36,          // °C      → red if median ≥ 36°C (evaporation too high)
  tempWarn: 32,         // °C      → yellow if median ≥ 32°C (was 34)
  tempIdeal: 28,        // °C      → ideal temperature
  
  // Time-based thresholds
  morningStart: 6,      // 6 AM
  morningEnd: 10,       // 10 AM
  eveningStart: 16,     // 4 PM
  eveningEnd: 18,       // 6 PM
};

const median = (arr: number[]) => {
  const a = [...arr].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

// Calculate score for an hour based on farming conditions
const calculateHourScore = (hour: Hour, time: Date): number => {
  let score = 100; // Start with perfect score
  
  const hourOfDay = time.getHours();
  
  // Time-based scoring (morning and evening are better)
  if (hourOfDay >= THRESHOLDS.morningStart && hourOfDay < THRESHOLDS.morningEnd) {
    score += 20; // Morning bonus
  } else if (hourOfDay >= THRESHOLDS.eveningStart && hourOfDay < THRESHOLDS.eveningEnd) {
    score += 15; // Evening bonus
  } else if (hourOfDay >= 10 && hourOfDay < 16) {
    score -= 10; // Afternoon penalty (too hot)
  } else {
    score -= 20; // Night penalty (humidity too high)
  }
  
  // Weather-based scoring
  if (hour.rainProb > 0) score -= hour.rainProb * 0.5; // Rain penalty
  if (hour.windKmh > THRESHOLDS.windIdeal) score -= (hour.windKmh - THRESHOLDS.windIdeal) * 2; // Wind penalty
  if (hour.humidity > THRESHOLDS.humidityIdeal) score -= (hour.humidity - THRESHOLDS.humidityIdeal) * 0.3; // Humidity penalty
  if (hour.tempC > THRESHOLDS.tempIdeal) score -= (hour.tempC - THRESHOLDS.tempIdeal) * 1.5; // Temperature penalty
  
  return Math.max(0, score); // Ensure non-negative score
};

export class SprayWindowService {
  static computeSprayWindow(hours: Hour[], nowLocalISO: string): SprayWindowResult {
    const next12 = hours.slice(0, 12);
    const probs = next12.map(h => h.rainProb);
    const rains = next12.map(h => h.rainMm ?? 0);
    const winds = next12.map(h => h.windKmh);
    const hums = next12.map(h => h.humidity);
    const temps = next12.map(h => h.tempC);

    const maxProb = Math.max(...probs);
    const maxRain = Math.max(...rains);
    const maxWind = Math.max(...winds);

    // 1) Status determination with more conservative farming thresholds
    let status: WindowStatus = "good";
    
    // Check for bad conditions (red) - any hour with severe conditions
    if (maxProb >= THRESHOLDS.rainProbBad || maxRain >= THRESHOLDS.rainMmBad || maxWind >= THRESHOLDS.windBad) {
      status = "bad";
    } else {
      const medProb = median(probs);
      const medWind = median(winds);
      const medHum = median(hums);
      const medTemp = median(temps);
      
      // Check for bad conditions based on median values
      if (medHum >= THRESHOLDS.humidityBad || medTemp >= THRESHOLDS.tempBad) {
        status = "bad";
      }
      // Check for caution conditions (yellow)
      else if (medProb >= THRESHOLDS.rainProbWarn || medWind >= THRESHOLDS.windWarn || 
               medHum >= THRESHOLDS.humidityWarn || medTemp >= THRESHOLDS.tempWarn ||
               maxRain >= THRESHOLDS.rainMmWarn) {
        status = "caution";
      }
    }

    // 2) Reason text generation with farmer-friendly language
    let reasonTH = "";
    let reasonEN = "";
    let icon = "☀️";
    let factor = "";

    const medProb = Math.round(median(probs));
    const medWind = Math.round(median(winds));
    const medHum = Math.round(median(hums));
    const medTemp = Math.round(median(temps));

    if (status === "bad") {
      // Priority order: rain > wind > humidity > temperature
      if (maxProb >= THRESHOLDS.rainProbBad || maxRain >= THRESHOLDS.rainMmBad) {
        const hoursUntil = probs.findIndex(p => p >= THRESHOLDS.rainProbBad);
        reasonTH = `มีฝน ${Math.round(maxProb)}% ใน ${hoursUntil >= 0 ? hoursUntil + 1 : 1} ชม. ข้างหน้า - หลีกเลี่ยงการพ่นยา-ปุ๋ย`;
        reasonEN = `Rain ${Math.round(maxProb)}% in next ${hoursUntil >= 0 ? hoursUntil + 1 : 1}h - avoid spraying`;
        icon = "🌧️";
        factor = "ฝนสูง";
      } else if (maxWind >= THRESHOLDS.windBad) {
        reasonTH = `ลมแรง ${Math.round(maxWind)} กม./ชม. - ยา-ปุ๋ยจะกระเด็นไม่ติดใบ`;
        reasonEN = `Strong wind ${Math.round(maxWind)} km/h - spray will drift away`;
        icon = "💨";
        factor = "ลมแรง";
      } else if (medHum >= THRESHOLDS.humidityBad) {
        reasonTH = `ความชื้นสูงมาก ${medHum}% - ยา-ปุ๋ยจะไม่แห้ง`;
        reasonEN = `Very high humidity ${medHum}% - spray won't dry`;
        icon = "💧";
        factor = "ความชื้นสูง";
      } else {
        reasonTH = `อากาศร้อนมาก ${medTemp}°C - ยา-ปุ๋ยจะระเหยเร็วเกินไป`;
        reasonEN = `Very hot ${medTemp}°C - spray will evaporate too fast`;
        icon = "🌡️";
        factor = "อากาศร้อน";
      }
    } else if (status === "caution") {
      // Priority order: rain > wind > humidity > temperature
      if (medProb >= THRESHOLDS.rainProbWarn) {
        reasonTH = `โอกาสฝน ${medProb}% - ระวังการพ่นยา-ปุ๋ย`;
        reasonEN = `Rain chance ${medProb}% - be careful when spraying`;
        icon = "🌧️";
        factor = "โอกาสฝน";
      } else if (medWind >= THRESHOLDS.windWarn) {
        reasonTH = `ลม ${medWind} กม./ชม. - ระวังการกระเด็น`;
        reasonEN = `Wind ${medWind} km/h - watch for drift`;
        icon = "💨";
        factor = "ลมแรง";
      } else if (medHum >= THRESHOLDS.humidityWarn) {
        reasonTH = `ความชื้นสูง ${medHum}% - ระวังการแห้งช้า`;
        reasonEN = `High humidity ${medHum}% - slow drying expected`;
        icon = "💧";
        factor = "ความชื้นสูง";
      } else {
        reasonTH = `อากาศร้อน ${medTemp}°C - ระวังการระเหยเร็ว`;
        reasonEN = `Hot ${medTemp}°C - watch for fast evaporation`;
        icon = "🌡️";
        factor = "อากาศร้อน";
      }
    } else {
      // Good conditions
      if (medWind <= THRESHOLDS.windIdeal && medHum <= THRESHOLDS.humidityIdeal) {
        reasonTH = `อากาศดีมาก - ลม ${medWind} กม./ชม. ความชื้น ${medHum}% เหมาะสำหรับพ่นยา-ปุ๋ย`;
        reasonEN = `Excellent conditions - wind ${medWind} km/h, humidity ${medHum}% perfect for spraying`;
        icon = "☀️";
        factor = "อากาศดี";
      } else {
        reasonTH = `อากาศเหมาะสม - ลมไม่เกิน ${Math.round(maxWind)} กม./ชม. พ่นยา-ปุ๋ยได้`;
        reasonEN = `Good conditions - wind ≤ ${Math.round(maxWind)} km/h, suitable for spraying`;
        icon = "☀️";
        factor = "เหมาะสม";
      }
    }

    // 3) Best time window calculation with farming-optimized criteria
    const toLocal = (s: string) => new Date(s);
    
    // More conservative criteria for spray window
    const goodSlots = next12.filter(h => 
      h.rainProb < THRESHOLDS.rainProbWarn && 
      h.windKmh <= THRESHOLDS.windWarn && 
      h.humidity <= THRESHOLDS.humidityWarn &&
      h.tempC <= THRESHOLDS.tempWarn
    );
    
    // Group consecutive good hours into blocks
    const blocks: { start: Date; end: Date; score: number }[] = [];
    let blockStart: Date | null = null;
    let last: Date | null = null;
    let blockScore = 0;
    
    for (const h of goodSlots) {
      const t = toLocal(h.ts);
      const hourScore = calculateHourScore(h, t);
      
      if (!blockStart) {
        blockStart = t;
        last = t;
        blockScore = hourScore;
      } else if ((t.getTime() - last!.getTime()) / 3600000 <= 1.1) {
        last = t;
        blockScore += hourScore;
      } else {
        blocks.push({ start: blockStart, end: last!, score: blockScore });
        blockStart = t;
        last = t;
        blockScore = hourScore;
      }
    }
    if (blockStart) blocks.push({ start: blockStart, end: last!, score: blockScore });

    const fmt = (d: Date) => d.toLocaleTimeString("th-TH", { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: false 
    });
    
    // Find the best block (prefer morning, then evening, then any good block)
    const best = blocks.find(b => {
      const h = b.start.getHours();
      const inMorning = h >= THRESHOLDS.morningStart && h < THRESHOLDS.morningEnd;
      const inEvening = h >= THRESHOLDS.eveningStart && h < THRESHOLDS.eveningEnd;
      const span = (b.end.getTime() - b.start.getTime()) / 3600000;
      return (inMorning || inEvening) && span >= 2;
    }) || blocks.find(b => {
      const span = (b.end.getTime() - b.start.getTime()) / 3600000;
      return span >= 2;
    }) || blocks[0]; // Fallback to any block
    
    let bestTH = "—";
    if (best) {
      const span = (best.end.getTime() - best.start.getTime()) / 3600000;
      if (span >= 3) {
        bestTH = `${fmt(best.start)}–${fmt(best.end)} น.`;
      } else {
        bestTH = `${fmt(best.start)}–${fmt(best.end)} น. (${Math.round(span)} ชม.)`;
      }
    } else if (status === "good") {
      // If no specific good blocks but overall conditions are good, suggest morning
      bestTH = "06:00–09:00 น. (แนะนำ)";
    }

    return {
      status,
      reasonTH,
      reasonEN,
      bestTH,
      updatedAt: new Date(nowLocalISO).toISOString(),
      icon,
      factor
    };
  }

  // Generate mock data for testing and MVP fallback
  static generateMockHours(): Hour[] {
    const now = new Date();
    const hours: Hour[] = [];
    
    for (let i = 0; i < 12; i++) {
      const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
      hours.push({
        ts: hour.toISOString(),
        rainProb: Math.random() * 100,
        rainMm: Math.random() * 2,
        windKmh: Math.random() * 20,
        humidity: 60 + Math.random() * 40,
        tempC: 25 + Math.random() * 10
      });
    }
    
    return hours;
  }

  // Cache key generation
  static getCacheKey(subdistrict: string, province: string): string {
    return `spray_window:${subdistrict}:${province}`;
  }

  // Check if cache is still valid (2 hours)
  static isCacheValid(updatedAt: string): boolean {
    const cacheTime = new Date(updatedAt).getTime();
    const now = new Date().getTime();
    const twoHours = 2 * 60 * 60 * 1000;
    return (now - cacheTime) < twoHours;
  }
}
