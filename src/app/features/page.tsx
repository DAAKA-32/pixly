import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Code2,
  GitBranch,
  PieChart,
  FileBarChart,
  Route,
  Users,
} from 'lucide-react';

import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
import {
  AnimatedSection,
} from '@/components/landing/animations';
import { FeatureMockup } from '@/components/landing/feature-mockups';
import { HashScrollHandler } from './features-client';

// ===========================================
// SEO METADATA
// ===========================================

export const metadata: Metadata = {
  title: 'Fonctionnalités — Attribution Multi-Touch, Funnel, Tracking Server-Side & Reporting',
  description:
    'Découvrez toutes les fonctionnalités de Pixly : attribution multi-touch (5 modèles), analyse de funnel, tracking server-side résistant iOS 14+, optimisation budgétaire et reporting automatisé. Mesurez votre vrai ROAS.',
  keywords: [
    'attribution multi-touch',
    'tracking server-side',
    'analyse de funnel',
    'ROAS tracking',
    'pixel first-party',
    'Meta Ads tracking',
    'Google Ads attribution',
    'TikTok Ads tracking',
    'reporting marketing',
    'optimisation budget publicitaire',
    'iOS 14 tracking solution',
    'conversions API CAPI',
  ],
  alternates: {
    canonical: 'https://pixly.app/features',
  },
  openGraph: {
    title: 'Fonctionnalités Pixly — Attribution, Funnel, Tracking & Reporting',
    description:
      'Attribution multi-touch, analyse de funnel, tracking server-side résistant iOS 14+ et reporting automatisé. Mesurez votre vrai ROAS.',
    url: 'https://pixly.app/features',
  },
};

// ===========================================
// CONTENT — Source unique de vérité
// ===========================================

interface FeatureStep {
  step: string;
  title: string;
  description: string;
}

interface CoreFeature {
  id: string;
  number: string;
  mockupId: string;
  title: string;
  subtitle: string;
  explanation: string;
  palette: { from: string; to: string; light: string; accent: string };
  steps: FeatureStep[];
  impactStatement: string;
}

interface FeatureImpact {
  value: string;
  label: string;
}

interface AdvancedFeature {
  id: string;
  number: string;
  mockupId: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  explanation: string;
  impact: FeatureImpact[];
  palette: { from: string; to: string; light: string; accent: string };
  steps: FeatureStep[];
  impactStatement: string;
}

// -------------------------------------------
// CORE FEATURES (4 piliers)
// -------------------------------------------

