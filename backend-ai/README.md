# AI Backend - Firebase Functions

This directory contains both the Express.js development server and Firebase Functions for production deployment.

## 🚀 Development Mode

Run the local Express.js server for development:

```bash
npm install
npm start
# or
npm run dev  # with nodemon for auto-restart
```

Server will run on `http://localhost:3002`

## ☁️ Production Deployment (Firebase Functions)

### Prerequisites

1. **Firebase CLI installed**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged into Firebase**:
   ```bash
   firebase login
   ```

3. **Project configured**: Make sure you're in the correct Firebase project (`career-library`)

## Configuration

### Set OpenAI API Key (Required for AI features)

```bash
firebase functions:config:set openai.api_key="your_openai_api_key_here"
```

### Optional Configuration

```bash
firebase functions:config:set openai.model="gpt-3.5-turbo"
firebase functions:config:set openai.max_tokens="1500"
firebase functions:config:set openai.temperature="0.7"
```

### View Current Configuration

```bash
firebase functions:config:get
```

## Local Development

1. **Install dependencies**:
   ```bash
   cd functions
   npm install
   ```

2. **Download config for local development**:
   ```bash
   firebase functions:config:get > .runtimeconfig.json
   ```

3. **Start emulators**:
   ```bash
   firebase emulators:start --only functions
   ```

## Deployment

### Deploy Functions Only

```bash
firebase deploy --only functions
```

### Deploy Everything (Functions + Hosting)

```bash
firebase deploy
```

## API Endpoints

Once deployed, your API will be available at:
- Base URL: `https://us-central1-career-library.cloudfunctions.net/api`
- Health: `GET /api/ai/health`
- Stats: `GET /api/ai/stats`
- Enhance: `POST /api/ai/enhance`
- Generate Image: `POST /api/ai/generate-image`
- Reset Stats: `POST /api/ai/stats/reset`

## Frontend Configuration

After deployment, update your frontend to use the production API URLs:

Replace `http://localhost:3002` with `https://us-central1-career-library.cloudfunctions.net` in your frontend code.

## Troubleshooting

1. **Check function logs**:
   ```bash
   firebase functions:log
   ```

2. **View specific function logs**:
   ```bash
   firebase functions:log --only api
   ```

3. **Check configuration**:
   ```bash
   firebase functions:config:get
   ```

4. **Clear and reset configuration**:
   ```bash
   firebase functions:config:unset openai
   firebase functions:config:set openai.api_key="new_key"
   ```

## Notes

- The API will work without OpenAI configuration (fallback mode)
- CORS is configured for both development and production domains
- All sensitive data should be configured via Firebase Functions config, not environment files
