# AI-Powered Blogger - Self-Provisioning Setup Guide

## Overview

This is a **self-provisioning** blog template that automatically creates and configures Firebase projects. Users can start blogging immediately without manual Firebase setup.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React + Vite Frontend                             │    │
│  │  - SetupFirebasePage (UI for provisioning)         │    │
│  │  - Auto-detects config (localStorage or .env)      │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP POST /api/setupFirebase
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Cloud Run / Node.js)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Provisioning Service                              │    │
│  │  - Creates GCP project                             │    │
│  │  - Enables Firebase                                │    │
│  │  - Creates web app                                 │    │
│  │  - Enables Firestore                               │    │
│  │  - Sets security rules                             │    │
│  │  - Returns config JSON                             │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Google Cloud APIs
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Cloud Platform                          │
│  - Cloud Resource Manager API                              │
│  - Firebase Management API                                 │
│  - Firestore API                                            │
│  - Service Usage API                                        │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. **Automatic Setup Mode**
- Creates Firebase project automatically
- No manual configuration needed
- 30-60 second setup time
- Perfect for demos and quick starts

### 2. **Manual Setup Mode**
- Use existing Firebase project
- Enter configuration manually
- Works without backend service
- Full control over settings

### 3. **Configuration Persistence**
- Auto-provisioned configs saved to localStorage
- Manual configs via .env variables
- Seamless reload support

## File Structure

```
prompt2prod/
├── backend/                          # Provisioning backend
│   ├── server.js                     # Express server with Firebase provisioning
│   ├── package.json                  # Backend dependencies
│   ├── Dockerfile                    # Container image for Cloud Run
│   ├── deploy.sh                     # Automated deployment script
│   ├── cloudbuild.yaml              # Cloud Build configuration
│   └── .env.example                  # Environment template
│
├── services/
│   ├── setupFirebase.ts             # Frontend provisioning client
│   ├── firebaseService.ts           # Firestore operations
│   └── geminiService.ts             # AI content generation
│
├── pages/
│   ├── SetupFirebasePage.tsx        # Setup wizard UI
│   ├── HomePage.tsx                 # Blog homepage
│   ├── CreatePostPage.tsx           # Post creation
│   └── PostPage.tsx                 # Individual post view
│
├── firebaseConfig.ts                # Dynamic Firebase config loader
├── App.tsx                          # Main app with setup flow
├── firebase.json                    # Firebase Hosting config
├── firestore.rules                  # Security rules
└── .env                             # Environment variables
```

## Prerequisites

### For Manual Setup (Simpler)
- Node.js 18+
- Existing Firebase project
- Firebase config from console

### For Auto-Provisioning (Advanced)
- Node.js 18+
- Google Cloud account
- GCP service account with permissions:
  - Firebase Admin
  - Project Creator
  - Service Usage Admin
  - Cloud Resource Manager API Admin

## Quick Start

### Option 1: Manual Setup (Recommended for First-Time Users)

1. **Clone and install:**
   ```bash
   cd prompt2prod
   npm install
   ```

2. **Start the app:**
   ```bash
   npm run dev
   ```

3. **Follow the setup wizard:**
   - Choose "Manual Setup"
   - Enter your Firebase config from console
   - Start blogging!

### Option 2: Auto-Provisioning Setup

1. **Install dependencies:**
   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   cd ..
   ```

2. **Set up GCP service account:**
   ```bash
   # Create service account in GCP Console
   # Download JSON key
   # Base64 encode it:
   cat service-account-key.json | base64 > key.base64
   ```

3. **Configure backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your service account key
   ```

4. **Start backend:**
   ```bash
   cd backend
   npm start
   # Backend runs on http://localhost:3001
   ```

5. **Start frontend:**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

6. **Use the app:**
   - Choose "Automatic Setup"
   - Wait 30-60 seconds
   - Your Firebase project is ready!

## Environment Variables

### Frontend (.env)
```bash
# Backend provisioning service URL
VITE_BACKEND_URL=http://localhost:3001

# Optional: Manual Firebase config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Gemini API (for AI features)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Backend (backend/.env)
```bash
# Server configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# GCP service account (base64 encoded JSON)
GCP_SERVICE_ACCOUNT_KEY=base64_encoded_json_here

# Optional: Organization/Folder for new projects
# GCP_ORGANIZATION_ID=123456789
# GCP_FOLDER_ID=987654321

