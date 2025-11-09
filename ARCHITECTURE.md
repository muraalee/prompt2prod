# System Architecture

## Overview

This is a **self-provisioning blog platform** that automatically creates and configures its own Firebase backend infrastructure. The system consists of three main components:

1. **Frontend (React + Vite)** - User interface and blog application
2. **Provisioning Backend (Node.js + Express)** - Firebase project creation service
3. **Firebase Infrastructure** - Database and hosting

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         End User                                 │
│                            │                                      │
│                            ▼                                      │
│                  ┌─────────────────────┐                         │
│                  │   Web Browser       │                         │
│                  └─────────────────────┘                         │
└────────────────────────┬─────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌─────────────┐  ┌────────────────┐
│   Firebase   │  │   React     │  │  Provisioning  │
│   Hosting    │  │   Frontend  │  │    Backend     │
│   (Static)   │  │  (Vite App) │  │  (Cloud Run)   │
└──────────────┘  └─────────────┘  └────────────────┘
                         │                │
                         │                │
                         ▼                ▼
                  ┌─────────────┐  ┌────────────────┐
                  │  Firestore  │  │  Firebase      │
                  │  Database   │  │  Management    │
                  │             │  │  API           │
                  └─────────────┘  └────────────────┘
                         │                │
                         └────────┬───────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │ Google Cloud │
                          │  Platform    │
                          └──────────────┘
```

## Component Details

### 1. Frontend Application

**Technology:**
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation

**Key Files:**
- `App.tsx` - Main application with setup flow logic
- `firebaseConfig.ts` - Dynamic configuration loader
- `services/setupFirebase.ts` - Provisioning client
- `pages/SetupFirebasePage.tsx` - Setup wizard UI

**Flow:**
```
App.tsx
  ↓
Check: isFirebaseConfigured()?
  ↓
  ├─ Yes → Load blog (HomePage, CreatePostPage, etc.)
  └─ No  → Show SetupFirebasePage
           ↓
           User chooses:
           ├─ Auto Setup → Call backend API
           └─ Manual Setup → Enter config manually
```

### 2. Provisioning Backend

**Technology:**
- Node.js + Express
- Google Cloud APIs (googleapis package)
- Docker container
- Cloud Run deployment

**Key Files:**
- `backend/server.js` - Main API server
- `backend/Dockerfile` - Container definition
- `backend/deploy.sh` - Deployment automation

**API Endpoints:**
```
POST /api/setupFirebase
  ├─ Input: { userId, projectName }
  ├─ Process:
  │   1. Authenticate with service account
  │   2. Create GCP project
  │   3. Add Firebase to project
  │   4. Create web app
  │   5. Enable Firestore
  │   6. Set security rules
  │   7. Get configuration
  └─ Output: { success, projectId, config }

GET /health
  └─ Output: { status, timestamp }

POST /api/verifyFirebase
  ├─ Input: { config }
  └─ Output: { success, message }
```

### 3. Firebase Infrastructure

**Firestore Database:**
```
/databases/(default)
  └─ /posts
      ├─ {postId1}
      │   ├─ title: string
      │   ├─ content: string
      │   ├─ imageUrl: string
      │   ├─ tags: string[]
      │   └─ createdAt: timestamp
      ├─ {postId2}
      └─ ...
```

**Security Rules:**
```javascript
match /posts/{postId} {
  allow read: if true;          // Public read
  allow write: if true;         // Open write (demo)
  // Production: if request.auth != null
}
```

**Hosting:**
- Serves static files from `dist/` folder
- SPA routing with rewrites
- CDN caching for assets

## Data Flow

### Initial Setup Flow

```
1. User opens app
   └─> Frontend checks localStorage + .env
       └─> No config found

2. Show SetupFirebasePage
   └─> User clicks "Auto Setup"
       ├─> Generate unique userId (stored in localStorage)
       └─> POST /api/setupFirebase { userId, projectName }

3. Backend receives request
   ├─> Authenticate with service account
   ├─> Create GCP project: "blog-{userId}-{random}"
   ├─> Enable Firebase on project
   ├─> Create web app in Firebase
   ├─> Enable Firestore database
   ├─> Set default security rules
   └─> Return config to frontend

4. Frontend receives config
   ├─> Save to localStorage (key: 'firebase_auto_config')
   ├─> Initialize Firebase SDK
   └─> Reload app → Blog is ready!
```

### Blog Post Creation Flow

```
1. User navigates to /create
   └─> CreatePostPage.tsx

2. User generates content
   ├─> Generate Title (Gemini API)
   ├─> Generate Content (Gemini API)
   └─> Generate Image (Gemini API)

3. User submits post
   └─> PostsContext.addPost()
       └─> firebaseService.addPost()
           ├─> collection(db, 'posts')
           ├─> addDoc({ ...post, createdAt: serverTimestamp() })
           └─> Return document ID

