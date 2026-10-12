import { describe, expect, it } from 'vitest';
import { MAX_JACCARD, isPlacePage, jaccard, mainText, measure, shingles, tokens } from '../check-uniqueness.mjs';

describe('check-uniqueness: Gate U3 am gebauten HTML (Review Phase 2, Punkt 15)', () => {
  it('liest nur den Text im <main>, ohne Skripte, Stile und Kopf/Fuß', () => {
    const html =
      '<header>Menü Stellen</header><main id="inhalt"><h1>SHK-Jobs für Aßlar</h1><script>var x="geheim"</script>' +
      '<style>.a{}</style><p>8&nbsp;km bis zum Firmensitz</p><!-- Kommentar --></main><footer>Impressum</footer>';
    expect(mainText(html)).toBe('SHK-Jobs für Aßlar 8 km bis zum Firmensitz');
  });

  it('Wörter wie im Gate: Kleinschreibung, Zahlen mit Komma bleiben ein Token', () => {
    expect(tokens('Luftlinie 4,5 km, Gehalt 3.600 €')).toEqual(['luftlinie', '4,5', 'km', 'gehalt', '3.600']);
    expect(shingles('a b c d e f').size).toBe(2);
    expect(jaccard(new Set(['x', 'y']), new Set(['y', 'z']))).toBeCloseTo(1 / 3, 5);
  });

  it('erkennt Ortsseiten (Place) und lässt Kreis-Hubs (CollectionPage) aus', () => {
    expect(isPlacePage('<script type="application/ld+json">{"@type":"Place"}</script>')).toBe(true);
    expect(isPlacePage('{"@type":"CollectionPage"} {"@type":"Place"}')).toBe(false);
  });

  it('meldet Paare über 0,45 und den Anteil gemeinsamer Wendungen', () => {
    const gemeinsam = 'offen sind vier stellen jede mit gehalt bzw vergütung';
    const pages = [
      { name: 'a', text: `${gemeinsam} aßlar liegt nördlich` },
      { name: 'b', text: `${gemeinsam} solms liegt westlich` },
      { name: 'c', text: 'ganz anderer text ohne jede überschneidung mit den anderen' },
    ];
    const result = measure(pages);
    expect(MAX_JACCARD).toBe(0.45);
    expect(result.worst).toMatchObject({ a: 'a', b: 'b' });
    expect(result.tooSimilar.map((p: { a: string; b: string }) => `${p.a}/${p.b}`)).toEqual(['a/b']);
    expect(result.commonShare).toBeGreaterThan(0);
  });
});
