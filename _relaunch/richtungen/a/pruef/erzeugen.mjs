#!/usr/bin/env node
// Erzeugt die berechneten Teile von index.html aus den Tokens und der Ortsliste.
// Marken im Dokument: <!--gen:NAME--> … <!--/gen:NAME-->  (NAME: farben | kontrast | orte | plan)
// Aufruf:  node pruef/erzeugen.mjs            schreibt index.html neu
//          node pruef/erzeugen.mjs --pruefen  schreibt nichts, meldet Abweichungen (Exit 1)
// Quellen: Tokens = CSS in index.html (light-dark()-Werte), Orte = lib/data/locations.ts (nur lesen).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(dir, 'index.html');
const locPath = path.resolve(dir, '../../../lib/data/locations.ts');
const nurPruefen = process.argv.includes('--pruefen');
let html = fs.readFileSync(indexPath, 'utf8');

/* ───────── Tokens aus dem CSS ───────── */
function tokens(css) {
  const out = {};
  const i = css.indexOf(':root{');
  const j = css.indexOf('}', i);
  const block = css.slice(i + 6, j);
  // Werte können light-dark(a,b) enthalten; Semikolon trennt Deklarationen auf oberster Ebene
  let depth = 0, cur = '';
  const decls = [];
  for (const ch of block) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { decls.push(cur); cur = ''; } else cur += ch;
  }
  decls.push(cur);
  for (const d of decls) {
    const m = d.trim().match(/^(--[a-z0-9-]+)\s*:\s*([\s\S]+)$/);
    if (!m) continue;
    const v = m[2].trim();
    const ld = v.match(/^light-dark\(([\s\S]+)\)$/);
    if (ld) {
      let dd = 0, k = -1;
      for (let x = 0; x < ld[1].length; x++) {
        const c = ld[1][x];
        if (c === '(') dd++;
        if (c === ')') dd--;
        if (c === ',' && dd === 0) { k = x; break; }
      }
      out[m[1]] = [ld[1].slice(0, k).trim(), ld[1].slice(k + 1).trim()];
    } else out[m[1]] = [v, v];
  }
  return out;
}
const T = tokens(html);
function farbe(name, modus) {
  let v = T[name]?.[modus];
  let n = 0;
  while (v && v.startsWith('var(') && n++ < 5) v = T[v.slice(4, -1).trim()]?.[modus];
  return v;
}
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const kontrast = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const de = (n) => n.toFixed(2).replace('.', ',');
const stufe = (v, art) => (art === 'T' ? (v >= 7 ? 'AAA' : v >= 4.5 ? 'AA' : 'ungenügend') : v >= 3 ? 'AA' : 'ungenügend');

