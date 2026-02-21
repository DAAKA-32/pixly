'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoIcon } from '@/components/ui/logo';
import { useToast } from '@/components/ui/toast';
import {
  getAuthErrorMessage,
  validationMessages,
  type AuthError,
} from '@/lib/auth/error-messages';
import { LoginTransition } from '@/components/auth/auth-transition';
import { TermsModal } from '@/components/auth/terms-modal';

// ===========================================
// PIXLY - Login/Signup Page
// Split-screen: minimal branding + auth form
// ===========================================

type AuthMode = 'login' | 'signup';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInGoogle } = useAuth();
  const toast = useToast();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Terms acceptance modal (shown for new users after account creation)
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<'dashboard' | 'onboarding' | null>(null);

  // States
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Check for logout success toast
  useEffect(() => {
    const logoutSuccess = sessionStorage.getItem('pixly_logout_success');
    if (logoutSuccess) {
      sessionStorage.removeItem('pixly_logout_success');
      toast.success('Déconnexion réussie', 'À bientôt !');
    }
  }, [toast]);

  // Real-time validation
  useEffect(() => {
    const newErrors: FormErrors = {};

    if (touched.name && mode === 'signup') {
      if (!name.trim()) {
        newErrors.name = validationMessages.name.required;
      } else if (name.trim().length < 2) {
        newErrors.name = validationMessages.name.tooShort;
      }
    }

    if (touched.email && email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = validationMessages.email.invalid;
      }
    }

    if (touched.password && password) {
      if (password.length < 8) {
        newErrors.password = validationMessages.password.tooShort;
      }
    }

    if (touched.confirmPassword && mode === 'signup' && confirmPassword) {
      if (confirmPassword !== password) {
        newErrors.confirmPassword = validationMessages.confirmPassword.mismatch;
      }
    }

    setErrors(newErrors);
  }, [name, email, password, confirmPassword, touched, mode]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setServerError(null);
    setErrors({});
    setTouched({});
    // Update URL to reflect current mode (without navigation)
    const url = newMode === 'signup' ? '/login?mode=signup' : '/login';
    window.history.replaceState(null, '', url);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = validationMessages.email.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = validationMessages.email.invalid;
    }

    if (!password) {
      newErrors.password = validationMessages.password.required;
    } else if (password.length < 8) {
      newErrors.password = validationMessages.password.tooShort;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        newErrors.name = validationMessages.name.required;
      } else if (name.trim().length < 2) {
        newErrors.name = validationMessages.name.tooShort;
      }
      if (confirmPassword !== password) {
        newErrors.confirmPassword = validationMessages.confirmPassword.mismatch;
      }
    }

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        setIsRedirecting(true);
        sessionStorage.setItem('pixly_login_success', 'true');
        router.replace('/dashboard');
      } else {
        await signUp(email, password, name);
        // New user: show terms modal before redirect
        setIsLoading(false);
        setPendingRedirect('onboarding');
        setShowTermsModal(true);
      }
    } catch (err: unknown) {
      setServerError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setServerError(null);
    setIsLoading(true);

    try {
      const { isNewUser } = await signInGoogle();

      if (isNewUser) {
        // New user: show terms modal before redirect
        setIsLoading(false);
        setPendingRedirect('onboarding');
        setShowTermsModal(true);
      } else {
        // Existing user: direct redirect
        setIsRedirecting(true);
        sessionStorage.setItem('pixly_login_success', 'true');
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      setServerError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string): number => {
    if (pwd.length === 0) return 0;
    if (pwd.length < 8) return 1;
    if (pwd.length < 12) return 2;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 4;
    return 3;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-primary-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];

  const handleTermsAccepted = () => {
    setShowTermsModal(false);
    setIsRedirecting(true);
    if (pendingRedirect === 'onboarding') {
      sessionStorage.setItem('pixly_signup_success', 'true');
      router.replace('/onboarding');
    } else {
      sessionStorage.setItem('pixly_login_success', 'true');
      router.replace('/dashboard');
    }
  };

  // Terms acceptance modal for new users
  if (showTermsModal) {
    return <TermsModal onAccepted={handleTermsAccepted} showLogout={false} />;
  }

  // Fullscreen loader during auth
  if (isLoading || isRedirecting) {
    return (
      <LoginTransition
        isAuthenticating={isLoading && !isRedirecting}
        isRedirecting={isRedirecting}
        redirectMessage={mode === 'signup'
          ? 'Préparation de votre espace...'
          : 'Redirection vers votre tableau de bord...'
        }
      />
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Back button */}
      <Link
        href="/"
        aria-label="Retour à la page d'accueil"
        className="fixed top-5 left-5 z-50 flex items-center gap-1.5 px-3 py-3 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Retour</span>
      </Link>

      {/* ─── Left Panel — Branding ─── */}
      <div className="hidden lg:flex lg:w-[48%] flex-shrink-0 relative items-center justify-center bg-neutral-50 border-r border-neutral-200/60 overflow-hidden">
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          {/* Logo with hover micro-interaction */}
          <div className="group cursor-default">
            <div className="h-20 w-20 relative rounded-2xl overflow-hidden shadow-md transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-xl">
              <Image
                src="/logo-pixly.png"
                alt="Pixly"
                width={80}
                height={80}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          <span className="mt-5 text-2xl font-bold text-neutral-900 tracking-tight">
            Pixly
          </span>

          {/* Tagline */}
          <p className="mt-3 text-[15px] text-neutral-500 leading-relaxed max-w-[240px]">
            Chaque euro investi, chaque conversion mesurée.
          </p>
        </motion.div>
      </div>

      {/* ─── Right Panel — Form ─── */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="min-h-full flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[400px]">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-6 sm:mb-10">
              <LogoIcon size="lg" />
              <span className="mt-2 sm:mt-3 text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                Pixly
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.2, ease } }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {mode === 'login' ? 'Content de vous revoir' : 'Créer un compte'}
                  </h1>
                  <p className="mt-2 text-neutral-500">
                    {mode === 'login'
                      ? 'Accédez à votre tableau de bord'
                      : '14 jours d\'essai gratuit, sans engagement'}
                  </p>
                </div>

                {/* Server error */}
                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="mb-6"
                    >
                      <div className="rounded-xl bg-red-50 border border-red-100 p-3 sm:p-4">
                        <div className="flex gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-red-100">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-red-800">
                              {serverError.title}
                            </h4>
                            <p className="mt-0.5 text-sm text-red-600">
                              {serverError.message}
                            </p>
                            {serverError.suggestion && (
                              <p className="mt-1 text-xs text-red-500">
                                {serverError.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name (signup only) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nom complet
                      </label>
                      <Input
                        type="text"
                        placeholder="Jean Dupont"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlur('name')}
                        icon={<User className="h-4 w-4" />}
                        error={!!(errors.name && touched.name)}
                      />
                      <AnimatePresence>
                        {errors.name && touched.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mt-1.5 text-xs text-red-500"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur('email')}
                      icon={<Mail className="h-4 w-4" />}
                      error={!!(errors.email && touched.email)}
                    />
                    <AnimatePresence>
                      {errors.email && touched.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-1.5 text-xs text-red-500"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur('password')}
                        icon={<Lock className="h-4 w-4" />}
                        error={!!(errors.password && touched.password)}
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-2 rounded-md hover:bg-neutral-100"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && touched.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-1.5 text-xs text-red-500"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Password strength (signup) */}
                    <AnimatePresence>
                      {mode === 'signup' && password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2.5 overflow-hidden"
                        >
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                  level <= passwordStrength ? strengthColors[passwordStrength] : 'bg-neutral-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-neutral-500 mt-1.5">
                            Force : <span className="font-medium">{strengthLabels[passwordStrength]}</span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm password (signup) */}
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => handleBlur('confirmPassword')}
                          icon={<Lock className="h-4 w-4" />}
                          error={!!(errors.confirmPassword && touched.confirmPassword)}
                          success={!!(confirmPassword && confirmPassword === password)}
                          className="pr-11"
                        />
                        {confirmPassword && confirmPassword === password && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2"
                          >
                            <Check className="h-4 w-4 text-emerald-500" />
                          </motion.div>
                        )}
                      </div>
                      <AnimatePresence>
                        {errors.confirmPassword && touched.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mt-1.5 text-xs text-red-500"
                          >
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Forgot password (login only) */}
                  {mode === 'login' && (
                    <div className="flex items-center justify-end pt-1">
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium shadow-lg shadow-primary-500/15 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-200"
                      isLoading={isLoading}
                    >
                      {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                        ou
                      </span>
                    </div>
                  </div>

                  {/* Google */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuer avec Google
                  </Button>
                </form>

                {/* Switch mode */}
                <p className="mt-8 text-center text-sm text-neutral-500">
                  {mode === 'login' ? (
                    <>
                      Pas encore de compte ?{' '}
                      <button
                        onClick={() => switchMode('signup')}
                        className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Créer un compte
                      </button>
                    </>
                  ) : (
                    <>
                      Déjà un compte ?{' '}
                      <button
                        onClick={() => switchMode('login')}
                        className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Se connecter
                      </button>
                    </>
                  )}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
