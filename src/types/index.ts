// ===========================================
// PIXLY - Core Types
// ===========================================

// ============ USER & AUTH ============
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
  updatedAt: Date;
  plan: Plan;
  workspaceIds: string[];
  onboardingCompleted?: boolean;
  termsAcceptedAt?: Date;
  termsVersion?: string;
}

export type Plan = 'free' | 'starter' | 'growth' | 'scale' | 'unlimited';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  pixelId: string;
  createdAt: Date;
  settings: WorkspaceSettings;
  integrations: IntegrationStatus;
}

export interface WorkspaceSettings {
  timezone: string;
  currency: string;
  startDate: string; // ISO date string — tracking start date
  attributionWindow: number; // days
  defaultAttributionModel: AttributionModel;
  websiteUrl?: string;
}

export interface IntegrationStatus {
  meta: IntegrationState;
  google: IntegrationState;
  tiktok: IntegrationState;
  stripe: IntegrationState;
  shopify: IntegrationState;
  hubspot: IntegrationState;
}

export interface IntegrationState {
  connected: boolean;
  connectedAt: Date | null;
  accountId: string | null;
  accountName: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}

// ============ TRACKING ============
export interface TrackingEvent {
  id: string;
  pixelId: string;
  workspaceId: string;
  eventType: EventType;
  eventName: string;
  timestamp: Date;
  sessionId: string;
  fpid: string; // First-party ID

  // Click IDs
  clickIds: ClickIds;

  // User identification
  hashedEmail: string | null;
  userId: string | null;

  // Context
  context: EventContext;

  // Custom properties
  properties: Record<string, unknown>;

  // Revenue (for conversion events)
  value: number | null;
  currency: string | null;

  // Attribution
  attributed: boolean;
  attributedTo: AttributionResult | null;
}

export type EventType =
  | 'page_view'
  | 'identify'
  | 'lead'
  | 'purchase'
  | 'add_to_cart'
  | 'initiate_checkout'
  | 'custom';