/* ───────── Farbrollen und Paare ───────── */
const ROLLEN = [
  ['Papier', '--papier', 'Seitenfläche: Pauspapier hell, Blaupause dunkel.'],
  ['Feld', '--feld', 'Zweite Fläche: gewählte Zeile, Radiusscheibe, Planbereiche.'],
  ['Linie', '--linie', 'Raster und Zeilenlinien, rein dekorativ; trägt nie allein eine Aussage.'],
  ['Linie stark', '--linie-stark', 'Maßlinien, Rahmen, Tabellenkopf, Plakettenrand – trägt Bedeutung, mindestens 3&nbsp;:&nbsp;1.'],
  ['Tinte', '--tinte', 'Text, Überschriften und alle Beschriftungen.'],
  ['Tinte gedämpft', '--tinte-ged', 'Zweite Textebene: Erläuterungen, zweite H1-Zeile.'],
  ['Rücklauf-Blau', '--blau', 'Marke Navy: Rücklauf, Maße, Auswahl, Links. Dunkel aufgehellt, weil Navy auf Blaupause verschwindet.'],
  ['Vorlauf-Rot, Knopf', '--rot', 'Marke Rot: nur die eine Hauptaktion je Ansicht. In beiden Modi #D60000.'],
  ['Vorlauf-Linie', '--rot-linie', 'Die Leitung, die zum Knopf führt. Hell wie der Knopf, dunkel aufgehellt: Abstufung nach E-016, keine neue Farbe.'],
  ['Rot als Text', '--rot-text', 'Rot nur als Schrift: Fachbegriff „Vorlauf“, Fehlertext. Dunkel aufgehellt; nie für Flächen.'],
  ['Rot gedrückt', '--rot-hover', 'Hauptaktion bei Hover und gedrückt.'],
  ['Rot tief', '--rot-tief', 'Muffe am Knopf, in beiden Modi gleich.'],
  ['Fokus', '--fokus', 'Fokusring 3&nbsp;px mit 3&nbsp;px Abstand.'],
  ['Plakette', '--plakette', 'Nur dunkel: helle Fläche unter dem unveränderten Logo, Schutzzone ein Viertel der Logohöhe, Rand in Linie stark.'],
  ['Fluss', '--fluss', 'Keine eigene Rolle: hell auf der Vorlauf-Linie (hell: Papier, dunkel: Tinte), nur Rückmeldung.'],
];
const PAARE = [
  ['Tinte auf Papier', '--tinte', '--papier', 'Fließtext, Überschriften, Beschriftungen', 'T'],
  ['Tinte auf Feld', '--tinte', '--feld', 'Text auf Feld (Zeile, Plan)', 'T'],
  ['Tinte gedämpft auf Papier', '--tinte-ged', '--papier', 'Erläuterungen, zweite H1-Zeile', 'T'],
  ['Tinte gedämpft auf Feld', '--tinte-ged', '--feld', 'Erläuterung auf Feld', 'T'],
  ['Rücklauf-Blau auf Papier', '--blau', '--papier', 'Links, Maßzahlen, Auswahl', 'T'],
  ['Rücklauf-Blau auf Feld', '--blau', '--feld', 'Maßzahlen auf Feld', 'T'],
  ['Rot als Text auf Papier', '--rot-text', '--papier', 'Fachbegriff „Vorlauf“, Fehlertext', 'T'],
  ['Rot als Text auf Feld', '--rot-text', '--feld', 'Rotbeschriftung auf Feld', 'T'],
  ['Weiß auf Vorlauf-Rot', '--weiss', '--rot', 'Knopftext Hauptaktion', 'T'],
  ['Weiß auf Rot gedrückt', '--weiss', '--rot-hover', 'Knopftext bei Hover', 'T'],
  ['Papier auf Rücklauf-Blau', '--papier', '--blau', 'Text im gewählten Segment', 'T'],
  ['Vorlauf-Linie auf Papier', '--rot-linie', '--papier', 'Leitung zur Hauptaktion', 'G'],
  ['Vorlauf-Linie auf Feld', '--rot-linie', '--feld', 'Leitung auf Feld', 'G'],
  ['Rot, Knopffläche, auf Papier', '--rot', '--papier', 'Rand des Knopfes gegen die Fläche', 'G'],
  ['Rücklauf-Blau auf Papier', '--blau', '--papier', 'Rücklauf, Ringe, Knoten', 'G'],
  ['Linie stark auf Papier', '--linie-stark', '--papier', 'Maßlinien, Rahmen, Plakettenrand', 'G'],
  ['Linie stark auf Feld', '--linie-stark', '--feld', 'Maßlinien auf Feld', 'G'],
  ['Fokus auf Papier', '--fokus', '--papier', 'Fokusring (3&nbsp;px, Abstand 3&nbsp;px)', 'G'],
  ['Fluss auf Vorlauf-Linie', '--fluss', '--rot-linie', 'Wärmefluss: nur Rückmeldung, kein Informationsträger', 'G'],
];
const hex = (n, m) => farbe(n, m);

