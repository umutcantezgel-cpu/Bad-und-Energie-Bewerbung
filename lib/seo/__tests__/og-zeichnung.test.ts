import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LEITSTELLE } from '@/lib/zeichnung/buero/leitstelle';
import * as OG_HAUS from '@/lib/seo/og-haus';
import { OG_COLOR, OG_ZEICHNUNG_STAND, jobOgImage, placeOgImage, DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';
import { getActiveJobs } from '@/lib/jobs/registry';
import { themaOgImage } from '@/lib/themen/og';
import { getThemen } from '@/lib/themen/registry';
import { getThemaPageText } from '@/lib/themen/text';

/**
 * Stand der Zeichnung in den Teilen-Bildern (Prüfung E-031, D1-1): Die Bürostelle zeigte nach E-031 die Leitstelle
 * statt des Hausschnitts, die übrigen Bilder den Hausschnitt mit Wärmefeld – unter derselben Adresse wie vorher; die
 * Netzwerke zeigten weiter das alte Bild. Jede Adresse trägt darum `z=<Stand der Zeichnung>`, und dieser Test hält den
 * Stand am Fingerabdruck der Zeichnung: Quelltext des Renderers und der Hausgeometrie, alle Formen und Farben.
 *
 * Ändert sich die Zeichnung, schlägt der Test an. Dann einen neuen Eintrag mit späterem Stand an HISTORIE anhängen
 * (Datum der Änderung) und OG_ZEICHNUNG_STAND (lib/seo/og-image.ts) darauf setzen; ein alter Stand mit neuem
 * Fingerabdruck geht nicht durch.
 */
const HISTORIE: readonly { stand: string; fingerabdruck: string }[] = [{ stand: '2026-10-15', fingerabdruck: '9256680d78f4cf03' }];

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');

function fingerabdruck(): string {
  const haus = {
    ...OG_HAUS,
    leitungen: [OG_HAUS.ogLeitungen(true), OG_HAUS.ogLeitungen(false)],
    pfeile: [OG_HAUS.ogPfeile(true), OG_HAUS.ogPfeile(false)],
  };
  const inhalt = JSON.stringify({ renderer: quelle('lib/seo/og-render.tsx'), hausQuelle: quelle('lib/seo/og-haus.ts'), haus, leitstelle: LEITSTELLE, farben: OG_COLOR });
  return createHash('sha256').update(inhalt).digest('hex').slice(0, 16);
}

describe('Stand der Zeichnung in den Teilen-Bildern', () => {
  it('Historie: Stände streng steigend, Fingerabdrücke verschieden, der letzte ist der heutige Stand', () => {
    for (let i = 1; i < HISTORIE.length; i += 1) expect(HISTORIE[i].stand > HISTORIE[i - 1].stand).toBe(true);
    expect(new Set(HISTORIE.map((h) => h.fingerabdruck)).size).toBe(HISTORIE.length);
    expect(HISTORIE.at(-1)!.stand).toBe(OG_ZEICHNUNG_STAND);
    expect(OG_ZEICHNUNG_STAND).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('der Fingerabdruck der Zeichnung gehört zum heutigen Stand (neue Zeichnung → neuer Stand)', () => {
    expect(fingerabdruck(), 'Zeichnung geändert: neuen Stand in HISTORIE und OG_ZEICHNUNG_STAND eintragen').toBe(HISTORIE.at(-1)!.fingerabdruck);
  });

  it('jede Adresse eines Teilen-Bilds trägt den Stand: Start, Stellen (offen und besetzt), Orte, Themen', () => {
    const abfrage = `z=${OG_ZEICHNUNG_STAND}`;
    const adressen = [
      DEFAULT_OG_IMAGE.url,
      ...getActiveJobs().flatMap((job) => [jobOgImage(job, true).url, jobOgImage(job, false).url]),
      placeOgImage({ path: '/einsatzgebiet/x', name: 'X', updatedAt: '2026-01-01', distanceKm: 1 }).url,
      ...getThemen().map((thema) => themaOgImage(getThemaPageText(thema.id, { jobs: getActiveJobs() })).url),
    ];
    for (const url of adressen) expect(new URL(url, 'https://example.org').searchParams.get('z'), url).toBe(OG_ZEICHNUNG_STAND);
    expect(adressen.every((url) => url.includes(abfrage))).toBe(true);
  });
});
