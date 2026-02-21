// ===========================================
// PIXLY - IP Geolocation
// Enriches events with geographic data
// ===========================================

export interface GeoLocation {
  country: string | null; // ISO country code (US, FR, GB, etc.)
  countryName: string | null; // Full country name
  city: string | null;
  region: string | null; // State/Province
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface GeoProvider {
  name: string;
  lookup(ip: string): Promise<GeoLocation | null>;
}

/**
 * IP-API.com provider (free, no API key required)
 * Limit: 45 requests/minute
 * Good for development/MVP
 */
export class IPAPIProvider implements GeoProvider {
  name = 'ip-api.com';

  async lookup(ip: string): Promise<GeoLocation | null> {
    try {
      // Skip localhost/private IPs
      if (this.isPrivateIP(ip)) {
        return this.getDefaultLocation();
      }

      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,city,timezone,lat,lon`, {
        signal: AbortSignal.timeout(3000), // 3s timeout
      });

      if (!response.ok) return null;

      const data = await response.json();

      if (data.status !== 'success') return null;

      return {
        country: data.countryCode || null,
        countryName: data.country || null,
        city: data.city || null,
        region: data.region || null,
        timezone: data.timezone || null,
        latitude: data.lat || null,
        longitude: data.lon || null,
      };
    } catch (error) {
      console.error('[Geolocation] IP-API lookup failed:', error);
      return null;
    }
  }

  private isPrivateIP(ip: string): boolean {
    if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return true;
    }

    // Check private IP ranges
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    const first = parseInt(parts[0]);
    const second = parseInt(parts[1]);

    // 10.x.x.x
    if (first === 10) return true;

    // 172.16.x.x - 172.31.x.x
    if (first === 172 && second >= 16 && second <= 31) return true;

    // 192.168.x.x
    if (first === 192 && second === 168) return true;

    return false;
  }

  private getDefaultLocation(): GeoLocation {
    return {
      country: null,
      countryName: null,
      city: null,
      region: null,
      timezone: null,
      latitude: null,
      longitude: null,
    };
  }
}

/**
 * IPData.co provider (requires API key)
 * Limit: 1500 requests/day (free tier)
 * More accurate, production-ready
 */
export class IPDataProvider implements GeoProvider {
  name = 'ipdata.co';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async lookup(ip: string): Promise<GeoLocation | null> {
    try {
      const response = await fetch(
        `https://api.ipdata.co/${ip}?api-key=${this.apiKey}`,
        {
          signal: AbortSignal.timeout(3000),
        }
      );

      if (!response.ok) return null;

      const data = await response.json();

      return {
        country: data.country_code || null,
        countryName: data.country_name || null,
        city: data.city || null,
        region: data.region || null,
        timezone: data.time_zone?.name || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      };
    } catch (error) {
      console.error('[Geolocation] IPData lookup failed:', error);
      return null;
    }
  }
}

/**
 * MaxMind GeoIP2 provider (self-hosted database)
 * Most accurate, no rate limits, requires setup
 * This is a placeholder - would need maxmind package integration
 */
export class MaxMindProvider implements GeoProvider {
  name = 'maxmind';

  async lookup(ip: string): Promise<GeoLocation | null> {
    // TODO: Implement MaxMind database lookup
    // Requires: npm install @maxmind/geoip2-node
    console.warn('[Geolocation] MaxMind provider not yet implemented');
    return null;
  }
}

/**
 * In-memory cache for geolocation lookups
 * Reduces API calls for frequently seen IPs
 */
class GeoCache {
  private cache = new Map<string, { data: GeoLocation | null; timestamp: number }>();
  private ttl = 24 * 60 * 60 * 1000; // 24 hours

  get(ip: string): GeoLocation | null | undefined {
    const entry = this.cache.get(ip);
    if (!entry) return undefined;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(ip);
      return undefined;
    }

    return entry.data;
  }

  set(ip: string, data: GeoLocation | null): void {
    this.cache.set(ip, { data, timestamp: Date.now() });

    // Simple cache size management (keep last 10000)
    if (this.cache.size > 10000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Main geolocation service
 */
export class GeolocationService {
  private provider: GeoProvider;
  private cache = new GeoCache();

  constructor(provider: GeoProvider = new IPAPIProvider()) {
    this.provider = provider;
  }

  /**
   * Lookup IP address and return geographic data
   * Uses cache to reduce API calls
   */
  async lookup(ip: string): Promise<GeoLocation | null> {
    // Check cache first
    const cached = this.cache.get(ip);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch from provider
    const result = await this.provider.lookup(ip);

    // Cache result
    this.cache.set(ip, result);

    return result;
  }

  /**
   * Batch lookup multiple IPs
   */
  async lookupBatch(ips: string[]): Promise<Map<string, GeoLocation | null>> {
    const results = new Map<string, GeoLocation | null>();

    // Lookup all IPs in parallel
    await Promise.all(
      ips.map(async (ip) => {
        const geo = await this.lookup(ip);
        results.set(ip, geo);
      })
    );

    return results;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Change provider
   */
  setProvider(provider: GeoProvider): void {
    this.provider = provider;
    this.cache.clear(); // Clear cache when changing providers
  }
}

// Export singleton instance
export const geoService = new GeolocationService();

/**
 * Helper to format location as string
 */
export function formatLocation(geo: GeoLocation | null): string {
  if (!geo) return 'Unknown';

  const parts: string[] = [];
  if (geo.city) parts.push(geo.city);
  if (geo.region) parts.push(geo.region);
  if (geo.countryName) parts.push(geo.countryName);

  return parts.length > 0 ? parts.join(', ') : 'Unknown';
}
