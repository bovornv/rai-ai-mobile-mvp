import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { geocodeNominatim, GeoPoint } from "../lib/geocode";
import { fuzzySearchLocalSmart } from "../lib/fusePlaces";
import { formatThaiDate } from "../lib/dateFmt";
import { useTranslation } from 'react-i18next';

type Lang = "th" | "en";
type Daily = { time: string; tempMin: number; tempMax: number; rain: number; rainProb: number; wind: number };

// ---------- i18n ----------
const th = {
  title: "พยากรณ์อากาศ (5 วัน)",
  selectPrompt: "เลือกตำบล / อำเภอ / จังหวัด",
  search: "ค้นหา",
  today: "วันนี้",
  temp: "อุณหภูมิ",
  rain: "ฝน",
  rainChance: "โอกาสฝน",
  wind: "ลมสูงสุด",
  mm: "มม.",
  kmh: "กม./ชม.",
  unavailable: "ไม่มีข้อมูลที่เชื่อถือได้",
  updated: "อัปเดตล่าสุด",
  spray: "ช่วงพ่นที่เหมาะ",
  sprayMorning: "เช้า",
  sprayAfternoon: "บ่าย",
  sprayNight: "ค่ำ",
  source: "แหล่งข้อมูล: Open-Meteo",
  enBtn: "EN",
  thBtn: "TH",
  pickFailed: "ไม่พบพิกัดจากชื่อนี้ ลองกรอกใหม่",
};

const en = {
  title: "Weather Forecast (5 days)",
  selectPrompt: "Subdistrict / District / Province",
  search: "Search",
  today: "Today",
  temp: "Temp",
  rain: "Rain",
  rainChance: "Rain chance",
  wind: "Max Wind",
  mm: "mm",
  kmh: "km/h",
  unavailable: "No reliable data",
  updated: "Updated",
  spray: "Best spray window",
  sprayMorning: "Morning",
  sprayAfternoon: "Afternoon",
  sprayNight: "Night",
  source: "Source: Open-Meteo",
  enBtn: "EN",
  thBtn: "TH",
  pickFailed: "Couldn't find that place, please refine.",
};

function useI18n(defaultLang: Lang = "th") {
  const [lang, setLang] = useState<Lang>(defaultLang);
  return { lang, setLang, t: lang === "th" ? th : en };
}

function fmtDay(d: Date, lang: Lang, isFirst: boolean) {
  if (isFirst) return lang === "th" ? th.today : en.today;
  try {
    // Validate date before formatting
    if (isNaN(d.getTime())) {
      return lang === "th" ? "วันที่ไม่ถูกต้อง" : "Invalid date";
    }
    return lang === "th"
      ? d.toLocaleDateString("th-TH-u-ca-buddhist", { weekday: "short", day: "2-digit", month: "short" })
      : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" });
  } catch (e) {
    console.error("Date formatting error:", e);
    return lang === "th" ? "วันที่" : "Date";
  }
}

function headerDate(lang: Lang, d = new Date()) {
  try {
    // Validate date before formatting
    if (isNaN(d.getTime())) {
      return lang === "th" ? "วันที่ไม่ถูกต้อง" : "Invalid date";
    }
    return lang === "th"
      ? d.toLocaleDateString("th-TH-u-ca-buddhist", { dateStyle: "long" })
      : d.toLocaleDateString("en-US", { dateStyle: "long" });
  } catch (e) {
    console.error("Date formatting error:", e);
    return lang === "th" ? "วันที่" : "Date";
  }
}

// simple spray hint
function sprayHint(rainMm: number, windMax: number, lang: Lang) {
  if (rainMm >= 10) return lang === "th" ? "งดพ่น (ฝนมาก)" : "Avoid (heavy rain)";
  if (windMax < 15) return lang === "th" ? "เช้า" : "Morning";
  if (windMax < 25) return lang === "th" ? "บ่าย" : "Afternoon";
  return lang === "th" ? "ค่ำ (ลมแรง)" : "Night (windy)";
}

type DayRow = {
  key: string; date: Date; tmin?: number; tmax?: number; rain?: number; pop?: number; wind?: number; code?: number; ok: boolean; hint?: string;
};

