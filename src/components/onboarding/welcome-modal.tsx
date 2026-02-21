'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Route, Zap, ArrowRight, X } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';

// ===========================================
// PIXLY - Welcome Modal
// 3-slide product tour shown after first workspace creation
// ===========================================

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

interface Slide {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: BarChart3,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'Vos donn\u00e9es, enfin claires',
    description:
      'Pixly centralise les performances de tous vos canaux publicitaires en un seul dashboard. Fini les onglets multiples et les exports manuels.',
  },
  {
    icon: Route,
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
    title: 'Attribution multi-touch',
    description:
      'Suivez le parcours complet de vos clients et attribuez chaque euro de revenu au bon canal. Comparez 5 mod\u00e8les d\u2019attribution en un clic.',
  },
  {
    icon: Zap,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Agissez en temps r\u00e9el',
    description:
      'Alertes automatiques, exports programm\u00e9s et collaboration d\u2019\u00e9quipe pour optimiser vos campagnes avant qu\u2019il ne soit trop tard.',
  },
];

export function WelcomeModal() {
  const { shouldShowWelcome, isReady, completeOnboarding } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!isReady || !shouldShowWelcome) return null;

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      setDirection(1);
      setCurrentSlide((s) => s + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={handleSkip}
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.97, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.97, y: 16, opacity: 0 }}
          transition={{ duration: 0.3, ease: PREMIUM_EASE as unknown as number[] }}
          className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Bienvenue sur Pixly"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Slide content */}
          <div className="overflow-hidden px-8 pb-6 pt-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: PREMIUM_EASE as unknown as number[] }}
                className="flex flex-col items-center text-center"
              >
                {/* Icon */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${slide.iconBg}`}
                >
                  <Icon className={`h-8 w-8 ${slide.iconColor}`} />
                </div>

                {/* Title */}
                <h2 className="mt-6 font-serif text-2xl font-semibold text-neutral-900">
                  {slide.title}
                </h2>

                {/* Description */}
                <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-neutral-500">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer: dots + buttons */}
          <div className="flex items-center justify-between border-t border-neutral-100 px-8 py-4">
            {/* Skip */}
            <button
              onClick={handleSkip}
              className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-neutral-600"
            >
              Passer
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'w-4 bg-neutral-900'
                      : 'w-1.5 bg-neutral-200'
                  }`}
                />
              ))}
            </div>

            {/* Next / Finish */}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800"
            >
              {isLastSlide ? 'Commencer' : 'Suivant'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
