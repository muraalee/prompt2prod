/**
 * Frontend Firebase Setup Service
 *
 * Handles automatic Firebase project provisioning by communicating
 * with the backend provisioning service.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface SetupResponse {
  success: boolean;
  projectId?: string;
  config?: FirebaseConfig;
  error?: string;
  details?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const CONFIG_STORAGE_KEY = 'firebase_auto_config';
const USER_ID_STORAGE_KEY = 'firebase_user_id';

/**
 * Get or generate a unique user ID
 */
function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (!userId) {
    // Generate a unique ID for this browser/user
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  }
  return userId;
}

/**
 * Check if Firebase is already configured (from localStorage)
 */
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      // Validate config has required fields
      if (config.apiKey && config.projectId && config.authDomain) {
        return config;
      }
    }
  } catch (error) {
    console.error('Error reading stored config:', error);
  }
  return null;
}

/**
 * Save Firebase config to localStorage
 */
export function saveFirebaseConfig(config: FirebaseConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    console.log('Firebase config saved to localStorage');
  } catch (error) {
    console.error('Error saving config:', error);
    throw new Error('Failed to save Firebase configuration');
  }
}

/**
 * Clear stored Firebase configuration
 */
export function clearFirebaseConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
  console.log('Firebase config cleared');
}

/**
 * Request automatic Firebase project setup from backend
 */
export async function setupFirebaseProject(
  projectName?: string
): Promise<SetupResponse> {
  try {
    const userId = getUserId();

    console.log('Requesting Firebase project setup...');

    const response = await fetch(`${BACKEND_URL}/api/setupFirebase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        projectName: projectName || `AI Blog ${new Date().toISOString().split('T')[0]}`,
      }),
    });

    const data: SetupResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Setup failed with status ${response.status}`);
    }

    if (data.success && data.config) {
      // Save the configuration
      saveFirebaseConfig(data.config);
      console.log('Firebase project created successfully:', data.projectId);
    }

    return data;

  } catch (error) {
    console.error('Firebase setup error:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Cannot connect to provisioning service. Make sure the backend is running.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Verify a Firebase configuration is valid
 */
export async function verifyFirebaseConfig(
  config: FirebaseConfig
): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/verifyFirebase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config }),
    });

    const data = await response.json();
    return data.success === true;

  } catch (error) {
    console.error('Config verification error:', error);
    return false;
  }
}

/**
 * Check if the backend service is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Get the complete Firebase config (from env, localStorage, or null)
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  // Priority 1: Environment variables (manually configured)
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    console.log('[Firebase Config] Using environment variables from .env');
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }

  // Priority 2: Auto-provisioned config from localStorage
  const storedConfig = getStoredFirebaseConfig();
  if (storedConfig) {
    console.log('[Firebase Config] Using auto-provisioned config from localStorage');
    return storedConfig;
  }

  // No configuration available
  console.log('[Firebase Config] No configuration found');
  return null;
}

/**
 * Check if Firebase is configured (any method)
 */
export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}
