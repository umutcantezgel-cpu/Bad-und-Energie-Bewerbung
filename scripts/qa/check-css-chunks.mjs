import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { BUERO_DATEI, BUERO_MARKE, bueroBlockAb } from './check-design-tokens.mjs';

/**
 * CSS-Ketten im Build (Prüfung E-029, Runde 2, Befunde 8 und 9; läuft nach `next build` als postbuild, einzeln mit
 * `bun run check:css-chunks`). Ergänzt die Quelltext-Wächter (components/zeichnung/__tests__/zeichnungen-seitenkopf,
 * components/themen/__tests__/stil, components/site/fehler/__tests__/fehler): Die prüfen, was importiert wird; hier
 * steht, was Next daraus macht. Gelesen werden die vorab gerenderten Seiten und die Stylesheets, die sie verlinken, aus
 * beiden Ablagen von `next build`: ohne Deployment-Adapter .next/server/app/<route>.html, mit Adapter (Vercel setzt
 * NEXT_ADAPTER_PATH) .next/server/route-cache/<Art>/<sha256>/$/<route>.html (next/dist/server/lib/route-cache-key.js).
 * Findet die Prüfung keine Seite, fällt sie durch, statt leer zu bestehen.
 *
 * 1. Kein CSS-Preload (`<link rel="preload" as="style">`) auf irgendeiner Seite: Jeder kostet vor dem ersten Bild eine
 *    Runde (Befund 8: das CSS-Modul der 404-Seite stand als Preload auf jeder Seite, FCP +150 ms bei Slow 4G).
 * 2. Höchstens zwei render-blockierende Stylesheets auf /jobs, den Stellenseiten und den Orts- und Kreisseiten (wie in
 *    der Basis 2f34ae9: das globale und das gemeinsame), höchstens drei auf jeder anderen Seite (AUSNAHMEN begründet).
 * 3. Die Regeln der Themenseiten (themen.module.css, 20 kB) nur auf /arbeiten-bei-uns und den Themen darunter
 *    (Befund 9; die Grenze davor: components/themen/themen-grenze.css), dort aber wirklich. Ebenso die Regeln der
 *    Danke-Seite, der Mappe und der Rechtsseiten nur auf ihren Seiten (SEITEN_MODULE) und das Satzblatt (prose.css)
 *    nur auf den Rechtsseiten (E-031, Prüfrunde 2 C2-1: vorher standen sie render-blockierend im gemeinsamen Chunk
 *    jeder Seite bzw. auf der Mappe).
 * 4. Die Regeln der technischen Zeichnungen und ihrer Dauerbewegung (technik.module.css, dauer.module.css) dürfen im
 *    gemeinsamen Chunk stehen, höchstens TECHNIK_BUDGET Bytes: Startseite, alle Stellenseiten (eine Chunk-Gruppe) und
 *    die Wärmepumpen-Seite brauchen sie, ein eigener Chunk kostete dort eine Anfrage mehr (eine Runde, ~150 ms) für
 *    rund 1,2 kB gzip, die die übrigen Seiten mitladen.
 * 5. Die Kopfzeichnungen der Stellen, die am Handy verborgen sind (Anlagenschema, kleiner Hausschnitt, seit E-031 die
 *    Büro-Zeichnung), stehen nur als Datei (/zeichnung/*.svg, lib/zeichnung/kopf-svg.ts) im Dokument, nie inline: weder
 *    als Markup noch in der RSC-Nutzlast (Prüfung E-029, Runde 3: zweimal im Dokument, über der Slow-Start-Grenze, LCP
 *    +225 ms). Erkannt an den langen Pfaden der gebauten Dateien; die Stellenseite verweist auf ihre Datei, und jede
 *    gebaute Kopfdatei ist das Kopfbild mindestens einer Stelle.
 * 6. Die Vergleichsräume auf der Wärmepumpen-Seite (Prüfrunde 1 C1-6) stehen ebenso nur als Datei im Dokument, die
 *    Bänder (lib/zeichnung/waerme/dateien.ts) wie die Zeichnung (lib/zeichnung/raumschnitt-svg.ts): Die Seite verweist
 *    auf jede gebaute Datei, kein Bandpfad steht auf irgendeiner Seite inline, und kein Dokument trägt den Raumschnitt
 *    inline (Kennung data-estrich; die Abbildung liegt weit unter dem ersten Bildschirm, inline zählten ihre Bytes vor
 *    LCP).
 * 7. Teilbudgets aus E-031, je ab dem Tag, an dem die Quelle existiert (bis dahin darf nichts davon im Build stehen):
 *    Regeln aus waerme.module.css ≤ WAERME_BUDGET auf jeder Seite und auf der Startseite wirklich vorhanden; Regeln aus
 *    waermefront.module.css ≤ FRONT_BUDGET auf jeder Seite, und zwar in einem Stylesheet, das alle Seiten laden (der
 *    globale Chunk); der Büro-Block am Ende von themen.module.css (Klassen und Keyframes mit `buero` am Anfang) nur auf
 *    Themenseiten, dort ≤ BUERO_BUDGET und auf mindestens einer wirklich vorhanden.
 */

