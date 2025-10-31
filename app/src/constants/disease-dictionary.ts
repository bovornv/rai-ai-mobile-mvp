// Maps English condition names (from Plantix/custom model)
// → Thai label + quick farmer tips (shortTH/shortEN).
// Includes diseases, nutrient deficiencies, and PESTS.

export type DiseaseDictItem = {
  th: string;
  en: string;
  shortTH: string;   // farmer-friendly, 1 line
  shortEN: string;
  kind: "disease" | "deficiency" | "pest";
};

export const DISEASE_DICT: Record<string, DiseaseDictItem> = {
  // ======== RICE: DISEASES ========
  "brown spot": {
    th: "ใบจุดสีน้ำตาล", en: "Brown Spot", kind: "disease",
    shortTH: "ฉีด Strobilurin ช่วงเช้า • เลี่ยงฝน 12 ชม.",
    shortEN: "Apply strobilurin in the morning • Avoid rain for 12h"
  },
  "leaf blast": {
    th: "โรคไหม้ใบ", en: "Leaf Blast", kind: "disease",
    shortTH: "ลดไนโตรเจน • ใช้ Triazole • ตรวจซ้ำใน 2 วัน",
    shortEN: "Reduce nitrogen • Use triazole • Recheck in 2 days"
  },
  "bacterial blight": {
    th: "โรคขอบใบแห้ง", en: "Bacterial Blight", kind: "disease",
    shortTH: "ลดการกระเด็นน้ำ • ใช้แบคเทอริไซด์ตามฉลาก",
    shortEN: "Reduce splash • Use bactericide per label"
  },
  "sheath blight": {
    th: "โรคกาบใบเน่า", en: "Sheath Blight", kind: "disease",
    shortTH: "ลดความชื้นในแปลง • ระบายอากาศ",
    shortEN: "Reduce field humidity • Improve airflow"
  },
  "rice tungro virus": {
    th: "โรคใบสีส้ม/ใบหงิก (Tungro)", en: "Rice Tungro Virus", kind: "disease",
    shortTH: "ควบคุมเพลี้ยจักจั่นเขียว • ถอนต้นที่ติดเชื้อ",
    shortEN: "Control leafhoppers • Rogue infected plants"
  },

  // ======== RICE: DEFICIENCIES ========
  "nitrogen deficiency": {
    th: "ขาดไนโตรเจน", en: "Nitrogen Deficiency", kind: "deficiency",
    shortTH: "เติมยูเรีย 46-0-0 เบา ๆ • แบ่งใส่ 2 ครั้ง",
    shortEN: "Add Urea 46-0-0 lightly • Split into 2 doses"
  },
  "potassium deficiency": {
    th: "ขาดโพแทสเซียม", en: "Potassium Deficiency", kind: "deficiency",
    shortTH: "ใส่ 0-0-60 เล็กน้อย • เสริมความแข็งแรงต้น",
    shortEN: "Apply 0-0-60 lightly • Strengthens stalks"
  },

  // ======== RICE: PESTS ========
  "green leafhopper": {
    th: "เพลี้ยจักจั่นเขียว", en: "Green Leafhopper", kind: "pest",
    shortTH: "ใช้กับดัก/ชีวภัณฑ์ • ฉีดช่วงเย็นลมอ่อน",
    shortEN: "Use traps/biocontrol • Spray in calm evening"
  },
  "brown planthopper": {
    th: "เพลี้ยกระโดดสีน้ำตาล", en: "Brown Planthopper", kind: "pest",
    shortTH: "ปรับระดับน้ำ • เลี่ยงไนโตรเจนเกิน • ใช้สารกำจัดแมลงตามฉลาก",
    shortEN: "Manage water • Avoid excess N • Use insecticide per label"
  },
  "rice stem borer": {
    th: "หนอนกอข้าว", en: "Rice Stem Borer", kind: "pest",
    shortTH: "กำจัดไข่/ต้นเสีย • ใช้สารกำจัดแมลงตามฉลาก",
    shortEN: "Remove egg masses/damaged tillers • Use insecticide per label"
  },
  "rice hispa": {
    th: "ด้วงสีฟ้าข้าว (ไรซ์ฮิสปา)", en: "Rice Hispa", kind: "pest",
    shortTH: "เก็บใบเสียทิ้ง • ฉีดพ่นตอนระบาดสูง",
    shortEN: "Remove damaged leaves • Spray during peak infestation"
  },
  "armyworm": {
    th: "หนอนกระทู้", en: "Armyworm", kind: "pest",
    shortTH: "ตรวจแปลงยามเช้า • ใช้ชีวภัณฑ์ Bacillus/Spinosad",
    shortEN: "Scout in mornings • Use Bacillus/Spinosad biocontrol"
  },

  // ======== DURIAN: DISEASES ========
  "anthracnose": {
    th: "แอนแทรคโนส (ใบไหม้ทุเรียน)", en: "Anthracnose", kind: "disease",
    shortTH: "ตัดใบเสีย • ใช้ทองแดง • เลี่ยงฝน 12 ชม.",
    shortEN: "Prune leaves • Use copper • Avoid rain 12h"
  },
  "phytophthora": {
    th: "รากเน่า/โคนเน่า (ไฟทอปโทรา)", en: "Phytophthora Root Rot", kind: "disease",
    shortTH: "ระบายน้ำดี • ใช้เมทาแลกซิลตามฉลาก",
    shortEN: "Improve drainage • Apply metalaxyl per label"
  },

  // ======== DURIAN: DEFICIENCIES ========
  "boron deficiency": {
    th: "ขาดโบรอน", en: "Boron Deficiency", kind: "deficiency",
    shortTH: "ฉีดพ่นโบรอนทางใบ • ช่วยแตกยอดใหม่",
    shortEN: "Foliar boron spray • Improves new shoots"
  },
  "nitrogen deficiency durian": {
    th: "ขาดไนโตรเจน", en: "Nitrogen Deficiency (Durian)", kind: "deficiency",
    shortTH: "เติม 15-15-15 เบา ๆ • รักษาความชื้นดิน",
    shortEN: "Add 15-15-15 lightly • Maintain soil moisture"
  },

  // ======== DURIAN: PESTS ========
  "mealybug": {
    th: "เพลี้ยแป้งทุเรียน", en: "Durian Mealybug", kind: "pest",
    shortTH: "ตัดส่วนที่ระบาด • ใช้ชีวภัณฑ์/น้ำสบู่อ่อน • ฉีดพ่นตามฉลาก",
    shortEN: "Prune infested parts • Biocontrol/soap • Spray per label"
  },
  "fruit borer": {
    th: "หนอนเจาะผลทุเรียน", en: "Durian Fruit Borer", kind: "pest",
    shortTH: "ห่อผล/กำจัดผลเสีย • ใช้สารกำจัดแมลงตามฉลาก",
    shortEN: "Bag fruits/remove damaged • Use insecticide per label"
  },
  "thrips": {
    th: "ทริปส์ทุเรียน", en: "Durian Thrips", kind: "pest",
    shortTH: "ฉีดพ่นช่วงเย็น • หมุนเวียนสารตามฉลาก",
    shortEN: "Spray in evening • Rotate actives per label"
  },
  "scale insect": {
    th: "เพลี้ยหอย", en: "Scale Insect", kind: "pest",
    shortTH: "ตัดกิ่งระบาด • น้ำสบู่อ่อน/น้ำมันพืช • ฉีดตามฉลาก",
    shortEN: "Prune infested twigs • Soap/horticultural oil • Spray per label"
  }
};
