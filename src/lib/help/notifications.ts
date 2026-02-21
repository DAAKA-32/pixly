// ===========================================
// PIXLY - Page Notification Data
// Proactive pedagogical notifications per page
// ===========================================

import type { HelpPageId } from '@/lib/help/content';

export interface PageNotificationData {
  pageId: HelpPageId;
  title: string;
  description: string;
}

export const PAGE_NOTIFICATIONS: Record<HelpPageId, PageNotificationData> = {
  dashboard: {
    pageId: 'dashboard',
    title: 'Votre tableau de bord',
    description:
      'Retrouvez ici vos KPIs cl\u00e9s, l\u2019\u00e9volution de vos revenus et l\u2019activit\u00e9 de vos campagnes en temps r\u00e9el.',
  },
  attribution: {
    pageId: 'attribution',
    title: 'Attribution multi-touch',
    description:
      'D\u00e9couvrez comment vos revenus sont attribu\u00e9s \u00e0 chaque canal. Comparez les mod\u00e8les pour identifier vos leviers les plus performants.',
  },
  funnel: {
    pageId: 'funnel',
    title: 'Analyse de funnel',
    description:
      'Visualisez chaque \u00e9tape du parcours d\u2019achat et identifiez o\u00f9 vous perdez le plus de clients potentiels.',
  },
  audience: {
    pageId: 'audience',
    title: 'Segmentation audience',
    description:
      'Explorez votre audience par appareil, pays et canal pour affiner votre ciblage et vos ench\u00e8res.',
  },
  integrations: {
    pageId: 'integrations',
    title: 'Vos int\u00e9grations',
    description:
      'Connectez vos plateformes publicitaires pour importer vos d\u00e9penses et synchroniser vos conversions automatiquement.',
  },
  billing: {
    pageId: 'billing',
    title: 'Facturation',
    description:
      'G\u00e9rez votre abonnement, consultez vos factures et mettez \u00e0 jour votre moyen de paiement.',
  },
  team: {
    pageId: 'team',
    title: 'Gestion d\u2019\u00e9quipe',
    description:
      'Invitez des collaborateurs et attribuez des r\u00f4les pour partager l\u2019acc\u00e8s \u00e0 votre espace de travail.',
  },
};

const ALL_PAGE_IDS: HelpPageId[] = [
  'dashboard',
  'attribution',
  'funnel',
  'audience',
  'integrations',
  'billing',
  'team',
];

export function getNotificationForRoute(
  pathname: string
): PageNotificationData | null {
  const pageId = pathname.replace('/', '') as HelpPageId;
  return PAGE_NOTIFICATIONS[pageId] ?? null;
}

export { ALL_PAGE_IDS };
