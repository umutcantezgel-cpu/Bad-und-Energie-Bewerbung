import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FRONT_BUDGET, FRONT_CSS, modulBytes } from '@/scripts/qa/check-css-chunks.mjs';
import { CURSOR_DATEI, WAERME_ROLLEN_ERLAUBT } from '@/scripts/qa/check-design-tokens.mjs';
import { DAUER_MS, KLICK_ENDE_MS, MOTION_REGISTER, TAKT_MS, WECHSEL } from '@/lib/motion/register';
import { FRONT_SCHICHTEN, frontMass } from '@/lib/motion/seitenwechsel';
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
    const ueberlagerungen = [...markup.matchAll(/<div ([^>]*)>((?:<i><\/i>)*)<\/div>/g)];
    expect(ueberlagerungen.map((u) => u[0]).join('')).toBe(markup);
    const nach = Object.fromEntries(ueberlagerungen.map((u) => [u[1].match(/data-motion="([^"]+)"/)![1], u]));
    expect(Object.keys(nach).sort()).toEqual(['klick-waerme', 'seitenwechsel']);
    for (const [id, [, attribute, schichten]] of Object.entries(nach)) {
      expect(attribute, id).toMatch(/^popover="manual" class="[^"]+" aria-hidden="true" inert="" data-motion="[^"]+"$/);
      expect(schichten.match(/<i>/g)!.length, id).toBe(MOTION_REGISTER[id as 'klick-waerme' | 'seitenwechsel'].verzoegerungTakte.length);
    }
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

describe('Waermefront: CSS (E-031, K-009; Owner-Feedback 16.10.2026: sanfter Wärmeschleier statt Blitz)', () => {
  const theme = lies('app/styles/theme.css');
  const k = Object.fromEntries(keyframesIn(css).map((x) => [x.name, x]));
  /** Wert einer Formel in --n (und --s = 1) für die Schicht n (nur + − × / und Zahlen). */
  const mitN = (formel: string, n: number) =>
    Number(new Function(`return ${formel.replace(/calc/g, '').replace(/var\(--n\)/g, String(n)).replace(/var\(--s\)/g, '1')}`)());
  const schichten = [regel('.e > *'), regel('.e > * + *'), regel('.e > * + * + *'), regel('.e > * + * + * + *')];
  // Je Schicht: Nummer, Farbe, Verzögerung des Einblendens (Takte) – Grundwerte aus .e > *, überschrieben je Schicht
  const je = schichten.map((_, i) => Object.assign({}, ...schichten.slice(0, i + 1)) as Record<string, string>);
  const front = MOTION_REGISTER.seitenwechsel;
  const klick = MOTION_REGISTER['klick-waerme'];
  const wechsel = kurveAus(theme, 'k-wechsel');
  const EINBLENDEN = 'f var(--d-2) linear calc(var(--takt) * var(--v, 0)) both';

  it('genau zwei Abläufe: w wächst von der Startgröße (--z) auf den Faktor, f blendet aus --t ein; kein Pop, kein Verblassen in Keyframes', () => {
    expect(Object.keys(k).sort()).toEqual(['f', 'w']);
    expect(k.w.stopps).toHaveLength(1);
    expect(k.w.stopps[0].anteil).toBe(0);
    expect(Object.fromEntries(k.w.stopps[0].deklarationen)).toEqual({ scale: 'var(--z)' });
    expect(k.f.stopps).toHaveLength(1);
    expect(k.f.stopps[0].anteil).toBe(0);
    expect(Object.fromEntries(k.f.stopps[0].deklarationen)).toEqual({ opacity: '0', translate: 'var(--t)' });
    // Das Ziel des Wachsens ist der Grundwert der Schicht: scale --m (bis zur fernsten Ecke); die Schichten stehen auf
    // ihrem Mittelpunkt (--t = −50 % −50 %, Einblenden ohne Weg)
    expect(regel('.f > *').scale).toBe('var(--m)');
    expect(regel('.e > *')['--t']).toBe('-50% -50%');
    expect(regel('.e > *').translate).toBe('var(--t)');
    // Die Front wächst nicht nach √t (Owner-Feedback 16.10.2026; die Regel gilt sonst überall, register.test.ts)
    expect(diffusionsFehler(css).every((f) => /^w: /.test(f))).toBe(true);
  });

  it('ruhig wachsen (Owner-Feedback 16.10.2026): d-4 mit k-wechsel nach einem Takt Vorlauf; in den ersten 100 ms praktisch kein Wachsen, nie ein Schuss', () => {
    const teile = listenteile(regel('.f > *').animation).map((t) => t.trim());
    expect(teile).toEqual(['w var(--d-4) var(--k-wechsel) var(--takt) both', EINBLENDEN]);
    expect(regel('.e > *').animation).toBe(EINBLENDEN);
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

  it('Farben: drei zarte warme Bänder (--waerme-0, -1, -2; kein -3, kein -4), zuletzt und innen die Seitenfarbe; nur Rollen, kein Verlauf, kein Filter', () => {
    expect(Object.keys(WAERME_ROLLEN_ERLAUBT)).toContain(FRONT_CSS);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|gradient|color-mix|filter|shadow|blend|backdrop|rgba?\(|hsla?\(|oklch|infinite/i);
    expect(je.map((r) => r['--c'])).toEqual(['var(--waerme-0)', 'var(--waerme-1)', 'var(--waerme-2)', 'var(--surface)']);
    expect(css).not.toMatch(/--waerme-[34]/);
    expect([...css.matchAll(/--surface/g)]).toHaveLength(1);
    expect(regel('.f > *').background).toBe('var(--c)');
    expect(regel('.k > *').outline).toBe('var(--m-kontur) solid var(--c)');
    const farben = [...css.matchAll(/(?:background|--c)\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
    for (const f of farben) expect(f).toMatch(/^(?:none|var\(--c\)|var\(--waerme-[0-2]\)|var\(--surface\))$/);
  });

  it('weiche Kante aus Stufen (A5-1, B5-1, C5-1): je 4 % enger gestaffelt, deckt von außen ¼, ½, ¾, dann die Seitenfarbe ganz; sie liegt innen und deckt am Ende bis zur fernsten Ecke', () => {
    const n = je.map((r) => Number(r['--n']));
    expect(n).toEqual([1, 2, 3, 4]);
    // Durchmesser: Innenabstand rundum, also 2 × padding je Grundgröße --s
    const padding = regel('.f > *').padding;
    expect(padding).toBe('calc((29 - var(--n)) * var(--s) / 50)');
    const durchmesser = n.map((x) => Math.round(2 * mitN(padding, x) * 1e6) / 1e6);
    expect(durchmesser).toEqual([...FRONT_SCHICHTEN]);
    expect(durchmesser.at(-1)).toBe(1);
    for (let i = 1; i < 4; i += 1) expect(durchmesser[i - 1] - durchmesser[i]).toBeCloseTo(0.04, 9);
    // Deckkraft je Schicht 1 / (5 − n): zusammen von außen ¼, ½, ¾ (Vorgabe ≈ 0,25 → 0,5 → 0,8), die Seitenfarbe deckt
    const deckkraft = n.map((x) => mitN(regel('.e > *').opacity, x));
    expect(regel('.e > *').opacity).toBe('calc(1 / (5 - var(--n)))');
    expect(deckkraft.map((d) => Math.round(d * 1000) / 1000)).toEqual([0.25, 0.333, 0.5, 1]);
    let durch = 1;
    const zusammen = deckkraft.map((d) => Math.round((1 - (durch *= 1 - d)) * 1000) / 1000);
    expect(zusammen).toEqual([0.25, 0.5, 0.75, 1]);
    // Kreise: --radius-voll; die Seitenfarbe liegt zuoberst (letzte Schicht) und ist bis zu ihrem Einblenden unsichtbar
    expect(regel('.f > *')['border-radius']).toBe('var(--radius-voll)');
  });

  it('kein Loch, kein kalter Kern: Die Seitenfarbe blendet erst ein, wenn der Schleier das Fenster fast überzogen hat, und deckt erst, wenn er es ganz überzogen hat', () => {
    // Einblenden je Schicht (Takte): die warmen ½ Takt versetzt ab dem Klick, die Seitenfarbe nach 5½ Takten, je d-2
    const v = je.map((r) => Number(r['--v'] ?? 0));
    expect(v).toEqual([...front.verzoegerungTakte]);
    const anfang = v[3] * TAKT_MS;
    const ende = anfang + DAUER_MS['d-2'];
    // Bis dahin stehen die warmen voll (sie sind ganz eingeblendet), und die Seitenfarbe deckt mit dem Ende des Wachsens:
    // dann wechselt die Seite
    for (let i = 0; i < 3; i += 1) expect(v[i] * TAKT_MS + DAUER_MS['d-2']).toBeLessThanOrEqual(anfang);
    expect(ende).toBe(WECHSEL.abdeckenMs);
    expect(ende).toBe(WECHSEL.wechselMs);
    // Reichweite der äußeren warmen Schicht, gemessen an der fernsten Ecke, bei jedem Klickpunkt und Fenster: Beginnt die
    // Seitenfarbe, hat der Schleier schon mehr als drei Viertel des Wegs; deckt sie, liegen alle warmen jenseits der Ecke
    const reichweite = (ms: number, x: number, y: number, b: number, h: number) => {
      const [grund, faktor, start] = frontMass(x, y, b, h);
      const p = wechsel(Math.max(0, ms - WECHSEL.vorlaufMs) / DAUER_MS['d-4']);
      const ecke = Math.max(Math.hypot(x, y), Math.hypot(b - x, y), Math.hypot(x, h - y), Math.hypot(b - x, h - y));
      return (grund * (start + p * (faktor - start)) * FRONT_SCHICHTEN[0]) / 2 / ecke;
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
        expect(reichweite(anfang, x, y, b, h), `${b}×${h} @ ${x},${y}`).toBeGreaterThan(0.75);
        expect(reichweite(ende, x, y, b, h) / FRONT_SCHICHTEN[0], `${b}×${h} @ ${x},${y}`).toBeGreaterThanOrEqual(1);
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
    expect(regel('.h')).toEqual({ '--t': '0 var(--a-5)', 'will-change': 'transform, opacity', animation: 'f var(--d-3) var(--k-wechsel) var(--takt) both paused' });
    expect(regel('.a')).toEqual({ 'animation-play-state': 'running' });
    expect(theme).toMatch(/--a-5: 1\.5rem;/);
    // Nur dieser eine Übergang in der Datei (die Überlagerung); Front und Hauptinhalt gleich getaktet: Sie enden zusammen
    expect([...css.matchAll(/transition\s*:/g)]).toHaveLength(1);
    expect(DAUER_MS['d-3'] + TAKT_MS).toBe(WECHSEL.aufdeckenMs);
    // Beim Aufdecken ist die Front eine einzige Fläche in der Seitenfarbe: die oberste Schicht, deckend, bis zur Ecke
    expect(je[3]['--c']).toBe('var(--surface)');
    expect(mitN(regel('.e > *').opacity, 4)).toBe(1);
    // Kein Steigen der Scheiben (unsichtbar bei einer gleichmäßigen Fläche), keine Bewegung der Überlagerung
    expect(regel('.e').translate).toBeUndefined();
    const quelle = lies(EINGANG);
    expect(quelle).toMatch(/front\.dataset\.auf = '';\s*haupt\.add\(styles\.a\);/);
    expect(quelle).toMatch(/haupt\.add\(styles\.h\);/);
    expect(front.kurve).toEqual(['k-wechsel', 'linear']);
  });

  it('Ebenen vor dem Wachsen (Prüfrunde 4 A4-3, C4-1): will-change: scale, opacity je Schicht, ab dem Öffnen; die Überlagerung und der Hauptinhalt je eine Ebene', () => {
    expect(regel('.e > *')['will-change']).toBe('scale, opacity');
    expect([...css.matchAll(/will-change/g)]).toHaveLength(3);
    // Füllung both (Prüfrunde 2 C2-4): Jede Schicht hält vor dem Start den Anfang (unsichtbar, klein) und danach das Ende
    for (const teil of listenteile(regel('.f > *').animation)) expect(teil.trim()).toMatch(/ both$/);
    expect(regel('.e > *').animation).toMatch(/ both$/);
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
      'outline-offset': 'calc((4 - var(--n)) * var(--a-2))',
    });
    // Keine Fläche, kein Skalieren: Die Ringe liegen um die Box, nicht über ihr; sie blenden nur ein (der gemeinsame
    // Ablauf f der Schichten)
    expect(r.background).toBeUndefined();
    expect(r.scale ?? r.transform ?? r.animation).toBeUndefined();
    const rem = (name: string) => Number(theme.match(new RegExp(`${name}: ([\\d.]+)rem;`))![1]) * 16;
    const abstand = je.slice(0, 3).map((x) => (4 - Number(x['--n'])) * rem('--a-2'));
    expect(abstand).toEqual([24, 16, 8]);
    // Zart und nach außen durchsichtiger wie die Front: ¼, ⅓, ½ – nie lauter als eine Linie (Farben 1,5–3:1,
    // check-contrast); der äußere, der eine nahe Beschriftung kreuzen kann, ist der zarteste
    const deckkraft = je.slice(0, 3).map((x) => Math.round(mitN(regel('.e > *').opacity, Number(x['--n'])) * 1000) / 1000);
    expect(deckkraft).toEqual([0.25, 0.333, 0.5]);
    expect(lies(EINGANG)).toContain('zeige(klick, `--x:${box.left + box.width / 2}px;--y:${box.top + box.height / 2}px;--w:${box.width}px;--h:${box.height}px`);');
  });

  it('Klick-Wärme (Prüfrunde 5 C5-3): ½ Takt versetzt einblenden (d-2), steht der äußere, verklingen alle (ein Takt + d-3); zu am Ende dieses Übergangs, die Uhr ist nur das Netz', () => {
    expect(je.slice(0, 3).map((x) => Number(x['--v'] ?? 0))).toEqual([...klick.verzoegerungTakte]);
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

  it('Register und Datei stimmen überein: Dauern d-2, d-3, d-4, Verzögerungen je Schicht, Eigenschaften transform und opacity', () => {
    expect([...new Set([...css.matchAll(/--d-(\d)/g)].map((m) => `d-${m[1]}`))].sort()).toEqual(['d-2', 'd-3', 'd-4']);
    expect([...front.dauer].sort()).toEqual(['d-2', 'd-3', 'd-4']);
    expect([...front.eigenschaften].sort()).toEqual(['opacity', 'transform']);
    expect([...klick.eigenschaften]).toEqual(['opacity']);
    // Animiert werden nur scale (Front), opacity und translate (Hauptinhalt): alles transform oder opacity
    const animiert = [...keyframesIn(css).flatMap((x) => x.stopps.flatMap((st) => [...st.deklarationen.keys()]))];
    expect([...new Set(animiert)].sort()).toEqual(['opacity', 'scale', 'translate']);
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
    expect(selektoren).toEqual(['.e', '.e[data-auf]', '.e > *', '.e > * + *', '.e > * + * + *', '.e > * + * + * + *', '.f > *', '.k > *', '.h', '.a']);
  });

  it(`Budget: ≤ ${FRONT_BUDGET} B im globalen Chunk, gemessen wie check-css-chunks (verkleinert, Klassen mit Präfix)`, async () => {
    // E-031, Owner-Feedback 16.10.2026: 1.200 → 1.600 B für Einblenden, Stufen, Aufdecken mit dem Hauptinhalt und Ringe
    // um die Box; nie darüber
    expect(FRONT_BUDGET).toBeLessThanOrEqual(1600);
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
