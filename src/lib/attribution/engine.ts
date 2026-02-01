import type {
  AttributionModel,
  AttributionResult,
  Touchpoint,
  Session,
  Channel,
  ClickIds,
} from '@/types';

// ===========================================
// PIXLY - Attribution Engine
// ===========================================

interface TouchpointData {
  sessionId: string;
  channel: Channel;
  source: string;
  medium: string;
  campaign: string | null;
  clickId: string | null;
  timestamp: Date;
}

/**
 * Calculate attribution for a conversion based on the selected model
 */
export function calculateAttribution(
  touchpoints: TouchpointData[],
  conversionValue: number,
  model: AttributionModel
): AttributionResult {
  if (touchpoints.length === 0) {
    return createEmptyAttribution(conversionValue, model);
  }

  // Sort touchpoints by timestamp
  const sortedTouchpoints = [...touchpoints].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  let creditedTouchpoints: Touchpoint[];

  switch (model) {
    case 'first_click':
      creditedTouchpoints = applyFirstClickModel(sortedTouchpoints);
      break;
    case 'last_click':
      creditedTouchpoints = applyLastClickModel(sortedTouchpoints);
      break;
    case 'linear':
      creditedTouchpoints = applyLinearModel(sortedTouchpoints);
      break;
    case 'time_decay':
      creditedTouchpoints = applyTimeDecayModel(sortedTouchpoints);
      break;
    case 'position_based':
      creditedTouchpoints = applyPositionBasedModel(sortedTouchpoints);
      break;
    default:
      creditedTouchpoints = applyLastClickModel(sortedTouchpoints);
  }

  return {
    model,
    touchpoints: creditedTouchpoints,
    conversionId: '', // Will be set by caller
    conversionValue,
    attributedAt: new Date(),
  };
}

/**
 * First Click Attribution
 * 100% credit to the first touchpoint
 */
function applyFirstClickModel(touchpoints: TouchpointData[]): Touchpoint[] {
  return touchpoints.map((tp, index) => ({
    ...tp,
    credit: index === 0 ? 1 : 0,
  }));
}

/**
 * Last Click Attribution
 * 100% credit to the last touchpoint
 */
function applyLastClickModel(touchpoints: TouchpointData[]): Touchpoint[] {
  return touchpoints.map((tp, index) => ({
    ...tp,
    credit: index === touchpoints.length - 1 ? 1 : 0,
  }));
}

/**
 * Linear Attribution
 * Equal credit to all touchpoints
 */
function applyLinearModel(touchpoints: TouchpointData[]): Touchpoint[] {
  const credit = 1 / touchpoints.length;
  return touchpoints.map((tp) => ({
    ...tp,
    credit,
  }));
}

/**
 * Time Decay Attribution
 * More credit to touchpoints closer to conversion
 * Uses exponential decay with half-life of 7 days
 */
function applyTimeDecayModel(touchpoints: TouchpointData[]): Touchpoint[] {
  const halfLifeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  const lastTimestamp = touchpoints[touchpoints.length - 1].timestamp.getTime();

  // Calculate raw weights
  const weights = touchpoints.map((tp) => {
    const timeDiff = lastTimestamp - tp.timestamp.getTime();
    return Math.pow(2, -timeDiff / halfLifeMs);
  });

  // Normalize weights to sum to 1
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map((w) => w / totalWeight);

  return touchpoints.map((tp, index) => ({
    ...tp,
    credit: normalizedWeights[index],
  }));
}

/**
 * Position Based Attribution (U-Shaped)
 * 40% to first, 40% to last, 20% split among middle touchpoints
 */
function applyPositionBasedModel(touchpoints: TouchpointData[]): Touchpoint[] {
  if (touchpoints.length === 1) {
    return [{ ...touchpoints[0], credit: 1 }];
  }

  if (touchpoints.length === 2) {
    return [
      { ...touchpoints[0], credit: 0.5 },
      { ...touchpoints[1], credit: 0.5 },
    ];
  }

  const firstCredit = 0.4;
  const lastCredit = 0.4;
  const middleCount = touchpoints.length - 2;
  const middleCredit = 0.2 / middleCount;

  return touchpoints.map((tp, index) => {
    let credit: number;
    if (index === 0) {
      credit = firstCredit;
    } else if (index === touchpoints.length - 1) {
      credit = lastCredit;
    } else {
      credit = middleCredit;
    }
    return { ...tp, credit };
  });
}

/**
 * Create an empty attribution result for direct conversions
 */
function createEmptyAttribution(
  conversionValue: number,
  model: AttributionModel
): AttributionResult {
  return {
    model,
    touchpoints: [
      {
        sessionId: 'direct',
        channel: 'direct',
        source: 'direct',
        medium: 'none',
        campaign: null,
        clickId: null,
        timestamp: new Date(),
        credit: 1,
      },
    ],
    conversionId: '',
    conversionValue,
    attributedAt: new Date(),
  };
}

/**
 * Get touchpoints from sessions for a specific user/visitor
 */
export function extractTouchpointsFromSessions(
  sessions: Session[]
): TouchpointData[] {
  return sessions
    .filter((s) => s.clickIds && hasAnyClickId(s.clickIds))
    .map((session) => ({
      sessionId: session.id,
      channel: determineChannel(session.clickIds),
      source: session.clickIds.utm_source || determineChannel(session.clickIds),
      medium: session.clickIds.utm_medium || 'cpc',
      campaign: session.clickIds.utm_campaign || null,
      clickId: getFirstClickId(session.clickIds),
      timestamp: session.startedAt,
    }));
}

/**
 * Determine channel from click IDs
 */
function determineChannel(clickIds: ClickIds): Channel {
  if (clickIds.gclid) return 'google';
  if (clickIds.fbclid) return 'meta';
  if (clickIds.ttclid) return 'tiktok';
  if (clickIds.li_fat_id) return 'linkedin';
  if (clickIds.msclkid) return 'bing';

  const source = clickIds.utm_source?.toLowerCase();
  if (source === 'google') return 'google';
  if (source === 'facebook' || source === 'instagram' || source === 'meta') return 'meta';
  if (source === 'tiktok') return 'tiktok';
  if (source === 'linkedin') return 'linkedin';
  if (source === 'email' || source === 'newsletter') return 'email';

  return 'other';
}

/**
 * Check if session has any click ID
 */
function hasAnyClickId(clickIds: ClickIds): boolean {
  return !!(
    clickIds.gclid ||
    clickIds.fbclid ||
    clickIds.ttclid ||
    clickIds.li_fat_id ||
    clickIds.msclkid ||
    clickIds.utm_source
  );
}

/**
 * Get the first available click ID
 */
function getFirstClickId(clickIds: ClickIds): string | null {
  return (
    clickIds.gclid ||
    clickIds.fbclid ||
    clickIds.ttclid ||
    clickIds.li_fat_id ||
    clickIds.msclkid ||
    null
  );
}

/**
 * Compare attribution results across different models
 */
export function compareAttributionModels(
  touchpoints: TouchpointData[],
  conversionValue: number
): Record<AttributionModel, AttributionResult> {
  const models: AttributionModel[] = [
    'first_click',
    'last_click',
    'linear',
    'time_decay',
    'position_based',
  ];

  const results: Record<string, AttributionResult> = {};

  for (const model of models) {
    results[model] = calculateAttribution(touchpoints, conversionValue, model);
  }

  return results as Record<AttributionModel, AttributionResult>;
}
