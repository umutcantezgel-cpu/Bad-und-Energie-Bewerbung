import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterAll, describe, expect, it } from 'vitest';
import { GATE } from '@/lib/places/qualitaet';
import {
  DEFAULT_DIR,
  MAX_JACCARD,
  REPORT_PAIRS,
  comparePages,
  findHtmlFiles,
  isNoindex,
  isPlacePage,
  jaccard,
  jsonLdTypes,
  mainText,
  placePageKind,
  shingles,
  tokens,
} from '../check-local-similarity.mjs';

/** Ein vorgerendertes Dokument wie von `next build`: ein @graph im Kopf, Kopf und Fuß um <main>. */
const doc = (types: string[], main: string, robots = '') =>
  `<!DOCTYPE html><html><head>${robots ? `<meta name="robots" content="${robots}"/>` : ''}<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': types.map((type) => ({ '@type': type })),
  })}</script></head><body><header>Menü Stellen Bewerben</header><main id="inhalt">${main}</main><footer>Impressum Datenschutz</footer></body></html>`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'local-similarity-'));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('check-local-similarity: Gate I4 am gebauten HTML (E-029; vorher U3, Review Phase 2, Punkt 15)', () => {
  it('Grenze und Ausgabeordner wie im Gate und im Build', () => {
    expect(MAX_JACCARD).toBe(0.4);
    expect(MAX_JACCARD).toBe(GATE.maxJaccardHtml);
    expect(REPORT_PAIRS).toBe(5);
    expect(DEFAULT_DIR.split(path.sep).join('/')).toBe('.next/server/app/einsatzgebiet');
  });

  it('liest nur den sichtbaren Text im <main>: ohne Skripte, Stile, SVG, Kommentare, Kopf und Fuß', () => {
    const html = doc(
      ['WebPage', 'Place'],
      '<h1>SHK-Jobs für Aßlar</h1><script>var x="geheim"</script><style>.a{}</style>' +
        '<svg role="img"><title>Plan</title><text>Lahn</text></svg><p>8&nbsp;km bis zum&#x20;Firmensitz &amp; Lager</p><!-- Kommentar -->',
    );
    expect(mainText(html)).toBe('SHK-Jobs für Aßlar 8 km bis zum Firmensitz & Lager');
    expect(mainText('<p>ohne main</p>')).toBe('');
  });

  it('Wörter wie im Gate: Kleinschreibung, Zahlen mit Komma oder Punkt bleiben ein Wort', () => {
    expect(tokens('Luftlinie 4,5 km, Gehalt 3.600 €')).toEqual(['luftlinie', '4,5', 'km', 'gehalt', '3.600']);
    expect(shingles('a b c d e f').size).toBe(2);
    expect([...shingles('a b c')]).toEqual(['a b c']);
    expect(shingles('').size).toBe(0);
    expect(jaccard(new Set(['x', 'y']), new Set(['y', 'z']))).toBeCloseTo(1 / 3, 5);
    expect(jaccard(new Set(), new Set())).toBe(0);
  });

  it('Ortsseite = JSON-LD mit Place und ohne CollectionPage; Kreis-Hubs und Weiterleitungen zählen nicht', () => {
    expect(jsonLdTypes(doc(['WebPage', 'Place', 'BreadcrumbList'], ''))).toEqual(new Set(['WebPage', 'Place', 'BreadcrumbList']));
    expect(isPlacePage(doc(['WebPage', 'Place'], 'x'))).toBe(true);
    expect(isPlacePage(doc(['CollectionPage', 'ItemList'], 'x'))).toBe(false);
    expect(isPlacePage('<html><body>NEXT_REDIRECT;replace;/einsatzgebiet#hochtaunuskreis;308;</body></html>')).toBe(false);
    expect(isPlacePage('<script type="application/ld+json">{kaputt</script>')).toBe(false);
  });

  it('noindex-Ortsseiten (Gate nicht bestanden) zählen als Ortsseite, werden aber nicht verglichen', () => {
    expect(isNoindex(doc(['WebPage'], 'x', 'noindex, follow'))).toBe(true);
    expect(isNoindex(doc(['WebPage'], 'x', 'index, follow'))).toBe(false);
    expect(isNoindex('<meta name="googlebot" content="noindex"/>')).toBe(true);
    expect(isNoindex('<meta name="description" content="noindex im Text"/>')).toBe(false);
    expect(placePageKind(doc(['WebPage', 'Place', 'BreadcrumbList'], 'x'))).toBe('indexierbar');
    // app/einsatzgebiet/seo.ts lässt Place und BreadcrumbList bei noindex weg; die Seite bleibt eine WebPage.
    expect(placePageKind(doc(['WebPage'], 'x', 'noindex, follow'))).toBe('noindex');
    expect(placePageKind(doc(['WebPage', 'Place'], 'x', 'noindex, follow'))).toBe('noindex');
    expect(placePageKind(doc(['CollectionPage', 'ItemList'], 'x', 'noindex, follow'))).toBeNull();
    expect(placePageKind(doc(['WebPage'], 'x'))).toBeNull();
  });

  it('sortiert alle Paare, meldet die über 0,40 und den Anteil gemeinsamer Wendungen', () => {
    const gemeinsam = 'offen sind vier stellen jede mit gehalt bzw vergütung im kundendienst';
    const pages = [
      { name: 'a', text: `${gemeinsam} aßlar liegt nördlich` },
      { name: 'b', text: `${gemeinsam} solms liegt westlich` },
      { name: 'c', text: 'ganz anderer text ohne jede überschneidung mit den anderen seiten' },
    ];
    const result = comparePages(pages);
    expect(result.pairs).toHaveLength(3);
    expect(result.pairs[0]).toMatchObject({ a: 'a', b: 'b' });
    expect(result.pairs[0].value).toBeGreaterThan(MAX_JACCARD);
    expect(result.tooSimilar.map((p: { a: string; b: string }) => `${p.a}/${p.b}`)).toEqual(['a/b']);
    expect(result.commonShare).toBeGreaterThan(0);
    expect(result.maxCommonShare).toBeLessThanOrEqual(1);
  });

  it('findet .html rekursiv; ein fehlender Ordner ergibt keine Dateien', () => {
    fs.mkdirSync(path.join(tmp, 'tief'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'b.html'), '');
    fs.writeFileSync(path.join(tmp, 'b.rsc'), '');
    fs.writeFileSync(path.join(tmp, 'tief', 'a.html'), '');
    expect(findHtmlFiles(tmp).map((file: string) => path.relative(tmp, file))).toEqual(['b.html', path.join('tief', 'a.html')]);
    expect(findHtmlFiles(path.join(tmp, 'fehlt'))).toEqual([]);
  });

  const script = path.resolve(__dirname, '../check-local-similarity.mjs');
  const run = (dir: string) => spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });

  it('CLI: ohne gebaute Seiten Exit 1 mit klarer Meldung (eine leere Prüfung ist nie grün)', () => {
    const empty = fs.mkdtempSync(path.join(tmp, 'leer-'));
    const result = run(empty);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('No prerendered .html found');
  });

  it('CLI: grün unter der Grenze, rot darüber, mit den ähnlichsten Paaren', () => {
    const ok = fs.mkdtempSync(path.join(tmp, 'ok-'));
    const words = (seed: string) => Array.from({ length: 40 }, (_, i) => `${seed}${i}`).join(' ');
    fs.writeFileSync(path.join(ok, 'asslar.html'), doc(['WebPage', 'Place'], `<p>Aßlar ${words('a')}</p>`));
    fs.writeFileSync(path.join(ok, 'solms.html'), doc(['WebPage', 'Place'], `<p>Solms ${words('s')}</p>`));
    fs.writeFileSync(path.join(ok, 'lahn-dill-kreis.html'), doc(['CollectionPage', 'ItemList'], `<p>Aßlar ${words('a')}</p>`));
    const green = run(ok);
    expect(green.status).toBe(0);
    expect(green.stdout).toContain('2 indexable place pages (0 noindex, 1 other document(s) skipped)');

    const bad = fs.mkdtempSync(path.join(tmp, 'rot-'));
    fs.writeFileSync(path.join(bad, 'herborn.html'), doc(['WebPage', 'Place'], `<p>Herborn ${words('x')}</p>`));
    fs.writeFileSync(path.join(bad, 'sinn.html'), doc(['WebPage', 'Place'], `<p>Sinn ${words('x')}</p>`));
    const red = run(bad);
    expect(red.status).toBe(1);
    expect(red.stdout).toMatch(/❌ 0\.\d{3} {2}herborn ↔ sinn/);
    expect(red.stderr).toContain('1 pair(s) above 0.40');
  });

  it('CLI: eine noindex-Ortsseite zählt nicht mit, auch wenn sie einer indexierbaren gleicht', () => {
    const words = (seed: string) => Array.from({ length: 40 }, (_, i) => `${seed}${i}`).join(' ');
    const dir = fs.mkdtempSync(path.join(tmp, 'noindex-'));
    fs.writeFileSync(path.join(dir, 'herborn.html'), doc(['WebPage', 'Place'], `<p>Herborn ${words('x')}</p>`));
    fs.writeFileSync(path.join(dir, 'sinn.html'), doc(['WebPage'], `<p>Sinn ${words('x')}</p>`, 'noindex, follow'));
    fs.writeFileSync(path.join(dir, 'solms.html'), doc(['WebPage', 'Place'], `<p>Solms ${words('s')}</p>`));
    const result = run(dir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('1 place page(s) with noindex (gate not passed) are not compared: sinn');
    expect(result.stdout).toContain('2 indexable place pages (1 noindex, 0 other document(s) skipped), 1 pairs');

    // Ortsseiten gebaut, aber keine zwei indexierbar: kein Beinahe-Duplikat im Index möglich, grün mit Hinweis.
    const allNoindex = fs.mkdtempSync(path.join(tmp, 'alle-noindex-'));
    fs.writeFileSync(path.join(allNoindex, 'herborn.html'), doc(['WebPage'], `<p>Herborn ${words('x')}</p>`, 'noindex, follow'));
    fs.writeFileSync(path.join(allNoindex, 'sinn.html'), doc(['WebPage'], `<p>Sinn ${words('x')}</p>`, 'noindex, follow'));
    const none = run(allNoindex);
    expect(none.status).toBe(0);
    expect(none.stdout).toContain('Only 0 indexable place page(s)');

    // Nur Hubs und Weiterleitungen, keine Ortsseite: bleibt rot (eine leere Prüfung ist nie grün).
    const hubs = fs.mkdtempSync(path.join(tmp, 'hubs-'));
    fs.writeFileSync(path.join(hubs, 'lahn-dill-kreis.html'), doc(['CollectionPage', 'ItemList'], `<p>${words('a')}</p>`));
    fs.writeFileSync(path.join(hubs, 'wetteraukreis.html'), doc(['CollectionPage', 'ItemList'], `<p>${words('b')}</p>`, 'noindex, follow'));
    const empty = run(hubs);
    expect(empty.status).toBe(1);
    expect(empty.stderr).toContain('only 0 place page(s)');
  });
});
