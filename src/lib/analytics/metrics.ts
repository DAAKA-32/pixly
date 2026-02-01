import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type {
  DashboardMetrics,
  OverviewMetrics,
  ChannelMetrics,
  Channel,
  Conversion,
} from '@/types';

// ===========================================
// PIXLY - Analytics Metrics Service
// Real-time metrics calculation from Firestore
// ===========================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RawEvent {
  id: string;
  workspaceId: string;
  eventType: string;
  timestamp: Date;
  value?: number;
  currency?: string;
  clickIds?: Record<string, string | null>;
  attribution?: {
    channel?: Channel;
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface RawConversion {
  id: string;
  workspaceId: string;
  type: 'lead' | 'purchase';
  value: number;
  currency: string;
  timestamp: Date;
  attribution?: {
    model: string;
    touchpoints: Array<{
      channel: Channel;
      source: string;
      medium: string;
      campaign: string | null;
      credit: number;
    }>;
  };
}

/**
 * Get date range based on period
 */
export function getDateRange(period: '7d' | '30d' | '90d' | 'custom', customRange?: DateRange): DateRange {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case 'custom':
      if (customRange) {
        return customRange;
      }
      start.setDate(start.getDate() - 30);
      break;
  }

  return { start, end };
}

/**
 * Fetch events from Firestore
 */
export async function fetchEvents(
  workspaceId: string,
  dateRange: DateRange
): Promise<RawEvent[]> {
  const eventsRef = collection(db, 'events');
  const q = query(
    eventsRef,
    where('workspaceId', '==', workspaceId),
    where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
    where('timestamp', '<=', Timestamp.fromDate(dateRange.end)),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      eventType: data.eventType,
      timestamp: data.timestamp?.toDate() || new Date(),
      value: data.value,
      currency: data.currency,
      clickIds: data.clickIds,
      attribution: data.attribution,
    };
  });
}

/**
 * Fetch conversions from Firestore
 */
export async function fetchConversions(
  workspaceId: string,
  dateRange: DateRange
): Promise<RawConversion[]> {
  const conversionsRef = collection(db, 'conversions');
  const q = query(
    conversionsRef,
    where('workspaceId', '==', workspaceId),
    where('timestamp', '>=', Timestamp.fromDate(dateRange.start)),
    where('timestamp', '<=', Timestamp.fromDate(dateRange.end)),
    orderBy('timestamp', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      workspaceId: data.workspaceId,
      type: data.type || 'lead',
      value: data.value || 0,
      currency: data.currency || 'EUR',
      timestamp: data.timestamp?.toDate() || new Date(),
      attribution: data.attribution,
    };
  });
}

/**
 * Determine channel from click IDs or attribution
 */
function determineChannel(event: RawEvent | RawConversion): Channel {
  // Check for RawConversion with attribution touchpoints
  if ('type' in event && event.attribution && 'touchpoints' in event.attribution) {
    const touchpoints = event.attribution.touchpoints;
    if (touchpoints?.[0]?.channel) {
      return touchpoints[0].channel;
    }
  }

  // Check for RawEvent with attribution channel
  if ('eventType' in event && event.attribution?.channel) {
    return event.attribution.channel;
  }

  // Check click IDs for RawEvent
  if ('clickIds' in event && event.clickIds) {
    const clickIds = event.clickIds;
    if (clickIds.gclid) return 'google';
    if (clickIds.fbclid) return 'meta';
    if (clickIds.ttclid) return 'tiktok';
    if (clickIds.li_fat_id) return 'linkedin';
    if (clickIds.msclkid) return 'bing';
    if (clickIds.utm_source) {
      const source = clickIds.utm_source.toLowerCase();
      if (source.includes('google')) return 'google';
      if (source.includes('facebook') || source.includes('meta') || source.includes('instagram')) return 'meta';
      if (source.includes('tiktok')) return 'tiktok';
      if (source.includes('email')) return 'email';
      return 'other';
    }
  }

  return 'direct';
}

/**
 * Calculate overview metrics
 */
const emptyAdSpend: Record<Channel, number> = {
  meta: 0, google: 0, tiktok: 0, linkedin: 0, bing: 0,
  organic: 0, direct: 0, email: 0, referral: 0, other: 0,
};

export function calculateOverviewMetrics(
  conversions: RawConversion[],
  adSpend: Record<Channel, number> = emptyAdSpend
): OverviewMetrics {
  const totalRevenue = conversions
    .filter((c) => c.type === 'purchase')
    .reduce((sum, c) => sum + (c.value || 0), 0);

  const totalConversions = conversions.length;
  const purchaseConversions = conversions.filter((c) => c.type === 'purchase').length;

  const totalSpend = Object.values(adSpend).reduce((sum, v) => sum + v, 0);

  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const aov = purchaseConversions > 0 ? totalRevenue / purchaseConversions : 0;

  // Conversion rate based on total events would need events count
  // For now, we'll leave it as 0 and calculate when events are available
  const conversionRate = 0;

  return {
    totalSpend,
    totalRevenue,
    totalConversions,
    roas,
    cpa,
    conversionRate,
    aov,
  };
}

/**
 * Calculate metrics by channel
 */
