'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Globe,
  Code,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Target,
  Zap,
  Loader2,
  CreditCard,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWorkspace } from '@/hooks/use-workspace';
import { TutorialProvider } from '@/hooks/use-tutorial';
import { TermsModal } from '@/components/auth/terms-modal';
import { needsTermsAcceptance } from '@/lib/auth/terms';
import { updateWorkspaceSettings } from '@/lib/firebase/firestore';
import { PRICING_PLANS, STRIPE_CONFIG } from '@/lib/stripe/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { PixelTutorialDrawer, PixelTutorialTrigger } from '@/components/tutorial/pixel-tutorial-drawer';

// ===========================================
// PIXLY - Onboarding Flow (Client)
// 4 steps + mandatory Stripe checkout
// localStorage persistence for resume
// ===========================================

const STORAGE_KEY = 'pixly_onboarding_progress';
const STORAGE_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

interface OnboardingProgress {
  step: number;
  workspaceId: string;
  workspaceName: string;
  websiteUrl: string;
  pixelId: string;
  pixelVerified: boolean;
  selectedPlanId?: string;
  billingInterval?: 'monthly' | 'annual';
  updatedAt: number;
}

const STEPS = [
  {
    id: 1,
    label: 'Espace de travail',
    hint: 'Le nom de votre projet ou entreprise',
  },
  {
    id: 2,
    label: 'Votre site',
    hint: 'Le site sur lequel vous suivez vos conversions',
  },
  {
    id: 3,
    label: 'Pixel de tracking',
    hint: 'Une ligne de code à ajouter sur votre site',
  },
  {
    id: 4,
    label: 'Votre offre',
    hint: 'Choisissez le plan adapté à vos besoins',
  },
];

const BENEFITS = [
  { icon: BarChart3, text: 'Attribution multi-touch' },
  { icon: Target, text: 'Tracking post-iOS 14' },
  { icon: Zap, text: 'Résultats en temps réel' },
];

const PLATFORMS = [
  {
    name: 'Meta Ads',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.93 3.78-3.93 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
      </svg>
    ),
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borderHover: 'hover:border-blue-200',
  },
  {
    name: 'Google Ads',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48Z" />
      </svg>
    ),
    color: 'text-red-500',
    bg: 'bg-red-50',
    borderHover: 'hover:border-red-200',
  },
  {
    name: 'TikTok Ads',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1V9a6.33 6.33 0 1 0 5.42 6.27V9.41a8.16 8.16 0 0 0 4.77 1.52V7.49a4.85 4.85 0 0 1-.88-.8Z" />
      </svg>
    ),
    color: 'text-neutral-900',
    bg: 'bg-neutral-100',
    borderHover: 'hover:border-neutral-300',
  },
];

// French feature labels per plan for onboarding display
const PLAN_FEATURES_FR: Record<string, string[]> = {
  starter: [
    'Jusqu\'à 25 000 $/mois de dépenses pub',
    'Meta + Google Ads',
    'Attribution last-click & first-click',
    'Support email',
  ],
  growth: [
    'Jusqu\'à 100 000 $/mois de dépenses pub',
    'Toutes les plateformes pub',
    'Attribution multi-touch (5 modèles)',
    'Sync API Conversions',
    'Support prioritaire',
  ],
  scale: [
    'Jusqu\'à 500 000 $/mois de dépenses pub',
    'Intégrations personnalisées',
    'Analytics avancés',
    'API complète + webhooks',
    'Account manager dédié',
  ],
};

// ===========================================
// localStorage helpers
// ===========================================

function saveProgress(data: Partial<OnboardingProgress>) {
  try {
    const existing = loadProgress();
    const merged: OnboardingProgress = {
      step: data.step ?? existing?.step ?? 1,
      workspaceId: data.workspaceId ?? existing?.workspaceId ?? '',
      workspaceName: data.workspaceName ?? existing?.workspaceName ?? '',
      websiteUrl: data.websiteUrl ?? existing?.websiteUrl ?? '',
      pixelId: data.pixelId ?? existing?.pixelId ?? '',
      pixelVerified: data.pixelVerified ?? existing?.pixelVerified ?? false,
      selectedPlanId: data.selectedPlanId ?? existing?.selectedPlanId,
      billingInterval: data.billingInterval ?? existing?.billingInterval,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage unavailable
  }
}

function loadProgress(): OnboardingProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: OnboardingProgress = JSON.parse(raw);
    // Expire after 24h
    if (Date.now() - data.updatedAt > STORAGE_MAX_AGE) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}

