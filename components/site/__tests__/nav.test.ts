import { describe, expect, it } from 'vitest';
import {
  NAV_ITEMS,
  STICKY_BAR_HIDE_SELECTOR,
  applyLabelFor,
  focusModeExitLabel,
  getStickyApplyAction,
  isCurrentNavItem,
  isFocusMode,
  isKeyboardOpen,
  jobSlugFromPath,
} from '../nav';
import { getActiveJobs } from '@/lib/jobs/registry';
import { jobPath } from '@/lib/jobs/format';

const labels = Object.fromEntries(getActiveJobs().map((job) => [job.slug, applyLabelFor(job)]));

describe('isFocusMode', () => {
  it.each([
    ['/bewerbung', true],
    ['/bewerbung/', true],
    ['/bewerbung/danke', true],
    ['/bewerbung/mappe', true],
    ['/bewerbung?stelle=x', true],
    ['/bewerbungstipps', false],
    ['/', false],
    ['/jobs/anlagenmechaniker-shk-wetzlar', false],
    [null, false],
  ])('%s → %s', (path, expected) => {
    expect(isFocusMode(path)).toBe(expected);
  });
});

describe('focusModeExitLabel', () => {
  it('says „Abbrechen“ only inside the flow', () => {
    expect(focusModeExitLabel('/bewerbung')).toBe('Abbrechen');
    expect(focusModeExitLabel('/bewerbung/')).toBe('Abbrechen');
    expect(focusModeExitLabel('/bewerbung/danke')).toBe('Zur Startseite');
    expect(focusModeExitLabel('/bewerbung/mappe')).toBe('Zur Startseite');
  });
});

describe('isCurrentNavItem', () => {
  const stellen = NAV_ITEMS.find((item) => item.href === '/jobs')!;
  const faq = NAV_ITEMS.find((item) => item.href === '/#faq')!;

  it('marks /jobs and job pages as current for „Stellen“', () => {
    expect(isCurrentNavItem(stellen, '/jobs')).toBe(true);
    expect(isCurrentNavItem(stellen, '/jobs/kundendiensttechniker-waermepumpe-wetzlar')).toBe(true);
    expect(isCurrentNavItem(stellen, '/jobsuche')).toBe(false);
    expect(isCurrentNavItem(stellen, '/')).toBe(false);
  });

  it('never marks in-page anchors as current', () => {
    expect(isCurrentNavItem(faq, '/')).toBe(false);
  });
});

describe('jobSlugFromPath', () => {
  it.each([
    ['/jobs/anlagenmechaniker-shk-wetzlar', 'anlagenmechaniker-shk-wetzlar'],
    ['/jobs/anlagenmechaniker-shk-wetzlar/', 'anlagenmechaniker-shk-wetzlar'],
    ['/jobs', null],
    ['/jobs/a/b', null],
    ['/', null],
  ])('%s → %s', (path, expected) => {
    expect(jobSlugFromPath(path)).toBe(expected);
  });
});

describe('applyLabelFor', () => {
  it('uses „Als … bewerben“ for skilled roles and a grammatical label for the apprenticeship', () => {
    expect(applyLabelFor({ shortTitle: 'Kundendiensttechniker', category: 'kundendienst' })).toBe(
      'Als Kundendiensttechniker bewerben',
    );
    expect(applyLabelFor({ shortTitle: 'Ausbildung Anlagenmechaniker', category: 'ausbildung' })).toBe(
      'Für die Ausbildung bewerben',
    );
  });
});

describe('getStickyApplyAction', () => {
  it('is hidden in focus mode', () => {
    expect(getStickyApplyAction('/bewerbung', labels)).toBeNull();
    expect(getStickyApplyAction('/bewerbung/danke', labels)).toBeNull();
  });

  it('links to /bewerbung everywhere else', () => {
    for (const path of ['/', '/jobs', '/datenschutz', '/jobs/gibt-es-nicht']) {
      expect(getStickyApplyAction(path, labels)).toEqual({ href: '/bewerbung', label: 'Jetzt bewerben', inPageFlow: false });
    }
  });

  it('jumps to the embedded flow on every published job page', () => {
    for (const job of getActiveJobs()) {
      const action = getStickyApplyAction(jobPath(job), labels);
      expect(action).toEqual({ href: '#bewerben', label: applyLabelFor(job), inPageFlow: true });
    }
  });

  it('ignores inherited object keys as slugs', () => {
    expect(getStickyApplyAction('/jobs/constructor', labels)?.inPageFlow).toBe(false);
  });

  it('hide selector covers the flow anchor and marked CTAs', () => {
    expect(STICKY_BAR_HIDE_SELECTOR).toBe('#bewerben, [data-primary-cta]');
  });
});

describe('isKeyboardOpen', () => {
  it('needs a focused text field', () => {
    expect(isKeyboardOpen({ editableFocused: false, layoutHeight: 844, visualHeight: 400 })).toBe(false);
  });

  it('detects a clearly shrunken visual viewport', () => {
    expect(isKeyboardOpen({ editableFocused: true, layoutHeight: 844, visualHeight: 480 })).toBe(true);
  });

  it('ignores small changes such as collapsing browser toolbars or a hardware keyboard', () => {
    expect(isKeyboardOpen({ editableFocused: true, layoutHeight: 844, visualHeight: 790 })).toBe(false);
    expect(isKeyboardOpen({ editableFocused: true, layoutHeight: 844, visualHeight: 844 })).toBe(false);
  });

  it('falls back to focus alone without visualViewport', () => {
    expect(isKeyboardOpen({ editableFocused: true, layoutHeight: 844, visualHeight: null })).toBe(true);
  });
});
