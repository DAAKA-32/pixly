/**
 * ===========================================
 * PIXLY - Firebase Initialization Script
 * Lead Backend & Fullstack Developer Config
 * ===========================================
 *
 * This script initializes all Firebase collections and creates
 * required documents for the application to function properly.
 *
 * Usage:
 * 1. Ensure FIREBASE_ADMIN_* environment variables are set
 * 2. Run: npx ts-node scripts/firebase-init.ts
 *
 * Or use with Firebase CLI:
 * firebase deploy --only firestore:rules,firestore:indexes,storage
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    // Check for required environment variables
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

    if (!privateKey || !projectId || !clientEmail) {
      console.error('Missing Firebase Admin credentials. Please set:');
      console.error('- FIREBASE_ADMIN_PRIVATE_KEY');
      console.error('- FIREBASE_ADMIN_PROJECT_ID');
      console.error('- FIREBASE_ADMIN_CLIENT_EMAIL');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  return admin.firestore();
};

// Collection schemas for documentation
const COLLECTIONS = {
  users: {
    description: 'User profiles and authentication data',
    fields: {
      id: 'string - Firebase UID',
      email: 'string - User email (required)',
      displayName: 'string | null - Display name',
      photoURL: 'string | null - Profile photo URL',
      createdAt: 'Timestamp - Account creation date',
      updatedAt: 'Timestamp - Last update date',
      plan: "string - 'free' | 'starter' | 'growth' | 'scale' | 'unlimited'",
      workspaceIds: 'string[] - Array of workspace IDs',
    },
  },
  workspaces: {
    description: 'Workspace/organization data',
    fields: {
      id: 'string - Auto-generated ID',
      name: 'string - Workspace name',
      ownerId: 'string - Owner user ID',
      memberIds: 'string[] - Array of member user IDs',
      pixelId: 'string - Tracking pixel ID (TRK_xxxxx)',
      createdAt: 'Timestamp - Creation date',
      settings: {
        timezone: 'string - Default: UTC',
        currency: 'string - Default: USD',
        attributionWindow: 'number - Days (default: 30)',
        defaultAttributionModel: 'string - Attribution model',
      },
      integrations: {
        meta: 'Integration object',
        google: 'Integration object',
        stripe: 'Integration object',
        shopify: 'Integration object',
      },
    },
  },
  events: {
    description: 'Tracking events from pixel',
    fields: {
      id: 'string - Auto-generated ID',
      pixelId: 'string - Associated pixel ID',
      workspaceId: 'string - Workspace ID',
      eventType: 'string - Event type',
      eventName: 'string - Event name',
      timestamp: 'Timestamp - Event time',
      sessionId: 'string - Session ID',
      fpid: 'string - First-party ID',
      clickIds: 'object - Click IDs (gclid, fbclid, etc.)',
      hashedEmail: 'string | null - SHA256 hashed email',
      userId: 'string | null - User identifier',
      context: 'object - Event context (url, device, etc.)',
      properties: 'object - Custom properties',
      value: 'number | null - Conversion value',
      currency: 'string | null - Currency code',
      attributed: 'boolean - Attribution status',
      attributedTo: 'object | null - Attribution details',
    },
  },
  sessions: {
    description: 'User sessions for attribution',
    fields: {
      id: 'string - Session ID',
      pixelId: 'string - Associated pixel ID',
      workspaceId: 'string - Workspace ID',
      fpid: 'string - First-party ID',
      startedAt: 'Timestamp - Session start',
      lastActivityAt: 'Timestamp - Last activity',
      landingPage: 'string - Landing page URL',
      referrer: 'string - Referrer URL',
      clickIds: 'object - Click IDs captured',
      events: 'string[] - Event IDs in session',
      converted: 'boolean - Conversion status',
      conversionValue: 'number | null - Total conversion value',
    },
  },
  conversions: {
    description: 'Conversion events for dashboard',
    fields: {
      id: 'string - Auto-generated ID',
      workspaceId: 'string - Workspace ID',
      eventId: 'string - Related event ID',
      pixelId: 'string - Pixel ID',
      type: "string - 'lead' | 'purchase'",
      value: 'number - Conversion value',
      currency: 'string - Currency code',
      timestamp: 'Timestamp - Conversion time',
      sessionId: 'string | null - Session ID',
      fpid: 'string | null - First-party ID',
      eventType: 'string - Original event type',
      eventName: 'string - Original event name',
      properties: 'object - Custom properties',
      attributed: 'boolean - Attribution status',
      attributedTo: 'string | null - Attributed channel',
      attribution: 'object - Full attribution data',
      synced: 'object - Platform sync status',
      refunded: 'boolean - Refund status',
      refundedAmount: 'number - Refund amount',
      refundedAt: 'Timestamp | null - Refund date',
    },
  },
};

// Generate unique pixel ID
const generatePixelId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'TRK_';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create a demo workspace for testing
const createDemoWorkspace = async (db: admin.firestore.Firestore, userId: string) => {
  const workspaceRef = db.collection('workspaces').doc();
  const workspace = {
    id: workspaceRef.id,
    name: 'Demo Workspace',
    ownerId: userId,
    memberIds: [userId],
    pixelId: generatePixelId(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: {
      timezone: 'Europe/Paris',
      currency: 'EUR',
      attributionWindow: 30,
      defaultAttributionModel: 'last_click',
    },
    integrations: {
      meta: {
        connected: false,
        connectedAt: null,
        accountId: null,
        accountName: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      },
      google: {
        connected: false,
        connectedAt: null,
        accountId: null,
        accountName: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      },
      stripe: {
        connected: false,
        connectedAt: null,
        accountId: null,
        accountName: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      },
      shopify: {
        connected: false,
        connectedAt: null,
        accountId: null,
        accountName: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      },
    },
  };

  await workspaceRef.set(workspace);
  console.log(`✓ Created demo workspace: ${workspaceRef.id}`);
  console.log(`  Pixel ID: ${workspace.pixelId}`);

  return workspaceRef.id;
};

// Create a demo user for testing
const createDemoUser = async (db: admin.firestore.Firestore) => {
  const userId = 'demo-user-' + Date.now();
  const userRef = db.collection('users').doc(userId);

  await userRef.set({
    id: userId,
    email: 'demo@pixly.app',
    displayName: 'Demo User',
    photoURL: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    plan: 'free',
    workspaceIds: [],
  });

  console.log(`✓ Created demo user: ${userId}`);
  return userId;
};

// Update user with workspace
const updateUserWorkspaces = async (
  db: admin.firestore.Firestore,
  userId: string,
  workspaceId: string
) => {
  await db.collection('users').doc(userId).update({
    workspaceIds: admin.firestore.FieldValue.arrayUnion(workspaceId),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`✓ Updated user workspaces`);
};

// Print collection documentation
const printDocumentation = () => {
  console.log('\n' + '='.repeat(60));
  console.log('PIXLY - Firebase Collections Documentation');
  console.log('='.repeat(60) + '\n');

  for (const [name, schema] of Object.entries(COLLECTIONS)) {
    console.log(`\n📁 Collection: ${name}`);
    console.log(`   ${schema.description}`);
    console.log('   Fields:');
    for (const [field, type] of Object.entries(schema.fields)) {
      if (typeof type === 'object') {
        console.log(`   - ${field}: (object)`);
        for (const [subField, subType] of Object.entries(type)) {
          console.log(`     - ${subField}: ${subType}`);
        }
      } else {
        console.log(`   - ${field}: ${type}`);
      }
    }
  }
};

// Main initialization function
const main = async () => {
  console.log('\n🚀 Pixly Firebase Initialization Script\n');
  console.log('='.repeat(50));

  // Check if we should create demo data
  const createDemo = process.argv.includes('--demo');
  const docsOnly = process.argv.includes('--docs');

  if (docsOnly) {
    printDocumentation();
    return;
  }

  try {
    const db = initializeFirebase();
    console.log('✓ Firebase Admin initialized\n');

    if (createDemo) {
      console.log('Creating demo data...\n');

      // Create demo user
      const userId = await createDemoUser(db);

      // Create demo workspace
      const workspaceId = await createDemoWorkspace(db, userId);

      // Update user with workspace
      await updateUserWorkspaces(db, userId, workspaceId);

      console.log('\n✓ Demo data created successfully!');
    }

    // Print documentation
    printDocumentation();

    console.log('\n' + '='.repeat(60));
    console.log('DEPLOYMENT INSTRUCTIONS');
    console.log('='.repeat(60));
    console.log(`
1. Deploy Firestore rules and indexes:
   firebase deploy --only firestore:rules,firestore:indexes

2. Deploy Storage rules:
   firebase deploy --only storage

3. Or deploy everything:
   firebase deploy

4. To create demo data, run:
   npx ts-node scripts/firebase-init.ts --demo

5. To view documentation only:
   npx ts-node scripts/firebase-init.ts --docs
`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the script
main().then(() => {
  console.log('\n✅ Script completed successfully!\n');
  process.exit(0);
});