const NEXT_DIR = path.resolve(process.cwd(), '.next');
const SERVER_DIR = path.join(NEXT_DIR, 'server');
/** Ablagen der vorab gerenderten Ausgaben unter .next/server: klassisch und mit Deployment-Adapter. */
const ABLAGEN = ['app', 'route-cache'];
/** Seiten, die nur das globale und das gemeinsame Stylesheet laden dürfen. */
export const ZWEI_STYLESHEETS = /^\/jobs(?:\/[^/]+)?$|^\/einsatzgebiet(?:\/[^/]+)?$/;
export const HOECHSTENS_STYLESHEETS = 3;
/**
 * Ausnahmen mit Begründung (Route → höchstens). Keine mehr: Die Bewerbungsmappe lud bis Prüfrunde 2 (E-031, C2-1) das
 * Satzblatt mit, das sie nicht nutzt (prose.css über den Sammelexport components/ui/index.ts), und durfte darum vier.
 */
export const AUSNAHMEN = Object.freeze({});
/**
 * CSS-Module einzelner Seiten (E-031, Prüfrunde 2 C2-1): Modulname → die Seiten, auf denen seine Regeln stehen dürfen
 * und, sobald eine davon vorab gerendert ist, auch stehen müssen. Ohne Grenze nahm Turbopack sie render-blockierend in
 * den gemeinsamen Chunk jeder Seite (zusammen rund 1,8 KB gzip). Die Grenzen im Quelltext: leere globale Dateien vor
 * danke.module.css (components/apply/thanks/danke-grenze.css) und mappe.module.css (components/mappe/mappe-grenze.css);
 * vor recht.module.css das Satzblatt prose.css selbst (components/recht/index.ts: RechtDokument zuerst).
 */
export const SEITEN_MODULE = Object.freeze({
  danke: Object.freeze(['/bewerbung/danke']),
  mappe: Object.freeze(['/bewerbung/mappe']),
  recht: Object.freeze(['/datenschutz', '/impressum']),
});
/** Das Satzblatt (components/ui/prose.css, Typography-Plugin) nur auf den Rechtsseiten, dort aber wirklich. */
export const PROSE_SEITEN = Object.freeze(['/datenschutz', '/impressum']);
/** Kennung des Satzblatts im gebauten CSS (Farbe des Lesetexts, nur in prose.css gesetzt). */
const PROSE_MERKMAL = /--tw-prose-body:/;

/** Themen-Hub und Themen flach darunter: die einzigen Seiten mit den Regeln aus themen.module.css. */
export const THEMEN_SEITE = /^\/arbeiten-bei-uns(?:\/[^/]+)?$/;
/** Höchstens so viele Bytes (roh) aus technik.module.css und dauer.module.css auf einer Seite (heute rund 7,2 kB). */
export const TECHNIK_BUDGET = 8000;
/** Höchstens so viele Bytes (roh) aus waerme.module.css auf einer Seite (Bänder des Wärmefelds, E-031). */
export const WAERME_BUDGET = 1400;
/**
 * Höchstens so viele Bytes (roh) aus waermefront.module.css auf jeder Seite (Klick-Wärme und Wärmefront, E-031). 1.200 →
 * 1.600 B mit dem Owner-Feedback vom 16.10.2026 (sanfter Wärmeschleier, E-031): Einblenden je Schicht, gestaffelte
 * Deckkraft und Größe, das Verblassen samt dem steigenden Hauptinhalt und die Ringe um die Box des Elements; gzip rund
 * 0,5 KB. Nicht weiter anheben.
 */
