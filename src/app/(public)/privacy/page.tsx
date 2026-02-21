import { Metadata } from 'next';

// ===========================================
// PIXLY - Politique de confidentialité
// ===========================================

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Protection des données',
  description:
    'Découvrez comment Pixly collecte, utilise et protège vos données personnelles conformément au RGPD. Transparence totale sur nos pratiques.',
  alternates: {
    canonical: 'https://pixly.app/privacy',
  },
  openGraph: {
    title: 'Politique de confidentialité | Pixly',
    description:
      'Protection des données personnelles conforme au RGPD. Transparence sur la collecte, l\'utilisation et la sécurité de vos données.',
    url: 'https://pixly.app/privacy',
  },
};

const PLACEHOLDER = 'bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-sm font-mono';

export default function PrivacyPage() {
  return (
    <article className="pt-12 sm:pt-16 pb-20 sm:pb-28">
      <div className="container-main">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-12 sm:mb-16">
            <span className="label">Protection des données</span>
            <h1 className="heading-lg mt-3">Politique de confidentialité</h1>
            <p className="text-body mt-4">
              Dernière mise à jour : février 2026
            </p>
          </header>

          {/* Content */}
          <div className="prose-legal space-y-10 sm:space-y-12">
            {/* Introduction */}
            <section>
              <h2>1. Introduction</h2>
              <p>
                La présente politique de confidentialité décrit comment{' '}
                <span className={PLACEHOLDER}>[Raison sociale]</span> (ci-après
                « Pixly », « nous ») collecte, utilise et protège les données
                personnelles des utilisateurs de la plateforme pixly.app
                (ci-après « la Plateforme »).
              </p>
              <p>
                Nous nous engageons à protéger votre vie privée conformément au
                Règlement Général sur la Protection des Données (RGPD —
                Règlement UE 2016/679) et à la loi Informatique et Libertés du 6
                janvier 1978 modifiée.
              </p>
            </section>

            {/* Responsable de traitement */}
            <section>
              <h2>2. Responsable du traitement</h2>
              <p>Le responsable du traitement des données est :</p>
              <ul>
                <li>
                  <strong>Société :</strong>{' '}
                  <span className={PLACEHOLDER}>[Raison sociale]</span>
                </li>
                <li>
                  <strong>Adresse :</strong>{' '}
                  <span className={PLACEHOLDER}>[Siège social]</span>
                </li>
                <li>
                  <strong>Email :</strong> privacy@pixly.app
                </li>
                <li>
                  <strong>Directeur de la publication :</strong> Emilien Nepveu
                </li>
              </ul>
            </section>

            {/* Données collectées */}
            <section>
              <h2>3. Données collectées</h2>
              <p>
                Nous collectons les catégories de données suivantes dans le cadre
                de l&apos;utilisation de la Plateforme :
              </p>

              <h3>3.1 Données d&apos;identité</h3>
              <ul>
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Nom de l&apos;entreprise</li>
                <li>Photo de profil (si authentification via Google)</li>
              </ul>

              <h3>3.2 Données d&apos;utilisation</h3>
              <ul>
                <li>Données de navigation sur la Plateforme (pages visitées, durée des sessions)</li>
                <li>Paramètres du compte et préférences</li>
                <li>Historique des actions (connexion, déconnexion, modifications)</li>
              </ul>

              <h3>3.3 Données de suivi publicitaire</h3>
              <ul>
                <li>Données provenant des comptes publicitaires connectés (Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads)</li>
                <li>Données de conversion collectées via le pixel Pixly installé sur les sites des utilisateurs</li>
                <li>Identifiants publicitaires et paramètres UTM</li>
              </ul>

              <h3>3.4 Données de paiement</h3>
              <ul>
                <li>Informations de facturation (traitées exclusivement par Stripe)</li>
                <li>Historique des abonnements et factures</li>
              </ul>
            </section>

            {/* Bases légales */}
            <section>
              <h2>4. Bases légales du traitement</h2>
              <p>
                Nous traitons vos données personnelles sur les bases légales
                suivantes :
              </p>
              <ul>
                <li>
                  <strong>Exécution du contrat :</strong> traitement nécessaire à
                  la fourniture du service Pixly (gestion de votre compte,
                  connexion aux plateformes publicitaires, attribution des
                  conversions)
                </li>
                <li>
                  <strong>Consentement :</strong> cookies non essentiels, envoi de
                  communications marketing
                </li>
                <li>
                  <strong>Intérêt légitime :</strong> amélioration de la
                  Plateforme, prévention de la fraude, statistiques d&apos;usage
                  agrégées
                </li>
                <li>
                  <strong>Obligation légale :</strong> conservation des données
                  de facturation conformément aux obligations comptables et
                  fiscales
                </li>
              </ul>
            </section>

            {/* Finalités */}
            <section>
              <h2>5. Finalités du traitement</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul>
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Fournir le service d&apos;attribution marketing et de suivi des conversions</li>
                <li>Connecter et synchroniser vos comptes publicitaires</li>
                <li>Gérer votre abonnement et la facturation</li>
                <li>Vous envoyer des notifications relatives au service</li>
                <li>Améliorer et optimiser la Plateforme</li>
                <li>Assurer la sécurité et prévenir les abus</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            {/* Durée de conservation */}
            <section>
              <h2>6. Durée de conservation</h2>
              <ul>
                <li>
                  <strong>Données du compte :</strong> conservées pendant toute la
                  durée de votre utilisation du service, puis supprimées 30 jours
                  après la clôture du compte
                </li>
                <li>
                  <strong>Données de conversion :</strong> conservées pendant 24
                  mois à compter de leur collecte
                </li>
                <li>
                  <strong>Données de facturation :</strong> conservées 10 ans
                  conformément aux obligations comptables
                </li>
                <li>
                  <strong>Cookies :</strong> voir notre{' '}
                  <a href="/cookies">Politique de cookies</a>
                </li>
              </ul>
            </section>

            {/* Sous-traitants */}
            <section>
              <h2>7. Partage des données avec des tiers</h2>
              <p>
                Nous ne vendons jamais vos données personnelles. Nous partageons
                vos données uniquement avec les sous-traitants suivants,
                nécessaires au fonctionnement du service :
              </p>
              <ul>
                <li>
                  <strong>Firebase (Google) :</strong> authentification et base de
                  données — États-Unis
                </li>
                <li>
                  <strong>Stripe :</strong> traitement des paiements — États-Unis
                </li>
                <li>
                  <strong>Vercel :</strong> hébergement de la Plateforme —
                  États-Unis
                </li>
                <li>
                  <strong>Plateformes publicitaires (Meta, Google, TikTok,
                  LinkedIn) :</strong> synchronisation des données de campagnes et
                  conversions — selon les conditions de chaque plateforme
                </li>
              </ul>
            </section>

            {/* Transferts hors UE */}
            <section>
              <h2>8. Transferts de données hors UE</h2>
              <p>
                Certains de nos sous-traitants sont situés aux États-Unis. Ces
                transferts sont encadrés par :
              </p>
              <ul>
                <li>Le EU-US Data Privacy Framework (pour les prestataires certifiés)</li>
                <li>Des clauses contractuelles types approuvées par la Commission européenne</li>
              </ul>
              <p>
                Vous pouvez obtenir une copie des garanties applicables en nous
                contactant à l&apos;adresse privacy@pixly.app.
              </p>
            </section>

            {/* Droits */}
            <section>
              <h2>9. Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez des droits suivants sur vos
                données personnelles :
              </p>
              <ul>
                <li>
                  <strong>Droit d&apos;accès :</strong> obtenir une copie de vos
                  données personnelles
                </li>
                <li>
                  <strong>Droit de rectification :</strong> corriger des données
                  inexactes ou incomplètes
                </li>
                <li>
                  <strong>Droit à l&apos;effacement :</strong> demander la suppression
                  de vos données
                </li>
                <li>
                  <strong>Droit à la portabilité :</strong> recevoir vos données
                  dans un format structuré et lisible
                </li>
                <li>
                  <strong>Droit d&apos;opposition :</strong> vous opposer au
                  traitement de vos données
                </li>
                <li>
                  <strong>Droit à la limitation :</strong> restreindre le
                  traitement dans certains cas
                </li>
                <li>
                  <strong>Droit de retrait du consentement :</strong> retirer
                  votre consentement à tout moment pour les traitements basés sur
                  celui-ci
                </li>
              </ul>
              <p>
                Pour exercer vos droits, contactez-nous à{' '}
                <strong>privacy@pixly.app</strong>. Nous répondrons dans un délai
                maximum de 30 jours.
              </p>
              <p>
                Vous avez également le droit d&apos;introduire une réclamation
                auprès de la CNIL (Commission Nationale de l&apos;Informatique et
                des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
              </p>
            </section>

            {/* Sécurité */}
            <section>
              <h2>10. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et
                organisationnelles appropriées pour protéger vos données :
              </p>
              <ul>
                <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                <li>Authentification sécurisée via Firebase Auth</li>
                <li>Accès restreint aux données sur la base du besoin d&apos;en connaître</li>
                <li>Monitoring et journalisation des accès</li>
                <li>Mises à jour régulières de sécurité</li>
              </ul>
            </section>

            {/* Modifications */}
            <section>
              <h2>11. Modifications de cette politique</h2>
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité
                pour refléter les évolutions de nos pratiques ou de la
                réglementation. En cas de modification substantielle, nous vous
                en informerons par email ou via une notification sur la
                Plateforme.
              </p>
              <p>
                La date de dernière mise à jour est indiquée en haut de cette
                page.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2>12. Contact</h2>
              <p>
                Pour toute question relative à la protection de vos données
                personnelles, vous pouvez nous contacter :
              </p>
              <ul>
                <li>
                  <strong>Email :</strong> privacy@pixly.app
                </li>
                <li>
                  <strong>Adresse postale :</strong>{' '}
                  <span className={PLACEHOLDER}>[Adresse du siège social]</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
