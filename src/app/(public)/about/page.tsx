import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowRight, Target, Shield, BarChart3, Users, Zap, Eye, Lock, CheckCircle2, Globe } from 'lucide-react';

// ===========================================
// PIXLY - À propos
// ===========================================

export const metadata: Metadata = {
  title: 'À propos de Pixly — Notre mission et notre équipe',
  description:
    'Découvrez l\'histoire de Pixly, la plateforme d\'attribution marketing multi-touch. Fondée par Emilien Nepveu, expert en optimisation ROAS et tracking publicitaire.',
  keywords: [
    'Pixly à propos',
    'attribution marketing équipe',
    'fondateur Pixly',
    'Emilien Nepveu',
    'plateforme ROAS',
    'tracking publicitaire France',
  ],
  alternates: {
    canonical: 'https://pixly.app/about',
  },
  openGraph: {
    title: 'À propos de Pixly — Notre mission et notre équipe',
    description:
      'Rendre chaque euro publicitaire mesurable. Découvrez la mission, les valeurs et l\'équipe derrière Pixly.',
    url: 'https://pixly.app/about',
  },
};

const VALUES = [
  {
    icon: Target,
    title: 'Précision',
    description:
      'Chaque euro publicitaire mérite une attribution exacte. Nous ne tolérons pas les approximations.',
  },
  {
    icon: Eye,
    title: 'Transparence',
    description:
      'Pas de boîte noire. Vous voyez exactement comment chaque conversion est attribuée.',
  },
  {
    icon: Zap,
    title: 'Simplicité',
    description:
      'Une interface claire et intuitive. L\'attribution marketing ne devrait pas nécessiter un data scientist.',
  },
];

const STATS = [
  { value: '500+', label: 'Entreprises accompagnées' },
  { value: '+38%', label: 'Conversions récupérées en moyenne' },
  { value: '4', label: 'Plateformes publicitaires intégrées' },
];

