import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { jobPath } from '@/lib/jobs/format';
import { getJobBySlug } from '@/lib/jobs/registry';
import { SHORT_APPLY_LABEL, SHORT_FLOW_LABEL, applyLabelFor } from '../nav';
import { StickyApplyBarClient } from '../StickyApplyBarClient';

vi.mock('next/navigation', () => ({ usePathname: () => '/jobs/anlagenmechaniker-shk-wetzlar' }));

const job = getJobBySlug('anlagenmechaniker-shk-wetzlar')!;

/**
 * V6-B: Auf der Stellenseite springt die Leiste zum Flow (#bewerben). Beide Fassungen im Link, die lange
 * („Als … bewerben“) und der Ersatz für schmale Telefone, dürfen nicht „Jetzt bewerben“ heißen: Dieser
 * Ankertext führt im Menü derselben Seite nach /bewerbung.
 */
describe('StickyApplyBar auf einer Stellenseite', () => {
  const html = renderToStaticMarkup(
    createElement(StickyApplyBarClient, {
      jobLabels: { [job.slug]: applyLabelFor(job) },
      whatsappHref: 'https://api.whatsapp.com/send?phone=491608834290&text=Hallo',
    }),
  );
  const link = /<a href="#bewerben"[^>]*>([\s\S]*?)<\/a>/.exec(html)?.[1] ?? '';

  it('springt zum Flow und trägt „Als … bewerben“ mit dem Ersatz „Hier bewerben“', () => {
    expect(jobPath(job)).toBe('/jobs/anlagenmechaniker-shk-wetzlar');
    expect(link).toContain(applyLabelFor(job));
    expect(link).toContain(SHORT_FLOW_LABEL);
    expect(link).not.toContain(SHORT_APPLY_LABEL);
    expect(html).not.toContain('href="/bewerbung"');
  });
});
