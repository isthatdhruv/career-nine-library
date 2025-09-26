class ApiStatsTracker {
  constructor() {
    this.stats = {
      contentEnhancement: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalProcessingTime: 0
      },
      imageGeneration: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        imagesGenerated: 0,
        totalProcessingTime: 0
      },
      recentCalls: [],
      startTime: new Date()
    };
  }

  // Track content enhancement request
  trackContentEnhancement({ success, processingTime = 0, endpoint = '/enhance' }) {
    this.stats.contentEnhancement.totalRequests++;
    if (success) {
      this.stats.contentEnhancement.successfulRequests++;
    } else {
      this.stats.contentEnhancement.failedRequests++;
    }
    
    this.stats.contentEnhancement.totalProcessingTime += processingTime;

    this._addRecentCall({
      timestamp: new Date(),
      endpoint,
      success,
      duration: processingTime
    });
  }

  // Track image generation request
  trackImageGeneration({ success, imagesGenerated = 0, processingTime = 0, endpoint = '/generate-image' }) {
    this.stats.imageGeneration.totalRequests++;
    if (success) {
      this.stats.imageGeneration.successfulRequests++;
      this.stats.imageGeneration.imagesGenerated += imagesGenerated;
    } else {
      this.stats.imageGeneration.failedRequests++;
    }
    
    this.stats.imageGeneration.totalProcessingTime += processingTime;

    this._addRecentCall({
      timestamp: new Date(),
      endpoint,
      success,
      duration: processingTime
    });
  }

  // Add to recent calls history
  _addRecentCall(call) {
    this.stats.recentCalls.unshift(call);
    // Keep only last 50 calls
    if (this.stats.recentCalls.length > 50) {
      this.stats.recentCalls = this.stats.recentCalls.slice(0, 50);
    }
  }

  // Get comprehensive stats
  getStats() {
    const totalRequests = this.stats.contentEnhancement.totalRequests + this.stats.imageGeneration.totalRequests;
    const totalSuccessful = this.stats.contentEnhancement.successfulRequests + this.stats.imageGeneration.successfulRequests;
    
    return {
      ...this.stats,
      totalRequests,
      successRate: totalRequests > 0 ? totalSuccessful / totalRequests : 0,
      averageProcessingTime: {
        contentEnhancement: this.stats.contentEnhancement.totalRequests > 0 
          ? this.stats.contentEnhancement.totalProcessingTime / this.stats.contentEnhancement.totalRequests 
          : 0,
        imageGeneration: this.stats.imageGeneration.totalRequests > 0 
          ? this.stats.imageGeneration.totalProcessingTime / this.stats.imageGeneration.totalRequests 
          : 0
      },
      uptime: Math.floor((new Date() - this.stats.startTime) / 1000),
      timestamp: new Date().toISOString()
    };
  }

  // Reset stats
  reset() {
    this.stats = {
      contentEnhancement: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalProcessingTime: 0
      },
      imageGeneration: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        imagesGenerated: 0,
        totalProcessingTime: 0
      },
      recentCalls: [],
      startTime: new Date()
    };
  }
}

// Create singleton instance
const statsTracker = new ApiStatsTracker();

module.exports = statsTracker;
