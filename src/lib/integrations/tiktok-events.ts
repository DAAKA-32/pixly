import type { Conversion } from '@/types';

// ===========================================
// PIXLY - TikTok Events API Integration
// Send conversions to TikTok for attribution
// ===========================================

// TikTok Events API v1.3
const TIKTOK_API_VERSION = 'v1.3';
const TIKTOK_EVENTS_API_URL = `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/event/track/`;

interface TikTokEventPayload {
  event: string;
  event_id?: string;
  event_time: number;
  user: TikTokUserData;
  properties?: TikTokEventProperties;
  page?: TikTokPageData;
}

interface TikTokUserData {
  ttclid?: string; // TikTok Click ID
  external_id?: string; // Hashed user ID
  email?: string; // Hashed email
  phone?: string; // Hashed phone
  ip?: string;
  user_agent?: string;
}

interface TikTokEventProperties {
  currency?: string;
  value?: number;
  content_type?: string;
  content_id?: string;
  content_category?: string;
  content_name?: string;
  num_items?: number;
  order_id?: string;
}

interface TikTokPageData {
  url?: string;
  referrer?: string;
}

interface TikTokAPIResponse {
  code: number;
  message: string;
  request_id: string;
  data?: {
    events_received: number;
    error_events?: Array<{
      index: number;
      error_message: string;
    }>;
  };
}

// TikTok event name mapping
const EVENT_NAME_MAP: Record<string, string> = {
  purchase: 'CompletePayment',
  lead: 'SubmitForm',
  add_to_cart: 'AddToCart',
  initiate_checkout: 'InitiateCheckout',
  page_view: 'ViewContent',
};

/**
 * Send a single conversion event to TikTok Events API
 */