export const FRONT_BUDGET = 1600;
/** Höchstens so viele Bytes (roh) aus dem Büro-Block von themen.module.css auf einer Themenseite (E-031). */
export const BUERO_BUDGET = 2500;
/** Quellen der Teilbudgets (E-031): Die Prüfungen auf Vorhandensein greifen, sobald es sie gibt. */
export const WAERME_CSS = 'components/zeichnung/waerme/waerme.module.css';
export const FRONT_CSS = 'components/site/waermefront/waermefront.module.css';
/** Seiten, die das Wärmefeld sicher tragen (Hero der Startseite). */
export const WAERME_SEITEN = Object.freeze(['/']);
/** Kopfbilder der Stellen als Datei (lib/zeichnung/kopf-svg.ts, `data-stelle-kopfbild`). */
export const KOPF_ARTEN = Object.freeze(['anlagenschema', 'hausschnitt', 'buero']);
const UEBERSPRUNGEN = new Set(['/_global-error']);
/** Gebaute Kopfzeichnungen (Route-Handler app/zeichnung/[datei]): Inhalt in `<route>.body`. */
const ZEICHNUNG_ROUTE = /^\/zeichnung\/([^/]+\.svg)$/;
/** Pfade ab dieser Länge erkennen eine Zeichnung sicher (Schraffur, Leitungen); kürzere kommen auch anderswo vor. */
export const MERKMAL_LAENGE = 120;
/** Seite mit den Vergleichsräumen, deren Bänder als Datei kommen (Prüfrunde 1 C1-6). */
export const WAERME_DATEI_SEITE = '/arbeiten-bei-uns/waermepumpen';
/** Gebaute Banddatei: `waerme-<feld>-<stufe>-<hash>.svg` (lib/zeichnung/waerme/dateien.ts). */
const WAERME_BANDDATEI = /^waerme-[a-z-]+-[1-4]-[0-9a-f]{10}\.svg$/;
/** Gebaute Zeichnung eines Vergleichsraums: `raumschnitt-<art>-<hash>.svg` (lib/zeichnung/raumschnitt-svg.ts). */
const RAUMSCHNITT_DATEI = /^raumschnitt-(?:heizkoerper|fussboden)-[0-9a-f]{10}\.svg$/;
/** Kennung des inline gezeichneten Raumschnitts (Fußbodenaufbau); in keinem Dokument mehr. */
const RAUMSCHNITT_INLINE = /data-estrich=|data-daemmung=/;

/** Klassen eines CSS-Moduls im gebauten CSS: `.<name>-module__<hash>__<klasse>`. */
const modulKlasse = (name) => new RegExp(`\\b${name}-module__[A-Za-z0-9_-]{6}__`);

/** Regeln der obersten Ebene (at-Regeln samt Inhalt), damit Bytes je Modul gezählt werden können. */
export function regeln(css) {
  const out = [];
  let tiefe = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') tiefe++;
    else if (css[i] === '}') {
      tiefe--;
      if (tiefe === 0) {
        out.push(css.slice(start, i + 1));
        start = i + 1;
      }
    }
  }
  return out;
}

/** Bytes der Regeln, die Klassen eines der Module tragen. */
export function modulBytes(css, namen) {
  return musterBytes(css, namen.map(modulKlasse));
}

/** Bytes der Regeln (samt at-Regeln), die eines der Muster tragen. */
function musterBytes(css, muster) {
  return regeln(css)
    .filter((regel) => muster.some((m) => m.test(regel)))
    .reduce((summe, regel) => summe + regel.trim().length, 0);
}

/** Klassen und Keyframes des Büro-Blocks im gebauten CSS: `.themen-module__<hash>__buero…`. */
const BUERO_KLASSE = /\bthemen-module__[A-Za-z0-9_-]{6}__buero/;

