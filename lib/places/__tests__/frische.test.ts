import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getActiveJobs } from '@/lib/jobs/registry';
import { FAHRPLAN_STAND, fahrplanAktuell } from '../datenklassen';
import { FAHRPLAN_CI_TAGE, FAHRPLAN_ISSUE_TITEL, FAHRPLAN_VORLAUF_TAGE, fahrplanBericht, fahrplanText } from '../frische';
import { istOrtIndexierbar } from '../indexierung';
import { getHubKreise, getPublishedPlaces } from '../registry';
import { getKreisPageText } from '../text';

/**
 * Fahrplan-Frische (Gate I5, Prüfung E-029): Vorwarnung vor dem Ende der Fahrplandaten wie bei den Stellen (Issue 28
 * Tage vorher, CI 14 Tage vorher) und Kreis-Hubs ohne abgelaufene Sätze zu Bus und Bahn.
 */

const ROOT = path.resolve(__dirname, '../../..');
const WORKFLOW = readFileSync(path.join(ROOT, '.github/workflows/fahrplan-frische.yml'), 'utf8');
/** Mittag in Wetzlar an einem Kalendertag. */
const tag = (iso: string) => new Date(`${iso}T12:00:00+01:00`);

describe('fahrplanBericht', () => {
  it('die Fahrplandaten gelten noch mindestens 14 Tage (echte Uhr; sonst neu rechnen, docs/operations/orte-oepnv.md)', () => {
    expect(FAHRPLAN_CI_TAGE).toBe(14);
    const { restTage, gueltigBis } = fahrplanBericht(new Date());
    expect(restTage, `Fahrplandaten gelten bis ${gueltigBis}: ÖPNV neu rechnen (docs/operations/orte-oepnv.md)`).toBeGreaterThanOrEqual(FAHRPLAN_CI_TAGE);
  });

  it('heute (14.10.2026): nichts zu tun, kein Text; 28 Tage vor dem Ende erinnert er, doppelt so früh wie die CI', () => {
    expect(FAHRPLAN_VORLAUF_TAGE).toBe(28);
    expect(FAHRPLAN_STAND.gueltigBis).toBe('2026-12-12');
    const heute = fahrplanBericht(tag('2026-10-14'));
    expect(heute).toMatchObject({ gueltigBis: '2026-12-12', restTage: 59, faellig: false });
    expect(fahrplanText(heute, tag('2026-10-14'))).toBe('');
    expect(fahrplanBericht(tag('2026-11-13')).faellig).toBe(false);
    const faellig = fahrplanBericht(tag('2026-11-14'));
    expect(faellig).toMatchObject({ restTage: 28, faellig: true });
    // Alle heute indexierten Ortsseiten gehen mit diesem Stand auf noindex
    expect(faellig.betroffen).toBe(getPublishedPlaces().filter((place) => istOrtIndexierbar(place, tag('2026-11-14'))).length);
    expect(faellig.betroffen).toBe(54);
  });

  it('Text: Ende und Tag des Wechsels, Zahl der Ortsseiten, Schritte aus orte-oepnv.md; nach dem Ende ohne Zählung', () => {
    const now = tag('2026-11-20');
    const text = fahrplanText(fahrplanBericht(now), now);
    expect(text).toContain('Erstellt von `.github/workflows/fahrplan-frische.yml` am 20.11.2026.');
    expect(text).toContain('Die Fahrplandaten gelten bis 12.12.2026 (noch 22 Tage). Ab dem 13.12.2026 gehen 54 heute indexierte Ortsseiten auf `noindex,follow`');
    expect(text).toContain('docs/operations/orte-oepnv.md');
    for (const befehl of ['node scripts/places/oepnv.mjs', 'node scripts/places/oepnv-gegenprobe.mjs', 'bun run orte:gate', 'bun run test:similarity']) {
      expect(text).toContain(befehl);
    }
    const danach = tag('2026-12-14');
    const textDanach = fahrplanText(fahrplanBericht(danach), danach);
    expect(fahrplanBericht(danach)).toMatchObject({ restTage: -2, faellig: true, betroffen: 0 });
    expect(textDanach).toContain('seit dem 13.12.2026 sind die Ortsseiten mit diesem Stand auf `noindex,follow`');
  });
});

describe('Kreis-Hubs nach dem Ende der Fahrplandaten', () => {
  it('bis gueltigBis „Mit Bus und Bahn“, ab dem Tag danach nicht mehr (Hub bleibt indexiert, kein abgelaufener Fahrplan)', () => {
    const jobs = getActiveJobs();
    expect(fahrplanAktuell(tag('2026-12-12'))).toBe(true);
    expect(fahrplanAktuell(new Date('2026-12-12T23:30:00Z'))).toBe(false); // in Wetzlar schon der 13.12.
    expect(getHubKreise().length).toBeGreaterThan(0);
    for (const kreis of getHubKreise()) {
      const vorher = getKreisPageText(kreis, { jobs, now: tag('2026-12-12') });
      const nachher = getKreisPageText(kreis, { jobs, now: tag('2026-12-13') });
      expect(vorher.sections.map((s) => s.id), kreis.id).toContain('oepnv');
      expect(nachher.sections.map((s) => s.id), kreis.id).not.toContain('oepnv');
      expect(JSON.stringify(nachher), kreis.id).not.toMatch(/Bus und Bahn bis|Tür zu Tür/);
    }
  });
});

describe('.github/workflows/fahrplan-frische.yml', () => {
  it('täglich und von Hand, mit minimalen Rechten (Code lesen, Issues schreiben)', () => {
    expect(WORKFLOW).toMatch(/schedule:\n\s+# [^\n]*\n\s+- cron: "\d+ \d+ \* \* \*"/);
    expect(WORKFLOW).toContain('workflow_dispatch:');
    expect(WORKFLOW).not.toMatch(/pull_request|push:/);
    const rechte = /^permissions:\n((?: {2}\S.*\n)+)/m.exec(WORKFLOW)![1].trim().split('\n').map((zeile) => zeile.trim());
    expect(rechte).toEqual(['contents: read', 'issues: write']);
    expect(WORKFLOW.match(/permissions:/g)).toHaveLength(1);
  });

  it('nutzt den Bericht aus lib/places/frische.ts und genau ein Issue mit festem Titel', () => {
    expect(WORKFLOW).toContain("await import('./lib/places/frische.ts')");
    expect(WORKFLOW).toContain('FAHRPLAN_ISSUE_TITEL');
    expect(FAHRPLAN_ISSUE_TITEL).toBe('Fahrplan-Frische: Bus und Bahn der Ortsseiten neu rechnen');
    for (const befehl of ['gh issue list', 'gh issue edit', 'gh issue create', 'gh issue close']) expect(WORKFLOW).toContain(befehl);
    // Ausgaben gehen über env in das Skript, nie als ${{ … }} mitten in den Befehl
    const bloecke = [...WORKFLOW.matchAll(/^ {8}run: \|\n((?:^ {10}.*\n|^\s*\n)+)/gm)].map((m) => m[1]);
    expect(bloecke).toHaveLength(2);
    for (const block of bloecke) expect(block).not.toContain('${{');
    expect(WORKFLOW).toMatch(/TITEL: \$\{\{ steps\.bericht\.outputs\.titel \}\}/);
  });
});
