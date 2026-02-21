'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  createElement,
  type ReactNode,
} from 'react';
import { translations, type Locale } from './translations';

const STORAGE_KEY = 'pixly_locale';
const DEFAULT_LOCALE: Locale = 'fr';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getLocaleTag(locale: Locale): string {
  return locale === 'fr' ? 'fr-FR' : 'en-US';
}

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {
    // localStorage unavailable (SSR, privacy mode, etc.)
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = translations[locale][key];
      if (value === undefined) {
        // Fallback to French, then return the key itself
        value = translations.fr[key] ?? key;
      }
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(
            new RegExp(`\\{${paramKey}\\}`, 'g'),
            String(paramValue),
          );
        });
      }
      return value;
    },
    [locale],
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(getLocaleTag(locale), options).format(value);
    },
    [locale],
  );

  const formatCurrency = useCallback(
    (value: number, currency = 'EUR'): string => {
      return new Intl.NumberFormat(getLocaleTag(locale), {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
    [locale],
  );

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      const defaults: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };
      return new Intl.DateTimeFormat(
        getLocaleTag(locale),
        options ?? defaults,
      ).format(date);
    },
    [locale],
  );

  return createElement(
    I18nContext.Provider,
    {
      value: { locale, setLocale, t, formatNumber, formatCurrency, formatDate },
    },
    children,
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export type { Locale };
