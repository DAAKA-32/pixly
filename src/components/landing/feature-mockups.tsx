// ===========================================
// PIXLY - Feature Mockups (Pure JSX — SSR-safe)
// Shared between landing page and sticky features
// ===========================================

export function BrandLogo({ brand, className }: { brand: string; className?: string }) {
  switch (brand) {
    case 'meta':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
        </svg>
      );
    case 'google':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.42a8.16 8.16 0 0 0 4.76 1.52V7.49a4.84 4.84 0 0 1-1-.8z" fill="#010101"/>
        </svg>
      );
    case 'stripe':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.94 3.495 1.608 3.495 2.622 0 .952-.861 1.538-2.353 1.538-1.941 0-4.735-.767-6.756-2.088l-.891 5.543C5.56 23.082 8.4 24 11.488 24c2.647 0 4.856-.589 6.376-1.749 1.632-1.244 2.373-3.085 2.373-5.358 0-4.1-2.471-5.801-6.261-7.219z" fill="#635BFF"/>
        </svg>
      );
    case 'shopify':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M15.34 3.04c-.07-.04-.13-.03-.19.01a.46.46 0 0 0-.14.14c-.19.29-.42.48-.71.58-.08-.4-.23-.71-.44-.94-.53-.56-1.3-.6-1.64-.53-.02 0-.03.01-.05.02a1.2 1.2 0 0 0-.53-.29c-.56-.15-1.28.04-2.01.53a5.15 5.15 0 0 0-1.83 2.64c-.78.24-1.32.41-1.35.42-.42.13-.43.14-.49.54-.04.3-1.13 8.72-1.13 8.72L12.19 24l6.55-1.43S15.41 3.12 15.34 3.04zM11.76 5l-.01.01c-.01.02-.23.07-.53.15.09-.37.27-.75.55-1 .11-.1.26-.2.43-.27.17.42.17.84.01 1.26-.16-.06-.31-.11-.45-.15zm-.95-.94c.17 0 .32.06.44.15-.21.1-.41.26-.59.47-.36.4-.64.98-.75 1.56l-1.06.33c.28-1.18 1.08-2.49 1.96-2.51zm-.54 6.33a1.86 1.86 0 0 0-.73 1.5c0 1.07.94 1.49.95 1.5-.01.02-.15.46-.43.9a3.18 3.18 0 0 1-.86.96c-.31.24-.63.26-.73.27-.27.01-.53-.11-.81-.23-.3-.14-.61-.28-.99-.26-.35.02-.65.17-.93.31-.31.16-.61.31-.97.28-.42-.04-.8-.33-1.14-.86a7.3 7.3 0 0 1-1.08-3.79c0-1.57.53-2.56 1.17-3.07a1.98 1.98 0 0 1 1.22-.46c.31-.01.6.12.87.24.27.12.52.24.75.24.2 0 .44-.11.72-.24.36-.17.79-.37 1.28-.33.37.03.92.15 1.48.57z" fill="#95BF47"/>
        </svg>
      );
    case 'hubspot':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M17.83 8.67V6.04c.63-.35 1.06-1.01 1.06-1.77v-.06c0-1.12-.91-2.04-2.04-2.04h-.06c-1.12 0-2.04.91-2.04 2.04v.06c0 .72.38 1.35.96 1.71v2.73a5.76 5.76 0 0 0-2.63 1.29l-6.93-5.39a2.42 2.42 0 0 0 .09-.65A2.42 2.42 0 1 0 3.82 6.38c.44 0 .84-.12 1.19-.32l6.82 5.31a5.82 5.82 0 0 0-.82 2.98 5.8 5.8 0 0 0 5.8 5.79 5.8 5.8 0 0 0 5.8-5.79c0-1.59-.65-3.04-1.7-4.08a5.76 5.76 0 0 0 .92-3.1v-.5zm-1.3 9.51a3.12 3.12 0 1 1 0-6.25 3.12 3.12 0 0 1 0 6.25z" fill="#FF7A59"/>
        </svg>
      );
    default:
      return null;
  }
}

// ===========================================
// MOCKUP COMPONENTS
// ===========================================

