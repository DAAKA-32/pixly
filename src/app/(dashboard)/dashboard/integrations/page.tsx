'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  AlertCircle,
  RefreshCw,
  Copy,
  Code2,
} from 'lucide-react';
import { useWorkspace } from '@/hooks/use-workspace';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { integrationIcons } from '@/components/integrations/icons';

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
    description: 'Facebook & Instagram Ads',
    category: 'ads',
    color: '#1877F2',
  },
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Search, Display & YouTube',
    category: 'ads',
    color: '#EA4335',
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    description: 'TikTok Advertising',
    category: 'ads',
    color: '#000000',
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
  const toast = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [pixelCopied, setPixelCopied] = useState(false);
  const [showPixelCode, setShowPixelCode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (success) {
      toast.success('Connexion réussie', `${success} a été connecté avec succès.`);
      window.history.replaceState({}, '', '/dashboard/integrations');
    }
  }, [toast]);

  const getStatus = (id: string): 'connected' | 'disconnected' | 'error' => {
    if (!currentWorkspace?.integrations) return 'disconnected';
    const integration = currentWorkspace.integrations[id as keyof typeof currentWorkspace.integrations];
    if (!integration) return 'disconnected';
    return integration.connected ? 'connected' : 'disconnected';
  };

  const getAccountName = (id: string): string | undefined => {
    if (!currentWorkspace?.integrations) return undefined;
    const integration = currentWorkspace.integrations[id as keyof typeof currentWorkspace.integrations];
    return integration?.accountName || undefined;
  };

  const handleConnect = async (integrationId: string) => {
    if (!currentWorkspace?.id) return;
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
      case 'tiktok':
        window.location.href = `https://business-api.tiktok.com/portal/auth?app_id=${process.env.NEXT_PUBLIC_TIKTOK_APP_ID}&redirect_uri=${redirectUri}&state=${state}`;
        break;
      default:
        const integration = INTEGRATIONS.find(i => i.id === integrationId);
        toast.info('Bientôt disponible', `${integration?.name || integrationId} sera disponible prochainement.`);
        setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!currentWorkspace?.id) return;
    setDisconnecting(integrationId);

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
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Erreur', 'Impossible de déconnecter cette intégration.');
    } finally {
      setDisconnecting(null);
    }
  };

  const pixelId = currentWorkspace?.pixelId;
  const pixelSnippet = pixelId
    ? `<script>
  (function(p,i,x,l,y){p['PixlyObject']=y;p[y]=p[y]||function(){
  (p[y].q=p[y].q||[]).push(arguments)};var s=i.createElement('script');
  s.async=1;s.src=l;i.head.appendChild(s)
  })(window,document,'script','https://cdn.pixly.io/p.js','px');
  px('init','${pixelId}');
  px('track','PageView');
</script>`
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-neutral-900">
            Intégrations
          </h1>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            Connectez vos outils pour suivre l&apos;origine de vos conversions.
          </p>
        </div>
        {connectedCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 self-start sm:self-auto">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[12px] font-medium text-emerald-700">
              {connectedCount} connectée{connectedCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Pixel tracking section */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white">
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-900">
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
                {pixelId ? `ID: ${pixelId}` : 'Installez le pixel sur votre site pour tracker les conversions'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {pixelId && (
              <>
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
          <div className="border-t border-neutral-100 px-4 py-3.5 sm:px-5 sm:py-4">
            <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-3 sm:p-4 text-[11px] sm:text-[12px] leading-relaxed text-neutral-300">
              <code>{pixelSnippet}</code>
            </pre>
            <p className="mt-3 text-[11px] text-neutral-400">
              Collez ce code dans le <code className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-600">&lt;head&gt;</code> de votre site, avant la fermeture du tag.
            </p>
          </div>
        )}
      </div>

      {/* Integration categories */}
      {CATEGORIES.map((category) => {
        const integrations = INTEGRATIONS.filter(i => i.category === category.id);

        return (
          <div key={category.id}>
            <h2 className="mb-3 text-[13px] font-medium text-neutral-400">
              {category.label}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration, idx) => {
                const status = getStatus(integration.id);
                const isConnecting = connecting === integration.id;
                const isDisconnecting = disconnecting === integration.id;
                const accountName = getAccountName(integration.id);
                const isConnected = status === 'connected';
                const Icon = integrationIcons[integration.id];

                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    className={`group rounded-2xl border bg-white p-4 sm:p-5 transition-all duration-200 ${
                      isConnected
                        ? 'border-emerald-200/80 hover:border-emerald-300'
                        : 'border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: integration.color }}
                        >
                          {Icon
                            ? <Icon className="h-5 w-5" />
                            : <span className="text-[15px] font-bold">{integration.name[0]}</span>
                          }
                        </div>
                        <div>
                          <h3 className="text-[14px] font-semibold text-neutral-900">
                            {integration.name}
                          </h3>
                          <p className="text-[12px] text-neutral-400">
                            {isConnected && accountName
                              ? accountName
                              : integration.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {isConnected ? (
                        <div className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-[11px] font-medium text-emerald-600">Connecté</span>
                        </div>
                      ) : status === 'error' ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-red-400" />
                          <span className="text-[11px] font-medium text-red-500">Erreur</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Non connecté</span>
                      )}

                      {isConnected ? (
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          disabled={isDisconnecting}
                          className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-neutral-400 transition-colors hover:text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                          {isDisconnecting ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'Déconnecter'
                          )}
                        </button>
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