export interface ClickIds {
  gclid: string | null;    // Google
  fbclid: string | null;   // Meta
  ttclid: string | null;   // TikTok
  li_fat_id: string | null; // LinkedIn
  msclkid: string | null;  // Microsoft/Bing
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

export interface EventContext {
  url: string;
  referrer: string;
  userAgent: string;
  ip: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  device: DeviceInfo;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
}

// ============ SESSIONS ============
export interface Session {
  id: string;
  pixelId: string;
  workspaceId: string;
  fpid: string;
  startedAt: Date;
  lastActivityAt: Date;
  landingPage: string;
  referrer: string;
  clickIds: ClickIds;
  events: string[]; // Event IDs
  converted: boolean;
  conversionValue: number | null;
}

// ============ ATTRIBUTION ============
export type AttributionModel =
  | 'last_click'
  | 'first_click'
  | 'linear'
  | 'time_decay'
  | 'position_based';

export interface AttributionResult {
  model: AttributionModel;
  touchpoints: Touchpoint[];
  conversionId: string;
  conversionValue: number;
  attributedAt: Date;
}

export interface Touchpoint {
  sessionId: string;
  channel: Channel;
  source: string;
  medium: string;
  campaign: string | null;
  clickId: string | null;
  timestamp: Date;
  credit: number; // 0-1, percentage of conversion credit
}

export type Channel =
  | 'meta'
  | 'google'
  | 'tiktok'
  | 'linkedin'
  | 'bing'
  | 'organic'
  | 'direct'
  | 'email'
  | 'referral'
  | 'other';

// ============ CONVERSIONS ============
export interface Conversion {
  id: string;
  workspaceId: string;
  eventId: string;
  type: 'lead' | 'purchase';
  value: number;
  currency: string;
  timestamp: Date;
  attribution: AttributionResult;
  synced: ConversionSyncStatus;
}

export interface ConversionSyncStatus {
  meta: SyncState;
  google: SyncState;
}

export interface SyncState {
  synced: boolean;
  syncedAt: Date | null;
  error: string | null;
}

// ============ METRICS ============
export interface DashboardMetrics {
  overview: OverviewMetrics;
  byChannel: Record<Channel, ChannelMetrics>;
  byCampaign: CampaignMetrics[];
  byCountry?: GeoMetrics[];
  conversions: Conversion[];
  revenueByDay?: Array<{ date: string; revenue: number; conversions: number }>;
}

export interface GeoMetrics {
  countryCode: string;
  countryName: string;
  conversions: number;
  revenue: number;
  visitors: number;
  conversionRate: number;
  roas: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface OverviewMetrics {
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  roas: number;
  cpa: number;
  conversionRate: number;
  aov: number; // Average Order Value
}

export interface ChannelMetrics {
  channel: Channel;
  spend: number;
  revenue: number;
  conversions: number;
  roas: number;
  cpa: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  channel: Channel;
  spend: number;
  revenue: number;
  conversions: number;
  roas: number;
  cpa: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface ConversionMetrics {
  total: number;
  byType: {
    leads: number;
    purchases: number;
  };
  byDay: {
    date: string;
    count: number;
    value: number;
  }[];
}

// ============ API RESPONSES ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============ PIXEL PAYLOAD ============
export interface PixelPayload {
  pixelId: string;
  event: string;
  properties?: Record<string, unknown>;
  fpid: string;
  sessionId: string;
  clickIds: Partial<ClickIds>;
  context: Partial<EventContext>;
  timestamp: number;
  hashedEmail?: string;
}

// ============ TEAM & ROLES ============
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface WorkspaceMember {
  userId: string;
  email: string;
  displayName: string | null;
  role: WorkspaceRole;
  joinedAt: Date;
  invitedBy: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}

// ============ FUNNEL ============
export interface FunnelStep {
  name: string;
  eventType: EventType;
  count: number;
  value: number;
  dropoffRate: number;
  conversionRate: number;
}

export interface FunnelData {
  steps: FunnelStep[];
  totalEntries: number;
  totalCompletions: number;
  overallConversionRate: number;
  byChannel: Record<Channel, FunnelStep[]>;
}

// ============ AUDIENCE SEGMENTATION ============
export interface AudienceSegment {
  id: string;
  name: string;
  dimension: 'device' | 'country' | 'browser' | 'os' | 'channel' | 'campaign';
  value: string;
  visitors: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  aov: number;
}

// ============ SCHEDULED REPORTS ============
export interface ScheduledReport {
  id: string;
  workspaceId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  metrics: string[];
  enabled: boolean;
  lastSentAt: Date | null;
  nextSendAt: Date;
  createdAt: Date;
}

// ============ PUBLIC API ============
export interface ApiKey {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  prefix: string;
  permissions: ApiPermission[];
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

export type ApiPermission = 'read:metrics' | 'read:conversions' | 'read:campaigns' | 'write:events' | 'read:reports';

// ============ WEBHOOKS (Zapier/Make) ============
export interface WebhookEndpoint {
  id: string;
  workspaceId: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  active: boolean;
  createdAt: Date;
  lastTriggeredAt: Date | null;
  failureCount: number;
}

export type WebhookEventType =
  | 'conversion.created'
  | 'conversion.synced'
  | 'alert.triggered'
  | 'integration.connected'
  | 'integration.disconnected';

// ============ DATA EXPORT ============
export interface ExportConfig {
  id: string;
  workspaceId: string;
  destination: 'bigquery' | 'snowflake' | 'redshift' | 's3';
  connectionString: string;
  schedule: 'hourly' | 'daily' | 'weekly';
  tables: string[];
  enabled: boolean;
  lastExportAt: Date | null;
  createdAt: Date;
}

// ============ i18n ============
export type Locale = 'fr' | 'en';

export interface LocaleConfig {
  locale: Locale;
  currency: string;
  dateFormat: string;
  numberFormat: string;
}
