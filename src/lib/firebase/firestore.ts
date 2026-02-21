import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Workspace,
  TrackingEvent,
  Session,
  Conversion,
  WorkspaceSettings,
  IntegrationStatus
} from '@/types';

// ===========================================
// PIXLY - Firestore Service
// ===========================================

// ============ WORKSPACES ============

export async function createWorkspace(
  ownerId: string,
  name: string
): Promise<Workspace> {
  const workspaceRef = doc(collection(db, 'workspaces'));
  const pixelId = generatePixelId();

  const workspace: Omit<Workspace, 'id'> = {
    name,
    ownerId,
    memberIds: [ownerId],
    pixelId,
    createdAt: new Date(),
    settings: getDefaultSettings(),
    integrations: getDefaultIntegrations(),
  };

  await setDoc(workspaceRef, {
    ...workspace,
    createdAt: serverTimestamp(),
  });

  // Update user's workspaceIds
  const userRef = doc(db, 'users', ownerId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const currentIds = userDoc.data().workspaceIds || [];
    await updateDoc(userRef, {
      workspaceIds: [...currentIds, workspaceRef.id],
    });
  }

  return { id: workspaceRef.id, ...workspace };
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const workspaceDoc = await getDoc(doc(db, 'workspaces', workspaceId));

  if (!workspaceDoc.exists()) {
    return null;
  }

  const data = workspaceDoc.data();
  return {
    id: workspaceDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
  } as Workspace;
}

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const q = query(
    collection(db, 'workspaces'),
    where('memberIds', 'array-contains', userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Workspace[];
}

export async function updateWorkspaceSettings(
  workspaceId: string,
  settings: Partial<WorkspaceSettings>
) {
  await updateDoc(doc(db, 'workspaces', workspaceId), {
    settings,
    updatedAt: serverTimestamp(),
  });
}

export async function updateIntegrationStatus(
  workspaceId: string,
  integration: keyof IntegrationStatus,
  status: Partial<IntegrationStatus[keyof IntegrationStatus]>
) {
  await updateDoc(doc(db, 'workspaces', workspaceId), {
    [`integrations.${integration}`]: status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateWorkspaceName(
  workspaceId: string,
  name: string
) {
  await updateDoc(doc(db, 'workspaces', workspaceId), {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWorkspaceById(
  workspaceId: string,
  userId: string
) {
  // Remove workspace from user's workspaceIds
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const currentIds: string[] = userDoc.data().workspaceIds || [];
    await updateDoc(userRef, {
      workspaceIds: currentIds.filter((id) => id !== workspaceId),
    });
  }

  // Delete workspace document
  await deleteDoc(doc(db, 'workspaces', workspaceId));
}

export async function updateUserNotifications(
  userId: string,
  notifications: Record<string, boolean>
) {
  await updateDoc(doc(db, 'users', userId), {
    notifications,
    updatedAt: serverTimestamp(),
  });
}

export async function getUserNotifications(
  userId: string
): Promise<Record<string, boolean>> {
  const userDocSnap = await getDoc(doc(db, 'users', userId));
  if (userDocSnap.exists()) {
    return userDocSnap.data().notifications || {};
  }
  return {};
}

export async function updateUserOnboarding(
  userId: string,
  completed: boolean
) {
  await updateDoc(doc(db, 'users', userId), {
    onboardingCompleted: completed,
    updatedAt: serverTimestamp(),
  });
}

// ============ EVENTS ============

export async function saveTrackingEvent(event: Omit<TrackingEvent, 'id'>) {
  const eventRef = doc(collection(db, 'events'));

  await setDoc(eventRef, {
    ...event,
    timestamp: Timestamp.fromDate(event.timestamp),
  });

  return eventRef.id;
}

export async function getEvents(
  workspaceId: string,
  options: {
    startDate: Date;
    endDate: Date;
    eventType?: string;
    limit?: number;
  }
): Promise<TrackingEvent[]> {
  const constraints: QueryConstraint[] = [
    where('workspaceId', '==', workspaceId),
    where('timestamp', '>=', Timestamp.fromDate(options.startDate)),
    where('timestamp', '<=', Timestamp.fromDate(options.endDate)),
    orderBy('timestamp', 'desc'),
  ];

  if (options.eventType) {
    constraints.push(where('eventType', '==', options.eventType));
  }

  if (options.limit) {
    constraints.push(limit(options.limit));
  }

  const q = query(collection(db, 'events'), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate(),
  })) as TrackingEvent[];
}

// ============ SESSIONS ============

export async function getOrCreateSession(
  pixelId: string,
  workspaceId: string,
  fpid: string,
  sessionData: Partial<Session>
): Promise<Session> {
  // Check for existing active session (last 30 minutes)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const q = query(
    collection(db, 'sessions'),
    where('pixelId', '==', pixelId),
    where('fpid', '==', fpid),
    where('lastActivityAt', '>=', Timestamp.fromDate(thirtyMinutesAgo)),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const existingSession = snapshot.docs[0];
    // Update last activity
    await updateDoc(existingSession.ref, {
      lastActivityAt: serverTimestamp(),
    });

    return {
      id: existingSession.id,
      ...existingSession.data(),
      startedAt: existingSession.data().startedAt?.toDate(),
      lastActivityAt: new Date(),
    } as Session;
  }

  // Create new session
  const sessionRef = doc(collection(db, 'sessions'));
  const newSession: Omit<Session, 'id'> = {
    pixelId,
    workspaceId,
    fpid,
    startedAt: new Date(),
    lastActivityAt: new Date(),
    landingPage: sessionData.landingPage || '',
    referrer: sessionData.referrer || '',
    clickIds: sessionData.clickIds || {
      gclid: null,
      fbclid: null,
      ttclid: null,
      li_fat_id: null,
      msclkid: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    },
    events: [],
    converted: false,
    conversionValue: null,
  };

  await setDoc(sessionRef, {
    ...newSession,
    startedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  });

  return { id: sessionRef.id, ...newSession };
}

// ============ CONVERSIONS ============

export async function saveConversion(conversion: Omit<Conversion, 'id'>) {
  const conversionRef = doc(collection(db, 'conversions'));

  await setDoc(conversionRef, {
    ...conversion,
    timestamp: Timestamp.fromDate(conversion.timestamp),
  });

  return conversionRef.id;
}

export async function getConversions(
  workspaceId: string,
  startDate: Date,
  endDate: Date
): Promise<Conversion[]> {
  const q = query(
    collection(db, 'conversions'),
    where('workspaceId', '==', workspaceId),
    where('timestamp', '>=', Timestamp.fromDate(startDate)),
    where('timestamp', '<=', Timestamp.fromDate(endDate)),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate(),
  })) as Conversion[];
}

// ============ REALTIME ============

export function subscribeToConversions(
  workspaceId: string,
  callback: (conversions: Conversion[]) => void
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, 'conversions'),
    where('workspaceId', '==', workspaceId),
    where('timestamp', '>=', Timestamp.fromDate(today)),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const conversions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    })) as Conversion[];

    callback(conversions);
  });
}

// ============ HELPERS ============

function generatePixelId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'TRK_';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getDefaultSettings(): WorkspaceSettings {
  return {
    timezone: 'UTC',
    currency: 'USD',
    startDate: new Date().toISOString().split('T')[0],
    attributionWindow: 30,
    defaultAttributionModel: 'last_click',
  };
}

function getDefaultIntegrations(): IntegrationStatus {
  const defaultState = {
    connected: false,
    connectedAt: null,
    accountId: null,
    accountName: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };

  return {
    meta: { ...defaultState },
    google: { ...defaultState },
    tiktok: { ...defaultState },
    stripe: { ...defaultState },
    shopify: { ...defaultState },
    hubspot: { ...defaultState },
  };
}

export { db };
