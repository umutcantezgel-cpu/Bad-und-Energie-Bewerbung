import { INITIATIVE_JOB_ID, type ApplicationJobId } from '@/lib/applications/constants';

/**
 * URL-Parameter von /bewerbung: `?stelle=<slug>` wählt die Stelle vor, alte `?tab=`-Links
 * des Vorgänger-Portals werden gemappt (ROADMAP §3.1). Rein, damit Seite und Tests es teilen.
 */

export type SearchParamValue = string | string[] | undefined;
export type SearchParamsRecord = Record<string, SearchParamValue>;

export const INITIATIVE_PARAM = 'initiativ';
export const BEWERBUNG_PFAD = '/bewerbung';
export const MAPPE_PATH = '/bewerbung/mappe';
/**
 * Vorgerenderte Varianten von /bewerbung (Vorauswahl, Unterlagen-Hinweis): Nur proxy.ts schreibt intern hierher um,
 * im Browser steht weiter /bewerbung?stelle=… (lib/apply/vorauswahl.ts). Direkte Aufrufe leitet der Proxy zurück.
 */
export const VARIANTE_PFAD = `${BEWERBUNG_PFAD}/variante`;
/** Variante ohne Vorauswahl (nur Unterlagen-Hinweis). */
export const KEINE_STELLE = 'keine';
/** Zweite Pfadebene der Varianten: mit oder ohne Hinweis auf Unterlagen (Altlinks ?tab=vault|direct, ?direct=true). */
export const HINWEISE = ['ohne', 'unterlagen'] as const;
/** Flow mit vorgewählter Initiativbewerbung (Links „Initiativ bewerben“). */
export const INITIATIVE_APPLY_PATH = `/bewerbung?stelle=${INITIATIVE_PARAM}`;

/** Parameter, die nur der Vorgänger kannte; sie werden nicht weitergereicht. */
const LEGACY_PARAMS = ['tab', 'direct'] as const;

/** URLSearchParams als Record wie Nexts searchParams: Mehrfachwerte als Array, Schlüssel in URL-Reihenfolge. */
export function searchParamsRecord(search: URLSearchParams): SearchParamsRecord {
  const record = Object.create(null) as SearchParamsRecord;
  for (const key of new Set(search.keys())) {
    const values = search.getAll(key);
    record[key] = values.length > 1 ? values : values[0];
  }
  return record;
}

export function firstParam(value: SearchParamValue): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();
  return trimmed ? trimmed : undefined;
}

export interface JobParamOption {
  id: ApplicationJobId;
  slug: string | null;
  /** Frühere Slugs (redirectFrom), damit alte Links weiter vorwählen. */
  legacySlugs?: readonly string[];
}

/** `?stelle=` → Stellen-ID, wenn sie im Flow wählbar ist; sonst undefined (Schritt „Stelle“). */
export function jobIdFromParam(value: SearchParamValue, options: readonly JobParamOption[]): ApplicationJobId | undefined {
  const param = firstParam(value)?.toLowerCase();
  if (!param) return undefined;
  if (param === INITIATIVE_PARAM || param === INITIATIVE_JOB_ID) return INITIATIVE_JOB_ID;
  const match =
    options.find((option) => option.slug === param) ??
    options.find((option) => option.id === param) ??
    options.find((option) => option.legacySlugs?.includes(param));
  return match?.id;
}

/** Wert für `?stelle=` zu einer Auswahl (Slug oder „initiativ“). */
export function paramForJob(jobId: ApplicationJobId | null, options: readonly JobParamOption[]): string | null {
  if (!jobId) return null;
  if (jobId === INITIATIVE_JOB_ID) return INITIATIVE_PARAM;
  return options.find((option) => option.id === jobId)?.slug ?? null;
}

/** Query ohne die Altparameter, z. B. für Weiterleitungen (UTM und `ref` bleiben erhalten). */
export function carryOverQuery(params: SearchParamsRecord, drop: readonly string[] = LEGACY_PARAMS): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (drop.includes(key) || value === undefined) continue;
    for (const entry of Array.isArray(value) ? value : [value]) query.append(key, entry);
  }
  const text = query.toString();
  return text ? `?${text}` : '';
}

/** `?tab=dossier` → Bewerbungsmappe. Alle anderen alten Tabs (`quiz`, `form`, `vault`, `direct`) führen in den Flow. */
export function legacyRedirectTarget(params: SearchParamsRecord): string | null {
  const tab = firstParam(params.tab)?.toLowerCase();
  if (tab === 'dossier') return `${MAPPE_PATH}${carryOverQuery(params)}`;
  return null;
}

/** Alte Tabs des Dokumenten-Tresors (E-BEW-027): `?tab=vault`, `?tab=direct`. */
const DOCUMENT_TABS: readonly string[] = ['vault', 'direct'];
/** Werte, mit denen `?direct=` ausdrücklich abgeschaltet ist. */
const DIRECT_OFF: readonly string[] = ['false', '0', 'nein', 'no'];

/**
 * Wollte der Link Unterlagen einreichen? Der Vorgänger öffnete mit `?tab=vault`, `?tab=direct` und
 * `?direct=true` den Tresor (E-BEW-027, E-START-007). Die Seite bleibt beim Flow (HTTP 200) und weist
 * nur auf den Abschnitt „Unterlagen einreichen“ hin; ein leeres oder abgeschaltetes `direct` zählt nicht.
 */
export function wantsDocuments(params: SearchParamsRecord): boolean {
  const tab = firstParam(params.tab)?.toLowerCase();
  if (tab && DOCUMENT_TABS.includes(tab)) return true;
  const direct = firstParam(params.direct)?.toLowerCase();
  return direct !== undefined && !DIRECT_OFF.includes(direct);
}
