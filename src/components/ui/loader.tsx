'use client';

import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LogoIcon } from './logo';

// ===========================================
// PIXLY - Loader Components
// Premium loading indicators for SaaS
// ===========================================

// ============ SPINNER ============
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'neutral';
  className?: string;
}

const spinnerSizes = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-4',
};

const spinnerColors = {
  primary: 'border-primary-200 border-t-primary-500',
  white: 'border-white/30 border-t-white',
  neutral: 'border-neutral-200 border-t-neutral-600',
};

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

// ============ DOTS LOADER ============
interface DotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'neutral';
  className?: string;
}

const dotSizes = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-3 w-3',
};

const dotColors = {
  primary: 'bg-primary-500',
  white: 'bg-white',
  neutral: 'bg-neutral-500',
};

export function DotsLoader({ size = 'md', color = 'primary', className }: DotsLoaderProps) {
  return (
    <div className={cn('flex items-center gap-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('rounded-full', dotSizes[size], dotColors[color])}
          animate={{
            y: [-2, 2, -2],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============ PULSE LOADER ============
interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const pulseSizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export function PulseLoader({ size = 'md', className }: PulseLoaderProps) {
  return (
    <div className={cn('relative', pulseSizes[size], className)} role="status" aria-label="Loading">
      <motion.div
        className="absolute inset-0 rounded-full bg-primary-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} />
      </div>
    </div>
  );
}

// ============ LOGO LOADER ============
interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LogoLoader({ size = 'md', text, className }: LogoLoaderProps) {
  const logoSize = size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg';

  return (
    <div className={cn('flex flex-col items-center gap-4', className)} role="status" aria-label="Loading">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary-500"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.1, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <LogoIcon size={logoSize} className="relative" />
        </div>
      </motion.div>

      {text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-neutral-600"
        >
          {text}
        </motion.p>
      )}

      <div className="h-1 w-32 overflow-hidden rounded-full bg-neutral-100">
        <motion.div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400"
          animate={{ x: ['-100%', '400%'] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}

// ============ CONTENT LOADER (Shimmer) ============
interface ContentLoaderProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export function ContentLoader({
  width,
  height,
  className,
  rounded = 'md',
}: ContentLoaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-200/70',
        roundedClasses[rounded],
        className
      )}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// ============ OVERLAY LOADER ============
interface OverlayLoaderProps {
  isVisible: boolean;
  text?: string;
  variant?: 'fullscreen' | 'contained';
  blur?: boolean;
  className?: string;
}

export function OverlayLoader({
  isVisible,
  text,
  variant = 'contained',
  blur = true,
  className,
}: OverlayLoaderProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'flex items-center justify-center bg-white/80',
            variant === 'fullscreen' ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
            blur && 'backdrop-blur-sm',
            className
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            {text && <p className="text-sm font-medium text-neutral-600">{text}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ BUTTON LOADER ============
interface ButtonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  spinnerColor?: 'primary' | 'white' | 'neutral';
}

export function ButtonLoader({
  isLoading,
  children,
  loadingText,
  spinnerColor = 'white',
}: ButtonLoaderProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <span className="flex items-center gap-2">
      <Spinner size="sm" color={spinnerColor} />
      {loadingText || 'Chargement...'}
    </span>
  );
}

// ============ INLINE LOADER ============
interface InlineLoaderProps {
  size?: 'sm' | 'md';
  text?: string;
  className?: string;
}

export function InlineLoader({ size = 'sm', text, className }: InlineLoaderProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-neutral-500', className)}>
      <Spinner size={size === 'sm' ? 'xs' : 'sm'} color="neutral" />
      {text && <span className="text-sm">{text}</span>}
    </span>
  );
}

// ============ CARD LOADER ============
interface CardLoaderProps {
  className?: string;
}

export function CardLoader({ className }: CardLoaderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[200px] items-center justify-center rounded-2xl border border-neutral-200 bg-white',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size="md" />
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    </div>
  );
}

// ============ PAGE LOADER ============
interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = 'Chargement...' }: PageLoaderProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LogoLoader text={text} size="md" />
    </div>
  );
}

// ============ FULL PAGE LOADER ============
export function FullPageLoader({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <LogoLoader text={text} size="lg" />
    </div>
  );
}

// ============ DATA LOADING STATE ============
interface DataLoadingProps {
  isLoading: boolean;
  isEmpty?: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  emptyState?: React.ReactNode;
  error?: string | null;
  onRetry?: () => void;
}

export function DataLoading({
  isLoading,
  isEmpty = false,
  children,
  skeleton,
  emptyState,
  error,
  onRetry,
}: DataLoadingProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-neutral-900">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return skeleton || <CardLoader />;
  }

  if (isEmpty && emptyState) {
    return <>{emptyState}</>;
  }

  return <>{children}</>;
}