# Firestore location
FIRESTORE_LOCATION=us-central1
```

## Deployment

### Deploy Backend to Cloud Run

1. **Automated deployment:**
   ```bash
   cd backend
   ./deploy.sh
   ```

2. **Manual deployment:**
   ```bash
   # Set project
   gcloud config set project YOUR_PROJECT_ID

   # Build and push
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/firebase-provisioning-backend

   # Deploy
   gcloud run deploy firebase-provisioning-backend \
     --image gcr.io/YOUR_PROJECT_ID/firebase-provisioning-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-secrets GCP_SERVICE_ACCOUNT_KEY=firebase-provisioning-sa-key:latest
   ```

3. **Get service URL:**
   ```bash
   gcloud run services describe firebase-provisioning-backend \
     --region us-central1 \
     --format="value(status.url)"
   ```

4. **Update frontend .env:**
   ```bash
   VITE_BACKEND_URL=https://your-service-url.run.app
   ```

### Deploy Frontend to Firebase Hosting

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Initialize Firebase (if not done):**
   ```bash
   firebase init hosting
   # Choose 'dist' as public directory
   # Configure as single-page app: Yes
   # Don't overwrite index.html
   ```

4. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

5. **Your app is live!**
   ```
   https://your-project-id.web.app
   ```

## How Auto-Provisioning Works

### Step-by-Step Process

1. **User visits app** → No Firebase config detected
2. **Setup wizard appears** → User chooses "Automatic Setup"
3. **Frontend calls backend** → `POST /api/setupFirebase`
4. **Backend authenticates** → Uses service account
5. **Create GCP project** → Unique project ID generated
6. **Enable Firebase** → Add Firebase to project
7. **Create web app** → Register web application
8. **Enable Firestore** → Create database instance
9. **Set security rules** → Configure access control
10. **Return config** → Send Firebase config to frontend
11. **Save to localStorage** → Persist configuration
12. **Initialize Firebase** → App is ready to use!

### Security Considerations

**Backend Service Account Permissions:**
- Only has permission to create NEW projects
- Cannot access existing projects
- Limited to specific organization/folder (if configured)
- Keys stored in Secret Manager

**Firestore Security Rules:**
- Default: Public read, authenticated write
- Customize in `firestore.rules`
- Deploy with: `firebase deploy --only firestore:rules`

**Frontend:**
- Config stored in localStorage (safe for Firebase)
- Firebase API keys are meant to be public
- Security enforced by Firestore rules

## Troubleshooting

### Backend service unavailable
```bash
# Check backend is running
curl http://localhost:3001/health

# Check logs
cd backend && npm start
```

### Firebase initialization fails
```bash
# Clear localStorage
localStorage.removeItem('firebase_auto_config')

# Restart app and try manual setup
```

### Permission denied errors
```bash
# Verify service account has required roles:
# - roles/firebase.admin
# - roles/resourcemanager.projectCreator
# - roles/serviceusage.serviceUsageAdmin
```

### Project creation takes too long
- Normal: 30-60 seconds
- If > 2 minutes: Check GCP quotas
- Verify organization/folder permissions

## Cost Estimates

### Firebase (Spark Plan - Free)
- Firestore: 1GB storage, 50K reads/day, 20K writes/day
- Hosting: 10GB storage, 10GB/month transfer
- Perfect for demos and small blogs

### Cloud Run (Backend)
- Free tier: 2M requests/month
- ~$0.05 per additional 1M requests
- Minimal cost for most use cases

### Total Cost
- **Development:** Free
- **Small blog (<10K visitors/month):** Free
- **Medium blog (50K visitors/month):** ~$5-10/month

## Production Recommendations

1. **Add Authentication:**
   ```typescript
   // Update firestore.rules
   allow write: if request.auth != null;
   ```

2. **Enable CORS properly:**
   ```typescript
   // In backend/server.js
   app.use(cors({
     origin: 'https://your-domain.com',
     credentials: true
   }));
   ```

3. **Add rate limiting:**
   ```bash
   npm install express-rate-limit
   ```

4. **Monitor with Cloud Logging:**
   - View logs in GCP Console
   - Set up alerts for errors

5. **Implement proper error handling:**
   - User-friendly error messages
   - Retry logic for transient failures

## Advanced Features

### Custom Domain
```bash
firebase hosting:channel:deploy production --expires 30d
firebase hosting:site:get
# Add custom domain in Firebase Console
```

### CI/CD Pipeline
- Use GitHub Actions
- Auto-deploy on push to main
- See `.github/workflows/deploy.yml` (create this)

### Multi-Environment Setup
```bash
# Create staging environment
firebase use --add staging-project-id

# Deploy to staging
firebase deploy --only hosting --project staging
```

## Support

For issues and questions:
- Check the troubleshooting section
- Review Firebase documentation: https://firebase.google.com/docs
- Review Cloud Run documentation: https://cloud.google.com/run/docs

## License

MIT License - Feel free to use for personal or commercial projects!
