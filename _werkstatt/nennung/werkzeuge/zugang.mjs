// Zugänglichkeit und Darstellung der Agenturnennung (Auftrag E0). Je Seite, Gerätegröße und Farbschema:
// axe nur auf dem Footer, berechnete Stile der Nennung, Kontrast (WCAG), Klickfläche, Fokus per Tastatur,
// Seitenüberlauf. Gemessen wird das ausgelieferte Produktions-Build, nicht der Entwicklungsserver.
import { chromium } from '@playwright/test';
import {
  alsHauptprogramm,
  ausgabeOrdner,
  ausschreiben,
  basisAus,
  beruhigen,
  listeAus,
} from './gemeinsam.mjs';

const NUTZUNG = `Zugänglichkeit und Darstellung der Nennung (Auftrag E0): axe auf dem Footer, Stile, Kontrast,
Klickfläche, Tastaturfokus und Überlauf je Seite, Gerätegröße und Farbschema.

Aufruf (aus dem Projektordner, gegen den laufenden Produktions-Server):
  node _werkstatt/nennung/werkzeuge/zugang.mjs --basis http://127.0.0.1:3511 --aus _werkstatt/nennung/protokolle/roh/e0

Optional: --seiten /,/jobs (Standard) und --schema light,dark (Standard: beide).
Ausgabe: zugang.json und zugang.md. Kontrastgrenze 4,5:1 (Z-07), Tastatur-Suche höchstens 400 Tabs je Link.`;

const SEITEN_STANDARD = '/,/jobs';
const SCHEMATA = ['light', 'dark'];
const GROESSEN = [
  { name: '390x844', breite: 390, hoehe: 844 },
  { name: '1440x900', breite: 1440, hoehe: 900 },
];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const NENNUNG = '[data-agentur-nennung] a';
const TAB_GRENZE = 400;
const KONTRAST_MINDEST = 4.5;
const IMPACT_REIHE = ['critical', 'serious', 'moderate', 'minor'];

/** axe-Paket laden; fehlt es, bleibt die Prüfung ohne axe und meldet das. */
async function axeLaden() {
  try {
    return { AxeBuilder: (await import('@axe-core/playwright')).default, hinweis: '' };
  } catch (fehler) {
    return { AxeBuilder: null, hinweis: `axe fehlt: ${String(fehler.message).split('\n')[0]}` };
  }
}

