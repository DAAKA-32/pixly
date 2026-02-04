import type { Metadata, Viewport } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ZoomGuard } from '@/components/ui/zoom-guard';

// ===========================================
// PIXLY - Root Layout
// Typography: Inter (UI/body) + DM Serif Display (headings)
// ===========================================

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: 'Pixly',
  description:
    'Track, attribute, and optimize your marketing spend with precision. Get accurate ROAS data across all your ad channels.',
  keywords: [
    'marketing attribution',
    'ad tracking',
    'ROAS',
    'conversion tracking',
    'marketing analytics',
  ],
  authors: [{ name: 'Pixly' }],
  icons: {
    icon: [{ url: '/logo.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/logo.jpg', type: 'image/jpeg' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://pixly.app',
    siteName: 'Pixly',
    title: 'Pixly',
    description:
      'Track, attribute, and optimize your marketing spend with precision.',
    images: [
      {
        url: '/logo.jpg',
        width: 1080,
        height: 1080,
        alt: 'Pixly',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Pixly',
    description:
      'Track, attribute, and optimize your marketing spend with precision.',
    images: ['/logo.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pixly',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 antialiased" suppressHydrationWarning>
        <ZoomGuard />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
