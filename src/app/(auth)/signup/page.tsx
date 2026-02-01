'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthTransition } from '@/components/auth/auth-transition';

// ===========================================
// PIXLY - Signup Redirect
// Clean redirect to unified auth page
// ===========================================

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Clean redirect - no URL params
    router.replace('/login');
  }, [router]);

  // Premium loading state while redirecting
  return <AuthTransition message="Redirection vers la page de connexion..." />;
}