/** Relative Leuchtdichte nach WCAG 2.x für sRGB-Werte von 0 bis 255. */
export function leuchtdichte({ r, g, b }) {
  const kanal = (wert) => {
    const anteil = wert / 255;
    return anteil <= 0.03928 ? anteil / 12.92 : ((anteil + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

/** Kontrastverhältnis nach WCAG, von 1 (gleich) bis 21 (Schwarz auf Weiß). */
export function kontrast(a, b) {
  const la = leuchtdichte(a);
  const lb = leuchtdichte(b);
  const [hell, dunkel] = la >= lb ? [la, lb] : [lb, la];
  return (hell + 0.05) / (dunkel + 0.05);
}

/** Legt eine Vordergrundfarbe mit Deckkraft (Alpha mal Elternopazität) über eine deckende Hintergrundfarbe. */
export function mischen(vorn, hinten, deckkraft) {
  const alpha = Math.min(1, Math.max(0, vorn.a * deckkraft));
  return {
    r: vorn.r * alpha + hinten.r * (1 - alpha),
    g: vorn.g * alpha + hinten.g * (1 - alpha),
    b: vorn.b * alpha + hinten.b * (1 - alpha),
    a: 1,
  };
}

const runde = (wert, stellen) => (wert === null || wert === undefined ? null : Number(wert.toFixed(stellen)));

async function axePruefen(page, AxeBuilder) {
  if (!AxeBuilder) return { status: 'axe fehlt' };
  if ((await page.locator('footer').count()) === 0) return { status: 'kein footer' };
  const ergebnis = await new AxeBuilder({ page }).withTags(AXE_TAGS).include('footer').analyze();
  const nachImpact = { critical: 0, serious: 0, moderate: 0, minor: 0, unbekannt: 0 };
  const befunde = ergebnis.violations.map((verstoss) => {
    const impact = verstoss.impact ?? 'unbekannt';
    nachImpact[impact] = (nachImpact[impact] ?? 0) + 1;
    return {
      regel: verstoss.id,
      impact,
      hilfe: verstoss.help,
      knoten: verstoss.nodes.length,
      ziele: verstoss.nodes.slice(0, 5).map((knoten) => knoten.target.join(' ')),
    };
  });
  return {
    status: 'ok',
    geprueftRegeln: ergebnis.passes.length,
    unvollstaendig: ergebnis.incomplete.map((regel) => regel.id),
    nachImpact,
    befunde,
  };
}

/** Berechnete Stile jeder Nennung im Browser. Farben werden über Canvas in sRGB 0 bis 255 gewandelt. */
async function nennungMessen(page) {
  return page.evaluate((selektor) => {
    const farbe = (css) => {
      const leinwand = document.createElement('canvas');
      leinwand.width = 1;
      leinwand.height = 1;
      const kontext = leinwand.getContext('2d', { willReadFrequently: true });
      kontext.clearRect(0, 0, 1, 1);
      kontext.fillStyle = css;
      kontext.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = kontext.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a: a / 255 };
    };
    const hintergrund = (element) => {
      for (let knoten = element; knoten; knoten = knoten.parentElement) {
        const stil = getComputedStyle(knoten);
        if (stil.backgroundImage !== 'none') {
          return { farbe: null, quelle: `Hintergrundbild auf ${knoten.tagName.toLowerCase()}` };
        }
        const gefunden = farbe(stil.backgroundColor);
        if (gefunden.a > 0) {
          return {
            farbe: gefunden,
            quelle: knoten === element ? 'Link selbst' : `Vorfahre ${knoten.tagName.toLowerCase()}`,
          };
        }
      }
      return { farbe: { r: 255, g: 255, b: 255, a: 1 }, quelle: 'keiner gefunden, weiß angenommen' };
    };
    const deckkraft = (element) => {
      let produkt = 1;
      for (let knoten = element; knoten; knoten = knoten.parentElement) {
        produkt *= Number(getComputedStyle(knoten).opacity);
      }
      return produkt;
    };
    return [...document.querySelectorAll(selektor)].map((element) => {
      const stil = getComputedStyle(element);
      const rahmen = element.getBoundingClientRect();
      return {
        text: element.textContent.replace(/\s+/g, ' ').trim(),
        href: element.getAttribute('href') ?? '',
        display: stil.display,
        sichtbarkeit: stil.visibility,
        deckkraft: deckkraft(element),
        schriftgroesse: parseFloat(stil.fontSize),
        schriftgewicht: Number(stil.fontWeight),
        farbeCss: stil.color,
        farbe: farbe(stil.color),
        hintergrund: hintergrund(element),
        breite: rahmen.width,
        hoehe: rahmen.height,
      };
    });
  }, NENNUNG);
}

/**
 * Tastaturfokus: je Nennung Tab drücken, bis der Link den Fokus hat (höchstens TAB_GRENZE Mal).
 * Die Suche läuft in Dokumentreihenfolge weiter, damit die Reihenfolge der Nennungen erhalten bleibt.
 */
async function fokusPruefen(page, anzahl) {
  const ergebnisse = [];
  for (let index = 0; index < anzahl; index += 1) {
    let tabs = 0;
    let erreicht = false;
    while (!erreicht && tabs < TAB_GRENZE) {
      await page.keyboard.press('Tab');
      tabs += 1;
      erreicht = await page.evaluate(
        ([i, selektor]) => document.activeElement === document.querySelectorAll(selektor)[i],
        [index, NENNUNG],
      );
    }
    if (!erreicht) {
      ergebnisse.push({ erreicht: false, tabs });
      continue;
    }
    const stil = await page.evaluate(
      ([i, selektor]) => {
        const element = document.querySelectorAll(selektor)[i];
        const berechnet = getComputedStyle(element);
        return {
          rahmenStil: berechnet.outlineStyle,
          rahmenBreite: berechnet.outlineWidth,
          rahmenFarbe: berechnet.outlineColor,
          versatz: berechnet.outlineOffset,
          schatten: berechnet.boxShadow,
          fokusSichtbar: element.matches(':focus-visible'),
        };
      },
      [index, NENNUNG],
    );
    ergebnisse.push({ erreicht: true, tabs, ...stil });
  }
  return ergebnisse;
}

function bewerten(link, fokus) {
  const sichtbar =
    link.display !== 'none' && link.sichtbarkeit !== 'hidden' && link.deckkraft > 0 && link.breite > 0 && link.hoehe > 0;
  let kontrastWert = null;
  if (link.farbe && link.hintergrund.farbe) {
    const hinten = { ...link.hintergrund.farbe, a: 1 };
    kontrastWert = kontrast(mischen(link.farbe, hinten, link.deckkraft), hinten);
  }
  return {
    text: link.text,
    href: link.href,
    sichtbar,
    display: link.display,
    sichtbarkeit: link.sichtbarkeit,
    deckkraft: runde(link.deckkraft, 2),
    schriftgroesse: runde(link.schriftgroesse, 1),
    schriftgewicht: link.schriftgewicht,
    farbe: link.farbeCss,
    hintergrund: link.hintergrund.quelle,
    kontrast: runde(kontrastWert, 2),
    kontrastMindest: KONTRAST_MINDEST,
    kontrastBesteht: kontrastWert !== null && kontrastWert >= KONTRAST_MINDEST,
    klickflaeche: { breite: runde(link.breite, 1), hoehe: runde(link.hoehe, 1) },
    fokus,
  };
}

async function pruefen(browser, url, groesse, schema, AxeBuilder) {
  const context = await browser.newContext({
    viewport: { width: groesse.breite, height: groesse.hoehe },
    colorScheme: schema,
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await beruhigen(page);
    const axe = await axePruefen(page, AxeBuilder);
    const ueberlauf = await page.evaluate(() => ({
      breite: document.documentElement.scrollWidth,
      fenster: window.innerWidth,
    }));
    const roh = await nennungMessen(page);
    const fokus = await fokusPruefen(page, roh.length);
    return {
      axe,
      ueberlauf: { ...ueberlauf, ueberlaeuft: ueberlauf.breite > ueberlauf.fenster },
      nennung: roh.map((link, index) => bewerten(link, fokus[index])),
    };
  } finally {
    await context.close();
  }
}

const zahl = (wert, stellen) =>
  wert === null || wert === undefined ? 'n/a' : wert.toFixed(stellen).replace('.', ',');

function zugangMd(ergebnisse, meta) {
  const zeilen = [
    '# Zugänglichkeit und Darstellung der Nennung',
    '',
    `- Stand: ${meta.stand}`,
    `- Basis: ${meta.basis}`,
    `- Kontrastgrenze: ${zahl(KONTRAST_MINDEST, 1)}:1 (Vordergrund mit Deckkraft über dem nächsten deckenden Hintergrund)`,
    `- Tastatur-Suche: höchstens ${TAB_GRENZE} Tabs je Nennung`,
  ];
  if (meta.axeHinweis) zeilen.push(`- Hinweis: ${meta.axeHinweis}`);
  zeilen.push(
    '',
    '## Übersicht',
    '| Seite | Größe | Schema | axe Footer (Regeln je Impact) | Nennungen | Kontrast min | Alle sichtbar | Klickfläche min | Fokus | Überlauf |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  );
  for (const e of ergebnisse) {
    if (e.fehler) {
      zeilen.push(`| ${e.seite} | ${e.groesse} | ${e.schema} | Fehler: ${e.fehler} | | | | | | |`);
      continue;
    }
    const axeText =
      e.axe.status === 'ok'
        ? IMPACT_REIHE.map((impact) => `${impact} ${e.axe.nachImpact[impact] ?? 0}`).join(' · ')
        : e.axe.status;
    const kontraste = e.nennung.map((n) => n.kontrast).filter((k) => k !== null);
    const ohneWert = e.nennung.length - kontraste.length;
    const kontrastText = kontraste.length
      ? `${zahl(Math.min(...kontraste), 2)}${ohneWert ? ` (${ohneWert} ohne Wert)` : ''}`
      : e.nennung.length
        ? 'nicht berechenbar'
        : 'keine Nennung';
    const alleSichtbar = e.nennung.length > 0 && e.nennung.every((n) => n.sichtbar) ? 'ja' : 'nein';
    const klickBreite = e.nennung.length ? Math.min(...e.nennung.map((n) => n.klickflaeche.breite)) : null;
    const klickHoehe = e.nennung.length ? Math.min(...e.nennung.map((n) => n.klickflaeche.hoehe)) : null;
    const klickText = e.nennung.length ? `${zahl(klickBreite, 1)} × ${zahl(klickHoehe, 1)}` : 'n/a';
    const fokusOk = e.nennung.filter((n) => n.fokus?.erreicht && n.fokus.fokusSichtbar).length;
    const fokusText = e.nennung.length ? `${fokusOk} von ${e.nennung.length} sichtbar` : 'n/a';
    zeilen.push(
      `| ${e.seite} | ${e.groesse} | ${e.schema} | ${axeText} | ${e.nennung.length} | ${kontrastText} | ${alleSichtbar} | ${klickText} | ${fokusText} | ${e.ueberlauf.ueberlaeuft ? `ja (${e.ueberlauf.breite} > ${e.ueberlauf.fenster})` : 'nein'} |`,
    );
  }
  zeilen.push('', '## Nennungen im Einzelnen');
  for (const e of ergebnisse) {
    if (e.fehler) continue;
    zeilen.push('', `### ${e.seite} · ${e.groesse} · ${e.schema}`);
    if (e.axe.status === 'ok') {
      zeilen.push(`- axe: ${e.axe.geprueftRegeln} Regeln bestanden, ${e.axe.befunde.length} mit Befund, unvollständig: ${e.axe.unvollstaendig.join(', ') || 'keine'}`);
      for (const b of e.axe.befunde) zeilen.push(`  - ${b.regel} (${b.impact}): ${b.knoten} Knoten, ${b.ziele.join('; ')}`);
    } else {
      zeilen.push(`- axe: ${e.axe.status}`);
    }
    if (e.nennung.length === 0) zeilen.push('- Nennung: keine Elemente `[data-agentur-nennung] a` gefunden');
    for (const n of e.nennung) {
      const kontrastText = n.kontrast === null ? 'nicht berechenbar' : `${zahl(n.kontrast, 2)}:1 (${n.kontrastBesteht ? 'besteht' : 'besteht nicht'})`;
      const fokusText = n.fokus?.erreicht
        ? `Fokus nach ${n.fokus.tabs} Tabs, Umriss ${n.fokus.rahmenStil} ${n.fokus.rahmenBreite} ${n.fokus.rahmenFarbe}, Schatten ${n.fokus.schatten}, :focus-visible ${n.fokus.fokusSichtbar ? 'ja' : 'nein'}`
        : `Fokus nicht erreicht (${n.fokus?.tabs ?? 0} Tabs)`;
      zeilen.push(
        `- „${n.text}“ → ${n.href}`,
        `  - sichtbar ${n.sichtbar ? 'ja' : 'nein'} (${n.display}, ${n.sichtbarkeit}), Deckkraft ${zahl(n.deckkraft, 2)}`,
        `  - Schrift ${zahl(n.schriftgroesse, 1)} px, Gewicht ${n.schriftgewicht}, Farbe ${n.farbe}`,
        `  - Hintergrund: ${n.hintergrund}; Kontrast ${kontrastText}`,
        `  - Klickfläche ${zahl(n.klickflaeche.breite, 1)} × ${zahl(n.klickflaeche.hoehe, 1)} px`,
        `  - ${fokusText}`,
      );
    }
    zeilen.push(`- Überlauf: Dokument ${e.ueberlauf.breite} px, Fenster ${e.ueberlauf.fenster} px`);
  }
  zeilen.push('');
  return zeilen.join('\n');
}

async function hauptlauf(args) {
  const basis = basisAus(args);
  const aus = await ausgabeOrdner(args);
  const seiten = listeAus(args.seiten, SEITEN_STANDARD);
  for (const seite of seiten) {
    if (!seite.startsWith('/')) throw new Error(`--seiten braucht Pfade mit führendem /: ${seite}`);
  }
  const schemata = listeAus(args.schema, SCHEMATA.join(','));
  for (const schema of schemata) {
    if (!SCHEMATA.includes(schema)) throw new Error(`--schema kennt nur light und dark: ${schema}`);
  }
  const { AxeBuilder, hinweis } = await axeLaden();
  if (hinweis) console.log(hinweis);

  const ergebnisse = [];
  const browser = await chromium.launch();
  try {
    for (const seite of seiten) {
      for (const groesse of GROESSEN) {
        for (const schema of schemata) {
          console.log(`${seite} · ${groesse.name} · ${schema}`);
          try {
            const messung = await pruefen(browser, `${basis}${seite}`, groesse, schema, AxeBuilder);
            ergebnisse.push({ seite, groesse: groesse.name, schema, ...messung });
          } catch (fehler) {
            const kurz = String(fehler.message).split('\n')[0];
            console.log(`  Fehler: ${kurz}`);
            ergebnisse.push({ seite, groesse: groesse.name, schema, fehler: kurz });
          }
        }
      }
    }
  } finally {
    await browser.close();
  }

  const stand = new Date().toISOString();
  await ausschreiben(
    aus,
    'zugang.json',
    `${JSON.stringify({ erstellt: stand, basis, axeHinweis: hinweis, kontrastMindest: KONTRAST_MINDEST, ergebnisse }, null, 2)}\n`,
  );
  await ausschreiben(aus, 'zugang.md', zugangMd(ergebnisse, { stand, basis, axeHinweis: hinweis }));
}

alsHauptprogramm(import.meta.url, NUTZUNG, hauptlauf);
