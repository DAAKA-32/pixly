import type { Plan, AttributionModel } from '@/types';

// ===========================================
// PIXLY - Plan Feature Gates
// Single source of truth for what each plan allows
// ===========================================

export interface PlanLimits {
  maxWorkspaces: number; // -1 = unlimited
  adSpendLimit: number; // Monthly $ limit, -1 = unlimited
  attributionModels: AttributionModel[];
  integrations: string[]; // Integration IDs allowed
  apiAccess: boolean;
  webhooks: boolean;
  customReports: boolean;
  exportFormats: string[];
}

const FREE_LIMITS: PlanLimits = {
  maxWorkspaces: 1,
  adSpendLimit: 5000,
  attributionModels: ['last_click'],
  integrations: ['meta', 'google'],
  apiAccess: false,
  webhooks: false,
  customReports: false,
  exportFormats: ['csv'],
};

const STARTER_LIMITS: PlanLimits = {
  maxWorkspaces: 1,
  adSpendLimit: 25000,
  attributionModels: ['last_click', 'first_click'],
  integrations: ['meta', 'google'],
  apiAccess: false,
  webhooks: false,
  customReports: false,
  exportFormats: ['csv'],
};

const GROWTH_LIMITS: PlanLimits = {
  maxWorkspaces: 3,
  adSpendLimit: 100000,
  attributionModels: ['last_click', 'first_click', 'linear', 'time_decay', 'position_based'],
  integrations: ['meta', 'google', 'tiktok', 'stripe', 'shopify', 'hubspot'],
  apiAccess: true,
  webhooks: true,
  customReports: false,
  exportFormats: ['csv', 'excel'],
};

const SCALE_LIMITS: PlanLimits = {
  maxWorkspaces: -1,
  adSpendLimit: 500000,
  attributionModels: ['last_click', 'first_click', 'linear', 'time_decay', 'position_based'],
  integrations: ['meta', 'google', 'tiktok', 'stripe', 'shopify', 'hubspot'],
  apiAccess: true,
  webhooks: true,
  customReports: true,
  exportFormats: ['csv', 'excel', 'bigquery'],
};

const UNLIMITED_LIMITS: PlanLimits = {
  ...SCALE_LIMITS,
  maxWorkspaces: -1,
  adSpendLimit: -1,
};

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: FREE_LIMITS,
  starter: STARTER_LIMITS,
  growth: GROWTH_LIMITS,
  scale: SCALE_LIMITS,
  unlimited: UNLIMITED_LIMITS,
};

/**
 * Get the feature limits for a given plan.
 */
export function getPlanLimits(plan: Plan | undefined | null): PlanLimits {
  return PLAN_LIMITS[plan || 'free'] || FREE_LIMITS;
}

/**
 * Check if a specific attribution model is allowed for the given plan.
 */
export function canUseAttributionModel(plan: Plan | undefined | null, model: AttributionModel): boolean {
  const limits = getPlanLimits(plan);
  return limits.attributionModels.includes(model);
}

/**
 * Check if a specific integration is allowed for the given plan.
 */
export function canUseIntegration(plan: Plan | undefined | null, integrationId: string): boolean {
  const limits = getPlanLimits(plan);
  return limits.integrations.includes(integrationId);
}

/**
 * Check if the user can create another workspace given current count.
 */
export function canCreateWorkspace(plan: Plan | undefined | null, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxWorkspaces === -1) return true;
  return currentCount < limits.maxWorkspaces;
}

/**
 * Get the minimum plan required for a feature.
 * Useful for upgrade prompts: "Disponible à partir du plan Growth"
 */
export function getMinimumPlanForModel(model: AttributionModel): Plan {
  if (STARTER_LIMITS.attributionModels.includes(model)) return 'starter';
  if (GROWTH_LIMITS.attributionModels.includes(model)) return 'growth';
  return 'scale';
}

export function getMinimumPlanForIntegration(integrationId: string): Plan {
  if (FREE_LIMITS.integrations.includes(integrationId)) return 'free';
  if (STARTER_LIMITS.integrations.includes(integrationId)) return 'starter';
  if (GROWTH_LIMITS.integrations.includes(integrationId)) return 'growth';
  return 'scale';
}

/** Human-readable plan name */
export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Gratuit',
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  unlimited: 'Unlimited',
};
