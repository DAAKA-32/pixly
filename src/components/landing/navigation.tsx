'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, ChevronDown, Target, Filter, Zap, Code, TrendingUp, FileText, Route, Users } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { FeatureMockup } from '@/components/landing/feature-mockups';

// ===========================================
// PIXLY - Landing Page Navigation
// Client component for scroll & mobile menu
// ===========================================

const NAV_LINKS = [
  { label: 'Démo', href: '/#demo' },
  { label: 'Fonctionnalités', href: '/#fonctionnalités' },
  { label: 'Témoignages', href: '/#témoignages' },
  { label: 'Tarifs', href: '/#tarifs' },
  { label: 'Simulateur ROI', href: '/#simulateur', accent: true },
];

// Core features — 4 pillars shown on landing page
const FEATURES_CORE = [
  { id: 'attribution', label: 'Attribution multi-touch', desc: 'Identifiez l\'origine exacte de chaque vente', accent: '#059669', light: '#ecfdf5' },
  { id: 'funnel', label: 'Funnel de conversion', desc: 'Trouvez où vous perdez vos clients', accent: '#2563eb', light: '#eff6ff' },
  { id: 'integrations', label: 'Intégrations one-click', desc: 'Meta, Google, TikTok, Stripe en 2 min', accent: '#7c3aed', light: '#f5f3ff' },
  { id: 'tracking', label: 'Tracking server-side', desc: 'Récupérez +38% de conversions perdues', accent: '#e11d48', light: '#fff1f2' },
];

// Advanced features — individual sections on /features page
const FEATURES_ADVANCED = [
  { id: 'pixel-avance', label: 'Pixel intelligent', desc: 'Auto-détection des événements', accent: '#0891b2', light: '#ecfeff' },
  { id: 'attribution-multicanal', label: 'Attribution multi-modèle', desc: 'Comparez last-click, linéaire, position', accent: '#4f46e5', light: '#eef2ff' },
  { id: 'optimisation-budget', label: 'Optimisation budget', desc: 'Recommandations basées sur le ROAS', accent: '#b45309', light: '#fffbeb' },
  { id: 'reporting', label: 'Reporting automatisé', desc: 'Rapports PDF & email programmés', accent: '#059669', light: '#ecfdf5' },
  { id: 'customer-journey', label: 'Parcours client', desc: 'Du premier clic à l\'achat', accent: '#dc2626', light: '#fef2f2' },
  { id: 'audience', label: 'Segmentation d\'audience', desc: 'Scoring & export vers vos plateformes', accent: '#7c3aed', light: '#f5f3ff' },
];

const ALL_FEATURES = [...FEATURES_CORE, ...FEATURES_ADVANCED];

function FeatureIcon({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case 'attribution': return <Target className={className} />;
    case 'funnel': return <Filter className={className} />;
    case 'integrations': return <Zap className={className} />;
    case 'tracking': return <Code className={className} />;
    case 'pixel-avance': return <Code className={className} />;
    case 'attribution-multicanal': return <Target className={className} />;
    case 'optimisation-budget': return <TrendingUp className={className} />;
    case 'reporting': return <FileText className={className} />;
    case 'customer-journey': return <Route className={className} />;
    case 'audience': return <Users className={className} />;
    default: return null;
  }
}

