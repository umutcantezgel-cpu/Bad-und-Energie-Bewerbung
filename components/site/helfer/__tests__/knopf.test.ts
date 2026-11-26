import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MIT_FIGUR } from '../HelferInsel';
import { KNOPF_NAME, WhatsAppKnopf } from '../knopf/WhatsAppKnopf';
import { WURF, imRahmen, ruht, schritt, wurfTempo, type WurfKoerper, type WurfRahmen } from '../knopf/wurf';

const lies = (datei: string) => readFileSync(path.join(process.cwd(), datei), 'utf8');
const RAHMEN: WurfRahmen = { links: 8, oben: 8, rechts: 326, unten: 772 };

/** Rechnet in Bildern von 1/60 s, bis der Knopf ruht oder die Zeit um ist. */
function fliege(k: WurfKoerper, sekunden: number): { k: WurfKoerper; aufpralle: string[]; zeit: number } {
  const aufpralle: string[] = [];
  let zeit = 0;
  while (zeit < sekunden && !ruht(k, RAHMEN)) {
    const r = schritt(k, 1 / 60, RAHMEN);
    k = r.k;
    if (r.aufprall) aufpralle.push(r.aufprall.wand);
    zeit += 1 / 60;
  }
  return { k, aufpralle, zeit };
}

describe('WhatsApp-Knopf am Handy: Wurf', () => {
  it('fällt auf den Boden auf Höhe des Ruheplatzes und kommt dort zur Ruhe', () => {
    const { k, zeit } = fliege({ x: 200, y: 200, vx: 0, vy: 0 }, 10);
    expect(ruht(k, RAHMEN)).toBe(true);
    expect(k.y).toBe(RAHMEN.unten);
    expect(zeit).toBeLessThan(4);
  });

  it('prallt an der Wand ab und bleibt immer im Rahmen', () => {
    let k: WurfKoerper = { x: 300, y: 600, vx: 4000, vy: -3000 };
    const wände = new Set<string>();
    for (let i = 0; i < 600 && !ruht(k, RAHMEN); i++) {
      const r = schritt(k, 1 / 60, RAHMEN);
      k = r.k;
      if (r.aufprall) wände.add(r.aufprall.wand);
      expect(k.x).toBeGreaterThanOrEqual(RAHMEN.links);
      expect(k.x).toBeLessThanOrEqual(RAHMEN.rechts);
      expect(k.y).toBeGreaterThanOrEqual(RAHMEN.oben);
      expect(k.y).toBeLessThanOrEqual(RAHMEN.unten);
    }
    expect(wände.has('rechts')).toBe(true);
    expect(wände.has('unten')).toBe(true);
    expect(ruht(k, RAHMEN)).toBe(true);
  });

  it('übersteht ungültige und sehr lange Zeitschritte', () => {
    const k = { x: 100, y: 100, vx: 10, vy: 10 };
    expect(schritt(k, Number.NaN, RAHMEN).k).toEqual(k);
    expect(schritt(k, -1, RAHMEN).k).toEqual(k);
    const lang = schritt(k, 5, RAHMEN).k;
    expect(lang.y).toBeLessThanOrEqual(RAHMEN.unten);
  });

  it('Wurftempo aus den letzten 100 ms, höchstens WURF.hoechst', () => {
    expect(wurfTempo([])).toEqual({ vx: 0, vy: 0 });
    expect(wurfTempo([{ x: 0, y: 0, t: 0 }])).toEqual({ vx: 0, vy: 0 });
    const v = wurfTempo([
      { x: 0, y: 0, t: 0 },
      { x: 500, y: 0, t: 200 },
      { x: 520, y: -20, t: 260 },
      { x: 560, y: -60, t: 300 },
    ]);
    expect(v.vx).toBeCloseTo(600, 0);
    expect(v.vy).toBeCloseTo(-600, 0);
    const schnell = wurfTempo([
      { x: 0, y: 0, t: 0 },
      { x: 2000, y: 0, t: 50 },
    ]);
    expect(Math.hypot(schnell.vx, schnell.vy)).toBeCloseTo(WURF.hoechst, 3);
  });

  it('hält die Lage im Rahmen', () => {
    expect(imRahmen(-50, 2000, RAHMEN)).toEqual({ x: RAHMEN.links, y: RAHMEN.unten });
    expect(imRahmen(100, 100, RAHMEN)).toEqual({ x: 100, y: 100 });
  });
});

describe('WhatsApp-Knopf am Handy: Link und Stil', () => {
  const href = 'https://api.whatsapp.com/send?phone=4917641195301&text=Hallo';
  const html = renderToStaticMarkup(createElement(WhatsAppKnopf, { href, pfad: '/' }));

  it('kommt als gewöhnlicher Link vom Server: neuer Tab, eigener Name, Zeichen nur dekorativ, in Ruhe', () => {
    expect(html).toContain(`href="${href.replace('&', '&amp;')}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(`aria-label="${KNOPF_NAME}"`);
    expect(KNOPF_NAME).toMatch(/\(öffnet in neuem Tab\)$/);
    expect(html).toContain('data-wurf="ruht"');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).not.toContain('style=');
  });

  it('CSS: Ruheplatz per bottom/right, senkrechtes Wischen scrollt, nie zwei WhatsApp-Knöpfe, am PC aus', () => {
    const css = lies('components/site/helfer/knopf/knopf.module.css');
    expect(css).toMatch(/\.knopf \{[^}]*position: fixed;[^}]*right: max\(var\(--a-4\), env\(safe-area-inset-right\)\);[^}]*bottom: max\(var\(--a-4\), env\(safe-area-inset-bottom\)\);/);
    expect(css).toContain('touch-action: pan-y;');
    expect(css).toContain(":root:has([data-sticky-apply-bar]:not([data-hidden])) .knopf[data-wurf='ruht']");
    // Dieselbe Abfrage wie die Insel: am PC mit Maus das Spiel, sonst der Knopf
    expect(css).toContain(`@media ${MIT_FIGUR} {`);
    expect(css).toContain('@media (prefers-reduced-motion: reduce), (forced-colors: active) {');
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('das Spiel lädt nur am PC; am Handy bleibt es beim Knopf', () => {
    const insel = lies('components/site/helfer/HelferInsel.tsx');
    expect(insel).toContain('if (!sichtbar || !el || figur !== true) return;');
    expect(insel).toContain('{sichtbar && <WhatsAppKnopf href={whatsappHref} pfad={pfad} />}');
  });
});
