import { deriveChannel, type AcquisitionChannel } from './channel';
import { getAttribution } from './store';

/**
 * Cookielose Ereignisse des Bewerbungsflows (Plan §D, Paket W4): Formular gestartet, Schritt erreicht, abgesendet,
 * Fehler beim Absenden, Klick auf WhatsApp oder Telefon. Je Ereignis gehen nur Name, Stelle und Kanal (einer der
 * festen Werte aus deriveChannel, nie UTM-Rohwerte, Referrer oder Einstiegsseite) an POST /api/e, per sendBeacon.
 * Keine Kennung, kein Cookie, kein Speicher im Browser; der Server speichert weder IP noch User-Agent und schreibt
 * vorerst nur eine Log-Zeile (Speicher in Supabase gehört der Phase-2-Session, E-012).
 *
 * Alles hinter dem Schalter FUNNEL_EVENTS (lib/env.ts, Standard aus): Die Seite setzt dann das Meta-Element
 * `<meta name="be-ereignisse" content="an">`, ohne es sendet der Browser nichts. Freigabe durch den Datenschutz:
 * MENSCHEN.md M-034, Entwurf für die Datenschutzerklärung in docs/operations/datenschutz-aenderungen.md (2.13).
 *
 * Client-tauglich (ohne zod); die strenge Prüfung auf dem Server steht in ereignis-schema.ts.
 */

export const EREIGNIS_ENDPOINT = '/api/e';
/** Name des Meta-Elements, mit dem die Seite den Schalter ins HTML reicht. */
export const EREIGNIS_META = 'be-ereignisse';

export const EREIGNIS_NAMEN = ['flow_start', 'schritt', 'abgesendet', 'fehler', 'whatsapp_klick', 'telefon_klick'] as const;
export type EreignisName = (typeof EREIGNIS_NAMEN)[number];

/** Arten eines Fehlers beim Absenden, wie SubmitFailureKind in lib/apply/submit.ts (ein Test hält beide gleich). */
export const FEHLER_ARTEN = ['offline', 'network', 'timeout', 'validation', 'rate_limited', 'server'] as const;
export type FehlerArt = (typeof FEHLER_ARTEN)[number];

/** Was der Aufrufer mitgibt; den Kanal ergänzt sendeEreignis() aus der Attribution der Seite. */
export type EreignisEingabe =
  | { ereignis: 'flow_start' | 'abgesendet' | 'whatsapp_klick' | 'telefon_klick'; stelle?: string | null }
  | { ereignis: 'schritt'; stelle?: string | null; schritt: string }
  | { ereignis: 'fehler'; stelle?: string | null; fehler: FehlerArt };

/** Was an den Server geht. `stelle` ist eine Stellen-ID oder ein Slug, der Server ordnet ihn zu oder verwirft ihn. */
export type Ereignis = EreignisEingabe & { kanal: AcquisitionChannel };

/** Höchstlänge von `stelle` und `schritt` (Slugs und IDs sind deutlich kürzer). */
export const EREIGNIS_TEXT_MAX = 80;

/** Ist der Schalter auf dieser Seite an? Ohne DOM (Server, Tests ohne Dokument) immer aus. */
export function ereignisseAktiv(doc: Pick<Document, 'querySelector'> | undefined = typeof document === 'undefined' ? undefined : document): boolean {
  return doc?.querySelector(`meta[name="${EREIGNIS_META}"]`)?.getAttribute('content') === 'an';
}

/** Kurzer Text oder nichts: getrimmt, höchstens EREIGNIS_TEXT_MAX Zeichen, sonst undefined. */
function kurz(value: string | null | undefined): string | undefined {
  const text = value?.trim();
  return text && text.length <= EREIGNIS_TEXT_MAX ? text : undefined;
}

/** Baut das Ereignis mit Kanal; leere oder zu lange Felder fallen weg (der Server prüft streng). */
export function baueEreignis(eingabe: EreignisEingabe, kanal: AcquisitionChannel): Ereignis {
  const { stelle, ...rest } = eingabe;
  const passend = kurz(stelle);
  return { ...rest, kanal, ...(passend ? { stelle: passend } : {}) } as Ereignis;
}

/**
 * Stelle aus der Adresse der Seite, für Klicks außerhalb des Flows: `/jobs/<slug>` oder `?stelle=` auf /bewerbung.
 * Sonst undefined (Startseite, Ortsseiten …).
 */
export function stelleAusAdresse(adresse: Pick<Location, 'pathname' | 'search'>): string | undefined {
  const job = /^\/jobs\/([^/?#]+)\/?$/.exec(adresse.pathname)?.[1];
  if (job) return kurz(decodeURIComponentSicher(job));
  if (adresse.pathname.replace(/\/+$/, '') === '/bewerbung') return kurz(new URLSearchParams(adresse.search).get('stelle'));
  return undefined;
}

function decodeURIComponentSicher(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Sendet ein Ereignis, wenn der Schalter an ist, per navigator.sendBeacon (läuft auch beim Verlassen der Seite
 * weiter, blockiert nichts). Als Text gesendet: Chrome lehnt sendBeacon mit dem Typ application/json ab; der Server
 * nimmt text/plain an und liest JSON. Liefert true, wenn der Browser es angenommen hat. Wirft nie.
 */
export function sendeEreignis(eingabe: EreignisEingabe): boolean {
  try {
    if (!ereignisseAktiv() || typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return false;
    const ereignis = baueEreignis(eingabe, deriveChannel(getAttribution()));
    return navigator.sendBeacon(EREIGNIS_ENDPOINT, JSON.stringify(ereignis));
  } catch {
    return false;
  }
}
