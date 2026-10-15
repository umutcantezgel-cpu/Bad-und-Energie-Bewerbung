/**
 * Texte der Themenseiten (E-028): Hub /arbeiten-bei-uns und sechs Themen (seit E-031 mit „Büro und Verwaltung“). Reines
 * Modul ohne JSX, geprüft in lib/themen/__tests__/themen.test.ts.
 *
 * Regeln (ROADMAP §1, fakten-abgleich):
 * - Jeder Satz mit Aussage ist ein `Satz` mit Quelle: ein Fakt aus lib/content/facts.ts (per ID, nur bestätigt und
 *   gültig, nie `pending`), eine Stelle aus dem Registry (Bezahlung, Paket, Aufgaben, Voraussetzungen; nur live), der
 *   Ablauf und die Diskretionszusage (lib/content/process.ts), eine FAQ-Antwort (lib/content/faq.ts), ein freigegebenes
 *   Teamprofil oder -zitat, die Stammdaten (lib/content/company.ts, REGION.milestone) oder die gemessenen Orte. Eigene
 *   Wörter sind nur Beschriftungen (Etiketten, Überschriften, Linktexte), ohne Zahl und ohne Zusage.
 * - Kein Betrag (E-030): Zur Bezahlung steht „Lohn auf Anfrage“ (Fakt payOnRequest) mit den belegten Fakten ohne Zahl;
 *   das Schülerpraktikum sagt nichts zu Geld. Zahlen nur aus den Quellen (Test: jede Zahl der Seite steht dort).
 * - Keine Arbeitszeit-Uhrzeiten, kein „pünktlich …“, keine Wochenstunden (B28): Es gilt nur flexibleHours.
 * - Nicht verwendet, solange offen: payFirstWorkday (A3), takeoverGuarantee (A1), privateCarOnePercent (A2).
 *   Tankkarte (B8) und iPad (B9) stehen nur mit den Stellen, zu denen sie gehören. Kein „Werkstatt“ (B31).
 */
import { WHATSAPP_GREETING } from '@/lib/apply/whatsapp-message';
import { COMPANY } from '@/lib/content/company';
import { FACTS, JE_NACH_STELLE, fuehrendeStellen, isFactActive, offenBei, type FactId } from '@/lib/content/facts';
import { JOB_FAQ_IDS, getFaqItem, type FaqId } from '@/lib/content/faq';
import { DISCRETION_PROMISE, FUER_FACHKRAEFTE, getProcessSteps, sammelAblauf, type ProcessStep } from '@/lib/content/process';
import { REGION } from '@/lib/content/region';
import { TEAM_PROFILES, getReleasedQuote, type TeamMemberId, type TeamQuote } from '@/lib/content/team';
import { employmentLabel, jobPath, payLabel } from '@/lib/jobs/format';
import type { Job, JobId } from '@/lib/jobs/registry';
import { EINSATZGEBIET_PATH, getPublishedPlaces } from '@/lib/places/registry';
import { fitDescription } from '@/lib/seo/descriptions';
import { BUERO_MASSE, BUERO_SCHRIFTFELD } from '@/lib/zeichnung/buero/masse';
import type { BueroSzenenArt } from '@/lib/zeichnung/buero/szenen';

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
  | 'phone'
  | 'kalender'
  | 'beleg'
  | 'paket'
  | 'brief';

/** Etiketten-Kästchen mit Satz (Bänder auf Navy): Titel im Kästchen, Satz darunter. */
export interface Kasten {
  titel: string;
  /** Satz unter dem Kästchen; null, wenn die Quelle keinen weiteren Satz hat. */
  text: string | null;
  icon: KastenIcon;
  quellen: readonly Quelle[];
  /**
   * Nur bei Fakten, die nicht für jede gezeigte Stelle belegt sind (Fakt `offenFuer`, z. B. Urlaub im Büro): die live
   * Stellen, zu denen sie gehören.
   */
  giltFuer?: readonly string[];
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
  /** Kennwert als Klammer im Fließtext (llms-full.txt): „gegründet 1926“, „Lohn auf Anfrage“. */
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
  /**
   * Teilen-Bild: Wert und Name als Maß, zwei kurze Zeilen (≤ 30 Zeichen); `zeichnung` im Navy-Panel (Standard der
   * Hausschnitt, die Seite „Büro und Verwaltung“ die Leitstelle).
   */
  og: { wert: string; name: string; zeilen: readonly string[]; zeichnung?: 'haus' | 'buero' };
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
const upperFirst = (text: string) => text.charAt(0).toLocaleUpperCase('de-DE') + text.slice(1);
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
  payOnRequest: 'banknote',
  directLine: 'phone',
  employees15: 'users',
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

/** Live Stellen, die etwas zur Bezahlung sagen („Lohn auf Anfrage“); das Schülerpraktikum nicht (E-030). */
export function mitLohn(jobs: readonly Job[]): Job[] {
  return jobs.filter((job) => payLabel(job) !== null);
}

/** „Offen ist eine Stelle.“ bzw. „Offen sind acht Stellen.“ (Zahl gezählt, nicht abgeschrieben). */
function offeneStellen(jobs: readonly Job[]): Satz {
  return satz(jobs.length === 1 ? 'Offen ist eine Stelle.' : `Offen sind ${zahlwort(jobs.length)} Stellen.`, ...jobs.map(sq));
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
  gehalt: 'ich habe eine Frage zum Lohn bei Bad und Energie',
  'fahrzeug-und-werkzeug': 'ich habe eine Frage zu Fahrzeug und Werkzeug bei Bad und Energie',
  waermepumpen: 'ich interessiere mich für die Arbeit an Wärmepumpen bei Bad und Energie',
  betrieb: 'ich möchte Bad und Energie als Arbeitgeber kennenlernen',
  'diskret-wechseln': 'ich bin noch angestellt und möchte mich diskret bei Bad und Energie bewerben',
  'buero-und-verwaltung': 'ich interessiere mich für die Arbeit im Büro bei Bad und Energie',
});

