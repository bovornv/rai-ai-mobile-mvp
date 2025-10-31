import { ScanEntry, ScanState, ScanResult, ConfidenceBand } from '../types/ScanEntry';
import { FieldService } from './FieldService';
import { getRemedyForCondition } from './remedyRules';
import { AIService } from './AIService';
import { getAIStatus } from '../config/aiConfig';

const SCAN_STORAGE_KEY = 'scan.today';

// Web-compatible storage helper
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  }
  // For React Native, we'll need to import AsyncStorage
  return {
    getItem: async (key: string) => null,
    setItem: async (key: string, value: string) => {},
    removeItem: async (key: string) => {},
  };
};

export class ScanService {
  static async getTodayScan(): Promise<ScanEntry | null> {
    try {
      const storage = getStorage();
      const scanData = await storage.getItem(SCAN_STORAGE_KEY);
      if (!scanData) return null;
      
      const scanState: ScanState = JSON.parse(scanData);
      return scanState.today || null;
    } catch (error) {
      console.error('Error getting today scan:', error);
      return null;
    }
  }

  static async saveTodayScan(scanEntry: ScanEntry): Promise<void> {
    try {
      const storage = getStorage();
      const scanState: ScanState = { today: scanEntry };
      await storage.setItem(SCAN_STORAGE_KEY, JSON.stringify(scanState));
    } catch (error) {
      console.error('Error saving today scan:', error);
      throw error;
    }
  }

