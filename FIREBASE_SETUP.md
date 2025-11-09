# Firebase Automatic Database Setup

This tool automatically sets up Firebase for your project, handling project creation, database initialization, and configuration.

## Features

- Interactive setup wizard
- Automatic Firebase project creation
- Firestore database initialization
- Firebase Authentication setup
- Configuration file generation (.env and firebaseConfig.ts)
- Support for both new and existing projects

## Prerequisites

1. **Node.js** - Already installed
2. **Firebase CLI** - Will be installed automatically if missing
3. **Google Cloud CLI (optional)** - Required only for creating new projects
   - Download from: https://cloud.google.com/sdk/docs/install
   - For macOS: `brew install google-cloud-sdk`

## Installation

First, install the required dependencies:

```bash
npm install
```

## Usage

### Interactive Mode (Recommended)

Run the interactive setup wizard that will guide you through the process:

```bash
npm run setup-firebase
```

The wizard will:
1. Check if Firebase CLI and gcloud CLI are installed
2. Help you login to Firebase
3. Let you choose between creating a new project or using an existing one
4. Enable Firestore and Firebase Authentication
5. Generate configuration files

### Automatic Mode

For automated/scripted setups, use automatic mode:

```bash
# With existing project
npm run setup-firebase:auto -- --project=my-project-id --existing

# Create new project
npm run setup-firebase:auto -- --project=my-new-project-id --location=us-central

# Skip certain services
npm run setup-firebase:auto -- --project=my-project-id --skip-firestore --skip-auth
```

#### Automatic Mode Options

- `--auto` - Enable automatic mode
- `--project=PROJECT_ID` - Firebase project ID (required)
- `--existing` - Use existing project instead of creating new one
- `--location=REGION` - Firestore region (default: us-central)
- `--skip-firestore` - Skip Firestore database setup
- `--skip-auth` - Skip Firebase Authentication setup

## What Gets Created

After successful setup, you'll have:

### 1. `.env.local` file
Contains your Firebase configuration as environment variables:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. `.env.example` file
Template for sharing with team (without sensitive values)

### 3. Updated `firebaseConfig.ts`
Your Firebase configuration file will be updated with the new credentials

### 4. Firebase Project (if created)
- Firestore database in production mode
- Firebase Authentication enabled
- Web app registered

## Troubleshooting

### Firebase CLI Not Found

Install globally:
```bash
npm install -g firebase-tools
```

### gcloud CLI Not Found

Only needed for creating new projects. Install from:
- macOS: `brew install google-cloud-sdk`
- Windows/Linux: https://cloud.google.com/sdk/docs/install

### Authentication Issues

Login manually:
```bash
firebase login
gcloud auth login
```

### Permission Errors

Make sure your Google account has:
- Project Creator role (for new projects)
- Firebase Admin role (for existing projects)

### Project ID Already Exists

Firebase project IDs must be globally unique. Try a different ID:
- Add a suffix: `my-project-dev`, `my-project-2024`
- Use organization name: `mycompany-blog-app`

## Manual Setup Alternative

If you prefer manual setup:

1. Go to https://console.firebase.google.com
2. Create a new project or select existing
3. Enable Firestore Database
4. Enable Authentication
5. Register a web app
6. Copy the configuration to `.env.local`

## Environment Variables

The tool uses these environment variables:

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Auth domain
- `VITE_FIREBASE_PROJECT_ID` - Project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Messaging sender ID
- `VITE_FIREBASE_APP_ID` - App ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Analytics measurement ID (optional)

## Security Notes

- Never commit `.env.local` to version control
- The `.gitignore` should include `.env.local`
- Share `.env.example` with your team instead
- Rotate API keys if accidentally exposed

## Next Steps

After setup:

1. **Restart your dev server** to load new environment variables:
   ```bash
   npm run dev
   ```

2. **Configure Firestore rules** in Firebase Console:
   - Go to Firestore Database → Rules
   - Set up proper security rules for your use case

3. **Enable Authentication providers**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password, Google, or other providers

4. **Test the connection**:
   - Your app should now connect to Firebase
   - Check browser console for any connection errors

## Support

For issues with:
- **This tool**: Check the troubleshooting section above
- **Firebase**: https://firebase.google.com/support
- **Google Cloud**: https://cloud.google.com/support

## Example Workflow

```bash
# 1. Install dependencies
npm install

# 2. Run setup wizard
npm run setup-firebase

# 3. Follow the prompts:
#    - Install Firebase CLI? Yes
#    - Login to Firebase? Yes
#    - Create new project? Yes
#    - Project ID: my-blog-app-2024
#    - Enable Firestore? Yes
#    - Enable Auth? Yes
#    - Save to .env.local? Yes

# 4. Start development server
npm run dev

# 5. Your app is now connected to Firebase!
```
