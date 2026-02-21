// ===========================================
// PIXLY - Auth Error Messages
// Premium UX-friendly error mapping
// ===========================================

export type AuthErrorType =
  | 'invalid-credentials'
  | 'email-exists'
  | 'weak-password'
  | 'invalid-email'
  | 'user-disabled'
  | 'too-many-requests'
  | 'network-error'
  | 'popup-closed'
  | 'generic';

export interface AuthError {
  type: AuthErrorType;
  title: string;
  message: string;
  suggestion?: string;
}

/**
 * Firebase error code to UX-friendly message mapping
 * Premium SaaS-quality error messages
 */
const firebaseErrorMap: Record<string, AuthError> = {
  // Login errors
  'auth/invalid-credential': {
    type: 'invalid-credentials',
    title: 'Identifiants incorrects',
    message: 'L\'email ou le mot de passe que vous avez saisi est incorrect.',
    suggestion: 'Vérifiez vos informations et réessayez.',
  },
  'auth/invalid-email': {
    type: 'invalid-email',
    title: 'Email invalide',
    message: 'L\'adresse email saisie n\'est pas valide.',
    suggestion: 'Veuillez vérifier le format de votre email.',
  },
  'auth/user-disabled': {
    type: 'user-disabled',
    title: 'Compte désactivé',
    message: 'Ce compte a été temporairement désactivé.',
    suggestion: 'Contactez notre support pour plus d\'informations.',
  },
  'auth/user-not-found': {
    type: 'invalid-credentials',
    title: 'Identifiants incorrects',
    message: 'L\'email ou le mot de passe que vous avez saisi est incorrect.',
    suggestion: 'Vérifiez vos informations ou créez un compte.',
  },
  'auth/wrong-password': {
    type: 'invalid-credentials',
    title: 'Identifiants incorrects',
    message: 'L\'email ou le mot de passe que vous avez saisi est incorrect.',
    suggestion: 'Vérifiez vos informations et réessayez.',
  },

  // Signup errors
  'auth/email-already-in-use': {
    type: 'email-exists',
    title: 'Email déjà utilisé',
    message: 'Cette adresse email est déjà associée à un compte.',
    suggestion: 'Connectez-vous ou utilisez une autre adresse.',
  },
  'auth/weak-password': {
    type: 'weak-password',
    title: 'Mot de passe trop faible',
    message: 'Votre mot de passe doit contenir au moins 8 caractères.',
    suggestion: 'Incluez des lettres, chiffres et caractères spéciaux.',
  },
  'auth/operation-not-allowed': {
    type: 'generic',
    title: 'Action non autorisée',
    message: 'Cette méthode de connexion n\'est pas disponible.',
    suggestion: 'Veuillez essayer une autre méthode.',
  },

  // Rate limiting
  'auth/too-many-requests': {
    type: 'too-many-requests',
    title: 'Trop de tentatives',
    message: 'Vous avez effectué trop de tentatives de connexion.',
    suggestion: 'Veuillez patienter quelques minutes avant de réessayer.',
  },

  // Network errors
  'auth/network-request-failed': {
    type: 'network-error',
    title: 'Erreur de connexion',
    message: 'Impossible de se connecter au serveur.',
    suggestion: 'Vérifiez votre connexion internet et réessayez.',
  },

  // OAuth/Popup errors
  'auth/popup-closed-by-user': {
    type: 'popup-closed',
    title: 'Connexion annulée',
    message: 'La fenêtre de connexion a été fermée.',
    suggestion: 'Cliquez à nouveau pour vous connecter.',
  },
  'auth/cancelled-popup-request': {
    type: 'popup-closed',
    title: 'Connexion annulée',
    message: 'La demande de connexion a été annulée.',
    suggestion: 'Cliquez à nouveau pour vous connecter.',
  },
  'auth/popup-blocked': {
    type: 'popup-closed',
    title: 'Popup bloqué',
    message: 'La fenêtre de connexion a été bloquée par votre navigateur.',
    suggestion: 'Autorisez les popups pour ce site et réessayez.',
  },
  'auth/account-exists-with-different-credential': {
    type: 'email-exists',
    title: 'Compte existant',
    message: 'Un compte existe déjà avec cet email via une autre méthode.',
    suggestion: 'Connectez-vous avec la méthode utilisée initialement.',
  },

  // Internal errors
  'auth/internal-error': {
    type: 'generic',
    title: 'Erreur temporaire',
    message: 'Une erreur inattendue s\'est produite.',
    suggestion: 'Veuillez réessayer dans quelques instants.',
  },
};

/**
 * Default error for unknown Firebase errors
 */
const defaultError: AuthError = {
  type: 'generic',
  title: 'Une erreur est survenue',
  message: 'Nous n\'avons pas pu traiter votre demande.',
  suggestion: 'Veuillez réessayer ou contacter le support.',
};

/**
 * Extract Firebase error code from error object
 */
function extractFirebaseErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  const err = error as Record<string, unknown>;

  // Firebase Auth errors have a 'code' property
  if (typeof err.code === 'string' && err.code.startsWith('auth/')) {
    return err.code;
  }

  // Check message for error code pattern
  if (typeof err.message === 'string') {
    const match = err.message.match(/auth\/[\w-]+/);
    if (match) return match[0];
  }

  return null;
}

/**
 * Transform any Firebase Auth error into a premium UX-friendly error
 *
 * @param error - Firebase Auth error or any error object
 * @returns Premium UX-friendly error object
 */
export function getAuthErrorMessage(error: unknown): AuthError {
  const errorCode = extractFirebaseErrorCode(error);

  if (errorCode && firebaseErrorMap[errorCode]) {
    return firebaseErrorMap[errorCode];
  }

  // Log unknown errors for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Auth] Unknown error:', error);
  }

  return defaultError;
}

/**
 * Get a simple error message string (for inline display)
 */
export function getAuthErrorString(error: unknown): string {
  const authError = getAuthErrorMessage(error);
  return authError.message;
}

/**
 * Check if error is a specific type
 */
export function isAuthErrorType(error: unknown, type: AuthErrorType): boolean {
  const authError = getAuthErrorMessage(error);
  return authError.type === type;
}

/**
 * Validation error messages for form fields
 */
export const validationMessages = {
  email: {
    required: 'L\'adresse email est requise',
    invalid: 'Veuillez entrer une adresse email valide',
  },
  password: {
    required: 'Le mot de passe est requis',
    tooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    tooWeak: 'Ajoutez des lettres, chiffres et caractères spéciaux',
  },
  confirmPassword: {
    required: 'Veuillez confirmer votre mot de passe',
    mismatch: 'Les mots de passe ne correspondent pas',
  },
  name: {
    required: 'Votre nom est requis',
    tooShort: 'Le nom doit contenir au moins 2 caractères',
  },
  terms: {
    required: 'Veuillez accepter les CGU et la politique de confidentialité pour continuer',
  },
};
