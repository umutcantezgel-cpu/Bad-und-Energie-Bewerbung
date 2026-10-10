/**
 * Texte und Maße der Stellenseite (R5-JOBS-02, E-023), nur aus belegten Quellen gebaut: Stellen-Registry
 * (lib/jobs/data), lib/content/facts.ts und lib/content/company.ts. Reines Modul ohne JSX, geprüft in
 * app/jobs/__tests__/stelle.test.ts.
 */
import type { IconName } from '@/components/icons';
import type { SeitenkopfMass } from '@/components/seitenkopf';
import { COMPANY } from '@/lib/content/company';
import { FACTS, type FactId } from '@/lib/content/facts';
import { employmentLabel } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';

const NBSP = ' ';

/** Sprungziele der Seite: der Zweitweg im Kopf zeigt auf die Aufgaben, die Hauptaktion auf den Flow. */
export const STELLE_ANKER = { aufgaben: 'aufgaben', bewerben: 'bewerben' } as const;

/** Hauptaktion im Kopf: springt zum eingebetteten Flow (#bewerben), wie „Jetzt bewerben“ im Einstieg. */
export const KOPF_AKTION = { href: `#${STELLE_ANKER.bewerben}`, label: 'Jetzt bewerben' } as const;

/** Zweitweg im Kopf (unterstrichener Textlink mit Pfeil nach unten). */
export const KOPF_ZWEITWEG = { href: `#${STELLE_ANKER.aufgaben}`, label: 'Aufgaben ansehen' } as const;

/** Mikrotext unter dem Knopf, gleich gebaut wie im Einstieg der Startseite (HERO.microcopy). */
export const KOPF_MIKROTEXT = `Dauert ca. ${FACTS.apply60s.value}${NBSP}Sekunden. ${FACTS.noCvNeeded.short}.`;

/**
 * Etikett über der h1: Anstellung und Dauer („Vollzeit · Unbefristet“, „Ausbildung · 3,5 Jahre“), dazu der
 * Ort, wenn die h1 ihn nicht schon nennt.
 */
export function kopfEtikett(job: Pick<Job, 'employment' | 'location' | 'seo'>): string {
  const teile = [employmentLabel(job)];
  if (!job.seo.h1.includes(job.location.city)) teile.push(job.location.city);
  return teile.join(' · ');
}

export interface KopfTitel {
  /** Berufsname in Bildgröße, z. B. „Anlagenmechaniker SHK“. */
  haupt: string;
  /** Rest der h1 in Textgröße auf eigener Zeile, z. B. „(m/w/d) in Wetzlar“; null, wenn nichts folgt. */
  zusatz: string | null;
}

/**
 * Teilt die h1 (seo.h1, Wortlaut bleibt) vor „(m/w/d)“ bzw. vor einem Gedankenstrich: Der Berufsname steht
 * in Bildgröße, der Rest kleiner darunter. `${haupt} ${zusatz}` ergibt wieder die h1.
 */
export function kopfTitel(h1: string): KopfTitel {
  const stellen = [h1.indexOf(' (m/w/d)'), h1.indexOf(' – ')].filter((i) => i > 0);
  if (stellen.length === 0) return { haupt: h1, zusatz: null };
  const schnitt = Math.min(...stellen);
  return { haupt: h1.slice(0, schnitt), zusatz: h1.slice(schnitt + 1) };
}

const woerter = (text: string) => text.toLocaleLowerCase('de-DE').match(/[\p{L}\p{N}]+/gu) ?? [];

/**
 * Unterzeile mit Rohrklammer: die Kurzbeschreibung der Stelle (summary). Sätze am Anfang, deren Wörter alle
 * schon in der h1 stehen, entfallen (Ausbildung: „Ausbildung 2026: Einstieg noch möglich.“ wiederholt die h1
 * „… – Einstieg 2026 noch möglich“). Kürzen ist erlaubt, der Rest bleibt wörtlich (KERN K-014).
 */
export function kopfUnterzeile(job: Pick<Job, 'summary' | 'seo'>): string {
  const h1 = new Set(woerter(job.seo.h1));
  const saetze = job.summary.split(/(?<=[.!?])\s+/);
  while (saetze.length > 1 && woerter(saetze[0]).every((wort) => h1.has(wort))) saetze.shift();
  return saetze.join(' ');
}

/**
 * Maße an der Zeichnung (Variante 1: Maßketten für die Arbeitszeit und das Einsatzgebiet): „13:30 Freitags
 * Feierabend“, wenn die Stelle den Fakt führt, und der Radius aus den Stellendaten.
 */
export function kopfMasse(job: Pick<Job, 'benefitFactIds' | 'location'>): SeitenkopfMass[] {
  const masse: SeitenkopfMass[] = [];
  const freitag = FACTS.friday1330;
  if (job.benefitFactIds.includes('friday1330') && freitag.value && freitag.label) {
    masse.push({ wert: freitag.value, name: freitag.label });
  }
  masse.push({ wert: `${job.location.radiusKm}${NBSP}km`, name: 'Einsatzradius' });
  return masse;
}

/** Das Wärmebild (Variante 3, statisch) gehört zur Wärmepumpen-Stelle im Kundendienst. */
export function zeigtWaermebild(job: Pick<Job, 'category'>): boolean {
  return job.category === 'kundendienst';
}

/** Ansprechpartner der Stellenseite (Kontaktkarte neben dem Flow). */
export const ANSPRECHPARTNER = { name: COMPANY.managingDirector.name, role: COMPANY.managingDirector.title } as const;

/**
 * Icons der Vorteile (components/icons): je Fakt ein passendes Zeichen der eigenen Familie, sonst der Haken.
 * Rein dekorativ; der Text trägt die Aussage.
 */
const VORTEIL_ICON: Partial<Record<FactId, IconName>> = {
  aboveTariff: 'banknote',
  vacation30: 'calendar-off',
  friday1330: 'uhr',
  noWeekendOnCall: 'shield-check',
  noFarAssembly: 'standort',
  radius35: 'map',
  ipadSmartphone: 'tablet-smartphone',
  paidCertifications: 'graduation-cap',
  permanentContract: 'file-check',
  takeoverGuarantee: 'file-check',
  hilti: 'werkzeug',
  azubiToolkit: 'werkzeug',
  azubiPay: 'banknote',
  travelAllowance: 'servicefahrzeug',
  driversLicenseGrant: 'servicefahrzeug',
  vehicle: 'servicefahrzeug',
  privateCarOnePercent: 'servicefahrzeug',
  measurementTools: 'waermepumpe',
  directLine: 'phone',
  mentoring: 'users',
  familyTeam: 'users',
};

export function vorteilIcon(id: FactId): IconName {
  return VORTEIL_ICON[id] ?? 'check';
}

/** Icons der Paketzeilen nach ihrem Etikett („Fahrzeug“, „Werkzeug“, „Vergütung“, „Mobilität“). */
const PAKET_ICON: Readonly<Record<string, IconName>> = {
  Fahrzeug: 'servicefahrzeug',
  Mobilität: 'servicefahrzeug',
  Werkzeug: 'werkzeug',
  Vergütung: 'banknote',
};

export function paketIcon(label: string): IconName {
  return PAKET_ICON[label] ?? 'check';
}
