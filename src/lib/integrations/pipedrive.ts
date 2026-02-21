// ===========================================
// PIXLY - Pipedrive CRM Integration (Phase 3.5)
// OAuth, deal fetching, and deal creation
// ===========================================

const PIPEDRIVE_AUTH_BASE = 'https://oauth.pipedrive.com/oauth/authorize';
const PIPEDRIVE_TOKEN_URL = 'https://oauth.pipedrive.com/oauth/token';

// ============ TYPES ============

export interface PipedriveDeal {
  id: number;
  title: string;
  value: number;
  currency: string;
  status: 'open' | 'won' | 'lost' | 'deleted';
  stage_id: number;
  pipeline_id: number;
  person_id: number | null;
  org_id: number | null;
  add_time: string;
  update_time: string;
  won_time: string | null;
  lost_time: string | null;
  expected_close_date: string | null;
}

export interface PipedriveTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  api_domain: string;
}

interface PipedriveDealsResponse {
  success: boolean;
  data: PipedriveDeal[] | null;
  additional_data?: {
    pagination?: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
      next_start?: number;
    };
  };
}

interface PipedriveDealCreateResponse {
  success: boolean;
  data: PipedriveDeal;
}

// ============ OAUTH ============

/**
 * Generate the Pipedrive OAuth authorization URL.
 */
export function getPipedriveAuthUrl(redirectUri: string): string {
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;

  if (!clientId) {
    throw new Error('PIPEDRIVE_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  return `${PIPEDRIVE_AUTH_BASE}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens.
 */
export async function exchangePipedriveCode(
  code: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;
  const clientSecret = process.env.PIPEDRIVE_CLIENT_SECRET;
  const redirectUri = process.env.PIPEDRIVE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'PIPEDRIVE_CLIENT_ID, PIPEDRIVE_CLIENT_SECRET, and PIPEDRIVE_REDIRECT_URI must be configured'
    );
  }

  // Pipedrive uses Basic auth for token exchange
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(PIPEDRIVE_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pipedrive token exchange failed (${response.status}): ${errorText}`
    );
  }

  const data: PipedriveTokenResponse = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

/**
 * Refresh an expired Pipedrive access token.
 */
export async function refreshPipedriveToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const clientId = process.env.PIPEDRIVE_CLIENT_ID;
  const clientSecret = process.env.PIPEDRIVE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'PIPEDRIVE_CLIENT_ID and PIPEDRIVE_CLIENT_SECRET must be configured'
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(PIPEDRIVE_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pipedrive token refresh failed (${response.status}): ${errorText}`
    );
  }

  const data: PipedriveTokenResponse = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

// ============ DEALS ============

/**
 * Fetch deals from Pipedrive API v1.
 * Handles pagination automatically.
 *
 * @param accessToken - OAuth access token
 * @param domain - The Pipedrive company domain (e.g. "mycompany" for mycompany.pipedrive.com)
 */
export async function fetchPipedriveDeals(
  accessToken: string,
  domain: string
): Promise<PipedriveDeal[]> {
  const allDeals: PipedriveDeal[] = [];
  let start = 0;
  const limit = 100;

  const baseUrl = `https://${sanitizeDomain(domain)}.pipedrive.com/api/v1`;

  while (true) {
    const params = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
    });

    const url = `${baseUrl}/deals?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Pipedrive deals fetch failed (${response.status}): ${errorText}`
      );
    }

    const data: PipedriveDealsResponse = await response.json();

    if (!data.success || !data.data) {
      break;
    }

    allDeals.push(...data.data);

    // Check if there are more pages
    if (!data.additional_data?.pagination?.more_items_in_collection) {
      break;
    }

    start = data.additional_data.pagination.next_start ?? start + limit;
  }

  return allDeals;
}

/**
 * Create a new deal in Pipedrive.
 * Optionally links to an existing person (contact).
 *
 * @param accessToken - OAuth access token
 * @param domain - The Pipedrive company domain
 * @param deal - Deal properties: title, value, and optional personId
 */
