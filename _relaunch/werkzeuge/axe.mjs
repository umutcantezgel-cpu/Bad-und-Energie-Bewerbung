// axe-Läufer (Ebene 5, Zugänglichkeit): axe-core über Grundmenge × Ansichten × Farbschema plus Zustände.
// Roh-JSON je Lauf (volle Verstöße mit HTML-Ausschnitt)  → _relaunch/.roh/<label>/axe/<schlüssel>.json   (lokal, nicht versioniert)
// Zusammenfassung                                         → _relaunch/belege/<label>/axe.json und axe.md  (versioniert)
//
// Aufruf: node axe.mjs --base http://localhost:3500 --label <label>
//         [--vps m375,t768,d1440,d1920] [--schemes light,dark] [--only start,stellen,zustand-menue]
//         [--set seiten|zustaende|alle] [--jobs 3]
//
// Messbedingungen: Tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa; reducedMotion „reduce“; nach dem Laden
// document.fonts.ready, schrittweises Durchscrollen (scrollThrough), Animationen beendet; Anfragesperre G5 aus lib/browser.mjs.
// Keine echte Formularsendung: Der Bewerbungszustand löst nur die clientseitige Pflichtfeld-Validierung aus.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import AxeBuilder from '@axe-core/playwright';
import { GRUNDMENGE, VIEWPORTS, collectErrors, launch, newContext, scrollThrough } from './lib/browser.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? 'true' : arr[i + 1]]] : acc), []));
const base = args.base ?? 'http://localhost:3500';
const label = args.label ?? 'lauf';
const schemes = (args.schemes ?? 'light,dark').split(',');
const vps = VIEWPORTS.filter((v) => (args.vps ?? 'm375,t768,d1440,d1920').split(',').includes(v.name));
const only = args.only ? args.only.split(',') : null;
const setWahl = args.set ?? 'alle';
const jobs = Math.max(1, Number(args.jobs ?? 3));

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const IMPACTS = ['critical', 'serious', 'moderate', 'minor'];
const IMPACT_DE = { critical: 'kritisch', serious: 'ernst', moderate: 'mäßig', minor: 'gering' };
const SCHEMA_DE = { light: 'hell', dark: 'dunkel' };

const MAIN_JOB_SLUG = 'anlagenmechaniker-shk-wetzlar';

const rawDir = path.join(ROOT, '.roh', label, 'axe');
const outDir = path.join(ROOT, 'belege', label);
await fs.mkdir(rawDir, { recursive: true });
await fs.mkdir(outDir, { recursive: true });

const axeVersion = JSON.parse(await fs.readFile(createRequire(import.meta.url).resolve('axe-core/package.json'), 'utf8')).version;

/** Wartet auf Schriften und beendete Übergänge (stabile Messwerte). */
async function settle(page) {
  await page.evaluate(() => document.fonts?.ready.then(() => undefined));
  await page
    .waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity), null, { timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(150);
}

/** React hat das Element hydriert (vorher lösen Klicks nichts aus). */
async function hydrated(locator) {
  await locator.waitFor({ state: 'visible', timeout: 15_000 });
  await locator.evaluate(
    (el) =>
      new Promise((resolve, reject) => {
        const t0 = Date.now();
        const tick = () => {
          if (Object.keys(el).some((k) => k.startsWith('__reactFiber') || k.startsWith('__reactProps'))) return resolve(true);
          if (Date.now() - t0 > 15_000) return reject(new Error('nicht hydriert'));
          setTimeout(tick, 50);
        };
        tick();
      }),
  );
}

/**
 * Zusätzliche Zustände. Jeder Zustand: eigene Ausgangsseite, erlaubte Ansichten, `prepare(page)` stellt den Zustand her
 * und liefert Nachweise (wirft, wenn der Zustand nicht eingetreten ist – dann zählt der Lauf als Fehler, nicht als „sauber“).
 */
