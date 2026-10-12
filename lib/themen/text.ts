/**
 * Texte der Themenseiten (E-028): Hub /arbeiten-bei-uns und fünf Themen. Reines Modul ohne JSX, geprüft in
 * lib/themen/__tests__/text.test.ts.
 *
 * Regeln (ROADMAP §1, fakten-abgleich):
 * - Jeder Satz mit Aussage ist ein `Satz` mit Quelle: ein Fakt aus lib/content/facts.ts (per ID, nur bestätigt und
 *   gültig, nie `pending`), eine Stelle aus dem Registry (Gehalt, Paket, Aufgaben, Voraussetzungen; nur live), der
 *   Ablauf und die Diskretionszusage (lib/content/process.ts), eine FAQ-Antwort (lib/content/faq.ts), ein freigegebenes
 *   Teamprofil oder -zitat, die Stammdaten (lib/content/company.ts, REGION.milestone) oder die gemessenen Orte. Eigene
 *   Wörter sind nur Beschriftungen (Etiketten, Überschriften, Linktexte), ohne Zahl und ohne Zusage.
 * - Gehälter nur aus `job.salary` der live Stellen; Zahlen nur aus den Quellen (Test: jede Zahl der Seite steht dort).
 * - Keine Arbeitszeit-Uhrzeiten, kein „pünktlich …“, keine Wochenstunden (B28): Es gilt nur flexibleHours.
 * - Nicht verwendet, solange offen: payFirstWorkday (A3), takeoverGuarantee (A1), privateCarOnePercent (A2).
 *   Tankkarte (B8) und iPad (B9) stehen nur mit den Stellen, zu denen sie gehören. Kein „Werkstatt“ (B31).
 */
import { WHATSAPP_GREETING } from '@/lib/apply/whatsapp-message';
import { COMPANY } from '@/lib/content/company';
import { FACTS, isFactActive, type FactId } from '@/lib/content/facts';
import { getFaqItem, type FaqId } from '@/lib/content/faq';
import { DISCRETION_PROMISE, getProcessSteps, type ProcessStep } from '@/lib/content/process';
import { REGION } from '@/lib/content/region';
import { TEAM_PROFILES, getReleasedQuote, type TeamMemberId, type TeamQuote } from '@/lib/content/team';
import { employmentLabel, formatNumber, formatSalaryAmount, jobPath } from '@/lib/jobs/format';
import type { Job, JobId } from '@/lib/jobs/registry';
import { EINSATZGEBIET_PATH, getPublishedPlaces } from '@/lib/places/registry';
import { fitDescription } from '@/lib/seo/descriptions';

import { ARBEITEN_PATH, THEMEN_UEBERSICHT_LINK, getThema, getThemen, themaPath, type ThemaIcon, type ThemaId } from './registry';

// ─── Bausteine ──────────────────────────────────────────────────────────────

/** Geschütztes Leerzeichen (U+00A0), als Escape, damit es beim Bearbeiten nicht zum normalen Leerzeichen wird. */
const NBSP = '\u00A0';

/** Herkunft eines Satzes: `art:id`. */
export type Quelle =
  | `fakt:${FactId}`
  | `stelle:${JobId}`
  | `faq:${FaqId}`
  | `ablauf:${ProcessStep['id'] | 'zusage'}`
  | `team:${TeamMemberId}`
  | 'betrieb:stammdaten'
  | 'betrieb:meilenstein'
  | 'orte:veroeffentlicht';

/** Ein Satz (oder zwei) mit Aussage, immer mit Quelle. */
export interface Satz {
  text: string;
  quellen: readonly Quelle[];
}

export interface PageMeta {
  /** 30–60 Zeichen. */
  title: string;
  /** 110–155 Zeichen (fitDescription). */
  description: string;
  h1: string;
  primaryKeyword: string;
}

/** Maß im Seitenkopf, gleiche Form wie SeitenkopfMass. */
export interface Mass {
  wert: string;
  name: string;
}

export interface Weg {
  href: string;
  label: string;
}

/** Zeichen der Kästchen (components/icons). */
export type KastenIcon =
  | ThemaIcon
  | 'calendar-off'
  | 'uhr'
  | 'standort'
  | 'file-check'
  | 'graduation-cap'
  | 'servicefahrzeug'
  | 'tablet-smartphone'
  | 'message-circle'
  | 'check'
  | 'radius'
  | 'phone';

/** Etiketten-Kästchen mit Satz (Bänder auf Navy): Titel im Kästchen, Satz darunter. */
export interface Kasten {
  titel: string;
  /** Satz unter dem Kästchen; null, wenn die Quelle keinen weiteren Satz hat. */
  text: string | null;
  icon: KastenIcon;
  quellen: readonly Quelle[];
}

/** Abschnittskopf: Etikett (Versalien), h2, optional ein Lead. */
export interface Kopfzeile {
  id: string;
  etikett: string;
  heading: string;
  lead?: Satz;
}

/** Karte eines Themas (Hub und „Weitere Themen“): Name als Link, ein belegter Satz, ein Kennwert. */
export interface ThemaKarte {
  id: ThemaId;
  href: string;
  name: string;
  icon: ThemaIcon;
  satz: Satz;
  wert?: string;
  wertName?: string;
  /** Kennwert mit Einheit für den Verteiler im Kopf des Hubs („5 Marken“, „seit 1926“). */
  kurz?: string;
  /** Kennwert als Klammer im Fließtext (llms-full.txt): „gegründet 1926“, „3.600–5.600 € pro Monat für Fachkräfte“. */
  klammer?: string;
}

/** Was jede Seite hat: Metadaten, Kopf, Kontakt, weitere Themen. */
export interface SeitenBasis {
  path: string;
  meta: PageMeta;
  etikett: string;
  /** Zeilen der Unterzeile an der Rohrklammer. */
  unterzeile: readonly string[];
  einleitung: readonly Satz[];
  masse: readonly Mass[];
  zweitweg: Weg;
  /** Vorbereitete WhatsApp-Nachricht (an COMPANY.whatsapp). */
  whatsapp: string;
  kontakt: { kopf: Kopfzeile; text: string };
  /** Karten der übrigen Themen (Hub: alle). */
  weitere: { kopf: Kopfzeile; karten: readonly ThemaKarte[]; hub?: Weg };
  /** Teilen-Bild: Wert und Name im Heizkreis, zwei kurze Zeilen an der Rohrklammer (≤ 30 Zeichen). */
  og: { wert: string; name: string; zeilen: readonly string[] };
}

const satz = (text: string, ...quellen: Quelle[]): Satz => ({ text, quellen });
const fq = (id: FactId): Quelle => `fakt:${id}`;
const sq = (job: Pick<Job, 'id'>): Quelle => `stelle:${job.id}`;

/** „A“, „A und B“, „A, B und C“. */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;
}

const ZAHLWORT = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];

/** Zahlwort bis zwölf (DIN 5008: kleine Zahlen im Fließtext ausgeschrieben), sonst Ziffern. */
export function zahlwort(n: number): string {
  return ZAHLWORT[n] ?? String(n);
}

const lowerFirst = (text: string) => text.charAt(0).toLocaleLowerCase('de-DE') + text.slice(1);
const ohnePunkt = (text: string) => text.replace(/\.$/, '');
/** Geschütztes Leerzeichen nach einer Zahl (DIN 5008: „35 km“, „15 Mitarbeiter“ brechen nicht um). */
export const geschuetzt = (text: string) => text.replace(/(\d) /g, `$1${NBSP}`);
/** Normale Leerzeichen für Title und Description (SERP, OG, JSON-LD). */
const plain = (text: string) => text.replace(/\u00A0/g, ' ');

/**
 * Sätze eines Texts: Schnitt nach Punkt, Fragezeichen oder Ausrufezeichen, wenn ein Großbuchstabe folgt. Abkürzungen
 * vor Zahlen („Siegmund-Hiepe-Str. 20“) und kleingeschriebene Fortsetzungen bleiben im Satz.
 */
