import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { FieldsScreen } from '../screens/FieldsScreen';
import { WeatherScreen } from '../screens/WeatherScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import FieldFormScreen from '../screens/FieldFormScreen';

type Screen = 'home' | 'scan' | 'fields' | 'weather' | 'settings' | 'fieldform';
type NavParams = { fieldId?: string; crop?: string; [key: string]: any };
type NavState = { screen: Screen; params?: NavParams };

export const SimpleNavigator: React.FC = () => {
  const { t } = useTranslation();
  const [navState, setNavState] = useState<NavState>({ screen: 'home' });

  // Minimal screens array (labels from i18n)
  const screens = [
    { key: 'home', title: t('home.title'), icon: 'home' as const },
    { key: 'scan', title: t('scan.title'), icon: 'camera' as const },
    { key: 'fields', title: t('fields.title'), icon: 'leaf' as const },
    { key: 'weather', title: t('weather.title'), icon: 'cloud' as const },
    { key: 'settings', title: t('settings.title'), icon: 'settings' as const },
  ] as const;

  // Simple navigation
  const navigation = {
    navigate: (screen: string | Screen) => {
      try {
        if (!screen || typeof screen !== 'string') {
          console.error('Navigation error: Invalid screen parameter:', screen);
          return;
        }
        const lowerScreen = screen.toLowerCase() as Screen;
        setNavState({ screen: lowerScreen });
      } catch (error) {
        console.error('Navigation error:', error);
      }
    },
    goBack: () => {}
  };

  const renderScreen = () => {
    try {
      switch (navState.screen) {
        case 'home':
          return <HomeScreen navigation={navigation as any} />;
        case 'scan':
          return <ScanScreen route={{ params: {} }} navigation={navigation as any} />;
        case 'fields':
          return <FieldsScreen navigation={navigation as any} />;
        case 'weather':
          return <WeatherScreen navigation={navigation as any} />;
        case 'settings':
          return <SettingsScreen navigation={navigation as any} />;
        case 'fieldform':
          return <FieldFormScreen navigation={navigation as any} route={{ params: {} }} />;
        default:
          return <HomeScreen navigation={navigation as any} />;
      }
    } catch (error) {
      console.error('Screen render error:', error);
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, textAlign: 'center' }}>
            Screen Error: {navState.screen}
          </Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666', marginTop: 10 }}>
            {error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t('common.appName')}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {screens.map((screen) => (
          <TouchableOpacity
            key={screen.key}
            style={[styles.navItem, navState.screen === screen.key && styles.navItemActive]}
            onPress={() => navigation.navigate(screen.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={navState.screen === screen.key ? screen.icon : `${screen.icon}-outline` as any}
              size={24}
              color={navState.screen === screen.key ? theme.colors.primary : theme.colors.muted}
            />
            <Text style={[styles.navText, navState.screen === screen.key && styles.navTextActive]}>
              {screen.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  headerBar: {
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 12,
    paddingHorizontal: theme.spacing(2),
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary + '20',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.bg,
    paddingVertical: 8,
    paddingBottom: 8,
    height: 60,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navItemActive: {
    backgroundColor: theme.colors.bg,
  },
  navText: {
    fontSize: theme.type.caption,
    marginTop: 2,
    color: theme.colors.muted,
  },
  navTextActive: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
});