4. Navigate to new post
   └─> /post/{newPostId}
```

### Blog Post Reading Flow

```
1. User visits homepage
   └─> HomePage.tsx

2. Fetch posts
   └─> PostsContext (from App.tsx)
       └─> firebaseService.getPosts()
           ├─> query(collection, orderBy('createdAt', 'desc'))
           ├─> getDocs(query)
           └─> Return BlogPost[]

3. Display posts
   ├─> Map to BlogPostCard components
   └─> Click card → Navigate to /post/{postId}

4. View individual post
   └─> PostPage.tsx
       └─> firebaseService.getPost(postId)
           ├─> doc(db, 'posts', postId)
           ├─> getDoc(docRef)
           └─> Return BlogPost
```

## Configuration Management

### Priority Order

1. **Environment Variables** (`.env`)
   - `VITE_FIREBASE_*` variables
   - Manually configured
   - Highest priority

2. **localStorage** (auto-provisioned)
   - Key: `firebase_auto_config`
   - Created by backend
   - Medium priority

3. **Not Configured**
   - Show setup wizard
   - Lowest priority

### Implementation

```typescript
// firebaseConfig.ts
export const firebaseConfig = getFirebaseConfig() || {
  // empty config
};

// services/setupFirebase.ts
export function getFirebaseConfig() {
  // 1. Check environment variables
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return envConfig;
  }

  // 2. Check localStorage
  const stored = localStorage.getItem('firebase_auto_config');
  if (stored) {
    return JSON.parse(stored);
  }

  // 3. Not configured
  return null;
}
```

## Security Model

### Service Account Permissions

The backend service account has these permissions:

✅ **Can:**
- Create new GCP projects
- Enable Firebase on new projects
- Create Firestore databases
- Set Firestore security rules
- Create Firebase web apps

❌ **Cannot:**
- Access existing projects
- Read user data
- Modify organization settings
- Delete projects
- Change billing

### Frontend Security

- Firebase API keys are **public** (by design)
- Security enforced by Firestore rules
- No sensitive data in localStorage
- HTTPS only in production

### Backend Security

- Service account keys in Secret Manager
- CORS restricted to frontend domain
- Rate limiting recommended for production
- Authentication optional (can be added)

## Deployment Architecture

### Development

```
localhost:5173 (Frontend)
    ↓
localhost:3001 (Backend)
    ↓
Firebase Project (Cloud)
```

### Production

```
your-domain.web.app (Firebase Hosting)
    ↓
https://backend-xxx.run.app (Cloud Run)
    ↓
Firebase Project (Cloud)
```

## Scaling Considerations

### Frontend
- Static hosting via Firebase CDN
- Automatic global distribution
- No scaling issues (static files)

### Backend
- Cloud Run auto-scales 0 → N instances
- Cold starts: ~1-2 seconds
- Concurrent requests: 80 per instance
- Memory: 512Mi (adjustable)

### Database
- Firestore auto-scales
- Free tier: 50K reads/day, 20K writes/day
- Paid tier: Unlimited (pay per use)

## Monitoring & Observability

### Frontend
- Browser console for errors
- Firebase Performance Monitoring (optional)
- Analytics via Google Analytics (optional)

### Backend
- Cloud Logging (automatic)
- Cloud Monitoring (automatic)
- Health check endpoint: `/health`
- Request tracing in Cloud Run

### Database
- Firestore console for data inspection
- Usage metrics in Firebase console
- Query performance monitoring

## Disaster Recovery

### Configuration Backup
- Auto-provisioned config in localStorage
- Can re-create manually if lost
- Service continues if backend is down

### Data Backup
- Firestore automatic backups (paid feature)
- Manual export via Firebase console
- Point-in-time recovery available

## Cost Model

### Free Tier Usage
- Frontend: Firebase Hosting (10GB/month)
- Backend: Cloud Run (2M requests/month)
- Database: Firestore Spark plan

### Paid Tier Scaling
- Firestore: $0.18/GB storage, $0.06/100K reads
- Cloud Run: $0.00002400/vCPU-second
- Hosting: $0.15/GB transfer

### Estimated Costs
- Small blog (1K visitors/month): $0
- Medium blog (50K visitors/month): $5-10
- Large blog (500K visitors/month): $50-100

## Future Enhancements

1. **Authentication**
   - Firebase Auth integration
   - Author attribution
   - Comment system

2. **Multi-tenancy**
   - User-specific blogs
   - Custom domains
   - Team collaboration

3. **Performance**
   - Image optimization
   - Lazy loading
   - Service worker caching

4. **Features**
   - SEO optimization
   - RSS feeds
   - Email subscriptions
   - Analytics dashboard