function genFarben() {
  const rows = ROLLEN.map(([name, tok, aufgabe]) => {
    const zelle = (m) => {
      const h = hex(tok, m);
      if (!h || h === 'transparent') return `<td class="modus-${m ? 'dunkel' : 'hell'}" data-l="${m ? 'Dunkel' : 'Hell'}"><span class="mono muted">keine</span></td>`;
      return `<td class="modus-${m ? 'dunkel' : 'hell'}" data-l="${m ? 'Dunkel' : 'Hell'}"><span class="swatch" style="--c:var(${tok})"></span><span class="mono">${h.toUpperCase()}</span></td>`;
    };
    return `<tr><th scope="row">${name}<br><span class="mono muted">${tok}</span></th>${zelle(0)}${zelle(1)}<td data-l="Aufgabe">${aufgabe}</td></tr>`;
  });
  return rows.join('');
}
let minT = { 0: 99, 1: 99 }, minG = { 0: 99, 1: 99 };
function genKontrast() {
  const rows = PAARE.map(([name, fg, bg, use, art]) => {
    const cell = (m) => {
      const v = kontrast(hex(fg, m), hex(bg, m));
      const tab = art === 'T' ? minT : minG;
      tab[m] = Math.min(tab[m], v);
      const s = stufe(v, art);
      return `<td class="modus-${m ? 'dunkel' : 'hell'} ${s === 'ungenügend' ? 'nok' : 'ok'}" data-l="${m ? 'Dunkel' : 'Hell'}"><b class="mass-zahl">${de(v)}</b>&nbsp;:&nbsp;1<span class="pass">${s}</span></td>`;
    };
    const chip = (m) => `<span class="chip modus-${m ? 'dunkel' : 'hell'}" style="--f:var(${fg});--g:var(${bg})"></span>`;
    return `<tr><th scope="row"><span class="chips">${chip(0)}${chip(1)}</span>${name}</th><td data-l="Verwendung">${use}</td><td class="mono" data-l="Anforderung">${art === 'T' ? 'Text 4,5' : 'Grafik 3'}</td>${cell(0)}${cell(1)}</tr>`;
  });
  return rows.join('');
}

