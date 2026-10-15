import { companyData } from '@/lib/data/company';
import type { JobCategory } from '@/lib/jobs/schema';

/**
 * Fakten-Registry: jede Arbeitgeber-Aussage genau einmal, mit Herkunft.
 * Komponenten, Stellen und Feeds referenzieren nur IDs. Neue Fakten nur mit
 * belegbarer Quelle im Repo; Abweichungen stehen in docs/operations/fakten-abgleich.md.
 */

/**
 * Arbeitsbedingung, die für einzelne Stellenarten nicht belegt ist (offene Frage an den Inhaber): Stellen dieser
 * Kategorien nennen den Fakt nicht (Schema-Regel in lib/jobs/schema.ts), Übersichten wie „Bezahlung und Extras“
 * nennen die Stellen, zu denen er gehört.
 */
export interface FactOffen {
  kategorien: readonly JobCategory[];
  /** Die offene Frage mit Fundstelle (fakten-abgleich, MENSCHEN). */
  frage: string;
}

export interface FactPending {
  /** Stellen, auf denen die Aussage bis zur Bestätigung stehen darf (dort war sie schon sichtbar). */
  onlyForJobIds: readonly string[];
  note: string;
}

interface FactBody {
  /** Kurzform für Kacheln, Listen und Meta-Texte. */
  short: string;
  /** Ganzer Satz für Fließtext und Stellenbeschreibungen. */
  long: string;
  /** Kennzahl für StatTiles, z. B. '35 km'. */
  value?: string;
  /** Beschriftung zur Kennzahl. */
  label?: string;
  list?: readonly string[];
  /** Letzter Tag (ISO), an dem der Fakt angezeigt werden darf. */
  validUntil?: string;
  /** Wartet auf Owner-Bestätigung (ROADMAP §13). */
  pending?: FactPending;
  /** Für diese Stellenarten nicht belegt (FactOffen). */
  offenFuer?: FactOffen;
  /**
   * Fundstelle als `pfad@commit` (fester Stand: Phase 1 löscht oder schreibt mehrere Quelldateien um,
   * z. B. `git show 393df01:components/pricing/pricing.constants.ts`).
   */
  source: string;
}

