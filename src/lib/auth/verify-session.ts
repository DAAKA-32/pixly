import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { canUseIntegration, getPlanLimits } from '@/lib/plans/features';
import type { Plan } from '@/types';

// ===========================================
// PIXLY - API Route Session Verification
// Validates that the caller owns the workspace
// ===========================================

interface SessionResult {
  uid: string;
  email: string | undefined;
}

/**
 * Verify the pixly_session cookie and return the authenticated user.
 * Returns null if the session is invalid.
 */
export async function verifySession(
  sessionCookie: string | undefined
): Promise<SessionResult | null> {
  if (!sessionCookie) return null;

  try {
    // The cookie is a Firebase UID — verify the user exists
    const user = await adminAuth.getUser(sessionCookie);
    return { uid: user.uid, email: user.email };
  } catch {
    return null;
  }
}

/**
 * Verify that the authenticated user has access to the given workspace.
 */
export async function verifyWorkspaceAccess(
  uid: string,
  workspaceId: string
): Promise<boolean> {
  try {
    const workspaceDoc = await adminDb.collection('workspaces').doc(workspaceId).get();
    if (!workspaceDoc.exists) return false;

    const data = workspaceDoc.data();

    // Check if user is the owner
    if (data?.ownerId === uid) return true;

    // Check if user is a team member
    const members = data?.members || [];
    return members.some((m: { userId: string }) => m.userId === uid);
  } catch {
    return false;
  }
}

/**
 * Get the user's current plan from Firestore.
 */
export async function getUserPlan(uid: string): Promise<Plan> {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) return 'free';
    return (userDoc.data()?.plan as Plan) || 'free';
  } catch {
    return 'free';
  }
}

/**
 * Check if the user's plan allows a specific integration.
 */
export async function verifyIntegrationAccess(
  uid: string,
  integrationId: string
): Promise<boolean> {
  const plan = await getUserPlan(uid);
  return canUseIntegration(plan, integrationId);
}

/**
 * Check if the user's plan allows API access.
 */
export async function verifyApiAccess(uid: string): Promise<boolean> {
  const plan = await getUserPlan(uid);
  return getPlanLimits(plan).apiAccess;
}