/** Bytes des Büro-Blocks (E-031) im gebauten CSS. */
export function bueroBytes(css) {
  return musterBytes(css, [BUERO_KLASSE]);
}

/**
 * Prüft die Quelle von themen.module.css: Im Büro-Block (ab BUERO_MARKE bis zum Dateiende) beginnt jede Klasse und jeder
 * Keyframe-Name mit `buero`, davor keiner. Nur so misst die Prüfung im Build den ganzen Block. Leere Liste = in Ordnung.
 */
export function pruefeBueroBlock(quelle) {
  const fehler = [];
  const ab = bueroBlockAb(quelle);
  // Ohne Kommentare, Adressen in url() und globale Namen (:global(.x) gehört keinem Modul)
  const zeilen = quelle
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/url\([^)]*\)|:global\([^)]*\)/g, (c) => c.replace(/[^\n]/g, ' '))
    .split('\n');
  zeilen.forEach((zeile, i) => {
    const imBlock = i + 1 > ab;
    // Klassen (.name; Zahlen wie 0.5 oder 1.25rem beginnen mit einer Ziffer und zählen nicht) und Keyframe-Namen
    const namen = [
      ...[...zeile.matchAll(/(?<![\w-])\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]),
      ...[...zeile.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]),
    ];
    for (const name of namen) {
      if (imBlock && !name.startsWith('buero')) fehler.push(`${BUERO_DATEI}:${i + 1}: ${name} im Büro-Block beginnt nicht mit buero`);
      if (!imBlock && name.startsWith('buero')) fehler.push(`${BUERO_DATEI}:${i + 1}: ${name} steht vor dem Büro-Block`);
    }
  });
  return fehler;
}

/** Verlinkte Stylesheets einer Seite: render-blockierend (`rel=stylesheet`) und vorab geladen (`rel=preload as=style`). */
export function stylesheetsOf(html) {
  const stylesheets = [];
  const preloads = [];
  for (const [tag] of html.matchAll(/<link\b[^>]*>/g)) {
    const href = tag.match(/\bhref="([^"]+)"/)?.[1];
    if (!href) continue;
    if (/\brel="stylesheet"/.test(tag) && /\.css(?:\?|$)/.test(href)) stylesheets.push(href);
    else if (/\brel="preload"/.test(tag) && (/\bas="style"/.test(tag) || /\.css(?:\?|$)/.test(href))) preloads.push(href);
  }
  return { stylesheets, preloads };
}

/**
 * Prüft die Seiten. `seiten`: [{ route, stylesheets: [href], preloads: [href] }], `lies(href)` liefert das CSS.
 * `vorhanden`: welche Quellen der Teilbudgets es schon gibt ({ waerme, front, buero }); ohne Quelle darf nichts davon im
 * Build stehen. Gibt die Fehler als Liste zurück (leer = bestanden).
 */
