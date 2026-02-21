'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  AlertCircle,
  RefreshCw,
  Copy,
  Code2,
  Shield,
} from 'lucide-react';
import { useWorkspace } from '@/hooks/use-workspace';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/help-button';
import { PixelTutorialTrigger } from '@/components/tutorial/pixel-tutorial-drawer';
import { useToast } from '@/components/ui/toast';
import { integrationIcons } from '@/components/integrations/icons';
import { cn, formatDate } from '@/lib/utils';
import { usePlanGate } from '@/hooks/use-plan-gate';

// ===========================================
// PIXLY — Integrations Page
// Connect ad platforms, revenue sources, and CRM
// ===========================================

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'ads' | 'revenue' | 'crm';
  color: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'meta',
    name: 'Meta Ads',
    description: 'Facebook et Instagram Ads',
    category: 'ads',
    color: '#1877F2',
  },
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Search, Display et YouTube',
    category: 'ads',
    color: '#EA4335',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Paiements et revenus',
    category: 'revenue',
    color: '#635BFF',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Commandes et panier',
    category: 'revenue',
    color: '#96BF48',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Leads et contacts CRM',
    category: 'crm',
    color: '#FF7A59',
  },
];

const CATEGORIES = [
  { id: 'ads', label: 'Plateformes publicitaires' },
  { id: 'revenue', label: 'Sources de revenus' },
  { id: 'crm', label: 'CRM' },
] as const;

