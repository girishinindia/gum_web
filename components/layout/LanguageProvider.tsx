'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Language } from '@/lib/api';

interface Ctx {
  languages: Language[];
  active:    Language | null;
  setActive: (iso: string) => void;
}

const LanguageContext = createContext<Ctx | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

const STORAGE_KEY = 'gum_web.lang';

/**
 * Holds the user's selected display language across the header switcher and
 * the Courses mega-menu, persisted to localStorage.
 *
 * Default is the first language the API returns (usually English).
 */
export function LanguageProvider({
  languages,
  defaultIso,
  children,
}: {
  languages:   Language[];
  defaultIso?: string;
  children:    React.ReactNode;
}) {
  const [activeIso, setActiveIso] = useState<string>(() =>
    defaultIso || languages[0]?.iso_code || 'en',
  );

  // Hydrate from localStorage on first client render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && languages.some((l) => l.iso_code === stored)) {
        setActiveIso(stored);
      }
    } catch { /* ignore */ }
  }, [languages]);

  const setActive = useCallback((iso: string) => {
    setActiveIso(iso);
    try { localStorage.setItem(STORAGE_KEY, iso); } catch { /* ignore */ }
  }, []);

  const active = languages.find((l) => l.iso_code === activeIso) ?? languages[0] ?? null;

  return (
    <LanguageContext.Provider value={{ languages, active, setActive }}>
      {children}
    </LanguageContext.Provider>
  );
}
