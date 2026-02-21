export type Locale = 'fr' | 'en';

export const translations: Record<Locale, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.dashboard': 'Vue d\'ensemble',
    'nav.attribution': 'Attribution',
    'nav.integrations': 'Intégrations',
    'nav.billing': 'Facturation',
    'nav.funnel': 'Funnel',
    'nav.team': 'Équipe',
    'nav.audience': 'Audience',
    'nav.settings': 'Paramètres',
    'nav.profile': 'Profil',
    'nav.help': 'Aide',

    // Dashboard
    'dashboard.title': 'Vue d\'ensemble',
    'dashboard.totalRevenue': 'Revenu Total',
    'dashboard.roas': 'ROAS',
    'dashboard.conversions': 'Conversions',
    'dashboard.aov': 'Panier Moyen',
    'dashboard.adSpend': 'Dépenses Pub',
    'dashboard.cpa': 'CPA',
    'dashboard.updatedAt': 'Mis à jour',
    'dashboard.refresh': 'Rafraîchir',
    'dashboard.noData': 'Pas encore de données',
    'dashboard.installPixel': 'Installer le pixel',

    // Periods
    'period.7d': '7j',
    'period.30d': '30j',
    'period.90d': '90j',

    // Attribution
    'attribution.title': 'Attribution',
    'attribution.byChannel': 'Attribution par canal',
    'attribution.revenueShare': 'Répartition des revenus',
    'attribution.campaigns': 'Campagnes',
    'attribution.lastClick': 'Dernier clic',
    'attribution.firstClick': 'Premier clic',
    'attribution.linear': 'Linéaire',
    'attribution.timeDecay': 'Décroissance temporelle',
    'attribution.positionBased': 'Basé sur la position',

    // Channels
    'channel.meta': 'Meta Ads',
    'channel.google': 'Google Ads',
    'channel.tiktok': 'TikTok Ads',
    'channel.linkedin': 'LinkedIn Ads',
    'channel.bing': 'Microsoft Ads',
    'channel.organic': 'Organic',
    'channel.direct': 'Direct',
    'channel.email': 'Email',
    'channel.referral': 'Referral',
    'channel.other': 'Autre',

    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.search': 'Rechercher...',
    'common.noResults': 'Aucun résultat',
    'common.showMore': 'Voir plus',
    'common.showLess': 'Voir moins',
    'common.copied': 'Copié',
    'common.copy': 'Copier',
    'common.export': 'Exporter',
    'common.revenue': 'Revenu',
    'common.spend': 'Dépense',
    'common.conv': 'Conv.',
    'common.profitable': 'Rentable',
    'common.unprofitable': 'Non rentable',

    // Metrics
    'metrics.revenue': 'Revenu',
    'metrics.spend': 'Dépense',
    'metrics.conversions': 'Conversions',
    'metrics.roas': 'ROAS',
    'metrics.cpa': 'CPA',
    'metrics.aov': 'Panier moyen',
    'metrics.ctr': 'CTR',

    // Team
    'team.title': 'Équipe',
    'team.invite': 'Inviter un membre',
    'team.owner': 'Propriétaire',
    'team.admin': 'Administrateur',
    'team.editor': 'Éditeur',
    'team.viewer': 'Lecteur',
    'team.remove': 'Retirer',
    'team.changeRole': 'Changer le rôle',

    // Billing
    'billing.title': 'Facturation',
    'billing.currentPlan': 'Plan actuel',
    'billing.changePlan': 'Changer de plan',
    'billing.invoices': 'Factures',

    // Alerts
    'alerts.title': 'Alertes',
    'alerts.roasLow': 'ROAS en dessous du seuil',
    'alerts.cpaHigh': 'CPA au-dessus du seuil',
    'alerts.spendHigh': 'Dépenses élevées',
    'alerts.noConversions': 'Aucune conversion récente',
    'alerts.disconnected': 'Intégration déconnectée',
    'alerts.dismissAll': 'Tout effacer',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Overview',
    'nav.attribution': 'Attribution',
    'nav.integrations': 'Integrations',
    'nav.billing': 'Billing',
    'nav.funnel': 'Funnel',
    'nav.team': 'Team',
    'nav.audience': 'Audience',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.help': 'Help',

    // Dashboard
    'dashboard.title': 'Overview',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.roas': 'ROAS',
    'dashboard.conversions': 'Conversions',
    'dashboard.aov': 'Average Order Value',
    'dashboard.adSpend': 'Ad Spend',
    'dashboard.cpa': 'CPA',
    'dashboard.updatedAt': 'Updated',
    'dashboard.refresh': 'Refresh',
    'dashboard.noData': 'No data yet',
    'dashboard.installPixel': 'Install pixel',

    // Periods
    'period.7d': '7d',
    'period.30d': '30d',
    'period.90d': '90d',

    // Attribution
    'attribution.title': 'Attribution',
    'attribution.byChannel': 'Attribution by channel',
    'attribution.revenueShare': 'Revenue breakdown',
    'attribution.campaigns': 'Campaigns',
    'attribution.lastClick': 'Last click',
    'attribution.firstClick': 'First click',
    'attribution.linear': 'Linear',
    'attribution.timeDecay': 'Time decay',
    'attribution.positionBased': 'Position based',

    // Channels
    'channel.meta': 'Meta Ads',
    'channel.google': 'Google Ads',
    'channel.tiktok': 'TikTok Ads',
    'channel.linkedin': 'LinkedIn Ads',
    'channel.bing': 'Microsoft Ads',
    'channel.organic': 'Organic',
    'channel.direct': 'Direct',
    'channel.email': 'Email',
    'channel.referral': 'Referral',
    'channel.other': 'Other',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.search': 'Search...',
    'common.noResults': 'No results',
    'common.showMore': 'Show more',
    'common.showLess': 'Show less',
    'common.copied': 'Copied',
    'common.copy': 'Copy',
    'common.export': 'Export',
    'common.revenue': 'Revenue',
    'common.spend': 'Spend',
    'common.conv': 'Conv.',
    'common.profitable': 'Profitable',
    'common.unprofitable': 'Unprofitable',

    // Metrics
    'metrics.revenue': 'Revenue',
    'metrics.spend': 'Spend',
    'metrics.conversions': 'Conversions',
    'metrics.roas': 'ROAS',
    'metrics.cpa': 'CPA',
    'metrics.aov': 'AOV',
    'metrics.ctr': 'CTR',

    // Team
    'team.title': 'Team',
    'team.invite': 'Invite member',
    'team.owner': 'Owner',
    'team.admin': 'Admin',
    'team.editor': 'Editor',
    'team.viewer': 'Viewer',
    'team.remove': 'Remove',
    'team.changeRole': 'Change role',

    // Billing
    'billing.title': 'Billing',
    'billing.currentPlan': 'Current plan',
    'billing.changePlan': 'Change plan',
    'billing.invoices': 'Invoices',

    // Alerts
    'alerts.title': 'Alerts',
    'alerts.roasLow': 'ROAS below threshold',
    'alerts.cpaHigh': 'CPA above threshold',
    'alerts.spendHigh': 'High spend',
    'alerts.noConversions': 'No recent conversions',
    'alerts.disconnected': 'Integration disconnected',
    'alerts.dismissAll': 'Dismiss all',
  },
};
