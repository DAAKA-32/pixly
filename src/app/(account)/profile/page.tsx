'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Shield, Bell, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AccountHeader } from '@/components/account/account-header';
import { Avatar, EditableAvatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ===========================================
// PIXLY - Profile Page
// User profile management
// ===========================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save profile
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const userName = user?.displayName || user?.email || 'Utilisateur';

  return (
    <>
      <AccountHeader
        title="Mon Profil"
        description="Gérez vos informations personnelles"
      />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Profile Card */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-neutral-200 bg-white overflow-hidden"
          >
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600" />

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                {/* Avatar */}
                <EditableAvatar
                  src={user?.photoURL || undefined}
                  fallback={userName}
                  size="xl"
                  className="h-24 w-24 ring-4 ring-white text-2xl"
                  onEdit={() => {
                    // TODO: Open file picker
                  }}
                />

                {/* Name & Info */}
                <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
                  <h2 className="text-xl font-bold text-neutral-900">
                    {user?.displayName || 'Utilisateur'}
                  </h2>
                  <p className="text-sm text-neutral-500">{user?.email}</p>
                </div>

                {/* Plan Badge */}
                <div className="sm:pb-1">
                  <Badge variant="primary" className="text-sm px-3 py-1">
                    {user?.plan?.toUpperCase() || 'FREE'}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Personal Info Section */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Informations personnelles</h3>
                <p className="text-sm text-neutral-500">Mettez à jour vos informations</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Nom complet
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Votre nom"
                  className="h-11"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Email
                </label>
                <div className="relative">
                  <Input
                    value={email}
                    disabled
                    className="h-11 bg-neutral-50 text-neutral-500"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  L'email ne peut pas être modifié
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} isLoading={isSaving}>
                Enregistrer
              </Button>
            </div>
          </motion.section>

          {/* Security */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Sécurité</h3>
                <p className="text-sm text-neutral-500">Gérez vos options de sécurité</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                <div>
                  <p className="font-medium text-neutral-900">Mot de passe</p>
                  <p className="text-sm text-neutral-500">
                    Dernière modification il y a 30 jours
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
                <div>
                  <p className="font-medium text-neutral-900">Authentification à deux facteurs</p>
                  <p className="text-sm text-neutral-500">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                </div>
                <Badge variant="outline">Non activé</Badge>
              </div>
            </div>
          </motion.section>

          {/* Notifications */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Notifications</h3>
                <p className="text-sm text-neutral-500">Configurez vos préférences de notification</p>
              </div>
            </div>

            <div className="space-y-4">
              <NotificationToggle
                title="Rapports hebdomadaires"
                description="Recevez un résumé de vos performances chaque semaine"
                defaultChecked
              />
              <NotificationToggle
                title="Alertes de performance"
                description="Soyez notifié quand une campagne sous-performe"
                defaultChecked
              />
              <NotificationToggle
                title="Mises à jour produit"
                description="Restez informé des nouvelles fonctionnalités"
              />
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-red-200 bg-red-50/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Zone de danger</h3>
                <p className="text-sm text-red-600">Actions irréversibles</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Supprimer le compte</p>
                <p className="text-sm text-neutral-500">
                  Cette action supprimera définitivement votre compte et toutes vos données
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-100"
              >
                Supprimer
              </Button>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </>
  );
}

// Notification Toggle Component
function NotificationToggle({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4">
      <div>
        <p className="font-medium text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-primary-500' : 'bg-neutral-200'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  );
}
