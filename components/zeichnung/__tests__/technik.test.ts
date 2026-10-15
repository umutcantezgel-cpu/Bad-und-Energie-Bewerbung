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
import {
  ANLAGENSCHEMA_BEREICHE,
  ANLAGENSCHEMA_FLUSS_SPERREN,
  ANLAGENSCHEMA_KAELTE,
  ANLAGENSCHEMA_LEITUNGEN,
  ANLAGENSCHEMA_PFEIL_MAX,
  ANLAGENSCHEMA_PFEILE,
  ANLAGENSCHEMA_RAHMEN,
  ANLAGENSCHEMA_SYMBOLE,
} from '@/lib/zeichnung/szenen/anlagenschema';
import { HEIZKOERPER_LAGE, LEITUNGEN as HAUS_LEITUNGEN } from '@/lib/zeichnung/szenen/hausschnitt';
import {
  KAELTEKREIS_FLUSS_SPERREN,
  KAELTEKREIS_GERAET,
  KAELTEKREIS_PFEIL_MAX,
  KAELTEKREIS_PFEILE,
  KAELTEKREIS_RAHMEN,
  KAELTEKREIS_SYMBOLE,
  KAELTEKREIS_WASSER,
  KAELTEKREIS_WEGE,
} from '@/lib/zeichnung/szenen/kaeltekreis';
import { PFEIL_GRUNDMASS, flussMuster, flussStrecken, type SchemaLeitung } from '@/lib/zeichnung/szenen/schema';
import { TOKENS } from '@/lib/tokens';
import { ANSICHT_SCHRIFT, ansichtVon } from '@/lib/zeichnung/geraete/ansicht';
import { SYMBOLE, kennbuchstabe, type SymbolId } from '@/lib/zeichnung/symbole';
import { DauerSteuerung } from '../bewegung/DauerSteuerung';
import { Anlagenschema } from '../technik/Anlagenschema';
import { Aussengeraet, type AussengeraetProps } from '../technik/Aussengeraet';
import { HausschnittKlein } from '../technik/Hausschnitt';
import { Kaeltekreis } from '../technik/Kaeltekreis';
import { Symbol } from '../technik/Symbol';

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
    for (const w of [COMPRESS_AW_L.tiefe.mm, COMPRESS_AW_L.konsolen.lochabstandTiefe.mm, COMPRESS_AW_L.konsolen.lochRand.mm, COMPRESS_AW_L.hoehe.mm, COMPRESS_AW_L.hydraulik.hoehe.mm]) {
      expect(werteSeite, String(w)).toContain(w);
    }
    expect(vorne).toContain(`Dok.-Nr. ${COMPRESS_AW_S.quelle.dokument} (${COMPRESS_AW_S.quelle.ausgabe})`);
    expect(vorne).toContain('Form neutral gezeichnet, nicht die Gestaltung des Herstellers.');
    expect(vorne).toContain('Maße in mm · maßstäblich gezeichnet');
    expect(vorne).toMatch(/role="img" aria-label="Außeneinheit 4–7\u00a0kW einer Luft\/Wasser-Wärmepumpe von vorn: 1\.100\u00a0mm breit, 800\u00a0mm hoch/);
    expect(vorne).toContain('Außeneinheit 4–7\u00a0kW · Ansicht von vorn');
  });

  it('Vorderansicht: der verdeckte Verdampfer liegt nur über seiner Breite, kein hydraulischer Anschluss darin (Runde 2)', () => {
    for (const [groesse, g] of GROESSEN) {
      const a = ansichtVon(g, 'vorne');
      const rechteck = (d: string) => {
        const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
        return { x0: n[0], y0: n[1], x1: n[2], y1: n[3] };
      };
      expect(a.verdeckt, groesse).toHaveLength(1);
      const v = rechteck(a.verdeckt[0]);
      expect(v.x0, groesse).toBe(g.verdampfer.vonLinks.mm);
      expect(v.x1, groesse).toBe(g.verdampfer.vonLinks.mm + g.verdampfer.breite.mm);
      // Lage aus dem Gitter abgeleitet: geschätzt, mit Fundstelle Bild 3/4
      for (const m of [g.verdampfer.vonLinks, g.verdampfer.breite]) {
        expect(m.geschaetzt, groesse).toBeDefined();
        expect(m.stelle, groesse).toMatch(/Bild 3\/4/);
      }
      const anschluesse = a.kreise.filter((k) => k.art === 'verdeckt');
      expect(anschluesse, groesse).toHaveLength(2);
      for (const k of anschluesse) {
        // Der ganze Anschlusskreis liegt rechts neben dem Verdampfer (kein Punkt im Umriss)
        const drin = k.cx + k.r > v.x0 && k.cx - k.r < v.x1 && k.cy + k.r > v.y0 && k.cy - k.r < v.y1;
        expect(drin, `${groesse}: Anschluss ${k.cx}/${k.cy} im Verdampfer`).toBe(false);
        expect(k.cx - k.r, groesse).toBeGreaterThan(v.x1);
      }
      expect(v.x1, groesse).toBeLessThan(g.breite.mm);
    }
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
    // Gründung und Kondensatweg (Prüfung E-029, Runde 2): Schotter, Kondensatrohr ins Kiesbett
    for (const teil of ['data-schotter=""', 'data-kondensat=""', 'data-kiesbett=""']) expect(m).toContain(teil);
  });

  it('Startseite: die verdeckten T-Stücke der Leitungen zur Bewerbung nur in der Fassung ihrer Leitung, kein Mantel mehr', () => {
    const m = html(createElement(Hero, {}));
    // Keine Kreuzung mehr (Prüfung E-029, Runde 3): also auch keine Fläche, die eine hintere Leitung aussetzen lässt
    expect(m).not.toContain('data-mantel');
    const verdeckt = HAUS_LEITUNGEN.filter((l) => l.verdeckt && l.nur);
    expect(verdeckt.map((l) => l.id).sort()).toEqual(['ruecklauf-knopf-anschluss', 'vorlauf-knopf-anschluss']);
    for (const l of verdeckt) {
      const tag = m.match(new RegExp(`<path [^>]*data-weg="${l.id}"[^>]*>`))![0];
      expect(tag, l.id).toContain('data-verdeckt=""');
      expect(tag, l.id).toMatch(/class="[^"]*_verdeckt_/);
      // Der Rücklauf von der Bewerbung gibt es nur am Handy; das T-Stück des Vorlaufs gehört zu beiden Fassungen
      if (l.nur === 'knopf-mobil') expect(tag, l.id).toMatch(/class="[^"]*_nurMobil_/);
      else expect(tag, l.id).not.toMatch(/_nur(?:Mobil|Desktop)_/);
    }
  });
});

