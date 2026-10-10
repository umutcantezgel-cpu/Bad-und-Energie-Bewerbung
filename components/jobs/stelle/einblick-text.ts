/**
 * Texte des Bands „Einblick“ der Stellenseite (V6-G2): Arbeit und Abläufe, der Unterschied zu den Nachbarstellen
 * und das Einsatzgebiet, je Stelle eigen formuliert (kein Absatz doppelt zwischen den Stellen). Reines Modul ohne
 * JSX, gebaut nur aus belegten Quellen:
 * - Stellendaten (lib/jobs/data): Aufgaben, Anforderungen, Berufserfahrung, Ausbildungsdauer;
 * - lib/content/facts.ts: Wortlaut der Fakten paidCertifications, measurementTools, travelAllowance,
 *   driversLicenseGrant, takeoverGuarantee (nur Ausbildung, dort freigegeben);
 * - lib/content/region.ts: Orte mit Entfernung und Fahrzeit, Bereiche des Einsatzgebiets;
 * - lib/content/faq.ts, Frage „heizsysteme“: Badpartner und Fußbodenheizungen.
 * Faktenregel E-023: Das Band erklärt Arbeit, Region und Unterschiede. Ein Fakt aus „Das bekommst du“ oder „Dein
 * Paket“ steht hier höchstens als zweite Nennung; 35 km, Fernmontage, 13:30, Fahrzeug und iPad gar nicht.
 * Herkunft geprüft in app/jobs/__tests__/einblick.test.ts.
 */
import { FACTS } from '@/lib/content/facts';
import { getFaqItem } from '@/lib/content/faq';
import { REGION, type RegionArea, type RegionLocation } from '@/lib/content/region';
import { formatNumber, jobPath } from '@/lib/jobs/format';
import { getJobById, isJobLive, type Job, type JobId } from '@/lib/jobs/registry';
import { lowerFirst } from '../text';

const NBSP = ' ';

/** Ids der Überschriften im Band. */
export const EINBLICK_ANKER = { arbeit: 'stelle-arbeit', gebiet: 'stelle-gebiet' } as const;

/** Link auf eine andere Stelle mit beschreibendem Ankertext. */
export interface Verweis {
  href: string;
  label: string;
}

/** Fließtext mit Verweisen. */
export type Textteil = string | Verweis;

export interface EinblickPunkt {
  titel: string;
  text: string;
}

/** Zeile der Ortsliste (Form wie PackageListItem); `mass`: Wert als Maß in Martian Mono. */
export interface EinblickOrt {
  label: string;
  text: string;
  mass: boolean;
}

export interface Einblick {
  arbeit: { etikett: string; titel: string; einleitung: string; punkte: readonly EinblickPunkt[] };
  /** Unterschied zu den Nachbarstellen; null, wenn keine davon gerade live ist. */
  vergleich: { titel: string; teile: readonly Textteil[] } | null;
  gebiet: { etikett: string; titel: string; einleitung: string; orte: readonly EinblickOrt[]; nachsatz: string | null };
}

// ── Quellen ──────────────────────────────────────────────────────────────────────────────────

const HEIZSYSTEME = getFaqItem('heizsysteme').answer;

/** „ELEMENTS, VIGOUR, Kermi und Geberit“ im Wortlaut der FAQ „heizsysteme“. */
export const BADPARTNER = (() => {
  const partner = /Partnerschaft mit ([^.]+)\./.exec(HEIZSYSTEME)?.[1];
  if (!partner) throw new Error('einblick-text: Badpartner fehlen in der FAQ „heizsysteme“');
  return partner;
})();

/** Ort aus REGION.locations; ein falscher Name bricht Build und Tests ab. */
function ort(name: string): RegionLocation {
  const found = REGION.locations.find((location) => location.name === name);
  if (!found) throw new Error(`einblick-text: Ort „${name}“ fehlt in REGION.locations`);
  return found;
}

/** Bereich aus REGION.areas (SITE_CONFIG.serviceRegions). */
function bereich(name: string): RegionArea {
  const found = REGION.areas.find((area) => area.name === name);
  if (!found) throw new Error(`einblick-text: Bereich „${name}“ fehlt in REGION.areas`);
  return found;
}

const KERNGEBIET = 'Wetzlar Kernstadt und Stadtteile';
const GIESSEN_UMLAND = 'Gießen und Umland';
const LAHN_DILL = 'Lahn Dill Kreis';

