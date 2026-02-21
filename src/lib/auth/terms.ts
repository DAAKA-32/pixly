// ===========================================
// PIXLY - Terms & CGU Constants
// Versioned terms acceptance for GDPR compliance
// ===========================================

/** Current version of the Terms of Service (matches "Dernière mise à jour" on /terms) */
export const CURRENT_TERMS_VERSION = '2026-02-19';

/**
 * Check if a user needs to accept the current terms.
 * Returns true if terms have never been accepted or if the version is outdated.
 */
export function needsTermsAcceptance(
  termsAcceptedAt?: Date | null,
  termsVersion?: string | null
): boolean {
  if (!termsAcceptedAt) return true;
  if (!termsVersion) return true;
  return termsVersion !== CURRENT_TERMS_VERSION;
}
