import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/admin';

// ===========================================
// PIXLY - Shopify Integration
// OAuth, order import, and revenue sync
// ===========================================

const SHOPIFY_API_VERSION = '2024-01';

// ============ TYPES ============

export interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
}

export interface ShopifyOrder {
  id: number;
  order_number: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  cancelled_at: string | null;
  financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  fulfillment_status: 'fulfilled' | 'partial' | 'restocked' | null;
  currency: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  total_line_items_price: string;
  customer: ShopifyCustomer | null;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress | null;
  billing_address: ShopifyAddress | null;
  landing_site: string | null;
  referring_site: string | null;
  source_name: string;
  tags: string;
  note: string | null;
  discount_codes: Array<{
    code: string;
    amount: string;
    type: string;
  }>;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  total_spent: string;
  created_at: string;
}

export interface ShopifyLineItem {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  name: string;
}

export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  city: string;
  province: string;
  country: string;
  country_code: string;
  zip: string;
}

interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

interface ShopifyShopResponse {
  shop: {
    id: number;
    name: string;
    email: string;
    domain: string;
    myshopify_domain: string;
    currency: string;
    timezone: string;
  };
}

// ============ OAUTH ============

/**
 * Generate the Shopify OAuth authorization URL
 * Redirects the user to Shopify to grant access
 */
export function getShopifyAuthUrl(shop: string, redirectUri: string): string {
  const apiKey = process.env.SHOPIFY_API_KEY;

  if (!apiKey) {
    throw new Error('SHOPIFY_API_KEY is not configured');
  }

  // Sanitize shop domain
  const sanitizedShop = sanitizeShopDomain(shop);
  const scopes = 'read_orders,read_products';

  // State will be set by the caller (workspaceId)
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
  });

  return `https://${sanitizedShop}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange the OAuth authorization code for an access token
 */
export async function exchangeShopifyCode(
  shop: string,
  code: string
): Promise<ShopifyTokenResponse> {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('SHOPIFY_API_KEY and SHOPIFY_API_SECRET must be configured');
  }

  const sanitizedShop = sanitizeShopDomain(shop);

  const response = await fetch(
    `https://${sanitizedShop}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify token exchange failed (${response.status}): ${errorText}`);
  }

  const data: ShopifyTokenResponse = await response.json();
  return data;
}

// ============ ORDERS ============

/**
 * Fetch orders from Shopify Admin API within a date range
 * Handles pagination via Link header (cursor-based)
 */
