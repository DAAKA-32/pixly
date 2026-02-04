'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Target,
  Zap,
  Shield,
  Globe,
  LineChart,
  Star,
  Play,
  ChevronRight,
} from 'lucide-react';
import { Logo, LogoIcon } from '@/components/ui/logo';
import { InfiniteLogos } from '@/components/landing/infinite-logos';

// ===========================================
// CONTENT - Source unique de vérité
// ===========================================

const CONTENT = {
  nav: {
    links: ['Fonctionnalités', 'Témoignages', 'Tarifs'],
    cta: 'Commencer',
  },

  hero: {
    badge: 'Nouveau : Synchronisation Google Ads en temps réel',
    title: 'Mesurez chaque euro investi en publicité',
    subtitle: 'Pixly connecte vos plateformes publicitaires à vos ventes réelles pour une attribution précise, même avec iOS 14+.',
    primaryCta: 'Démarrer gratuitement',
    secondaryCta: 'Voir la démo',
    trust: ['Sans carte bancaire', '14 jours d\'essai'],
  },

  features: {
    label: 'Fonctionnalités',
    title: 'Tout ce qu\'il faut pour maîtriser votre ROI',
    items: [
      {
        number: '01',
        title: 'Attribution Multi-Touch',
        subtitle: 'Comprenez enfin le vrai parcours de vos clients',
        description: 'Fini de créditer uniquement le dernier clic. Pixly analyse chaque point de contact et vous montre exactement quelles campagnes contribuent réellement à vos ventes.',
        benefits: ['5 modèles d\'attribution', 'Vue complète du parcours', 'Données fiables post-iOS 14'],
        image: '/l1.jpg',
      },
      {
        number: '02',
        title: 'Tracking Server-Side',
        subtitle: 'Récupérez jusqu\'à 40% de conversions perdues',
        description: 'Les bloqueurs de publicités et les restrictions iOS font perdre des données précieuses. Notre pixel server-side contourne ces limitations et capture chaque conversion.',
        benefits: ['Contourne les ad-blockers', 'Compatible iOS 14.5+', 'Données en temps réel'],
        image: '/l2.jpg',
      },
      {
        number: '03',
        title: 'Toutes vos Sources Réunies',
        subtitle: 'Un tableau de bord unique pour toutes vos plateformes',
        description: 'Meta Ads, Google Ads, TikTok, Snapchat... Connectez toutes vos sources publicitaires en quelques clics et comparez leurs performances côte à côte.',
        benefits: ['Meta, Google, TikTok, Snapchat', 'Connexion OAuth sécurisée', 'Synchronisation automatique'],
        image: '/l3.jpg',
      },
      {
        number: '04',
        title: 'Analytics Avancés',
        subtitle: 'Des insights exploitables, pas juste des graphiques',
        description: 'Allez au-delà des métriques basiques. Identifiez vos audiences les plus rentables, vos créatives gagnantes et les moments optimaux pour vos campagnes.',
        benefits: ['Segmentation par audience', 'Analyse des créatives', 'Recommandations automatiques'],
        image: '/l4.jpg',
      },
      {
        number: '05',
        title: 'Capture Click IDs',
        subtitle: 'Ne perdez plus aucune donnée d\'attribution',
        description: 'Pixly capture automatiquement tous les identifiants de clics (fbclid, gclid, ttclid) et paramètres UTM dès l\'arrivée du visiteur.',
        benefits: ['fbclid, gclid, ttclid capturés', 'Tous les UTM enregistrés', 'Persistance first-party'],
        image: '/l5.jpg',
      },
    ],
  },

  testimonials: {
    label: 'Témoignages',
    title: 'Ils optimisent leur acquisition avec Pixly',
    items: [
      {
        quote: 'Nous avons découvert que 40% de nos conversions venaient d\'un canal que nous sous-investissions. Notre ROAS a augmenté de 47% en deux mois.',
        author: 'Marie Dupont',
        role: 'Directrice Marketing',
        company: 'Maison Élégance',
        metric: '+47%',
        metricLabel: 'ROAS',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      },
      {
        quote: 'Enfin des données fiables post-iOS 14. Je peux maintenant justifier chaque euro dépensé auprès de ma direction.',
        author: 'Thomas Martin',
        role: 'Growth Manager',
        company: 'CloudFlow',
        metric: '95%',
        metricLabel: 'Précision',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      },
      {
        quote: 'Installation en 5 minutes, support ultra-réactif. Pixly est devenu indispensable pour piloter nos campagnes.',
        author: 'Sophie Bernard',
        role: 'CEO & Fondatrice',
        company: 'NaturaCare',
        metric: '5 min',
        metricLabel: 'Setup',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      },
    ],
  },

  pricing: {
    label: 'Tarification',
    title: 'Un plan adapté à votre croissance',
    subtitle: 'Tous les plans incluent 14 jours d\'essai gratuit. Sans engagement.',
    plans: [
      {
        name: 'Starter',
        price: '49',
        description: 'Pour les entrepreneurs et petites équipes',
        features: [
          'Jusqu\'à 25k€ de dépenses/mois',
          'Meta + Google Ads',
          'Attribution last-click',
          'Support par email',
        ],
      },
      {
        name: 'Growth',
        price: '99',
        description: 'Pour les équipes marketing en croissance',
        features: [
          'Jusqu\'à 100k€ de dépenses/mois',
          'Toutes les plateformes',
          'Attribution multi-touch',
          'Sync API Conversions',
          'Support prioritaire',
        ],
        popular: true,
      },
      {
        name: 'Scale',
        price: '199',
        description: 'Pour les annonceurs avancés',
        features: [
          'Dépenses illimitées',
          'Intégrations sur mesure',
          'Analytics avancés + API',
          'Account manager dédié',
        ],
      },
    ],
  },

  founder: {
    quote: 'Pixly n\'est pas simplement un outil de tracking. C\'est la fin des décisions marketing à l\'aveugle — chaque euro investi trouve enfin sa vraie valeur.',
    name: 'Alexandre Dupont',
    role: 'Cofounder of Pixly',
    image: '/CEO.png',
  },

  cta: {
    title: 'Prêt à découvrir votre vrai ROAS ?',
    subtitle: 'Rejoignez plus de 500 entreprises qui optimisent leurs campagnes avec Pixly.',
    primaryCta: 'Commencer l\'essai gratuit',
    secondaryCta: 'Contacter l\'équipe',
  },

  footer: {
    description: 'La solution d\'attribution marketing conçue pour les équipes ambitieuses.',
    links: {
      product: ['Fonctionnalités', 'Tarifs', 'Intégrations', 'Changelog'],
      resources: ['Documentation', 'Blog', 'Support', 'Status'],
      legal: ['Confidentialité', 'CGU', 'Cookies'],
    },
  },
};

