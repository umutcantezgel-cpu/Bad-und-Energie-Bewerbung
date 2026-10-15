import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FaqSection } from '@/components/home/FaqSection';
import { PartnerSaeulen } from '@/components/home/betrieb/PartnerSaeulen';
import { Ausstattung } from '@/components/home/vorteile/Ausstattung';
import { Zusagen } from '@/components/home/vorteile/Zusagen';
import { PackageList } from '@/components/jobs/PackageList';
import { Section } from '@/components/layout/Section';
import { ABSPERR_LEITUNG, Absperrung } from '@/components/themen/Absperrung';
import { Verteiler } from '@/components/themen/Verteiler';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { getThemen } from '@/lib/themen/registry';
import { getArbeitenPageText } from '@/lib/themen/text';
import { anschlussPunkt } from '@/lib/zeichnung/symbole';
import { RohrAkzent } from '..';

/**
 * Weichheit (E-031, KERN 1.3 K-003.2, K-008): harte Stellen glatt geschliffen, nur mit den vorhandenen Tokens (Radien
 * 4 · 12 · 24 · 999, ein Schatten, kein Glas, kein Glow, kein Verlauf). Die Rohrakzente kehren zurück, aber nur an
 * freigegebenen Stellen, normgerecht und still.
 */

const ROOT = path.resolve(__dirname, '../../..');
const quelle = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const ohneKommentare = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(element);

/** Rumpf der ersten Regel, deren Selektor genau so lautet (Grundregeln stehen vor den @media-Blöcken). */
function regel(css: string, selektor: string): string {
  const treffer = [...ohneKommentare(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((m) => m[1].trim() === selektor);
  expect(treffer, selektor).toBeDefined();
  return treffer![2];
}

/** Werte einer Kurzschreibweise, an Leerzeichen außerhalb von Klammern getrennt. */
function teile(wert: string): string[] {
  const out: string[] = [];
  let tiefe = 0;
  let akt = '';
  for (const z of wert.trim()) {
    if (z === '(') tiefe += 1;
    if (z === ')') tiefe -= 1;
    if (/\s/.test(z) && tiefe === 0) {
      if (akt) out.push(akt);
      akt = '';
    } else akt += z;
  }
  if (akt) out.push(akt);
  return out;
}

/** Deklarationen eines Regelrumpfs als Tabelle. */
const deklarationen = (rumpf: string) =>
  Object.fromEntries(
    rumpf
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]),
  );

function dateien(dir: string, endung: RegExp, out: string[] = []): string[] {
  for (const e of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (['node_modules', '.next', '__tests__'].includes(e.name) || e.name.startsWith('.')) continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) dateien(rel, endung, out);
    else if (endung.test(e.name)) out.push(rel);
  }
  return out;
}

const ZEICHNUNG_CSS = 'components/zeichnung/zeichnung.module.css';

