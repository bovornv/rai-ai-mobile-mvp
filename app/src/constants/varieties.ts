// Rice and Durian varieties with Thai/English labels and units
export const VARIETIES = {
  rice: [
    { key: "jasmine", th: "ข้าวหอมมะลิ", en: "Jasmine", unit: "บาท/ตัน" },
    { key: "white", th: "ข้าวขาว", en: "White Rice", unit: "บาท/ตัน" },
    { key: "glutinous", th: "ข้าวเหนียว", en: "Glutinous", unit: "บาท/ตัน" },
  ],
  durian: [
    { key: "monthong", th: "ทุเรียนหมอนทอง", en: "Monthong", unit: "บาท/กก." },
    { key: "chanee", th: "ทุเรียนชะนี", en: "Chanee", unit: "บาท/กก." },
    { key: "kanyao", th: "ทุเรียนก้านยาว", en: "Kan Yao", unit: "บาท/กก." },
  ]
} as const;

export type VarietyKey = 
  | "jasmine" | "white" | "glutinous"  // rice
  | "monthong" | "chanee" | "kanyao";  // durian

export type CommodityKey = "rice" | "durian";

export function getVarietyInfo(commodity: CommodityKey, varietyKey: string) {
  const variety = VARIETIES[commodity].find(v => v.key === varietyKey);
  return variety || null;
}

export function getAllVarieties(commodity: CommodityKey) {
  return VARIETIES[commodity];
}
