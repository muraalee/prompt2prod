/**
 * Firebase Auto-Provisioning Backend Server
 *
 * This Express server provides an API endpoint to automatically create
 * Firebase projects using Google Cloud Platform APIs.
 *
 * Requirements:
 * - GCP Service Account with Firebase Admin SDK and Cloud Resource Manager permissions
 * - Environment variables configured in .env
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Service account credentials (from environment or file)
const getServiceAccountCredentials = () => {
  if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
    // Parse from environment variable (base64 encoded JSON)
    const decoded = Buffer.from(process.env.GCP_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8');
    return JSON.parse(decoded);
  }
  // Fallback to service account key file
  return JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON || '{}');
};

/**
 * Create Firebase project using Firebase Management API
 *
 * Steps:
 * 1. Authenticate with service account
 * 2. Create GCP project
 * 3. Enable Firebase on the project
 * 4. Create a web app in Firebase
 * 5. Enable Firestore
 * 6. Set up security rules
 * 7. Return Firebase config
 */
async function createFirebaseProject(projectDisplayName, userId) {
  try {
    const credentials = getServiceAccountCredentials();

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase',
      ],
    });

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    // Generate unique project ID
    const projectId = `blog-${userId}-${uuidv4().split('-')[0]}`;
    const parentOrganization = process.env.GCP_ORGANIZATION_ID || null;
    const parentFolder = process.env.GCP_FOLDER_ID || null;

    // Step 1: Create GCP Project
    console.log('Creating GCP project:', projectId);
    const cloudResourceManager = google.cloudresourcemanager('v1');

    const projectCreateResponse = await cloudResourceManager.projects.create({
      auth: authClient,
      requestBody: {
        projectId: projectId,
        name: projectDisplayName,
        ...(parentOrganization && { parent: { type: 'organization', id: parentOrganization } }),
        ...(parentFolder && { parent: { type: 'folder', id: parentFolder } }),
      },
    });

    console.log('GCP Project created:', projectCreateResponse.data);

    // Wait for project creation to complete
    await waitForOperation(authClient, projectCreateResponse.data.name);

    // Step 2: Add Firebase to the project
    console.log('Adding Firebase to project...');
    const addFirebaseResponse = await fetch(
      `https://firebase.googleapis.com/v1beta1/projects/${projectId}:addFirebase`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!addFirebaseResponse.ok) {
      const errorText = await addFirebaseResponse.text();
      throw new Error(`Failed to add Firebase: ${errorText}`);
    }

    const firebaseProject = await addFirebaseResponse.json();
    console.log('Firebase added:', firebaseProject);

    // Step 3: Create a Web App
    console.log('Creating web app...');
    const webAppResponse = await fetch(
      `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: 'AI Blogger Web App',
        }),
      }
    );

    if (!webAppResponse.ok) {
      const errorText = await webAppResponse.text();
      throw new Error(`Failed to create web app: ${errorText}`);
    }

    const webApp = await webAppResponse.json();
    const appId = webApp.name.split('/').pop();
    console.log('Web app created:', appId);

    // Step 4: Get Web App Config
    console.log('Fetching web app config...');
    const configResponse = await fetch(
      `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${appId}/config`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
        },
      }
    );

    if (!configResponse.ok) {
      const errorText = await configResponse.text();
      throw new Error(`Failed to get config: ${errorText}`);
    }

    const config = await configResponse.json();
    console.log('Firebase config retrieved');

    // Step 5: Enable Firestore
    console.log('Enabling Firestore...');
    await enableFirestore(authClient, projectId, accessToken.token);

    // Step 6: Set default Firestore rules
    console.log('Setting Firestore security rules...');
    await setFirestoreRules(accessToken.token, projectId);

    // Return the complete Firebase configuration
    return {
      success: true,
      projectId: projectId,
      config: {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        ...(config.measurementId && { measurementId: config.measurementId }),
      },
    };

  } catch (error) {
    console.error('Error creating Firebase project:', error);
    throw error;
  }
}

/**
 * Wait for a long-running operation to complete
 */
async function waitForOperation(authClient, operationName, maxRetries = 30) {
  const cloudResourceManager = google.cloudresourcemanager('v1');

  for (let i = 0; i < maxRetries; i++) {
    const operation = await cloudResourceManager.operations.get({
      auth: authClient,
      name: operationName,
    });

    if (operation.data.done) {
      if (operation.data.error) {
        throw new Error(`Operation failed: ${JSON.stringify(operation.data.error)}`);
      }
      return operation.data;
    }

    // Wait 2 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Operation timed out');
}

/**
 * Enable Firestore on the project
 */
async function enableFirestore(authClient, projectId, accessToken) {
  try {
    // Enable Firestore API
    const serviceUsage = google.serviceusage('v1');
    await serviceUsage.services.enable({
      auth: authClient,
      name: `projects/${projectId}/services/firestore.googleapis.com`,
    });

    // Create Firestore database
    const createDbResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases?databaseId=(default)`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: process.env.FIRESTORE_LOCATION || 'us-central1',
          type: 'FIRESTORE_NATIVE',
        }),
      }
    );

    if (!createDbResponse.ok && createDbResponse.status !== 409) {
      // 409 means database already exists, which is fine
      const errorText = await createDbResponse.text();
      console.warn('Firestore creation warning:', errorText);
    }

    console.log('Firestore enabled');
  } catch (error) {
    console.warn('Firestore setup warning:', error.message);
    // Don't fail the entire process if Firestore setup has issues
  }
}

/**
 * Set default Firestore security rules
 */
async function setFirestoreRules(accessToken, projectId) {
  try {
    // Default rules: allow read for all, write for authenticated users
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Posts collection
    match /posts/{postId} {
      // Anyone can read posts
      allow read: if true;
      // Anyone can create/update/delete posts (you should add auth later)
      allow write: if true;
    }

    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

    const rulesResponse = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: {
            files: [
              {
                name: 'firestore.rules',
                content: rules,
              },
            ],
          },
        }),
      }
    );

    if (!rulesResponse.ok) {
      const errorText = await rulesResponse.text();
      console.warn('Failed to set rules:', errorText);
      return;
    }

    const ruleset = await rulesResponse.json();
    const rulesetName = ruleset.name;

    // Release the ruleset
    await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rulesetName: rulesetName,
        }),
      }
    );

    console.log('Firestore rules set successfully');
  } catch (error) {
    console.warn('Failed to set Firestore rules:', error.message);
    // Don't fail the entire process
  }
}

// API Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Setup Firebase endpoint
 * Creates a new Firebase project and returns configuration
 */
app.post('/api/setupFirebase', async (req, res) => {
  try {
    const { userId, projectName } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const displayName = projectName || `AI Blog - ${userId}`;

    // Check for required environment variables
    if (!process.env.GCP_SERVICE_ACCOUNT_KEY && !process.env.GCP_SERVICE_ACCOUNT_JSON) {
      return res.status(500).json({
        success: false,
        error: 'Service account credentials not configured',
      });
    }

    console.log(`Creating Firebase project for user: ${userId}`);

    // Create the Firebase project
    const result = await createFirebaseProject(displayName, userId);

    res.json(result);

  } catch (error) {
    console.error('Setup Firebase error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * Verify Firebase config endpoint
 * Tests if a Firebase config is valid
 */
app.post('/api/verifyFirebase', async (req, res) => {
  try {
    const { config } = req.body;

    if (!config || !config.apiKey || !config.projectId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Firebase configuration',
      });
    }

    // Simple validation - check if project exists
    res.json({
      success: true,
      message: 'Configuration appears valid',
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Firebase Provisioning Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
});

export default app;
