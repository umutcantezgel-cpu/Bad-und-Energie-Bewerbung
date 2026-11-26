import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content';
import { JOB_CATEGORY_LABEL, jobCategoryLabels } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import {
  APPLY_ENDE_SPAETESTENS,
  APPLY_OHNE_LEBENSLAUF,
  META_DESCRIPTION_MAX,
  META_DESCRIPTION_MIN,
  fitDescription,
  jobsHubDescription,
} from '../descriptions';

const liveAt = (date: Date) => getActiveJobs().filter((job) => isJobLive(job, date));

describe('jobsHubDescription (/jobs)', () => {
  // Seit 2026-10-14 sind es sieben Stellenarten (fakten-abgleich S2–S5): Die Liste passt nicht mehr in 155 Zeichen und
  // entfällt nach der Regel „falls back …“ unten. Seit die Zusage „Ohne Lebenslauf in 60 Sek. bewerben.“ vor den
  // Vorteilen steht (bewerbung6), passt sie mit zwei Arten; dann steht sie wörtlich darin.
  const ZWEI = ['anlagenmechaniker-shk', 'ausbildung-anlagenmechaniker-shk'];
  const zwei = (date: Date) => liveAt(date).filter((job) => ZWEI.includes(job.id));

  it('names every live job type and the facts, within 155 characters', () => {
    const jobs = zwei(new Date('2026-10-14T12:00:00Z'));
    const text = jobsHubDescription(jobs);
    expect(text.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(jobCategoryLabels(jobs)).toHaveLength(2);
    for (const label of jobCategoryLabels(jobs)) expect(text).toContain(label);
    const alle = jobsHubDescription(liveAt(new Date('2026-10-14T12:00:00Z')));
    expect(jobCategoryLabels(liveAt(new Date('2026-10-14T12:00:00Z')))).toHaveLength(7);
    expect(alle.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(alle).toMatch(/^Offene SHK-Jobs in Wetzlar & Gießen\. /);
    expect(alle).not.toMatch(/€|Gehalt/);
    expect(text).toContain(FACTS.vacation30.short);
    expect(text).toContain('flexible Arbeitszeiten');
    expect(text).not.toMatch(/13:30|Feierabend|pünktlich/i);
    expect(text).toContain(`Ohne Lebenslauf in ${FACTS.apply60s.value} Sek. bewerben.`);
  });

  it('„Ohne Lebenslauf in 60 Sek. bewerben.“ steht vor den Vorteilen und vor dem Abbruch am Handy (bewerbung6)', () => {
    const live = liveAt(new Date('2026-10-14T12:00:00Z'));
    const stufen = [live, live.filter((job) => !['buero', 'praktikum'].includes(job.category)), zwei(new Date('2026-10-14T12:00:00Z')), ALL_JOBS, []];
    for (const stellen of stufen) {
      const text = jobsHubDescription(stellen);
      const ende = text.indexOf(APPLY_OHNE_LEBENSLAUF) + APPLY_OHNE_LEBENSLAUF.length;
      expect(text, text).toContain(APPLY_OHNE_LEBENSLAUF);
      expect(ende, text).toBeLessThanOrEqual(APPLY_ENDE_SPAETESTENS);
      expect(text.indexOf(APPLY_OHNE_LEBENSLAUF), text).toBeLessThan(text.indexOf(FACTS.vacation30.short));
      expect(text.length, text).toBeGreaterThanOrEqual(META_DESCRIPTION_MIN);
    }
  });

  it('Urlaub und Arbeitszeit nur „je nach Stelle“, solange die Bürostelle live ist (offenFuer, S5, Runde 2)', () => {
    const alle = liveAt(new Date('2026-10-14T12:00:00Z'));
    expect(alle.some((job) => job.category === 'buero')).toBe(true);
    const text = jobsHubDescription(alle);
    expect(text).toBe(
      `Offene SHK-Jobs in Wetzlar & Gießen. Ohne Lebenslauf in ${FACTS.apply60s.value} Sek. bewerben. ${FACTS.noFarAssembly.short}, je nach Stelle ${FACTS.vacation30.short} und flexible Arbeitszeiten.`,
    );
    expect(text).not.toContain(`${FACTS.vacation30.short}, flexible Arbeitszeiten`);
    // Mit dem Schülerpraktikum (Arbeitszeit offen, S4, Runde 3) weiter mit Zusatz, ohne Büro und Praktikum ohne
    expect(jobsHubDescription(alle.filter((job) => job.category !== 'buero'))).toBe(text);
    expect(jobsHubDescription(alle.filter((job) => !['buero', 'praktikum'].includes(job.category)))).not.toContain('je nach Stelle');
  });

  it('drops an expired job type', () => {
    const azubi = ALL_JOBS.find((job) => job.category === 'ausbildung')!;
    const after = new Date(new Date(azubi.validThrough!).getTime() + 24 * 60 * 60 * 1000);
    expect(jobsHubDescription(zwei(new Date(azubi.datePosted)))).toContain(JOB_CATEGORY_LABEL.ausbildung);
    expect(jobsHubDescription(zwei(after))).not.toContain(JOB_CATEGORY_LABEL.ausbildung);
  });

  it('falls back to the text without the list when the list does not fit', () => {
    const text = jobsHubDescription(ALL_JOBS);
    expect(text.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(text).toMatch(/^Offene SHK-Jobs in Wetzlar & Gießen\. /);
  });

  it('without live jobs points to the initiative application', () => {
    const text = jobsHubDescription([]);
    expect(text.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(text).toContain('Initiativbewerbung');
    expect(text).not.toContain('Offene');
  });

  it('lists each job type once', () => {
    expect(jobCategoryLabels([{ category: 'kundendienst' }, { category: 'kundendienst' }])).toEqual(['Kundendienst']);
  });
});

describe('fitDescription', () => {
  it('returns the first candidate within the budget', () => {
    expect(fitDescription('a'.repeat(156), 'kurz', 'auch kurz')).toBe('kurz');
  });

  it('cuts the last candidate at a word boundary if none fits', () => {
    const text = fitDescription(`${'Wort '.repeat(40)}Ende.`);
    expect(text.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(text).toMatch(/Wort…$/);
  });
});