export function saetze(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„])/).filter(Boolean);
}

/** Erster Satz eines Texts, der zum Muster passt; wirft, wenn die Quelle ihn nicht (mehr) hat. */
function satzMit(text: string, muster: RegExp, wo: string): string {
  const treffer = saetze(text).find((s) => muster.test(s));
  if (!treffer) throw new Error(`lib/themen: Satz ${muster} fehlt in ${wo}`);
  return treffer;
}

function plainMeta(meta: PageMeta): PageMeta {
  return { title: plain(meta.title), description: plain(meta.description), h1: plain(meta.h1), primaryKeyword: plain(meta.primaryKeyword) };
}

/** Ein Fakt darf auf den Themenseiten stehen: bestätigt (nicht pending) und am Stichtag gültig. */
export function faktErlaubt(id: FactId, now: Date): boolean {
  return !FACTS[id].pending && isFactActive(id, now);
}

function erlaubt(id: FactId, now: Date): FactId {
  if (!faktErlaubt(id, now)) throw new Error(`lib/themen: Fakt ${id} ist offen oder abgelaufen`);
  return id;
}

/**
 * Fakten ohne eigenen Satz (der lange Text ist nur die Kurzform mit Punkt) tragen den Satz eines belegten
 * Begleitfakts, wie die Zusage „Flexible Arbeitszeiten“ auf der Startseite (ZUSAGEN): „Keine unbezahlten
 * Überstunden.“ Keine neue Aussage, nur die Paarung der Startseite.
 */
const BEGLEITER: Readonly<Partial<Record<FactId, FactId>>> = Object.freeze({ flexibleHours: 'noUnpaidOvertime' });

const FAKT_ICON: Readonly<Partial<Record<FactId, KastenIcon>>> = Object.freeze({
  aboveTariff: 'banknote',
  vacation30: 'calendar-off',
  flexibleHours: 'uhr',
  noUnpaidOvertime: 'check',
  noWeekendOnCall: 'calendar-off',
  noFarAssembly: 'standort',
  radius35: 'radius',
  permanentContract: 'file-check',
  paidCertifications: 'graduation-cap',
  measurementTools: 'waermepumpe',
  mentoring: 'users',
  travelAllowance: 'servicefahrzeug',
  driversLicenseGrant: 'servicefahrzeug',
  azubiPay: 'banknote',
  noCvNeeded: 'check',
  apply60s: 'check',
  quickResponse: 'phone',
  discretion: 'shield-check',
});

/** Kästchen eines Fakts: Kurzform als Titel, der lange Satz (oder der des Begleitfakts) darunter. */
export function faktKasten(id: FactId, now: Date): Kasten {
  erlaubt(id, now);
  const fact = FACTS[id];
  const eigen = fact.long !== `${fact.short}.` ? fact.long : null;
  const begleiter = eigen ? undefined : BEGLEITER[id];
  const text = eigen ?? (begleiter && faktErlaubt(begleiter, now) ? FACTS[begleiter].long : null);
  return {
    titel: fact.short,
    text,
    icon: FAKT_ICON[id] ?? 'check',
    quellen: begleiter && text ? [fq(id), fq(begleiter)] : [fq(id)],
  };
}

// ─── Stellen ────────────────────────────────────────────────────────────────

export interface TextOptions {
  /** Die Stellen, die gerade live sind (Seiten und Sitemap rechnen stündlich neu). */
  jobs: readonly Job[];
  /** Stichtag für Fakten mit `validUntil` (anniversary100). */
  now?: Date;
}

const istAusbildung = (job: Pick<Job, 'employment'>) => job.employment.kind === 'ausbildung';

/** „Gehalt pro Monat“ bzw. „Vergütung pro Monat“ (wie SalaryCard). */
export function gehaltName(job: Pick<Job, 'employment'>): string {
  return `${istAusbildung(job) ? 'Vergütung' : 'Gehalt'} pro Monat`;
}

/** Live Stellen mit Monatsgehalt. */
function mitGehalt(jobs: readonly Job[]): Job[] {
  return jobs.filter((job) => job.salary?.unit === 'MONTH');
}

/** Spanne der Fachkraft-Stellen: „3.600–5.600 €“ (geschützt vor €); null ohne Fachkraft-Stelle mit Gehalt. */
export function fachkraftSpanne(jobs: readonly Job[]): string | null {
  const salaries = mitGehalt(jobs)
    .filter((job) => !istAusbildung(job))
    .map((job) => job.salary!);
  if (salaries.length === 0) return null;
  const min = Math.min(...salaries.map((s) => s.min));
  const max = Math.max(...salaries.map((s) => s.max));
  return `${formatNumber(min)}–${formatNumber(max)}${NBSP}€`;
}

/** „Ausbildung zum Anlagenmechaniker SHK (m/w/d)“ → „Ausbildung zum Anlagenmechaniker SHK“. */
const ohneGenderTag = (title: string) => title.replace(/\s*\(m\/w\/d\)\s*$/, '');

export interface StellenVerweis {
  jobId: JobId;
  href: string;
  /** Kurztitel wie im Fuß und in den Stellenlisten (ein Ankertext, ein Ziel). */
  titel: string;
  titleShy: string;
}

function verweis(job: Job): StellenVerweis {
  return { jobId: job.id, href: jobPath(job), titel: job.shortTitle, titleShy: job.titleShy };
}

// ─── Kontakt und weitere Themen ─────────────────────────────────────────────

/** Ende der WhatsApp-Nachricht je Seite (nach „Guten Tag Herr Demir,“). */
const WHATSAPP_ANLIEGEN: Readonly<Record<ThemaId | 'hub', string>> = Object.freeze({
  hub: 'ich habe eine Frage zur Arbeit bei Bad und Energie',
  gehalt: 'ich habe eine Frage zum Gehalt bei Bad und Energie',
  'fahrzeug-und-werkzeug': 'ich habe eine Frage zu Fahrzeug und Werkzeug bei Bad und Energie',
  waermepumpen: 'ich interessiere mich für die Arbeit an Wärmepumpen bei Bad und Energie',
  betrieb: 'ich möchte Bad und Energie als Arbeitgeber kennenlernen',
  'diskret-wechseln': 'ich bin noch angestellt und möchte mich diskret bei Bad und Energie bewerben',
});

/** Vorbereitete WhatsApp-Nachricht der Seite. */
export function whatsappNachricht(id: ThemaId | 'hub'): string {
  return `${WHATSAPP_GREETING} ${WHATSAPP_ANLIEGEN[id]}.`;
}

const KONTAKT_TITEL: Readonly<Record<ThemaId | 'hub', string>> = Object.freeze({
  hub: 'Direkt fragen',
  gehalt: 'Fragen zum Gehalt',
  'fahrzeug-und-werkzeug': 'Fragen zur Ausstattung',
  waermepumpen: 'Fragen zu Wärmepumpen',
  betrieb: 'Den Betrieb kennenlernen',
  'diskret-wechseln': 'Erst einmal fragen',
});

function kontakt(id: ThemaId | 'hub'): SeitenBasis['kontakt'] {
  return {
    kopf: { id: 'kontakt', etikett: 'Kontakt', heading: KONTAKT_TITEL[id] },
    // Wie die Ortsseiten: Der Text sagt, was in der vorbereiteten Nachricht steht; die Nachricht selbst steht im Link.
    text: `Lieber erst fragen? In der WhatsApp-Nachricht steht schon „${WHATSAPP_ANLIEGEN[id]}“.`,
  };
}

/** Kennwert der Hilti-Ausstattung aus dem Fakt hilti („Hilti-22-V-Akku-Flotte“ → „22 V“). */
function hiltiVolt(): string {
  const m = /Hilti-(\d+)-V-Akku/.exec(FACTS.hilti.long);
  if (!m) throw new Error('lib/themen: Fakt hilti nennt keine Volt-Zahl mehr');
  return `${m[1]}${NBSP}V`;
}

