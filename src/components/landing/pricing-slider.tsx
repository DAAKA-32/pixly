'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

// ===========================================
// PIXLY - Interactive Pricing Slider
// Premium UX with guided navigation
// ===========================================

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  additionalFeatures?: string[];
  popular?: boolean;
  cta: string;
  isFree?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'Idéal pour les petites entreprises',
    features: [
      "Jusqu'à 25k€ de dépenses pub/mois",
      'Meta + Google tracking',
      'Attribution basique',
      'Support email',
      '1 workspace',
    ],
    additionalFeatures: [
      'Dashboard en temps réel',
      'Export CSV basique',
      'Intégration Meta Ads',
      'Intégration Google Ads',
      'Rapports hebdomadaires',
    ],
    cta: 'Commencer',
    isFree: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 99,
    description: 'Pour les marques en croissance',
    features: [
      "Jusqu'à 100k€ de dépenses pub/mois",
      'Toutes les plateformes',
      'Attribution multi-touch',
      'Synchronisation conversions',
      'Support prioritaire',
      '3 workspaces',
    ],
    additionalFeatures: [
      'Analytics avancés',
      'Export illimité (CSV, Excel)',
      'Webhooks & API',
      'Slack & Discord notifications',
      'Rapports quotidiens',
      'Intégrations TikTok, LinkedIn, Twitter',
      'Attribution personnalisée',
      'Tableaux de bord personnalisables',
    ],
    popular: true,
    cta: 'Essayer gratuitement',
    isFree: false,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 199,
    description: 'Pour les gros annonceurs',
    features: [
      "Jusqu'à 500k€ de dépenses pub/mois",
      'Intégrations personnalisées',
      'Analytics avancés',
      'Accès API complet',
      'CSM dédié',
      'Workspaces illimités',
    ],
    additionalFeatures: [
      'White-label disponible',
      'Onboarding personnalisé',
      'Formation équipe incluse',
      'SLA 99.9% garanti',
      'Support 24/7 prioritaire',
      'Rapports sur mesure',
      'Data warehouse sync',
      'SSO & SAML',
      'Audit de sécurité trimestriel',
      'Feature requests prioritaires',
    ],
    popular: false,
    cta: 'Contactez-nous',
    isFree: false,
  },
];

export function PricingSlider() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(1); // Start with Growth (recommended)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  const currentPlan = plans[currentIndex];

  const nextSlide = () => {
    if (currentIndex < plans.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const toggleFeatures = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const handleCtaClick = (plan: PricingPlan) => {
    if (plan.isFree) {
      // Free plan - just sign up
      router.push('/login');
      return;
    }

    // Paid plans
    if (!isAuthenticated) {
      // Redirect to login, then to checkout
      router.push('/login');
    } else {
      // Redirect to checkout with selected plan
      router.push(`/checkout?plan=${plan.id}`);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      {/* Guide Text */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Glissez pour découvrir tous nos plans</span>
          <span className="sm:hidden">Découvrez nos plans</span>
        </div>
      </motion.div>

      {/* Slider Container */}
      <div className="relative h-[600px] sm:h-[650px] flex items-center justify-center overflow-hidden">
        {/* Navigation Arrows */}
        <motion.button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className={`absolute left-0 z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-lg transition-all duration-300 ${
            currentIndex === 0
              ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
              : 'border-primary-500 text-primary-600 hover:bg-primary-50 hover:scale-110'
          }`}
          whileHover={{ scale: currentIndex === 0 ? 1 : 1.1 }}
          whileTap={{ scale: currentIndex === 0 ? 1 : 0.95 }}
        >
          <ChevronLeft className="h-6 w-6" />
        </motion.button>

        <motion.button
          onClick={nextSlide}
          disabled={currentIndex === plans.length - 1}
          className={`absolute right-0 z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-lg transition-all duration-300 ${
            currentIndex === plans.length - 1
              ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
              : 'border-primary-500 text-primary-600 hover:bg-primary-50 hover:scale-110'
          }`}
          whileHover={{ scale: currentIndex === plans.length - 1 ? 1 : 1.1 }}
          whileTap={{ scale: currentIndex === plans.length - 1 ? 1 : 0.95 }}
        >
          <ChevronRight className="h-6 w-6" />
        </motion.button>

        {/* Card Slider */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                nextSlide();
              } else if (swipe > 10000) {
                prevSlide();
              }
            }}
            className="absolute w-full max-w-md px-4 sm:px-0 cursor-grab active:cursor-grabbing"
          >
            <div
              className={`relative rounded-3xl border-2 bg-white p-8 shadow-xl transition-all duration-300 ${
                currentPlan.popular
                  ? 'border-primary-500 shadow-2xl shadow-primary-500/20'
                  : 'border-neutral-200'
              }`}
            >
              {/* Popular Badge */}
              {currentPlan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" />
                    Le plus populaire
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  {currentPlan.name}
                </h3>
                <p className="text-sm text-neutral-500">{currentPlan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-neutral-900">
                    {currentPlan.price}
                  </span>
                  <span className="text-xl text-neutral-500">€/mois</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {currentPlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-50">
                        <Check className="h-3.5 w-3.5 text-primary-600" />
                      </div>
                    </div>
                    <span className="text-sm text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Additional Features (Expandable) */}
              {currentPlan.additionalFeatures && (
                <div className="mb-6">
                  <button
                    onClick={() => toggleFeatures(currentPlan.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-100"
                  >
                    <span>Voir toutes les fonctionnalités</span>
                    <motion.div
                      animate={{ rotate: expandedPlan === currentPlan.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedPlan === currentPlan.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-2 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                          {currentPlan.additionalFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-0.5">
                                <Check className="h-4 w-4 text-primary-500" />
                              </div>
                              <span className="text-xs text-neutral-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* CTA Button */}
              <Button
                onClick={() => handleCtaClick(currentPlan)}
                className={`w-full h-12 text-base font-semibold shadow-lg transition-all ${
                  currentPlan.popular
                    ? 'shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40'
                    : 'shadow-neutral-900/20 hover:shadow-xl hover:shadow-neutral-900/30'
                }`}
                variant={currentPlan.popular ? 'primary' : 'outline'}
              >
                {currentPlan.cta}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Navigation */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {plans.map((plan, idx) => (
          <button
            key={plan.id}
            onClick={() => goToSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-primary-500'
                : 'w-2 bg-neutral-300 hover:bg-neutral-400'
            }`}
            aria-label={`Aller au plan ${plan.name}`}
          />
        ))}
      </div>

      {/* Plan Names Below (Mobile Helper) */}
      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        {plans.map((plan, idx) => (
          <button
            key={plan.id}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 ${
              idx === currentIndex
                ? 'font-bold text-primary-600'
                : 'font-medium text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {plan.name}
          </button>
        ))}
      </div>
    </div>
  );
}