export function pruefeSeiten(seiten, lies, vorhanden = {}) {
  if (seiten.length === 0) return ['keine vorab gerenderte Seite mit Stylesheet gefunden, die Prüfung liefe ins Leere'];
  const fehler = [];
  let themenGesehen = 0;
  /** Je Seitenmodul (und Satzblatt): auf wie vielen seiner Seiten es wirklich stand. */
  const gesehen = Object.fromEntries([...Object.keys(SEITEN_MODULE), 'prose'].map((name) => [name, 0]));
  let bueroGesehen = 0;
  /** Stylesheets mit Regeln der Wärmefront, je Seite (für „globaler Chunk“). */
  const frontBlaetter = [];
  for (const { route, stylesheets, preloads } of seiten) {
    for (const href of preloads) fehler.push(`${route}: CSS-Preload ${href} (eine Runde vor dem ersten Bild)`);
    const hoechstens = ZWEI_STYLESHEETS.test(route) ? 2 : (AUSNAHMEN[route] ?? HOECHSTENS_STYLESHEETS);
    if (stylesheets.length > hoechstens) {
      fehler.push(`${route}: ${stylesheets.length} render-blockierende Stylesheets, höchstens ${hoechstens} (${stylesheets.join(', ')})`);
    }
    const css = stylesheets.map(lies).join('\n');
    const themen = modulBytes(css, ['themen']);
    if (THEMEN_SEITE.test(route)) {
      if (themen === 0) fehler.push(`${route}: ohne die Regeln aus themen.module.css`);
      else themenGesehen++;
    } else if (themen > 0) {
      fehler.push(`${route}: ${themen} B aus themen.module.css render-blockierend, gehören nur auf die Themenseiten`);
    }
    for (const [modul, erlaubt] of Object.entries(SEITEN_MODULE)) {
      const bytes = modulBytes(css, [modul]);
      if (erlaubt.includes(route)) {
        if (bytes === 0) fehler.push(`${route}: ohne die Regeln aus ${modul}.module.css`);
        else gesehen[modul]++;
      } else if (bytes > 0) {
        fehler.push(`${route}: ${bytes} B aus ${modul}.module.css render-blockierend, gehören nur auf ${erlaubt.join(' und ')}`);
      }
    }
    const prose = musterBytes(css, [PROSE_MERKMAL]);
    if (PROSE_SEITEN.includes(route)) {
      if (prose === 0) fehler.push(`${route}: ohne das Satzblatt (prose.css)`);
      else gesehen.prose++;
    } else if (prose > 0) {
      fehler.push(`${route}: ${prose} B aus dem Satzblatt (prose.css) render-blockierend, gehören nur auf ${PROSE_SEITEN.join(' und ')}`);
    }
    const technik = modulBytes(css, ['technik', 'dauer']);
    if (technik > TECHNIK_BUDGET) fehler.push(`${route}: ${technik} B aus technik/dauer, höchstens ${TECHNIK_BUDGET} B`);

    // Teilbudgets E-031
    const waerme = modulBytes(css, ['waerme']);
    if (waerme > WAERME_BUDGET) fehler.push(`${route}: ${waerme} B aus waerme.module.css, höchstens ${WAERME_BUDGET} B`);
    if (!vorhanden.waerme && waerme > 0) fehler.push(`${route}: Regeln aus waerme.module.css ohne die Quelle ${WAERME_CSS}`);
    if (vorhanden.waerme && WAERME_SEITEN.includes(route) && waerme === 0) fehler.push(`${route}: ohne die Regeln aus waerme.module.css`);

    const front = modulBytes(css, ['waermefront']);
    if (front > FRONT_BUDGET) fehler.push(`${route}: ${front} B aus waermefront.module.css, höchstens ${FRONT_BUDGET} B`);
    if (!vorhanden.front && front > 0) fehler.push(`${route}: Regeln aus waermefront.module.css ohne die Quelle ${FRONT_CSS}`);
    if (vorhanden.front) {
      if (front === 0) fehler.push(`${route}: ohne die Regeln aus waermefront.module.css (die Überlagerung gehört auf jede Seite)`);
      else frontBlaetter.push(new Set(stylesheets.filter((href) => modulBytes(lies(href), ['waermefront']) > 0)));
    }

    const buero = bueroBytes(css);
    if (buero > 0 && !THEMEN_SEITE.test(route)) fehler.push(`${route}: ${buero} B aus dem Büro-Block, gehören nur auf die Themenseiten`);
    if (buero > BUERO_BUDGET) fehler.push(`${route}: ${buero} B aus dem Büro-Block, höchstens ${BUERO_BUDGET} B`);
    if (!vorhanden.buero && buero > 0) fehler.push(`${route}: Regeln des Büro-Blocks ohne den Block in ${BUERO_DATEI}`);
    if (buero > 0 && THEMEN_SEITE.test(route)) bueroGesehen++;
  }
  if (seiten.some(({ route }) => THEMEN_SEITE.test(route)) && themenGesehen === 0) fehler.push('keine Themenseite geprüft');
  for (const [name, erlaubt] of [...Object.entries(SEITEN_MODULE), ['prose', PROSE_SEITEN]]) {
    if (seiten.some(({ route }) => erlaubt.includes(route)) && gesehen[name] === 0) fehler.push(`${erlaubt.join(', ')} nicht geprüft`);
  }
  if (vorhanden.buero && bueroGesehen === 0) fehler.push('der Büro-Block steht auf keiner Themenseite');
  if (vorhanden.front && frontBlaetter.length > 0) {
    const gemeinsam = [...frontBlaetter[0]].filter((href) => frontBlaetter.every((blaetter) => blaetter.has(href)));
    if (gemeinsam.length === 0) fehler.push('die Regeln aus waermefront.module.css stehen in keinem Stylesheet, das alle Seiten laden (globaler Chunk)');
  }
  return fehler;
}

