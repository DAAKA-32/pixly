'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FeatureMockup } from '@/components/landing/feature-mockups';

// ===========================================
// PIXLY - Sticky Scroll Features Section
// Desktop: sticky left title + scrollable right
// Mobile: vertical stack with scroll reveals
// Toggle: expand detailed sub-capabilities
// ===========================================

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

const FEATURE_PALETTES = [
  { from: '#059669', to: '#0891b2', light: '#ecfdf5', accent: '#059669' },
  { from: '#2563eb', to: '#4f46e5', light: '#eff6ff', accent: '#2563eb' },
  { from: '#7c3aed', to: '#c026d3', light: '#f5f3ff', accent: '#7c3aed' },
  { from: '#e11d48', to: '#ea580c', light: '#fff1f2', accent: '#e11d48' },
];

// Detailed sub-capabilities for each main feature
const FEATURE_DETAILS: string[][] = [
  ['Attribution multi-touch', '5 modèles d\'attribution', 'ROAS par canal & campagne', 'Revenus attribués en temps réel'],
  ['Analyse de funnel complète', 'Taux de conversion par étape', 'Drop-off canal par canal', 'Panier moyen & AOV'],
  ['Meta Ads (OAuth)', 'Google Ads (OAuth)', 'TikTok Ads (OAuth)', 'Stripe, Shopify & HubSpot'],
  ['Pixel first-party', 'Tracking server-side', 'Sync Meta CAPI & Google Enhanced', 'Contourne iOS 14+ & ad-blockers'],
];

interface Feature {
  number: string;
  mockupId: string;
  title: string;
  subtitle: string;
  description?: string;
  steps?: string[];
  impact?: string;
}

interface StickyFeaturesProps {
  label: string;
  title: string;
  features: Feature[];
}

// ===========================================
// Toggle Sub-components (module-level)
// ===========================================

function ToggleButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={isOpen}
      className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-full px-4 py-2 hover:border-neutral-300 hover:bg-neutral-50/80 transition-all duration-200"
    >
      Toutes les fonctionnalités
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: PREMIUM_EASE as unknown as number[] }}
        className="flex"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </motion.span>
    </button>
  );
}

