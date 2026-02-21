'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from './use-workspace';
import {
  getDashboardMetrics,
  getDateRange,
  fetchPreviousOverview,
  type DateRange,
} from '@/lib/analytics/metrics';
import { generateDemoMetrics, generateDemoPreviousMetrics } from '@/lib/demo/data';
import type { DashboardMetrics, OverviewMetrics, Channel, CampaignMetrics } from '@/types';

// ===========================================
// PIXLY - Analytics Hook
// React Query + Demo mode fallback
// Merges Firestore conversions with real ad platform data
// ===========================================

export type Period = '7d' | '30d' | '90d';

interface UseAnalyticsOptions {
  period?: Period;
  autoRefresh?: boolean;
  refreshInterval?: number; // in ms
}

interface UseAnalyticsReturn {
  metrics: DashboardMetrics | null;
  previousMetrics: OverviewMetrics | null;
  isLoading: boolean;
  isFetching: boolean;
  isDemo: boolean;
  error: Error | null;
  period: Period;
  setPeriod: (period: Period) => void;
  dateRange: DateRange;
  refresh: () => Promise<void>;
  lastUpdatedAt: number | null;
}

interface QueryResult {
  metrics: DashboardMetrics;
  previousOverview: OverviewMetrics | null;
  isDemo: boolean;
}

interface AdDataResponse {
  adSpend: Record<Channel, number>;
  campaigns: CampaignMetrics[];
  channelMetrics: Record<string, {
    impressions: number;
    clicks: number;
    spend: number;
  }>;
}

const defaultMetrics: DashboardMetrics = {
  overview: {
    totalSpend: 0,
    totalRevenue: 0,
    totalConversions: 0,
    roas: 0,
    cpa: 0,
    conversionRate: 0,
    aov: 0,
  },
  byChannel: {} as Record<Channel, any>,
  byCampaign: [],
  conversions: [],
  revenueByDay: [],
};

// Default ad spend - will be replaced when integrations are connected
const defaultAdSpend: Record<Channel, number> = {
  meta: 0,
  google: 0,
  tiktok: 0,
  linkedin: 0,
  bing: 0,
  organic: 0,
  direct: 0,
  email: 0,
  referral: 0,
  other: 0,
};

/**
 * Fetch ad platform data (campaigns, spend, impressions) from connected integrations
 */
