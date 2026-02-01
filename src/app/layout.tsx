import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// ===========================================
// PIXLY - Root Layout
// ===========================================

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Pixly - Marketing Attribution Platform',
    template: '%s | Pixly',
  },
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixly.app',
    siteName: 'Pixly',
    title: 'Pixly - Marketing Attribution Platform',
    description:
      'Track, attribute, and optimize your marketing spend with precision.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixly - Marketing Attribution Platform',
    description:
      'Track, attribute, and optimize your marketing spend with precision.',
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-neutral-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
