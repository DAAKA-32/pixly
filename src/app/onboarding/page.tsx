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
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWorkspace } from '@/hooks/use-workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// ===========================================
// PIXLY - Onboarding Flow
// ===========================================

const STEPS = [
  { id: 1, title: 'Create Workspace', icon: Building2 },
  { id: 2, title: 'Website Details', icon: Globe },
  { id: 3, title: 'Install Pixel', icon: Code },
  { id: 4, title: 'Complete', icon: Check },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createWorkspace } = useWorkspace();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [workspaceName, setWorkspaceName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pixelId, setPixelId] = useState('');

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
    const pixelCode = getPixelCode();
    navigator.clipboard.writeText(pixelCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPixelCode = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
    return `<!-- Pixly Pixel -->
<script src="${baseUrl}/pixel.js" data-pixel-id="${pixelId}" async></script>`;
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    currentStep >= step.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-16 transition-colors sm:w-24 md:w-32 ${
                      currentStep > step.id ? 'bg-primary-500' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between px-1">
            {STEPS.map((step) => (
              <span
                key={step.id}
                className={`text-xs font-medium ${
                  currentStep >= step.id ? 'text-primary-600' : 'text-neutral-400'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-neutral-900">
                      Welcome to Pixly!
                    </h2>
                    <p className="mt-2 text-neutral-500">
                      Let's set up your workspace to start tracking conversions
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Workspace name
                      </label>
                      <Input
                        placeholder="e.g., My Company"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        icon={<Building2 className="h-4 w-4" />}
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        This is usually your company or project name
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleCreateWorkspace}
                      isLoading={isLoading}
                      disabled={!workspaceName.trim()}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-neutral-900">
                      Website Details
                    </h2>
                    <p className="mt-2 text-neutral-500">
                      Where will you be tracking conversions?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Website URL
                      </label>
                      <Input
                        placeholder="https://yourwebsite.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        icon={<Globe className="h-4 w-4" />}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setCurrentStep(3)}
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-neutral-900">
                      Install Tracking Pixel
                    </h2>
                    <p className="mt-2 text-neutral-500">
                      Add this code to your website's &lt;head&gt; section
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-sm text-neutral-100">
                        <code>{getPixelCode()}</code>
                      </pre>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={handleCopyPixel}
                      >
                        {copied ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="rounded-xl bg-primary-50 p-4">
                      <h4 className="font-medium text-primary-900">
                        Your Pixel ID
                      </h4>
                      <p className="mt-1 font-mono text-sm text-primary-700">
                        {pixelId}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setCurrentStep(4)}
                      >
                        I've installed the pixel
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                    <Check className="h-10 w-10 text-primary-600" />
                  </div>

                  <h2 className="text-2xl font-bold text-neutral-900">
                    You're all set!
                  </h2>
                  <p className="mt-2 text-neutral-500">
                    Your workspace is ready. Start tracking your marketing performance.
                  </p>

                  <div className="mt-8 space-y-4">
                    <Button className="w-full" onClick={handleComplete}>
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="text-sm text-neutral-500">
                      Next: Connect your ad accounts to see your full attribution data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
