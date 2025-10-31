export interface Field {
  id: string;                // "my-field"
  name: string;              // "แปลงข้าวหอมมะลิ"
  crop: "rice" | "durian";
  areaRai: number;           // 0.1–999
  plantedAt: string;         // ISO date
  status: "preplant" | "growing" | "harvest";
  location: {
    lat: number;
    lng: number;
    subdistrict: string;     // ตำบล
    province: string;        // จังหวัด
  } | null;
  useForWeather: boolean;    // if true → Home/Weather use this
}

export interface FieldFormData {
  name: string;
  crop: "rice" | "durian";
  areaRai: number;
  plantedAt: string;
  useForWeather: boolean;
  location: {
    lat: number;
    lng: number;
    subdistrict: string;
    province: string;
  } | null;
}
