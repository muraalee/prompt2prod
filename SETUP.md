# Firebase Setup Guide

Quick guide to get your Firebase database connected.

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter a project name
4. Follow the prompts (accept defaults)

## Step 2: Enable Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Choose **"Start in production mode"** (or test mode for development)
4. Select a region (e.g., `us-central`)
5. Click **"Enable"**

## Step 3: Run the Setup Tool

Open your terminal and run:

```bash
npm run setup-firebase
```

Follow the prompts:
- Login to Firebase (if not already logged in)
- Enter your project ID
- Select or create a web app
- Save to `.env` file

## Step 4: Start Your App

```bash
npm run dev
```

Done! Your app is now connected to Firebase.

---

## Troubleshooting

**"Firebase CLI not found"**
```bash
npm install -g firebase-tools
```

**"Not logged in"**
```bash
firebase login
```

**"Can't find my project"**
- Make sure you created it in Step 1
- Check https://console.firebase.google.com for your project ID

---

## What Gets Created

After setup, you'll have:
- `.env` file with your Firebase credentials
- `.env.example` template file

**Never commit `.env` to git!** (It's already in `.gitignore`)