/** Schreibweise der Bereichsnamen im Text („Lahn Dill Kreis“ → „Lahn-Dill-Kreis“). */
const bereichName = (name: string) => (name === LAHN_DILL ? 'Lahn-Dill-Kreis' : name);

/** Orte eines Bereichs, die noch nicht mit Entfernung in der Ortsliste derselben Seite stehen. */
function ohne(area: RegionArea, schonGenannt: readonly string[]): string[] {
  return area.cities.filter((city) => !schonGenannt.includes(city));
}

/** „A, B und C“. */
export function aufzaehlung(teile: readonly string[]): string {
  return teile.length > 1 ? `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}` : (teile[0] ?? '');
}

/** „4 km · 6 Min.“ (Entfernung zuerst) bzw. „6 Min. · 4 km“ (Fahrzeit zuerst). */
const strecke = (location: RegionLocation) => `${location.distanceKm}${NBSP}km · ${location.commuteMinutes}${NBSP}Min.`;
const fahrzeit = (location: RegionLocation) => `${location.commuteMinutes}${NBSP}Min. · ${location.distanceKm}${NBSP}km`;

const ZAHLWORT = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs'] as const;

/** Berufserfahrung aus experienceMonths im Wortlaut der Anforderungen: 12 → „ein Jahr“, 36 → „drei Jahre“. */
export function erfahrung(job: Pick<Job, 'experienceMonths'>): string {
  const jahre = (job.experienceMonths ?? 0) / 12;
  const wort = (Number.isInteger(jahre) ? ZAHLWORT[jahre] : undefined) ?? formatNumber(jahre);
  return `${wort} ${jahre === 1 ? 'Jahr' : 'Jahre'}`;
}

/** Ausbildungsdauer im Dativ: 42 Monate → „3,5 Jahren“. */
function dauer(job: Pick<Job, 'employment'>): string {
  const jahre = (job.employment.durationMonths ?? 0) / 12;
  return `${formatNumber(jahre).replace(/,50$/, ',5')} Jahren`;
}

/** Eine andere Stelle, nur wenn sie gerade live ist (sonst entfällt der Verweis). */
function lebendig(id: JobId, now: Date): Job | null {
  const job = getJobById(id);
  return job && isJobLive(job, now) ? job : null;
}

const verweis = (job: Job, label: string): Verweis => ({ href: jobPath(job), label });

// ── Stellen ──────────────────────────────────────────────────────────────────────────────────

const EINSATZGEBIET = 'Einsatzgebiet';

function anlagenmechaniker(job: Job, now: Date): Einblick {
  const kd = lebendig('kundendiensttechniker-shk', now);
  const om = lebendig('obermonteur-projektleiter-shk', now);
  const teile: Textteil[] = [];
  if (kd) {
    teile.push(
      'Wartung und Fehlersuche liegen dir mehr? Dann passt die ',
      verweis(kd, 'Stelle im Kundendienst'),
      `, sie setzt ${erfahrung(kd)} Berufserfahrung voraus.`,
    );
  }
  if (om) {
    teile.push(
      `${kd ? ' ' : ''}Hast du ${erfahrung(om)} Berufserfahrung und Lust auf Führung, ist die `,
      verweis(om, 'Stelle als Obermonteur / Projektleiter'),
      ' der nächste Schritt.',
    );
  }
  const titel = kd && om ? 'Lieber Kundendienst oder Bauleitung?' : kd ? 'Lieber in den Kundendienst?' : 'Lieber in die Bauleitung?';
  const kern = ['Garbenheim', 'Hermannstein', 'Steindorf', 'Nauborn', 'Dutenhofen'].map(ort);

  return {
    arbeit: {
      etikett: 'Arbeitsfelder',
      titel: 'Wärmepumpe, Heizung, Bad',
      einleitung: `Als ${job.shortTitle}, im Alltag oft Heizungsbauer genannt, arbeitest du in drei Feldern.`,
      punkte: [
        {
          titel: 'Wärmepumpe',
          text: `Du montierst Wärmepumpen, nimmst sie in Betrieb und machst den hydraulischen Abgleich. ${FACTS.paidCertifications.short} gehören dazu.`,
        },
        {
          titel: 'Heizung',
          text: 'Heizungen modernisierst du im Neubau und im Bestand. Zum Schwerpunkt des Betriebs gehören auch Fußbodenheizungen.',
        },
        { titel: 'Bad', text: `Badsanierungen bauen wir schlüsselfertig, gemeinsam mit unseren Partnern ${BADPARTNER}.` },
      ],
    },
    vergleich: teile.length > 0 ? { titel, teile } : null,
    gebiet: {
      etikett: EINSATZGEBIET,
      titel: `Deine Baustellen rund um ${REGION.center.name}`,
      einleitung: 'Entfernung und Fahrzeit vom Firmensitz in die Stadtteile im Kerngebiet:',
      orte: kern.map((location) => ({ label: location.name, text: strecke(location), mass: true })),
      nachsatz: `${GIESSEN_UMLAND} gehören ebenfalls dazu, mit ${aufzaehlung(ohne(bereich(GIESSEN_UMLAND), ['Gießen']))}.`,
    },
  };
}

