'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useWorkspace } from '@/hooks/use-workspace';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ===========================================
// PIXLY - Integrations Page
// ===========================================

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'ads' | 'revenue' | 'crm';
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: Date;
  accountName?: string;
}

const INTEGRATIONS: Omit<Integration, 'status' | 'connectedAt' | 'accountName'>[] = [
  {
    id: 'meta',
    name: 'Meta Ads',
    description: 'Connect Facebook & Instagram ad accounts',
    icon: '📘',
    category: 'ads',
  },
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Track Google search and display campaigns',
    icon: '🔍',
    category: 'ads',
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    description: 'Track TikTok advertising performance',
    icon: '🎵',
    category: 'ads',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Import revenue data from Stripe payments',
    icon: '💳',
    category: 'revenue',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Connect your Shopify store for orders',
    icon: '🛒',
    category: 'revenue',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync leads and customers with HubSpot CRM',
    icon: '🧡',
    category: 'crm',
  },
];

export default function IntegrationsPage() {
  const { currentWorkspace } = useWorkspace();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const getIntegrationStatus = (id: string): Integration['status'] => {
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
        // TikTok Marketing API OAuth
        // Documentation: https://ads.tiktok.com/marketing_api/docs?id=1738373164380162
        window.location.href = `https://business-api.tiktok.com/portal/auth?app_id=${process.env.NEXT_PUBLIC_TIKTOK_APP_ID}&redirect_uri=${redirectUri}&state=${state}`;
        break;
      default:
        setTimeout(() => setConnecting(null), 1000);
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
    } finally {
      setDisconnecting(null);
    }
  };

  const categories = [
    { id: 'ads', name: 'Ad Platforms', description: 'Connect your advertising accounts' },
    { id: 'revenue', name: 'Revenue Sources', description: 'Import your sales and payment data' },
    { id: 'crm', name: 'CRM & Sales', description: 'Sync with your customer database' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Integrations</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Connect your tools to get accurate attribution data
        </p>
      </div>

      {/* Pixel Installation */}
      <Card className="border-primary-200 bg-primary-50/50">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">Tracking Pixel</h3>
            <p className="text-sm text-neutral-600">
              Install the Pixly pixel on your website to start tracking conversions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success">
              <Check className="mr-1 h-3 w-3" />
              Active
            </Badge>
            <Button variant="outline" size="sm">
              View Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Categories */}
      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{category.name}</h2>
            <p className="text-sm text-neutral-500">{category.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.filter((i) => i.category === category.id).map((integration) => {
              const status = getIntegrationStatus(integration.id);
              const isConnecting = connecting === integration.id;
              const isDisconnecting = disconnecting === integration.id;
              const accountName = getAccountName(integration.id);

              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="h-full">
                    <CardContent className="flex flex-col p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{integration.icon}</span>
                          <div>
                            <h3 className="font-semibold text-neutral-900">
                              {integration.name}
                            </h3>
                            <p className="text-sm text-neutral-500">
                              {status === 'connected' && accountName
                                ? accountName
                                : integration.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Badge
                          variant={
                            status === 'connected'
                              ? 'success'
                              : status === 'error'
                              ? 'error'
                              : 'default'
                          }
                        >
                          {status === 'connected' && <Check className="mr-1 h-3 w-3" />}
                          {status === 'error' && <AlertCircle className="mr-1 h-3 w-3" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>

                        {status === 'connected' ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnect(integration.id)}
                              disabled={isDisconnecting}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {isDisconnecting ? (
                                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                              ) : null}
                              Disconnect
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(integration.id)}
                            isLoading={isConnecting}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
