/**
 * Texte des Bands „Einblick“ der Stellenseite (V6-G2): Arbeit und Abläufe, der Unterschied zu den Nachbarstellen
 * und das Einsatzgebiet, je Stelle eigen formuliert (kein Absatz doppelt zwischen den Stellen). Reines Modul ohne
 * JSX, gebaut nur aus belegten Quellen:
 * - Stellendaten (lib/jobs/data): Aufgaben, Anforderungen, Berufserfahrung, Ausbildungsdauer;
 * - lib/content/facts.ts: Wortlaut der Fakten paidCertifications, measurementTools, travelAllowance,
 *   driversLicenseGrant, takeoverGuarantee (nur Ausbildung 2026, dort freigegeben), founded1926 (Praktikum, ohne Jahr);
 * - lib/content/region.ts: Orte mit Entfernung und Fahrzeit; REGION.milestone („moderneres Büro, größeres Lager“,
 *   „Wärmepumpen-Spezialist“) für Büro und Praktikum;
 * - lib/places (Ortsvermessung): Orte je Kreis mit eigener Ortsseite, nach Strecke (seit E-028; vorher drei Bereiche
 *   aus SITE_CONFIG.serviceRegions mit Dillenburg, das 38 km Straße entfernt liegt);
 * - lib/content/faq.ts, Frage „heizsysteme“: Badpartner und Fußbodenheizungen.
 * Faktenregel E-023: Das Band erklärt Arbeit, Region und Unterschiede. Ein Fakt aus „Das bekommst du“ oder „Dein
 * Paket“ steht hier höchstens als zweite Nennung; 35 km, Fernmontage, Arbeitszeit, Fahrzeug und iPad gar nicht.
 * Herkunft geprüft in app/jobs/__tests__/einblick.test.ts.
 */
import { FACTS } from '@/lib/content/facts';
import { getFaqItem } from '@/lib/content/faq';
import { REGION, type RegionLocation } from '@/lib/content/region';
import { formatNumber, jobPath } from '@/lib/jobs/format';
import { getJobById, isJobLive, type Job, type JobId } from '@/lib/jobs/registry';
import { DISTANCE_BAND_KM } from '@/lib/places/derive';
import { getHubKreise, getKreisById, getKreisPlaces, getStadtteile } from '@/lib/places/registry';
import { getThema, themaPath } from '@/lib/themen/registry';
import { BUERO_SZENEN_BESCHRIFTUNGEN, BUERO_SZENEN_TITEL } from '@/lib/themen/text';
import { BUERO_SZENEN_ARTEN, type BueroSzenenArt } from '@/lib/zeichnung/buero/szenen';
import { lowerFirst } from '../text';

const NBSP = ' ';

/** Ids der Überschriften im Band. */
export const EINBLICK_ANKER = { arbeit: 'stelle-arbeit', gebiet: 'stelle-gebiet' } as const;

/**
 * Weg zur Gebietsseite unter den Orten des Einsatzgebiets (E-028): genau ein Link je Stellenseite. Dort stehen alle
 * gemessenen Orte mit Strecke und Fahrzeit; die Stellenseiten selbst bleiben ohne Stadt-Duplikate.
 */
export const ARBEITSWEG_LINK = Object.freeze({ href: '/einsatzgebiet', label: 'Arbeitsweg von deinem Ort prüfen' });

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

/**
 * Büro (E-031): die vier Szenen der Themenseite „Büro und Verwaltung“ als stille Dateien (ab 40em 2 × 2, still im
 * Endzustand, lazy), je mit ihrem Titel und den Wörtern an der Zeichnung wie auf der Themenseite (Prüfrunde 1 A1-6),
 * und der Weg zur Themenseite.
 */
export interface EinblickSzenen {
  bilder: readonly { art: BueroSzenenArt; titel: string; beschriftungen: Readonly<Record<string, string>> }[];
  link: Verweis;
}

