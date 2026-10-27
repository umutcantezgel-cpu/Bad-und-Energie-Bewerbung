import { INITIATIVE_JOB_ID } from '@/lib/applications/constants';
import { getFunnelOptions, getJobById } from '@/lib/jobs/registry';
import {
  BEWERBUNG_PFAD,
  HINWEISE,
  KEINE_STELLE,
  VARIANTE_PFAD,
  jobIdFromParam,
  legacyRedirectTarget,
  searchParamsRecord,
  wantsDocuments,
  type JobParamOption,
} from './params';

/**
 * /bewerbung aus dem Cache (Schritt 2b): Die Seite liest keine searchParams mehr, proxy.ts entscheidet vor dem Cache.
 * Altlinks leitet er um, eine Vorauswahl (?stelle=) und den Unterlagen-Hinweis schreibt er intern auf eine von wenigen
 * vorgerenderten Varianten um; alles andere (utm_*, ref, herkunft, schritt, unbekannte Stelle) bekommt die statische
 * Seite. Rein und ohne Next-APIs, damit Proxy, Seiten und Tests dieselbe Entscheidung treffen.
 */

/** Was ?stelle= zum Stichtag vorwählt (veröffentlicht und live oder funnel_only, mit alten Slugs). */
export function vorauswahlOptionen(now: Date): JobParamOption[] {
  return getFunnelOptions(now).map((option) => ({
    id: option.id,
    slug: option.slug,
    legacySlugs: getJobById(option.id)?.redirectFrom ?? [],
  }));
}

/**
 * Alle Varianten, ohne Stichtag: ISR ruft generateStaticParams nicht erneut auf, eine Stelle, die erst nach dem Build
 * abläuft, muss vorgerendert bleiben (die Seite wählt sie dann nicht mehr vor).
 */
export function variantenParams(): { stelle: string; hinweis: string }[] {
  const stellen = [...getFunnelOptions().map((option) => option.id), INITIATIVE_JOB_ID, KEINE_STELLE];
  return stellen.flatMap((stelle) =>
    HINWEISE.filter((hinweis) => stelle !== KEINE_STELLE || hinweis !== 'ohne').map((hinweis) => ({ stelle, hinweis })),
  );
}

export type BewerbungZiel = { art: 'weiterleiten'; url: string } | { art: 'umschreiben'; pfad: string } | null;

/** Was proxy.ts mit einer Anfrage an /bewerbung oder eine Variantenadresse tut; null = statische /bewerbung. */
export function bewerbungZiel(pathname: string, search: URLSearchParams, now: Date): BewerbungZiel {
  if (pathname.startsWith(`${VARIANTE_PFAD}/`)) {
    // Direkter Aufruf der internen Adresse: zurück auf die eine öffentliche Adresse (kein Duplikat, kein noindex).
    const stelle = pathname.slice(VARIANTE_PFAD.length + 1).split('/')[0];
    const query = new URLSearchParams(search);
    if (stelle && stelle !== KEINE_STELLE) query.set('stelle', stelle);
    const text = query.toString();
    return { art: 'weiterleiten', url: `${BEWERBUNG_PFAD}${text ? `?${text}` : ''}` };
  }
  const params = searchParamsRecord(search);
  // ?tab=dossier → /bewerbung/mappe, Query ohne die Altparameter (E-BEW-027).
  const alt = legacyRedirectTarget(params);
  if (alt) return { art: 'weiterleiten', url: alt };
  const stelle = jobIdFromParam(params.stelle, vorauswahlOptionen(now));
  const unterlagen = wantsDocuments(params);
  if (!stelle && !unterlagen) return null;
  return { art: 'umschreiben', pfad: `${VARIANTE_PFAD}/${stelle ?? KEINE_STELLE}/${unterlagen ? 'unterlagen' : 'ohne'}` };
}
