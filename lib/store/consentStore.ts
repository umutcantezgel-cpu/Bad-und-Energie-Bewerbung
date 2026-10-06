'use client';

import { create } from 'zustand';

export interface ConsentCategories {
  necessary: boolean; // Immer aktiv
  analytics: boolean;
  marketing: boolean;
}

interface ConsentState {
  hasAnswered: boolean;
  categories: ConsentCategories;
  updatedAt: string | null;
  setConsent: (categories: Partial<ConsentCategories>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  resetConsent: () => void;
}

const STORAGE_KEY = 'bad_energie_consent_v1';

export const useConsentStore = create<ConsentState>((set) => {
  let initialAnswered = false;
  let initialCategories: ConsentCategories = {
    necessary: true,
    analytics: false,
    marketing: false,
  };
  let initialDate: string | null = null;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        initialAnswered = true;
        initialCategories = parsed.categories || initialCategories;
        initialDate = parsed.updatedAt || null;
      }
    } catch {
      // Ignore storage read errors
    }
  }

  const persist = (answered: boolean, categories: ConsentCategories) => {
    const updatedAt = new Date().toISOString();
    set({ hasAnswered: answered, categories, updatedAt });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ answered, categories, updatedAt })
        );
      } catch {
        // Storage disabled or blocked
      }
    }
  };

  return {
    hasAnswered: initialAnswered,
    categories: initialCategories,
    updatedAt: initialDate,
    setConsent: (newCats) => {
      const updated = {
        necessary: true,
        analytics: Boolean(newCats.analytics),
        marketing: Boolean(newCats.marketing),
      };
      persist(true, updated);
    },
    acceptAll: () => {
      persist(true, { necessary: true, analytics: true, marketing: true });
    },
    rejectAll: () => {
      persist(true, { necessary: true, analytics: false, marketing: false });
    },
    resetConsent: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set({
        hasAnswered: false,
        categories: { necessary: true, analytics: false, marketing: false },
        updatedAt: null,
      });
    },
  };
});
