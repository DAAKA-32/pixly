'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from '@/components/ui/logo';
import { Check } from 'lucide-react';

// ===========================================
// PIXLY - Auth Transition Screen
// Premium loading experience during authentication
// ===========================================

type AuthTransitionState = 'authenticating' | 'success' | 'redirecting';

interface AuthTransitionProps {
  state?: AuthTransitionState;
  message?: string;
}

const stateConfig = {
  authenticating: {
    title: 'Connexion en cours',
    defaultMessage: 'Vérification de vos identifiants...',
    showCheck: false,
  },
  success: {
    title: 'Connexion réussie',
    defaultMessage: 'Bienvenue !',
    showCheck: true,
  },
  redirecting: {
    title: 'Connexion réussie',
    defaultMessage: 'Redirection vers votre tableau de bord...',
    showCheck: true,
  },
};

export function AuthTransition({
  state = 'redirecting',
  message,
}: AuthTransitionProps) {
  const config = stateConfig[state];
  const displayMessage = message || config.defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="flex flex-col items-center">
        {/* Logo animé */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="relative">
            {/* Cercle de fond avec pulse */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-2xl bg-primary-500"
            />
            {/* Logo */}
            <LogoIcon size="xl" className="relative shadow-xl shadow-primary-500/30" />

            {/* Success check badge */}
            <AnimatePresence>
              {config.showCheck && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 ring-3 ring-white"
                >
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Texte */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center"
        >
          <AnimatePresence mode="wait">
            <motion.h2
              key={config.title}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xl font-semibold text-neutral-900"
            >
              {config.title}
            </motion.h2>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={displayMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-sm text-neutral-500"
            >
              {displayMessage}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Progress bar animée */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-neutral-100"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400"
          />
        </motion.div>

        {/* Subtle dots indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              className="h-1.5 w-1.5 rounded-full bg-primary-400"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Composant pour le login avec gestion des états
interface LoginTransitionProps {
  isAuthenticating: boolean;
  isRedirecting: boolean;
  redirectMessage?: string;
}

export function LoginTransition({
  isAuthenticating,
  isRedirecting,
  redirectMessage,
}: LoginTransitionProps) {
  if (!isAuthenticating && !isRedirecting) return null;

  const state: AuthTransitionState = isRedirecting ? 'redirecting' : 'authenticating';

  return (
    <AnimatePresence>
      <AuthTransition state={state} message={redirectMessage} />
    </AnimatePresence>
  );
}

// Version compacte pour overlay
export function AuthTransitionOverlay({ message = 'Chargement...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center">
        <div className="relative h-12 w-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent"
          />
          <div className="absolute inset-2 rounded-full bg-primary-50" />
        </div>
        <p className="mt-4 text-sm font-medium text-neutral-600">{message}</p>
      </div>
    </motion.div>
  );
}
