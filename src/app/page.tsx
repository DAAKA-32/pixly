'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  BarChart3,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Target,
  LineChart,
  MousePointerClick,
  Users,
  Star,
  Play,
  ChevronRight,
  Sparkles,
  Clock,
  BadgeCheck,
  ArrowUpRight,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo, LogoIcon } from '@/components/ui/logo';
import {
  AnimatedSection,
  StaggerChildren,
  StaggerItem,
  Floating,
  Magnetic,
  Parallax,
} from '@/components/landing/animations';
import { FounderSection } from '@/components/landing/founder-section';
import { InfiniteLogos } from '@/components/landing/infinite-logos';

// ===========================================
// PIXLY - Landing Page Premium
// ===========================================

const features = [
  {
    icon: Target,
    title: 'Attribution Multi-Touch',
    description:
      'Comprenez le parcours complet de vos clients avec 5 modèles d\'attribution différents.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Zap,
    title: 'Tracking Temps Réel',
    description:
      'Visualisez vos conversions instantanément grâce au tracking server-side qui contourne les bloqueurs.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Conforme RGPD',
    description:
      'Collecte first-party qui respecte la vie privée et fonctionne avec iOS 14+.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Globe,
    title: 'Toutes Plateformes',
    description:
      'Meta, Google Ads, TikTok et plus encore depuis un tableau de bord unique.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: LineChart,
    title: 'Analytics Avancés',
    description:
      'Rapports détaillés et insights exploitables pour optimiser vos campagnes.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: MousePointerClick,
    title: 'Click IDs Automatiques',
    description:
      'Capture automatique des fbclid, gclid et tous les paramètres UTM.',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

const metrics = [
  { value: '95%+', label: 'Précision', description: 'Tracking des conversions' },
  { value: '10x', label: 'Plus Rapide', description: 'Que le reporting manuel' },
  { value: '40%', label: 'ROI Moyen', description: 'Amélioration constatée' },
  { value: '<5min', label: 'Installation', description: 'Setup complet' },
];

const steps = [
  {
    number: '01',
    title: 'Installez le Pixel',
    description: 'Copiez une seule ligne de code sur votre site. Compatible avec Shopify, WordPress, et tous les CMS.',
  },
  {
    number: '02',
    title: 'Connectez vos Plateformes',
    description: 'Liez Meta, Google Ads et vos autres sources en quelques clics via OAuth sécurisé.',
  },
  {
    number: '03',
    title: 'Analysez et Optimisez',
    description: 'Visualisez vos vrais ROAS et prenez des décisions basées sur des données fiables.',
  },
];

const testimonials = [
  {
    quote: "Pixly nous a permis d'identifier que 60% de nos conversions venaient d'un canal qu'on sous-estimait. Notre ROAS a augmenté de 47% en 2 mois.",
    author: 'Marie Dupont',
    role: 'CMO',
    company: 'Maison Élégance',
    avatar: 'MD',
    metric: { value: '+47%', label: 'ROAS' },
    verified: true,
  },
  {
    quote: "Enfin une solution qui fonctionne vraiment avec iOS 14+. Les données sont enfin fiables et je peux prendre des décisions éclairées.",
    author: 'Thomas Martin',
    role: 'Growth Manager',
    company: 'CloudFlow SaaS',
    avatar: 'TM',
    metric: { value: '95%', label: 'Précision' },
    verified: true,
  },
  {
    quote: "L'installation a pris 3 minutes. Le support est réactif et la plateforme est intuitive. Je recommande à 100%.",
    author: 'Sophie Bernard',
    role: 'Founder & CEO',
    company: 'NaturaCare',
    avatar: 'SB',
    metric: { value: '3min', label: 'Setup' },
    verified: true,
  },
];

const pricing = [
  {
    name: 'Starter',
    price: 49,
    description: 'Idéal pour les petites entreprises',
    features: [
      'Jusqu\'à 25k€ de dépenses pub/mois',
      'Meta + Google tracking',
      'Attribution basique',
      'Support email',
      '1 workspace',
    ],
  },
  {
    name: 'Growth',
    price: 99,
    description: 'Pour les marques en croissance',
    features: [
      'Jusqu\'à 100k€ de dépenses pub/mois',
      'Toutes les plateformes',
      'Attribution multi-touch',
      'Synchronisation conversions',
      'Support prioritaire',
      '3 workspaces',
    ],
    popular: true,
  },
  {
    name: 'Scale',
    price: 199,
    description: 'Pour les gros annonceurs',
    features: [
      'Jusqu\'à 500k€ de dépenses pub/mois',
      'Intégrations personnalisées',
      'Analytics avancés',
      'Accès API complet',
      'CSM dédié',
      'Workspaces illimités',
    ],
  },
];

const logos = [
  'Shopify', 'WooCommerce', 'Stripe', 'Meta', 'Google', 'TikTok'
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 z-50 w-full"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 flex h-16 items-center justify-between rounded-2xl border border-neutral-200/50 bg-white/80 px-6 shadow-soft backdrop-blur-xl">
            {/* Logo - Left */}
            <Logo href="/" size="sm" />

            {/* Navigation Links - Center */}
            <div className="hidden items-center gap-8 md:flex absolute left-1/2 -translate-x-1/2">
              <Link href="#demo" className="relative text-sm font-medium text-neutral-600 transition-colors hover:text-primary-600 group">
                Demo
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-500 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="#features" className="relative text-sm font-medium text-neutral-600 transition-colors hover:text-primary-600 group">
                Fonctionnalités
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-500 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="#testimonials" className="relative text-sm font-medium text-neutral-600 transition-colors hover:text-primary-600 group">
                Témoignages
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-500 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="#pricing" className="relative text-sm font-medium text-neutral-600 transition-colors hover:text-primary-600 group">
                Tarifs
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>

            {/* Auth Buttons - Right */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100">
                  Connexion
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-md shadow-primary-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/30">
                  Commencer
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl mx-4 mt-2 rounded-2xl border border-neutral-200/50"
        >
          <div className="p-4 space-y-3">
            <Link href="#demo" className="block py-2 px-4 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              Demo
            </Link>
            <Link href="#features" className="block py-2 px-4 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#testimonials" className="block py-2 px-4 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              Témoignages
            </Link>
            <Link href="#pricing" className="block py-2 px-4 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              Tarifs
            </Link>
            <div className="pt-3 border-t border-neutral-200/50 space-y-2">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">Connexion</Button>
              </Link>
              <Link href="/signup" className="block">
                <Button className="w-full">Commencer gratuitement</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section - 100vh */}
      <section ref={heroRef} className="relative h-screen flex flex-col overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 grid-pattern opacity-50" />

        {/* Floating orbs */}
        <Floating duration={8} delay={0}>
          <div className="absolute top-20 left-[10%] h-64 w-64 rounded-full bg-primary-400/10 blur-3xl" />
        </Floating>
        <Floating duration={10} delay={2}>
          <div className="absolute top-40 right-[15%] h-96 w-96 rounded-full bg-primary-300/10 blur-3xl" />
        </Floating>
        <Floating duration={7} delay={1}>
          <div className="absolute bottom-40 left-[20%] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        </Floating>

        {/* Main content - flex-1 to take remaining space */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative flex-1 flex flex-col justify-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24"
        >
          <div className="text-center">
            {/* Badge */}
            <AnimatedSection delay={0.1} immediate>
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-4 py-2 text-sm font-medium text-primary-700 backdrop-blur-sm"
              >
                <Sparkles className="h-4 w-4" />
                Nouveau : Intégration Google Ads disponible
                <ChevronRight className="h-4 w-4" />
              </motion.span>
            </AnimatedSection>

            {/* Heading */}
            <AnimatedSection delay={0.2} className="mt-6 sm:mt-8" immediate>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
                L'Attribution Marketing
                <br />
                <span className="text-gradient-animated">Qui Fonctionne Vraiment</span>
              </h1>
            </AnimatedSection>

            {/* Subheading */}
            <AnimatedSection delay={0.3} className="mt-6" immediate>
              <p className="mx-auto max-w-2xl text-base text-neutral-600 sm:text-lg lg:text-xl leading-relaxed">
                Arrêtez de deviner quelles publicités génèrent des revenus.
                <br className="hidden sm:block" />
                Pixly vous donne une attribution précise en temps réel sur tous vos canaux.
              </p>
            </AnimatedSection>

            {/* CTAs */}
            <AnimatedSection delay={0.4} className="mt-8" immediate>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Magnetic>
                  <Link href="/signup">
                    <Button
                      size="xl"
                      className="group relative overflow-hidden shadow-lg shadow-primary-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-primary-500/30"
                    >
                      <span className="relative z-10 flex items-center">
                        Démarrer l'essai gratuit
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Button>
                  </Link>
                </Magnetic>
                <Link href="#demo">
                  <Button
                    variant="outline"
                    size="xl"
                    className="group border-neutral-300 hover:border-primary-300 hover:bg-primary-50/50"
                  >
                    <Play className="mr-2 h-5 w-5 text-primary-600" />
                    Voir la démo
                  </Button>
                </Link>
              </div>
              <p className="mt-5 flex items-center justify-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-primary-500" />
                  Sans carte bancaire
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary-500" />
                  14 jours d'essai
                </span>
              </p>
            </AnimatedSection>
          </div>
        </motion.div>

        {/* Infinite Logos Carousel - at bottom of hero */}
        <div className="relative z-10 pb-8">
          <AnimatedSection delay={0.5} immediate>
            <p className="text-center text-sm font-medium text-neutral-500 mb-6">
              Compatible avec vos outils préférés
            </p>
          </AnimatedSection>
          <InfiniteLogos speed={35} className="py-4" />
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="demo" className="relative py-20 sm:py-28 bg-gradient-to-b from-white to-neutral-50/50 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <AnimatedSection className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <BarChart3 className="h-4 w-4" />
              Aperçu
            </span>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 sm:text-4xl">
              Un tableau de bord <span className="text-gradient">puissant et intuitif</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
              Visualisez toutes vos métriques clés en un coup d'œil et prenez des décisions éclairées.
            </p>
          </AnimatedSection>

          <AnimatedSection direction="scale">
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary-500/15 via-emerald-500/15 to-teal-500/15 blur-2xl" />

              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-strong sm:rounded-3xl sm:p-3"
              >
                <div className="overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 sm:rounded-2xl">
                  {/* Mock Dashboard */}
                  <div className="p-4 sm:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <LogoIcon size="xs" />
                        <span className="text-white font-semibold">Tableau de bord</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                      {[
                        { label: 'Revenus', value: '€127,493', change: '+23%' },
                        { label: 'ROAS', value: '4.2x', change: '+18%' },
                        { label: 'Conversions', value: '1,847', change: '+31%' },
                        { label: 'CPA', value: '€24.50', change: '-12%' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4"
                        >
                          <p className="text-xs text-neutral-400">{stat.label}</p>
                          <p className="text-lg sm:text-2xl font-bold text-white mt-1">{stat.value}</p>
                          <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {stat.change}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chart placeholder */}
                    <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-neutral-300">Attribution par canal</span>
                        <span className="text-xs text-neutral-500">7 derniers jours</span>
                      </div>
                      <div className="flex items-end gap-2 h-32 sm:h-40">
                        {[65, 45, 80, 55, 70, 90, 75].map((height, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${height}%` }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            viewport={{ once: true }}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {metrics.map((metric) => (
              <StaggerItem key={metric.label}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <p className="text-4xl sm:text-5xl font-bold text-gradient">{metric.value}</p>
                  <p className="mt-2 text-lg font-semibold text-neutral-900">{metric.label}</p>
                  <p className="text-sm text-neutral-500">{metric.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 sm:py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-60" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Zap className="h-4 w-4" />
              Fonctionnalités
            </span>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 sm:text-5xl">
              Tout ce qu'il faut pour tracker
              <br />
              <span className="text-gradient">votre ROI publicitaire</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
              Des fonctionnalités puissantes conçues pour vous donner une visibilité complète
              sur vos performances marketing.
            </p>
          </AnimatedSection>

          <StaggerChildren className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="group relative h-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft transition-all duration-300 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-neutral-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-20 sm:py-32 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <Floating duration={10}>
          <div className="absolute top-20 right-[10%] h-96 w-96 rounded-full bg-primary-400/10 blur-3xl" />
        </Floating>
        <Floating duration={8} delay={1}>
          <div className="absolute bottom-20 left-[5%] h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        </Floating>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Target className="h-4 w-4" />
              Simple et rapide
            </span>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 sm:text-5xl">
              Opérationnel en 3 étapes
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
              Installez Pixly en moins de 5 minutes et commencez à tracker vos conversions avec précision.
            </p>
          </AnimatedSection>

          <StaggerChildren className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <StaggerItem key={step.number}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-primary-300 to-transparent z-10" />
                  )}

                  <div className="relative rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft transition-all duration-300 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25">
                      <span className="text-xl font-bold">{step.number}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-neutral-900">{step.title}</h3>
                    <p className="mt-3 text-neutral-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>

          <AnimatedSection delay={0.4} className="mt-12 text-center">
            <Link href="/signup">
              <Button size="lg" className="shadow-lg shadow-primary-500/25">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-32 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-1.5 text-sm font-medium text-primary-700">
              <Users className="h-4 w-4" />
              Témoignages
            </span>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 sm:text-5xl">
              Ils ont transformé leurs résultats
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
              Découvrez comment des entreprises comme la vôtre utilisent Pixly pour optimiser leurs investissements publicitaires.
            </p>
          </AnimatedSection>

          <StaggerChildren className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.author}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-lg"
                >
                  {/* Metric Badge */}
                  <div className="absolute -top-3 right-6">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-3 py-1 text-white shadow-md shadow-primary-500/20">
                      <span className="text-sm font-semibold">{testimonial.metric.value}</span>
                      <span className="text-xs opacity-90">{testimonial.metric.label}</span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <blockquote className="text-neutral-700 leading-relaxed text-sm">
                    "{testimonial.quote}"
                  </blockquote>

                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-neutral-100">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold text-xs shadow-sm">
                        {testimonial.avatar}
                      </div>
                      {testimonial.verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                          <BadgeCheck className="h-3 w-3 text-primary-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm">{testimonial.author}</p>
                      <p className="text-xs text-neutral-500">
                        {testimonial.role} · {testimonial.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>

          {/* Trust indicators */}
          <AnimatedSection delay={0.3} className="mt-12 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-8 rounded-full border border-neutral-200 bg-white px-8 py-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {['MD', 'TM', 'SB'].map((initials) => (
                    <div
                      key={initials}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-primary-400 to-primary-600 text-[10px] font-medium text-white"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-700">+500 clients actifs</span>
              </div>
              <div className="h-4 w-px bg-neutral-200" />
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-700">4.9/5 satisfaction</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Founder Section */}
      <FounderSection />

      {/* Pricing */}
      <section id="pricing" className="relative py-20 sm:py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-40" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Sparkles className="h-4 w-4" />
              Tarification
            </span>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 sm:text-5xl">
              Des prix simples et transparents
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
              Choisissez le plan adapté à votre activité. Tous les plans incluent 14 jours d'essai gratuit.
            </p>
          </AnimatedSection>

          <StaggerChildren className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {pricing.map((plan) => (
              <StaggerItem key={plan.name}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`relative h-full rounded-2xl border bg-white p-6 sm:p-8 transition-all duration-300 ${
                    plan.popular
                      ? 'border-primary-300 shadow-xl shadow-primary-500/15 ring-1 ring-primary-200'
                      : 'border-neutral-200 shadow-soft hover:border-primary-200 hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold text-white shadow-md shadow-primary-500/25">
                      Recommandé
                    </span>
                  )}

                  <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>

                  <div className="mt-6">
                    <span className="text-4xl font-bold text-neutral-900">{plan.price}€</span>
                    <span className="text-neutral-500 text-sm">/mois</span>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-neutral-600">
                        <Check className="h-4 w-4 flex-shrink-0 text-primary-500 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup" className="mt-8 block">
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      className={`w-full ${plan.popular ? 'shadow-md shadow-primary-500/20' : ''}`}
                    >
                      Commencer l'essai
                      {plan.popular && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </Link>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 px-8 py-16 sm:px-16 sm:py-24">
              {/* Background effects */}
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <Floating duration={8}>
                <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary-400/15 blur-3xl" />
              </Floating>
              <Floating duration={10} delay={2}>
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
              </Floating>

              <div className="relative text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 mb-6"
                >
                  <Sparkles className="h-4 w-4" />
                  Essai gratuit de 14 jours
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-neutral-900 sm:text-5xl"
                >
                  Prêt à connaître votre vrai ROAS ?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mx-auto mt-6 max-w-xl text-lg text-neutral-600"
                >
                  Rejoignez des centaines de marketeurs qui font confiance à Pixly
                  pour des données d'attribution fiables.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                  <Magnetic>
                    <Link href="/signup">
                      <Button
                        size="xl"
                        className="group shadow-lg shadow-primary-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30"
                      >
                        Démarrer gratuitement
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </Magnetic>
                  <Link href="#demo">
                    <Button
                      variant="outline"
                      size="xl"
                      className="border-neutral-300 text-neutral-700 hover:border-primary-300 hover:bg-primary-50"
                    >
                      Parler à un expert
                    </Button>
                  </Link>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-6 flex items-center justify-center gap-4 text-sm text-neutral-500"
                >
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-primary-500" />
                    Sans carte bancaire
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-primary-500" />
                    Données sécurisées
                  </span>
                </motion.p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Logo href="/" size="sm" />
              <p className="mt-4 text-sm text-neutral-500 max-w-xs">
                La solution d'attribution marketing la plus précise pour les e-commerçants et annonceurs.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-neutral-900">Produit</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="#features" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#pricing" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Tarifs</Link></li>
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Intégrations</Link></li>
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900">Ressources</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Guide d'installation</Link></li>
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900">Légal</h4>
              <ul className="mt-4 space-y-3">
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">CGU</Link></li>
                <li><Link href="#" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 sm:flex-row">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Pixly. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Tous les systèmes opérationnels
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