describe('Rohrakzent statt harter 3-px-Oberkanten (E-031)', () => {
  const akzent = deklarationen(regel(quelle(ZEICHNUNG_CSS), '.rohrakzent'));

  it('ein Rohrstück in der Linienart leitung: 3 px, runde Enden, Markenrolle, kürzer als die Karte, liegt auf der Oberkante', () => {
    expect(akzent).toEqual({
      position: 'absolute',
      top: '0',
      left: '0',
      width: 'min(var(--a-8), 100%)',
      height: 'var(--m-leitung)',
      'border-radius': 'var(--radius-voll)',
      'background-color': 'var(--brand)',
      'pointer-events': 'none',
    });
    const span = html(createElement(RohrAkzent));
    expect(span).toMatch(/^<span aria-hidden="true" data-zeichnung="rohrakzent" class="[^"]*rohrakzent[^"]*"><\/span>$/);
    expect(html(createElement(RohrAkzent, { className: 'lg:hidden' }))).toMatch(/class="[^"]*rohrakzent[^"]* lg:hidden"/);
  });

  it('wo eine Liste kein <span> trägt, zeichnet ein Pseudoelement dieselbe Form (Wärmepumpen: Partnerstufen)', () => {
    const themen = quelle('components/themen/themen.module.css');
    expect(deklarationen(regel(themen, '.partner::before'))).toEqual({ content: '""', ...akzent });
    expect(regel(themen, '.partner')).toMatch(/position: relative;/);
  });

  it('kein Behälter trägt mehr eine harte 3-px-Oberkante in der Markenrolle (TSX und CSS)', () => {
    const treffer: string[] = [];
    for (const datei of [...dateien('app', /\.(tsx|css)$/), ...dateien('components', /\.(tsx|css)$/)]) {
      const text = datei.endsWith('.css') ? ohneKommentare(quelle(datei)) : quelle(datei);
      for (const zeile of text.split('\n')) {
        const tsx = /border-t-(?:\(length:--m-(?:strich|leitung)\)|\[length:var\(--m-(?:strich|leitung)\)\]|3\b)/.test(zeile) && /(?<![\w-])border-brand\b/.test(zeile);
        const css = /border-top:\s*var\(--m-(?:strich|leitung)\)\s+solid\s+var\(--brand\)/.test(zeile);
        if (tsx || css) treffer.push(`${datei}: ${zeile.trim()}`);
      }
    }
    // Die Skala der Entfernungsleiste ist ein Maßstab (Zeichnung), keine Kante eines Behälters
    expect(treffer).toEqual([`${ZEICHNUNG_CSS}: border-top: var(--m-strich) solid var(--brand);`]);
    expect(regel(quelle(ZEICHNUNG_CSS), '.lwSkala')).toMatch(/border-top: var\(--m-strich\) solid var\(--brand\);/);
    // Die Fehlerseite (auf jeder Seite geladen, ohne CSS-Modul) zeichnet dieselbe Form mit Utilities
    expect(quelle('app/error.tsx')).toContain(
      'relative flex flex-wrap gap-x-8 gap-y-1 pt-4 before:pointer-events-none before:absolute before:top-0 before:left-0 before:h-(--m-leitung) before:w-16 before:rounded-voll before:bg-brand',
    );
  });

  it('der Behälter ist positioniert und behält seinen Innenabstand; das Stück steht als erstes Kind', () => {
    const faelle = [
      html(createElement(FaqSection)),
      html(createElement(Zusagen)),
      html(createElement(Ausstattung)),
      html(createElement(PartnerSaeulen)),
      html(createElement(PackageList, { items: [{ label: 'Ort', text: 'Wetzlar' }] })),
    ];
    for (const h of faelle) {
      const stuecke = [...h.matchAll(/<(\w+)( class="([^"]*)")?[^>]*><span aria-hidden="true" data-zeichnung="rohrakzent"/g)];
      expect(stuecke.length, h.slice(0, 80)).toBe(1);
      expect(stuecke[0][3] ?? '', h.slice(0, 80)).toMatch(/(?:^|\s)relative(?:\s|$)/);
    }
    // In den CSS-Modulen: die Listeneinträge mit Rohrakzent sind positioniert
    const themen = quelle('components/themen/themen.module.css');
    for (const k of ['.kasten', '.kaestchen', '.position', '.saeule']) expect(regel(themen, k), k).toMatch(/position: relative;/);
    expect(regel(quelle('components/einsatzgebiet/einsatzgebiet.module.css'), '.fakt')).toMatch(/position: relative;/);
    expect(regel(quelle('components/site/fuss/leiste.module.css'), '.innen')).toMatch(/position: relative;/);
  });

  it('Bewerbungsleiste: Haarlinie statt 3-px-Kante, die Leitungen beginnen rund unter der Oberkante', () => {
    const leiste = quelle('components/site/fuss/leiste.module.css');
    expect(regel(leiste, '.leiste')).toMatch(/border-top: 1px solid var\(--line\);/);
    expect(regel(leiste, '.leitung')).toMatch(/border-radius: var\(--radius-voll\) var\(--radius-voll\) 0 0;/);
    expect(quelle('components/site/StickyApplyBarClient.tsx')).toContain('<RohrAkzent className={styles.akzent} />');
    // Kopf beim Scrollen: dieselbe Form, im Seitenrand statt von Kante zu Kante
    const kopf = regel(quelle('components/site/kopf/kopf.module.css'), '.kopf[data-scrolled]::after');
    expect(kopf).toMatch(/inset-inline: var\(--rand\);/);
    expect(kopf).toMatch(/border-radius: var\(--radius-voll\);/);
  });
});

describe('Tonwechsel der Abschnitte mit runden oberen Ecken (E-031)', () => {
  const css = ohneKommentare(quelle('components/layout/section.module.css'));
  const TOENE = ['papier', 'wand', 'band'] as const;

  it('jeder Abschnitt trägt seinen Ton als data-ton (Papier, Wand, Band; alte Namen eingeschlossen)', () => {
    const ton = (tone?: Parameters<typeof Section>[0]['tone']) => html(createElement(Section, { tone }, 'x')).match(/data-ton="(\w+)"/)?.[1];
    expect([ton(), ton('default'), ton('papier'), ton('subtle'), ton('wand'), ton('inverse'), ton('band')]).toEqual([
      'papier',
      'papier',
      'papier',
      'wand',
      'wand',
      'band',
      'band',
    ]);
    expect(html(createElement(Section, { tone: 'wand' }, 'x'))).toMatch(/^<section class="[^"]*\bton\b|^<section class="[^"]*_ton_/);
  });

  it('nur beim Wechsel des Tons: oben runde Ecken mit --radius-3, darunter ein Streifen in der Fläche des vorigen', () => {
    // Zwischen zwei Abschnitten dürfen höchstens zwei leere Sprungmarken stehen (Startseite: alte Anker als <span id>)
    const ZWISCHEN = ['', 'span:empty + ', 'span:empty + span:empty + '];
    const wechsel = TOENE.flatMap((t) => ZWISCHEN.map((z) => `.ton[data-ton="${t}"] + ${z}.ton:not([data-ton="${t}"])`)).join(',\n');
    expect(css).toContain(`${wechsel} {\n  position: relative;\n  border-start-start-radius: var(--radius-3);\n  border-start-end-radius: var(--radius-3);\n}`);
    const folgt = (t: string) => ZWISCHEN.map((z) => `+ ${z}.ton:not([data-ton="${t}"])`).join(', ');
    const vorher = TOENE.map((t) => `.ton[data-ton="${t}"]:has(${folgt(t)})::after`).join(',\n');
    expect(deklarationen(regel(css, vorher))).toEqual({
      content: '""',
      position: 'absolute',
      'inset-inline': '0',
      top: '100%',
      height: 'var(--radius-3)',
      'background-color': 'inherit',
      'pointer-events': 'none',
    });
    // Papier deckt wie Wand und Band, sonst schiene der Streifen durch die ganze Oberkante
    expect(deklarationen(regel(css, '.ton[data-ton="papier"]'))).toEqual({ 'background-color': 'var(--surface)' });
    // Nur Form: kein Verlauf, kein Schatten, kein Glas, kein Filter; Radien nur aus den Tokens
    expect(css).not.toMatch(/gradient|shadow|blur|filter|opacity/);
    for (const [, wert] of css.matchAll(/radius:\s*([^;]+);/g)) expect(wert).toBe('var(--radius-3)');
  });

  it('Themenabschnitte: zwei gleiche Töne trennt der Leitungstrenner, nicht mehr die feine Linie aus E-029', () => {
    expect(ohneKommentare(quelle('components/themen/themen.module.css'))).not.toMatch(/\.linie\b/);
    expect(quelle('components/themen/Bausteine.tsx')).toContain('<Section id={kopf.id} tone={tone} trenner={trenner} aria-labelledby={titelId(kopf.id)}>');
  });
});

