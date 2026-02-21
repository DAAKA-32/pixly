import type {
  DashboardMetrics,
  OverviewMetrics,
  ChannelMetrics,
  CampaignMetrics,
  Channel,
  Conversion,
  GeoMetrics,
} from '@/types';

// ===========================================
// PIXLY - Demo Data Generator
// Realistic French e-commerce mock data
// ===========================================

// ============ SEEDED RANDOM ============
// Deterministic random for consistent demo data within a session

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ============ BASE METRICS (30d) ============

const BASE_30D = {
  totalRevenue: 45_200,
  totalSpend: 14_120,
  totalConversions: 182,
  roas: 3.2,
  aov: 248,
  cpa: 77.6,
  conversionRate: 2.8,
};

// ============ PERIOD SCALING ============

const PERIOD_SCALE: Record<string, number> = {
  '7d': 1 / 4.3,
  '30d': 1,
  '90d': 3,
};

function scaleForPeriod(value: number, period: '7d' | '30d' | '90d'): number {
  return value * PERIOD_SCALE[period];
}

function getDaysInPeriod(period: '7d' | '30d' | '90d'): number {
  switch (period) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
  }
}

// ============ CHANNEL DISTRIBUTION ============

interface ChannelDistribution {
  spendShare: number;
  revenueShare: number;
  conversionShare: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

const CHANNEL_DISTRIBUTION: Partial<Record<Channel, ChannelDistribution>> = {
  meta: {
    spendShare: 0.45,
    revenueShare: 0.40,
    conversionShare: 0.38,
    impressions: 284_000,
    clicks: 8_520,
    ctr: 3.0,
  },
  google: {
    spendShare: 0.35,
    revenueShare: 0.38,
    conversionShare: 0.32,
    impressions: 195_000,
    clicks: 7_800,
    ctr: 4.0,
  },
  tiktok: {
    spendShare: 0.12,
    revenueShare: 0.15,
    conversionShare: 0.18,
    impressions: 520_000,
    clicks: 5_200,
    ctr: 1.0,
  },
  organic: {
    spendShare: 0,
    revenueShare: 0.05,
    conversionShare: 0.08,
    impressions: 0,
    clicks: 3_200,
    ctr: 0,
  },
  direct: {
    spendShare: 0,
    revenueShare: 0.02,
    conversionShare: 0.04,
    impressions: 0,
    clicks: 1_100,
    ctr: 0,
  },
};

// ============ CAMPAIGN DATA ============

interface CampaignSeed {
  name: string;
  channel: Channel;
  spendShare: number; // share within channel
  roasMultiplier: number; // relative performance
}

const CAMPAIGN_SEEDS: CampaignSeed[] = [
  // Meta campaigns (45% of total spend)
  { name: '[FR] Retargeting - Automne 2024', channel: 'meta', spendShare: 0.28, roasMultiplier: 1.4 },
  { name: 'Meta - Lookalike 1% - Acheteurs', channel: 'meta', spendShare: 0.22, roasMultiplier: 1.2 },
  { name: 'Meta - Broad - Collection Hiver', channel: 'meta', spendShare: 0.18, roasMultiplier: 0.9 },
  { name: '[FR] DPA - Catalogue Produits', channel: 'meta', spendShare: 0.17, roasMultiplier: 1.1 },
  { name: 'Meta - Vidéo - Témoignages Clients', channel: 'meta', spendShare: 0.15, roasMultiplier: 0.7 },

  // Google campaigns (35% of total spend)
  { name: 'Google Search - Marque', channel: 'google', spendShare: 0.30, roasMultiplier: 1.8 },
  { name: 'Google Search - Generique', channel: 'google', spendShare: 0.25, roasMultiplier: 0.9 },
  { name: 'Google Shopping - Best Sellers', channel: 'google', spendShare: 0.20, roasMultiplier: 1.3 },
  { name: 'Google Performance Max - FR', channel: 'google', spendShare: 0.15, roasMultiplier: 1.0 },
  { name: 'Google Display - Remarketing', channel: 'google', spendShare: 0.10, roasMultiplier: 0.6 },

  // TikTok campaigns (12% of total spend)
  { name: 'TikTok - UGC Créateurs FR', channel: 'tiktok', spendShare: 0.40, roasMultiplier: 1.3 },
  { name: 'TikTok - Spark Ads - Tendances', channel: 'tiktok', spendShare: 0.35, roasMultiplier: 1.0 },
  { name: 'TikTok - Collection Automne', channel: 'tiktok', spendShare: 0.25, roasMultiplier: 0.8 },

  // Organic / Direct (no spend)
  { name: 'Recherche organique', channel: 'organic', spendShare: 0, roasMultiplier: 0 },
  { name: 'Trafic direct', channel: 'direct', spendShare: 0, roasMultiplier: 0 },
];

// ============ CONVERSION NAMES ============

const FRENCH_NAMES = [
  { first: 'Marie', last: 'Dupont' },
  { first: 'Thomas', last: 'Martin' },
  { first: 'Sophie', last: 'Bernard' },
  { first: 'Lucas', last: 'Petit' },
  { first: 'Camille', last: 'Robert' },
  { first: 'Antoine', last: 'Richard' },
  { first: 'Julie', last: 'Durand' },
  { first: 'Pierre', last: 'Leroy' },
  { first: 'Léa', last: 'Moreau' },
  { first: 'Nicolas', last: 'Simon' },
  { first: 'Emma', last: 'Laurent' },
  { first: 'Hugo', last: 'Lefebvre' },
  { first: 'Chloé', last: 'Michel' },
  { first: 'Maxime', last: 'Garcia' },
  { first: 'Sarah', last: 'Fournier' },
  { first: 'Alexandre', last: 'Morel' },
  { first: 'Manon', last: 'Girard' },
  { first: 'Julien', last: 'André' },
  { first: 'Laura', last: 'Mercier' },
  { first: 'Romain', last: 'Blanc' },
  { first: 'Pauline', last: 'Guérin' },
  { first: 'Mathieu', last: 'Muller' },
  { first: 'Clara', last: 'Faure' },
  { first: 'Florian', last: 'Rousseau' },
];

// ============ GEO DATA ============

interface GeoSeed {
  countryCode: string;
  countryName: string;
  share: number;
}

const GEO_SEEDS: GeoSeed[] = [
  { countryCode: 'FR', countryName: 'France', share: 0.60 },
  { countryCode: 'BE', countryName: 'Belgique', share: 0.12 },
  { countryCode: 'CH', countryName: 'Suisse', share: 0.10 },
  { countryCode: 'CA', countryName: 'Canada', share: 0.08 },
  { countryCode: 'LU', countryName: 'Luxembourg', share: 0.04 },
  { countryCode: 'MA', countryName: 'Maroc', share: 0.03 },
  { countryCode: 'SN', countryName: 'Sénégal', share: 0.02 },
  { countryCode: 'CI', countryName: "Côte d'Ivoire", share: 0.01 },
];

// ============ GENERATORS ============

/**
 * Generate realistic revenue-by-day data with weekday/weekend variation.
 * Weekdays get ~20% more revenue than weekends. Mondays have a small spike.
 */
function generateRevenueByDay(
  totalRevenue: number,
  totalConversions: number,
  days: number,
  rand: () => number
): Array<{ date: string; revenue: number; conversions: number }> {
  const result: Array<{ date: string; revenue: number; conversions: number }> = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Generate raw weights per day
  const weights: number[] = [];
  let totalWeight = 0;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

    // Base weight with weekday/weekend pattern
    let weight = 1.0;
    if (dayOfWeek === 0) weight = 0.72; // Sunday
    else if (dayOfWeek === 6) weight = 0.80; // Saturday
    else if (dayOfWeek === 1) weight = 1.12; // Monday spike
    else if (dayOfWeek === 4) weight = 1.05; // Thursday slight bump

    // Add natural variation (+/-15%)
    weight *= 0.85 + rand() * 0.30;

    // Slight upward trend over time (newer days slightly higher)
    const trendFactor = 0.92 + (0.16 * (days - i)) / days;
    weight *= trendFactor;

    weights.push(weight);
    totalWeight += weight;
  }

