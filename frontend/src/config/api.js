// API Configuration for different environments
const API_CONFIG = {
  development: {
    AI_SERVICE_URL: 'http://localhost:3002',
    MAIN_BACKEND_URL: 'http://localhost:3003'
  },
  production: {
    // Production URLs - includes /api since Firebase Function is exported as 'api'
    AI_SERVICE_URL: 'https://us-central1-career-library.cloudfunctions.net/api',
    MAIN_BACKEND_URL: 'http://localhost:3003' // Keep local for browser extension
  }
};

// Detect environment - check both NODE_ENV and hostname
const isProduction = process.env.NODE_ENV === 'production' || 
                   (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

// Export current configuration
export const API_URLS = isProduction ? API_CONFIG.production : API_CONFIG.development;

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  if (endpoint.startsWith('/api/ai/')) {
    // Development: localhost:3002 + /api/ai/* = localhost:3002/api/ai/*
    // Production: firebase-url/api + /ai/* = firebase-url/api/ai/* 
    if (isProduction) {
      // Transform /api/ai/ to /ai/ since production base already includes /api
      const transformedEndpoint = endpoint.replace('/api/ai', '/ai');
      return `${API_URLS.AI_SERVICE_URL}${transformedEndpoint}`;
    } else {
      return `${API_URLS.AI_SERVICE_URL}${endpoint}`;
    }
  }
  if (endpoint.startsWith('/api/')) {
    return `${API_URLS.MAIN_BACKEND_URL}${endpoint}`;
  }
  return endpoint;
};

// Debug logging
console.log('🌐 API Configuration loaded:', {
  environment: isProduction ? 'production' : 'development',
  NODE_ENV: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  isProduction,
  aiService: API_URLS.AI_SERVICE_URL,
  mainBackend: API_URLS.MAIN_BACKEND_URL
});
