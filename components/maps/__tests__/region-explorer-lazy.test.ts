import { createElement, type ReactElement } from 'react';
import { prerender } from 'react-dom/static';
import { describe, expect, it } from 'vitest';
import { RegionExplorer } from '../RegionExplorer';
import { RegionExplorerLazy } from '../RegionExplorerLazy';
import { buildRegionMapData } from '../views';

async function serverHtml(element: ReactElement): Promise<string> {
  const { prelude } = await prerender(element);
  return new Response(prelude).text();
}

/** useId hängt an der Lage im Baum; für den Vergleich zählt nur das Markup. */
const ohneIds = (html: string) => html.replace(/_R_[A-Za-z0-9]+_/g, '_ID_');

/**
 * Das Einsatzgebiet lädt seinen Code erst in Reichweite (V6-A2). Das Server-HTML bleibt dabei dasselbe wie
 * vorher: kein Platzhalter, also kein Sprung beim Hydrieren, und ohne JavaScript der gesperrte Zustand.
 */
describe('RegionExplorerLazy auf dem Server', () => {
  const props = { data: buildRegionMapData(), mapsAvailable: true };

  it('rendert dasselbe Markup wie der RegionExplorer, nur in Hülle und Activity-Grenze', async () => {
    const lazy = await serverHtml(createElement(RegionExplorerLazy, props));
    const direkt = await serverHtml(createElement(RegionExplorer, props));
    expect(ohneIds(lazy)).toBe(`<div><!--&-->${ohneIds(direkt)}<!--/&--></div>`);
  });

  it('kommt ohne Suspense-Grenze aus, die React in langen Seiten auslagern würde (ohne JS unsichtbar)', async () => {
    const lazy = await serverHtml(createElement(RegionExplorerLazy, props));
    expect(lazy).not.toContain('<!--$');
    expect(lazy.match(/<fieldset[^>]*\bdisabled\b/g)).toHaveLength(2);
  });
});
