import type { Metadata, Viewport } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ZoomGuard } from '@/components/ui/zoom-guard';
import { PageProgress } from '@/components/ui/page-progress';
import { JsonLd } from '@/components/seo/json-ld';

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
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pixly.app'),
  title: {
    default: 'Pixly — Attribution Marketing Multi-Touch | Mesurez votre vrai ROAS',
    template: '%s | Pixly',
  },
  description:
    'Pixly connecte vos plateformes publicitaires à vos ventes réelles. Attribution multi-touch, tracking server-side et analytics avancés pour optimiser votre ROAS, même avec iOS 14+.',
  keywords: [
    'attribution marketing',
    'tracking publicitaire',
    'ROAS',
    'suivi des conversions',
    'marketing analytics',
    'attribution multi-touch',
    'tracking server-side',
    'pixel server-side',
    'Meta Ads tracking',
    'Google Ads attribution',
    'TikTok Ads tracking',
    'tableau de bord marketing',
    'analyse performance marketing',
    'SaaS marketing',
    'iOS 14 tracking',
  ],
  authors: [{ name: 'Pixly', url: 'https://pixly.app' }],
  creator: 'Pixly',
  publisher: 'Pixly',
  icons: {
    icon: [{ url: '/logo-pixly.png', type: 'image/png' }],
    apple: [{ url: '/logo-pixly.png', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://pixly.app',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://pixly.app',
    siteName: 'Pixly',
    title: 'Pixly — Attribution Marketing Multi-Touch | Mesurez votre vrai ROAS',
    description:
      'Connectez vos plateformes publicitaires à vos ventes réelles. Attribution multi-touch, tracking server-side et analytics avancés pour un ROAS précis.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pixly — Plateforme d\'attribution marketing multi-touch',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixly — Attribution Marketing Multi-Touch',
    description:
      'Connectez vos plateformes publicitaires à vos ventes réelles. Tracking server-side et analytics avancés pour un ROAS précis.',
    images: ['/og-image.png'],
    creator: '@pixlyapp',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pixly',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${dmSerif.variable}`} suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body className="min-h-screen bg-neutral-50 antialiased" suppressHydrationWarning>
        <ZoomGuard />
        <PageProgress />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
