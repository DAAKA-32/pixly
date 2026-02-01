'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

// ===========================================
// PIXLY - Input Component Premium
// With micro-interactions and focus animations
// ===========================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, icon, label, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative group">
        {icon && (
          <div
            className={cn(
              'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200',
              isFocused ? 'text-primary-500' : 'text-neutral-400',
              error && 'text-red-400',
              success && 'text-green-500'
            )}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-neutral-900',
            'transition-all duration-200 ease-out',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
            // Default state
            !error && !success && 'border-neutral-200 hover:border-neutral-300 focus:border-primary-400 focus:ring-primary-500/20',
            // Error state
            error && 'border-red-300 focus:border-red-400 focus:ring-red-500/20 bg-red-50/30',
            // Success state
            success && 'border-green-300 focus:border-green-400 focus:ring-green-500/20',
            // Icon padding
            icon && 'pl-11',
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {/* Focus glow effect */}
        <div
          className={cn(
            'absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none',
            isFocused && !error ? 'opacity-100' : 'opacity-0',
            'shadow-[0_0_0_3px_rgba(16,185,129,0.1)]'
          )}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