const ZUSTAENDE = [
  {
    slug: 'zustand-menue',
    titel: 'Mobiles Menü geöffnet (Start)',
    pfad: '/',
    vps: ['m375'], // Menü-Knopf ist ab lg ausgeblendet (components/site/MobileNav.tsx: lg:hidden); d1440 hat die Navigation offen im Kopf.
    async prepare(page) {
      const knopf = page.locator('header button[aria-label="Menü"]');
      await hydrated(knopf);
      await knopf.click();
      await page.locator('dialog[open] nav[aria-label="Hauptnavigation"]').waitFor({ state: 'visible', timeout: 10_000 });
      await settle(page);
      const expanded = await knopf.getAttribute('aria-expanded');
      if (expanded !== 'true') throw new Error(`Menü-Knopf aria-expanded=${expanded}`);
      return { dialogOffen: true, ariaExpanded: expanded };
    },
  },
  {
    slug: 'zustand-bewerbung-fehler',
    titel: 'Bewerbungsflow, Pflichtfeldfehler im Kontaktschritt',
    pfad: `/bewerbung?stelle=${MAIN_JOB_SLUG}`,
    vps: ['m375', 'd1440'],
    async prepare(page) {
      const flow = page.locator('[data-apply-flow="page"]');
      await hydrated(flow);
      // Weg zum Kontaktschritt wie in e2e/support/flow.ts answerQuestions().
      await flow.getByRole('button', { name: 'Geselle, 2–5 Jahre', exact: true }).click();
      await flow.getByRole('heading', { name: 'Ab wann könntest du anfangen?', exact: true }).waitFor({ timeout: 10_000 });
      await flow.getByRole('button', { name: 'Sofort', exact: true }).click();
      await flow.getByRole('heading', { name: 'Wie erreichen wir dich?', exact: true }).waitFor({ timeout: 10_000 });
      // Leer absenden: reagiert nur die clientseitige Validierung, es geht keine Anfrage hinaus.
      await flow.getByRole('button', { name: /^(Bewerbung absenden|Erneut senden)$/ }).click();
      await flow.getByRole('textbox', { name: 'Name', exact: true }).waitFor({ timeout: 10_000 });
      await page.waitForFunction(() => document.querySelector('[data-apply-flow="page"] [aria-invalid="true"]'), null, { timeout: 10_000 });
      await settle(page);
      const fehlerFelder = await flow.locator('[aria-invalid="true"]').count();
      const fehlertexte = await flow.locator('[role="alert"], [id$="-error"], [data-error]').evaluateAll((els) => els.map((e) => (e.textContent || '').trim().slice(0, 80)).filter(Boolean));
      return { felderMitAriaInvalid: fehlerFelder, fehlertexte };
    },
  },
  {
    slug: 'zustand-faq-offen',
    titel: 'Startseite, FAQ-Eintrag geöffnet',
    pfad: '/',
    vps: ['m375', 'd1440'],
    async prepare(page) {
      const erster = page.locator('#faq details').first();
      await erster.scrollIntoViewIfNeeded();
      await erster.locator('summary').click();
      await page.waitForFunction(() => document.querySelectorAll('#faq details[open]').length === 1, null, { timeout: 5000 });
      await settle(page);
      return { frage: ((await erster.locator('summary').innerText()) || '').trim(), offen: await page.locator('#faq details[open]').count() };
    },
  },
  {
    slug: 'zustand-region-ort',
    titel: 'Startseite, Region: Pendelrechner mit gewähltem Ort',
    pfad: '/',
    vps: ['m375', 'd1440'],
    async prepare(page) {
      const auswahl = page.locator('#einsatzgebiet select');
      await hydrated(auswahl);
      await auswahl.scrollIntoViewIfNeeded();
      const wert = await auswahl.evaluate((s) => [...s.options].find((o) => o.value)?.value ?? '');
      if (!wert) throw new Error('Keine Ortsoption gefunden');
      await auswahl.selectOption(wert);
      await page.waitForFunction(() => /min|km/.test(document.querySelector('#einsatzgebiet [aria-live="polite"]')?.textContent ?? ''), null, { timeout: 5000 });
      await settle(page);
      const ort = await auswahl.evaluate((s) => s.selectedOptions[0]?.textContent ?? '');
      const ergebnis = ((await page.locator('#einsatzgebiet [aria-live="polite"]').innerText()) || '').replace(/\s+/g, ' ').trim();
      return { ort, ergebnis };
    },
  },
];

