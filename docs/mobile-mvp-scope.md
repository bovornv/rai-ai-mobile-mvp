# Rai AI Mobile App MVP Scope

## Overview
Rai AI Mobile App MVP targets **Thai farmers**, most of whom use **Android**, with optional iOS support. The app must be **offline-first**, use **Thai as the default language**, and support **English**. UI should feature **large fonts**, **simple text**, and **high contrast** visuals for readability.

---

## Core Goals
- Enable farmers to access weather, field, and scan tools easily.
- Ensure the app works **offline** (auto-sync when online).
- Default Thai text using **Noto Sans Thai (large)**.
- Keep navigation simple — 5 tabs: Home, Scan, Fields, Weather, Settings.

---

## Features

### 1️⃣ Home Page
- Today’s date + location (ตำบล, จังหวัด).
- **Spray Window (12h)**: Good / Caution / Don’t spray.
- Show today’s prices:
  - ข้าว (หอมมะลิ): บาท/ตัน
  - ทุเรียน (หมอนทอง): บาท/กก
  - Include source line (“ข้อมูลจาก กรมการค้าภายใน”).
- Switch tabs between rice & durian.

### 2️⃣ Scan Page
- Camera + upload combined in one area.
- Auto-analysis after first photo (mock AI model).
- Display:
  - Disease/deficiency name (Thai first).
  - Confidence level (สูง / ปานกลาง / ต่ำ).
  - 3 Thai recommendations.
  - PPE (mask, gloves).
  - Disclaimer: “ผลลัพธ์เป็นคำแนะนำจาก AI—โปรดสังเกตอาการจริงร่วมด้วย.”
- Limit to 1 scan/day (overwrite old).

### 3️⃣ Fields Page
- One editable field (MVP limit).
- Fields: crop (ข้าว/ทุเรียน), area (ไร่), location.
- Progress bar: days planted vs cycle.
- Sync spray recommendation with weather.
- Works offline (cached).

### 4️⃣ Weather Page
- 7-day forecast: wind, humidity, temp.
- Editable location (ตำบล/จังหวัด or GPS).
- “ใช้ข้อมูลล่าสุดเมื่อ…” timestamp.
- Spray Window included.

### 5️⃣ Settings Page
- Language: ไทย / English.
- Offline Mode indicator.
- App info: version, contact, sources.

---

## UI / UX Guidelines
- Font: **Noto Sans Thai** (Large).  
- Design: **rounded cards, big buttons, soft green/teal palette**.  
- Headers: always display “ไร่ AI (Rai AI)”.  
- Language toggle in Settings (Thai default).  

---

## Offline Design
- Cache for weather, prices, and fields (3 days).  
- All pages usable offline.  
- Sync banner: “กำลังอัปเดตข้อมูล…”  

---

## Tech Stack
- **Framework:** React Native (Expo)
- **Languages:** TypeScript, i18n
- **Storage:** AsyncStorage / SQLite
- **APIs:** MeteoSource (weather), internal mock (prices, scan)
- **Deployment:** EAS Build → APK (Android), TestFlight (iOS)

---

## MVP Success
- < 3 taps for key info.
- D7 retention >25%.
- 1,000+ active farmers in 3 months.
