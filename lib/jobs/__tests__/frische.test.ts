import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FRISCHE_ISSUE_TITEL, FRISCHE_VORLAUF_TAGE, frischeBericht, frischeText } from '../frische';
import { ALL_JOBS, getJobById } from '../registry';
import { MAX_VALID_DAYS, defineJob, type JobInput } from '../schema';

/**
 * Stellen-Frische (Plan §C3): Bericht für das tägliche Issue (.github/workflows/stellen-frische.yml). 28 Tage Vorlauf,
 * abgelöste Stellen gesondert, Text mit den Schritten aus docs/operations/stellen-pflegen.md.
 */

const ROOT = path.resolve(__dirname, '../../..');
const WORKFLOW = readFileSync(path.join(ROOT, '.github/workflows/stellen-frische.yml'), 'utf8');
const ids = (jobs: readonly { id: string }[]) => jobs.map((job) => job.id);
const azubi = getJobById('ausbildung-anlagenmechaniker-shk')!;
const azubi27 = getJobById('ausbildung-anlagenmechaniker-shk-2027')!;

describe('frischeBericht', () => {
  it('heute (14.10.2026): nichts zu tun, kein Text', () => {
    const now = new Date('2026-10-14T08:00:00Z');
    expect(frischeBericht(now)).toEqual({ verlaengern: [], archivieren: [] });
    expect(frischeText(frischeBericht(now), now)).toBe('');
  });

  it('28 Tage vor dem Ablauf (12.01.2027) erinnert er an jede Stelle, doppelt so früh wie die CI', () => {
    expect(FRISCHE_VORLAUF_TAGE).toBe(28);
    const vorher = frischeBericht(new Date('2026-12-14T12:00:00+01:00'));
    expect(vorher.verlaengern).toEqual([]);
    const danach = frischeBericht(new Date('2026-12-16T12:00:00+01:00'));
    // Die Ausbildung 2026 zählt mit: Ihre Nachfolgerin läuft selbst vor dem Stichtag ab (keine Ablösung)
    expect(ids(danach.verlaengern)).toEqual(ids(ALL_JOBS.filter((job) => job.status === 'published')));
    expect(danach.archivieren).toEqual([]);
  });

  it('abgelaufen und abgelöst: archivieren statt verlängern', () => {
    // Nachfolgerin bis Ende März verlängert (90 Tage ab updatedAt): die Ausbildung 2026 ist dann nur noch zu archivieren
    const neu = defineJob({ ...(azubi27 as unknown as JobInput), updatedAt: '2027-01-02', validThrough: '2027-03-31T23:59:59+02:00' });
    const jobs = ALL_JOBS.map((job) => (job.id === neu.id ? neu : job));
    const now = new Date('2027-01-02T08:00:00Z');
    const bericht = frischeBericht(now, jobs);
    expect(ids(bericht.archivieren)).toEqual([azubi.id]);
    expect(ids(bericht.verlaengern)).not.toContain(azubi.id);
    expect(ids(bericht.verlaengern)).not.toContain(neu.id);
    const text = frischeText(bericht, now);
    expect(text).toContain('## Archivieren (abgelaufen, die Nachfolgerin ist live)');
    expect(text).toContain(`\`${azubi.id}\``);
    expect(text).toContain(`Nachfolgerin **${azubi27.shortTitle}**`);
    expect(text).toContain('abgelaufen am 31.12.2026');
  });

  it('Text: je Stelle Kennung, Referenz, Ablauf, Datei; die Schritte mit der 90-Tage-Regel', () => {
    const now = new Date('2027-01-02T08:00:00Z');
    const text = frischeText(frischeBericht(now), now);
    expect(text).toContain('Erstellt von `.github/workflows/stellen-frische.yml` am 02.01.2027.');
    for (const job of frischeBericht(now).verlaengern) {
      expect(text).toContain(`(\`${job.id}\`, ${job.referenceCode})`);
      expect(text).toContain(`\`lib/jobs/data/${job.id}.ts\``);
      expect(existsSync(path.join(ROOT, `lib/jobs/data/${job.id}.ts`)), job.id).toBe(true);
    }
    expect(text).toContain(`\`validThrough\` höchstens ${MAX_VALID_DAYS} Tage danach`);
    expect(text).toContain('läuft am 12.01.2027 ab');
    expect(text).toContain('docs/operations/stellen-pflegen.md');
  });
});

describe('.github/workflows/stellen-frische.yml', () => {
  it('täglich und von Hand, mit minimalen Rechten (Code lesen, Issues schreiben)', () => {
    expect(WORKFLOW).toMatch(/schedule:\n\s+# [^\n]*\n\s+- cron: "\d+ \d+ \* \* \*"/);
    expect(WORKFLOW).toContain('workflow_dispatch:');
    expect(WORKFLOW).not.toMatch(/pull_request|push:/);
    const rechte = /^permissions:\n((?: {2}\S.*\n)+)/m.exec(WORKFLOW)![1].trim().split('\n').map((zeile) => zeile.trim());
    expect(rechte).toEqual(['contents: read', 'issues: write']);
    // Keine Rechte je Job, die mehr erlauben
    expect(WORKFLOW.match(/permissions:/g)).toHaveLength(1);
  });

  it('nutzt den Bericht aus lib/jobs/frische.ts und genau ein Issue mit festem Titel', () => {
    expect(WORKFLOW).toContain("await import('./lib/jobs/frische.ts')");
    expect(WORKFLOW).toContain('FRISCHE_ISSUE_TITEL');
    expect(FRISCHE_ISSUE_TITEL).toBe('Stellen-Frische: Stellen verlängern oder schließen');
    for (const befehl of ['gh issue list', 'gh issue edit', 'gh issue create', 'gh issue close']) expect(WORKFLOW).toContain(befehl);
    // Ausgaben gehen über env in das Skript, nie als ${{ … }} mitten in den Befehl (keine Einschleusung über Ausdrücke)
    const bloecke = [...WORKFLOW.matchAll(/^ {8}run: \|\n((?:^ {10}.*\n|^\s*\n)+)/gm)].map((m) => m[1]);
    expect(bloecke).toHaveLength(2);
    for (const block of bloecke) expect(block).not.toContain('${{');
    expect(WORKFLOW).toMatch(/TITEL: \$\{\{ steps\.bericht\.outputs\.titel \}\}/);
  });
});
