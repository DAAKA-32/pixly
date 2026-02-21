import { Metadata } from 'next';
import AccountLayoutClient from './account-layout-client';

// ===========================================
// PIXLY - Account Layout (Server)
// SEO: noindex private account pages
// ===========================================

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
