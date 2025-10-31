import React, { useEffect, useState } from 'react';
import { Platform, View, Text, DeviceEventEmitter } from 'react-native';
import { SimpleNavigator } from './src/navigation/SimpleNavigator';
import './src/i18n';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './src/i18n';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>App Error</Text>
          <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 10 }}>
            Something went wrong. Please restart the app.
          </Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666' }}>
            Error: {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [appError, setAppError] = useState(null);
  const [fontSizeKey, setFontSizeKey] = useState<'small'|'medium'|'large'>('medium');

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'NotoSansThai-Regular': require('./assets/fonts/NotoSansThai-Regular.ttf'),
          'NotoSansThai-Medium': require('./assets/fonts/NotoSansThai-Medium.ttf'),
          'NotoSansThai-Bold': require('./assets/fonts/NotoSansThai-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
        setFontsLoaded(true); // Continue even if fonts fail to load
      }
    }
    
    try {
      loadFonts();
    } catch (error) {
      console.error('App initialization error:', error);
      setAppError(error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedLang = await AsyncStorage.getItem('app.language');
        if (savedLang === 'th' || savedLang === 'en') {
          try { await i18n.changeLanguage(savedLang); } catch {}
        }
      } catch {}
      try {
        const savedSize = await AsyncStorage.getItem('app.fontSize');
        if (savedSize === 'small' || savedSize === 'medium' || savedSize === 'large') {
          setFontSizeKey(savedSize);
        }
      } catch {}
    })();

    const subLang = DeviceEventEmitter.addListener('app.languageChanged', async (l) => {
      try { await i18n.changeLanguage(l); } catch {}
      try { await AsyncStorage.setItem('app.language', l); } catch {}
    });
    const subSize = DeviceEventEmitter.addListener('app.fontSizeChanged', async (s) => {
      setFontSizeKey(s);
      try { await AsyncStorage.setItem('app.fontSize', s); } catch {}
    });
    return () => {
      try { subLang.remove(); } catch {}
      try { subSize.remove(); } catch {}
    };
  }, []);

  // Apply global Text font scaling
  const sizeMap = fontSizeKey === 'small' ? 16 : fontSizeKey === 'large' ? 22 : 18;
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.style = [ (Text as any).defaultProps.style, { fontSize: sizeMap } ];

  if (appError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Initialization Error</Text>
        <Text style={{ fontSize: 14, textAlign: 'center' }}>
          Failed to start app. Please restart.
        </Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SimpleNavigator />
    </ErrorBoundary>
  );
}