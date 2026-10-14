import { ALL_JOBS, getJobById, getJobsExpiringWithin, isJobLive, type Job } from './registry';
import { MAX_VALID_DAYS, parseJobDate } from './schema';

/**
 * Stellen-Frische (Plan §C3): Jede veröffentlichte Stelle läuft höchstens MAX_VALID_DAYS nach `updatedAt` (Schema). Der
 * Workflow .github/workflows/stellen-frische.yml fragt diesen Bericht täglich ab und hält genau ein Issue offen, solange
 * etwas zu tun ist: 28 Tage vor dem Ablauf, doppelt so früh wie die CI (getJobsExpiringWithin mit 14 Tagen im
 * Registry-Test). So bleibt Zeit, mit dem Inhaber zu sprechen, bevor die CI rot wird.
 */

/** Vorlauf der Erinnerung in Tagen. */
export const FRISCHE_VORLAUF_TAGE = 28;

/** Titel des einen Issues; der Workflow findet ein offenes Issue an diesem Titel wieder. */
export const FRISCHE_ISSUE_TITEL = 'Stellen-Frische: Stellen verlängern oder schließen';

export interface FrischeBericht {
  /** Veröffentlicht und in weniger als 28 Tagen abgelaufen (oder schon abgelaufen), ohne live Nachfolgerin. */
  verlaengern: readonly Job[];
  /** Veröffentlicht, abgelaufen und abgelöst (`nachfolger` live): nur noch `status: 'archived'` setzen. */
  archivieren: readonly Job[];
}

export function frischeBericht(now: Date, jobs: readonly Job[] = ALL_JOBS): FrischeBericht {
  const verlaengern = getJobsExpiringWithin(now, FRISCHE_VORLAUF_TAGE, jobs);
  const archivieren = jobs.filter((job) => job.status === 'published' && !isJobLive(job, now) && !verlaengern.includes(job));
  return { verlaengern, archivieren };
}

const DATUM = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' });
const datum = (value: number | Date) => DATUM.format(value);

function zeile(job: Job, now: Date): string {
  const ablauf = job.validThrough ? parseJobDate(job.validThrough) : null;
  const wann = ablauf === null ? 'ohne Ablaufdatum' : ablauf < now.getTime() ? `abgelaufen am ${datum(ablauf)}` : `läuft am ${datum(ablauf)} ab`;
  return `- **${job.shortTitle}** (\`${job.id}\`, ${job.referenceCode}): ${wann}, zuletzt geändert am ${datum(parseJobDate(job.updatedAt))} · \`lib/jobs/data/${job.id}.ts\``;
}

/** Text des Issues (Markdown), Schritte wie in docs/operations/stellen-pflegen.md. Leer, wenn nichts zu tun ist. */
export function frischeText(bericht: FrischeBericht, now: Date): string {
  const { verlaengern, archivieren } = bericht;
  if (verlaengern.length === 0 && archivieren.length === 0) return '';
  const teile = [
    `Erstellt von \`.github/workflows/stellen-frische.yml\` am ${datum(now)}. Eine veröffentlichte Stelle läuft höchstens ${MAX_VALID_DAYS} Tage nach \`updatedAt\` (Schema); die CI schlägt 14 Tage vor dem Ablauf fehl.`,
  ];
  if (verlaengern.length > 0) {
    teile.push(
      '',
      `## Verlängern oder schließen (Ablauf in weniger als ${FRISCHE_VORLAUF_TAGE} Tagen)`,
      '',
      ...verlaengern.map((job) => zeile(job, now)),
      '',
      'So geht es (`docs/operations/stellen-pflegen.md`):',
      '',
      `1. Mit dem Inhaber klären, ob die Stelle offen bleibt und ob sich Aufgaben, Anforderungen oder Vorteile geändert haben.`,
      `2. Offen: \`updatedAt\` auf heute, \`validThrough\` höchstens ${MAX_VALID_DAYS} Tage danach; die Anzeigen bei BA und HWK am selben Tag verlängern (\`docs/operations/stellenboersen.md\`).`,
      "3. Besetzt: `status: 'archived'` setzen; die Anzeigen bei BA und HWK beenden.",
    );
  }
  if (archivieren.length > 0) {
    teile.push(
      '',
      '## Archivieren (abgelaufen, die Nachfolgerin ist live)',
      '',
      ...archivieren.map((job) => {
        const nachfolger = job.nachfolger ? getJobById(job.nachfolger) : undefined;
        return `${zeile(job, now)} → Nachfolgerin ${nachfolger ? `**${nachfolger.shortTitle}** (\`${nachfolger.id}\`)` : 'fehlt'}`;
      }),
      '',
      "Für jede: `status: 'archived'` setzen und `updatedAt` auf heute. Die Seite zeigt dann „Besetzt“ mit dem Weg zur Nachfolgerin.",
    );
  }
  return teile.join('\n');
}
