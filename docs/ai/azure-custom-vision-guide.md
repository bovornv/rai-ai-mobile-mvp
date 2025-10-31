# Rai AI — Azure Custom Vision Labeling Guide (MVP)

This guide standardizes class names and mapping so the Scan page can convert Azure predictions into farmer-friendly Thai advice.

## Classes (MVP)
Use these exact labels in your Custom Vision project:

| label | crop | TH name | EN name | type |
|---|---|---|---|---|
| rice_brown_spot | rice | ใบจุดสีน้ำตาล | Rice Brown Spot | disease |
| rice_leaf_blast | rice | โรคไหม้ใบ | Rice Leaf Blast | disease |
| rice_n_deficiency | rice | ขาดไนโตรเจน | Nitrogen Deficiency | deficiency |
| rice_potassium_def | rice | ขาดโพแทสเซียม | Potassium Deficiency | deficiency |
| rice_healthy | rice | ปกติ/สุขภาพดี | Healthy | healthy |
| durian_anthracnose | durian | แอนแทรคโนส | Anthracnose | disease |
| durian_n_deficiency | durian | ขาดไนโตรเจน | Nitrogen Deficiency | deficiency |
| durian_mealybug | durian | เพลี้ยแป้งทุเรียน | Durian Mealybug | pest |
| durian_healthy | durian | ปกติ/สุขภาพดี | Healthy | healthy |

## Dataset Tips
- Per class: target 80–150 images minimum (balanced).
- Angles: top/oblique; mix lighting, backgrounds, phones.
- Quality: leaf fills ~70–90% frame; avoid blur.
- Negatives: include healthy leaves for both crops.
- Split: 80% train / 20% validation.

## Project Setup
1. Classification (Multiclass) project.
2. Add tags with the exact labels above.
3. Upload & tag images.
4. Train (Quick Training) and Publish as `raiai-mvp`.
5. Copy Prediction endpoint + key to env.

## App Mapping
Keep a mapping like:

```ts
const MAP = {
  rice_brown_spot:     { crop:"rice",   th:"ใบจุดสีน้ำตาล", en:"Rice Brown Spot",    tip:"ฉีดเช้า ลมอ่อน • เลี่ยงฝน 12 ชม." },
  rice_leaf_blast:     { crop:"rice",   th:"โรคไหม้ใบ",      en:"Rice Leaf Blast",     tip:"ลดไนโตรเจน • ใช้สารกลุ่ม Triazole" },
  rice_n_deficiency:   { crop:"rice",   th:"ขาดไนโตรเจน",   en:"Nitrogen Deficiency", tip:"เติมยูเรีย 46-0-0 เบา ๆ • แบ่งใส่" },
  rice_potassium_def:  { crop:"rice",   th:"ขาดโพแทสเซียม", en:"Potassium Deficiency", tip:"ใส่ 0-0-60 เล็กน้อย • เสริมความแข็งแรงต้น" },
  rice_healthy:        { crop:"rice",   th:"ปกติ/สุขภาพดี", en:"Healthy",             tip:"เฝ้าดูอาการต่อเนื่อง" },
  durian_anthracnose:  { crop:"durian", th:"แอนแทรคโนส",    en:"Anthracnose",         tip:"ตัดใบเสีย • ใช้ทองแดง • เลี่ยงฝน" },
  durian_n_deficiency: { crop:"durian", th:"ขาดไนโตรเจน",   en:"Nitrogen Deficiency", tip:"เติม 15-15-15 เบา ๆ • รักษาความชื้น" },
  durian_mealybug:     { crop:"durian", th:"เพลี้ยแป้งทุเรียน", en:"Durian Mealybug", tip:"ตัดส่วนที่ระบาด • ชีวภัณฑ์/น้ำสบู่ • ฉีดตามฉลาก" },
  durian_healthy:      { crop:"durian", th:"ปกติ/สุขภาพดี", en:"Healthy",             tip:"เฝ้าดูอาการต่อเนื่อง" },
} as const;
```

## Decision & Bands
- Use Top-1 prediction. If probability < 0.55 → show 'uncertain' (ask for 1–2 more photos).
- High ≥ 0.80, Medium 0.60–0.79, Low < 0.60.

## API
The app calls Azure Prediction API with:
- AZURE_CV_ENDPOINT
- AZURE_CV_PROJECT_ID
- AZURE_CV_PUBLISHED_NAME
- AZURE_CV_PREDICTION_KEY

See `src/services/scan-azure.ts`.

## Versioning
When retraining, publish a new iteration with the same Published Name to keep the app stable.
