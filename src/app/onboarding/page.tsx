import { Metadata } from 'next';
import OnboardingClient from './onboarding-client';

// ===========================================
// PIXLY - Onboarding Page (Server)
// SEO: noindex private onboarding page
// ===========================================

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
