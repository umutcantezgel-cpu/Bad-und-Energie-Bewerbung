import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FRONT_BUDGET, FRONT_CSS, modulBytes } from '@/scripts/qa/check-css-chunks.mjs';
import { CURSOR_DATEI, WAERME_ROLLEN_ERLAUBT } from '@/scripts/qa/check-design-tokens.mjs';
import { DAUER_MS, DIFFUSION_STUETZ, FRONT_RINGE, KLICK_ENDE_MS, MOTION_REGISTER, TAKT_MS, WECHSEL } from '@/lib/motion/register';
import { FRONT_SCHICHTEN, FRONT_START, RING_START, frontMass } from '@/lib/motion/seitenwechsel';
import { diffusionsFehler, keyframesIn, kurveAus, listenteile } from '@/lib/motion/__tests__/keyframes';
import { Waermefront } from '../Waermefront';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: () => {}, prefetch: () => {} }),
}));

const ROOT = path.resolve(__dirname, '../../../..');
const lies = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const gzip = (s: string) => gzipSync(Buffer.from(s, 'utf8'), { level: 9 }).length;
const EINGANG = 'components/site/waermefront/Waermefront.tsx';
const css = lies(FRONT_CSS).replace(/\/\*[\s\S]*?\*\//g, '');

/** Deklarationen der Regel mit genau diesem Selektor (Quelle ohne Kommentare). */
function regel(selektor: string): Record<string, string> {
  const flucht = selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`(?:^|\\})\\s*${flucht}\\s*\\{([^}]*)\\}`));
  if (!m) throw new Error(`Regel ${selektor} fehlt`);
  return Object.fromEntries(
    m[1]
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]),
  );
}

