// ===========================================
// PIXLY - Stripe Pricing Configuration
// Complete pricing plans with Stripe Price IDs
// ===========================================

export interface PlanFeatures {
  adSpendLimit: number; // Monthly ad spend limit in dollars
  attributionModels: string[];
  integrations: string[];
  workspaces: number;
  supportLevel: 'email' | 'priority' | 'dedicated' | '24/7';
  apiAccess: boolean;
  webhooks: boolean;
  whiteLabel: boolean;
  customReports: boolean;
  sso: boolean;
  dedicatedCSM: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  target: string;
  price: {
    monthly: number;
    annual: number; // 20% discount (2 months free)
  };
  stripePriceId: {
    monthly: string;
    annual: string;
  };
  features: PlanFeatures;
  displayFeatures: string[];
  additionalFeatures: string[];
  popular?: boolean;
  cta: string;
}

// ===========================================
// PRICING CONFIGURATION
// Stripe Price IDs should be configured in Stripe Dashboard
// and added here after creation
// ===========================================

export const STRIPE_CONFIG = {
  // Trial period configuration
  trial: {
    days: 14,
    requiresPaymentMethod: false, // No credit card required for trial
  },

  // Annual discount (20% = 2 months free)
  annualDiscountPercent: 20,

  // Currency
  currency: 'usd',

  // Success/Cancel URLs
  urls: {
    success: '/dashboard?subscription=success',
    cancel: '/checkout?canceled=true',
  },
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal for freelancers and small e-commerce',
    target: 'Freelances, petits e-com',
    price: {
      monthly: 49,
      annual: 39, // ~$470/year vs $588/year = 20% savings
    },
    stripePriceId: {
      monthly: 'price_starter_monthly', // Replace with actual Stripe Price ID
      annual: 'price_starter_annual',   // Replace with actual Stripe Price ID
    },
    features: {
      adSpendLimit: 25000,
      attributionModels: ['last-click', 'first-click'],
      integrations: ['meta', 'google'],
      workspaces: 1,
      supportLevel: 'email',
      apiAccess: false,
      webhooks: false,
      whiteLabel: false,
      customReports: false,
      sso: false,
      dedicatedCSM: false,
    },
    displayFeatures: [
      "Up to $25k/month ad spend",
      'Meta + Google Ads tracking',
      'Basic attribution (Last/First click)',
      'Email support',
      '1 workspace',
    ],
    additionalFeatures: [
      'Real-time dashboard',
      'Basic CSV export',
      'Weekly reports',
      'UTM tracking',
      'Basic analytics',
    ],
    cta: 'Start free trial',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing D2C brands and SMBs',
    target: 'PME, D2C brands',
    price: {
      monthly: 99,
      annual: 79, // ~$950/year vs $1188/year = 20% savings
    },
    stripePriceId: {
      monthly: 'price_growth_monthly', // Replace with actual Stripe Price ID
      annual: 'price_growth_annual',   // Replace with actual Stripe Price ID
    },
    features: {
      adSpendLimit: 100000,
      attributionModels: ['last-click', 'first-click', 'linear', 'time-decay', 'position-based'],
      integrations: ['meta', 'google', 'tiktok', 'linkedin', 'twitter', 'shopify', 'woocommerce'],
      workspaces: 3,
      supportLevel: 'priority',
      apiAccess: true,
      webhooks: true,
      whiteLabel: false,
      customReports: false,
      sso: false,
      dedicatedCSM: false,
    },
    displayFeatures: [
      "Up to $100k/month ad spend",
      'All ad platforms',
      'Multi-touch attribution',
      'Conversion sync to platforms',
      'Priority support',
      '3 workspaces',
    ],
    additionalFeatures: [
      'Advanced analytics',
      'Unlimited exports (CSV, Excel)',
      'API & Webhooks access',
      'Slack & Discord notifications',
      'Daily reports',
      'TikTok, LinkedIn, Twitter integrations',
      'Custom attribution windows',
      'Customizable dashboards',
    ],
    popular: true,
    cta: 'Start free trial',
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'For agencies and large e-commerce',
    target: 'Agences, gros e-com',
    price: {
      monthly: 199,
      annual: 159, // ~$1910/year vs $2388/year = 20% savings
    },
    stripePriceId: {
      monthly: 'price_scale_monthly', // Replace with actual Stripe Price ID
      annual: 'price_scale_annual',   // Replace with actual Stripe Price ID
    },
    features: {
      adSpendLimit: 500000,
      attributionModels: ['last-click', 'first-click', 'linear', 'time-decay', 'position-based', 'data-driven', 'custom'],
      integrations: ['meta', 'google', 'tiktok', 'linkedin', 'twitter', 'shopify', 'woocommerce', 'stripe', 'klaviyo', 'zapier', 'custom'],
      workspaces: -1, // Unlimited
      supportLevel: 'dedicated',
      apiAccess: true,
      webhooks: true,
      whiteLabel: true,
      customReports: true,
      sso: true,
      dedicatedCSM: true,
    },
    displayFeatures: [
      "Up to $500k/month ad spend",
      'Custom integrations',
      'Advanced analytics & ML',
      'Full API access',
      'Dedicated CSM',
      'Unlimited workspaces',
    ],
    additionalFeatures: [
      'White-label available',
      'Personalized onboarding',
      'Team training included',
      '99.9% SLA guaranteed',
      '24/7 priority support',
      'Custom reports',
      'Data warehouse sync',
      'SSO & SAML',
      'Quarterly security audit',
      'Priority feature requests',
    ],
    cta: 'Start free trial',
  },
];

