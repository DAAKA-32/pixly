import { Metadata } from 'next';

// ===========================================
// PIXLY - Politique de cookies
// ===========================================

export const metadata: Metadata = {
  title: 'Politique de cookies',
  description:
    'Informations détaillées sur l\'utilisation des cookies par Pixly : cookies essentiels, analytiques et fonctionnels. Gérez vos préférences.',
  alternates: {
    canonical: 'https://pixly.app/cookies',
  },
  openGraph: {
    title: 'Politique de cookies | Pixly',
    description:
      'Utilisation des cookies sur Pixly : types de cookies, finalités et gestion de vos préférences.',
    url: 'https://pixly.app/cookies',
  },
};

export default function CookiesPage() {
  return (
    <article className="pt-12 sm:pt-16 pb-20 sm:pb-28">
      <div className="container-main">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-12 sm:mb-16">
            <span className="label">Cookies</span>
            <h1 className="heading-lg mt-3">Politique de cookies</h1>
            <p className="text-body mt-4">
              Dernière mise à jour : février 2026
            </p>
          </header>

          {/* Content */}
          <div className="prose-legal space-y-10 sm:space-y-12">
            {/* Définition */}
            <section>
              <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte déposé sur votre navigateur
                lors de la visite d&apos;un site web. Il permet au site de mémoriser
                des informations sur votre visite (préférences de langue, session
                de connexion, etc.) pour faciliter votre prochaine visite et rendre
                le site plus utile.
              </p>
            </section>

            {/* Types de cookies */}
            <section>
              <h2>2. Cookies que nous utilisons</h2>

              <h3>2.1 Cookies essentiels</h3>
              <p>
                Ces cookies sont indispensables au fonctionnement de la Plateforme.
                Ils ne peuvent pas être désactivés.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse mt-4 mb-4">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 pr-4 font-semibold text-neutral-800">Cookie</th>
                      <th className="text-left py-3 pr-4 font-semibold text-neutral-800">Finalité</th>
                      <th className="text-left py-3 font-semibold text-neutral-800">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr className="border-b border-neutral-100">
                      <td className="py-3 pr-4 font-mono text-xs">pixly_session</td>
                      <td className="py-3 pr-4">Authentification et maintien de session</td>
                      <td className="py-3">Session</td>
                    </tr>
                    <tr className="border-b border-neutral-100">
                      <td className="py-3 pr-4 font-mono text-xs">pixly_csrf</td>
                      <td className="py-3 pr-4">Protection contre les attaques CSRF</td>
                      <td className="py-3">Session</td>
                    </tr>
                    <tr className="border-b border-neutral-100">
                      <td className="py-3 pr-4 font-mono text-xs">pixly_preferences</td>
                      <td className="py-3 pr-4">Mémorisation des préférences utilisateur (sidebar, thème)</td>
                      <td className="py-3">1 an</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>2.2 Cookies analytiques</h3>
              <p>
                Ces cookies nous permettent de mesurer l&apos;audience et les
                performances de la Plateforme afin de l&apos;améliorer.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse mt-4 mb-4">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 pr-4 font-semibold text-neutral-800">Cookie</th>
                      <th className="text-left py-3 pr-4 font-semibold text-neutral-800">Finalité</th>
                      <th className="text-left py-3 font-semibold text-neutral-800">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr className="border-b border-neutral-100">
                      <td className="py-3 pr-4 font-mono text-xs">_ga / _gid</td>
                      <td className="py-3 pr-4">Google Analytics — mesure d&apos;audience</td>
                      <td className="py-3">2 ans / 24h</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>2.3 Cookies fonctionnels</h3>
              <p>
                Ces cookies permettent d&apos;améliorer l&apos;expérience utilisateur en
                mémorisant certains choix.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse mt-4 mb-4">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 pr-4 font-semibold text-neutral-800">Cookie</th>
                      <th className="text-left py-3 pr-4 font-semibold text-neutral-800">Finalité</th>
                      <th className="text-left py-3 font-semibold text-neutral-800">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600">
                    <tr className="border-b border-neutral-100">
                      <td className="py-3 pr-4 font-mono text-xs">pixly_sidebar_state</td>
                      <td className="py-3 pr-4">État de la sidebar (ouverte/fermée)</td>
                      <td className="py-3">1 an</td>
                    </tr>
                    <tr className="border-b border-neutral-100">
                      <td className="py-3 pr-4 font-mono text-xs">pixly_onboarding</td>
                      <td className="py-3 pr-4">Progression de l&apos;onboarding</td>
                      <td className="py-3">30 jours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Cookies tiers */}
            <section>
              <h2>3. Cookies tiers</h2>
              <p>
                Certains services tiers utilisés par Pixly peuvent déposer leurs
                propres cookies :
              </p>
              <ul>
                <li>
                  <strong>Firebase (Google) :</strong> cookies d&apos;authentification
                  et de session
                </li>
                <li>
                  <strong>Stripe :</strong> cookies nécessaires au traitement
                  sécurisé des paiements
                </li>
              </ul>
              <p>
                Ces cookies sont soumis aux politiques de confidentialité de
                leurs fournisseurs respectifs.
              </p>
            </section>

            {/* Gestion */}
            <section>
              <h2>4. Comment gérer vos cookies</h2>
              <p>
                Vous pouvez configurer votre navigateur pour accepter ou refuser
                les cookies. Voici les liens vers les instructions des principaux
                navigateurs :
              </p>
              <ul>
                <li>
                  <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies
                </li>
                <li>
                  <strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies
                </li>
                <li>
                  <strong>Safari :</strong> Préférences → Confidentialité → Cookies
                </li>
                <li>
                  <strong>Edge :</strong> Paramètres → Cookies et autorisations de site
                </li>
              </ul>
            </section>

            {/* Impact */}
            <section>
              <h2>5. Impact de la désactivation des cookies</h2>
              <p>
                La désactivation des cookies essentiels peut empêcher
                l&apos;utilisation de certaines fonctionnalités de la Plateforme,
                notamment :
              </p>
              <ul>
                <li>L&apos;authentification et le maintien de votre session</li>
                <li>La mémorisation de vos préférences d&apos;interface</li>
                <li>Le fonctionnement correct du système de paiement</li>
              </ul>
            </section>

            {/* Modifications */}
            <section>
              <h2>6. Modifications</h2>
              <p>
                Nous pouvons mettre à jour cette politique de cookies pour
                refléter les évolutions de notre utilisation des cookies ou de la
                réglementation applicable.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2>7. Contact</h2>
              <p>
                Pour toute question relative aux cookies, contactez-nous à{' '}
                <strong>privacy@pixly.app</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
