# Firebase Configuration Priority Guide

## 🎯 Configuration Loading Order

The app loads Firebase configuration in this priority order:

```
1. Environment Variables (.env)     ← HIGHEST PRIORITY
   ↓
2. localStorage (manual/auto setup)
   ↓
3. Not configured (show setup wizard)
```

## 🔧 How It Works

### Priority 1: Environment Variables (.env)

If you have `VITE_FIREBASE_API_KEY` set in your `.env` file:

```bash
# .env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_PROJECT_ID=my-project
# ... etc
```

**The app will ALWAYS use these values**, even if you save a configuration through the manual setup UI.

**Why?** Environment variables are considered "hard-coded" configuration and take precedence over runtime configs.

### Priority 2: localStorage (Manual/Auto Setup)

If environment variables are NOT set, the app checks localStorage for a saved configuration:

```javascript
// Saved as: 'firebase_auto_config'
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  // ... etc
}
```

This configuration comes from:
- **Manual Setup**: User pastes Firebase config in the UI
- **Auto Setup**: Backend creates Firebase project and returns config

### Priority 3: Not Configured

If neither environment variables nor localStorage have a config, the app shows the setup wizard.

## 🧪 Testing Manual/Auto Setup

To test the manual or automatic setup features, you must **comment out** the Firebase environment variables:

### Step 1: Edit `.env`

```bash
# Comment out these lines:
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# VITE_FIREBASE_PROJECT_ID=...
# VITE_FIREBASE_STORAGE_BUCKET=...
# VITE_FIREBASE_MESSAGING_SENDER_ID=...
# VITE_FIREBASE_APP_ID=...
# VITE_FIREBASE_MEASUREMENT_ID=...
```

### Step 2: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

**Important:** Vite only reads `.env` files when the dev server starts. Changing `.env` requires a restart!

### Step 3: Refresh Browser

Hard refresh to clear any cached modules:
- Chrome/Firefox: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open DevTools → Application → Clear Storage → Clear site data

### Step 4: Test Setup

Now you should see the setup wizard and can test:
- Manual setup (paste Firebase config)
- Auto setup (create new Firebase project)

## 📝 Console Logs

The app now logs which configuration source is being used:

```javascript
// Check your browser console for:
[Firebase Config] Using environment variables from .env
// or
[Firebase Config] Using auto-provisioned config from localStorage
// or
[Firebase Config] No configuration found
```

## 🐛 Troubleshooting

### Issue: Manual setup saves but still shows setup wizard after reload

**Cause:** Environment variables are set in `.env`

**Solution:**
1. Comment out `VITE_FIREBASE_*` variables in `.env`
2. Restart dev server: `npm run dev`
3. Hard refresh browser
4. Clear localStorage: `localStorage.clear()` in console
5. Refresh again

### Issue: Changes to .env not taking effect

**Cause:** Vite doesn't hot-reload environment variables

**Solution:**
1. Stop dev server (`Ctrl+C`)
2. Start dev server (`npm run dev`)
3. Hard refresh browser

### Issue: App works in dev but not in production

**Cause:** Different .env file or missing localStorage

**Solution:**
- Production uses build-time env vars
- Check your deployment platform's environment variable settings
- localStorage might be cleared/blocked

## 💡 Best Practices

### For Development

**Option A: Use .env (Recommended)**
- Set all `VITE_FIREBASE_*` variables
- Fastest to develop
- Config never changes

**Option B: Use localStorage**
- Comment out .env variables
- Test manual/auto setup features
- More realistic user experience

### For Production

**Option 1: Environment Variables (Best for SaaS)**
```bash
# Set in your hosting platform
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

**Option 2: Auto-Provisioning (Best for Self-Service)**
- Deploy backend to Cloud Run
- Users get their own Firebase projects
- Each user has isolated data

**Option 3: Manual Setup (Best for Enterprise)**
- Users bring their own Firebase project
- You don't manage Firebase infrastructure
- Full control for customers

## 🎯 Quick Reference

| Scenario | Config Method | Priority | Notes |
|----------|---------------|----------|-------|
| Development | `.env` file | 1st | Fastest |
| Testing setup UI | localStorage | 2nd | Comment out .env |
| Production SaaS | Build env vars | 1st | Set in hosting platform |
| Production self-service | Auto-provision | 2nd | Backend creates projects |
| Enterprise customers | Manual setup | 2nd | Customers use their Firebase |

## 🔍 Checking Current Configuration

Open browser console and run:

```javascript
// Check where config is coming from
localStorage.getItem('firebase_auto_config')

// Check if env variables are set
import.meta.env.VITE_FIREBASE_API_KEY

// Clear localStorage config
localStorage.removeItem('firebase_auto_config')
```

## ✅ Summary

1. **Environment variables ALWAYS win**
2. **Restart dev server after changing .env**
3. **Hard refresh browser after restarting**
4. **Check console logs to see which config is used**
5. **Comment out .env to test UI-based setup**