const RAW_FACTS = {
  // Inhaber 2026-10-12 (B28): flexible Arbeitszeiten, keine festen Endzeiten. Was „flexibel“ konkret heißt,
  // ist nicht belegt, darum ohne Kennzahl und ohne Uhrzeit.
  flexibleHours: {
    short: 'Flexible Arbeitszeiten',
    long: 'Flexible Arbeitszeiten.',
    // B28 gilt für den Betrieb; fürs Büro mit festen Erreichbarkeitszeiten ist es nicht geklärt (S5, M-038). Zum
    // Schülerpraktikum hat der Inhaber nur Dauer und Geld genannt (S4); die Zeiten legen Schule und JArbSchG fest.
    offenFuer: {
      kategorien: ['buero', 'praktikum'],
      frage:
        'fakten-abgleich S5, M-038: Gelten flexible Arbeitszeiten auch im Büro? S4, M-027: Arbeitszeit im Schülerpraktikum nicht genannt',
    },
    source: 'docs/operations/fakten-abgleich.md@699dcfb',
  },
  noUnpaidOvertime: {
    short: 'Keine unbezahlten Überstunden',
    long: 'Keine unbezahlten Überstunden.',
    source: 'docs/operations/fakten-abgleich.md@699dcfb',
  },
  vacation30: {
    short: '30 Tage Urlaub',
    long: '30 Arbeitstage bezahlter Erholungsurlaub pro Kalenderjahr.',
    value: '30',
    label: 'Tage Urlaub',
    offenFuer: { kategorien: ['buero'], frage: 'fakten-abgleich S5, M-038: Gelten 30 Tage Urlaub auch im Büro?' },
    source: 'components/pricing/pricing.constants.ts@393df01',
  },
  radius35: {
    short: 'Einsatzgebiet maximal 35 km um Wetzlar',
    long: 'Alle Baustellen liegen im Umkreis von 35 km um Wetzlar.',
    value: '35 km',
    label: 'Radius',
    source: 'docs/operations/fakten-abgleich.md@699dcfb',
  },
  noFarAssembly: {
    short: 'Keine Fernmontage',
    long: 'Keine Fernmontagen und keine Hotelübernachtungen: Du bist jeden Abend zu Hause.',
    source: 'docs/operations/fakten-abgleich.md@699dcfb',
  },
  founded1926: {
    short: 'Meisterbetrieb seit 1926',
    long: 'Innungs-Meisterbetrieb in Wetzlar seit 1926.',
    value: '1926',
    label: 'Gegründet',
    source: 'lib/data/company.ts@393df01',
  },
  anniversary100: {
    short: '100 Jahre Meisterbetrieb (1926–2026)',
    long: '100 Jahre Meisterbetrieb in Wetzlar (1926–2026).',
    value: '100',
    label: 'Jahre Meisterbetrieb',
    validUntil: '2026-12-31',
    source: 'lib/data/company.ts@393df01',
  },
  employees15: {
    short: '15 Leute im Team',
    long: 'Zurzeit sind 15 Mitarbeiter im Betrieb tätig.',
    value: '15',
    label: 'Leute im Team',
    source: 'lib/data/company.ts@393df01',
  },
  aboveTariff: {
    short: 'Über Tarif plus Urlaubs- und Weihnachtsgeld',
    long: 'Vergütung deutlich über dem regionalen Handwerkstarif, dazu Urlaubs- und Weihnachtsgeld.',
    offenFuer: { kategorien: ['buero'], frage: 'fakten-abgleich S5: Tarifaussage fürs Büro nicht belegt' },
    source: 'lib/data/company.ts@393df01',
  },
  // Inhaber 2026-10-14 (E-030, fakten-abgleich S1): bei allen Stellen „Lohn auf Anfrage“, nirgends ein Betrag. Die
  // belegten Fakten ohne Zahl (aboveTariff, azubiPay, Prämien in den Paketzeilen) bleiben daneben stehen.
  payOnRequest: {
    short: 'Lohn auf Anfrage',
    long: 'Den Lohn nennen wir dir auf Anfrage.',
    source: 'docs/operations/fakten-abgleich.md@a73bc7f',
  },
  permanentContract: {
    short: 'Unbefristeter Arbeitsvertrag',
    long: 'Du bekommst einen unbefristeten Arbeitsvertrag.',
    offenFuer: { kategorien: ['buero'], frage: 'fakten-abgleich S5, M-038: Befristung der Bürostelle nicht genannt' },
    source: 'components/trust/ProcessSteps.tsx@393df01',
  },
  hilti: {
    short: 'Persönliche Hilti-Ausstattung',
    long: 'Deine persönliche Hilti-22-V-Akku-Flotte mit Bohrhammer, Säbelsäge und Presszangen für Viega und Geberit. Kein Leihen, kein Warten.',
    source: 'app/page.tsx@393df01',
  },
  vehicle: {
    short: 'Servicefahrzeug mit Privatnutzung',
    long: 'Modernes Servicefahrzeug mit Sortimo-Ausbau, auch zur privaten Nutzung. Je nach Aufgabenbereich und Absprache fährst du direkt ab Wohnort zur Baustelle.',
    source: 'lib/data/company.ts@393df01',
  },
  fuelCard: {
    short: 'Tankkarte',
    long: 'Dein Firmenfahrzeug kommt mit Tankkarte.',
    source: 'app/layout.tsx@393df01',
  },
  ipadSmartphone: {
    short: 'iPad und Smartphone, auch privat',
    long: 'Digitale Auftragsabwicklung ohne Zettelwirtschaft. Dienst-iPad und Smartphone darfst du inklusive Datenflat auch privat nutzen.',
    source: 'app/page.tsx@393df01',
  },
  workwear: {
    short: 'Arbeitskleidung gestellt',
    long: 'Vollständige Arbeitskleidung und Schutzausrüstung werden gestellt.',
    source: 'app/page.tsx@393df01',
  },
  measurementTools: {
    short: 'Moderne Messtechnik',
    long: 'Digitale Abgasmessgeräte, Spülkompressoren und Kältemittel-Füllstationen für moderne Wärmepumpen.',
    source: 'app/page.tsx@393df01',
  },
  paidCertifications: {
    short: 'Bezahlte Herstellerschulungen',
    long: 'Regelmäßige bezahlte Werkszertifizierungen für Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann.',
    source: 'app/page.tsx@393df01',
  },
  noWeekendOnCall: {
    short: 'Kein Wochenend-Notdienst',
    long: 'Keine Notdienstpflicht am Wochenende: Samstag und Sonntag hast du frei.',
    source: 'lib/data/company.ts@393df01',
  },
  familyTeam: {
    short: 'Familiäres Meisterteam',
    long: 'Bei uns bist du keine Nummer, sondern geschätzter Kollege. Dazu regelmäßige Teamevents und Sommergrillen.',
    source: 'app/page.tsx@393df01',
  },
  directLine: {
    short: 'Direkter Draht zu Sabri Demir',
    // Ohne „auf Augenhöhe“: steht wörtlich im Zitat von Sabri Demir, das mit diesem Fakt zusammen erscheint.
    long: 'Kurze Wege: Du stimmst dich direkt mit Geschäftsführer Sabri Demir ab.',
    source: 'app/layout.tsx@393df01',
  },
  partners5: {
    short: '5 Partner-Säulen',
    long: 'Partnerbetrieb von Buderus und Bosch, NIBE Effizienzpartner, zertifizierter Inbetriebnahme-Partner von Alpha Innotec, Viessmann Fachbetrieb und Fachbetriebspartner des Lahn-Dill-Kreises.',
    value: '5',
    label: 'Partner-Säulen',
    list: companyData.partnerPillars,
    source: 'lib/data/company.ts@393df01',
  },
  heatPumpBrands: {
    short: 'Buderus, Bosch, NIBE, Alpha Innotec und Viessmann',
    long: 'Zertifizierter Fachpartner für Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann.',
    list: ['Buderus', 'Bosch', 'NIBE', 'Alpha Innotec', 'Viessmann'],
    source: 'app/page.tsx@393df01',
  },
  countyPartner: {
    short: 'Fachbetrieb des Lahn-Dill-Kreises',
    long: 'Als Fachbetrieb des Lahn-Dill-Kreises betreuen wir öffentliche Liegenschaften und halten sie instand.',
    source: 'lib/data/company.ts@393df01',
  },
  discretion: {
    short: '100 % diskret',
    long: 'Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber. Das Kennenlernen findet diskret nach Feierabend oder am Wochenende statt.',
    source: 'app/page.tsx@393df01',
  },
  noCvNeeded: {
    short: 'Kein Lebenslauf nötig',
    long: 'Für den ersten Schritt brauchst du weder Anschreiben noch Lebenslauf.',
    source: 'app/page.tsx@393df01',
  },
  apply60s: {
    short: 'Bewerbung in 60 Sekunden',
    long: 'Deine Bewerbung dauert ca. 60 Sekunden.',
    value: '60',
    label: 'Sekunden',
    source: 'app/page.tsx@393df01',
  },
  quickResponse: {
    short: 'Wir melden uns schnellstmöglich',
    long: 'Sabri Demir meldet sich schnellstmöglich bei dir.',
    source: 'docs/ROADMAP.md@393df01',
  },
  mentoring: {
    short: 'Lernen von Meistern und Gesellen',
    long: 'Du lernst von erfahrenen Meistern und Gesellen und arbeitest von Anfang an richtig mit, statt nur Hilfsarbeiten zu machen.',
    source: 'lib/data/services.ts@393df01',
  },
  azubiToolkit: {
    short: 'Eigenes Hilti-Werkzeugset ab Tag 1',
    long: 'Ab dem ersten Tag bekommst du dein eigenes Hilti-Azubi-Werkzeugset geschenkt.',
    source: 'components/pricing/pricing.constants.ts@393df01',
  },
  azubiPay: {
    short: 'Ausbildungsvergütung über Tarif',
    long: 'Attraktive Ausbildungsvergütung über Tarif, plus Prämien.',
    source: 'components/pricing/pricing.constants.ts@393df01',
  },
  travelAllowance: {
    short: 'Fahrtkostenzuschuss zur Berufsschule',
    long: 'Wir bezuschussen deine Fahrtkosten zur Berufsschule.',
    source: 'components/pricing/pricing.constants.ts@393df01',
  },
  driversLicenseGrant: {
    short: 'Zuschuss zum Führerschein',
    long: 'Du bekommst einen Zuschuss zum Pkw-Führerschein.',
    source: 'components/pricing/pricing.constants.ts@393df01',
  },
  takeoverGuarantee: {
    short: 'Übernahmegarantie nach der Gesellenprüfung',
    long: 'Nach erfolgreicher Gesellenprüfung ist dir die feste Übernahme garantiert.',
    pending: {
      onlyForJobIds: ['ausbildung-anlagenmechaniker-shk'],
      note: 'ROADMAP §13: „Übernahmegarantie“ bestätigen.',
    },
    source: 'app/page.tsx@393df01',
  },
  privateCarOnePercent: {
    short: 'Firmenfahrzeug mit 1-%-Privatnutzung',
    long: 'Dein Firmenfahrzeug darfst du privat nutzen (1-%-Regelung).',
    pending: {
      onlyForJobIds: ['obermonteur-projektleiter-shk'],
      note: 'ROADMAP §13: „1 %-Privatnutzung“ bestätigen.',
    },
    source: 'app/page.tsx@393df01',
  },
  // Inhaber 2026-10-14 (fakten-abgleich S6): „Bosch Premium Partner“. Ohne Urkunde kein Beleg (K-012, M-020): auf keiner
  // Seite, und scripts/qa/check-claims.mjs sperrt den Wortlaut im gebauten Ergebnis, solange `pending` steht.
  boschPremiumPartner: {
    short: 'Bosch Premium Partner',
    long: 'Wir sind Bosch Premium Partner.',
    pending: {
      onlyForJobIds: [],
      note: 'M-020: Urkunde und Wortlaut „Premium Partner“ aus dem Bosch-Partnerportal fehlen. Bis dahin auf keiner Seite.',
    },
    source: 'docs/operations/fakten-abgleich.md@a73bc7f',
  },
  payFirstWorkday: {
    short: 'Gehalt am 1. Werktag',
    long: 'Dein Gehalt kommt pünktlich am 1. Werktag des Monats.',
    pending: {
      onlyForJobIds: [],
      note: 'ROADMAP §13: „Gehalt am 1. Werktag“ bestätigen. Bis dahin auf keiner Stellenseite.',
    },
    source: 'components/pricing/pricing.constants.ts@393df01',
  },
} satisfies Record<string, FactBody>;

