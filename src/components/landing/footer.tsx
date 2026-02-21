import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { AnimatedSection } from '@/components/landing/animations';

// ===========================================
// PIXLY - Footer (Shared Component)
// Used by landing page and public pages
// ===========================================

const FOOTER_DESCRIPTION =
  'Attribution marketing précise pour les équipes qui veulent investir mieux.';

const FOOTER_LINKS = {
  product: [
    { label: 'Fonctionnalités', href: '/features' },
    { label: 'Tarifs', href: '/#tarifs' },
    { label: 'Intégrations', href: '/features#integrations' },
    { label: 'Changelog', href: '#' },
  ],
  resources: [
    { label: 'À propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '#' },
    { label: 'Status', href: '#' },
  ],
  legal: [
    { label: 'Confidentialité', href: '/privacy' },
    { label: 'CGU', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Mentions légales', href: '/legal' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-8 sm:py-12 md:py-16" role="contentinfo">
      <AnimatedSection className="container-main">
        {/* Logo + description — mobile only (above link grid) */}
        <div className="mb-6 sm:hidden">
          <Logo href="/" size="sm" />
          <p className="text-small mt-2.5 max-w-xs">{FOOTER_DESCRIPTION}</p>
        </div>

        {/* Link grid — 3 cols mobile (no empty cell), 5 cols desktop */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-5 md:gap-8 mb-6 sm:mb-12">
          {/* Logo — desktop only */}
          <div className="col-span-2 hidden sm:block md:col-span-2">
            <Logo href="/" size="sm" />
            <p className="text-small mt-4 max-w-xs">{FOOTER_DESCRIPTION}</p>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-neutral-900 mb-2.5 sm:mb-4 sm:text-sm">Produit</h4>
            <ul className="space-y-1.5 sm:space-y-2.5">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-small hover:text-neutral-900 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-neutral-900 mb-2.5 sm:mb-4 sm:text-sm">Ressources</h4>
            <ul className="space-y-1.5 sm:space-y-2.5">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-small hover:text-neutral-900 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-neutral-900 mb-2.5 sm:mb-4 sm:text-sm">Légal</h4>
            <ul className="space-y-1.5 sm:space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-small hover:text-neutral-900 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider mb-5 sm:mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-small">
            © {new Date().getFullYear()} Pixly. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-small">Systèmes opérationnels</span>
          </div>
        </div>
      </AnimatedSection>
    </footer>
  );
}