/** Vorbereitete WhatsApp-Nachricht der Seite. */
export function whatsappNachricht(id: ThemaId | 'hub'): string {
  return `${WHATSAPP_GREETING} ${WHATSAPP_ANLIEGEN[id]}.`;
}

const KONTAKT_TITEL: Readonly<Record<ThemaId | 'hub', string>> = Object.freeze({
  hub: 'Direkt fragen',
  gehalt: 'Fragen zum Lohn',
  'fahrzeug-und-werkzeug': 'Fragen zur Ausstattung',
  waermepumpen: 'Fragen zu Wärmepumpen',
  betrieb: 'Den Betrieb kennenlernen',
  'diskret-wechseln': 'Erst einmal fragen',
  'buero-und-verwaltung': 'Fragen zum Büro',
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
      // E-030: kein Betrag; der Kennwert ist die Aussage selbst („Lohn auf Anfrage“). Der Tarif „je nach Stelle“,
      // solange er für eine gezeigte Stelle offen ist (Büro, S5; Sammelfläche, Prüfung E-029, Runde 2)
      const lohn = FACTS[erlaubt('payOnRequest', now)];
      const tarif = FACTS[erlaubt('aboveTariff', now)].long;
      return {
        ...basis,
        satz: satz(`${lohn.long} ${offenBei('aboveTariff', jobs).length > 0 ? jeNachStelleSatz(tarif) : tarif}`, fq('payOnRequest'), fq('aboveTariff')),
        wert: 'auf Anfrage',
        wertName: 'Lohn',
        kurz: lohn.short,
        klammer: lohn.short,
      };
    }
    case 'fahrzeug-und-werkzeug': {
      // Das Fahrzeug nur mit den Stellen, zu denen es gehört (B7). Werkzeug und Fahrzeug gehören nicht zu jeder Stelle
      // (Büro, Schülerpraktikum: keine Ausstattung in der Anzeige; E-031): dann beginnt der Satz mit „Je nach Stelle“
      const fahrzeug = fahrzeugZeile(jobs, now);
      const hilti = FACTS[erlaubt('hilti', now)];
      const einschraenkung = ohneAusstattung(jobs, now).length > 0;
      return {
        ...basis,
        satz:
          fahrzeug && einschraenkung
            ? satz(jeNachStelleSatz(`${hilti.short} und ${FACTS.vehicle.short}.`), fq('hilti'), fq('vehicle'), ...fahrzeug.stellen.map(sq))
            : fahrzeug
              ? satz(`${hilti.short}. ${fahrzeug.text}`, fq('hilti'), fq('vehicle'), ...fahrzeug.stellen.map(sq))
              : satz(einschraenkung ? jeNachStelleSatz(hilti.long) : hilti.long, fq('hilti')),
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
    case 'buero-und-verwaltung': {
      // Die Bürostelle nennt Umfang und Aufgaben (fakten-abgleich S5); ohne live Bürostelle der Satz zum Büro aus
      // REGION.milestone, ohne Kennwert
      const stelle = bueroStelle(jobs);
      if (!stelle) return { ...basis, satz: satz(meilensteinSaetze()[0], 'betrieb:meilenstein') };
      const umfang = employmentLabel(stelle);
      return { ...basis, satz: satz(stelle.summary, sq(stelle)), wert: umfang, wertName: 'Anstellung', kurz: umfang, klammer: umfang };
    }
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

/**
 * Sammelflächen (Prüfung E-029, Runde 2): Ein Fakt, der nicht für jede gezeigte Stelle gilt, steht mit „je nach
 * Stelle“, wie in der Description der Seite „Bezahlung und Extras“. Satz: „Je nach Stelle: …“; Kurzform und Maß:
 * „… je nach Stelle“.
 */
function jeNachStelleSatz(text: string): string {
  return `${upperFirst(JE_NACH_STELLE)}: ${text}`;
}

function jeNachStelleKurz(text: string): string {
  return `${text} ${JE_NACH_STELLE}`;
}

/** Maß eines Fakts, mit „je nach Stelle“ am Namen, wenn er nicht für jede gezeigte Stelle gilt. */
function massAus(id: FactId, jeStelle: boolean): Mass {
  const [mass] = masseAus(id);
  return jeStelle ? { ...mass, name: jeNachStelleKurz(mass.name) } : mass;
}

/**
 * Kästchen einer Zusage auf einer Sammelfläche: Ist der Fakt für eine gezeigte Stelle offen (offenBei), steht darunter,
 * zu welchen Stellen er gehört (die ihn nennen), wie bei „Was dazukommt“.
 */
function zusageKasten(id: FactId, jobs: readonly Job[], now: Date): Kasten {
  const kasten = faktKasten(id, now);
  if (offenBei(id, jobs).length === 0) return kasten;
  const mit = stellenMitZusatz(id, jobs);
  return { ...kasten, giltFuer: mit.map((job) => job.shortTitle), quellen: [...kasten.quellen, ...mit.map(sq)] };
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
  const marken = FACTS.heatPumpBrands.list?.length ?? 0;
  const gesamt = getThemen().map((thema) => themaKarte(thema.id, options));
  const einschraenkung = ohneAusstattung(jobs, now).length > 0;
  const ausstattung = einschraenkung ? `Servicefahrzeug und Hilti ${JE_NACH_STELLE}` : 'Servicefahrzeug, Hilti-Ausstattung';

  return {
    path: ARBEITEN_PATH,
    meta: plainMeta({
      title: 'Arbeiten bei Bad und Energie: SHK-Arbeitgeber in Wetzlar',
      h1: 'Arbeiten bei Bad und Energie',
      primaryKeyword: 'Arbeiten bei Bad und Energie',
      // Alle sechs Themen; Fahrzeug und Werkzeug mit Einschränkung, solange eine Stelle ohne Ausstattung live ist (Büro,
      // Schülerpraktikum; wie die Karte „Fahrzeug und Werkzeug“, Prüfung E-031 D1-5)
      description: fitDescription(
        `${FACTS.payOnRequest.short}, ${ausstattung}, Wärmepumpen von ${marken} Marken, Arbeit im Büro, diskreter Wechsel: Arbeiten bei Bad und Energie in Wetzlar.`,
        `${FACTS.payOnRequest.short}, ${ausstattung}, Wärmepumpen von ${marken} Marken, Arbeit im Büro, diskreter Wechsel: Arbeiten bei uns in Wetzlar.`,
      ),
    }),
    etikett: `Seit ${COMPANY.foundingYear} · ${COMPANY.address.city}`,
    unterzeile: ['Wie wir bezahlen, womit du arbeitest', 'und wie du zu uns wechselst.'],
    einleitung: [
      satz(`${FACTS[erlaubt('founded1926', now)].long} ${FACTS[erlaubt('employees15', now)].long}`, fq('founded1926'), fq('employees15')),
      satz(`${FACTS[erlaubt('radius35', now)].long} ${FACTS[erlaubt('directLine', now)].long}`, fq('radius35'), fq('directLine')),
    ],
    masse: [
      ...masseAus(erlaubt('employees15', now)),
      massAus(erlaubt('vacation30', now), offenBei('vacation30', jobs).length > 0),
      { wert: geschuetzt(FACTS[erlaubt('radius35', now)].value ?? ''), name: 'Einsatzradius' },
    ],
    zweitweg: { href: '#themen', label: `Alle ${zahlwort(themen.length)} Themen ansehen` },
    whatsapp: whatsappNachricht('hub'),
    kontakt: kontakt('hub'),
    og: {
      wert: String(COMPANY.foundingYear),
      name: 'Gegründet in Wetzlar',
      zeilen: [
        // Mit einer Stelle ohne Ausstattung nur der Lohn (gilt für jede Stelle); die Zeile fasst keine Einschränkung
        einschraenkung ? `${FACTS.payOnRequest.short}.` : 'Lohn, Fahrzeug, Werkzeug.',
        `${offenBei('vacation30', jobs).length > 0 ? jeNachStelleKurz(FACTS.vacation30.short) : FACTS.vacation30.short}.`,
      ],
    },
    themen: {
      kopf: {
        id: 'themen',
        etikett: 'Themen',
        heading: 'Die Themen im Überblick',
        lead: satz(
          `Je Thema eine eigene Seite: mit Bezahlung und Paketen aus den Stellenanzeigen, den Partnern des Betriebs${bueroStelle(jobs) ? ', der Arbeit im Büro' : ''} und dem Ablauf deines Wechsels.`,
          ...jobs.map(sq),
          fq('partners5'),
          'ablauf:bewerben',
        ),
      },
      karten: gesamt,
    },
    zusagen: {
      kopf: { id: 'zusagen', etikett: 'Zusagen', heading: 'Unsere Zusagen' },
      // Offen fürs Büro (S5): flexibleHours und vacation30 mit den Stellen, zu denen sie gehören
      kaesten: (['flexibleHours', 'vacation30', 'noWeekendOnCall', 'noFarAssembly'] as const).map((id) => zusageKasten(id, jobs, now)),
    },
    stellen:
      jobs.length > 0
        ? {
            kopf: { id: 'stellen', etikett: 'Stellen', heading: 'Offene Stellen', lead: offeneStellen(jobs) },
          }
        : null,
    weitere: { kopf: { id: 'weitere', etikett: 'Themen', heading: 'Die Themen im Überblick' }, karten: gesamt },
  };
}

// ─── Bezahlung und Extras (Slug „gehalt“) ───────────────────────────────────

/** Eine Stelle auf der Seite „Bezahlung und Extras“: Anstellung, Voraussetzung und Paketzeile „Vergütung“, kein Betrag. */
export interface LohnKarte extends StellenVerweis {
  anstellung: string;
  /** Abschluss und Berufserfahrung, wie in der Stellenanzeige (leer, solange die Anforderungen offen sind). */
  voraussetzung: readonly string[];
  /** Paketzeile „Vergütung“ der Stelle („über Tarif, plus Prämien“). */
  verguetung: string | null;
}

export interface GehaltPageText extends SeitenBasis {
  /** Zeichnung im Kopf (Plan §A): „Lohn auf Anfrage“ und darunter die belegten Fakten ohne Zahl. */
  lohn: { etikett: string; titel: string; zeilen: readonly string[] };
  jeStelle: { kopf: Kopfzeile; karten: readonly LohnKarte[] };
  dazu: { kopf: Kopfzeile; kaesten: readonly Kasten[] };
  ausbildung: { kopf: Kopfzeile; saetze: readonly Satz[]; kaesten: readonly Kasten[] } | null;
}

function lohnKarte(job: Job): LohnKarte {
  const erfahrung = job.requirements.find((r) => /Berufserfahrung/.test(r));
  return {
    ...verweis(job),
    anstellung: employmentLabel(job),
    voraussetzung: [job.education?.label, erfahrung].filter((t): t is string => Boolean(t)),
    verguetung: job.packageExtras.find((extra) => extra.label === 'Vergütung')?.text ?? null,
  };
}

/**
 * Stellen, die den Zusatz selbst nennen (lib/content/facts.ts fuehrtFakt): als Vorteil, den unbefristeten Vertrag auch
 * über „Unbefristet“. Eine Paketzeile mit ähnlichem Wortlaut zählt nicht: „Ausbildungsvergütung über Tarif, plus
 * Prämien“ oder „Faire, übertarifliche Bezahlung“ sagen weniger als aboveTariff (kein „deutlich“, kein Urlaubs- und
 * Weihnachtsgeld; Prüfung E-029, Runde 3). Sie steht im Wortlaut unter „Extras je Stelle“ (lohnKarte).
 */
export function stellenMitZusatz(id: FactId, jobs: readonly Job[]): Job[] {
  return fuehrendeStellen(id, jobs);
}

/**
 * Kästchen „Was dazukommt“ zu einem Zusatz: Nennen ihn nicht alle gezeigten Stellen (Büro offen, fakten-abgleich S5;
 * kein unbefristeter Vertrag in der Ausbildung), steht darunter, zu welchen er gehört. Ohne Stelle mit dem Zusatz
 * entfällt das Kästchen; ohne live Stelle stehen die Fakten allein.
 */
function zusatzKasten(id: FactId, stellen: readonly Job[], now: Date): Kasten | null {
  const kasten = faktKasten(id, now);
  if (stellen.length === 0) return kasten;
  const mit = stellenMitZusatz(id, stellen);
  if (mit.length === 0) return null;
  if (mit.length === stellen.length) return { ...kasten, quellen: [...kasten.quellen, ...mit.map(sq)] };
  return { ...kasten, giltFuer: mit.map((job) => job.shortTitle), quellen: [...kasten.quellen, ...mit.map(sq)] };
}

/**
 * Seite „Bezahlung und Extras“ (bis E-030 „Gehalt“ mit Spannen je Stelle; Slug und Adresse bleiben): Lohn auf Anfrage
 * bei jeder Stelle, die etwas zur Bezahlung sagt, dazu die Fakten ohne Zahl (über Tarif, Urlaubs- und
 * Weihnachtsgeld, 30 Tage Urlaub) und je Stelle Anstellung, Voraussetzung und Paketzeile „Vergütung“.
 */
export function getGehaltPageText(options: TextOptions): GehaltPageText {
  const { jobs, now = new Date() } = options;
  const lohnStellen = mitLohn(jobs);
  const azubi = lohnStellen.find(istAusbildung);
  const lohn = FACTS[erlaubt('payOnRequest', now)];
  const tarif = FACTS[erlaubt('aboveTariff', now)];
  const urlaub = FACTS[erlaubt('vacation30', now)];
  const dauer = azubi ? employmentLabel(azubi).split(' · ')[1] : undefined;
  // Kopf der Seite (Sammelfläche, Prüfung E-029, Runde 2): Tarif und Urlaub „je nach Stelle“, sobald sie nicht jede
  // gezeigte Stelle nennt (Büro offen, S5), wie die Kästchen „Was dazukommt“ mit „Gehört zu“
  const jeStelle = (id: FactId) => lohnStellen.length > 0 && stellenMitZusatz(id, lohnStellen).length < lohnStellen.length;
  const tarifKurz = jeStelle('aboveTariff') ? jeNachStelleKurz(tarif.short) : tarif.short;
  const urlaubKurz = jeStelle('vacation30') ? jeNachStelleKurz(urlaub.short) : urlaub.short;

  return {
    path: themaPath(getThema('gehalt')),
    meta: plainMeta({
      title: 'Bezahlung und Extras bei Bad und Energie in Wetzlar',
      h1: 'Bezahlung und Extras',
      primaryKeyword: 'Bezahlung SHK Wetzlar',
      // Lohn auf Anfrage gilt für jede Stelle, die Extras je nach Stelle (Büro offen: fakten-abgleich S5)
      description: fitDescription(
        `${lohn.short} bei jeder Stelle, je nach Stelle ${lowerFirst(tarif.short)} und ${urlaub.short}. Bezahlung und Extras in Wetzlar.`,
        `${lohn.short}, je nach Stelle ${lowerFirst(tarif.short)} und ${urlaub.short}. Bezahlung und Extras bei Bad und Energie.`,
      ),
    }),
    etikett: `Bezahlung · ${COMPANY.address.city}`,
    unterzeile: [`${lohn.short}.`, `${jeStelle('aboveTariff') ? jeNachStelleSatz(tarif.short) : tarif.short}.`],
    einleitung: [
      satz(`${lohn.long} ${jeStelle('aboveTariff') ? jeNachStelleSatz(tarif.long) : tarif.long}`, fq('payOnRequest'), fq('aboveTariff')),
    ],
    masse: [massAus('vacation30', jeStelle('vacation30'))],
    zweitweg:
      lohnStellen.length > 0 ? { href: '#je-stelle', label: 'Extras je Stelle ansehen' } : { href: '#dazu', label: 'Was dazukommt' },
    whatsapp: whatsappNachricht('gehalt'),
    kontakt: kontakt('gehalt'),
    og: { wert: 'auf Anfrage', name: 'Lohn', zeilen: [`${urlaub.short} je nach Stelle.`, 'Extras je Stelle.'] },
    lohn: { etikett: 'Bezahlung', titel: lohn.short, zeilen: [tarifKurz, urlaubKurz] },
    jeStelle: {
      kopf: {
        id: 'je-stelle',
        etikett: 'Je Stelle',
        heading: 'Extras je Stelle',
        lead: satz('Anstellung, Voraussetzung und Vergütung, wie sie in den Stellenanzeigen stehen.', ...lohnStellen.map(sq)),
      },
      karten: lohnStellen.map(lohnKarte),
    },
    dazu: {
      kopf: { id: 'dazu', etikett: 'Zum Lohn', heading: 'Was dazukommt' },
      kaesten: (['aboveTariff', 'vacation30', 'flexibleHours', 'permanentContract'] as const)
        .map((id) => zusatzKasten(id, lohnStellen, now))
        .filter((kasten): kasten is Kasten => kasten !== null),
    },
    ausbildung: azubi
      ? {
          kopf: { id: 'ausbildung', etikett: 'Ausbildung', heading: 'Vergütung in der Ausbildung' },
          saetze: [
            satz(`${dauer ? `Die ${ohneGenderTag(azubi.title)} dauert ${dauer}. ` : ''}${lohn.long}`, sq(azubi), fq('payOnRequest')),
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

/** Paketzeilen, die Ausstattung betreffen (Vergütung steht auf der Seite „Bezahlung und Extras“). */
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

/**
 * Live Stellen ohne jede Ausstattung in ihrer Anzeige (keine Paketzeile zu Fahrzeug, Werkzeug, Mobilität oder
 * Ausstattung, kein Vorteil dazu): die Bürofachkraft und das Schülerpraktikum. Gibt es eine, ist „Fahrzeug und
 * Werkzeug“ eine Sammelfläche mit Einschränkung (E-031, Plan §4 W3): Kopf und Karte beginnen mit „Je nach Stelle“.
 */
export function ohneAusstattung(jobs: readonly Job[], now: Date = new Date()): Job[] {
  return jobs.filter((job) => stellenPaket(job, now).zeilen.length === 0);
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
  const einschraenkung = ohneAusstattung(jobs, now).length > 0;
  const fuerFachkraefte = sammelAblauf(jobs).varianten.length > 0;

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
    unterzeile: [`${einschraenkung ? jeNachStelleSatz(hilti.short) : hilti.short}.`, ...(fahrzeugText ? [fahrzeugText] : [])],
    // Der Hilti-Satz steht in der Stückliste (Position 02), nicht noch einmal wortgleich im Kopf (Kritik 2, P3). Der
    // erste Tag ist Schritt 3 der Fachkräfte: auf der Sammelfläche mit „Für Fachkräfte“ wie im Ablauf (sammelAblauf)
    einleitung: [
      satz(fuerFachkraefte ? `${FUER_FACHKRAEFTE}: ${ersterTag}` : ersterTag, `ablauf:${start.id}`),
      satz(satzMit(hilti.long, /^Kein Leihen/, 'Fakt hilti'), fq('hilti')),
    ],
    masse: [{ wert: volt, name: 'Hilti-Akku-Flotte' }],
    zweitweg: { href: '#stueckliste', label: 'Zur Stückliste' },
    whatsapp: whatsappNachricht('fahrzeug-und-werkzeug'),
    kontakt: kontakt('fahrzeug-und-werkzeug'),
    og: {
      wert: volt,
      name: 'Hilti-Akku-Flotte',
      zeilen: einschraenkung ? [hilti.short, `${JE_NACH_STELLE}.`] : [`${hilti.short}.`, satzMit(hilti.long, /^Kein Leihen/, 'Fakt hilti')],
    },
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
      // Beschreibt die Zeichnung 2.0 (components/themen/Servicefahrzeug.tsx): Ausbau hinter der Schiebetür, kein Dachträger
      titel: `Transporter von der Seite, die Schiebetür offen und nach hinten geschoben: dahinter der ${sortimo} mit Regalböden, Koffern und Kleinteilekästen, unten auf dem Ladeboden der Werkzeugkoffer.`,
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
  /** Laufzettel im Kopf (echter Text, kein Bild; components/themen/Absperrung.tsx): die drei Zeilen. */
  zeichnung: { etiketten: { du: string; arbeitgeber: string; ziel: string } };
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
            kopf: { id: 'stellen', etikett: 'Stellen', heading: 'Wohin du wechseln kannst', lead: offeneStellen(jobs) },
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

// ─── Büro und Verwaltung ────────────────────────────────────────────────────

/** Die live Bürostelle (Kategorie `buero`), deren Aufgaben die Seite zeigt; ohne sie bleibt die Seite beim Büro selbst. */
export function bueroStelle(jobs: readonly Job[]): Job | undefined {
  return jobs.find((job) => job.category === 'buero');
}

export type BueroZielId = 'monteure' | 'kundendienst' | 'kunden' | 'lager';

/** Eine Szene der Seite (Zeichnung in lib/zeichnung/buero) mit ihrer Aufgabe. */
export interface BueroSzeneText {
  id: BueroSzenenArt;
  /** Beschriftung (Überschrift der Abbildung), keine Aussage. */
  titel: string;
  icon: KastenIcon;
  /** Die Aufgabe im Wortlaut der Stellenanzeige; null, solange keine Bürostelle live ist. */
  aufgabe: Satz | null;
  /** Zugänglicher Name der Zeichnung: beschreibt genau, was sie zeigt. */
  bild: string;
  /** Wörter an der Zeichnung (je Lage in lib/zeichnung/buero). */
  beschriftungen: Readonly<Record<string, string>>;
  /** Schriftfeld: Format, Norm, Maße (lib/zeichnung/buero/masse.ts). */
  schriftfeld: string;
}

export interface FrageText {
  id: FaqId;
  frage: string;
  antwort: Satz;
}

export interface BueroPageText extends SeitenBasis {
  /** Leitstelle im Kopf (components/themen/buero/Leitstelle.tsx): zugänglicher Name und die vier Ziele. */
  leitstelle: { titel: string; ziele: Readonly<Record<BueroZielId, string>> };
  aufgaben: { kopf: Kopfzeile; szenen: readonly BueroSzeneText[] };
  betrieb: { kopf: Kopfzeile; kaesten: readonly Kasten[] };
  stellen: { kopf: Kopfzeile } | null;
  /** Ablauf der Bürostelle (lib/content/process.ts, Fragenset `buero`); null ohne live Bürostelle. */
  ablauf: { audience: 'buero' } | null;
  fragen: { kopf: Kopfzeile; fragen: readonly FrageText[] };
}

/**
 * Fragen der Themenseite mit live Bürostelle: drei der fünf Fragen der Stellenseite (JOB_FAQ_IDS.buero), damit Themen-
 * und Stellenseite nicht denselben Block tragen (Prüfung E-031, D1-6).
 */
export const BUERO_THEMA_FRAGEN: readonly FaqId[] = Object.freeze(['buero-umfang', 'lohn-buero', 'diskreter-wechsel']);

/** Szenen in der Reihenfolge der Aufgaben; die Aufgabe der Stelle wird am Wortlaut erkannt (wirft, fehlt sie). */
const SZENEN: readonly { id: BueroSzenenArt; titel: string; icon: KastenIcon; aufgabe: RegExp; bild: string; beschriftungen: Readonly<Record<string, string>> }[] = [
  {
    id: 'wochenplan',
    titel: 'Telefon und Termine',
    icon: 'kalender',
    aufgabe: /^Telefon und Terminplanung/,
    bild: 'Plantafel der Woche von Montag bis Freitag mit zwei Bahnen, oben die Monteure, unten der Kundendienst; die Termine stehen als Blöcke in den Tagen, ohne Uhrzeit.',
    beschriftungen: { mo: 'Mo', di: 'Di', mi: 'Mi', do: 'Do', fr: 'Fr' },
  },
  {
    id: 'beleg',
    titel: 'Angebote und Rechnungen',
    icon: 'beleg',
    aufgabe: /^Angebote, Auftragsbestätigungen und Rechnungen/,
    bild: 'Ein Blatt A4 als Geschäftsbrief mit Anschriftfeld, Falz- und Lochmarken und Positionszeilen ohne Beträge; daneben die Schritte Angebot, Auftragsbestätigung und Rechnung, abgehakt bis zur Rechnung.',
    beschriftungen: { angebot: 'Angebot', auftrag: 'Auftragsbestätigung', rechnung: 'Rechnung' },
  },
  {
    id: 'material',
    titel: 'Material und Lieferungen',
    icon: 'paket',
    aufgabe: /^Material beim Großhandel/,
    bild: 'Pakete auf dem Weg vom Großhandel auf die Europalette im Lager und weiter zur Baustelle; über dem Lager der Lieferschein mit Häkchen.',
    beschriftungen: { grosshandel: 'Großhandel', lager: 'Lager', baustelle: 'Baustelle', lieferschein: 'Lieferschein' },
  },
  {
    id: 'ablage',
    titel: 'Verwaltung und Post',
    icon: 'brief',
    aufgabe: /^Allgemeine Verwaltung/,
    bild: `Regal mit Ordnern, Rücken ${BUERO_MASSE.ordner.ruecken.mm} Millimeter; ein Brief im Format DIN lang kommt in die Ablage für die Post, ein Blatt A4 in die Ablage für die Geschäftsführung.`,
    beschriftungen: { post: 'Post', gf: 'Geschäftsführung' },
  },
];

/** Wörter an den vier Szenen, auch über den stillen Dateien im Einblick der Stellenseite (Prüfrunde 1 A1-6). */
export const BUERO_SZENEN_BESCHRIFTUNGEN: Readonly<Record<BueroSzenenArt, Readonly<Record<string, string>>>> = Object.freeze(
  Object.fromEntries(SZENEN.map((szene) => [szene.id, szene.beschriftungen])) as Record<BueroSzenenArt, Readonly<Record<string, string>>>,
);

/** Wörter an den vier Zielen der Leitstelle: Kopf der Themenseite und Kopfbild der Bürofachkraft (Prüfrunde 1 A1-6). */
export const BUERO_LEITSTELLE_ZIELE: Readonly<Record<BueroZielId, string>> = Object.freeze({
  monteure: 'Monteure',
  kundendienst: 'Kundendienst',
  kunden: 'Kunden',
  lager: 'Großhandel und Lager',
});

/** Titel der vier Szenen (Beschriftungen), auch für die stillen Dateien im Einblick der Stellenseite. */
export const BUERO_SZENEN_TITEL: Readonly<Record<BueroSzenenArt, string>> = Object.freeze(
  Object.fromEntries(SZENEN.map((szene) => [szene.id, szene.titel])) as Record<BueroSzenenArt, string>,
);

/** Die Wörter „moderneres Büro, größeres Lager“ aus REGION.milestone (Unterzeile ohne live Bürostelle). */
function bueroLager(): [string, string] {
  const m = /(moderneres Büro), (größeres Lager)/.exec(REGION.milestone.text);
  if (!m) throw new Error('lib/themen: REGION.milestone nennt Büro und Lager nicht mehr');
  return [upperFirst(m[1]), m[2]];
}

/**
 * Seite „Büro und Verwaltung“ (E-031, Paket W3): die Arbeit im Büro aus der Bürostelle (vier Aufgaben, Voll- oder
 * Teilzeit, Lohn auf Anfrage; fakten-abgleich S5), das Büro aus REGION.milestone, der Betrieb aus den Fakten
 * (founded1926, employees15, directLine), Ablauf und Fragen der Stellenart `buero`. Nie für das Büro behauptet, solange
 * offen (offenFuer): flexible Arbeitszeiten, 30 Tage Urlaub, über Tarif, unbefristet; keine Fakten der Baustelle
 * (Fahrzeug, Werkzeug, Radius). Bürozeiten nur im Kontakt (OpeningHoursText, „Büro erreichbar“).
 */
export function getBueroPageText(options: TextOptions): BueroPageText {
  const { jobs, now = new Date() } = options;
  const stelle = bueroStelle(jobs);
  const bueroStellen = jobs.filter((job) => job.category === 'buero');
  const lohn = FACTS[erlaubt('payOnRequest', now)];
  const draht = FACTS[erlaubt('directLine', now)];
  const [umzug] = meilensteinSaetze();
  const [buero, lager] = bueroLager();
  const umfang = stelle ? employmentLabel(stelle) : null;
  const imBuero = stelle ? satzMit(stelle.intro, /^Als Bürofachkraft arbeitest du in unserem Büro/, 'Bürostelle, Einleitung') : null;
  // Höchstens drei der fünf Fragen der Stellenseite (Prüfung E-031, D1-6): Umfang, Lohn und der diskrete Wechsel
  const fragen: readonly FaqId[] = stelle ? BUERO_THEMA_FRAGEN : ['diskreter-wechsel', 'lebenslauf', 'antwortzeit'];

  return {
    path: themaPath(getThema('buero-und-verwaltung')),
    meta: plainMeta({
      title: 'Büro und Verwaltung im SHK-Betrieb in Wetzlar',
      h1: 'Büro und Verwaltung',
      primaryKeyword: 'Büro und Verwaltung SHK-Betrieb Wetzlar',
      // Was nur die Themenseite hat (Prüfung E-031, D1-6): das Büro selbst – der Umzug mit moderneren Räumen
      // (REGION.milestone), der direkte Draht (directLine), der Meisterbetrieb (founded1926) – statt der Aufzählung der
      // Stellenanzeige (Umfang und Lohn stehen auf /jobs/buerofachkraft-wetzlar)
      description: stelle
        ? fitDescription(
            `${buero} seit dem Umzug ${REGION.milestone.year}, ${lowerFirst(draht.short)}: wie Termine, Angebote, Material und Post im ${FACTS[erlaubt('founded1926', now)].short} laufen.`,
            `${buero} seit ${REGION.milestone.year}, ${lowerFirst(draht.short)}: Termine, Angebote, Material und Post im ${FACTS[erlaubt('founded1926', now)].short}.`,
          )
        : fitDescription(`${umzug} ${draht.long}`, `${umzug} ${draht.short}.`),
    }),
    etikett: `Büro · ${COMPANY.address.city}`,
    unterzeile: umfang ? [`${umfang}.`, `${lohn.short}.`] : [`${buero},`, `${lager}.`],
    // Der direkte Draht steht als Kasten unter „Betrieb“, nicht doppelt im Kopf
    einleitung: imBuero && stelle ? [satz(imBuero, sq(stelle)), satz(umzug, 'betrieb:meilenstein')] : [satz(umzug, 'betrieb:meilenstein')],
    masse: masseAus(erlaubt('employees15', now), erlaubt('founded1926', now)),
    zweitweg: { href: '#aufgaben', label: 'Zu den Aufgaben im Büro' },
    whatsapp: whatsappNachricht('buero-und-verwaltung'),
    kontakt: kontakt('buero-und-verwaltung'),
    og: umfang
      ? { wert: umfang, name: 'Büro in Wetzlar', zeilen: ['Büro am Firmensitz.', `${lohn.short}.`], zeichnung: 'buero' }
      : { wert: String(COMPANY.foundingYear), name: 'Gegründet in Wetzlar', zeilen: [`${buero},`, `${lager}.`], zeichnung: 'buero' },
    leitstelle: {
      titel:
        'Schreibtisch im Büro von oben, maßstäblich, mit Bildschirm, zwei Blättern und einem Ordner; Bezugslinien führen zu Sinnbildern für die Monteure, den Kundendienst, die Kunden sowie Großhandel und Lager.',
      ziele: BUERO_LEITSTELLE_ZIELE,
    },
    aufgaben: {
      kopf: {
        id: 'aufgaben',
        etikett: 'Aufgaben',
        heading: stelle ? `Die ${zahlwort(stelle.tasks.length)} Aufgaben im Büro` : 'Die Arbeit im Büro',
        ...(stelle ? { lead: satz(stelle.summary, sq(stelle)) } : {}),
      },
      szenen: SZENEN.map(({ aufgabe, ...szene }) => {
        const wortlaut = stelle?.tasks.find((task) => aufgabe.test(task));
        if (stelle && !wortlaut) throw new Error(`lib/themen: Aufgabe ${aufgabe} fehlt in der Bürostelle`);
        return { ...szene, aufgabe: stelle && wortlaut ? satz(wortlaut, sq(stelle)) : null, schriftfeld: BUERO_SCHRIFTFELD[szene.id] };
      }),
    },
    betrieb: {
      kopf: { id: 'betrieb', etikett: 'Betrieb', heading: 'Kurze Wege im Meisterbetrieb' },
      kaesten: (['payOnRequest', 'directLine', 'employees15', 'founded1926'] as const).map((id) => faktKasten(id, now)),
    },
    stellen:
      bueroStellen.length > 0
        ? { kopf: { id: 'stellen', etikett: 'Stellen', heading: 'Offene Stellen im Büro', lead: offeneStellen(bueroStellen) } }
        : null,
    ablauf: stelle ? { audience: 'buero' } : null,
    fragen: {
      kopf: { id: 'fragen', etikett: 'Fragen', heading: 'Häufige Fragen zum Büro' },
      fragen: fragen.map((id) => {
        const item = getFaqItem(id);
        return { id, frage: item.question, antwort: satz(item.answer, `faq:${id}`) };
      }),
    },
    weitere: weitere('buero-und-verwaltung', options),
  };
}

// ─── Alle Seiten ────────────────────────────────────────────────────────────

export type ThemaPageText =
  | ({ id: 'gehalt' } & GehaltPageText)
  | ({ id: 'fahrzeug-und-werkzeug' } & FahrzeugPageText)
  | ({ id: 'waermepumpen' } & WaermepumpenPageText)
  | ({ id: 'betrieb' } & BetriebPageText)
  | ({ id: 'diskret-wechseln' } & DiskretPageText)
  | ({ id: 'buero-und-verwaltung' } & BueroPageText);

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
    case 'buero-und-verwaltung':
      return { id, ...getBueroPageText(options) };
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