// Enterprise plan (custom pricing, contact sales)
export const ENTERPRISE_PLAN = {
  id: 'enterprise',
  name: 'Enterprise',
  description: 'For large organizations with custom needs',
  target: 'Grands comptes',
  price: 'Custom',
  features: {
    adSpendLimit: -1, // Unlimited
    attributionModels: 'All + Custom',
    integrations: 'All + Custom',
    workspaces: -1, // Unlimited
    supportLevel: '24/7',
    apiAccess: true,
    webhooks: true,
    whiteLabel: true,
    customReports: true,
    sso: true,
    dedicatedCSM: true,
    customSLA: true,
    dedicatedInfra: true,
    customContract: true,
  },
  displayFeatures: [
    'Unlimited ad spend',
    'Custom integrations',
    'Dedicated infrastructure',
    'Custom SLA',
    'Dedicated success team',
    'Custom contract terms',
  ],
  cta: 'Contact Sales',
};

// Helper functions
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.id === planId);
}

export function getPlanByStripePriceId(priceId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(
    (plan) =>
      plan.stripePriceId.monthly === priceId ||
      plan.stripePriceId.annual === priceId
  );
}

export function isAnnualPrice(priceId: string): boolean {
  const plan = getPlanByStripePriceId(priceId);
  return plan?.stripePriceId.annual === priceId;
}

export function getMonthlyEquivalent(plan: PricingPlan, isAnnual: boolean): number {
  return isAnnual ? plan.price.annual : plan.price.monthly;
}

export function getAnnualSavings(plan: PricingPlan): number {
  const monthlyTotal = plan.price.monthly * 12;
  const annualTotal = plan.price.annual * 12;
  return monthlyTotal - annualTotal;
}

// Plan comparison for upgrade/downgrade logic
export const PLAN_HIERARCHY = ['starter', 'growth', 'scale', 'enterprise'];

export function isUpgrade(currentPlan: string, newPlan: string): boolean {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan);
  const newIndex = PLAN_HIERARCHY.indexOf(newPlan);
  return newIndex > currentIndex;
}

export function isDowngrade(currentPlan: string, newPlan: string): boolean {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan);
  const newIndex = PLAN_HIERARCHY.indexOf(newPlan);
  return newIndex < currentIndex;
}