export function MockupAttribution() {
  const channels = [
    { name: 'Meta Ads', brand: 'meta', color: '#1877F2', revenue: '42 180 \u20ac', roas: '4,2x', pct: 44, dashOffset: 0, dashLength: 44 },
    { name: 'Google Ads', brand: 'google', color: '#EA4335', revenue: '31 640 \u20ac', roas: '3,5x', pct: 33, dashOffset: 44, dashLength: 33 },
    { name: 'TikTok Ads', brand: 'tiktok', color: '#171717', revenue: '22 073 \u20ac', roas: '2,8x', pct: 23, dashOffset: 77, dashLength: 23 },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Attribution multi-touch avec r\u00e9partition des revenus par canal publicitaire">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Attribution multi-touch</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">Mod\u00e8le : Position-Based</p>
          </div>
          <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
            Jan 2025
          </span>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <div className="flex-1 space-y-2 sm:space-y-2.5">
            {channels.map((ch) => (
              <div key={ch.name}>
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${ch.color}12` }}>
                      <BrandLogo brand={ch.brand} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </div>
                    <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-700">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-mockup-sm sm:text-mockup-base font-bold text-neutral-900">{ch.revenue}</span>
                    <span className="text-mockup-xs sm:text-mockup-sm font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${ch.color}12`, color: ch.color }}>
                      {ch.roas}
                    </span>
                  </div>
                </div>
                <div className="h-3 sm:h-4 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${ch.pct}%`, backgroundColor: ch.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-20 h-20 sm:w-24 sm:h-24">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#f5f5f5" strokeWidth="8" />
              {channels.map((ch) => (
                <circle
                  key={ch.name}
                  cx="40" cy="40" r="30"
                  fill="none"
                  stroke={ch.color}
                  strokeWidth="8"
                  strokeDasharray={`${ch.dashLength * 1.885} ${188.5 - ch.dashLength * 1.885}`}
                  strokeDashoffset={`${-ch.dashOffset * 1.885}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              ))}
              <text x="40" y="38" textAnchor="middle" className="text-mockup-md sm:text-mockup-lg font-bold fill-neutral-900">95,8k\u20ac</text>
              <text x="40" y="48" textAnchor="middle" className="text-mockup-xs sm:text-mockup-sm fill-neutral-400">Total</text>
            </svg>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 flex items-center gap-1.5 flex-wrap">
          {['Last Click', 'First Click', 'Lin\u00e9aire', 'Time Decay', 'Position'].map((model, i) => (
            <span
              key={model}
              className={`text-mockup-xs sm:text-mockup-sm font-medium px-1.5 sm:px-2 py-0.5 rounded-full border ${
                i === 4
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-neutral-50 text-neutral-500 border-neutral-200/80'
              }`}
            >
              {model}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockupFunnel() {
  const steps = [
    { label: 'Visites', value: '24 830', pct: 100, color: '#2563eb' },
    { label: 'Ajout panier', value: '2 980', pct: 48, color: '#4f46e5', drop: '88%' },
    { label: 'Checkout', value: '1 342', pct: 22, color: '#6d28d9', drop: '55%' },
    { label: 'Achats', value: '621', pct: 10, color: '#059669', drop: '54%' },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Analyse de funnel avec taux de conversion et drop-off par \u00e9tape">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Funnel de conversion</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">30 derniers jours \u2014 Tous canaux</p>
          </div>
          <div className="text-right">
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">Taux global</p>
            <p className="text-mockup-lg sm:text-sm font-bold text-emerald-600">2,5%</p>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {steps.map((step) => (
            <div key={step.label}>
              {step.drop && (
                <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5 ml-2">
                  <svg className="h-3 w-3 text-red-400" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-mockup-xs sm:text-mockup-sm font-medium text-red-400">-{step.drop} perdus</span>
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-500 w-16 sm:w-20 text-right shrink-0">{step.label}</span>
                <div className="flex-1 h-7 sm:h-9 bg-neutral-50 rounded-lg overflow-hidden relative border border-neutral-100">
                  <div
                    className="h-full rounded-lg flex items-center justify-end pr-2 sm:pr-3 transition-all"
                    style={{ width: `${step.pct}%`, backgroundColor: `${step.color}18` }}
                  >
                    <span className="text-mockup-base sm:text-mockup-md font-bold" style={{ color: step.color }}>{step.value}</span>
                  </div>
                </div>
                <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-400 w-8 shrink-0">{step.pct}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
          {[
            { name: 'Meta', brand: 'meta', conv: '287', rate: '3,1%', color: '#1877F2' },
            { name: 'Google', brand: 'google', conv: '214', rate: '2,3%', color: '#EA4335' },
            { name: 'TikTok', brand: 'tiktok', conv: '120', rate: '1,8%', color: '#171717' },
          ].map((ch) => (
            <div key={ch.name} className="rounded-lg border border-neutral-200/80 bg-neutral-50/50 p-1.5 sm:p-2">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <BrandLogo brand={ch.brand} className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <p className="text-mockup-xs sm:text-mockup-sm font-medium" style={{ color: ch.color }}>{ch.name}</p>
              </div>
              <p className="text-mockup-md sm:text-mockup-lg font-bold text-neutral-900 text-center">{ch.conv}</p>
              <p className="text-mockup-xs sm:text-mockup-sm text-neutral-400 text-center">CVR {ch.rate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockupIntegrations() {
  const integrations = [
    { name: 'Meta Ads', brand: 'meta', status: 'connected', color: '#1877F2' },
    { name: 'Google Ads', brand: 'google', status: 'connected', color: '#EA4335' },
    { name: 'TikTok Ads', brand: 'tiktok', status: 'connected', color: '#171717' },
    { name: 'Stripe', brand: 'stripe', status: 'connected', color: '#635BFF' },
    { name: 'Shopify', brand: 'shopify', status: 'pending', color: '#96BF48' },
    { name: 'HubSpot', brand: 'hubspot', status: 'pending', color: '#FF7A59' },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Six int\u00e9grations disponibles : Meta, Google, TikTok, Stripe, Shopify, HubSpot">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Int\u00e9grations</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">4 connect\u00e9es sur 6</p>
          </div>
          <span className="inline-flex items-center gap-1 text-mockup-sm sm:text-mockup-base font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sync active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {integrations.map((intg) => {
            const isConnected = intg.status === 'connected';
            return (
              <div
                key={intg.name}
                className={`rounded-xl border p-2 sm:p-3 flex items-center gap-2 sm:gap-2.5 ${
                  isConnected
                    ? 'bg-emerald-50/30 border-emerald-200/80'
                    : 'bg-neutral-50/50 border-neutral-200/80'
                }`}
              >
                <div
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${intg.color}12` }}
                >
                  <BrandLogo brand={intg.brand} className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-mockup-sm sm:text-mockup-base font-semibold text-neutral-800 truncate">{intg.name}</p>
                  <p className={`text-mockup-xs sm:text-mockup-sm ${isConnected ? 'text-emerald-600' : 'text-neutral-400'}`}>
                    {isConnected ? 'Connect\u00e9' : 'Disponible'}
                  </p>
                </div>
                {isConnected && (
                  <svg className="h-3.5 w-3.5 text-emerald-500 ml-auto shrink-0" viewBox="0 0 14 14" fill="none">
                    <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 sm:mt-4 flex items-center justify-between rounded-lg border border-neutral-200/80 bg-neutral-50 px-2.5 sm:px-3 py-1.5 sm:py-2">
          <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-600">Derni\u00e8re sync</span>
          <span className="text-mockup-sm sm:text-mockup-base text-neutral-500">il y a 3 min</span>
        </div>
      </div>
    </div>
  );
}

export function MockupTracking() {
  const syncs = [
    { name: 'Meta CAPI', brand: 'meta', status: 'Actif', events: '12 847', color: '#1877F2' },
    { name: 'Google Enhanced', brand: 'google', status: 'Actif', events: '9 234', color: '#EA4335' },
    { name: 'TikTok Events', brand: 'tiktok', status: 'Actif', events: '4 621', color: '#171717' },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Tracking server-side avec pixel first-party et synchronisation Meta CAPI, Google Enhanced et TikTok Events">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Tracking server-side</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">Pixel first-party actif</p>
          </div>
          <span className="inline-flex items-center gap-1 text-mockup-sm sm:text-mockup-base font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 sm:py-1 rounded-full">
            +38% r\u00e9cup\u00e9r\u00e9
          </span>
        </div>

        <div className="rounded-xl bg-neutral-950 p-2.5 sm:p-3 mb-3 sm:mb-4 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-mockup-xs sm:text-mockup-sm text-neutral-400 font-mono">pixly-pixel.js</span>
          </div>
          <pre className="text-mockup-xs sm:text-mockup-sm font-mono leading-relaxed">
            <span className="text-violet-400">{'<script'}</span><span className="text-emerald-400">{' src'}</span><span className="text-neutral-400">{'="'}</span><span className="text-amber-300">{'pixly.app/p.js'}</span><span className="text-neutral-400">{'"'}</span><span className="text-violet-400">{'>'}</span>{'\n'}
            <span className="text-neutral-500">{'  // '}</span><span className="text-neutral-500">{'Capture fbclid, gclid, ttclid + UTM'}</span>{'\n'}
            <span className="text-neutral-500">{'  // '}</span><span className="text-neutral-500">{'Contourne ad-blockers & iOS 14+'}</span>
          </pre>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {syncs.map((sync) => (
            <div key={sync.name} className="flex items-center justify-between rounded-lg border border-neutral-200/80 px-2.5 sm:px-3 py-1.5 sm:py-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${sync.color}12` }}
                >
                  <BrandLogo brand={sync.brand} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
                <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-700">{sync.name}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-500">{sync.events} events</span>
                <span className="inline-flex items-center gap-1 text-mockup-xs sm:text-mockup-sm font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {sync.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// ADVANCED FEATURE MOCKUPS
// ===========================================

export function MockupPixelIntelligent() {
  const events = [
    { name: 'page_view', count: '8 234', auto: true },
    { name: 'form_submit', count: '421', auto: true },
    { name: 'button_click', count: '1 847', auto: true },
    { name: 'purchase', count: '198', auto: true },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Pixel intelligent avec détection automatique des événements">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Pixel intelligent</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">Auto-détection activée</p>
          </div>
          <span className="inline-flex items-center gap-1 text-mockup-sm sm:text-mockup-base font-medium text-cyan-600 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            Debug
          </span>
        </div>

        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          {events.map((event) => (
            <div key={event.name} className="flex items-center justify-between rounded-lg border border-neutral-200/80 px-2.5 sm:px-3 py-1.5 sm:py-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-3.5 w-3.5 text-cyan-500 shrink-0" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-mockup-sm sm:text-mockup-base font-mono text-neutral-700">{event.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-500">{event.count}</span>
                <span className="text-mockup-xs sm:text-mockup-sm text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded">auto</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-neutral-50 border border-neutral-200/80 p-2.5 sm:p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-600">Dédoublonnage</span>
            <span className="text-mockup-sm sm:text-mockup-base font-bold text-neutral-900">342 filtrés</span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '14%' }} />
          </div>
          <p className="text-mockup-xs text-neutral-400 mt-1">14% de doublons détectés et éliminés</p>
        </div>
      </div>
    </div>
  );
}

export function MockupAttributionMultiModel() {
  const models = ['Last-click', 'Linéaire', 'Position'];
  const channels = [
    { name: 'Meta Ads', brand: 'meta', color: '#1877F2', values: [45, 32, 38] },
    { name: 'Google Ads', brand: 'google', color: '#EA4335', values: [35, 30, 28] },
    { name: 'TikTok Ads', brand: 'tiktok', color: '#171717', values: [10, 25, 22] },
    { name: 'Direct', brand: '', color: '#6b7280', values: [10, 13, 12] },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Comparaison des modèles d'attribution multi-touch">
      <div className="p-3 sm:p-5">
        <div className="mb-3 sm:mb-4">
          <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Comparaison des modèles</p>
          <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">Contribution par canal (%)</p>
        </div>

        <div className="grid grid-cols-[1fr_repeat(3,48px)] sm:grid-cols-[1fr_repeat(3,60px)] gap-1 mb-2">
          <div />
          {models.map((m, i) => (
            <span key={m} className={`text-mockup-xs sm:text-mockup-sm font-medium text-center truncate ${i === 2 ? 'text-indigo-600' : 'text-neutral-400'}`}>{m}</span>
          ))}
        </div>

        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          {channels.map((ch) => (
            <div key={ch.name} className="grid grid-cols-[1fr_repeat(3,48px)] sm:grid-cols-[1fr_repeat(3,60px)] gap-1 items-center rounded-lg border border-neutral-200/80 px-2 sm:px-3 py-1.5 sm:py-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {ch.brand ? (
                  <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${ch.color}12` }}>
                    <BrandLogo brand={ch.brand} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                ) : (
                  <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-md bg-neutral-100 shrink-0" />
                )}
                <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-700 truncate">{ch.name}</span>
              </div>
              {ch.values.map((v, i) => (
                <span key={i} className={`text-mockup-sm sm:text-mockup-base font-bold text-center ${i === 2 ? 'text-indigo-600' : 'text-neutral-600'}`}>{v}%</span>
              ))}
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-indigo-50 border border-indigo-200/60 px-2.5 sm:px-3 py-2">
          <p className="text-mockup-xs sm:text-mockup-sm text-indigo-700">
            <span className="font-bold">Insight :</span> TikTok sous-évalué de 15 pts en last-click vs. position-based.
          </p>
        </div>
      </div>
    </div>
  );
}

export function MockupBudgetOptimisation() {
  const channels = [
    { name: 'Meta Ads', brand: 'meta', color: '#1877F2', current: '5 200', recommended: '4 500', change: -13 },
    { name: 'Google Ads', brand: 'google', color: '#EA4335', current: '3 100', recommended: '3 200', change: 3 },
    { name: 'TikTok Ads', brand: 'tiktok', color: '#171717', current: '1 700', recommended: '2 300', change: 35 },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Recommandation d'optimisation du budget publicitaire">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Optimisation budget</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">Budget total : 10 000&euro;/mois</p>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          {channels.map((ch) => (
            <div key={ch.name} className="flex items-center justify-between rounded-lg border border-neutral-200/80 px-2.5 sm:px-3 py-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${ch.color}12` }}>
                  <BrandLogo brand={ch.brand} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
                <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-700">{ch.name}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-mockup-sm sm:text-mockup-base text-neutral-400">{ch.current}&euro;</span>
                <span className="text-mockup-sm text-neutral-300">&rarr;</span>
                <span className="text-mockup-sm sm:text-mockup-base font-bold text-neutral-900">{ch.recommended}&euro;</span>
                <span className={`text-mockup-xs font-bold px-1 py-0.5 rounded ${ch.change > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                  {ch.change > 0 ? '+' : ''}{ch.change}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200/60 p-2.5 sm:p-3">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-mockup-sm sm:text-mockup-base font-medium text-amber-800">ROAS estimé</span>
            <div className="flex items-center gap-1.5">
              <span className="text-mockup-sm sm:text-mockup-base text-neutral-400">3.8x</span>
              <span className="text-mockup-sm text-amber-600">&rarr;</span>
              <span className="text-mockup-base sm:text-mockup-lg font-bold text-amber-700">4.6x</span>
              <span className="text-mockup-xs sm:text-mockup-sm font-bold text-emerald-600 bg-emerald-50 px-1 rounded">+21%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockupReporting() {
  const topCampaigns = [
    { name: 'Meta — Retargeting', roas: '6.2x', pct: 85, color: '#1877F2' },
    { name: 'Google — Search Brand', roas: '5.8x', pct: 80, color: '#EA4335' },
    { name: 'TikTok — Prospection', roas: '3.1x', pct: 43, color: '#171717' },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Rapport automatisé avec métriques clés et top campagnes">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Rapport hebdomadaire</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">10 — 16 fév. 2026</p>
          </div>
          <span className="text-mockup-xs sm:text-mockup-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Auto</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {[
            { label: 'Dépenses', value: '9 500\u20ac' },
            { label: 'Revenus', value: '38 200\u20ac' },
            { label: 'ROAS', value: '4.02x' },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg bg-neutral-50 border border-neutral-200/80 p-1.5 sm:p-2 text-center">
              <p className="text-mockup-xs sm:text-mockup-sm text-neutral-400">{kpi.label}</p>
              <p className="text-mockup-md sm:text-mockup-lg font-bold text-neutral-900">{kpi.value}</p>
            </div>
          ))}
        </div>

        <p className="text-mockup-xs sm:text-mockup-sm font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 sm:mb-2">Top campagnes</p>
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          {topCampaigns.map((c, i) => (
            <div key={c.name} className="flex items-center gap-2">
              <span className="text-mockup-xs sm:text-mockup-sm font-bold text-neutral-300 w-3">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-700 truncate">{c.name}</span>
                  <span className="text-mockup-sm sm:text-mockup-base font-bold shrink-0 ml-2" style={{ color: c.color }}>{c.roas}</span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-neutral-200/80 bg-neutral-50 px-2.5 sm:px-3 py-1.5 sm:py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-mockup-xs sm:text-mockup-sm font-medium text-emerald-600 bg-white border border-emerald-200 px-1.5 py-0.5 rounded">PDF</span>
            <span className="text-mockup-xs sm:text-mockup-sm font-medium text-neutral-500 bg-white border border-neutral-200 px-1.5 py-0.5 rounded">Email</span>
          </div>
          <span className="text-mockup-xs sm:text-mockup-sm text-neutral-400">Prochain : lun. 09h</span>
        </div>
      </div>
    </div>
  );
}

export function MockupCustomerJourney() {
  const touchpoints = [
    { label: 'Meta Ad', day: 'J+0', brand: 'meta', color: '#1877F2' },
    { label: 'Site', day: 'J+0', color: '#0F9D58' },
    { label: 'Google', day: 'J+3', brand: 'google', color: '#EA4335' },
    { label: 'Site', day: 'J+5', color: '#0F9D58' },
    { label: 'Achat', day: 'J+7', color: '#059669' },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Parcours client complet du premier contact à l'achat">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Parcours type #1</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">38% des conversions</p>
          </div>
          <span className="text-mockup-sm sm:text-mockup-base font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">7 jours</span>
        </div>

        <div className="relative flex items-center justify-between py-3 sm:py-5 mb-3 sm:mb-4 px-2">
          <div className="absolute top-1/2 left-6 right-6 h-px bg-neutral-200" aria-hidden="true" />
          {touchpoints.map((tp, i) => (
            <div key={i} className="relative flex flex-col items-center gap-1 z-10">
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white border-2"
                style={{ borderColor: tp.color }}
              >
                {i === touchpoints.length - 1 ? (
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: tp.color }} viewBox="0 0 14 14" fill="none">
                    <path d="M11.5 4L5.5 10L2.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : tp.brand ? (
                  <BrandLogo brand={tp.brand} className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tp.color }} />
                )}
              </div>
              <span className="text-mockup-xs sm:text-mockup-sm font-medium text-neutral-700 whitespace-nowrap">{tp.label}</span>
              <span className="text-mockup-xs text-neutral-400">{tp.day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[
            { label: 'Touchpoints', value: '4.2 moy.' },
            { label: 'Temps moyen', value: '7 jours' },
            { label: 'Drop-off', value: 'Étape 3 (−23%)' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-neutral-50 border border-neutral-200/80 p-1.5 sm:p-2.5">
              <p className="text-mockup-xs sm:text-mockup-sm text-neutral-400">{stat.label}</p>
              <p className="text-mockup-sm sm:text-mockup-base font-bold text-neutral-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockupAudienceSegmentation() {
  const segments = [
    { name: 'Acheteurs récurrents', count: '1.2k', score: 92, status: 'Export Meta \u2713', color: '#7c3aed' },
    { name: 'Paniers abandonnés', count: '3.8k', score: 78, status: 'Intention haute', color: '#dc2626' },
    { name: 'Visiteurs engagés', count: '5.1k', score: 54, status: 'Lookalike prêt', color: '#2563eb' },
    { name: 'Nouveaux visiteurs', count: '12.4k', score: 12, status: 'Prospection', color: '#6b7280' },
  ];

  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 shadow-soft bg-white" role="img" aria-label="Segmentation d'audience avec scoring et export">
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-mockup-base sm:text-mockup-lg font-semibold text-neutral-900">Segments actifs</p>
            <p className="text-mockup-sm sm:text-mockup-base text-neutral-400">4 segments &middot; 22.5k contacts</p>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {segments.map((seg) => (
            <div key={seg.name} className="rounded-lg border border-neutral-200/80 p-2 sm:p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-mockup-sm sm:text-mockup-base font-semibold text-neutral-800 truncate">{seg.name}</span>
                </div>
                <span className="text-mockup-sm sm:text-mockup-base font-bold text-neutral-900 shrink-0 ml-2">{seg.count}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 sm:w-16 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${seg.score}%`, backgroundColor: seg.color }} />
                  </div>
                  <span className="text-mockup-xs sm:text-mockup-sm text-neutral-400">Score {seg.score}</span>
                </div>
                <span className="text-mockup-xs sm:text-mockup-sm font-medium shrink-0" style={{ color: seg.color }}>{seg.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// ROUTER
// ===========================================

export function FeatureMockup({ id }: { id: string }) {
  switch (id) {
    case 'attribution': return <MockupAttribution />;
    case 'funnel': return <MockupFunnel />;
    case 'integrations': return <MockupIntegrations />;
    case 'tracking': return <MockupTracking />;
    case 'pixel-avance': return <MockupPixelIntelligent />;
    case 'attribution-multicanal': return <MockupAttributionMultiModel />;
    case 'optimisation-budget': return <MockupBudgetOptimisation />;
    case 'reporting': return <MockupReporting />;
    case 'customer-journey': return <MockupCustomerJourney />;
    case 'audience': return <MockupAudienceSegmentation />;
    default: return null;
  }
}
