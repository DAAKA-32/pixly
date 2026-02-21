import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { WorkspaceRole, WorkspaceMember, WorkspaceInvite } from '@/types';

// ===========================================
// PIXLY - Team & Role Management
// Server-side utilities (Firebase Admin SDK)
// ===========================================

// ============ Permission Matrix ============

export const ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  owner: ['*'], // all permissions
  admin: ['read', 'write', 'invite', 'settings', 'integrations', 'billing'],
  editor: ['read', 'write', 'integrations'],
  viewer: ['read'],
};

/** Role hierarchy for comparison (higher = more authority) */
const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

// ============ Permission Checks ============

/**
 * Check if a role has a specific permission.
 * Owner role has wildcard access ('*').
 */
export function hasPermission(role: WorkspaceRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

/**
 * Check if `actorRole` outranks `targetRole` in the hierarchy.
 * Used to prevent members from modifying users with equal or higher authority.
 */
export function outranks(actorRole: WorkspaceRole, targetRole: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

// ============ Member Operations ============

/**
 * Fetch all members of a workspace from the `members` subcollection.
 */
export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const snapshot = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .orderBy('joinedAt', 'asc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: doc.id,
      email: data.email ?? '',
      displayName: data.displayName ?? null,
      role: data.role as WorkspaceRole,
      joinedAt: data.joinedAt?.toDate?.() ?? new Date(data.joinedAt),
      invitedBy: data.invitedBy ?? '',
    } satisfies WorkspaceMember;
  });
}

/**
 * Remove a member from the workspace.
 * Deletes the member doc and removes the userId from workspace.memberIds.
 * The workspace owner cannot be removed.
 */
export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
  const memberRef = workspaceRef.collection('members').doc(userId);

  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) {
    throw new Error('Ce membre n\'existe pas dans cet espace de travail.');
  }

  const memberData = memberSnap.data();
  if (memberData?.role === 'owner') {
    throw new Error('Le propriétaire de l\'espace de travail ne peut pas être supprimé.');
  }

  const batch = adminDb.batch();

  // Remove from members subcollection
  batch.delete(memberRef);

  // Remove userId from workspace.memberIds array
  batch.update(workspaceRef, {
    memberIds: FieldValue.arrayRemove(userId),
  });

  // Remove workspaceId from user.workspaceIds array
  const userRef = adminDb.collection('users').doc(userId);
  batch.update(userRef, {
    workspaceIds: FieldValue.arrayRemove(workspaceId),
  });

  await batch.commit();
}

/**
 * Update a member's role.
 * Cannot change the owner's role, and only owner can promote to admin.
 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  newRole: WorkspaceRole
): Promise<void> {
  if (newRole === 'owner') {
    throw new Error('Le transfert de propriété n\'est pas supporté par cette opération.');
  }

  const memberRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(userId);

  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) {
    throw new Error('Ce membre n\'existe pas dans cet espace de travail.');
  }

  const memberData = memberSnap.data();
  if (memberData?.role === 'owner') {
    throw new Error('Le rôle du propriétaire ne peut pas être modifié.');
  }

  await memberRef.update({ role: newRole });
}

// ============ Invite Operations ============

const INVITE_EXPIRY_DAYS = 7;

/**
 * Create an invitation for a new member.
 * Stores the invite in the top-level `invites` collection.
 * Returns the created invite object.
 */
