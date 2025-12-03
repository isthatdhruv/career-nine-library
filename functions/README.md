# Career Library Firebase Functions

This folder contains the Firebase Cloud Functions for the Career Library AI backend.

## Structure

```
functions/
├── index.js              # Main entry point - Express app exported as Firebase Function
├── package.json          # Dependencies
├── services/
│   ├── aiService.js      # OpenAI integration for content enhancement & image generation
│   └── statsTracker.js   # API usage statistics tracker
└── .gitignore
```

## Endpoints

The function is exported as `api` and provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | General health check |
| `/ai/health` | GET | AI service health check |
| `/ai/stats` | GET | API usage statistics |
| `/ai/stats/reset` | POST | Reset statistics |
| `/ai/enhance` | POST | Enhance content using AI |
| `/ai/generate-image` | POST | Generate image using DALL-E |
| `/ai/generate-images-batch` | POST | Batch image generation |

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Set OpenAI API Key

Set your OpenAI API key in Firebase config:

```bash
firebase functions:config:set openai.api_key="your-openai-api-key"
firebase functions:config:set openai.model="gpt-3.5-turbo"
firebase functions:config:set openai.max_tokens="1500"
firebase functions:config:set openai.temperature="0.7"
```

### 3. Local Development

To test locally with the emulator:

```bash
# From project root
firebase emulators:start --only functions

# Or from functions folder
npm run serve
```

The functions will be available at:
- `http://localhost:5001/career-library/us-central1/api`

### 4. Deploy

```bash
# From project root
firebase deploy --only functions

# Or from functions folder
npm run deploy
```

After deployment, the function will be available at:
- `https://us-central1-career-library.cloudfunctions.net/api`

## Environment Variables

The function reads configuration from Firebase Functions config:

| Config Key | Description |
|------------|-------------|
| `openai.api_key` | OpenAI API key |
| `openai.model` | OpenAI model (default: gpt-3.5-turbo) |
| `openai.max_tokens` | Max tokens for completion (default: 1500) |
| `openai.temperature` | Temperature setting (default: 0.7) |

## Frontend Configuration

Update your frontend `src/config/api.js` to point to the deployed function:

```javascript
production: {
  AI_SERVICE_URL: 'https://us-central1-career-library.cloudfunctions.net/api',
  ...
}
```

## Testing

Test the health endpoint:

```bash
# Local
curl http://localhost:5001/career-library/us-central1/api/health

# Production
curl https://us-central1-career-library.cloudfunctions.net/api/health
```

Test content enhancement:

```bash
curl -X POST https://us-central1-career-library.cloudfunctions.net/api/ai/enhance \
  -H "Content-Type: application/json" \
  -d '{"content": "Test content", "prompt": "Make it better"}'
```
