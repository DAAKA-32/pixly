import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Private dashboard routes
          '/dashboard',
          '/dashboard/',
          '/attribution',
          '/attribution/',
          '/funnel',
          '/funnel/',
          '/audience',
          '/audience/',
          '/team',
          '/team/',
          '/integrations',
          '/integrations/',
          '/billing',
          '/billing/',
          // Account routes
          '/settings',
          '/profile',
          // Auth & onboarding
          '/onboarding',
          '/checkout',
          '/signup',
          // API
          '/api/',
        ],
      },
    ],
    sitemap: 'https://pixly.app/sitemap.xml',
  };
}
