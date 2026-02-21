import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// ===========================================
// PIXLY - Signup Redirect (Server)
// SEO: noindex, server-side redirect to /login
// ===========================================

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  redirect('/login?mode=signup');
}
