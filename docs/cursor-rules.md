# Rai AI – Cursor Rules (Mobile App MVP)

## 0) Mission
- Build a **Thai-first, offline-friendly** Android-focused app (iOS ok later).
- Users: Thai farmers in rural areas. **Big text, simple words, few taps.**
- Design: **Calm medical-grade** look (Kakao-style) + soft agri green.

## 1) Tech & Project Defaults
- Stack: **Expo + React Native + TypeScript (strict)**, Zustand store, React Navigation.
- i18n: i18next; **default TH**, EN optional. Font: **Noto Sans Thai**.
- State: colocate hooks in `/src/store/*`. No Redux.
- Networking: `axios` + retry. Cache with `AsyncStorage`.
- Dates: `dayjs` (TH locale).
- Forms: `react-hook-form` + zod.

## 2) MVP Scope (do not exceed)
- **Scan**: 1 photo/day, overwrite previous. Use **Azure Custom Vision** (config via env). Show label, **Confidence: High/Med/Low**, simple 1-3 step advice, PPE line.
- **Fields**: **max 1 field**. Name, crop (rice/durian), area (ไร่), location (ตำบล/จังหวัด), polygon edit. Buttons **Scan / Edit / Report** must navigate with `fieldId`.
- **Weather**: today + 7-day; **Spray Window** for **today** only (Good / Caution / Don’t spray) with reason.
- **Prices**: Today only; **ข้าว (หอมมะลิ) = บ./ตัน**, **ทุเรียน (หมอนทอง) = บ./กก.** + small **source**. Read-only.
- **Settings**: language TH/EN, font size (L/XL), data reset, version.
- **Offline**: App works without internet for Scan, Fields, last weather & prices.

## 3) UX Rules
- Large tap targets (min 44dp). No hidden gestures.
- Always show **today’s date** + **location** under app title on Home.
- Spray card = one-line summary (“วันนี้: ระวังลมแรง”) + best times row.
- Empty states: friendly Thai sentences + 1 primary CTA.
- Respect system dark/light but default light.

## 4) Navigation Contracts
- Routes:
  - `Fields`, `Scan:{fieldId,crop?}`, `EditField:{fieldId}`, `FieldReport:{fieldId}`,
  - `Weather`, `Settings`, `Home`.
- Every button has `testID` and `accessibilityRole="button"`.
- If `fieldId` missing → show error + back to `Fields`.

## 5) Data & APIs (use env only)
- Weather: Meteosource (primary) → OWM fallback.
- Prices: DIT scraper/service (server or mock) → **read-only in MVP**.
- Scan: Azure Custom Vision Prediction:
  - `AZURE_CV_ENDPOINT`, `AZURE_CV_PREDICTION_KEY`, `AZURE_CV_PROJECT_ID`, `AZURE_CV_PUBLISHED_NAME`.
- **No secrets in repo.** Use **EAS Secrets**. Never log keys.

## 6) Performance & Offline
- Cache: `priceCache.json`, `weatherCache.json`, `scanResult.json`, `fields.json`.
- Stale-while-revalidate: show cached instantly; refresh in background.
- Images compressed before upload (<= 1MB, 1024px max).
- App must boot offline.

## 7) Accessibility & Text
- All Thai strings via `t('…')`. Keep sentences ≤ 12 words.
- Headings 20–22, body 16–18 (responsive). Icons with labels.

## 8) Coding Standards
- ESLint + Prettier + TypeScript strict. No `any`.
- Folder layout:
  ```
  src/
    screens/
    components/
    store/
    services/ (scan-azure.ts, weather.ts, prices.ts)
    navigation/
    i18n/
    theme/
  ```
- Reusable cards/buttons in `components/ui`.

## 9) Feature DoD (Definition of Done)
- UI matches Kakao-inspired style; TH default works.
- Works **offline**; no crash if APIs fail.
- Unit test (or smoke test) for navigation of **Scan/Edit/Report** from Fields.
- **1 scan/day rule enforced**; overwrites previous.
- Prices show **unit** + **source**; Weather shows **location**.
- All strings in i18n; no hard-coded Thai/English in components.
- No secret in code; build passes EAS.

## 10) Tasks Cursor Can Auto-Do
- **Wire buttons** with real `onPress` → navigate with params.
- Implement `scan-azure.ts` (POST binary; map tag → label + confidence bucket).
- Cache helpers: `readCache(key)`, `writeCache(key, value)`, TTL.
- Spray Window service: compute Good/Caution/Don’t based on wind, rain, RH, temp.
- Price & weather loaders with SWR pattern.
- Add `SettingsScreen`: language toggle, font size (L/XL), clear cache.
- Add Jest smoke tests for Fields buttons; add `testID`s.

## 11) Security & Releases
- Secrets via EAS (`eas secret:create`); never commit `.env`.
- App icon/splash done; remove debug overlays before release.
- Android primary; iOS later.

## 12) Git Flow & Commits
- Branch per feature: `feat/<area>-<short>`.
- Commit format:
  - `feat(scan): enforce 1-scan/day and overwrite`
  - `fix(fields): wire Scan/Edit/Report buttons`
- PR must state acceptance criteria and screenshots.

## 13) When Unclear
- Prefer **minimum** working version that fits MVP scope.
- Leave `// TODO(rai-mvp): …` with date; open a small issue.
- Never block on copy — ship TH first, add EN later.

### Acceptance Criteria (paste into issues)
- Buttons on **Fields** navigate to **Scan / EditField / FieldReport** with `{fieldId}`.
- **Home** shows: Today date, Location, Spray summary, Today prices, “Scan now”.
- **Scan**: 1/day; shows label + **Confidence** + 1–3 step advice; **Save** → overwrites.
- **Weather**: today + 7-day; Spray Window for **today** only with reason.
- **Settings**: TH/EN toggle works; font size changes app-wide; version visible.
- App boots, navigates, and shows cached data **without internet**.
