import { companyData } from '@/lib/data/company';

/**
 * Fakten-Registry: jede Arbeitgeber-Aussage genau einmal, mit Herkunft.
 * Komponenten, Stellen und Feeds referenzieren nur IDs. Neue Fakten nur mit
 * belegbarer Quelle im Repo; Abweichungen stehen in docs/operations/fakten-abgleich.md.
 */

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
  /** Kennzahl für StatTiles, z. B. '13:30'. */
  value?: string;
  /** Beschriftung zur Kennzahl. */
  label?: string;
  list?: readonly string[];
  /** Letzter Tag (ISO), an dem der Fakt angezeigt werden darf. */
  validUntil?: string;
  /** Wartet auf Owner-Bestätigung (ROADMAP §13). */
  pending?: FactPending;
  /**
   * Fundstelle als `pfad@commit` (fester Stand: Phase 1 löscht oder schreibt mehrere Quelldateien um,
   * z. B. `git show 393df01:components/pricing/pricing.constants.ts`).
   */
  source: string;
}

const RAW_FACTS = {
  friday1330: {
    short: 'Freitags ab 13:30 Uhr Feierabend',
    long: 'Freitags geht es verlässlich um 13:30 Uhr ins Wochenende.',
    value: '13:30',
    label: 'Freitags Feierabend',
    source: 'lib/data/company.ts@393df01',
  },
  workingHours: {
    short: 'Mo–Do 07:00–16:45 Uhr, Fr 07:00–13:30 Uhr',
    long: 'Feste Arbeitszeiten: Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag von 07:00 bis 13:30 Uhr.',
    source: 'lib/data/company.ts@393df01',
  },
  noUnpaidOvertime: {
    short: 'Keine unbezahlten Überstunden',
    long: 'Geregelte Arbeitszeiten ohne unbezahlte Überstunden.',
    source: 'app/page.tsx@393df01',
  },
  vacation30: {
    short: '30 Tage Urlaub',
    long: '30 Arbeitstage bezahlter Erholungsurlaub pro Kalenderjahr.',
    value: '30',
    label: 'Tage Urlaub',
    source: 'components/pricing/pricing.constants.ts@393df01',
  },
  radius35: {
    short: 'Einsatzgebiet maximal 35 km um Wetzlar',
    long: 'Alle Baustellen liegen in Wetzlar, Gießen und dem Lahn-Dill-Kreis, maximal 35 km vom Firmensitz entfernt.',
    value: '35 km',
    label: 'Radius',
    source: 'lib/seo/site-config.ts@393df01',
  },
  noFarAssembly: {
    short: 'Keine Fernmontage',
    long: 'Keine Fernmontagen und keine Hotelübernachtungen: Du bist jeden Abend pünktlich zu Hause.',
    source: 'app/page.tsx@393df01',
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
    source: 'lib/data/company.ts@393df01',
  },
  permanentContract: {
    short: 'Unbefristeter Arbeitsvertrag',
    long: 'Du bekommst einen unbefristeten Arbeitsvertrag.',
    source: 'components/trust/ProcessSteps.tsx@393df01',
  },
  hilti: {
    short: 'Persönliche Hilti-Ausstattung',
    long: 'Deine persönliche Hilti 22V Akku-Flotte mit Bohrhammer, Säbelsäge und Presszangen für Viega und Geberit. Kein Leihen, kein Warten.',
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
    long: 'Kurze Wege: Du stimmst dich direkt und auf Augenhöhe mit Geschäftsführer Sabri Demir ab.',
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