  // Distribute revenue and conversions proportionally
  let distributedRevenue = 0;
  let distributedConversions = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];

    const share = weights[i] / totalWeight;

    // Last day gets the remainder to ensure totals match
    const isLast = i === days - 1;
    const dayRevenue = isLast
      ? Math.round((totalRevenue - distributedRevenue) * 100) / 100
      : Math.round(totalRevenue * share * 100) / 100;
    const dayConversions = isLast
      ? totalConversions - distributedConversions
      : Math.round(totalConversions * share);

    distributedRevenue += dayRevenue;
    distributedConversions += dayConversions;

    result.push({
      date: dateStr,
      revenue: Math.max(0, dayRevenue),
      conversions: Math.max(0, dayConversions),
    });
  }

  return result;
}

/**
 * Generate channel metrics from base totals and distribution config.
 */
function generateChannelMetrics(
  totalSpend: number,
  totalRevenue: number,
  totalConversions: number,
  period: '7d' | '30d' | '90d',
  rand: () => number
): Record<Channel, ChannelMetrics> {
  const allChannels: Channel[] = [
    'meta', 'google', 'tiktok', 'linkedin', 'bing',
    'organic', 'direct', 'email', 'referral', 'other',
  ];

  const periodScale = PERIOD_SCALE[period];
  const result = {} as Record<Channel, ChannelMetrics>;

  for (const channel of allChannels) {
    const dist = CHANNEL_DISTRIBUTION[channel];

    if (!dist) {
      // Channels not in distribution get zero
      result[channel] = {
        channel,
        spend: 0,
        revenue: 0,
        conversions: 0,
        roas: 0,
        cpa: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
      };
      continue;
    }

    const spend = totalSpend * dist.spendShare;
    const revenue = totalRevenue * dist.revenueShare;
    const conversions = Math.round(totalConversions * dist.conversionShare);
    const impressions = Math.round(dist.impressions * periodScale * (0.9 + rand() * 0.2));
    const clicks = Math.round(dist.clicks * periodScale * (0.9 + rand() * 0.2));

    result[channel] = {
      channel,
      spend: Math.round(spend * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      conversions,
      roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0,
      cpa: conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : 0,
      impressions,
      clicks,
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
    };
  }

  return result;
}

/**
 * Generate campaign metrics from seeds.
 */
function generateCampaignMetrics(
  totalSpend: number,
  totalRevenue: number,
  totalConversions: number,
  rand: () => number
): CampaignMetrics[] {
  const campaigns: CampaignMetrics[] = [];

  for (const seed of CAMPAIGN_SEEDS) {
    const channelDist = CHANNEL_DISTRIBUTION[seed.channel];
    if (!channelDist) continue;

    const channelSpend = totalSpend * channelDist.spendShare;
    const channelRevenue = totalRevenue * channelDist.revenueShare;
    const channelConversions = Math.round(totalConversions * channelDist.conversionShare);

    const spend = channelSpend * seed.spendShare;
    // Revenue scales with spend share but modified by ROAS multiplier
    const baseRevenueShare = seed.spendShare > 0 ? seed.spendShare : (seed.channel === 'organic' ? 1 : 1);
    const revenue = seed.spendShare > 0
      ? channelRevenue * seed.spendShare * seed.roasMultiplier / avgRoasMultiplier(seed.channel)
      : channelRevenue; // organic/direct get full channel revenue
    const conversions = seed.spendShare > 0
      ? Math.max(1, Math.round(channelConversions * seed.spendShare * (0.9 + rand() * 0.2)))
      : Math.max(1, Math.round(channelConversions * (0.9 + rand() * 0.2)));

    const impressions = spend > 0
      ? Math.round((spend / (channelDist.spendShare > 0 ? channelSpend : 1)) * (channelDist.impressions || 0) * (0.85 + rand() * 0.3))
      : 0;
    const clicks = impressions > 0
      ? Math.round(impressions * (channelDist.ctr / 100) * (0.85 + rand() * 0.3))
      : Math.round(500 + rand() * 2000);

    campaigns.push({
      campaignId: `demo_${seed.channel}_${seed.name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}`,
      campaignName: seed.name,
      channel: seed.channel,
      spend: Math.round(spend * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      conversions,
      roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0,
      cpa: conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : 0,
      impressions,
      clicks,
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
    });
  }

  return campaigns.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Average ROAS multiplier for a channel (used for normalization).
 */
function avgRoasMultiplier(channel: Channel): number {
  const channelSeeds = CAMPAIGN_SEEDS.filter((s) => s.channel === channel && s.spendShare > 0);
  if (channelSeeds.length === 0) return 1;
  const totalWeight = channelSeeds.reduce((sum, s) => sum + s.spendShare, 0);
  return channelSeeds.reduce((sum, s) => sum + s.roasMultiplier * (s.spendShare / totalWeight), 0);
}

/**
 * Generate realistic conversions with French names and proper attribution.
 */
function generateConversions(
  totalConversions: number,
  totalRevenue: number,
  days: number,
  rand: () => number
): Conversion[] {
  const count = Math.min(totalConversions, 20); // Display max 20
  const conversions: Conversion[] = [];
  const now = new Date();

  // Channel weights for attribution
  const channelWeights: Array<{ channel: Channel; weight: number }> = [
    { channel: 'meta', weight: 0.38 },
    { channel: 'google', weight: 0.32 },
    { channel: 'tiktok', weight: 0.18 },
    { channel: 'organic', weight: 0.08 },
    { channel: 'direct', weight: 0.04 },
  ];

  // Source/medium pairs for each channel
  const channelSources: Record<string, Array<{ source: string; medium: string }>> = {
    meta: [
      { source: 'facebook', medium: 'cpc' },
      { source: 'instagram', medium: 'cpc' },
      { source: 'facebook', medium: 'paid_social' },
    ],
    google: [
      { source: 'google', medium: 'cpc' },
      { source: 'google', medium: 'organic' },
      { source: 'google', medium: 'shopping' },
    ],
    tiktok: [
      { source: 'tiktok', medium: 'cpc' },
      { source: 'tiktok', medium: 'paid_social' },
    ],
    organic: [
      { source: 'google', medium: 'organic' },
      { source: 'bing', medium: 'organic' },
    ],
    direct: [
      { source: '(direct)', medium: '(none)' },
    ],
  };

  for (let i = 0; i < count; i++) {
    // Pick a channel weighted by distribution
    const r = rand();
    let cumulative = 0;
    let selectedChannel: Channel = 'meta';
    for (const cw of channelWeights) {
      cumulative += cw.weight;
      if (r <= cumulative) {
        selectedChannel = cw.channel;
        break;
      }
    }

    // Pick source/medium
    const sources = channelSources[selectedChannel] || [{ source: '(direct)', medium: '(none)' }];
    const sourceMedium = sources[Math.floor(rand() * sources.length)];

    // Type: ~65% purchases, ~35% leads
    const isPurchase = rand() < 0.65;
    const type = isPurchase ? 'purchase' as const : 'lead' as const;

    // Value
    const value = isPurchase
      ? Math.round((150 + rand() * 350) * 100) / 100  // 150-500 EUR
      : Math.round((25 + rand() * 75) * 100) / 100;   // 25-100 EUR (lead value)

    // Timestamp - spread across the period with more recent bias
    const daysAgo = Math.floor(Math.pow(rand(), 1.5) * days); // Bias toward recent
    const hoursOffset = Math.floor(rand() * 24);
    const minutesOffset = Math.floor(rand() * 60);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(8 + hoursOffset % 14, minutesOffset, 0, 0); // Between 8h and 22h

    // Name
    const nameData = FRENCH_NAMES[i % FRENCH_NAMES.length];

    // Pick a campaign for this channel
    const channelCampaigns = CAMPAIGN_SEEDS.filter((s) => s.channel === selectedChannel);
    const campaign = channelCampaigns.length > 0
      ? channelCampaigns[Math.floor(rand() * channelCampaigns.length)].name
      : null;

    // Sync status - most are synced
    const metaSynced = selectedChannel === 'meta' && rand() < 0.85;
    const googleSynced = selectedChannel === 'google' && rand() < 0.90;

    conversions.push({
      id: `demo_conv_${i}_${nameData.last.toLowerCase()}`,
      workspaceId: 'demo',
      eventId: `demo_event_${i}`,
      type,
      value,
      currency: 'EUR',
      timestamp,
      attribution: {
        model: 'last_click',
        touchpoints: [
          {
            sessionId: `demo_session_${i}`,
            channel: selectedChannel,
            source: sourceMedium.source,
            medium: sourceMedium.medium,
            campaign,
            clickId: selectedChannel === 'meta' ? `fb_${Math.random().toString(36).slice(2, 12)}` :
                     selectedChannel === 'google' ? `gclid_${Math.random().toString(36).slice(2, 12)}` :
                     selectedChannel === 'tiktok' ? `tt_${Math.random().toString(36).slice(2, 12)}` : null,
            timestamp,
            credit: 1,
          },
        ],
        conversionId: `demo_conv_${i}_${nameData.last.toLowerCase()}`,
        conversionValue: value,
        attributedAt: timestamp,
      },
      synced: {
        meta: {
          synced: metaSynced,
          syncedAt: metaSynced ? new Date(timestamp.getTime() + 60000) : null,
          error: null,
        },
        google: {
          synced: googleSynced,
          syncedAt: googleSynced ? new Date(timestamp.getTime() + 45000) : null,
          error: null,
        },
      },
    });
  }

  // Sort by timestamp descending (most recent first)
  return conversions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Generate geographic metrics.
 */
function generateGeoMetrics(
  totalConversions: number,
  totalRevenue: number,
  totalSpend: number,
  rand: () => number
): GeoMetrics[] {
  return GEO_SEEDS.map((geo) => {
    const variation = 0.9 + rand() * 0.2;
    const conversions = Math.max(1, Math.round(totalConversions * geo.share * variation));
    const revenue = Math.round(totalRevenue * geo.share * variation * 100) / 100;
    const visitors = Math.round(conversions / (0.015 + rand() * 0.025)); // 1.5-4% conversion rate
    const spend = Math.round(totalSpend * geo.share * variation * 100) / 100;

    return {
      countryCode: geo.countryCode,
      countryName: geo.countryName,
      conversions,
      revenue,
      visitors,
      conversionRate: visitors > 0 ? Math.round((conversions / visitors) * 10000) / 100 : 0,
      roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0,
    };
  }).sort((a, b) => b.conversions - a.conversions);
}

// ============ PUBLIC API ============

/**
 * Generate complete demo dashboard metrics for a given period.
 * Data is deterministic per period (seeded random) so it stays consistent
 * during a session, but has natural variation between periods.
 */
export function generateDemoMetrics(period: '7d' | '30d' | '90d'): DashboardMetrics {
  const seed = period === '7d' ? 42 : period === '30d' ? 137 : 293;
  const rand = seededRandom(seed);
  const days = getDaysInPeriod(period);

  // Scale base metrics for the period
  const totalRevenue = Math.round(scaleForPeriod(BASE_30D.totalRevenue, period) * 100) / 100;
  const totalSpend = Math.round(scaleForPeriod(BASE_30D.totalSpend, period) * 100) / 100;
  const totalConversions = Math.round(scaleForPeriod(BASE_30D.totalConversions, period));

  // AOV stays roughly stable across periods (slight variation)
  const aov = totalConversions > 0
    ? Math.round((totalRevenue / totalConversions) * 100) / 100
    : BASE_30D.aov;

  const overview: OverviewMetrics = {
    totalSpend,
    totalRevenue,
    totalConversions,
    roas: totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0,
    cpa: totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0,
    conversionRate: BASE_30D.conversionRate + (rand() - 0.5) * 0.4,
    aov,
  };

  const byChannel = generateChannelMetrics(totalSpend, totalRevenue, totalConversions, period, rand);
  const byCampaign = generateCampaignMetrics(totalSpend, totalRevenue, totalConversions, rand);
  const revenueByDay = generateRevenueByDay(totalRevenue, totalConversions, days, rand);
  const conversions = generateConversions(totalConversions, totalRevenue, days, rand);
  const byCountry = generateGeoMetrics(totalConversions, totalRevenue, totalSpend, rand);

  return {
    overview,
    byChannel,
    byCampaign,
    conversions,
    revenueByDay,
    byCountry,
  };
}

/**
 * Generate previous-period overview metrics for comparison.
 * Numbers are 8-15% lower to show positive growth trends.
 */
export function generateDemoPreviousMetrics(period: '7d' | '30d' | '90d'): OverviewMetrics {
  const seed = period === '7d' ? 7001 : period === '30d' ? 7002 : 7003;
  const rand = seededRandom(seed);

  // Decrease factor: 8-15% lower than current period
  const decreaseFactor = () => 0.85 + rand() * 0.07; // 0.85 to 0.92

  const totalRevenue = Math.round(scaleForPeriod(BASE_30D.totalRevenue, period) * decreaseFactor() * 100) / 100;
  const totalSpend = Math.round(scaleForPeriod(BASE_30D.totalSpend, period) * decreaseFactor() * 100) / 100;
  const totalConversions = Math.round(scaleForPeriod(BASE_30D.totalConversions, period) * decreaseFactor());
  const purchaseConversions = Math.round(totalConversions * 0.65);

  return {
    totalSpend,
    totalRevenue,
    totalConversions,
    roas: totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0,
    cpa: totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0,
    conversionRate: (BASE_30D.conversionRate - 0.3) + (rand() - 0.5) * 0.2,
    aov: purchaseConversions > 0
      ? Math.round((totalRevenue / purchaseConversions) * 100) / 100
      : BASE_30D.aov * 0.92,
  };
}
