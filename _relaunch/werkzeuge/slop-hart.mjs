// Slop-Prüfung, harte Befunde S-01 bis S-07 (Ebene 8 · Konsistenz, Z-07-Vorstufe).
//
// Aufruf: node slop-hart.mjs --base http://localhost:3500 --label P0-SLOP-01 [--teile code,render] [--only start,stellen] [--vps d1440,m375]
//
// Teil A (Code-Scan über app/, components/, lib/ – ohne __tests__ und *.test.ts(x), ohne node_modules/.next):
//   S-01 Platzhalter-Muster · S-04 Icon-Quellen und Strichstärken · S-05 freie Werte (eckige Klammern, Inline-style,
//   Hexwerte, Dauern) · S-07 Auftakt-Muster. Dazu Hinweise (keine Zählung) für S-02, S-03 und S-06.
// Teil B (gerendert, je GRUNDMENGE-Seite × d1440/m375, hell, Bewegung 'no-preference'):
//   S-01 sichtbarer Text · S-02 Scroll-Auftritte je Abschnitt · S-03 axe color-contrast + :focus-visible der ersten 15 Tab-Stopps
//   S-04 Emojis und Strichstärken inline-SVG · S-05 getComputedStyle (Stichprobe 60 + Volltext der Seite) gegen theme.css
//   S-06 Hover-/Fokus-/Fehlerstil je Knopf, Link, Feld per CSSOM · S-07 Inhalt und Scrollen 300 ms nach domcontentloaded.
// Ausgabe: _relaunch/belege/<label>/slop-hart.json und slop-hart.md · Rohdaten: _relaunch/.roh/<label>/slop-hart-roh.json
// Maßstab: scripts/qa/check-design-tokens.mjs und app/styles/theme.css (nur gelesen).
import fs from 'node:fs/promises';
import path from 'node:path';
import { AxeBuilder } from '@axe-core/playwright';
import { GRUNDMENGE, VIEWPORTS, collectErrors, launch, newContext, scrollThrough } from './lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const REPO = path.resolve(ROOT, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = args.base ?? 'http://localhost:3500';
const label = args.label ?? 'lauf';
const teile = (args.teile ?? 'code,render').split(',');
const only = args.only ? args.only.split(',') : null;
const vpNamen = (args.vps ?? 'd1440,m375').split(',');
const vps = VIEWPORTS.filter((v) => vpNamen.includes(v.name));
const outDir = path.join(ROOT, 'belege', label);
const rawDir = path.join(ROOT, '.roh', label);
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(rawDir, { recursive: true });

const S01_RE_QUELLE = 'lorem|ipsum|placeholder|platzhalter|beispiel@|max mustermann|alexander koch|dummy|todo:|xxx';
const S07_RE_QUELLE = 'preloader|loader-screen|intro|splash|countUp|count-up|odometer';
const bericht = { label, base, erstellt: new Date().toISOString(), bedingungen: {}, zusammenfassung: {}, code: {}, seiten: [] };