function kundendienst(job: Job, now: Date): Einblick {
  const am = lebendig('anlagenmechaniker-shk', now);
  const regional = REGION.locations.filter((location) => !location.isCoreZone);

  return {
    arbeit: {
      etikett: 'Im Einsatz',
      titel: 'Inbetriebnahme, Wartung, Störung',
      einleitung: 'Im Kundendienst arbeitest du an Wärmepumpen und moderner Heizungstechnik, in drei Arten von Einsätzen.',
      punkte: [
        {
          titel: 'Inbetriebnahme',
          text: 'Bei neuen Wärmepumpen übernimmst du die Inbetriebnahme und den hydraulischen Abgleich.',
        },
        { titel: 'Wartung', text: `Für die Wartung hast du ${lowerFirst(FACTS.measurementTools.long)}` },
        { titel: 'Störung', text: 'Läuft eine Anlage nicht rund, suchst du den Fehler und optimierst sie anschließend.' },
      ],
    },
    vergleich: am
      ? {
          titel: 'Kundendienst oder Montage?',
          teile: [
            'Neue Wärmepumpen und Bäder baut bei uns die Montage ein. Liegt dir das mehr, schau dir die ',
            verweis(am, 'Stelle als Anlagenmechaniker SHK'),
            ` an: Dort setzen wir mindestens ${erfahrung(am)} Berufserfahrung als Geselle voraus, im Kundendienst ${erfahrung(job)}.`,
          ],
        }
      : null,
    gebiet: {
      etikett: EINSATZGEBIET,
      titel: `Deine Touren ab ${REGION.center.name}`,
      einleitung: `Vom Firmensitz in ${REGION.center.name} ins regionale Einsatzgebiet, mit Entfernung und Fahrzeit:`,
      orte: regional.map((location) => ({ label: location.name, text: strecke(location), mass: true })),
      nachsatz: `Im ${bereichName(LAHN_DILL)} gehören außerdem ${aufzaehlung(ohne(bereich(LAHN_DILL), regional.map((l) => l.name)))} dazu.`,
    },
  };
}

function obermonteur(job: Job, now: Date): Einblick {
  const am = lebendig('anlagenmechaniker-shk', now);

  return {
    arbeit: {
      etikett: 'Projekte',
      titel: 'Was du verantwortest',
      einleitung: 'Zwei Arten von Baustellen liegen in deiner Verantwortung, dazu das Team, das dort arbeitet.',
      punkte: [
        { titel: 'Komplettbäder', text: `Komplettbäder sanieren wir schlüsselfertig, mit ${BADPARTNER} als Partnern.` },
        {
          titel: 'Heizung und Großanlagen',
          text: 'Bei Heizungsmodernisierungen reicht deine Bauleitung bis zu regenerativen Großanlagen.',
        },
        { titel: 'Team', text: 'Dein Montageteam führst du kollegial, jede Baustelle dokumentierst du digital.' },
      ],
    },
    vergleich: am
      ? {
          titel: 'Lieber selbst montieren?',
          teile: [
            'Als ',
            verweis(am, `${am.shortTitle} in ${am.location.city}`),
            ` montierst du Wärmepumpen und Bäder selbst; die Stelle setzt mindestens ${erfahrung(am)} als Geselle voraus. Für die Bauleitung sind es ${erfahrung(job)} Berufserfahrung.`,
          ],
        }
      : null,
    gebiet: {
      etikett: EINSATZGEBIET,
      titel: 'Wo deine Baustellen liegen',
      einleitung: `Das Einsatzgebiet reicht vom Kerngebiet um den Firmensitz bis in den ${bereichName(LAHN_DILL)}.`,
      orte: [KERNGEBIET, GIESSEN_UMLAND, LAHN_DILL].map((name) => ({
        label: bereichName(name),
        text: aufzaehlung(bereich(name).cities),
        mass: false,
      })),
      nachsatz: null,
    },
  };
}