export async function fetchShopifyOrders(
  shop: string,
  accessToken: string,
  dateRange: { start: Date; end: Date }
): Promise<ShopifyOrder[]> {
  const sanitizedShop = sanitizeShopDomain(shop);
  const allOrders: ShopifyOrder[] = [];

  // Shopify expects ISO 8601 format for date filters
  const createdAtMin = dateRange.start.toISOString();
  const createdAtMax = dateRange.end.toISOString();

  const params = new URLSearchParams({
    status: 'any',
    created_at_min: createdAtMin,
    created_at_max: createdAtMax,
    limit: '250', // Maximum per page
    fields: [
      'id', 'order_number', 'name', 'email', 'created_at', 'updated_at',
      'closed_at', 'cancelled_at', 'financial_status', 'fulfillment_status',
      'currency', 'total_price', 'subtotal_price', 'total_tax', 'total_discounts',
      'total_line_items_price', 'customer', 'line_items', 'shipping_address',
      'billing_address', 'landing_site', 'referring_site', 'source_name',
      'tags', 'note', 'discount_codes',
    ].join(','),
  });

  let url: string | null =
    `https://${sanitizedShop}/admin/api/${SHOPIFY_API_VERSION}/orders.json?${params.toString()}`;

  while (url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify orders fetch failed (${response.status}): ${errorText}`);
    }

    const data: ShopifyOrdersResponse = await response.json();
    allOrders.push(...data.orders);

    // Handle cursor-based pagination via Link header
    url = getNextPageUrl(response.headers.get('link'));
  }

  return allOrders;
}

/**
 * Fetch shop info (name, domain, currency)
 */
export async function fetchShopInfo(
  shop: string,
  accessToken: string
): Promise<ShopifyShopResponse['shop']> {
  const sanitizedShop = sanitizeShopDomain(shop);

  const response = await fetch(
    `https://${sanitizedShop}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
    {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify shop info fetch failed (${response.status}): ${errorText}`);
  }

  const data: ShopifyShopResponse = await response.json();
  return data.shop;
}

// ============ REVENUE SYNC ============

/**
 * Import Shopify orders as conversions into Firestore
 * Deduplicates by Shopify order ID to prevent double-counting
 *
 * Returns count of imported and skipped orders
 */
export async function syncShopifyRevenue(
  workspaceId: string,
  orders: ShopifyOrder[]
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  // Filter to only paid/partially_paid orders (skip pending, refunded, voided)
  const validOrders = orders.filter(
    (order) =>
      !order.cancelled_at &&
      (order.financial_status === 'paid' || order.financial_status === 'partially_paid')
  );

  // Process in batches of 500 for Firestore write efficiency
  const batchSize = 500;

  for (let i = 0; i < validOrders.length; i += batchSize) {
    const batch = validOrders.slice(i, i + batchSize);
    const writeBatch = adminDb.batch();
    let batchImported = 0;

    for (const order of batch) {
      const externalId = `shopify_${order.id}`;

      // Check if this order has already been imported (deduplicate)
      const existing = await adminDb
        .collection('conversions')
        .where('workspaceId', '==', workspaceId)
        .where('externalId', '==', externalId)
        .limit(1)
        .get();

      if (!existing.empty) {
        skipped++;
        continue;
      }

      // Hash the customer email for privacy
      const hashedEmail = order.email
        ? hashEmail(order.email)
        : order.customer?.email
          ? hashEmail(order.customer.email)
          : null;

      // Map Shopify order to Pixly conversion document
      const conversionRef = adminDb.collection('conversions').doc();
      const conversionData = {
        workspaceId,
        externalId,
        source: 'shopify',
        eventId: `shopify_order_${order.id}`,
        type: 'purchase' as const,
        value: parseFloat(order.total_price),
        currency: order.currency,
        timestamp: new Date(order.created_at),
        hashedEmail,
        metadata: {
          shopifyOrderId: order.id,
          shopifyOrderNumber: order.order_number,
          shopifyOrderName: order.name,
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          subtotalPrice: parseFloat(order.subtotal_price),
          totalTax: parseFloat(order.total_tax),
          totalDiscounts: parseFloat(order.total_discounts),
          itemCount: order.line_items.reduce((sum, item) => sum + item.quantity, 0),
          landingSite: order.landing_site,
          referringSite: order.referring_site,
          sourceName: order.source_name,
          tags: order.tags,
          discountCodes: order.discount_codes.map((dc) => dc.code),
          customerCountry: order.shipping_address?.country_code ||
            order.billing_address?.country_code || null,
          customerCity: order.shipping_address?.city ||
            order.billing_address?.city || null,
        },
        // Attribution will be resolved separately by the attribution engine
        attribution: null,
        synced: {
          meta: { synced: false, syncedAt: null, error: null },
          google: { synced: false, syncedAt: null, error: null },
        },
      };

      writeBatch.set(conversionRef, conversionData);
      batchImported++;
    }

    // Commit the batch
    if (batchImported > 0) {
      await writeBatch.commit();
    }

    imported += batchImported;
  }

  return { imported, skipped };
}

// ============ HMAC VERIFICATION ============

/**
 * Verify the Shopify HMAC signature on OAuth callbacks
 * Prevents CSRF and ensures the request came from Shopify
 */
export function verifyShopifyHmac(
  queryParams: Record<string, string>,
  secret: string
): boolean {
  const hmac = queryParams['hmac'];
  if (!hmac) return false;

  // Build the message from all params except hmac
  const entries = Object.entries(queryParams)
    .filter(([key]) => key !== 'hmac')
    .sort(([a], [b]) => a.localeCompare(b));

  const message = entries
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const computedHmac = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'hex'),
      Buffer.from(computedHmac, 'hex')
    );
  } catch {
    return false;
  }
}

// ============ HELPERS ============

/**
 * Hash an email address with SHA-256 for privacy
 * Normalizes: lowercase, trim whitespace, then hash
 */
function hashEmail(email: string): string {
  const normalized = email.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Sanitize and validate a Shopify store domain
 * Accepts: "mystore", "mystore.myshopify.com", "https://mystore.myshopify.com"
 * Returns: "mystore.myshopify.com"
 */
function sanitizeShopDomain(shop: string): string {
  let domain = shop.trim().toLowerCase();

  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, '');

  // Remove trailing slash
  domain = domain.replace(/\/$/, '');

  // Remove /admin path if present
  domain = domain.replace(/\/admin.*$/, '');

  // Add .myshopify.com if not present
  if (!domain.includes('.')) {
    domain = `${domain}.myshopify.com`;
  }

  // Validate the domain format
  const shopifyDomainRegex = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
  if (!shopifyDomainRegex.test(domain)) {
    throw new Error(`Invalid Shopify domain: ${domain}`);
  }

  return domain;
}

/**
 * Parse the Link header for cursor-based pagination
 * Returns the URL for the next page, or null if no more pages
 */
function getNextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;

  // Link header format: <url>; rel="next", <url>; rel="previous"
  const links = linkHeader.split(',');

  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    if (match) {
      return match[1];
    }
  }

  return null;
}
