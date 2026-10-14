import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Hero } from '@/components/home/Hero';
import { GLYPH_SHAPES } from '@/components/icons/glyphs';
import { DAUER_IDS } from '@/lib/motion/register';
import { COMPRESS_AW_L } from '@/lib/zeichnung/geraete/compress-aw-l';
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import type { Aussengeraet as Geraetedaten } from '@/lib/zeichnung/geraete/typen';
import { BOSCH_FREIGABE } from '@/lib/zeichnung/marke';
import { ANLAGENSCHEMA_KAELTE, ANLAGENSCHEMA_LEITUNGEN, ANLAGENSCHEMA_RAHMEN } from '@/lib/zeichnung/szenen/anlagenschema';
import { HEIZKOERPER_LAGE, LEITUNGEN as HAUS_LEITUNGEN } from '@/lib/zeichnung/szenen/hausschnitt';
import { KAELTEKREIS_GERAET, KAELTEKREIS_RAHMEN, KAELTEKREIS_WASSER, KAELTEKREIS_WEGE } from '@/lib/zeichnung/szenen/kaeltekreis';
import { flussMuster, flussStrecken } from '@/lib/zeichnung/szenen/schema';
import { DauerSteuerung } from '../bewegung/DauerSteuerung';
import { Anlagenschema } from '../technik/Anlagenschema';
import { Aussengeraet, type AussengeraetProps } from '../technik/Aussengeraet';
import { HausschnittKlein } from '../technik/Hausschnitt';
import { Kaeltekreis } from '../technik/Kaeltekreis';

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const ohneKommentare = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const html = (el: ReactElement) => renderToStaticMarkup(el);
const gzip = (s: string) => gzipSync(Buffer.from(s, 'utf8'), { level: 9 }).length;

const geraet = (props: AussengeraetProps) => html(createElement(Aussengeraet, props));
const GROESSEN: ReadonlyArray<['S' | 'L', Geraetedaten]> = [
  ['S', COMPRESS_AW_S],
  ['L', COMPRESS_AW_L],
];

/**
 * Prüft verschachtelt: Jedes Element mit einer Dauer-Kennung liegt in einem Element mit `data-dauer` (DauerSteuerung).
 * Gibt die Kennungen außerhalb zurück. React liefert wohlgeformtes Markup (leere Elemente mit „/>“).
 */
function dauerAusserhalb(markup: string): string[] {
  const stapel: boolean[] = [];
  const fehler: string[] = [];
  for (const m of markup.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, zu, , attribute, leer] = m;
    if (zu) {
      stapel.pop();
      continue;
    }
    const drin = stapel.some(Boolean) || /\sdata-dauer="(?:an|aus)"/.test(attribute);
    const id = attribute.match(/\sdata-motion="([^"]+)"/)?.[1];
    if (id && (DAUER_IDS as readonly string[]).includes(id) && !drin) fehler.push(id);
    if (!leer) stapel.push(/\sdata-dauer="(?:an|aus)"/.test(attribute));
  }
  return fehler;
}