/**
 * Prüft die Stellenseiten gegen die gebauten Kopfzeichnungen. `seiten`: [{ route, html }], `dateien`:
 * [{ datei: 'anlagenschema-<hash>.svg', svg }]. Gibt die Fehler als Liste zurück (leer = bestanden).
 */
export function pruefeKopfzeichnungen(seiten, dateien) {
  const fehler = [];
  const arten = new Map();
  for (const { datei, svg } of dateien) {
    const merkmale = [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]).filter((d) => d.length >= MERKMAL_LAENGE);
    if (merkmale.length === 0) fehler.push(`${datei}: kein Pfad ab ${MERKMAL_LAENGE} Zeichen, die Prüfung fände die Zeichnung nicht`);
    arten.set(datei.replace(/-[0-9a-f]{10}\.svg$/, ''), { datei, merkmale });
  }
  let geprueft = 0;
  const verwendet = new Set();
  const kopfMuster = new RegExp(`data-stelle-kopfbild="(${KOPF_ARTEN.join('|')})"`);
  for (const { route, html } of seiten) {
    if (!/^\/jobs\/[^/]+$/.test(route)) continue;
    const art = html.match(kopfMuster)?.[1];
    if (!art) continue;
    const eigene = arten.get(art);
    if (!eigene) {
      fehler.push(`${route}: keine gebaute Datei für ${art}`);
      continue;
    }
    geprueft++;
    verwendet.add(art);
    if (!html.includes(`src="/zeichnung/${eigene.datei}"`)) fehler.push(`${route}: verweist nicht auf /zeichnung/${eigene.datei}`);
    for (const { datei, merkmale } of arten.values()) {
      if (merkmale.some((d) => html.includes(d))) fehler.push(`${route}: die Zeichnung aus ${datei} steht inline im Dokument (HTML oder RSC)`);
    }
  }
  if (geprueft === 0) fehler.push('keine Stellenseite mit Anlagenschema oder Hausschnitt im Kopf geprüft');
  else {
    // Jede gebaute Kopfdatei ist das Kopfbild mindestens einer Stelle (sonst prüfte die Inline-Regel ins Leere)
    for (const art of KOPF_ARTEN) {
      const eigene = arten.get(art);
      if (eigene && !verwendet.has(art)) fehler.push(`${eigene.datei}: Kopfbild keiner Stellenseite`);
    }
  }
  return fehler;
}

/**
 * Prüft die Bänder der Vergleichsräume (Punkt 6): `seiten` [{ route, html }], `dateien` alle gebauten Zeichnungen
 * [{ datei, svg }]; berücksichtigt werden die Banddateien `waerme-*.svg`. Gibt die Fehler als Liste zurück.
 */
