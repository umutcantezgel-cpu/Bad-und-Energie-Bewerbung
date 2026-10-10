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
  ZUSAGEN,
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

  it('without a wish shows exactly the packageExtras of the job, in order', () => {
    for (const rolle of rollen) {
      const zeilen = sichtbareZeilen(rolle, []);
      expect(zeilen.map((z) => [z.etikett, z.text])).toEqual(jobOf(rolle).packageExtras.map((e) => [e.label, e.text]));
      expect(zeilen.every((z) => !z.passt)).toBe(true);
    }
  });

  it('every row is job data or a fact, word for word (text comparison)', () => {
    for (const rolle of rollen) {
      const job = jobOf(rolle);
      for (const zeile of sichtbareZeilen(rolle, alleWuensche)) {
        const extra = job.packageExtras.find((e) => e.text === zeile.text);
        const factId = factIdOfText(zeile.text);
        expect(extra ?? factId, `${rolle.id}: ${zeile.text}`).toBeDefined();
        if (factId) expect(job.benefitFactIds, `${rolle.id}: ${factId}`).toContain(factId);
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
    const html = renderToStaticMarkup(createElement(BenefitGrid));
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

  it('marks matching package rows and shows matching facts only on request', () => {
    const am = rollen[0]!;
    expect(sichtbareZeilen(am, ['verguetung']).filter((z) => z.passt).map((z) => z.etikett)).toEqual(['Vergütung']);
    expect(sichtbareZeilen(am, ['ausstattung']).filter((z) => z.passt).map((z) => z.etikett)).toEqual(['Fahrzeug', 'Werkzeug']);
    const feierabend = sichtbareZeilen(am, ['feierabend']);
    expect(feierabend).toHaveLength(am.zeilen.filter((z) => !z.nurAufWunsch).length + 1);
    expect(feierabend.at(-1)).toMatchObject({ text: FACTS.friday1330.short, passt: true });
    const kd = rollen[1]!;
    expect(sichtbareZeilen(kd, ['naehe']).filter((z) => z.passt).map((z) => z.text)).toEqual([FACTS.radius35.short]);
  });

  it('keeps the hero figures out of the default package (each fact at most twice per page)', () => {
    const heroFacts = HERO_STATS.map((s) => FACTS[s.factId].short);
    for (const rolle of rollen) {
      for (const zeile of sichtbareZeilen(rolle, [])) expect(heroFacts).not.toContain(zeile.text);
    }
  });

  it('announces role and matches in one sentence', () => {
    const am = rollen[0]!;
    expect(paketStatus(am, sichtbareZeilen(am, []), [])).toBe('3 Zeilen im Paket als Anlagenmechaniker SHK.');
    const mitWunsch = sichtbareZeilen(am, ['verguetung', 'feierabend']);
    expect(paketStatus(am, mitWunsch, ['verguetung', 'feierabend'])).toBe(
      '4 Zeilen im Paket als Anlagenmechaniker SHK. 2 passen zu deiner Auswahl.',
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

  it('working hours only as the short measure (the full sentence belongs to the week section)', () => {
    const zeit = ZUSAGEN.find((z) => z.id === 'noUnpaidOvertime')!;
    expect(zeit.text).toBe(FACTS.noUnpaidOvertime.long);
    expect(zeit.mass).toBe(FACTS.workingHours.short);
    expect(renderToStaticMarkup(createElement(BenefitGrid))).not.toContain(FACTS.workingHours.long);
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
  const html = renderToStaticMarkup(createElement(BenefitGrid));

  it('meets the acceptance texts: 07:00, unpaid overtime, measurement tools', () => {
    expect(html).toContain('id="vorteile"');
    expect(html).toContain('07:00');
    expect(html).toContain('unbezahlten Überstunden');
    expect(html).toContain('Messtechnik');
    expect(html).toContain(`id="${AUSSTATTUNG_ID}"`);
  });

  it('without JavaScript shows the default role: real radio group, checkboxes and a live region', () => {
    const radios = html.match(/<input type="radio"[^>]*>/g) ?? [];
    expect(radios).toHaveLength(3);
    expect(radios.filter((r) => r.includes('checked=""'))).toHaveLength(1);
    expect(radios[0]).toContain('checked=""');
    expect(html.match(/<input type="checkbox"[^>]*>/g)).toHaveLength(4);
    expect(html).toMatch(/<fieldset[^>]*><legend[^>]*>Deine Stelle<\/legend>/);
    expect(html).toMatch(/role="status" aria-live="polite"[^>]*>3 Zeilen im Paket als Anlagenmechaniker SHK\.</);
    const am = getJobById('anlagenmechaniker-shk')!;
    expect(html).toContain(`href="${applyPath(am)}"`);
    expect(html).toContain('Als Anlagenmechaniker SHK bewerben');
    for (const extra of am.packageExtras) expect(html).toContain(extra.text);
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
