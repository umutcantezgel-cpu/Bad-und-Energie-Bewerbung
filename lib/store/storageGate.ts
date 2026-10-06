import { useConsentStore } from './consentStore';

/**
 * Storage Gate (§ 25 TDDDG & DSGVO)
 * Verhindert nicht-notwendige Zugriffe auf Cookies und LocalStorage ohne Einwilligung.
 */
export function canAccessStorage(category: 'necessary' | 'analytics' | 'marketing'): boolean {
  if (category === 'necessary') return true;
  const categories = useConsentStore.getState().categories;
  return Boolean(categories[category]);
}

export function safeSetItem(key: string, value: string, category: 'analytics' | 'marketing'): boolean {
  if (!canAccessStorage(category)) {
    return false;
  }
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