export default function AboutPage() {
  return (
    <article className="pt-12 sm:pt-16 pb-20 sm:pb-28">
      <div className="container-main">
        {/* Hero */}
        <header className="max-w-3xl mx-auto text-center mb-20 sm:mb-28">
          <span className="label">À propos</span>
          <h1 className="heading-lg mt-3">
            Rendre chaque euro publicitaire mesurable
          </h1>
          <p className="text-body mt-4 max-w-2xl mx-auto">
            Pixly est née d&apos;un constat simple : les outils d&apos;attribution
            marketing existants sont trop complexes, trop imprécis ou trop
            chers pour les équipes marketing ambitieuses.
          </p>
        </header>

        {/* Problème */}
        <section className="max-w-3xl mx-auto mb-20 sm:mb-28">
          <div className="prose-legal">
            <h2 className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 flex-shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
              Le problème
            </h2>
            <p>
              Avec iOS 14+, la fin des cookies tiers et la montée des
              ad-blockers, les plateformes publicitaires surestiment ou
              sous-estiment systématiquement leurs performances. Les
              équipes marketing prennent des décisions d&apos;investissement
              basées sur des données biaisées.
            </p>
            <p>
              Résultat : du budget gaspillé sur des canaux inefficaces et
              des opportunités manquées sur ceux qui performent réellement.
            </p>
          </div>
        </section>

        {/* Approche */}
        <section className="max-w-3xl mx-auto mb-20 sm:mb-28">
          <div className="prose-legal">
            <h2 className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 flex-shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              Notre approche
            </h2>
            <p>
              Pixly combine un tracking server-side résistant aux
              ad-blockers avec une attribution multi-touch qui croise les
              données de vos plateformes publicitaires et vos conversions
              réelles.
            </p>
            <ul>
              <li>
                <strong>Pixel server-side</strong> — Un script léger installé
                sur votre site, indépendant des cookies tiers
              </li>
              <li>
                <strong>Attribution multi-touch</strong> — Chaque point de
                contact est pris en compte, pas seulement le dernier clic
              </li>
              <li>
                <strong>Synchronisation CAPI</strong> — Les conversions
                vérifiées sont renvoyées aux plateformes pour optimiser
                leurs algorithmes
              </li>
              <li>
                <strong>Données unifiées</strong> — Meta, Google, TikTok et
                LinkedIn dans un seul tableau de bord
              </li>
            </ul>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="mb-20 sm:mb-28">
          <div className="grid sm:grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 sm:p-8 rounded-2xl border border-neutral-200/80 bg-white"
              >
                <p className="text-4xl sm:text-5xl font-serif text-neutral-900">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-neutral-500 mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Fondateur — E-E-A-T: Experience + Expertise */}
        <section className="max-w-3xl mx-auto mb-20 sm:mb-28">
          <div className="prose-legal">
            <h2 className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500 flex-shrink-0">
                <Users className="h-5 w-5" />
              </div>
              Le fondateur
            </h2>
          </div>
          <div className="mt-6 p-6 sm:p-8 rounded-2xl border border-neutral-200/80 bg-neutral-50/50">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl ring-2 ring-neutral-200 flex-shrink-0">
                <Image
                  src="/CEO.png"
                  alt="Emilien Nepveu, CEO et fondateur de Pixly"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-neutral-900">
                  Emilien Nepveu
                </p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Fondateur &amp; CEO
                </p>
                <a
                  href="https://www.linkedin.com/in/e-nepveu-58a38127a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors mt-2"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Profil LinkedIn
                </a>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <p className="text-base text-neutral-600 leading-relaxed">
                Après avoir accompagné des dizaines d&apos;entreprises dans
                l&apos;optimisation de leurs campagnes publicitaires, j&apos;ai
                constaté que le plus grand obstacle n&apos;était pas le manque de
                budget, mais le manque de visibilité sur ce qui fonctionne
                vraiment.
              </p>
              <p className="text-base text-neutral-600 leading-relaxed">
                Spécialisé en marketing digital et en acquisition payante,
                j&apos;ai travaillé sur des budgets publicitaires allant de
                quelques milliers à plusieurs centaines de milliers d&apos;euros
                par mois. Cette expérience m&apos;a montré que l&apos;attribution
                précise est le levier le plus sous-exploité en marketing.
              </p>
              <p className="text-base text-neutral-600 leading-relaxed">
                Pixly est la solution que j&apos;aurais voulu avoir dès le
                premier jour : précise, transparente et accessible.
              </p>
            </div>
          </div>
        </section>

        {/* Confiance & Sécurité — E-E-A-T: Trust */}
        <section className="max-w-3xl mx-auto mb-20 sm:mb-28">
          <div className="prose-legal">
            <h2 className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 flex-shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              Confiance &amp; sécurité
            </h2>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-neutral-200/80 bg-white">
              <div className="flex items-center gap-2.5 mb-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-primary-500 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-neutral-900">Conforme RGPD</h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Toutes les données sont traitées conformément au Règlement
                Général sur la Protection des Données. Hébergement en Europe
                via Vercel.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200/80 bg-white">
              <div className="flex items-center gap-2.5 mb-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-primary-500 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-neutral-900">Paiements sécurisés</h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Tous les paiements sont traités par Stripe, certifié PCI DSS
                niveau 1. Aucune donnée bancaire ne transite par nos serveurs.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200/80 bg-white">
              <div className="flex items-center gap-2.5 mb-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-primary-500 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-neutral-900">OAuth sécurisé</h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Les connexions aux plateformes publicitaires se font via OAuth
                2.0. Nous n&apos;avons jamais accès à vos identifiants.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-200/80 bg-white">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Globe className="h-4.5 w-4.5 text-primary-500 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-neutral-900">Données first-party</h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Notre pixel first-party fonctionne sans cookies tiers. Vos
                données restent sous votre contrôle, conformes aux réglementations
                en vigueur.
              </p>
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section className="max-w-3xl mx-auto mb-20 sm:mb-28">
          <h2 className="heading-md text-center mb-10">Nos valeurs</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl border border-neutral-200/80 bg-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-4">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="heading-md mb-4">Prêt à mesurer votre vrai ROAS ?</h2>
            <p className="text-body mb-8">
              14 jours d&apos;essai gratuit, sans carte bancaire.
            </p>
            <Link
              href="/login?mode=signup"
              className="btn btn-primary btn-lg"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