export function calculateChannelMetrics(
  conversions: RawConversion[],
  events: RawEvent[],
  adSpend: Record<Channel, number> = emptyAdSpend
): Record<Channel, ChannelMetrics> {
  const channels: Channel[] = ['meta', 'google', 'tiktok', 'linkedin', 'bing', 'organic', 'direct', 'email', 'referral', 'other'];

  const result: Record<string, ChannelMetrics> = {};

  for (const channel of channels) {
    const channelConversions = conversions.filter((c) => determineChannel(c) === channel);
    const channelEvents = events.filter((e) => determineChannel(e) === channel);

    const revenue = channelConversions
      .filter((c) => c.type === 'purchase')
      .reduce((sum, c) => sum + (c.value || 0), 0);

    const spend = adSpend[channel] || 0;
    const conversionCount = channelConversions.length;
    const clicks = channelEvents.filter((e) => e.eventType === 'page_view').length;

    result[channel] = {
      channel,
      spend,
      revenue,
      conversions: conversionCount,
      roas: spend > 0 ? revenue / spend : 0,
      cpa: conversionCount > 0 ? spend / conversionCount : 0,
      impressions: 0, // Would come from ad platform APIs
      clicks,
      ctr: 0, // Would need impressions
    };
  }

  return result as Record<Channel, ChannelMetrics>;
}

/**
 * Calculate metrics by campaign
 */
export function calculateCampaignMetrics(
  conversions: RawConversion[]
): Array<{ campaign: string; channel: Channel; revenue: number; conversions: number }> {
  const campaignMap = new Map<string, { channel: Channel; revenue: number; conversions: number }>();

  for (const conversion of conversions) {
    const campaign = conversion.attribution?.touchpoints?.[0]?.campaign || 'Direct / Unknown';
    const channel = determineChannel(conversion);
    const key = `${campaign}-${channel}`;

    const existing = campaignMap.get(key) || { channel, revenue: 0, conversions: 0 };
    existing.revenue += conversion.type === 'purchase' ? (conversion.value || 0) : 0;
    existing.conversions += 1;
    campaignMap.set(key, existing);
  }

  return Array.from(campaignMap.entries())
    .map(([key, data]) => ({
      campaign: key.split('-')[0],
      ...data,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculate revenue by day for chart
 */
export function calculateRevenueByDay(
  conversions: RawConversion[],
  dateRange: DateRange
): Array<{ date: string; revenue: number; conversions: number }> {
  const dayMap = new Map<string, { revenue: number; conversions: number }>();

  // Initialize all days in range
  const current = new Date(dateRange.start);
  while (current <= dateRange.end) {
    const dateKey = current.toISOString().split('T')[0];
    dayMap.set(dateKey, { revenue: 0, conversions: 0 });
    current.setDate(current.getDate() + 1);
  }

  // Fill in conversion data
  for (const conversion of conversions) {
    const dateKey = conversion.timestamp.toISOString().split('T')[0];
    const existing = dayMap.get(dateKey) || { revenue: 0, conversions: 0 };
    existing.revenue += conversion.type === 'purchase' ? (conversion.value || 0) : 0;
    existing.conversions += 1;
    dayMap.set(dateKey, existing);
  }

  return Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get full dashboard metrics
 */
export async function getDashboardMetrics(
  workspaceId: string,
  period: '7d' | '30d' | '90d' = '30d',
  adSpend: Record<Channel, number> = emptyAdSpend
): Promise<DashboardMetrics> {
  const dateRange = getDateRange(period);

  const [events, conversions] = await Promise.all([
    fetchEvents(workspaceId, dateRange),
    fetchConversions(workspaceId, dateRange),
  ]);

  const overview = calculateOverviewMetrics(conversions, adSpend);
  const byChannel = calculateChannelMetrics(conversions, events, adSpend);
  const byCampaign = calculateCampaignMetrics(conversions);
  const revenueByDay = calculateRevenueByDay(conversions, dateRange);

  // Format conversions for display
  const formattedConversions: Conversion[] = conversions.slice(0, 50).map((c) => ({
    id: c.id,
    eventId: c.id,
    workspaceId: c.workspaceId,
    pixelId: '',
    type: c.type,
    value: c.value,
    currency: c.currency,
    timestamp: c.timestamp,
    attribution: c.attribution ? {
      model: c.attribution.model as any,
      touchpoints: c.attribution.touchpoints.map((t) => ({
        sessionId: '',
        channel: t.channel,
        source: t.source,
        medium: t.medium,
        campaign: t.campaign,
        clickId: null,
        timestamp: c.timestamp,
        credit: t.credit,
      })),
      conversionId: c.id,
      conversionValue: c.value,
      attributedAt: c.timestamp,
    } : {
      model: 'last_click',
      touchpoints: [{
        sessionId: '',
        channel: determineChannel(c),
        source: 'direct',
        medium: 'none',
        campaign: null,
        clickId: null,
        timestamp: c.timestamp,
        credit: 1,
      }],
      conversionId: c.id,
      conversionValue: c.value,
      attributedAt: c.timestamp,
    },
    synced: {
      meta: { synced: false, syncedAt: null, error: null },
      google: { synced: false, syncedAt: null, error: null },
    },
  }));

  return {
    overview,
    byChannel,
    byCampaign: byCampaign.map((c) => ({
      campaignId: c.campaign,
      campaignName: c.campaign,
      channel: c.channel,
      spend: 0,
      revenue: c.revenue,
      conversions: c.conversions,
      roas: 0,
      cpa: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
    })),
    conversions: formattedConversions,
    revenueByDay,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
