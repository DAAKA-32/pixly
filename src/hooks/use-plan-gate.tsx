'use client';

import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { useWorkspace } from './use-workspace';
import {
  getPlanLimits,
  canUseAttributionModel,
  canUseIntegration,
  canCreateWorkspace,
  getMinimumPlanForModel,
  getMinimumPlanForIntegration,
  PLAN_LABELS,
  type PlanLimits,
} from '@/lib/plans/features';
import type { Plan, AttributionModel } from '@/types';

// ===========================================
// PIXLY - Plan Gate Hook
// Client-side feature gating based on user plan
// ===========================================

export interface PlanGate {
  /** Current user plan */
  plan: Plan;
  /** Feature limits for the current plan */
  limits: PlanLimits;
  /** Check if an attribution model is allowed */
  canModel: (model: AttributionModel) => boolean;
  /** Check if an integration is allowed */
  canIntegration: (integrationId: string) => boolean;
  /** Check if user can create another workspace */
  canAddWorkspace: boolean;
  /** Check if user has API access */
  canApi: boolean;
  /** Get the minimum plan required for a model (for upgrade prompts) */
  requiredPlanForModel: (model: AttributionModel) => string;
  /** Get the minimum plan required for an integration */
  requiredPlanForIntegration: (integrationId: string) => string;
}

export function usePlanGate(): PlanGate {
  const { user } = useAuth();
  const { workspaces } = useWorkspace();

  const plan: Plan = user?.plan || 'free';
  const limits = useMemo(() => getPlanLimits(plan), [plan]);

  return useMemo(
    () => ({
      plan,
      limits,
      canModel: (model: AttributionModel) => canUseAttributionModel(plan, model),
      canIntegration: (id: string) => canUseIntegration(plan, id),
      canAddWorkspace: canCreateWorkspace(plan, workspaces.length),
      canApi: limits.apiAccess,
      requiredPlanForModel: (model: AttributionModel) =>
        PLAN_LABELS[getMinimumPlanForModel(model)],
      requiredPlanForIntegration: (id: string) =>
        PLAN_LABELS[getMinimumPlanForIntegration(id)],
    }),
    [plan, limits, workspaces.length]
  );
}
