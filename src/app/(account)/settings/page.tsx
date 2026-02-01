'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Globe,
  DollarSign,
  Clock,
  Copy,
  Check,
  Code,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '@/hooks/use-workspace';
import { AccountHeader } from '@/components/account/account-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ===========================================
// PIXLY - Settings Page
// Full-width premium workspace settings
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

export default function SettingsPage() {
  const { currentWorkspace } = useWorkspace();
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || '');
  const [timezone, setTimezone] = useState(currentWorkspace?.settings?.timezone || 'Europe/Paris');
  const [currency, setCurrency] = useState(currentWorkspace?.settings?.currency || 'EUR');
  const [attributionWindow, setAttributionWindow] = useState(
    currentWorkspace?.settings?.attributionWindow || 30
  );

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save settings
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleCopyPixelId = () => {
    navigator.clipboard.writeText(currentWorkspace?.pixelId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pixelCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://pixly.io'}/pixel.js" data-pixel-id="${currentWorkspace?.pixelId}" async></script>`;

  return (
    <>
      <AccountHeader
        title="Paramètres"
        description="Configurez votre espace de travail et préférences"
      />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Workspace Info */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <Building2 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Espace de travail</h3>
                <p className="text-sm text-neutral-500">Informations générales</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Nom de l'espace de travail
                </label>
                <Input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Mon entreprise"
                  className="h-11 max-w-md"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-neutral-400" />
                      Fuseau horaire
                    </div>
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="Europe/London">Londres (UTC)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                    <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-neutral-400" />
                      Devise
                    </div>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                    <option value="GBP">Livre (£)</option>
                    <option value="CAD">Dollar CA ($)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      Fenêtre d'attribution
                    </div>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={attributionWindow}
                      onChange={(e) => setAttributionWindow(parseInt(e.target.value))}
                      min={1}
                      max={90}
                      className="h-11 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                      jours
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} isLoading={isSaving}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Tracking Pixel */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Code className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Pixel de tracking</h3>
                <p className="text-sm text-neutral-500">Installez ce code sur votre site</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Pixel ID */}
              <div className="flex items-center gap-4 rounded-xl border border-neutral-200 p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-700">Pixel ID</p>
                  <p className="font-mono text-sm text-neutral-600 mt-1">
                    {currentWorkspace?.pixelId}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyPixelId}>
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4 text-green-600" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-4 w-4" />
                      Copier
                    </>
                  )}
                </Button>
              </div>

              {/* Code Block */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-700">Code d'installation</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pixelCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Copier le code
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-sm text-neutral-100">
                  <code>{pixelCode}</code>
                </pre>
              </div>

              {/* Warning */}
              <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-900">Important</p>
                  <p className="mt-1 text-sm text-amber-700">
                    Ajoutez ce code dans la section &lt;head&gt; de chaque page à tracker.
                    Le pixel doit se charger avant tout événement de conversion.
                  </p>
                </div>
              </div>
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
                <p className="font-medium text-neutral-900">Supprimer l'espace de travail</p>
                <p className="text-sm text-neutral-500">
                  Cette action supprimera définitivement toutes les données de cet espace
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
