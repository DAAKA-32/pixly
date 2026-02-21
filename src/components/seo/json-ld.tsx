// ===========================================
// PIXLY - JSON-LD Structured Data
// Schema.org markup for rich SERP results
// Server Component — injected in root layout
// ===========================================

const BASE_URL = 'https://pixly.app';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Pixly',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo-pixly.png`,
    width: 512,
    height: 512,
  },
  description:
    'Pixly est la plateforme d\'attribution marketing multi-touch qui connecte vos plateformes publicitaires à vos ventes réelles.',
  founder: {
    '@type': 'Person',
    '@id': `${BASE_URL}/#founder`,
    name: 'Emilien Nepveu',
    jobTitle: 'CEO & Founder',
    url: 'https://www.linkedin.com/in/e-nepveu-58a38127a/',
    description:
      'Expert en marketing digital et attribution publicitaire. Fondateur de Pixly après avoir accompagné des dizaines d\'entreprises dans l\'optimisation de leurs campagnes.',
    sameAs: ['https://www.linkedin.com/in/e-nepveu-58a38127a/'],
    worksFor: { '@id': `${BASE_URL}/#organization` },
  },
  foundingDate: '2024',
  sameAs: [
    'https://www.linkedin.com/company/pixlyapp',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@pixly.app',
      availableLanguage: ['French', 'English'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'contact@pixly.app',
      availableLanguage: ['French', 'English'],
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'FR',
  },
  knowsAbout: [
    'Attribution marketing',
    'Marketing analytics',
    'Server-side tracking',
    'ROAS optimization',
    'Multi-touch attribution',
    'Conversion tracking',
  ],
};

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Pixly',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Marketing Analytics',
  operatingSystem: 'Web',
  url: BASE_URL,
  description:
    'Plateforme d\'attribution marketing multi-touch avec tracking server-side, analytics avancés et intégrations Meta Ads, Google Ads, TikTok Ads.',
  featureList: [
    'Attribution multi-touch (5 modèles)',
    'Tracking server-side résistant iOS 14+',
    'Intégration Meta Ads, Google Ads, TikTok Ads',
    'Synchronisation Conversions API (CAPI)',
    'Capture automatique des Click IDs (fbclid, gclid, ttclid)',
    'Tableau de bord en temps réel',
    'Analyse de funnel',
    'Rapports personnalisés',
  ],
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '49',
      priceCurrency: 'EUR',
      billingIncrement: 'P1M',
      description: 'Pour les entrepreneurs et petites équipes — jusqu\'à 25k€ de dépenses/mois',
      eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
    },
    {
      '@type': 'Offer',
      name: 'Growth',
      price: '99',
      priceCurrency: 'EUR',
      billingIncrement: 'P1M',
      description: 'Pour les équipes marketing en croissance — toutes les plateformes, attribution multi-touch',
      eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
    },
    {
      '@type': 'Offer',
      name: 'Scale',
      price: '199',
      priceCurrency: 'EUR',
      billingIncrement: 'P1M',
      description: 'Pour les annonceurs avancés — dépenses illimitées, intégrations sur mesure',
      eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127',
    bestRating: '5',
  },
  creator: { '@id': `${BASE_URL}/#organization` },
  screenshot: `${BASE_URL}/og-image.png`,
};

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'Pixly',
  url: BASE_URL,
  description:
    'Plateforme d\'attribution marketing multi-touch pour mesurer votre vrai ROAS.',
  inLanguage: 'fr',
  publisher: { '@id': `${BASE_URL}/#organization` },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que l\'attribution marketing multi-touch ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'L\'attribution marketing multi-touch est une méthode d\'analyse qui attribue une valeur à chaque point de contact du parcours client, pas uniquement au dernier clic. Pixly analyse tous les canaux publicitaires (Meta Ads, Google Ads, TikTok, etc.) pour déterminer la contribution réelle de chaque campagne à vos conversions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment Pixly fonctionne-t-il avec les restrictions iOS 14+ ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pixly utilise un tracking server-side qui contourne les limitations d\'iOS 14.5+ et des bloqueurs de publicités. Notre pixel first-party capture les données de conversion directement sur votre serveur, vous permettant de récupérer jusqu\'à 40% des conversions perdues par les méthodes traditionnelles.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelles plateformes publicitaires Pixly supporte-t-il ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pixly s\'intègre avec Meta Ads (Facebook/Instagram), Google Ads, TikTok Ads, Snapchat Ads et d\'autres plateformes. Toutes les connexions se font via OAuth sécurisé avec synchronisation automatique des données en temps réel.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien coûte Pixly ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pixly propose trois plans : Starter à 49€/mois (jusqu\'à 25k€ de dépenses), Growth à 99€/mois (toutes les plateformes, attribution multi-touch) et Scale à 199€/mois (dépenses illimitées, account manager dédié). Tous les plans incluent 14 jours d\'essai gratuit sans carte bancaire.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de temps faut-il pour installer Pixly ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'L\'installation de Pixly prend environ 5 minutes. Il suffit de connecter vos comptes publicitaires via OAuth et d\'installer notre pixel de tracking sur votre site. Notre équipe support est disponible pour vous accompagner à chaque étape.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qu\'est-ce que le ROAS et comment Pixly aide à l\'améliorer ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le ROAS (Return On Ad Spend) mesure le retour sur investissement de vos dépenses publicitaires. Pixly vous donne une vision précise de votre vrai ROAS en attribuant correctement chaque conversion à sa source, vous permettant d\'identifier les campagnes performantes et de réallouer votre budget efficacement.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Fonctionnalités',
      item: `${BASE_URL}/features`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'À propos',
      item: `${BASE_URL}/about`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Contact',
      item: `${BASE_URL}/contact`,
    },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Comment installer Pixly sur votre site',
  description:
    'Installez Pixly en 5 minutes pour mesurer votre vrai ROAS avec une attribution multi-touch précise.',
  totalTime: 'PT5M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'EUR',
    value: '0',
  },
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Créez votre compte',
      text: 'Inscrivez-vous gratuitement sur Pixly et créez votre espace de travail en quelques clics.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Connectez vos plateformes',
      text: 'Connectez Meta Ads, Google Ads et TikTok Ads via OAuth sécurisé pour importer automatiquement vos données publicitaires.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Installez le pixel',
      text: 'Copiez le script de tracking Pixly et ajoutez-le dans la balise <head> de votre site pour activer le suivi server-side.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Visualisez votre vrai ROAS',
      text: 'Accédez à votre tableau de bord pour voir l\'attribution multi-touch de vos conversions en temps réel.',
    },
  ],
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  );
}
