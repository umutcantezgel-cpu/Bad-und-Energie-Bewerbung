import { describe, expect, it } from 'vitest';
import { FACTS } from '@/lib/content';
import { JOB_CATEGORY_LABEL, jobCategoryLabels } from '@/lib/jobs/format';
import { ALL_JOBS, getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { META_DESCRIPTION_MAX, fitDescription, jobsHubDescription } from '../descriptions';

const liveAt = (date: Date) => getActiveJobs().filter((job) => isJobLive(job, date));

describe('jobsHubDescription (/jobs)', () => {
  it('names every live job type and the facts, within 155 characters', () => {
    const jobs = liveAt(new Date());
    const text = jobsHubDescription(jobs);
    expect(text.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    for (const label of jobCategoryLabels(jobs)) expect(text).toContain(label);
    expect(text).toContain(FACTS.vacation30.short);
    expect(text).toContain(`freitags ab ${FACTS.friday1330.value} frei`);
    expect(text).toContain(`In ${FACTS.apply60s.value} Sek. bewerben.`);
  });

  it('drops an expired job type', () => {
    const azubi = ALL_JOBS.find((job) => job.category === 'ausbildung')!;
    const after = new Date(new Date(azubi.validThrough!).getTime() + 24 * 60 * 60 * 1000);
    expect(jobsHubDescription(liveAt(after))).not.toContain(JOB_CATEGORY_LABEL.ausbildung);
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
