import AsyncStorage from '@react-native-async-storage/async-storage';
import { Field, FieldFormData } from '../types/Field';

const FIELD_STORAGE_KEY = 'my_field';

// Web-compatible storage helper
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  }
  return AsyncStorage;
};

export class FieldService {
  static async getField(): Promise<Field | null> {
    try {
      const storage = getStorage();
      const fieldData = await storage.getItem(FIELD_STORAGE_KEY);
      return fieldData ? JSON.parse(fieldData) : null;
    } catch (error) {
      console.error('Error getting field:', error);
      return null;
    }
  }

  static async saveField(field: Field): Promise<void> {
    try {
      const storage = getStorage();
      await storage.setItem(FIELD_STORAGE_KEY, JSON.stringify(field));
    } catch (error) {
      console.error('Error saving field:', error);
      throw error;
    }
  }

  static async deleteField(): Promise<void> {
    try {
      const storage = getStorage();
      await storage.removeItem(FIELD_STORAGE_KEY);
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  }

  static async createField(formData: FieldFormData, location?: { lat: number; lng: number; subdistrict: string; province: string }): Promise<Field> {
    const field: Field = {
      id: 'my-field',
      name: formData.name,
      crop: formData.crop,
      areaRai: formData.areaRai,
      plantedAt: formData.plantedAt,
      status: this.calculateStatus(formData.plantedAt),
      location: location || null,
      useForWeather: formData.useForWeather,
    };

    await this.saveField(field);
    return field;
  }

  static async updateField(formData: FieldFormData, location?: { lat: number; lng: number; subdistrict: string; province: string }): Promise<Field> {
    const existingField = await this.getField();
    if (!existingField) {
      throw new Error('No field to update');
    }

    const updatedField: Field = {
      ...existingField,
      name: formData.name,
      crop: formData.crop,
      areaRai: formData.areaRai,
      plantedAt: formData.plantedAt,
      status: this.calculateStatus(formData.plantedAt),
      location: location || existingField.location,
      useForWeather: formData.useForWeather,
    };

    await this.saveField(updatedField);
    return updatedField;
  }

  static calculateStatus(plantedAt: string): "preplant" | "growing" | "harvest" {
    const plantedDate = new Date(plantedAt);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return "preplant";
    if (daysDiff < 60) return "growing";
    return "harvest";
  }

  static calculateProgress(plantedAt: string): { days: number; totalDays: number; percentage: number } {
    const plantedDate = new Date(plantedAt);
    const today = new Date();
    const days = Math.max(0, Math.floor((today.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Default crop cycle: 70 days for rice, 90 days for durian
    const totalDays = 70; // We'll make this dynamic based on crop type later
    const percentage = Math.min(100, (days / totalDays) * 100);

    return { days, totalDays, percentage };
  }

  static validateField(formData: FieldFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Name validation
    if (!formData.name.trim()) {
      errors.push('กรุณาใส่ชื่อแปลง');
    } else if (formData.name.length > 24) {
      errors.push('ชื่อแปลงต้องไม่เกิน 24 ตัวอักษร');
    }

    // Area validation
    if (formData.areaRai < 0.1 || formData.areaRai > 999) {
      errors.push('ขนาดแปลงต้องอยู่ระหว่าง 0.1-999 ไร่');
    }

    // Date validation
    const plantedDate = new Date(formData.plantedAt);
    const today = new Date();
    if (plantedDate > today) {
      errors.push('วันที่ปลูกต้องไม่ใช่ในอนาคต');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