// ---- Aufträge zusammenstellen -------------------------------------------------------------------------------------
const auftraege = [];
if (setWahl !== 'zustaende') {
  for (const p of GRUNDMENGE) {
    if (only && !only.includes(p.slug)) continue;
    for (const vp of vps) for (const scheme of schemes) auftraege.push({ typ: 'seite', slug: p.slug, titel: p.slug, pfad: p.path, vp, scheme });
  }
}
if (setWahl !== 'seiten') {
  for (const z of ZUSTAENDE) {
    if (only && !only.includes(z.slug)) continue;
    for (const vp of vps) {
      if (!z.vps.includes(vp.name)) continue;
      for (const scheme of schemes) auftraege.push({ typ: 'zustand', slug: z.slug, titel: z.titel, pfad: z.pfad, vp, scheme, zustand: z });
    }
  }
}

const browser = await launch();
const chromiumVersion = browser.version();

async function lauf(a, versuch = 1) {
  const key = `${a.slug}__${a.vp.name}-${a.scheme}`;
  const { context, requestLog } = await newContext(browser, { origin: base, viewport: a.vp, colorScheme: a.scheme, reducedMotion: 'reduce' });
  const t0 = Date.now();
  let status = 0;
  try {
    const page = await context.newPage();
    const errors = collectErrors(page);
    const res = await page.goto(base + a.pfad, { waitUntil: 'networkidle', timeout: 45_000 });
    status = res?.status() ?? 0;
    await page.evaluate(() => document.fonts?.ready);
    await scrollThrough(page);
    const nachweis = a.zustand ? await a.zustand.prepare(page) : null;
    await settle(page);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const verstoesse = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      knoten: v.nodes.length,
      ziel: v.nodes[0]?.target?.join(' ') ?? '',
      tags: v.tags.filter((t) => t.startsWith('wcag') || t.startsWith('best')),
    }));
    const summe = Object.fromEntries(IMPACTS.map((i) => [i, verstoesse.filter((v) => v.impact === i).length]));
    const eintrag = {
      key,
      typ: a.typ,
      slug: a.slug,
      titel: a.titel,
      pfad: a.pfad,
      ansicht: a.vp.name,
      schema: a.scheme,
      status,
      ms: Date.now() - t0,
      geprueft: results.passes.length,
      unklar: results.incomplete.length,
      unklarRegeln: results.incomplete.map((v) => ({ id: v.id, impact: v.impact, knoten: v.nodes.length, ziel: v.nodes[0]?.target?.join(' ') ?? '' })),
      verstoesse,
      summe,
      nachweis,
      anfragesperre: requestLog.map((r) => ({ kind: r.kind, method: r.method, url: r.url })),
      konsolenfehler: errors.length,
    };
    // Roh: volle Verstöße samt Knoten, plus „unklar“ (incomplete) als Kurzliste.
    await fs.writeFile(
      path.join(rawDir, `${key}.json`),
      JSON.stringify({ ...eintrag, verstoesseVoll: results.violations, unklarKurz: results.incomplete.map((v) => ({ id: v.id, impact: v.impact, knoten: v.nodes.length, ziel: v.nodes[0]?.target?.join(' ') ?? '' })), konsole: errors }, null, 2),
    );
    const s = eintrag.summe;
    process.stdout.write(`${status} ${key} k${s.critical} e${s.serious} m${s.moderate} g${s.minor}${requestLog.length ? ` sperre:${requestLog.map((r) => r.kind).join('+')}` : ''}${errors.length ? ` ${errors.length} Konsolenfehler` : ''}\n`);
    return eintrag;
  } catch (err) {
    if (versuch < 2) {
      process.stdout.write(`WIEDERHOLUNG ${key}: ${String(err).split('\n')[0]}\n`);
      await context.close();
      return lauf(a, versuch + 1);
    }
    process.stdout.write(`FEHLER ${key}: ${String(err).split('\n')[0]}\n`);
    return { key, typ: a.typ, slug: a.slug, titel: a.titel, pfad: a.pfad, ansicht: a.vp.name, schema: a.scheme, status, fehlgeschlagen: String(err).split('\n')[0], anfragesperre: requestLog };
  } finally {
    await context.close().catch(() => {});
  }
}