export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
  invitedBy: string
): Promise<WorkspaceInvite> {
  if (role === 'owner') {
    throw new Error('Impossible d\'inviter quelqu\'un en tant que propriétaire.');
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user is already a member
  const membersSnap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();

  if (!membersSnap.empty) {
    throw new Error('Cet utilisateur est déjà membre de l\'espace de travail.');
  }

  // Check for existing pending invite
  const existingInvite = await adminDb
    .collection('invites')
    .where('workspaceId', '==', workspaceId)
    .where('email', '==', normalizedEmail)
    .where('status', '==', 'pending')
    .limit(1)
    .get();

  if (!existingInvite.empty) {
    throw new Error('Une invitation est déjà en attente pour cet e-mail.');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const inviteRef = adminDb.collection('invites').doc();

  const invite: WorkspaceInvite = {
    id: inviteRef.id,
    workspaceId,
    email: normalizedEmail,
    role,
    invitedBy,
    createdAt: now,
    expiresAt,
    status: 'pending',
  };

  await inviteRef.set({
    ...invite,
    createdAt: now,
    expiresAt,
  });

  return invite;
}

/**
 * Accept an invite: adds the user to the workspace's `members` subcollection
 * and updates workspace.memberIds + user.workspaceIds.
 */
export async function acceptInvite(inviteId: string, userId: string): Promise<void> {
  const inviteRef = adminDb.collection('invites').doc(inviteId);
  const inviteSnap = await inviteRef.get();

  if (!inviteSnap.exists) {
    throw new Error('Cette invitation n\'existe pas.');
  }

  const inviteData = inviteSnap.data()!;

  if (inviteData.status !== 'pending') {
    throw new Error('Cette invitation n\'est plus valide.');
  }

  const expiresAt = inviteData.expiresAt?.toDate?.()
    ? inviteData.expiresAt.toDate()
    : new Date(inviteData.expiresAt);

  if (new Date() > expiresAt) {
    await inviteRef.update({ status: 'expired' });
    throw new Error('Cette invitation a expiré.');
  }

  // Fetch user info for the member record
  const userSnap = await adminDb.collection('users').doc(userId).get();
  const userData = userSnap.data();

  const workspaceId = inviteData.workspaceId;
  const workspaceRef = adminDb.collection('workspaces').doc(workspaceId);
  const memberRef = workspaceRef.collection('members').doc(userId);

  const batch = adminDb.batch();

  // Create member document
  batch.set(memberRef, {
    email: inviteData.email,
    displayName: userData?.displayName ?? null,
    role: inviteData.role,
    joinedAt: new Date(),
    invitedBy: inviteData.invitedBy,
  });

  // Add to workspace.memberIds
  batch.update(workspaceRef, {
    memberIds: FieldValue.arrayUnion(userId),
  });

  // Add to user.workspaceIds
  batch.update(adminDb.collection('users').doc(userId), {
    workspaceIds: FieldValue.arrayUnion(workspaceId),
  });

  // Mark invite as accepted
  batch.update(inviteRef, { status: 'accepted' });

  await batch.commit();
}

/**
 * Get all pending invites for a workspace.
 */
export async function getPendingInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
  const snapshot = await adminDb
    .collection('invites')
    .where('workspaceId', '==', workspaceId)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();

  const now = new Date();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate?.() ? data.expiresAt.toDate() : new Date(data.expiresAt);
      const createdAt = data.createdAt?.toDate?.() ? data.createdAt.toDate() : new Date(data.createdAt);

      return {
        id: doc.id,
        workspaceId: data.workspaceId,
        email: data.email,
        role: data.role as WorkspaceRole,
        invitedBy: data.invitedBy,
        createdAt,
        expiresAt,
        status: data.status as 'pending' | 'accepted' | 'expired',
      } satisfies WorkspaceInvite;
    })
    .filter((invite) => {
      // Auto-expire stale invites client-side (won't update Firestore here)
      return now <= invite.expiresAt;
    });
}

/**
 * Revoke (delete) a pending invite.
 */
export async function revokeInvite(inviteId: string): Promise<void> {
  const inviteRef = adminDb.collection('invites').doc(inviteId);
  const inviteSnap = await inviteRef.get();

  if (!inviteSnap.exists) {
    throw new Error('Cette invitation n\'existe pas.');
  }

  const inviteData = inviteSnap.data()!;
  if (inviteData.status !== 'pending') {
    throw new Error('Seules les invitations en attente peuvent être révoquées.');
  }

  await inviteRef.delete();
}