/** Erster Satz von REGION.milestone („2026 sind wir … umgezogen …“), zweiter („Als Wärmepumpen-Spezialist …“). */
function meilensteinSaetze(): [string, string] {
  const [umzug, spezialist] = saetze(REGION.milestone.text);
  if (!umzug || !spezialist) throw new Error('lib/themen: REGION.milestone hat nicht mehr zwei Sätze');
  return [umzug, spezialist];
}

/** Karte eines Themas: Satz und Kennwert aus Fakten bzw. Stellen. */
export function themaKarte(id: ThemaId, { jobs, now = new Date() }: TextOptions): ThemaKarte {
  const thema = getThema(id);
  const basis = { id, href: themaPath(thema), name: thema.name, icon: thema.icon };
  switch (id) {
    case 'gehalt': {
      const spanne = fachkraftSpanne(jobs);
      const alleMitGehalt = jobs.length > 0 && jobs.every((job) => job.salary);
      return {
        ...basis,
        satz: alleMitGehalt
          ? satz(
              `${FACTS[erlaubt('aboveTariff', now)].long} Jede offene Stelle nennt ihr Gehalt als Spanne pro Monat.`,
              fq('aboveTariff'),
              ...jobs.map(sq),
            )
          : satz(FACTS[erlaubt('aboveTariff', now)].long, fq('aboveTariff')),
        ...(spanne ? { wert: spanne, wertName: 'Gehalt pro Monat, Fachkräfte', kurz: spanne, klammer: `${spanne} pro Monat für Fachkräfte` } : {}),
      };
    }
    case 'fahrzeug-und-werkzeug': {
      // Das Fahrzeug nur mit den Stellen, zu denen es gehört (B7); die Hilti-Ausstattung gilt für alle
      const fahrzeug = fahrzeugZeile(jobs, now);
      return {
        ...basis,
        satz: fahrzeug
          ? satz(`${FACTS[erlaubt('hilti', now)].short}. ${fahrzeug.text}`, fq('hilti'), fq('vehicle'), ...fahrzeug.stellen.map(sq))
          : satz(FACTS[erlaubt('hilti', now)].long, fq('hilti')),
        wert: hiltiVolt(),
        wertName: 'Hilti-Akku-Flotte',
        kurz: hiltiVolt(),
        klammer: `Hilti-Akku-Flotte mit ${hiltiVolt()}`,
      };
    }
    case 'waermepumpen': {
      const marken = FACTS[erlaubt('heatPumpBrands', now)].list?.length ?? 0;
      return {
        ...basis,
        satz: satz(FACTS[erlaubt('paidCertifications', now)].long, fq('paidCertifications')),
        wert: String(marken),
        wertName: 'Marken',
        kurz: `${marken}${NBSP}Marken`,
        klammer: `${marken}${NBSP}Marken`,
      };
    }
    case 'betrieb':
      return {
        ...basis,
        satz: satz(FACTS[erlaubt('familyTeam', now)].long, fq('familyTeam')),
        wert: FACTS[erlaubt('founded1926', now)].value ?? String(COMPANY.foundingYear),
        wertName: FACTS.founded1926.label ?? 'Gegründet',
        kurz: `seit ${COMPANY.foundingYear}`,
        klammer: `gegründet ${COMPANY.foundingYear}`,
      };
    case 'diskret-wechseln':
      return {
        ...basis,
        satz: satz(`${DISCRETION_PROMISE} ${FACTS[erlaubt('noCvNeeded', now)].long}`, 'ablauf:zusage', fq('noCvNeeded')),
        wert: `${FACTS[erlaubt('apply60s', now)].value}${NBSP}${FACTS.apply60s.label}`,
        wertName: 'Bewerbung',
        kurz: `${FACTS.apply60s.value}${NBSP}${FACTS.apply60s.label}`,
        klammer: `Bewerbung in ${FACTS.apply60s.value}${NBSP}${FACTS.apply60s.label}`,
      };
  }
}

/** „Weitere Themen“ einer Themenseite: die übrigen vier, dazu der Weg zum Hub. */
function weitere(aktuell: ThemaId, options: TextOptions): SeitenBasis['weitere'] {
  return {
    kopf: { id: 'weitere', etikett: 'Arbeiten bei uns', heading: 'Weitere Themen' },
    karten: getThemen()
      .filter((thema) => thema.id !== aktuell)
      .map((thema) => themaKarte(thema.id, options)),
    hub: { ...THEMEN_UEBERSICHT_LINK },
  };
}

function masseAus(...ids: FactId[]): Mass[] {
  return ids.map((id) => ({ wert: geschuetzt(FACTS[id].value ?? ''), name: FACTS[id].label ?? FACTS[id].short }));
}

// ─── Hub /arbeiten-bei-uns ──────────────────────────────────────────────────

export interface ArbeitenPageText extends SeitenBasis {
  themen: { kopf: Kopfzeile; karten: readonly ThemaKarte[] };
  zusagen: { kopf: Kopfzeile; kaesten: readonly Kasten[] };
  stellen: { kopf: Kopfzeile } | null;
}

export function getArbeitenPageText(options: TextOptions): ArbeitenPageText {
  const { jobs, now = new Date() } = options;
  const themen = getThemen();
  const spanne = fachkraftSpanne(jobs);
  const marken = FACTS.heatPumpBrands.list?.length ?? 0;
  const gesamt = getThemen().map((thema) => themaKarte(thema.id, options));

  return {
    path: ARBEITEN_PATH,
    meta: plainMeta({
      title: 'Arbeiten bei Bad und Energie: SHK-Arbeitgeber in Wetzlar',
      h1: 'Arbeiten bei Bad und Energie',
      primaryKeyword: 'Arbeiten bei Bad und Energie',
      description: fitDescription(
        ...([
          spanne
            ? `Gehalt ${spanne} im Monat, Servicefahrzeug, Hilti-Ausstattung, Wärmepumpen von ${marken} Marken und ein diskreter Wechsel: Arbeiten bei uns in Wetzlar.`
            : null,
          `Gehalt, Servicefahrzeug, Hilti-Ausstattung, Wärmepumpen von ${marken} Marken und ein diskreter Wechsel: Arbeiten bei Bad und Energie in Wetzlar.`,
        ].filter((d): d is string => d !== null) as [string, ...string[]]),
      ),
    }),
    etikett: `Seit ${COMPANY.foundingYear} · ${COMPANY.address.city}`,
    unterzeile: ['Was wir zahlen, womit du arbeitest', 'und wie du zu uns wechselst.'],
    einleitung: [
      satz(`${FACTS[erlaubt('founded1926', now)].long} ${FACTS[erlaubt('employees15', now)].long}`, fq('founded1926'), fq('employees15')),
      satz(`${FACTS[erlaubt('radius35', now)].long} ${FACTS[erlaubt('directLine', now)].long}`, fq('radius35'), fq('directLine')),
    ],
    masse: [
      ...masseAus(erlaubt('employees15', now), erlaubt('vacation30', now)),
      { wert: geschuetzt(FACTS[erlaubt('radius35', now)].value ?? ''), name: 'Einsatzradius' },
    ],
    zweitweg: { href: '#themen', label: `Alle ${zahlwort(themen.length)} Themen ansehen` },
    whatsapp: whatsappNachricht('hub'),
    kontakt: kontakt('hub'),
    og: { wert: String(COMPANY.foundingYear), name: 'Gegründet in Wetzlar', zeilen: ['Gehalt, Fahrzeug, Werkzeug.', `${FACTS.vacation30.short}.`] },
    themen: {
      kopf: {
        id: 'themen',
        etikett: 'Themen',
        heading: 'Die Themen im Überblick',
        lead: satz(
          'Je Thema eine eigene Seite: mit den Gehältern und Paketen aus den Stellenanzeigen, den Partnern des Betriebs und dem Ablauf deines Wechsels.',
          ...jobs.map(sq),
          fq('partners5'),
          'ablauf:bewerben',
        ),
      },
      karten: gesamt,
    },
    zusagen: {
      kopf: { id: 'zusagen', etikett: 'Zusagen', heading: 'Unsere Zusagen' },
      kaesten: (['flexibleHours', 'vacation30', 'noWeekendOnCall', 'noFarAssembly'] as const).map((id) => faktKasten(id, now)),
    },
    stellen:
      jobs.length > 0
        ? {
            kopf: {
              id: 'stellen',
              etikett: 'Stellen',
              heading: 'Offene Stellen',
              lead: satz(
                jobs.length === 1
                  ? 'Offen ist eine Stelle, mit Gehalt bzw. Vergütung.'
                  : `Offen sind ${zahlwort(jobs.length)} Stellen, jede mit Gehalt bzw. Vergütung.`,
                ...jobs.map(sq),
              ),
            },
          }
        : null,
    weitere: { kopf: { id: 'weitere', etikett: 'Themen', heading: 'Die Themen im Überblick' }, karten: gesamt },
  };
}

