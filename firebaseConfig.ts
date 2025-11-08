// IMPORTANT: Replace this with your own Firebase configuration.
// Go to your Firebase project console, click the Settings gear,
// then Project settings. In the "Your apps" card, select the Web app.
// Copy the firebaseConfig object and paste it here.





export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// A simple check to see if the config is filled out.
export const isFirebaseConfigured = () => {
    return !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
}