import { FAHRPLAN_STAND } from './datenklassen';
import { heuteInWetzlar, istOrtIndexierbar } from './indexierung';
import { getPublishedPlaces } from './registry';

/**
 * Fahrplan-Frische der Ortsseiten (Gate I5, Prüfung E-029): Die Bus- und Bahndaten gelten bis zum Samstag vor dem
 * Fahrplanwechsel (FAHRPLAN_STAND.gueltigBis). Am Tag danach gehen alle Ortsseiten mit diesem Stand auf
 * `noindex,follow`, und die Kreis-Hubs blenden ihren Abschnitt „Mit Bus und Bahn“ aus. Wie bei den Stellen
 * (lib/jobs/frische.ts) hält .github/workflows/fahrplan-frische.yml ab FAHRPLAN_VORLAUF_TAGE vorher genau ein Issue
 * offen, und die CI schlägt FAHRPLAN_CI_TAGE vorher fehl (lib/places/__tests__/frische.test.ts, echte Uhr).
 * Ablauf der Neuberechnung: docs/operations/orte-oepnv.md, „Neuberechnung zum Fahrplanwechsel im Dezember“.
 */

/** Vorlauf der Erinnerung in Tagen (wie bei den Stellen). */
export const FAHRPLAN_VORLAUF_TAGE = 28;
/** Ab so vielen Resttagen schlägt die CI fehl. */
export const FAHRPLAN_CI_TAGE = 14;

/** Titel des einen Issues; der Workflow findet ein offenes Issue an diesem Titel wieder. */
export const FAHRPLAN_ISSUE_TITEL = 'Fahrplan-Frische: Bus und Bahn der Ortsseiten neu rechnen';

export interface FahrplanBericht {
  /** Letzter Tag, an dem die Daten gelten (JJJJ-MM-TT). */
  gueltigBis: string;
  /** Tage von heute (Wetzlar) bis gueltigBis; 0 am letzten gültigen Tag, negativ danach. */
  restTage: number;
  /** Erinnerung fällig: höchstens FAHRPLAN_VORLAUF_TAGE Resttage (oder schon abgelaufen). */
  faellig: boolean;
  /** Ortsseiten, die heute indexiert sind und mit dem Stand auf noindex gehen. */
  betroffen: number;
}

const TAG_MS = 24 * 60 * 60 * 1000;

/** Ganze Tage zwischen zwei Kalendertagen (JJJJ-MM-TT). */
function tageZwischen(von: string, bis: string): number {
  return Math.round((Date.parse(`${bis}T00:00:00Z`) - Date.parse(`${von}T00:00:00Z`)) / TAG_MS);
}

export function fahrplanBericht(now: Date, gueltigBis: string = FAHRPLAN_STAND.gueltigBis): FahrplanBericht {
  const restTage = tageZwischen(heuteInWetzlar(now), gueltigBis);
  const betroffen = getPublishedPlaces().filter((place) => istOrtIndexierbar(place, now)).length;
  return { gueltigBis, restTage, faellig: restTage <= FAHRPLAN_VORLAUF_TAGE, betroffen };
}

const DATUM = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' });
const datum = (value: number | Date) => DATUM.format(value);
const tagDanach = (iso: string) => new Date(Date.parse(`${iso}T12:00:00Z`) + TAG_MS);

/** Text des Issues (Markdown), Schritte wie in docs/operations/orte-oepnv.md. Leer, wenn nichts zu tun ist. */
export function fahrplanText(bericht: FahrplanBericht, now: Date): string {
  if (!bericht.faellig) return '';
  const ende = datum(Date.parse(`${bericht.gueltigBis}T12:00:00Z`));
  const wechsel = datum(tagDanach(bericht.gueltigBis));
  const lage =
    bericht.restTage < 0
      ? `Die Fahrplandaten gelten nur bis ${ende}; seit dem ${wechsel} sind die Ortsseiten mit diesem Stand auf \`noindex,follow\`, und die Kreis-Hubs zeigen keinen Abschnitt „Mit Bus und Bahn“.`
      : `Die Fahrplandaten gelten bis ${ende} (noch ${bericht.restTage} Tage). Ab dem ${wechsel} gehen ${bericht.betroffen} heute indexierte Ortsseiten auf \`noindex,follow\`, und die Kreis-Hubs blenden „Mit Bus und Bahn“ aus.`;
  return [
    `Erstellt von \`.github/workflows/fahrplan-frische.yml\` am ${datum(now)}. Die CI schlägt ${FAHRPLAN_CI_TAGE} Tage vor dem Ende fehl (\`lib/places/__tests__/frische.test.ts\`).`,
    '',
    lage,
    '',
    'So geht es (`docs/operations/orte-oepnv.md`, „Neuberechnung zum Fahrplanwechsel im Dezember“):',
    '',
    '1. Die freien Datensätze „Deutschland Nahverkehr“ und „Deutschland Regionalverkehr“ von gtfs.de laden, sobald `calendar.txt` über den Fahrplanwechsel hinausreicht (meist ab Mitte November).',
    '2. Stichtag: ein Schultag im neuen Fahrplan vor den Weihnachtsferien.',
    '3. `node scripts/places/oepnv.mjs …` und `node scripts/places/oepnv-gegenprobe.mjs`, dann `bun run orte:gate`.',
    '4. `bun run test`, `bun run build`, `bun run test:graph`, `bun run test:similarity`; committen und vor dem Wechsel mergen.',
  ].join('\n');
}
