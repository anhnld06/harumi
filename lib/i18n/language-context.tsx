'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { locales, translations, type Locale } from './translations';

const STORAGE_KEY = 'harumi-locale';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['en', 'ja', 'vi'].includes(stored)) return stored as Locale;
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale === 'ja' ? 'ja' : newLocale === 'vi' ? 'vi' : 'en';
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale === 'ja' ? 'ja' : locale === 'vi' ? 'vi' : 'en';
    }
  }, [locale, mounted]);

  const t = useCallback(
    (key: string) => translations[locale][key] ?? key,
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: string) => key,
    };
  }
  return ctx;
}

export { locales, type Locale };
