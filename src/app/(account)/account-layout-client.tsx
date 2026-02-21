'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useWorkspace } from '@/hooks/use-workspace';
import { LogoLoader } from '@/components/ui/loader';

// ===========================================
// PIXLY - Account Layout (Client)
// Full-width layout without sidebar
// Used for Profile and Settings pages
// ===========================================

export default function AccountLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { currentWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Loading state with premium loader
  if (!mounted || authLoading || !isAuthenticated || workspaceLoading || !currentWorkspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <LogoLoader size="md" text="Chargement du profil..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
    </div>
  );
}