describe('Außengerät: maßstäblich aus dem Geräte-Modul (K-010)', () => {
  it('die verschachtelte Zeichnung hat genau die viewBox der Gerätemaße (mm), von vorn und von rechts, Größe S und L', () => {
    for (const [groesse, g] of GROESSEN) {
      for (const ansicht of ['vorne', 'seite'] as const) {
        const b = ansicht === 'vorne' ? g.breite.mm : g.tiefe.mm;
        const h = g.hoehe.mm;
        const m = geraet({ groesse, ansicht });
        expect(m, `${groesse} ${ansicht}`).toContain(`<svg x="0" y="0" width="${b}" height="${h}" viewBox="0 0 ${b} ${h}" overflow="visible" data-geraet-mass="">`);
        expect(m).toContain(`data-geraet="${g.id}"`);
        expect(m).toContain(`data-ansicht="${ansicht}"`);
        // Der äußere Rahmen umschließt Gerät und Maßketten
        const [x0, y0, w, hh] = m.match(/<svg class="[^"]*" viewBox="([^"]+)"/)![1].split(' ').map(Number);
        expect(x0).toBeLessThan(0);
        expect(y0).toBeLessThanOrEqual(0);
        expect(x0 + w).toBeGreaterThan(b);
        expect(y0 + hh).toBeGreaterThan(h);
      }
    }
  });

  it('die Maßketten tragen die Werte der Anleitung als Text; das Schriftfeld nennt Dokument, Ausgabe und die neutrale Form', () => {
    const vorne = geraet({ groesse: 'S', ansicht: 'vorne', massketten: 'voll' });
    const werte = [...vorne.matchAll(/<text[^>]*>(\d+)<\/text>/g)].map((x) => Number(x[1]));
    for (const w of [COMPRESS_AW_S.breite.mm, COMPRESS_AW_S.hoehe.mm, COMPRESS_AW_S.konsolen.abstand.mm, COMPRESS_AW_S.konsolen.randabstand.mm]) {
      expect(werte, String(w)).toContain(w);
    }
    const seite = geraet({ groesse: 'L', ansicht: 'seite', massketten: 'voll' });
    const werteSeite = [...seite.matchAll(/<text[^>]*>(\d+)<\/text>/g)].map((x) => Number(x[1]));
    for (const w of [COMPRESS_AW_L.tiefe.mm, COMPRESS_AW_L.tiefeMitKonsolen.mm, COMPRESS_AW_L.hoehe.mm, COMPRESS_AW_L.hydraulik.hoehe.mm]) {
      expect(werteSeite, String(w)).toContain(w);
    }
    expect(vorne).toContain(`Dok.-Nr. ${COMPRESS_AW_S.quelle.dokument} (${COMPRESS_AW_S.quelle.ausgabe})`);
    expect(vorne).toContain('Form neutral gezeichnet, nicht die Gestaltung des Herstellers.');
    expect(vorne).toContain('Maße in mm · maßstäblich gezeichnet');
    expect(vorne).toMatch(/role="img" aria-label="Außeneinheit 4–7\u00a0kW einer Luft\/Wasser-Wärmepumpe von vorn: 1\.100\u00a0mm breit, 800\u00a0mm hoch/);
    expect(vorne).toContain('Außeneinheit 4–7\u00a0kW · Ansicht von vorn');
  });

  it('der Rotor ist eine eigene Ebene; die Kennung rotor-dreht trägt er nur mit `bewegt`', () => {
    const still = geraet({ ansicht: 'vorne' });
    const bewegt = geraet({ ansicht: 'vorne', bewegt: true });
    expect(still).toMatch(/<svg class="[^"]*" style="left:[^"]+" viewBox="[^"]+" aria-hidden="true" focusable="false" data-rotor="">/);
    expect(still).not.toContain('data-motion');
    expect(bewegt.match(/data-motion="rotor-dreht"/g)).toHaveLength(1);
    expect(bewegt).toMatch(/data-rotor="" data-motion="rotor-dreht"/);
    // Von der Seite gibt es keinen Rotor
    expect(geraet({ ansicht: 'seite', bewegt: true })).not.toContain('data-rotor');
  });

  it('im Hausschnitt misst das Gerät 110 × 80 Einheiten (1 Einheit = 10 mm), der Heizkörper 100 × 60', () => {
    const m = html(createElement(HausschnittKlein, { titel: 'Hausschnitt' }));
    expect(m).toMatch(new RegExp(`<svg x="[\\d.]+" y="[\\d.]+" width="110" height="80" viewBox="0 0 ${COMPRESS_AW_S.breite.mm} ${COMPRESS_AW_S.hoehe.mm}" overflow="visible" data-geraet-im-schnitt="">`));
    expect(m).toMatch(new RegExp(`width="${HEIZKOERPER_LAGE.breite}" height="${HEIZKOERPER_LAGE.hoehe}"[^>]*data-heizkoerper=""`));
    expect([COMPRESS_AW_S.breite.mm / 10, COMPRESS_AW_S.hoehe.mm / 10]).toEqual([110, 80]);
    expect(m).toContain('role="img"');
    expect(m).toContain('<title>Hausschnitt</title>');
    // Ohne Leitungen zur Bewerbung und ohne Bewegung
    expect(m).not.toMatch(/data-weg="[^"]*knopf/);
    expect(m).not.toContain('data-motion');
  });
});

describe('Schrift in den Zeichnungen (Mindestgröße der Website, e2e/pages.spec.ts)', () => {
  it('jede Schrift hat mindestens 12 Einheiten, auch die Kennbuchstaben in Symbolen (T, M)', () => {
    const markup = [
      html(createElement(Anlagenschema)),
      html(createElement(Kaeltekreis)),
      geraet({ groesse: 'S', ansicht: 'vorne', massketten: 'voll' }),
      geraet({ groesse: 'L', ansicht: 'seite', massketten: 'voll' }),
      html(createElement(HausschnittKlein)),
    ].join('');
    const groessen = [...markup.matchAll(/font-size="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(groessen.length).toBeGreaterThan(10);
    for (const g of groessen) expect(g).toBeGreaterThanOrEqual(12);
    expect(markup).toMatch(/>T<\/text>/);
    expect(markup).toMatch(/>M<\/text>/);
  });
});

describe('Glyphe waermepumpe (K-010): Proportionen der Außeneinheit', () => {
  it('Gehäuse im Verhältnis der Vorderansicht (oben gerundet, unten scharfkantig), Ausblasöffnung links der Mitte, zwei Halterungen', () => {
    const g = COMPRESS_AW_S;
    const formen = GLYPH_SHAPES.waermepumpe as readonly Record<string, number | string>[];
    // Gehäuse wie vorderansicht(): von unten links hinauf, zwei Bögen an den oberen Ecken, unten keine Rundung
    const kontur = String((formen.find((f) => 'd' in f && String(f.d).includes('A')) as { d: string }).d);
    const t = kontur.match(/^M([\d.]+) ([\d.]+)V([\d.]+)A([\d.]+) \4 0 0 1 ([\d.]+) ([\d.]+)H([\d.]+)A\4 \4 0 0 1 ([\d.]+) \3V\2Z$/);
    expect(t, kontur).not.toBeNull();
    const [x0, unten, , , , oben, , x1] = t!.slice(1).map(Number);
    const gehaeuse = { x: x0, y: oben, width: x1 - x0, height: unten - oben };
    expect(formen.some((f) => 'width' in f)).toBe(false);
    const [oeffnung, nabe] = formen.filter((f) => 'r' in f) as Array<{ cx: number; cy: number; r: number }>;
    const k = gehaeuse.width / g.breite.mm;
    const gehaeuseHoehe = g.hoehe.mm - g.konsolen.hoehe.mm;
    expect(gehaeuse.height / k).toBeGreaterThan(gehaeuseHoehe * 0.98);
    expect(gehaeuse.height / k).toBeLessThan(gehaeuseHoehe * 1.02);
    expect((oeffnung.cx - gehaeuse.x) / k).toBeGreaterThan(g.ausblas.mitteX.mm * 0.97);
    expect((oeffnung.cx - gehaeuse.x) / k).toBeLessThan(g.ausblas.mitteX.mm * 1.03);
    expect((oeffnung.cx - gehaeuse.x) / k).toBeLessThan(g.breite.mm / 2);
    expect((2 * oeffnung.r) / k).toBeGreaterThan(g.ausblas.durchmesser.mm * 0.95);
    expect((2 * oeffnung.r) / k).toBeLessThan(g.ausblas.durchmesser.mm * 1.05);
    expect(nabe.r).toBeLessThan(oeffnung.r / 2);
    // Halterungen bei 107 und 107 + 881 mm, unter dem Gehäuse; kein Lüfter mit Blättern mehr
    const halterungen = String((formen.find((f) => 'd' in f && !String(f.d).includes('A')) as { d: string }).d);
    const fuesse = [...halterungen.matchAll(/M(-?\d*\.?\d+) (-?\d*\.?\d+)/g)].map((m) => Number(m[1]));
    expect(fuesse).toHaveLength(2);
    for (const m of halterungen.matchAll(/M-?\d*\.?\d+ (-?\d*\.?\d+)/g)) expect(Number(m[1])).toBe(unten);
    expect((fuesse[0] - gehaeuse.x) / k).toBeCloseTo(g.konsolen.randabstand.mm, -1);
    expect((fuesse[1] - fuesse[0]) / k).toBeCloseTo(g.konsolen.abstand.mm, -1);
    expect(formen.some((f) => 'transform' in f)).toBe(false);
  });
});

describe('Linien und Farben (K-010)', () => {
  const technik = ohneKommentare(quelle('components/zeichnung/technik/technik.module.css'));
  const dauer = ohneKommentare(quelle('components/zeichnung/bewegung/dauer.module.css'));
  const alle = [
    geraet({ groesse: 'S', ansicht: 'vorne', massketten: 'voll', bewegt: true }),
    geraet({ groesse: 'L', ansicht: 'seite', massketten: 'voll' }),
    html(createElement(Kaeltekreis, { bewegt: true })),
    html(createElement(Anlagenschema, { bewegt: true })),
    html(createElement(HausschnittKlein, {})),
  ];

  it('stumpfe Enden: in den Zeichnungen nie stroke-linecap round; rund nur das Bedienzeichen des Knopfs', () => {
    expect([...technik.matchAll(/stroke-linecap:\s*([a-z]+)/g)].map((m) => m[1])).toEqual(['butt', 'butt']);
    const rund = [...dauer.matchAll(/([^{}]+)\{[^}]*stroke-linecap:\s*round/g)].map((m) => m[1].trim());
    expect(rund).toEqual(['.zeichen']);
    for (const m of alle) {
      expect(m).not.toMatch(/stroke-linecap|stroke-linejoin|stroke-width|stroke="|fill="(?!none)/);
    }
  });

  it('nur Rollenfarben: Marke, Fläche, Vorlauf, Rücklauf, Text; keine Rohfarben, Primitiven oder Verläufe', () => {
    const farben = (css: string) => [...css.matchAll(/(?:^|[\s;{])(?:stroke|fill|color|background-color|border(?:-color)?):\s*([^;]+);/g)].map((m) => m[1].trim());
    const erlaubt = /^(?:none|transparent|currentColor|var\(--(?:brand|surface|surface-2|surface-3|line-strong|vorlauf|ruecklauf|ink|ink-2)\)|var\(--m-kontur\) solid var\(--brand\))$/;
    for (const css of [technik, dauer]) {
      const f = farben(css);
      expect(f.length).toBeGreaterThan(css === technik ? 10 : 3);
      for (const wert of f) expect(wert).toMatch(erlaubt);
      expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl|oklch)a?\(|color-mix|gradient|--p-[a-z]|filter:|box-shadow/);
    }
    for (const m of alle) expect(m).not.toMatch(/Gradient|<filter|<image|<foreignObject|style="[^"]*(?:color|fill|stroke)/);
  });

  it('Linienarten aus den Tokens (theme.css), Strichstärken nicht im Markup', () => {
    for (const token of ['--m-kontur', '--m-fein', '--m-mass', '--m-verdeckt', '--m-mittellinie', '--m-leitung']) {
      expect(technik, token).toContain(`var(${token})`);
    }
    expect(technik).toMatch(/\.verdeckt \{[^}]*stroke-dasharray: var\(--m-verdeckt-muster\);/);
    expect(technik).toMatch(/\.mittellinie \{[^}]*stroke-dasharray: var\(--m-mittellinie-muster\);/);
    expect(technik).not.toMatch(/stroke-width:\s*\d/);
  });
});

describe('Fließrichtung in den gezeichneten Schemata (K-003.2)', () => {
  /** Leitungen des Markups in Reihenfolge, mit Pfad und Medium. */
  const wege = (m: string) =>
    [...m.matchAll(/<path d="([^"]+)" class="[^"]*" data-medium="([a-z]+)" data-weg="([^"]+)"/g)].map((x) => ({ d: x[1], medium: x[2], key: x[3] }));
  /** Strichmuster des Markups je Leitung: Kennung, Weg und die geraden Stücke (Lage in Prozent, Drehung in Grad). */
  const fluesse = (m: string) =>
    [...m.matchAll(/<div class="[^"]*" data-motion="([a-z-]+)" data-weg="([^"]+)">([\s\S]*?)<\/div>/g)].map((x) => ({
      id: x[1],
      key: x[2],
      strecken: [
        ...x[3].matchAll(
          /<span class="[^"]*" style="left:([-\d.]+)%;top:([-\d.]+)%;width:([\d.]+)%;height:([\d.]+)%;transform:rotate\(([-\d.]+)deg\)" data-strecke="">/g,
        ),
      ].map((y) => ({ left: Number(y[1]), top: Number(y[2]), width: Number(y[3]), height: Number(y[4]), grad: Number(y[5]) })),
    }));
  /** Die geraden Stücke eines gezeichneten Pfads (M, L, A) in seiner Reihenfolge: Anfang, Länge, Richtung. */
  const geradeImPfad = (d: string) => {
    const stuecke: { x: number; y: number; laenge: number; grad: number }[] = [];
    let [x, y] = [0, 0];
    for (const [, cmd, rest] of d.matchAll(/([MLA])([^MLA]*)/g)) {
      const n = rest.trim().split(/[\s,]+/).map(Number);
      const [nx, ny] = cmd === 'A' ? [n[5], n[6]] : [n[0], n[1]];
      const laenge = Math.hypot(nx - x, ny - y);
      if (cmd === 'L' && laenge > 0.05) stuecke.push({ x, y, laenge, grad: (Math.atan2(ny - y, nx - x) * 180) / Math.PI });
      [x, y] = [nx, ny];
    }
    return stuecke;
  };

  it('Kältekreis und Anlagenschema zeichnen die Wege des Moduls unverändert (Pfad = Fließrichtung)', () => {
    const faelle = [
      { m: html(createElement(Kaeltekreis, { bewegt: true })), daten: [...KAELTEKREIS_WASSER, ...KAELTEKREIS_WEGE], rahmen: KAELTEKREIS_RAHMEN },
      { m: html(createElement(Anlagenschema, { bewegt: true })), daten: [...ANLAGENSCHEMA_KAELTE, ...ANLAGENSCHEMA_LEITUNGEN], rahmen: ANLAGENSCHEMA_RAHMEN },
    ];
    for (const { m, daten, rahmen } of faelle) {
      const gezeichnet = wege(m);
      expect(gezeichnet.map((w) => w.key)).toEqual(daten.map((w) => w.key));
      for (const w of gezeichnet) {
        const l = daten.find((x) => x.key === w.key)!;
        expect(w.d, w.key).toBe(l.d);
        expect(w.medium, w.key).toBe(l.medium);
      }
      // Das Strichmuster liegt je Leitung auf jedem geraden Stück ihres Pfads, in seiner Reihenfolge und gedreht in
      // seine Richtung (es wandert in +x des Stücks, also in Fließrichtung); Wasser und Kältemittel getrennt
      const { rand } = flussMuster(rahmen.breite);
      const f = fluesse(m);
      expect(f.map((x) => x.key)).toEqual(gezeichnet.map((w) => w.key));
      gezeichnet.forEach((w, i) => {
        expect(f[i].id, w.key).toBe(w.medium === 'kaeltemittel' ? 'kaeltemittel-fliesst' : 'wasser-fliesst');
        const soll = geradeImPfad(w.d);
        expect(soll.length, w.key).toBeGreaterThan(0);
        expect(f[i].strecken.length, w.key).toBe(soll.length);
        soll.forEach((g, j) => {
          const s = f[i].strecken[j];
          expect((s.left * rahmen.breite) / 100, `${w.key} ${j} x`).toBeCloseTo(g.x, 1);
          expect((s.top * rahmen.hoehe) / 100 + rand, `${w.key} ${j} y`).toBeCloseTo(g.y, 1);
          expect((s.width * rahmen.breite) / 100, `${w.key} ${j} Länge`).toBeCloseTo(g.laenge, 0);
          expect((s.height * rahmen.hoehe) / 100, `${w.key} ${j} Höhe`).toBeCloseTo(2 * rand, 1);
          expect(Math.abs(((s.grad - g.grad + 540) % 360) - 180), `${w.key} ${j} Richtung`).toBeLessThan(0.1);
        });
      });
      // Die Ebene liegt über dem SVG der Zeichnung, dekorativ
      expect(m).toMatch(/<\/svg><div class="[^"]*" aria-hidden="true" data-fluss="">/);
    }
  });

  it('Strichmuster: Periode als Schritt der Bewegung, die Striche decken das Stück in jeder Lage', () => {
    const m = html(createElement(Anlagenschema, { bewegt: true }));
    const { periode, strich, rand } = flussMuster(ANLAGENSCHEMA_RAHMEN.breite);
    const baender = [...m.matchAll(/<svg class="[^"]*" style="left:([-\d.]+)%;width:([\d.]+)%;--fluss-schritt:([\d.]+)%" viewBox="([^"]+)" preserveAspectRatio="none" focusable="false"><path d="([^"]+)"><\/path><\/svg>/g)];
    expect(baender.length).toBe(ANLAGENSCHEMA_LEITUNGEN.concat(ANLAGENSCHEMA_KAELTE).reduce((n, l) => n + flussStrecken(l).length, 0));
    for (const [, left, width, schritt, viewBox, d] of baender) {
      const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
      const laenge = vw - periode;
      // Das SVG beginnt eine Periode vor dem Stück und reicht bis an sein Ende; ein Schritt ist genau eine Periode
      expect([vx, vy, vh]).toEqual([-periode, -rand, 2 * rand]);
      expect(Number(left)).toBeCloseTo((-periode / laenge) * 100, 2);
      expect(Number(width)).toBeCloseTo(((laenge + periode) / laenge) * 100, 2);
      expect(Number(schritt)).toBeCloseTo((periode / (laenge + periode)) * 100, 2);
      // Striche im Abstand der Periode, je `strich` lang, auf der Achse; der erste liegt höchstens eine Periode vor
      // dem Stück, der letzte beginnt vor seinem Ende: Um 0 bis eine Periode verschoben, ist jede Stelle abgedeckt
      const x = [...d.matchAll(/M([-\d.]+) 0h([\d.]+)/g)].map((y) => {
        expect(Number(y[2])).toBe(strich);
        return Number(y[1]);
      });
      expect(d).toBe(x.map((v) => `M${v} 0h${strich}`).join(''));
      x.slice(1).forEach((v, i) => expect(v - x[i]).toBeCloseTo(periode, 1));
      expect(x[0]).toBeLessThanOrEqual(-periode + 0.05);
      expect(x[0]).toBeGreaterThan(-2 * periode);
      expect(x.at(-1)!).toBeLessThan(laenge);
      expect(x.at(-1)! + periode).toBeGreaterThanOrEqual(laenge - 0.05);
    }
  });

  it('der Kältekreis bleibt im Gehäuse: die Gerätegrenze ist gezeichnet, im Standbild ohne Strichmuster', () => {
    const m = html(createElement(Kaeltekreis, {}));
    const g = KAELTEKREIS_GERAET;
    expect(m).toContain(`<rect x="${g.x}" y="${g.y}" width="${g.breite}" height="${g.hoehe}" class="`);
    expect(m).toContain('data-geraet-grenze=""');
    expect(m).not.toContain('data-motion');
    expect(m).toMatch(/Monoblock-Bauweise: Der Kältekreis bleibt im Gerät/);
    expect(m).toContain(`${COMPRESS_AW_S.kaeltemittel.name} (Propan), 0,95 kg`);
  });

  it('der Hausschnitt zeichnet die Leitungen des Moduls; vom Anschluss bis unter das Gelände als verdeckte Linie', () => {
    const m = html(createElement(HausschnittKlein, {}));
    const gezeichnet = wege(m);
    const ohneKnopf = HAUS_LEITUNGEN.filter((l) => !l.nur);
    expect(gezeichnet.map((w) => w.key).sort()).toEqual(ohneKnopf.map((l) => l.id).sort());
    for (const w of gezeichnet) expect(w.d).toBe(ohneKnopf.find((l) => l.id === w.key)!.d);
    // Die Stücke hinter Gehäuse und Sockel stehen in der Linienart verdeckt, ohne Bewegung; alle anderen als Leitung
    for (const l of ohneKnopf) {
      const tag = m.match(new RegExp(`<path [^>]*data-weg="${l.id}"[^>]*>`))![0];
      expect(tag.includes('data-verdeckt=""'), l.id).toBe(Boolean(l.verdeckt));
      expect(tag, l.id).not.toContain('data-motion');
      expect(/class="[^"]*_verdeckt_/.test(tag), l.id).toBe(Boolean(l.verdeckt));
      expect(/class="[^"]*_leitung_/.test(tag), l.id).toBe(!l.verdeckt);
    }
    // Ohne die Leitungen zur Bewerbung kreuzt sich nichts, also auch kein Mantel
    for (const l of ohneKnopf.filter((x) => x.mantel)) expect(m).not.toContain(`<path d="${l.mantel}"`);
  });
});

