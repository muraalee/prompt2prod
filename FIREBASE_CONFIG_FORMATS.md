# Supported Firebase Config Formats

The Manual Firebase Configuration parser supports multiple input formats. You can paste any of these formats into the textarea and it will work correctly.

## ✅ Supported Formats

### 1. Direct Copy from Firebase Console (Most Common)

This is **exactly** what you get from Firebase Console - just copy and paste!

```javascript
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE",
  authDomain: "ai-project-58a12.firebaseapp.com",
  projectId: "ai-project-58a12",
  storageBucket: "ai-project-58a12.firebasestorage.app",
  messagingSenderId: "486888272672",
  appId: "1:486888272672:web:12dd26d11c57b3f4685d45",
  measurementId: "G-BD8CQ1SF85"
};
```

✅ **This works perfectly!** Just copy the entire snippet with the comment and paste it in.

### 2. Standard JavaScript Object (with const)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE",
  authDomain: "ai-project-58a12.firebaseapp.com",
  projectId: "ai-project-58a12",
  storageBucket: "ai-project-58a12.firebasestorage.app",
  messagingSenderId: "486888272672",
  appId: "1:486888272672:web:12dd26d11c57b3f4685d45",
  measurementId: "G-BD8CQ1SF85"
};
```

### 2. With Export
```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE",
  authDomain: "ai-project-58a12.firebaseapp.com",
  projectId: "ai-project-58a12",
  storageBucket: "ai-project-58a12.firebasestorage.app",
  messagingSenderId: "486888272672",
  appId: "1:486888272672:web:12dd26d11c57b3f4685d45"
};
```

### 3. Just the Object (no variable)
```javascript
{
  apiKey: "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE",
  authDomain: "ai-project-58a12.firebaseapp.com",
  projectId: "ai-project-58a12",
  storageBucket: "ai-project-58a12.firebasestorage.app",
  messagingSenderId: "486888272672",
  appId: "1:486888272672:web:12dd26d11c57b3f4685d45"
}
```

### 4. JSON Format (quoted keys)
```json
{
  "apiKey": "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE",
  "authDomain": "ai-project-58a12.firebaseapp.com",
  "projectId": "ai-project-58a12",
  "storageBucket": "ai-project-58a12.firebasestorage.app",
  "messagingSenderId": "486888272672",
  "appId": "1:486888272672:web:12dd26d11c57b3f4685d45"
}
```

### 5. With Comments
```javascript
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE", // Your API key
  authDomain: "ai-project-58a12.firebaseapp.com",
  projectId: "ai-project-58a12", // Project ID
  storageBucket: "ai-project-58a12.firebasestorage.app",
  messagingSenderId: "486888272672",
  appId: "1:486888272672:web:12dd26d11c57b3f4685d45"
}; // End of config
```

### 6. With Multi-line Comments
```javascript
const firebaseConfig = {
  /* API Key from Firebase Console */
  apiKey: "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE",
  authDomain: "ai-project-58a12.firebaseapp.com",
  /*
   * Project configuration
   */
  projectId: "ai-project-58a12",
  storageBucket: "ai-project-58a12.firebasestorage.app",
  messagingSenderId: "486888272672",
  appId: "1:486888272672:web:12dd26d11c57b3f4685d45"
};
```

### 7. With Trailing Commas (JavaScript style)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE",
  authDomain: "ai-project-58a12.firebaseapp.com",
  projectId: "ai-project-58a12",
  storageBucket: "ai-project-58a12.firebasestorage.app",
  messagingSenderId: "486888272672",
  appId: "1:486888272672:web:12dd26d11c57b3f4685d45",
  // Trailing comma is fine
};
```

### 8. Mixed Formats
```javascript
// Works with any combination
export const firebaseConfig = {
  "apiKey": "AIzaSyBgr8TVKMZjxcbfcCMX_WY0Js-OB4GcmgE", // Quoted key
  authDomain: "ai-project-58a12.firebaseapp.com",     // Unquoted key
  projectId: "ai-project-58a12",
  storageBucket: "ai-project-58a12.firebasestorage.app",
  messagingSenderId: "486888272672",
  appId: "1:486888272672:web:12dd26d11c57b3f4685d45",
};
```

## 🔍 How the Parser Works

The parser performs the following steps:

1. **Remove Comments**: Strips both `//` single-line and `/* */` multi-line comments
2. **Extract Object**: Uses regex to find the object literal `{ ... }`
3. **Clean Declaration**: Removes variable declarations (`const`, `var`, `let`, `export`)
4. **Remove Semicolons**: Strips trailing semicolons
5. **Normalize Keys**: Converts unquoted keys to quoted keys for JSON compatibility
6. **Remove Trailing Commas**: Removes trailing commas (invalid in strict JSON)
7. **Parse JSON**: Parses the cleaned string as JSON
8. **Validate**: Checks for required fields: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `appId`
9. **Save**: Stores the configuration in `localStorage` as `firebase_auto_config`

## ✅ Required Fields

The following fields **must** be present:

- ✓ `apiKey` - Your Firebase API key
- ✓ `authDomain` - Firebase authentication domain
- ✓ `projectId` - Your Firebase project ID
- ✓ `storageBucket` - Firebase storage bucket
- ✓ `appId` - Firebase app ID

## 📝 Optional Fields

These fields are optional but will be included if present:

- `messagingSenderId` - For Firebase Cloud Messaging
- `measurementId` - For Google Analytics

## ❌ Error Messages

### Missing Fields
```
Missing required fields: apiKey, projectId
```
The config is missing one or more required fields.

### Invalid JSON
```
Invalid JSON format. Please check your Firebase config and try again.
```
The input couldn't be parsed. Check for:
- Unclosed braces `{ }`
- Unclosed quotes `" "`
- Invalid characters

### Empty Input
```
Please paste your Firebase configuration
```
The textarea is empty.

## 💡 Tips

1. **Copy from Firebase Console**: The easiest way is to copy the entire code snippet from Firebase Console
2. **Don't Worry About Format**: The parser handles all common formats automatically
3. **Check Required Fields**: Make sure all required fields are included in your paste
4. **Comments Are Fine**: You can leave comments in the code - they'll be stripped automatically
5. **Trailing Commas OK**: JavaScript-style trailing commas are handled correctly

## 🎯 Example Usage

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click Settings ⚙️ → Project settings
4. Scroll to "Your apps"
5. Click on your web app (or create one)
6. Copy the entire `firebaseConfig` code snippet
7. Paste it into the textarea (any format)
8. Click "Save Configuration"
9. Done! ✨

The app will automatically reload with your Firebase configuration active.