describe('Rohrklammer zurück an den Abschnittsköpfen (E-031, K-003.2)', () => {
  it('der Rahmen an der h2: mittig, mindestens zwei Bögen und ein gerades Stück hoch, Breite der Klammer (--a-5)', () => {
    expect(deklarationen(regel(quelle(ZEICHNUNG_CSS), '.klammerRahmen'))).toEqual({
      position: 'absolute',
      top: '50%',
      left: '0',
      width: 'var(--a-5)',
      height: 'max(calc(100% - 0.2em), calc(var(--radius-2) * 2 + var(--a-5)))',
      transform: 'translateY(-50%)',
      'pointer-events': 'none',
    });
  });

  it('nur wo der Aufrufer sie setzt: Themenabschnitte reichen `klammer` bis an die h2 durch, die Startseite setzt keine', () => {
    const bausteine = quelle('components/themen/Bausteine.tsx');
    expect(bausteine).toMatch(/<SectionHeader\s+id=\{titelId\(kopf\.id\)\}\s+eyebrow=\{kopf\.etikett\}\s+klammer=\{klammer\}/);
    expect(bausteine).toContain('<Kopf kopf={kopf} klammer={klammer} />');
    for (const datei of dateien('components/home', /\.tsx$/)) expect(quelle(datei), datei).not.toMatch(/<SectionHeader\b[^>]*?\bklammer\b/);
  });
});