const CORE_FEATURES: CoreFeature[] = [
  {
    id: 'attribution',
    number: '01',
    mockupId: 'attribution',
    title: 'Sachez d\'où vient chaque vente',
    subtitle: 'Mesurez la vraie contribution de chaque canal à votre chiffre d\'affaires.',
    explanation:
      'Chaque campagne, chaque canal, chaque euro dépensé est relié aux revenus qu\'il génère réellement. Pixly collecte l\'ensemble des interactions publicitaires de vos visiteurs, les unifie dans un parcours cohérent, puis répartit le revenu entre les canaux contributeurs selon le modèle d\'attribution de votre choix. Vous voyez enfin quelles campagnes sont rentables — et lesquelles ne le sont pas.',
    palette: { from: '#0F9D58', to: '#0B7A43', light: '#edfcf2', accent: '#0F9D58' },
    steps: [
      { step: '1', title: 'Collecte des touchpoints', description: 'Le pixel capte chaque interaction publicitaire sur tous vos canaux.' },
      { step: '2', title: 'Unification des parcours', description: 'Chaque visite, clic et conversion sont reliés au même utilisateur.' },
      { step: '3', title: 'Répartition du revenu', description: 'Chaque euro est attribué aux campagnes qui l\'ont réellement généré.' },
    ],
    impactStatement: 'Vous investissez sur ce qui rapporte, pas sur ce qui semble fonctionner.',
  },
  {
    id: 'funnel',
    number: '02',
    mockupId: 'funnel',
    title: 'Trouvez où vous perdez vos clients',
    subtitle: 'Identifiez les points de friction dans votre parcours d\'achat, canal par canal.',
    explanation:
      'Chaque visiteur suit un chemin avant d\'acheter : visite, ajout au panier, paiement, confirmation. À chaque étape, une partie abandonne. Pixly mesure le taux de passage entre chaque étape, segmenté par canal d\'acquisition. Vous identifiez précisément où et pourquoi vos visiteurs décrochent — et vous concentrez vos efforts là où l\'impact sur le chiffre d\'affaires est maximal.',
    palette: { from: '#2563eb', to: '#4f46e5', light: '#eff6ff', accent: '#2563eb' },
    steps: [
      { step: '1', title: 'Configuration du funnel', description: 'Définissez vos étapes clés : visite, panier, checkout, achat.' },
      { step: '2', title: 'Analyse des abandons', description: 'Identifiez où et pourquoi vos visiteurs décrochent, par canal.' },
      { step: '3', title: 'Optimisation ciblée', description: 'Agissez sur les étapes qui ont le plus d\'impact sur votre revenu.' },
    ],
    impactStatement: 'Vous optimisez votre taux de conversion là où ça compte vraiment.',
  },
  {
    id: 'integrations',
    number: '03',
    mockupId: 'integrations',
    title: 'Connectez vos sources en un clic',
    subtitle: 'Meta, Google, TikTok, Stripe, Shopify, HubSpot — toutes vos données centralisées.',
    explanation:
      'Pixly se connecte à vos plateformes publicitaires et outils métier via OAuth sécurisé, sans intervention technique. Vos données historiques sont importées automatiquement, puis synchronisées en continu. Plus besoin de jongler entre les interfaces : toutes vos sources alimentent un seul tableau de bord, prêt à être analysé.',
    palette: { from: '#7c3aed', to: '#c026d3', light: '#f5f3ff', accent: '#7c3aed' },
    steps: [
      { step: '1', title: 'Authentification sécurisée', description: 'Connectez votre compte en un clic via OAuth — aucun mot de passe partagé.' },
      { step: '2', title: 'Import automatique', description: 'Vos données historiques sont importées en quelques minutes.' },
      { step: '3', title: 'Synchronisation continue', description: 'Les nouvelles données affluent en temps réel, sans intervention.' },
    ],
    impactStatement: 'Vous centralisez vos données en quelques minutes, pas en quelques jours.',
  },
  {
    id: 'tracking',
    number: '04',
    mockupId: 'tracking',
    title: 'Récupérez vos conversions perdues',
    subtitle: 'Pixel first-party et tracking server-side pour contourner iOS 14+ et les ad-blockers.',
    explanation:
      'Les bloqueurs de publicité et les restrictions iOS 14+ empêchent jusqu\'à 40 % des conversions d\'être remontées aux plateformes publicitaires. Pixly utilise un pixel first-party hébergé sur votre domaine, combiné à un relais server-side, pour contourner ces limitations. Les conversions récupérées sont automatiquement synchronisées avec Meta CAPI et Google Enhanced Conversions.',
    palette: { from: '#e11d48', to: '#ea580c', light: '#fff1f2', accent: '#e11d48' },
    steps: [
      { step: '1', title: 'Installation du pixel', description: 'Ajoutez une ligne de code dans le <head> de votre site — 2 minutes.' },
      { step: '2', title: 'Collecte first-party', description: 'Le pixel capte les événements sur votre domaine, côté navigateur.' },
      { step: '3', title: 'Relais server-side', description: 'Les données sont synchronisées avec Meta CAPI et Google automatiquement.' },
    ],
    impactStatement: 'Vous récupérez jusqu\'à 40 % de conversions que vos plateformes ne voient plus.',
  },
];

// -------------------------------------------
// ADVANCED FEATURES (6 fonctionnalités)
// -------------------------------------------

