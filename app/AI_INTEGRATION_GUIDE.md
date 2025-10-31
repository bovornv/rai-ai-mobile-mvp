# AI Integration Guide for Rai AI Mobile App

## Overview

The Rai AI mobile app now supports real AI model integration for plant disease detection. The system is designed to be flexible, supporting multiple AI providers with automatic fallback to mock data when AI services are unavailable.

## Supported AI Providers

### 1. Plantix API
- **Provider**: Plantix
- **Endpoint**: `https://api.plantix.net/v1/identify`
- **Specialization**: Plant disease detection
- **Languages**: Thai, English
- **Setup**: Requires Plantix API key

### 2. PlantNet API
- **Provider**: PlantNet
- **Endpoint**: `https://my-api.plantnet.org/v2/identify`
- **Specialization**: Plant identification
- **Languages**: Multiple
- **Setup**: Requires PlantNet API key

### 3. Google Vision API
- **Provider**: Google Cloud Vision
- **Endpoint**: `https://vision.googleapis.com/v1/images:annotate`
- **Specialization**: General image analysis
- **Languages**: Multiple
- **Setup**: Requires Google Cloud API key

### 4. Azure Cognitive Services
- **Provider**: Microsoft Azure
- **Endpoint**: `https://your-region.cognitiveservices.azure.com/vision/v3.2/analyze`
- **Specialization**: Computer vision
- **Languages**: Multiple
- **Setup**: Requires Azure API key

### 5. AWS Rekognition
- **Provider**: Amazon Web Services
- **Endpoint**: `https://rekognition.your-region.amazonaws.com`
- **Specialization**: Image and video analysis
- **Languages**: Multiple
- **Setup**: Requires AWS API key

### 6. Local Model (Future)
- **Provider**: TensorFlow Lite
- **Endpoint**: Local device
- **Specialization**: Offline plant disease detection
- **Languages**: Thai, English
- **Setup**: Requires local model files

## Configuration

### API Keys Setup

1. **Update API Keys**: Edit `app/src/config/apiKeys.ts`
   ```typescript
   export const API_KEYS = {
     // ... existing keys ...
     PLANTIX: 'your_actual_plantix_api_key',
     PLANTNET: 'your_actual_plantnet_api_key',
     GOOGLE_VISION: 'your_actual_google_vision_api_key',
     // ... other keys ...
   };
   ```

2. **Priority Order**: The system automatically selects the best available AI provider based on priority:
   - Plantix (Priority 1) - Best for plant diseases
   - PlantNet (Priority 2) - Good for plant identification
   - Google Vision (Priority 3) - General purpose
   - Azure (Priority 4) - Enterprise option
   - AWS (Priority 5) - Cloud option
   - Mock (Priority 999) - Fallback

### AI Configuration

The AI service is automatically configured based on available API keys. You can also manually configure it:

```typescript
import { AIService } from './services/AIService';
import { getAIConfig } from './config/aiConfig';

// Get specific AI config
const config = getAIConfig('plantix');
if (config) {
  AIService.setConfig(config);
}
```

## Usage

### Basic Usage

The AI service is automatically used when scanning images:

```typescript
import { ScanService } from './services/ScanService';

// This will automatically use the best available AI provider
const result = await ScanService.analyzeImage(imageUri, 'rice');
```

### Manual AI Service Usage

```typescript
import { AIService } from './services/AIService';

// Initialize AI service
AIService.initialize();

// Analyze image
const result = await AIService.analyzeImage(imageUri, 'durian');
```

## Response Format

All AI providers return results in a standardized format:

```typescript
interface ScanResult {
  condition: string;           // Thai condition name
  conditionEN: string;        // English condition name
  steps: string[];            // Thai treatment steps
  stepsEN: string[];          // English treatment steps
  ppe: string[];              // Required PPE
  sprayReason?: string;       // Spray recommendation reason
  confidence: 'high' | 'medium' | 'low';
  timestamp: string;          // ISO timestamp
  fieldName?: string;         // Associated field name
  remedy: Remedy;            // Detailed remedy information
}
```

## Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Automatically falls back to mock data
2. **Network Issues**: Graceful degradation
3. **Invalid Images**: Error messages in Thai/English
4. **Rate Limiting**: Automatic retry with backoff

## Testing

### Test with Mock Data

To test without API keys, the system automatically uses mock data:

```typescript
// This will use mock data if no AI providers are configured
const result = await ScanService.analyzeImage('test-image.jpg', 'rice');
```

### Test with Real AI

1. Add valid API keys to `apiKeys.ts`
2. Test with real images
3. Check console logs for AI provider status

## Monitoring

### AI Service Status

Check which AI provider is being used:

```typescript
import { getAIStatus } from './config/aiConfig';

const status = getAIStatus();
console.log('AI Available:', status.available);
console.log('Provider:', status.provider);
console.log('Using Fallback:', status.fallback);
```

### Console Logs

The system provides detailed logging:

- AI provider selection
- API request/response details
- Error messages and fallbacks
- Performance metrics

## Security

### API Key Protection

1. **Never commit API keys** to version control
2. **Use environment variables** in production
3. **Rotate keys regularly**
4. **Monitor API usage**

### Data Privacy

1. **Images are processed** by third-party services
2. **No image storage** on our servers
3. **Results are cached locally** only
4. **Comply with data protection laws**

## Performance Optimization

### Image Processing

1. **Compress images** before sending to AI
2. **Use appropriate image formats** (JPEG for photos)
3. **Resize large images** to reduce API costs
4. **Cache results** to avoid duplicate requests

### Network Optimization

1. **Batch requests** when possible
2. **Use CDN** for image delivery
3. **Implement retry logic** with exponential backoff
4. **Monitor API response times**

## Troubleshooting

### Common Issues

1. **"No AI provider available"**
   - Check API keys in `apiKeys.ts`
   - Verify API key validity
   - Check network connectivity

2. **"AI analysis failed"**
   - Check API endpoint URLs
   - Verify request format
   - Check API rate limits

3. **"Image conversion failed"**
   - Check image format support
   - Verify image file size
   - Check base64 encoding

### Debug Mode

Enable detailed logging:

```typescript
// In development
console.log('AI Service Status:', getAIStatus());
console.log('Available Configs:', AI_CONFIGS.filter(c => c.enabled));
```

## Future Enhancements

### Planned Features

1. **Local Model Support**: TensorFlow Lite integration
2. **Batch Processing**: Multiple image analysis
3. **Custom Models**: Train models for specific crops
4. **Real-time Analysis**: Live camera feed analysis
5. **Offline Mode**: Complete offline functionality

### Integration Opportunities

1. **Weather Integration**: Combine with weather data
2. **Field Mapping**: GPS-based field analysis
3. **Historical Data**: Track disease patterns
4. **Community Features**: Share analysis results
5. **Expert Consultation**: Connect with agricultural experts

## Support

For technical support or questions about AI integration:

- **Email**: support@raiai.app
- **LINE OA**: @raiai
- **Documentation**: This guide and inline code comments

## License

This AI integration follows the same license as the main Rai AI mobile app. Please ensure compliance with third-party AI service terms of use.
