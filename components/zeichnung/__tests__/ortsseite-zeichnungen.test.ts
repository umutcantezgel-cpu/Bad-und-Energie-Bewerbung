import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { octilinear } from '@/components/maps/graphic';
import { MOTION_IDS } from '@/lib/motion/register';
import { HEADQUARTERS, bearingDeg } from '@/lib/places/derive';
import { getKreisPlaces, getPublishedPlaces } from '@/lib/places/registry';
import { Entfernungsleiste, senkrechteLage } from '../Entfernungsleiste';
import {
  PENDELWEG_MIN_ANTEIL,
  PENDELWEG_NAH_KM,
  PENDELWEG_RAHMEN,
  PENDELWEG_SKALA,
  Pendelweg,
  pendelLage,
  pendelLaenge,
  type Kasten,
} from '../Pendelweg';

const ueberlappen = (a: Kasten, b: Kasten) => a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 && a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5;
const imRahmen = (k: Kasten, hoehe: number) => k.x0 >= 0 && k.y0 >= 0 && k.x1 <= PENDELWEG_RAHMEN.breite && k.y1 <= hoehe;

describe('Pendelweg (E-028)', () => {
  const faelle = getPublishedPlaces().map((place) => [place.name, bearingDeg(HEADQUARTERS, place), place.commute.distanceKm] as const);

  it.each(faelle)('%s: alle Teile im Rahmen, die Namen überdecken weder einander noch die Maßkette', (name, kurs, km) => {
    const lage = pendelLage(kurs, name, 'Firmensitz', km);
    expect(lage.hoehe).toBeLessThanOrEqual(PENDELWEG_RAHMEN.hoehe);
    for (const kasten of lage.kaesten) expect(imRahmen(kasten, lage.hoehe), JSON.stringify(kasten)).toBe(true);
    // Der Nordpfeil (14 × 40 Einheiten ab seiner Spitze) liegt frei
    const nord = { x0: lage.nord.x - 7, y0: lage.nord.y, x1: lage.nord.x + 7, y1: lage.nord.y + 40 };
    for (const kasten of lage.kaesten) expect(ueberlappen(nord, kasten), `Nordpfeil über ${JSON.stringify(kasten)}`).toBe(false);
    expect(ueberlappen(lage.ortSchrift.kasten, lage.hausSchrift.kasten)).toBe(false);
    expect(ueberlappen(lage.ortSchrift.kasten, lage.wert.kasten)).toBe(false);
    expect(ueberlappen(lage.hausSchrift.kasten, lage.wert.kasten)).toBe(false);
  });

  it.each(faelle)('%s: kein Name und kein Wert auf Vorlauf und Rücklauf; Bögen setzen unter jeder Schrift aus', (name, kurs, km) => {
    const lage = pendelLage(kurs, name, 'Firmensitz', km);
    const route = octilinear(lage.haus, lage.ort);
    // Punkte des Paars (Abstand ±3,5 zur Mitte, Strich 1): Stichproben entlang der Strecke, ohne Haus und Punkt
    const proben = route.slice(1).flatMap((b, i) => {
      const a = route[i];
      const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 2));
      return Array.from({ length: n + 1 }, (_, j) => ({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n }));
    });
    const frei = proben.filter((p) => Math.hypot(p.x - lage.haus.x, p.y - lage.haus.y) > 14 && Math.hypot(p.x - lage.ort.x, p.y - lage.ort.y) > 12);
    for (const schrift of [lage.ortSchrift, lage.hausSchrift]) {
      const k = schrift.kasten;
      for (const p of frei) {
        const innen = p.x > k.x0 - 4 && p.x < k.x1 + 4 && p.y > k.y0 - 4 && p.y < k.y1 + 4;
        expect(innen, `${schrift.text} auf dem Paar bei ${p.x.toFixed(1)}/${p.y.toFixed(1)}`).toBe(false);
      }
    }
    // Der Wert ist gedreht: im eigenen Rahmen der Schrift prüfen (13 Einheiten, 0,6 em je Zeichen)
    const { wert } = lage;
    const rad = (-wert.winkel * Math.PI) / 180;
    for (const p of frei) {
      const dx = (p.x - wert.x) * Math.cos(rad) - (p.y - wert.y) * Math.sin(rad);
      const dy = (p.x - wert.x) * Math.sin(rad) + (p.y - wert.y) * Math.cos(rad);
      const innen = Math.abs(dx) < (wert.text.length * 13 * 0.6) / 2 + 4 && Math.abs(dy) < (13 * 1.2) / 2 + 4;
      expect(innen, `${wert.text} auf dem Paar bei ${p.x.toFixed(1)}/${p.y.toFixed(1)}`).toBe(false);
    }
    // Freistellung: Ortsname, Firmensitz, Wert und die Werte am Schenkel
    expect(lage.frei).toHaveLength(3 + lage.skala.length);
    const html = renderToStaticMarkup(createElement(Pendelweg, { ort: name, kursGrad: kurs, strasseKm: km }));
    expect(html).toMatch(/<mask id="pendelweg-frei-[^"]+"/);
    // Kurze Wege (unter PENDELWEG_NAH_KM) nur mit dem 35-km-Bogen, sonst alle drei, der erste unter der Maske
    const ersterBogen = km < PENDELWEG_NAH_KM ? 35 : 15;
    expect(html).toMatch(new RegExp(`<g mask="url\\(#pendelweg-frei-[^)]+\\)"><path[^>]*data-bogen="${ersterBogen}"`));
    expect(html.includes('data-bogen="15"')).toBe(km >= PENDELWEG_NAH_KM);
  });

  it('kurze Wege: der Wert steht waagerecht neben der Kette statt gedreht über sie hinaus', () => {
    const kurz = pendelLage(225, 'Steindorf', 'Firmensitz', 2);
    expect(kurz.wert.winkel).toBe(0);
    const lang = pendelLage(225, 'Villmar', 'Firmensitz', 34);
    expect(Math.abs(lang.wert.winkel)).toBeGreaterThan(30);
  });

  it('robust für jede Richtung: auch lange Namen bleiben im Rahmen und frei', () => {
    for (let kurs = 0; kurs < 360; kurs += 7.5) {
      for (const [name, km] of [['Heuchelheim an der Lahn', 34], ['Waldbrunn (Westerwald)', 32], ['Münchholzhausen', 35], ['Lich', 2]] as const) {
        const lage = pendelLage(kurs, name, 'Firmensitz', km);
        for (const kasten of lage.kaesten) expect(imRahmen(kasten, lage.hoehe), `${name} ${kurs}° ${JSON.stringify(kasten)}`).toBe(true);
        expect(ueberlappen(lage.ortSchrift.kasten, lage.hausSchrift.kasten), `${name} ${kurs}°`).toBe(false);
      }
    }
  });

  it('maßstäblich auf der Skala bis 35 km: Villmar (34 km) fast am äußeren Bogen, Steindorf (2 km) dicht am Haus', () => {
    const laenge = (id: string) => {
      const place = getPublishedPlaces().find((p) => p.id === id)!;
      const lage = pendelLage(bearingDeg(HEADQUARTERS, place), place.name, 'Firmensitz', place.commute.distanceKm);
      return Math.hypot(lage.ort.x - lage.haus.x, lage.ort.y - lage.haus.y);
    };
    expect(laenge('villmar')).toBeCloseTo((PENDELWEG_SKALA.radius * 34) / 35, 0);
    expect(laenge('steindorf')).toBeCloseTo(PENDELWEG_SKALA.radius * PENDELWEG_MIN_ANTEIL, 0);
    expect(laenge('villmar') / laenge('herborn')).toBeCloseTo(34 / 27, 1);
    expect(pendelLaenge(35)).toBe(PENDELWEG_SKALA.radius);
    expect(pendelLaenge(50)).toBe(PENDELWEG_SKALA.radius);
    // Der kürzeste Weg bleibt innerhalb des 15-km-Bogens
    expect(PENDELWEG_MIN_ANTEIL * 35).toBeLessThan(15);
  });

  it('Zirkel: Bögen 15, 25 (gepunktet) und 35 km mit Wert am Schenkel', () => {
    const html = renderToStaticMarkup(createElement(Pendelweg, { ort: 'Villmar', kursGrad: 225, strasseKm: 34 }));
    for (const km of [15, 25, 35]) expect(html).toContain(`data-bogen="${km}"`);
    expect(html).toContain('>35\u00A0km<');
    expect(html).toContain('>15<');
    expect(html).toContain('>25<');
  });

  it('der Weg zeigt in die echte Richtung (Kurs): Herborn nach Nordwesten, Gießen nach Osten', () => {
    const herborn = getPublishedPlaces().find((p) => p.id === 'herborn')!;
    const giessen = getPublishedPlaces().find((p) => p.id === 'giessen')!;
    const h = pendelLage(bearingDeg(HEADQUARTERS, herborn), 'Herborn');
    expect(h.ort.x).toBeLessThan(h.haus.x);
    expect(h.ort.y).toBeLessThan(h.haus.y);
    const g = pendelLage(bearingDeg(HEADQUARTERS, giessen), 'Gießen');
    expect(g.ort.x).toBeGreaterThan(g.haus.x);
    expect(Math.abs(g.ort.y - g.haus.y)).toBeLessThan(Math.abs(g.ort.x - g.haus.x));
  });

  it('Vorlauf und Rücklauf tragen die Kennung pendel-zeichnen, Schrift ≥ 12 Einheiten, ohne Titel dekorativ', () => {
    const html = renderToStaticMarkup(createElement(Pendelweg, { ort: 'Herborn', kursGrad: 315, strasseKm: 27 }));
    expect(MOTION_IDS).toContain('pendel-zeichnen');
    expect(html.match(/data-motion="pendel-zeichnen"/g)).toHaveLength(2);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('27 km');
    for (const m of html.matchAll(/font-size="(\d+)"/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(12);
  });

  it('CSS: Grundwert ist der Endzustand, die Bewegung läuft nur unter .auftakt und nie bei reduzierter Bewegung', () => {
    const css = readFileSync(path.resolve(__dirname, '../zeichnung.module.css'), 'utf8');
    expect(css).toMatch(/\.pendelZug \{\s*stroke-dasharray: 1;\s*stroke-dashoffset: 0;/);
    expect(css).toMatch(/:global\(\.auftakt\) \[data-motion="pendel-zeichnen"\]\.pendelVorlauf \{\s*animation: pendelZiehen var\(--d-3\) var\(--k-wechsel\) calc\(var\(--takt\) \* 4\) backwards;/);
    expect(css).toMatch(/calc\(var\(--takt\) \* 7\) backwards/);
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*:global\(\.auftakt\) \[data-motion="pendel-zeichnen"\] \{\s*animation: none;/);
  });
});

describe('Entfernungsleiste (E-028)', () => {
  const ldk = getKreisPlaces('lahn-dill-kreis').map((p) => ({ id: p.id, name: p.name, km: p.commute.distanceKm }));

  it('senkrecht: jeder Ort in eigener Zeile, Reihenfolge nach Strecke, nie unter der Skala', () => {
    const { zeilen, lage } = senkrechteLage(ldk, 35);
    const reihen = lage.map((l) => l.zeile);
    for (let i = 1; i < reihen.length; i += 1) expect(reihen[i] - reihen[i - 1]).toBeGreaterThanOrEqual(1 - 1e-9);
    expect(Math.max(...reihen)).toBeLessThanOrEqual(zeilen - 1);
    expect(Math.min(...reihen)).toBeGreaterThanOrEqual(0);
    expect(lage.map((l) => l.id)).toEqual([...ldk].sort((a, b) => a.km - b.km || a.name.localeCompare(b.name, 'de')).map((o) => o.id));
  });

  it('senkrecht mit Hintergrund: alle Orte des Gebiets als leise Sprossen im Paar (kleine Kreise, Punkt 25)', () => {
    const wetterau = getKreisPlaces('wetteraukreis').map((p) => ({ id: p.id, name: p.name, km: p.commute.distanceKm }));
    const alle = getPublishedPlaces().map((p) => p.commute.distanceKm);
    const html = renderToStaticMarkup(
      createElement(Entfernungsleiste, { orte: wetterau, ausrichtung: 'senkrecht', hintergrundKm: alle, titel: 'Wetteraukreis' }),
    );
    expect(html.match(/class="[^"]*lsHintergrund/g)).toHaveLength(new Set(alle).size);
    // Ohne Hintergrund keine Sprossen
    const ohne = renderToStaticMarkup(createElement(Entfernungsleiste, { orte: wetterau, ausrichtung: 'senkrecht', titel: 'Wetteraukreis' }));
    expect(ohne).not.toMatch(/lsHintergrund/);
  });

  it('waagerecht: Skala 0–35 km mit den Ringen, der hervorgehobene Ort mit Namen und Wert, role="img"', () => {
    const html = renderToStaticMarkup(createElement(Entfernungsleiste, { orte: ldk, aktuellId: 'herborn', titel: 'Herborn: 27 km' }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Herborn: 27 km"');
    for (const wert of ['>0<', '>15<', '>25<', '>35 km<']) expect(html).toContain(wert);
    expect(html).toContain('Herborn');
    expect(html).toContain('27 km');
    // Jeder Ort ein Punkt, Lage = Anteil an 35 km
    expect(html.match(/left:(\d+(?:\.\d+)?)%/g)!.length).toBeGreaterThanOrEqual(ldk.length);
  });
});
