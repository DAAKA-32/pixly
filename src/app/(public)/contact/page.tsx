import Link from 'next/link';
import { Metadata } from 'next';
import { Mail, Clock, ArrowRight, MessageSquare, Briefcase } from 'lucide-react';

// ===========================================
// PIXLY - Contact / Support
// ===========================================

export const metadata: Metadata = {
  title: 'Contactez-nous — Support & Commercial',
  description:
    'Contactez l\'équipe Pixly : support technique, questions commerciales ou exercice de vos droits RGPD. Réponse sous 24h ouvrées.',
  keywords: [
    'contact Pixly',
    'support attribution marketing',
    'aide tracking publicitaire',
    'support technique ROAS',
  ],
  alternates: {
    canonical: 'https://pixly.app/contact',
  },
  openGraph: {
    title: 'Contactez l\'équipe Pixly',
    description:
      'Support technique, demande commerciale ou question RGPD. Notre équipe vous répond sous 24h ouvrées.',
    url: 'https://pixly.app/contact',
  },
};

const CONTACT_METHODS = [
  {
    icon: MessageSquare,
    title: 'Support technique',
    description: 'Une question sur la plateforme, un bug ou besoin d\'aide ?',
    email: 'support@pixly.app',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: Briefcase,
    title: 'Commercial',
    description: 'Demande de devis, partenariat ou offre sur mesure.',
    email: 'contact@pixly.app',
    color: 'bg-violet-50 text-violet-500',
  },
  {
    icon: Mail,
    title: 'Données personnelles',
    description: 'Exercice de vos droits RGPD ou question sur vos données.',
    email: 'privacy@pixly.app',
    color: 'bg-amber-50 text-amber-600',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Comment installer le pixel Pixly ?',
    answer:
      'Après avoir créé votre compte, rendez-vous dans la section Intégrations pour copier votre script de suivi et l\'ajouter dans la balise <head> de votre site.',
  },
  {
    question: 'Quels modes de paiement acceptez-vous ?',
    answer:
      'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via notre partenaire Stripe. Tous les paiements sont sécurisés.',
  },
  {
    question: 'Puis-je annuler mon abonnement à tout moment ?',
    answer:
      'Oui, vous pouvez annuler votre abonnement depuis votre espace Facturation. La résiliation prend effet à la fin de votre période de facturation en cours.',
  },
];

export default function ContactPage() {
  return (
    <article className="pt-12 sm:pt-16 pb-20 sm:pb-28">
      <div className="container-main">
        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <span className="label">Contact</span>
          <h1 className="heading-lg mt-3">
            Une question ? Nous sommes là.
          </h1>
          <p className="text-body mt-4 max-w-2xl mx-auto">
            Notre équipe vous répond sous 24 heures ouvrées.
            Choisissez le canal le plus adapté à votre demande.
          </p>
        </header>

        {/* Contact methods */}
        <section className="max-w-3xl mx-auto mb-20 sm:mb-28">
          <div className="grid sm:grid-cols-3 gap-6">
            {CONTACT_METHODS.map((method) => (
              <div
                key={method.title}
                className="p-6 rounded-2xl border border-neutral-200/80 bg-white flex flex-col"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${method.color} mb-4`}>
                  <method.icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-neutral-900 mb-2">
                  {method.title}
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed mb-4 flex-1">
                  {method.description}
                </p>
                <a
                  href={`mailto:${method.email}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {method.email}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Horaires */}
        <section className="max-w-3xl mx-auto mb-20 sm:mb-28">
          <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 flex-shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 mb-1">
                Horaires de disponibilité
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Lundi — Vendredi, 9h — 18h (heure de Paris, CET).
                Les demandes reçues en dehors de ces horaires seront traitées le jour ouvré suivant.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ rapide */}
        <section className="max-w-3xl mx-auto mb-20 sm:mb-28">
          <h2 className="heading-md text-center mb-10">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-neutral-200/80 bg-white"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-base font-medium text-neutral-900 hover:text-primary-700 transition-colors [&::-webkit-details-marker]:hidden list-none">
                  {item.question}
                  <span className="ml-4 text-neutral-400 group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="heading-md mb-4">
              Vous préférez essayer directement ?
            </h2>
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
