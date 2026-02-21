'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  Download,
  Receipt,
  Loader2,
  Shield,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/help-button';
import { cn, formatCurrency } from '@/lib/utils';
import { getPlanById, getAnnualSavings } from '@/lib/stripe/config';

// ===========================================
// PIXLY - Facturation
// Trust-focused billing: clear, calm, actionable
// Structure: Header → Trial → Abonnement → Paiement → Historique → Annulation → Sécurité
// ===========================================

interface SubscriptionData {
  id: string;
  status: string;
  plan: string;
  planName: string;
  billingInterval: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialEnd: string | null;
  isTrialing: boolean;
  daysUntilTrialEnd: number | null;
}

interface PaymentMethod {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

interface SubscriptionResponse {
  subscription: SubscriptionData | null;
  plan: string;
  status: string;
  paymentMethod: PaymentMethod | null;
}

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'failed' | 'pending';
  pdfUrl: string | null;
}

// --- Status configuration ---

const STATUS_CONFIG = {
  active: { label: 'Actif', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  trialing: { label: 'Essai', dot: 'bg-primary-500', bg: 'bg-primary-50', text: 'text-primary-700' },
  canceling: { label: 'Annulation programmée', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  past_due: { label: 'Paiement échoué', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' },
  free: { label: 'Gratuit', dot: 'bg-neutral-400', bg: 'bg-neutral-100', text: 'text-neutral-600' },
} as const;

type SubStatus = keyof typeof STATUS_CONFIG;

const INVOICE_STATUS = {
  paid: { label: 'Payée', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  failed: { label: 'Échouée', dot: 'bg-red-500', text: 'text-red-600' },
  pending: { label: 'En attente', dot: 'bg-amber-500', text: 'text-amber-700' },
} as const;

// French plan highlights (top 3 per tier)
const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  starter: ['Meta + Google Ads', 'Attribution last-click', '25k\u202F\u20AC/mois de d\u00E9penses'],
  growth: ['Toutes les plateformes', 'Attribution multi-touch', 'Sync API Conversions'],
  scale: ['D\u00E9penses illimit\u00E9es', 'Analytics avanc\u00E9s + API', 'Account manager d\u00E9di\u00E9'],
};

// Card brand visual treatment
const CARD_BRANDS: Record<string, { label: string; bg: string; text: string }> = {
  visa: { label: 'Visa', bg: 'bg-blue-50', text: 'text-blue-700' },
  mastercard: { label: 'MC', bg: 'bg-orange-50', text: 'text-orange-700' },
  amex: { label: 'Amex', bg: 'bg-sky-50', text: 'text-sky-700' },
  discover: { label: 'Disc.', bg: 'bg-amber-50', text: 'text-amber-700' },
};

const CARD_BRAND_DEFAULT = { label: 'Carte', bg: 'bg-neutral-50', text: 'text-neutral-600' };

// --- Helpers ---

function resolveStatus(sub: SubscriptionData | null): SubStatus {
  if (!sub) return 'free';
  if (sub.isTrialing) return 'trialing';
  if (sub.cancelAtPeriodEnd) return 'canceling';
  if (sub.status === 'past_due') return 'past_due';
  return 'active';
}

function formatDateFR(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function cardExpiryStatus(expMonth: number, expYear: number): 'ok' | 'soon' | 'expired' {
  const now = new Date();
  const endOfExpiryMonth = new Date(expYear, expMonth, 0);
  if (now > endOfExpiryMonth) return 'expired';
  const diffMs = endOfExpiryMonth.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 90) return 'soon';
  return 'ok';
}

async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const response = await fetch('/api/stripe/invoices');
    if (!response.ok) return [];
    const data = await response.json();
    return data.invoices || [];
  } catch {
    return [];
  }
}

const INVOICES_LIMIT = 5;

// ===========================================

export default function BillingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [subResponse, invoiceData] = await Promise.all([
        fetch('/api/stripe/subscription'),
        fetchInvoices(),
      ]);

      if (!subResponse.ok) throw new Error('Erreur lors du chargement');

      const data: SubscriptionResponse = await subResponse.json();
      setSubscription(data.subscription);
      setPaymentMethod(data.paymentMethod);
      setCurrentPlan(data.plan || 'free');
      setInvoices(invoiceData);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setCurrentPlan(user?.plan || 'free');
    } finally {
      setIsLoading(false);
    }
  }, [user?.plan]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenPortal = async () => {
    try {
      setIsPortalLoading(true);
      setError(null);
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d'ouvrir le portail de facturation");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Portal error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsPortalLoading(false);
    }
  };

  const status = resolveStatus(subscription);
  const statusStyle = STATUS_CONFIG[status];

  const planDetails = currentPlan !== 'free' ? getPlanById(currentPlan) : null;
  const isAnnual = subscription?.billingInterval === 'annual';
  const displayPrice = planDetails
    ? isAnnual ? planDetails.price.annual : planDetails.price.monthly
    : 0;
  const annualSavings = planDetails ? getAnnualSavings(planDetails) : 0;

  const highlights = PLAN_HIGHLIGHTS[currentPlan] || [];

  const visibleInvoices = showAllInvoices
    ? invoices
    : invoices.slice(0, INVOICES_LIMIT);
  const hasMoreInvoices = invoices.length > INVOICES_LIMIT;

  const cardBrandStyle = paymentMethod
    ? CARD_BRANDS[paymentMethod.brand.toLowerCase()] || CARD_BRAND_DEFAULT
    : null;
  const cardStatus = paymentMethod
    ? cardExpiryStatus(paymentMethod.expMonth, paymentMethod.expYear)
    : 'ok';

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif tracking-tight text-neutral-900">
              Facturation
            </h1>
            {!isLoading && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium',
                  statusStyle.bg,
                  statusStyle.text,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} />
                {statusStyle.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-neutral-400">
            Gérez votre abonnement et vos moyens de paiement
          </p>
        </div>

        <HelpButton pageId="billing" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3.5 sm:px-5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      {/* Past-due warning */}
      {status === 'past_due' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3.5 sm:px-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <div>
            <p className="text-[13px] font-medium text-red-800">
              Paiement échoué
            </p>
            <p className="mt-0.5 text-[12px] text-red-600">
              Votre dernier paiement n&apos;a pas abouti. Mettez à jour votre moyen de paiement pour maintenir votre accès.
            </p>
            <button
              onClick={handleOpenPortal}
              className="mt-2 text-[12px] font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
            >
              Mettre à jour le paiement
            </button>
          </div>
        </div>
      )}

      {/* Trial Banner */}
      {!isLoading && subscription?.isTrialing && subscription.daysUntilTrialEnd !== null && (
        <div className="rounded-xl border border-primary-200/60 bg-primary-50/50 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary-500 flex-shrink-0" />
              <span className="text-[13px] font-medium text-primary-700">
                Période d&apos;essai — {subscription.daysUntilTrialEnd} jour{subscription.daysUntilTrialEnd > 1 ? 's' : ''} restant{subscription.daysUntilTrialEnd > 1 ? 's' : ''}
              </span>
            </div>
            {subscription.trialEnd && (
              <span className="text-[12px] text-primary-500/80">
                Fin le {formatDateFR(subscription.trialEnd)}
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-primary-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${Math.max(5, ((14 - subscription.daysUntilTrialEnd) / 14) * 100)}%` }}
            />
          </div>
          {!paymentMethod && (
            <p className="mt-2.5 text-[12px] text-primary-600">
              Ajoutez un moyen de paiement avant la fin de l&apos;essai pour continuer sans interruption.
            </p>
          )}
        </div>
      )}

      {/* ========================= */}
      {/* 1. Abonnement actuel      */}
      {/* ========================= */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Abonnement
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-7 w-32 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-48 animate-pulse rounded bg-neutral-50" />
              <div className="h-3.5 w-64 animate-pulse rounded bg-neutral-50" />
              <div className="h-3.5 w-56 animate-pulse rounded bg-neutral-50" />
            </div>
          ) : subscription ? (
            <>
              {/* Plan + Price */}
              <div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                  <p className="font-serif text-[28px] leading-none tracking-tight text-neutral-900">
                    {subscription.planName}
                  </p>
                  {displayPrice > 0 && (
                    <span className="text-[13px] text-neutral-400">
                      {formatCurrency(displayPrice)}/mois
                      {isAnnual && <> · facturé annuellement</>}
                    </span>
                  )}
                </div>

                {isAnnual && annualSavings > 0 && (
                  <p className="mt-2 text-[12px] font-medium text-emerald-600">
                    Vous économisez {formatCurrency(annualSavings)}/an
                  </p>
                )}
              </div>

              {/* Plan highlights */}
              {highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {highlights.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-50 px-2.5 py-1 text-[12px] text-neutral-500"
                    >
                      <Check className="h-3 w-3 text-primary-500 flex-shrink-0" />
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              {/* Canceling banner */}
              {subscription.cancelAtPeriodEnd && (
                <div className="mt-4 rounded-lg bg-amber-50/70 px-4 py-3">
                  <p className="text-[13px] text-amber-700">
                    Votre abonnement prendra fin le{' '}
                    <span className="font-medium">{formatDateFR(subscription.currentPeriodEnd)}</span>
                  </p>
                  <button
                    onClick={handleOpenPortal}
                    className="mt-1.5 text-[12px] font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
                  >
                    Réactiver l&apos;abonnement
                  </button>
                </div>
              )}

              {/* Details */}
              <div className="mt-5 space-y-2">
                <DetailRow
                  label="Prochaine facturation"
                  value={formatDateFR(subscription.currentPeriodEnd)}
                  valueClass="font-medium text-neutral-700"
                />
                <DetailRow
                  label="Période en cours"
                  value={`${formatDateFR(subscription.currentPeriodStart)} — ${formatDateFR(subscription.currentPeriodEnd)}`}
                />
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenPortal}
                  disabled={isPortalLoading}
                  className="gap-1.5 text-[12px]"
                >
                  {isPortalLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5" />
                  )}
                  Gérer l&apos;abonnement
                </Button>
                <button
                  onClick={handleOpenPortal}
                  className="text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  Changer de plan
                </button>
              </div>
            </>
          ) : (
            /* Free plan — prominent upgrade CTA */
            <div className="py-2">
              <p className="font-serif text-[28px] leading-none tracking-tight text-neutral-900">
                Plan gratuit
              </p>
              <p className="mt-2 text-[13px] text-neutral-400 leading-relaxed max-w-md">
                Passez à un plan payant pour débloquer l&apos;attribution multi-touch, le tracking server-side et toutes les intégrations.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Attribution multi-touch', 'Tracking server-side', 'Toutes les plateformes'].map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-50 px-2.5 py-1 text-[12px] text-neutral-400"
                  >
                    <Check className="h-3 w-3 text-neutral-300 flex-shrink-0" />
                    {feature}
                  </span>
                ))}
              </div>
              <Button
                size="sm"
                className="mt-5 gap-1.5 text-[12px]"
                onClick={() => (window.location.href = '/checkout')}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Choisir un plan
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* 2. Moyen de paiement      */}
      {/* ========================= */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Moyen de paiement
            </h2>
          </div>
          {paymentMethod && !isLoading && (
            <button
              onClick={handleOpenPortal}
              className="text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-600"
            >
              Modifier
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-10 w-16 animate-pulse rounded-lg bg-neutral-100" />
              <div>
                <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-100" />
                <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-neutral-50" />
              </div>
            </div>
          ) : paymentMethod && cardBrandStyle ? (
            <div>
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-10 w-16 items-center justify-center rounded-lg border border-neutral-200/80',
                    cardBrandStyle.bg,
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] font-bold uppercase tracking-wider',
                      cardBrandStyle.text,
                    )}
                  >
                    {cardBrandStyle.label}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-neutral-900">
                    •••• •••• •••• {paymentMethod.last4}
                  </p>
                  <p
                    className={cn(
                      'text-[12px]',
                      cardStatus === 'expired'
                        ? 'font-medium text-red-500'
                        : 'text-neutral-400',
                    )}
                  >
                    {cardStatus === 'expired' ? 'Expirée' : 'Expire le'}{' '}
                    {String(paymentMethod.expMonth).padStart(2, '0')}/{paymentMethod.expYear}
                  </p>
                </div>
              </div>

              {cardStatus === 'expired' && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50/70 px-3.5 py-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                  <p className="text-[12px] text-red-600">
                    Votre carte a expiré.{' '}
                    <button
                      onClick={handleOpenPortal}
                      className="font-medium underline underline-offset-2 hover:text-red-700"
                    >
                      Mettre à jour
                    </button>
                  </p>
                </div>
              )}
              {cardStatus === 'soon' && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50/70 px-3.5 py-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                  <p className="text-[12px] text-amber-600">
                    Votre carte expire bientôt.{' '}
                    <button
                      onClick={handleOpenPortal}
                      className="font-medium underline underline-offset-2 hover:text-amber-700"
                    >
                      Mettre à jour
                    </button>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2">
              <p className="text-[13px] text-neutral-500">
                {subscription
                  ? "Aucune carte enregistrée. Ajoutez un moyen de paiement pour continuer après l'essai."
                  : 'Aucun moyen de paiement configuré.'}
              </p>
              {subscription && (
                <button
                  onClick={handleOpenPortal}
                  className="mt-2.5 text-[13px] font-medium text-primary-600 transition-colors hover:text-primary-700"
                >
                  Ajouter une carte
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* 3. Historique               */}
      {/* ========================= */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center gap-2 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-100">
          <Receipt className="h-4 w-4 text-neutral-400" />
          <h2 className="text-[15px] font-semibold text-neutral-900">
            Historique de facturation
          </h2>
          {!isLoading && invoices.length > 0 && (
            <span className="text-[12px] text-neutral-400 ml-1">
              {invoices.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-50" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-10 text-center">
            <Receipt className="mx-auto h-5 w-5 text-neutral-300" />
            <p className="mt-2 text-[13px] text-neutral-400">
              Aucune facture pour le moment
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-neutral-100 text-left">
                    <th className="px-5 py-3 font-medium text-neutral-400">Date</th>
                    <th className="px-5 py-3 font-medium text-neutral-400">Description</th>
                    <th className="px-5 py-3 font-medium text-neutral-400 text-right">Montant</th>
                    <th className="px-5 py-3 font-medium text-neutral-400">Statut</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {visibleInvoices.map((invoice) => {
                    const invStatus = INVOICE_STATUS[invoice.status];
                    return (
                      <tr
                        key={invoice.id}
                        className="hover:bg-neutral-50/60 transition-colors"
                      >
                        <td className="px-5 py-3 text-neutral-600 tabular-nums whitespace-nowrap">
                          {formatDateFR(invoice.date)}
                        </td>
                        <td className="px-5 py-3 font-medium text-neutral-900">
                          {invoice.description}
                        </td>
                        <td className="px-5 py-3 text-right font-medium tabular-nums text-neutral-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[12px]">
                            <span className={cn('h-1.5 w-1.5 rounded-full', invStatus.dot)} />
                            <span className={invStatus.text}>{invStatus.label}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {invoice.pdfUrl ? (
                            <a
                              href={invoice.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[12px] text-neutral-400 transition-colors hover:text-neutral-600"
                            >
                              <Download className="h-3 w-3" />
                              PDF
                            </a>
                          ) : (
                            <span className="text-[12px] text-neutral-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-neutral-100">
              {visibleInvoices.map((invoice) => {
                const invStatus = INVOICE_STATUS[invoice.status];
                return (
                  <div key={invoice.id} className="px-4 py-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-medium text-neutral-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-[12px]">
                        <span className={cn('h-1.5 w-1.5 rounded-full', invStatus.dot)} />
                        <span className={invStatus.text}>{invStatus.label}</span>
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-neutral-500">
                      {invoice.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[12px] tabular-nums text-neutral-400">
                        {formatDateFR(invoice.date)}
                      </span>
                      {invoice.pdfUrl ? (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-neutral-400 transition-colors hover:text-neutral-600"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-[12px] text-neutral-300">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show more / less */}
            {hasMoreInvoices && (
              <div className="border-t border-neutral-100 px-4 py-3 sm:px-5">
                <button
                  onClick={() => setShowAllInvoices(!showAllInvoices)}
                  className="flex items-center gap-1 text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  {showAllInvoices ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Voir moins
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Voir les {invoices.length - INVOICES_LIMIT} factures précédentes
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================= */}
      {/* 4. Annulation (discrète)   */}
      {/* ========================= */}
      {subscription && !subscription.cancelAtPeriodEnd && (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3.5 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div>
            <p className="text-[13px] font-medium text-neutral-700">
              Annuler l&apos;abonnement
            </p>
            <p className="text-[12px] text-neutral-400">
              Votre accès sera maintenu jusqu&apos;au {subscription ? formatDateFR(subscription.currentPeriodEnd) : 'la fin de la période en cours'}.
            </p>
          </div>
          <button
            onClick={handleOpenPortal}
            className="self-start text-[12px] font-medium text-neutral-400 transition-colors hover:text-red-500 sm:self-auto"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 py-1">
        <Shield className="h-3.5 w-3.5 text-neutral-300" />
        <p className="text-[11px] text-neutral-400">
          Paiements sécurisés via Stripe. Pixly ne stocke aucune donnée bancaire.
        </p>
      </div>
    </div>
  );
}

// ===========================================
// Detail Row — compact label/value pair
// ===========================================

function DetailRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 text-[13px] sm:flex-row sm:items-center sm:gap-2">
      <span className="text-neutral-400 sm:w-[160px] sm:flex-shrink-0">{label}</span>
      <span className={valueClass || 'text-neutral-600'}>{value}</span>
    </div>
  );
}