// ═════════════════════════════ Teil A: Code-Scan ═════════════════════════════
if (teile.includes('code')) {
  const SCAN = ['app', 'components', 'lib'];
  const SKIP = new Set(['node_modules', '.next', '__tests__']);
  const dateien = [];
  async function walk(dir) {
    let eintraege = [];
    try { eintraege = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of eintraege) {
      const voll = path.join(dir, e.name);
      if (e.isDirectory()) { if (!SKIP.has(e.name)) await walk(voll); } else if (/\.(?:tsx?|css)$/.test(e.name) && !/\.(?:test|spec)\.tsx?$/.test(e.name)) dateien.push(voll);
    }
  }
  for (const d of SCAN) await walk(path.join(REPO, d));
  dateien.sort();
  const quellen = [];
  for (const f of dateien) {
    const text = await fs.readFile(f, 'utf8');
    quellen.push({ datei: path.relative(REPO, f).split(path.sep).join('/'), text, zeilen: text.split('\n') });
  }
  const istTsx = (q) => /\.tsx?$/.test(q.datei);
  const istCss = (q) => q.datei.endsWith('.css');
  const istTheme = (q) => q.datei === 'app/styles/theme.css';
  const nurKommentar = (z) => /^\s*(?:\/\/|\/\*|\*|\{\/\*|<!--)/.test(z);
  const kurz = (z, n = 170) => z.trim().replace(/\s+/g, ' ').slice(0, n);
  const zeileVon = (text, index) => text.slice(0, index).split('\n').length;
  const code = {};

  // ── S-01 ──
  {
    const re = new RegExp(S01_RE_QUELLE, 'gi');
    const technisch = /(?:\bplaceholder\s*=|\bplaceholder\??\s*:|placeholder:|::placeholder|\.placeholder\b|placeholder-|\bplaceholder\b\s*[,}]|\{\s*placeholder\b)/i;
    const treffer = [];
    for (const q of quellen) {
      q.zeilen.forEach((z, i) => {
        const ms = [...z.matchAll(re)];
        if (!ms.length) return;
        const proMuster = {};
        for (const m of ms) proMuster[m[0].toLowerCase()] = (proMuster[m[0].toLowerCase()] || 0) + 1;
        for (const [w, n] of Object.entries(proMuster)) {
          const art = w === 'placeholder' && technisch.test(z) ? 'platzhalter-attribut' : 'text-oder-name';
          treffer.push({ datei: q.datei, zeile: i + 1, muster: w, art, anzahlInZeile: n, kommentar: nurKommentar(z), text: kurz(z) });
        }
      });
    }
    code['S-01'] = {
      regel: `Muster ${S01_RE_QUELLE} (ohne Beachtung der Groß-/Kleinschreibung)`,
      treffer: treffer.length,
      zaehlweise: 'ein Treffer je Zeile und Muster',
      davonPlatzhalterAttribut: treffer.filter((t) => t.art === 'platzhalter-attribut').length,
      davonUebrige: treffer.filter((t) => t.art !== 'platzhalter-attribut').length,
      davonKommentar: treffer.filter((t) => t.kommentar).length,
      nachMuster: Object.fromEntries(Object.entries(treffer.reduce((m, t) => ({ ...m, [t.muster]: (m[t.muster] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1])),
      fundstellen: treffer,
      anmerkung: '„platzhalter-attribut“ = HTML-/Props-/Tailwind-Verwendung des Wortes placeholder; der Inhalt steht in `text` und ist zu prüfen. Erfundene Zahlen, Stimmen oder Auszeichnungen sind per Muster nicht erkennbar (Handprüfung gegen Quellen).',
    };
  }

  // ── S-04 ──
  {
    const iconLibs = /^(?:lucide-react|lucide|react-icons(?:\/.*)?|@heroicons\/.*|@radix-ui\/react-icons|@phosphor-icons\/.*|@tabler\/icons(?:-react)?|@fortawesome\/.*|@iconify\/.*|iconoir-react|feather-icons|react-feather|remixicon|@mdi\/.*|@mui\/icons-material(?:\/.*)?|@ant-design\/icons)$/;
    const imports = [];
    const svgDateiImporte = [];
    const eigeneKomponenten = [];
    const staerken = [];
    for (const q of quellen) {
      if (!istTsx(q)) continue;
      for (const m of q.text.matchAll(/import\s+(type\s+)?([^'";]*?)\s+from\s+['"]([^'"]+)['"]/g)) {
        const quelle = m[3];
        const zeile = zeileVon(q.text, m.index);
        if (iconLibs.test(quelle)) {
          const inhalt = m[2];
          const namen = [...inhalt.matchAll(/(?:type\s+)?([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?/g)].map((x) => ({ name: x[1], lokal: x[2] ?? x[1] })).filter((x) => !['type', 'as'].includes(x.name) && x.name !== 'LucideIcon' && x.name !== 'LucideProps');
          for (const n of namen) {
            const verwendungen = (q.text.match(new RegExp(`<${n.lokal}\\b`, 'g')) || []).length + (q.text.match(new RegExp(`\\bicon\\s*[:=]\\s*\\{?\\s*${n.lokal}\\b`, 'g')) || []).length;
            imports.push({ datei: q.datei, zeile, quelle, icon: n.name, lokal: n.lokal, typOnly: !!m[1], verwendungenInDatei: verwendungen });
          }
        }
        if (/\.svg(\?.*)?$/.test(quelle)) svgDateiImporte.push({ datei: q.datei, zeile, quelle });
      }
      q.zeilen.forEach((z, i) => {
        if (nurKommentar(z)) return;
        if (/<svg\b/.test(z)) {
          let name = null;
          for (let j = i; j >= 0 && !name; j--) {
            const mm = /(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z][\w$]*)/.exec(q.zeilen[j]);
            if (mm) name = mm[1];
          }
          eigeneKomponenten.push({ datei: q.datei, zeile: i + 1, komponente: name, text: kurz(z, 120) });
        }
        for (const m of z.matchAll(/strokeWidth\s*=\s*(\{[^}]*\}|"[^"]*"|'[^']*')/g)) staerken.push({ datei: q.datei, zeile: i + 1, art: 'strokeWidth', wert: m[1].replace(/^[{"']+|[}"']+$/g, '').trim(), text: kurz(z, 120) });
        for (const m of z.matchAll(/stroke-width\s*[=:]\s*["']?([\w.{}()$ -]+)/g)) staerken.push({ datei: q.datei, zeile: i + 1, art: 'stroke-width', wert: m[1].trim(), text: kurz(z, 120) });
        if (/absoluteStrokeWidth/.test(z)) staerken.push({ datei: q.datei, zeile: i + 1, art: 'absoluteStrokeWidth', wert: 'gesetzt', text: kurz(z, 120) });
        if (/LucideProvider|IconContext|createLucideIcon/.test(z)) staerken.push({ datei: q.datei, zeile: i + 1, art: 'globale Voreinstellung', wert: kurz(z, 80), text: kurz(z, 120) });
      });
    }
    // CSS: stroke-width
    for (const q of quellen) if (istCss(q)) q.zeilen.forEach((z, i) => { for (const m of z.matchAll(/stroke-width\s*:\s*([^;]+)/g)) staerken.push({ datei: q.datei, zeile: i + 1, art: 'stroke-width (CSS)', wert: m[1].trim(), text: kurz(z, 120) }); });
    const iconNamen = [...new Set(imports.map((x) => `${x.quelle}:${x.icon}`))];
    // JSX-Marken der Icon-Komponenten: tragen sie strokeWidth? (ohne: Voreinstellung der Bibliothek)
    const tags = { gesamt: 0, mitStrokeWidth: 0, ohneStrokeWidth: [] };
    for (const q of quellen) {
      if (!istTsx(q)) continue;
      const lokale = [...new Set(imports.filter((i) => i.datei === q.datei && !i.typOnly).map((i) => i.lokal))];
      if (!lokale.length && !/<Icon\b/.test(q.text)) continue;
      const namenRe = new RegExp(`<(${[...new Set([...lokale, 'Icon'])].join('|')})(?=[\\s/>])`, 'g');
      for (const m of q.text.matchAll(namenRe)) {
        let i = m.index + m[0].length; let tiefe = 0; let ende = -1;
        for (; i < q.text.length; i++) { const ch = q.text[i]; if (ch === '{') tiefe++; else if (ch === '}') tiefe--; else if (tiefe === 0 && ch === '>') { ende = i; break; } }
        const tag = q.text.slice(m.index, ende + 1);
        tags.gesamt += 1;
        if (/strokeWidth\s*=/.test(tag)) tags.mitStrokeWidth += 1;
        else tags.ohneStrokeWidth.push({ datei: q.datei, zeile: zeileVon(q.text, m.index), icon: m[1] });
      }
    }
    // Emojis im Code (ohne typografische Zeichen)
    const emojiRe = /\p{Extended_Pictographic}/gu;
    const typografisch = (ch, nach) => /[©®™‼⁉←-⇿☀-☒✓]/u.test(ch) && !/[️]/.test(nach ?? '') && !/\p{Emoji_Presentation}/u.test(ch);
    const emojis = [];
    for (const q of quellen) {
      if (!istTsx(q)) continue;
      q.zeilen.forEach((z, i) => { for (const m of z.matchAll(emojiRe)) { const t = typografisch(m[0], z[m.index + m[0].length]); emojis.push({ datei: q.datei, zeile: i + 1, zeichen: m[0], codepoint: `U+${m[0].codePointAt(0).toString(16).toUpperCase()}`, typografisch: t, text: kurz(z, 120) }); } });
    }
    code['S-04'] = {
      regel: 'alle Icon-Importe (lucide-react u. a.), eigene SVG-Komponenten, alle strokeWidth/stroke-width-Werte, Emojis im Code',
      iconQuellen: Object.fromEntries(Object.entries(imports.reduce((m, x) => ({ ...m, [x.quelle]: (m[x.quelle] || 0) + 1 }), {}))),
      verschiedeneIcons: iconNamen.length,
      iconImporte: imports.length,
      icons: imports,
      iconTags: { gesamt: tags.gesamt, mitStrokeWidth: tags.mitStrokeWidth, ohneStrokeWidth: tags.ohneStrokeWidth.length, fundstellenOhneStrokeWidth: tags.ohneStrokeWidth },
      svgDateiImporte,
      eigeneSvgKomponenten: eigeneKomponenten,
      anzahlEigeneSvgKomponenten: eigeneKomponenten.length,
      strichstaerkenImCode: Object.fromEntries(Object.entries(staerken.reduce((m, x) => ({ ...m, [x.wert]: (m[x.wert] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1])),
      strichstaerkenFundstellen: staerken,
      emojisImCode: { harte: emojis.filter((e) => !e.typografisch).length, typografisch: emojis.filter((e) => e.typografisch).length, fundstellen: emojis },
    };
  }

  // ── S-05 ──
  {
    const eckig = [];
    const hexe = [];
    const dauerKlassen = [];
    const inlineStyles = [];
    const jsDauern = [];
    const cssFrei = [];
    const kategorieVon = (praefix, inhalt) => {
      if (/^transition$/.test(praefix) && !/\d/.test(inhalt)) return 'transition-property';
      if (/^(?:duration|delay|ease|animate|transition)/.test(praefix) || /\d+m?s\b/.test(inhalt)) return 'dauer';
      if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(|color-mix\(/.test(inhalt) || /^(?:bg|text|border|fill|stroke|ring|outline|from|via|to|decoration|caret|accent|divide)$/.test(praefix) && /#/.test(inhalt)) return 'farbe';
      if (/shadow/.test(praefix)) return 'schatten';
      if (/^rounded/.test(praefix)) return 'radius';
      if (/^(?:text|leading|tracking|font)$/.test(praefix)) return 'schrift';
      if (/^(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left|start|end|scroll-m|scroll-p|-?translate-[xy]?)$/.test(praefix)) return 'abstand';
      if (/^(?:w|h|size|min-w|min-h|max-w|max-h|basis|grid-cols|grid-rows|col|row|aspect|columns|z)$/.test(praefix)) return 'mass';
      return 'sonstiges';
    };
    const werttyp = (inhalt) => {
      if (/^var\(/.test(inhalt)) return 'var';
      if (/calc\(|min\(|max\(|clamp\(/.test(inhalt)) return 'funktion';
      if (/\d+m?s\b/.test(inhalt) && !/px|rem|em|%/.test(inhalt)) return 'zeit';
      if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(/.test(inhalt)) return 'farbe';
      if (/-?\d*\.?\d+(?:px|rem|em|vh|vw|dvh|svh|lvh|ch|ex|%|fr|pt)\b/.test(inhalt)) return 'laenge';
      if (/^-?\d*\.?\d+$/.test(inhalt)) return 'zahl';
      return 'anderes';
    };
    for (const q of quellen) {
      q.zeilen.forEach((z, i) => {
        if (nurKommentar(z)) return;
        const designAllow = /\/[/*]\s*design-allow\b/.test(z);
        if (istTsx(q)) {
          const gesehen = new Set();
          for (const m of z.matchAll(/-\[/g)) {
            const idx = m.index;
            let s = idx; while (s > 0 && !/[\s"'`{}()<>,;]/.test(z[s - 1])) s--;
            if (gesehen.has(s)) continue;
            gesehen.add(s);
            let tiefe = 0; let e = idx + 1;
            for (; e < z.length; e++) { if (z[e] === '[') tiefe++; else if (z[e] === ']') { tiefe--; if (tiefe === 0) break; } }
            let ende = e + 1; while (ende < z.length && !/[\s"'`{}<>,;]/.test(z[ende])) ende++;
            const token = z.slice(s, ende);
            // jede Klammer im Token einzeln einordnen: Variante (danach folgt ':') oder Wert
            const teile = [];
            for (const b of token.matchAll(/(-|^)\[((?:[^\[\]]|\[[^\]]*\])*)\](:?)/g)) {
              const vor = token.slice(0, b.index);
              const praefix = (vor.split(':').pop() ?? '').replace(/^!/, '').replace(/^-/, '');
              teile.push({ rolle: b[3] === ':' ? 'variante' : 'wert', praefix, inhalt: b[2] });
            }
            const werte = teile.filter((t) => t.rolle === 'wert');
            const regexVerdacht = /[$^\\]|\?:|\)\*|\+\]|^[A-Za-z0-9]-[A-Za-z0-9]/.test(token) || /(?:^|[\s=(,:])\/\^|new RegExp|\.test\(|\.match\(|\.replace\(/.test(z) || /\$\{/.test(token);
            if (regexVerdacht) { eckig.push({ datei: q.datei, zeile: i + 1, token, art: 'regex-vermutet', kategorie: 'kein Tailwind (regulärer Ausdruck oder Vorlage)', werttyp: null, designAllow }); continue; }
            const art = werte.length ? 'wert' : 'variante';
            const erstes = werte[0] ?? teile[0] ?? { praefix: '', inhalt: '' };
            eckig.push({
              datei: q.datei, zeile: i + 1, token, art,
              kategorie: werte.length ? kategorieVon(erstes.praefix, erstes.inhalt) : (/^(?:min|max)$/.test(erstes.praefix) ? 'breakpoint' : 'variante'),
              werttyp: werte.length ? werttyp(erstes.inhalt) : null,
              designAllow,
            });
          }
          // Eigenschaften in eckigen Klammern am Tokenanfang: [mask-image:…], [--x:…], [&>svg]:… (zusätzlich, nicht -[ )
          for (const m of z.matchAll(/(?<![\w\]-])\[(?:--[\w-]+|[a-z-]+):[^\]\s]+\]/g)) eckig.push({ datei: q.datei, zeile: i + 1, token: m[0], art: 'eigenschaft', kategorie: 'eigenschaft-in-klammern', werttyp: null, designAllow });
          for (const m of z.matchAll(/(?<![\w-])((?:!?-?(?:duration|delay))-(\d+))(?![\w-])/g)) dauerKlassen.push({ datei: q.datei, zeile: i + 1, klasse: m[1], designAllow });
          for (const m of z.matchAll(/(?<![\w&])#[0-9a-fA-F]{3,8}\b/g)) {
            const vor = z.slice(Math.max(0, m.index - 14), m.index);
            if (/&$/.test(vor)) continue;
            const anker = /(?:href|to|hash|anchor|scrollTo|location)[^#]{0,12}$/i.test(vor) || /^['"]#[a-z0-9-]+['"]$/i.test(z.slice(m.index - 1, m.index + m[0].length + 1));
            hexe.push({ datei: q.datei, zeile: i + 1, wert: m[0], vermutlichAnker: anker, ausnahmeKandidat: /opengraph-image|og-render|\/icon\.|apple-icon/.test(q.datei) ? 'Bildinhalt (ImageResponse)' : null, designAllow, text: kurz(z, 120) });
          }
          for (const m of z.matchAll(/\b(?:duration|delay|stagger|staggerChildren|transitionDuration|animationDuration|transitionDelay|animationDelay)\s*:\s*(?:['"`]?\d[\d.]*m?s?['"`]?)/g)) jsDauern.push({ datei: q.datei, zeile: i + 1, art: 'Eigenschaft', wert: m[0], text: kurz(z, 120) });
          for (const m of z.matchAll(/['"`](\d+(?:\.\d+)?m?s)['"`]/g)) jsDauern.push({ datei: q.datei, zeile: i + 1, art: 'Zeichenkette', wert: m[1], text: kurz(z, 120) });
          for (const m of z.matchAll(/cubic-bezier\([^)]*\)/g)) jsDauern.push({ datei: q.datei, zeile: i + 1, art: 'Kurve', wert: m[0], ausnahmeKandidat: q.datei.startsWith('lib/tokens/') ? 'Token-Spiegel von theme.css' : null, text: kurz(z, 120) });
        }
        if (istCss(q) && !istTheme(q)) {
          for (const m of z.matchAll(/(?:transition|animation)(?:-duration|-delay)?\s*:[^;]*?(?<![\w.])(\d*\.?\d+m?s)\b/g)) cssFrei.push({ datei: q.datei, zeile: i + 1, kategorie: 'dauer', wert: m[1], text: kurz(z, 120) });
          for (const m of z.matchAll(/cubic-bezier\([^)]*\)/g)) cssFrei.push({ datei: q.datei, zeile: i + 1, kategorie: 'kurve', wert: m[0], text: kurz(z, 120) });
          for (const m of z.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g)) cssFrei.push({ datei: q.datei, zeile: i + 1, kategorie: 'farbe', wert: m[0], text: kurz(z, 120) });
          for (const m of z.matchAll(/(?:^|[\s{;])(box-shadow)\s*:\s*([^;]+)/g)) if (!/^var\(|^none/.test(m[2].trim())) cssFrei.push({ datei: q.datei, zeile: i + 1, kategorie: 'schatten', wert: m[2].trim().slice(0, 60), text: kurz(z, 120) });
          for (const m of z.matchAll(/(?:^|[\s{;])(border-radius)\s*:\s*([^;]+)/g)) if (/\d/.test(m[2]) && !/var\(/.test(m[2])) cssFrei.push({ datei: q.datei, zeile: i + 1, kategorie: 'radius', wert: m[2].trim().slice(0, 40), text: kurz(z, 120) });
          for (const m of z.matchAll(/(?:^|[\s{;])(font-size)\s*:\s*([^;]+)/g)) if (!/var\(/.test(m[2])) cssFrei.push({ datei: q.datei, zeile: i + 1, kategorie: 'schrift', wert: m[2].trim().slice(0, 40), text: kurz(z, 120) });
          for (const m of z.matchAll(/(?:^|[\s{;])((?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|gap|row-gap|column-gap)\s*:\s*([^;]+)/g)) if (/\d*\.?\d+(?:px|rem|em)\b/.test(m[2]) && !/var\(/.test(m[2])) cssFrei.push({ datei: q.datei, zeile: i + 1, kategorie: 'abstand', wert: `${m[1]}: ${m[2].trim().slice(0, 40)}`, text: kurz(z, 120) });
        }
      });
      // Inline-style über Zeilen hinweg
      if (istTsx(q)) {
        for (const m of q.text.matchAll(/style=\{\{/g)) {
          const von = m.index + 'style={'.length;
          let tiefe = 0; let e = von;
          for (; e < q.text.length; e++) { if (q.text[e] === '{') tiefe++; else if (q.text[e] === '}') { tiefe--; if (tiefe === 0) break; } }
          const inhalt = q.text.slice(von, e + 1);
          const zeile = zeileVon(q.text, m.index);
          const gefunden = [];
          if (/(?<![\w.#-])-?\d*\.?\d+px\b/.test(inhalt)) gefunden.push('px');
          if (/(?<![\w.#-])\d*\.?\d+m?s\b/.test(inhalt.replace(/['"`]\s*[a-z-]+\s*['"`]/g, ''))) gefunden.push('zeit');
          if (/(?<![\w.#-])-?\d*\.?\d+(?:rem|em)\b/.test(inhalt)) gefunden.push('rem/em');
          if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(/.test(inhalt)) gefunden.push('farbe');
          if (/\b(?:width|height|top|left|right|bottom|padding\w*|margin\w*|gap|fontSize|borderRadius|zIndex|delay|duration|minHeight|maxWidth|minWidth|maxHeight)\s*:\s*-?\d/.test(inhalt)) gefunden.push('zahlenwert');
          const tokenBezug = /var\(--|TOKENS\./.test(inhalt);
          inlineStyles.push({ datei: q.datei, zeile, frei: gefunden, mitTokenBezug: tokenBezug, status: gefunden.length ? 'frei' : tokenBezug ? 'token' : 'ohne-masswerte', inhalt: kurz(inhalt, 160), ausnahmeKandidat: /opengraph-image|og-render|\/icon\.|apple-icon/.test(q.datei) ? 'Bildinhalt (ImageResponse)' : null });
        }
      }
    }
    const nachKat = (liste, f) => Object.fromEntries(Object.entries(liste.reduce((mm, x) => ({ ...mm, [f(x)]: (mm[f(x)] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]));
    const eckigWert = eckig.filter((x) => x.art === 'wert');
    code['S-05'] = {
      regel: 'Tailwind-Klassen mit -[…], Inline-style mit px/ms/Farbwerten, duration-/delay-Zahlen, Hexwerte in TSX, Dauern und Werte in CSS außerhalb von app/styles/theme.css, Dauern/Kurven in TS',
      eckigeKlammernGesamt: eckig.length,
      eckigWertklassen: eckigWert.length,
      eckigWertklassenNachKategorie: nachKat(eckigWert, (x) => x.kategorie),
      eckigWertklassenNachWerttyp: nachKat(eckigWert, (x) => x.werttyp),
      eckigTokenrelevant: eckigWert.filter((x) => ['abstand', 'farbe', 'schrift', 'schatten', 'radius', 'dauer'].includes(x.kategorie)).length,
      eckigVarianten: eckig.filter((x) => x.art === 'variante').length,
      eckigRegexVermutet: eckig.filter((x) => x.art === 'regex-vermutet').length,
      eckigEigenschaften: eckig.filter((x) => x.art === 'eigenschaft').length,
      eckigFundstellen: eckig,
      zahlDauerKlassen: dauerKlassen.length,
      zahlDauerKlassenFundstellen: dauerKlassen,
      hexwerteInTsx: hexe.length,
      hexwerteOhneAnker: hexe.filter((x) => !x.vermutlichAnker).length,
      hexwerteFundstellen: hexe,
      inlineStyleGesamt: inlineStyles.length,
      inlineStyleFrei: inlineStyles.filter((x) => x.status === 'frei').length,
      inlineStyleNachStatus: nachKat(inlineStyles, (x) => x.status),
      inlineStyleFundstellen: inlineStyles,
      jsDauernUndKurven: jsDauern.length,
      jsDauernFundstellen: jsDauern,
      cssFreieWerte: cssFrei.length,
      cssFreieWerteNachKategorie: nachKat(cssFrei, (x) => x.kategorie),
      cssFundstellen: cssFrei,
      anmerkung: 'Zählgröße für den Lint-Teil von S-05 = eckigWertklassen + zahlDauerKlassen + hexwerteOhneAnker + inlineStyleFrei + cssFreieWerte(dauer). „variante“ = eckige Klammer als Selektor (data-[…]:, aria-[…]:, [&_svg]:), kein freier Wert; min-/max-Breakpoints stehen unter kategorie „breakpoint“. Zeilen mit design-allow sind markiert, aber mitgezählt.',
    };
  }

  // ── S-07 ──
  {
    const re = new RegExp(S07_RE_QUELLE, 'gi');
    const scharf = /(?<![a-z])(?:preloader|loader-screen|intro|splash|countUp|count-up|odometer)(?![a-z])/i;
    const treffer = [];
    const kandidatRe = /<\w*(?:Intro|Preloader|Splash|CountUp|Odometer)\w*[\s/>]|(?:function|const|class)\s+(?:Intro|Preloader|Splash|CountUp|Odometer)\w*|(?:className|class)=[^>]*(?:preloader|loader-screen|splash|count-?up|odometer|\bintro\b)|data-(?:intro|splash|preloader)|id=["'](?:intro|preloader|splash)|\.(?:intro|preloader|loader-screen|splash)\s*[{,.:\[]|useCountUp|countUp\(|requestAnimationFrame/;
    for (const q of quellen) q.zeilen.forEach((z, i) => {
      const proMuster = {};
      for (const m of z.matchAll(re)) proMuster[m[0].toLowerCase()] = (proMuster[m[0].toLowerCase()] || 0) + 1;
      for (const [w, n] of Object.entries(proMuster)) {
        const ohneIntro = w !== 'intro' ;
        const einordnung = nurKommentar(z) ? 'kommentar' : ohneIntro || kandidatRe.test(z) ? 'kandidat' : 'inhaltsfeld-oder-name';
        treffer.push({ datei: q.datei, zeile: i + 1, muster: w, anzahlInZeile: n, einordnung, text: kurz(z) });
      }
    });
    void scharf;
    code['S-07'] = { regel: `Muster ${S07_RE_QUELLE}`, zaehlweise: 'ein Treffer je Zeile und Muster', treffer: treffer.length, davonKandidat: treffer.filter((t) => t.einordnung === 'kandidat').length, davonInhaltsfeldOderName: treffer.filter((t) => t.einordnung === 'inhaltsfeld-oder-name').length, davonKommentar: treffer.filter((t) => t.einordnung === 'kommentar').length, fundstellen: treffer, anmerkung: 'Einordnung per Muster, nicht per Urteil: „kandidat“ = Muster preloader/loader-screen/splash/countUp/count-up/odometer in jedem Kontext, oder intro als Komponenten-, Klassen-, id- oder Selektorname; „inhaltsfeld-oder-name“ = intro/INTRO als Datenfeld, Prop oder Bezeichner (z. B. job.intro); „kommentar“ = Kommentarzeile. Kandidaten sind Fundstellen für die Handprüfung, ob Inhalt oder Scrollen zurückgehalten wird.' };
  }

  // ── Hinweise S-02, S-03, S-06 (keine Zählung der harten Befunde, Fundstellen für die Handprüfung) ──
  {
    const s02 = [];
    const muster02 = /IntersectionObserver|animation-timeline|view-timeline|scroll-timeline|useInView|framer-motion|from ['"]motion|gsap|ScrollTrigger|data-motion|@keyframes|\banimate-[a-z]+|\buseScroll\b|whileInView/;
    const s03 = [];
    const s06lade = [];
    const s06leer = [];
    for (const q of quellen) {
      q.zeilen.forEach((z, i) => {
        if (nurKommentar(z)) return;
        if (muster02.test(z)) s02.push({ datei: q.datei, zeile: i + 1, muster: muster02.exec(z)[0], text: kurz(z, 130) });
        if (/group-hover:(?:block|flex|inline|opacity-100|visible)|(?<![\w-])hover:(?:block|opacity-100|visible)\b/.test(z)) s03.push({ datei: q.datei, zeile: i + 1, art: 'hover-reveal (Verdacht: Information nur über Hover)', text: kurz(z, 130) });
        if (istTsx(q) && /<(?:a|button|span|div|abbr|img|li|p|input|label|td|th|svg|path)\b[^>]*\btitle=/.test(z)) s03.push({ datei: q.datei, zeile: i + 1, art: 'title-Attribut (Tooltip nur per Hover prüfen)', text: kurz(z, 130) });
      });
      if (istTsx(q) && /^(?:components|app)\//.test(q.datei) && !q.datei.startsWith('app/api/')) {
        const asyncZeile = q.zeilen.findIndex((z) => !nurKommentar(z) && /\bfetch\(|useTransition|useActionState|handleSubmit|onSubmit=|startTransition/.test(z));
        if (asyncZeile >= 0 && !/\bloading\b|isPending|isSubmitting|\bpending\b|aria-busy|isLoading|submitting/.test(q.text)) s06lade.push({ datei: q.datei, zeile: asyncZeile + 1, anlass: kurz(q.zeilen[asyncZeile], 80), art: 'asynchrone Aktion ohne erkennbaren Ladezustand (Heuristik)' });
        const listZeile = q.zeilen.findIndex((z) => !nurKommentar(z) && /\b(?:jobs|reviews|stations|entries|results|files|skills|applications)\.map\(/.test(z));
        if (listZeile >= 0 && !/\.length\s*(?:===|<|>|!==)\s*[01]|!\w+\.length|\.length\s*\?|empty|Empty|keine |Keine |noch keine/.test(q.text)) s06leer.push({ datei: q.datei, zeile: listZeile + 1, art: 'datengetriebene Liste ohne erkennbaren Leerzustand (Heuristik)', text: kurz(q.zeilen[listZeile], 90) });
      }
    }
    code.hinweise = {
      'S-02': { beschreibung: 'Bewegungs- und Auftrittsmechanismen im Code (Fundstellen, keine Zählung)', fundstellen: s02 },
      'S-03': { beschreibung: 'Hover-Reveal und title-Attribute (Verdacht auf Information nur über Hover)', fundstellen: s03 },
      'S-06': { beschreibung: 'Heuristik: fehlende Lade- oder Leerzustände', ladezustandVerdacht: s06lade, leerzustandVerdacht: s06leer },
    };
  }
  bericht.code = code;
  bericht.bedingungen.code = { dateien: quellen.length, verzeichnisse: SCAN, ausgeschlossen: ['__tests__', '*.test.ts(x)', '*.spec.ts(x)', 'node_modules', '.next'], erweiterungen: ['.ts', '.tsx', '.css'], kommentarzeilen: 'Zeilen, die mit //, /*, * oder {/* beginnen, werden bei S-04/S-05/Hinweisen übersprungen, bei S-01 und S-07 mitgezählt und markiert' };
  process.stdout.write(`Code-Scan: ${quellen.length} Dateien · S-01 ${code['S-01'].treffer} · S-04 Icons ${code['S-04'].iconImporte} · S-05 eckig(Wert) ${code['S-05'].eckigWertklassen} · S-07 ${code['S-07'].treffer}\n`);
}

// ═════════════════════════════ Teil B: Rendern ═════════════════════════════
if (teile.includes('render')) {
  // ── Token aus theme.css ──
  const themeText = await fs.readFile(path.join(REPO, 'app/styles/theme.css'), 'utf8');
  const hexListe = [...new Set([...themeText.matchAll(/#([0-9a-fA-F]{6})\b/g)].map((m) => m[1].toLowerCase()))];
  const farbenRgb = hexListe.map((h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]);
  const radienPx = [0, ...[...themeText.matchAll(/--radius-(?!\*)[\w]+:\s*([\d.]+)px/g)].map((m) => Number(m[1]))];
  const radiusVoll = /--radius-full:\s*9999px/.test(themeText);
  const schattenToken = [...themeText.matchAll(/--shadow-(?!\*)(\w+):\s*([^;]+);/g)].map((m) => ({ name: m[1], wert: m[2].trim() }));
  const dauernS = [0, ...[...themeText.matchAll(/--transition-duration-(\w+):\s*(\d+)ms/g)].map((m) => Number(m[2]) / 1000)];
  const schriftTokens = [...themeText.matchAll(/^\s*--text-([a-z]+(?:-\d)?):\s*([^;]+);/gm)].map((m) => ({ name: m[1], wert: m[2].trim() }));
  const PX = 16;
  function auswerten(ausdruck, vwPx) {
    // Summe von Termen "<zahl><einheit>" mit + und -
    let summe = 0;
    let vorzeichen = 1;
    for (const roh of ausdruck.replace(/\s+/g, ' ').trim().split(' ')) {
      if (roh === '+') { vorzeichen = 1; continue; }
      if (roh === '-') { vorzeichen = -1; continue; }
      const m = /^(-?[\d.]+)(rem|px|vw|em)$/.exec(roh);
      if (!m) return NaN;
      const n = Number(m[1]);
      summe += vorzeichen * (m[2] === 'rem' || m[2] === 'em' ? n * PX : m[2] === 'px' ? n : (n * vwPx) / 100);
      vorzeichen = 1;
    }
    return summe;
  }
  function schriftgroessen(vwPx) {
    return schriftTokens.map((t) => {
      const c = /^clamp\((.*)\)$/.exec(t.wert);
      if (!c) return { name: t.name, px: auswerten(t.wert, vwPx) };
      const teile = [];
      let tiefe = 0; let akt = '';
      for (const ch of c[1]) { if (ch === '(') tiefe++; if (ch === ')') tiefe--; if (ch === ',' && tiefe === 0) { teile.push(akt); akt = ''; } else akt += ch; }
      teile.push(akt);
      const [mn, mid, mx] = teile.map((x) => auswerten(x, vwPx));
      return { name: t.name, px: Math.min(Math.max(mid, mn), mx) };
    });
  }
  bericht.bedingungen.token = { quelle: 'app/styles/theme.css', farbenHex: hexListe.length, radienPx, radiusFull: radiusVoll, schatten: schattenToken.map((s) => s.name), dauernS, schriftgroessen: schriftTokens.map((t) => t.name) };

  // ── Initialskript (Hilfsfunktion + Animationsabtaster für S-02) ──
  const initSkript = () => {
    const W = (window.__slop = { gescrollt: false, anims: [], gesehen: new WeakSet() });
    W.pfad = (el) => {
      const teile = [];
      let n = el;
      while (n && n.nodeType === 1 && teile.length < 5 && n !== document.body) {
        let t = n.tagName.toLowerCase();
        if (n.id && !/^[:_]/.test(n.id)) { teile.unshift(`${t}#${n.id}`); break; }
        const cls = typeof n.className === 'string' ? n.className : n.className?.baseVal || '';
        const erste = cls.split(/\s+/).filter((c) => c && !/[:[\]/%()]/.test(c)).slice(0, 2).join('.');
        if (erste) t += `.${erste}`;
        const sib = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [];
        if (sib.length > 1) t += `:nth-of-type(${sib.indexOf(n) + 1})`;
        teile.unshift(t);
        n = n.parentElement;
      }
      return teile.join(' > ');
    };
    W.maxY = 0;
    addEventListener('scroll', () => { W.gescrollt = true; W.maxY = Math.max(W.maxY, scrollY); }, { passive: true, capture: true });
    const tick = () => {
      try {
        for (const a of document.getAnimations()) {
          if (W.gesehen.has(a)) continue;
          W.gesehen.add(a);
          const eff = a.effect;
          const ziel = eff?.target ?? null;
          let props = [];
          try { props = [...new Set(eff.getKeyframes().flatMap((k) => Object.keys(k)))].filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)); } catch { /* ignorieren */ }
          let t = {};
          try { t = eff.getComputedTiming(); } catch { /* ignorieren */ }
          W.anims.push({ nachScroll: W.gescrollt, scrollY: Math.round(scrollY), typ: a.constructor.name, name: a.animationName ?? a.transitionProperty ?? null, props, dauerMs: typeof t.duration === 'number' ? Math.round(t.duration) : null, endlos: t.iterations === Infinity, zeitleiste: a.timeline && a.timeline.constructor.name !== 'DocumentTimeline' ? a.timeline.constructor.name : 'document', el: ziel });
        }
      } catch { /* ignorieren */ }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // ── S-02: Abschnitte und Vorzustand ──
  const abschnitteErfassen = () => {
    const W = window.__slop;
    const main = document.querySelector('main') ?? document.body;
    let abschnitte = [...main.querySelectorAll('section')].filter((s) => !s.parentElement.closest('section'));
    let art = 'section';
    if (!abschnitte.length) { abschnitte = [...main.children].filter((c) => !['SCRIPT', 'STYLE'].includes(c.tagName)); art = 'main-kinder'; }
    W.abschnitte = abschnitte;
    const zustand = new Map();
    const alle = [...main.querySelectorAll('*')];
    alle.forEach((el, i) => {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const cs = getComputedStyle(el);
      zustand.set(i, { el, opacity: parseFloat(cs.opacity), transform: cs.transform, translate: cs.translate, scale: cs.scale, rotate: cs.rotate, ausserhalb: r.top >= innerHeight, filter: cs.filter, clip: cs.clipPath, vis: cs.visibility });
    });
    W.vorher = { zustand, alle, art };
    return { art, anzahl: abschnitte.length };
  };
  const abschnitteAuswerten = () => {
    const W = window.__slop;
    const { zustand, alle } = W.vorher;
    const abschnitte = W.abschnitte;
    const sektionVon = (el) => abschnitte.findIndex((s) => s === el || s.contains(el));
    const ergebnis = abschnitte.map((s, i) => ({ index: i, fundstelle: W.pfad(s), id: s.id || null, ueberschrift: (s.querySelector('h1,h2,h3')?.textContent || '').trim().slice(0, 50), animationenNachScroll: [], zustandswechsel: [], ruheStatisch: 0 }));
    for (const a of W.anims) {
      if (!a.el || !a.nachScroll) continue;
      const i = sektionVon(a.el);
      if (i < 0) continue;
      const relevant = a.props.some((p) => /^(opacity|transform|translate|scale|rotate|clipPath|clip-path|filter|visibility)$/.test(p)) || a.zeitleiste !== 'document';
      if (!relevant) continue;
      ergebnis[i].animationenNachScroll.push({ ziel: W.pfad(a.el), typ: a.typ, name: a.name, props: a.props, dauerMs: a.dauerMs, endlos: a.endlos, zeitleiste: a.zeitleiste, scrollY: a.scrollY });
    }
    // scroll-gebundene Animationen, die schon vor dem ersten Scrollereignis liefen, zählen ebenfalls
    for (const a of W.anims) {
      if (!a.el || a.nachScroll || a.zeitleiste === 'document') continue;
      const i = sektionVon(a.el);
      if (i >= 0) ergebnis[i].animationenNachScroll.push({ ziel: W.pfad(a.el), typ: a.typ, name: a.name, props: a.props, dauerMs: a.dauerMs, endlos: a.endlos, zeitleiste: a.zeitleiste, scrollY: a.scrollY });
    }
    let ruheOhneWechsel = 0;
    alle.forEach((el, i) => {
      const v = zustand.get(i);
      if (!v) return;
      const cs = getComputedStyle(el);
      const jetzt = { opacity: parseFloat(cs.opacity), transform: cs.transform, translate: cs.translate, scale: cs.scale, rotate: cs.rotate };
      const vorzustand = v.opacity < 1 || v.transform !== 'none' || (v.translate && v.translate !== 'none') || (v.scale && v.scale !== 'none') || (v.rotate && v.rotate !== 'none');
      if (!v.ausserhalb || !vorzustand) return;
      const gewechselt = jetzt.opacity !== v.opacity || jetzt.transform !== v.transform || jetzt.translate !== v.translate || jetzt.scale !== v.scale || jetzt.rotate !== v.rotate;
      const si = sektionVon(el);
      if (si < 0) return;
      if (gewechselt) ergebnis[si].zustandswechsel.push({ ziel: W.pfad(el), vorher: { opacity: v.opacity, transform: v.transform }, nachher: { opacity: jetzt.opacity, transform: jetzt.transform } });
      else { ergebnis[si].ruheStatisch += 1; ruheOhneWechsel += 1; }
    });
    for (const e of ergebnis) {
      e.mitAuftritt = e.animationenNachScroll.length > 0 || e.zustandswechsel.length > 0;
      e.animationenNachScroll = e.animationenNachScroll.slice(0, 6);
      e.zustandswechsel = e.zustandswechsel.slice(0, 6);
    }
    const alleAnims = W.anims.map((a) => ({ nachScroll: a.nachScroll, typ: a.typ, name: a.name, props: a.props, endlos: a.endlos, ziel: a.el ? W.pfad(a.el) : null, imMain: a.el ? !!a.el.closest('main') : null }));
    return { abschnitte: ergebnis, ruheOhneWechsel, animationenGesamt: alleAnims.length, animationenNachScrollGesamt: alleAnims.filter((a) => a.nachScroll).length, animationenListe: alleAnims.slice(0, 40) };
  };

  // ── Hauptmessung im Browser (S-01, S-04, S-05, S-06) ──
  const messeSeite = (opt) => {
    const W = window.__slop;
    const pfad = W.pfad;
    const sichtbar = (el) => { try { return el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true }); } catch { return getComputedStyle(el).display !== 'none'; } };
    const out = {};
    // S-01 / S-04 Text
    {
      const re = new RegExp(opt.s01, 'gi');
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const treffer = []; const emojis = []; const zahlen = [];
      const emojiRe = /\p{Extended_Pictographic}/gu;
      const typografisch = (ch, nach) => /[©®™‼⁉←-⇿☀-☒✓]/u.test(ch) && nach !== '️' && !/\p{Emoji_Presentation}/u.test(ch);
      const zahlRe = /\d[\d.,]*\s?(?:%|\+|€|Euro|Jahre[n]?|Tage[n]?|Std\.?|Stunden|Mitarbeit\w*|Kunden|Bewertungen|Sterne|km|Minuten|Min\.?|Sek\.?|Uhr|Mio\.?)/g;
      let knoten = 0;
      while (walker.nextNode()) {
        const n = walker.currentNode; const el = n.parentElement;
        if (!el || el.closest('script,style,noscript,template')) continue;
        const t = n.nodeValue;
        if (!t.trim() || !sichtbar(el)) continue;
        knoten += 1;
        const nurSr = !!el.closest('.sr-only');
        for (const m of t.matchAll(re)) treffer.push({ muster: m[0].toLowerCase(), fundstelle: pfad(el), nurScreenreader: nurSr, kontext: t.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).trim() });
        for (const m of t.matchAll(emojiRe)) emojis.push({ zeichen: m[0], codepoint: `U+${m[0].codePointAt(0).toString(16).toUpperCase()}`, typografisch: typografisch(m[0], t[m.index + m[0].length]), fundstelle: pfad(el), kontext: t.slice(Math.max(0, m.index - 20), m.index + 20).trim() });
        if (zahlen.length < 60) for (const m of t.matchAll(zahlRe)) zahlen.push({ text: m[0].trim(), fundstelle: pfad(el), kontext: t.slice(Math.max(0, m.index - 25), m.index + m[0].length + 25).trim() });
      }
      const felder = [];
      for (const el of document.querySelectorAll('input[placeholder],textarea[placeholder]')) {
        if (!sichtbar(el)) continue;
        const v = el.getAttribute('placeholder');
        felder.push({ fundstelle: pfad(el), wert: v, musterTreffer: [...v.matchAll(re)].map((m) => m[0].toLowerCase()).filter((w) => w !== 'placeholder') });
      }
      out.s01 = { sichtbareTextknoten: knoten, treffer, feldPlatzhalter: felder, feldPlatzhalterMitMuster: felder.filter((f) => f.musterTreffer.length).length, zahlenInventar: zahlen.slice(0, 60) };
      out.s04emoji = { gesamt: emojis.length, hart: emojis.filter((e) => !e.typografisch).length, typografisch: emojis.filter((e) => e.typografisch).length, liste: emojis.slice(0, 40) };
    }
    // S-04 inline-SVG
    {
      const svgs = [...document.querySelectorAll('svg')].filter((s) => sichtbar(s) && s.getBoundingClientRect().width > 0);
      const attr = new Map(); const ber = new Map(); const eff = new Map();
      let lucide = 0; let eigen = 0;
      for (const s of svgs) {
        const cls = (s.getAttribute('class') || '').split(/\s+/);
        if (cls.some((c) => c === 'lucide' || c.startsWith('lucide-'))) lucide += 1; else eigen += 1;
        const vb = (s.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
        const skala = vb.length === 4 && vb[2] > 0 ? s.getBoundingClientRect().width / vb[2] : 1;
        const istIcon = vb.length === 4 && Math.max(vb[2], vb[3]) <= 32;
        for (const el of [s, ...s.querySelectorAll('*')]) {
          const a = el.getAttribute('stroke-width');
          if (a != null) { const k = a.trim(); if (!attr.has(k)) attr.set(k, { anzahl: 0, beispiel: pfad(s) }); attr.get(k).anzahl += 1; }
          const tag = el.tagName.toLowerCase();
          if (['title', 'desc', 'defs', 'style', 'g', 'svg', 'use', 'symbol', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'filter'].includes(tag)) continue;
          const cs = getComputedStyle(el);
          if (cs.stroke && cs.stroke !== 'none') {
            const w = parseFloat(cs.strokeWidth);
            if (!Number.isNaN(w)) {
              const kb = String(w); if (!ber.has(kb)) ber.set(kb, { anzahl: 0, beispiel: pfad(s), icon: istIcon }); ber.get(kb).anzahl += 1;
              const px = Math.round((cs.vectorEffect === 'non-scaling-stroke' ? w : w * skala) * 100) / 100;
              const ke = String(px); if (!eff.has(ke)) eff.set(ke, { anzahl: 0, beispiel: pfad(s) }); eff.get(ke).anzahl += 1;
            }
          }
        }
      }
      const obj = (m) => Object.fromEntries([...m.entries()].map(([k, v]) => [k, v]));
      out.s04svg = { svgSichtbar: svgs.length, lucide, eigen, strichAttribut: obj(attr), strichBerechnet: obj(ber), strichEffektivPx: obj(eff), anzahlBerechnet: ber.size, anzahlEffektivPx: eff.size, anzahlBerechnetNurIcons: new Set([...ber.entries()].filter(([, v]) => v.icon).map(([k]) => k)).size };
    }
    // S-05 getComputedStyle
    {
      const toRgb = (s) => {
        s = (s || '').trim();
        let m;
        if ((m = /^rgba?\(([^)]+)\)$/.exec(s))) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); return { rgb: p.slice(0, 3), a: p[3] ?? 1 }; }
        if ((m = /^color\(srgb\s+([^)]+)\)$/.exec(s))) { const p = m[1].split(/[\s/]+/).filter(Boolean).map(parseFloat); return { rgb: [p[0] * 255, p[1] * 255, p[2] * 255], a: p[3] ?? 1 }; }
        const lin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
        const okToSrgb = (L, A, B) => {
          const l_ = L + 0.3963377774 * A + 0.2158037573 * B; const m_ = L - 0.1055613458 * A - 0.0638541728 * B; const s_ = L - 0.0894841775 * A - 1.291485548 * B;
          const l = l_ ** 3; const mm = m_ ** 3; const ss = s_ ** 3;
          return [lin(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * ss), lin(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * ss), lin(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * ss)].map((c) => Math.min(1, Math.max(0, c)) * 255);
        };
        const zahl = (t, proz) => (String(t).endsWith('%') ? parseFloat(t) / 100 * proz : parseFloat(t));
        if ((m = /^oklab\(([^)]+)\)$/.exec(s))) { const p = m[1].split(/[\s/]+/).filter(Boolean); return { rgb: okToSrgb(zahl(p[0], 1), zahl(p[1], 0.4), zahl(p[2], 0.4)), a: p[3] != null ? zahl(p[3], 1) : 1 }; }
        if ((m = /^oklch\(([^)]+)\)$/.exec(s))) { const p = m[1].split(/[\s/]+/).filter(Boolean); const L = zahl(p[0], 1); const C = zahl(p[1], 0.4); const h = (parseFloat(p[2]) * Math.PI) / 180; return { rgb: okToSrgb(L, C * Math.cos(h), C * Math.sin(h)), a: p[3] != null ? zahl(p[3], 1) : 1 }; }
        return null;
      };
      const farbeErlaubt = (s) => {
        const c = toRgb(s);
        if (!c) return { ok: null, wert: s };
        if (c.a === 0) return { ok: true };
        const ok = opt.farben.some((t) => Math.abs(t[0] - c.rgb[0]) <= 3 && Math.abs(t[1] - c.rgb[1]) <= 3 && Math.abs(t[2] - c.rgb[2]) <= 3);
        return { ok, wert: `rgb(${c.rgb.map((x) => Math.round(x)).join(', ')})${c.a < 1 ? ` /${Math.round(c.a * 100) / 100}` : ''}` };
      };
      const probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;';
      document.body.appendChild(probe);
      const teileTopLevel = (v) => { const r = []; let t = 0; let a = ''; for (const ch of v) { if (ch === '(') t++; if (ch === ')') t--; if (ch === ',' && t === 0) { r.push(a.trim()); a = ''; } else a += ch; } if (a.trim()) r.push(a.trim()); return r; };
      const normSchatten = (v) => {
        if (!v || v === 'none') return 'none';
        const l = teileTopLevel(v).filter((e) => {
          const farbeAlpha0 = /rgba\(\s*0,\s*0,\s*0,\s*0\)|transparent/.test(e);
          const nullen = /(?:^|\s)0px\s+0px\s+0px\s+0px(?:\s|$)/.test(e.replace(/^(?:rgba?\([^)]*\)|color\([^)]*\)|oklab\([^)]*\))\s*/, '')) || /^\s*0px\s+0px\s+0px\s+0px/.test(e);
          return !(farbeAlpha0 || nullen);
        });
        return l.length ? l.join(', ') : 'none';
      };
      const schattenErlaubt = new Set(['none']);
      for (const t of opt.schatten) { probe.style.boxShadow = t.wert; schattenErlaubt.add(normSchatten(getComputedStyle(probe).boxShadow)); }
      probe.remove();
      const schriften = opt.schriften;
      const dauerErlaubt = (v) => v.split(',').map((x) => x.trim()).every((x) => { const n = x.endsWith('ms') ? parseFloat(x) / 1000 : parseFloat(x); return opt.dauern.some((d) => Math.abs(d - n) < 0.0015); });
      const radiusErlaubt = (v) => {
        const erste = v.split(' ')[0];
        if (erste.endsWith('%')) return { ok: false, wert: v };
        const px = parseFloat(erste);
        if (px >= 1000) return { ok: opt.radiusVoll, wert: 'full' };
        return { ok: opt.radien.some((r) => Math.abs(r - px) < 0.5), wert: `${px}px` };
      };
      const alle = [...document.body.querySelectorAll('*')].filter((el) => {
        if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return false;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(el.tagName)) return false;
        return sichtbar(el);
      });
      const eigenschaften = ['schriftgroesse', 'radius', 'schatten', 'farbe', 'hintergrund', 'dauer'];
      const messe = (el) => {
        const cs = getComputedStyle(el);
        const r = {};
        const fs = parseFloat(cs.fontSize);
        r.schriftgroesse = { wert: `${Math.round(fs * 100) / 100}px`, ok: schriften.some((s) => Math.abs(s - fs) <= 0.3) };
        const rad = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map((k) => radiusErlaubt(cs[k]));
        const schlecht = rad.find((x) => !x.ok);
        r.radius = { wert: (schlecht ?? rad[0]).wert, ok: !schlecht };
        const sh = normSchatten(cs.boxShadow);
        r.schatten = { wert: sh.length > 90 ? `${sh.slice(0, 90)}…` : sh, ok: schattenErlaubt.has(sh) };
        const fa = farbeErlaubt(cs.color); r.farbe = { wert: fa.wert ?? 'token', ok: fa.ok };
        const ba = farbeErlaubt(cs.backgroundColor); r.hintergrund = { wert: ba.wert ?? 'token', ok: ba.ok };
        r.dauer = { wert: cs.transitionDuration, ok: dauerErlaubt(cs.transitionDuration) };
        return r;
      };
      const zaehler = Object.fromEntries(eigenschaften.map((e) => [e, { gemessen: 0, ausserhalb: 0, nichtAuswertbar: 0, werte: {} }]));
      const messungen = alle.map((el) => ({ el, m: messe(el) }));
      for (const { el, m } of messungen) {
        for (const e of eigenschaften) {
          const z = zaehler[e]; z.gemessen += 1;
          if (m[e].ok === null) { z.nichtAuswertbar += 1; continue; }
          if (m[e].ok === false) {
            z.ausserhalb += 1;
            const w = z.werte[m[e].wert] ?? (z.werte[m[e].wert] = { anzahl: 0, beispiele: [] });
            w.anzahl += 1;
            if (w.beispiele.length < 3) w.beispiele.push(pfad(el));
          }
        }
      }
      const N = opt.stichprobe;
      const schritt = Math.max(1, Math.floor(messungen.length / N));
      const stichprobe = [];
      for (let i = 0; i < messungen.length && stichprobe.length < N; i += schritt) {
        const { el, m } = messungen[i];
        stichprobe.push({ fundstelle: pfad(el), werte: Object.fromEntries(eigenschaften.map((e) => [e, m[e].wert])), abweichungen: eigenschaften.filter((e) => m[e].ok === false) });
      }
      const sortiere = (werte) => Object.fromEntries(Object.entries(werte).sort((a, b) => b[1].anzahl - a[1].anzahl).slice(0, 25));
      for (const e of eigenschaften) zaehler[e].werte = sortiere(zaehler[e].werte);
      out.s05 = {
        elementeGemessen: messungen.length,
        volltext: zaehler,
        stichprobe: { groesse: stichprobe.length, schritt, elementeMitAbweichung: stichprobe.filter((s) => s.abweichungen.length).length, abweichungenJeEigenschaft: Object.fromEntries(eigenschaften.map((e) => [e, stichprobe.filter((s) => s.abweichungen.includes(e)).length])), elemente: stichprobe },
        basisSchriftPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
      };
    }
    // S-06 Zustände per CSSOM
    {
      const regeln = [];
      const gehe = (liste, eltern) => {
        for (const r of liste) {
          if (r.constructor.name === 'CSSStyleRule') {
            let sel = r.selectorText;
            if (eltern) sel = sel.includes('&') ? sel.replaceAll('&', `:is(${eltern})`) : `:is(${eltern}) ${sel}`;
            if (/:hover|:focus-visible|:focus\b|aria-invalid/.test(sel)) regeln.push({ sel, hat: r.style.length > 0 });
            if (r.cssRules?.length) gehe(r.cssRules, sel);
          } else if (r.cssRules) gehe(r.cssRules, eltern);
        }
      };
      let blockiert = 0;
      for (const sheet of document.styleSheets) { try { gehe(sheet.cssRules, null); } catch { blockiert += 1; } }
      const entferne = (sel, re) => {
        // Selektorliste auf oberster Ebene teilen, Pseudoklasse und ::before/::after entfernen, leere Reste durch * ersetzen
        const teile = []; let t = 0; let a = '';
        for (const ch of sel) { if (ch === '(' || ch === '[') t++; if (ch === ')' || ch === ']') t--; if (ch === ',' && t === 0) { teile.push(a); a = ''; } else a += ch; }
        teile.push(a);
        return teile.map((x) => { let r = x.replace(re, '').replace(/::(?:before|after)\b/g, '').trim(); if (!r || /[>+~]$/.test(r)) r += '*'; return r; }).join(', ');
      };
      const bereit = (re, ersatz, nurHas = false) => regeln
        .filter((r) => re.test(r.sel) && r.hat && !/::(?!before|after)/.test(r.sel) && !/:not\([^)]*(?::hover|:focus-visible)/.test(r.sel) && (/:has\([^)]*:focus-visible/.test(r.sel) === nurHas))
        .map((r) => entferne(r.sel, ersatz));
      const hoverSel = bereit(/:hover/, /:hover/g);
      const fokusSel = bereit(/:focus-visible/, /:focus-visible/g);
      const fokusHasSel = bereit(/:focus-visible/, /:has\(:focus-visible\)/g, true);
      const fokusAltSel = bereit(/:focus(?![-\w])/, /:focus(?![-\w])/g);
      const invalidSel = bereit(/aria-invalid/, /\[aria-invalid(?:=["']?true["']?)?\]/g);
      const passt = (el, liste) => { for (const s of liste) { try { if (el.matches(s)) return true; } catch { /* ungültiger Selektor */ } } return false; };
      const ziele = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],[role=menuitem],[role=switch],[tabindex]:not([tabindex="-1"])')].filter((el) => sichtbar(el) && (el.getBoundingClientRect().width > 0 || el.classList.contains('sr-only') || el.matches('a[href^="#"]')));
      const liste = [];
      for (const el of ziele) {
        const tag = el.tagName.toLowerCase();
        const typ = tag === 'a' ? 'link' : tag === 'button' || el.getAttribute('role') === 'button' || (tag === 'input' && ['submit', 'button', 'reset'].includes(el.type)) ? 'knopf' : ['input', 'select', 'textarea'].includes(tag) ? 'feld' : 'sonstiges';
        const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || el.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
        const eintrag = { fundstelle: pfad(el), typ, tag, name, hover: passt(el, hoverSel), fokusVisible: passt(el, fokusSel) || fokusHasSel.some((sl) => { try { return !!el.closest(sl); } catch { return false; } }), fokusNurFocus: passt(el, fokusAltSel), deaktiviert: el.disabled === true || el.getAttribute('aria-disabled') === 'true' };
        if (typ === 'feld' && !['checkbox', 'radio', 'submit', 'button', 'reset', 'image', 'file', 'range', 'color'].includes(el.type ?? '')) eintrag.fehlerstil = passt(el, invalidSel);
        if (typ === 'feld' && ['checkbox', 'radio'].includes(el.type)) eintrag.fehlerstil = passt(el, invalidSel);
        liste.push(eintrag);
      }
      const nach = (t) => liste.filter((x) => x.typ === t);
      const bilanz = (l) => ({ gesamt: l.length, ohneHover: l.filter((x) => !x.hover).length, ohneFokusVisible: l.filter((x) => !x.fokusVisible).length, ohneHoverUndOhneFokus: l.filter((x) => !x.hover && !x.fokusVisible).length });
      const felder = liste.filter((x) => 'fehlerstil' in x);
      out.s06 = { regelnGelesen: regeln.length, hoverRegeln: hoverSel.length, fokusRegeln: fokusSel.length + fokusHasSel.length, invalidRegeln: invalidSel.length, stylesheetsBlockiert: blockiert, elemente: liste.length, link: bilanz(nach('link')), knopf: bilanz(nach('knopf')), feld: { ...bilanz(nach('feld')), mitFehlerstilPruefung: felder.length, ohneFehlerstil: felder.filter((x) => !x.fehlerstil).length }, sonstiges: bilanz(nach('sonstiges')), ohneHover: liste.filter((x) => !x.hover).slice(0, 80), ohneFokusVisible: liste.filter((x) => !x.fokusVisible).slice(0, 80), felderOhneFehlerstil: felder.filter((x) => !x.fehlerstil) };
    }
    return out;
  };

  const dclPruefung = () => {
    const pfad = (el) => (window.__slop ? window.__slop.pfad(el) : el.tagName.toLowerCase());
    const h1 = document.querySelector('h1');
    let h1Info = null;
    if (h1) {
      const r = h1.getBoundingClientRect();
      let deckkraft = 1;
      for (let n = h1; n && n.nodeType === 1; n = n.parentElement) deckkraft *= parseFloat(getComputedStyle(n).opacity);
      const cs = getComputedStyle(h1);
      h1Info = { text: h1.textContent.trim().slice(0, 60), deckkraft: Math.round(deckkraft * 1000) / 1000, visibility: cs.visibility, display: cs.display, imErstenBildschirm: r.width > 0 && r.top < innerHeight && r.bottom > 0, oben: Math.round(r.top), transform: cs.transform };
    }
    const de = getComputedStyle(document.documentElement); const bo = getComputedStyle(document.body);
    const hoehe = document.documentElement.scrollHeight;
    const scrollbar = hoehe > innerHeight + 1;
    let gescrollt = null;
    if (scrollbar) { const y0 = scrollY; scrollTo({ top: Math.min(200, hoehe - innerHeight), left: 0, behavior: 'instant' }); gescrollt = scrollY > y0; scrollTo({ top: y0, left: 0, behavior: 'instant' }); }
    const ueberlagerungen = [...document.querySelectorAll('body *')].filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed') return false;
      const r = el.getBoundingClientRect();
      return r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9 && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05 && cs.pointerEvents !== 'none';
    }).map((el) => ({ fundstelle: pfad(el), hintergrund: getComputedStyle(el).backgroundColor, zIndex: getComputedStyle(el).zIndex }));
    const mitte = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    const zahlen = {};
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length) continue;
      const t = (el.textContent || '').trim();
      if (/^[\d.,\s%+€]+$/.test(t) && /\d/.test(t)) zahlen[pfad(el)] = t;
    }
    return { h1: h1Info, overflow: { html: de.overflowY, body: bo.overflowY }, scrollbarNoetig: scrollbar, scrollhoehe: hoehe, scrollenMoeglich: gescrollt, vollbildUeberlagerungen: ueberlagerungen, elementInDerMitte: mitte ? pfad(mitte) : null, readyState: document.readyState, zahlen };
  };

  const browser = await launch();
  const roh = [];
  for (const p of GRUNDMENGE) {
    if (only && !only.includes(p.slug)) continue;
    for (const vp of vps) {
      const eintrag = { pfad: p.path, slug: p.slug, ansicht: vp.name, status: 0 };
      const t0 = Date.now();
      try {
        // ── S-07: 300 ms nach domcontentloaded ──
        {
          const { context } = await newContext(browser, { origin: base, viewport: vp, colorScheme: 'light', reducedMotion: 'no-preference' });
          await context.addInitScript(initSkript);
          const page = await context.newPage();
          await page.goto(base + p.path, { waitUntil: 'domcontentloaded', timeout: 45_000 });
          await page.waitForTimeout(300);
          const a = await page.evaluate(dclPruefung);
          await page.waitForTimeout(2200);
          const b = await page.evaluate(() => { const z = {}; const pf = window.__slop.pfad; for (const el of document.querySelectorAll('body *')) { if (el.children.length) continue; const t = (el.textContent || '').trim(); if (/^[\d.,\s%+€]+$/.test(t) && /\d/.test(t)) z[pf(el)] = t; } return z; });
          const zaehlerAenderung = Object.entries(a.zahlen).filter(([k, v]) => b[k] != null && b[k] !== v).map(([k, v]) => ({ fundstelle: k, bei300ms: v, bei2500ms: b[k] }));
          delete a.zahlen;
          const h1ok = a.h1 ? a.h1.deckkraft >= 0.999 && a.h1.visibility === 'visible' && a.h1.display !== 'none' && a.h1.imErstenBildschirm : null;
          eintrag.s07 = { ...a, h1SichtbarNach300ms: h1ok, scrollenOk: a.scrollbarNoetig ? a.scrollenMoeglich === true && a.overflow.body !== 'hidden' && a.overflow.html !== 'hidden' : null, zaehlerAenderungen: zaehlerAenderung };
          await context.close();
        }
        // ── Hauptlauf ──
        const { context, requestLog } = await newContext(browser, { origin: base, viewport: vp, colorScheme: 'light', reducedMotion: 'no-preference' });
        await context.addInitScript(initSkript);
        const page = await context.newPage();
        const fehler = collectErrors(page);
        const res = await page.goto(base + p.path, { waitUntil: 'networkidle', timeout: 45_000 });
        eintrag.status = res?.status() ?? 0;
        await page.evaluate(() => document.fonts?.ready);
        await page.waitForTimeout(600);
        if (args.selbsttest) {
          // S-02-Prüfkörper: jeder oberste Abschnitt in main startet beim Sichtbarwerden eine opacity-Animation (erster Bildschirm startet vor dem Scrollen und zählt nicht)
          await page.evaluate(() => {
            const main = document.querySelector('main') ?? document.body;
            const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !e.target.__st) { e.target.__st = 1; e.target.firstElementChild?.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 600 }); } }), { threshold: 0 });
            for (const sec of [...main.querySelectorAll('section')].filter((x) => !x.parentElement.closest('section'))) { sec.__st = 0; io.observe(sec); }
          });
        }
        const abschn = await page.evaluate(abschnitteErfassen);
        // Weiches Scrollen der Seite würde scrollTo des Durchlaufs verzögern und das Seitenende verfehlen: für die Messung auf sofort stellen
        await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
        await scrollThrough(page);
        await page.waitForTimeout(500);
        const abdeckung = await page.evaluate(() => ({ maxY: Math.round(window.__slop.maxY), maximal: Math.max(0, document.documentElement.scrollHeight - innerHeight) }));
        const s02 = await page.evaluate(abschnitteAuswerten);
        const mitAuftritt = s02.abschnitte.filter((x) => x.mitAuftritt).length;
        eintrag.s02 = { scrollAbdeckung: abdeckung, abschnittsart: abschn.art, abschnitte: s02.abschnitte.length, mitAuftritt, anteil: s02.abschnitte.length ? Math.round((mitAuftritt / s02.abschnitte.length) * 1000) / 1000 : null, ueberHaelfte: s02.abschnitte.length ? mitAuftritt / s02.abschnitte.length > 0.5 : null, ruheZustandOhneWechsel: s02.ruheOhneWechsel, animationenGesamt: s02.animationenGesamt, animationenNachScroll: s02.animationenNachScrollGesamt, abschnittsliste: s02.abschnitte, animationenListe: s02.animationenListe };
        await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(250);
        if (args.selbsttest) {
          // Prüfkörper mit bekannten Abweichungen: Schrift 13.5px, Radius 7px, Schatten, Farbe #123456, Hintergrund #abcdef, Dauer 300ms, Emoji, Platzhaltertext
          await page.evaluate(() => {
            const d = document.createElement('div');
            d.id = 'slop-selbsttest';
            d.setAttribute('style', 'font-size:13.5px;border-radius:7px;box-shadow:0 0 5px rgb(255,0,0);color:#123456;background-color:#abcdef;transition-duration:300ms;padding:4px');
            d.textContent = 'Lorem ipsum 🚀';
            document.body.appendChild(d);
          });
        }
        const m = await page.evaluate(messeSeite, { s01: S01_RE_QUELLE, farben: farbenRgb, radien: radienPx, radiusVoll, schatten: schattenToken, dauern: dauernS, schriften: schriftgroessen(vp.width).map((s) => s.px), stichprobe: 60 });
        eintrag.s01 = m.s01;
        eintrag.s04 = { emojis: m.s04emoji, svg: m.s04svg };
        eintrag.s05 = m.s05;
        eintrag.s05.schriftTokenPx = schriftgroessen(vp.width);
        eintrag.s06 = m.s06;
        // ── S-03: axe color-contrast ──
        try {
          const ax = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
          const knoten = ax.violations.flatMap((v) => v.nodes.map((n) => { const d = n.any?.[0]?.data ?? {}; return { ziel: n.target.join(' '), html: (n.html || '').slice(0, 110), kontrast: d.contrastRatio ?? null, erwartet: d.expectedContrastRatio ?? null, vordergrund: d.fgColor ?? null, hintergrund: d.bgColor ?? null, schriftPx: d.fontSize ?? null }; }));
          const inc = ax.incomplete.flatMap((v) => v.nodes.map((n) => ({ ziel: n.target.join(' '), grund: n.any?.[0]?.data?.messageKey ?? n.any?.[0]?.message ?? null })));
          eintrag.s03kontrast = { verletzungen: knoten.length, unklar: inc.length, bestanden: ax.passes.reduce((s, v) => s + v.nodes.length, 0), knoten: knoten.slice(0, 80), unklarListe: inc.slice(0, 30), axeVersion: ax.testEngine?.version };
        } catch (e) { eintrag.s03kontrast = { fehler: String(e?.message ?? e) }; }
        // ── S-03: sichtbarer Fokus an den ersten 15 Tab-Stopps ──
        {
          await page.evaluate(() => { document.activeElement?.blur?.(); scrollTo(0, 0); });
          await page.mouse.move(0, 0);
          const stopps = [];
          for (let i = 0; i < 15; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(220);
            const info = await page.evaluate(() => {
              const el = document.activeElement;
              if (!el || el === document.body) return null;
              const cs = getComputedStyle(el);
              const r = el.getBoundingClientRect();
              const ring = (c, ort) => ({ ort, outlineStyle: c.outlineStyle, outlineWidthPx: parseFloat(c.outlineWidth) || 0, outlineFarbe: c.outlineColor, outlineOffset: c.outlineOffset, boxShadow: c.boxShadow === 'none' ? null : c.boxShadow.slice(0, 90) });
              const kandidaten = [ring(cs, 'selbst'), ring(getComputedStyle(el, '::after'), '::after'), ring(getComputedStyle(el, '::before'), '::before')];
              let anc = el.parentElement;
              for (let i = 0; i < 3 && anc && anc !== document.body; i++, anc = anc.parentElement) if (anc.matches(':has(:focus-visible)')) kandidaten.push(ring(getComputedStyle(anc), `Vorfahr${i + 1}`));
              const gut = (k) => k.outlineStyle !== 'none' && k.outlineWidthPx >= 2;
              const treffer = kandidaten.find(gut) ?? null;
              const e = treffer ?? kandidaten[0];
              return { fundstelle: window.__slop.pfad(el), tag: el.tagName.toLowerCase(), name: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || '').trim().replace(/\s+/g, ' ').slice(0, 40), fokusVisible: el.matches(':focus-visible'), ringOrt: treffer ? treffer.ort : null, outlineStyle: e.outlineStyle, outlineWidthPx: e.outlineWidthPx, outlineFarbe: e.outlineFarbe, outlineOffset: e.outlineOffset, boxShadow: kandidaten.map((k) => k.boxShadow).find(Boolean) ?? null, imViewport: r.top < innerHeight && r.bottom > 0 && r.width > 0 };
            });
            if (!info) break;
            const outlineOk = info.fokusVisible && info.ringOrt !== null;
            stopps.push({ nr: i + 1, ...info, outlineOk, nurBoxShadow: !outlineOk && !!info.boxShadow });
          }
          eintrag.s03fokus = { geprueft: stopps.length, ringOrte: stopps.reduce((m, st) => (st.ringOrt ? { ...m, [st.ringOrt]: (m[st.ringOrt] || 0) + 1 } : m), {}), ok: stopps.filter((s) => s.outlineOk).length, nichtOk: stopps.filter((s) => !s.outlineOk).length, davonNurBoxShadow: stopps.filter((s) => s.nurBoxShadow).length, stopps };
        }
        eintrag.fehler = fehler;
        eintrag.gesperrt = requestLog.length;
        await context.close();
        eintrag.ms = Date.now() - t0;
        process.stdout.write(`${eintrag.status} ${p.slug} ${vp.name}: S-02 ${mitAuftritt}/${s02.abschnitte.length} · S-03 Kontrast ${eintrag.s03kontrast.verletzungen ?? '?'} Fokus-nicht-ok ${eintrag.s03fokus.nichtOk}/${eintrag.s03fokus.geprueft} · S-05 off ${Object.values(eintrag.s05.volltext).reduce((s, v) => s + v.ausserhalb, 0)} · S-06 ohne Hover ${eintrag.s06.ohneHover.length} · S-07 h1 ${eintrag.s07.h1SichtbarNach300ms}\n`);
      } catch (err) {
        eintrag.fehlerLauf = String(err?.stack ?? err);
        process.stdout.write(`FEHLER ${p.slug} ${vp.name}: ${err}\n`);
      }
      roh.push(eintrag);
    }
  }
  await browser.close();
  bericht.seiten = roh;
  bericht.bedingungen.render = { ansichten: vps.map((v) => v.name), farbschema: 'hell', bewegung: 'no-preference', warten: 'S-07: domcontentloaded + 300 ms; Rest: networkidle + fonts.ready + 600 ms, dann scrollThrough (mit html{scroll-behavior:auto!important}, damit das Seitenende erreicht wird; Abdeckung steht je Seite in s02.scrollAbdeckung) + 500 ms', stichprobeS05: 60, tabStopps: 15, axeRegeln: ['color-contrast'] };
}