// Kleiner Arbeitspool: mehrere Kontexte gleichzeitig, jeder Lauf bleibt unabhängig.
const ergebnisse = new Array(auftraege.length);
let naechster = 0;
await Promise.all(
  Array.from({ length: Math.min(jobs, auftraege.length) }, async () => {
    while (naechster < auftraege.length) {
      const i = naechster++;
      ergebnisse[i] = await lauf(auftraege[i]);
    }
  }),
);
await browser.close();

// ---- Zusammenfassung ----------------------------------------------------------------------------------------------
const ok = ergebnisse.filter((e) => !e.fehlgeschlagen);
const fehl = ergebnisse.filter((e) => e.fehlgeschlagen);
const summeGesamt = Object.fromEntries(IMPACTS.map((i) => [i, ok.reduce((n, e) => n + e.summe[i], 0)]));
const knotenGesamt = Object.fromEntries(IMPACTS.map((i) => [i, ok.reduce((n, e) => n + e.verstoesse.filter((v) => v.impact === i).reduce((m, v) => m + v.knoten, 0), 0)]));

// Regeln: je Regel-ID alle Fundstellen (Seite/Zustand → Ansicht-Schema-Läufe, Knotenzahl, erstes Ziel).
const regelMap = new Map();
for (const e of ok) {
  for (const v of e.verstoesse) {
    const r = regelMap.get(v.id) ?? { id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, tags: v.tags, laeufe: 0, knoten: 0, fundstellen: new Map() };
    if (IMPACTS.indexOf(v.impact) < IMPACTS.indexOf(r.impact)) r.impact = v.impact;
    r.laeufe += 1;
    r.knoten += v.knoten;
    const f = r.fundstellen.get(e.slug) ?? { slug: e.slug, laeufe: [], knoten: 0, ziel: v.ziel, zielLauf: `${e.ansicht}-${e.schema}` };
    f.laeufe.push(`${e.ansicht}-${SCHEMA_DE[e.schema]}`);
    f.knoten += v.knoten;
    r.fundstellen.set(e.slug, f);
    regelMap.set(v.id, r);
  }
}
const regeln = [...regelMap.values()]
  .map((r) => ({ ...r, fundstellen: [...r.fundstellen.values()] }))
  .sort((a, b) => IMPACTS.indexOf(a.impact) - IMPACTS.indexOf(b.impact) || b.knoten - a.knoten);

// „Unklar“ (axe incomplete): axe konnte nicht entscheiden, braucht Prüfung durch Menschen. Nur gemeldet, nicht als Verstoß gezählt.
const unklarMap = new Map();
for (const e of ok) {
  for (const u of e.unklarRegeln ?? []) {
    const r = unklarMap.get(u.id) ?? { id: u.id, laeufe: 0, knoten: 0, seiten: new Set(), ziel: u.ziel, zielLauf: e.key };
    r.laeufe += 1;
    r.knoten += u.knoten;
    r.seiten.add(e.slug);
    unklarMap.set(u.id, r);
  }
}
const unklarRegeln = [...unklarMap.values()].map((r) => ({ ...r, seiten: [...r.seiten] })).sort((a, b) => b.knoten - a.knoten);

const anfragen = {};
for (const e of ergebnisse) for (const r of e.anfragesperre ?? []) anfragen[`${r.kind} ${r.method}`] = (anfragen[`${r.kind} ${r.method}`] ?? 0) + 1;