const CTA_TEXT = 'Commencer';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState('attribution');
  const [activeSection, setActiveSection] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Scroll Spy — track visible section via IntersectionObserver
  useEffect(() => {
    if (window.location.pathname !== '/') return;

    const sectionIds = ['demo', 'fonctionnalités', 'témoignages', 'tarifs', 'simulateur'];
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
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
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setFeaturesOpen(false);
        setMobileFeaturesOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setMobileFeaturesOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (!featuresOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [featuresOpen]);

  // Close desktop dropdown on scroll
  useEffect(() => {
    if (!featuresOpen) return;
    const onScroll = () => setFeaturesOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [featuresOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileFeaturesOpen(false);
  };

  // Smart navigation: same-page smooth scroll, cross-page via Link
  const handleFeatureClick = useCallback((e: React.MouseEvent, href: string) => {
    setFeaturesOpen(false);
    setMobileOpen(false);
    setMobileFeaturesOpen(false);
    const hashIdx = href.indexOf('#');
    const pathname = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
    const hash = hashIdx >= 0 ? href.slice(hashIdx + 1) : '';
    const targetPath = pathname || '/';
    if (window.location.pathname === targetPath && hash) {
      e.preventDefault();
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) {
          const offset = 100;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }
  }, []);

  // Compute preview background color from hovered feature
  const hoveredLight = ALL_FEATURES.find(f => f.id === hoveredFeature)?.light || '#ecfdf5';

  return (
    <nav className="fixed top-0 z-50 w-full pointer-events-none" aria-label="Navigation principale">
      {/* ========== Mobile Full-Screen Overlay ========== */}
      <div
        className={`
          lg:hidden fixed inset-0
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
        <div className="relative h-full flex flex-col justify-between pt-24 pb-10 overflow-y-auto">
          {/* Navigation links */}
          <div className="px-6 flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => {
              // Fonctionnalités → expandable accordion
              if (link.label === 'Fonctionnalités') {
                return (
                  <div key={link.label}>
                    <button
                      className="group flex items-center justify-between w-full px-5 py-4 rounded-2xl text-[17px] font-medium transition-colors duration-200 text-neutral-800 hover:text-primary-700 hover:bg-primary-50/60 active:bg-primary-100/60"
                      onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
                      tabIndex={mobileOpen ? 0 : -1}
                      aria-expanded={mobileFeaturesOpen}
                      aria-controls="mobile-features-menu"
                      style={{
                        opacity: mobileOpen ? 1 : 0,
                        transform: mobileOpen ? 'translateX(0)' : 'translateX(-16px)',
                        transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${mobileOpen ? (i + 1) * 60 : 0}ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${mobileOpen ? (i + 1) * 60 : 0}ms, background-color 0.2s, color 0.2s`,
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <ChevronDown
                          className="h-4 w-4 text-neutral-400 group-hover:text-primary-400 transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                          style={{ transform: mobileFeaturesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                        {link.label}
                      </span>
                    </button>

                    {/* Mobile sub-items */}
                    <div
                      id="mobile-features-menu"
                      role="menu"
                      className="overflow-hidden"
                      style={{
                        maxHeight: mobileFeaturesOpen ? '600px' : '0',
                        opacity: mobileFeaturesOpen ? 1 : 0,
                        transition: 'max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <div className="pt-1 pb-2">
                        {/* Section label — Principales */}
                        <p className="pl-8 pr-5 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                          Principales
                        </p>

                        {/* Core features with descriptions */}
                        {FEATURES_CORE.map((item) => (
                          <Link
                            key={item.id}
                            href={`/#fonctionnalités`}
                            role="menuitem"
                            tabIndex={mobileOpen && mobileFeaturesOpen ? 0 : -1}
                            className="flex items-start gap-3 pl-8 pr-5 py-2.5 hover:bg-primary-50/40 rounded-xl transition-colors duration-200"
                            onClick={(e) => handleFeatureClick(e, '/#fonctionnalités')}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: item.light, color: item.accent }}
                              aria-hidden="true"
                            >
                              <FeatureIcon id={item.id} className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[15px] font-medium text-neutral-800">{item.label}</p>
                              <p className="text-[13px] text-neutral-400 mt-0.5">{item.desc}</p>
                            </div>
                          </Link>
                        ))}

                        {/* Section label — Avancé */}
                        <p className="pl-8 pr-5 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                          Avancé
                        </p>

                        {/* Advanced features */}
                        {FEATURES_ADVANCED.map((item) => (
                          <Link
                            key={item.id}
                            href={`/features#${item.id}`}
                            role="menuitem"
                            tabIndex={mobileOpen && mobileFeaturesOpen ? 0 : -1}
                            className="flex items-center gap-3 pl-8 pr-5 py-2.5 text-[15px] text-neutral-600 hover:text-primary-700 hover:bg-primary-50/40 rounded-xl transition-colors duration-200"
                            onClick={(e) => handleFeatureClick(e, `/features#${item.id}`)}
                          >
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: item.light, color: item.accent }}
                              aria-hidden="true"
                            >
                              <FeatureIcon id={item.id} className="h-3.5 w-3.5" />
                            </div>
                            {item.label}
                          </Link>
                        ))}

                        {/* Bottom link */}
                        <div className="mx-8 my-1.5 h-px bg-neutral-100" />
                        <Link
                          href="/features"
                          className="flex items-center gap-3 pl-8 pr-5 py-3 text-[15px] font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50/40 rounded-xl transition-colors duration-200"
                          onClick={closeMobile}
                          tabIndex={mobileOpen && mobileFeaturesOpen ? 0 : -1}
                        >
                          Toutes les fonctionnalités
                          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              // Regular links
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`group flex items-center justify-between px-5 py-4 rounded-2xl text-[17px] font-medium transition-colors duration-200 ${
                    link.accent
                      ? 'text-primary-600 hover:text-primary-700 hover:bg-primary-50/60 active:bg-primary-100/60'
                      : 'text-neutral-800 hover:text-primary-700 hover:bg-primary-50/60 active:bg-primary-100/60'
                  }`}
                  onClick={closeMobile}
                  tabIndex={mobileOpen ? 0 : -1}
                  style={{
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(-16px)',
                    transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${mobileOpen ? (i + 1) * 60 : 0}ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${mobileOpen ? (i + 1) * 60 : 0}ms, background-color 0.2s, color 0.2s`,
                  }}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`h-4 w-4 transition-colors duration-200 ${
                    link.accent ? 'text-primary-400 group-hover:text-primary-500' : 'text-neutral-300 group-hover:text-primary-400'
                  }`} />
                </Link>
              );
            })}
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
              href="/login?mode=signup"
              className="px-6 py-4 text-center font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={closeMobile}
              tabIndex={mobileOpen ? 0 : -1}
            >
              {CTA_TEXT}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========== Top Navigation Bar ========== */}
      <div
        className="relative z-10 mx-auto"
        style={{
          maxWidth: scrolled ? '1140px' : '100%',
          padding: scrolled ? '8px 16px 0' : '0',
          transition: 'max-width 500ms cubic-bezier(0.16, 1, 0.3, 1), padding 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="pointer-events-auto">
          <div
            className={`
              relative flex h-[3.75rem] sm:h-[4.25rem] items-center justify-between px-4 sm:px-6 lg:px-8 bg-white
              transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${scrolled
                ? 'rounded-2xl border border-neutral-200/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.8)_inset]'
                : 'rounded-none border border-transparent shadow-none'
              }
            `}
          >
            {/* Logo */}
            <div className="flex-shrink-0 z-10">
              <Logo href="/" size="sm" />
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 max-w-[calc(100%-340px)]">
              <div className={`
                flex items-center gap-0 px-1 py-1.5 rounded-xl whitespace-nowrap
                transition-all duration-300
                ${scrolled ? 'bg-neutral-100/50' : 'bg-white/50 backdrop-blur-sm'}
              `}>
                {NAV_LINKS.map((link) => {
                  // Fonctionnalités → dropdown trigger
                  if (link.label === 'Fonctionnalités') {
                    const isFeatActive = activeSection === 'fonctionnalités';
                    return (
                      <div key={link.label} className="relative" ref={dropdownRef}>
                        <button
                          className={`group relative flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-1 ${
                            isFeatActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                          onClick={() => setFeaturesOpen(!featuresOpen)}
                          aria-expanded={featuresOpen}
                          aria-controls="features-dropdown"
                          aria-haspopup="true"
                        >
                          <ChevronDown
                            className="h-3.5 w-3.5 transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{ transform: featuresOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          />
                          <span>{link.label}</span>
                          <span className={`absolute inset-x-3 bottom-0.5 h-px origin-left rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-primary-400/70 ${
                            isFeatActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                          }`} />
                        </button>

                        {/* ========== MEGA DROPDOWN ========== */}
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[680px]"
                          style={{ pointerEvents: featuresOpen ? 'auto' : 'none' }}
                        >
                          <div
                            id="features-dropdown"
                            role="menu"
                            aria-label="Fonctionnalités"
                            className="bg-white rounded-xl border border-neutral-200/80 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] overflow-hidden flex"
                            style={{
                              opacity: featuresOpen ? 1 : 0,
                              transform: featuresOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
                              transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                          >
                            {/* LEFT — Feature list */}
                            <div className="flex-1 p-2">
                              {/* Section: Principales */}
                              <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                Principales
                              </p>

                              {FEATURES_CORE.map((item) => (
                                <Link
                                  key={item.id}
                                  href="/#fonctionnalités"
                                  role="menuitem"
                                  tabIndex={featuresOpen ? 0 : -1}
                                  className="group/item flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors duration-150"
                                  onClick={(e) => handleFeatureClick(e, '/#fonctionnalités')}
                                  onMouseEnter={() => setHoveredFeature(item.id)}
                                  onFocus={() => setHoveredFeature(item.id)}
                                >
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: item.light, color: item.accent }}
                                    aria-hidden="true"
                                  >
                                    <FeatureIcon id={item.id} className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-neutral-800 group-hover/item:text-neutral-900 transition-colors duration-150 leading-tight">
                                      {item.label}
                                    </p>
                                    <p className="text-[11px] text-neutral-400 group-hover/item:text-neutral-500 transition-colors duration-150 mt-0.5 leading-snug">
                                      {item.desc}
                                    </p>
                                  </div>
                                </Link>
                              ))}

                              {/* Divider */}
                              <div className="mx-3 my-1.5 h-px bg-neutral-100" />

                              {/* Section: Avancé */}
                              <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                Avancé
                              </p>

                              {FEATURES_ADVANCED.map((item) => (
                                <Link
                                  key={item.id}
                                  href={`/features#${item.id}`}
                                  role="menuitem"
                                  tabIndex={featuresOpen ? 0 : -1}
                                  className="group/item flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors duration-150"
                                  onClick={(e) => handleFeatureClick(e, `/features#${item.id}`)}
                                  onMouseEnter={() => setHoveredFeature(item.id)}
                                  onFocus={() => setHoveredFeature(item.id)}
                                >
                                  <div
                                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: item.light, color: item.accent }}
                                    aria-hidden="true"
                                  >
                                    <FeatureIcon id={item.id} className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-neutral-600 group-hover/item:text-neutral-900 transition-colors duration-150 leading-tight">
                                      {item.label}
                                    </p>
                                    <p className="text-[11px] text-neutral-400 group-hover/item:text-neutral-500 transition-colors duration-150 mt-0.5 leading-snug">
                                      {item.desc}
                                    </p>
                                  </div>
                                </Link>
                              ))}

                              {/* Bottom link */}
                              <div className="mx-3 mt-1.5 mb-1 h-px bg-neutral-100" />
                              <Link
                                href="/features"
                                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-50/60 transition-colors duration-150 group/all"
                                onClick={() => setFeaturesOpen(false)}
                                tabIndex={featuresOpen ? 0 : -1}
                              >
                                <span className="text-[13px] font-medium text-primary-600 group-hover/all:text-primary-700 transition-colors duration-150">
                                  Toutes les fonctionnalités
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 text-primary-400 group-hover/all:text-primary-600 group-hover/all:translate-x-0.5 transition-all duration-200" />
                              </Link>
                            </div>

                            {/* RIGHT — Live mockup preview */}
                            <div
                              className="w-[250px] flex-shrink-0 p-3 flex flex-col items-center justify-center rounded-r-xl border-l border-neutral-100"
                              style={{
                                backgroundColor: hoveredLight,
                                transition: 'background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              }}
                            >
                              <div
                                className="w-full"
                                style={{
                                  transform: 'scale(0.55)',
                                  transformOrigin: 'center center',
                                }}
                              >
                                <FeatureMockup id={hoveredFeature} />
                              </div>
                              <p className="text-[10px] font-medium text-neutral-400 mt-2 text-center">
                                {ALL_FEATURES.find(f => f.id === hoveredFeature)?.label}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Regular links
                  const sectionId = link.href.replace('/#', '');
                  const isActive = activeSection === sectionId;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      aria-current={isActive ? 'true' : undefined}
                      className={`group relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-1 ${
                        link.accent
                          ? isActive ? 'text-primary-700' : 'text-primary-600 hover:text-primary-700'
                          : isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      {link.label}
                      <span className={`absolute inset-x-3 bottom-0.5 h-px origin-left rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      } ${link.accent ? 'bg-primary-500' : 'bg-primary-400/70'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop CTA - Right */}
            <div className="hidden lg:flex items-center gap-2 z-10 flex-shrink-0">
              <Link
                href="/login"
                className={`
                  px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-1
                  ${scrolled
                    ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }
                `}
              >
                Connexion
              </Link>
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white whitespace-nowrap bg-primary-600 hover:bg-primary-700 hover:-translate-y-px rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2"
              >
                {CTA_TEXT}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Menu Button - Animated Hamburger */}
            <button
              className={`
                lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl z-10
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