// ═════════════════════════════ Zusammenfassung und Ausgabe ═════════════════════════════
const z = {};
const c = bericht.code;
const seiten = bericht.seiten;
const summe = (f) => seiten.reduce((s, x) => s + (f(x) ?? 0), 0);
if (c['S-01'] || seiten.length) {
  z['S-01'] = {
    code: c['S-01'] ? { treffer: c['S-01'].treffer, davonUebrige: c['S-01'].davonUebrige, davonPlatzhalterAttribut: c['S-01'].davonPlatzhalterAttribut } : null,
    gerendert: seiten.length ? { sichtbareTreffer: summe((x) => x.s01?.treffer.length), feldPlatzhalterMitMuster: summe((x) => x.s01?.feldPlatzhalterMitMuster), feldPlatzhalterGesamt: summe((x) => x.s01?.feldPlatzhalter.length) } : null,
  };
  z['S-02'] = seiten.length ? { seitenAnsichten: seiten.length, ueberHaelfte: seiten.filter((x) => x.s02?.ueberHaelfte).length, mitIrgendeinemAuftritt: seiten.filter((x) => x.s02?.mitAuftritt > 0).length, abschnitteGesamt: summe((x) => x.s02?.abschnitte), abschnitteMitAuftritt: summe((x) => x.s02?.mitAuftritt), animationenNachScroll: summe((x) => x.s02?.animationenNachScroll) } : null;
  z['S-03'] = seiten.length ? { kontrastVerletzungen: summe((x) => x.s03kontrast?.verletzungen), kontrastUnklar: summe((x) => x.s03kontrast?.unklar), fokusGeprueft: summe((x) => x.s03fokus?.geprueft), fokusNichtOk: summe((x) => x.s03fokus?.nichtOk), seitenMitFokusNichtOk: seiten.filter((x) => x.s03fokus?.nichtOk > 0).length } : null;
  z['S-04'] = {
    code: c['S-04'] ? { iconQuellen: c['S-04'].iconQuellen, verschiedeneIcons: c['S-04'].verschiedeneIcons, iconMarkenOhneStrokeWidth: c['S-04'].iconTags.ohneStrokeWidth, eigeneSvgKomponenten: c['S-04'].anzahlEigeneSvgKomponenten, strichstaerkenImCode: c['S-04'].strichstaerkenImCode, emojisImCodeHart: c['S-04'].emojisImCode.harte } : null,
    gerendert: seiten.length ? { emojisHart: summe((x) => x.s04?.emojis.hart), emojisTypografisch: summe((x) => x.s04?.emojis.typografisch), verschiedeneStrichstaerkenBerechnetMax: Math.max(0, ...seiten.map((x) => x.s04?.svg.anzahlBerechnet ?? 0)), verschiedeneStrichstaerkenNurIconsMax: Math.max(0, ...seiten.map((x) => x.s04?.svg.anzahlBerechnetNurIcons ?? 0)) } : null,
  };
  z['S-05'] = {
    code: c['S-05'] ? { eckigWertklassen: c['S-05'].eckigWertklassen, eckigTokenrelevant: c['S-05'].eckigTokenrelevant, zahlDauerKlassen: c['S-05'].zahlDauerKlassen, hexwerteOhneAnker: c['S-05'].hexwerteOhneAnker, inlineStyleFrei: c['S-05'].inlineStyleFrei, cssFreieWerte: c['S-05'].cssFreieWerte, jsDauernUndKurven: c['S-05'].jsDauernUndKurven } : null,
    gerendert: seiten.length ? Object.fromEntries(['schriftgroesse', 'radius', 'schatten', 'farbe', 'hintergrund', 'dauer'].map((e) => [e, { elementeAusserhalb: summe((x) => x.s05?.volltext[e].ausserhalb), stichprobeAbweichend: summe((x) => x.s05?.stichprobe.abweichungenJeEigenschaft[e]) }])) : null,
  };
  z['S-06'] = seiten.length ? { elemente: summe((x) => x.s06?.elemente), ohneHover: summe((x) => x.s06?.ohneHover.length), ohneFokusVisibleStil: summe((x) => x.s06?.ohneFokusVisible.length), felderOhneFehlerstil: summe((x) => x.s06?.feld.ohneFehlerstil) } : null;
  z['S-07'] = {
    code: c['S-07'] ? { treffer: c['S-07'].treffer, kandidat: c['S-07'].davonKandidat } : null,
    gerendert: seiten.length ? { h1NichtSichtbarNach300ms: seiten.filter((x) => x.s07?.h1SichtbarNach300ms === false).length, scrollenNichtMoeglich: seiten.filter((x) => x.s07?.scrollenOk === false).length, vollbildUeberlagerung: seiten.filter((x) => x.s07?.vollbildUeberlagerungen.length).length, zaehlerAenderungen: summe((x) => x.s07?.zaehlerAenderungen.length), seitenOhneH1: seiten.filter((x) => x.s07 && x.s07.h1 === null).length } : null,
  };
}
bericht.zusammenfassung = z;
// Rohdaten: Volltext ohne Kürzung
await fs.writeFile(path.join(rawDir, 'slop-hart-roh.json'), JSON.stringify(bericht));

