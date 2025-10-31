# Rai AI Mobile App MVP

A mobile application designed for Thai farmers to help with agricultural decision-making through AI-assisted disease scanning, offline weather data, and field tracking.

## Features

### 🏠 Home Page
- Today's date and location display
- Spray Window indicator (Good/Caution/Don't spray)
- Real-time crop prices (Rice and Durian)
- Language toggle (Thai/English)

### 📸 Scan Page
- Camera and upload functionality
- Mock AI disease analysis
- Confidence levels and recommendations
- PPE requirements
- One scan per day limit

### 🌾 Fields Page
- Single field management (MVP limitation)
- Crop type, area, and location tracking
- Planting progress visualization
- Spray recommendations based on weather

### 🌤️ Weather Page
- 7-day weather forecast
- Temperature, humidity, wind, and pressure data
- Spray window recommendations
- Location editing (manual or GPS)

### ⚙️ Settings Page
- Language switching (Thai/English)
- Offline mode indicator
- Cache management
- App information and support

## Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs)
- **Internationalization**: i18next
- **Storage**: AsyncStorage for offline functionality
- **UI**: Custom components with Kakao-inspired design
- **Fonts**: Noto Sans Thai (large, readable)

## Design Principles

- **Thai-first**: Default language is Thai with English support
- **Offline-first**: Works without internet connection
- **Farmer-friendly**: Large fonts, simple text, high contrast
- **Accessibility**: Touch-friendly with 48dp minimum touch targets
- **Calm UI**: Soft colors, rounded corners, medical-grade feel

## Color Palette

- **Primary**: Green (#15803D)
- **Primary Alt**: Teal (#0F766E)
- **Success**: Green (#16A34A)
- **Warning**: Amber (#F59E0B)
- **Danger**: Red (#DC2626)
- **Background**: Light Gray (#F6F8FA)
- **Surface**: White (#FFFFFF)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on device:
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
├── navigation/         # Navigation configuration
├── services/           # Data services and storage
├── theme/             # Design system and colors
├── locales/           # Translation files
└── i18n/              # Internationalization setup
```

## Offline Functionality

The app is designed to work offline with:
- Cached weather data (3 days)
- Cached price data
- Field data persistence
- Scan result storage
- Automatic sync when online

## Target Users

- Thai farmers (primary)
- Android users (primary)
- iOS users (secondary)
- Users with limited internet connectivity
- Users who prefer Thai language interface

## MVP Success Metrics

- < 3 taps for key information access
- D7 retention > 25%
- 1,000+ active farmers in 3 months

## Development Notes

- Uses mock data for development
- Real API integration planned for production
- Font loading with splash screen
- Optimized for low-end Android devices
- Follows Material Design principles with Thai localization
