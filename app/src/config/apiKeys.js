// API Keys Configuration
// In production, these should be stored in environment variables or secure backend

export const API_KEYS = {
  // Weather APIs
  OPENWEATHERMAP: '29e794ca05b243e559caf94c5a638d02',
  METEOSOURCE: '69z56nx86o9g7ut24iwuzq5p1ik9rek8v61ggigg',
  
  // Location APIs
  GOOGLE_MAPS: 'AIzaSyA0c40zoJGzs-Eaq5Pn5a80KRDMsyU5d9k',
  MAPBOX_PUBLIC: 'pk.eyJ1IjoiYm92b3JuIiwiYSI6ImNtZjl3ZWY3dzA3Ym8ycm9lbTQzcmo5ankifQ.LvMa5fl8cpeXL8Za5Vroug',
  MAPBOX_RAI_AI: 'pk.eyJ1IjoiYm92b3JuIiwiYSI6ImNtZjl6Mzg2MTBjamMya3FvcHN2eWlodDEifQ.SAxZlQ8LLiRlfpZk8UB-XA',
  
  // Price APIs (will use mock data if not set)
  DIT_API_KEY: process.env.EXPO_PUBLIC_DIT_API_KEY || '',
  
  // AI/ML APIs (will use mock data if not set)
  PLANTIX: 'your_plantix_api_key_here',
  PLANTNET: 'your_plantnet_api_key_here',
  GOOGLE_VISION: 'your_google_vision_api_key_here',
  AZURE_VISION: 'your_azure_vision_api_key_here',
  AWS_REKOGNITION: 'your_aws_rekognition_api_key_here'
};

// API Endpoints
export const API_ENDPOINTS = {
  OPENWEATHERMAP: 'https://api.openweathermap.org/data/2.5',
  METEOSOURCE: 'https://www.meteosource.com/api/v1/free',
  GOOGLE_MAPS: 'https://maps.googleapis.com/maps/api',
  MAPBOX: 'https://api.mapbox.com',
  NOMINATIM: 'https://nominatim.openstreetmap.org',
  
  // Price APIs
  DIT_BASE: process.env.EXPO_PUBLIC_DIT_API_BASE || 'https://dataapi.moc.go.th',
  COMMODITIES_API_KEY: process.env.EXPO_PUBLIC_COMMODITIES_API_KEY || 'demo',
  
  // AI/ML Endpoints
  PLANTIX: process.env.EXPO_PUBLIC_PLANTIX_API || 'https://api.plantix.net/v2/diagnosis',
  PLANTNET: 'https://my-api.plantnet.org/v2/identify',
  GOOGLE_VISION: 'https://vision.googleapis.com/v1/images:annotate',
  AZURE_VISION: 'https://your-region.cognitiveservices.azure.com/vision/v3.2/analyze',
  AWS_REKOGNITION: 'https://rekognition.your-region.amazonaws.com'
};