// ── JSON für die Belege: Listen mit Fundstellen bleiben, sehr lange Rohlisten werden gekürzt ──
const beleg = JSON.parse(JSON.stringify(bericht));
for (const s of beleg.seiten) {
  if (s.s05?.stichprobe) s.s05.stichprobe.elemente = s.s05.stichprobe.elemente.filter((e) => e.abweichungen.length).concat(s.s05.stichprobe.elemente.filter((e) => !e.abweichungen.length).slice(0, 5));
}
await fs.writeFile(path.join(outDir, 'slop-hart.json'), JSON.stringify(beleg, null, 2));

// ── Markdown ──
const L = [];
const tab = (kopf, zeilen) => [`| ${kopf.join(' | ')} |`, `| ${kopf.map(() => '---').join(' | ')} |`, ...zeilen.map((r) => `| ${r.map((x) => String(x ?? '–').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`)];
const kv = (o) => (o && Object.keys(o).length ? Object.entries(o).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' · ') : '–');
const top = (liste, n, kopf, zeile, titel, leer = 'Keine.') => { L.push('', `### ${titel} (${liste.length})`, ''); if (!liste.length) { L.push(leer); return; } L.push(...tab(kopf, liste.slice(0, n).map(zeile))); if (liste.length > n) L.push('', `… ${liste.length - n} weitere in slop-hart.json`); };
L.push(`# Slop-Prüfung, harte Befunde S-01 bis S-07 · ${label}`, '', `Erstellt ${bericht.erstellt} · Basis ${base}`, '');
if (bericht.bedingungen.render) { const r = bericht.bedingungen.render; L.push(`Messbedingungen Rendern: Ansichten ${r.ansichten.join(', ')} · ${r.farbschema} · Bewegung ${r.bewegung} · ${r.warten} · Stichprobe S-05 ${r.stichprobeS05} Elemente · Tab-Stopps ${r.tabStopps} · axe-Regeln ${r.axeRegeln.join(', ')}`); }
if (bericht.bedingungen.code) { const r = bericht.bedingungen.code; L.push(`Messbedingungen Code: ${r.dateien} Dateien (${r.erweiterungen.join(', ')}) in ${r.verzeichnisse.join(', ')}; ausgeschlossen ${r.ausgeschlossen.join(', ')}.`); }
if (bericht.bedingungen.token) { const t = bericht.bedingungen.token; L.push(`Tokens aus app/styles/theme.css: ${t.farbenHex} Farbwerte · Radien ${t.radienPx.join('/')} px + full · Schatten ${t.schatten.join('/')} · Dauern ${t.dauernS.join('/')} s · Schriftstufen ${t.schriftgroessen.join('/')}`); }
L.push('', '## Zählung je S-Kennung', '');
const zeilen = [];
const Z = bericht.zusammenfassung;
zeilen.push(['S-01 Erfundenes oder Platzhalter', Z['S-01']?.code ? `${Z['S-01'].code.treffer} Treffer (davon ${Z['S-01'].code.davonUebrige} übrige, ${Z['S-01'].code.davonPlatzhalterAttribut} Platzhalter-Attribut)` : '–', Z['S-01']?.gerendert ? `${Z['S-01'].gerendert.sichtbareTreffer} sichtbare Treffer · ${Z['S-01'].gerendert.feldPlatzhalterMitMuster} Feldplatzhalter mit Muster (von ${Z['S-01'].gerendert.feldPlatzhalterGesamt})` : '–']);
zeilen.push(['S-02 Effektteppich', '–', Z['S-02'] ? `${Z['S-02'].abschnitteMitAuftritt} von ${Z['S-02'].abschnitteGesamt} Abschnitten mit Scroll-Auftritt · ${Z['S-02'].ueberHaelfte} von ${Z['S-02'].seitenAnsichten} Seitenansichten über 50 % · ${Z['S-02'].animationenNachScroll} Animationen nach Scroll` : '–']);
zeilen.push(['S-03 Unzugänglich', '–', Z['S-03'] ? `Kontrast ${Z['S-03'].kontrastVerletzungen} Verletzungen (${Z['S-03'].kontrastUnklar} unklar) · Fokus ${Z['S-03'].fokusNichtOk} von ${Z['S-03'].fokusGeprueft} Tab-Stopps ohne 2-px-Outline` : '–']);
zeilen.push(['S-04 Gemischte Bildsprache', Z['S-04']?.code ? `Quellen ${kv(Z['S-04'].code.iconQuellen)} · ${Z['S-04'].code.verschiedeneIcons} verschiedene Icons · ${Z['S-04'].code.eigeneSvgKomponenten} eigene SVG-Komponenten · Icon-Marken ohne strokeWidth ${Z['S-04'].code.iconMarkenOhneStrokeWidth} · Emojis im Code ${Z['S-04'].code.emojisImCodeHart}` : '–', Z['S-04']?.gerendert ? `Emojis ${Z['S-04'].gerendert.emojisHart} (+ ${Z['S-04'].gerendert.emojisTypografisch} typografisch) · höchstens ${Z['S-04'].gerendert.verschiedeneStrichstaerkenNurIconsMax} verschiedene Strichstärken je Seite (Icons)` : '–']);
zeilen.push(['S-05 Ungeordnete Werte', Z['S-05']?.code ? `-[ Wertklassen ${Z['S-05'].code.eckigWertklassen} (tokenrelevant ${Z['S-05'].code.eckigTokenrelevant}) · duration-/delay-Zahl ${Z['S-05'].code.zahlDauerKlassen} · Hex ${Z['S-05'].code.hexwerteOhneAnker} · Inline-style frei ${Z['S-05'].code.inlineStyleFrei} · CSS frei ${Z['S-05'].code.cssFreieWerte} · JS-Dauern/Kurven ${Z['S-05'].code.jsDauernUndKurven}` : '–', Z['S-05']?.gerendert ? Object.entries(Z['S-05'].gerendert).map(([k, v]) => `${k} ${v.elementeAusserhalb}`).join(' · ') + ' (Elemente außerhalb Token, Summe der Seitenansichten)' : '–']);
zeilen.push(['S-06 Halbe Zustände', '–', Z['S-06'] ? `${Z['S-06'].elemente} interaktive Elemente · ohne Hover-Stil ${Z['S-06'].ohneHover} · ohne :focus-visible-Stil ${Z['S-06'].ohneFokusVisibleStil} · Felder ohne aria-invalid-Stil ${Z['S-06'].felderOhneFehlerstil}` : '–']);
zeilen.push(['S-07 Blockierender Auftakt', Z['S-07']?.code ? `${Z['S-07'].code.treffer} Treffer (davon ${Z['S-07'].code.kandidat} Kandidaten)` : '–', Z['S-07']?.gerendert ? `h1 nach 300 ms nicht sichtbar ${Z['S-07'].gerendert.h1NichtSichtbarNach300ms} · Scrollen nicht möglich ${Z['S-07'].gerendert.scrollenNichtMoeglich} · Vollbild-Überlagerung ${Z['S-07'].gerendert.vollbildUeberlagerung} · Zähleränderungen ${Z['S-07'].gerendert.zaehlerAenderungen}` : '–']);
L.push(...tab(['Befund', 'Code', 'Gerendert (Summe der Seitenansichten)'], zeilen));