describe('Bänder mit Hauptaktion: Leitungen beginnen rund im Band statt abgeschnitten (Schlussband, Initiativband)', () => {
  const faelle = [
    { css: 'components/home/betrieb/schlussband.module.css', tsx: 'components/home/CtaBand.tsx', text: '.text' },
    { css: 'components/jobs/liste/liste.module.css', tsx: 'components/jobs/liste/Initiativband.tsx', text: '.bandText' },
  ];

  it.each(faelle)('$tsx: Leitungen im Text, oben rund, Knopf --a-6 darunter, kein Abschneiden an der Bandkante', ({ css: datei, tsx, text }) => {
    const css = ohneKommentare(quelle(datei));
    const quelltext = quelle(tsx);
    expect(css).not.toMatch(/-200vh|overflow: clip/);
    expect(quelltext).not.toContain('styles.band}');
    // Die beiden Leitungen stehen im Textblock (vor der Überschrift im DOM, dekorativ), nicht mehr am Knopf
    const block = quelltext.slice(quelltext.indexOf(`styles.${text.slice(1)}}`));
    expect(block.indexOf('styles.vorlauf')).toBeLessThan(block.indexOf('<h2'));
    expect(block.indexOf('styles.ruecklauf')).toBeLessThan(block.indexOf('<h2'));
    expect(regel(css, text)).toMatch(/position: relative;/);
    expect(regel(css, '.anschluss')).toMatch(/margin-top: var\(--a-6\);/);
    const mobil = regel(css, '.leitung');
    expect(mobil).toMatch(/top: 0;\s*bottom: calc\(var\(--a-6\) \* -1\);/);
    expect(mobil).toMatch(/border-radius: var\(--radius-voll\) var\(--radius-voll\) 0 0;/);
    // Desktop: konzentrische Bögen 12/24 in den Flansch, oben ein Kreis im Strich; der Flansch außen rund
    const desktop = css.slice(css.indexOf('@media (min-width: 64em)'));
    expect(desktop).toMatch(/\.leitung::before \{[^}]*border-radius: var\(--radius-voll\);[^}]*background-color: currentColor;/);
    expect(desktop).toMatch(/border-bottom-right-radius: calc\(var\(--radius-2\) \+ var\(--m-strich\) \/ 2\);/);
    expect(desktop).toMatch(/border-bottom-right-radius: calc\(var\(--radius-3\) \+ var\(--m-strich\) \/ 2\);/);
    expect(desktop).toMatch(/\.aktion::after \{[^}]*border-radius: 0 var\(--radius-voll\) var\(--radius-voll\) 0;/);
    // Mittellinien waagerecht --paar/2 über und unter der Knopfmitte, gerechnet ab der Unterkante des Textes
    expect(desktop).toContain('bottom: calc((var(--a-6) + var(--m-knopf) / 2 - var(--paar) / 2 + var(--m-strich) / 2) * -1);');
    expect(desktop).toContain('bottom: calc((var(--a-6) + var(--m-knopf) / 2 + var(--paar) / 2 + var(--m-strich) / 2) * -1);');
  });
});