// ─── Gehalt ─────────────────────────────────────────────────────────────────

/** Eine Zeile der Gehaltsleiter (Zeichnung im Kopf): Spanne einer Stelle auf der gemeinsamen Skala. */
export interface LeiterZeile {
  jobId: JobId;
  name: string;
  min: number;
  max: number;
  /** „3.600–4.600 €“ */
  betrag: string;
  einheit: string;
}

export interface Gehaltsleiter {
  zeilen: readonly LeiterZeile[];
  /** Skala in Euro: volle Tausender um alle Spannen. */
  von: number;
  bis: number;
  schritte: readonly number[];
}

export interface SpannenKarte extends StellenVerweis {
  betrag: string;
  einheit: string;
  anstellung: string;
  /** Abschluss und Berufserfahrung, wie in der Stellenanzeige. */
  voraussetzung: readonly string[];
  /** Paketzeile „Vergütung“ der Stelle. */
  verguetung: string | null;
}

export interface GehaltPageText extends SeitenBasis {
  leiter: Gehaltsleiter | null;
  spannen: { kopf: Kopfzeile; karten: readonly SpannenKarte[] };
  dazu: { kopf: Kopfzeile; kaesten: readonly Kasten[] };
  ausbildung: { kopf: Kopfzeile; saetze: readonly Satz[]; kaesten: readonly Kasten[] } | null;
}

export function gehaltsleiter(jobs: readonly Job[]): Gehaltsleiter | null {
  const zeilen = mitGehalt(jobs)
    .map(
      (job): LeiterZeile => ({
        jobId: job.id,
        name: job.shortTitle,
        min: job.salary!.min,
        max: job.salary!.max,
        betrag: formatSalaryAmount(job)!,
        einheit: gehaltName(job),
      }),
    )
    .sort((a, b) => a.min - b.min || a.max - b.max);
  if (zeilen.length === 0) return null;
  const von = Math.floor(Math.min(...zeilen.map((z) => z.min)) / 1000) * 1000;
  const bis = Math.ceil(Math.max(...zeilen.map((z) => z.max)) / 1000) * 1000;
  const schritte = Array.from({ length: (bis - von) / 1000 + 1 }, (_, i) => von + i * 1000);
  return { zeilen, von, bis, schritte };
}

function spannenKarte(job: Job): SpannenKarte {
  const erfahrung = job.requirements.find((r) => /Berufserfahrung/.test(r));
  return {
    ...verweis(job),
    betrag: formatSalaryAmount(job)!,
    einheit: gehaltName(job),
    anstellung: employmentLabel(job),
    voraussetzung: [job.education?.label, erfahrung].filter((t): t is string => Boolean(t)),
    verguetung: job.packageExtras.find((extra) => extra.label === 'Vergütung')?.text ?? null,
  };
}

export function getGehaltPageText(options: TextOptions): GehaltPageText {
  const { jobs, now = new Date() } = options;
  const gehalt = mitGehalt(jobs);
  const spanne = fachkraftSpanne(jobs);
  const azubi = gehalt.find(istAusbildung);
  const azubiBetrag = azubi ? formatSalaryAmount(azubi) : null;
  const tarif = FACTS[erlaubt('aboveTariff', now)];
  const urlaub = FACTS[erlaubt('vacation30', now)];
  const alleMitGehalt = jobs.length > 0 && gehalt.length === jobs.length;

  const einleitung: Satz[] = [];
  if (alleMitGehalt) {
    einleitung.push(
      satz(
        jobs.length === 1
          ? 'Die offene Stelle nennt ihr Gehalt als Spanne pro Monat.'
          : `Jede der ${zahlwort(jobs.length)} offenen Stellen nennt ihr Gehalt als Spanne pro Monat.`,
        ...jobs.map(sq),
      ),
    );
  }
  if (azubi && azubiBetrag) einleitung.push(satz(`In der Ausbildung sind es ${azubiBetrag} Vergütung im Monat.`, sq(azubi)));
  if (einleitung.length === 0) einleitung.push(satz(tarif.long, fq('aboveTariff')));

  const dauer = azubi ? employmentLabel(azubi).split(' · ')[1] : undefined;

  return {
    path: themaPath(getThema('gehalt')),
    meta: plainMeta({
      title: spanne ? `Gehalt bei Bad und Energie: ${spanne} im Monat` : 'Gehalt und Vergütung bei Bad und Energie in Wetzlar',
      h1: 'Was du bei uns verdienst',
      primaryKeyword: 'Gehalt SHK Wetzlar',
      description: fitDescription(
        ...([
          spanne && azubiBetrag
            ? `Gehalt für Fachkräfte ${spanne} im Monat, Ausbildung ${azubiBetrag}. ${tarif.short}, ${urlaub.short}.`
            : null,
          spanne ? `Gehalt für Fachkräfte ${spanne} im Monat, offen genannt für jede Stelle. ${tarif.short}, ${urlaub.short}.` : null,
          `Gehalt und Vergütung bei Bad und Energie in Wetzlar: ${tarif.short}, ${urlaub.short}, ${lowerFirst(FACTS.noUnpaidOvertime.short)}.`,
        ].filter((d): d is string => d !== null) as [string, ...string[]]),
      ),
    }),
    etikett: `Gehalt · ${COMPANY.address.city}`,
    // „Fachkräfte:“ davor: Die Ausbildung liegt darunter (Kritik 2, P2-5); ihre Vergütung nennt die Einleitung
    unterzeile: spanne ? [`Fachkräfte: ${spanne} im Monat.`, `${tarif.short}.`] : [`${tarif.short}.`],
    einleitung,
    masse: [
      ...(gehalt.length > 0 ? [{ wert: String(gehalt.length), name: gehalt.length === 1 ? 'Stelle mit Gehalt' : 'Stellen mit Gehalt' }] : []),
      ...masseAus('vacation30'),
    ],
    zweitweg: gehalt.length > 0 ? { href: '#spannen', label: 'Spannen je Stelle ansehen' } : { href: '#dazu', label: 'Was dazukommt' },
    whatsapp: whatsappNachricht('gehalt'),
    kontakt: kontakt('gehalt'),
    og: {
      ...(spanne ? { wert: spanne, name: 'Gehalt pro Monat, Fachkräfte' } : { wert: urlaub.value ?? '', name: urlaub.label ?? '' }),
      zeilen: ['Gehalt je Stelle.', `${urlaub.short}.`],
    },
    leiter: gehaltsleiter(jobs),
    spannen: {
      kopf: {
        id: 'spannen',
        etikett: 'Je Stelle',
        heading: 'Die Spannen je Stelle',
        lead: satz('Gehalt, Anstellung und Voraussetzung, wie sie in den Stellenanzeigen stehen.', ...gehalt.map(sq)),
      },
      karten: gehalt.map(spannenKarte),
    },
    dazu: {
      kopf: { id: 'dazu', etikett: 'Zum Gehalt', heading: 'Was dazukommt' },
      kaesten: (['aboveTariff', 'vacation30', 'flexibleHours', 'permanentContract'] as const).map((id) => faktKasten(id, now)),
    },
    ausbildung:
      azubi && azubiBetrag
        ? {
            kopf: { id: 'ausbildung', etikett: 'Ausbildung', heading: 'Vergütung in der Ausbildung' },
            saetze: [
              satz(
                `${dauer ? `Die ${ohneGenderTag(azubi.title)} dauert ${dauer}. ` : ''}Die Vergütung liegt bei ${azubiBetrag} im Monat.`,
                sq(azubi),
              ),
              satz(FACTS[erlaubt('azubiPay', now)].long, fq('azubiPay')),
            ],
            kaesten: (['travelAllowance', 'driversLicenseGrant'] as const).map((id) => faktKasten(id, now)),
          }
        : null,
    weitere: weitere('gehalt', options),
  };
}