function normalizeDaily(
  dates: string[], mins: (number|null)[], maxs: (number|null)[], rains: (number|null)[], winds: (number|null)[], pops: (number|null)[] | undefined, codes: (number|null)[] | undefined, lang: Lang
): DayRow[] {
  if (!Array.isArray(dates) || dates.length === 0) return [];
  
  return dates.map((iso, i) => {
    // Safely create date - validate ISO string format
    let d: Date;
    try {
      if (typeof iso !== 'string' || !iso) {
        d = new Date(); // Fallback if invalid ISO string
      } else {
        d = new Date(iso + "T12:00:00");
        if (isNaN(d.getTime())) {
          d = new Date(); // Fallback to today if invalid
        }
      }
    } catch {
      d = new Date(); // Fallback to today if error
    }
    
    // Safe array access - use array length checks
    const tmin = (Array.isArray(mins) && i < mins.length) ? (mins[i] ?? undefined) : undefined;
    const tmax = (Array.isArray(maxs) && i < maxs.length) ? (maxs[i] ?? undefined) : undefined;
    const rain = (Array.isArray(rains) && i < rains.length) ? (rains[i] ?? undefined) : undefined;
    const wind = (Array.isArray(winds) && i < winds.length) ? (winds[i] ?? undefined) : undefined;
    const pop = (Array.isArray(pops) && i < pops.length) ? (pops[i] ?? undefined) : undefined;
    const code = (Array.isArray(codes) && i < codes.length) ? (codes[i] ?? undefined) : undefined;
    
    let ok = true;
    if (tmin == null || tmax == null || rain == null || wind == null) ok = false;
    if (ok && tmax! < tmin!) ok = false;
    if (ok && tmax! - tmin! < 1) ok = false;
    // Additional validation: ensure numbers are actually numbers
    if (ok && (isNaN(tmin!) || isNaN(tmax!) || isNaN(rain!) || isNaN(wind!))) ok = false;
    return {
      key: iso || `day-${i}`, date: d, tmin, tmax, rain, wind, pop, code, ok,
      hint: ok ? sprayHint(rain!, wind!, lang) : undefined
    };
  });
}