describe('Seitenkopf, Stellenliste und Heizkreis: weiche Ecken und Enden (E-031)', () => {
  const kopf = quelle('components/seitenkopf/seitenkopf.module.css');
  const desktop = ohneKommentare(kopf.slice(kopf.indexOf('@media (min-width: 64em)')));

  it('Navy-Fläche: Innenecken zum Papier mit --radius-3 (Desktop links oben und unten), am Handy die Ecke unten rechts', () => {
    expect(regel(kopf, '.flaeche')).toMatch(/border-end-end-radius: var\(--radius-3\);/);
    expect(desktop).toMatch(
      /\.flaeche \{[^}]*border-start-start-radius: var\(--radius-3\);[^}]*border-end-start-radius: var\(--radius-3\);[^}]*border-end-end-radius: 0;/,
    );
    // Die Pfadleiste der Stellenliste setzt die Fläche fort: dieselbe Ecke
    expect(ohneKommentare(quelle('components/jobs/liste/liste.module.css'))).toMatch(/\.pfadNavy \{[^}]*border-start-start-radius: var\(--radius-3\);/);
  });

  it('Leitungspaar endet rund im Seitenrand; der Flansch am Knopf ist außen rund', () => {
    expect(desktop).toMatch(/\.leitungNavy \{[^}]*margin-right: var\(--rand\);/);
    expect(desktop).toMatch(/\.leitungNavy::before,\s*\.leitungNavy::after \{[^}]*right: calc\(var\(--m-strich\) \/ -2\);[^}]*width: var\(--m-strich\);[^}]*height: var\(--m-strich\);[^}]*border-radius: var\(--radius-voll\);/);
    expect(desktop).toMatch(/\.leitungNavy::before \{[^}]*background-color: var\(--vorlauf\);/);
    expect(desktop).toMatch(/\.leitungNavy::after \{[^}]*background-color: var\(--ruecklauf\);/);
    expect(desktop).toMatch(/\.mitAktion \.aktion::after \{[^}]*border-radius: 0 var\(--radius-voll\) var\(--radius-voll\) 0;/);
  });

  it('Heizkreis: Zu- und Abgang enden rund (ein Kreis im Strich je Ende, in der Farbe der Leitung)', () => {
    const z = quelle(ZEICHNUNG_CSS);
    expect(deklarationen(regel(z, '.hkVorlauf::after,\n.hkRuecklauf::after'))).toEqual({
      content: '""',
      position: 'absolute',
      left: 'calc(var(--m-strich) * -1)',
      width: 'var(--m-strich)',
      height: 'var(--m-strich)',
      'border-radius': 'var(--radius-voll)',
    });
    expect(regel(z, '.hkVorlauf::after')).toMatch(/top: calc\(100% - var\(--m-strich\) \/ 2\);\s*background-color: var\(--vorlauf\);/);
    expect(regel(z, '.hkRuecklauf::after')).toMatch(/top: calc\(var\(--m-strich\) \/ -2\);\s*background-color: var\(--ruecklauf\);/);
  });

  it('Fokusringe der Zeilenlinks sind rund (--radius-2) statt eckig', () => {
    for (const datei of ['components/jobs/JobCard.tsx', 'components/themen/Bausteine.tsx']) {
      expect(quelle(datei), datei).not.toContain('after:rounded-none');
      expect(quelle(datei), datei).toContain('after:rounded-2 focus-visible:after:outline-3');
    }
    expect(regel(quelle('components/jobs/liste/liste.module.css'), '.ziel::after')).toMatch(/border-radius: var\(--radius-2\);/);
  });
});

