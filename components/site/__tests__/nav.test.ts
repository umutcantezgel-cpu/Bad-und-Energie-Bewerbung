import { describe, expect, it } from 'vitest';
import { VARIANTE_PFAD } from '@/lib/apply/params';
import {
  APPLY_VARIANT_PATH,
  ARBEITEN_HUB_PATH,
  EINSATZGEBIET_HUB_PATH,
  NAV_ITEMS,
  SHORT_APPLY_LABEL,
  SHORT_FLOW_LABEL,
  STICKY_BAR_HIDE_SELECTOR,
  applyLabelFor,
  focusModeExitLabel,
  getStickyApplyAction,
  hasStickyApplyBar,
  isCurrentNavItem,
  isFocusMode,
  isKeyboardOpen,
  jobSlugFromPath,
  navCurrent,
  subNavCurrent,
} from '../nav';
import { getActiveJobs } from '@/lib/jobs/registry';
import { jobPath } from '@/lib/jobs/format';
import { BREADCRUMB_EINSATZGEBIET, BREADCRUMB_JOBS } from '@/lib/content/breadcrumbs';
import { EINSATZGEBIET_PATH, getHubKreise, getPublishedPlaces, kreisPath, placePath } from '@/lib/places/registry';
import { ARBEITEN_NAME, ARBEITEN_PATH, getThemen, themaPath } from '@/lib/themen/registry';

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

  it('says „Abbrechen“ on the prerendered variants too (server path after the proxy rewrite, browser /bewerbung)', () => {
    expect(APPLY_VARIANT_PATH).toBe(VARIANTE_PFAD);
    expect(focusModeExitLabel('/bewerbung/variante/initiativ/ohne')).toBe('Abbrechen');
    expect(focusModeExitLabel('/bewerbung/variante/keine/unterlagen')).toBe('Abbrechen');
    expect(isFocusMode('/bewerbung/variante/initiativ/ohne')).toBe(true);
  });
});

// E-028: Die neuen Seiten hängen in der Hauptnavigation (Kopf, Menü), nicht nur im Fuß.
describe('NAV_ITEMS', () => {
  it('Stellen, Arbeiten bei uns, Einsatzgebiet und FAQ, jeweils mit dem Namen der Brotkrümel', () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual(['Stellen', 'Arbeiten bei uns', 'Einsatzgebiet', 'FAQ']);
    expect(NAV_ITEMS.map((item) => item.href)).toEqual(['/jobs', ARBEITEN_PATH, EINSATZGEBIET_PATH, '/#faq']);
    // nav.ts bleibt ohne Importe (Client-Bündel); die Pfade gleichen den Registries
    expect(ARBEITEN_HUB_PATH).toBe(ARBEITEN_PATH);
    expect(EINSATZGEBIET_HUB_PATH).toBe(EINSATZGEBIET_PATH);
    // ein Ankertext, ein Ziel: gleiche Namen wie Brotkrümel und Hub
    expect(NAV_ITEMS[0]).toEqual(BREADCRUMB_JOBS);
    expect(NAV_ITEMS[1]).toEqual({ href: ARBEITEN_PATH, label: ARBEITEN_NAME });
    expect(NAV_ITEMS[2]).toEqual(BREADCRUMB_EINSATZGEBIET);
  });
});