async function fetchAdData(workspaceId: string, period: string): Promise<AdDataResponse | null> {
  try {
    const response = await fetch(
      `/api/integrations/ad-data?workspaceId=${encodeURIComponent(workspaceId)}&period=${period}`
    );

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Merge ad platform campaigns with Firestore conversion-based campaigns.
 * Ad platforms provide spend/impressions/clicks.
 * Firestore provides conversions/revenue.
 */
function mergeCampaigns(
  firestoreCampaigns: CampaignMetrics[],
  adCampaigns: CampaignMetrics[]
): CampaignMetrics[] {
  if (adCampaigns.length === 0) return firestoreCampaigns;

  const merged = new Map<string, CampaignMetrics>();

  // Start with ad platform campaigns (have spend, impressions, clicks)
  for (const adCamp of adCampaigns) {
    merged.set(adCamp.campaignId, { ...adCamp });
  }

  // Merge Firestore conversion data by matching campaign name
  for (const fsCamp of firestoreCampaigns) {
    // Try to find a matching ad platform campaign by name
    const matchKey = Array.from(merged.keys()).find((key) => {
      const adCamp = merged.get(key)!;
      return (
        adCamp.channel === fsCamp.channel &&
        normalizeName(adCamp.campaignName) === normalizeName(fsCamp.campaignName)
      );
    });

    if (matchKey) {
      const existing = merged.get(matchKey)!;
      existing.conversions += fsCamp.conversions;
      existing.revenue += fsCamp.revenue;
      // Recalculate derived metrics
      existing.roas = existing.spend > 0 ? existing.revenue / existing.spend : 0;
      existing.cpa = existing.conversions > 0 ? existing.spend / existing.conversions : 0;
      merged.set(matchKey, existing);
    } else if (fsCamp.conversions > 0 || fsCamp.revenue > 0) {
      // No matching ad campaign - add as standalone from attribution
      merged.set(`fs_${fsCamp.campaignId}`, fsCamp);
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.revenue - a.revenue);
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if workspace has any connected integrations
 */
function hasConnectedIntegrations(workspace: any): boolean {
  if (!workspace?.integrations) return false;
  return Object.values(workspace.integrations).some(
    (integration: any) => integration?.connected === true
  );
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    period: initialPeriod = '30d',
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  const { currentWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const queryClient = useQueryClient();

  const dateRange = useMemo(() => getDateRange(period), [period]);

  // Demo mode: activated when no workspace is selected OR ?demo=true URL param
  const isDemoMode = !currentWorkspace?.id || searchParams.get('demo') === 'true';

  // Demo data query — instant, no network requests
  const {
    data: demoResult,
  } = useQuery<QueryResult>({
    queryKey: ['dashboard-metrics-demo', period],
    queryFn: (): QueryResult => {
      const metrics = generateDemoMetrics(period);
      const previousOverview = generateDemoPreviousMetrics(period);
      return { metrics, previousOverview, isDemo: true };
    },
    enabled: isDemoMode,
    staleTime: Infinity, // Demo data never goes stale
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // React Query for real metrics fetching with smart caching
  const {
    data: queryResult,
    isLoading,
    isFetching,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery<QueryResult>({
    queryKey: ['dashboard-metrics', currentWorkspace?.id, period],
    queryFn: async (): Promise<QueryResult> => {
      if (!currentWorkspace?.id) {
        return { metrics: defaultMetrics, previousOverview: null, isDemo: false };
      }

      // Fetch ad platform data if integrations are connected
      const shouldFetchAds = hasConnectedIntegrations(currentWorkspace);
      const adDataPromise = shouldFetchAds
        ? fetchAdData(currentWorkspace.id, period)
        : Promise.resolve(null);

      // Fetch Firestore data and ad data in parallel
      const [adData] = await Promise.all([adDataPromise]);

      // Use real ad spend if available
      const adSpend = adData?.adSpend || defaultAdSpend;

      // Fetch current metrics and previous period overview in parallel
      const [result, previousOverview] = await Promise.all([
        getDashboardMetrics(currentWorkspace.id, period, adSpend),
        fetchPreviousOverview(currentWorkspace.id, period, adSpend).catch(() => null),
      ]);

      // Merge ad platform campaigns with Firestore campaigns
      if (adData) {
        result.byCampaign = mergeCampaigns(result.byCampaign, adData.campaigns);

        // Enrich channel metrics with impressions/clicks from ad platforms
        for (const [channel, platformMetrics] of Object.entries(adData.channelMetrics)) {
          const ch = channel as Channel;
          if (result.byChannel[ch]) {
            result.byChannel[ch].impressions = platformMetrics.impressions;
            result.byChannel[ch].clicks = platformMetrics.clicks;
            result.byChannel[ch].ctr = platformMetrics.impressions > 0
              ? (platformMetrics.clicks / platformMetrics.impressions) * 100
              : 0;
          }
        }
      }

      return { metrics: result, previousOverview, isDemo: false };
    },
    enabled: !!currentWorkspace?.id && !isDemoMode,
    staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache duration (was cacheTime in v4)
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });

  // Prefetch adjacent periods for instant switching
  useEffect(() => {
    if (isDemoMode) {
      // Prefetch demo data for adjacent periods (instant)
      const periods: Period[] = ['7d', '30d', '90d'];
      const adjacentPeriods = periods.filter((p) => p !== period);
      adjacentPeriods.forEach((p) => {
        queryClient.prefetchQuery({
          queryKey: ['dashboard-metrics-demo', p],
          queryFn: (): QueryResult => ({
            metrics: generateDemoMetrics(p),
            previousOverview: generateDemoPreviousMetrics(p),
            isDemo: true,
          }),
          staleTime: Infinity,
        });
      });
      return;
    }

    if (!currentWorkspace?.id) return;

    const periods: Period[] = ['7d', '30d', '90d'];
    const adjacentPeriods = periods.filter((p) => p !== period);

    adjacentPeriods.forEach((p) => {
      queryClient.prefetchQuery({
        queryKey: ['dashboard-metrics', currentWorkspace.id, p],
        queryFn: async (): Promise<QueryResult> => {
          const shouldFetchAds = hasConnectedIntegrations(currentWorkspace);
          const adData = shouldFetchAds
            ? await fetchAdData(currentWorkspace.id, p)
            : null;
          const adSpend = adData?.adSpend || defaultAdSpend;

          const [result, previousOverview] = await Promise.all([
            getDashboardMetrics(currentWorkspace.id, p, adSpend),
            fetchPreviousOverview(currentWorkspace.id, p, adSpend).catch(() => null),
          ]);

          if (adData) {
            result.byCampaign = mergeCampaigns(result.byCampaign, adData.campaigns);
          }

          return { metrics: result, previousOverview, isDemo: false };
        },
        staleTime: 5 * 60 * 1000,
      });
    });
  }, [currentWorkspace?.id, period, queryClient, isDemoMode]);

  const refresh = useCallback(async () => {
    if (!isDemoMode) {
      await refetch();
    }
  }, [refetch, isDemoMode]);

  // Use demo data when in demo mode, otherwise use real data
  const activeResult = isDemoMode ? demoResult : queryResult;
  const metrics = activeResult?.metrics ?? defaultMetrics;
  const previousMetrics = activeResult?.previousOverview ?? null;
  const isDemo = activeResult?.isDemo ?? isDemoMode;

  return {
    metrics,
    previousMetrics,
    isLoading: isDemoMode ? false : (isLoading && !queryResult),
    isFetching: isDemoMode ? false : isFetching,
    isDemo,
    error: isDemoMode ? null : (error as Error | null),
    period,
    setPeriod,
    dateRange,
    refresh,
    lastUpdatedAt: isDemoMode ? Date.now() : (dataUpdatedAt || null),
  };
}

/**
 * Hook for real-time conversion updates
 * Optimized with cleanup and proper subscription handling
 */
export function useRealtimeConversions() {
  const { currentWorkspace } = useWorkspace();
  const [conversions, setConversions] = useState<DashboardMetrics['conversions']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!currentWorkspace?.id) {
      setConversions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Import dynamically to avoid SSR issues
    let mounted = true;

    import('@/lib/firebase/firestore').then(({ subscribeToConversions }) => {
      if (!mounted) return;

      const unsubscribe = subscribeToConversions(currentWorkspace.id, (newConversions) => {
        if (mounted) {
          setConversions(newConversions);
          setIsLoading(false);
        }
      });

      unsubscribeRef.current = unsubscribe;
    }).catch((error) => {
      console.error('Error setting up conversions subscription:', error);
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [currentWorkspace?.id]);

  return { conversions, isLoading };
}

/**
 * Hook for invalidating analytics cache
 * Use this when conversions/events are added
 */
export function useInvalidateAnalytics() {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();

  return useCallback(() => {
    if (currentWorkspace?.id) {
      queryClient.invalidateQueries({
        queryKey: ['dashboard-metrics', currentWorkspace.id],
      });
    }
  }, [queryClient, currentWorkspace?.id]);
}
