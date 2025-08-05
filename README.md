# Career Library Management System

A comprehensive full-stack application for managing career information with AI-powered content enhancement, real-time API monitoring, and data visualization capabilities.

## 🚀 Features

### 📊 **Frontend Dashboard**
- **Career Library**: Browse and explore careers by categories with responsive grid layout
- **Career Management**: Add, edit, and organize career information
- **API Health Dashboard**: Real-time monitoring of backend services and API performance
- **Data Visualization**: Interactive charts and statistics for career data

### 🤖 **AI-Powered Backend**
- **Content Enhancement**: Improve career descriptions using OpenAI GPT models
- **Image Generation**: Generate career-specific images using DALL-E 3
- **Fallback System**: Graceful degradation when AI services are unavailable
- **Performance Tracking**: Monitor API usage, response times, and success rates

### 🔧 **Data Management Backend**
- **HTML Extraction**: Parse and extract structured data from career web pages
- **Firebase Integration**: Store and manage data using Firestore
- **Browser Extension Support**: Save scraped career data directly to the database

### 🌐 **Browser Extension**
- **One-Click Scraping**: Extract career information from web pages
- **Real-time Processing**: Instant data extraction and storage
- **Popup Interface**: User-friendly interface for quick actions

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AI Backend     │    │  Main Backend   │
│   (React)       │────│   (Express.js)   │    │   (Express.js)  │
│   Port: 3001    │    │   Port: 3002     │    │   Port: 3003    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         ┌─────────────────┐
                         │   Firebase      │
                         │   Firestore     │
                         └─────────────────┘
```

## 📁 Project Structure

```
scraper-plugin-final-v2/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── Pages/          # Main application pages
│   │   │   ├── ApiHealth/  # API monitoring dashboard
│   │   │   ├── CareerLibrary/ # Career browsing interface
│   │   │   └── EditCareers/ # Career management interface
│   │   └── firebase.js     # Firebase configuration
│   └── public/             # Static assets
├── backend/                 # Main data management backend
│   ├── config/             # Configuration files
│   ├── module/             # Data extraction modules
│   └── server.js           # Main server file
├── backend-ai/             # AI-powered content enhancement
│   ├── services/           # AI and stats services
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   └── server.js           # AI server file
└── plugin/                 # Browser extension
    ├── manifest.json       # Extension manifest
    ├── popup.html         # Extension popup UI
    ├── popup.js           # Popup functionality
    └── content.js         # Content script for web scraping
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account and project
- OpenAI API key (optional, for AI features)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd scraper-plugin-final-v2
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Main Backend Setup
```bash
cd ../backend
npm install
```

### 4. AI Backend Setup
```bash
cd ../backend-ai
npm install
```

### 5. Environment Configuration

#### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate a service account key
4. Place the service account JSON file in:
   - `backend/config/serviceKey.json`
   - `frontend/src/config/serviceKey.json` (if needed)

#### AI Backend Configuration (Optional)
Create `backend-ai/.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1500
OPENAI_TEMPERATURE=0.7
PORT=3002
```

### 6. Firebase Configuration
Update `frontend/src/firebase.js` with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🚀 Running the Application

### Development Mode

#### 1. Frontend (Port 3001)
```bash
cd frontend
npm install
npm start
```

#### 2. AI Backend (Port 3002)
```bash
cd backend-ai
npm install
npm start
```

#### 3. Main Backend (Port 3003) - Optional
```bash
cd backend
npm install
PORT=3003 node server.js
```

### 4. Load Browser Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `plugin/` directory

## ☁️ Production Deployment

### Deploy Frontend to Firebase Hosting
```bash
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

### Deploy AI Backend to Firebase Functions
```bash
cd backend-ai
npm install
# Configure OpenAI API key (optional)
firebase functions:config:set openai.api_key="your_key_here"
# Deploy functions
firebase deploy --only functions
```

### Deploy from Root (Both Frontend + Backend)
```bash
# Build frontend
cd frontend && npm run build && cd ..
# Install backend dependencies
cd backend-ai && npm install && cd ..
# Deploy everything
firebase deploy
```

## 📱 Usage

### Career Library
- Navigate to `http://localhost:3001/career-library`
- Browse careers by categories
- Search and filter career information
- View detailed career descriptions and requirements

### API Health Dashboard
- Navigate to `http://localhost:3001/api-health`
- Monitor service status and performance
- View API usage statistics and response times
- Enable auto-refresh for real-time monitoring

### Career Management
- Navigate to `http://localhost:3001/edit-careers`
- Add, edit, and manage career information
- Use AI-powered content enhancement (if configured)

### Browser Extension
- Visit any career-related webpage
- Click the extension icon
- Use "Save Page" to extract and store career information

## 🔧 API Endpoints

### AI Backend (Port 3002)
- `GET /api/ai/health` - Service health check
- `GET /api/ai/stats` - API usage statistics
- `POST /api/ai/enhance` - Content enhancement
- `POST /api/ai/generate-image` - Image generation
- `POST /api/ai/stats/reset` - Reset statistics

### Main Backend (Port 3003)
- `GET /api/health` - Service health check
- `POST /save-html` - Save extracted HTML data
- `GET /saved_urls.json` - Retrieve saved URLs

## 🎨 Key Features

### AI Content Enhancement
- Intelligent content improvement using OpenAI GPT models
- Context-aware prompts for different content types
- Graceful fallback when AI services are unavailable
- Real-time performance monitoring

### Real-time Monitoring
- Service health status indicators
- API performance metrics
- Success rate tracking
- Auto-refresh capabilities

### Data Management
- Firebase Firestore integration
- Structured data extraction
- Career categorization system
- URL management and tracking

### Responsive Design
- Mobile-friendly interface
- Bootstrap-based styling
- Interactive dashboards
- Modern UI components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛡️ Security Notes

- **Never commit service account keys** - They are included in `.gitignore`
- **Keep environment variables secure** - Use `.env` files for sensitive data
- **Validate API inputs** - All endpoints include input validation
- **Use HTTPS in production** - Configure SSL certificates for production deployment

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify service account key placement
   - Check Firebase project configuration
   - Ensure Firestore is enabled

2. **AI Features Not Working**
   - Verify OpenAI API key in `.env` file
   - Check API key permissions and credits
   - Review error logs in AI backend console

3. **Port Conflicts**
   - Ensure ports 3001, 3002, 3003 are available
   - Modify port configurations if needed
   - Check for other running services

4. **Browser Extension Issues**
   - Reload extension after code changes
   - Check browser console for errors
   - Verify manifest.json configuration

## 📞 Support

For questions, issues, or contributions, please:
1. Check the [Issues](../../issues) page
2. Create a new issue if your problem isn't listed
3. Provide detailed information about your environment and the issue

---

Built with ❤️ by Dhruv for career-9.com 
