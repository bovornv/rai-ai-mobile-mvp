// AI Configuration for Plant Disease Detection
import { API_KEYS, API_ENDPOINTS } from './apiKeys';

export interface AIConfig {
  provider: 'plantix' | 'plantnet' | 'google' | 'azure' | 'aws' | 'local';
  apiKey: string;
  endpoint: string;
  modelId?: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority
}

export const AI_CONFIGS: AIConfig[] = [
  {
    provider: 'plantix',
    apiKey: API_KEYS.PLANTIX,
    endpoint: API_ENDPOINTS.PLANTIX,
    enabled: API_KEYS.PLANTIX !== 'your_plantix_api_key_here',
    priority: 1,
  },
  {
    provider: 'plantnet',
    apiKey: API_KEYS.PLANTNET,
    endpoint: API_ENDPOINTS.PLANTNET,
    enabled: API_KEYS.PLANTNET !== 'your_plantnet_api_key_here',
    priority: 2,
  },
  {
    provider: 'google',
    apiKey: API_KEYS.GOOGLE_VISION,
    endpoint: API_ENDPOINTS.GOOGLE_VISION,
    enabled: API_KEYS.GOOGLE_VISION !== 'your_google_vision_api_key_here',
    priority: 3,
  },
  {
    provider: 'azure',
    apiKey: API_KEYS.AZURE_VISION,
    endpoint: API_ENDPOINTS.AZURE_VISION,
    enabled: API_KEYS.AZURE_VISION !== 'your_azure_vision_api_key_here',
    priority: 4,
  },
  {
    provider: 'aws',
    apiKey: API_KEYS.AWS_REKOGNITION,
    endpoint: API_ENDPOINTS.AWS_REKOGNITION,
    enabled: API_KEYS.AWS_REKOGNITION !== 'your_aws_rekognition_api_key_here',
    priority: 5,
  },
  {
    provider: 'local',
    apiKey: '',
    endpoint: '',
    enabled: false, // Requires local model setup
    priority: 6,
  },
];

export function getBestAIConfig(): AIConfig | null {
  const enabledConfigs = AI_CONFIGS
    .filter(config => config.enabled)
    .sort((a, b) => a.priority - b.priority);
  
  return enabledConfigs[0] || null;
}

export function getAIConfig(provider: string): AIConfig | null {
  return AI_CONFIGS.find(config => config.provider === provider) || null;
}

// AI Service Status
export function getAIStatus(): {
  available: boolean;
  provider: string | null;
  fallback: boolean;
} {
  const config = getBestAIConfig();
  
  if (!config) {
    return {
      available: false,
      provider: null,
      fallback: true,
    };
  }
  
  return {
    available: true,
    provider: config.provider,
    fallback: false,
  };
}
