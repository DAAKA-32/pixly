'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Code2,
  Eye,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { useTutorial } from '@/hooks/use-tutorial';
import { Button } from '@/components/ui/button';

// ===========================================
// PIXLY — Pixel Tutorial Drawer
// Step-by-step pedagogical explanation
// ===========================================

const EASE = [0.22, 1, 0.36, 1] as const;

interface TutorialStep {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  content: React.ReactNode;
}

const STEPS: TutorialStep[] = [
  {
    id: 'what',
    icon: <Lightbulb className="h-5 w-5" />,
    iconBg: 'bg-amber-50 text-amber-600',
    title: "Qu'est-ce qu'un pixel ?",
    content: (
      <div className="space-y-4">
        <p className="text-[14px] leading-relaxed text-neutral-600">
          Un <strong className="text-neutral-900">pixel de tracking</strong> est un petit bout de code
          invisible ajouté sur votre site web. Il fonctionne comme un{' '}
          <strong className="text-neutral-900">capteur</strong> : chaque fois qu&apos;un visiteur
          arrive sur votre site, le pixel enregistre d&apos;où il vient.
        </p>

        <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-4">
          <p className="text-[13px] text-amber-800 leading-relaxed">
            <strong>Exemple concret :</strong> Un client clique sur votre publicité Facebook,
            visite votre site et achète un produit. Le pixel détecte cette visite et fait
            le lien avec la publicité d&apos;origine. Vous savez alors que cette vente vient de
            Facebook.
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="text-[12px] font-medium text-neutral-500 uppercase tracking-wide">
            Ce que le pixel enregistre
          </p>
          {[
            'La source du visiteur (publicité, recherche, lien direct...)',
            "Les pages visitées sur votre site",
            'Les conversions (achats, inscriptions, formulaires...)',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-[13px] text-neutral-600">{item}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'install',
    icon: <Code2 className="h-5 w-5" />,
    iconBg: 'bg-primary-50 text-primary-600',
    title: 'Comment l\u2019installer ?',
    content: (
      <div className="space-y-4">
        <p className="text-[14px] leading-relaxed text-neutral-600">
          L&apos;installation prend <strong className="text-neutral-900">moins de 2 minutes</strong>.
          Il suffit de copier une seule ligne de code et de la coller sur votre site.
        </p>

        <div className="space-y-3">
          {[
            {
              step: '1',
              title: 'Copiez le code du pixel',
              desc: 'Un bouton "Copier" est disponible juste à côté du code.',
            },
            {
              step: '2',
              title: 'Ouvrez le code de votre site',
              desc: 'Accédez à l\u2019en-tête HTML de votre site (balise <head>).',
            },
            {
              step: '3',
              title: 'Collez le code',
              desc: 'Insérez-le n\u2019importe où entre les balises <head> et </head>.',
            },
            {
              step: '4',
              title: 'Enregistrez et publiez',
              desc: 'C\u2019est tout. Le pixel commence à fonctionner immédiatement.',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[12px] font-bold text-primary-600">
                {item.step}
              </div>
              <div className="pt-0.5">
                <p className="text-[13px] font-medium text-neutral-900">{item.title}</p>
                <p className="mt-0.5 text-[12px] text-neutral-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-primary-50/60 border border-primary-100 p-4">
          <p className="text-[12px] font-medium text-primary-800 mb-1">Pas de développeur ?</p>
          <p className="text-[12px] text-primary-700 leading-relaxed">
            Sur WordPress, utilisez le plugin "Insert Headers and Footers".
            Sur Shopify, collez le code dans Online Store → Themes → Edit code → theme.liquid.
            Sur Webflow, allez dans Project Settings → Custom Code.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'visibility',
    icon: <Eye className="h-5 w-5" />,
    iconBg: 'bg-violet-50 text-violet-600',
    title: 'Est-ce visible par les visiteurs ?',
    content: (
      <div className="space-y-4">
        <p className="text-[14px] leading-relaxed text-neutral-600">
          <strong className="text-neutral-900">Non, le pixel est totalement invisible.</strong>{' '}
          Vos visiteurs ne verront rien de différent sur votre site. Le code s&apos;exécute en
          arrière-plan sans affecter l&apos;apparence ni la vitesse de chargement.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Invisible', desc: 'Aucun élément visible' },
            { label: 'Léger', desc: '< 5 Ko de code' },
            { label: 'Asynchrone', desc: 'Ne ralentit pas le site' },
            { label: 'Sécurisé', desc: 'Données chiffrées' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 text-center"
            >
              <p className="text-[13px] font-medium text-neutral-900">{item.label}</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-4">
          <p className="text-[12px] text-violet-800 leading-relaxed">
            <strong>Confidentialité :</strong> Le pixel Pixly ne collecte aucune donnée
            personnelle sensible. Il identifie uniquement la source de trafic et les
            événements de conversion que vous définissez.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'impact',
    icon: <BarChart3 className="h-5 w-5" />,
    iconBg: 'bg-emerald-50 text-emerald-600',
    title: 'Quel impact sur vos résultats ?',
    content: (
      <div className="space-y-4">
        <p className="text-[14px] leading-relaxed text-neutral-600">
          Une fois le pixel installé, Pixly peut enfin{' '}
          <strong className="text-neutral-900">relier chaque vente à sa source</strong>. C&apos;est
          la base de l&apos;attribution marketing.
        </p>

        <div className="space-y-2.5">
          <p className="text-[12px] font-medium text-neutral-500 uppercase tracking-wide">
            Ce que vous pourrez voir
          </p>
          {[
            {
              title: 'Attribution précise',
              desc: 'Chaque conversion est reliée à la publicité qui l\u2019a générée.',
            },
            {
              title: 'ROAS réel',
              desc: 'Vous voyez le retour sur investissement réel de chaque campagne.',
            },
            {
              title: 'Optimisation budgétaire',
              desc: 'Investissez plus sur ce qui fonctionne, coupez ce qui ne performe pas.',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-neutral-200/80 bg-white p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
              <div>
                <p className="text-[13px] font-medium text-neutral-900">{item.title}</p>
                <p className="mt-0.5 text-[12px] text-neutral-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-4">
          <p className="text-[12px] text-emerald-800 leading-relaxed">
            <strong>En résumé :</strong> Sans pixel, vous investissez à l&apos;aveugle. Avec le
            pixel, chaque euro dépensé en publicité est traçable.
          </p>
        </div>
      </div>
    ),
  },
];

export function PixelTutorialDrawer() {
  const { isPixelTutorialOpen, closePixelTutorial, completePixelTutorial } = useTutorial();
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];
  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;

  const handleNext = useCallback(() => {
    if (isLast) {
      completePixelTutorial();
      closePixelTutorial();
      setCurrentStep(0);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLast, completePixelTutorial, closePixelTutorial]);

  const handlePrev = useCallback(() => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  }, [isFirst]);

  const handleClose = useCallback(() => {
    closePixelTutorial();
    // Reset to first step for next opening
    setTimeout(() => setCurrentStep(0), 300);
  }, [closePixelTutorial]);

  return (
    <AnimatePresence>
      {isPixelTutorialOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-neutral-900">
                    Comprendre le pixel
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    {currentStep + 1} / {totalSteps}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-neutral-100">
              <motion.div
                className="h-full bg-neutral-900"
                initial={false}
                animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  {/* Step icon + title */}
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.iconBg}`}
                    >
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">{step.title}</h3>
                  </div>

                  {/* Step content */}
                  {step.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step navigation dots */}
            <div className="flex justify-center gap-1.5 pb-3">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === currentStep
                      ? 'w-6 bg-neutral-900'
                      : i < currentStep
                        ? 'w-1.5 bg-neutral-400'
                        : 'w-1.5 bg-neutral-200'
                  }`}
                />
              ))}
            </div>

            {/* Footer navigation */}
            <div className="border-t border-neutral-100 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                {!isFirst ? (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  >
                    Fermer
                  </button>
                )}

                <Button
                  onClick={handleNext}
                  className="h-10 px-5 text-[13px] font-medium"
                >
                  {isLast ? (
                    <>
                      J&apos;ai compris
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Suivant
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Trigger button — reusable in onboarding + integrations
export function PixelTutorialTrigger({
  variant = 'default',
  className,
}: {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}) {
  const { openPixelTutorial, pixelTutorialDone } = useTutorial();

  if (variant === 'inline') {
    return (
      <button
        onClick={openPixelTutorial}
        className={`inline-flex items-center gap-1 text-[12px] font-medium text-primary-600 transition-colors hover:text-primary-700 ${className || ''}`}
      >
        <Lightbulb className="h-3 w-3" />
        {pixelTutorialDone ? 'Revoir le guide' : "C'est quoi un pixel ?"}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={openPixelTutorial}
        className={`flex items-center gap-1.5 rounded-lg border border-neutral-200/80 px-3 py-2 sm:py-1.5 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 ${className || ''}`}
      >
        <Lightbulb className="h-3 w-3" />
        {pixelTutorialDone ? 'Revoir' : 'Guide'}
      </button>
    );
  }

  // Default: card-style trigger for onboarding
  return (
    <button
      onClick={openPixelTutorial}
      className={`group flex w-full items-center gap-3 rounded-xl border border-primary-200/80 bg-primary-50/40 px-4 py-3 text-left transition-all hover:bg-primary-50/70 hover:border-primary-300 ${className || ''}`}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100/80">
        <Lightbulb className="h-4 w-4 text-primary-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-primary-900">
          {pixelTutorialDone ? 'Revoir le guide du pixel' : "Qu'est-ce qu'un pixel de tracking ?"}
        </p>
        <p className="mt-0.5 text-[11px] text-primary-600/80">
          {pixelTutorialDone ? 'Consultez à nouveau les explications' : 'Découvrir en 2 minutes'}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary-400 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