// ─── Fahrzeug und Werkzeug ──────────────────────────────────────────────────

export interface StueckPosition {
  pos: string;
  etikett: string;
  icon: KastenIcon;
  factId: FactId;
  titel: string;
  text: string;
  /** Nur bei Fakten, die nicht für jede Stelle belegt sind (B8, B9, Ausbildung): die live Stellen, zu denen sie gehören. */
  giltFuer: readonly string[] | null;
  quellen: readonly Quelle[];
}

export interface PaketZeile {
  etikett: string;
  text: string;
  quellen: readonly Quelle[];
}

export interface StellenPaket extends StellenVerweis {
  zeilen: readonly PaketZeile[];
}

export interface FahrzeugPageText extends SeitenBasis {
  stueckliste: { kopf: Kopfzeile; positionen: readonly StueckPosition[] };
  jeStelle: { kopf: Kopfzeile; pakete: readonly StellenPaket[] };
  zitat: TeamQuote | null;
  /** Zeichnung im Kopf: zugänglicher Name und Etiketten-Kästchen am Fahrzeug (aus vehicle, hilti, measurementTools). */
  zeichnung: { titel: string; etiketten: { sortimo: string; hilti: string; mess: string } };
}

/** Positionen der Stückliste in Reihenfolge (Fakt, Etikett, Icon). */
const STUECKLISTE: readonly { id: FactId; etikett: string; icon: KastenIcon }[] = [
  { id: 'vehicle', etikett: 'Fahrzeug', icon: 'servicefahrzeug' },
  { id: 'hilti', etikett: 'Werkzeug', icon: 'werkzeug' },
  { id: 'measurementTools', etikett: 'Messtechnik', icon: 'waermepumpe' },
  { id: 'ipadSmartphone', etikett: 'Digital', icon: 'tablet-smartphone' },
  { id: 'fuelCard', etikett: 'Tankkarte', icon: 'servicefahrzeug' },
  { id: 'workwear', etikett: 'Kleidung', icon: 'check' },
  { id: 'azubiToolkit', etikett: 'Ausbildung', icon: 'werkzeug' },
];

/**
 * Fakten, die nur zu bestimmten Stellen gehören, und woran die Stelle sie nennt: eigener Vorteil (benefitFactIds)
 * oder Paketzeile („Etikett: Text“). Tankkarte nur Kundendienst und Obermonteur (fakten-abgleich B8), iPad nicht für
 * Ausbildung und Quereinstieg (B9), das Azubi-Werkzeugset nur in der Ausbildung. Das Servicefahrzeug nur bei Stellen
 * mit eigener Paketzeile „Fahrzeug“: Ob die Privatnutzung für jede Rolle gilt, ist offen (B7), und die Ausbildung
 * nennt kein Fahrzeug (Kritik 2, P2-4).
 */
const NUR_BEI_STELLEN: Readonly<Partial<Record<FactId, RegExp | null>>> = Object.freeze({
  vehicle: /^Fahrzeug: /,
  fuelCard: /Tankkarte/,
  ipadSmartphone: null,
  azubiToolkit: /Azubi-Werkzeugset/,
});

/** Live Stellen, die einen Fakt selbst nennen (Vorteil oder Paketzeile). */
export function stellenMitFakt(id: FactId, jobs: readonly Job[]): Job[] {
  const merkmal = NUR_BEI_STELLEN[id];
  return jobs.filter(
    (job) =>
      job.benefitFactIds.includes(id) ||
      (merkmal ? job.packageExtras.some((extra) => merkmal.test(`${extra.label}: ${extra.text}`)) : false),
  );
}

/**
 * Das Servicefahrzeug in einer Zeile (Unterzeile der Fahrzeugseite, Karte im Hub): „Servicefahrzeug mit
 * Privatnutzung.“ nur, wenn jede live Stelle es nennt; sonst „… je nach Stelle.“; ohne Stelle mit Fahrzeug nichts.
 */
function fahrzeugZeile(jobs: readonly Job[], now: Date): { text: string; stellen: Job[] } | null {
  const fahrzeug = FACTS[erlaubt('vehicle', now)];
  const stellen = stellenMitFakt('vehicle', jobs);
  if (stellen.length === 0) return null;
  return { text: stellen.length === jobs.length ? `${fahrzeug.short}.` : `${fahrzeug.short} je nach Stelle.`, stellen };
}

/** Paketzeilen, die Ausstattung betreffen (Vergütung steht auf der Gehaltsseite). */
const AUSSTATTUNG_ZEILEN = ['Fahrzeug', 'Werkzeug', 'Mobilität', 'Ausstattung'] as const;

/** Vorteile der Stelle, die Ausstattung betreffen, mit Etikett (bestätigt; pending nie, auch nicht je Stelle). */
const AUSSTATTUNG_FAKTEN: readonly { id: FactId; etikett: string }[] = [
  { id: 'vehicle', etikett: 'Fahrzeug' },
  { id: 'fuelCard', etikett: 'Tankkarte' },
  { id: 'hilti', etikett: 'Werkzeug' },
  { id: 'azubiToolkit', etikett: 'Werkzeug' },
  { id: 'ipadSmartphone', etikett: 'Digital' },
  { id: 'workwear', etikett: 'Kleidung' },
];

const ZEILEN_FOLGE = ['Fahrzeug', 'Tankkarte', 'Werkzeug', 'Digital', 'Kleidung', 'Mobilität', 'Ausstattung'];

function stellenPaket(job: Job, now: Date): StellenPaket {
  const zeilen: PaketZeile[] = job.packageExtras
    .filter((extra) => (AUSSTATTUNG_ZEILEN as readonly string[]).includes(extra.label))
    .map((extra) => ({ etikett: extra.label, text: extra.text, quellen: [sq(job)] }));
  for (const { id, etikett } of AUSSTATTUNG_FAKTEN) {
    if (!job.benefitFactIds.includes(id) || !faktErlaubt(id, now)) continue;
    if (zeilen.some((zeile) => zeile.etikett === etikett)) continue;
    const fact = FACTS[id];
    zeilen.push({ etikett, text: fact.short === etikett ? fact.long : fact.short, quellen: [sq(job), fq(id)] });
  }
  zeilen.sort((a, b) => ZEILEN_FOLGE.indexOf(a.etikett) - ZEILEN_FOLGE.indexOf(b.etikett));
  return { ...verweis(job), zeilen };
}

