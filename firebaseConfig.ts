/**
 * Firebase Configuration
 *
 * This file exports the Firebase configuration for your project.
 * The configuration is loaded from environment variables (.env file).
 */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-project-58a12.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-project-58a12",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-project-58a12.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "486888272672",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:486888272672:web:12dd26d11c57b3f4685d45",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BD8CQ1SF85"
};

// A simple check to see if the config is filled out.
export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};
