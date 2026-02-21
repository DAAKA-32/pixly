'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { updateUserProfile, resetPassword, deleteCurrentUser } from '@/lib/firebase/auth';
import { updateUserNotifications, getUserNotifications } from '@/lib/firebase/firestore';
import { AccountHeader } from '@/components/account/account-header';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateUserProfile(displayName);
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setError(null);
    try {
      await resetPassword(user.email);
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 5000);
    } catch (err) {
      console.error('Error sending password reset:', err);
      setError('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'supprimer') return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCurrentUser();
      await logout();
      router.push('/');
    } catch (err: unknown) {
      console.error('Error deleting account:', err);
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === 'auth/requires-recent-login') {
        setError('Veuillez vous reconnecter avant de supprimer votre compte');
      } else {
        setError('Erreur lors de la suppression du compte');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const userName = user?.displayName || user?.email || 'Utilisateur';

  return (
    <>
      <AccountHeader
        title="Mon profil"
        description="Informations personnelles et sécurité"
      />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="space-y-10">

          {/* ── Profile card ── */}
          <section>
            <SectionLabel>Compte</SectionLabel>

            <div className="rounded-2xl border border-neutral-200/80 bg-white">
              <div className="flex items-center gap-4 px-5 py-5">
                <Avatar
                  fallback={userName}
                  size="lg"
                  className="h-14 w-14 text-lg"
                />
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-neutral-900">
                    {user?.displayName || 'Utilisateur'}
                  </p>
                  <p className="text-[13px] text-neutral-500">{user?.email}</p>
                </div>
                <div className="rounded-md bg-neutral-100 px-2 py-0.5">
                  <span className="text-[11px] font-medium text-neutral-500">
                    {{ free: 'GRATUIT', starter: 'STARTER', growth: 'GROWTH', scale: 'SCALE', unlimited: 'UNLIMITED' }[user?.plan || 'free'] || 'GRATUIT'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Personal info ── */}
          <section>
            <SectionLabel>Informations personnelles</SectionLabel>

            <div className="rounded-2xl border border-neutral-200/80 bg-white">
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    Nom complet
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Votre nom"
                    className="h-10 text-[13px]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Input
                      value={email}
                      disabled
                      className="h-10 bg-neutral-50 pr-10 text-[13px] text-neutral-500"
                    />
                    <Mail className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    L&apos;email ne peut pas être modifié
                  </p>
                </div>
              </div>

              <Divider />

              <div className="flex items-center justify-end gap-3 px-5 py-3.5">
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                    Enregistré
                  </span>
                )}
                {error && (
                  <span className="text-[12px] text-red-500">{error}</span>
                )}
                <Button size="sm" onClick={handleSave} isLoading={isSaving} className="h-8 px-4 text-[12px]">
                  Enregistrer
                </Button>
              </div>
            </div>
          </section>

          {/* ── Security ── */}
          <section>
            <SectionLabel>Sécurité</SectionLabel>

            <div className="rounded-2xl border border-neutral-200/80 bg-white divide-y divide-neutral-100">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-neutral-900">Mot de passe</p>
                  <p className="mt-0.5 text-[12px] text-neutral-400">
                    {passwordResetSent
                      ? 'Email de réinitialisation envoyé !'
                      : 'Recevez un email pour modifier votre mot de passe'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[12px]"
                  onClick={handlePasswordReset}
                  disabled={passwordResetSent}
                >
                  {passwordResetSent ? 'Envoyé' : 'Modifier'}
                </Button>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-neutral-900">Authentification à deux facteurs</p>
                  <p className="mt-0.5 text-[12px] text-neutral-400">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                </div>
                <span className="rounded-md border border-neutral-200/80 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                  Non activé
                </span>
              </div>
            </div>
          </section>

          {/* ── Notifications ── */}
          <NotificationsSection userId={user?.id} />

          {/* ── Danger zone ── */}
          <section>
            <SectionLabel className="text-red-500/80">Zone de danger</SectionLabel>

            <div className="rounded-2xl border border-red-200/60 bg-white">
              <div className="px-5 py-4">
                <p className="text-[14px] font-medium text-neutral-900">Supprimer mon compte</p>
                <p className="mt-0.5 text-[12px] text-neutral-500">
                  Votre compte, profil et données personnelles seront supprimés définitivement.
                </p>

                <div className="mt-4">
                  <label className="mb-1.5 block text-[12px] text-neutral-500">
                    Tapez <span className="font-medium text-neutral-700">supprimer</span> pour confirmer
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="supprimer"
                      className="h-9 max-w-xs text-[13px]"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={deleteConfirm !== 'supprimer'}
                      isLoading={isDeleting}
                      onClick={handleDeleteAccount}
                      className="h-9 px-4 text-[12px]"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-red-100 bg-red-50/40 px-5 py-3">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                <p className="text-[11px] leading-relaxed text-red-600/80">
                  Cette action est irréversible. Tous vos workspaces seront également supprimés.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

// ── Helpers ──

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400', className)}>
      {children}
    </h2>
  );
}

function Divider() {
  return <div className="border-t border-neutral-100" />;
}

const NOTIFICATION_KEYS = [
  { key: 'weeklyReports', title: 'Rapports hebdomadaires', description: 'Résumé de vos performances chaque semaine', defaultValue: true },
  { key: 'performanceAlerts', title: 'Alertes de performance', description: 'Notification quand une campagne sous-performe', defaultValue: true },
  { key: 'productUpdates', title: 'Mises à jour produit', description: 'Nouvelles fonctionnalités et améliorations', defaultValue: false },
] as const;

function NotificationsSection({ userId }: { userId?: string }) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    NOTIFICATION_KEYS.forEach((n) => { defaults[n.key] = n.defaultValue; });
    return defaults;
  });

  useEffect(() => {
    if (!userId) return;
    getUserNotifications(userId).then((saved) => {
      if (Object.keys(saved).length > 0) {
        setPrefs((prev) => ({ ...prev, ...saved }));
      }
    });
  }, [userId]);

  const handleToggle = async (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    if (userId) {
      try {
        await updateUserNotifications(userId, updated);
      } catch (err) {
        console.error('Error saving notification preferences:', err);
        // Revert on error
        setPrefs(prefs);
      }
    }
  };

  return (
    <section>
      <SectionLabel>Notifications</SectionLabel>
      <div className="rounded-2xl border border-neutral-200/80 bg-white divide-y divide-neutral-100">
        {NOTIFICATION_KEYS.map((n) => (
          <div key={n.key} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[13px] font-medium text-neutral-900">{n.title}</p>
              <p className="mt-0.5 text-[12px] text-neutral-400">{n.description}</p>
            </div>
            <button
              role="switch"
              aria-checked={prefs[n.key]}
              onClick={() => handleToggle(n.key)}
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors',
                prefs[n.key] ? 'bg-neutral-900' : 'bg-neutral-200'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                  prefs[n.key] && 'translate-x-4'
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