describe('Nur vorhandene Tokens: Radien 4 · 12 · 24 · 999, ein Schatten, kein Glas, kein Glow, kein Verlauf', () => {
  const DATEIEN = [
    ZEICHNUNG_CSS,
    'components/layout/section.module.css',
    'components/seitenkopf/seitenkopf.module.css',
    'components/home/betrieb/schlussband.module.css',
    'components/jobs/liste/liste.module.css',
    'components/site/fuss/leiste.module.css',
    'components/site/kopf/kopf.module.css',
    'components/einsatzgebiet/einsatzgebiet.module.css',
  ];
  /** themen.module.css ohne den Büro-Block (angehängt von Paket W3, eigene Prüfung) */
  const themen = () => {
    const css = quelle('components/themen/themen.module.css');
    const i = css.indexOf('/* ═══ Büro-Block (E-031)');
    return i < 0 ? css : css.slice(0, i);
  };
  const RADIUS = /^(?:0|inherit|var\(--radius-(?:1|2|3|voll)(?:, (?:4|12|24|999)px)?\)|calc\(var\(--radius-[23]\) \+ var\(--m-strich\) \/ 2\))$/;

  it.each([...DATEIEN, 'components/themen/themen.module.css'])('%s', (datei) => {
    const css = ohneKommentare(datei.endsWith('themen.module.css') ? themen() : quelle(datei));
    for (const [, name, wert] of css.matchAll(/(border(?:-[a-z]+)*-radius):\s*([^;]+);/g)) {
      for (const teil of teile(wert)) expect(teil, `${datei} ${name}: ${wert}`).toMatch(RADIUS);
    }
    expect(css).not.toMatch(/gradient\(|backdrop-filter|filter:\s*(?:blur|drop-shadow)|text-shadow/);
    for (const [, wert] of css.matchAll(/box-shadow:\s*([^;]+);/g)) expect(wert.trim(), datei).toBe('var(--shadow-lg)');
  });
});

describe('Verteiler und Absperrung (Themenseiten, E-031): normgerecht und still', () => {
  const jobs = getActiveJobs().filter((job) => isJobLive(job, new Date()));
  const karten = getArbeitenPageText({ jobs }).themen.karten;
  const verteilerHtml = html(createElement(Verteiler, { karten }));
  const absperrungHtml = html(createElement(Absperrung, { etiketten: { du: 'Du', ziel: 'Wetzlar', arbeitgeber: 'Dein Arbeitgeber' } }));
  /** Nie zurück (E-031): Uhr, Zirkel bzw. Kompass, Windrad, halber Lüfterdreh, Propeller. */
  const BANN = /uhr|zirkel|kompass|windrad|luefter|lüfter|propeller|ventilator/i;

  it('Verteiler: ein Kreis je Thema aus getThemen(), in derselben Reihenfolge, mit Kreisschild, die Zeichnung dekorativ', () => {
    const ids = getThemen().map((thema) => thema.id);
    expect(karten.map((karte) => karte.id)).toEqual(ids);
    expect([...verteilerHtml.matchAll(/data-kreis="([^"]+)"/g)].map((m) => m[1])).toEqual(ids);
    expect(verteilerHtml.match(/data-symbol="durchflussmesser"/g)).toHaveLength(ids.length);
    // Je Kreis zwei Leitungsstücke (Vorlauf, Rücklauf) plus die beiden Zuleitungen
    expect(verteilerHtml.match(/<path d="[^"]*" class="[^"]*leitung[^"]*"/g)).toHaveLength(2 * ids.length + 2);
    // Zeichnung und Schilder hinter aria-hidden; im Bild kein Text, keine Bewegung
    const bild = verteilerHtml.match(/<div class="[^"]*" aria-hidden="true">([\s\S]*?)<\/div><ul/)![1];
    expect(bild).toContain('<svg');
    expect(bild).not.toMatch(/<text|data-motion|role=/);
    // Die Liste bleibt echter Text mit allen Themen
    expect(verteilerHtml).toMatch(/<ul class="[^"]*" aria-label="Themen">/);
    for (const karte of karten) expect(verteilerHtml).toContain(`<span>${karte.name.replace(/&/g, '&amp;')}</span>`);
    expect(verteilerHtml).not.toMatch(BANN);
  });

  it('Verteiler: Zeichnung erst ab 37,5em, am Handy die Liste allein; Kästchen mit --radius-1', () => {
    const themen = quelle('components/themen/themen.module.css');
    expect(regel(themen, '.verteilerBild')).toMatch(/display: none;/);
    expect(ohneKommentare(themen)).toMatch(/@media \(min-width: 37\.5em\) \{\s*\.verteilerBild \{\s*display: block;/);
    expect(regel(themen, '.verteilerKasten')).toMatch(/border-radius: var\(--radius-1\);/);
  });

  it('Absperrung: vor „Dein Arbeitgeber“ eine Leitung auf einen geschlossenen Kugelhahn; „Von“ und „An“ ohne', () => {
    expect(absperrungHtml.match(/data-symbol="kugelhahnGeschlossen"/g)).toHaveLength(1);
    expect(absperrungHtml).not.toMatch(/data-symbol="kugelhahn"/);
    expect(absperrungHtml).toMatch(/<dd[^>]*>Du<\/dd>/);
    expect(absperrungHtml).toMatch(/<dd[^>]*>Wetzlar<\/dd>/);
    // Die Leitung endet am Eintritt des Hahns und beginnt am Austritt wieder (Fließrichtung von links)
    const ein = anschlussPunkt('kugelhahnGeschlossen', 'ein', { x: 24, y: 0, massstab: 0.875 });
    const aus = anschlussPunkt('kugelhahnGeschlossen', 'aus', { x: 24, y: 0, massstab: 0.875 });
    expect(ABSPERR_LEITUNG.vor).toBe(`M3 0H${ein.x}`);
    expect(ABSPERR_LEITUNG.nach.startsWith(`M${aus.x} 0H`)).toBe(true);
    expect(absperrungHtml).not.toMatch(BANN);
    expect(absperrungHtml).not.toMatch(/Blindflansch|Abzweig|<text/);
  });
});

describe('Nichts Verspieltes (E-031: nie zurück)', () => {
  const QUELLEN = [
    'components/zeichnung/RohrAkzent.tsx',
    'components/zeichnung/Rohrklammer.tsx',
    'components/zeichnung/Leitungstrenner.tsx',
    'components/zeichnung/Heizkreis.tsx',
    'components/themen/Verteiler.tsx',
    'components/themen/Absperrung.tsx',
    'lib/zeichnung/szenen/verteiler.ts',
    'components/layout/section.module.css',
  ];

  it.each(QUELLEN)('%s: keine Uhr, kein Zirkel bzw. Kompass, kein Windrad, kein Lüfter, keine Bewegung, kein Euro, kein °C', (datei) => {
    const text = quelle(datei);
    expect(text).not.toMatch(/\b(?:uhr|uhren|zirkel|kompass|windrad|propeller|l(?:ü|ue)fter)\b/i);
    expect(text).not.toMatch(/data-motion|@keyframes|animation|transition/);
    expect(text).not.toMatch(/€|\bEuro\b|°C/);
  });
});
