import { describe, expect, it } from 'vitest';
import { SAME_AS } from '@/lib/jobs/employer';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import { PROFILE } from '../profile';

/**
 * Profile für `sameAs` (Plan §C4, M-030): nur geprüfte https-Adressen mit Prüfdatum. Leer, bis der Inhaber Profile
 * nennt; dann trägt `sameAs` nur die Website für Kunden.
 */
describe('PROFILE', () => {
  it('jedes Profil hat Plattform, https-Adresse und ein Prüfdatum, das nicht in der Zukunft liegt', () => {
    for (const profil of PROFILE) {
      expect(profil.plattform.trim(), profil.url).not.toBe('');
      expect(profil.url).toMatch(/^https:\/\/[^\s/]+\.[^\s/]+\/\S*$/);
      expect(profil.geprueftAm, profil.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${profil.geprueftAm}T00:00:00Z`).getTime(), profil.url).toBeLessThanOrEqual(Date.now());
    }
    expect(new Set(PROFILE.map((profil) => profil.url)).size).toBe(PROFILE.length);
    expect(Object.isFrozen(PROFILE)).toBe(true);
  });

  it('kein Profil verweist auf die eigene Website; sameAs = Website für Kunden + Profile', () => {
    for (const profil of PROFILE) expect(new URL(profil.url).hostname).not.toMatch(/(^|\.)bad-energie\.de$/);
    expect([...SAME_AS]).toEqual([SITE_CONFIG.consumerUrl, ...PROFILE.map((profil) => profil.url)]);
  });
});
