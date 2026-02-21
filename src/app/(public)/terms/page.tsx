import { Metadata } from 'next';

// ===========================================
// PIXLY - Conditions générales d'utilisation
// ===========================================

export const metadata: Metadata = {
  title: 'Conditions générales d\'utilisation',
  description:
    'Conditions générales d\'utilisation de Pixly. Abonnements, essai gratuit, obligations et droits des utilisateurs de la plateforme d\'attribution marketing.',
  alternates: {
    canonical: 'https://pixly.app/terms',
  },
  openGraph: {
    title: 'Conditions générales d\'utilisation | Pixly',
    description:
      'CGU de la plateforme Pixly : abonnements, essai gratuit 14 jours, propriété intellectuelle et conditions d\'utilisation.',
    url: 'https://pixly.app/terms',
  },
};

const PLACEHOLDER = 'bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-sm font-mono';

export default function TermsPage() {
  return (
    <article className="pt-12 sm:pt-16 pb-20 sm:pb-28">
      <div className="container-main">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-12 sm:mb-16">
            <span className="label">Conditions d&apos;utilisation</span>
            <h1 className="heading-lg mt-3">
              Conditions générales d&apos;utilisation
            </h1>
            <p className="text-body mt-4">
              Dernière mise à jour : février 2026
            </p>
          </header>

          {/* Content */}
          <div className="prose-legal space-y-10 sm:space-y-12">
            {/* Objet */}
            <section>
              <h2>1. Objet</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (ci-après
                « CGU ») définissent les modalités d&apos;accès et d&apos;utilisation
                de la plateforme Pixly, accessible à l&apos;adresse pixly.app
                (ci-après « la Plateforme »), éditée par{' '}
                <span className={PLACEHOLDER}>[Raison sociale]</span> (ci-après
                « Pixly », « nous »).
              </p>
              <p>
                L&apos;utilisation de la Plateforme implique l&apos;acceptation pleine
                et entière des présentes CGU. Si vous n&apos;acceptez pas ces
                conditions, veuillez ne pas utiliser la Plateforme.
              </p>
            </section>

            {/* Définitions */}
            <section>
              <h2>2. Définitions</h2>
              <ul>
                <li>
                  <strong>Plateforme :</strong> le service en ligne Pixly
                  accessible via pixly.app
                </li>
                <li>
                  <strong>Utilisateur :</strong> toute personne physique ou morale
                  créant un compte sur la Plateforme
                </li>
                <li>
                  <strong>Workspace :</strong> l&apos;espace de travail de
                  l&apos;Utilisateur regroupant ses données, intégrations et
                  membres d&apos;équipe
                </li>
                <li>
                  <strong>Abonnement :</strong> la formule souscrite par
                  l&apos;Utilisateur pour accéder aux fonctionnalités de la
                  Plateforme
                </li>
                <li>
                  <strong>Pixel :</strong> le script de suivi fourni par Pixly,
                  installé sur le site web de l&apos;Utilisateur pour collecter
                  les données de conversion
                </li>
                <li>
                  <strong>Intégration :</strong> la connexion entre la Plateforme
                  et un service tiers (Meta Ads, Google Ads, TikTok Ads, etc.)
                </li>
              </ul>
            </section>

            {/* Inscription */}
            <section>
              <h2>3. Inscription et compte</h2>
              <p>
                L&apos;accès à la Plateforme nécessite la création d&apos;un compte.
                L&apos;Utilisateur s&apos;engage à fournir des informations exactes et à
                les maintenir à jour.
              </p>
              <p>
                L&apos;Utilisateur est responsable de la confidentialité de ses
                identifiants de connexion. Toute utilisation de son compte est
                réputée faite par l&apos;Utilisateur lui-même.
              </p>
              <p>
                En cas d&apos;utilisation non autorisée de votre compte, veuillez nous
                contacter immédiatement à support@pixly.app.
              </p>
            </section>

            {/* Description du service */}
            <section>
              <h2>4. Description du service</h2>
              <p>
                Pixly est une plateforme d&apos;attribution marketing qui permet
                aux Utilisateurs de :
              </p>
              <ul>
                <li>Connecter leurs comptes publicitaires (Meta, Google, TikTok, LinkedIn)</li>
                <li>Installer un pixel de suivi pour collecter les données de conversion</li>
                <li>Mesurer l&apos;attribution des conversions à chaque canal publicitaire</li>
                <li>Visualiser les performances marketing via un tableau de bord analytique</li>
                <li>Synchroniser les conversions avec les plateformes publicitaires (CAPI)</li>
                <li>Gérer des équipes et des espaces de travail collaboratifs</li>
              </ul>
              <p>
                Les fonctionnalités disponibles varient selon la formule
                d&apos;abonnement souscrite.
              </p>
            </section>

            {/* Abonnements */}
            <section>
              <h2>5. Abonnements et tarification</h2>

              <h3>5.1 Essai gratuit</h3>
              <p>
                Chaque nouvel Utilisateur bénéficie d&apos;un essai gratuit de 14
                jours. Aucun moyen de paiement n&apos;est requis pour l&apos;essai.
              </p>

              <h3>5.2 Formules d&apos;abonnement</h3>
              <p>
                À l&apos;issue de l&apos;essai gratuit, l&apos;Utilisateur peut souscrire
                un abonnement mensuel parmi les formules proposées sur la page
                Tarifs de la Plateforme.
              </p>

              <h3>5.3 Paiement</h3>
              <p>
                Les paiements sont traités par Stripe. L&apos;Utilisateur autorise
                le prélèvement automatique mensuel du montant de son abonnement.
                Les prix sont indiqués en euros, hors taxes.
              </p>

              <h3>5.4 Changement de formule</h3>
              <p>
                L&apos;Utilisateur peut changer de formule à tout moment depuis son
                espace Facturation. Le changement prend effet immédiatement, avec
                un ajustement au prorata.
              </p>
            </section>

            {/* Obligations */}
            <section>
              <h2>6. Obligations de l&apos;Utilisateur</h2>
              <p>L&apos;Utilisateur s&apos;engage à :</p>
              <ul>
                <li>Utiliser la Plateforme conformément à sa destination et aux présentes CGU</li>
                <li>Ne pas tenter de contourner les mesures de sécurité</li>
                <li>Ne pas utiliser la Plateforme à des fins illicites ou frauduleuses</li>
                <li>Respecter les conditions d&apos;utilisation des plateformes publicitaires connectées</li>
                <li>Disposer des autorisations nécessaires pour installer le pixel de suivi sur son site</li>
                <li>Informer les visiteurs de son site de la collecte de données via le pixel Pixly</li>
                <li>Ne pas revendre, sous-licencier ou mettre à disposition le service à des tiers</li>
              </ul>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2>7. Propriété intellectuelle</h2>
              <p>
                La Plateforme, son code source, son design, ses algorithmes, sa
                documentation et l&apos;ensemble des contenus associés sont la
                propriété exclusive de Pixly.
              </p>
              <p>
                L&apos;Utilisateur conserve la propriété de ses données.
                L&apos;abonnement confère un droit d&apos;utilisation personnel, non
                exclusif et non transférable de la Plateforme pendant la durée de
                l&apos;abonnement.
              </p>
            </section>

            {/* Données */}
            <section>
              <h2>8. Données personnelles et confidentialité</h2>
              <p>
                Le traitement des données personnelles est régi par notre{' '}
                <a href="/privacy">Politique de confidentialité</a>, qui fait
                partie intégrante des présentes CGU.
              </p>
              <p>
                Pixly agit en tant que sous-traitant au sens du RGPD pour les
                données de conversion collectées via le pixel installé sur le
                site de l&apos;Utilisateur. L&apos;Utilisateur reste responsable de
                traitement pour ces données et s&apos;engage à informer ses propres
                utilisateurs conformément à la réglementation applicable.
              </p>
            </section>

            {/* Disponibilité */}
            <section>
              <h2>9. Disponibilité et maintenance</h2>
              <p>
                Pixly s&apos;efforce de maintenir la Plateforme accessible 24h/24,
                7j/7. Nous nous réservons le droit d&apos;interrompre temporairement
                l&apos;accès pour des opérations de maintenance, de mise à jour ou
                d&apos;amélioration.
              </p>
              <p>
                En cas de maintenance programmée, nous nous efforçons d&apos;en
                informer les Utilisateurs avec un préavis raisonnable.
              </p>
            </section>

            {/* Responsabilité */}
            <section>
              <h2>10. Limitation de responsabilité</h2>
              <p>
                La Plateforme est fournie « en l&apos;état ». Pixly ne garantit pas
                que le service sera exempt d&apos;erreurs ou d&apos;interruptions.
              </p>
              <p>
                La responsabilité de Pixly est limitée aux dommages directs et
                prévisibles. En aucun cas Pixly ne pourra être tenu responsable :
              </p>
              <ul>
                <li>Des dommages indirects (perte de chiffre d&apos;affaires, perte de données, manque à gagner)</li>
                <li>Des décisions prises par l&apos;Utilisateur sur la base des données de la Plateforme</li>
                <li>Des modifications, interruptions ou arrêts des API des plateformes publicitaires tierces</li>
                <li>D&apos;une utilisation non conforme aux présentes CGU</li>
              </ul>
              <p>
                La responsabilité totale de Pixly est plafonnée au montant des
                sommes versées par l&apos;Utilisateur au cours des 12 derniers mois.
              </p>
            </section>

            {/* Résiliation */}
            <section>
              <h2>11. Résiliation</h2>

              <h3>11.1 Par l&apos;Utilisateur</h3>
              <p>
                L&apos;Utilisateur peut résilier son abonnement à tout moment depuis
                son espace Facturation. La résiliation prend effet à la fin de la
                période de facturation en cours.
              </p>

              <h3>11.2 Par Pixly</h3>
              <p>
                Pixly se réserve le droit de suspendre ou résilier un compte en
                cas de violation des présentes CGU, de non-paiement, ou
                d&apos;utilisation abusive de la Plateforme, après notification
                préalable sauf urgence.
              </p>

              <h3>11.3 Effets de la résiliation</h3>
              <p>
                À la résiliation, l&apos;accès à la Plateforme est désactivé.
                L&apos;Utilisateur peut demander l&apos;export de ses données dans un
                délai de 30 jours suivant la résiliation.
              </p>
            </section>

            {/* Droit applicable */}
            <section>
              <h2>12. Droit applicable et litiges</h2>
              <p>
                Les présentes CGU sont régies par le droit français.
              </p>
              <p>
                En cas de litige, les parties s&apos;engagent à rechercher une
                solution amiable. À défaut d&apos;accord, les tribunaux compétents
                de{' '}
                <span className={PLACEHOLDER}>[Ville du siège]</span> seront
                seuls compétents.
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2>13. Modifications des CGU</h2>
              <p>
                Pixly se réserve le droit de modifier les présentes CGU à tout
                moment. Les Utilisateurs seront informés de toute modification
                substantielle par email ou notification sur la Plateforme.
              </p>
              <p>
                La poursuite de l&apos;utilisation de la Plateforme après
                notification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2>14. Contact</h2>
              <p>
                Pour toute question relative aux présentes CGU, contactez-nous :
              </p>
              <ul>
                <li>
                  <strong>Email :</strong> contact@pixly.app
                </li>
                <li>
                  <strong>Support :</strong> support@pixly.app
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}
