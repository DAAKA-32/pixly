import type { Conversion } from '@/types';

// ===========================================
// PIXLY - Meta Conversions API Integration
// ===========================================

interface MetaEventPayload {
  event_name: string;
  event_time: number;
  action_source: 'website';
  event_source_url?: string;
  user_data: {
    em?: string[]; // Hashed email
    ph?: string[]; // Hashed phone
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID cookie
    fbp?: string; // Facebook browser ID cookie
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
  };
}

interface MetaAPIResponse {
  events_received: number;
  messages?: string[];
  fbtrace_id: string;
}

export async function sendConversionToMeta(
  conversion: Conversion,
  pixelId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  const apiVersion = 'v18.0';
  const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events`;

  // Build event payload
  const eventPayload: MetaEventPayload = {
    event_name: conversion.type === 'purchase' ? 'Purchase' : 'Lead',
    event_time: Math.floor(conversion.timestamp.getTime() / 1000),
    action_source: 'website',
    user_data: {},
    custom_data: {
      currency: conversion.currency,
      value: conversion.value,
    },
  };

  // Add user data if available
  const touchpoint = conversion.attribution?.touchpoints[0];
  if (touchpoint?.clickId && touchpoint.channel === 'meta') {
    eventPayload.user_data.fbc = `fb.1.${Date.now()}.${touchpoint.clickId}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [eventPayload],
        access_token: accessToken,
      }),
    });

    const result: MetaAPIResponse = await response.json();

    if (result.events_received > 0) {
      return { success: true };
    }

    return {
      success: false,
      error: result.messages?.join(', ') || 'No events received',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send to Meta CAPI',
    };
  }
}

export async function batchSendToMeta(
  conversions: Conversion[],
  pixelId: string,
  accessToken: string
): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
  const results = {
    successCount: 0,
    errorCount: 0,
    errors: [] as string[],
  };

  // Meta CAPI supports batches of up to 1000 events
  const batchSize = 1000;
  const batches = [];

  for (let i = 0; i < conversions.length; i += batchSize) {
    batches.push(conversions.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const events: MetaEventPayload[] = batch.map((conversion) => ({
      event_name: conversion.type === 'purchase' ? 'Purchase' : 'Lead',
      event_time: Math.floor(conversion.timestamp.getTime() / 1000),
      action_source: 'website' as const,
      user_data: {},
      custom_data: {
        currency: conversion.currency,
        value: conversion.value,
      },
    }));

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pixelId}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: events,
            access_token: accessToken,
          }),
        }
      );

      const result: MetaAPIResponse = await response.json();
      results.successCount += result.events_received;
      results.errorCount += batch.length - result.events_received;

      if (result.messages) {
        results.errors.push(...result.messages);
      }
    } catch (error: any) {
      results.errorCount += batch.length;
      results.errors.push(error.message);
    }
  }

  return results;
}
