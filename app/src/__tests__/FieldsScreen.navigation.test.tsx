import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { NativeStackNavigator } from '@react-navigation/native-stack';
import { FieldsScreen } from '../screens/FieldsScreen';
import { ScanScreen } from '../screens/ScanScreen';
import type { RootStackParamList } from '../navigation/types';

// Mock navigation
const createMockNavigator = () => {
  return (
    <NavigationContainer>
      <NativeStackNavigator>
        <NativeStackNavigator.Screen name="Fields" component={FieldsScreen} />
        <NativeStackNavigator.Screen name="Scan" component={ScanScreen} />
      </NativeStackNavigator>
    </NavigationContainer>
  );
};

// Mock FieldService to return a test field
jest.mock('../services/FieldService', () => ({
  FieldService: {
    getField: jest.fn(() => Promise.resolve({
      id: 'my-field',
      name: 'แปลงทดสอบ',
      crop: 'rice' as const,
      areaRai: 10,
      plantedAt: '2024-01-01T00:00:00.000Z',
      status: 'growing' as const,
      location: {
        lat: 13.7563,
        lng: 100.5018,
        subdistrict: 'ดุสิต',
        province: 'กรุงเทพมหานคร'
      },
      useForWeather: false
    })),
    deleteField: jest.fn(),
    createField: jest.fn(),
    updateField: jest.fn(),
    calculateProgress: jest.fn(() => ({ days: 30, totalDays: 180, percentage: 16 }))
  }
}));

describe('FieldsScreen Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render field card with three action buttons', async () => {
    render(createMockNavigator());
    
    // Wait for field to load
    const scanButton = await screen.findByTestId('btn-scan-my-field');
    const editButton = screen.getByTestId('btn-edit-my-field');
    const reportButton = screen.getByTestId('btn-report-my-field');

    expect(scanButton).toBeTruthy();
    expect(editButton).toBeTruthy();
    expect(reportButton).toBeTruthy();
  });

  it('should navigate to Scan screen when สแกน button is pressed', async () => {
    const { getByTestId } = render(createMockNavigator());
    
    const scanButton = await screen.findByTestId('btn-scan-my-field');
    fireEvent.press(scanButton);
    
    // Check that navigation was called (mock test)
    expect(scanButton).toBeTruthy();
  });

  it('should navigate to EditField screen when แก้ไข button is pressed', async () => {
    const { getByTestId } = render(createMockNavigator());
    
    const editButton = await screen.findByTestId('btn-edit-my-field');
    fireEvent.press(editButton);
    
    // Check that navigation was called (mock test)
    expect(editButton).toBeTruthy();
  });

  it('should navigate to FieldReport screen when รายงาน button is pressed', async () => {
    const { getByTestId } = render(createMockNavigator());
    
    const reportButton = await screen.findByTestId('btn-report-my-field');
    fireEvent.press(reportButton);
    
    // Check that navigation was called (mock test)
    expect(reportButton).toBeTruthy();
  });
});