// ===========================================
// COMPONENTS
// ===========================================

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 z-50 w-full pointer-events-none">
      {/* ========== Mobile Full-Screen Overlay ========== */}
      <div
        className={`
          md:hidden fixed inset-0
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        aria-hidden={!mobileOpen}
      >
        {/* Frosted backdrop */}
        <div
          className={`
            absolute inset-0 bg-white/[0.98] backdrop-blur-2xl
            transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${mobileOpen ? 'opacity-100' : 'opacity-0'}
          `}
        />

        {/* Menu content */}
        <div className="relative h-full flex flex-col justify-between pt-24 pb-10">
          {/* Navigation links */}
          <div className="px-6 flex flex-col gap-1">
            {CONTENT.nav.links.map((link, i) => (
              <Link
                key={link}
                href={`#${link.toLowerCase()}`}
                className="group flex items-center justify-between px-5 py-4 rounded-2xl text-[17px] font-medium text-neutral-800 hover:text-primary-700 hover:bg-primary-50/60 active:bg-primary-100/60 transition-colors duration-200"
                onClick={closeMobile}
                tabIndex={mobileOpen ? 0 : -1}
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${mobileOpen ? (i + 1) * 60 : 0}ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${mobileOpen ? (i + 1) * 60 : 0}ms, background-color 0.2s, color 0.2s`,
                }}
              >
                <span>{link}</span>
                <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-primary-400 transition-colors duration-200" />
              </Link>
            ))}
          </div>

          {/* Bottom CTA section */}
          <div
            className="px-6 flex flex-col gap-3"
            style={{
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? 'translateY(0)' : 'translateY(12px)',
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${mobileOpen ? 250 : 0}ms`,
            }}
          >
            <div className="h-px bg-neutral-100 mb-2" />
            <Link
              href="/login"
              className="px-6 py-3.5 text-center font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-2xl transition-colors duration-200"
              onClick={closeMobile}
              tabIndex={mobileOpen ? 0 : -1}
            >
              Connexion
            </Link>
            <Link
              href="/login"
              className="px-6 py-4 text-center font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={closeMobile}
              tabIndex={mobileOpen ? 0 : -1}
            >
              {CONTENT.nav.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========== Top Navigation Bar ========== */}
      <div className="container-main py-3 sm:py-4 relative z-10">
        {/* Navbar Container - GPU-accelerated transforms */}
        <div
          className="pointer-events-auto will-change-transform"
          style={{
            transform: scrolled ? 'translateY(0)' : 'translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            className={`
              relative flex h-14 sm:h-16 items-center justify-between
              transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
              ${scrolled
                ? 'px-4 sm:px-6 bg-white/80 backdrop-blur-2xl rounded-2xl border border-neutral-200/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.8)_inset]'
                : 'px-2 sm:px-4 bg-transparent rounded-none border-transparent shadow-none'
              }
            `}
          >
            {/* Logo */}
            <div className="flex-shrink-0 z-10">
              <Logo href="/" size="sm" />
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              <div className={`
                flex items-center gap-1 px-1.5 py-1.5 rounded-xl
                transition-all duration-300
                ${scrolled ? 'bg-neutral-100/60' : 'bg-white/60 backdrop-blur-sm'}
              `}>
                {CONTENT.nav.links.map((link) => (
                  <Link
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg
                      transition-all duration-200
                      ${scrolled
                        ? 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/80'
                      }
                    `}
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop CTA - Right */}
            <div className="hidden md:flex items-center gap-4 z-10">
              <Link
                href="/login"
                className={`
                  px-4 py-2.5 text-sm font-medium rounded-xl
                  transition-all duration-200
                  ${scrolled
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/60'
                  }
                `}
              >
                Connexion
              </Link>
              <Link
                href="/login"
                className={`
                  inline-flex items-center justify-center
                  px-5 sm:px-6 py-2.5 sm:py-3
                  text-sm font-semibold text-white
                  bg-primary-600 hover:bg-primary-700
                  rounded-xl
                  shadow-lg shadow-primary-600/25
                  hover:shadow-xl hover:shadow-primary-600/30
                  transform hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200
                `}
              >
                {CONTENT.nav.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Menu Button - Animated Hamburger */}
            <button
              className={`
                md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl z-10
                transition-all duration-200
                ${mobileOpen
                  ? 'text-neutral-900'
                  : scrolled
                    ? 'hover:bg-neutral-100 text-neutral-700'
                    : 'hover:bg-white/60 text-neutral-700'
                }
              `}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              <div className="w-[18px] flex flex-col gap-[5px]">
                <span
                  className={`block h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                    mobileOpen ? 'translate-y-[6.5px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-full rounded-full bg-current transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    mobileOpen ? 'opacity-0 scale-x-0' : ''
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                    mobileOpen ? '-translate-y-[6.5px] -rotate-45' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-28 pb-16 sm:pt-40 sm:pb-32 gradient-hero overflow-hidden">
      <div className="container-main">
        <div className="max-w-3xl mx-auto text-center">
          <div className="badge badge-primary mb-5 sm:mb-6 text-xs sm:text-sm">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
            {CONTENT.hero.badge}
          </div>

          <h1 className="heading-xl mb-5 sm:mb-6">
            {CONTENT.hero.title}
          </h1>

          <p className="text-body max-w-2xl mx-auto mb-8 sm:mb-10">
            {CONTENT.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            <Link href="/login" className="btn btn-primary btn-xl w-full sm:w-auto">
              {CONTENT.hero.primaryCta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#demo" className="btn btn-outline btn-xl w-full sm:w-auto">
              <Play className="mr-2 h-5 w-5" />
              {CONTENT.hero.secondaryCta}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-small">
            {CONTENT.hero.trust.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary-500 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoCloud() {
  return (
    <section className="py-12 border-y border-neutral-200 bg-neutral-50">
      <div className="container-main mb-6">
        <p className="text-center text-small">
          Compatible avec vos outils marketing
        </p>
      </div>
      <InfiniteLogos speed={35} />
    </section>
  );
}

function Features() {
  return (
    <section id="fonctionnalités" className="section gradient-section">
      <div className="container-main">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <span className="label">{CONTENT.features.label}</span>
          <h2 className="heading-lg mt-3 sm:mt-4">{CONTENT.features.title}</h2>
        </div>

        <div className="space-y-16 sm:space-y-24 lg:space-y-32">
          {CONTENT.features.items.map((feature, index) => {
            const isEven = index % 2 === 1;

            return (
              <div
                key={feature.number}
                className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 sm:gap-12 lg:gap-20`}
              >
                {/* Text Content */}
                <div className="flex-1 max-w-xl">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-serif text-primary-200 font-bold">
                    {feature.number}
                  </span>

                  <h3 className="heading-lg mt-3 sm:mt-4 mb-2">{feature.title}</h3>

                  <p className="text-base sm:text-lg text-primary-600 font-medium mb-3 sm:mb-4">
                    {feature.subtitle}
                  </p>

                  <p className="text-body mb-5 sm:mb-6">
                    {feature.description}
                  </p>

                  <ul className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-600" />
                        </div>
                        <span className="text-neutral-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image */}
                <div className="flex-1 w-full">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-neutral-900/10">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Dashboard() {
  return (
    <section id="demo" className="section">
      <div className="container-main">
        <div className="text-center mb-8 sm:mb-12">
          <span className="label">Aperçu</span>
          <h2 className="heading-lg mt-3 sm:mt-4">Un tableau de bord pensé pour l&apos;action</h2>
          <p className="text-body mt-3 sm:mt-4 max-w-2xl mx-auto">
            Visualisez vos performances en temps réel et identifiez vos leviers de croissance.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl" />

          <div className="relative card p-2 sm:p-3">
            <div className="rounded-xl bg-neutral-900 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LogoIcon size="xs" />
                    <span className="text-white font-medium text-sm">Dashboard</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
                  {[
                    { label: 'Revenus', value: '€127,493', change: '+23%', positive: true },
                    { label: 'ROAS', value: '4.2x', change: '+18%', positive: true },
                    { label: 'Conversions', value: '1,847', change: '+31%', positive: true },
                    { label: 'CPA', value: '€24.50', change: '-12%', positive: true },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-2.5 sm:p-4 border border-white/10">
                      <p className="text-[11px] sm:text-xs text-neutral-400">{item.label}</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">{item.value}</p>
                      <p className={`text-[11px] sm:text-xs mt-0.5 sm:mt-1 ${item.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {item.change}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-neutral-300">Attribution par canal</span>
                    <span className="text-xs text-neutral-500">7 derniers jours</span>
                  </div>
                  <div className="flex items-end gap-2 h-32 sm:h-40">
                    {[65, 45, 80, 55, 70, 90, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all duration-500"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="témoignages" className="section bg-neutral-50">
      <div className="container-main">
        <div className="text-center mb-10 sm:mb-16">
          <span className="label">
            {CONTENT.testimonials.label}
          </span>
          <h2 className="heading-lg mt-3 sm:mt-4">{CONTENT.testimonials.title}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-6">
          {CONTENT.testimonials.items.map((item) => (
            <div
              key={item.author}
              className="relative bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 hover:border-neutral-300 hover:shadow-lg transition-all duration-300"
            >
              {/* Metric Badge */}
              <div className="absolute -top-3 right-6 bg-primary-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg shadow-primary-500/25">
                {item.metric} {item.metricLabel}
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-neutral-600 mb-6 leading-relaxed">
                "{item.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-neutral-200">
                  <Image
                    src={item.image}
                    alt={item.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-neutral-900 font-medium text-sm">{item.author}</p>
                  <p className="text-neutral-500 text-xs">
                    {item.role}, {item.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-white border-y border-neutral-200">
      <div className="container-main">
        <div className="max-w-4xl mx-auto text-center">
          {/* Quote Icon */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-50 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-neutral-900 leading-snug sm:leading-tight">
            &ldquo;{CONTENT.founder.quote}&rdquo;
          </blockquote>

          {/* Author info */}
          <div className="mt-8 sm:mt-12 flex flex-col items-center">
            {/* Avatar */}
            <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-primary-100 mb-4">
              <Image
                src={CONTENT.founder.image}
                alt={CONTENT.founder.name}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-lg font-semibold text-neutral-900">
              {CONTENT.founder.name}
            </p>
            <p className="mt-1 text-sm text-primary-600 font-medium tracking-wide">
              {CONTENT.founder.role}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="tarifs" className="section gradient-section">
      <div className="container-main">
        <div className="text-center mb-10 sm:mb-16">
          <span className="label">{CONTENT.pricing.label}</span>
          <h2 className="heading-lg mt-3 sm:mt-4">{CONTENT.pricing.title}</h2>
          <p className="text-body mt-3 sm:mt-4">{CONTENT.pricing.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {CONTENT.pricing.plans.map((plan) => (
            <div
              key={plan.name}
              className={`card-pricing ${plan.popular ? 'featured' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommandé
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-small mt-1">{plan.description}</p>

                <div className="mt-6 mb-6">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-neutral-500">/mois</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-neutral-600">
                      <Check className="h-5 w-5 text-primary-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`btn btn-lg w-full justify-center ${
                    plan.popular ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  Commencer l'essai
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="section bg-neutral-50">
      <div className="container-main">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-50 via-white to-emerald-50 border border-primary-100 px-5 py-12 sm:px-12 sm:py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-primary-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-emerald-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="heading-lg mb-3 sm:mb-4">{CONTENT.cta.title}</h2>
            <p className="text-neutral-600 text-base sm:text-lg mb-8 sm:mb-10">{CONTENT.cta.subtitle}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="btn btn-primary btn-xl w-full sm:w-auto">
                {CONTENT.cta.primaryCta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="#" className="btn btn-outline btn-xl w-full sm:w-auto">
                {CONTENT.cta.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-10 sm:py-16">
      <div className="container-main">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-10 sm:mb-12">
          <div className="col-span-2">
            <Logo href="/" size="sm" />
            <p className="text-small mt-4 max-w-xs">{CONTENT.footer.description}</p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Produit</h4>
            <ul className="space-y-2">
              {CONTENT.footer.links.product.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-small hover:text-neutral-900 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Ressources</h4>
            <ul className="space-y-2">
              {CONTENT.footer.links.resources.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-small hover:text-neutral-900 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Légal</h4>
            <ul className="space-y-2">
              {CONTENT.footer.links.legal.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-small hover:text-neutral-900 transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-small">
            © {new Date().getFullYear()} Pixly. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-small">Systèmes opérationnels</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ===========================================
// PAGE
// ===========================================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <LogoCloud />
      <Dashboard />
      <Features />
      <Testimonials />
      <FounderSection />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