// fetch 5 days starting today
async function fetchDaily(lat: number, lon: number) {
  // Validate coordinates
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error("Invalid coordinates");
  }
  // Open-Meteo API with Celsius, km/h, mm, plus precipitation probability and weathercode
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weathercode`
    + `&temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm&timezone=auto&forecast_days=5`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Open-Meteo API error:", res.status, errorText);
    throw new Error(`Weather HTTP ${res.status}: ${errorText.substring(0, 100)}`);
  }
  const data = await res.json();
  // Basic validation of response structure
  if (!data || typeof data !== 'object' || !data.daily) {
    throw new Error("Invalid API response format");
  }
  return data;
}

// MVP geocoding via Nominatim
async function geocodeTambon(tambon: string, amphoe: string, province: string) {
  try {
    const q = encodeURIComponent(`${tambon}, ${amphoe}, ${province}, Thailand`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "RaiAI/1.0" }});
    if (!res.ok) return null;
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const first = arr[0];
    if (!first || typeof first !== 'object') return null;
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    // Validate parsed coordinates
    if (isNaN(lat) || isNaN(lon)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return { lat, lon };
  } catch (e) {
    console.error("Geocoding error:", e);
    return null;
  }
}

export function WeatherScreen() {
  const { i18n } = useTranslation();
  const lang: 'th'|'en' = i18n.language === 'th' ? 'th' : 'en';
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoPoint[]>([]);
  const [chosen, setChosen] = useState<GeoPoint | null>(null);
  const [days, setDays] = useState<Daily[] | null>(null);
  const [pending, setPending] = useState<GeoPoint | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const [searching, setSearching] = useState(false);

  const DEFAULT_LABEL = "ต.เทพาลัย อ.คง จ.นครราชสีมา";
  const DEFAULT_POINT: GeoPoint = { lat: 15.3467, lon: 102.3494, label: DEFAULT_LABEL };

  useEffect(() => {
    (async () => {
      const last = await AsyncStorage.getItem('weather:last');
      if (last) {
        try {
          const parsed = JSON.parse(last);
          if (parsed?.point && parsed?.forecast) {
            setChosen(parsed.point);
            setDays(parsed.forecast);
            if (typeof parsed.point.label === 'string' && parsed.point.label.trim().length > 0) {
              setQuery(parsed.point.label);
            }
            return;
          }
        } catch {}
      }
      // No cache → preload default location
      try {
        setQuery(DEFAULT_LABEL);
        setChosen(DEFAULT_POINT);
        await fetchForecast(DEFAULT_POINT);
      } catch {}
    })();
  }, []);

  // removed legacy effects

  function normalizeCandidates(raw: string): string[] {
    const q = (raw || "").replace(/\s+/g, " ").trim();
    if (!q) return [];
    const strip = q
      .replace(/\b(ต\.|อ\.|จ\.|จังหวัด|อำเภอ|ตำบล)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const parts = strip.split(/[ ,]+/).filter(Boolean);
    const combos: string[] = [];
    // original and stripped
    combos.push(q);
    if (strip !== q) combos.push(strip);
    // join with comma and space in both orders (up to 3 tokens)
    if (parts.length >= 2) {
      combos.push(parts.join(", "));
      combos.push(parts.join(" "));
      const reversed = [...parts].reverse();
      combos.push(reversed.join(", "));
      combos.push(reversed.join(" "));
    }
    return Array.from(new Set(combos)).slice(0, 6);
  }

  // Debounced suggestions
  useEffect(() => {
    const h = setTimeout(async () => {
      const q = query.trim();
      if (!q) { 
        setSuggestions([]); 
        setSearching(false);
        return; 
      }
      
      // Don't show suggestions if user has already confirmed (chosen location) and query hasn't changed
      if (chosen && q === chosen.label) {
        setSuggestions([]);
        setSearching(false);
        return;
      }
      
      setSearching(true);
      const cands = normalizeCandidates(q);
      let collected: GeoPoint[] = [];
      
      // Try online geocode for each candidate until we have enough
      for (const c of cands) {
        try {
          const s = await geocodeNominatim(c);
          for (const it of s) {
            if (!collected.find(x => x.label === it.label && x.lat === it.lat && x.lon === it.lon)) {
              collected.push(it);
            }
            if (collected.length >= 8) break;
          }
          if (collected.length >= 8) break;
        } catch (err) {
          console.warn('Geocode error:', err);
        }
      }
      
      // Fallback: fuzzy search local by province chunks
      if (collected.length < 8) {
        try {
          const local = await fuzzySearchLocalSmart(q, 8 - collected.length);
          for (const it of local) {
            if (!collected.find(x => x.label === it.label && x.lat === it.lat && x.lon === it.lon)) {
              collected.push(it);
            }
            if (collected.length >= 8) break;
          }
        } catch (err) {
          console.warn('Fuzzy search error:', err);
        }
      }
      
      setSuggestions(collected.slice(0, 8));
      setSearching(false);
    }, 400);
    return () => clearTimeout(h);
  }, [query, chosen]);

  async function fetchForecast(p: GeoPoint) {
    // Validate GeoPoint before making API call
    if (!p || typeof p.lat !== 'number' || typeof p.lon !== 'number') {
      throw new Error('Invalid location coordinates');
    }
    if (isNaN(p.lat) || isNaN(p.lon) || !isFinite(p.lat) || !isFinite(p.lon)) {
      throw new Error('Invalid location coordinates');
    }
    if (p.lat < -90 || p.lat > 90 || p.lon < -180 || p.lon > 180) {
      throw new Error('Location coordinates out of range');
    }
    
    // Request 5 days from Open‑Meteo (starts today by default when using forecast_days)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
      `&timezone=Asia/Bangkok&forecast_days=5`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('forecast failed');
    const j = await res.json();
    
    // Validate API response structure
    if (!j || typeof j !== 'object' || !j.daily || !Array.isArray(j.daily.time)) {
      throw new Error('Invalid forecast response format');
    }
    
    const times = j.daily.time || [];
    const tempMin = j.daily.temperature_2m_min || [];
    const tempMax = j.daily.temperature_2m_max || [];
    const precipitation = j.daily.precipitation_sum || [];
    const rainProb = j.daily.precipitation_probability_max || [];
    const wind = j.daily.wind_speed_10m_max || [];
    
    let out: Daily[] = times.slice(0, 5).map((t: string, i: number) => ({
      time: t || '',
      tempMin: Number(tempMin[i] ?? 0),
      tempMax: Number(tempMax[i] ?? 0),
      rain: Math.round(precipitation[i] ?? 0),
      rainProb: rainProb[i] ?? 0,
      wind: Math.round(wind[i] ?? 0),
    }));
    out = out.map(d => {
      if (isFinite(d.tempMin) && isFinite(d.tempMax) && Math.abs(d.tempMax - d.tempMin) < 1) {
        return { ...d, tempMin: Math.floor((d.tempMin - 0.5) * 10) / 10, tempMax: Math.ceil((d.tempMax + 0.5) * 10) / 10 };
      }
      const minR = Math.round(d.tempMin);
      const maxR = Math.round(d.tempMax);
      if (maxR - minR < 1) {
        return { ...d, tempMin: minR, tempMax: minR + 1 };
      }
      return d;
    });
    setChosen(p); setDays(out); setUpdatedAt(Date.now()); setOffline(false);
    await AsyncStorage.setItem('weather:last', JSON.stringify({ point: p, forecast: out, updatedAt: Date.now() }));
  }

  function emojiByProb(prob: number) {
    return prob >= 40 ? '🌧️' : prob >= 15 ? '🌦️' : '☀️';
  }

  function bestSpray(d: Daily) {
    if (d.rainProb < 35 && d.wind <= 15) return lang==='th' ? 'เช้า (06:00–09:00)' : 'Morning (06–09)';
    if (d.rainProb < 35 && d.wind <= 18) return lang==='th' ? 'บ่าย (15:00–17:00)' : 'Afternoon (15–17)';
    return lang==='th' ? 'วันนี้ไม่แนะนำ' : 'Not recommended';
  }

  // removed legacy header

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f6fbf7" }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f3c22" }}>{lang==='th' ? 'พยากรณ์อากาศ (5 วัน)' : 'Weather Forecast (5 days)'}</Text>
      </View>

      <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 14 }}>
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setPending(null); // Clear pending when user types
          }}
          placeholder={lang==='th' ? 'พิมพ์: ตำบล/อำเภอ/จังหวัด (เช่น เทพาลัย คง นครราชสีมา)' : 'Type: subdistrict/district/province (e.g., Thephalai Khong Nakhon Ratchasima)'}
          style={{ backgroundColor: '#f1f5f2', borderRadius: 10, padding: 14, fontSize: 20 }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {/* Confirm button */}
        <TouchableOpacity
          onPress={async () => {
            try {
              // If user selected a suggestion, use it directly
              if (pending) {
                setSuggestions([]);
                await fetchForecast(pending);
                setPending(null);
                return;
              }
              
              // If query matches chosen location, do nothing
              if (chosen && query.trim() === chosen.label.trim()) {
                return;
              }
              
              const q = query.trim();
              if (!q) return;
              
              // Try online first
              let s = await geocodeNominatim(q);
              // Fallback to local fuzzy search
              if (!s.length) {
                s = await fuzzySearchLocalSmart(q, 1);
              }
              
              if (s.length) {
                setSuggestions([]);
                await fetchForecast(s[0]);
                setPending(null);
              } else {
                // No results found
                setSuggestions([]);
              }
            } catch (err) {
              console.error('Confirm location error:', err);
              // Fallback to cached forecast and mark offline
              try {
                const last = await AsyncStorage.getItem('weather:last');
                if (last) {
                  const parsed = JSON.parse(last);
                  if (parsed?.point && parsed?.forecast) {
                    setChosen(parsed.point);
                    setDays(parsed.forecast);
                    setUpdatedAt(parsed.updatedAt || Date.now());
                    setOffline(true);
                  }
                }
              } catch {}
            }
          }}
          style={{ marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#1A7F3E', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
        >
          <Text style={{ color: 'white', fontWeight: '800' }}>{lang==='th' ? 'ยืนยันตำแหน่ง' : 'Confirm location'}</Text>
        </TouchableOpacity>
        {searching && !suggestions.length && (
          <View style={{ marginTop: 8, padding: 12 }}>
            <Text style={{ fontSize: 16, color: '#7a8f81' }}>
              {lang==='th' ? 'กำลังค้นหา...' : 'Searching...'}
            </Text>
          </View>
        )}
        {!!suggestions.length && (
          <View style={{ backgroundColor: '#f8f9fa', borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#e0e0e0', maxHeight: 300, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            {suggestions.map((s, i) => (
              <TouchableOpacity 
                key={`${s.label}-${i}`} 
                onPress={() => { 
                  setQuery(s.label); 
                  setPending(s);
                  setSuggestions([]);
                }} 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 14,
                  borderBottomWidth: i < suggestions.length - 1 ? 1 : 0,
                  borderBottomColor: '#e0e0e0',
                  backgroundColor: pending?.label === s.label ? '#e7f5ec' : 'transparent'
                }}
              >
                <Text style={{ fontSize: 18, color: pending?.label === s.label ? '#1A7F3E' : '#2c3e36', fontWeight: pending?.label === s.label ? '800' as const : '500' as const }}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {chosen && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "#2b3b33", fontWeight: "700", fontSize: 18 }}>{chosen.label}</Text>
            <Text style={{ color: "#4b5b51", fontSize: 18 }}>{formatThaiDate(new Date(), lang)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              {offline && (
                <View style={{ backgroundColor: '#fff4cc', borderColor: '#ffd24d', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 }}>
                  <Text style={{ color: '#856404', fontSize: 12 }}>{lang==='th' ? 'ใช้ออฟไลน์' : 'Offline'}</Text>
                </View>
              )}
              {!!updatedAt && (
                <Text style={{ color: '#7a8f81', fontSize: 12 }}>
                  {lang==='th' ? 'อัปเดตล่าสุด ' : 'Updated '} {new Date(updatedAt).toLocaleTimeString(lang==='th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
              <Text style={{ color: '#7a8f81', fontSize: 12 }}>  ·  Source: Open-Meteo</Text>
            </View>
          </View>
        )}
      </View>

      {days && (
        <View style={{ marginTop: 12 }}>
          {days.map((d, i) => {
            let dt: Date;
            try {
              if (!d.time || typeof d.time !== 'string') {
                dt = new Date();
              } else {
                dt = new Date(d.time + 'T00:00:00+07:00');
                if (isNaN(dt.getTime())) {
                  dt = new Date();
                }
              }
            } catch {
              dt = new Date();
            }
            const name = (lang==='th')
              ? dt.toLocaleDateString('th-TH', { weekday:'short', month:'short', day:'numeric' })
              : dt.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
            const emoji = emojiByProb(d.rainProb ?? 0);
            return (
              <View key={`${d.time}-${i}`} style={{ backgroundColor: 'white', padding: 18, borderRadius: 14, marginBottom: 12 }}>
                <Text style={{ fontWeight: '800', fontSize: 20 }}>{i===0 ? (lang==='th' ? 'วันนี้' : 'Today') : name} {emoji}</Text>
                <Text style={{ marginTop: 6, fontSize: 18 }}>{lang==='th' ? 'อุณหภูมิ:' : 'Temp:'} {d.tempMin}° / {d.tempMax}°</Text>
                <Text style={{ fontSize: 18 }}>{lang==='th' ? 'ฝน:' : 'Rain:'} {d.rain} mm   {lang==='th' ? 'โอกาส:' : 'Chance:'} {d.rainProb}%</Text>
                <Text style={{ fontSize: 18 }}>{lang==='th' ? 'ลม:' : 'Wind:'} {d.wind} km/h</Text>
                {i === 0 && (
                  <Text style={{ marginTop: 6, fontWeight: '700', fontSize: 18 }}>
                    {(() => { const s = bestSpray(d); return lang==='th' ? `ช่วงพ่นวันนี้: ${s}` : `Today spray: ${s}`; })()}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {!days && !suggestions.length && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: '#7a8f81' }}>{lang==='th' ? 'ไม่พบสถานที่ ลองสะกดใหม่ หรือพิมพ์จังหวัด/อำเภอที่ใกล้เคียง' : 'No results. Try another nearby district/province.'}</Text>
        </View>
      )}
    </ScrollView>
  );
}