interface Werdegang {
  job: Job;
  /** Präposition vor dem Verweis: „als“, „für den“, „für die“. */
  vor: string;
  label: string;
  /** Die Anforderung nennt die Erfahrung „als Geselle“. */
  geselle: boolean;
}

/**
 * „Als [Anlagenmechaniker SHK] brauchst du mindestens ein Jahr Berufserfahrung als Geselle, für den [Kundendienst
 * für Wärmepumpen] zwei Jahre und für die [Bauleitung als Obermonteur] drei Jahre.“ Nur Stellen, die live sind.
 */
function werdegang(now: Date): Textteil[] {
  const kandidaten: (Omit<Werdegang, 'job'> & { job: Job | null })[] = [
    { job: lebendig('anlagenmechaniker-shk', now), vor: 'als', label: 'Anlagenmechaniker SHK', geselle: true },
    { job: lebendig('kundendiensttechniker-shk', now), vor: 'für den', label: 'Kundendienst für Wärmepumpen', geselle: false },
    { job: lebendig('obermonteur-projektleiter-shk', now), vor: 'für die', label: 'Bauleitung als Obermonteur', geselle: false },
  ];
  const [erste, ...rest] = kandidaten.filter((eintrag): eintrag is Werdegang => eintrag.job !== null);
  if (!erste) return [];
  return [
    'Unsere Stellen für Fachkräfte zeigen, wie es weitergehen kann. ',
    `${erste.vor.charAt(0).toUpperCase()}${erste.vor.slice(1)} `,
    verweis(erste.job, erste.label),
    ` brauchst du mindestens ${erfahrung(erste.job)} Berufserfahrung${erste.geselle ? ' als Geselle' : ''}`,
    ...rest.flatMap((eintrag, i) => [
      `${i === rest.length - 1 ? ' und' : ','} ${eintrag.vor} `,
      verweis(eintrag.job, eintrag.label),
      ` ${erfahrung(eintrag.job)}`,
    ]),
    '.',
  ];
}

function ausbildung(job: Job, now: Date): Einblick {
  const teile = werdegang(now);

  return {
    arbeit: {
      etikett: 'Ausbildung',
      titel: 'So läuft deine Ausbildung',
      einleitung: `In ${dauer(job)} lernst du auf der Baustelle und in der Berufsschule. Am Ende steht die Gesellenprüfung.`,
      punkte: [
        {
          titel: 'Auf der Baustelle',
          text: 'Ab dem ersten Monat arbeitest du mit, an Wärmepumpen und Heizungen genauso wie in modernen Bädern.',
        },
        {
          titel: 'In der Berufsschule',
          text: `${FACTS.travelAllowance.long} Durch Berufsschule und Gesellenprüfung begleiten dich deine Meister.`,
        },
        { titel: 'Führerschein', text: FACTS.driversLicenseGrant.long },
        { titel: 'Nach der Prüfung', text: 'Bestehst du die Gesellenprüfung, ist dir die feste Übernahme garantiert.' },
      ],
    },
    vergleich: teile.length > 0 ? { titel: 'Und nach der Ausbildung?', teile } : null,
    gebiet: {
      etikett: 'Anfahrt',
      titel: 'Dein Weg in den Betrieb',
      einleitung: `Fahrzeit bis zum Betrieb in ${REGION.center.name}, aus der Kernstadt und den Orten ringsum:`,
      orte: ['Wetzlar Kernstadt', 'Nauborn', 'Dutenhofen', 'Gießen', 'Herborn'].map(ort).map((location) => ({
        label: location.name,
        text: fahrzeit(location),
        mass: true,
      })),
      nachsatz: null,
    },
  };
}

const EINBLICKE: Partial<Record<JobId, (job: Job, now: Date) => Einblick>> = {
  'anlagenmechaniker-shk': anlagenmechaniker,
  'kundendiensttechniker-shk': kundendienst,
  'obermonteur-projektleiter-shk': obermonteur,
  'ausbildung-anlagenmechaniker-shk': ausbildung,
};

/** Einblick der Stelle; null für Stellen ohne Seite (Quereinstieg, funnel_only). */
export function einblick(job: Job, now: Date = new Date()): Einblick | null {
  return EINBLICKE[job.id]?.(job, now) ?? null;
}