export function getFahrzeugPageText(options: TextOptions): FahrzeugPageText {
  const { jobs, now = new Date() } = options;
  const start = getProcessSteps('fachkraft')[2];
  const ersterTag = satzMit(start.text, /^Am ersten Tag/, 'Ablauf Schritt 3');
  const volt = hiltiVolt();

  const positionen: StueckPosition[] = [];
  for (const { id, etikett, icon } of STUECKLISTE) {
    if (!faktErlaubt(id, now)) continue;
    const nurBei = id in NUR_BEI_STELLEN;
    const stellen = nurBei ? stellenMitFakt(id, jobs) : [];
    if (nurBei && stellen.length === 0) continue;
    positionen.push({
      pos: String(positionen.length + 1).padStart(2, '0'),
      etikett,
      icon,
      factId: id,
      titel: FACTS[id].short,
      text: FACTS[id].long,
      giltFuer: nurBei ? stellen.map((job) => job.shortTitle) : null,
      quellen: [fq(id), ...stellen.map(sq)],
    });
  }

  const pakete = jobs.map((job) => stellenPaket(job, now)).filter((paket) => paket.zeilen.length > 0);
  const zitat = getReleasedQuote('becker') ?? null;
  const fahrzeug = FACTS[erlaubt('vehicle', now)];
  const hilti = FACTS[erlaubt('hilti', now)];
  const sortimo = /Sortimo-Ausbau/.exec(fahrzeug.long)?.[0];
  if (!sortimo) throw new Error('lib/themen: Fakt vehicle nennt den Sortimo-Ausbau nicht mehr');
  const fahrzeugZeileText = fahrzeugZeile(jobs, now);
  const fahrzeugText = fahrzeugZeileText?.text ?? null;
  // Description: „Servicefahrzeug je nach Stelle“, wenn nicht jede Stelle eines hat (B7); sonst die Kurzform des Fakts
  const fahrzeugKurz =
    fahrzeugZeileText && fahrzeugZeileText.stellen.length === jobs.length ? fahrzeug.short : 'Servicefahrzeug je nach Stelle';

  return {
    path: themaPath(getThema('fahrzeug-und-werkzeug')),
    meta: plainMeta({
      title: 'Servicefahrzeug und Hilti-Werkzeug: deine Ausstattung',
      h1: 'Womit du bei uns arbeitest',
      primaryKeyword: 'SHK Job mit Firmenwagen Wetzlar',
      description: fitDescription(
        `${fahrzeugKurz}, persönliche Hilti-${volt.replace(NBSP, '-')}-Akku-Flotte, Messtechnik für Wärmepumpen, ${FACTS.workwear.short}. Was zu welcher Stelle gehört.`,
        `${fahrzeugKurz}, ${lowerFirst(hilti.short)}, Messtechnik für Wärmepumpen, ${FACTS.workwear.short}. Was zu welcher Stelle gehört.`,
      ),
    }),
    etikett: 'Fahrzeug · Werkzeug · Digital',
    unterzeile: [`${hilti.short}.`, ...(fahrzeugText ? [fahrzeugText] : [])],
    // Der Hilti-Satz steht in der Stückliste (Position 02), nicht noch einmal wortgleich im Kopf (Kritik 2, P3)
    einleitung: [satz(ersterTag, `ablauf:${start.id}`), satz(satzMit(hilti.long, /^Kein Leihen/, 'Fakt hilti'), fq('hilti'))],
    masse: [{ wert: volt, name: 'Hilti-Akku-Flotte' }],
    zweitweg: { href: '#stueckliste', label: 'Zur Stückliste' },
    whatsapp: whatsappNachricht('fahrzeug-und-werkzeug'),
    kontakt: kontakt('fahrzeug-und-werkzeug'),
    og: { wert: volt, name: 'Hilti-Akku-Flotte', zeilen: [`${hilti.short}.`, satzMit(hilti.long, /^Kein Leihen/, 'Fakt hilti')] },
    stueckliste: { kopf: { id: 'stueckliste', etikett: 'Stückliste', heading: 'Deine Ausstattung' }, positionen },
    jeStelle: {
      kopf: {
        id: 'je-stelle',
        etikett: 'Je Stelle',
        heading: 'Was zu welcher Stelle gehört',
        lead: satz('Fahrzeug, Werkzeug und Mobilität, wie sie in den Stellenanzeigen stehen.', ...pakete.map((p) => `stelle:${p.jobId}` as Quelle)),
      },
      pakete,
    },
    zitat,
    zeichnung: {
      titel: `Transporter mit offener Schiebetür: dahinter der ${sortimo} mit Koffern und Kleinteilekästen, unten der Hilti-Koffer, auf dem Dachträger ein Rohrpaar.`,
      etiketten: { sortimo, hilti: `Hilti ${volt}`, mess: FACTS[erlaubt('measurementTools', now)].short.replace(/^Moderne /, '') },
    },
    weitere: weitere('fahrzeug-und-werkzeug', options),
  };
}

// ─── Wärmepumpen ────────────────────────────────────────────────────────────

export interface Partnersaeule {
  name: string;
  zusatz: string | null;
}

/** „NIBE Effizienzpartner (Berechtigung …)“ → Name und Klammerzusatz (wie die Partner-Säulen der Startseite). */
export function partnerSaeulen(list: readonly string[] = FACTS.partners5.list ?? []): Partnersaeule[] {
  return list.map((eintrag) => {
    const m = eintrag.match(/^(.*?)\s*\((.*)\)\s*$/);
    return m ? { name: m[1], zusatz: m[2] } : { name: eintrag, zusatz: null };
  });
}

export interface WpStelle extends StellenVerweis {
  /** Satz der Stellen-Einleitung mit „Wärmepumpe“ (Wortlaut der Anzeige), sonst null. */
  einleitung: string | null;
  aufgaben: readonly string[];
  betrag: string | null;
  einheit: string;
}

export interface WaermepumpenPageText extends SeitenBasis {
  marken: { kopf: Kopfzeile; namen: readonly string[]; partner: readonly Partnersaeule[] };
  arbeit: { kopf: Kopfzeile; stellen: readonly WpStelle[]; schluss: Satz };
  lernen: { kopf: Kopfzeile; kaesten: readonly Kasten[] };
}

const WP = /Wärmepumpe/;

export function getWaermepumpenPageText(options: TextOptions): WaermepumpenPageText {
  const { jobs, now = new Date() } = options;
  const marken = FACTS[erlaubt('heatPumpBrands', now)];
  const namen = marken.list ?? [];
  const partner = partnerSaeulen(FACTS[erlaubt('partners5', now)].list).filter((saeule) => namen.some((n) => saeule.name.includes(n)));
  const stellen: WpStelle[] = jobs
    .map((job) => ({ job, aufgaben: job.tasks.filter((task) => WP.test(task)) }))
    .filter(({ aufgaben }) => aufgaben.length > 0)
    .map(({ job, aufgaben }) => ({
      ...verweis(job),
      einleitung: saetze(job.intro).find((s) => WP.test(s)) ?? null,
      aufgaben,
      betrag: formatSalaryAmount(job),
      einheit: gehaltName(job),
    }));
  const [, spezialist] = meilensteinSaetze();
  const am = jobs.find((job) => job.category === 'anlagenmechaniker');
  const einstieg = am?.requirements.find((r) => /Wärmepumpen\?/.test(r));
  const schulung = FACTS[erlaubt('paidCertifications', now)];
  const heizsysteme = getFaqItem('heizsysteme');
  const taetigkeiten = joinList(
    ['Montage', 'Inbetriebnahme', 'Wartung'].filter((wort) => stellen.some((s) => s.aufgaben.some((a) => a.includes(wort)))),
  );

  return {
    path: themaPath(getThema('waermepumpen')),
    meta: plainMeta({
      title: `Wärmepumpen-Jobs in Wetzlar: ${namen.length} Marken, bezahlte Schulungen`,
      h1: 'Wärmepumpen-Jobs in Wetzlar',
      primaryKeyword: 'Wärmepumpe Job Wetzlar',
      description: fitDescription(
        ...([
          taetigkeiten
            ? `Wärmepumpen von ${marken.short}: ${taetigkeiten}, dazu ${lowerFirst(schulung.short)} und moderne Messtechnik.`
            : null,
          `Wärmepumpen von ${marken.short}: ${lowerFirst(schulung.short)}, moderne Messtechnik und Lernen von Meistern in Wetzlar.`,
        ].filter((d): d is string => d !== null) as [string, ...string[]]),
      ),
    }),
    etikett: `Wärmepumpen · ${namen.length}${NBSP}Marken`,
    unterzeile: [`${marken.short}.`, `${schulung.short}.`],
    einleitung: [
      satz(spezialist, 'betrieb:meilenstein'),
      ...(am && einstieg ? [satz(einstieg, sq(am))] : []),
    ],
    masse: [
      { wert: String(namen.length), name: 'Marken' },
      ...(stellen.length > 0 ? [{ wert: String(stellen.length), name: stellen.length === 1 ? 'Stelle an Wärmepumpen' : 'Stellen an Wärmepumpen' }] : []),
    ],
    zweitweg: { href: '#marken', label: `Zu den ${zahlwort(namen.length)} Marken` },
    whatsapp: whatsappNachricht('waermepumpen'),
    kontakt: kontakt('waermepumpen'),
    og: { wert: `${namen.length}${NBSP}Marken`, name: 'Wärmepumpen', zeilen: [`${namen.length} Marken, zertifiziert.`, `${schulung.short}.`] },
    marken: {
      kopf: { id: 'marken', etikett: 'Partner', heading: `Die ${zahlwort(namen.length)} Marken`, lead: satz(marken.long, fq('heatPumpBrands')) },
      namen,
      partner,
    },
    arbeit: {
      kopf: {
        id: 'arbeit',
        etikett: 'Je Stelle',
        heading: 'Was du an Wärmepumpen machst',
        ...(stellen.length > 0 ? { lead: satz('Die Aufgaben mit Wärmepumpen, wie sie in den Stellenanzeigen stehen.', ...stellen.map((s) => `stelle:${s.jobId}` as Quelle)) } : {}),
      },
      stellen,
      schluss: satz(heizsysteme.answer, 'faq:heizsysteme'),
    },
    lernen: {
      kopf: { id: 'lernen', etikett: 'Lernen', heading: 'Schulung, Messtechnik, Meister' },
      kaesten: (['paidCertifications', 'measurementTools', 'mentoring'] as const).map((id) => faktKasten(id, now)),
    },
    weitere: weitere('waermepumpen', options),
  };
}

