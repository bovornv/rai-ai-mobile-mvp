import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { FieldsScreen } from '../screens/FieldsScreen';
import FieldFormScreen from '../screens/FieldFormScreen';
import { WeatherScreen } from '../screens/WeatherScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Conditional imports for native modules
let Tab: any;
let Stack: any;
let NavigationContainer: any;

if (Platform.OS !== 'web') {
  const RN = require('@react-navigation/bottom-tabs');
  const RNNative = require('@react-navigation/native-stack');
  const RNNav = require('@react-navigation/native');
  Tab = RN.createBottomTabNavigator();
  Stack = RNNative.createNativeStackNavigator();
  NavigationContainer = RNNav.NavigationContainer;
}

export const AppNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Scan':
                iconName = focused ? 'camera' : 'camera-outline';
                break;
              case 'Fields':
                iconName = focused ? 'leaf' : 'leaf-outline';
                break;
              case 'Weather':
                iconName = focused ? 'cloud' : 'cloud-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'home-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.bg,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: theme.type.caption,
            fontWeight: '500',
            marginTop: 2,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.bg,
          },
          headerTitleStyle: {
            fontSize: theme.type.title,
            fontWeight: '600',
            color: theme.colors.text,
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: t('home.title'),
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Scan" 
          component={ScanScreen}
          options={{ 
            title: t('scan.title'),
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Fields" 
          component={FieldsStackNavigator}
          options={{ 
            title: t('fields.title'),
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Weather" 
          component={WeatherScreen}
          options={{ 
            title: t('weather.title'),
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: t('settings.title'),
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Stack Navigator for Fields-related screens
const FieldsStackNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="Fields" 
        component={FieldsScreen}
        options={{ 
          title: t('fields.title'),
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="FieldForm" 
        component={FieldFormScreen}
        options={{ 
          title: t('fields.title'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="Scan" 
        component={ScanScreen}
        options={{ 
          title: t('scan.title'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="EditField" 
        component={EditFieldScreen}
        options={{ 
          title: t('fields.actions.editField'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="FieldReport" 
        component={FieldReportScreen}
        options={{ 
          title: t('fields.actions.report'),
        }}
      />
    </Stack.Navigator>
  );
};

// Placeholder screens that will be implemented
const EditFieldScreen = () => {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.bg }}>
      <Text style={{ fontSize: theme.type.title, color: theme.colors.text, marginBottom: theme.spacing(2) }}>
        {t('fields.actions.editField')}
      </Text>
      <Text style={{ fontSize: theme.type.body, color: theme.colors.muted }}>
        Coming soon...
      </Text>
    </View>
  );
};

const FieldReportScreen = () => {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.bg }}>
      <Text style={{ fontSize: theme.type.title, color: theme.colors.text, marginBottom: theme.spacing(2) }}>
        {t('fields.actions.report')}
      </Text>
      <Text style={{ fontSize: theme.type.body, color: theme.colors.muted }}>
        Coming soon...
      </Text>
    </View>
  );
};