const seitenAuftraege = auftraege.filter((a) => a.typ === 'seite').length;
const zustandsAuftraege = auftraege.filter((a) => a.typ === 'zustand').length;
const summary = {
  label,
  base,
  erstellt: new Date().toISOString(),
  bedingungen: {
    werkzeug: `@axe-core/playwright 4.13.0, axe-core ${axeVersion}`,
    chromium: chromiumVersion,
    tags: TAGS,
    reducedMotion: 'reduce',
    ansichten: vps.map((v) => `${v.name} ${v.width}×${v.height}`),
    schemata: schemes,
    vorbereitung: 'goto networkidle → document.fonts.ready → scrollThrough → Zustand herstellen → Animationen beendet → axe (ganze Seite)',
    anfragesperre: 'lib/browser.mjs (G5): POST/PUT/PATCH/DELETE → Attrappe, Tracking → 204, Fremdhosts blockiert',
    parallel: jobs,
  },
  abdeckung: {
    grundmengeSeiten: new Set(auftraege.filter((a) => a.typ === 'seite').map((a) => a.slug)).size,
    seitenlaeufe: seitenAuftraege,
    zustaende: new Set(auftraege.filter((a) => a.typ === 'zustand').map((a) => a.slug)).size,
    zustandslaeufe: zustandsAuftraege,
    gesamtLaeufe: auftraege.length,
    erfolgreich: ok.length,
    fehlgeschlagen: fehl.map((f) => ({ key: f.key, grund: f.fehlgeschlagen })),
  },
  summenVerstossRegeln: summeGesamt, // Summe der Regel-Treffer über alle Läufe (je Lauf zählt jede Regel einmal)
  summenKnoten: knotenGesamt,
  laufMitVerstoss: ok.filter((e) => e.verstoesse.length > 0).length,
  laufOhneVerstoss: ok.filter((e) => e.verstoesse.length === 0).length,
  anfragesperre: anfragen,
  unklarRegeln,
  laeufe: ergebnisse,
  regeln: regeln.map((r) => ({ ...r })),
};
await fs.writeFile(path.join(outDir, 'axe.json'), JSON.stringify(summary, null, 2));