describe('Bosch-Sperre (E-029, M-021)', () => {
  it('variante="marke" zeichnet ohne Freigabe die neutrale Fassung', () => {
    expect(BOSCH_FREIGABE.erteilt).toBe(false);
    for (const [groesse] of GROESSEN) {
      const m = geraet({ groesse, variante: 'marke' });
      expect(m).toContain('data-variante="neutral"');
      expect(m).not.toContain('data-variante="marke"');
    }
  });

  it('„Bosch“ steht nur in der Quellenangabe des Schriftfelds, nie in der Zeichnung', () => {
    const m = geraet({ groesse: 'S', ansicht: 'vorne', massketten: 'voll' });
    const zeichnung = m.slice(0, m.indexOf('<figcaption'));
    expect(zeichnung).not.toMatch(/bosch/i);
    expect(m.match(/Bosch/g)).toHaveLength(1);
    expect(html(createElement(Kaeltekreis, {})).replace(/Bosch Installationsanleitung/g, '')).not.toMatch(/bosch/i);
    expect(html(createElement(Anlagenschema, {}))).not.toMatch(/bosch/i);
  });
});

describe('Budgets (K-013, gzip per zlib)', () => {
  it('Einstieg ≤ 15 KB: das ganze Markup des Abschnitts mit Hausschnitt und Einzelheit', () => {
    const m = html(createElement(Hero, { now: new Date('2026-10-14T09:00:00Z') }));
    expect(gzip(m)).toBeLessThanOrEqual(15 * 1024);
  });

  it('Gerät ≤ 12 KB: jede Ansicht beider Größen mit vollen Maßketten, Rotor und Schriftfeld', () => {
    for (const [groesse] of GROESSEN) {
      for (const ansicht of ['vorne', 'seite'] as const) {
        const m = geraet({ groesse, ansicht, massketten: 'voll', bewegt: true });
        expect(gzip(m), `${groesse} ${ansicht}`).toBeLessThanOrEqual(12 * 1024);
      }
    }
  });

  it('Steuerung ≤ 2 KB: die Client-Insel als minifiziertes Bündel mit allem, was sie in den Browser zieht (React extern)', async () => {
    const eingang = 'components/zeichnung/bewegung/DauerSteuerung.tsx';
    // Die Insel importiert nur React, diese Module und ihr CSS-Modul; die Module ziehen nichts weiter nach
    const importe = [...quelle(eingang).matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    expect(importe.sort()).toEqual(['./dauer.module.css', '@/components/icons/bedien', '@/lib/motion/dauer', '@/lib/motion/prefers', '@/lib/motion/sicht', 'react']);
    for (const d of ['lib/motion/dauer.ts', 'lib/motion/sicht.ts', 'lib/motion/prefers.ts', 'components/icons/bedien.ts']) {
      for (const imp of [...quelle(d).matchAll(/from '([^']+)'/g)].map((m) => m[1])) expect(imp, d).toMatch(/^\.\/(?:prefers|sicht|dauer)$/);
    }
    // Bündeln wie für den Browser (Rolldown, der Bündler unter Vitest): minifiziert, Klassen des CSS-Moduls als Stub
    const { build } = await import('rolldown');
    const ergebnis = await build({
      input: path.join(ROOT, eingang),
      external: [/^react(?:\/|$)/],
      resolve: { alias: { '@': ROOT } },
      plugins: [
        {
          name: 'css-modul',
          resolveId: (quelle: string) => (quelle.endsWith('.module.css') ? '\0css-modul' : null),
          load: (id: string) => (id === '\0css-modul' ? 'export default { bereich: "a", leiste: "b", knopf: "c", wartet: "d", zeichen: "e" };' : null),
        },
      ],
      output: { minify: true, format: 'esm' },
      write: false,
    });
    const code = ergebnis.output[0].code;
    expect(code).toContain('IntersectionObserver');
    expect(code).toContain('visibilitychange');
    expect(gzip(code)).toBeLessThanOrEqual(2 * 1024);
  }, 30_000);
});

describe('Dauerbewegung nur in einem Bereich mit DauerSteuerung (E-029)', () => {
  it('der Prüfer erkennt Kennungen außerhalb eines Bereichs', () => {
    expect(dauerAusserhalb('<div><svg data-motion="rotor-dreht"></svg></div>')).toEqual(['rotor-dreht']);
    expect(dauerAusserhalb('<div data-dauer="aus"><p><svg data-motion="rotor-dreht"><path/></svg></p></div><i data-motion="druck"></i>')).toEqual([]);
    expect(dauerAusserhalb('<div data-dauer="aus"></div><path d="M0 0" data-motion="wasser-fliesst"/>')).toEqual(['wasser-fliesst']);
  });

  it('die Startseite: jede Dauer-Kennung liegt in einem Bereich mit data-dauer', () => {
    const m = html(createElement(Hero, { now: new Date('2026-10-14T09:00:00Z') }));
    expect(m).toContain('data-motion="rotor-dreht"');
    expect(dauerAusserhalb(m)).toEqual([]);
  });

  it('DauerSteuerung rendert auf dem Server das Standbild (data-dauer="aus") und den Knopf, bis zur Hydration unsichtbar', () => {
    const m = html(createElement(DauerSteuerung, { beschriftung: 'Kältekreis' }, createElement(Kaeltekreis, { bewegt: true })));
    expect(m).toMatch(/^<div class="[^"]*" data-dauer="aus">/);
    expect(dauerAusserhalb(m)).toEqual([]);
    expect(m).toMatch(/<button type="button" class="[^"]*wartet[^"]*" data-dauer-knopf=""><svg[^>]*aria-hidden="true"[^>]*><path d="M9 6v12M15 6v12"><\/path><\/svg>Anhalten<\/button>/);
  });

  it('jede Datei, die eine Zeichnung mit `bewegt` einsetzt, setzt auch DauerSteuerung ein', () => {
    const treffer: string[] = [];
    const lauf = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
        if (statSync(p).isDirectory()) lauf(p);
        else if (/\.tsx$/.test(name)) {
          const src = quelle(path.relative(ROOT, p));
          if (/<(?:Aussengeraet|Kaeltekreis|Anlagenschema)\b[^>]*\sbewegt(?:=\{true\})?[\s/>]/.test(src)) {
            treffer.push(path.relative(ROOT, p));
            expect(src, p).toMatch(/<DauerSteuerung\b/);
          }
        }
      }
    };
    for (const dir of ['app', 'components']) lauf(path.join(ROOT, dir));
    expect(treffer).toContain('components/home/einstieg/Einstieg.tsx');
  });

  it('die Schleifen laufen nur unter [data-dauer="an"] und prefers-reduced-motion: no-preference; der Knopf hat 44 px', () => {
    const css = ohneKommentare(quelle('components/zeichnung/bewegung/dauer.module.css'));
    const block = css.match(/@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*)\}\s*$/)![1];
    const regeln = [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    expect(regeln.map((r) => r[1].trim())).toEqual([
      '.bereich[data-dauer="an"] .rotor[data-motion="rotor-dreht"]',
      '.bereich[data-dauer="an"] .fluss',
      '.bereich[data-dauer="an"] .fluss[data-motion="wasser-fliesst"] .band',
      '.bereich[data-dauer="an"] .fluss[data-motion="kaeltemittel-fliesst"] .band',
    ]);
    // Das Strichmuster wird nur sichtbar; bewegt wird allein transform (Compositor, Befund 10 der Prüfung E-029)
    expect(regeln[1][2].trim()).toBe('opacity: 1;');
    const keyframes = [...css.matchAll(/@keyframes (\w+) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)];
    expect(keyframes.map((k) => k[1])).toEqual(['rotorDreht', 'fliessen']);
    for (const [, name, inhalt] of keyframes) {
      const eigenschaften = [...inhalt.matchAll(/([a-z-]+):/g)].map((e) => e[1]);
      expect(new Set(eigenschaften), name).toEqual(new Set(['transform']));
    }
    expect(css).not.toMatch(/stroke-dash/);
    expect(css.slice(0, css.indexOf('@media (prefers-reduced-motion: no-preference)'))).not.toMatch(/animation|infinite/);
    expect(css).toMatch(/\.knopf \{[^}]*min-width: var\(--m-ziel\);[^}]*min-height: var\(--m-ziel\);/);
    expect(quelle('app/styles/theme.css')).toMatch(/--m-ziel: 2\.75rem;/);
    expect(css).toMatch(/@media \(scripting: none\) \{\s*\.knopf \{\s*display: none;/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.knopf \{\s*display: none;/);
    expect(css).not.toMatch(/scale\(|filter|box-shadow|opacity:\s*0\.\d/);
  });
});