function FeatureDropdown({
  features,
  onNavigate,
  className,
}: {
  features: Feature[];
  onNavigate: (index: number) => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: PREMIUM_EASE as unknown as number[] }}
      className={`z-50 rounded-xl border border-neutral-200/80 bg-white shadow-medium overflow-hidden ${className}`}
    >
      <div className="p-4 max-h-[50vh] overflow-y-auto space-y-4">
        {features.map((feature, i) => {
          const palette = FEATURE_PALETTES[i] || FEATURE_PALETTES[0];
          const details = FEATURE_DETAILS[i] || [];

          return (
            <div key={feature.number}>
              <button
                onClick={() => onNavigate(i)}
                className="flex items-center gap-2.5 mb-2 group w-full text-left"
              >
                <span
                  className="text-[10px] font-mono font-bold tracking-wider shrink-0"
                  style={{ color: palette.accent }}
                >
                  {feature.number}
                </span>
                <span className="text-sm font-semibold text-neutral-800 group-hover:text-neutral-600 transition-colors duration-200">
                  {feature.title}
                </span>
              </button>
              <ul className="space-y-1.5 pl-7">
                {details.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-neutral-500">
                    <svg
                      className="h-3 w-3 shrink-0"
                      style={{ color: palette.accent }}
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M11.5 4L5.5 10L2.5 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ===========================================
// Main Component
// ===========================================

export function StickyFeatures({ label, title, features }: StickyFeaturesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [toggleOpen, setToggleOpen] = useState(false);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Desktop: IntersectionObserver to detect which feature is centered
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(min-width: 1024px)');
    if (!mql.matches) return;

    const observers: IntersectionObserver[] = [];

    featureRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        },
        {
          rootMargin: '-35% 0px -35% 0px',
          threshold: 0,
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Close toggle on outside click or Escape
  useEffect(() => {
    if (!toggleOpen) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-feature-toggle]')) {
        setToggleOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToggleOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [toggleOpen]);

  // Scroll to a specific feature section
  const scrollToFeature = useCallback((index: number) => {
    setToggleOpen(false);

    requestAnimationFrame(() => {
      // Desktop: use feature refs
      if (window.matchMedia('(min-width: 1024px)').matches) {
        const ref = featureRefs.current[index];
        if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Mobile: find by data attribute
      const el = document.querySelector(`[data-feature-mobile="${index}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  return (
    <section id="fonctionnalités" aria-label="Fonctionnalités de Pixly">
      {/* ─── Desktop: Sticky Left + Scrollable Right ─── */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {/* Left column — Sticky */}
            <div className="w-[40%] shrink-0">
              <div className="sticky top-0 h-screen flex flex-col justify-center pr-10 xl:pr-14">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  {label}
                </span>
                <h2 className="font-serif text-4xl xl:text-[2.75rem] font-bold text-neutral-900 leading-[1.15]">
                  {title}
                </h2>

                {/* Step indicator — vertical with accent border */}
                <div className="mt-10 xl:mt-12">
                  {features.map((feature, i) => {
                    const isActive = activeIndex === i;
                    const palette = FEATURE_PALETTES[i] || FEATURE_PALETTES[0];

                    return (
                      <motion.div
                        key={feature.number}
                        className="flex items-center gap-3 py-2.5 pl-4 border-l-2"
                        animate={{
                          borderColor: isActive ? palette.accent : '#E5E7EB',
                          opacity: isActive ? 1 : 0.4,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: PREMIUM_EASE as unknown as number[],
                        }}
                      >
                        <span
                          className="text-xs font-mono font-bold tracking-wider shrink-0 transition-colors duration-500"
                          style={{ color: isActive ? palette.accent : '#9CA3AF' }}
                        >
                          {feature.number}
                        </span>
                        <span className="text-sm font-medium text-neutral-600 truncate">
                          {feature.title}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Right column — Scrollable features */}
            <div className="flex-1 min-w-0">
              {features.map((feature, i) => {
                const palette = FEATURE_PALETTES[i] || FEATURE_PALETTES[0];
                const isActive = activeIndex === i;

                return (
                  <div
                    key={feature.number}
                    ref={(el) => {
                      featureRefs.current[i] = el;
                    }}
                    className="min-h-[80vh] flex items-center py-12 xl:py-16"
                  >
                    <motion.div
                      animate={{
                        opacity: isActive ? 1 : 0.15,
                        y: isActive ? 0 : 14,
                      }}
                      transition={{
                        duration: 0.55,
                        ease: PREMIUM_EASE as unknown as number[],
                      }}
                      className="w-full"
                    >
                      {/* Number */}
                      <span
                        className="text-xs font-mono font-bold tracking-wider mb-4 block"
                        style={{ color: palette.accent }}
                      >
                        {feature.number}
                      </span>

                      {/* Title with gradient */}
                      <h3
                        className="text-2xl xl:text-3xl font-serif font-bold leading-tight mb-4"
                        style={{
                          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {feature.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-lg text-neutral-500 leading-relaxed mb-4 max-w-lg">
                        {feature.subtitle}
                      </p>

                      {/* Description */}
                      {feature.description && (
                        <p className="text-base text-neutral-400 leading-relaxed mb-6 max-w-lg">
                          {feature.description}
                        </p>
                      )}

                      {/* Steps */}
                      {feature.steps && feature.steps.length > 0 && (
                        <div className="flex flex-col gap-2.5 mb-6 max-w-lg">
                          {feature.steps.map((step, si) => (
                            <div key={si} className="flex items-start gap-3">
                              <span
                                className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: `${palette.accent}12`,
                                  color: palette.accent,
                                }}
                              >
                                {si + 1}
                              </span>
                              <span className="text-sm text-neutral-600 leading-snug pt-0.5">
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Impact */}
                      {feature.impact && (
                        <p className="text-sm font-medium mb-8 max-w-lg" style={{ color: palette.accent }}>
                          {feature.impact}
                        </p>
                      )}

                      {/* Mockup */}
                      <div
                        className="rounded-2xl p-4 xl:p-5 max-w-xl border border-black/[0.04]"
                        style={{
                          backgroundColor: palette.light,
                          backgroundImage:
                            'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                          boxShadow: '0 2px 12px -2px rgba(0,0,0,0.06)',
                        }}
                      >
                        <FeatureMockup id={feature.mockupId} />
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile & Tablet: Vertical Stack ─── */}
      <div className="lg:hidden py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {label}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-3 sm:mt-4 leading-tight">
              {title}
            </h2>

          </div>

          {/* Feature cards */}
          <div className="space-y-16 sm:space-y-20">
            {features.map((feature, i) => {
              const palette = FEATURE_PALETTES[i] || FEATURE_PALETTES[0];

              return (
                <motion.div
                  key={feature.number}
                  data-feature-mobile={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{
                    duration: 0.6,
                    ease: PREMIUM_EASE as unknown as number[],
                  }}
                >
                  {/* Number */}
                  <span
                    className="text-xs font-mono font-bold tracking-wider mb-3 block"
                    style={{ color: palette.accent }}
                  >
                    {feature.number}
                  </span>

                  {/* Title */}
                  <h3
                    className="text-xl sm:text-2xl font-serif font-bold leading-tight mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-base text-neutral-500 leading-relaxed mb-3">
                    {feature.subtitle}
                  </p>

                  {/* Description */}
                  {feature.description && (
                    <p className="text-sm text-neutral-400 leading-relaxed mb-5">
                      {feature.description}
                    </p>
                  )}

                  {/* Steps */}
                  {feature.steps && feature.steps.length > 0 && (
                    <div className="flex flex-col gap-2 mb-5">
                      {feature.steps.map((step, si) => (
                        <div key={si} className="flex items-start gap-2.5">
                          <span
                            className="flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5"
                            style={{
                              backgroundColor: `${palette.accent}12`,
                              color: palette.accent,
                            }}
                          >
                            {si + 1}
                          </span>
                          <span className="text-sm text-neutral-600 leading-snug">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Impact */}
                  {feature.impact && (
                    <p className="text-sm font-medium mb-6" style={{ color: palette.accent }}>
                      {feature.impact}
                    </p>
                  )}

                  {/* Mockup */}
                  <div
                    className="rounded-2xl p-3 sm:p-4 border border-black/[0.04]"
                    style={{
                      backgroundColor: palette.light,
                      backgroundImage:
                        'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                      boxShadow: '0 2px 12px -2px rgba(0,0,0,0.06)',
                    }}
                  >
                    <FeatureMockup id={feature.mockupId} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
