import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Fields: undefined;
  Scan: { fieldId: string; crop?: 'rice' | 'durian' };
  EditField: { fieldId: string };
  FieldReport: { fieldId: string };
  Home: undefined;
  Weather: undefined;
  Settings: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
