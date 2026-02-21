'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Check,
  Code2,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { useWorkspace } from '@/hooks/use-workspace';
import { updateWorkspaceSettings, updateWorkspaceName } from '@/lib/firebase/firestore';
import { useAlerts, type AlertThresholds } from '@/hooks/use-alerts';
import { useOnboarding } from '@/hooks/use-onboarding';
import { usePageNotifications } from '@/hooks/use-page-notifications';
import { useToast } from '@/components/ui/toast';
import type { AttributionModel } from '@/types';
import { AccountHeader } from '@/components/account/account-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { currentWorkspace, deleteWorkspace, refreshWorkspaces } = useWorkspace();
  const { thresholds, saveThresholds, resetThresholds } = useAlerts();
  const { resetOnboarding } = useOnboarding();
  const { resetAll: resetNotifications } = usePageNotifications();
  const toast = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [alertSaveSuccess, setAlertSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPixelCode, setShowPixelCode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || '');
  const [timezone, setTimezone] = useState(currentWorkspace?.settings?.timezone || 'Europe/Paris');
  const [currency, setCurrency] = useState(currentWorkspace?.settings?.currency || 'EUR');
  const [startDate, setStartDate] = useState(
    currentWorkspace?.settings?.startDate || new Date().toISOString().split('T')[0]
  );
  const [attributionWindow, setAttributionWindow] = useState(
    currentWorkspace?.settings?.attributionWindow || 30
  );
  const [attributionModel, setAttributionModel] = useState(
    currentWorkspace?.settings?.defaultAttributionModel || 'last_click'
  );

  // Alert thresholds state
  const [alertEnabled, setAlertEnabled] = useState(thresholds.enabled);
  const [roasMin, setRoasMin] = useState(thresholds.roasMin?.toString() || '');
  const [cpaMax, setCpaMax] = useState(thresholds.cpaMax?.toString() || '');
  const [spendMax, setSpendMax] = useState(thresholds.spendDailyMax?.toString() || '');
  const [crMin, setCrMin] = useState(thresholds.conversionRateMin?.toString() || '');

  useEffect(() => {
    setAlertEnabled(thresholds.enabled);
    setRoasMin(thresholds.roasMin?.toString() || '');
    setCpaMax(thresholds.cpaMax?.toString() || '');
    setSpendMax(thresholds.spendDailyMax?.toString() || '');
    setCrMin(thresholds.conversionRateMin?.toString() || '');
  }, [thresholds]);

  const handleSave = async () => {
    if (!currentWorkspace) return;
    setIsSaving(true);
    setError(null);
    try {
      // Update workspace name if changed
      if (workspaceName !== currentWorkspace.name) {
        await updateWorkspaceName(currentWorkspace.id, workspaceName);
      }
      // Update settings
      await updateWorkspaceSettings(currentWorkspace.id, {
        timezone,
        currency,
        startDate,
        attributionWindow,
        defaultAttributionModel: attributionModel as AttributionModel,
      });
      await refreshWorkspaces();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace || deleteConfirm !== currentWorkspace.name) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteWorkspace(currentWorkspace.id);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting workspace:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const pixelId = currentWorkspace?.pixelId;
  const pixelCode = pixelId
    ? `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://pixly.io'}/pixel.js" data-pixel-id="${pixelId}" async></script>`
    : '';

  const handleCopyPixelId = () => {
    if (!pixelId) return;
    navigator.clipboard.writeText(pixelId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!pixelCode) return;
    navigator.clipboard.writeText(pixelCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAlerts = () => {
    const newThresholds: AlertThresholds = {
      enabled: alertEnabled,
      roasMin: roasMin ? parseFloat(roasMin) : null,
      cpaMax: cpaMax ? parseFloat(cpaMax) : null,
      spendDailyMax: spendMax ? parseFloat(spendMax) : null,
      conversionRateMin: crMin ? parseFloat(crMin) : null,
    };
    saveThresholds(newThresholds);
    setAlertSaveSuccess(true);
    setTimeout(() => setAlertSaveSuccess(false), 2000);
  };

  const handleResetAlerts = () => {
    resetThresholds();
  };

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    toast.success(
      'Visite guidée réinitialisée',
      'Rendez-vous sur le dashboard pour la relancer.'
    );
  };

  const handleResetNotifications = () => {
    resetNotifications();
    toast.success(
      'Notifications réactivées',
      'Les notifications de découverte réapparaîtront sur chaque page.'
    );
  };

  return (
    <>
      <AccountHeader
        title="Paramètres"
        description="Workspace, tracking et préférences"
      />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="space-y-10">

          {/* ── Workspace ── */}
          <section>
            <SectionLabel>Espace de travail</SectionLabel>

            <div className="rounded-2xl border border-neutral-200/80 bg-white">
              <div className="p-5">
                <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                  Nom du workspace
                </label>
                <Input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Mon entreprise"
                  className="h-10 w-full sm:max-w-sm text-[13px]"
                />
              </div>

              <Divider />

              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    Fuseau horaire
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
                  >
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="Europe/London">Londres (UTC)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                    <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    Devise
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                    <option value="GBP">Livre (£)</option>
                    <option value="CAD">Dollar CA ($)</option>
                  </select>
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    Fenêtre d&apos;attribution
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={attributionWindow}
                      onChange={(e) => setAttributionWindow(parseInt(e.target.value))}
                      min={1}
                      max={90}
                      className="h-10 pr-14 text-[13px]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">
                      jours
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                    Modèle d&apos;attribution
                  </label>
                  <select
                    value={attributionModel}
                    onChange={(e) => setAttributionModel(e.target.value as AttributionModel)}
                    className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
                  >
                    <option value="last_click">Dernier clic</option>
                    <option value="first_click">Premier clic</option>
                    <option value="linear">Linéaire</option>
                    <option value="time_decay">Décroissance temporelle</option>
                    <option value="position_based">Basé sur la position</option>
                  </select>
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

          {/* ── Pixel de tracking ── */}
          <section>
            <SectionLabel>Pixel de tracking</SectionLabel>

            <div className="rounded-2xl border border-neutral-200/80 bg-white">
              {/* Pixel ID row */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-neutral-700">ID du pixel</p>
                  <p className="mt-0.5 font-mono text-[13px] text-neutral-500">
                    {pixelId || 'Non configuré'}
                  </p>
                </div>
                {pixelId && (
                  <button
                    onClick={handleCopyPixelId}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 px-3 py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                )}
              </div>

              {pixelId && (
                <>
                  <Divider />

                  {/* Code section */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-neutral-700">Code d&apos;installation</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPixelCode(!showPixelCode)}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-700"
                        >
                          <Code2 className="h-3 w-3" />
                          {showPixelCode ? 'Masquer' : 'Voir le code'}
                        </button>
                        <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-700"
                        >
                          <Copy className="h-3 w-3" />
                          Copier
                        </button>
                      </div>
                    </div>

                    {showPixelCode && (
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-neutral-950 p-4 text-[12px] leading-relaxed text-neutral-300">
                        <code>{pixelCode}</code>
                      </pre>
                    )}

                    <p className="mt-3 text-[11px] text-neutral-400">
                      Ajoutez ce code dans la section{' '}
                      <code className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-600">&lt;head&gt;</code>{' '}
                      de votre site, avant la fermeture du tag.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Alertes ── */}
          <section>
            <SectionLabel>Alertes</SectionLabel>

            <div className="rounded-2xl border border-neutral-200/80 bg-white">
              <div className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-neutral-900">Notifications de performance</p>
                    <p className="mt-0.5 text-[12px] text-neutral-500">
                      Recevez des alertes lorsque vos métriques dépassent les seuils définis
                    </p>
                  </div>
                  <button
                    onClick={() => setAlertEnabled(!alertEnabled)}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-colors',
                      alertEnabled ? 'bg-emerald-500' : 'bg-neutral-200'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                        alertEnabled ? 'left-5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>
              </div>

              {alertEnabled && (
                <>
                  <Divider />

                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                        ROAS minimum
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          value={roasMin}
                          onChange={(e) => setRoasMin(e.target.value)}
                          placeholder="2.0"
                          className="h-10 pr-8 text-[13px]"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">
                          x
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-400">Alerte si ROAS &lt; ce seuil</p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                        CPA maximum
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="1"
                          value={cpaMax}
                          onChange={(e) => setCpaMax(e.target.value)}
                          placeholder="50"
                          className="h-10 pr-8 text-[13px]"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">
                          €
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-400">Alerte si CPA &gt; ce seuil</p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                        Dépenses journalières max
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="10"
                          value={spendMax}
                          onChange={(e) => setSpendMax(e.target.value)}
                          placeholder="1000"
                          className="h-10 pr-8 text-[13px]"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">
                          €
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-400">Alerte si dépenses &gt; ce seuil</p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                        Taux de conversion min
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          value={crMin}
                          onChange={(e) => setCrMin(e.target.value)}
                          placeholder="1.0"
                          className="h-10 pr-8 text-[13px]"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">
                          %
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-400">Alerte si CR &lt; ce seuil</p>
                    </div>
                  </div>

                  <Divider />

                  <div className="flex items-center justify-between px-5 py-3.5">
                    <button
                      onClick={handleResetAlerts}
                      className="text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-700"
                    >
                      Réinitialiser par défaut
                    </button>
                    <div className="flex items-center gap-3">
                      {alertSaveSuccess && (
                        <span className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                          Enregistré
                        </span>
                      )}
                      <Button size="sm" onClick={handleSaveAlerts} className="h-8 px-4 text-[12px]">
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── Aide ── */}
          <section>
            <SectionLabel>Aide</SectionLabel>

            <div className="rounded-2xl border border-neutral-200/80 bg-white">
              <div className="flex items-start justify-between px-5 py-4">
                <div>
                  <p className="text-[14px] font-medium text-neutral-900">
                    Visite guidée
                  </p>
                  <p className="mt-0.5 text-[12px] text-neutral-500">
                    Relancez le tutoriel de bienvenue pour redécouvrir les fonctionnalités de Pixly.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetOnboarding}
                  className="h-8 flex-shrink-0 px-4 text-[12px]"
                >
                  Relancer
                </Button>
              </div>

              <Divider />

              <div className="flex items-start justify-between px-5 py-4">
                <div>
                  <p className="text-[14px] font-medium text-neutral-900">
                    Notifications de d&eacute;couverte
                  </p>
                  <p className="mt-0.5 text-[12px] text-neutral-500">
                    R&eacute;activez les notifications p&eacute;dagogiques sur chaque page du dashboard.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetNotifications}
                  className="h-8 flex-shrink-0 px-4 text-[12px]"
                >
                  R&eacute;activer
                </Button>
              </div>
            </div>
          </section>

          {/* ── Zone de danger ── */}
          <section>
            <SectionLabel className="text-red-500/80">Zone de danger</SectionLabel>

            <div className="rounded-2xl border border-red-200/60 bg-white">
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-medium text-neutral-900">Supprimer cet espace de travail</p>
                    <p className="mt-0.5 text-[12px] text-neutral-500">
                      Toutes les données, intégrations et historique seront supprimés définitivement. Cette action est irréversible.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-[12px] text-neutral-500">
                    Tapez <span className="font-medium text-neutral-700">{currentWorkspace?.name || 'workspace'}</span> pour confirmer
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder={currentWorkspace?.name || 'workspace'}
                      className="h-9 w-full sm:max-w-xs text-[13px]"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={deleteConfirm !== (currentWorkspace?.name || '')}
                      isLoading={isDeleting}
                      onClick={handleDeleteWorkspace}
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
                  Une fois supprimé, il n&apos;est plus possible de récupérer les données de ce workspace.
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
