import type { Metadata } from 'next';
import AuthLayoutClient from './auth-layout-client';

// ===========================================
// PIXLY - Auth Layout (Server)
// Server component wrapper for metadata support
// ===========================================

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
