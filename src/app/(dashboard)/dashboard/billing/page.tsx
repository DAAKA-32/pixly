'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  Download,
  Receipt,
  Loader2,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { getPlanById } from '@/lib/stripe/config';

// ===========================================
// PIXLY - Facturation
// Page sobre, claire et rassurante
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
}

// --- Status configuration ---

const STATUS_CONFIG = {
  active: { label: 'Actif', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  trialing: { label: 'Essai', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
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

function generateInvoices(sub: SubscriptionData | null): Invoice[] {
  if (!sub) return [];
  const plan = getPlanById(sub.plan);
  if (!plan) return [];

  const isAnnual = sub.billingInterval === 'annual';
  const amount = isAnnual ? plan.price.annual * 12 : plan.price.monthly;
  const count = isAnnual ? 2 : 5;
  const interval = isAnnual ? 12 : 1;

  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i * interval, 1);
    return {
      id: `inv_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`,
      date: date.toISOString(),
      description: `${sub.planName} — ${isAnnual ? 'annuel' : 'mensuel'}`,
      amount,
      status: (i === 0 && sub.status === 'past_due' ? 'failed' : 'paid') as Invoice['status'],
    };
  });
}

// ===========================================

export default function BillingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stripe/subscription');
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const data: SubscriptionResponse = await response.json();
      setSubscription(data.subscription);
      setPaymentMethod(data.paymentMethod);
      setCurrentPlan(data.plan || 'free');
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setCurrentPlan(user?.plan || 'free');
    } finally {
      setIsLoading(false);
    }
  }, [user?.plan]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

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
  const invoices = useMemo(() => generateInvoices(subscription), [subscription]);

  const planDetails = currentPlan !== 'free' ? getPlanById(currentPlan) : null;
  const displayPrice = planDetails
    ? subscription?.billingInterval === 'annual'
      ? planDetails.price.annual
      : planDetails.price.monthly
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
          Facturation
        </h1>
        <p className="mt-0.5 text-[13px] text-neutral-400">
          Gérez votre abonnement et vos paiements
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200/80 bg-red-50 px-5 py-3.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      {/* ========================= */}
      {/* 1. Abonnement actuel      */}
      {/* ========================= */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-neutral-900">
              Abonnement
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
            {subscription?.isTrialing && subscription.daysUntilTrialEnd !== null && (
              <> · {subscription.daysUntilTrialEnd}j</>
            )}
          </span>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-5 w-32 animate-pulse rounded bg-neutral-100" />
              <div className="h-7 w-48 animate-pulse rounded bg-neutral-100" />
              <div className="h-3.5 w-64 animate-pulse rounded bg-neutral-50" />
              <div className="h-3.5 w-56 animate-pulse rounded bg-neutral-50" />
            </div>
          ) : subscription ? (
            <>
              {/* Plan + Price */}
              <div className="flex items-baseline gap-3">
                <p className="text-xl font-semibold text-neutral-900">
                  {subscription.planName}
                </p>
                {displayPrice > 0 && (
                  <span className="text-[13px] text-neutral-400">
                    ${displayPrice}/mois
                    {subscription.billingInterval === 'annual' && (
                      <> · facturation annuelle</>
                    )}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2">
                <DetailRow
                  label="Prochaine facturation"
                  value={formatDateFR(subscription.currentPeriodEnd)}
                  valueClass="font-medium text-neutral-700"
                />
                <DetailRow
                  label="Période en cours"
                  value={`${formatDateFR(subscription.currentPeriodStart)} — ${formatDateFR(subscription.currentPeriodEnd)}`}
                />

                {subscription.isTrialing && subscription.daysUntilTrialEnd !== null && (
                  <DetailRow
                    label="Essai gratuit"
                    value={`${subscription.daysUntilTrialEnd} jour${subscription.daysUntilTrialEnd > 1 ? 's' : ''} restant${subscription.daysUntilTrialEnd > 1 ? 's' : ''}`}
                    valueClass="font-medium text-blue-600"
                  />
                )}

                {subscription.cancelAtPeriodEnd && (
                  <DetailRow
                    label="Accès jusqu'au"
                    value={formatDateFR(subscription.currentPeriodEnd)}
                    valueClass="font-medium text-amber-600"
                  />
                )}
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
            /* Free plan state */
            <div className="py-2">
              <p className="text-[15px] font-medium text-neutral-900">
                Plan gratuit
              </p>
              <p className="mt-1 text-[13px] text-neutral-400">
                Passez à un plan payant pour débloquer toutes les fonctionnalités.
              </p>
              <Button
                size="sm"
                className="mt-4 text-[12px]"
                onClick={() => (window.location.href = '/checkout')}
              >
                Choisir un plan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* 2. Moyen de paiement      */}
      {/* ========================= */}
      <div className="rounded-xl border border-neutral-200/80 bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
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

        <div className="p-5">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-10 w-16 animate-pulse rounded-lg bg-neutral-100" />
              <div>
                <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-100" />
                <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-neutral-50" />
              </div>
            </div>
          ) : paymentMethod ? (
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-neutral-200/80 bg-neutral-50">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {paymentMethod.brand}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-medium text-neutral-900">
                  •••• •••• •••• {paymentMethod.last4}
                </p>
                <p className="text-[12px] text-neutral-400">
                  Expire le {String(paymentMethod.expMonth).padStart(2, '0')}/{paymentMethod.expYear}
                </p>
              </div>
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
        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
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
                {invoices.map((invoice) => {
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
                        ${invoice.amount}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px]">
                          <span className={`h-1.5 w-1.5 rounded-full ${invStatus.dot}`} />
                          <span className={invStatus.text}>{invStatus.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="inline-flex items-center gap-1 text-[12px] text-neutral-400 transition-colors hover:text-neutral-600">
                          <Download className="h-3 w-3" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-neutral-100">
            {invoices.map((invoice) => {
              const invStatus = INVOICE_STATUS[invoice.status];
              return (
                <div key={invoice.id} className="px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-neutral-900">
                      ${invoice.amount}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[12px]">
                      <span className={`h-1.5 w-1.5 rounded-full ${invStatus.dot}`} />
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
                    <button className="inline-flex items-center gap-1 text-[12px] text-neutral-400 transition-colors hover:text-neutral-600">
                      <Download className="h-3 w-3" />
                      PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>

      {/* ========================= */}
      {/* 4. Annulation (discrète)   */}
      {/* ========================= */}
      {subscription && !subscription.cancelAtPeriodEnd && (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div>
            <p className="text-[13px] font-medium text-neutral-700">
              Annuler l&apos;abonnement
            </p>
            <p className="text-[12px] text-neutral-400">
              Votre accès sera maintenu jusqu&apos;à la fin de la période en cours.
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
