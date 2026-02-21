// ===========================================
// PIXLY - HubSpot CRM Integration (Phase 3.5)
// OAuth, contact fetching, and conversion sync
// ===========================================

const HUBSPOT_AUTH_BASE = 'https://app.hubspot.com/oauth/authorize';
const HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token';
const HUBSPOT_API_BASE = 'https://api.hubapi.com';

// ============ TYPES ============

export interface HubSpotContact {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  company: string | null;
  lifecyclestage: string | null;
  createdate: string;
  lastmodifieddate: string;
}

export interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface HubSpotContactsResponse {
  results: Array<{
    id: string;
    properties: Record<string, string | null>;
    createdAt: string;
    updatedAt: string;
  }>;
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

interface HubSpotNoteResponse {
  id: string;
  properties: Record<string, string | null>;
}

// ============ OAUTH ============

/**
 * Generate the HubSpot OAuth authorization URL.
 * Scopes: contacts + timeline for reading contacts and posting notes.
 */
export function getHubSpotAuthUrl(redirectUri: string): string {
  const clientId = process.env.HUBSPOT_CLIENT_ID;

  if (!clientId) {
    throw new Error('HUBSPOT_CLIENT_ID is not configured');
  }

  const scopes = [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.objects.deals.read',
    'crm.objects.deals.write',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
  });

  return `${HUBSPOT_AUTH_BASE}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens.
 */
export async function exchangeHubSpotCode(
  code: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'HUBSPOT_CLIENT_ID, HUBSPOT_CLIENT_SECRET, and HUBSPOT_REDIRECT_URI must be configured'
    );
  }

  const response = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot token exchange failed (${response.status}): ${errorText}`
    );
  }

  const data: HubSpotTokenResponse = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

/**
 * Refresh an expired HubSpot access token.
 */
export async function refreshHubSpotToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'HUBSPOT_CLIENT_ID and HUBSPOT_CLIENT_SECRET must be configured'
    );
  }

  const response = await fetch(HUBSPOT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot token refresh failed (${response.status}): ${errorText}`
    );
  }

  const data: HubSpotTokenResponse = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

// ============ CONTACTS ============

/**
 * Fetch contacts from HubSpot CRM (API v3).
 * Supports pagination via the `after` cursor.
 *
 * @param accessToken - OAuth access token
 * @param limit - Maximum contacts to return (default 100, max 100 per page)
 */
export async function fetchHubSpotContacts(
  accessToken: string,
  limit: number = 100
): Promise<HubSpotContact[]> {
  const contacts: HubSpotContact[] = [];
  let after: string | undefined;
  const pageSize = Math.min(limit, 100);

  const properties = [
    'email',
    'firstname',
    'lastname',
    'company',
    'lifecyclestage',
    'createdate',
    'lastmodifieddate',
  ];

  while (contacts.length < limit) {
    const params = new URLSearchParams({
      limit: pageSize.toString(),
      properties: properties.join(','),
    });

    if (after) {
      params.set('after', after);
    }

    const url = `${HUBSPOT_API_BASE}/crm/v3/objects/contacts?${params.toString()}`;

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
        `HubSpot contacts fetch failed (${response.status}): ${errorText}`
      );
    }

    const data: HubSpotContactsResponse = await response.json();

    for (const result of data.results) {
      contacts.push({
        id: result.id,
        email: result.properties.email || '',
        firstname: result.properties.firstname ?? null,
        lastname: result.properties.lastname ?? null,
        company: result.properties.company ?? null,
        lifecyclestage: result.properties.lifecyclestage ?? null,
        createdate: result.createdAt,
        lastmodifieddate: result.updatedAt,
      });
    }

    // Stop if no more pages or we have enough contacts
    if (!data.paging?.next?.after || contacts.length >= limit) {
      break;
    }

    after = data.paging.next.after;
  }

  return contacts.slice(0, limit);
}

// ============ CONVERSION SYNC ============

/**
 * Sync a Pixly conversion to HubSpot by creating or updating a contact
 * and attaching a note with the conversion details.
 *
 * Searches for an existing contact by email; creates one if not found.
 * Then creates an engagement note with the conversion value and type.
 */
export async function syncConversionToHubSpot(
  accessToken: string,
  conversion: { email: string; value: number; type: string }
): Promise<{ success: boolean }> {
  try {
    // Step 1: Search for existing contact by email
    let contactId = await findContactByEmail(accessToken, conversion.email);

    // Step 2: Create contact if not found
    if (!contactId) {
      contactId = await createContact(accessToken, conversion.email);
    }

    // Step 3: Create a note on the contact with conversion details
    await createConversionNote(accessToken, contactId, conversion);

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[HubSpot] Sync conversion failed:', message);
    return { success: false };
  }
}

// ============ INTERNAL HELPERS ============

/**
 * Search for a HubSpot contact by email address.
 * Returns the contact ID if found, null otherwise.
 */
async function findContactByEmail(
  accessToken: string,
  email: string
): Promise<string | null> {
  const response = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
        limit: 1,
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.results?.[0]?.id ?? null;
}

/**
 * Create a new HubSpot contact with an email address.
 * Returns the newly created contact ID.
 */
async function createContact(
  accessToken: string,
  email: string
): Promise<string> {
  const response = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          email,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HubSpot contact creation failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return data.id;
}

/**
 * Create an engagement note on a HubSpot contact
 * documenting the Pixly conversion.
 */
async function createConversionNote(
  accessToken: string,
  contactId: string,
  conversion: { value: number; type: string }
): Promise<void> {
  const noteBody = [
    `[Pixly] Conversion enregistrée`,
    `Type : ${conversion.type}`,
    `Valeur : ${conversion.value.toFixed(2)} EUR`,
    `Date : ${new Date().toISOString()}`,
  ].join('\n');

  // Create the note object
  const noteResponse = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/notes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          hs_timestamp: new Date().toISOString(),
          hs_note_body: noteBody,
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 202, // Note to Contact
              },
            ],
          },
        ],
      }),
    }
  );

  if (!noteResponse.ok) {
    const errorText = await noteResponse.text();
    console.error(
      `[HubSpot] Failed to create note (${noteResponse.status}): ${errorText}`
    );
  }
}