describe('Schrift in den Zeichnungen: gezeichnet mindestens 12 px an der kleinsten vorgesehenen Breite (Prüfung E-029, Befund 7)', () => {
  /** Kleinste Breite einer Inhaltsspalte: 320 px Bildschirm abzüglich zweimal 20 px Rand. */
  const KLEINSTE_SPALTE = 280;
  const MINDEST_PX = 12;
  const technik = ohneKommentare(quelle('components/zeichnung/technik/technik.module.css'));
  /** Wert einer Eigenschaft der Regel `.klasse` im Block (ohne @container: oberste Ebene). */
  const wert = (block: string, klasse: string, name: string) => {
    const regel = block.match(new RegExp(`(?:^|\\n)\\s*\\.${klasse} \\{([^}]*)\\}`));
    const treffer = regel?.[1].match(new RegExp(`${name}: ([\\d.]+)px;`));
    return treffer ? Number(treffer[1]) : null;
  };
  const container = (bedingung: string) => {
    const i = technik.indexOf(`@container (${bedingung}) {`);
    expect(i, bedingung).toBeGreaterThan(-1);
    const rest = technik.slice(i);
    // Bis zur schließenden Klammer des @container-Blocks (eine Ebene tiefer: die Regeln)
    let tiefe = 0;
    for (let j = rest.indexOf('{'); j < rest.length; j++) {
      if (rest[j] === '{') tiefe++;
      if (rest[j] === '}' && --tiefe === 0) return rest.slice(0, j + 1);
    }
    return rest;
  };
  const oben = technik.replace(/@(?:container|media)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');

  it('Schemata: Etiketten je Stufe der Fläche, an ihrer schmalsten Breite gezeichnet ≥ 12 px', () => {
    // Stufen der Fläche (Container .schema): über 40rem, bis 40rem (ab 26rem), bis 26rem (ab der kleinsten Spalte)
    const stufen = [
      { block: oben, ab: 40 * 16 },
      { block: container('max-width: 40rem'), ab: 26 * 16 },
      { block: container('max-width: 26rem'), ab: KLEINSTE_SPALTE },
    ];
    for (const { klasse, breite } of [
      { klasse: 'kaeltekreisBild', breite: KAELTEKREIS_RAHMEN.breite },
      { klasse: 'anlagenBild', breite: ANLAGENSCHEMA_RAHMEN.breite },
    ]) {
      for (const { block, ab } of stufen) {
        const einheiten = wert(block, klasse, '--etikett');
        expect(einheiten, `${klasse} ab ${ab} px`).not.toBeNull();
        expect((einheiten! * ab) / breite, `${klasse} ab ${ab} px`).toBeGreaterThanOrEqual(MINDEST_PX);
      }
      // Beschriftung der Symbole erst ab 40rem sichtbar, dann ebenfalls ≥ 12 px
      const symbol = wert(oben, klasse, '--symbol-etikett');
      expect((symbol! * 640) / breite, `${klasse} Symbole`).toBeGreaterThanOrEqual(MINDEST_PX);
    }
    expect(oben).toMatch(/\.symbolText \{\s*display: none;/);
    expect(container('min-width: 40rem')).toMatch(/\.symbolText \{\s*display: inline;/);
    // Jede Schrift der Schemata richtet sich nach diesen Rollen (die font-size im Markup gilt nur ohne CSS)
    for (const m of [html(createElement(Kaeltekreis)), html(createElement(Anlagenschema))]) {
      const texte = [...m.matchAll(/<text [^>]*class="([^"]*)"/g)].map((t) => t[1]);
      expect(texte.length).toBeGreaterThan(5);
      for (const k of texte) expect(k).toMatch(/_(?:schemaText|symbolText)_/);
    }
  });

  it('Fließpfeile der Schemata je Stufe der Fläche: an ihrer schmalsten Breite gezeichnet ≥ 10 px lang und ≥ 3 × Leitung breit (Runde 2)', () => {
    // Wie die Schrift: Faktor --pfeil je Stufe auf die Grundgröße (szenen/schema.ts), gerechnet an der schmalsten Fläche
    const stufen = [
      { block: oben, ab: 40 * 16 },
      { block: container('max-width: 40rem'), ab: 26 * 16 },
      { block: container('max-width: 26rem'), ab: KLEINSTE_SPALTE },
    ];
    const faktor = (block: string, klasse: string) => {
      const regel = block.match(new RegExp(`(?:^|\\n)\\s*\\.${klasse} \\{([^}]*)\\}`));
      const treffer = regel?.[1].match(/--pfeil: ([\d.]+);/);
      return treffer ? Number(treffer[1]) : null;
    };
    for (const { klasse, breite } of [
      { klasse: 'kaeltekreisBild', breite: KAELTEKREIS_RAHMEN.breite },
      { klasse: 'anlagenBild', breite: ANLAGENSCHEMA_RAHMEN.breite },
    ]) {
      for (const { block, ab } of stufen) {
        const k = faktor(block, klasse);
        expect(k, `${klasse} ab ${ab} px`).not.toBeNull();
        const px = (einheiten: number) => (einheiten * k! * ab) / breite;
        expect(px(PFEIL_GRUNDMASS.laenge), `${klasse} ab ${ab} px: Länge`).toBeGreaterThanOrEqual(10);
        expect(px(PFEIL_GRUNDMASS.breite), `${klasse} ab ${ab} px: Breite`).toBeGreaterThanOrEqual(3 * TOKENS.linien.leitung);
      }
    }
    // Der Faktor wirkt als scale um die Spitze: Regel .pfeil, im Markup je Pfeil transform-origin = Spitze
    expect(oben).toMatch(/\.pfeil \{\s*scale: var\(--pfeil, 1\);/);
    for (const [m, pfeile] of [
      [html(createElement(Kaeltekreis)), KAELTEKREIS_PFEILE],
      [html(createElement(Anlagenschema)), ANLAGENSCHEMA_PFEILE],
    ] as const) {
      for (const p of pfeile) {
        expect(m, p.d).toContain(`d="${p.d}" class="`);
        const tag = m.slice(m.indexOf(`d="${p.d}"`) - 1).split('>')[0];
        expect(tag, p.d).toMatch(/class="[^"]*_pfeil_/);
        expect(tag, p.d).toContain(`transform-origin:${p.spitze.x}px ${p.spitze.y}px`);
        expect(p.d.startsWith(`M${p.spitze.x} ${p.spitze.y}L`), p.d).toBe(true);
      }
    }
  });

  it('Fließpfeile in der größten Stufe: kein Pfeil überdeckt ein Symbol oder eine andere Leitung (Runde 2)', () => {
    /** Ecken des Pfeils, um die Spitze um k vergrößert. */
    const ecken = (d: string, k: number) => {
      const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
      const spitze = { x: n[0], y: n[1] };
      return [0, 2, 4].map((i) => ({ x: spitze.x + (n[i] - spitze.x) * k, y: spitze.y + (n[i + 1] - spitze.y) * k }));
    };
    const huelle = (s: { id: SymbolId; lage: { x: number; y: number; massstab?: number; drehung?: number } }) => {
      const { halb } = SYMBOLE[s.id];
      const m = s.lage.massstab ?? 1;
      const quer = Math.abs((s.lage.drehung ?? 0) % 180) === 90;
      const hx = (quer ? halb.y : halb.x) * m;
      const hy = (quer ? halb.x : halb.y) * m;
      return { x0: s.lage.x - hx, y0: s.lage.y - hy, x1: s.lage.x + hx, y1: s.lage.y + hy };
    };
    for (const { name, k, pfeile, symbole, wege } of [
      { name: 'Kältekreis', k: KAELTEKREIS_PFEIL_MAX, pfeile: KAELTEKREIS_PFEILE, symbole: KAELTEKREIS_SYMBOLE, wege: [...KAELTEKREIS_WEGE, ...KAELTEKREIS_WASSER] },
      { name: 'Anlagenschema', k: ANLAGENSCHEMA_PFEIL_MAX, pfeile: ANLAGENSCHEMA_PFEILE, symbole: ANLAGENSCHEMA_SYMBOLE, wege: [...ANLAGENSCHEMA_LEITUNGEN, ...ANLAGENSCHEMA_KAELTE] },
    ]) {
      // Der Faktor der kleinsten Stufe steht so auch in technik.module.css (die Sperren der Fluss-Ebene rechnen mit ihm)
      expect(container('max-width: 26rem'), name).toContain(`--pfeil: ${k};`);
      expect([2.4, 3.6], name).toContain(k);
      for (const p of pfeile) {
        const e = ecken(p.d, k);
        const box = { x0: Math.min(...e.map((q) => q.x)), y0: Math.min(...e.map((q) => q.y)), x1: Math.max(...e.map((q) => q.x)), y1: Math.max(...e.map((q) => q.y)) };
        // Symbole: keine Überschneidung (0,5 Einheiten Spiel)
        for (const sym of symbole) {
          const h = huelle(sym);
          const ueber = Math.min(box.x1, h.x1) - Math.max(box.x0, h.x0) > 0.5 && Math.min(box.y1, h.y1) - Math.max(box.y0, h.y0) > 0.5;
          expect(ueber, `${name}: Pfeil ${p.d} über ${sym.key}`).toBe(false);
        }
        // Leitungen: nur die eigene (auf der die Spitze liegt) kreuzt den Pfeil
        const eigen = (w: { punkte: readonly { x: number; y: number }[] }) =>
          w.punkte.slice(1).some((b, i) => {
            const a = w.punkte[i];
            const t = (b.x - a.x) * (p.spitze.x - a.x) + (b.y - a.y) * (p.spitze.y - a.y);
            const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
            const q = { x: a.x + ((b.x - a.x) * t) / l2, y: a.y + ((b.y - a.y) * t) / l2 };
            return t >= 0 && t <= l2 && Math.hypot(q.x - p.spitze.x, q.y - p.spitze.y) < 0.5;
          });
        for (const w of wege.filter((x) => !eigen(x))) {
          for (let i = 1; i < w.punkte.length; i += 1) {
            const [a, b] = [w.punkte[i - 1], w.punkte[i]];
            const sx0 = Math.min(a.x, b.x);
            const sx1 = Math.max(a.x, b.x);
            const sy0 = Math.min(a.y, b.y);
            const sy1 = Math.max(a.y, b.y);
            // Achsparallele Stücke: liegt das Stück mehr als 0,5 Einheiten im Rechteck des Pfeils?
            const quer = (lo: number, hi: number, z0: number, z1: number) =>
              z0 === z1 ? z0 > lo + 0.5 && z0 < hi - 0.5 : Math.min(hi, z1) - Math.max(lo, z0) > 0.5;
            const trifft = quer(box.x0, box.x1, sx0, sx1) && quer(box.y0, box.y1, sy0, sy1);
            expect(trifft, `${name}: Pfeil ${p.d} über ${w.key}`).toBe(false);
          }
        }
      }
    }
  });

  it('Kennbuchstaben in Symbolen (M, T) sind gezeichnet, keine Schrift; Symbole und Legende ohne <text>', () => {
    for (const id of Object.keys(SYMBOLE) as SymbolId[]) {
      const m = html(createElement('svg', null, createElement(Symbol, { id, x: 0, y: 0 })));
      expect(m, id).not.toContain('<text');
    }
    expect(SYMBOLE.fuehler.formen).toContainEqual({ d: kennbuchstabe('T', 0, -14), fein: true });
    expect(SYMBOLE.dreiwegeventil.formen).toContainEqual({ d: kennbuchstabe('M', 0, -16), fein: true });
    // M: zwei Senkrechte und die Spitze in der Mitte; T: Balken und Stamm; beide 6 × 8 um die Mitte
    expect(kennbuchstabe('M', 0, 0)).toBe('M-3 4V-4L0 1L3 -4V4');
    expect(kennbuchstabe('T', 0, 0)).toBe('M-3 -4H3M0 -4V4');
  });

  it('Außeneinheit: Maßzahlen je Einsatz an der kleinsten Breite gezeichnet ≥ 12 px', () => {
    // Kleinste Darstellungsbreite je Einsatz (gemessen, e2e prüft die gezeichnete Größe): Wärmepumpen-Seite einspaltig
    // auf 320 px (280), Seitenansicht zweispaltig ab 48em (240), Stellenkopf am Handy (256), Einzelheit X der
    // Startseite (mindestens 12.5rem = 200)
    const einsaetze = [
      { datei: 'components/themen/WaermepumpenSeite.tsx', muster: /ansicht="vorne" massketten="voll" massSchrift=\{(\d+)\}/, ansicht: 'vorne', massketten: 'voll', breite: KLEINSTE_SPALTE },
      { datei: 'components/themen/WaermepumpenSeite.tsx', muster: /ansicht="seite" massketten="voll"(?: massSchrift=\{(\d+)\})?/, ansicht: 'seite', massketten: 'voll', breite: 240 },
      { datei: 'components/themen/WaermepumpenSeite.tsx', muster: /panel=\{<Aussengeraet ansicht="vorne" massketten="haupt"[^>]*massSchrift=\{(\d+)\}/, ansicht: 'vorne', massketten: 'haupt', breite: KLEINSTE_SPALTE },
      { datei: 'components/jobs/stelle/Kopfbild.tsx', muster: /<Aussengeraet ansicht="vorne" massketten="haupt"[^>]*massSchrift=\{(\d+)\}/, ansicht: 'vorne', massketten: 'haupt', breite: 256 },
      { datei: 'components/home/einstieg/Einstieg.tsx', muster: /<Aussengeraet ansicht="vorne" massketten="haupt"[^>]*massSchrift=\{(\d+)\}/, ansicht: 'vorne', massketten: 'haupt', breite: 200 },
    ] as const;
    for (const e of einsaetze) {
      const treffer = quelle(e.datei).match(e.muster);
      expect(treffer, `${e.datei} ${e.ansicht}`).not.toBeNull();
      const schrift = treffer![1] ? Number(treffer![1]) : ANSICHT_SCHRIFT.haupt;
      const a = ansichtVon(COMPRESS_AW_S, e.ansicht, { detail: 'voll', massketten: e.massketten, schrift });
      const px = (schrift * e.breite) / (a.rahmen.x1 - a.rahmen.x0);
      expect(px, `${e.datei} ${e.ansicht} ${e.massketten}: ${schrift} Einheiten`).toBeGreaterThanOrEqual(MINDEST_PX);
    }
    // Die Breiten oben gelten, solange die Seite sie so setzt
    expect(quelle('components/home/einstieg/einstieg.module.css')).toMatch(/width: max\(calc\(250 \* var\(--e\)\), 12\.5rem\);/);
    expect(ohneKommentare(quelle('components/themen/themen.module.css'))).toMatch(/@media \(max-width: 47\.99em\) \{\s*\.geraetSeite \{\s*max-width: 26rem;/);
    // Keine Hinweise mit Hinweislinie mehr im Bild; die Anschlüsse nennt das Schriftfeld
    const seite = geraet({ ansicht: 'seite', massketten: 'voll' });
    expect(seite).not.toMatch(/ANSCHLÜSSE|_etikett_/);
    expect(seite).toContain(`die Anschlüsse für das Heizwasser, ${COMPRESS_AW_S.hydraulik.hoehe.mm}\u00a0mm über der Aufstellfläche`);
    expect(seite).toContain(`je eine Bodenhalterung, ihre Bohrungen ${COMPRESS_AW_S.konsolen.lochabstandTiefe.mm}\u00a0mm auseinander`);
    expect(seite).toMatch(/aria-label="[^"]*je Seite zwei Bodenhalterungen mit 580\u00a0mm zwischen den Bohrungen/);
  });

  it('jede Schrift im Markup hat mindestens 12 Einheiten (Hausschnitt, Geräte, Schemata ohne CSS)', () => {
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

  it('Enden je Linienart (E-031): nur die Leitung rund, sonst stumpf; rund im Knopf nur das Bedienzeichen', () => {
    // Je Regel mit stroke-linecap Selektor und Ende, exakt: Linienarten stumpf, die Leitung rund, das Strichmuster der
    // Bewegung stumpf (den Mantel an Kreuzungen gibt es seit Runde 3 nicht mehr)
    const enden = [...technik.matchAll(/([^{}]+)\{[^}]*stroke-linecap:\s*([a-z]+)/g)].map((m) => [m[1].trim().replace(/\s+/g, ' '), m[2]]);
    expect(enden).toEqual([
      ['.leitung, .kontur, .fein, .mass, .verdeckt, .mittellinie, .schraffur', 'butt'],
      ['.leitung', 'round'],
      ['.band path', 'butt'],
    ]);
    expect(technik).not.toMatch(/\.mantel\b|--mantel-e/);
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
      {
        m: html(createElement(Kaeltekreis, { bewegt: true })),
        daten: [...KAELTEKREIS_WASSER, ...KAELTEKREIS_WEGE],
        rahmen: KAELTEKREIS_RAHMEN,
        sperren: KAELTEKREIS_FLUSS_SPERREN,
      },
      {
        m: html(createElement(Anlagenschema, { bewegt: true })),
        daten: [...ANLAGENSCHEMA_KAELTE, ...ANLAGENSCHEMA_LEITUNGEN],
        rahmen: ANLAGENSCHEMA_RAHMEN,
        sperren: ANLAGENSCHEMA_FLUSS_SPERREN,
      },
    ];
    for (const { m, daten, rahmen, sperren } of faelle) {
      const gezeichnet = wege(m);
      expect(gezeichnet.map((w) => w.key)).toEqual(daten.map((w) => w.key));
      for (const w of gezeichnet) {
        const l = daten.find((x) => x.key === w.key)!;
        expect(w.d, w.key).toBe(l.d);
        expect(w.medium, w.key).toBe(l.medium);
      }
      // Das Strichmuster liegt je Leitung auf den geraden Stücken ihres Pfads, gedreht in ihre Richtung (es wandert in +x
      // des Stücks, also in Fließrichtung); Wasser und Kältemittel getrennt. Es läuft über jedes sichtbare Rohrstück und
      // setzt nur unter den Sperren aus (Symbole, feste Fließpfeile, Wanddurchführung; Prüfung E-029, Runde 3)
      const { rand, strich } = flussMuster(rahmen.breite);
      const f = fluesse(m);
      expect(f.map((x) => x.key)).toEqual(gezeichnet.map((w) => w.key));
      // Rand der Sperren mit 0,3 Einheiten Spiel (Lage der Stücke in Prozent mit drei Stellen gerundet)
      const gesperrt = (q: { x: number; y: number }) =>
        sperren.some((k) => q.x > k.x0 + 0.3 && q.x < k.x1 - 0.3 && q.y > k.y0 + 0.3 && q.y < k.y1 - 0.3);
      gezeichnet.forEach((w, i) => {
        expect(f[i].id, w.key).toBe(w.medium === 'kaeltemittel' ? 'kaeltemittel-fliesst' : 'wasser-fliesst');
        const gerade = geradeImPfad(w.d);
        expect(gerade.length, w.key).toBeGreaterThan(0);
        const stuecke = f[i].strecken.map((s) => {
          const a = { x: (s.left * rahmen.breite) / 100, y: (s.top * rahmen.hoehe) / 100 + rand };
          const laenge = (s.width * rahmen.breite) / 100;
          expect((s.height * rahmen.hoehe) / 100, `${w.key} Höhe`).toBeCloseTo(2 * rand, 1);
          return { a, laenge, grad: s.grad };
        });
        // Jedes Stück des Musters liegt auf einem geraden Stück des Pfads, in seiner Richtung, nicht darüber hinaus
        for (const st of stuecke) {
          const g = gerade.find((x) => {
            const u = { x: Math.cos((x.grad * Math.PI) / 180), y: Math.sin((x.grad * Math.PI) / 180) };
            const t = (st.a.x - x.x) * u.x + (st.a.y - x.y) * u.y;
            const quer = Math.abs((st.a.x - x.x) * u.y - (st.a.y - x.y) * u.x);
            return Math.abs(((st.grad - x.grad + 540) % 360) - 180) < 0.1 && quer < 0.2 && t > -0.2 && t + st.laenge < x.laenge + 0.3;
          });
          expect(g, `${w.key}: Stück bei ${st.a.x.toFixed(1)}/${st.a.y.toFixed(1)} auf dem Pfad`).toBeDefined();
        }
        // Abgetastet je Einheit: Kein Punkt unter einer Sperre trägt Striche; jeder freie Punkt trägt welche, außer in
        // Resten kürzer als ein Strich
        for (const g of gerade) {
          const u = { x: Math.cos((g.grad * Math.PI) / 180), y: Math.sin((g.grad * Math.PI) / 180) };
          const proben = Array.from({ length: Math.floor(g.laenge) - 1 }, (_, j) => {
            const q = { x: g.x + u.x * (j + 1), y: g.y + u.y * (j + 1) };
            const gedeckt = stuecke.some((st) => {
              const t = (q.x - st.a.x) * u.x + (q.y - st.a.y) * u.y;
              const quer = Math.abs((q.x - st.a.x) * u.y - (q.y - st.a.y) * u.x);
              return Math.abs(((st.grad - g.grad + 540) % 360) - 180) < 0.1 && quer < 0.2 && t >= -0.2 && t <= st.laenge + 0.2;
            });
            return { q, gedeckt, frei: !gesperrt(q) };
          });
          for (const p of proben) if (p.gedeckt) expect(p.frei, `${w.key}: Striche unter einer Sperre bei ${p.q.x.toFixed(1)}/${p.q.y.toFixed(1)}`).toBe(true);
          // Freie Läufe: zusammenhängende freie Proben; ab einem Strich Länge (plus Rundung) ganz gedeckt
          let lauf: typeof proben = [];
          for (const p of [...proben, { q: { x: 0, y: 0 }, gedeckt: false, frei: false }]) {
            if (p.frei) {
              lauf.push(p);
              continue;
            }
            if (lauf.length > strich + 2) {
              for (const r of lauf.slice(1, -1)) expect(r.gedeckt, `${w.key}: frei, aber ohne Striche bei ${r.q.x.toFixed(1)}/${r.q.y.toFixed(1)}`).toBe(true);
            }
            lauf = [];
          }
        }
      });
      // Die Ebene liegt über dem SVG der Zeichnung, dekorativ
      expect(m).toMatch(/<\/svg><div class="[^"]*" aria-hidden="true" data-fluss="">/);
    }
  });

  it('kein Stück der Fluss-Ebene liegt über einem Symbol, einem festen Fließpfeil (größte Stufe) oder der Wanddurchführung (Runde 3)', () => {
    type Rechteck = { x0: number; y0: number; x1: number; y1: number; was: string };
    /** Flächen aus den Daten selbst (ohne die Sperren des Moduls): Symbol (halb × Vergrößerung), Pfeil, Durchführung. */
    const flaechen = (symbole: typeof ANLAGENSCHEMA_SYMBOLE, pfeile: typeof ANLAGENSCHEMA_PFEILE, k: number, extra: Rechteck[]): Rechteck[] => [
      ...symbole.map((x) => {
        const { halb } = SYMBOLE[x.id];
        const m = x.lage.massstab ?? 1;
        const quer = Math.abs((x.lage.drehung ?? 0) % 180) === 90;
        const [hx, hy] = [(quer ? halb.y : halb.x) * m, (quer ? halb.x : halb.y) * m];
        return { x0: x.lage.x - hx, y0: x.lage.y - hy, x1: x.lage.x + hx, y1: x.lage.y + hy, was: x.key };
      }),
      ...pfeile.map((p) => {
        // Ecken des Pfeils um die Spitze um k vergrößert (wie im Markup per scale)
        const n = (p.d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
        const e = [0, 2, 4].map((i) => ({ x: p.spitze.x + (n[i] - p.spitze.x) * k, y: p.spitze.y + (n[i + 1] - p.spitze.y) * k }));
        return { x0: Math.min(...e.map((q) => q.x)), y0: Math.min(...e.map((q) => q.y)), x1: Math.max(...e.map((q) => q.x)), y1: Math.max(...e.map((q) => q.y)), was: `Pfeil ${p.d}` };
      }),
      ...extra,
    ];
    const d = ANLAGENSCHEMA_BEREICHE.durchfuehrung;
    const faelle = [
      {
        name: 'Kältekreis',
        wege: [...KAELTEKREIS_WASSER, ...KAELTEKREIS_WEGE] as SchemaLeitung[],
        breite: KAELTEKREIS_RAHMEN.breite,
        sperren: KAELTEKREIS_FLUSS_SPERREN,
        flaechen: flaechen(KAELTEKREIS_SYMBOLE, KAELTEKREIS_PFEILE, KAELTEKREIS_PFEIL_MAX, []),
      },
      {
        name: 'Anlagenschema',
        wege: [...ANLAGENSCHEMA_KAELTE, ...ANLAGENSCHEMA_LEITUNGEN] as SchemaLeitung[],
        breite: ANLAGENSCHEMA_RAHMEN.breite,
        sperren: ANLAGENSCHEMA_FLUSS_SPERREN,
        flaechen: flaechen(ANLAGENSCHEMA_SYMBOLE, ANLAGENSCHEMA_PFEILE, ANLAGENSCHEMA_PFEIL_MAX, [
          { x0: d.x, y0: d.y, x1: d.x + d.breite, y1: d.y + d.hoehe, was: 'Wanddurchführung' },
        ]),
      },
    ];
    for (const { name, wege, breite, sperren, flaechen: fl } of faelle) {
      const { rand, strich } = flussMuster(breite);
      /** Treffer: Band des Stücks (Achse ± rand) überschneidet eine Fläche um mehr als 0,1 Einheiten. */
      const treffer = (stuecke: ReturnType<typeof flussStrecken>) =>
        stuecke.flatMap((st) => {
          const box = {
            x0: Math.min(st.von.x, st.bis.x) - (st.von.y === st.bis.y ? 0 : rand),
            x1: Math.max(st.von.x, st.bis.x) + (st.von.y === st.bis.y ? 0 : rand),
            y0: Math.min(st.von.y, st.bis.y) - (st.von.x === st.bis.x ? 0 : rand),
            y1: Math.max(st.von.y, st.bis.y) + (st.von.x === st.bis.x ? 0 : rand),
          };
          return fl.filter((f) => Math.min(box.x1, f.x1) - Math.max(box.x0, f.x0) > 0.1 && Math.min(box.y1, f.y1) - Math.max(box.y0, f.y0) > 0.1).map((f) => f.was);
        });
      for (const w of wege) {
        const stuecke = flussStrecken(w, sperren, strich);
        // Alle Stücke achsparallel (die Prüfung oben setzt das voraus)
        for (const st of stuecke) expect(st.von.x === st.bis.x || st.von.y === st.bis.y, `${name} ${w.key}`).toBe(true);
        expect(treffer(stuecke), `${name} ${w.key}`).toEqual([]);
        // Die Teilstücke behalten ihre Weglänge ab dem Anfang der Leitung (Takt über die Lücken)
        const ganz = flussStrecken(w);
        for (const st of stuecke) {
          const g = ganz.find((x) => x.winkel === st.winkel && st.anfang >= x.anfang - 1e-6 && st.anfang + st.laenge <= x.anfang + x.laenge + 1e-6)!;
          expect(g, `${name} ${w.key}`).toBeDefined();
          expect(st.anfang - g.anfang).toBeCloseTo(Math.hypot(st.von.x - g.von.x, st.von.y - g.von.y), 0);
        }
      }
      // Gegenprobe: ohne Sperren (Stand Runde 3) lägen die Striche über den festen Pfeilen und, im Anlagenschema, über
      // Armaturen, Pumpen und der Wanddurchführung
      const ohne = wege.flatMap((w) => treffer(flussStrecken(w)));
      expect(ohne.filter((x) => x.startsWith('Pfeil')).length, name).toBe(name === 'Kältekreis' ? KAELTEKREIS_PFEILE.length : ANLAGENSCHEMA_PFEILE.length);
      if (name === 'Anlagenschema') {
        for (const was of ['pumpe', 'absperrung-vl', 'rueckschlag', 'mischer', 'filter', 'Wanddurchführung']) expect(ohne, was).toContain(was);
      }
    }
  });

  it('Strichmuster: Periode als Schritt der Bewegung, die Striche decken das Stück in jeder Lage', () => {
    const m = html(createElement(Anlagenschema, { bewegt: true }));
    const { periode, strich, rand } = flussMuster(ANLAGENSCHEMA_RAHMEN.breite);
    const baender = [...m.matchAll(/<svg class="[^"]*" style="left:([-\d.]+)%;width:([\d.]+)%;--fluss-schritt:([\d.]+)%" viewBox="([^"]+)" preserveAspectRatio="none" focusable="false"><path d="([^"]+)"><\/path><\/svg>/g)];
    expect(baender.length).toBe(ANLAGENSCHEMA_LEITUNGEN.concat(ANLAGENSCHEMA_KAELTE).reduce((n, l) => n + flussStrecken(l, ANLAGENSCHEMA_FLUSS_SPERREN, strich).length, 0));
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
    expect(m).not.toContain('data-mantel');
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