if (bericht.code['S-01']) {
  const k = bericht.code;
  L.push('', '## Teil A: Code', '', '### S-01 Platzhalter-Muster', '', `${k['S-01'].regel}. Nach Muster: ${kv(k['S-01'].nachMuster)}. ${k['S-01'].anmerkung}`);
  top(k['S-01'].fundstellen, 60, ['Datei:Zeile', 'Muster', 'Art', 'Zeile'], (t) => [`${t.datei}:${t.zeile}`, t.muster, t.art + (t.kommentar ? ' (Kommentar)' : ''), `\`${t.text.slice(0, 110)}\``], 'Fundstellen S-01');
  L.push('', '### S-04 Icon-Quellen und Strichstärken', '');
  const s4 = k['S-04'];
  L.push(`Icon-Quellen: ${kv(s4.iconQuellen)} · verschiedene Icons: ${s4.verschiedeneIcons} · Importe: ${s4.iconImporte} · eigene SVG-Komponenten: ${s4.anzahlEigeneSvgKomponenten} · SVG-Dateiimporte: ${s4.svgDateiImporte.length}`, '', `strokeWidth/stroke-width im Code (Wert: Anzahl): ${kv(s4.strichstaerkenImCode)}`);
  const proIcon = Object.values(s4.icons.reduce((m, x) => { const kk = `${x.quelle}:${x.icon}`; (m[kk] ??= { quelle: x.quelle, icon: x.icon, dateien: new Set(), verwendungen: 0 }); m[kk].dateien.add(x.datei); m[kk].verwendungen += x.verwendungenInDatei; return m; }, {})).sort((a, b) => b.verwendungen - a.verwendungen);
  L.push('', ...tab(['Quelle', 'Icon', 'Dateien', 'Verwendungen', 'Fundstellen (Datei:Zeile des Imports)'], proIcon.map((x) => [x.quelle, x.icon, x.dateien.size, x.verwendungen, s4.icons.filter((i) => i.quelle === x.quelle && i.icon === x.icon).slice(0, 3).map((i) => `${i.datei}:${i.zeile}`).join(', ')])));
  L.push('', `JSX-Marken der Icon-Komponenten: ${s4.iconTags.gesamt} gesamt, ${s4.iconTags.mitStrokeWidth} mit strokeWidth, ${s4.iconTags.ohneStrokeWidth} ohne (Bibliotheksvoreinstellung).`);
  top(s4.iconTags.fundstellenOhneStrokeWidth, 30, ['Datei:Zeile', 'Icon'], (x) => [`${x.datei}:${x.zeile}`, x.icon], 'Icon-Marken ohne strokeWidth');
  top(s4.eigeneSvgKomponenten, 40, ['Datei:Zeile', 'Komponente', 'Zeile'], (x) => [`${x.datei}:${x.zeile}`, x.komponente, `\`${x.text}\``], 'Eigene SVG-Komponenten (<svg im JSX)');
  top(s4.strichstaerkenFundstellen, 60, ['Datei:Zeile', 'Art', 'Wert'], (x) => [`${x.datei}:${x.zeile}`, x.art, `\`${x.wert}\``], 'strokeWidth/stroke-width');
  top(s4.emojisImCode.fundstellen, 30, ['Datei:Zeile', 'Zeichen', 'Codepoint', 'typografisch'], (x) => [`${x.datei}:${x.zeile}`, x.zeichen, x.codepoint, x.typografisch], 'Emojis/Pictogramme im Code');

  const s5 = k['S-05'];
  L.push('', '### S-05 Freie Werte im Code', '', `Eckige Klammern gesamt ${s5.eckigeKlammernGesamt}: Wertklassen ${s5.eckigWertklassen} (nach Kategorie: ${kv(s5.eckigWertklassenNachKategorie)}; nach Werttyp: ${kv(s5.eckigWertklassenNachWerttyp)}) · Varianten-Selektoren ${s5.eckigVarianten} · Eigenschaften in Klammern ${s5.eckigEigenschaften}`, '', `${s5.anmerkung}`);
  top(s5.eckigFundstellen.filter((x) => x.art === 'wert'), 80, ['Datei:Zeile', 'Token', 'Kategorie', 'Werttyp'], (x) => [`${x.datei}:${x.zeile}${x.designAllow ? ' (design-allow)' : ''}`, `\`${x.token}\``, x.kategorie, x.werttyp], 'Tailwind-Wertklassen mit -[…]');
  top(s5.eckigFundstellen.filter((x) => x.art !== 'wert'), 40, ['Datei:Zeile', 'Token', 'Art/Kategorie'], (x) => [`${x.datei}:${x.zeile}`, `\`${x.token}\``, `${x.art}/${x.kategorie}`], 'Eckige Klammern als Variante oder Eigenschaft (kein freier Wert, zur Kenntnis)');
  top(s5.zahlDauerKlassenFundstellen, 40, ['Datei:Zeile', 'Klasse'], (x) => [`${x.datei}:${x.zeile}`, `\`${x.klasse}\``], 'duration-/delay-Klassen mit Zahl');
  top(s5.hexwerteFundstellen, 60, ['Datei:Zeile', 'Wert', 'Anker?', 'Ausnahmekandidat', 'Zeile'], (x) => [`${x.datei}:${x.zeile}`, x.wert, x.vermutlichAnker ? 'ja' : 'nein', x.ausnahmeKandidat ?? '–', `\`${x.text.slice(0, 90)}\``], 'Hexwerte in TSX');
  top(s5.inlineStyleFundstellen, 60, ['Datei:Zeile', 'Status', 'frei', 'Inhalt'], (x) => [`${x.datei}:${x.zeile}${x.ausnahmeKandidat ? ' (' + x.ausnahmeKandidat + ')' : ''}`, x.status, x.frei.join('/') || '–', `\`${x.inhalt.slice(0, 100)}\``], `Inline style={{…}} (${kv(s5.inlineStyleNachStatus)})`);
  top(s5.cssFundstellen, 60, ['Datei:Zeile', 'Kategorie', 'Wert'], (x) => [`${x.datei}:${x.zeile}`, x.kategorie, `\`${x.wert}\``], `CSS außerhalb von theme.css (${kv(s5.cssFreieWerteNachKategorie)})`);
  top(s5.jsDauernFundstellen, 40, ['Datei:Zeile', 'Art', 'Wert'], (x) => [`${x.datei}:${x.zeile}`, x.art, `\`${x.wert}\``], 'Dauern/Kurven in TS/TSX');

  const s7 = k['S-07'];
  L.push('', '### S-07 Auftakt-Muster', '', s7.anmerkung);
  top(s7.fundstellen.filter((x) => x.einordnung === 'kandidat'), 40, ['Datei:Zeile', 'Muster', 'Zeile'], (x) => [`${x.datei}:${x.zeile}`, x.muster, `\`${x.text.slice(0, 100)}\``], 'Fundstellen S-07: Kandidaten');
  L.push('', `S-07 übrige Treffer: ${s7.davonInhaltsfeldOderName} als Inhaltsfeld oder Bezeichner (intro/INTRO), ${s7.davonKommentar} in Kommentaren; vollständig in slop-hart.json.`);

  L.push('', '### Hinweise (keine Zählung der harten Befunde)', '');
  top(k.hinweise['S-02'].fundstellen, 40, ['Datei:Zeile', 'Muster', 'Zeile'], (x) => [`${x.datei}:${x.zeile}`, x.muster, `\`${x.text.slice(0, 100)}\``], 'S-02 Bewegungsmechanismen im Code');
  top(k.hinweise['S-03'].fundstellen, 30, ['Datei:Zeile', 'Art', 'Zeile'], (x) => [`${x.datei}:${x.zeile}`, x.art, `\`${x.text.slice(0, 100)}\``], 'S-03 Hover-Reveal und title-Attribute');
  top(k.hinweise['S-06'].ladezustandVerdacht, 30, ['Datei:Zeile', 'Anlass'], (x) => [`${x.datei}:${x.zeile}`, x.anlass], 'S-06 Ladezustand-Verdacht (Heuristik)');
  top(k.hinweise['S-06'].leerzustandVerdacht, 30, ['Datei:Zeile', 'Art'], (x) => [`${x.datei}:${x.zeile}`, x.art], 'S-06 Leerzustand-Verdacht (Heuristik)');
}

