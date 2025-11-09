#!/usr/bin/env node

/**
 * Firebase Automatic Database Setup Tool (Simplified)
 *
 * This tool automatically:
 * 1. Connects to your existing Firebase project
 * 2. Lists your web apps (or creates a new one)
 * 3. Retrieves the configuration
 * 4. Writes it to .env file with VITE_FIREBASE_* keys
 *
 * Usage:
 *   npm run setup-firebase
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ANSI color codes for better CLI output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

interface WebApp {
  appId: string;
  displayName: string;
  platform: string;
  projectId: string;
}

class FirebaseAutoSetup {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  private logSuccess(message: string) {
    this.log(`✓ ${message}`, 'green');
  }

  private logError(message: string) {
    this.log(`✗ ${message}`, 'red');
  }

  private logInfo(message: string) {
    this.log(`ℹ ${message}`, 'blue');
  }

  private logWarning(message: string) {
    this.log(`⚠ ${message}`, 'yellow');
  }

  private async question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async confirm(prompt: string, defaultYes = false): Promise<boolean> {
    const suffix = defaultYes ? ' (Y/n): ' : ' (y/N): ';
    const answer = await this.question(prompt + suffix);

    if (!answer) return defaultYes;
    return answer.toLowerCase().startsWith('y');
  }

  /**
   * Check if Firebase CLI is installed
   */
  private async checkFirebaseCLI(): Promise<boolean> {
    try {
      await execAsync('firebase --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Install Firebase CLI
   */
  private async installFirebaseCLI(): Promise<boolean> {
    this.logInfo('Installing Firebase CLI...');
    try {
      await execAsync('npm install -g firebase-tools');
      this.logSuccess('Firebase CLI installed successfully');
      return true;
    } catch (error) {
      this.logError('Failed to install Firebase CLI');
      console.error(error);
      return false;
    }
  }

  /**
   * Login to Firebase
   */
  private async loginToFirebase(): Promise<boolean> {
    this.logInfo('Opening browser for Firebase authentication...');
    try {
      await execAsync('firebase login --no-localhost');
      this.logSuccess('Successfully logged in to Firebase');
      return true;
    } catch (error) {
      this.logError('Failed to login to Firebase');
      console.error(error);
      return false;
    }
  }

  /**
   * List Firebase projects
   */
  private async listFirebaseProjects(): Promise<any[]> {
    try {
      const { stdout } = await execAsync('firebase projects:list --json');
      const result = JSON.parse(stdout);
      return result.result || [];
    } catch (error) {
      this.logWarning('Could not list Firebase projects');
      return [];
    }
  }

  /**
   * List web apps in a Firebase project
   */
  private async listWebApps(projectId: string): Promise<WebApp[]> {
    try {
      this.logInfo('Fetching web apps from project...');
      const { stdout } = await execAsync(
        `firebase apps:list WEB --project=${projectId} --json`
      );

      const result = JSON.parse(stdout);

      // Handle both possible response formats
      const apps = result.result || result;

      if (Array.isArray(apps) && apps.length > 0) {
        return apps;
      }

      this.logWarning('No web apps found in this project');
      return [];
    } catch (error) {
      this.logWarning('Could not list web apps');
      console.error(error);
      return [];
    }
  }

  /**
   * Create a new web app in Firebase project
   */
  private async createWebApp(projectId: string, appName: string): Promise<string | null> {
    try {
      this.logInfo(`Creating web app: ${appName}...`);

      const { stdout } = await execAsync(
        `firebase apps:create WEB "${appName}" --project=${projectId} --json`
      );

      const result = JSON.parse(stdout);

      // Extract app ID from result
      const appId = result.appId || result.result?.appId;

      if (appId) {
        this.logSuccess(`Web app created successfully (${appId})`);
        return appId;
      } else {
        this.logError('App created but could not extract app ID');
        console.log('Response:', result);
        return null;
      }
    } catch (error) {
      this.logError('Failed to create web app');
      console.error(error);
      return null;
    }
  }

  /**
   * Get Firebase config for a specific web app
   */
  private async getFirebaseConfig(projectId: string, appId: string): Promise<FirebaseConfig | null> {
    try {
      this.logInfo('Retrieving Firebase configuration...');

      // Get config for specific app
      const { stdout } = await execAsync(
        `firebase apps:sdkconfig WEB ${appId} --project=${projectId} --json`
      );

      const result = JSON.parse(stdout);

      // Parse the SDK config from the result
      let config = result.sdkConfig || result.result?.sdkConfig || result;

      // If it's still wrapped, try to unwrap
      if (config.sdkConfig) {
        config = config.sdkConfig;
      }

      // Validate we have the required fields
      if (!config.apiKey || !config.projectId) {
        this.logError('Invalid config format received');
        console.log('Received:', JSON.stringify(result, null, 2));
        return null;
      }

      this.logSuccess('Firebase configuration retrieved');
      return config as FirebaseConfig;
    } catch (error) {
      this.logError('Failed to retrieve Firebase config');
      console.error(error);
      return null;
    }
  }

  /**
   * Save config to .env file
   */
  private async saveToEnvFile(config: FirebaseConfig): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');

    const envContent = `# Firebase Configuration (Auto-generated by firebase-auto-setup)
# Generated on: ${new Date().toISOString()}
VITE_FIREBASE_API_KEY=${config.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain}
VITE_FIREBASE_PROJECT_ID=${config.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}
VITE_FIREBASE_APP_ID=${config.appId}
${config.measurementId ? `VITE_FIREBASE_MEASUREMENT_ID=${config.measurementId}` : ''}`;

    // Save to .env (main file)
    fs.writeFileSync(envPath, envContent);
    this.logSuccess(`Configuration saved to ${envPath}`);

    // Also create .env.example for reference
    const exampleContent = envContent.replace(/=.*/g, '=YOUR_VALUE_HERE');
    fs.writeFileSync(path.join(process.cwd(), '.env.example'), exampleContent);
    this.logSuccess('Created .env.example template');
  }

  /**
   * Interactive setup wizard
   */
  async runInteractiveSetup(): Promise<void> {
    this.log('\n=== Firebase Configuration Setup ===\n', 'bright');

    // Check Firebase CLI
    const hasFirebaseCLI = await this.checkFirebaseCLI();

    if (!hasFirebaseCLI) {
      this.logWarning('Firebase CLI is not installed');
      const install = await this.confirm('Would you like to install Firebase CLI?', true);
      if (install) {
        const installed = await this.installFirebaseCLI();
        if (!installed) {
          this.logError('Cannot proceed without Firebase CLI');
          this.rl.close();
          return;
        }
      } else {
        this.logInfo('Please install Firebase CLI: npm install -g firebase-tools');
        this.rl.close();
        return;
      }
    } else {
      this.logSuccess('Firebase CLI is installed');
    }

    // Check if logged in
    const isLoggedIn = await this.confirm('Are you logged in to Firebase?', false);
    if (!isLoggedIn) {
      const loggedIn = await this.loginToFirebase();
      if (!loggedIn) {
        this.logError('Cannot proceed without Firebase authentication');
        this.rl.close();
        return;
      }
    }

    // List and select project
    const projects = await this.listFirebaseProjects();

    if (projects.length > 0) {
      this.log('\n=== Available Firebase Projects ===\n', 'bright');
      projects.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.projectId} ${p.displayName ? `(${p.displayName})` : ''}`);
      });
      console.log('');
    }

    const projectId = await this.question('Enter Firebase Project ID: ');

    if (!projectId) {
      this.logError('Project ID is required');
      this.rl.close();
      return;
    }

    // List web apps in the project
    const webApps = await this.listWebApps(projectId);

    let selectedAppId: string | null = null;

    if (webApps.length > 0) {
      this.log('\n=== Web Apps in Project ===\n', 'bright');
      webApps.forEach((app, i) => {
        console.log(`  ${i + 1}. ${app.displayName || 'Unnamed'} (${app.appId})`);
      });
      console.log('');

      const useExisting = await this.confirm('Use an existing web app?', true);

      if (useExisting) {
        const appChoice = await this.question('Enter app number: ');
        const appIndex = parseInt(appChoice) - 1;

        if (appIndex >= 0 && appIndex < webApps.length) {
          selectedAppId = webApps[appIndex].appId;
          this.logSuccess(`Selected: ${webApps[appIndex].displayName || 'Unnamed'}`);
        } else {
          this.logError('Invalid app number');
          this.rl.close();
          return;
        }
      }
    }

    // Create new app if needed
    if (!selectedAppId) {
      const createNew = await this.confirm('Create a new web app?', true);

      if (createNew) {
        const appName = await this.question('Web app name (default: My Web App): ') || 'My Web App';
        selectedAppId = await this.createWebApp(projectId, appName);

        if (!selectedAppId) {
          this.logError('Failed to create web app');
          this.rl.close();
          return;
        }
      } else {
        this.logError('No app selected');
        this.rl.close();
        return;
      }
    }

    // Get Firebase configuration
    const config = await this.getFirebaseConfig(projectId, selectedAppId);

    if (!config) {
      this.logError('Failed to retrieve Firebase configuration');
      this.rl.close();
      return;
    }

    // Display configuration
    this.log('\n=== Firebase Configuration ===\n', 'bright');
    console.log(JSON.stringify(config, null, 2));

    // Save configuration to .env file
    const saveEnv = await this.confirm('\nSave to .env file?', true);
    if (saveEnv) {
      await this.saveToEnvFile(config);
    }

    this.log('\n=== Setup Complete! ===\n', 'green');
    this.logSuccess('Firebase configuration is ready');
    this.logInfo('Restart your development server to apply changes');
    this.logInfo('Run: npm run dev');

    this.rl.close();
  }
}

// Main execution
async function main() {
  const setup = new FirebaseAutoSetup();

  try {
    await setup.runInteractiveSetup();
  } catch (error) {
    console.error('\nSetup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the main function (ES module style)
main().catch(console.error);

export default FirebaseAutoSetup;
