import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MOTION_IDS } from '@/lib/motion/register';
import { HEADQUARTERS, bearingDeg } from '@/lib/places/derive';
import { getKreisPlaces, getPublishedPlaces } from '@/lib/places/registry';
import { Entfernungsleiste, senkrechteLage } from '../Entfernungsleiste';
import {
  PENDELWEG_MIN_ANTEIL,
  PENDELWEG_RAHMEN,
  PENDELWEG_SKALA,
  Pendelweg,
  pendelLage,
  pendelLaenge,
  pendelMassstab,
  type Kasten,
} from '../Pendelweg';

const ueberlappen = (a: Kasten, b: Kasten) => a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 && a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5;
const imRahmen = (k: Kasten, hoehe: number) => k.x0 >= 0 && k.y0 >= 0 && k.x1 <= PENDELWEG_RAHMEN.breite && k.y1 <= hoehe;

describe('Lageplan der Ortsseite (E-028, Pendelweg seit E-029)', () => {
  const faelle = getPublishedPlaces().map((place) => [place.name, bearingDeg(HEADQUARTERS, place), place.commute.distanceKm, place.commute.airKm] as const);

  it.each(faelle)('%s: alle Teile im Rahmen, die Namen überdecken weder einander noch Maßkette, Nordpfeil oder Maßstabsleiste', (name, kurs, km, luft) => {
    for (const lage of [pendelLage(kurs, name, 'Firmensitz', km), pendelLage(kurs, name, 'Firmensitz', km, luft)]) {
      expect(lage.hoehe).toBeLessThanOrEqual(PENDELWEG_RAHMEN.hoehe);
      for (const kasten of lage.kaesten) expect(imRahmen(kasten, lage.hoehe), JSON.stringify(kasten)).toBe(true);
      // Der Nordpfeil (14 × 40 Einheiten ab seiner Spitze) liegt frei, auch von der Maßstabsleiste
      const nord = { x0: lage.nord.x - 7, y0: lage.nord.y, x1: lage.nord.x + 7, y1: lage.nord.y + 40 };
      for (const kasten of lage.kaesten) expect(ueberlappen(nord, kasten), `Nordpfeil über ${JSON.stringify(kasten)}`).toBe(false);
      // Die Maßstabsleiste liegt frei von Haus, Punkt, Namen, Wert und Kette
      for (const kasten of lage.kaesten.filter((k) => k !== lage.leiste.kasten)) {
        expect(ueberlappen(lage.leiste.kasten, kasten), `Maßstabsleiste über ${JSON.stringify(kasten)}`).toBe(false);
      }
      expect(ueberlappen(lage.ortSchrift.kasten, lage.hausSchrift.kasten)).toBe(false);
      expect(ueberlappen(lage.ortSchrift.kasten, lage.wert.kasten)).toBe(false);
      expect(ueberlappen(lage.hausSchrift.kasten, lage.wert.kasten)).toBe(false);
    }
  });

  it.each(faelle)('%s: kein Name und kein Wert auf der Verbindung; keine Leitungen, kein Zirkel', (name, kurs, km) => {
    const lage = pendelLage(kurs, name, 'Firmensitz', km);
    const { a, b } = lage.linie;
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 2));
    const proben = Array.from({ length: n + 1 }, (_, j) => ({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n }));
    for (const schrift of [lage.ortSchrift, lage.hausSchrift]) {
      const k = schrift.kasten;
      for (const p of proben) {
        const innen = p.x > k.x0 - 3 && p.x < k.x1 + 3 && p.y > k.y0 - 3 && p.y < k.y1 + 3;
        expect(innen, `${schrift.text} auf der Verbindung bei ${p.x.toFixed(1)}/${p.y.toFixed(1)}`).toBe(false);
      }
    }
    // Der Wert ist gedreht: im eigenen Rahmen der Schrift prüfen (13 Einheiten, 0,6 em je Zeichen)
    const { wert } = lage;
    const rad = (-wert.winkel * Math.PI) / 180;
    for (const p of proben) {
      const dx = (p.x - wert.x) * Math.cos(rad) - (p.y - wert.y) * Math.sin(rad);
      const dy = (p.x - wert.x) * Math.sin(rad) + (p.y - wert.y) * Math.cos(rad);
      const innen = Math.abs(dx) < (wert.text.length * 13 * 0.6) / 2 + 3 && Math.abs(dy) < (13 * 1.2) / 2 + 3;
      expect(innen, `${wert.text} auf der Verbindung bei ${p.x.toFixed(1)}/${p.y.toFixed(1)}`).toBe(false);
    }
    // Freistellung: Ortsname, Firmensitz, Wert
    expect(lage.frei).toHaveLength(3);
    const html = renderToStaticMarkup(createElement(Pendelweg, { ort: name, kursGrad: kurs, strasseKm: km }));
    expect(html).toMatch(/<mask id="pendelweg-frei-[^"]+"/);
    expect(html).toContain('data-zeichnung="lageplan"');
    expect(html).not.toMatch(/data-bogen|vorlauf|ruecklauf|waerme|stroke-linecap="round"/i);
  });

  it('kurze Wege: der Wert steht waagerecht neben der Kette statt gedreht über sie hinaus', () => {
    const kurz = pendelLage(225, 'Steindorf', 'Firmensitz', 1);
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

  it('maßstäblich: Abstand auf dem Plan = Messung im Maßstab des Bilds; ab 10,5 km dieselbe Skala 35 km', () => {
    for (const place of getPublishedPlaces()) {
      for (const [km, luft] of [[place.commute.distanceKm, undefined], [place.commute.distanceKm, place.commute.airKm]] as const) {
        const lage = pendelLage(bearingDeg(HEADQUARTERS, place), place.name, 'Firmensitz', km, luft);
        const gemessen = luft ?? km;
        const abstand = Math.hypot(lage.ort.x - lage.haus.x, lage.ort.y - lage.haus.y);
        // Was die Zeichnung zeigt, in km nach ihrer eigenen Maßstabsleiste
        const kmImBild = (abstand / lage.leiste.einheiten) * lage.leiste.teilung;
        if (gemessen >= PENDELWEG_MIN_ANTEIL * 5) expect(kmImBild, `${place.name} ${gemessen} km`).toBeCloseTo(gemessen, 0);
        expect(lage.massstabKm).toBe(pendelMassstab(gemessen));
        if (gemessen >= PENDELWEG_MIN_ANTEIL * PENDELWEG_SKALA.maxKm) expect(lage.massstabKm, place.name).toBe(PENDELWEG_SKALA.maxKm);
        // Nie kürzer als der Mindestabstand, nie über den Rand der Skala
        expect(abstand).toBeGreaterThanOrEqual(PENDELWEG_SKALA.radius * PENDELWEG_MIN_ANTEIL - 0.2);
        expect(abstand).toBeLessThanOrEqual(PENDELWEG_SKALA.radius + 0.2);
      }
    }
    expect(pendelLaenge(35)).toBe(PENDELWEG_SKALA.radius);
    expect(pendelLaenge(50)).toBe(PENDELWEG_SKALA.radius);
    expect(pendelMassstab(34)).toBe(35);
    expect(pendelMassstab(7)).toBe(15);
    expect(pendelMassstab(2)).toBe(5);
  });

  it('Lageplan: Nordpfeil, Maßstabsleiste 0 · 5 · 10 km (Straße bzw. Luftlinie), Maßkette mit 45°-Strichen', () => {
    const html = renderToStaticMarkup(createElement(Pendelweg, { ort: 'Villmar', kursGrad: 225, strasseKm: 34 }));
    expect(html).toContain('data-nordpfeil=""');
    expect(html).toMatch(/data-massstabsleiste="" data-teilung-km="5"/);
    expect(html).toMatch(/>0<\/text><text[^>]*>5<\/text><text[^>]*>10<\/text>[\s\S]*>km<\/text>/);
    // Begrenzungsstriche unter 45° (je Ende einer), keine Maßhilfslinien quer zur Kette
    expect(html).toMatch(/<path d="M[^"]+L[^"]+M[^"]+L[^"]+" stroke-width="[^"]+" class="[^"]+" data-begrenzung=""/);
    expect(html).toContain('>STRASSE<');
    expect(html).toContain('>34 km<');
    const luft = renderToStaticMarkup(createElement(Pendelweg, { ort: 'Villmar', kursGrad: 225, strasseKm: 34, luftlinieKm: 27.4 }));
    expect(luft).toContain('>LUFTLINIE<');
    expect(luft).toContain('>27,4 km<');
    // Nahe Orte: eigene Stufe, die Leiste zeigt sie
    const nah = renderToStaticMarkup(createElement(Pendelweg, { ort: 'Steindorf', kursGrad: 225, strasseKm: 2 }));
    expect(nah).toMatch(/data-massstab-km="5"/);
    expect(nah).toContain('>2 km<');
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

  it('Verbindung und Maßkette tragen die Kennung pendel-zeichnen, Schrift ≥ 12 Einheiten, ohne Titel dekorativ', () => {
    const html = renderToStaticMarkup(createElement(Pendelweg, { ort: 'Herborn', kursGrad: 315, strasseKm: 27 }));
    expect(MOTION_IDS).toContain('pendel-zeichnen');
    expect(html.match(/data-motion="pendel-zeichnen"/g)).toHaveLength(2);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('27\u00A0km');
    for (const m of html.matchAll(/font-size="(\d+)"/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(12);
  });

  it('CSS: Grundwert ist der Endzustand, die Bewegung läuft nur unter .auftakt und nie bei reduzierter Bewegung', () => {
    const css = readFileSync(path.resolve(__dirname, '../zeichnung.module.css'), 'utf8');
    expect(css).toMatch(/\.pendelZug \{\s*stroke-dasharray: 1;\s*stroke-dashoffset: 0;/);
    expect(css).toMatch(/:global\(\.auftakt\) \[data-motion="pendel-zeichnen"\]\.pendelVerbindung \{\s*animation: pendelZiehen var\(--d-3\) var\(--k-wechsel\) calc\(var\(--takt\) \* 4\) backwards;/);
    expect(css).toMatch(/\.pendelKette \{\s*animation: pendelZiehen var\(--d-3\) var\(--k-wechsel\) calc\(var\(--takt\) \* 7\) backwards;/);
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*:global\(\.auftakt\) \[data-motion="pendel-zeichnen"\] \{\s*animation: none;/);
    expect(css).not.toMatch(/\.pendelHaus \{[^}]*--waerme/);
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
