import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { MAIN_JOB_SLUG, isTouch } from './site';

/** Testdaten. Der Name ist so gewählt, dass er in keiner URL zufällig vorkommt. */
export const APPLICANT = {
  name: 'Mara Testfeld',
  firstName: 'Mara',
  phone: '0151 23456789',
  /** Kennzeichnende Teile, die nie in einer URL stehen dürfen. */
  urlNeedles: ['testfeld', '23456789'],
} as const;

export const DRAFT_KEY = 'be:apply-draft:v1';
export const LEGACY_DOSSIER_KEY = 'bad_energie_dossier';
export const PAGE_FLOW_PATH = `/bewerbung?stelle=${MAIN_JOB_SLUG}`;
export const JOB_PAGE_PATH = `/jobs/${MAIN_JOB_SLUG}`;

export const QUESTIONS = {
  qualification: { heading: 'Was trifft auf dich zu?', answer: 'Geselle, 2–5 Jahre', slug: 'erfahrung' },
  start: { heading: 'Ab wann könntest du anfangen?', answer: 'Sofort', slug: 'start' },
  contact: { heading: 'Wie erreichen wir dich?', slug: 'kontakt' },
} as const;

export type FlowVariant = 'page' | 'embedded';

export function flowRoot(page: Page, variant: FlowVariant): Locator {
  return page.locator(`[data-apply-flow="${variant}"]`);
}

/**
 * Wartet, bis React den Flow hydriert hat (vorher lösen Taps nichts aus). Der eingebettete Flow der
 * Stellenseite lädt und hydriert erst in Reichweite (V6-A2, HydrateNear): darum erst hinscrollen wie der
 * Sprung über „Jetzt bewerben“ (#bewerben), Anfang des Flows unter dem Kopf (scroll-padding-top).
 */
export async function waitForHydration(root: Locator): Promise<void> {
  await expect(root).toBeVisible();
  if ((await root.getAttribute('data-apply-flow')) === 'embedded') {
    await root.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  }
  await expect
    .poll(() => root.evaluate((element) => Object.keys(element).some((key) => key.startsWith('__reactFiber'))), {
      message: 'Flow ist hydriert',
    })
    .toBe(true);
}

/** Zählt Taps bzw. Klicks (ROADMAP §6: Happy Path in ≤ 3 Taps plus Tippen). */
export class TapCounter {
  count = 0;
  private readonly testInfo: TestInfo;

  constructor(testInfo: TestInfo) {
    this.testInfo = testInfo;
  }

  async tap(target: Locator): Promise<void> {
    this.count += 1;
    if (isTouch(this.testInfo)) await target.tap();
    else await target.click();
  }
}

export function choice(root: Locator, name: string): Locator {
  return root.getByRole('button', { name, exact: true });
}

export function stepHeading(root: Locator, name: string): Locator {
  return root.getByRole('heading', { name, exact: true });
}

export function nameField(root: Locator): Locator {
  return root.getByRole('textbox', { name: 'Name', exact: true });
}

export function phoneField(root: Locator): Locator {
  return root.getByRole('textbox', { name: 'Telefonnummer', exact: true });
}

export function submitButton(root: Locator): Locator {
  return root.getByRole('button', { name: /^(Bewerbung absenden|Erneut senden)$/ });
}

/** Beantwortet beide Fragen des Fachkräfte-Sets per Tap; danach steht der Kontaktschritt. */
export async function answerQuestions(root: Locator, taps: TapCounter): Promise<void> {
  await expect(stepHeading(root, QUESTIONS.qualification.heading)).toBeVisible();
  await taps.tap(choice(root, QUESTIONS.qualification.answer));
  await expect(stepHeading(root, QUESTIONS.start.heading)).toBeVisible();
  await taps.tap(choice(root, QUESTIONS.start.answer));
  await expect(stepHeading(root, QUESTIONS.contact.heading)).toBeVisible();
}

export async function fillContact(root: Locator): Promise<void> {
  await nameField(root).fill(APPLICANT.name);
  await phoneField(root).fill(APPLICANT.phone);
}

/**
 * Merkt sich jede URL der Seite (Navigationen, pushState) und jede Anfrage-URL. Personendaten
 * gehören in keine davon (ROADMAP §9: keine personenbezogenen Daten in der URL).
 */
export function recordUrls(page: Page): () => string[] {
  const urls: string[] = [];
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) urls.push(frame.url());
  });
  page.on('request', (request) => urls.push(request.url()));
  return () => [...urls, page.url()];
}

export function expectNoPersonalDataIn(urls: readonly string[]): void {
  const leaks = urls.filter((url) => {
    const decoded = safeDecode(url).toLowerCase();
    return APPLICANT.urlNeedles.some((needle) => decoded.includes(needle));
  });
  expect(leaks, 'URLs mit Name oder Telefonnummer').toEqual([]);
}

export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

/** Danke-Seite mit Vorname und Bewerbungsnummer. */
export async function expectThankYou(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/bewerbung\/danke$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Danke, ${APPLICANT.firstName}.`);
  await expect(page.locator('main#main')).toContainText(/BE-\d{2}-[A-Z0-9]+/);
}
