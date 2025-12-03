# Firebase Cloud Functions Deployment Guide

This guide will help you deploy the Career AI Backend to Firebase Cloud Functions.

## Prerequisites

1. **Firebase CLI**: Make sure you have Firebase CLI installed
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**: 
   ```bash
   firebase login
   ```

3. **Select your Firebase project**:
   ```bash
   firebase use --add
   # Select your Firebase project from the list
   ```

## Setup Environment Variables

You need to configure your OpenAI API key and other environment variables for Firebase Functions.

### Method 1: Using Firebase CLI (Recommended for Production)

```bash
# Set OpenAI configuration
firebase functions:config:set openai.api_key="sk-your-openai-api-key-here"
firebase functions:config:set openai.model="gpt-3.5-turbo"
firebase functions:config:set openai.max_tokens="1500"
firebase functions:config:set openai.temperature="0.7"

# Verify the configuration
firebase functions:config:get
```

### Method 2: Using .env file (For Local Development)

1. Copy your actual OpenAI API key to the `.env` file in the functions directory:
   ```bash
   cd functions
   nano .env
   ```

2. Replace `your-openai-api-key-here` with your actual OpenAI API key.

## Install Dependencies

```bash
cd functions
npm install
```

## Local Testing (Optional)

Before deploying, you can test the functions locally:

```bash
# Start the Firebase emulators
firebase emulators:start --only functions

# Your API will be available at:
# http://localhost:5001/YOUR_PROJECT_ID/us-central1/api
```

## Deploy to Firebase

### Deploy Functions Only
```bash
firebase deploy --only functions
```

### Deploy Everything (Functions + Hosting)
```bash
firebase deploy
```

## Post-Deployment

After deployment, your API will be available at:
```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
```

### Update Frontend Configuration

Update your frontend API configuration to point to the deployed Firebase Functions:

1. Edit `frontend/src/config/api.js` (or wherever your API configuration is)
2. Change the API URL to: `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`

### Test the Deployment

1. **Health Check**: Visit `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/`
2. **AI Health**: Visit `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/ai/health`

## Troubleshooting

### Check Function Logs
```bash
firebase functions:log
```

### Check Configuration
```bash
firebase functions:config:get
```

### Common Issues

1. **OpenAI API Key Not Set**: Make sure you've set the OpenAI API key using `firebase functions:config:set`

2. **CORS Issues**: The functions are configured to allow requests from your frontend domains. Check the `config.js` file if you need to add more domains.

3. **Timeout Issues**: Large image generation requests might timeout. The functions are configured with 300 seconds timeout and 1GB memory.

4. **Permission Issues**: Make sure your Firebase project has billing enabled for Cloud Functions.

## Monitoring and Maintenance

- **Function Usage**: Check the Firebase Console > Functions section for usage statistics
- **Logs**: Use `firebase functions:log` or check the Firebase Console for detailed logs
- **Billing**: Monitor your OpenAI API usage and Firebase Functions usage

## Security Notes

- Never commit your actual OpenAI API key to version control
- Use Firebase Functions configuration for production environment variables
- Keep your `.env` file in `.gitignore`