describe('navCurrent und subNavCurrent (aria-current)', () => {
  const [stellen, arbeiten, gebiet, faq] = NAV_ITEMS;

  it('marks the hub as the page and every page below it as the current section', () => {
    expect(navCurrent(gebiet, EINSATZGEBIET_PATH)).toBe('page');
    expect(navCurrent(arbeiten, ARBEITEN_PATH)).toBe('page');
    expect(navCurrent(stellen, '/jobs')).toBe('page');
    for (const place of getPublishedPlaces()) expect(navCurrent(gebiet, placePath(place)), place.slug).toBe('true');
    for (const kreis of getHubKreise()) expect(navCurrent(gebiet, kreisPath(kreis)), kreis.slug).toBe('true');
    for (const thema of getThemen()) expect(navCurrent(arbeiten, themaPath(thema)), thema.slug).toBe('true');
    for (const job of getActiveJobs()) expect(navCurrent(stellen, jobPath(job))).toBe('true');
    expect(navCurrent(gebiet, `${EINSATZGEBIET_PATH}/`)).toBe('page');
  });

  it('treats the ISR path /index exactly like the home page (Vercel re-renders / as /index, React #418)', () => {
    for (const item of [gebiet, arbeiten, faq]) expect(navCurrent(item, '/index')).toBe(navCurrent(item, '/'));
    expect(isFocusMode('/index')).toBe(false);
    expect(focusModeExitLabel('/index')).toBe(focusModeExitLabel('/'));
  });

  it('marks nothing elsewhere and never an anchor', () => {
    expect(navCurrent(gebiet, '/einsatzgebietx')).toBeUndefined();
    expect(navCurrent(arbeiten, '/jobs')).toBeUndefined();
    expect(navCurrent(faq, '/')).toBeUndefined();
    expect(navCurrent(gebiet, '/')).toBeUndefined();
  });

  it('marks a sub-link only on its own page, an anchor never', () => {
    const kreis = getHubKreise()[0];
    expect(subNavCurrent(kreisPath(kreis), kreisPath(kreis))).toBe('page');
    expect(subNavCurrent(kreisPath(kreis), `${kreisPath(kreis)}/`)).toBe('page');
    expect(subNavCurrent(kreisPath(kreis), EINSATZGEBIET_PATH)).toBeUndefined();
    expect(subNavCurrent(`${EINSATZGEBIET_PATH}#orte`, EINSATZGEBIET_PATH)).toBeUndefined();
    expect(subNavCurrent(themaPath(getThemen()[0]), themaPath(getThemen()[1]))).toBeUndefined();
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
    for (const path of ['/', '/index', '/jobs', '/datenschutz', '/jobs/gibt-es-nicht']) {
      expect(getStickyApplyAction(path, labels)).toEqual({ href: '/bewerbung', label: 'Jetzt bewerben', inPageFlow: false });
    }
  });

  it('falls back to /bewerbung when the page has no embedded flow (labels older than the page)', () => {
    const job = getActiveJobs()[0];
    expect(getStickyApplyAction(jobPath(job), labels, false)).toEqual({
      href: '/bewerbung',
      label: 'Jetzt bewerben',
      inPageFlow: false,
    });
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

// V6-B: ein Ankertext zeigt auf genau ein Ziel. „Jetzt bewerben“ führt immer nach /bewerbung; der Ersatz für
// „Als … bewerben“ auf Stellenseiten springt zum Flow und heißt darum anders, und er ist nicht länger.
describe('SHORT_FLOW_LABEL', () => {
  it('differs from „Jetzt bewerben“ and fits wherever that did', () => {
    expect(SHORT_FLOW_LABEL).toBe('Hier bewerben');
    expect(SHORT_FLOW_LABEL).not.toBe(SHORT_APPLY_LABEL);
    expect(SHORT_FLOW_LABEL.length).toBeLessThanOrEqual(SHORT_APPLY_LABEL.length);
  });

  it('„Jetzt bewerben“ never jumps to the flow on the page', () => {
    for (const path of ['/', '/jobs', '/datenschutz', ...getActiveJobs().map(jobPath)]) {
      for (const flowOnPage of [true, false]) {
        const action = getStickyApplyAction(path, labels, flowOnPage);
        if (action?.label === SHORT_APPLY_LABEL) expect(action.href).toBe('/bewerbung');
        if (action?.inPageFlow) expect(action.label).not.toBe(SHORT_APPLY_LABEL);
      }
    }
  });
});

describe('hasStickyApplyBar', () => {
  it('matches where getStickyApplyAction renders the bar (the footer reserves its height there only)', () => {
    for (const path of ['/', '/jobs', '/datenschutz', '/jobs/anlagenmechaniker-shk-wetzlar', '/bewerbung', '/bewerbung/mappe']) {
      expect(hasStickyApplyBar(path)).toBe(getStickyApplyAction(path, labels) !== null);
    }
    expect(hasStickyApplyBar('/bewerbung/danke')).toBe(false);
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
