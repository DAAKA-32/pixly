'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useWorkspace } from '@/hooks/use-workspace';
import { SidebarProvider } from '@/hooks/use-sidebar';
import { I18nProvider } from '@/lib/i18n';
import { TutorialProvider } from '@/hooks/use-tutorial';
import { Sidebar } from '@/components/dashboard/sidebar';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { DashboardMain } from '@/components/dashboard/dashboard-main';
import { WelcomeModal } from '@/components/onboarding/welcome-modal';
import { PixelTutorialDrawer } from '@/components/tutorial/pixel-tutorial-drawer';
import { useToast } from '@/components/ui/toast';
import { TermsModal } from '@/components/auth/terms-modal';
import { needsTermsAcceptance } from '@/lib/auth/terms';

// ===========================================
// PIXLY - Dashboard Layout (Client)
// Reliable loading with timeout fallback
// Collapsible sidebar support
// ===========================================

const LOADING_TIMEOUT = 15000; // 15s max loading

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout, user, refreshUser } = useAuth();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [welcomeToastShown, setWelcomeToastShown] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show welcome toast after successful login
  useEffect(() => {
    if (!mounted || welcomeToastShown) return;
    if (!isAuthenticated || authLoading || workspaceLoading) return;

    const loginSuccess = sessionStorage.getItem('pixly_login_success');
    if (loginSuccess) {
      sessionStorage.removeItem('pixly_login_success');
      setWelcomeToastShown(true);
      const displayName = user?.displayName?.split(' ')[0] || 'vous';
      toast.success('Connexion réussie', `Bon retour, ${displayName} !`);
    }
  }, [mounted, isAuthenticated, authLoading, workspaceLoading, user, toast, welcomeToastShown]);

  // Safety timeout - prevent infinite loading
  useEffect(() => {
    if (!mounted) return;
    // If still loading after timeout, force error state
    const isStillLoading = authLoading || (isAuthenticated && workspaceLoading);
    if (!isStillLoading) return;

    const timer = setTimeout(() => {
      setTimedOut(true);
    }, LOADING_TIMEOUT);

    return () => clearTimeout(timer);
  }, [mounted, authLoading, isAuthenticated, workspaceLoading]);

  // Handle redirects after loading completes
  useEffect(() => {
    if (!mounted || authLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (workspaceLoading) return;

    if (!currentWorkspace) {
      router.replace('/onboarding');
      return;
    }

    // Block access for free plan users — must complete onboarding + checkout
    if (user?.plan === 'free') {
      router.replace('/onboarding');
    }
  }, [mounted, authLoading, isAuthenticated, workspaceLoading, currentWorkspace, user, router]);

  // Timeout fallback - show error instead of infinite skeleton
  if (timedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="max-w-md text-center px-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Chargement trop long
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            Le dashboard met du temps à se charger. Vérifiez votre connexion ou réessayez.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/login';
              }}
              className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show skeleton during initial loading
  if (!mounted || authLoading) {
    return <DashboardSkeleton />;
  }

  // Not authenticated - show skeleton while redirecting
  if (!isAuthenticated) {
    return <DashboardSkeleton />;
  }

  // Workspace loading or no workspace - show skeleton
  if (workspaceLoading || !currentWorkspace) {
    return <DashboardSkeleton />;
  }

  // Terms acceptance safety net — block dashboard if terms not accepted
  if (user && needsTermsAcceptance(user.termsAcceptedAt, user.termsVersion)) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <TermsModal onAccepted={() => refreshUser()} />
      </div>
    );
  }

  // Ready - render dashboard with sidebar provider
  return (
    <I18nProvider>
      <TutorialProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-neutral-50">
            <Sidebar />
            <DashboardMain>{children}</DashboardMain>
            <WelcomeModal />
            <PixelTutorialDrawer />
          </div>
        </SidebarProvider>
      </TutorialProvider>
    </I18nProvider>
  );
}
