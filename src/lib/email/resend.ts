// ===========================================
// PIXLY - Email Service (Resend)
// Transactional emails: welcome, alerts, reports
// ===========================================

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = 'Pixly <noreply@pixly.app>';

function getApiKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend API.
 * Silently skips if RESEND_API_KEY is not configured.
 */
async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured — skipping email');
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Send failed:', response.status, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Email] Send error:', error);
    return false;
  }
}

// ===========================================
// EMAIL TEMPLATES
// ===========================================

export async function sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Bienvenue sur Pixly !',
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #171717; margin: 0;">Bienvenue sur Pixly</h1>
        </div>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Bonjour ${userName},
        </p>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Votre compte est prêt. Voici comment démarrer en 3 étapes :
        </p>
        <ol style="color: #525252; font-size: 15px; line-height: 1.8; padding-left: 20px;">
          <li><strong>Connectez vos plateformes</strong> — Meta Ads, Google Ads, Stripe...</li>
          <li><strong>Installez le pixel</strong> — Un copier-coller dans votre balise &lt;head&gt;</li>
          <li><strong>Analysez vos données</strong> — Attribution, funnel, audience en temps réel</li>
        </ol>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://pixly.app/dashboard" style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Accéder à mon dashboard
          </a>
        </div>
        <p style="color: #a3a3a3; font-size: 13px; text-align: center;">
          Besoin d'aide ? Répondez à cet email, on vous répond en moins de 24h.
        </p>
      </div>
    `,
  });
}

export async function sendTrialEndingEmail(
  to: string,
  userName: string,
  daysLeft: number
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Votre essai Pixly se termine dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #171717; margin: 0 0 16px;">
          Votre essai se termine bientôt
        </h1>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Bonjour ${userName},
        </p>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Il vous reste <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong> d'essai gratuit.
          Pour continuer à tracker vos conversions et optimiser votre ROAS, choisissez un plan.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://pixly.app/billing" style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Voir les tarifs
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentFailedEmail(
  to: string,
  userName: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Problème de paiement — Action requise',
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #171717; margin: 0 0 16px;">
          Problème de paiement
        </h1>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Bonjour ${userName},
        </p>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          Nous n'avons pas pu traiter votre dernier paiement. Veuillez mettre à jour votre moyen de paiement pour éviter une interruption de service.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://pixly.app/billing" style="display: inline-block; background: #dc2626; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Mettre à jour le paiement
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendIntegrationErrorEmail(
  to: string,
  integrationName: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Alerte : connexion ${integrationName} interrompue`,
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #171717; margin: 0 0 16px;">
          Connexion interrompue
        </h1>
        <p style="color: #525252; font-size: 15px; line-height: 1.6;">
          La connexion avec <strong>${integrationName}</strong> a été interrompue.
          Vos données ne sont plus synchronisées. Reconnectez votre compte pour reprendre le tracking.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://pixly.app/integrations" style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Reconnecter ${integrationName}
          </a>
        </div>
      </div>
    `,
  });
}
