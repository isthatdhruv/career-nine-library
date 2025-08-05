// Configuration helper for Firebase Functions
// This file helps manage environment variables and configuration

const functions = require('firebase-functions');

class Config {
    constructor() {
        // Get Firebase Functions configuration
        this.config = functions.config();
        
        // Set up OpenAI configuration
        this.setupOpenAIConfig();
        
        console.log('🔧 Configuration loaded:', {
            hasOpenAI: !!process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL,
            environment: process.env.NODE_ENV || 'production'
        });
    }

    setupOpenAIConfig() {
        // Check if running in Firebase Functions environment
        if (this.config.openai && this.config.openai.api_key) {
            // Production: Use Firebase Functions config
            process.env.OPENAI_API_KEY = this.config.openai.api_key;
            process.env.OPENAI_MODEL = this.config.openai.model || 'gpt-3.5-turbo';
            process.env.OPENAI_MAX_TOKENS = this.config.openai.max_tokens || '1500';
            process.env.OPENAI_TEMPERATURE = this.config.openai.temperature || '0.7';
        } else {
            // Local development: Use environment variables or defaults
            process.env.OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
            process.env.OPENAI_MAX_TOKENS = process.env.OPENAI_MAX_TOKENS || '1500';
            process.env.OPENAI_TEMPERATURE = process.env.OPENAI_TEMPERATURE || '0.7';
        }
    }

    getCorsOrigins() {
        // Production and development CORS origins
        return [
            'http://localhost:3001',
            'https://career-library.web.app',
            'https://career-library.firebaseapp.com'
        ];
    }

    isProduction() {
        return process.env.NODE_ENV === 'production' || !!this.config.openai;
    }
}

module.exports = new Config();