export async function sendConversionToTikTok(
  conversion: Conversion,
  pixelCode: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  // Find TikTok click ID from attribution
  const ttclid = conversion.attribution?.touchpoints.find(
    (t) => t.channel === 'tiktok' && t.clickId
  )?.clickId;

  // Build event payload
  const eventPayload: TikTokEventPayload = {
    event: EVENT_NAME_MAP[conversion.type] || 'CompletePayment',
    event_id: conversion.id,
    event_time: Math.floor(conversion.timestamp.getTime() / 1000),
    user: {
      ttclid: ttclid || undefined,
    },
    properties: {
      currency: conversion.currency || 'USD',
      value: conversion.value,
    },
  };

  try {
    const response = await fetch(TIKTOK_EVENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify({
        pixel_code: pixelCode,
        event: eventPayload.event,
        event_id: eventPayload.event_id,
        timestamp: new Date(eventPayload.event_time * 1000).toISOString(),
        context: {
          user: eventPayload.user,
          page: eventPayload.page,
        },
        properties: eventPayload.properties,
      }),
    });

    const result: TikTokAPIResponse = await response.json();

    if (result.code === 0) {
      return { success: true };
    }

    return {
      success: false,
      error: result.message || 'TikTok API error',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send to TikTok Events API';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Batch send conversions to TikTok Events API
 */
export async function batchSendToTikTok(
  conversions: Conversion[],
  pixelCode: string,
  accessToken: string
): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
  const results = {
    successCount: 0,
    errorCount: 0,
    errors: [] as string[],
  };

  // TikTok supports batch events (up to 1000 per request)
  const batchSize = 1000;
  const batches: Conversion[][] = [];

  for (let i = 0; i < conversions.length; i += batchSize) {
    batches.push(conversions.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const events = batch.map((conversion) => {
      const ttclid = conversion.attribution?.touchpoints.find(
        (t) => t.channel === 'tiktok' && t.clickId
      )?.clickId;

      return {
        event: EVENT_NAME_MAP[conversion.type] || 'CompletePayment',
        event_id: conversion.id,
        timestamp: new Date(conversion.timestamp).toISOString(),
        context: {
          user: {
            ttclid: ttclid || undefined,
          },
        },
        properties: {
          currency: conversion.currency || 'USD',
          value: conversion.value,
        },
      };
    });

    try {
      const response = await fetch(
        `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/event/batch/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': accessToken,
          },
          body: JSON.stringify({
            pixel_code: pixelCode,
            batch: events,
          }),
        }
      );

      const result: TikTokAPIResponse = await response.json();

      if (result.code === 0) {
        const received = result.data?.events_received || 0;
        results.successCount += received;
        results.errorCount += batch.length - received;

        if (result.data?.error_events) {
          results.errors.push(
            ...result.data.error_events.map((e) => e.error_message)
          );
        }
      } else {
        results.errorCount += batch.length;
        results.errors.push(result.message);
      }
    } catch (error: unknown) {
      results.errorCount += batch.length;
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(message);
    }
  }

  return results;
}

/**
 * Get TikTok ad account info
 */
export async function getTikTokAdAccounts(
  accessToken: string
): Promise<{ success: boolean; accounts?: Array<{ id: string; name: string }>; error?: string }> {
  try {
    const response = await fetch(
      `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/advertiser/info/`,
      {
        method: 'GET',
        headers: {
          'Access-Token': accessToken,
        },
      }
    );

    const result = await response.json();

    if (result.code === 0 && result.data?.list) {
      return {
        success: true,
        accounts: result.data.list.map((acc: { advertiser_id: string; advertiser_name: string }) => ({
          id: acc.advertiser_id,
          name: acc.advertiser_name,
        })),
      };
    }

    return {
      success: false,
      error: result.message || 'Failed to get ad accounts',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Get campaign metrics from TikTok Ads
 */
export async function getTikTokCampaignMetrics(
  accessToken: string,
  advertiserId: string,
  startDate: string,
  endDate: string
): Promise<{
  success: boolean;
  campaigns?: Array<{
    campaign_id: string;
    campaign_name: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
  }>;
  error?: string;
}> {
  try {
    const params = new URLSearchParams({
      advertiser_id: advertiserId,
      start_date: startDate,
      end_date: endDate,
      data_level: 'AUCTION_CAMPAIGN',
      page_size: '100',
      metrics: JSON.stringify([
        'spend',
        'impressions',
        'clicks',
        'conversion',
        'ctr',
        'cpc',
        'cpm',
        'campaign_name',
      ]),
      dimensions: JSON.stringify(['campaign_id']),
    });

    const response = await fetch(
      `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/report/integrated/get/?${params}`,
      {
        method: 'GET',
        headers: {
          'Access-Token': accessToken,
        },
      }
    );

    const result = await response.json();

    if (result.code === 0 && result.data?.list) {
      return {
        success: true,
        campaigns: result.data.list.map((item: {
          dimensions: { campaign_id: string };
          metrics: {
            campaign_name: string;
            spend: string;
            impressions: string;
            clicks: string;
            conversion: string;
            ctr: string;
            cpc: string;
            cpm: string;
          };
        }) => ({
          campaign_id: item.dimensions.campaign_id,
          campaign_name: item.metrics.campaign_name,
          spend: parseFloat(item.metrics.spend) || 0,
          impressions: parseInt(item.metrics.impressions) || 0,
          clicks: parseInt(item.metrics.clicks) || 0,
          conversions: parseInt(item.metrics.conversion) || 0,
          ctr: parseFloat(item.metrics.ctr) || 0,
          cpc: parseFloat(item.metrics.cpc) || 0,
          cpm: parseFloat(item.metrics.cpm) || 0,
        })),
      };
    }

    return {
      success: false,
      error: result.message || 'Failed to get campaign metrics',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Refresh TikTok access token
 * TikTok tokens expire after 24 hours and need to be refreshed
 */
export async function refreshTikTokToken(
  refreshToken: string,
  appId: string,
  appSecret: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    const response = await fetch(
      `https://business-api.tiktok.com/open_api/${TIKTOK_API_VERSION}/oauth2/refresh_token/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          secret: appSecret,
          refresh_token: refreshToken,
        }),
      }
    );

    const result = await response.json();

    if (result.code === 0 && result.data?.access_token) {
      return {
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
        expiresIn: result.data.expires_in || 86400, // Default 24 hours
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to refresh TikTok token:', error);
    return null;
  }
}