export function pruefeWaermeDateien(seiten, dateien) {
  const baender = dateien
    .filter(({ datei }) => WAERME_BANDDATEI.test(datei))
    .map(({ datei, svg }) => ({ datei, merkmale: [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]).filter((d) => d.length >= MERKMAL_LAENGE) }));
  if (baender.length === 0) return ['keine gebaute Banddatei des Wärmefelds (/zeichnung/waerme-*.svg)'];
  const raeume = dateien.filter(({ datei }) => RAUMSCHNITT_DATEI.test(datei)).map(({ datei }) => datei);
  const fehler = [];
  if (raeume.length !== 2) fehler.push(`${raeume.length} gebaute Zeichnungen der Vergleichsräume (/zeichnung/raumschnitt-*.svg), erwartet 2`);
  for (const { datei, merkmale } of baender) {
    if (merkmale.length === 0) fehler.push(`${datei}: kein Pfad ab ${MERKMAL_LAENGE} Zeichen, die Prüfung fände das Band nicht`);
  }
  const seite = seiten.find(({ route }) => route === WAERME_DATEI_SEITE);
  if (!seite) fehler.push(`${WAERME_DATEI_SEITE}: nicht gebaut`);
  else {
    for (const datei of [...baender.map((b) => b.datei), ...raeume]) {
      if (!seite.html.includes(`src="/zeichnung/${datei}"`)) fehler.push(`${WAERME_DATEI_SEITE}: verweist nicht auf /zeichnung/${datei}`);
    }
  }
  for (const { route, html } of seiten) {
    if (RAUMSCHNITT_INLINE.test(html)) fehler.push(`${route}: der Raumschnitt steht inline im Dokument (HTML oder RSC)`);
    for (const { datei, merkmale } of baender) {
      if (merkmale.some((d) => html.includes(d))) fehler.push(`${route}: das Band aus ${datei} steht inline im Dokument (HTML oder RSC)`);
    }
  }
  return fehler;
}

/**
 * Route einer vorab gerenderten Datei aus ihrem Pfad relativ zu .next/server, ohne `endung`; null, wenn die Datei in
 * keiner der beiden Ablagen liegt. `app/jobs.html` und `route-cache/APP_PAGE/<sha256>/$/jobs.html` → `/jobs`,
 * `app/index.html` und `route-cache/APP_PAGE/<sha256>/$/index.html` → `/`.
 */
export function routeVon(relativ, endung) {
  const pfad = relativ.replace(/\\/g, '/');
  if (!pfad.endsWith(endung)) return null;
  const ohne = pfad.slice(0, -endung.length);
  const rest = ohne.match(/^app\/(.+)$/)?.[1] ?? ohne.match(/^route-cache\/[A-Z_]+\/[0-9a-f]{64}\/\$\/(.+)$/)?.[1];
  if (!rest) return null;
  return rest === 'index' ? '/' : `/${rest}`;
}

function dateienMit(dir, endung, out = []) {
  for (const eintrag of fs.readdirSync(dir, { withFileTypes: true })) {
    const voll = path.join(dir, eintrag.name);
    if (eintrag.isDirectory()) dateienMit(voll, endung, out);
    else if (eintrag.name.endsWith(endung)) out.push(voll);
  }
  return out;
}

/** Vorab gerenderte Dateien mit `endung` aus beiden Ablagen: [{ route, inhalt }]. */
function vorabGerendert(endung) {
  return ABLAGEN.map((ablage) => path.join(SERVER_DIR, ablage))
    .filter((wurzel) => fs.existsSync(wurzel))
    .flatMap((wurzel) => dateienMit(wurzel, endung))
    .map((voll) => ({ route: routeVon(path.relative(SERVER_DIR, voll), endung), voll }))
    .filter(({ route }) => route !== null)
    .map(({ route, voll }) => ({ route, inhalt: fs.readFileSync(voll, 'utf8') }));
}

/** Wurzel des Repos (für die Quellen der Teilbudgets). */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Welche Quellen der Teilbudgets es gibt, dazu die Fehler der Büro-Block-Quelle. */
export function quellenStand(root = ROOT) {
  const themen = path.join(root, BUERO_DATEI);
  const quelle = fs.existsSync(themen) ? fs.readFileSync(themen, 'utf8') : '';
  return {
    vorhanden: {
      waerme: fs.existsSync(path.join(root, WAERME_CSS)),
      front: fs.existsSync(path.join(root, FRONT_CSS)),
      buero: quelle.includes(BUERO_MARKE),
    },
    fehler: pruefeBueroBlock(quelle),
  };
}

