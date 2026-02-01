import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

// ===========================================
// PIXLY - Firebase Admin Configuration
// ===========================================

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

/**
 * Load service account from JSON file or environment variables
 * Priority:
 * 1. JSON file at project root: firebase-service-account.json
 * 2. Environment variables: FIREBASE_ADMIN_*
 */
function getServiceAccountCredentials(): ServiceAccount | null {
  // Option 1: Load from JSON file (recommended)
  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log('✓ Firebase Admin: Using service account file');
      return serviceAccount as ServiceAccount;
    } catch (error) {
      console.error('Error reading service account file:', error);
    }
  }

  // Option 2: Load from environment variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    console.log('✓ Firebase Admin: Using environment variables');
    return {
      projectId,
      clientEmail,
      privateKey,
    } as ServiceAccount;
  }

  console.warn('⚠ Firebase Admin: No credentials found. Server-side features will be disabled.');
  console.warn('  Place firebase-service-account.json at project root or set FIREBASE_ADMIN_* env vars.');
  return null;
}

function initializeAdminFirebase() {
  if (getApps().length === 0) {
    const credentials = getServiceAccountCredentials();

    if (credentials) {
      adminApp = initializeApp({
        credential: cert(credentials),
      });
    } else {
      // Initialize without credentials (limited functionality)
      adminApp = initializeApp();
    }
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);

  return { adminApp, adminDb, adminAuth };
}

// Initialize on import
const admin = initializeAdminFirebase();

export { admin, adminDb, adminAuth };
export default admin;
