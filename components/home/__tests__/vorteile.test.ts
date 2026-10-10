import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BenefitGrid } from '../BenefitGrid';
import { HERO_STATS } from '../content';
import { WUNSCH_IDS, paketStatus, sichtbareZeilen, wunschUmschalten, type PaketRolle } from '../vorteile/paket';
import {
  AUSSTATTUNG_ID,
  AUSSTATTUNG_SCHLUSS,
  GERAETE,
  WUNSCH_FAKTEN,
  WUNSCH_OPTIONEN,
  WUNSCH_VERWEISE,
  ZUSAGEN,
  ZUSAGEN_ID,
  ZUSAGEN_TITEL,
  bewerbenLabel,
  paketRollen,
  paketZeilen,
} from '../vorteile/vorteile-text';
import { FACTS, FACT_IDS, type FactId } from '@/lib/content/facts';
import { applyPath, jobPath } from '@/lib/jobs/format';
import { getActiveJobs, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';

const NOW = new Date('2026-10-09T12:00:00Z');
const live = getActiveJobs().filter((job) => isJobLive(job, NOW));
const rollen = paketRollen(live, NOW);
const jobOf = (rolle: PaketRolle) => getJobById(rolle.id)!;
const alleWuensche = [...WUNSCH_IDS];
const factIdOfText = (text: string) => FACT_IDS.find((id) => FACTS[id].short === text);
const dir = path.resolve(__dirname, '../vorteile');
const read = (file: string) => readFileSync(path.join(dir, file), 'utf8');
/** Server render with a fixed date (BenefitGrid filters live jobs by date). */
const renderGrid = () => renderToStaticMarkup(createElement(BenefitGrid, { now: NOW }));
/** Sprungziele der Verweiszeilen: Blöcke der Startseite. */
const ZIELE = new Set(['#woche', '#einsatzgebiet', `#${AUSSTATTUNG_ID}`, `#${ZUSAGEN_ID}`]);
const AUSSTATTUNG_LABELS = new Set(['Werkzeug', 'Fahrzeug']);

describe('Konfigurator: Rollen (E-START-024)', () => {
  it('offers the three skilled jobs; the apprenticeship stays a link, the funnel-only job is left out', () => {
    expect(rollen.map((r) => r.id)).toEqual(['anlagenmechaniker-shk', 'kundendiensttechniker-shk', 'obermonteur-projektleiter-shk']);
    for (const rolle of rollen) {
      const job = jobOf(rolle);
      expect(rolle.titel).toBe(job.shortTitle);
      // Display title: same text, soft hyphens from titleShy for 320 px, „/“ bound to the word before.
      expect(rolle.anzeige.replace(/\u00AD/g, '').replace(/\u00A0/g, ' ')).toBe(job.shortTitle);
      expect(rolle.stelleHref).toBe(jobPath(job));
      expect(rolle.bewerbenHref).toBe(applyPath(job));
    }
    expect(bewerbenLabel('Kundendiensttechniker')).toBe('Als Kundendiensttechniker bewerben');
  });

  it('switching the role changes the package rows', () => {
    const texte = rollen.map((rolle) => sichtbareZeilen(rolle, []).map((z) => z.text).join('|'));
    expect(new Set(texte).size).toBe(rollen.length);
  });

  it('without a wish shows the packageExtras in order; Werkzeug and Fahrzeug as one reference to „Werkzeug & Fuhrpark“ (E-023)', () => {
    for (const rolle of rollen) {
      const erwartet: string[][] = [];
      for (const extra of jobOf(rolle).packageExtras) {
        if (!AUSSTATTUNG_LABELS.has(extra.label)) erwartet.push([extra.label, extra.text]);
        else if (!erwartet.some(([etikett]) => etikett === WUNSCH_VERWEISE.ausstattung.etikett)) {
          erwartet.push([WUNSCH_VERWEISE.ausstattung.etikett, WUNSCH_VERWEISE.ausstattung.label]);
        }
      }
      const zeilen = sichtbareZeilen(rolle, []);
      expect(zeilen.map((z) => [z.etikett, z.text])).toEqual(erwartet);
      expect(zeilen.every((z) => !z.passt)).toBe(true);
    }
    expect(sichtbareZeilen(rollen[0]!, []).map((z) => z.key)).toEqual(['verweis-ausstattung', 'extra-Vergütung']);
    expect(sichtbareZeilen(rollen[0]!, [])[0]).toMatchObject({ href: `#${AUSSTATTUNG_ID}`, richtung: 'runter' });
  });

  it('every row is job data, a fact or a reference to a block of the page, word for word (text comparison)', () => {
    const labels = Object.values(WUNSCH_VERWEISE).map((v) => v.label);
    for (const rolle of rollen) {
      const job = jobOf(rolle);
      for (const zeile of sichtbareZeilen(rolle, alleWuensche)) {
        if (zeile.href) {
          expect(ZIELE, `${rolle.id}: ${zeile.href}`).toContain(zeile.href);
          expect(labels).toContain(zeile.text);
          continue;
        }
        const extra = job.packageExtras.find((e) => e.text === zeile.text);
        const factId = factIdOfText(zeile.text);
        expect(extra ?? factId, `${rolle.id}: ${zeile.text}`).toBeDefined();
        if (factId) expect(job.benefitFactIds, `${rolle.id}: ${factId}`).toContain(factId);
      }
    }
  });

  it('a reference only where a matching fact belongs to the job (no generalisation)', () => {
    for (const rolle of rollen) {
      const job = jobOf(rolle);
      for (const zeile of sichtbareZeilen(rolle, alleWuensche).filter((z) => z.href && z.nurAufWunsch)) {
        const wunsch = zeile.wuensche[0]!;
        expect(WUNSCH_VERWEISE[wunsch].fakten.some((id) => job.benefitFactIds.includes(id)), `${rolle.id}: ${wunsch}`).toBe(true);
      }
    }
  });
});

describe('Konfigurator: Fakten mit Vorbehalt', () => {
  it('pending facts appear only on the jobs in onlyForJobIds', () => {
    let seen = 0;
    for (const rolle of rollen) {
      for (const zeile of sichtbareZeilen(rolle, alleWuensche)) {
        const id = factIdOfText(zeile.text);
        const pending = id ? FACTS[id].pending : undefined;
        if (!pending) continue;
        seen += 1;
        expect(pending.onlyForJobIds, `${id} bei ${rolle.id}`).toContain(rolle.id);
      }
    }
    // privateCarOnePercent is cleared for the Obermonteur page only; it is shown there on request.
    expect(seen).toBe(1);
  });

  it('a pending fact is filtered even if a job lists it without clearance', () => {
    const fremd = { ...getJobById('anlagenmechaniker-shk')!, benefitFactIds: ['privateCarOnePercent', 'takeoverGuarantee'] } as Job;
    expect(paketZeilen(fremd, NOW).map((z) => z.key)).not.toContain('fakt-privateCarOnePercent');
  });

  it('payFirstWorkday appears nowhere (fakten-abgleich A3)', () => {
    const all: FactId[] = Object.values(WUNSCH_FAKTEN).flat();
    expect(all).not.toContain('payFirstWorkday');
    const html = renderGrid();
    expect(html).not.toContain(FACTS.payFirstWorkday.short);
    for (const rolle of rollen) {
      expect(sichtbareZeilen(rolle, alleWuensche).map((z) => z.text)).not.toContain(FACTS.payFirstWorkday.short);
    }
    expect([...ZUSAGEN.map((z) => z.id), ...GERAETE.map((g) => g.id)]).not.toContain('payFirstWorkday');
  });
});

describe('Konfigurator: Wünsche (E-START-016)', () => {
  it('has the four wishes of the old funnel, each answered for every role', () => {
    expect(WUNSCH_OPTIONEN.map((w) => w.id)).toEqual([...WUNSCH_IDS]);
    for (const rolle of rollen) {
      for (const wunsch of WUNSCH_IDS) {
        expect(sichtbareZeilen(rolle, [wunsch]).some((z) => z.passt), `${rolle.id}: ${wunsch}`).toBe(true);
      }
    }
  });

  it('marks matching package rows and shows matching facts or a reference only on request', () => {
    const am = rollen[0]!;
    expect(sichtbareZeilen(am, ['verguetung']).filter((z) => z.passt).map((z) => z.etikett)).toEqual(['Vergütung']);
    expect(sichtbareZeilen(am, ['ausstattung']).filter((z) => z.passt).map((z) => z.key)).toEqual(['verweis-ausstattung']);
    const feierabend = sichtbareZeilen(am, ['feierabend']);
    expect(feierabend).toHaveLength(am.zeilen.filter((z) => !z.nurAufWunsch).length + 1);
    expect(feierabend.at(-1)).toMatchObject({ href: '#woche', richtung: 'hoch', passt: true });
    const kd = rollen[1]!;
    expect(sichtbareZeilen(kd, ['naehe']).filter((z) => z.passt).map((z) => z.href)).toEqual(['#einsatzgebiet']);
    const om = rollen[2]!;
    expect(sichtbareZeilen(om, ['ausstattung']).filter((z) => z.passt).map((z) => z.key)).toEqual([
      'fakt-privateCarOnePercent',
      'fakt-fuelCard',
      'verweis-ausstattung',
    ]);
  });

  it('no fact a third time (E-023): the package never repeats 13:30, 35 km, Fernmontage, Tarif, Hilti or the vehicle', () => {
    const anderswo: FactId[] = ['friday1330', 'radius35', 'noFarAssembly', 'aboveTariff', 'noWeekendOnCall', 'noUnpaidOvertime', 'hilti', 'vehicle'];
    for (const rolle of rollen) {
      const texte = sichtbareZeilen(rolle, alleWuensche).map((z) => z.text).join(' | ');
      for (const id of anderswo) expect(texte, `${rolle.id}: ${id}`).not.toContain(FACTS[id].short);
      for (const wort of ['13:30', '35 km', 'Hilti', 'Sortimo']) expect(texte, `${rolle.id}: ${wort}`).not.toContain(wort);
    }
  });

  it('keeps the hero figures out of the default package (each fact at most twice per page)', () => {
    const heroFacts = HERO_STATS.map((s) => FACTS[s.factId].short);
    for (const rolle of rollen) {
      for (const zeile of sichtbareZeilen(rolle, [])) expect(heroFacts).not.toContain(zeile.text);
    }
  });

  it('announces role and matches in one sentence', () => {
    const am = rollen[0]!;
    expect(paketStatus(am, sichtbareZeilen(am, []), [])).toBe('2 Zeilen im Paket als Anlagenmechaniker SHK.');
    const mitWunsch = sichtbareZeilen(am, ['verguetung', 'feierabend']);
    expect(paketStatus(am, mitWunsch, ['verguetung', 'feierabend'])).toBe(
      '3 Zeilen im Paket als Anlagenmechaniker SHK. 2 passen zu deiner Auswahl.',
    );
  });

  it('toggles wishes in their fixed order', () => {
    expect(wunschUmschalten(['naehe'], 'feierabend', true)).toEqual(['feierabend', 'naehe']);
    expect(wunschUmschalten(['feierabend', 'naehe'], 'feierabend', false)).toEqual(['naehe']);
  });

  it('cannot pass the wishes on: /bewerbung knows no parameter for them yet (R5-BEW-01)', () => {
    for (const rolle of rollen) expect(rolle.bewerbenHref).toMatch(/^\/bewerbung\?stelle=[a-z0-9-]+$/);
  });
});

describe('Zusagen und Werkzeug & Fuhrpark (E-START-025, -026)', () => {
  it('six promises from the facts, none pending or time-limited, none a hero figure', () => {
    expect(ZUSAGEN.length).toBeLessThanOrEqual(8);
    for (const zusage of ZUSAGEN) {
      expect(FACTS[zusage.id].pending).toBeUndefined();
      expect(FACTS[zusage.id].validUntil).toBeUndefined();
      expect(HERO_STATS.map((s) => s.factId)).not.toContain(zusage.id);
      expect(zusage.titel).toBe(FACTS[zusage.id].short);
    }
  });

  it('working hours only as the short measure Mo–Do; 13:30 stays with the hero and the week (E-023)', () => {
    const zeit = ZUSAGEN.find((z) => z.id === 'noUnpaidOvertime')!;
    expect(zeit.text).toBe(FACTS.noUnpaidOvertime.long);
    expect(zeit.mass).toBe('Mo–Do 07:00–16:45 Uhr');
    expect(FACTS.workingHours.short.startsWith(zeit.mass!)).toBe(true);
    const html = renderGrid();
    expect(html).not.toContain(FACTS.workingHours.long);
    expect(html).not.toContain('13:30');
  });

  it('the promises carry a neutral title, no „for all“ that the job data do not cover', () => {
    expect(ZUSAGEN_TITEL).toBe('Unsere Zusagen');
    expect(ZUSAGEN_TITEL).not.toMatch(/alle/i);
    expect(renderGrid()).toContain(`<h3 id="${ZUSAGEN_ID}"`);
  });

  it('equipment rows carry the label box with a family icon (as at the hero drawing)', () => {
    const html = renderGrid();
    const block = html.slice(html.indexOf('id="ausstattung"'));
    expect(block.match(/data-zeichnung="etikettkasten"/g)).toHaveLength(GERAETE.length);
    GERAETE.forEach((geraet, i) => expect(block).toContain(`0${i + 1} · ${geraet.etikett}`));
  });

  it('equipment: Hilti, vehicle, measurement tools, iPad from the facts, workwear below', () => {
    expect(GERAETE.map((g) => g.id)).toEqual(['hilti', 'vehicle', 'measurementTools', 'ipadSmartphone']);
    for (const geraet of GERAETE) {
      expect(geraet.titel).toBe(FACTS[geraet.id].short);
      expect(geraet.text).toBe(FACTS[geraet.id].long);
    }
    expect(AUSSTATTUNG_SCHLUSS).toBe(FACTS.workwear.long);
  });
});

describe('BenefitGrid (#vorteile) server render', () => {
  const html = renderGrid();

  it('meets the acceptance texts: 07:00, unpaid overtime, measurement tools', () => {
    expect(html).toContain('id="vorteile"');
    expect(html).toContain('07:00');
    expect(html).toContain('unbezahlten Überstunden');
    expect(html).toContain('Messtechnik');
    expect(html).toContain(`id="${AUSSTATTUNG_ID}"`);
    // E-START-026: /#ausstattung springt zum Unterblock „Werkzeug & Fuhrpark“
    expect(AUSSTATTUNG_ID).toBe('ausstattung');
    expect(html).toMatch(/<div id="ausstattung"[^>]*><h3 id="ausstattung-titel"[^>]*>Werkzeug &amp; Fuhrpark<\/h3>/);
    expect(html.match(/id="ausstattung"/g)).toHaveLength(1);
  });

  it('Hilti and the vehicle stand in exactly one block of the section: „Werkzeug & Fuhrpark“ (E-023)', () => {
    const [vorher, ab] = html.split('id="ausstattung"');
    for (const wort of ['Hilti', 'Sortimo', 'Servicefahrzeug']) {
      expect(vorher, wort).not.toContain(wort);
      expect(ab, wort).toContain(wort);
    }
    expect(vorher).toContain(`href="#${AUSSTATTUNG_ID}"`);
  });

  it('head in the pattern of the hero: label above the h2, wall surface with the pipe divider', () => {
    expect(html).toMatch(/<section class="[^"]*bg-surface-2[^"]*"[^>]*id="vorteile"/);
    expect(html).toContain('<p class="text-etikett text-ink-muted">Vorteile</p>');
    expect(html).toContain('data-zeichnung="leitungstrenner"');
  });

  it('without JavaScript shows the default role: real radio group, checkboxes and a live region', () => {
    const radios = html.match(/<input type="radio"[^>]*>/g) ?? [];
    expect(radios).toHaveLength(3);
    expect(radios.filter((r) => r.includes('checked=""'))).toHaveLength(1);
    expect(radios[0]).toContain('checked=""');
    expect(html.match(/<input type="checkbox"[^>]*>/g)).toHaveLength(4);
    expect(html).toMatch(/<fieldset[^>]*><legend[^>]*>Deine Stelle<\/legend>/);
    expect(html).toMatch(/role="status" aria-live="polite"[^>]*>2 Zeilen im Paket als Anlagenmechaniker SHK\.</);
    const am = getJobById('anlagenmechaniker-shk')!;
    expect(html).toContain(`href="${applyPath(am)}"`);
    expect(html).toContain('Als Anlagenmechaniker SHK bewerben');
    for (const extra of am.packageExtras) {
      if (AUSSTATTUNG_LABELS.has(extra.label)) expect(html).not.toContain(extra.text);
      else expect(html).toContain(extra.text);
    }
  });

  it('without JavaScript nothing contradicts: roles and wishes are locked until hydration', () => {
    const fieldsets = html.match(/<fieldset[^>]*>/g) ?? [];
    expect(fieldsets).toHaveLength(2);
    for (const f of fieldsets) expect(f).toContain('disabled=""');
  });

  it('mobile order role → package → wishes (DOM), desktop places the package right of both', () => {
    const rolle = html.indexOf('Deine Stelle');
    const paket = html.indexOf('role="status"');
    const wunsch = html.indexOf('besonders wichtig');
    expect(rolle).toBeLessThan(paket);
    expect(paket).toBeLessThan(wunsch);
    expect(html).toContain('lg:col-start-6 lg:row-span-2 lg:row-start-1');
  });

  it('heading order: h2, then h3 per block, h4 per item', () => {
    const levels = [...html.matchAll(/<h([1-6])/g)].map((m) => Number(m[1]));
    expect(levels[0]).toBe(2);
    expect(levels).not.toContain(1);
    expect(levels.filter((l) => l === 3)).toHaveLength(3);
    expect(levels.filter((l) => l === 4)).toHaveLength(ZUSAGEN.length + GERAETE.length);
  });

  it('uses each fact text at most once in the section', () => {
    for (const id of FACT_IDS) {
      const long = FACTS[id].long;
      expect(html.split(long).length - 1, id).toBeLessThanOrEqual(1);
    }
  });

  it('own files use the icon family, tokens only, and one small client island', () => {
    for (const file of ['PaketKonfigurator.tsx', 'Zusagen.tsx', 'Ausstattung.tsx', 'vorteile-text.ts', 'paket.ts']) {
      const src = read(file);
      expect(src, file).not.toMatch(/lucide-react/);
      expect(src, file).not.toMatch(/text-\[|font-mono|\buppercase\b|#[0-9a-fA-F]{6}\b/);
    }
    const insel = read('PaketKonfigurator.tsx');
    expect(insel.startsWith("'use client';")).toBe(true);
    // Only pure modules reach the client: no registry, facts or icon glyphs (zod stays on the server).
    expect(insel).not.toMatch(/@\/lib\/jobs|@\/lib\/content|@\/components\/icons/);
    expect(read('paket.ts')).not.toMatch(/^import (?!type)/m);
    expect(readFileSync(path.resolve(__dirname, '../BenefitGrid.tsx'), 'utf8')).not.toMatch(/lucide-react/);
  });
});
