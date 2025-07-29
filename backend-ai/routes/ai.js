const express = require('express');
const AIService = require('../services/aiService');
const statsTracker = require('../services/statsTracker');

const router = express.Router();
const aiService = new AIService();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AI Content Enhancement',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Stats endpoint
router.get('/stats', (req, res) => {
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

// Reset stats endpoint (for testing/admin)
router.post('/stats/reset', (req, res) => {
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



// Main content enhancement endpoint (frontend calls /api/ai/enhance)
router.post('/enhance', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { content, prompt, context } = req.body;

    // Validation
    if (!content || !prompt) {
      return res.status(400).json({ 
        error: 'Invalid request: both content and prompt are required' 
      });
    }

    console.log(`[${new Date().toISOString()}] Enhancement request:`, {
      contentLength: content.length,
      promptLength: prompt.length,
      context: context || 'No context provided'
    });

    let enhancedContent;
    let isAIGenerated = false;
    let aiResponse = null;

    // Try OpenAI enhancement first
    try {
      // Determine field type from context for better AI prompting
      const fieldType = context?.contentType || 'text';
      
      aiResponse = await aiService.enhanceContent(content, fieldType, {
        prompt,
        ...context
      });
      
      enhancedContent = aiResponse.content;
      isAIGenerated = aiResponse.isAIGenerated;
      
      if (aiService.hasOpenAI && isAIGenerated) {
        console.log(`[${new Date().toISOString()}] OpenAI enhancement completed in ${Date.now() - startTime}ms`);
      } else {
        console.log(`[${new Date().toISOString()}] Using fallback enhancement (OpenAI not configured)`);
      }
    } catch (aiError) {
      console.warn(`[${new Date().toISOString()}] AI enhancement failed, using fallback:`, aiError.message);
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

    // Add note if fallback was used
    if (!isAIGenerated) {
      response.note = 'Enhanced using fallback method (OpenAI API not available)';
    }

    // Track stats
    statsTracker.trackContentEnhancement({
      success: true,
      processingTime: Date.now() - startTime,
      endpoint: '/enhance'
    });

    res.json(response);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Enhancement error:`, error);
    
    // Track failed request
    statsTracker.trackContentEnhancement({
      success: false,
      processingTime: Date.now() - startTime,
      endpoint: '/enhance'
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
router.post('/generate-image', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt, careerTitle, size = '1024x1024' } = req.body;

    if (!prompt && !careerTitle) {
      return res.status(400).json({ 
        error: 'Invalid request: either prompt or careerTitle is required' 
      });
    }

    console.log(`[${new Date().toISOString()}] Image generation request:`, {
      prompt: prompt?.substring(0, 100) + '...',
      careerTitle,
      size
    });

    let imageResult;
    let success = false;

    try {
      if (careerTitle && !prompt) {
        // Generate career-specific image
        imageResult = await aiService.generateCareerImage(careerTitle, { size });
      } else {
        // Generate image from custom prompt
        imageResult = await aiService.generateImage(prompt, { size });
      }
      success = true;
      
      console.log(`[${new Date().toISOString()}] Image generation completed in ${Date.now() - startTime}ms`);
    } catch (aiError) {
      console.warn(`[${new Date().toISOString()}] Image generation failed:`, aiError.message);
      // Return fallback image URL
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

    // Track stats
    statsTracker.trackImageGeneration({
      success,
      imagesGenerated: success ? 1 : 0,
      processingTime: Date.now() - startTime,
      endpoint: '/generate-image'
    });

    res.json(response);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Image generation error:`, error);
    
    // Track failed request
    statsTracker.trackImageGeneration({
      success: false,
      imagesGenerated: 0,
      processingTime: Date.now() - startTime,
      endpoint: '/generate-image'
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
router.post('/generate-images-batch', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { careerTitles, size = '1024x1024' } = req.body;

    if (!careerTitles || !Array.isArray(careerTitles)) {
      return res.status(400).json({ 
        error: 'Invalid request: careerTitles array is required' 
      });
    }

    console.log(`[${new Date().toISOString()}] Batch image generation request for ${careerTitles.length} careers`);

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

    // Track stats for batch operation
    statsTracker.trackImageGeneration({
      success: successCount > 0,
      imagesGenerated: successCount,
      processingTime: Date.now() - startTime,
      endpoint: '/generate-images-batch'
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
    console.error(`[${new Date().toISOString()}] Batch image generation error:`, error);
    
    // Track failed batch request
    statsTracker.trackImageGeneration({
      success: false,
      imagesGenerated: 0,
      processingTime: Date.now() - startTime,
      endpoint: '/generate-images-batch'
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate images',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
