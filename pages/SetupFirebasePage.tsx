/**
 * Firebase Setup Page
 *
 * Guides users through automatic Firebase project provisioning
 * or manual configuration entry.
 */

import React, { useState, useEffect } from 'react';
import {
  setupFirebaseProject,
  checkBackendHealth,
  saveFirebaseConfig,
  type FirebaseConfig,
} from '../services/setupFirebase';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

interface SetupFirebasePageProps {
  onSetupComplete: () => void;
}

const SetupFirebasePage: React.FC<SetupFirebasePageProps> = ({ onSetupComplete }) => {
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [setupMode, setSetupMode] = useState<'auto' | 'manual' | null>(null);
  const [projectName, setProjectName] = useState('');

  // Manual config state
  const [configJson, setConfigJson] = useState('');

  useEffect(() => {
    // Check if backend is available on mount
    checkBackendHealth().then(setBackendAvailable);
  }, []);

  const handleAutoSetup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await setupFirebaseProject(projectName);

      if (result.success) {
        setSuccess(
          `Firebase project "${result.projectId}" created successfully! Initializing your blog...`
        );

        // Wait a moment for user to see success message
        setTimeout(() => {
          onSetupComplete();
        }, 2000);
      } else {
        setError(result.error || 'Failed to create Firebase project');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSetup = () => {
    setError(null);

    // Validate input is not empty
    if (!configJson.trim()) {
      setError('Please paste your Firebase configuration');
      return;
    }

    try {
      let input = configJson.trim();

      // Remove single-line comments (// ...)
      input = input.replace(/\/\/.*$/gm, '');

      // Remove multi-line comments (/* ... */)
      input = input.replace(/\/\*[\s\S]*?\*\//g, '');

      // Extract the object literal from various formats
      let jsonToParse = input;

      // Try to find object literal pattern { ... }
      const objectMatch = input.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonToParse = objectMatch[0];
      } else {
        // No object found, try to parse as-is
        jsonToParse = input;
      }

      // Remove any remaining variable declarations before the object
      jsonToParse = jsonToParse.replace(/^(export\s+)?(const|var|let)\s+\w+\s*=\s*/, '');

      // Remove trailing semicolons and whitespace
      jsonToParse = jsonToParse.replace(/;+\s*$/, '').trim();

      // Convert JavaScript object notation to valid JSON
      // Replace unquoted keys with quoted keys
      // Match word followed by colon, but only if not inside a string value
      // Use negative lookbehind to avoid matching inside quoted strings
      jsonToParse = jsonToParse.replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:');

      // Remove trailing commas before closing braces/brackets (invalid in JSON)
      jsonToParse = jsonToParse.replace(/,(\s*[}\]])/g, '$1');

      // Parse the JSON
      const parsedConfig = JSON.parse(jsonToParse);

      // Validate it's an object
      if (typeof parsedConfig !== 'object' || parsedConfig === null) {
        setError('Invalid configuration format. Please paste a valid Firebase config object.');
        return;
      }

      // Validate required fields
      const requiredFields: (keyof FirebaseConfig)[] = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'appId'
      ];

      const missingFields = requiredFields.filter(field => !parsedConfig[field]);

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Build the config object with all available fields
      const config: FirebaseConfig = {
        apiKey: parsedConfig.apiKey,
        authDomain: parsedConfig.authDomain,
        projectId: parsedConfig.projectId,
        storageBucket: parsedConfig.storageBucket,
        messagingSenderId: parsedConfig.messagingSenderId || '',
        appId: parsedConfig.appId,
        ...(parsedConfig.measurementId && { measurementId: parsedConfig.measurementId }),
      };

      // Save the configuration
      saveFirebaseConfig(config);
      setSuccess('Configuration saved successfully! Initializing your blog...');

      setTimeout(() => {
        onSetupComplete();
      }, 1500);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your Firebase config and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save configuration');
      }
    }
  };

  // Initial screen - choose setup method
  if (setupMode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Welcome to AI Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Let's set up your Firebase backend to get started
            </p>
          </div>

          {backendAvailable === null ? (
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Checking provisioning service...
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Auto Setup Option */}
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-2 transition-all ${
                  backendAvailable
                    ? 'border-green-500 hover:shadow-xl cursor-pointer'
                    : 'border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => backendAvailable && setSetupMode('auto')}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">🚀</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Automatic Setup
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We'll create a Firebase project for you automatically
                  </p>
                  <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                    <li>✅ Instant setup in 30-60 seconds</li>
                    <li>✅ Firebase project created for you</li>
                    <li>✅ Firestore configured automatically</li>
                    <li>✅ Security rules pre-configured</li>
                  </ul>
                  {backendAvailable ? (
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      onClick={() => setSetupMode('auto')}
                    >
                      Auto Setup
                    </button>
                  ) : (
                    <div className="text-red-600 dark:text-red-400 text-sm">
                      ⚠️ Backend service unavailable
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Setup Option */}
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-2 border-blue-500 hover:shadow-xl cursor-pointer transition-all"
                onClick={() => setSetupMode('manual')}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">⚙️</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Manual Setup
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Use your existing Firebase project
                  </p>
                  <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                    <li>🔧 Use existing Firebase project</li>
                    <li>🔧 Full control over configuration</li>
                    <li>🔧 Enter credentials manually</li>
                    <li>🔧 Works without backend service</li>
                  </ul>
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    onClick={() => setSetupMode('manual')}
                  >
                    Manual Setup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Auto setup screen
  if (setupMode === 'auto') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <button
            onClick={() => setSetupMode(null)}
            className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            disabled={loading}
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Automatic Firebase Setup
          </h1>

          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          {success && <Alert type="success" message={success} />}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name (optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Blog"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                A unique project ID will be generated automatically
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                What happens next?
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>Create a new Google Cloud project</li>
                <li>Enable Firebase for the project</li>
                <li>Set up Firestore database</li>
                <li>Configure security rules</li>
                <li>Return configuration to your browser</li>
              </ol>
              <p className="mt-3 text-xs text-blue-700 dark:text-blue-300">
                This typically takes 30-60 seconds
              </p>
            </div>

            <button
              onClick={handleAutoSetup}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-3">Creating your Firebase project...</span>
                </>
              ) : (
                'Create Firebase Project'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Manual setup screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <button
          onClick={() => setSetupMode(null)}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Manual Firebase Configuration
        </h1>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} />}

        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Get your Firebase config:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            <li>Go to Firebase Console (console.firebase.google.com)</li>
            <li>Create or select your project</li>
            <li>Click Settings ⚙️ → Project settings</li>
            <li>Scroll to "Your apps" and select or add a Web app</li>
            <li>Copy the entire <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">firebaseConfig</code> object</li>
          </ol>
          <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-800/50 rounded text-xs font-mono text-yellow-900 dark:text-yellow-100">
            <div className="text-gray-600 dark:text-gray-400">// Example - any format works:</div>
            <div>const firebaseConfig = &#123;</div>
            <div className="ml-4">apiKey: "AIza...",</div>
            <div className="ml-4">authDomain: "project.firebaseapp.com",</div>
            <div className="ml-4">projectId: "my-project",</div>
            <div className="ml-4">// ...</div>
            <div>&#125;;</div>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleManualSetup(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paste your Firebase config here <span className="text-red-500">*</span>
            </label>
            <textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              placeholder={`// Paste any format - all work fine:\n\nconst firebaseConfig = {\n  apiKey: "AIza...",\n  authDomain: "your-project.firebaseapp.com",\n  projectId: "your-project-id",\n  storageBucket: "your-project.appspot.com",\n  messagingSenderId: "123456789",\n  appId: "1:123456789:web:abcdef"\n};\n\n// or just the object:\n{ "apiKey": "...", ... }`}
              rows={14}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 font-mono text-sm resize-y"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              ✨ Supports any format: with/without <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">const</code>, with/without quotes, with comments, trailing commas, etc.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupFirebasePage;
