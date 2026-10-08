import { INITIATIVE_JOB_ID, type ApplicationJobId } from '@/lib/applications/constants';

/**
 * URL-Parameter von /bewerbung: `?stelle=<slug>` wählt die Stelle vor, alte `?tab=`-Links
 * des Vorgänger-Portals werden gemappt (ROADMAP §3.1). Rein, damit Seite und Tests es teilen.
 */

export type SearchParamValue = string | string[] | undefined;
export type SearchParamsRecord = Record<string, SearchParamValue>;

export const INITIATIVE_PARAM = 'initiativ';
export const MAPPE_PATH = '/bewerbung/mappe';
/** Flow mit vorgewählter Initiativbewerbung (Links „Initiativ bewerben“). */
export const INITIATIVE_APPLY_PATH = `/bewerbung?stelle=${INITIATIVE_PARAM}`;

/** Parameter, die nur der Vorgänger kannte; sie werden nicht weitergereicht. */
const LEGACY_PARAMS = ['tab', 'direct'] as const;

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