// ===========================================
// Inner component (needs useSearchParams)
// ===========================================

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { createWorkspace, currentWorkspace } = useWorkspace();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [workspaceName, setWorkspaceName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pixelId, setPixelId] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  // Pixel verification state
  const [pixelVerified, setPixelVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const verifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  // Plan selection state (step 4)
  const [selectedPlanId, setSelectedPlanId] = useState('growth');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCanceled, setIsCanceled] = useState(false);

  // Activation polling state (step 5)
  const [isActivating, setIsActivating] = useState(false);
  const [activationDone, setActivationDone] = useState(false);
  const activationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const firstName = user?.displayName?.split(' ')[0] || '';
  const totalSteps = STEPS.length;
  const isComplete = currentStep > totalSteps;

  // ===========================================
  // Init: handle URL params + localStorage resume
  // ===========================================
  useEffect(() => {
    if (initialized || !user) return;

    // If user already has a paid plan, go straight to dashboard
    if (user.plan !== 'free') {
      clearProgress();
      router.replace('/dashboard');
      return;
    }

    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');

    // Returning from Stripe checkout success
    if (sessionId) {
      setCurrentStep(5);
      setInitialized(true);
      // Clean URL params
      window.history.replaceState({}, '', '/onboarding');
      return;
    }

    // Returning from Stripe checkout cancel
    if (canceled === 'true') {
      setIsCanceled(true);
      // Restore saved progress to get workspace data
      const saved = loadProgress();
      if (saved && saved.workspaceId) {
        setWorkspaceName(saved.workspaceName);
        setWebsiteUrl(saved.websiteUrl);
        setPixelId(saved.pixelId);
        setWorkspaceId(saved.workspaceId);
        setPixelVerified(saved.pixelVerified);
        if (saved.selectedPlanId) setSelectedPlanId(saved.selectedPlanId);
        if (saved.billingInterval) setBillingInterval(saved.billingInterval);
      }
      setCurrentStep(4);
      setInitialized(true);
      window.history.replaceState({}, '', '/onboarding');
      return;
    }

    // Resume from localStorage
    const saved = loadProgress();
    if (saved && saved.workspaceId) {
      setWorkspaceName(saved.workspaceName);
      setWebsiteUrl(saved.websiteUrl);
      setPixelId(saved.pixelId);
      setWorkspaceId(saved.workspaceId);
      setPixelVerified(saved.pixelVerified);
      if (saved.selectedPlanId) setSelectedPlanId(saved.selectedPlanId);
      if (saved.billingInterval) setBillingInterval(saved.billingInterval);
      // Resume at saved step (but ensure workspace exists before resuming past step 1)
      setCurrentStep(Math.max(saved.step, 2));
    }

    setInitialized(true);
  }, [initialized, user, searchParams, router]);

  // ===========================================
  // Save progress when step changes
  // ===========================================
  useEffect(() => {
    if (!initialized || currentStep > totalSteps) return;
    saveProgress({
      step: currentStep,
      workspaceId,
      workspaceName,
      websiteUrl,
      pixelId,
      pixelVerified,
      selectedPlanId,
      billingInterval,
    });
  }, [initialized, currentStep, workspaceId, workspaceName, websiteUrl, pixelId, pixelVerified, selectedPlanId, billingInterval, totalSteps]);

  // ===========================================
  // Activation polling (step 5)
  // ===========================================
  useEffect(() => {
    if (currentStep !== 5 || activationDone) return;

    setIsActivating(true);

    // Poll refreshUser every 2s to detect plan change
    activationIntervalRef.current = setInterval(async () => {
      try {
        await refreshUser();
      } catch {
        // Silently continue
      }
    }, 2000);

    // Timeout after 30s
    activationTimeoutRef.current = setTimeout(() => {
      if (activationIntervalRef.current) {
        clearInterval(activationIntervalRef.current);
        activationIntervalRef.current = null;
      }
      setIsActivating(false);
    }, 30000);

    return () => {
      if (activationIntervalRef.current) {
        clearInterval(activationIntervalRef.current);
        activationIntervalRef.current = null;
      }
      if (activationTimeoutRef.current) {
        clearTimeout(activationTimeoutRef.current);
        activationTimeoutRef.current = null;
      }
    };
  }, [currentStep, activationDone, refreshUser]);

  // Detect plan change during activation
  useEffect(() => {
    if (currentStep !== 5 || activationDone) return;
    if (user && user.plan !== 'free') {
      setActivationDone(true);
      setIsActivating(false);
      if (activationIntervalRef.current) {
        clearInterval(activationIntervalRef.current);
        activationIntervalRef.current = null;
      }
      if (activationTimeoutRef.current) {
        clearTimeout(activationTimeoutRef.current);
        activationTimeoutRef.current = null;
      }
    }
  }, [currentStep, activationDone, user]);

  // ===========================================
  // Pixel verification polling
  // ===========================================
  const stopVerification = useCallback(() => {
    if (verifyIntervalRef.current) {
      clearInterval(verifyIntervalRef.current);
      verifyIntervalRef.current = null;
    }
    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current);
      verifyTimeoutRef.current = null;
    }
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    setIsVerifying(false);
  }, []);

  const verifyPixel = useCallback(() => {
    if (!pixelId || pixelVerified) return;

    setIsVerifying(true);

    verifyIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/track/verify?pixelId=${encodeURIComponent(pixelId)}`);
        const data = await res.json();
        if (data.verified) {
          setPixelVerified(true);
          stopVerification();
          autoAdvanceRef.current = setTimeout(() => {
            setCurrentStep(4);
          }, 1500);
        }
      } catch {
        // Silently continue
      }
    }, 3000);

    verifyTimeoutRef.current = setTimeout(() => {
      if (verifyIntervalRef.current) {
        clearInterval(verifyIntervalRef.current);
        verifyIntervalRef.current = null;
      }
      setIsVerifying(false);
    }, 60000);
  }, [pixelId, pixelVerified, stopVerification]);

  useEffect(() => {
    if (currentStep === 3 && pixelId && !pixelVerified) {
      verifyPixel();
    }
    return () => {
      stopVerification();
    };
  }, [currentStep, pixelId, pixelVerified, verifyPixel, stopVerification]);

  useEffect(() => {
    return () => {
      stopVerification();
    };
  }, [stopVerification]);

  // ===========================================
  // Step handlers
  // ===========================================

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;
    setIsLoading(true);
    try {
      const workspace = await createWorkspace(workspaceName.trim());
      setPixelId(workspace.pixelId);
      setWorkspaceId(workspace.id);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvanceFromStep2 = async () => {
    if (websiteUrl.trim() && workspaceId) {
      try {
        await updateWorkspaceSettings(workspaceId, { websiteUrl: websiteUrl.trim() });
      } catch (error) {
        console.error('Error saving website URL:', error);
      }
    }
    setCurrentStep(3);
  };

  const handleCopyPixel = () => {
    navigator.clipboard.writeText(getPixelCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPixelCode = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
    return `<!-- Pixly Tracking -->\n<script src="${baseUrl}/pixel.js" data-pixel-id="${pixelId}" async></script>`;
  };

  // Step 4: Launch Stripe checkout
  const handleCheckout = async () => {
    if (!selectedPlanId) return;

    try {
      setIsCheckoutLoading(true);
      setCheckoutError(null);

      // Save progress before leaving to Stripe
      saveProgress({
        step: 4,
        workspaceId,
        workspaceName,
        websiteUrl,
        pixelId,
        pixelVerified,
        selectedPlanId,
        billingInterval,
      });

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          billingInterval,
          source: 'onboarding',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de procéder au paiement');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Step 5: Go to dashboard
  const handleComplete = () => {
    clearProgress();
    router.push('/dashboard');
  };

  const handleRetryActivation = async () => {
    setIsActivating(true);
    try {
      await refreshUser();
      if (user && user.plan !== 'free') {
        setActivationDone(true);
        setIsActivating(false);
        return;
      }
    } catch {
      // continue
    }
    // Restart polling
    activationIntervalRef.current = setInterval(async () => {
      try {
        await refreshUser();
      } catch {
        // Silently continue
      }
    }, 2000);

    activationTimeoutRef.current = setTimeout(() => {
      if (activationIntervalRef.current) {
        clearInterval(activationIntervalRef.current);
        activationIntervalRef.current = null;
      }
      setIsActivating(false);
    }, 30000);
  };

  const transition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  };

  // Terms acceptance safety net
  if (user && needsTermsAcceptance(user.termsAcceptedAt, user.termsVersion)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <TermsModal onAccepted={() => refreshUser()} />
      </div>
    );
  }

  const selectedPlan = PRICING_PLANS.find((p) => p.id === selectedPlanId);
  const price = selectedPlan
    ? billingInterval === 'annual'
      ? selectedPlan.price.annual
      : selectedPlan.price.monthly
    : 0;

  return (
    <TutorialProvider>
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col relative bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 border-r border-neutral-100 overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-20 left-16 h-64 w-64 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute bottom-32 right-12 h-48 w-48 rounded-full bg-emerald-100/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <Logo size="sm" />

          {/* Progress */}
          <div className="mt-16">
            {!isComplete ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                  Configuration
                </p>
                <div className="mt-6 space-y-4">
                  {STEPS.map((step) => {
                    const isDone = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                      <div key={step.id} className="flex items-start gap-3">
                        <div
                          className={`
                            flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold
                            transition-all duration-300
                            ${isDone
                              ? 'bg-primary-500 text-white'
                              : isActive
                                ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500/30'
                                : 'bg-neutral-100 text-neutral-400'
                            }
                          `}
                        >
                          {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                        </div>
                        <div className="pt-0.5">
                          <p className={`text-sm font-medium transition-colors ${
                            isActive ? 'text-neutral-900' : isDone ? 'text-neutral-600' : 'text-neutral-400'
                          }`}>
                            {step.label}
                          </p>
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-xs text-neutral-500 mt-0.5"
                            >
                              {step.hint}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                  Terminé
                </p>
                <p className="mt-3 text-sm text-neutral-600">
                  Votre espace est prêt. Connectez vos comptes publicitaires pour commencer.
                </p>
              </div>
            )}
          </div>

          {/* Benefits - Bottom */}
          <div className="mt-auto">
            <div className="space-y-3">
              {BENEFITS.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/70 border border-neutral-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                    <item.icon className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm text-neutral-700">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-neutral-400 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary-400" />
              <span>+500 entreprises utilisent Pixly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <Logo size="sm" />
          {!isComplete && (
            <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              {currentStep} / {totalSteps}
            </span>
          )}
        </div>

        {/* Form Area */}
        <div className={`flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 ${currentStep === 4 ? 'items-start lg:items-center pt-6 sm:pt-8 lg:pt-10' : ''}`}>
          <div className={`w-full ${currentStep === 4 ? 'max-w-[580px]' : 'max-w-[440px]'}`}>
            <AnimatePresence mode="wait">
              {/* Step 1 - Workspace */}
              {currentStep === 1 && (
                <motion.div key="step1" {...transition}>
                  <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900">
                      {firstName
                        ? `Bonjour ${firstName}, configurons votre espace`
                        : 'Configurons votre espace'
                      }
                    </h1>
                    <p className="mt-3 text-neutral-500">
                      Donnez un nom à votre espace de travail. Vous pourrez le modifier plus tard.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nom de l&apos;espace
                      </label>
                      <Input
                        placeholder="Ex : Mon Entreprise"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        icon={<Building2 className="h-4 w-4" />}
                        onKeyDown={(e) => e.key === 'Enter' && workspaceName.trim() && handleCreateWorkspace()}
                      />
                      <p className="mt-1.5 text-xs text-neutral-400">
                        Le nom de votre entreprise ou projet
                      </p>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-medium shadow-lg shadow-primary-500/20"
                      onClick={handleCreateWorkspace}
                      isLoading={isLoading}
                      disabled={!workspaceName.trim()}
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2 - Website */}
              {currentStep === 2 && (
                <motion.div key="step2" {...transition}>
                  <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900">
                      Quel site souhaitez-vous suivre ?
                    </h1>
                    <p className="mt-3 text-neutral-500">
                      L&apos;URL du site sur lequel vous mesurez vos conversions.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        URL du site
                      </label>
                      <Input
                        placeholder="https://monsite.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        icon={<Globe className="h-4 w-4" />}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdvanceFromStep2()}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="h-12 px-5 order-2 sm:order-1"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-medium shadow-lg shadow-primary-500/20 order-1 sm:order-2"
                        onClick={handleAdvanceFromStep2}
                      >
                        Continuer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    <button
                      onClick={() => setCurrentStep(3)}
                      className="w-full text-center text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      Passer cette étape
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 - Pixel */}
              {currentStep === 3 && (
                <motion.div key="step3" {...transition}>
                  <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900">
                      Installez votre pixel
                    </h1>
                    <p className="mt-3 text-neutral-500">
                      Copiez ce code et collez-le dans la balise <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono">&lt;head&gt;</code> de votre site.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <PixelTutorialTrigger variant="default" />

                    {/* Pixel Code Block */}
                    <div className="relative group">
                      <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-3 sm:p-5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-mono">
                        <code>{getPixelCode()}</code>
                      </pre>
                      <button
                        onClick={handleCopyPixel}
                        className={`
                          absolute top-3 right-3
                          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                          transition-all duration-200
                          ${copied
                            ? 'bg-primary-500 text-white'
                            : 'bg-white/10 text-neutral-400 hover:bg-white/20 hover:text-white'
                          }
                        `}
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copié
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copier
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pixel ID */}
                    <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-primary-700">Votre Pixel ID</p>
                        <p className="mt-0.5 font-mono text-sm text-primary-900">{pixelId}</p>
                      </div>
                      <Code className="h-4 w-4 text-primary-400" />
                    </div>

                    {/* Pixel Verification Status */}
                    <div
                      className={`
                        flex items-center gap-3 rounded-xl border px-4 py-3
                        transition-all duration-300
                        ${pixelVerified
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-neutral-200/80 bg-neutral-50'
                        }
                      `}
                    >
                      {pixelVerified ? (
                        <>
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <Check className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-emerald-800">Pixel détecté !</p>
                            <p className="text-xs text-emerald-600">
                              Votre pixel envoie des données correctement.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100">
                            {isVerifying ? (
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                              </span>
                            ) : (
                              <Loader2 className="h-4 w-4 text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-700">
                              En attente du premier événement...
                            </p>
                            <p className="text-xs text-neutral-500">
                              Installez le pixel puis visitez votre site.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="h-12 px-5 order-2 sm:order-1"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                      </Button>
                      <Button
                        className={`
                          flex-1 h-12 text-base font-medium order-1 sm:order-2
                          transition-all duration-300
                          ${pixelVerified
                            ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/20'
                            : 'shadow-lg shadow-primary-500/20'
                          }
                        `}
                        onClick={() => setCurrentStep(4)}
                      >
                        {pixelVerified ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Pixel vérifié
                          </>
                        ) : (
                          <>
                            J&apos;ai installé le pixel
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    <button
                      onClick={() => setCurrentStep(4)}
                      className="w-full text-center text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      Je ferai ça plus tard
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4 - Plan Selection */}
              {currentStep === 4 && (
                <motion.div key="step4" {...transition}>
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900">
                      Choisissez votre offre
                    </h1>
                    <p className="mt-3 text-neutral-500">
                      {STRIPE_CONFIG.trial.days} jours d&apos;essai gratuit · Sans carte bancaire
                    </p>
                  </div>

                  {/* Canceled Notice */}
                  <AnimatePresence>
                    {isCanceled && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                          <p className="text-sm text-amber-700 flex-1">
                            Le paiement a été annulé. Vous pouvez réessayer ou choisir une autre offre.
                          </p>
                          <button
                            onClick={() => setIsCanceled(false)}
                            className="text-xs text-amber-600 hover:text-amber-700 shrink-0"
                          >
                            Fermer
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error */}
                  <AnimatePresence>
                    {checkoutError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                          <p className="text-sm text-red-700 flex-1">{checkoutError}</p>
                          <button
                            onClick={() => setCheckoutError(null)}
                            className="text-xs text-red-600 hover:text-red-700 shrink-0"
                          >
                            Fermer
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Billing Toggle */}
                  <div className="flex items-center justify-center gap-2 mb-5">
                    <button
                      onClick={() => setBillingInterval('monthly')}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        billingInterval === 'monthly'
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Mensuel
                    </button>
                    <button
                      onClick={() => setBillingInterval('annual')}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        billingInterval === 'annual'
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Annuel
                      <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        −20%
                      </span>
                    </button>
                  </div>

                  {/* Plan Cards */}
                  <div className="space-y-3 mb-6">
                    {PRICING_PLANS.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      const planPrice = billingInterval === 'annual' ? plan.price.annual : plan.price.monthly;
                      const features = PLAN_FEATURES_FR[plan.id] || [];

                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`
                            w-full text-left rounded-xl border-2 p-4 transition-all duration-200
                            ${isSelected
                              ? 'border-primary-500 bg-primary-50/30'
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-base font-semibold ${isSelected ? 'text-primary-900' : 'text-neutral-900'}`}>
                                {plan.name}
                              </span>
                              {plan.popular && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                                  Recommandé
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`text-lg font-bold ${isSelected ? 'text-primary-900' : 'text-neutral-900'}`}>
                                {planPrice}$
                              </span>
                              <span className="text-sm text-neutral-400">/mois</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {features.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <Check className={`h-3 w-3 shrink-0 ${isSelected ? 'text-primary-500' : 'text-neutral-400'}`} />
                                <span className="text-xs text-neutral-600">{f}</span>
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full h-12 text-base font-medium shadow-lg shadow-primary-500/20"
                    onClick={handleCheckout}
                    disabled={isCheckoutLoading || !selectedPlanId}
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirection...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Démarrer l&apos;essai gratuit
                      </>
                    )}
                  </Button>

                  {/* Trust */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Paiement sécurisé Stripe</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Résiliable à tout moment</span>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="mt-5">
                    <Button
                      variant="outline"
                      className="h-10 px-5"
                      onClick={() => setCurrentStep(3)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 5 - Activation & Completion */}
              {currentStep === 5 && (
                <motion.div key="step5" {...transition}>
                  <div className="text-center">
                    {/* Activating */}
                    {!activationDone && isActivating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 border border-primary-100">
                          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900">
                          Activation en cours...
                        </h1>
                        <p className="mt-3 text-neutral-500 max-w-sm mx-auto">
                          Votre abonnement est en cours d&apos;activation. Cela ne prend que quelques instants.
                        </p>
                      </motion.div>
                    )}

                    {/* Activation timeout — offer retry */}
                    {!activationDone && !isActivating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
                          <AlertCircle className="h-10 w-10 text-amber-500" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900">
                          L&apos;activation prend un peu plus de temps
                        </h1>
                        <p className="mt-3 text-neutral-500 max-w-sm mx-auto">
                          Votre paiement a bien été reçu. L&apos;activation peut prendre quelques instants supplémentaires.
                        </p>
                        <div className="mt-6">
                          <Button
                            className="h-12 px-8 text-base font-medium shadow-lg shadow-primary-500/20"
                            onClick={handleRetryActivation}
                          >
                            <Loader2 className="mr-2 h-4 w-4" />
                            Vérifier à nouveau
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Activation done — show completion */}
                    {activationDone && (
                      <>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 border border-primary-100"
                        >
                          <Check className="h-10 w-10 text-primary-600" />
                        </motion.div>

                        <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900">
                          Votre espace est prêt
                        </h1>
                        <p className="mt-3 text-neutral-500 max-w-sm mx-auto">
                          Connectez vos comptes publicitaires pour voir vos premières données d&apos;attribution.
                        </p>

                        {/* Platform Connection Buttons */}
                        <div className="mt-8">
                          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                            Connecter une plateforme
                          </p>
                          <div className="space-y-2.5">
                            {PLATFORMS.map((platform) => (
                              <button
                                key={platform.name}
                                onClick={() => {
                                  clearProgress();
                                  router.push('/integrations');
                                }}
                                className={`
                                  flex w-full items-center gap-3 rounded-xl border border-neutral-200/80 bg-white
                                  px-4 py-3.5 text-left
                                  transition-all duration-200
                                  hover:bg-neutral-50 ${platform.borderHover}
                                `}
                              >
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${platform.bg}`}>
                                  <span className={platform.color}>{platform.icon}</span>
                                </div>
                                <span className="text-sm font-medium text-neutral-700">
                                  {platform.name}
                                </span>
                                <ArrowRight className="ml-auto h-4 w-4 text-neutral-300" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-8 space-y-3">
                          <Button
                            className="w-full h-12 text-base font-medium shadow-lg shadow-primary-500/20"
                            onClick={handleComplete}
                          >
                            Accéder au dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
    <PixelTutorialDrawer />
    </TutorialProvider>
  );
}

// ===========================================
// Main export with Suspense (for useSearchParams)
// ===========================================

export default function OnboardingClient() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    }>
      <OnboardingInner />
    </Suspense>
  );
}