/* ───────── Orte ───────── */
function orte() {
  const src = fs.readFileSync(locPath, 'utf8');
  const re = /name:\s*'([^']+)'[\s\S]*?slug:\s*'([^']+)'[\s\S]*?distanceKm:\s*(\d+)[\s\S]*?commuteMinutes:\s*(\d+)[\s\S]*?latitude:\s*([\d.]+)[\s\S]*?longitude:\s*([\d.]+)[\s\S]*?isCoreZone:\s*(true|false)/g;
  const list = [];
  let m;
  while ((m = re.exec(src))) list.push({ name: m[1], slug: m[2], km: +m[3], min: +m[4], lat: +m[5], lon: +m[6], kern: m[7] === 'true' });
  list.sort((a, b) => a.km - b.km || a.name.localeCompare(b.name, 'de'));
  const lat0 = 50.565, lon0 = 8.498;
  const kmLat = 111.32, kmLon = 111.32 * Math.cos((lat0 * Math.PI) / 180);
  for (const o of list) {
    o.e = (o.lon - lon0) * kmLon; // Osten in km
    o.n = (o.lat - lat0) * kmLat; // Norden in km
    o.luft = Math.hypot(o.e, o.n);
  }
  return list;
}
const ORTE = orte();
const STANDARD = 'giessen';
const MITTE = 'wetzlar-kernstadt';

function genOrte() {
  return ORTE.map((o) => `<tr data-ort="${o.slug}" data-km="${o.km}" data-min="${o.min}"${o.slug === STANDARD ? ' class="is-sel"' : ''}><th scope="row">${o.name}</th><td>${o.km}&nbsp;km</td><td>${o.min}&nbsp;Min.</td></tr>`).join('');
}

/* ───────── Lageplan: drei Ausschnitte (folgen dem Radius) ───────── */
const HALB = { 15: 21, 25: 28, 35: 37.5 }; // halbe Kantenlänge in km je Ausschnitt
// Beschriftungsrichtung je Ort (nach Messung in pruef/pruefen.mjs, kein Überlapp bei 288 px Planbreite)
const RICHTUNG = {
  'wetzlar-kernstadt': 'w',
  hermannstein: 'ne',
  nauborn: 'se',
  garbenheim: 'ne',
  dutenhofen: 'ne',
  steindorf: 'sw',
  asslar: 'nw',
  braunfels: 'w',
  giessen: 'e',
  herborn: 'w',
};
const f1 = (n) => String(Math.round(n * 10) / 10);

function genPlan() {
  const out = [];
  out.push('<svg class="pl" viewBox="0 0 640 640" role="img" aria-labelledby="pl-t pl-d" focusable="false"><title id="pl-t">Lageplan: Einsatzgebiet maximal 35&#160;km um Wetzlar</title><desc id="pl-d">Schematischer Plan mit dem Betrieb in Wetzlar in der Mitte. Der Ausschnitt folgt dem gewählten Radius von 15, 25 oder 35 Kilometern. Ringe und Raster sind Luftlinie, ein Feld sind 5 Kilometer. Außerhalb von 35 Kilometern ist die Fläche schraffiert: dort montieren wir nicht. Zehn Orte liegen im Umkreis; ihre Entfernung und Fahrzeit stehen in der Liste.</desc>');
  for (const r of [15, 25, 35]) {
    const k = 320 / HALB[r];
    const c = 320;
    const ring = (km) => f1(km * k);
    // Raster alle 5 km, Mitte liegt auf einer Linie
    let raster = '';
    for (let i = -Math.floor(HALB[r] / 5); i <= Math.floor(HALB[r] / 5); i++) {
      const p = f1(c + i * 5 * k);
      raster += `M${p} 0V640M0 ${p}H640`;
    }
    const R35 = 35 * k;
    out.push(`<g class="pl-f pl-f${r}" data-motion="radius-wahl">`);
    out.push(`<clipPath id="pl-clip-${r}"><circle cx="${c}" cy="${c}" r="${f1(R35)}"/></clipPath>`);
    out.push(`<path class="pl-aussen" fill="url(#schraffur)" fill-rule="evenodd" d="M0 0H640V640H0zM${f1(c - R35)} ${c}a${f1(R35)} ${f1(R35)} 0 1 0 ${f1(2 * R35)} 0a${f1(R35)} ${f1(R35)} 0 1 0 ${f1(-2 * R35)} 0z"/>`);
    out.push(`<circle class="pl-scheibe" cx="${c}" cy="${c}" r="${ring(r)}"/>`);
    out.push(`<path class="pl-raster" clip-path="url(#pl-clip-${r})" d="${raster}"/>`);
    for (const rr of [15, 25, 35]) {
      const cls = rr === r ? 'pl-ring pl-ring--sel' : rr === 35 ? 'pl-ring pl-ring--rand' : 'pl-ring';
      out.push(`<circle class="${cls}" cx="${c}" cy="${c}" r="${ring(rr)}"/>`);
    }
    // Maßstab: ein Feld = 5 km; Nordpfeil
    out.push(`<g class="pl-mass"><path d="M36 604H${f1(36 + 5 * k)}M36 596V612M${f1(36 + 5 * k)} 596V612"/></g>`);
    out.push(`<g class="pl-nord"><path d="M604 58V26M604 26l-8 12M604 26l8 12"/></g>`);
    // Orte
    for (const o of ORTE) {
      const x = c + o.e * k, y = c - o.n * k;
      const aus = o.km > r;
      const sel = o.slug === STANDARD;
      const cls = `pl-ort${aus ? ' is-out' : ''}${sel ? ' is-sel' : ''}${o.slug === MITTE ? ' pl-mitte' : ''}`;
      let g = `<g class="${cls}" data-ort="${o.slug}" data-km="${o.km}">`;
      if (o.slug !== MITTE) {
        const dx = x - c, dy = y - c;
        let pivot;
        if (Math.abs(dx) >= Math.abs(dy)) pivot = [c + Math.sign(dx) * Math.abs(dy), y];
        else pivot = [x, c + Math.sign(dy) * Math.abs(dx)];
        g += `<path class="pl-route" pathLength="1" data-motion="ort-route" d="M${f1(x)} ${f1(y)}L${f1(pivot[0])} ${f1(pivot[1])}L${c} ${c}"/>`;
      }
      if (o.slug === MITTE) {
        g += `<circle class="pl-marke" data-motion="ort-marke" cx="${c}" cy="${c}" r="16"/><circle class="pl-betrieb-ring" cx="${c}" cy="${c}" r="10"/><circle class="pl-betrieb" cx="${c}" cy="${c}" r="5"/>`;
      } else {
        g += `<circle class="pl-marke" data-motion="ort-marke" cx="${f1(x)}" cy="${f1(y)}" r="12"/><circle class="pl-punkt" cx="${f1(x)}" cy="${f1(y)}" r="6"/>`;
      }
      g += '</g>';
      out.push(g);
    }
    out.push('</g>');
  }
  out.push('</svg>');
  // Beschriftungen als HTML (Token-Größen), je Ausschnitt eine Liste, die mit dem Ausschnitt überblendet
  for (const r of [15, 25, 35]) {
    const k = 320 / HALB[r];
    const kp = 50 / HALB[r]; // Prozent der Planbreite je km
    const items = [];
    const innen = (e, n, rand) => Math.abs(e) <= HALB[r] - rand && Math.abs(n) <= HALB[r] - rand;
    for (const o of ORTE) {
      if (!innen(o.e, o.n, 1.5)) continue;
      const sel = o.slug === STANDARD;
      const fern = o.km >= 14;
      const mitte = o.slug === MITTE;
      const cls = ['pl-l', mitte ? 'pl-l--fest' : fern ? 'pl-l--fern' : 'pl-l--kern', `d-${RICHTUNG[o.slug]}`, sel ? 'is-sel' : ''].filter(Boolean).join(' ');
      items.push(`<li class="${cls}" data-ort="${o.slug}" style="--e:${f1(o.e)};--n:${f1(o.n)}">${mitte ? 'Betrieb Wetzlar' : o.name}</li>`);
    }
    for (const rr of [15, 25, 35]) {
      const e = rr * Math.SQRT1_2;
      if (!innen(e, e, 1.5)) continue;
      items.push(`<li class="pl-r" style="--e:${f1(e)};--n:${f1(e)}">${rr}&nbsp;km</li>`);
    }
    const fx = (36 + 5 * k + 10) / 6.4; // Prozent
    items.push(`<li class="pl-s" style="--x:${f1(fx)}">1&nbsp;Feld = 5&nbsp;km</li>`);
    items.push(`<li class="pl-n">N</li>`);
    out.push(`<ul class="pl-t pl-t${r}" aria-hidden="true" style="--kp:${(Math.round(kp * 1000) / 1000)}%">${items.join('')}</ul>`);
  }
  return out.join('');
}

/* ───────── Einsetzen ───────── */
function ersetzen(name, inhalt) {
  const re = new RegExp(`(<!--gen:${name}-->)[\\s\\S]*?(<!--/gen:${name}-->)`);
  if (!re.test(html)) { console.error(`Marke gen:${name} fehlt`); process.exitCode = 1; return; }
  html = html.replace(re, (_, a, b) => `${a}${inhalt}${b}`);
}
const alt = html;
ersetzen('farben', genFarben());
ersetzen('kontrast', genKontrast());
ersetzen('orte', genOrte());
ersetzen('plan', genPlan());
const nPaare = PAARE.length;
html = html.replace(/<!--n:paare-->[^<]*<!--\/n:paare-->/g, `<!--n:paare-->${nPaare}<!--/n:paare-->`);
const mw = (n) => de(n);
html = html.replace(/<!--n:mintext-hell-->[^<]*<!--\/n:mintext-hell-->/, `<!--n:mintext-hell-->${mw(minT[0])}<!--/n:mintext-hell-->`)
  .replace(/<!--n:mintext-dunkel-->[^<]*<!--\/n:mintext-dunkel-->/, `<!--n:mintext-dunkel-->${mw(minT[1])}<!--/n:mintext-dunkel-->`)
  .replace(/<!--n:mingrafik-hell-->[^<]*<!--\/n:mingrafik-hell-->/, `<!--n:mingrafik-hell-->${mw(minG[0])}<!--/n:mingrafik-hell-->`)
  .replace(/<!--n:mingrafik-dunkel-->[^<]*<!--\/n:mingrafik-dunkel-->/, `<!--n:mingrafik-dunkel-->${mw(minG[1])}<!--/n:mingrafik-dunkel-->`);

const verletzt = [];
for (const [name, fg, bg, , art] of PAARE) for (const m of [0, 1]) {
  const v = kontrast(hex(fg, m), hex(bg, m));
  if (v < (art === 'T' ? 4.5 : 3)) verletzt.push(`${name} (${m ? 'dunkel' : 'hell'}): ${de(v)}`);
}
console.log(`Paare: ${nPaare}; kleinster Textwert hell ${de(minT[0])}, dunkel ${de(minT[1])}; kleinster Grafikwert hell ${de(minG[0])}, dunkel ${de(minG[1])}`);
if (verletzt.length) { console.error('UNTERSCHRITTEN: ' + verletzt.join('; ')); process.exitCode = 1; }
if (nurPruefen) {
  if (alt !== html) { console.error('index.html weicht von den erzeugten Teilen ab (node pruef/erzeugen.mjs ausführen).'); process.exitCode = 1; }
} else {
  fs.writeFileSync(indexPath, html);
  console.log(`index.html geschrieben (${(html.length / 1024).toFixed(1)} KB, ${ORTE.length} Orte)`);
}