export function runCssChunkCheck() {
  if (!fs.existsSync(SERVER_DIR)) {
    console.error('🚨 Kein Build gefunden (.next/server). Erst `next build`.');
    process.exit(1);
  }
  const stand = quellenStand();
  const dokumente = vorabGerendert('.html')
    .map(({ route, inhalt }) => ({ route, html: inhalt }))
    // Vorab gerenderte Weiterleitungen (alte Slugs) tragen kein Stylesheet
    .filter(({ route, html }) => !UEBERSPRUNGEN.has(route) && /<link\b[^>]*rel="stylesheet"/.test(html));
  const seiten = dokumente.map(({ route, html }) => ({ route, ...stylesheetsOf(html) }));
  const cache = new Map();
  const lies = (href) => {
    if (!cache.has(href)) cache.set(href, fs.readFileSync(path.join(NEXT_DIR, href.replace(/^\/_next\//, '').replace(/\?.*$/, '')), 'utf8'));
    return cache.get(href);
  };
  const zeichnungen = vorabGerendert('.body').flatMap(({ route, inhalt }) => {
    const datei = route.match(ZEICHNUNG_ROUTE)?.[1];
    return datei ? [{ datei, svg: inhalt }] : [];
  });
  const fehler = [
    ...stand.fehler,
    ...pruefeSeiten(seiten, lies, stand.vorhanden),
    // Der Raumschnitt hat keine langen Pfade (Rechtecke und Kreise): Ihn erkennt pruefeWaermeDateien an seiner Kennung
    ...pruefeKopfzeichnungen(
      dokumente,
      zeichnungen.filter(({ datei }) => !RAUMSCHNITT_DATEI.test(datei)),
    ),
    ...pruefeWaermeDateien(dokumente, zeichnungen),
  ];
  if (fehler.length > 0) {
    for (const f of fehler.slice(0, 40)) console.error(`❌ ${f}`);
    if (fehler.length > 40) console.error(`… und ${fehler.length - 40} weitere`);
    console.error(`\n🚨 CSS-Ketten: ${fehler.length} Fehler.`);
    process.exit(1);
  }
  const groesse = (route) => {
    const seite = seiten.find((s) => s.route === route);
    if (!seite) return `${route}: nicht gebaut`;
    const gz = seite.stylesheets.reduce((summe, href) => summe + zlib.gzipSync(lies(href), { level: 9 }).length, 0);
    return `${route} ${seite.stylesheets.length} Stylesheet(s), ${gz} B gzip`;
  };
  const dokument = (route) => {
    const seite = dokumente.find((s) => s.route === route);
    return seite ? `${route} ${zlib.gzipSync(seite.html).length} B gzip` : `${route}: nicht gebaut`;
  };
  console.log(
    `✅ CSS-Ketten: ${seiten.length} Seiten ohne CSS-Preload, themen.module.css nur auf den Themenseiten, technik/dauer im Budget. ` +
      ['/', '/jobs', '/jobs/anlagenmechaniker-shk-wetzlar', '/einsatzgebiet/herborn', '/arbeiten-bei-uns/waermepumpen'].map(groesse).join(' · '),
  );
  const teil = (route) => {
    const seite = seiten.find((s) => s.route === route);
    if (!seite) return `${route}: nicht gebaut`;
    const css = seite.stylesheets.map(lies).join('\n');
    return `${route} Wärme ${modulBytes(css, ['waerme'])} B, Front ${modulBytes(css, ['waermefront'])} B, Büro ${bueroBytes(css)} B`;
  };
  const quellen = Object.entries(stand.vorhanden).filter(([, ja]) => ja).map(([name]) => name);
  console.log(
    `✅ Teilbudgets E-031 (Wärme ≤ ${WAERME_BUDGET} B, Front ≤ ${FRONT_BUDGET} B, Büro ≤ ${BUERO_BUDGET} B; Quellen: ${quellen.join(', ') || 'noch keine'}): ` +
      ['/', '/jobs', '/arbeiten-bei-uns/waermepumpen', '/arbeiten-bei-uns/buero-und-verwaltung'].map(teil).join(' · '),
  );
  console.log(
    `✅ Kopfzeichnungen der Stellen und Bänder der Vergleichsräume nur als Datei (${zeichnungen.map((z) => z.datei).join(', ')}). Dokumente: ` +
      ['/jobs/anlagenmechaniker-shk-wetzlar', '/jobs/ausbildung-anlagenmechaniker-shk-wetzlar', '/jobs/obermonteur-projektleiter-shk-wetzlar', WAERME_DATEI_SEITE].map(dokument).join(' · '),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCssChunkCheck();