export default function IntegrationsPage() {
  const { currentWorkspace } = useWorkspace();
  const { canIntegration, requiredPlanForIntegration } = usePlanGate();
  const toast = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null);
  const [pixelCopied, setPixelCopied] = useState(false);
  const [showPixelCode, setShowPixelCode] = useState(false);
  const [shopifyShop, setShopifyShop] = useState('');
  const [showShopifyInput, setShowShopifyInput] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success) {
      const integration = INTEGRATIONS.find(i => i.id === success);
      const name = integration?.name || success;
      toast.success('Connexion réussie', `${name} est maintenant connecté.`);
      window.history.replaceState({}, '', '/integrations');
    }
  }, [toast]);

  const getStatus = useCallback((id: string): 'connected' | 'disconnected' | 'error' => {
    if (!currentWorkspace?.integrations) return 'disconnected';
    const integration = currentWorkspace.integrations[id as keyof typeof currentWorkspace.integrations];
    if (!integration) return 'disconnected';
    return integration.connected ? 'connected' : 'disconnected';
  }, [currentWorkspace?.integrations]);

  const getAccountName = useCallback((id: string): string | undefined => {
    if (!currentWorkspace?.integrations) return undefined;
    const integration = currentWorkspace.integrations[id as keyof typeof currentWorkspace.integrations];
    return integration?.accountName || undefined;
  }, [currentWorkspace?.integrations]);

  const getConnectedAt = useCallback((id: string): Date | null => {
    if (!currentWorkspace?.integrations) return null;
    const integration = currentWorkspace.integrations[id as keyof typeof currentWorkspace.integrations];
    if (!integration?.connectedAt) return null;
    const raw = integration.connectedAt as unknown;
    // Firestore Timestamp → Date
    if (raw && typeof raw === 'object' && 'toDate' in raw && typeof (raw as { toDate: unknown }).toDate === 'function') {
      return (raw as { toDate: () => Date }).toDate();
    }
    // Firestore Timestamp without toDate (plain object with seconds)
    if (raw && typeof raw === 'object' && 'seconds' in raw) {
      return new Date((raw as { seconds: number }).seconds * 1000);
    }
    // Already a valid date string or number
    const date = new Date(raw as string | number);
    return isNaN(date.getTime()) ? null : date;
  }, [currentWorkspace?.integrations]);

  const handleConnect = async (integrationId: string) => {
    if (!currentWorkspace?.id) return;

    // Shopify requires shop domain first
    if (integrationId === 'shopify') {
      setShowShopifyInput(true);
      return;
    }

    // Stripe uses server-side API key verification
    if (integrationId === 'stripe') {
      setConnecting('stripe');
      try {
        const res = await fetch('/api/integrations/connect-stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: currentWorkspace.id }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Stripe connecté', `${data.accountName} est maintenant connecté.`);
          window.location.reload();
        } else {
          toast.error('Erreur', data.error || 'Impossible de connecter Stripe.');
        }
      } catch {
        toast.error('Erreur', 'Impossible de connecter Stripe.');
      }
      setConnecting(null);
      return;
    }

    setConnecting(integrationId);

    const redirectUri = encodeURIComponent(
      `${window.location.origin}/api/oauth/${integrationId}/callback`
    );
    const state = encodeURIComponent(currentWorkspace.id);

    switch (integrationId) {
      case 'meta':
        window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&redirect_uri=${redirectUri}&state=${state}&scope=ads_management,ads_read,business_management`;
        break;
      case 'google':
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}&response_type=code&scope=https://www.googleapis.com/auth/adwords&access_type=offline&prompt=consent`;
        break;
      case 'hubspot':
        window.location.href = `https://app.hubspot.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_HUBSPOT_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${encodeURIComponent('crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write')}&response_type=code&state=${state}`;
        break;
      default:
        const integration = INTEGRATIONS.find(i => i.id === integrationId);
        toast.info('Bientôt disponible', `${integration?.name || integrationId} sera disponible prochainement.`);
        setConnecting(null);
    }
  };

  const handleShopifyConnect = () => {
    if (!currentWorkspace?.id || !shopifyShop.trim()) return;

    setConnecting('shopify');
    const shop = shopifyShop.trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    const redirectUri = encodeURIComponent(
      `${window.location.origin}/api/oauth/shopify/callback`
    );
    const state = encodeURIComponent(currentWorkspace.id);
    const scopes = 'read_orders,read_products';

    window.location.href = `https://${shop}/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!currentWorkspace?.id) return;

    // Require double-click confirmation
    if (confirmDisconnect !== integrationId) {
      setConfirmDisconnect(integrationId);
      return;
    }

    setDisconnecting(integrationId);
    setConfirmDisconnect(null);

    try {
      const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          integrationId,
        }),
      });

      if (response.ok) {
        const integration = INTEGRATIONS.find(i => i.id === integrationId);
        toast.success('Déconnecté', `${integration?.name} a été déconnecté.`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Erreur', 'Impossible de déconnecter cette intégration.');
    } finally {
      setDisconnecting(null);
    }
  };

  // Auto-cancel disconnect confirmation after 4s
  useEffect(() => {
    if (!confirmDisconnect) return;
    const timer = setTimeout(() => setConfirmDisconnect(null), 4000);
    return () => clearTimeout(timer);
  }, [confirmDisconnect]);

  const pixelId = currentWorkspace?.pixelId;
  const pixelSnippet = pixelId
    ? `<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://pixly.app'}/pixel.js" data-pixel-id="${pixelId}" async></script>`
    : '';

  const handleCopyPixel = () => {
    if (!pixelSnippet) return;
    navigator.clipboard.writeText(pixelSnippet);
    setPixelCopied(true);
    toast.success('Copié', 'Le code du pixel a été copié.');
    setTimeout(() => setPixelCopied(false), 2000);
  };

  const connectedCount = INTEGRATIONS.filter(i => getStatus(i.id) === 'connected').length;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Intégrations
          </h1>
          <p className="mt-0.5 text-[13px] text-neutral-400">
            Connectez vos outils pour suivre l&apos;origine de vos conversions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {connectedCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-medium text-emerald-700">
                {connectedCount} connectée{connectedCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Quick status dots — desktop only */}
          <div className="hidden sm:flex items-center gap-1">
            {INTEGRATIONS.map((integration) => {
              const status = getStatus(integration.id);
              const Icon = integrationIcons[integration.id];
              return (
                <div
                  key={integration.id}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                    status === 'connected' ? 'bg-emerald-50' : 'bg-neutral-50'
                  )}
                  title={`${integration.name}: ${status === 'connected' ? 'Connecté' : 'Non connecté'}`}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5',
                        status === 'connected' ? 'text-emerald-600' : 'text-neutral-300'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <HelpButton pageId="integrations" />
        </div>
      </div>

      {/* ===== PIXEL TRACKING ===== */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white">
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-900">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-neutral-900">Pixel de tracking</h3>
                {pixelId && (
                  <div className="flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-700">Actif</span>
                  </div>
                )}
              </div>
              <p className="text-[12px] text-neutral-400 truncate">
                {pixelId ? `ID: ${pixelId}` : 'Installez le pixel pour tracker les conversions'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {pixelId && (
              <>
                <PixelTutorialTrigger variant="compact" />
                <button
                  onClick={() => setShowPixelCode(!showPixelCode)}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 px-3 py-2 sm:py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                >
                  <Code2 className="h-3 w-3" />
                  {showPixelCode ? 'Masquer' : 'Voir le code'}
                </button>
                <button
                  onClick={handleCopyPixel}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 px-3 py-2 sm:py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                >
                  {pixelCopied ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {pixelCopied ? 'Copié' : 'Copier'}
                </button>
              </>
            )}
          </div>
        </div>

        {showPixelCode && pixelSnippet && (
          <div className="border-t border-neutral-100 px-4 py-3.5 sm:px-5 sm:py-4 space-y-4">
            <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-3 sm:p-4 text-[11px] sm:text-[12px] leading-relaxed text-neutral-300">
              <code>{pixelSnippet}</code>
            </pre>

            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3 w-3 flex-shrink-0 text-neutral-400" />
              <p className="text-[11px] text-neutral-400">
                Ajoutez ce code dans la balise <code className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-600">&lt;head&gt;</code> de votre site pour activer le suivi.
              </p>
            </div>

            {/* Platform-specific instructions */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-neutral-600">Instructions par plateforme :</p>

              <details className="group rounded-lg border border-neutral-200 bg-neutral-50">
                <summary className="cursor-pointer px-3 py-2 text-[11px] font-medium text-neutral-700 hover:text-neutral-900">
                  WordPress / WooCommerce
                </summary>
                <div className="border-t border-neutral-200 px-3 py-2.5 text-[11px] text-neutral-600 space-y-1.5">
                  <p><strong>Option 1 :</strong> Utilisez le plugin "Insert Headers and Footers"</p>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Installez le plugin depuis Extensions → Ajouter</li>
                    <li>Allez dans Réglages → Insert Headers and Footers</li>
                    <li>Collez le code dans "Scripts in Header"</li>
                    <li>Cliquez sur "Enregistrer"</li>
                  </ol>
                  <p className="pt-1"><strong>Option 2 :</strong> Modifiez header.php de votre thème (nécessite FTP/SFTP)</p>
                </div>
              </details>

              <details className="group rounded-lg border border-neutral-200 bg-neutral-50">
                <summary className="cursor-pointer px-3 py-2 text-[11px] font-medium text-neutral-700 hover:text-neutral-900">
                  Shopify
                </summary>
                <div className="border-t border-neutral-200 px-3 py-2.5 text-[11px] text-neutral-600 space-y-1.5">
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Allez dans Boutique en ligne → Thèmes</li>
                    <li>Cliquez sur Actions → Modifier le code</li>
                    <li>Ouvrez le fichier <code className="bg-neutral-100 px-1 rounded">theme.liquid</code></li>
                    <li>Trouvez la balise <code className="bg-neutral-100 px-1 rounded">&lt;/head&gt;</code></li>
                    <li>Collez le code juste avant cette balise</li>
                    <li>Cliquez sur "Enregistrer"</li>
                  </ol>
                </div>
              </details>

              <details className="group rounded-lg border border-neutral-200 bg-neutral-50">
                <summary className="cursor-pointer px-3 py-2 text-[11px] font-medium text-neutral-700 hover:text-neutral-900">
                  Site HTML / Webflow / Autres
                </summary>
                <div className="border-t border-neutral-200 px-3 py-2.5 text-[11px] text-neutral-600 space-y-1.5">
                  <p>Collez le code directement dans la section <code className="bg-neutral-100 px-1 rounded">&lt;head&gt;</code> de vos pages HTML, avant la balise de fermeture <code className="bg-neutral-100 px-1 rounded">&lt;/head&gt;</code>.</p>
                  <p className="pt-1">Pour Webflow : Allez dans Project Settings → Custom Code → Head Code</p>
                </div>
              </details>
            </div>

            {/* Verification */}
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
              <p className="text-[11px] font-medium text-emerald-800 mb-1">✓ Vérification</p>
              <p className="text-[11px] text-emerald-700">
                Une fois installé, visitez votre site. Les événements apparaîtront dans votre tableau de bord dans les secondes qui suivent.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ===== INTEGRATION CATEGORIES ===== */}
      {CATEGORIES.map((category) => {
        const integrations = INTEGRATIONS.filter(i => i.category === category.id);
        const categoryConnected = integrations.filter(i => getStatus(i.id) === 'connected').length;

        return (
          <div key={category.id}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {category.label}
              </h2>
              {categoryConnected > 0 && (
                <span className="text-[11px] tabular-nums text-neutral-400">
                  {categoryConnected}/{integrations.length}
                </span>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {integrations.map((integration) => {
                const status = getStatus(integration.id);
                const isConnecting = connecting === integration.id;
                const isDisconnecting = disconnecting === integration.id;
                const isConfirming = confirmDisconnect === integration.id;
                const accountName = getAccountName(integration.id);
                const connectedAt = getConnectedAt(integration.id);
                const isConnected = status === 'connected';
                const Icon = integrationIcons[integration.id];

                return (
                  <div
                    key={integration.id}
                    className={cn(
                      'group rounded-2xl border p-4 sm:p-5 transition-all duration-200',
                      isConnected
                        ? 'border-emerald-200/80 bg-emerald-50/30 hover:border-emerald-300'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-soft'
                    )}
                  >
                    {/* Icon + Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                          style={{
                            backgroundColor: `${integration.color}12`,
                            color: integration.color,
                          }}
                        >
                          {Icon
                            ? <Icon className="h-5 w-5" />
                            : <span className="text-[15px] font-bold">{integration.name[0]}</span>
                          }
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[14px] font-semibold text-neutral-900">
                            {integration.name}
                          </h3>
                          <p className="text-[12px] text-neutral-400 truncate">
                            {isConnected && accountName
                              ? accountName
                              : integration.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Connected info bar */}
                    {isConnected && connectedAt && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/60 px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-medium text-emerald-600">Connecté</span>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          depuis le {formatDate(connectedAt)}
                        </span>
                      </div>
                    )}

                    {/* Status + Action */}
                    <div className="mt-4 flex items-center justify-between">
                      {isConnected ? (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-[11px] font-medium text-emerald-600">Actif</span>
                        </div>
                      ) : status === 'error' ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-red-400" />
                          <span className="text-[11px] font-medium text-red-500">Erreur de connexion</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Non connecté</span>
                      )}

                      {isConnected ? (
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          disabled={isDisconnecting}
                          className={cn(
                            'rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all disabled:opacity-50',
                            isConfirming
                              ? 'border-red-300 bg-red-50 text-red-600'
                              : 'border-neutral-200/80 text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                          )}
                        >
                          {isDisconnecting ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : isConfirming ? (
                            'Confirmer'
                          ) : (
                            'Déconnecter'
                          )}
                        </button>
                      ) : integration.id === 'shopify' && showShopifyInput ? (
                        <button
                          onClick={() => { setShowShopifyInput(false); setShopifyShop(''); }}
                          className="rounded-lg border border-neutral-200/80 px-3 py-1.5 text-[12px] font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          Annuler
                        </button>
                      ) : !canIntegration(integration.id) ? (
                        <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-[11px] font-medium text-neutral-400">
                          Plan {requiredPlanForIntegration(integration.id)}
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                          isLoading={isConnecting}
                          className="h-9 px-5 text-[13px] sm:h-8 sm:px-4 sm:text-[12px]"
                        >
                          Connecter
                        </Button>
                      )}
                    </div>

                    {/* Shopify — shop domain input */}
                    {integration.id === 'shopify' && showShopifyInput && !isConnected && (
                      <div className="mt-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="ma-boutique.myshopify.com"
                            value={shopifyShop}
                            onChange={(e) => setShopifyShop(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleShopifyConnect()}
                            className="flex-1 min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[12px] text-neutral-700 placeholder:text-neutral-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-200 transition-colors"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleShopifyConnect}
                            isLoading={connecting === 'shopify'}
                            disabled={!shopifyShop.trim()}
                            className="h-8 flex-shrink-0 px-3 text-[12px]"
                          >
                            Valider
                          </Button>
                        </div>
                        <p className="mt-1.5 text-[11px] text-neutral-400">
                          Entrez votre domaine Shopify
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
