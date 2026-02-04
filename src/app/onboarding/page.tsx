'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWorkspace } from '@/hooks/use-workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';

// ===========================================
// PIXLY - Onboarding Flow
// Premium, human-centered experience
// ===========================================

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
];

const BENEFITS = [
  { icon: BarChart3, text: 'Attribution multi-touch' },
  { icon: Target, text: 'Tracking post-iOS 14' },
  { icon: Zap, text: 'Résultats en temps réel' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createWorkspace } = useWorkspace();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [workspaceName, setWorkspaceName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pixelId, setPixelId] = useState('');

  const firstName = user?.displayName?.split(' ')[0] || '';
  const totalSteps = STEPS.length;
  const isComplete = currentStep > totalSteps;

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;
    setIsLoading(true);
    try {
      const workspace = await createWorkspace(workspaceName.trim());
      setPixelId(workspace.pixelId);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setIsLoading(false);
    }
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

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const transition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  };

  return (
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
          {/* Logo */}
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
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[440px]">
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
                        Nom de l'espace
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
                      L'URL du site sur lequel vous mesurez vos conversions.
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
                        onKeyDown={(e) => e.key === 'Enter' && setCurrentStep(3)}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="h-12 px-5"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-medium shadow-lg shadow-primary-500/20"
                        onClick={() => setCurrentStep(3)}
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
                    {/* Pixel Code Block */}
                    <div className="relative group">
                      <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-5 text-sm text-neutral-300 leading-relaxed font-mono">
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

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="h-12 px-5"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                      </Button>
                      <Button
                        className="flex-1 h-12 text-base font-medium shadow-lg shadow-primary-500/20"
                        onClick={() => setCurrentStep(4)}
                      >
                        J'ai installé le pixel
                        <ArrowRight className="ml-2 h-4 w-4" />
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

              {/* Step 4 - Done */}
              {currentStep === 4 && (
                <motion.div key="step4" {...transition}>
                  <div className="text-center">
                    {/* Success Icon */}
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
                      Connectez vos comptes publicitaires depuis le dashboard pour voir vos premières données d'attribution.
                    </p>

                    <div className="mt-10 space-y-3">
                      <Button
                        className="w-full h-12 text-base font-medium shadow-lg shadow-primary-500/20"
                        onClick={handleComplete}
                      >
                        Accéder au dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>

                      <p className="text-xs text-neutral-400">
                        Prochaine étape : connecter Meta Ads, Google Ads ou TikTok Ads
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