if (bericht.seiten.length) {
  L.push('', '## Teil B: gerendert', '', '### Übersicht je Seite und Ansicht', '');
  L.push(...tab(['Seite', 'Ansicht', 'Status', 'S-01', 'S-02 Abschnitte mit Auftritt', 'S-03 Kontrast', 'S-03 Fokus nicht ok', 'S-04 Emoji', 'S-04 Strich (berechnet)', 'S-05 Elemente außerhalb', 'S-06 ohne Hover / ohne Fokus / Feld ohne Fehlerstil', 'S-07 h1 300 ms / scrollbar'], bericht.seiten.map((x) => x.s01 ? [x.pfad, x.ansicht, x.status, x.s01.treffer.length + x.s01.feldPlatzhalterMitMuster, `${x.s02.mitAuftritt}/${x.s02.abschnitte} (${Math.round((x.s02.anteil ?? 0) * 100)} %)`, x.s03kontrast?.verletzungen ?? '?', `${x.s03fokus.nichtOk}/${x.s03fokus.geprueft}`, x.s04.emojis.hart, x.s04.svg.anzahlBerechnet, Object.entries(x.s05.volltext).map(([k, v]) => `${k[0]}${v.ausserhalb}`).join(' '), `${x.s06.ohneHover.length} / ${x.s06.ohneFokusVisible.length} / ${x.s06.feld.ohneFehlerstil}`, `${x.s07.h1SichtbarNach300ms === null ? 'keine h1' : x.s07.h1SichtbarNach300ms ? 'ja' : 'NEIN'} / ${x.s07.scrollenOk === null ? 'kurz' : x.s07.scrollenOk ? 'ja' : 'NEIN'}`] : [x.pfad, x.ansicht, 'FEHLER', ...Array(9).fill('–')])));
  L.push('', 'Kürzel S-05: s Schriftgröße · r Radius · s Schatten · f Farbe · h Hintergrund · d Dauer (je Anzahl Elemente außerhalb der Token, Volltext der Seite).');
  // S-01 gerendert
  const alleS01 = bericht.seiten.flatMap((x) => (x.s01?.treffer ?? []).map((t) => ({ seite: x.pfad, ansicht: x.ansicht, ...t })));
  top(alleS01, 40, ['Seite', 'Ansicht', 'Muster', 'Fundstelle', 'Kontext'], (t) => [t.seite, t.ansicht, t.muster, `\`${t.fundstelle.slice(-70)}\``, t.kontext], 'S-01 sichtbarer Text mit Platzhalter-Muster');
  const felder = bericht.seiten.filter((x) => x.ansicht === 'd1440').flatMap((x) => (x.s01?.feldPlatzhalter ?? []).map((f) => ({ seite: x.pfad, ...f })));
  top(felder, 40, ['Seite', 'Fundstelle', 'Platzhaltertext', 'Muster'], (f) => [f.seite, `\`${f.fundstelle.slice(-60)}\``, f.wert, f.musterTreffer.join(', ') || '–'], 'S-01 sichtbare Feld-Platzhaltertexte (d1440, zur Kenntnis; Handprüfung auf Beispieltexte)');
  const zahlen = bericht.seiten.filter((x) => x.ansicht === 'd1440').flatMap((x) => (x.s01?.zahlenInventar ?? []).map((f) => ({ seite: x.pfad, ...f })));
  top(zahlen, 60, ['Seite', 'Zahlangabe', 'Fundstelle'], (f) => [f.seite, f.kontext, `\`${f.fundstelle.slice(-60)}\``], 'S-01 Prüfliste Zahlenangaben im sichtbaren Text (d1440; kein Befund – Handprüfung gegen Quellen auf Erfundenes)');
  // S-02
  const abschnittsListe = bericht.seiten.filter((x) => x.s02 && x.s02.mitAuftritt > 0).flatMap((x) => x.s02.abschnittsliste.filter((a) => a.mitAuftritt).map((a) => ({ seite: x.pfad, ansicht: x.ansicht, ...a })));
  top(abschnittsListe, 40, ['Seite', 'Ansicht', 'Abschnitt', 'Animationen nach Scroll', 'Zustandswechsel'], (a) => [a.seite, a.ansicht, `\`${a.fundstelle.slice(-60)}\``, a.animationenNachScroll.map((n) => `${n.typ}:${n.name}[${n.props.join(',')}]`).join('; ') || '–', a.zustandswechsel.length], 'S-02 Abschnitte mit Scroll-Auftritt');
  L.push('', `S-02 Nebenbefunde: Elemente außerhalb des ersten Bildschirms mit opacity < 1 oder transform ≠ none, die sich beim Scrollen nicht ändern (statisch): ${bericht.seiten.reduce((s, x) => s + (x.s02?.ruheZustandOhneWechsel ?? 0), 0)} Elemente in Summe; Animationen insgesamt gesehen ${bericht.seiten.reduce((s, x) => s + (x.s02?.animationenGesamt ?? 0), 0)}, davon nach dem ersten Scrollereignis gestartet ${bericht.seiten.reduce((s, x) => s + (x.s02?.animationenNachScroll ?? 0), 0)}.`);
  // S-03
  const kn = bericht.seiten.flatMap((x) => (x.s03kontrast?.knoten ?? []).map((n) => ({ seite: x.pfad, ansicht: x.ansicht, ...n })));
  top(kn, 50, ['Seite', 'Ansicht', 'Ziel', 'Kontrast', 'erwartet', 'Vordergrund / Hintergrund'], (n) => [n.seite, n.ansicht, `\`${n.ziel.slice(-70)}\``, n.kontrast, n.erwartet, `${n.vordergrund} / ${n.hintergrund}`], 'S-03 Kontrast (axe color-contrast)');
  const fk = bericht.seiten.flatMap((x) => (x.s03fokus?.stopps ?? []).filter((s) => !s.outlineOk).map((s) => ({ seite: x.pfad, ansicht: x.ansicht, ...s })));
  top(fk, 50, ['Seite', 'Ansicht', 'Tab', 'Element', 'outline', 'nur box-shadow'], (s) => [s.seite, s.ansicht, s.nr, `\`${s.fundstelle.slice(-60)}\` ${s.name}`, `${s.outlineStyle} ${s.outlineWidthPx}px${s.fokusVisible ? '' : ' (kein :focus-visible)'}`, s.nurBoxShadow ? 'ja' : 'nein'], 'S-03 Tab-Stopps ohne sichtbare Outline ≥ 2 px');
  // S-04
  const em = bericht.seiten.flatMap((x) => (x.s04?.emojis.liste ?? []).map((e) => ({ seite: x.pfad, ansicht: x.ansicht, ...e })));
  top(em, 30, ['Seite', 'Ansicht', 'Zeichen', 'Codepoint', 'typografisch', 'Fundstelle'], (e) => [e.seite, e.ansicht, e.zeichen, e.codepoint, e.typografisch, `\`${e.fundstelle.slice(-60)}\``], 'S-04 Emojis im sichtbaren Text');
  L.push('', '### S-04 Strichstärken inline-SVG (d1440)', '');
  L.push(...tab(['Seite', 'sichtbare SVG', 'lucide', 'eigen', 'stroke-width Attribute', 'berechnet', 'effektiv px'], bericht.seiten.filter((x) => x.ansicht === 'd1440' && x.s04).map((x) => [x.pfad, x.s04.svg.svgSichtbar, x.s04.svg.lucide, x.s04.svg.eigen, Object.entries(x.s04.svg.strichAttribut).map(([k, v]) => `${k}×${v.anzahl}`).join(' '), Object.entries(x.s04.svg.strichBerechnet).map(([k, v]) => `${k}×${v.anzahl}`).join(' '), Object.entries(x.s04.svg.strichEffektivPx).map(([k, v]) => `${k}×${v.anzahl}`).join(' ')])));
  // S-05
  L.push('', '### S-05 Werte außerhalb der Tokens (Volltext aller sichtbaren Elemente; Beispiele je Wert)', '');
  const agg = {};
  for (const x of bericht.seiten) for (const [e, v] of Object.entries(x.s05?.volltext ?? {})) for (const [w, d] of Object.entries(v.werte)) { const kk = `${e}|${w}`; (agg[kk] ??= { e, w, anzahl: 0, seiten: new Set(), beispiel: d.beispiele[0], seiteBsp: x.pfad }); agg[kk].anzahl += d.anzahl; agg[kk].seiten.add(`${x.pfad}@${x.ansicht}`); }
  const aggListe = Object.values(agg).sort((a, b) => b.anzahl - a.anzahl);
  top(aggListe, 70, ['Eigenschaft', 'Wert', 'Elemente (Summe)', 'Seitenansichten', 'Beispiel (Seite · Selektor)'], (a) => [a.e, `\`${a.w}\``, a.anzahl, a.seiten.size, `${a.seiteBsp} · \`${(a.beispiel ?? '').slice(-70)}\``], 'S-05 abweichende Werte (alle Seitenansichten zusammen, sortiert nach Häufigkeit)');
  L.push('', `Schriftstufen laut Token bei 1440 px: ${(bericht.seiten.find((x) => x.ansicht === 'd1440')?.s05.schriftTokenPx ?? []).map((s) => `${s.name} ${Math.round(s.px * 100) / 100}px`).join(' · ')}; bei 375 px: ${(bericht.seiten.find((x) => x.ansicht === 'm375')?.s05.schriftTokenPx ?? []).map((s) => `${s.name} ${Math.round(s.px * 100) / 100}px`).join(' · ')}.`);
  const st = bericht.seiten.filter((x) => x.s05);
  L.push('', 'Stichprobe (60 Elemente je Seitenansicht, gleichmäßig durch die Dokumentreihenfolge): Elemente mit mindestens einer Abweichung', '');
  L.push(...tab(['Seite', 'Ansicht', 'Elemente gemessen (Seite)', 'Stichprobe', 'mit Abweichung', 'Schrift', 'Radius', 'Schatten', 'Farbe', 'Hintergrund', 'Dauer'], st.map((x) => [x.pfad, x.ansicht, x.s05.elementeGemessen, x.s05.stichprobe.groesse, x.s05.stichprobe.elementeMitAbweichung, ...['schriftgroesse', 'radius', 'schatten', 'farbe', 'hintergrund', 'dauer'].map((e) => x.s05.stichprobe.abweichungenJeEigenschaft[e])])));
  // S-06
  L.push('', '### S-06 Hover-/Fokus-/Fehlerstil je interaktivem Element', '');
  L.push(...tab(['Seite', 'Ansicht', 'Links ohne Hover', 'Knöpfe ohne Hover', 'Felder ohne Hover', 'Links ohne :focus-visible', 'Knöpfe ohne :focus-visible', 'Felder ohne :focus-visible', 'Felder ohne aria-invalid-Stil', 'CSS-Regeln (Hover/Fokus/Invalid)'], bericht.seiten.filter((x) => x.s06).map((x) => [x.pfad, x.ansicht, `${x.s06.link.ohneHover}/${x.s06.link.gesamt}`, `${x.s06.knopf.ohneHover}/${x.s06.knopf.gesamt}`, `${x.s06.feld.ohneHover}/${x.s06.feld.gesamt}`, `${x.s06.link.ohneFokusVisible}/${x.s06.link.gesamt}`, `${x.s06.knopf.ohneFokusVisible}/${x.s06.knopf.gesamt}`, `${x.s06.feld.ohneFokusVisible}/${x.s06.feld.gesamt}`, `${x.s06.feld.ohneFehlerstil}/${x.s06.feld.mitFehlerstilPruefung}`, `${x.s06.hoverRegeln}/${x.s06.fokusRegeln}/${x.s06.invalidRegeln}`])));
  const ohneH = bericht.seiten.filter((x) => x.ansicht === 'd1440').flatMap((x) => x.s06.ohneHover.map((e) => ({ seite: x.pfad, ...e })));
  top(ohneH, 50, ['Seite', 'Typ', 'Element', 'Fundstelle'], (e) => [e.seite, e.typ, e.name || e.tag, `\`${e.fundstelle.slice(-80)}\``], 'S-06 Elemente ohne Hover-Stil (d1440)');
  const ohneF = bericht.seiten.filter((x) => x.ansicht === 'd1440').flatMap((x) => x.s06.ohneFokusVisible.map((e) => ({ seite: x.pfad, ...e })));
  top(ohneF, 50, ['Seite', 'Typ', 'Element', 'Fundstelle', ':focus-Stil statt :focus-visible'], (e) => [e.seite, e.typ, e.name || e.tag, `\`${e.fundstelle.slice(-80)}\``, e.fokusNurFocus ? 'ja' : 'nein'], 'S-06 Elemente ohne :focus-visible-Stil (d1440)');
  const ohneI = bericht.seiten.filter((x) => x.ansicht === 'd1440').flatMap((x) => x.s06.felderOhneFehlerstil.map((e) => ({ seite: x.pfad, ...e })));
  top(ohneI, 50, ['Seite', 'Feld', 'Fundstelle'], (e) => [e.seite, e.name || e.tag, `\`${e.fundstelle.slice(-80)}\``], 'S-06 Felder ohne aria-invalid-Fehlerdarstellung (d1440)');
  // S-07
  L.push('', '### S-07 Auftakt: Inhalt und Scrollen 300 ms nach domcontentloaded', '');
  L.push(...tab(['Seite', 'Ansicht', 'h1 vorhanden', 'h1 Deckkraft', 'h1 im ersten Bildschirm', 'h1 sichtbar nach 300 ms', 'Seite scrollbar nötig', 'Scrollen möglich', 'overflow html/body', 'Vollbild-Überlagerung', 'Zähler ändern sich'], bericht.seiten.filter((x) => x.s07).map((x) => [x.pfad, x.ansicht, x.s07.h1 ? 'ja' : 'nein', x.s07.h1?.deckkraft ?? '–', x.s07.h1?.imErstenBildschirm ?? '–', x.s07.h1SichtbarNach300ms ?? '–', x.s07.scrollbarNoetig ? 'ja' : 'nein', x.s07.scrollenMoeglich ?? '–', `${x.s07.overflow.html}/${x.s07.overflow.body}`, x.s07.vollbildUeberlagerungen.map((u) => u.fundstelle.slice(-40)).join(', ') || 'keine', x.s07.zaehlerAenderungen.length])));
  const fehlerSeiten = bericht.seiten.filter((x) => x.fehlerLauf);
  if (fehlerSeiten.length) { L.push('', '### Läufe mit Fehler', ''); for (const x of fehlerSeiten) L.push(`- ${x.pfad} ${x.ansicht}: ${x.fehlerLauf.split('\n')[0]}`); }
}
L.push('', '## Hinweise zur Methode', '',
  '- Zählung, nicht Urteil: Jede Zahl gehört zu einer Katalogregel; Fundstellen stehen als Datei:Zeile (Code) oder Seite + Selektor (gerendert) in slop-hart.json. Der Selektor ist ein gekürzter Pfad (bis 5 Ebenen) und kein eindeutiger CSS-Selektor.',
  '- S-02 (gerendert): Ein Abschnitt zählt als „mit Auftritt“, wenn nach dem ersten Scrollereignis eine Animation (CSS, Übergang, WAAPI, scroll-/view-gebunden) mit opacity/transform/translate/scale/rotate/clip-path/filter/visibility in ihm startet oder ein Element außerhalb des ersten Bildschirms seinen opacity-/transform-Wert beim Durchscrollen ändert. Abschnitte = oberste `section` in `main` (sonst Kinder von `main`). Grenze: > 50 % der Abschnitte.',
  '- S-03: axe-core-Regel color-contrast allein; Fokus: echte Tab-Taste, `:focus-visible` muss zutreffen und am Element selbst, an `::after`/`::before` oder an einem bis zu drei Ebenen höheren Vorfahren mit `:has(:focus-visible)` muss `outline-style` ≠ none mit `outline-width` ≥ 2 px gelten (ein Ring über box-shadow zählt nicht als Outline, wird aber als „nur box-shadow“ ausgewiesen; der Ort des Rings steht in `ringOrt`). „Information nur über Hover oder Farbe“ ist per Skript nicht entscheidbar; Hinweise stehen unter Code.',
  '- S-05 Stichprobe: gleichmäßig durch die Dokumentreihenfolge aller sichtbaren Elemente; Vergleich mit den aus theme.css gelesenen Werten (Farben alle Hex-Werte der Datei, Radien, Schatten über Prüfelement normalisiert, Dauern, Schriftstufen als clamp() für die jeweilige Ansichtsbreite aufgelöst). Der Volltext derselben Seite ist die vollständige Zählung. Farben mit Deckkraft < 1 gelten als Token, wenn der RGB-Anteil einem Token entspricht (±3).',
  '- S-06: Hover-/Fokus-Regeln werden aus allen lesbaren Stylesheets samt verschachtelten Regeln und @media/@supports/@layer gesammelt; ein Element hat den Stil, wenn es den Selektor ohne die Pseudoklasse trifft (Vorfahren-Hover eingeschlossen). Medienbedingungen wie (hover: hover) werden nicht ausgewertet.',
  '- S-07: `domcontentloaded` + 300 ms; h1 gilt als sichtbar bei Gesamt-Deckkraft ≥ 0,999, visibility visible und Lage im ersten Bildschirm; Scrollen wird mit scrollTo geprüft, wenn die Seite höher als der Bildschirm ist; Zähler = Blattelemente, deren Text nur aus Ziffern und Zeichen besteht und sich zwischen 300 ms und 2,5 s ändert.');
await fs.writeFile(path.join(outDir, 'slop-hart.md'), L.join('\n') + '\n');
console.log(`\nFERTIG → ${path.relative(REPO, outDir)}/slop-hart.json, slop-hart.md`);
console.log(JSON.stringify(bericht.zusammenfassung, null, 1).slice(0, 4000));