  static async clearTodayScan(): Promise<void> {
    try {
      const storage = getStorage();
      await storage.removeItem(SCAN_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing today scan:', error);
      throw error;
    }
  }

  static isToday(ts: number): boolean {
    const today = new Date();
    const scanDate = new Date(ts);
    return today.toDateString() === scanDate.toDateString();
  }

  static async analyzeImage(imageUri: string, crop: "rice" | "durian"): Promise<ScanResult> {
    try {
      console.log('Starting AI analysis for crop:', crop);
      
      // Check AI service status
      const aiStatus = getAIStatus();
      console.log('AI Service Status:', aiStatus);
      
      // Use AI service for analysis (will fallback to mock if no AI available)
      return await AIService.analyzeImage(imageUri, crop);
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error('Unable to analyze image. Please check your internet connection and try again.');
    }
  }

  static async analyzeImageMock(imageUri: string, crop: "rice" | "durian"): Promise<ScanResult> {
    // Mock analysis - fallback when AI services are not available
    const mockResults = {
      rice: [
        {
          conditionId: "rice_brown_spot",
          condition: "ใบจุดสีน้ำตาล",
          conditionEN: "Brown Spot",
          steps: [
            "ฉีดพ่นด้วยสารป้องกันเชื้อรา",
            "ลดการให้น้ำในช่วงเช้า",
            "เก็บใบที่เสียหายออกจากแปลง"
          ],
          stepsEN: [
            "Spray with fungicide",
            "Reduce morning watering",
            "Remove damaged leaves from field"
          ],
          ppe: ["หน้ากาก", "ถุงมือ"],
          sprayReason: "ฝนตก 70%",
          confidence: "high" as ConfidenceBand
        },
        {
          conditionId: "rice_blast",
          condition: "โรคใบไหม้ข้าว",
          conditionEN: "Rice Blast",
          steps: [
            "ฉีดพ่นด้วยสารป้องกันเชื้อรา",
            "ปรับปรุงการระบายน้ำ",
            "ใช้ปุ๋ยไนโตรเจนอย่างเหมาะสม"
          ],
          stepsEN: [
            "Spray with fungicide",
            "Improve drainage",
            "Use nitrogen fertilizer appropriately"
          ],
          ppe: ["หน้ากาก", "ถุงมือ", "เสื้อผ้าป้องกัน"],
          confidence: "medium" as ConfidenceBand
        },
        {
          conditionId: "rice_n_def",
          condition: "อาการขาดธาตุไนโตรเจน",
          conditionEN: "Nitrogen Deficiency",
          steps: [
            "ใส่ปุ๋ยไนโตรเจนตามอัตราที่แนะนำ",
            "รดน้ำให้สม่ำเสมอ",
            "ตรวจสอบค่า pH ของดิน"
          ],
          stepsEN: [
            "Apply nitrogen fertilizer per recommended rate",
            "Water regularly",
            "Check soil pH"
          ],
          ppe: ["ถุงมือ"],
          confidence: "medium" as ConfidenceBand
        }
      ],
      durian: [
        {
          conditionId: "durian_anthracnose",
          condition: "โรคแอนแทรคโนสทุเรียน",
          conditionEN: "Durian Anthracnose",
          steps: [
            "ฉีดพ่นด้วยสารป้องกันเชื้อรา",
            "ตัดแต่งกิ่งให้โปร่ง",
            "เก็บผลที่เสียหายออกจากต้น"
          ],
          stepsEN: [
            "Spray with fungicide",
            "Prune branches for better air circulation",
            "Remove damaged fruits from tree"
          ],
          ppe: ["หน้ากาก", "ถุงมือ"],
          confidence: "high" as ConfidenceBand
        },
        {
          conditionId: "durian_n_def",
          condition: "อาการขาดธาตุไนโตรเจน",
          conditionEN: "Nitrogen Deficiency",
          steps: [
            "ใส่ปุ๋ยไนโตรเจนตามอัตราที่แนะนำ",
            "รดน้ำให้สม่ำเสมอ",
            "ตรวจสอบค่า pH ของดิน"
          ],
          stepsEN: [
            "Apply nitrogen fertilizer per recommended rate",
            "Water regularly",
            "Check soil pH"
          ],
          ppe: ["ถุงมือ"],
          confidence: "medium" as ConfidenceBand
        },
        {
          conditionId: "durian_healthy",
          condition: "ต้นแข็งแรงดี",
          conditionEN: "Healthy Plant",
          steps: [
            "ดูแลรักษาตามปกติ",
            "ตรวจสอบสม่ำเสมอ",
            "เตรียมการป้องกันโรค"
          ],
          stepsEN: [
            "Maintain normal care",
            "Check regularly",
            "Prepare disease prevention"
          ],
          ppe: [],
          confidence: "high" as ConfidenceBand
        }
      ]
    };

    const cropResults = mockResults[crop];
    const randomResult = cropResults[Math.floor(Math.random() * cropResults.length)];
    
    // Get field info if available
    const field = await FieldService.getField();
    
    // Get remedy for this condition
    const remedy = getRemedyForCondition(randomResult.conditionId);
    
    return {
      condition: randomResult.condition,
      conditionEN: randomResult.conditionEN,
      steps: randomResult.steps,
      stepsEN: randomResult.stepsEN,
      ppe: randomResult.ppe,
      sprayReason: randomResult.sprayReason || undefined,
      confidence: randomResult.confidence,
      timestamp: new Date().toISOString(),
      fieldName: field?.name,
      remedy,
    };
  }

  static getConfidenceText(confidence: "high" | "medium" | "low"): string {
    switch (confidence) {
      case "high": return "แน่ใจมาก";
      case "medium": return "ปานกลาง";
      case "low": return "น้อย";
    }
  }

  static getConfidenceColor(confidence: "high" | "medium" | "low"): string {
    switch (confidence) {
      case "high": return "good";
      case "medium": return "caution";
      case "low": return "dont";
    }
  }

  static getRelativeTime(timestamp: string): string {
    const now = new Date();
    const scanTime = new Date(timestamp);
    const diffMs = now.getTime() - scanTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `เมื่อ ${diffHours} ชั่วโมงที่แล้ว`;
    } else if (diffMinutes > 0) {
      return `เมื่อ ${diffMinutes} นาทีที่แล้ว`;
    } else {
      return "เมื่อสักครู่";
    }
  }
}
