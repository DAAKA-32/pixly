import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Star,
  ChevronDown,
} from 'lucide-react';

import { InfiniteLogos } from '@/components/landing/infinite-logos';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';
import {
  AnimatedSection,
  StaggerChildren,
  StaggerItem,
  ScrollRevealCard,
  HeroScrollFade,
} from '@/components/landing/animations';
import { DemoCarousel } from '@/components/landing/demo-carousel';
import { ROICalculator } from '@/components/landing/roi-calculator';
import { StickyFeatures } from '@/components/landing/sticky-features';

// ===========================================
// CONTENT - Source unique de vérité
// ===========================================

const CONTENT = {
  hero: {
    title: 'Mesurez ce que rapporte chaque euro pub',
    subtitle: 'Attribution précise de vos conversions, même avec iOS 14+ et les ad-blockers.',
    primaryCta: 'Démarrer gratuitement',
    secondaryCta: 'Voir la démo',
    trust: ['Sans carte bancaire', '14 jours d\'essai'],
  },

  features: {
    label: 'Fonctionnalités',
    title: 'Chaque euro dépensé, enfin justifié',
    items: [
      {
        number: '01',
        mockupId: 'attribution',
        title: 'Sachez d\'où vient chaque vente',
        subtitle: 'Comprenez la vraie contribution de chaque canal et investissez en toute confiance.',
        description: 'La plupart des outils n\'attribuent qu\'au dernier clic. Résultat : vos canaux sont mal évalués et votre budget mal réparti. Pixly répartit le crédit sur tout le parcours client grâce à 5 modèles d\'attribution.',
        steps: ['Connectez vos comptes publicitaires', 'Choisissez votre modèle d\'attribution', 'Visualisez le ROAS réel de chaque canal'],
        impact: 'Identifiez vos canaux rentables et réallouez votre budget avec certitude.',
      },
      {
        number: '02',
        mockupId: 'funnel',
        title: 'Trouvez où vous perdez vos clients',
        subtitle: 'Décomposez le parcours d\'achat étape par étape et ciblez les vrais points de friction.',
        description: 'Sans vision du funnel, vous optimisez à l\'aveugle. Pixly décompose chaque étape — de la visite à l\'achat — et mesure le taux de drop-off par canal pour que vous sachiez exactement où agir.',
        steps: ['Définissez vos étapes de conversion', 'Comparez les performances par canal', 'Identifiez et corrigez les points de friction'],
        impact: 'Réduisez vos abandons et augmentez votre taux de conversion global.',
      },
      {
        number: '03',
        mockupId: 'integrations',
        title: 'Connectez tout en un clic',
        subtitle: 'Meta, Google, TikTok, Stripe, Shopify, HubSpot — données unifiées en temps réel.',
        description: 'Fini les exports CSV et les tableaux manuels. Pixly se connecte à vos plateformes en OAuth sécurisé et centralise toutes vos données marketing dans un seul tableau de bord, synchronisé en continu.',
        steps: ['Autorisez la connexion OAuth en un clic', 'Les données se synchronisent automatiquement', 'Retrouvez tout dans un tableau de bord unifié'],
        impact: 'Gagnez des heures chaque semaine et travaillez avec des données toujours à jour.',
      },
      {
        number: '04',
        mockupId: 'tracking',
        title: 'Récupérez vos conversions perdues',
        subtitle: 'Pixel first-party et tracking server-side contre iOS 14+ et les ad-blockers.',
        description: 'iOS 14+, ad-blockers et restrictions navigateur font perdre jusqu\'à 40% de vos conversions aux pixels traditionnels. Le pixel first-party de Pixly et le tracking server-side capturent ce que les autres manquent.',
        steps: ['Installez le pixel Pixly sur votre site', 'Le tracking server-side s\'active automatiquement', 'Vos plateformes reçoivent des données complètes'],
        impact: 'Récupérez jusqu\'à 40% de conversions manquantes et optimisez sur des données fiables.',
      },
    ],
  },

  testimonials: {
    label: 'Témoignages',
    title: 'Ils ont repris le contrôle de leur budget',
    items: [
      {
        quote: '40% de nos conversions venaient d\'un canal sous-investi. Depuis Pixly, notre ROAS a augmenté de 47% en deux mois.',
        author: 'Marie Dupont',
        role: 'Directrice Marketing',
        company: 'Maison Élégance',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      },
      {
        quote: 'Enfin des données fiables post-iOS 14. Je justifie chaque euro dépensé auprès de ma direction.',
        author: 'Thomas Martin',
        role: 'Growth Manager',
        company: 'CloudFlow',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      },
      {
        quote: '5 minutes pour tout installer. Pixly est devenu indispensable pour piloter nos campagnes.',
        author: 'Sophie Bernard',
        role: 'CEO & Fondatrice',
        company: 'NaturaCare',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      },
    ],
  },

  pricing: {
    label: 'Tarifs',
    title: 'Simple, transparent, sans surprise',
    subtitle: '14 jours d\'essai gratuit. Sans engagement, sans carte bancaire.',
    featureGroups: [
      { label: 'Plateformes', count: 3 },
      { label: 'Attribution & Tracking', count: 5 },
      { label: 'Analytics', count: 3 },
      { label: 'Support', count: 3 },
    ],
    features: [
      'Meta Ads', 'Google Ads', 'TikTok Ads',
      'Attribution last-click', 'Attribution multi-touch', 'Sync API Conversions', 'Pixel first-party', 'Tracking server-side',
      'Tableau de bord', 'Analyse de funnel', 'Rapports personnalisés',
      'Support email', 'Support prioritaire', 'Account manager dédié',
    ],
    plans: [
      {
        name: 'Starter',
        price: '49',
        limit: 'Jusqu\'à 25k€/mois',
        description: 'Pour les freelances et petites équipes qui débutent en attribution.',
        cta: 'Commencer gratuitement',
        popular: false,
        included: [true, true, false, true, false, false, true, false, true, false, false, true, false, false],
      },
      {
        name: 'Growth',
        price: '99',
        limit: 'Jusqu\'à 100k€/mois',
        description: 'Pour les équipes marketing qui veulent scaler avec des données fiables.',
        cta: 'Essayer 14 jours gratuit',
        popular: true,
        included: [true, true, true, true, true, true, true, true, true, true, false, true, true, false],
      },
      {
        name: 'Scale',
        price: '199',
        limit: 'Dépenses illimitées',
        description: 'Pour les marques et agences à fort volume publicitaire.',
        cta: 'Démarrer maintenant',
        popular: false,
        included: [true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      },
    ],
  },

  founder: {
    quote: 'Aucun outil ne nous montrait la vérité sur nos dépenses pub. On a créé Pixly pour que chaque euro investi trouve enfin sa vraie valeur.',
    name: 'Emilien Nepveu',
    role: 'CEO & Founder of Pixly',
    image: '/CEO.png',
  },

  cta: {
    title: 'Prêt à voir votre vrai ROAS ?',
    subtitle: 'Arrêtez de deviner. Commencez à mesurer.',
    primaryCta: 'Démarrer maintenant',
    secondaryCta: 'Voir les tarifs',
  },

  faq: {
    label: 'Questions fréquentes',
    title: 'Tout savoir sur Pixly',
    items: [
      {
        question: 'Qu\'est-ce que l\'attribution multi-touch ?',
        answer: 'L\'attribution multi-touch répartit la valeur de chaque conversion sur tous les points de contact du parcours client — pas seulement le dernier clic. Pixly analyse Meta, Google, TikTok et vos autres canaux pour identifier la vraie contribution de chaque campagne.',
      },
      {
        question: 'Comment ça fonctionne avec iOS 14+ ?',
        answer: 'Pixly utilise un pixel first-party et un tracking server-side qui contournent iOS 14+ et les ad-blockers. Résultat : jusqu\'à 40% de conversions récupérées.',
      },
      {
        question: 'Quelles plateformes sont supportées ?',
        answer: 'Meta Ads, Google Ads et TikTok Ads via OAuth sécurisé, avec sync server-side (Meta CAPI, Google Enhanced, TikTok Events). Stripe, Shopify et HubSpot sont aussi disponibles.',
      },
      {
        question: 'Combien de temps pour installer Pixly ?',
        answer: '5 minutes. Connectez vos comptes pub via OAuth, installez le pixel sur votre site, c\'est prêt.',
      },
      {
        question: 'Qu\'est-ce que le ROAS ?',
        answer: 'Le ROAS (Return On Ad Spend) mesure le retour sur chaque euro dépensé en pub. Pixly attribue chaque conversion à sa vraie source pour que vous investissiez sur les campagnes qui performent.',
      },
      {
        question: 'Pixly remplace-t-il Facebook Pixel ou Google Analytics ?',
        answer: 'Non, Pixly les complète. Notre tracking server-side capture les données que les navigateurs et iOS bloquent, en parallèle de vos outils actuels.',
      },
    ],
  },

};


// ===========================================
// COMPONENTS (Server Components)
// ===========================================

function Hero() {
  return (
    <section className="relative pt-28 pb-0 sm:pt-40 gradient-hero overflow-hidden">
      <div className="container-main relative">
        <HeroScrollFade className="max-w-3xl mx-auto text-center">
          <h1 className="heading-xl mb-5 sm:mb-6 animate-slide-up opacity-0">
            {CONTENT.hero.title}
          </h1>

          <p className="text-body max-w-2xl mx-auto mb-8 sm:mb-10 animate-slide-up opacity-0 delay-100">
            {CONTENT.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-5 animate-slide-up opacity-0 delay-200">
            <Link href="/login?mode=signup" className="btn btn-primary btn-xl w-full sm:w-auto">
              {CONTENT.hero.primaryCta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#demo" className="btn btn-outline btn-xl w-full sm:w-auto">
              {CONTENT.hero.secondaryCta}
            </Link>
          </div>

          <p className="text-sm text-neutral-400 animate-fade-in opacity-0 delay-300">
            {CONTENT.hero.trust.join(' · ')}
          </p>
        </HeroScrollFade>

        {/* Demo preview — the product speaks for itself */}
        <div className="mt-12 sm:mt-16 lg:mt-20 animate-slide-up opacity-0 delay-300" id="demo">
          <div className="mx-auto max-w-6xl" style={{ perspective: '1200px' }}>
            <div className="hero-demo-frame">
              <DemoCarousel />
            </div>
          </div>
        </div>
      </div>

      {/* Fade gradient — signals continuation below */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-neutral-50 to-transparent pointer-events-none z-10" aria-hidden="true" />
    </section>
  );
}

function LogoCloud() {
  return (
    <section className="relative z-20 py-12 sm:py-14 border-y border-neutral-200/60 bg-neutral-50" aria-label="Plateformes compatibles">
      <AnimatedSection>
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-0">
          {/* Left: Heading */}
          <div className="lg:w-[300px] xl:w-[340px] shrink-0 px-4 sm:px-6 lg:pl-8 xl:pl-12 lg:pr-0">
            <h2 className="text-2xl sm:text-3xl lg:text-[1.75rem] xl:text-[2rem] font-serif text-neutral-800 leading-tight text-center lg:text-left">
              Adopté par les équipes marketing en croissance
            </h2>
          </div>

          {/* Right: Scrolling logos */}
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            <InfiniteLogos speed={40} />
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}


// ===========================================
// SECTION COMPONENTS
// ===========================================

function Testimonials() {
  return (
    <section id="témoignages" className="section bg-neutral-50" aria-label="Témoignages clients">
      <div className="container-main">
        <AnimatedSection>
          <div className="text-center mb-12 sm:mb-16">
            <span className="label">{CONTENT.testimonials.label}</span>
            <h2 className="heading-lg mt-3 sm:mt-4">{CONTENT.testimonials.title}</h2>
          </div>
        </AnimatedSection>

        <StaggerChildren className="grid md:grid-cols-3 gap-6" staggerDelay={0.12}>
          {CONTENT.testimonials.items.map((item) => (
            <StaggerItem key={item.author}>
              <article className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-0.5 mb-5" aria-label="5 étoiles sur 5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-neutral-600 mb-6 leading-relaxed flex-1">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-neutral-100">
                    <Image
                      src={item.image}
                      alt={`Photo de ${item.author}, ${item.role} chez ${item.company}`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-neutral-900 font-medium text-sm">{item.author}</p>
                    <p className="text-neutral-400 text-xs">
                      {item.role}, {item.company}
                    </p>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="py-20 sm:py-28 md:py-36 bg-white border-y border-neutral-200/80" aria-label="Citation du fondateur">
      <div className="container-main">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] font-serif text-neutral-900 leading-snug sm:leading-[1.2]">
              &ldquo;{CONTENT.founder.quote}&rdquo;
            </blockquote>

            <div className="mt-10 sm:mt-14 flex flex-col items-center">
              <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-neutral-200 mb-4">
                <Image
                  src={CONTENT.founder.image}
                  alt={`${CONTENT.founder.name}, ${CONTENT.founder.role}`}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <a
                href="https://www.linkedin.com/in/e-nepveu-58a38127a/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold text-neutral-900 transition-colors duration-200 hover:text-primary-600"
              >
                {CONTENT.founder.name}
              </a>
              <p className="mt-0.5 text-sm text-neutral-500">
                {CONTENT.founder.role}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Pricing() {
  const { featureGroups, features, plans } = CONTENT.pricing;

  // Pre-compute group offsets for feature indexing
  const offsets: number[] = [];
  let offset = 0;
  for (const group of featureGroups) {
    offsets.push(offset);
    offset += group.count;
  }

  return (
    <section id="tarifs" className="section bg-neutral-50" aria-label="Tarification">
      <div className="container-main">
        <AnimatedSection>
          <div className="text-center mb-14 sm:mb-20">
            <span className="label">{CONTENT.pricing.label}</span>
            <h2 className="heading-lg mt-3 sm:mt-4">{CONTENT.pricing.title}</h2>
            <p className="text-body mt-3 sm:mt-4">{CONTENT.pricing.subtitle}</p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isPopular = !!plan.popular;

            return (
              <ScrollRevealCard
                key={plan.name}
                index={i}
                className={`h-full ${isPopular ? 'order-first md:order-none' : ''}`}
              >
                <article
                  className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-500 ${
                    isPopular
                      ? 'bg-white border-2 border-primary-500/60 z-10 md:-my-4'
                      : 'bg-white border border-neutral-200/80'
                  }`}
                  style={isPopular ? { boxShadow: '0 8px 30px -4px rgba(15, 157, 88, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)' } : undefined}
                >
                  {/* Green accent bar for popular plan */}
                  {isPopular && (
                    <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
                  )}

                  {/* Header */}
                  <div className="p-7 sm:p-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {plan.name}
                      </h3>
                      {isPopular && (
                        <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-primary-200/80">
                          Le plus populaire
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mt-6 flex items-baseline">
                      <span className="text-[2.75rem] font-bold font-serif tracking-tight text-neutral-900">
                        {plan.price}€
                      </span>
                      <span className="text-sm ml-1.5 text-neutral-400">
                        /mois
                      </span>
                    </div>

                    {/* Spending limit pill */}
                    <div className="mt-3 mb-6">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-md ${
                        isPopular
                          ? 'bg-primary-50 text-primary-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {plan.limit}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href="/login?mode=signup"
                      className={`btn btn-lg w-full justify-center rounded-xl font-semibold text-sm ${
                        isPopular
                          ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20'
                          : 'bg-transparent text-neutral-700 border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className={`mx-7 sm:mx-8 border-t ${isPopular ? 'border-primary-100' : 'border-neutral-200/80'}`} />

                  {/* Feature groups */}
                  <div className="p-7 sm:p-8 flex-1">
                    {featureGroups.map((group, gi) => {
                      const start = offsets[gi];
                      const groupFeatures = features.slice(start, start + group.count);

                      return (
                        <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                            {group.label}
                          </p>
                          <ul className="space-y-2.5">
                            {groupFeatures.map((feature, fi) => {
                              const included = plan.included[start + fi];
                              return (
                                <li key={feature} className="flex items-center gap-2.5">
                                  {included ? (
                                    <svg className="h-4 w-4 flex-shrink-0 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <div className="h-4 w-4 flex-shrink-0 flex items-center justify-center">
                                      <div className="h-px w-2.5 bg-neutral-300 rounded" />
                                    </div>
                                  )}
                                  <span className={`text-sm ${
                                    included ? 'text-neutral-700' : 'text-neutral-400'
                                  }`}>
                                    {feature}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </ScrollRevealCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SimulatorROI() {
  return (
    <section id="simulateur" className="section bg-white relative" aria-label="Simulateur de ROI">
      {/* Analytical grid — wider spacing, higher precision feel for data context */}
      <div className="absolute inset-0 grid-simulator pointer-events-none" aria-hidden="true" />

      <div className="container-main relative">
        <AnimatedSection>
          <div className="text-center mb-10 sm:mb-14">
            <span className="label">Simulateur</span>
            <h2 className="heading-lg mt-3 sm:mt-4">Calculez votre retour sur investissement</h2>
            <p className="text-body mt-3 sm:mt-4 max-w-2xl mx-auto">
              Ajustez vos dépenses pub et votre panier moyen pour voir l&apos;impact de Pixly sur vos revenus.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0.1}>
          <ROICalculator />
        </AnimatedSection>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="section bg-white" aria-label="Questions fréquentes">
      <div className="container-main">
        <AnimatedSection>
          <div className="text-center mb-12 sm:mb-16">
            <span className="label">{CONTENT.faq.label}</span>
            <h2 className="heading-lg mt-3 sm:mt-4">{CONTENT.faq.title}</h2>
          </div>
        </AnimatedSection>

        <StaggerChildren className="max-w-3xl mx-auto space-y-4" staggerDelay={0.08}>
          {CONTENT.faq.items.map((item) => (
            <StaggerItem key={item.question}>
              <details
                className="group bg-neutral-50 border border-neutral-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-neutral-300"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left font-medium text-neutral-900 hover:text-primary-700 transition-colors duration-200 [&::-webkit-details-marker]:hidden list-none">
                  <span className="pr-4">{item.question}</span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-neutral-400 group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-neutral-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </details>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="section" aria-label="Appel à l'action">
      <div className="container-main">
        <AnimatedSection direction="scale">
          <div className="relative rounded-2xl sm:rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 sm:px-14 sm:py-20 overflow-hidden">
            {/* Subtle accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary-400/40 to-transparent" aria-hidden="true" />
            {/* Grid bookend — mirrors hero data feel, lighter to keep CTA focus */}
            <div className="absolute inset-0 grid-accent-light pointer-events-none" aria-hidden="true" />

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="heading-lg mb-3 sm:mb-4">{CONTENT.cta.title}</h2>
              <p className="text-body mb-8 sm:mb-10">{CONTENT.cta.subtitle}</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login?mode=signup" className="btn btn-primary btn-xl w-full sm:w-auto">
                  {CONTENT.cta.primaryCta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="#tarifs" className="btn btn-outline btn-xl w-full sm:w-auto">
                  {CONTENT.cta.secondaryCta}
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation />
      <main>
        <Hero />
        <LogoCloud />
        <StickyFeatures
          label={CONTENT.features.label}
          title={CONTENT.features.title}
          features={CONTENT.features.items}
        />
        <Testimonials />
        <FounderSection />
        <Pricing />
        <SimulatorROI />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