const ADVANCED_FEATURES: AdvancedFeature[] = [
  {
    id: 'pixel-avance',
    number: '05',
    mockupId: 'pixel-avance',
    icon: Code2,
    title: 'Pixel first-party automatisé',
    subtitle: 'Capturez chaque conversion sans configuration manuelle.',
    explanation:
      'Les pixels classiques nécessitent une configuration manuelle pour chaque événement : formulaire envoyé, bouton cliqué, page de confirmation visitée. Pixly détecte automatiquement ces éléments sur votre site et les enregistre comme événements de conversion. Les doublons sont filtrés nativement, et un mode debug vous permet de vérifier en temps réel que tout remonte correctement. Zéro configuration, zéro maintenance.',
    impact: [
      { value: '0 min', label: 'de configuration manuelle' },
      { value: '-35%', label: 'de doublons éliminés' },
      { value: '100%', label: 'des conversions captées' },
    ],
    palette: { from: '#0891b2', to: '#06b6d4', light: '#ecfeff', accent: '#0891b2' },
    steps: [
      { step: '1', title: 'Détection automatique', description: 'Le pixel identifie les formulaires, boutons et pages de confirmation sur votre site.' },
      { step: '2', title: 'Dédoublonnage natif', description: 'Chaque conversion est comptée une seule fois, sans intervention.' },
      { step: '3', title: 'Vérification en temps réel', description: 'Le mode debug intégré confirme que vos événements remontent correctement.' },
    ],
    impactStatement: 'Vous mesurez chaque conversion sans toucher une ligne de code.',
  },
  {
    id: 'attribution-multicanal',
    number: '06',
    mockupId: 'attribution-multicanal',
    icon: GitBranch,
    title: 'Attribution multi-modèle',
    subtitle: 'Comparez 5 modèles d\'attribution pour identifier la vraie valeur de chaque canal.',
    explanation:
      'Un seul modèle d\'attribution donne une vision partielle de vos performances. Le last-click survalorise les canaux de conversion finale et masque la contribution des canaux de découverte. Pixly calcule simultanément 5 modèles — last-click, first-click, linéaire, time-decay et position — et les présente côte à côte. Vous identifiez les biais, choisissez le modèle adapté à votre cycle de vente, et prenez des décisions fondées sur une vision complète.',
    impact: [
      { value: '5', label: 'modèles comparables' },
      { value: '+22%', label: 'de précision d\'attribution' },
      { value: '1 min', label: 'pour changer de modèle' },
    ],
    palette: { from: '#4f46e5', to: '#6366f1', light: '#eef2ff', accent: '#4f46e5' },
    steps: [
      { step: '1', title: 'Calcul simultané', description: 'Les 5 modèles sont appliqués à vos données en temps réel.' },
      { step: '2', title: 'Comparaison visuelle', description: 'Un tableau comparatif révèle les écarts et biais entre modèles.' },
      { step: '3', title: 'Choix éclairé', description: 'Sélectionnez le modèle qui correspond à votre cycle de vente.' },
    ],
    impactStatement: 'Vous comprenez la vraie contribution de chaque canal, sans biais.',
  },
  {
    id: 'optimisation-budget',
    number: '07',
    mockupId: 'optimisation-budget',
    icon: PieChart,
    title: 'Optimisation du budget publicitaire',
    subtitle: 'Identifiez les dépenses improductives et réallouez vers ce qui génère du revenu.',
    explanation:
      'Une part significative des budgets publicitaires est investie dans des campagnes à faible retour — mais sans données fiables, impossible de le savoir. Pixly analyse le ROAS réel de chaque campagne, signale celles qui sous-performent, et recommande des réallocations pour maximiser le revenu global. Vous simulez l\'impact avant de modifier vos budgets, puis mesurez les résultats.',
    impact: [
      { value: '+28%', label: 'de ROAS moyen après optimisation' },
      { value: '-20%', label: 'de budget gaspillé' },
      { value: '2x', label: 'plus rapide pour couper une campagne' },
    ],
    palette: { from: '#b45309', to: '#f59e0b', light: '#fffbeb', accent: '#b45309' },
    steps: [
      { step: '1', title: 'Analyse du ROAS réel', description: 'Chaque campagne est évaluée sur son retour mesuré, pas estimé.' },
      { step: '2', title: 'Recommandations ciblées', description: 'Les réallocations sont suggérées pour maximiser le revenu global.' },
      { step: '3', title: 'Simulation d\'impact', description: 'Visualisez l\'effet attendu avant de modifier vos budgets.' },
    ],
    impactStatement: 'Vous réduisez le gaspillage et concentrez votre budget sur ce qui rapporte.',
  },
  {
    id: 'reporting',
    number: '08',
    mockupId: 'reporting',
    icon: FileBarChart,
    title: 'Reporting automatisé',
    subtitle: 'Générez des rapports clairs et partageables en un clic.',
    explanation:
      'Compiler un rapport marketing à partir de 4 ou 5 plateformes prend des heures — et les chiffres sont déjà obsolètes quand le rapport est prêt. Pixly centralise toutes vos données et génère des rapports visuels prêts à être partagés avec votre direction. Vous choisissez les métriques, la période, et le rapport est compilé en temps réel. Export PDF ou lien partageable.',
    impact: [
      { value: '4h', label: 'économisées par semaine' },
      { value: '1 clic', label: 'pour générer un rapport' },
      { value: '100%', label: 'des données à jour' },
    ],
    palette: { from: '#059669', to: '#10b981', light: '#ecfdf5', accent: '#059669' },
    steps: [
      { step: '1', title: 'Sélection des métriques', description: 'Choisissez les KPIs : ROAS, conversions, revenu, CPA.' },
      { step: '2', title: 'Génération automatique', description: 'Le rapport est compilé avec vos données en temps réel.' },
      { step: '3', title: 'Export et partage', description: 'Téléchargez en PDF ou partagez un lien avec votre équipe.' },
    ],
    impactStatement: 'Vous passez moins de temps à compiler et plus de temps à décider.',
  },
  {
    id: 'customer-journey',
    number: '09',
    mockupId: 'customer-journey',
    icon: Route,
    title: 'Parcours client complet',
    subtitle: 'Visualisez le chemin exact de chaque client, du premier clic à l\'achat.',
    explanation:
      'Les plateformes publicitaires montrent chacune leur version du parcours client, sans vision d\'ensemble. Les visites multi-sessions sont perdues, et il est impossible de relier le premier contact publicitaire à la conversion finale. Pixly enregistre chaque touchpoint, les rattache au même utilisateur sur plusieurs sessions, et affiche le parcours complet sur une timeline visuelle. Vous identifiez les chemins de conversion les plus courants et réduisez le nombre d\'étapes nécessaires pour convertir.',
    impact: [
      { value: '100%', label: 'du parcours visible' },
      { value: '3,2', label: 'touchpoints moyens identifiés' },
      { value: '-15%', label: 'd\'étapes pour convertir' },
    ],
    palette: { from: '#dc2626', to: '#ef4444', light: '#fef2f2', accent: '#dc2626' },
    steps: [
      { step: '1', title: 'Capture multi-sessions', description: 'Chaque interaction est enregistrée et rattachée au même utilisateur.' },
      { step: '2', title: 'Timeline visuelle', description: 'Le parcours complet est affiché sur une frise chronologique.' },
      { step: '3', title: 'Analyse des chemins', description: 'Identifiez les parcours les plus fréquents vers la conversion.' },
    ],
    impactStatement: 'Vous comprenez comment vos clients arrivent jusqu\'à l\'achat — et vous raccourcissez le chemin.',
  },
  {
    id: 'audience',
    number: '10',
    mockupId: 'audience',
    icon: Users,
    title: 'Segmentation d\'audience',
    subtitle: 'Créez des segments basés sur le comportement réel pour des campagnes plus rentables.',
    explanation:
      'Cibler une audience large avec le même message publicitaire, c\'est gaspiller du budget. Pixly segmente automatiquement vos visiteurs par comportement — acheteurs, abandons de panier, prospects qualifiés — et attribue un score de valeur à chaque segment basé sur le revenu généré. Vous exportez vos meilleurs segments directement vers Meta et Google Ads pour créer des audiences lookalike ciblées, et adaptez vos messages à chaque profil.',
    impact: [
      { value: '+35%', label: 'de conversions sur campagnes ciblées' },
      { value: '-25%', label: 'de CPA grâce aux audiences ciblées' },
      { value: '4', label: 'segments prêts à l\'emploi' },
    ],
    palette: { from: '#8b5cf6', to: '#a78bfa', light: '#f5f3ff', accent: '#7c3aed' },
    steps: [
      { step: '1', title: 'Segmentation comportementale', description: 'Les visiteurs sont regroupés par actions : achats, abandons, visites.' },
      { step: '2', title: 'Scoring par valeur', description: 'Chaque segment reçoit un score basé sur le revenu qu\'il génère.' },
      { step: '3', title: 'Export vers vos plateformes', description: 'Envoyez vos segments vers Meta et Google pour des campagnes ciblées.' },
    ],
    impactStatement: 'Vous ciblez les bons profils avec le bon message — et vous réduisez votre coût d\'acquisition.',
  },
];

