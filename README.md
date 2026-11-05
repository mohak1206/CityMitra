# Smart City Reporter

> AI-powered city issue reporting platform with real-time tracking and gamification

![Smart City Reporter](https://img.shields.io/badge/Version-2.0-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Overview

Smart City Reporter is a modern web application that empowers citizens to report city infrastructure issues using AI-powered image analysis. The platform uses local storage for data persistence and Firebase for authentication, making it easy to deploy and maintain.

### Key Features

- **AI-Powered Analysis** - Automatic issue detection using Gemma4B model
- **Real-time Dashboard** - Interactive map with issue tracking
- **Gamification** - Points, badges, and leaderboard system
- **Multi-step Reporting** - Intuitive 4-step issue submission wizard
- **Location Services** - GPS-based location pinning
- **Responsive Design** - Works seamlessly on desktop and mobile

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Ollama with Gemma4B model installed
- Firebase project (for authentication only)

### Installation

1. **Clone the repository**
   ```bash
   <!-- git clone https://github.com/Satyam2006-cmd/smartcity-reporter.git be updating to github soon -->
   cd smartcity-reporter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase Authentication**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication > Google Sign-In
   - Add your domain to authorized domains
   - Copy Firebase config to `src/firebase.js`

4. **Install and run Ollama**
   ```bash
   # Install Ollama (https://ollama.ai)
   ollama pull gemma4:e4b
   ollama serve
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

### Frontend
- **React 18.2** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend & Services
- **Firebase Authentication** - User login with Google
- **Local Storage** - Data persistence (issues, users, notifications)
- **Ollama AI** - Local AI model for image analysis
- **Gemma4B Model** - Issue detection and classification

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## Project Structure

```
smartcity-reporter/
  src/
    components/
      dashboard/           # Dashboard components
        DashboardStats.jsx
        IssueDetailModal.jsx
        MapView.jsx
      landing/             # Landing page sections
        AnimatedBackground.jsx
        GoogleSection.jsx
        HowItWorks.jsx
        StatsSection.jsx
      layout/              # Layout components
        Navbar.jsx
      report/              # Issue reporting wizard
        StepUpload.jsx
        StepAnalysis.jsx
        StepLocation.jsx
        StepConfirm.jsx
      gamification/        # Gamification features
        Leaderboard.jsx
      notifications/       # Notification system
        NotificationCenter.jsx
      ui/                  # Reusable UI components
        Button.jsx
        Card.jsx
        Modal.jsx
        AIAnalysisPanel.jsx
    pages/                 # Main pages
      Landing.jsx
      Login.jsx
      Dashboard.jsx
      ReportIssue.jsx
    services/              # API services
      localStorage.js       # Local storage management
      gemmaService.js       # AI analysis service
      locationUtils.js      # Location utilities
    utils/                 # Utility functions
      userUtils.js          # User management
    firebase.js            # Firebase configuration
    App.jsx               # Main app component
    main.jsx              # Entry point
  public/                 # Static assets
  package.json
  vite.config.js
  tailwind.config.js
```

## Features in Detail

### Issue Reporting Flow

1. **Upload** - Drag & drop or capture photo of the issue
2. **AI Analysis** - Gemma4B analyzes image and detects issue type
3. **Location** - Auto-detect GPS or manually pin location
4. **Confirm** - Review details and submit report

### Dashboard Features

- **Interactive Map** - View all issues geographically
- **Issue Management** - Update status, delete inappropriate reports
- **Real-time Stats** - Track reported, pending, and resolved issues
- **Filter & Sort** - Organize by status, type, or date

### Gamification System

- **Points System** - Earn points for reporting issues
- **Badge Collection** - Unlock achievements (Reporter, Contributor, Guardian)
- **Leaderboard** - Compete with other citizens
- **Issue Type Tracking** - Statistics by category

### User Roles

- **Admin Users** - Full dashboard access, can manage all issues
- **Citizen Users** - Can report issues and view their reports
- **Admin Whitelist** - Controlled via `src/utils/userUtils.js`

## Configuration

### Firebase Setup

1. Create Firebase project
2. Enable Authentication > Google Sign-In
3. Add authorized domains
4. Update `src/firebase.js` with your config:

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

### Ollama Setup

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull the Gemma4B model:
   ```bash
   ollama pull gemma4:e4b
   ```
3. Start Ollama service:
   ```bash
   ollama serve
   ```
4. Verify it's running at `http://localhost:11434`

### Admin Configuration

Update `src/utils/userUtils.js` to add admin emails:

```javascript
const ADMIN_EMAILS = [
  "admin@yourcity.com",
  "manager@yourcity.com"
];
```

## API Documentation

### Local Storage Service

The app uses browser localStorage for data persistence:

```javascript
// Issues
localDB.getIssues()           // Get all issues
localDB.addIssue(issue)       // Add new issue
localDB.updateIssue(id, data) // Update issue
localDB.deleteIssue(id)       // Delete issue

// Users
localDB.getCurrentUser()       // Get current user
localDB.setCurrentUser(user)   // Set current user
localDB.updateUserPoints()     // Update user points

// Notifications
localDB.getNotifications()     // Get user notifications
localDB.addNotification()      // Add notification
```

### AI Analysis Service

```javascript
import { analyzeImageWithGemma } from './services/gemmaService';

const result = await analyzeImageWithGemma(imageBase64);
// Returns: { issueType, description, severity, confidence }
```

## Deployment

### Local Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to static hosting**
   - Netlify, Vercel, or Firebase Hosting
   - Upload the `dist` folder
   - Configure domain in Firebase

3. **Environment Requirements**
   - Ollama server must be running
   - Firebase Auth configured
   - HTTPS required for Firebase Auth

## Security

- **Authentication** - Firebase Google Sign-In only
- **Admin Access** - Whitelist-based admin system
- **Data Validation** - Input sanitization and validation
- **Local Storage** - No external database dependencies
- **CORS** - Properly configured for API calls

## Troubleshooting

### Common Issues

1. **AI Analysis Not Working**
   - Ensure Ollama is running: `ollama serve`
   - Check Gemma4B model: `ollama list`
   - Verify API at `http://localhost:11434`

2. **Firebase Login Issues**
   - Check domain is authorized in Firebase
   - Verify API keys in `firebase.js`
   - Ensure HTTPS in production

3. **Location Not Working**
   - Enable location permissions in browser
   - Check HTTPS requirement for geolocation

4. **Data Not Persisting**
   - Check browser localStorage permissions
   - Verify no private/incognito mode

### Debug Mode

Enable console logging by checking browser dev tools (F12).

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

Built with React, Firebase, and AI for smarter cities.
