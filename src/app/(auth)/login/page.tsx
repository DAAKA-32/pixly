'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sparkles,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/components/ui/toast';
import {
  getAuthErrorMessage,
  validationMessages,
  type AuthError,
} from '@/lib/auth/error-messages';
import { LoginTransition } from '@/components/auth/auth-transition';

// ===========================================
// PIXLY - Login/Signup Page Premium
// Full light theme - Clean & cohesive
// ===========================================

type AuthMode = 'login' | 'signup';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  rgpd?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, signInGoogle } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

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
    setRgpdAccepted(false);
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
      if (!rgpdAccepted) {
        newErrors.rgpd = validationMessages.terms.required;
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
        setIsRedirecting(true);
        sessionStorage.setItem('pixly_signup_success', 'true');
        router.replace('/onboarding');
      }
    } catch (err: unknown) {
      setServerError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (mode === 'signup' && !rgpdAccepted) {
      setErrors({ rgpd: validationMessages.terms.required });
      return;
    }

    setServerError(null);
    setIsLoading(true);

    try {
      await signInGoogle();
      setIsRedirecting(true);
      if (mode === 'login') {
        sessionStorage.setItem('pixly_login_success', 'true');
      } else {
        sessionStorage.setItem('pixly_signup_success', 'true');
      }
      router.replace(mode === 'login' ? '/dashboard' : '/onboarding');
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
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-primary-500', 'bg-green-500'];
  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };

  const fieldVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: { opacity: 1, height: 'auto', marginBottom: 16, transition: { duration: 0.25 } },
    exit: { opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } },
  };

  // Fullscreen loader
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
    <div className="min-h-screen flex bg-white">
      {/* Back button - consistent light style */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-sm text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 hover:shadow-md transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Retour</span>
      </Link>

      {/* Left Panel - Light Branding */}
      <div className="hidden lg:flex lg:w-[48%] relative bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 items-center justify-center overflow-hidden border-r border-neutral-100">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-primary-100/50 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-56 w-56 rounded-full bg-emerald-100/40 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Logo size="xl" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-neutral-600 text-xl leading-relaxed font-medium"
          >
            L'attribution marketing qui vous dit la vérité sur vos publicités.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 space-y-4 w-full"
          >
            {[
              { icon: BarChart3, text: 'Attribution multi-touch précise' },
              { icon: Target, text: 'Tracking post-iOS 14 fiable' },
              { icon: Zap, text: 'Installation en moins de 5 minutes' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 border border-neutral-100 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                  <item.icon className="h-4 w-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-neutral-700">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span>+500 entreprises nous font confiance</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-neutral-600 text-sm font-medium">4.9/5</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[400px]">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Logo href="/" size="md" />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
                  </h1>
                  <p className="mt-2 text-neutral-500">
                    {mode === 'login'
                      ? 'Connectez-vous pour accéder à votre dashboard'
                      : 'Commencez votre essai gratuit de 14 jours'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
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
              {/* Name field (signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-md hover:bg-neutral-100"
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

                {/* Password strength (signup only) */}
                <AnimatePresence>
                  {mode === 'signup' && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <motion.div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                              level <= passwordStrength ? strengthColors[passwordStrength] : 'bg-neutral-200'
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: level * 0.05 }}
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

              {/* Confirm password (signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
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
                          <Check className="h-4 w-4 text-green-500" />
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password / RGPD */}
              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <motion.div
                    key="forgotPassword"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-end pt-1"
                  >
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="rgpd"
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={rgpdAccepted}
                          onChange={(e) => {
                            setRgpdAccepted(e.target.checked);
                            if (e.target.checked) {
                              setErrors((prev) => ({ ...prev, rgpd: undefined }));
                            }
                          }}
                          className="peer sr-only"
                        />
                        <div className={`h-5 w-5 rounded-md border-2 transition-all duration-200 peer-checked:border-primary-500 peer-checked:bg-primary-500 group-hover:border-neutral-400 ${
                          errors.rgpd ? 'border-red-400' : 'border-neutral-300'
                        }`} />
                        <Check className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm text-neutral-600 leading-relaxed">
                        J'accepte les{' '}
                        <Link href="/terms" className="text-primary-600 hover:underline font-medium">
                          Conditions d'utilisation
                        </Link>{' '}
                        et la{' '}
                        <Link href="/privacy" className="text-primary-600 hover:underline font-medium">
                          Politique de confidentialité
                        </Link>
                      </span>
                    </label>
                    <AnimatePresence>
                      {errors.rgpd && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-1.5 text-xs text-red-500"
                        >
                          {errors.rgpd}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-200"
                  isLoading={isLoading}
                >
                  {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                </Button>
              </motion.div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs font-medium text-neutral-400 uppercase tracking-wide">
                    ou continuer avec
                  </span>
                </div>
              </div>

              {/* Google button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
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
                  Google
                </Button>
              </motion.div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
