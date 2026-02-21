import { Metadata } from 'next';

// ===========================================
// PIXLY - Mentions légales
// ===========================================

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales de Pixly : éditeur, hébergeur Vercel, propriété intellectuelle et informations réglementaires conformes au droit français.',
  alternates: {
    canonical: 'https://pixly.app/legal',
  },
  openGraph: {
    title: 'Mentions légales | Pixly',
    description:
      'Informations légales obligatoires : éditeur, hébergeur, propriété intellectuelle et données réglementaires.',
    url: 'https://pixly.app/legal',
  },
};

const PLACEHOLDER = 'bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-sm font-mono';

export default function LegalPage() {
  return (
    <article className="pt-12 sm:pt-16 pb-20 sm:pb-28">
      <div className="container-main">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-12 sm:mb-16">
            <span className="label">Informations légales</span>
            <h1 className="heading-lg mt-3">Mentions légales</h1>
            <p className="text-body mt-4">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour
              la confiance dans l&apos;économie numérique, voici les informations légales
              relatives au site pixly.app.
            </p>
          </header>

          {/* Content */}
          <div className="prose-legal space-y-10 sm:space-y-12">
            {/* Éditeur */}
            <section>
              <h2>1. Éditeur du site</h2>
              <p>Le site pixly.app est édité par :</p>
              <ul>
                <li>
                  <strong>Raison sociale :</strong>{' '}
                  <span className={PLACEHOLDER}>[À compléter]</span>
                </li>
                <li>
                  <strong>Forme juridique :</strong>{' '}
                  <span className={PLACEHOLDER}>[À compléter — ex : SAS, SARL, Auto-entrepreneur]</span>
                </li>
                <li>
                  <strong>Siège social :</strong>{' '}
                  <span className={PLACEHOLDER}>[À compléter]</span>
                </li>
                <li>
                  <strong>SIRET :</strong>{' '}
                  <span className={PLACEHOLDER}>[À compléter]</span>
                </li>
                <li>
                  <strong>RCS :</strong>{' '}
                  <span className={PLACEHOLDER}>[À compléter]</span>
                </li>
                <li>
                  <strong>Capital social :</strong>{' '}
                  <span className={PLACEHOLDER}>[À compléter]</span>
                </li>
                <li>
                  <strong>Numéro TVA intracommunautaire :</strong>{' '}
                  <span className={PLACEHOLDER}>[À compléter]</span>
                </li>
                <li>
                  <strong>Directeur de la publication :</strong> Emilien Nepveu
                </li>
                <li>
                  <strong>Email :</strong> contact@pixly.app
                </li>
              </ul>
            </section>

            {/* Hébergeur */}
            <section>
              <h2>2. Hébergeur</h2>
              <p>Le site pixly.app est hébergé par :</p>
              <ul>
                <li>
                  <strong>Raison sociale :</strong> Vercel Inc.
                </li>
                <li>
                  <strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
                </li>
                <li>
                  <strong>Site web :</strong> vercel.com
                </li>
              </ul>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2>3. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble des contenus présents sur le site pixly.app (textes, images,
                graphismes, logo, icônes, sons, logiciels, etc.) est protégé par les lois
                françaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation
                de tout ou partie des éléments du site, quel que soit le moyen ou le
                procédé utilisé, est interdite, sauf autorisation écrite préalable de
                l&apos;éditeur.
              </p>
              <p>
                La marque Pixly, le logo et l&apos;ensemble des éléments graphiques associés
                sont la propriété exclusive de l&apos;éditeur. Toute utilisation non autorisée
                constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants
                du Code de la propriété intellectuelle.
              </p>
            </section>

            {/* Données personnelles */}
            <section>
              <h2>4. Protection des données personnelles</h2>
              <p>
                Le traitement de vos données personnelles est régi par notre{' '}
                <a href="/privacy">Politique de confidentialité</a>, conformément au
                Règlement Général sur la Protection des Données (RGPD) et à la loi
                Informatique et Libertés.
              </p>
              <p>
                Pour toute question relative à vos données personnelles, vous pouvez nous
                contacter à l&apos;adresse : <strong>privacy@pixly.app</strong>
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2>5. Cookies</h2>
              <p>
                Le site pixly.app utilise des cookies. Pour en savoir plus sur leur
                utilisation et la gestion de vos préférences, consultez notre{' '}
                <a href="/cookies">Politique de cookies</a>.
              </p>
            </section>

            {/* Crédits */}
            <section>
              <h2>6. Crédits</h2>
              <ul>
                <li>
                  <strong>Conception et développement :</strong> Pixly
                </li>
                <li>
                  <strong>Typographies :</strong> Inter (Google Fonts), DM Serif Display
                  (Google Fonts) — sous licence Open Font License
                </li>
                <li>
                  <strong>Icônes :</strong> Lucide Icons — sous licence ISC
                </li>
              </ul>
            </section>

            {/* Droit applicable */}
            <section>
              <h2>7. Droit applicable</h2>
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de
                litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2>8. Contact</h2>
              <p>
                Pour toute question concernant ces mentions légales, vous pouvez nous
                contacter par email à l&apos;adresse : <strong>contact@pixly.app</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
