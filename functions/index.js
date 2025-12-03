const functions = require('firebase-functions');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// Import services
const AIService = require('./services/aiService');
const statsTracker = require('./services/statsTracker');

// Initialize environment variables from Firebase config
const initializeConfig = () => {
  const config = functions.config();
  
  // Set OpenAI configuration from Firebase config
  if (config.openai && config.openai.api_key) {
    process.env.OPENAI_API_KEY = config.openai.api_key;
    process.env.OPENAI_MODEL = config.openai.model || 'gpt-3.5-turbo';
    process.env.OPENAI_MAX_TOKENS = config.openai.max_tokens || '1500';
    process.env.OPENAI_TEMPERATURE = config.openai.temperature || '0.7';
  }
};

// Initialize config
initializeConfig();

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Firebase Functions)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://career-library.web.app',
      'https://career-library.firebaseapp.com',
      'https://library.career-9.com'
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins for now, adjust in production
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize AI Service
const aiService = new AIService();

// ==================== ROUTES ====================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Career Library AI Functions',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: 'firebase-functions',
    hasOpenAI: aiService.hasOpenAI
  });
});

// AI Health check endpoint
app.get('/ai/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AI Content Enhancement',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    hasOpenAI: aiService.hasOpenAI
  });
});

// Stats endpoint
app.get('/ai/stats', (req, res) => {
  try {
    const stats = statsTracker.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

// Reset stats endpoint
app.post('/ai/stats/reset', (req, res) => {
  try {
    statsTracker.reset();
    res.json({
      success: true,
      message: 'Stats reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting stats:', error);
    res.status(500).json({
      error: 'Failed to reset stats',
      message: error.message
    });
  }
});

// Content enhancement endpoint
app.post('/ai/enhance', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { content, prompt, context } = req.body;

    // Validation
    if (!content || !prompt) {
      return res.status(400).json({ 
        error: 'Invalid request: both content and prompt are required' 
      });
    }

    console.log(`Enhancement request:`, {
      contentLength: content.length,
      promptLength: prompt.length,
      context: context || 'No context provided'
    });

    let enhancedContent;
    let isAIGenerated = false;
    let aiResponse = null;

    try {
      const fieldType = context?.contentType || 'text';
      
      aiResponse = await aiService.enhanceContent(content, fieldType, {
        prompt,
        ...context
      });
      
      enhancedContent = aiResponse.content;
      isAIGenerated = aiResponse.isAIGenerated;
      
      if (aiService.hasOpenAI && isAIGenerated) {
        console.log(`OpenAI enhancement completed in ${Date.now() - startTime}ms`);
      } else {
        console.log(`Using fallback enhancement (OpenAI not configured)`);
      }
    } catch (aiError) {
      console.warn(`AI enhancement failed, using fallback:`, aiError.message);
      enhancedContent = `${content}\n\n[Enhanced with user instructions: ${prompt}]`;
      isAIGenerated = false;
    }

    const response = {
      success: true,
      enhancedContent,
      isAIGenerated,
      source: isAIGenerated ? 'OpenAI' : 'Fallback',
      originalContent: content,
      prompt,
      context,
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    if (!isAIGenerated) {
      response.note = 'Enhanced using fallback method (OpenAI API not available)';
    }

    // Track stats
    statsTracker.trackContentEnhancement({
      success: true,
      processingTime: Date.now() - startTime,
      endpoint: '/ai/enhance'
    });

    res.json(response);

  } catch (error) {
    console.error(`Enhancement error:`, error);
    
    statsTracker.trackContentEnhancement({
      success: false,
      processingTime: Date.now() - startTime,
      endpoint: '/ai/enhance'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to enhance content',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Image generation endpoint
app.post('/ai/generate-image', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt, careerTitle, size = '1024x1024', quality = 'standard', style = 'natural', model = 'gpt-image-1' } = req.body;

    if (!prompt && !careerTitle) {
      return res.status(400).json({ 
        error: 'Invalid request: either prompt or careerTitle is required' 
      });
    }

    console.log(`Image generation request:`, {
      prompt: prompt?.substring(0, 100) + (prompt?.length > 100 ? '...' : ''),
      careerTitle,
      model,
      size,
      quality,
      style
    });

    let imageResult;
    let success = false;

    try {
      if (careerTitle && !prompt) {
        imageResult = await aiService.generateCareerImage(careerTitle, { size, model });
      } else {
        imageResult = await aiService.generateImage({
          prompt: prompt.trim(),
          model,
          size,
          quality,
          style
        });
      }
      success = true;
      console.log(`Image generation completed in ${Date.now() - startTime}ms`);
    } catch (aiError) {
      console.warn(`Image generation failed:`, aiError.message);
      imageResult = {
        imageUrl: aiService.generateFallbackImageUrl(careerTitle || 'career'),
        isFallback: true
      };
      success = false;
    }

    const response = {
      success: success,
      ...imageResult,
      prompt: prompt || aiService.generateCareerImagePrompt(careerTitle),
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    statsTracker.trackImageGeneration({
      success,
      imagesGenerated: success ? 1 : 0,
      processingTime: Date.now() - startTime,
      endpoint: '/ai/generate-image'
    });

    res.json(response);

  } catch (error) {
    console.error(`Image generation error:`, error);
    
    statsTracker.trackImageGeneration({
      success: false,
      imagesGenerated: 0,
      processingTime: Date.now() - startTime,
      endpoint: '/ai/generate-image'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate image',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Batch image generation endpoint
app.post('/ai/generate-images-batch', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { careerTitles, size = '1024x1024' } = req.body;

    if (!careerTitles || !Array.isArray(careerTitles)) {
      return res.status(400).json({ 
        error: 'Invalid request: careerTitles array is required' 
      });
    }

    console.log(`Batch image generation request for ${careerTitles.length} careers`);

    const results = [];
    let successCount = 0;

    for (const careerTitle of careerTitles) {
      try {
        const imageResult = await aiService.generateCareerImage(careerTitle, { size });
        results.push({
          careerTitle,
          success: true,
          ...imageResult
        });
        successCount++;
      } catch (error) {
        console.warn(`Failed to generate image for ${careerTitle}:`, error.message);
        results.push({
          careerTitle,
          success: false,
          imageUrl: aiService.generateFallbackImageUrl(careerTitle),
          isFallback: true,
          error: error.message
        });
      }
    }

    statsTracker.trackImageGeneration({
      success: successCount > 0,
      imagesGenerated: successCount,
      processingTime: Date.now() - startTime,
      endpoint: '/ai/generate-images-batch'
    });

    res.json({
      success: true,
      results,
      summary: {
        total: careerTitles.length,
        successful: successCount,
        failed: careerTitles.length - successCount
      },
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Batch image generation error:`, error);
    
    statsTracker.trackImageGeneration({
      success: false,
      imagesGenerated: 0,
      processingTime: Date.now() - startTime,
      endpoint: '/ai/generate-images-batch'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate images',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`Error:`, err);

  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: err.message
    });
  }

  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS error',
      message: 'Origin not allowed'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Export the Express app as a Firebase Function
exports.api = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB'
  })
  .https.onRequest(app);