describe('Waermefront: Markup (E-031)', () => {
  const markup = renderToStaticMarkup(createElement(Waermefront));

  it('zwei Überlagerungen als popover="manual", aria-hidden und inert, mit je einer Schicht pro Verzögerung des Registers', () => {
    const ueberlagerungen = [...markup.matchAll(/<div ([^>]*)>((?:<([ib])><\/\3>)*)<\/div>/g)];
    expect(ueberlagerungen.map((u) => u[0]).join('')).toBe(markup);
    const nach = Object.fromEntries(ueberlagerungen.map((u) => [u[1].match(/data-motion="([^"]+)"/)![1], u]));
    expect(Object.keys(nach).sort()).toEqual(['klick-waerme', 'seitenwechsel']);
    for (const [id, [, attribute, schichten]] of Object.entries(nach)) {
      expect(attribute, id).toMatch(/^popover="manual" class="[^"]+" aria-hidden="true" inert="" data-motion="[^"]+"$/);
      expect(schichten.match(/<[ib]>/g)!.length, id).toBe(MOTION_REGISTER[id as 'klick-waerme' | 'seitenwechsel'].verzoegerungTakte.length);
    }
    // Klick-Wärme: drei <i>; Front (Owner-Feedback 16.10.2026 (2)): zwei <i> Schleier, drei <b> Ringe, zuletzt ein <i>
    // in der Seitenfarbe (das CSS unterscheidet sie am Element)
    expect(nach['klick-waerme'][2]).toBe('<i></i>'.repeat(3));
    expect(nach.seitenwechsel[2]).toBe(`${'<i></i>'.repeat(2)}${'<b></b>'.repeat(FRONT_RINGE.verzoegerungTakte.length)}<i></i>`);
    // nichts Fokussierbares, kein Text: die Überlagerungen erscheinen nicht im Baum der Barrierefreiheit
    expect(markup.replace(/<[^>]+>/g, '')).toBe('');
    expect(markup).not.toMatch(/tabindex|<a\b|<button\b|role=/);
  });

  it('nur das Layout setzt die Insel ein, einmal und außerhalb von Suspense; ihr CSS lädt nur die Insel (globaler Chunk)', () => {
    const layout = lies('app/layout.tsx');
    expect(layout).toMatch(/^import \{ Waermefront \} from '@\/components\/site\/waermefront\/Waermefront';$/m);
    expect(layout.match(/<Waermefront \/>/g)).toHaveLength(1);
    expect(layout.slice(layout.indexOf('<Waermefront />') - 200, layout.indexOf('<Waermefront />'))).not.toMatch(/<Suspense[^/]*$/);
    const importeure: string[] = [];
    const lauf = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = path.join(dir, name);
        if (name === 'node_modules' || name === '__tests__' || name.startsWith('.')) continue;
        if (statSync(p).isDirectory()) lauf(p);
        else if (/\.(?:tsx?|css)$/.test(name) && /waermefront(?:\.module\.css|\/Waermefront)['"]/.test(readFileSync(p, 'utf8'))) {
          importeure.push(path.relative(ROOT, p));
        }
      }
    };
    for (const dir of ['app', 'components', 'lib']) lauf(path.join(ROOT, dir));
    expect(importeure.sort()).toEqual(['app/layout.tsx', EINGANG]);
  });
});

describe('Waermefront: die neue Seite steht oben (Prüfrunde 1 A1-2, C1-5)', () => {
  it('<html data-scroll-behavior="smooth">, solange globals.css weich scrollt: Next springt beim Wechsel ohne Weichheit', () => {
    const layout = lies('app/layout.tsx');
    expect(layout).toMatch(/<html [^>]*data-scroll-behavior="smooth"[^>]*>/);
    expect(lies('app/globals.css')).toMatch(/html \{\s*scroll-behavior: smooth;\s*\}/);
    // Vertrag der installierten Next-Version: Nur mit dem Attribut schaltet der Router das weiche Scrollen beim Wechsel ab
    const next = lies('node_modules/next/dist/shared/lib/router/utils/disable-smooth-scroll.js');
    expect(next).toContain("htmlElement.dataset.scrollBehavior === 'smooth'");
    expect(next).toContain("htmlElement.style.scrollBehavior = 'auto'");
  });
});

describe('Waermefront: CSS (E-031, K-009; Owner-Feedback 16.10.2026: sanfter Wärmeschleier, darauf die Ringe von Runde 1)', () => {
  const theme = lies('app/styles/theme.css');
  const k = Object.fromEntries(keyframesIn(css).map((x) => [x.name, x]));
  /** Wert einer Formel in --n (und --s = 1) für die Schicht n (nur + − × / und Zahlen). */
  const mitN = (formel: string, n: number) =>
    Number(new Function(`return ${formel.replace(/calc/g, '').replace(/var\(--n\)/g, String(n)).replace(/var\(--s\)/g, '1')}`)());
  /** Regeln der Schichten in Quellreihenfolge: `.e|.f|.k > T1 + … + Tk` mit T = *, i oder b. */
  const schichtRegeln = [...css.matchAll(/(?:^|\})\s*([^{}@]+?)\s*\{/g)]
    .map((m) => m[1].trim())
    .filter((sel) => /^\.[efk] > /.test(sel))
    .map((sel) => {
      const [, behaelter, kette] = sel.match(/^\.([efk]) > (.+)$/)!;
      return { sel, behaelter, kette: kette.split(' + '), decl: regel(sel) };
    });
  /** Was für die Schicht `index` gilt (Elemente `tags` einer Überlagerung): passende Regeln nach Spezifität und Reihenfolge. */
  const schicht = (behaelter: 'f' | 'k', tags: readonly string[], index: number): Record<string, string> =>
    Object.assign(
      {},
      ...schichtRegeln
        .map((r, ord) => ({ ...r, ord, spez: r.kette.filter((t) => t !== '*').length }))
        .filter((r) => (r.behaelter === 'e' || r.behaelter === behaelter) && r.kette.length <= index + 1)
        .filter((r) => r.kette.every((t, j) => t === '*' || t === tags[index - r.kette.length + 1 + j]))
        .sort((a, b) => a.spez - b.spez || a.ord - b.ord)
        .map((r) => r.decl),
    );
  // Die Elemente wie im Markup (oben geprüft): Front zwei Schleier <i>, drei Ringe <b>, die Seitenfarbe <i>
  const FRONT_TAGS = ['i', 'i', 'b', 'b', 'b', 'i'] as const;
  const KLICK_TAGS = ['i', 'i', 'i'] as const;
  const je = FRONT_TAGS.map((_, i) => schicht('f', FRONT_TAGS, i));
  const jeKlick = KLICK_TAGS.map((_, i) => schicht('k', KLICK_TAGS, i));
  const SCHLEIER = [0, 1];
  const RINGE = [2, 3, 4];
  const SEITENFARBE = 5;
  const deckkraft = (r: Record<string, string>) => (r.opacity.startsWith('calc') ? mitN(r.opacity, Number(r['--n'])) : Number(r.opacity));
  const front = MOTION_REGISTER.seitenwechsel;
  const klick = MOTION_REGISTER['klick-waerme'];
  const wechsel = kurveAus(theme, 'k-wechsel');
  const EINBLENDEN = 'f var(--d-2) linear var(--q) both';
  // Front: Schleier über d-1 (der Klick antwortet sofort sichtbar), die Seitenfarbe setzt --g auf d-2
  const EINBLENDEN_FRONT = 'f var(--g, var(--d-1)) linear var(--q) both';
  const VERZOEGERUNG = 'calc(var(--takt)*var(--v, 0))';
  /** Dauer (1…4 für d-1…d-4) des Einblendens f einer Schicht: der letzte Teil ihres Ablaufs, --g aufgelöst. */
  const einblendDauer = (r: Record<string, string>) => {
    const teil = listenteile(r.animation).at(-1)!.trim();
    expect(teil).toMatch(/^f /);
    return Number(teil.replace(/var\(--g, (var\(--d-\d\))\)/, (_, rest: string) => r['--g'] ?? rest).match(/var\(--d-(\d)\)/)![1]);
  };
  /** √t wie @keyframes r: linear zwischen den Stützstellen, Anteil 0…1 → Fortschritt 0…1. */
  const wurzel = (anteil: number) => {
    const a = Math.min(1, Math.max(0, anteil));
    const i = DIFFUSION_STUETZ.findIndex(([t]) => t >= a);
    if (i <= 0) return DIFFUSION_STUETZ[0][1];
    const [[t0, p0], [t1, p1]] = [DIFFUSION_STUETZ[i - 1], DIFFUSION_STUETZ[i]];
    return p0 + ((p1 - p0) * (a - t0)) / (t1 - t0);
  };
  /** Halbmesser von Ring j (0…2) zur Zeit ms ab dem Klick, als Anteil des halben Kreises bis zur fernsten Ecke. */
  const ring = (j: number, ms: number) =>
    (RING_START + (1 - RING_START) * wurzel((ms - FRONT_RINGE.verzoegerungTakte[j] * TAKT_MS) / (FRONT_RINGE.dauerTakte[j] * TAKT_MS))) * FRONT_SCHICHTEN[RINGE[j]];

  it('genau drei Abläufe: w wächst von der Startgröße (--z) auf den Faktor, r wächst die Ringe nach √t, f blendet aus --t ein; kein Pop, kein Verblassen in Keyframes', () => {
    expect(Object.keys(k).sort()).toEqual(['f', 'r', 'w']);
    expect(k.w.stopps).toHaveLength(1);
    expect(k.w.stopps[0].anteil).toBe(0);
    expect(Object.fromEntries(k.w.stopps[0].deklarationen)).toEqual({ scale: 'var(--z)' });
    expect(k.f.stopps).toHaveLength(1);
    expect(k.f.stopps[0].anteil).toBe(0);
    expect(Object.fromEntries(k.f.stopps[0].deklarationen)).toEqual({ opacity: '0', translate: 'var(--t)' });
    // r: genau auf den Stützstellen von √t, nur scale, von RING_START auf 1 (Wert = Start + Fortschritt × (1 − Start))
    expect(k.r.stopps.map((st) => st.anteil)).toEqual(DIFFUSION_STUETZ.map(([t]) => t * 100));
    k.r.stopps.forEach((st, i) => {
      expect([...st.deklarationen.keys()]).toEqual(['scale']);
      expect(Number(st.deklarationen.get('scale'))).toBeCloseTo(RING_START + DIFFUSION_STUETZ[i][1] * (1 - RING_START), 9);
    });
    // Das Ziel des Wachsens: Schleier und Seitenfarbe der Grundwert scale --m (bis zur fernsten Ecke); die Ringe tragen
    // den Faktor --m als festes transform, ihr Wachsen ist allein r. Die Schichten stehen auf ihrem Mittelpunkt
    // (--t = −50 % −50 %, Einblenden ohne Weg)
    expect(regel('.f > *').scale).toBe('var(--m)');
    expect(regel('.f > b').transform).toBe('scale(var(--m))');
    expect(regel('.e > *')['--t']).toBe('-50% -50%');
    expect(regel('.e > *').translate).toBe('var(--t)');
    // √t gilt für die Ringe; ausgenommen nur w (Schleier und Seitenfarbe, Owner-Feedback 16.10.2026; register.test.ts)
    const fehler = diffusionsFehler(css);
    expect(fehler.length).toBeGreaterThan(0);
    expect(fehler.every((f) => /^w: /.test(f))).toBe(true);
  });

  it('Schleier und Seitenfarbe wachsen ruhig (Owner-Feedback 16.10.2026): d-4 mit k-wechsel nach einem Takt Vorlauf; in den ersten 100 ms praktisch kein Wachsen, nie ein Schuss', () => {
    const teile = listenteile(regel('.f > *').animation).map((t) => t.trim());
    expect(teile).toEqual(['w var(--d-4) var(--k-wechsel) var(--takt) both', EINBLENDEN_FRONT]);
    expect(regel('.e > *').animation).toBe(EINBLENDEN);
    // --g setzt allein die Seitenfarbe (d-2); der Schleier blendet über d-1 ein, voll nach 120 und 160 ms
    expect([...css.matchAll(/--g\s*:/g)]).toHaveLength(1);
    expect(je[SEITENFARBE]['--g']).toBe('var(--d-2)');
    expect(SCHLEIER.map((i) => einblendDauer(je[i]))).toEqual([1, 1]);
    expect(SCHLEIER.map((i) => Number(je[i]['--v'] ?? 0) * TAKT_MS + DAUER_MS['d-1'])).toEqual([120, 160]);
    expect(regel('.e > *')['--q']).toBe(VERZOEGERUNG);
    // Genau Schleier und Seitenfarbe tragen w (die Ringe haben ihren eigenen Ablauf)
    expect(je.map((r, i) => [i, /(?:^|,)\s*w /.test(r.animation)]).filter(([, w]) => w).map(([i]) => i)).toEqual([...SCHLEIER, SEITENFARBE]);
    expect(WECHSEL.vorlaufMs).toBe(TAKT_MS);
    // Fortschritt des Wachsens ab dem Klick (Vorlauf, dann d-4 mit k-wechsel)
    const wachsen = (ms: number) => wechsel(Math.max(0, ms - WECHSEL.vorlaufMs) / DAUER_MS['d-4']);
    expect(wachsen(100)).toBeLessThan(0.002);
    // √t hätte nach 10 % der Zeit schon 32 % geschafft; k-wechsel nicht einmal 2 %
    expect(wechsel(0.1)).toBeLessThan(0.02);
    // Nie schneller als knapp das Dreifache des Mittels (k-wechsel in der Mitte), kein Antritt am Anfang
    let steilste = 0;
    for (let t = 0; t < 1; t += 0.01) steilste = Math.max(steilste, (wechsel(t + 0.01) - wechsel(t)) / 0.01);
    expect(steilste).toBeLessThan(3);
    expect((wechsel(0.05) - wechsel(0)) / 0.05).toBeLessThan(0.1);
    // Ruhig aus: im letzten Zehntel weniger als 2 % Weg
    expect(1 - wechsel(0.9)).toBeLessThan(0.02);
    expect(WECHSEL.vorlaufMs + DAUER_MS['d-4']).toBe(WECHSEL.abdeckenMs);
  });

  it('Ringe (Owner-Feedback 16.10.2026 (2), nachgeschärft): je eigene Verzögerung, Dauer und Deckkraft wie im Register, Wachsen nach √t ab dem Einblenden (d-1); die Ringbreiten ziehen ungleichmäßig nach', () => {
    expect(listenteile(regel('.f > b').animation).map((t) => t.trim())).toEqual([
      'r calc(var(--takt)*var(--u)) linear var(--q) both',
      'f var(--d-1) linear var(--q) both',
    ]);
    const ringe = RINGE.map((i) => je[i]);
    expect(ringe.map((r) => Number(r['--v']))).toEqual([...FRONT_RINGE.verzoegerungTakte]);
    expect(ringe.map((r) => Number(r['--u']))).toEqual([...FRONT_RINGE.dauerTakte]);
    expect(ringe.map((r) => Number(r.opacity))).toEqual([...FRONT_RINGE.deckkraft]);
    expect(front.ringe).toBe(FRONT_RINGE);
    expect(front.verzoegerungTakte.slice(RINGE[0], RINGE.at(-1)! + 1)).toEqual([...FRONT_RINGE.verzoegerungTakte]);
    // Versetzt gestartet, nach innen kürzer, darum verschieden geendet (560, 520, 480 ms); der letzte höchstens einen
    // Takt nach der Deckung, unter der deckenden Seitenfarbe
    const enden = FRONT_RINGE.verzoegerungTakte.map((v, j) => (v + FRONT_RINGE.dauerTakte[j]) * TAKT_MS);
    expect(enden).toEqual([560, 520, 480]);
    expect(Math.max(...enden)).toBeLessThanOrEqual(WECHSEL.abdeckenMs + TAKT_MS);
    // Ungleichmäßig nachziehend: Ein gleichmäßig wachsendes Muster hielte das Verhältnis jedes Rings zum äußeren fest; hier
    // ziehen die inneren nach (ihr Verhältnis wächst stetig, der innerste um mehr als 0,15), solange alle drei zu sehen
    // sind und die Seitenfarbe noch nicht einblendet: ab ½ Takt nach dem Einsatz des innersten (vorher ab 360 ms, als er
    // erst nach 4 Takten kam) in Takten bis zum Einsatz der Seitenfarbe. Keine Ringbreite wird je null, auch danach nicht
    const seitenfarbeAb = front.verzoegerungTakte.at(-1)! * TAKT_MS;
    const zeiten = [0, 1, 2, 3].map((k) => (FRONT_RINGE.verzoegerungTakte.at(-1)! + 0.5 + k) * TAKT_MS);
    expect(zeiten).toEqual([200, 280, 360, 440]);
    expect(zeiten.at(-1)).toBe(seitenfarbeAb);
    const zumAeusseren = [1, 2].map((j) => zeiten.map((ms) => ring(j, ms) / ring(0, ms)));
    for (const folge of zumAeusseren) for (let i = 1; i < folge.length; i += 1) expect(folge[i]).toBeGreaterThan(folge[i - 1]);
    expect(zumAeusseren[1].at(-1)! - zumAeusseren[1][0]).toBeGreaterThan(0.15);
    for (const ms of [...zeiten, 520, 600, WECHSEL.abdeckenMs]) {
      const [a, b, c] = [0, 1, 2].map((j) => ring(j, ms));
      expect(a - b, `${ms} ms`).toBeGreaterThan(0.1);
      expect(b - c, `${ms} ms`).toBeGreaterThan(0.1);
    }
    // Kein Punkt am Anfang (Owner-Feedback 16.10.2026): jeder Ring beginnt bei mindestens der Hälfte von FRONT_START der
    // Fensterdiagonale, bei jedem Klickpunkt und Fenster; nicht bei Maßstab 0 (Prüfrunde 4 A4-3, C4-1)
    for (const [b, h] of [
      [390, 844],
      [1440, 900],
      [2560, 1440],
    ] as const) {
      for (const [x, y] of [
        [b / 2, h / 2],
        [0, 0],
        [b - 20, h - 20],
      ]) {
        const [grund, faktor] = frontMass(x, y, b, h);
        for (const i of RINGE) expect((RING_START * FRONT_SCHICHTEN[i] * grund * faktor) / Math.hypot(b, h), `${b}×${h} @ ${x},${y}`).toBeGreaterThanOrEqual(FRONT_START / 2);
      }
    }
  });

  it('Farben nur aus der Rampe: Schleier --waerme-0, -1, Ringe --waerme-2, -2, -4 (zusammen nach innen wärmer, innen der Lachston von Runde 1), zuletzt und innen die Seitenfarbe; nur der innerste Ring satt; kein Verlauf, kein Filter', () => {
    expect(Object.keys(WAERME_ROLLEN_ERLAUBT)).toContain(FRONT_CSS);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|gradient|color-mix|filter|shadow|blend|backdrop|rgba?\(|hsla?\(|oklch|infinite/i);
    expect(je.map((r) => r['--c'])).toEqual(['var(--waerme-0)', 'var(--waerme-1)', 'var(--waerme-2)', 'var(--waerme-2)', 'var(--waerme-4)', 'var(--surface)']);
    // --waerme-4 nur im innersten Ring, --waerme-3 nirgends; die Klick-Wärme nennt höchstens --waerme-2 (umgeleitet)
    expect([...css.matchAll(/--waerme-4/g)]).toHaveLength(1);
    expect(css).not.toMatch(/--waerme-3/);
    expect([...css.matchAll(/--surface/g)]).toHaveLength(1);
    expect(regel('.f > *').background).toBe('var(--c)');
    expect(regel('.k > *').outline).toBe('var(--m-kontur) solid var(--c)');
    const farben = [...css.matchAll(/(?:background|--c)\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
    for (const f of farben) expect(f).toMatch(/^(?:none|var\(--c\)|var\(--waerme-[0-24]\)|var\(--surface\))$/);
    // Die Bänder, wie sie auf hellem Papier stehen (Schleier, dann je Ring darüber, sRGB in 8 Bit gerundet): von außen
    // nach innen dunkler und wärmer, im stärksten Bild L* rund 80–91 wie die Bänder von Runde 1 (90,0 · 86,6 · 80,3);
    // satt (mindestens so satt wie --waerme-2, die Grenze des e2e „Abdecken“) ist allein der innerste, der mittlere bleibt
    // mit Abstand darunter: Sonst wäre die ganze Scheibe des mittleren satt, an der Startseite über 60 % des Fensters
    const hex = (name: string) => {
      const h = theme.match(new RegExp(`${name}: (#[0-9A-Fa-f]{6});`))![1];
      return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    };
    const rampe = [0, 1, 2, 3, 4].map((i) => hex(`--p-waerme-${i}`));
    const papier = hex('--p-papier');
    const ueber = (unten: number[], oben: number[], a: number) => unten.map((v, i) => Math.round(v * (1 - a) + oben[i] * a));
    const satt = ([r, g, b]: number[]) => (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b);
    const lstern = (c: number[]) => {
      const lin = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
      const y = 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
      return 116 * Math.cbrt(y) - 16;
    };
    const stufe = (r: Record<string, string>) => Number(r['--c'].match(/--waerme-(\d)/)![1]);
    let grund = [0, 1].reduce((c, i) => ueber(c, rampe[stufe(je[i])], deckkraft(je[i])), papier);
    const baender = RINGE.map((i) => (grund = ueber(grund, rampe[stufe(je[i])], deckkraft(je[i]))));
    const l = baender.map(lstern);
    expect(l[0]).toBeLessThan(lstern(ueber(ueber(papier, rampe[0], 0.25), rampe[1], 1 / 3)) - 3);
    for (let i = 1; i < l.length; i += 1) expect(l[i]).toBeLessThan(l[i - 1] - 2);
    expect(Math.max(...l)).toBeLessThanOrEqual(91);
    expect(Math.min(...l)).toBeGreaterThanOrEqual(80);
    expect(Math.min(...l)).toBeLessThan(81);
    const grenze = satt(rampe[2]);
    expect(baender.map((b) => satt(b) >= grenze)).toEqual([false, false, true]);
    expect(satt(baender[1])).toBeLessThan(grenze - 0.01);
  });

  it('Deckkraft und Größe: der Schleier ¼ und ⅓ (zusammen ½) bis über die Ecke, die Ringe ½ · ¾ · 0,95 (nach innen dichter, keiner ganz) mit 85,5 · 66 · 43 % im Fenster, die Seitenfarbe ganz und innen', () => {
    const n = je.map((r) => Number(r['--n']));
    expect(n).toEqual([1, 2, 7.625, 12.5, 18.25, 4]);
    // Durchmesser: Innenabstand rundum, also 2 × padding je Grundgröße --s (die Ringe mal --m im transform)
    const padding = regel('.f > *').padding;
    expect(padding).toBe('calc((29 - var(--n))*var(--s)/50)');
    const durchmesser = n.map((x) => Math.round(2 * mitN(padding, x) * 1e6) / 1e6);
    expect(durchmesser).toEqual([...FRONT_SCHICHTEN]);
    // Schleier über die Ecke hinaus (äußerer zuerst), Ringe enden im Fenster und nach innen enger, die Seitenfarbe genau
    // bis zur fernsten Ecke
    for (const i of SCHLEIER) expect(durchmesser[i]).toBeGreaterThan(1);
    expect(durchmesser[0]).toBeGreaterThan(durchmesser[1]);
    for (const i of RINGE) expect(durchmesser[i]).toBeLessThan(1);
    expect(RINGE.map((i) => durchmesser[i])).toEqual([...RINGE.map((i) => durchmesser[i])].sort((a, b) => b - a));
    expect(durchmesser[SEITENFARBE]).toBe(1);
    // Deckkraft: der Schleier 1 / (5 − n), zusammen ½; die Ringe nach innen dichter, keiner deckt; die Seitenfarbe ganz
    expect(regel('.e > *').opacity).toBe('calc(1/(5 - var(--n)))');
    expect(je.map((r) => Math.round(deckkraft(r) * 1000) / 1000)).toEqual([0.25, 0.333, 0.5, 0.75, 0.95, 1]);
    for (let i = 1; i < RINGE.length; i += 1) expect(deckkraft(je[RINGE[i]])).toBeGreaterThan(deckkraft(je[RINGE[i - 1]]));
    expect(1 - (1 - deckkraft(je[0])) * (1 - deckkraft(je[1]))).toBeCloseTo(0.5, 9);
    for (const i of RINGE) expect(deckkraft(je[i])).toBeLessThan(1);
    // Kreise: --radius-voll; die Seitenfarbe liegt zuoberst (letzte Schicht) und ist bis zu ihrem Einblenden unsichtbar
    expect(regel('.f > *')['border-radius']).toBe('var(--radius-voll)');
  });

  it('kein Loch, kein kalter Kern, keine satte Fläche (A5-1, B5-1, C5-1; Owner-Feedback 16.10.2026 (2)): Die Seitenfarbe blendet erst ein, wenn alle warmen Schichten stehen und die Ringe das Fenster fast überzogen haben, und deckt mit dem Ende des Wachsens', () => {
    // Einblenden je Schicht (Takte) wie im Register; Schleier und Ringe d-1, die Seitenfarbe d-2
    const v = je.map((r) => Number(r['--v'] ?? 0));
    expect(v).toEqual([...front.verzoegerungTakte]);
    const einblenden = je.map(einblendDauer);
    expect(einblenden).toEqual([1, 1, 1, 1, 1, 2]);
    const anfang = v[SEITENFARBE] * TAKT_MS;
    const ende = anfang + DAUER_MS['d-2'];
    for (let i = 0; i < SEITENFARBE; i += 1) expect(v[i] * TAKT_MS + DAUER_MS[`d-${einblenden[i]}` as 'd-1']).toBeLessThanOrEqual(anfang);
    expect(ende).toBe(WECHSEL.abdeckenMs);
    expect(ende).toBe(WECHSEL.wechselMs);
    // Die heißeste liegt zuletzt und innen: die Ringe nach innen wärmer (Stufe und Deckkraft), später gestartet, enger
    expect(RINGE.map((i) => je[i]['--c'])).toEqual(['var(--waerme-2)', 'var(--waerme-2)', 'var(--waerme-4)']);
    // Reichweite, gemessen an der fernsten Ecke, bei jedem Klickpunkt und Fenster: Beginnt die Seitenfarbe, hat der
    // äußere Schleier und der äußere Ring mehr als drei Viertel des Wegs; deckt sie, liegt der Schleier jenseits der Ecke,
    // der heißeste Ring aber bleibt im Fenster (er überzieht es nie ganz)
    const schleier = (ms: number, x: number, y: number, b: number, h: number) => {
      const [grund, faktor, start] = frontMass(x, y, b, h);
      const p = wechsel(Math.max(0, ms - WECHSEL.vorlaufMs) / DAUER_MS['d-4']);
      return (grund * (start + p * (faktor - start)) * FRONT_SCHICHTEN[0]) / 2;
    };
    for (const [b, h] of [
      [390, 844],
      [1440, 900],
    ] as const) {
      for (const [x, y] of [
        [b / 2, h / 2],
        [b / 4, 30],
        [0, 0],
        [b - 20, h - 20],
      ]) {
        const wo = `${b}×${h} @ ${x},${y}`;
        const ecke = Math.max(Math.hypot(x, y), Math.hypot(b - x, y), Math.hypot(x, h - y), Math.hypot(b - x, h - y));
        const [grund, faktor] = frontMass(x, y, b, h);
        const halb = (grund * faktor) / 2;
        expect(schleier(anfang, x, y, b, h) / ecke, wo).toBeGreaterThan(0.75);
        expect(schleier(ende, x, y, b, h) / FRONT_SCHICHTEN[0] / ecke, wo).toBeGreaterThanOrEqual(1);
        expect((ring(0, anfang) * halb) / ecke, wo).toBeGreaterThan(0.75);
        expect((ring(2, 2 * ende) * halb) / ecke, wo).toBeLessThan(0.65);
      }
    }
  });

  it('Aufdecken (Owner-Feedback 16.10.2026): Die Front verblasst als Ganzes; der Hauptinhalt taucht auf und steigt um --a-5 an seinen Platz – beide ein Takt + d-3 mit k-wechsel, ohne Neumalen', () => {
    expect(regel('.e[data-auf]')).toEqual({ opacity: '0', transition: 'var(--d-3) var(--k-wechsel) var(--takt)' });
    // Die Überlagerung ist schon beim Öffnen eine eigene Ebene: Ihr Verblassen malt nichts neu (gemessen: ohne
    // will-change malte der Start die ganze Seite neu)
    expect(regel('.e')['will-change']).toBe('opacity');
    // <main>: unter voller Deckung eine Ebene, der Ablauf f steht angehalten am Anfang (unsichtbar, --a-5 tiefer, .h);
    // beim Aufdecken läuft er (.a). Ein Übergang an <main> malte bei seinem Start die Seite neu, ein Ablauf nicht.
    expect(regel('.h')).toEqual({ '--t': '0 var(--a-5)', 'will-change': 'transform,opacity', animation: 'f var(--d-3) var(--k-wechsel) var(--takt) both paused' });
    expect(regel('.a')).toEqual({ 'animation-play-state': 'running' });
    expect(theme).toMatch(/--a-5: 1\.5rem;/);
    // Nur dieser eine Übergang in der Datei (die Überlagerung); Front und Hauptinhalt gleich getaktet: Sie enden zusammen
    expect([...css.matchAll(/transition\s*:/g)]).toHaveLength(1);
    expect(DAUER_MS['d-3'] + TAKT_MS).toBe(WECHSEL.aufdeckenMs);
    // Beim Aufdecken ist die Front eine einzige Fläche in der Seitenfarbe: die oberste Schicht, deckend, bis zur Ecke
    expect(je[SEITENFARBE]['--c']).toBe('var(--surface)');
    expect(deckkraft(je[SEITENFARBE])).toBe(1);
    expect(SEITENFARBE).toBe(FRONT_TAGS.length - 1);
    // Kein Steigen der Scheiben (unsichtbar bei einer gleichmäßigen Fläche), keine Bewegung der Überlagerung
    expect(regel('.e').translate).toBeUndefined();
    const quelle = lies(EINGANG);
    expect(quelle).toMatch(/front\.dataset\.auf = '';\s*haupt\.add\(styles\.a\);/);
    expect(quelle).toMatch(/haupt\.add\(styles\.h\);/);
    expect(front.kurve).toEqual(['k-wechsel', 'linear']);
  });

  it('Ebenen vor dem Wachsen (Prüfrunde 4 A4-3, C4-1): will-change: scale, opacity je Schicht, ab dem Öffnen; die Überlagerung und der Hauptinhalt je eine Ebene', () => {
    expect(regel('.e > *')['will-change']).toBe('scale,opacity');
    expect([...css.matchAll(/will-change/g)]).toHaveLength(3);
    // Füllung both (Prüfrunde 2 C2-4): Jede Schicht hält vor dem Start den Anfang (unsichtbar, klein) und danach das Ende
    for (const r of [...je, ...jeKlick]) for (const teil of listenteile(r.animation)) expect(teil.trim()).toMatch(/ both$/);
  });

  it('Klick-Wärme bleibt (Owner-Feedback 16.10.2026 (2)): ihre drei Schichten tragen genau die Werte wie vorher, kein Ring der Front gilt für sie', () => {
    expect(jeKlick.map((r) => [r['--c'], r['--n'], r['--v'] ?? '0', r.opacity, r.animation])).toEqual([
      ['var(--waerme-0)', '1', '0', 'calc(1/(5 - var(--n)))', EINBLENDEN],
      ['var(--waerme-1)', '2', '0.5', 'calc(1/(5 - var(--n)))', EINBLENDEN],
      ['var(--waerme-2)', '3', '1', 'calc(1/(5 - var(--n)))', EINBLENDEN],
    ]);
    for (const r of jeKlick) {
      expect(r['--u']).toBeUndefined();
      expect(r['--g']).toBeUndefined();
      expect(r.transform).toBeUndefined();
      expect(r.padding).toBeUndefined();
    }
  });

  it('Klick-Wärme je Ton der Fläche (Prüfrunde 3 A3-1): In ihrer Überlagerung stehen die Stufen 0–2 für --klick-1…3, außen der kühlste, innen der heißeste; die Insel setzt den Ton der getroffenen Fläche', () => {
    const ohne = theme.replace(/\/\*[\s\S]*?\*\//g, '');
    const block = ohne.match(/\[data-motion="klick-waerme"\]\s*\{([^}]*)\}/);
    expect(block, 'Umleitung in theme.css').not.toBeNull();
    expect(block![1].split(';').map((d) => d.trim()).filter(Boolean)).toEqual([
      '--waerme-0: var(--klick-1)',
      '--waerme-1: var(--klick-2)',
      '--waerme-2: var(--klick-3)',
    ]);
    // nach allen Tönen (sonst gewönne ein [data-tone]-Block derselben Spezifität auf der Überlagerung)
    const umleitung = ohne.indexOf('[data-motion="klick-waerme"]');
    const toene = [...ohne.matchAll(/\[data-tone="\w+"\][^{]*\{([^}]*)\}/g)].filter((m) => /--(?:waerme|klick)-\d/.test(m[1]));
    expect(toene.length).toBeGreaterThanOrEqual(4);
    for (const m of toene) expect(m.index).toBeLessThan(umleitung);
    expect(klick.verzoegerungTakte).toHaveLength(3);
    // Die Klick-Wärme nennt nur die Stufen 0–2, die umgeleitet sind
    expect(jeKlick.map((r) => r['--c'])).toEqual(['var(--waerme-0)', 'var(--waerme-1)', 'var(--waerme-2)']);
    const quelle = lies(EINGANG);
    expect(quelle).toMatch(/klick\.dataset\.tone = bedien\.closest<HTMLElement>\('\[data-tone\]'\)\?\.dataset\.tone \?\? '';/);
  });

  it('Klick-Wärme (Prüfrunde 5 A5-4): drei Umrisse ohne Fläche außerhalb der Box des Elements, außen 24, dann 16, innen 8 px, gerundet, nach außen zarter; die Beschriftung bleibt frei; kein Wachsen', () => {
    const r = regel('.k > *');
    expect(r).toEqual({
      width: 'var(--w)',
      height: 'var(--h)',
      'border-radius': 'var(--radius-2)',
      outline: 'var(--m-kontur) solid var(--c)',
      'outline-offset': 'calc((4 - var(--n))*var(--a-2))',
    });
    // Keine Fläche, kein Skalieren: Die Ringe liegen um die Box, nicht über ihr; sie blenden nur ein (der gemeinsame
    // Ablauf f der Schichten)
    expect(r.background).toBeUndefined();
    expect(r.scale ?? r.transform ?? r.animation).toBeUndefined();
    const rem = (name: string) => Number(theme.match(new RegExp(`${name}: ([\\d.]+)rem;`))![1]) * 16;
    const abstand = jeKlick.map((x) => (4 - Number(x['--n'])) * rem('--a-2'));
    expect(abstand).toEqual([24, 16, 8]);
    // Zart und nach außen durchsichtiger wie die Front: ¼, ⅓, ½ – nie lauter als eine Linie (Farben 1,5–3:1,
    // check-contrast); der äußere, der eine nahe Beschriftung kreuzen kann, ist der zarteste
    expect(jeKlick.map((x) => Math.round(deckkraft(x) * 1000) / 1000)).toEqual([0.25, 0.333, 0.5]);
    expect(lies(EINGANG)).toContain('zeige(klick, `--x:${box.left + box.width / 2}px;--y:${box.top + box.height / 2}px;--w:${box.width}px;--h:${box.height}px`);');
  });

  it('Klick-Wärme (Prüfrunde 5 C5-3): ½ Takt versetzt einblenden (d-2), steht der äußere, verklingen alle (ein Takt + d-3); zu am Ende dieses Übergangs, die Uhr ist nur das Netz', () => {
    expect(jeKlick.map((x) => Number(x['--v'] ?? 0))).toEqual([...klick.verzoegerungTakte]);
    expect(klick.dauer).toEqual(['d-2', 'd-3']);
    expect(klick.kurve).toEqual(['linear', 'k-wechsel']);
    expect(DAUER_MS['d-2'] + TAKT_MS + DAUER_MS['d-3']).toBe(KLICK_ENDE_MS);
    expect(klick.endeMs).toBe(KLICK_ENDE_MS);
    // Der letzte Ring ist ganz eingeblendet, bevor das Verklingen beginnt
    expect(Math.max(...klick.verzoegerungTakte) * TAKT_MS + DAUER_MS['d-2']).toBeLessThanOrEqual(DAUER_MS['d-2'] + TAKT_MS);
    const quelle = lies(EINGANG);
    expect(quelle).toContain("else if (event.target === klick.firstElementChild) klick.dataset.auf = '';");
    expect(quelle).toContain("klick.addEventListener('transitionend', klickZu);");
    expect(quelle).toContain('klickUhr = setTimeout(klickZu, KLICK_ZU_MS);');
    // Schließen nimmt data-auf weg: Beim nächsten Klick steht die Überlagerung wieder voll da, ohne Übergang
    expect(quelle).toMatch(/const zu = \(el: HTMLElement\) => \{\s*delete el\.dataset\.auf;\s*if \(el\.matches\(':popover-open'\)\) el\.hidePopover\(\);\s*\};/);
  });

  it('Register und Datei stimmen überein: Dauern d-1…d-4, Verzögerungen je Schicht, Eigenschaften transform und opacity', () => {
    expect([...new Set([...css.matchAll(/--d-(\d)/g)].map((m) => `d-${m[1]}`))].sort()).toEqual(['d-1', 'd-2', 'd-3', 'd-4']);
    expect([...front.dauer].sort()).toEqual(['d-1', 'd-2', 'd-3', 'd-4']);
    expect([...front.eigenschaften].sort()).toEqual(['opacity', 'transform']);
    expect([...klick.eigenschaften]).toEqual(['opacity']);
    // Animiert werden nur scale (Front), opacity und translate (Hauptinhalt): alles transform oder opacity; das feste
    // transform der Ringe trägt nur den Faktor bis zur Ecke
    const animiert = [...keyframesIn(css).flatMap((x) => x.stopps.flatMap((st) => [...st.deklarationen.keys()]))];
    expect([...new Set(animiert)].sort()).toEqual(['opacity', 'scale', 'translate']);
    expect([...css.matchAll(/(?<![\w-])transform\s*:\s*([^;]+);/g)].map((m) => m[1].trim())).toEqual(['scale(var(--m))']);
    // Der eine Übergang (data-auf) ändert nur die Deckkraft der Überlagerung
    expect(Object.keys(regel('.e[data-auf]')).sort()).toEqual(['opacity', 'transition']);
  });

  it('die Überlagerung ist still: inert (keine Treffer), contain: strict, beschnitten und kein Scroll-Container, ohne Rahmen und Fläche des Popovers', () => {
    // overflow: hidden statt des overflow: auto des Popovers: sonst ein Scroll-Container, dessen Überlauf mit den
    // wachsenden Schichten in jedem Bild wächst (Chromium malte jedes Bild die ganze Seite neu). Treffer gehen durch:
    // Beide Überlagerungen sind inert (oben, Markup), das wirkt beim Treffertest wie pointer-events: none (e2e prüft es
    // mit elementsFromPoint an allen Elementen unter dem Punkt)
    expect(regel('.e')).toEqual({
      width: 'auto',
      height: 'auto',
      border: '0',
      background: 'none',
      overflow: 'hidden',
      contain: 'strict',
      'will-change': 'opacity',
    });
    expect(lies(EINGANG).match(/popover="manual" className=\{[^\n]*?\} aria-hidden="true" inert data-motion="(?:klick-waerme|seitenwechsel)"/g)).toHaveLength(2);
    expect(regel('.e > *')).toMatchObject({ position: 'absolute', left: 'var(--x)', top: 'var(--y)', translate: 'var(--t)' });
    // Selektoren: die Klassen, ihre Schichten und [data-auf]
    const selektoren = [...css.matchAll(/(?:^|\})\s*([^{}@]+?)\s*\{/g)].map((m) => m[1].trim()).filter((s) => s.startsWith('.'));
    expect(selektoren).toEqual([
      '.e',
      '.e[data-auf]',
      '.e > *',
      '.e > * + *',
      '.e > * + * + *',
      '.f > *',
      '.f > b',
      '.f > b + b',
      '.f > b + b + b',
      '.f > b + i',
      '.k > *',
      '.h',
      '.a',
    ]);
  });

  it(`Budget: ≤ ${FRONT_BUDGET} B im globalen Chunk, gemessen wie check-css-chunks (verkleinert, Klassen mit Präfix)`, async () => {
    // E-031: 1.200 → 1.600 B (Owner-Feedback 16.10.2026: Einblenden, Stufen, Aufdecken mit dem Hauptinhalt, Ringe um die
    // Box), → 2.120 B (zweites Feedback: drei Ringe nach √t auf dem Schleier); genau dieser Wert, nie darüber
    expect(FRONT_BUDGET).toBe(2120);
    const { transform } = await import('lightningcss');
    const { code } = transform({
      filename: FRONT_CSS,
      code: Buffer.from(lies(FRONT_CSS)),
      minify: true,
      cssModules: { pattern: 'waermefront-module__AbCd3f__[local]' },
    });
    const gebaut = code.toString();
    expect(gebaut).toContain('waermefront-module__AbCd3f__e');
    expect(modulBytes(gebaut, ['waermefront'])).toBe(gebaut.length);
    expect(gebaut.length).toBeLessThanOrEqual(FRONT_BUDGET);
  });
});

describe('Waermefront: Insel ≤ 2 KB gzip (K-013)', () => {
  it('minifiziertes Bündel mit allem, was sie in den Browser zieht (React und Next extern)', async () => {
    expect(lies(EINGANG).startsWith("'use client';")).toBe(true);
    // Die Insel importiert nur React, Next-Navigation, die reine Logik und ihr CSS-Modul; die Logik zieht nichts nach
    const importe = [...lies(EINGANG).matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    // reduzierte Bewegung und erzwungene Farben: eine Abfrage aus lib/motion/prefers.ts (Prüfrunde 3 C3-4)
    expect(lies(EINGANG)).toMatch(/if \(matchMedia\(OHNE_UEBERLAGERUNG\)\.matches\) return;/);
    expect(importe.sort()).toEqual(['./waermefront.module.css', '@/lib/motion/prefers', '@/lib/motion/seitenwechsel', 'next/navigation', 'react']);
    expect([...lies('lib/motion/seitenwechsel.ts').matchAll(/from '([^']+)'/g)]).toEqual([]);
    expect([...lies('lib/motion/prefers.ts').matchAll(/from '([^']+)'/g)]).toEqual([]);
    // keine Bild-Cursor und keine Wärmerollen im Code (Guards cursor und waerme-rollen)
    expect(lies(EINGANG)).not.toMatch(/\/cursor\/|--waerme-/);
    expect(CURSOR_DATEI).toBe('app/globals.css');
    const { build } = await import('rolldown');
    const ergebnis = await build({
      input: path.join(ROOT, EINGANG),
      external: [/^react(?:\/|$)/, /^next(?:\/|$)/],
      resolve: { alias: { '@': ROOT } },
      plugins: [
        {
          name: 'css-modul',
          resolveId: (quelle: string) => (quelle.endsWith('.module.css') ? '\0css-modul' : null),
          load: (id: string) => (id === '\0css-modul' ? 'export default { e: "a", f: "c", k: "b", h: "d", a: "g" };' : null),
        },
      ],
      output: { minify: true, format: 'esm' },
      write: false,
    });
    const code = ergebnis.output[0].code;
    for (const teil of [
      'showPopover',
      ':popover-open',
      'animationend',
      'transitionend',
      'lastElementChild',
      'firstElementChild',
      'getBoundingClientRect',
      'pageshow',
      'popstate',
      'prefetch',
      'preventDefault',
      'requestAnimationFrame',
      'MutationObserver',
      '(prefers-reduced-motion: reduce), (forced-colors: active)',
    ]) {
      expect(code, teil).toContain(teil);
    }
    // Klick in der Erfassungsphase am Dokument: vor next/link, nach den onClickCapture-Handlern von React
    expect(code).toMatch(/document\.addEventListener\(`click`,\w+,!0\)/);
    expect(code).not.toMatch(/Zwecktext|zweck:/);
    expect(gzip(code)).toBeLessThanOrEqual(2 * 1024);
  }, 30_000);
});
