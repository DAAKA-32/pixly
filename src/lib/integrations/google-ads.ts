import type { Conversion } from '@/types';

// ===========================================
// PIXLY - Google Ads Offline Conversion Import
// ===========================================

interface GoogleConversionPayload {
  gclid: string;
  conversion_action: string;
  conversion_date_time: string;
  conversion_value?: number;
  currency_code?: string;
}

interface GoogleAPIResponse {
  results?: Array<{
    gclid: string;
    conversion_action: string;
    conversion_date_time: string;
  }>;
  partialFailureError?: {
    message: string;
    details: Array<{ errors: Array<{ message: string }> }>;
  };
}

/**
 * Upload offline conversions to Google Ads
 * https://developers.google.com/google-ads/api/docs/conversions/upload-offline
 */
export async function sendConversionToGoogle(
  conversion: Conversion,
  customerId: string,
  conversionActionId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  // Find Google click ID from attribution
  const gclid = conversion.attribution?.touchpoints.find(
    (t) => t.channel === 'google' && t.clickId
  )?.clickId;

  if (!gclid) {
    return {
      success: false,
      error: 'No Google Click ID (gclid) found in conversion attribution',
    };
  }

  const conversionPayload: GoogleConversionPayload = {
    gclid,
    conversion_action: `customers/${customerId}/conversionActions/${conversionActionId}`,
    conversion_date_time: formatGoogleDateTime(conversion.timestamp),
    conversion_value: conversion.value,
    currency_code: conversion.currency || 'USD',
  };

  try {
    const url = `https://googleads.googleapis.com/v14/customers/${customerId}:uploadClickConversions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
      body: JSON.stringify({
        conversions: [conversionPayload],
        partialFailure: true,
      }),
    });

    const result: GoogleAPIResponse = await response.json();

    if (result.partialFailureError) {
      const errorMessages = result.partialFailureError.details
        .flatMap((d) => d.errors)
        .map((e) => e.message)
        .join(', ');

      return {
        success: false,
        error: errorMessages || result.partialFailureError.message,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send to Google Ads',
    };
  }
}

/**
 * Batch upload conversions to Google Ads
 */
export async function batchSendToGoogle(
  conversions: Conversion[],
  customerId: string,
  conversionActionId: string,
  accessToken: string
): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
  const results = {
    successCount: 0,
    errorCount: 0,
    errors: [] as string[],
  };

  // Filter conversions that have gclid
  const validConversions = conversions.filter((c) =>
    c.attribution?.touchpoints.some((t) => t.channel === 'google' && t.clickId)
  );

  if (validConversions.length === 0) {
    return {
      ...results,
      errorCount: conversions.length,
      errors: ['No conversions with Google Click IDs found'],
    };
  }

  const conversionPayloads: GoogleConversionPayload[] = validConversions.map((c) => {
    const gclid = c.attribution!.touchpoints.find(
      (t) => t.channel === 'google' && t.clickId
    )!.clickId!;

    return {
      gclid,
      conversion_action: `customers/${customerId}/conversionActions/${conversionActionId}`,
      conversion_date_time: formatGoogleDateTime(c.timestamp),
      conversion_value: c.value,
      currency_code: c.currency || 'USD',
    };
  });

  // Google supports up to 2000 conversions per request
  const batchSize = 2000;
  const batches = [];

  for (let i = 0; i < conversionPayloads.length; i += batchSize) {
    batches.push(conversionPayloads.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    try {
      const response = await fetch(
        `https://googleads.googleapis.com/v14/customers/${customerId}:uploadClickConversions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
          },
          body: JSON.stringify({
            conversions: batch,
            partialFailure: true,
          }),
        }
      );

      const result: GoogleAPIResponse = await response.json();

      if (result.results) {
        results.successCount += result.results.length;
      }

      if (result.partialFailureError) {
        const errorCount =
          batch.length - (result.results?.length || 0);
        results.errorCount += errorCount;
        results.errors.push(result.partialFailureError.message);
      }
    } catch (error: any) {
      results.errorCount += batch.length;
      results.errors.push(error.message);
    }
  }

  // Add count for conversions without gclid
  results.errorCount += conversions.length - validConversions.length;

  return results;
}

/**
 * Format date for Google Ads API
 * Format: yyyy-mm-dd hh:mm:ss+|-hh:mm
 */
function formatGoogleDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Get timezone offset
  const offset = -date.getTimezoneOffset();
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);
  const offsetSign = offset >= 0 ? '+' : '-';

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

/**
 * Refresh Google access token
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to refresh Google token:', error);
    return null;
  }
}
