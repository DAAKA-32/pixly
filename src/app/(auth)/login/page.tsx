import { Suspense } from 'react';
import { Metadata } from 'next';
import AuthPage from '@/components/auth/login-page';

// ===========================================
// PIXLY - Login Page (Server)
// SEO: indexable public page with metadata
// Suspense required for useSearchParams in AuthPage
// ===========================================

export const metadata: Metadata = {
  title: 'Connexion',
  description:
    'Connectez-vous à votre compte Pixly pour accéder à votre tableau de bord d\'attribution marketing et suivre vos performances publicitaires.',
  alternates: {
    canonical: 'https://pixly.app/login',
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}
