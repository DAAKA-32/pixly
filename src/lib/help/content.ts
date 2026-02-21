// ===========================================
// PIXLY - Help Content
// Static data for contextual help per page
// ===========================================

export type HelpPageId =
  | 'dashboard'
  | 'attribution'
  | 'funnel'
  | 'audience'
  | 'integrations'
  | 'billing'
  | 'team';

export interface HelpItem {
  term: string;
  definition: string;
}

export interface HelpSection {
  title: string;
  items: HelpItem[];
}

export interface HelpTip {
  text: string;
}

export interface PageHelpContent {
  id: HelpPageId;
  title: string;
  description: string;
  sections: HelpSection[];
  tips: HelpTip[];
}

export const HELP_CONTENT: Record<HelpPageId, PageHelpContent> = {
  dashboard: {
    id: 'dashboard',
    title: 'Vue d\u2019ensemble',
    description:
      'Votre tableau de bord centralise les performances de tous vos canaux publicitaires. Suivez vos KPIs, analysez les tendances de revenus et identifiez rapidement les campagnes \u00e0 optimiser.',
    sections: [
      {
        title: 'Comprendre vos KPIs',
        items: [
          {
            term: 'Revenu Total',
            definition:
              'Somme des revenus attribu\u00e9s \u00e0 vos campagnes sur la p\u00e9riode s\u00e9lectionn\u00e9e.',
          },
          {
            term: 'ROAS',
            definition:
              'Return On Ad Spend \u2014 pour chaque euro d\u00e9pens\u00e9, combien de revenus g\u00e9n\u00e9r\u00e9s. Un ROAS de 3x signifie 3\u20ac de revenu pour 1\u20ac d\u00e9pens\u00e9.',
          },
          {
            term: 'Conversions',
            definition:
              'Nombre total d\u2019actions de valeur (achats, leads) track\u00e9es et attribu\u00e9es.',
          },
          {
            term: 'Panier Moyen (AOV)',
            definition:
              'Valeur moyenne de chaque conversion. AOV = Revenu Total \u00f7 Nombre de conversions.',
          },
          {
            term: 'D\u00e9penses Pub',
            definition:
              'Budget total d\u00e9pens\u00e9 sur toutes les plateformes connect\u00e9es.',
          },
          {
            term: 'CPA',
            definition:
              'Co\u00fbt Par Acquisition \u2014 montant moyen d\u00e9pens\u00e9 pour obtenir une conversion.',
          },
        ],
      },
      {
        title: 'Graphiques',
        items: [
          {
            term: 'Revenu dans le temps',
            definition:
              'Courbe de revenus quotidiens pour d\u00e9tecter les tendances et les pics.',
          },
          {
            term: 'R\u00e9partition par canal',
            definition:
              'Donut montrant la contribution de chaque canal publicitaire au revenu total.',
          },
        ],
      },
    ],
    tips: [
      {
        text: 'Surveillez votre ROAS quotidiennement pour d\u00e9tecter rapidement les campagnes sous-performantes.',
      },
      {
        text: 'Utilisez les filtres de p\u00e9riode (7j, 30j, 90j) pour comparer les tendances.',
      },
      {
        text: 'Exportez vos donn\u00e9es en CSV ou PDF pour vos rapports clients.',
      },
    ],
  },

  attribution: {
    id: 'attribution',
    title: 'Attribution',
    description:
      'Analysez comment vos revenus sont attribu\u00e9s \u00e0 chaque canal et campagne. Comparez les mod\u00e8les d\u2019attribution pour comprendre le parcours d\u2019achat de vos clients.',
    sections: [
      {
        title: 'Mod\u00e8les d\u2019attribution',
        items: [
          {
            term: 'Dernier clic',
            definition:
              '100% du cr\u00e9dit au dernier point de contact avant la conversion.',
          },
          {
            term: 'Premier clic',
            definition:
              '100% du cr\u00e9dit au premier point de contact qui a initi\u00e9 le parcours.',
          },
          {
            term: 'Lin\u00e9aire',
            definition:
              'Cr\u00e9dit r\u00e9parti \u00e9galement entre tous les points de contact.',
          },
          {
            term: 'D\u00e9croissance temporelle',
            definition:
              'Plus de cr\u00e9dit aux points de contact proches de la conversion (demi-vie de 7 jours).',
          },
          {
            term: 'Bas\u00e9 sur la position',
            definition:
              '40% au premier clic, 40% au dernier, 20% r\u00e9partis entre les interactions interm\u00e9diaires.',
          },
        ],
      },
      {
        title: 'M\u00e9triques par canal',
        items: [
          {
            term: 'Revenu attribu\u00e9',
            definition:
              'Part du revenu total attribu\u00e9e \u00e0 ce canal selon le mod\u00e8le choisi.',
          },
          {
            term: 'Part du revenu',
            definition:
              'Pourcentage du revenu total g\u00e9n\u00e9r\u00e9 par ce canal.',
          },
          {
            term: 'ROAS par canal',
            definition:
              'Rentabilit\u00e9 sp\u00e9cifique de chaque canal publicitaire.',
          },
        ],
      },
    ],
    tips: [
      {
        text: 'Comparez les mod\u00e8les pour comprendre quels canaux initient vs. finalisent vos conversions.',
      },
      {
        text: 'Le mod\u00e8le \u00ab Bas\u00e9 sur la position \u00bb offre g\u00e9n\u00e9ralement la vision la plus \u00e9quilibr\u00e9e.',
      },
    ],
  },

  funnel: {
    id: 'funnel',
    title: 'Entonnoir',
    description:
      'Visualisez le parcours de vos visiteurs de la premi\u00e8re visite \u00e0 l\u2019achat. Identifiez les \u00e9tapes o\u00f9 vous perdez le plus de clients potentiels.',
    sections: [
      {
        title: '\u00c9tapes du funnel',
        items: [
          {
            term: 'Visite',
            definition:
              'Nombre total de visiteurs uniques entr\u00e9s dans le funnel.',
          },
          {
            term: 'Ajout au panier',
            definition:
              'Visiteurs ayant ajout\u00e9 au moins un produit \u00e0 leur panier.',
          },
          {
            term: 'Checkout',
            definition:
              'Visiteurs ayant initi\u00e9 le processus de paiement.',
          },
          {
            term: 'Achat',
            definition:
              'Conversions finalis\u00e9es avec paiement confirm\u00e9.',
          },
        ],
      },
      {
        title: 'Analyse du drop-off',
        items: [
          {
            term: 'Taux de drop-off',
            definition:
              'Pourcentage de visiteurs perdus entre deux \u00e9tapes cons\u00e9cutives.',
          },
          {
            term: 'Taux de conversion par \u00e9tape',
            definition:
              'Pourcentage de visiteurs passant avec succ\u00e8s d\u2019une \u00e9tape \u00e0 la suivante.',
          },
        ],
      },
    ],
    tips: [
      {
        text: 'Identifiez les \u00e9tapes avec le plus fort taux d\u2019abandon pour prioriser vos optimisations.',
      },
      {
        text: 'Comparez le funnel par canal pour d\u00e9couvrir quelles sources g\u00e9n\u00e8rent le trafic le plus qualifi\u00e9.',
      },
    ],
  },

  audience: {
    id: 'audience',
    title: 'Audience',
    description:
      'Explorez la composition de votre audience par appareil, pays, navigateur et canal. D\u00e9couvrez quels segments performent le mieux pour affiner votre ciblage.',
    sections: [
      {
        title: 'Dimensions disponibles',
        items: [
          {
            term: 'Appareil',
            definition:
              'R\u00e9partition entre desktop, mobile et tablette.',
          },
          {
            term: 'Pays',
            definition:
              'G\u00e9olocalisation de vos visiteurs et clients.',
          },
          {
            term: 'Navigateur / OS',
            definition:
              'Profil technique de votre audience pour v\u00e9rifier la compatibilit\u00e9.',
          },
          {
            term: 'Canal / Campagne',
            definition:
              'Source d\u2019acquisition : publicit\u00e9, organique, direct, email, referral.',
          },
        ],
      },
      {
        title: 'M\u00e9triques par segment',
        items: [
          {
            term: 'Taux de conversion',
            definition:
              'Pourcentage de visiteurs convertis dans chaque segment.',
          },
          {
            term: 'AOV par segment',
            definition:
              'Panier moyen par segment \u2014 utile pour ajuster les ench\u00e8res.',
          },
        ],
      },
    ],
    tips: [
      {
        text: 'Utilisez la vue par pays pour identifier vos march\u00e9s les plus performants.',
      },
      {
        text: 'Si le mobile convertit moins bien, v\u00e9rifiez l\u2019exp\u00e9rience mobile de votre site.',
      },
    ],
  },

  integrations: {
    id: 'integrations',
    title: 'Int\u00e9grations',
    description:
      'Connectez vos plateformes publicitaires pour importer automatiquement les donn\u00e9es de d\u00e9penses et synchroniser vos conversions.',
    sections: [
      {
        title: 'Pixel de tracking',
        items: [
          {
            term: 'Installation',
            definition:
              'Copiez le code du pixel et collez-le dans le <head> de votre site web.',
          },
          {
            term: 'V\u00e9rification',
            definition:
              'Apr\u00e8s installation, visitez votre site pour confirmer que le pixel envoie des donn\u00e9es.',
          },
        ],
      },
      {
        title: 'Plateformes publicitaires',
        items: [
          {
            term: 'Meta Ads',
            definition:
              'Connectez votre compte Facebook/Instagram Ads pour importer les d\u00e9penses et synchroniser les conversions via CAPI.',
          },
          {
            term: 'Google Ads',
            definition:
              'Importez les d\u00e9penses Search, Display et YouTube, et envoyez les conversions enrichies.',
          },
          {
            term: 'TikTok Ads',
            definition:
              'Synchronisez vos d\u00e9penses TikTok et envoyez les \u00e9v\u00e9nements de conversion server-side.',
          },
        ],
      },
    ],
    tips: [
      {
        text: 'V\u00e9rifiez que votre pixel est bien install\u00e9 en visitant votre site apr\u00e8s l\u2019installation.',
      },
      {
        text: 'Connectez vos plateformes dans l\u2019ordre de priorit\u00e9 budg\u00e9taire pour voir les r\u00e9sultats les plus impactants en premier.',
      },
    ],
  },

  billing: {
    id: 'billing',
    title: 'Facturation',
    description:
      'G\u00e9rez votre abonnement, votre moyen de paiement et consultez l\u2019historique de vos factures.',
    sections: [
      {
        title: 'Abonnement',
        items: [
          {
            term: 'Plan actif',
            definition:
              'Votre plan actuel d\u00e9finit les limites d\u2019\u00e9v\u00e9nements, d\u2019int\u00e9grations et de membres.',
          },
          {
            term: 'P\u00e9riode de facturation',
            definition:
              'Choisissez entre facturation mensuelle ou annuelle (jusqu\u2019\u00e0 20% d\u2019\u00e9conomie).',
          },
        ],
      },
      {
        title: 'Paiement',
        items: [
          {
            term: 'Carte bancaire',
            definition:
              'Votre carte est g\u00e9r\u00e9e de fa\u00e7on s\u00e9curis\u00e9e via Stripe. Pixly ne stocke aucune donn\u00e9e bancaire.',
          },
          {
            term: 'Factures',
            definition:
              'T\u00e9l\u00e9chargez vos factures en PDF depuis l\u2019historique.',
          },
        ],
      },
    ],
    tips: [
      {
        text: 'Passez \u00e0 la facturation annuelle pour \u00e9conomiser jusqu\u2019\u00e0 20%.',
      },
      {
        text: 'V\u00e9rifiez la date d\u2019expiration de votre carte pour \u00e9viter une interruption de service.',
      },
    ],
  },

  team: {
    id: 'team',
    title: '\u00c9quipe',
    description:
      'Invitez des collaborateurs et g\u00e9rez les permissions de votre espace de travail.',
    sections: [
      {
        title: 'R\u00f4les disponibles',
        items: [
          {
            term: 'Administrateur',
            definition:
              'Acc\u00e8s complet : param\u00e8tres, int\u00e9grations, facturation et gestion des membres.',
          },
          {
            term: '\u00c9diteur',
            definition:
              'Peut modifier les campagnes et les donn\u00e9es, mais ne peut pas g\u00e9rer la facturation.',
          },
          {
            term: 'Lecteur',
            definition:
              'Consultation uniquement \u2014 id\u00e9al pour les clients ou partenaires.',
          },
        ],
      },
      {
        title: 'Invitations',
        items: [
          {
            term: 'Inviter un membre',
            definition:
              'Envoyez une invitation par email. Le destinataire recevra un lien pour rejoindre l\u2019espace.',
          },
          {
            term: 'R\u00e9voquer',
            definition:
              'Annulez une invitation en attente ou retirez l\u2019acc\u00e8s d\u2019un membre existant.',
          },
        ],
      },
    ],
    tips: [
      {
        text: 'Attribuez le r\u00f4le Lecteur pour donner un acc\u00e8s en consultation sans risque de modification.',
      },
      {
        text: 'Les invitations expirent apr\u00e8s 7 jours. Renvoyez-les si n\u00e9cessaire.',
      },
    ],
  },
};

export function getHelpForRoute(pathname: string): PageHelpContent | null {
  const routeMap: Record<string, HelpPageId> = {
    '/dashboard': 'dashboard',
    '/attribution': 'attribution',
    '/funnel': 'funnel',
    '/audience': 'audience',
    '/integrations': 'integrations',
    '/billing': 'billing',
    '/team': 'team',
  };
  const id = routeMap[pathname];
  return id ? HELP_CONTENT[id] : null;
}
