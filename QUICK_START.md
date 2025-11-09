# 🚀 Quick Start Guide

## TL;DR - Get Running in 60 Seconds

### Option 1: Manual Setup (Easiest - No Backend Needed)

```bash
# 1. Install and run
npm install
npm run dev

# 2. Open browser → http://localhost:5173

# 3. Click "Manual Setup"

# 4. Enter your Firebase config from console.firebase.google.com

# 5. Start blogging! 🎉
```

### Option 2: Auto-Provisioning (Full Featured)

```bash
# 1. Install frontend
npm install

# 2. Install backend
cd backend
npm install
cd ..

# 3. Configure backend (see Backend Setup below)
cd backend
cp .env.example .env
# Edit .env with your service account

# 4. Start both services
cd backend && npm start &
npm run dev

# 5. Open http://localhost:5173

# 6. Click "Auto Setup" → Wait 60 seconds → Done! 🎉
```

## 📋 Prerequisites

### For Manual Setup
- Node.js 18+
- Firebase project (free at console.firebase.google.com)

### For Auto-Provisioning
- Node.js 18+
- Google Cloud account
- Service account with Firebase permissions

## 🔧 Backend Setup (For Auto-Provisioning)

### 1. Create Service Account

```bash
# Go to GCP Console
https://console.cloud.google.com/iam-admin/serviceaccounts

# Create service account with these roles:
# - Firebase Admin
# - Project Creator
# - Service Usage Admin

# Download JSON key
```

### 2. Configure Backend

```bash
cd backend

# Create .env file
cp .env.example .env

# Encode service account key
cat service-account-key.json | base64 > key.base64

# Add to .env:
# GCP_SERVICE_ACCOUNT_KEY=<paste_base64_here>
```

### 3. Start Backend

```bash
npm install
npm start

# Backend runs on http://localhost:3001
# Test: curl http://localhost:3001/health
```

## 🌐 Environment Variables

### Frontend (.env)

```bash
# Required for auto-provisioning
VITE_BACKEND_URL=http://localhost:3001

# Optional: Manual Firebase config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... etc

# Optional: AI features
VITE_GEMINI_API_KEY=your-gemini-key
```

### Backend (backend/.env)

```bash
PORT=3001
GCP_SERVICE_ACCOUNT_KEY=base64_encoded_json
FIRESTORE_LOCATION=us-central1
```

## 🚀 Deployment

### Deploy Backend

```bash
cd backend
./deploy.sh

# Follow prompts, get service URL
# Update frontend .env with URL
```

### Deploy Frontend

```bash
npm run build
firebase deploy --only hosting

# Your app is live!
```

## 🔍 Troubleshooting

### "Backend service unavailable"
```bash
# Make sure backend is running
cd backend && npm start

# Test health endpoint
curl http://localhost:3001/health
```

### "Firebase not configured"
```bash
# Clear localStorage and retry
localStorage.clear()

# Or set environment variables in .env
```

### "Permission denied"
```bash
# Verify service account has all required roles
# Check GCP Console → IAM
```

## 📚 Full Documentation

- **README.md** - Main documentation
- **SETUP_GUIDE.md** - Detailed setup
- **ARCHITECTURE.md** - System design
- **backend/README.md** - API docs

## 💡 Tips

1. **Development**: Use manual setup (simpler)
2. **Production**: Use auto-provisioning (better UX)
3. **Restart dev server** after .env changes
4. **Check browser console** for errors
5. **Use environment templates** (.env.example)

## 🎯 Common Commands

```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build

# Backend
cd backend
npm start           # Start server
npm run dev         # Dev mode with auto-reload

# Deployment
./backend/deploy.sh              # Deploy backend
firebase deploy --only hosting   # Deploy frontend

# Cleanup
rm -rf node_modules dist         # Clean frontend
rm -rf backend/node_modules      # Clean backend
```

## ✅ Verification

After setup, verify everything works:

1. ✓ App loads at http://localhost:5173
2. ✓ Can create a new post
3. ✓ Post appears on homepage
4. ✓ Post persists after page reload
5. ✓ Dark mode toggles work

## 🆘 Need Help?

1. Check **SETUP_GUIDE.md** troubleshooting section
2. Review **ARCHITECTURE.md** for system details
3. Check Firebase/GCP console for errors
4. Review logs in browser console

---

**Ready to start? Run `npm install && npm run dev`** 🚀
