// AI Service for Plant Disease Detection
import { ScanResult, ConfidenceBand } from '../types/ScanEntry';
import { getRemedyForCondition } from './remedyRules';
import { FieldService } from './FieldService';
import { getBestAIConfig, AIConfig } from '../config/aiConfig';

export interface AIPrediction {
  conditionId: string;
  condition: string;
  conditionEN: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class AIService {
  private static config: AIConfig | null = null;

  static initialize() {
    this.config = getBestAIConfig();
    console.log('AI Service initialized with provider:', this.config?.provider || 'none');
  }

  static setConfig(config: AIConfig) {
    this.config = config;
  }

  static async analyzeImage(imageUri: string, crop: "rice" | "durian"): Promise<ScanResult> {
    try {
      console.log('Starting AI analysis for crop:', crop);
      
      // Initialize config if not already done
      if (!this.config) {
        this.initialize();
      }
      
      // If no valid AI config, throw error
      if (!this.config || this.config.provider === 'mock') {
        throw new Error('No AI service configured. Please configure an AI provider in the settings.');
      }
      
      // Convert image to base64 for API calls
      const base64Image = await this.convertImageToBase64(imageUri);
      
      // Get predictions from AI model
      const predictions = await this.getPredictions(base64Image, crop);
      
      // Process predictions and get the best result
      const bestPrediction = this.selectBestPrediction(predictions, crop);
      
      // Get field info if available
      const field = await FieldService.getField();
      
      // Get remedy for this condition
      const remedy = getRemedyForCondition(bestPrediction.conditionId);
      
      // Generate steps based on condition
      const steps = this.generateSteps(bestPrediction, crop);
      const stepsEN = this.generateStepsEN(bestPrediction, crop);
      
      // Generate PPE requirements
      const ppe = this.generatePPE(bestPrediction);
      
      // Generate spray reason if applicable
      const sprayReason = this.generateSprayReason(bestPrediction);
      
      return {
        condition: bestPrediction.condition,
        conditionEN: bestPrediction.conditionEN,
        steps,
        stepsEN,
        ppe,
        sprayReason,
        confidence: this.convertConfidence(bestPrediction.confidence),
        timestamp: new Date().toISOString(),
        fieldName: field?.name,
        remedy,
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error('Unable to analyze image. Please check your internet connection and try again.');
    }
  }

  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // For web, we can use fetch to get the image
      if (typeof window !== 'undefined') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      
      // For React Native, we would use a different approach
      // This is a simplified version - in production, use react-native-fs or similar
      throw new Error('Image conversion not implemented for React Native');
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  private static async getPredictions(base64Image: string, crop: "rice" | "durian"): Promise<AIPrediction[]> {
    if (!this.config) {
      throw new Error('AI service not configured');
    }
    
    switch (this.config.provider) {
      case 'plantix':
        return this.analyzeWithPlantix(base64Image, crop);
      case 'plantnet':
        return this.analyzeWithPlantNet(base64Image, crop);
      case 'google':
        return this.analyzeWithGoogle(base64Image, crop);
      case 'azure':
        return this.analyzeWithAzure(base64Image, crop);
      case 'aws':
        return this.analyzeWithAWS(base64Image, crop);
      case 'local':
        return this.analyzeWithLocalModel(base64Image, crop);
      default:
        throw new Error(`Unsupported AI provider: ${this.config.provider}`);
    }
  }

  private static async analyzeWithPlantix(base64Image: string, crop: "rice" | "durian"): Promise<AIPrediction[]> {
    if (!this.config) throw new Error('AI service not configured');
    
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          image: base64Image,
          crop_type: crop,
          language: 'th',
        }),
      });

      if (!response.ok) {
        throw new Error(`Plantix API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Map Plantix response to our format
      return data.predictions?.map((pred: any) => ({
        conditionId: this.mapPlantixConditionId(pred.disease_id, crop),
        condition: pred.disease_name_th || pred.disease_name,
        conditionEN: pred.disease_name_en || pred.disease_name,
        confidence: pred.confidence || 0.5,
        boundingBox: pred.bounding_box,
      })) || [];
    } catch (error) {
      console.error('Plantix API error:', error);
      throw error;
    }
  }

  private static async analyzeWithPlantNet(base64Image: string, crop: "rice" | "durian"): Promise<AIPrediction[]> {
    try {
      const response = await fetch('https://my-api.plantnet.org/v2/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [base64Image],
          modifiers: ['crops'],
          plant_language: 'th',
          plant_net_language: 'th',
        }),
      });

      if (!response.ok) {
        throw new Error(`PlantNet API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.results?.map((result: any) => ({
        conditionId: this.mapPlantNetConditionId(result.species?.scientificNameWithoutAuthor, crop),
        condition: result.species?.scientificNameWithoutAuthor || 'Unknown',
        conditionEN: result.species?.scientificNameWithoutAuthor || 'Unknown',
        confidence: result.score || 0.5,
      })) || [];
    } catch (error) {
      console.error('PlantNet API error:', error);
      throw error;
    }
  }

  private static async analyzeWithGoogle(base64Image: string, crop: "rice" | "durian"): Promise<AIPrediction[]> {
    // Google Vision API implementation
    // This would require Google Cloud Vision API setup
    throw new Error('Google Vision API not implemented yet');
  }

  private static async analyzeWithAzure(base64Image: string, crop: "rice" | "durian"): Promise<AIPrediction[]> {
    // Azure Cognitive Services implementation
    throw new Error('Azure Cognitive Services not implemented yet');
  }

  private static async analyzeWithAWS(base64Image: string, crop: "rice" | "durian"): Promise<AIPrediction[]> {
    // AWS Rekognition implementation
    throw new Error('AWS Rekognition not implemented yet');
  }

  private static async analyzeWithLocalModel(base64Image: string, crop: "rice" | "durian"): Promise<AIPrediction[]> {
    // Local TensorFlow Lite model implementation
    // This would require react-native-tflite or similar
    throw new Error('Local model not implemented yet');
  }

  private static mapPlantixConditionId(diseaseId: string, crop: "rice" | "durian"): string {
    // Map Plantix disease IDs to our internal condition IDs
    const mapping: Record<string, string> = {
      'brown_spot': 'rice_brown_spot',
      'blast': 'rice_blast',
      'bacterial_blight': 'rice_bacterial_blight',
      'anthracnose': 'durian_anthracnose',
      'phytophthora': 'durian_phytophthora',
      'healthy': crop === 'rice' ? 'rice_healthy' : 'durian_healthy',
    };
    
    return mapping[diseaseId] || `${crop}_unknown`;
  }

  private static mapPlantNetConditionId(scientificName: string, crop: "rice" | "durian"): string {
    // Map PlantNet scientific names to our condition IDs
    const mapping: Record<string, string> = {
      'Oryza sativa': 'rice_healthy',
      'Durio zibethinus': 'durian_healthy',
    };
    
    return mapping[scientificName] || `${crop}_unknown`;
  }

  private static selectBestPrediction(predictions: AIPrediction[], crop: "rice" | "durian"): AIPrediction {
    if (predictions.length === 0) {
      return this.getDefaultPrediction(crop);
    }

    // Sort by confidence and return the best prediction
    const sorted = predictions.sort((a, b) => b.confidence - a.confidence);
    return sorted[0];
  }

  private static getDefaultPrediction(crop: "rice" | "durian"): AIPrediction {
    return {
      conditionId: crop === 'rice' ? 'rice_healthy' : 'durian_healthy',
      condition: crop === 'rice' ? 'ต้นข้าวแข็งแรงดี' : 'ต้นทุเรียนแข็งแรงดี',
      conditionEN: crop === 'rice' ? 'Healthy Rice Plant' : 'Healthy Durian Plant',
      confidence: 0.7,
    };
  }

  private static generateSteps(prediction: AIPrediction, crop: "rice" | "durian"): string[] {
    const conditionId = prediction.conditionId;
    
    // Generate steps based on condition
    if (conditionId.includes('healthy')) {
      return [
        'ดูแลรักษาตามปกติ',
        'ตรวจสอบสม่ำเสมอ',
        'เตรียมการป้องกันโรค'
      ];
    }
    
    if (conditionId.includes('brown_spot') || conditionId.includes('blast')) {
      return [
        'ฉีดพ่นด้วยสารป้องกันเชื้อรา',
        'ลดการให้น้ำในช่วงเช้า',
        'เก็บใบที่เสียหายออกจากแปลง'
      ];
    }
    
    if (conditionId.includes('anthracnose')) {
      return [
        'ฉีดพ่นด้วยสารป้องกันเชื้อรา',
        'ตัดแต่งกิ่งให้โปร่ง',
        'เก็บผลที่เสียหายออกจากต้น'
      ];
    }
    
    if (conditionId.includes('def')) {
      return [
        'ใส่ปุ๋ยตามอัตราที่แนะนำ',
        'รดน้ำให้สม่ำเสมอ',
        'ตรวจสอบค่า pH ของดิน'
      ];
    }
    
    return [
      'ปรึกษาเจ้าหน้าที่เกษตร',
      'ตรวจสอบเพิ่มเติม',
      'ใช้มาตรการป้องกัน'
    ];
  }

  private static generateStepsEN(prediction: AIPrediction, crop: "rice" | "durian"): string[] {
    const conditionId = prediction.conditionId;
    
    if (conditionId.includes('healthy')) {
      return [
        'Maintain normal care',
        'Check regularly',
        'Prepare disease prevention'
      ];
    }
    
    if (conditionId.includes('brown_spot') || conditionId.includes('blast')) {
      return [
        'Spray with fungicide',
        'Reduce morning watering',
        'Remove damaged leaves from field'
      ];
    }
    
    if (conditionId.includes('anthracnose')) {
      return [
        'Spray with fungicide',
        'Prune branches for better air circulation',
        'Remove damaged fruits from tree'
      ];
    }
    
    if (conditionId.includes('def')) {
      return [
        'Apply fertilizer per recommended rate',
        'Water regularly',
        'Check soil pH'
      ];
    }
    
    return [
      'Consult agricultural officer',
      'Check further',
      'Use preventive measures'
    ];
  }

  private static generatePPE(prediction: AIPrediction): string[] {
    const conditionId = prediction.conditionId;
    
    if (conditionId.includes('healthy')) {
      return [];
    }
    
    if (conditionId.includes('blast') || conditionId.includes('anthracnose')) {
      return ['หน้ากาก', 'ถุงมือ', 'เสื้อผ้าป้องกัน'];
    }
    
    if (conditionId.includes('brown_spot') || conditionId.includes('def')) {
      return ['หน้ากาก', 'ถุงมือ'];
    }
    
    return ['ถุงมือ'];
  }

  private static generateSprayReason(prediction: AIPrediction): string | undefined {
    const conditionId = prediction.conditionId;
    
    if (conditionId.includes('healthy')) {
      return undefined;
    }
    
    if (conditionId.includes('blast')) {
      return 'ฝนตก 70%';
    }
    
    if (conditionId.includes('brown_spot')) {
      return 'ความชื้นสูง';
    }
    
    return 'สภาพอากาศเหมาะสม';
  }

  private static convertConfidence(confidence: number): ConfidenceBand {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

}
