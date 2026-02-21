'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/hooks/use-workspace';
import type { WorkspaceRole, WorkspaceMember, WorkspaceInvite } from '@/types';

// ===========================================
// PIXLY - Team Hook
// Provides team members, invites, and CRUD operations
// Uses currentWorkspace from useWorkspace
// Fetches from /api/team endpoints
// ===========================================

interface UseTeamReturn {
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  isLoading: boolean;
  error: string | null;
  inviteMember: (email: string, role: WorkspaceRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  updateRole: (userId: string, newRole: WorkspaceRole) => Promise<void>;
  revokeInvite: (inviteId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTeam(): UseTeamReturn {
  const { currentWorkspace } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workspaceId = currentWorkspace?.id ?? null;

  // Fetch team data
  const fetchTeam = useCallback(async () => {
    if (!workspaceId) {
      setMembers([]);
      setInvites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/team?workspaceId=${workspaceId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors du chargement de l\'équipe');
      }

      const data = await response.json();

      // Restore Date objects from ISO strings
      const parsedMembers: WorkspaceMember[] = (data.members ?? []).map((m: Record<string, unknown>) => ({
        ...m,
        joinedAt: new Date(m.joinedAt as string),
      }));

      const parsedInvites: WorkspaceInvite[] = (data.invites ?? []).map((inv: Record<string, unknown>) => ({
        ...inv,
        createdAt: new Date(inv.createdAt as string),
        expiresAt: new Date(inv.expiresAt as string),
      }));

      setMembers(parsedMembers);
      setInvites(parsedInvites);
    } catch (err) {
      console.error('[useTeam] Error fetching team:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  // Load on mount and when workspace changes
  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Invite a new member
  const inviteMember = useCallback(
    async (email: string, role: WorkspaceRole) => {
      if (!workspaceId) throw new Error('Aucun espace de travail sélectionné');

      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, email, role }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'invitation');
      }

      // Refresh to get updated invites list
      await fetchTeam();
    },
    [workspaceId, fetchTeam]
  );

  // Remove a member
  const removeMember = useCallback(
    async (userId: string) => {
      if (!workspaceId) throw new Error('Aucun espace de travail sélectionné');

      const response = await fetch('/api/team/member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, userId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la suppression du membre');
      }

      // Optimistic update
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    },
    [workspaceId]
  );

  // Update a member's role
  const updateRole = useCallback(
    async (userId: string, newRole: WorkspaceRole) => {
      if (!workspaceId) throw new Error('Aucun espace de travail sélectionné');

      const response = await fetch('/api/team/member', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, userId, role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la mise à jour du rôle');
      }

      // Optimistic update
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
    },
    [workspaceId]
  );

  // Revoke a pending invite
  const revokeInvite = useCallback(
    async (inviteId: string) => {
      if (!workspaceId) throw new Error('Aucun espace de travail sélectionné');

      const response = await fetch('/api/team/invite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la révocation de l\'invitation');
      }

      // Optimistic update
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    },
    [workspaceId]
  );

  return {
    members,
    invites,
    isLoading,
    error,
    inviteMember,
    removeMember,
    updateRole,
    revokeInvite,
    refresh: fetchTeam,
  };
}