// ---- Markdown -----------------------------------------------------------------------------------------------------
const zelle = (n) => (n ? String(n) : '0');
const md = [];
md.push(`# axe · ${label}`);
md.push('');
md.push(`Erstellt ${summary.erstellt} · Basis ${base}`);
md.push('');
md.push('## Messbedingungen');
md.push(`- ${summary.bedingungen.werkzeug} · Chromium ${chromiumVersion} (voller Modus)`);
md.push(`- Tags: ${TAGS.join(', ')}`);
md.push(`- Ansichten: ${summary.bedingungen.ansichten.join(' · ')} · Schemata: ${schemes.map((s) => SCHEMA_DE[s] ?? s).join(', ')} · reducedMotion: reduce`);
md.push(`- Vorbereitung: ${summary.bedingungen.vorbereitung}`);
md.push(`- Anfragesperre: ${summary.bedingungen.anfragesperre}`);
md.push(`- Zählweise: „Regeln“ = Anzahl verletzter Regeln im Lauf nach Wirkung (jede Regel einmal je Lauf); „Knoten“ = betroffene Elemente.`);
md.push('');
md.push('## Abdeckung');
md.push(`- Seiten der Grundmenge: ${summary.abdeckung.grundmengeSeiten} × ${vps.length} Ansichten × ${schemes.length} Schemata = ${seitenAuftraege} Läufe`);
md.push(`- Zustände: ${summary.abdeckung.zustaende} (${ZUSTAENDE.filter((z) => setWahl !== 'seiten' && (!only || only.includes(z.slug))).map((z) => `${z.slug} in ${z.vps.filter((v) => vps.some((x) => x.name === v)).join('/')}`).join('; ')}) = ${zustandsAuftraege} Läufe`);
md.push(`- Gesamt: ${auftraege.length} Läufe, erfolgreich ${ok.length}, fehlgeschlagen ${fehl.length}${fehl.length ? ` (${fehl.map((f) => f.key).join(', ')})` : ''}`);
md.push(`- Anfragesperre insgesamt: ${Object.keys(anfragen).length ? Object.entries(anfragen).map(([k, n]) => `${k} ×${n}`).join(', ') : 'keine gesperrten oder abgefangenen Anfragen'}`);
md.push('');
md.push('## Summe');
md.push('| | kritisch | ernst | mäßig | gering |');
md.push('|---|---:|---:|---:|---:|');
md.push(`| Regel-Treffer über alle Läufe | ${IMPACTS.map((i) => summeGesamt[i]).join(' | ')} |`);
md.push(`| betroffene Knoten über alle Läufe | ${IMPACTS.map((i) => knotenGesamt[i]).join(' | ')} |`);
md.push(`| unterschiedliche Regeln | ${IMPACTS.map((i) => regeln.filter((r) => r.impact === i).length).join(' | ')} |`);
md.push('');
md.push('## Läufe (Seite/Zustand × Ansicht × Schema)');
md.push('Zellen: Anzahl verletzter Regeln je Wirkung.');
md.push('');
md.push('| Seite/Zustand | Ansicht | Schema | Status | kritisch | ernst | mäßig | gering | Regeln |');
md.push('|---|---|---|---:|---:|---:|---:|---:|---|');
for (const e of ergebnisse) {
  if (e.fehlgeschlagen) {
    md.push(`| ${e.slug} | ${e.ansicht} | ${SCHEMA_DE[e.schema]} | ${e.status || '–'} | FEHLER | | | | ${e.fehlgeschlagen.replace(/\|/g, '/').slice(0, 80)} |`);
    continue;
  }
  md.push(`| ${e.slug} | ${e.ansicht} | ${SCHEMA_DE[e.schema]} | ${e.status} | ${IMPACTS.map((i) => zelle(e.summe[i])).join(' | ')} | ${[...new Set(e.verstoesse.map((v) => v.id))].join(', ') || '–'} |`);
}
md.push(`| **Summe (${ok.length} Läufe)** | | | | **${summeGesamt.critical}** | **${summeGesamt.serious}** | **${summeGesamt.moderate}** | **${summeGesamt.minor}** | ${regeln.length} Regel-IDs |`);
md.push('');
md.push('## Regel-IDs und Fundstellen');
if (!regeln.length) md.push('Keine Verstöße gefunden.');
for (const r of regeln) {
  md.push('');
  md.push(`### ${r.id} · ${IMPACT_DE[r.impact]}`);
  md.push(`${r.help} · [Hilfe](${r.helpUrl}) · ${r.laeufe} Läufe, ${r.knoten} Knoten · ${r.tags.join(', ')}`);
  md.push('');
  md.push('| Seite/Zustand | Läufe (Ansicht-Schema) | Knoten | erstes Ziel (erster Lauf) |');
  md.push('|---|---|---:|---|');
  for (const f of r.fundstellen) md.push(`| ${f.slug} | ${f.laeufe.join(', ')} | ${f.knoten} | \`${f.ziel.replace(/\|/g, '\\|')}\` (${f.zielLauf}) |`);
}
md.push('');
md.push('## Unklar (axe „incomplete“, nicht als Verstoß gezählt)');
if (!unklarRegeln.length) md.push('Keine.');
else {
  md.push('| Regel | Läufe | Knoten | Seiten/Zustände | erstes Ziel (erster Lauf) |');
  md.push('|---|---:|---:|---|---|');
  for (const u of unklarRegeln) md.push(`| ${u.id} | ${u.laeufe} | ${u.knoten} | ${u.seiten.join(', ')} | \`${u.ziel.replace(/\|/g, '\\|')}\` (${u.zielLauf}) |`);
}
md.push('');
md.push('## Nachweise der Zustände');
for (const e of ergebnisse.filter((x) => x.typ === 'zustand' && !x.fehlgeschlagen && x.ansicht && x.schema === 'light')) {
  md.push(`- ${e.slug} (${e.ansicht}): ${JSON.stringify(e.nachweis)}`);
}
md.push('');
await fs.writeFile(path.join(outDir, 'axe.md'), md.join('\n'));

console.log(`\nFERTIG ${ergebnisse.length} Läufe (${ok.length} ok, ${fehl.length} Fehler) · kritisch ${summeGesamt.critical} · ernst ${summeGesamt.serious} · mäßig ${summeGesamt.moderate} · gering ${summeGesamt.minor} · Regeln ${regeln.length} · Sperre ${JSON.stringify(anfragen)} → ${path.relative(ROOT, outDir)}`);