export interface Einblick {
  arbeit: { etikett: string; titel: string; einleitung: string; punkte: readonly EinblickPunkt[]; szenen?: EinblickSzenen };
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

/** Kreis des Firmensitzes und der Kreis mit Gießen (Kreis-Hubs unter /einsatzgebiet). */
const LAHN_DILL = 'lahn-dill-kreis';
const GIESSEN = 'landkreis-giessen';
/** Zeile der Kernstadt mit ihren Stadtteilen. */
export const KERNGEBIET = `${REGION.center.name} und Stadtteile`;

/** Name eines Kreises für den Text („Lahn-Dill-Kreis“, „Landkreis Gießen“). */
function kreisName(kreisId: string): string {
  const kreis = getKreisById(kreisId);
  if (!kreis) throw new Error(`einblick-text: Kreis „${kreisId}“ ohne veröffentlichten Ort`);
  return kreis.shortName;
}

/**
 * Gemeinden eines Kreises mit eigener Ortsseite, nach Strecke; ohne die genannten. `nah`: nur unter 20 km Straße
 * (Entfernungsbänder „nah“ und „mittel“), `max`: höchstens so viele.
 */
export function kreisOrte(kreisId: string, { ohne = [], nah = false, max }: { ohne?: readonly string[]; nah?: boolean; max?: number } = {}): string[] {
  const names = getKreisPlaces(kreisId)
    .filter((place) => place.kind === 'gemeinde' && (!nah || place.commute.distanceKm < DISTANCE_BAND_KM.weit))
    .map((place) => place.name)
    .filter((name) => !ohne.includes(name));
  return max === undefined ? names : names.slice(0, max);
}

/** Die Stadtteile der Kernstadt mit eigener Ortsseite, nach Strecke. */
export function kerngebietOrte(): string[] {
  return getStadtteile('wetzlar').map((place) => place.name);
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

/** Ausbildungsdauer in Jahren: 42 Monate → „3,5“. */
function jahre(job: Pick<Job, 'employment'>): string {
  return formatNumber((job.employment.durationMonths ?? 0) / 12).replace(/,50$/, ',5');
}

/** Ausbildungsdauer im Dativ: 42 Monate → „3,5 Jahren“. */
function dauer(job: Pick<Job, 'employment'>): string {
  return `${jahre(job)} Jahren`;
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
      nachsatz: `Der ${kreisName(GIESSEN)} gehört ebenfalls dazu, mit ${aufzaehlung(kreisOrte(GIESSEN, { nah: true }))}.`,
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
      // Bezugspunkt der Entfernungen, nicht der Startpunkt: Mit Firmenwagen beginnt die Tour am Wohnort (FAQ).
      titel: `Dein Einsatzgebiet rund um ${REGION.center.name}`,
      einleitung: `Vom Firmensitz in ${REGION.center.name} ins regionale Einsatzgebiet, mit Entfernung und Fahrzeit:`,
      orte: regional.map((location) => ({ label: location.name, text: strecke(location), mass: true })),
      nachsatz: `Im ${kreisName(LAHN_DILL)} gehören außerdem ${aufzaehlung(kreisOrte(LAHN_DILL, { nah: true, ohne: regional.map((l) => l.name) }))} dazu.`,
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
      einleitung: `Das Einsatzgebiet reicht vom Kerngebiet um den Firmensitz über den ${kreisName(LAHN_DILL)} bis in die Nachbarkreise, zum Beispiel:`,
      orte: [
        { label: KERNGEBIET, text: aufzaehlung(kerngebietOrte()), mass: false },
        ...getHubKreise().map((kreis) => ({
          label: kreis.shortName,
          text: aufzaehlung(kreisOrte(kreis.id, { max: 5 })),
          mass: false,
        })),
      ],
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

/** Die Ausbildungsstelle, auf die Quereinstieg und Praktikum verweisen: 2027, solange sie live ist, sonst 2026. */
function offeneAusbildung(now: Date): Job | null {
  return lebendig('ausbildung-anlagenmechaniker-shk-2027', now) ?? lebendig('ausbildung-anlagenmechaniker-shk', now);
}

/**
 * Ausbildung 2027 (fakten-abgleich S2): eigener Wortlaut neben der Ausbildung 2026. Ohne Übernahmegarantie (A1 gilt
 * bis zur Bestätigung nur für die Stelle 2026), ohne Jahreszahl (Zahlen im Band nur aus REGION und der Dauer).
 */
function ausbildung2027(job: Job, now: Date): Einblick {
  const praktikum = lebendig('schuelerpraktikum-shk', now);
  const frueher = lebendig('ausbildung-anlagenmechaniker-shk', now);
  const teile: Textteil[] = [];
  if (praktikum) {
    teile.push(
      'Du bist dir noch nicht sicher, ob das Handwerk zu dir passt? Im ',
      verweis(praktikum, 'Schülerpraktikum im SHK-Handwerk'),
      ' lernst du die Arbeit vorher kennen.',
    );
  }
  if (frueher) {
    teile.push(`${praktikum ? ' ' : ''}Willst du lieber gleich anfangen? Der `, verweis(frueher, 'Einstieg noch in diesem Jahr'), ' ist weiterhin möglich.');
  }

  return {
    arbeit: {
      etikett: 'Ausbildung',
      titel: 'Dein Weg zum Gesellenbrief',
      einleitung: `Nach ${dauer(job)} legst du die Gesellenprüfung ab. Bis dahin lernst du abwechselnd im Betrieb und in der Berufsschule; den Starttermin stimmen wir mit dir ab.`,
      punkte: [
        {
          titel: 'Wärmepumpe und Heizung',
          text: 'Auf den Baustellen lernst du, Wärmepumpen und Heizungen einzubauen und in Betrieb zu nehmen, zuerst an der Seite der Gesellen.',
        },
        {
          titel: 'Bad und Sanitär',
          text: 'Bei Badsanierungen installierst du die Sanitärtechnik und siehst, wie ein modernes Bad Schritt für Schritt entsteht.',
        },
        {
          titel: 'Schule und Prüfung',
          text: `Auf Berufsschule und Prüfungen bereiten dich deine Meister vor. ${FACTS.travelAllowance.short} und ${FACTS.driversLicenseGrant.short} gehören dazu.`,
        },
      ],
    },
    vergleich: teile.length > 0 ? { titel: 'Erst reinschauen oder früher starten?', teile } : null,
    gebiet: {
      etikett: 'Anfahrt',
      titel: 'Vom Wohnort in den Betrieb',
      einleitung: `Für Azubis zählt der tägliche Weg. So lange fährst du aus diesen Orten zum Betrieb in ${REGION.center.name}:`,
      orte: ['Steindorf', 'Garbenheim', 'Hermannstein', 'Braunfels', 'Aßlar'].map(ort).map((location) => ({
        label: location.name,
        text: fahrzeit(location),
        mass: true,
      })),
      nachsatz: null,
    },
  };
}

/** Quereinstieg (fakten-abgleich S3): Einarbeitung, Baustellen des Teams, Weg in Ausbildung oder Fachkraft-Stelle. */
function quereinstieg(job: Job, now: Date): Einblick {
  const az = offeneAusbildung(now);
  const am = lebendig('anlagenmechaniker-shk', now);
  const teile: Textteil[] = [];
  if (az) {
    teile.push('Möchtest du den Beruf von Grund auf lernen, mit Gesellenprüfung am Ende? Dann passt die ', verweis(az, 'Ausbildung zum Anlagenmechaniker SHK'), '.');
  }
  if (am) {
    teile.push(
      `${az ? ' ' : ''}Bist du schon Geselle im SHK-Handwerk, schau dir die `,
      verweis(am, 'Stelle für Gesellen in der Montage'),
      ` an; sie setzt ${erfahrung(am)} Berufserfahrung voraus.`,
    );
  }
  const geschick = job.requirements.find((anforderung) => /Geschick/.test(anforderung));
  if (!geschick) throw new Error('einblick-text: Quereinstieg ohne Anforderung „Handwerkliches Geschick“');

  return {
    arbeit: {
      etikett: 'Quereinstieg',
      titel: 'So steigst du ein',
      einleitung: `Eine SHK-Ausbildung brauchst du für den Einstieg nicht. ${geschick} zählt, den Rest zeigen dir unsere Meister.`,
      punkte: [
        { titel: 'Im Montageteam', text: 'Auf der Baustelle unterstützt du Gesellen und Meister und packst dort mit an, wo das Team dich braucht.' },
        {
          titel: 'Wärmepumpe, Heizung, Bad',
          text: 'Das Team baut vor allem Wärmepumpen und Fußbodenheizungen ein und saniert Bäder schlüsselfertig.',
        },
        { titel: 'Einarbeitung', text: 'Deine Einarbeitung ist intensiv: Neues lernst du Schritt für Schritt bei der Arbeit im Team.' },
      ],
    },
    vergleich: teile.length > 0 ? { titel: 'Ausbildung oder Fachkraft?', teile } : null,
    gebiet: {
      etikett: EINSATZGEBIET,
      titel: 'Wo das Team im Einsatz ist',
      einleitung: `Die Baustellen liegen rund um ${REGION.center.name}. Fahrzeit und Entfernung vom Firmensitz, zum Beispiel:`,
      orte: ['Steindorf', 'Nauborn', 'Braunfels', 'Dutenhofen', 'Herborn'].map(ort).map((location) => ({
        label: location.name,
        text: fahrzeit(location),
        mass: true,
      })),
      nachsatz: null,
    },
  };
}

/**
 * Bürofachkraft (fakten-abgleich S5): die vier Aufgaben aus der Antwort des Inhabers, das Büro aus REGION.milestone
 * („moderneres Büro, größeres Lager“), die Kolleginnen und Kollegen draußen als Verweis. Anforderungen offen (M-038).
 */
function buero(_job: Job, now: Date): Einblick {
  const am = lebendig('anlagenmechaniker-shk', now);
  const kd = lebendig('kundendiensttechniker-shk', now);
  const ziele = [
    am && { job: am, vor: 'in der', label: 'Montage von Wärmepumpen und Bädern' },
    kd && { job: kd, vor: 'im', label: 'Kundendienst an Wärmepumpen' },
  ].filter((ziel): ziel is { job: Job; vor: string; label: string } => Boolean(ziel));
  const teile: Textteil[] =
    ziele.length > 0
      ? [
          'Die Termine verteilst du auf die Kolleginnen und Kollegen draußen: auf die Gesellen ',
          ...ziele.flatMap((ziel, i) => [`${i > 0 ? ' und ' : ''}${ziel.vor} `, verweis(ziel.job, ziel.label)]),
          '. Am Telefon bist du für sie die Verbindung zu unseren Kunden.',
        ]
      : [];

  return {
    arbeit: {
      etikett: 'Im Büro',
      titel: 'Was über deinen Schreibtisch geht',
      einleitung: `Nach dem Umzug an den neuen Firmensitz ist unser Büro moderner und das Lager größer. Von hier aus hältst du den Betrieb in ${REGION.center.name} am Laufen.`,
      punkte: [
        { titel: 'Angebote und Rechnungen', text: 'Du schreibst Angebote, bestätigst Aufträge und stellst die Rechnungen.' },
        { titel: 'Material', text: 'Was die Baustellen brauchen, bestellst du beim Großhandel. Kommt die Lieferung, prüfst du sie.' },
        { titel: 'Verwaltung', text: 'Ablage und Post erledigst du, und der Geschäftsführung arbeitest du zu.' },
      ],
      szenen: {
        bilder: BUERO_SZENEN_ARTEN.map((art) => ({ art, titel: BUERO_SZENEN_TITEL[art], beschriftungen: BUERO_SZENEN_BESCHRIFTUNGEN[art] })),
        link: { href: themaPath(getThema('buero-und-verwaltung')), label: 'Mehr zu Büro und Verwaltung' },
      },
    },
    vergleich: teile.length > 0 ? { titel: 'Büro und Baustelle', teile } : null,
    gebiet: {
      etikett: 'Arbeitsweg',
      titel: 'Dein Weg ins Büro',
      einleitung: `Das Büro liegt am Firmensitz in ${REGION.center.name}. Entfernung und Fahrzeit aus diesen Orten:`,
      orte: ['Wetzlar Kernstadt', 'Hermannstein', 'Aßlar', 'Dutenhofen', 'Gießen'].map(ort).map((location) => ({
        label: location.name,
        text: strecke(location),
        mass: true,
      })),
      nachsatz: null,
    },
  };
}

/**
 * Schülerpraktikum (fakten-abgleich S4): was du siehst, der Betrieb (FACTS.founded1926 ohne Jahreszahl,
 * REGION.milestone) und der Weg in die Ausbildung. Kein Wort zu Geld; Dauer nach Absprache mit der Schule.
 */
function praktikum(_job: Job, now: Date): Einblick {
  const az = offeneAusbildung(now);
  const meisterbetrieb = /^(.+?) in /.exec(FACTS.founded1926.long)?.[1];
  if (!meisterbetrieb) throw new Error('einblick-text: Fakt founded1926 nennt den Meisterbetrieb nicht mehr');

  return {
    arbeit: {
      etikett: 'Praktikum',
      titel: 'Was du im Praktikum erlebst',
      einleitung: 'Im Praktikum bist du nah dran an der echten Arbeit und merkst, ob dir das Handwerk liegt.',
      punkte: [
        { titel: 'Wärmepumpe und Heizung', text: 'Du schaust zu, wie Wärmepumpen und Heizungen eingebaut und in Betrieb genommen werden.' },
        { titel: 'Bad', text: 'Bei einer Badsanierung siehst du, wie aus einem alten Bad ein neues wird.' },
        {
          titel: 'Betrieb',
          text: `Du lernst einen ${meisterbetrieb} kennen, der als Wärmepumpen-Spezialist Heizungen und Bäder modernisiert.`,
        },
        {
          titel: 'Ausbildung',
          text: 'Nebenbei erfährst du, wie eine Ausbildung bei uns abläuft: mit Meistern und Gesellen im Betrieb, dazu die Berufsschule.',
        },
      ],
    },
    vergleich: az
      ? {
          titel: 'Und nach dem Praktikum?',
          teile: [
            'Gefällt dir die Arbeit, kannst du danach in die ',
            verweis(az, 'Ausbildung im SHK-Handwerk'),
            ` einsteigen. Bis zur Gesellenprüfung dauert sie ${jahre(az)} Jahre.`,
          ],
        }
      : null,
    gebiet: {
      etikett: 'Anfahrt',
      titel: 'Kurze Wege zum Praktikum',
      einleitung: `Entfernung und Fahrzeit zum Betrieb in ${REGION.center.name}, für Orte ganz in der Nähe:`,
      orte: ['Steindorf', 'Wetzlar Kernstadt', 'Garbenheim', 'Nauborn'].map(ort).map((location) => ({
        label: location.name,
        text: strecke(location),
        mass: true,
      })),
      nachsatz: null,
    },
  };
}

const EINBLICKE: Record<JobId, (job: Job, now: Date) => Einblick> = {
  'anlagenmechaniker-shk': anlagenmechaniker,
  'kundendiensttechniker-shk': kundendienst,
  'obermonteur-projektleiter-shk': obermonteur,
  'ausbildung-anlagenmechaniker-shk': ausbildung,
  'ausbildung-anlagenmechaniker-shk-2027': ausbildung2027,
  'quereinsteiger-montagehelfer': quereinstieg,
  buerofachkraft: buero,
  'schuelerpraktikum-shk': praktikum,
};

/** Einblick der Stelle; null für Stellen ohne Seite (funnel_only). Jede Stelle mit Seite hat einen eigenen Text. */
export function einblick(job: Job, now: Date = new Date()): Einblick | null {
  if (job.status === 'funnel_only') return null;
  return EINBLICKE[job.id](job, now);
}
