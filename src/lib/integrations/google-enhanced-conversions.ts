import crypto from 'crypto';

// ===========================================
// PIXLY - Google Enhanced Conversions API
// ===========================================

export interface EnhancedConversionData {
  gclid?: string;
  conversionDateTime: string;
  conversionValue: number;
  currencyCode: string;
  hashedEmail?: string;
}

interface GoogleEnhancedConversionPayload {
  conversionAdjustments: Array<{
    adjustmentType: 'ENHANCEMENT';
    gclidDateTimePair: {
      gclid: string;
      conversionDateTime: string;
    };
    userIdentifiers?: Array<{
      hashedEmail?: string;
      hashedPhoneNumber?: string;
      addressInfo?: {
        hashedFirstName?: string;
        hashedLastName?: string;
        hashedStreetAddress?: string;
        city?: string;
        state?: string;
        countryCode?: string;
        postalCode?: string;
      };
    }>;
    conversionAction: string;
    adjustmentDateTime: string;
    restatementValue?: {
      adjustedValue: number;
      currency: string;
    };
  }>;
  partialFailure: boolean;
}

/**
 * Hash user data with SHA-256 for Enhanced Conversions
 * Google requires: lowercase, trim whitespace, then hash
 */
function hashSHA256(value: string): string {
  if (!value) return '';
  const normalized = value.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Format datetime for Google Ads API (RFC 3339)
 * Format: YYYY-MM-DD HH:MM:SS+00:00
 */
function formatGoogleDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  const minute = pad(date.getUTCMinutes());
  const second = pad(date.getUTCSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}+00:00`;
}

/**
 * Send Enhanced Conversion to Google Ads
 */
export async function sendEnhancedConversionToGoogle(
  conversion: EnhancedConversionData,
  customerId: string,
  conversionActionId: string,
  accessToken: string,
  developerToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!conversion.gclid) {
    return {
      success: false,
      error: 'No gclid found for this conversion',
    };
  }

  // Build user identifiers from hashed email if available
  const userIdentifiers: Array<{ hashedEmail?: string }> = [];
  if (conversion.hashedEmail) {
    const hashed = conversion.hashedEmail.length === 64
      ? conversion.hashedEmail
      : hashSHA256(conversion.hashedEmail);
    userIdentifiers.push({ hashedEmail: hashed });
  }

  // Build conversion adjustment payload
  const payload: GoogleEnhancedConversionPayload = {
    conversionAdjustments: [
      {
        adjustmentType: 'ENHANCEMENT',
        gclidDateTimePair: {
          gclid: conversion.gclid,
          conversionDateTime: formatGoogleDateTime(
            new Date(conversion.conversionDateTime)
          ),
        },
        conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
        adjustmentDateTime: formatGoogleDateTime(new Date()),
        restatementValue: {
          adjustedValue: conversion.conversionValue,
          currency: conversion.currencyCode,
        },
        ...(userIdentifiers.length > 0 && { userIdentifiers }),
      },
    ],
    partialFailure: true,
  };

  try {
    const apiVersion = 'v16';
    const url = `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/conversionAdjustments:upload`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || 'Failed to upload conversion',
      };
    }

    // Check for partial failures
    if (result.partialFailureError) {
      return {
        success: false,
        error: result.partialFailureError.message || 'Partial failure',
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send Enhanced Conversion to Google',
    };
  }
}

/**
 * Batch send Enhanced Conversions to Google
 */
export async function batchSendToGoogle(
  conversions: EnhancedConversionData[],
  customerId: string,
  conversionActionId: string,
  accessToken: string,
  developerToken: string
): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
  const results = {
    successCount: 0,
    errorCount: 0,
    errors: [] as string[],
  };

  // Google Ads API supports up to 2000 conversions per request
  const batchSize = 2000;
  const batches: EnhancedConversionData[][] = [];

  for (let i = 0; i < conversions.length; i += batchSize) {
    batches.push(conversions.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const conversionsToSend = batch.filter((c) => !!c.gclid);

    if (conversionsToSend.length === 0) continue;

    const conversionAdjustments = conversionsToSend.map((conversion) => {
      const userIdentifiers: Array<{ hashedEmail?: string }> = [];
      if (conversion.hashedEmail) {
        const hashed = conversion.hashedEmail.length === 64
          ? conversion.hashedEmail
          : hashSHA256(conversion.hashedEmail);
        userIdentifiers.push({ hashedEmail: hashed });
      }

      return {
        adjustmentType: 'ENHANCEMENT' as const,
        gclidDateTimePair: {
          gclid: conversion.gclid!,
          conversionDateTime: formatGoogleDateTime(
            new Date(conversion.conversionDateTime)
          ),
        },
        conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
        adjustmentDateTime: formatGoogleDateTime(new Date()),
        restatementValue: {
          adjustedValue: conversion.conversionValue,
          currency: conversion.currencyCode,
        },
        ...(userIdentifiers.length > 0 && { userIdentifiers }),
      };
    });

    const payload = {
      conversionAdjustments,
      partialFailure: true,
    };

    try {
      const apiVersion = 'v16';
      const url = `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/conversionAdjustments:upload`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && !result.partialFailureError) {
        results.successCount += conversionsToSend.length;
      } else {
        results.errorCount += conversionsToSend.length;
        results.errors.push(
          result.error?.message ||
            result.partialFailureError?.message ||
            'Unknown error'
        );
      }
    } catch (error: any) {
      results.errorCount += conversionsToSend.length;
      results.errors.push(error.message);
    }
  }

  return results;
}