// ─── Der Betrieb ────────────────────────────────────────────────────────────

export interface Person {
  id: TeamMemberId;
  name: string;
  rolle: string;
  seit: string | null;
  initialen: string;
}

export interface BetriebPageText extends SeitenBasis {
  zeitkette: { von: string; bis: string; spanne: string; vonName: string; bisName: string };
  team: { kopf: Kopfzeile; saetze: readonly Satz[]; personenTitel: string; personen: readonly Person[]; steckbrief: readonly { label: string; wert: string }[] };
  partner: { kopf: Kopfzeile; saeulen: readonly Partnersaeule[] };
  einsatz: { kopf: Kopfzeile; saetze: readonly Satz[]; orte: Satz; link: Weg };
  /** Freigegebene Stimme aus dem Team (lib/content/team.ts); null, solange keine freigegeben ist. */
  zitat: TeamQuote | null;
}

/** Wie llms.txt: bis Ende des Jubiläumsjahrs „100 Jahre Meisterbetrieb (1926–2026)“, danach „Meisterbetrieb seit 1926“. */
export function betriebsClaim(now: Date): string {
  return isFactActive('anniversary100', now) ? FACTS.anniversary100.short : FACTS.founded1926.short;
}

export function getBetriebPageText(options: TextOptions): BetriebPageText {
  const { now = new Date() } = options;
  const gegruendet = String(COMPANY.foundingYear);
  const [umzug] = meilensteinSaetze();
  const leute = FACTS[erlaubt('employees15', now)];
  const draht = FACTS[erlaubt('directLine', now)];
  const saeulen = FACTS[erlaubt('partners5', now)];
  const radius = FACTS[erlaubt('radius35', now)];
  const personen: Person[] = Object.values(TEAM_PROFILES).map((profil) => ({
    id: profil.id,
    name: profil.name,
    rolle: profil.role,
    seit: profil.experience ?? null,
    initialen: profil.initials,
  }));
  const orte = getPublishedPlaces().length;

  return {
    path: themaPath(getThema('betrieb')),
    meta: plainMeta({
      title: `Meisterbetrieb in Wetzlar seit ${gegruendet}: Team und Partner`,
      h1: `Seit ${gegruendet} in ${COMPANY.address.city}`,
      primaryKeyword: 'SHK Meisterbetrieb Wetzlar',
      description: fitDescription(
        `${ohnePunkt(FACTS[erlaubt('founded1926', now)].long)}: ${leute.value} Leute, ${saeulen.value} ${saeulen.label}, Baustellen im Umkreis von ${radius.value}. ${draht.short}.`,
        `${ohnePunkt(FACTS.founded1926.long)}: ${leute.value} Leute, ${saeulen.value} ${saeulen.label}, Einsatzgebiet ${radius.value}.`,
      ),
    }),
    etikett: betriebsClaim(now),
    unterzeile: [`${leute.value}${NBSP}Leute. Ein${NBSP}Meisterbetrieb.`, `${draht.short}.`],
    einleitung: [satz(FACTS.founded1926.long, fq('founded1926')), satz(umzug, 'betrieb:meilenstein')],
    masse: masseAus('employees15', 'partners5'),
    zweitweg: { href: '#team', label: 'Das Team kennenlernen' },
    whatsapp: whatsappNachricht('betrieb'),
    kontakt: kontakt('betrieb'),
    og: { wert: gegruendet, name: 'Gegründet in Wetzlar', zeilen: [`${leute.value} Leute.`, 'Ein Meisterbetrieb.'] },
    zeitkette: {
      von: gegruendet,
      bis: String(REGION.milestone.year),
      spanne: `${REGION.milestone.year - COMPANY.foundingYear}${NBSP}Jahre`,
      vonName: `Gegründet in ${COMPANY.address.city}`,
      bisName: 'Neuer Firmensitz',
    },
    team: {
      kopf: { id: 'team', etikett: 'Team', heading: 'Wer bei uns arbeitet' },
      saetze: [
        satz(leute.long, fq('employees15')),
        satz(FACTS[erlaubt('familyTeam', now)].long, fq('familyTeam')),
        satz(draht.long, fq('directLine')),
      ],
      personenTitel: `${zahlwort(personen.length).replace(/^./, (c) => c.toUpperCase())} von ${leute.value} im Team`,
      personen,
      steckbrief: [
        { label: FACTS.founded1926.label ?? 'Gegründet', wert: gegruendet },
        // Das Etikett nennt die Art, der Wert nur den Namen („Handwerkskammer: Wiesbaden“, nicht doppelt)
        { label: 'Handwerkskammer', wert: COMPANY.hwk.replace(/^Handwerkskammer\s+/, '') },
        { label: 'Innung', wert: COMPANY.innung.replace(/^Innung\s+/, '') },
        { label: 'Handelsregister', wert: COMPANY.register.full },
        { label: 'Firmensitz', wert: `${COMPANY.address.street}, ${COMPANY.address.postalCode} ${COMPANY.address.city}` },
      ],
    },
    partner: {
      kopf: { id: 'partner', etikett: 'Partner', heading: `${saeulen.value}${NBSP}${saeulen.label}` },
      saeulen: partnerSaeulen(saeulen.list),
    },
    einsatz: {
      kopf: { id: 'einsatz', etikett: 'Einsatz', heading: 'Wo wir arbeiten' },
      saetze: [
        satz(radius.long, fq('radius35')),
        satz(FACTS[erlaubt('noFarAssembly', now)].long, fq('noFarAssembly')),
        satz(FACTS[erlaubt('noWeekendOnCall', now)].long, fq('noWeekendOnCall')),
        satz(FACTS[erlaubt('countyPartner', now)].long, fq('countyPartner')),
      ],
      orte: satz(`${orte} Orte im Einsatzgebiet haben eine eigene Seite mit gemessener Strecke und Fahrzeit.`, 'orte:veroeffentlicht'),
      link: { href: EINSATZGEBIET_PATH, label: 'Alle Orte im Einsatzgebiet' },
    },
    zitat: getReleasedQuote('weber') ?? null,
    weitere: weitere('betrieb', options),
  };
}