// ===========================================
// SECTION COMPONENTS
// ===========================================

function FeaturesHero() {
  return (
    <section className="relative pt-28 pb-16 sm:pt-40 sm:pb-20 gradient-hero overflow-hidden">
      <div className="container-main relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-slide-up opacity-0">
            <span className="label">Fonctionnalités</span>
          </div>
          <h1 className="heading-xl mt-4 mb-5 sm:mb-6 animate-slide-up opacity-0 delay-100">
            Tout ce qu&apos;il faut pour mesurer votre vrai ROAS
          </h1>
          <p className="text-body max-w-2xl mx-auto animate-slide-up opacity-0 delay-200">
            Attribution multi-touch, analyse de funnel, intégrations natives et tracking server-side.
            Découvrez comment Pixly transforme vos données publicitaires en décisions rentables.
          </p>
        </div>
      </div>
    </section>
  );
}

function CoreFeaturesSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="container-main">
        <AnimatedSection>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <span className="label">Fonctionnalités principales</span>
            <h2 className="heading-lg mt-3 sm:mt-4">Les 4 piliers de votre attribution</h2>
          </div>
        </AnimatedSection>

        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {CORE_FEATURES.map((feature, index) => {
            const isEven = index % 2 === 1;

            return (
              <section key={feature.id} id={feature.id} className="scroll-mt-24">
                <AnimatedSection direction="up" delay={0.05}>
                  <article className="feature-card rounded-2xl overflow-hidden bg-white">
                    {/* Top accent stripe */}
                    <div
                      className="feature-accent-stripe h-[3px] w-full"
                      style={{ background: `linear-gradient(90deg, ${feature.palette.from}, ${feature.palette.to})` }}
                      aria-hidden="true"
                    />

                    <div className="p-6 sm:p-8 lg:p-10">
                      <div className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12`}>
                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                          {/* Number */}
                          <span
                            className="text-xs font-mono font-bold tracking-wider mb-3 block"
                            style={{ color: feature.palette.accent }}
                          >
                            {feature.number}
                          </span>

                          {/* Gradient title */}
                          <h3
                            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight mb-3"
                            style={{
                              background: `linear-gradient(135deg, ${feature.palette.from}, ${feature.palette.to})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {feature.title}
                          </h3>

                          {/* Subtitle */}
                          <p
                            className="text-sm font-semibold mb-4"
                            style={{ color: feature.palette.accent }}
                          >
                            {feature.subtitle}
                          </p>

                          {/* Pedagogical explanation */}
                          <p className="text-body mb-8 max-w-lg leading-relaxed">{feature.explanation}</p>

                          {/* How it works — 3 steps */}
                          <div className="mb-8">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                              Comment &ccedil;a fonctionne
                            </h4>
                            <ol className="space-y-3">
                              {feature.steps.map((s) => (
                                <li key={s.step} className="flex gap-3">
                                  <span
                                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: feature.palette.accent }}
                                  >
                                    {s.step}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-neutral-800">{s.title}</p>
                                    <p className="text-sm text-neutral-500 mt-0.5">{s.description}</p>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Impact statement */}
                          <div
                            className="border-l-2 pl-4 py-1"
                            style={{ borderColor: feature.palette.accent }}
                          >
                            <p className="text-sm font-semibold text-neutral-800 leading-relaxed">
                              {feature.impactStatement}
                            </p>
                          </div>
                        </div>

                        {/* Mockup */}
                        <div className="flex-1 flex items-center min-w-0">
                          <div
                            className="rounded-2xl p-4 lg:p-5 w-full border border-black/[0.04]"
                            style={{
                              backgroundColor: feature.palette.light,
                              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
                              backgroundSize: '20px 20px',
                              boxShadow: '0 2px 12px -2px rgba(0,0,0,0.06)',
                            }}
                          >
                            <FeatureMockup id={feature.mockupId} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </AnimatedSection>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AdvancedFeaturesSection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-neutral-50 relative">
      <div className="absolute inset-0 grid-accent-light pointer-events-none" aria-hidden="true" />

      <div className="container-main relative">
        <AnimatedSection>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <span className="label">Fonctionnalités avancées</span>
            <h2 className="heading-lg mt-3 sm:mt-4">Allez plus loin dans l&apos;optimisation</h2>
            <p className="text-body mt-3 sm:mt-4 max-w-2xl mx-auto">
              Chaque fonctionnalité est conçue pour un objectif : que chaque euro investi génère plus de revenu.
            </p>
          </div>
        </AnimatedSection>

        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {ADVANCED_FEATURES.map((feature, index) => {
            const isEven = index % 2 === 1;
            const IconComponent = feature.icon;

            return (
              <section key={feature.id} id={feature.id} className="scroll-mt-24">
                <AnimatedSection direction="up" delay={0.05}>
                  <article className="feature-card rounded-2xl overflow-hidden bg-white">
                    {/* Top accent stripe */}
                    <div
                      className="feature-accent-stripe h-[3px] w-full"
                      style={{ background: `linear-gradient(90deg, ${feature.palette.from}, ${feature.palette.to})` }}
                      aria-hidden="true"
                    />

                    <div className="p-6 sm:p-8 lg:p-10">
                      {/* Header: icon + number + title + subtitle */}
                      <div className="mb-8 sm:mb-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${feature.palette.accent}12` }}
                          >
                            <IconComponent className="h-5 w-5" style={{ color: feature.palette.accent }} />
                          </div>
                          <span
                            className="text-xs font-mono font-bold tracking-wider"
                            style={{ color: feature.palette.accent }}
                          >
                            {feature.number}
                          </span>
                        </div>

                        <h3
                          className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold leading-tight mb-3"
                          style={{
                            background: `linear-gradient(135deg, ${feature.palette.from}, ${feature.palette.to})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          {feature.title}
                        </h3>

                        <p
                          className="text-sm font-semibold"
                          style={{ color: feature.palette.accent }}
                        >
                          {feature.subtitle}
                        </p>
                      </div>

                      {/* Explanation + Mockup */}
                      <div className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 mb-10`}>
                        {/* Pedagogical explanation */}
                        <div className="flex-1 min-w-0">
                          <p className="text-body leading-relaxed">{feature.explanation}</p>
                        </div>

                        {/* Mockup */}
                        <div className="flex-1 flex items-center min-w-0">
                          <div
                            className="rounded-2xl p-4 lg:p-5 w-full border border-black/[0.04]"
                            style={{
                              backgroundColor: feature.palette.light,
                              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
                              backgroundSize: '20px 20px',
                              boxShadow: '0 2px 12px -2px rgba(0,0,0,0.06)',
                            }}
                          >
                            <FeatureMockup id={feature.mockupId} />
                          </div>
                        </div>
                      </div>

                      {/* Impact metrics */}
                      <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-10 py-6 border-y border-neutral-100">
                        {feature.impact.map((metric) => (
                          <div key={metric.label} className="text-center">
                            <p
                              className="text-2xl sm:text-3xl font-serif font-bold"
                              style={{ color: feature.palette.accent }}
                            >
                              {metric.value}
                            </p>
                            <p className="text-xs sm:text-sm text-neutral-500 mt-1">{metric.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* How it works — 3 steps */}
                      <div className="mb-8">
                        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-5">
                          Comment &ccedil;a fonctionne
                        </h4>
                        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                          {feature.steps.map((s) => (
                            <div key={s.step} className="flex sm:flex-col gap-3 sm:gap-0 sm:text-center">
                              <span
                                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white sm:mx-auto sm:mb-3"
                                style={{ backgroundColor: feature.palette.accent }}
                              >
                                {s.step}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-neutral-800">{s.title}</p>
                                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{s.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Impact statement */}
                      <div
                        className="border-l-2 pl-4 py-1"
                        style={{ borderColor: feature.palette.accent }}
                      >
                        <p className="text-sm font-semibold text-neutral-800 leading-relaxed">
                          {feature.impactStatement}
                        </p>
                      </div>
                    </div>
                  </article>
                </AnimatedSection>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesCTA() {
  return (
    <section className="section" aria-label="Appel à l'action">
      <div className="container-main">
        <AnimatedSection direction="scale">
          <div className="relative rounded-2xl sm:rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 sm:px-14 sm:py-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" aria-hidden="true" />
            <div className="absolute inset-0 grid-accent-light pointer-events-none" aria-hidden="true" />

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="heading-lg mb-3 sm:mb-4">
                Arrêtez de deviner, commencez à mesurer
              </h2>
              <p className="text-body mb-8 sm:mb-10">
                Pixly vous donne la clarté dont vous avez besoin pour prendre des décisions budgétaires fondées sur des données fiables. 14 jours d&apos;essai gratuit, sans engagement.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login?mode=signup" className="btn btn-primary btn-xl w-full sm:w-auto">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/#tarifs" className="btn btn-outline btn-xl w-full sm:w-auto">
                  Voir les tarifs
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ===========================================
// PAGE (Server Component)
// ===========================================

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <HashScrollHandler />
      <main>
        <FeaturesHero />
        <CoreFeaturesSection />
        <AdvancedFeaturesSection />
        <FeaturesCTA />
      </main>
      <Footer />
    </div>
  );
}
