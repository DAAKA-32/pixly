'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===========================================
// PIXLY - Toast Notification System
// Premium, discrete feedback for user actions
// ===========================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast configuration by type
const toastConfig: Record<ToastType, {
  icon: typeof Check;
  iconClass: string;
  bgClass: string;
  borderClass: string;
  titleClass: string;
}> = {
  success: {
    icon: Check,
    iconClass: 'text-green-600 bg-green-100',
    bgClass: 'bg-white',
    borderClass: 'border-green-200',
    titleClass: 'text-green-900',
  },
  error: {
    icon: X,
    iconClass: 'text-red-600 bg-red-100',
    bgClass: 'bg-white',
    borderClass: 'border-red-200',
    titleClass: 'text-red-900',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600 bg-amber-100',
    bgClass: 'bg-white',
    borderClass: 'border-amber-200',
    titleClass: 'text-amber-900',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-600 bg-blue-100',
    bgClass: 'bg-white',
    borderClass: 'border-blue-200',
    titleClass: 'text-blue-900',
  },
};

// Single Toast component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2, ease: 'easeOut' } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg',
        config.bgClass,
        config.borderClass
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full', config.iconClass)}>
            <Icon className="h-3.5 w-3.5" />
          </div>

          {/* Content */}
          <div className="flex-1 pt-0.5">
            <p className={cn('text-sm font-semibold', config.titleClass)}>
              {toast.title}
            </p>
            {toast.description && (
              <p className="mt-1 text-sm text-neutral-600">
                {toast.description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onRemove}
            className="flex-shrink-0 rounded-lg p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
        className={cn(
          'h-0.5 origin-left',
          toast.type === 'success' && 'bg-green-400',
          toast.type === 'error' && 'bg-red-400',
          toast.type === 'warning' && 'bg-amber-400',
          toast.type === 'info' && 'bg-blue-400'
        )}
      />
    </motion.div>
  );
}

// Toast Container
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Toast Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || 4000;

    setToasts((prev) => [...prev, { ...toast, id, duration }]);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description, duration: 6000 });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description, duration: 5000 });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toasts
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Standalone toast functions (for use outside React components)
let toastRef: ToastContextType | null = null;

export function setToastRef(ref: ToastContextType | null) {
  toastRef = ref;
}

export const toast = {
  success: (title: string, description?: string) => toastRef?.success(title, description),
  error: (title: string, description?: string) => toastRef?.error(title, description),
  warning: (title: string, description?: string) => toastRef?.warning(title, description),
  info: (title: string, description?: string) => toastRef?.info(title, description),
};
