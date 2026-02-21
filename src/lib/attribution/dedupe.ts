import type { Touchpoint, Channel } from '@/types';

// ===========================================
// PIXLY - Cross-Platform Deduplication
// Prevent double-counting when users touch multiple platforms
// ===========================================

export interface DedupeConfig {
  /**
   * Window in days to look back for touchpoints
   * Default: 30 days
   */
  lookbackWindow: number;

  /**
   * Platform priority when multiple platforms are in the journey
   * Higher number = higher priority
   * Default: last-touch gets it, but this can override
   */
  platformPriority?: Record<Channel, number>;

  /**
   * Time window (in hours) to consider touchpoints as "duplicate"
   * If two touchpoints are within this window, apply dedupe logic
   * Default: 24 hours
   */
  dedupeWindowHours: number;
}

const DEFAULT_CONFIG: DedupeConfig = {
  lookbackWindow: 30,
  dedupeWindowHours: 24,
  platformPriority: {
    meta: 5,
    google: 5,
    tiktok: 5,
    linkedin: 4,
    bing: 4,
    email: 3,
    organic: 2,
    direct: 1,
    referral: 2,
    other: 1,
  },
};

export interface DedupeResult {
  /**
   * The winning touchpoint that should receive credit
   */
  winner: Touchpoint;

  /**
   * All touchpoints that were considered (including duplicates)
   */
  allTouchpoints: Touchpoint[];

  /**
   * Touchpoints that were deduplicated (lost)
   */
  deduplicated: Touchpoint[];

  /**
   * Reason for deduplication
   */
  reason: string;
}

/**
 * Deduplicate touchpoints when a user touches multiple platforms
 * Returns the winning touchpoint and deduplicated touchpoints
 */
export function deduplicateTouchpoints(
  touchpoints: Touchpoint[],
  config: Partial<DedupeConfig> = {}
): DedupeResult {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  if (touchpoints.length === 0) {
    throw new Error('No touchpoints to deduplicate');
  }

  // Single touchpoint - no deduplication needed
  if (touchpoints.length === 1) {
    return {
      winner: touchpoints[0],
      allTouchpoints: touchpoints,
      deduplicated: [],
      reason: 'Single touchpoint - no deduplication needed',
    };
  }

  // Sort touchpoints by timestamp (oldest first)
  const sorted = [...touchpoints].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Group touchpoints by dedupe window
  const groups = groupByDedupeWindow(sorted, fullConfig.dedupeWindowHours);

  // If all touchpoints are in different windows, use attribution model (no dedupe)
  if (groups.length === touchpoints.length) {
    return {
      winner: sorted[sorted.length - 1], // Last touch wins
      allTouchpoints: sorted,
      deduplicated: [],
      reason: 'All touchpoints outside dedupe window - no deduplication',
    };
  }

  // Find groups with multiple platforms (these need deduplication)
  const groupsNeedingDedupe = groups.filter((group) => {
    const uniqueChannels = new Set(group.map((tp) => tp.channel));
    return uniqueChannels.size > 1;
  });

  if (groupsNeedingDedupe.length === 0) {
    return {
      winner: sorted[sorted.length - 1],
      allTouchpoints: sorted,
      deduplicated: [],
      reason: 'No cross-platform touchpoints in same window',
    };
  }

  // For each group needing dedupe, pick winner based on priority + recency
  const winners: Touchpoint[] = [];
  const losers: Touchpoint[] = [];

  for (const group of groups) {
    const winner = selectWinner(group, fullConfig);
    winners.push(winner);

    const groupLosers = group.filter((tp) => tp !== winner);
    losers.push(...groupLosers);
  }

  // Final winner is the last winner from all groups
  const finalWinner = winners[winners.length - 1];

  return {
    winner: finalWinner,
    allTouchpoints: sorted,
    deduplicated: losers,
    reason: `Deduplicated ${losers.length} touchpoint(s) across ${groupsNeedingDedupe.length} window(s)`,
  };
}

/**
 * Group touchpoints into windows based on dedupe time window
 */
function groupByDedupeWindow(
  touchpoints: Touchpoint[],
  windowHours: number
): Touchpoint[][] {
  if (touchpoints.length === 0) return [];

  const groups: Touchpoint[][] = [];
  let currentGroup: Touchpoint[] = [touchpoints[0]];

  for (let i = 1; i < touchpoints.length; i++) {
    const prev = touchpoints[i - 1];
    const current = touchpoints[i];

    const timeDiffHours =
      (current.timestamp.getTime() - prev.timestamp.getTime()) / (1000 * 60 * 60);

    if (timeDiffHours <= windowHours) {
      // Within window - add to current group
      currentGroup.push(current);
    } else {
      // Outside window - start new group
      groups.push(currentGroup);
      currentGroup = [current];
    }
  }

  // Add last group
  groups.push(currentGroup);

  return groups;
}

/**
 * Select winner from a group of touchpoints
 * Logic: Platform priority * recency weight
 */
function selectWinner(group: Touchpoint[], config: DedupeConfig): Touchpoint {
  if (group.length === 1) return group[0];

  const priority = config.platformPriority || DEFAULT_CONFIG.platformPriority!;
  const latestTimestamp = Math.max(...group.map((tp) => tp.timestamp.getTime()));

  // Score each touchpoint
  const scores = group.map((tp) => {
    const platformScore = priority[tp.channel] || 1;

    // Recency weight: more recent = higher score (exponential decay)
    const timeDiff = latestTimestamp - tp.timestamp.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    const recencyWeight = Math.exp(-hoursDiff / 12); // Half-life of 12 hours

    return {
      touchpoint: tp,
      score: platformScore * recencyWeight,
    };
  });

  // Sort by score desc
  scores.sort((a, b) => b.score - a.score);

  return scores[0].touchpoint;
}

/**
 * Check if a conversion should be synced to a specific platform
 * after deduplication
 */
export function shouldSyncToPlatform(
  dedupeResult: DedupeResult,
  targetPlatform: Channel
): boolean {
  // Only sync to the winning platform
  return dedupeResult.winner.channel === targetPlatform;
}

/**
 * Get a summary of what was deduplicated (for logging/debugging)
 */
export function getDedupeSummary(result: DedupeResult): string {
  if (result.deduplicated.length === 0) {
    return 'No deduplication applied';
  }

  const channels = result.deduplicated.map((tp) => tp.channel).join(', ');
  return `Winner: ${result.winner.channel} | Deduplicated: ${channels} | ${result.reason}`;
}