export type FactId = keyof typeof RAW_FACTS;

export interface Fact extends FactBody {
  id: FactId;
}

export const FACT_IDS = Object.keys(RAW_FACTS) as [FactId, ...FactId[]];

export const FACTS: Readonly<Record<FactId, Fact>> = Object.freeze(
  Object.fromEntries(
    FACT_IDS.map((id) => [id, Object.freeze({ id, ...(RAW_FACTS[id] as FactBody) })]),
  ) as Record<FactId, Fact>,
);

export function isFactId(value: string): value is FactId {
  return Object.prototype.hasOwnProperty.call(RAW_FACTS, value);
}

export function getFact(id: FactId): Fact {
  return FACTS[id];
}

export function getFacts(ids: readonly FactId[]): Fact[] {
  return ids.map(getFact);
}

/** False ab dem Tag nach `validUntil` (Vergleich als Kalenderdatum in UTC). */
export function isFactActive(id: FactId, date: Date): boolean {
  const { validUntil } = FACTS[id];
  if (!validUntil) return true;
  return date.toISOString().slice(0, 10) <= validUntil;
}

/**
 * Sammelflächen (Prüfung E-029, Runde 2 und 3): Seiten und Dateien, die über mehrere Stellen zugleich sprechen (die
 * Startseite / mit Description, h1, Einleitung und Maßen, das Standard-Teilen-Bild /opengraph-image, Ortsseiten und
 * ihre Descriptions, /jobs, /bewerbung ohne Stelle, Themenseiten, llms.txt). Ein Fakt mit `offenFuer` steht dort nur
 * mit Stellenbezug („je nach Stelle“) oder gar nicht, solange eine gezeigte Stelle in einer offenen Kategorie liegt.
 * Die Stellenseite selbst sperrt ihn schon über das Schema (lib/jobs/schema.ts).
 *
 * Ergebnis: die gezeigten Stellen, für die der Fakt offen ist; leer heißt, er gilt für alle.
 */