// ─── Diskret wechseln ───────────────────────────────────────────────────────

export interface DiskretPageText extends SeitenBasis {
  /** Zeichnung im Kopf: zugänglicher Name und Etiketten-Kästchen. */
  zeichnung: { titel: string; etiketten: { du: string; arbeitgeber: string; ziel: string } };
  ablauf: { kopf: Kopfzeile };
  brauchst: { kopf: Kopfzeile; kaesten: readonly Kasten[] };
  stellen: { kopf: Kopfzeile } | null;
  fragen: { kopf: Kopfzeile; saetze: readonly Satz[]; datenschutz: { vor: string; link: Weg } };
}

/** Abschnitt „Bewerbung über diese Website“ der Datenschutzhinweise; Ankertext wie im Fuß (RECHTS_LINKS). */
export const DATENSCHUTZ_BEWERBENDE: Weg = Object.freeze({ href: '/datenschutz#bewerberdaten', label: 'Datenschutz für Bewerbende' });

export function getDiskretPageText(options: TextOptions): DiskretPageText {
  const { jobs, now = new Date() } = options;
  const steps = getProcessSteps('fachkraft');
  const bewerben = steps[0];
  const diskret = FACTS[erlaubt('discretion', now)];
  const ohneLebenslauf = FACTS[erlaubt('noCvNeeded', now)];
  const schnell = FACTS[erlaubt('apply60s', now)];
  const [vertraulich] = DISCRETION_PROMISE.split(':');
  const kontaktSatz = satzMit(diskret.long, /kontaktieren/, 'Fakt discretion');
  const fristen = satzMit(getFaqItem('diskreter-wechsel').answer, /Kündigungsfrist/, 'FAQ diskreter-wechsel');
  const kaffee = satzMit(getFaqItem('lebenslauf').answer, /Kaffee/, 'FAQ lebenslauf');

  return {
    path: themaPath(getThema('diskret-wechseln')),
    meta: plainMeta({
      title: 'Diskret den Job wechseln: SHK-Bewerbung ohne Lebenslauf',
      h1: 'Diskret wechseln',
      primaryKeyword: 'SHK Job wechseln diskret',
      description: fitDescription(
        `${kontaktSatz} Bewerbung in ${schnell.value} Sekunden, ${lowerFirst(ohneLebenslauf.short)}, Kennenlernen in ${COMPANY.address.city}.`,
        `${kontaktSatz} Bewerbung in ${schnell.value} Sekunden, ${lowerFirst(ohneLebenslauf.short)}.`,
      ),
    }),
    etikett: `Wechsel · ${diskret.short}`,
    unterzeile: [`${vertraulich}.`, `${ohneLebenslauf.short}.`],
    einleitung: [satz(diskret.long, fq('discretion'))],
    masse: [
      { wert: schnell.value ?? '', name: `${schnell.label ?? ''} Bewerbung` },
      { wert: String(steps.length), name: 'Schritte' },
    ],
    zweitweg: { href: '#ablauf', label: 'So läuft der Wechsel' },
    whatsapp: whatsappNachricht('diskret-wechseln'),
    kontakt: kontakt('diskret-wechseln'),
    og: { wert: diskret.short.replace(/ diskret$/, '').replace(' ', NBSP), name: 'diskret', zeilen: [`${diskret.short}.`, `${ohneLebenslauf.short}.`] },
    zeichnung: {
      titel: `Vorlauf und Rücklauf führen von dir bis zum Firmensitz in ${COMPANY.address.city}. Der Abzweig zu deinem derzeitigen Arbeitgeber endet an einem Blindflansch und bleibt geschlossen.`,
      etiketten: { du: 'Du', arbeitgeber: 'Dein Arbeitgeber', ziel: COMPANY.address.city },
    },
    ablauf: { kopf: { id: 'ablauf', etikett: 'Ablauf', heading: 'In 3 Schritten zu deinem neuen Job' } },
    brauchst: {
      kopf: { id: 'brauchst', etikett: 'Erster Schritt', heading: 'Was du brauchst' },
      // Ohne „Bewerbung in 60 Sekunden“: Die Dauer steht schon im Kopf (Maß und Hinweis am Knopf) und im Ablauf
      // (Kritik 2, P3: fünfmal „60 Sekunden“ auf einer Seite)
      kaesten: [
        faktKasten('noCvNeeded', now),
        { titel: 'WhatsApp', text: `Oder schreib ${COMPANY.managingDirector.name} direkt: ${COMPANY.whatsapp.display}.`, icon: 'message-circle', quellen: [`ablauf:${bewerben.id}`, 'betrieb:stammdaten'] },
        faktKasten('quickResponse', now),
      ],
    },
    stellen:
      jobs.length > 0
        ? {
            kopf: {
              id: 'stellen',
              etikett: 'Stellen',
              heading: 'Wohin du wechseln kannst',
              lead: satz(
                jobs.length === 1
                  ? 'Offen ist eine Stelle, mit Gehalt bzw. Vergütung.'
                  : `Offen sind ${zahlwort(jobs.length)} Stellen, jede mit Gehalt bzw. Vergütung.`,
                ...jobs.map(sq),
              ),
            },
          }
        : null,
    fragen: {
      // Den unbefristeten Vertrag nennt der Ablauf (Schritt 3) direkt darüber; hier nicht noch einmal (Kritik 2, P3)
      kopf: { id: 'fragen', etikett: 'Wechsel', heading: 'Kündigungsfrist und Daten' },
      saetze: [satz(fristen, 'faq:diskreter-wechsel'), satz(kaffee, 'faq:lebenslauf')],
      datenschutz: { vor: 'Wie wir deine Angaben für die Bewerbung verarbeiten, steht unter', link: DATENSCHUTZ_BEWERBENDE },
    },
    weitere: weitere('diskret-wechseln', options),
  };
}

// ─── Alle Seiten ────────────────────────────────────────────────────────────

export type ThemaPageText =
  | ({ id: 'gehalt' } & GehaltPageText)
  | ({ id: 'fahrzeug-und-werkzeug' } & FahrzeugPageText)
  | ({ id: 'waermepumpen' } & WaermepumpenPageText)
  | ({ id: 'betrieb' } & BetriebPageText)
  | ({ id: 'diskret-wechseln' } & DiskretPageText);

export function getThemaPageText(id: ThemaId, options: TextOptions): ThemaPageText {
  switch (id) {
    case 'gehalt':
      return { id, ...getGehaltPageText(options) };
    case 'fahrzeug-und-werkzeug':
      return { id, ...getFahrzeugPageText(options) };
    case 'waermepumpen':
      return { id, ...getWaermepumpenPageText(options) };
    case 'betrieb':
      return { id, ...getBetriebPageText(options) };
    case 'diskret-wechseln':
      return { id, ...getDiskretPageText(options) };
  }
}

/** Jeder Text einer Seite (alle Zeichenketten im Modell), für Tests: Verbotsliste, Zahlen, Wortzahl. */
export function alleTexte(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(alleTexte);
  if (value && typeof value === 'object') return Object.values(value).flatMap(alleTexte);
  return [];
}

/** Alle Quellen einer Seite (für Tests). */
export function alleQuellen(value: unknown): Quelle[] {
  if (Array.isArray(value)) return value.flatMap(alleQuellen);
  if (value && typeof value === 'object') {
    const own = 'quellen' in value && Array.isArray((value as Satz).quellen) ? [...(value as Satz).quellen] : [];
    return [...own, ...Object.entries(value).filter(([key]) => key !== 'quellen').flatMap(([, child]) => alleQuellen(child))];
  }
  return [];
}
