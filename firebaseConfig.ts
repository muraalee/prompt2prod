// IMPORTANT: Replace this with your own Firebase configuration.
// Go to your Firebase project console, click the Settings gear,
// then Project settings. In the "Your apps" card, select the Web app.
// Copy the firebaseConfig object and paste it here.






// A simple check to see if the config is filled out.
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
}