export async function createPipedriveDeal(
  accessToken: string,
  domain: string,
  deal: { title: string; value: number; personId?: number }
): Promise<{ success: boolean }> {
  const baseUrl = `https://${sanitizeDomain(domain)}.pipedrive.com/api/v1`;

  const body: Record<string, unknown> = {
    title: deal.title,
    value: deal.value,
    currency: 'EUR',
  };

  if (deal.personId) {
    body.person_id = deal.personId;
  }

  try {
    const response = await fetch(`${baseUrl}/deals`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Pipedrive] Deal creation failed (${response.status}): ${errorText}`
      );
      return { success: false };
    }

    const data: PipedriveDealCreateResponse = await response.json();
    return { success: data.success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Pipedrive] Deal creation error:', message);
    return { success: false };
  }
}

// ============ PERSONS (CONTACTS) ============

/**
 * Search for a Pipedrive person by email.
 * Returns the person ID if found, null otherwise.
 */
export async function findPipedrivePersonByEmail(
  accessToken: string,
  domain: string,
  email: string
): Promise<number | null> {
  const baseUrl = `https://${sanitizeDomain(domain)}.pipedrive.com/api/v1`;

  const params = new URLSearchParams({
    term: email,
    item_types: 'person',
    fields: 'email',
    limit: '1',
  });

  const response = await fetch(
    `${baseUrl}/itemSearch?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const items = data.data?.items;

  if (!items || items.length === 0) {
    return null;
  }

  return items[0].item?.id ?? null;
}

/**
 * Create a new Pipedrive person (contact).
 * Returns the person ID.
 */
export async function createPipedrivePerson(
  accessToken: string,
  domain: string,
  person: { name: string; email: string }
): Promise<number> {
  const baseUrl = `https://${sanitizeDomain(domain)}.pipedrive.com/api/v1`;

  const response = await fetch(`${baseUrl}/persons`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: person.name,
      email: [{ value: person.email, primary: true }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pipedrive person creation failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return data.data.id;
}

// ============ CONVERSION SYNC ============

/**
 * Sync a Pixly conversion to Pipedrive by creating a deal.
 * Searches for an existing person by email; creates one if not found.
 */
export async function syncConversionToPipedrive(
  accessToken: string,
  domain: string,
  conversion: { email: string; value: number; type: string }
): Promise<{ success: boolean }> {
  try {
    // Find or create person
    let personId = await findPipedrivePersonByEmail(
      accessToken,
      domain,
      conversion.email
    );

    if (!personId) {
      personId = await createPipedrivePerson(accessToken, domain, {
        name: conversion.email.split('@')[0],
        email: conversion.email,
      });
    }

    // Create a deal for the conversion
    const result = await createPipedriveDeal(accessToken, domain, {
      title: `[Pixly] ${conversion.type === 'purchase' ? 'Achat' : 'Lead'} — ${conversion.value.toFixed(2)} EUR`,
      value: conversion.value,
      personId,
    });

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Pipedrive] Sync conversion failed:', message);
    return { success: false };
  }
}

// ============ HELPERS ============

/**
 * Sanitize and validate a Pipedrive company domain.
 * Accepts: "mycompany", "mycompany.pipedrive.com"
 * Returns: "mycompany" (the subdomain portion only)
 */
function sanitizeDomain(domain: string): string {
  let clean = domain.trim().toLowerCase();

  // Remove protocol if present
  clean = clean.replace(/^https?:\/\//, '');

  // Remove .pipedrive.com suffix if present
  clean = clean.replace(/\.pipedrive\.com\/?$/, '');

  // Remove trailing slashes
  clean = clean.replace(/\/+$/, '');

  // Validate: should be alphanumeric with hyphens only
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(clean)) {
    throw new Error(`Invalid Pipedrive domain: ${domain}`);
  }

  return clean;
}
