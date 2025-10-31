# Rai AI Mobile App MVP Checklist

## Phase 1 – Setup
- [ ] Initialize Expo project.
- [ ] Add React Navigation, i18next, Expo Camera, Expo Location.
- [ ] Set Thai default language; enable English toggle.

## Phase 2 – UI
- [ ] Use Noto Sans Thai large font.
- [ ] Add bottom tab navigation (Home, Scan, Fields, Weather, Settings).
- [ ] Apply soft green theme, rounded cards, big icons.

## Phase 3 – Core Pages
### Home
- [ ] Display spray window (12h: Good/Caution/Don’t spray).
- [ ] Show prices (rice/durian + source).

### Scan
- [ ] Combine camera + upload zone.
- [ ] Auto-analyze on first image (mock model).
- [ ] Display result, PPE, disclaimer.
- [ ] 1 scan/day (overwrite).

### Fields
- [ ] Editable: crop, area, location.
- [ ] Show progress bar + spray window.
- [ ] Offline data persistence.

### Weather
- [ ] 7-day forecast + spray window.
- [ ] Editable location (manual or GPS).

### Settings
- [ ] Language switch ไทย / English.
- [ ] Show app version + offline indicator.

## Phase 4 – Offline + QA
- [ ] Cache weather, prices, field data (3 days).
- [ ] Test offline (airplane mode).
- [ ] Build APK via EAS.