export function offenBei<T extends { category: JobCategory }>(id: FactId, stellen: readonly T[]): T[] {
  const offen = FACTS[id].offenFuer;
  return offen ? stellen.filter((stelle) => offen.kategorien.includes(stelle.category)) : [];
}

/** Was eine Stelle selbst zu einem Fakt sagt (Ausschnitt aus Job, lib/jobs/schema.ts). */
export interface FaktTraeger {
  category: JobCategory;
  benefitFactIds: readonly FactId[];
  employment: { permanent: boolean };
  pay: string;
}

/**
 * Führt die Stelle den Fakt in ihren eigenen Daten? Ihre Vorteile (benefitFactIds), dazu die Angaben der Meta-Zeile
 * mit derselben Aussage: „Unbefristet“ (employment.permanent) und „Lohn auf Anfrage“ (pay). Für eine Kategorie aus
 * `offenFuer` nie. Ordnet eine Sammelfläche einen Fakt Stellen zu („genannt bei“, „Gehört zu“), dann nur diesen; aus
 * einer Paketzeile mit ähnlichem Wortlaut folgt der Fakt nicht (Prüfung E-029, Runde 3).
 */
export function fuehrtFakt(id: FactId, stelle: FaktTraeger): boolean {
  if (FACTS[id].offenFuer?.kategorien.includes(stelle.category)) return false;
  if (stelle.benefitFactIds.includes(id)) return true;
  if (id === 'permanentContract') return stelle.employment.permanent;
  if (id === 'payOnRequest') return stelle.pay === 'auf-anfrage';
  return false;
}

/** Die gezeigten Stellen, deren eigene Daten den Fakt führen (fuehrtFakt), in ihrer Reihenfolge. */
export function fuehrendeStellen<T extends FaktTraeger>(id: FactId, stellen: readonly T[]): T[] {
  return stellen.filter((stelle) => fuehrtFakt(id, stelle));
}

/** Stellenbezug auf Sammelflächen, wie auf der Seite „Bezahlung und Extras“. */
export const JE_NACH_STELLE = 'je nach Stelle';
