'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Mail,
  MoreHorizontal,
  Shield,
  Trash2,
  ChevronDown,
  Clock,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTeam } from '@/hooks/use-team';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/help-button';
import { cn, formatDate } from '@/lib/utils';
import type { WorkspaceRole, WorkspaceMember } from '@/types';

// ===========================================
// PIXLY - Equipe
// Team members management page
// ===========================================

// ============ Role Configuration ============

const ROLE_CONFIG: Record<WorkspaceRole, { label: string; color: string; bg: string; text: string }> = {
  owner: {
    label: 'Proprietaire',
    color: 'bg-neutral-900',
    bg: 'bg-neutral-100',
    text: 'text-neutral-900',
  },
  admin: {
    label: 'Administrateur',
    color: 'bg-primary-500',
    bg: 'bg-primary-50',
    text: 'text-primary-700',
  },
  editor: {
    label: 'Editeur',
    color: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  viewer: {
    label: 'Lecteur',
    color: 'bg-neutral-400',
    bg: 'bg-neutral-50',
    text: 'text-neutral-500',
  },
};

const ASSIGNABLE_ROLES: { value: WorkspaceRole; label: string }[] = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'editor', label: 'Editeur' },
  { value: 'viewer', label: 'Lecteur' },
];

// ============ Helper Components ============

function RoleBadge({ role }: { role: WorkspaceRole }) {
  const config = ROLE_CONFIG[role];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium',
        config.bg,
        config.text
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.color)} />
      {config.label}
    </span>
  );
}

function MemberAvatar({ member }: { member: WorkspaceMember }) {
  const initials = member.displayName
    ? member.displayName
        .split(' ')
        .map((n) => n.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : member.email.charAt(0).toUpperCase();

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
      {initials}
    </div>
  );
}

function InviteAvatar({ email }: { email: string }) {
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-400">
      <Mail className="h-4 w-4" />
    </div>
  );
}

// ============ Action Menu ============

function MemberActions({
  member,
  currentUserId,
  onChangeRole,
  onRemove,
}: {
  member: WorkspaceMember;
  currentUserId: string;
  onChangeRole: (userId: string, role: WorkspaceRole) => void;
  onRemove: (userId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Owner cannot be modified; user cannot modify themselves
  if (member.role === 'owner' || member.userId === currentUserId) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-neutral-200/80 bg-white py-1 shadow-lg">
          {/* Change role submenu */}
          <div className="px-3 py-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Changer le role
            </p>
          </div>
          {ASSIGNABLE_ROLES.filter((r) => r.value !== member.role).map((role) => (
            <button
              key={role.value}
              onClick={() => {
                onChangeRole(member.userId, role.value);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <Shield className="h-3.5 w-3.5 text-neutral-400" />
              {role.label}
            </button>
          ))}

          <div className="my-1 border-t border-neutral-100" />

          {/* Remove */}
          <button
            onClick={() => {
              onRemove(member.userId);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Retirer du workspace
          </button>
        </div>
      )}
    </div>
  );
}

// ============ Invite Form ============

function InviteForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (email: string, role: WorkspaceRole) => Promise<void>;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(email.trim(), role);
      setEmail('');
      setRole('viewer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Email input */}
        <div className="flex-1">
          <label
            htmlFor="invite-email"
            className="mb-1.5 block text-[12px] font-medium text-neutral-500"
          >
            Adresse e-mail
          </label>
          <input
            ref={inputRef}
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="collegue@entreprise.com"
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Role select */}
        <div className="w-full sm:w-44">
          <label
            htmlFor="invite-role"
            className="mb-1.5 block text-[12px] font-medium text-neutral-500"
          >
            Role
          </label>
          <div className="relative">
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as WorkspaceRole)}
              className="h-10 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 pr-9 text-[13px] text-neutral-900 transition-colors focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !email.trim()}
            className="gap-1.5 text-[12px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserPlus className="h-3.5 w-3.5" />
            )}
            Envoyer
          </Button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Annuler"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
          <p className="text-[12px] text-red-600">{error}</p>
        </div>
      )}
    </form>
  );
}

// ============ Loading Skeleton ============

function TeamSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-24 animate-pulse rounded bg-neutral-100" />
        <div className="mt-1.5 h-4 w-64 animate-pulse rounded bg-neutral-50" />
      </div>

      {/* Members card skeleton */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-20 animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="divide-y divide-neutral-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
              <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-100" />
                <div className="h-3 w-48 animate-pulse rounded bg-neutral-50" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Main Page Component
// ===========================================

export default function TeamPage() {
  const { user } = useAuth();
  const { members, invites, isLoading, error, inviteMember, removeMember, updateRole, revokeInvite } =
    useTeam();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUserId = user?.id ?? '';

  // Action handlers with error handling
  const handleChangeRole = async (userId: string, newRole: WorkspaceRole) => {
    setActionError(null);
    try {
      await updateRole(userId, newRole);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour du role');
    }
  };

  const handleRemove = async (userId: string) => {
    setActionError(null);
    try {
      await removeMember(userId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleInvite = async (email: string, role: WorkspaceRole) => {
    setActionError(null);
    await inviteMember(email, role);
    setShowInviteForm(false);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setActionError(null);
    try {
      await revokeInvite(inviteId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la revocation');
    }
  };

  if (isLoading) {
    return <TeamSkeleton />;
  }

  const isAlone = members.length <= 1 && invites.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 lg:space-y-8"
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Equipe
          </h1>
          <p className="mt-0.5 text-sm text-neutral-400">
            Gerez les membres de votre espace de travail
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!showInviteForm && (
            <Button
              size="sm"
              onClick={() => setShowInviteForm(true)}
              className="gap-1.5 text-[12px]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Inviter un membre
            </Button>
          )}

          <HelpButton pageId="team" />
        </div>
      </div>

      {/* ── Error Banner ── */}
      {(error || actionError) && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3.5 sm:px-5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-[13px] text-red-700">{actionError || error}</p>
        </div>
      )}

      {/* ── Invite Form (inline) ── */}
      {showInviteForm && (
        <div className="rounded-xl border border-primary-200/60 bg-primary-50/30 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary-600" />
            <h2 className="text-[14px] font-semibold text-neutral-900">
              Inviter un nouveau membre
            </h2>
          </div>
          <InviteForm onSubmit={handleInvite} onCancel={() => setShowInviteForm(false)} />
        </div>
      )}

      {/* ── Empty State ── */}
      {isAlone && !showInviteForm && (
        <div className="rounded-xl border border-neutral-200/80 bg-white py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-neutral-300" />
          <p className="mt-3 text-[14px] font-medium text-neutral-700">
            Vous etes le seul membre
          </p>
          <p className="mt-1 text-[13px] text-neutral-400">
            Invitez votre equipe pour collaborer sur vos campagnes.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInviteForm(true)}
            className="mt-4 gap-1.5 text-[12px]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Inviter un membre
          </Button>
        </div>
      )}

      {/* ── Members List ── */}
      {members.length > 0 && (
        <div className="rounded-xl border border-neutral-200/80 bg-white">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3.5 sm:px-5 sm:py-4">
            <Users className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Membres
            </h2>
            <span className="text-[12px] text-neutral-400 ml-1">
              {members.length}
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-neutral-50/60 sm:px-5"
              >
                <MemberAvatar member={member} />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-neutral-900">
                      {member.displayName || member.email}
                    </p>
                    {member.userId === currentUserId && (
                      <span className="text-[11px] text-neutral-400">(vous)</span>
                    )}
                  </div>
                  <p className="truncate text-[12px] text-neutral-400">
                    {member.email}
                  </p>
                </div>

                {/* Role badge — hidden on very small screens, shown on sm+ */}
                <div className="hidden sm:block">
                  <RoleBadge role={member.role} />
                </div>

                {/* Joined date — hidden on mobile */}
                <div className="hidden lg:block">
                  <p className="text-[12px] text-neutral-400 whitespace-nowrap">
                    {formatDate(member.joinedAt)}
                  </p>
                </div>

                {/* Actions */}
                <MemberActions
                  member={member}
                  currentUserId={currentUserId}
                  onChangeRole={handleChangeRole}
                  onRemove={handleRemove}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pending Invites ── */}
      {invites.length > 0 && (
        <div className="rounded-xl border border-neutral-200/80 bg-white">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3.5 sm:px-5 sm:py-4">
            <Clock className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Invitations en attente
            </h2>
            <span className="text-[12px] text-neutral-400 ml-1">
              {invites.length}
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center gap-4 px-4 py-3.5 sm:px-5"
              >
                <InviteAvatar email={invite.email} />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-neutral-700">
                    {invite.email}
                  </p>
                  <p className="text-[12px] text-neutral-400">
                    Envoyee le {formatDate(invite.createdAt)}
                  </p>
                </div>

                {/* Role badge */}
                <div className="hidden sm:block">
                  <RoleBadge role={invite.role} />
                </div>

                {/* Revoke */}
                <button
                  onClick={() => handleRevokeInvite(invite.id)}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Revoquer</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
