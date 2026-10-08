import { expect, test } from '@playwright/test';
import {
  APPLICANT,
  DRAFT_KEY,
  JOB_PAGE_PATH,
  LEGACY_DOSSIER_KEY,
  PAGE_FLOW_PATH,
  QUESTIONS,
  TapCounter,
  answerQuestions,
  choice,
  expectNoPersonalDataIn,
  expectThankYou,
  fillContact,
  flowRoot,
  nameField,
  phoneField,
  recordUrls,
  safeDecode,
  stepHeading,
  submitButton,
  waitForHydration,
} from './support/flow';
import { expectNoAxeViolations, findSmallTouchTargets, isDesktop, isTouch, useOwnClientIp } from './support/site';

/** Bewerbungsflow (ROADMAP §6, §9): Szenarien für Seite und eingebettete Variante. */

test.beforeEach(async ({ page }) => {
  await useOwnClientIp(page);
});

test.describe('Happy Path', () => {
  test('eingebettet auf der Stellenseite: 3 Taps plus Tippen bis zur Danke-Seite', async ({ page }, testInfo) => {
    const urls = recordUrls(page);
    const taps = new TapCounter(testInfo);
    await page.goto(JOB_PAGE_PATH);
    const flow = flowRoot(page, 'embedded');
    await waitForHydration(flow);

    await answerQuestions(flow, taps);
    await fillContact(flow);
    await expectNoAxeViolations(page, testInfo, { include: '[data-apply-flow="embedded"]' });
    await taps.tap(submitButton(flow));

    await expectThankYou(page);
    expect(taps.count).toBeLessThanOrEqual(3);
    expectNoPersonalDataIn(urls());
  });

  test('Bewerbungsseite mit ?stelle=: 3 Taps plus Tippen bis zur Danke-Seite', async ({ page }, testInfo) => {
    const urls = recordUrls(page);
    const taps = new TapCounter(testInfo);
    await page.goto(PAGE_FLOW_PATH);
    const flow = flowRoot(page, 'page');
    await waitForHydration(flow);
    await expect(page).toHaveURL(/schritt=erfahrung/);

    await answerQuestions(flow, taps);
    await expect(page).toHaveURL(/schritt=kontakt/);
    await fillContact(flow);
    if (isTouch(testInfo)) {
      expect(await findSmallTouchTargets(page, '[data-apply-flow="page"]'), 'Trefferfläche < 44 px').toEqual([]);
    }
    await taps.tap(submitButton(flow));

    await expectThankYou(page);
    expect(taps.count).toBeLessThanOrEqual(3);
    expectNoPersonalDataIn(urls());
    // Danke-Seite mit Bewerbung (die Seitenprüfung sieht nur den Zustand ohne Bewerbung).
    await expectNoAxeViolations(page, testInfo);
    if (isTouch(testInfo)) expect(await findSmallTouchTargets(page), 'Trefferfläche < 44 px').toEqual([]);

    // Abgeschickt: Der Entwurf ist gelöscht, Zurück führt nicht in einen ausgefüllten Flow.
    expect(await page.evaluate((key) => sessionStorage.getItem(key), DRAFT_KEY)).toBeNull();
  });

  test('nur mit der Tastatur', async ({ page }, testInfo) => {
    test.skip(!isDesktop(testInfo), 'Tastaturbedienung wird auf dem Desktop geprüft.');
    const urls = recordUrls(page);
    await page.goto(PAGE_FLOW_PATH);
    const flow = flowRoot(page, 'page');
    await waitForHydration(flow);

    // Von oben per Tab bis zur gewünschten Antwort.
    const target = choice(flow, QUESTIONS.qualification.answer);
    for (let presses = 0; presses < 40; presses += 1) {
      if (await target.evaluate((element) => element === document.activeElement)) break;
      await page.keyboard.press('Tab');
    }
    await expect(target).toBeFocused();
    await page.keyboard.press('Enter');

    // Nach jedem Schritt steht der Fokus auf der neuen Frage.
    await expect(stepHeading(flow, QUESTIONS.start.heading)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(choice(flow, QUESTIONS.start.answer)).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(stepHeading(flow, QUESTIONS.contact.heading)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(nameField(flow)).toBeFocused();
    await page.keyboard.type(APPLICANT.name);
    // Enter im Namensfeld springt zur Telefonnummer, Enter dort sendet ab.
    await page.keyboard.press('Enter');
    await expect(phoneField(flow)).toBeFocused();
    await page.keyboard.type(APPLICANT.phone);
    await page.keyboard.press('Enter');

    await expectThankYou(page);
    expectNoPersonalDataIn(urls());
  });
});

test.describe('Navigation und Entwurf', () => {
  test('Browser-Zurück und -Vor wechseln zwischen den Schritten', async ({ page }, testInfo) => {
    const taps = new TapCounter(testInfo);
    await page.goto(PAGE_FLOW_PATH);
    const flow = flowRoot(page, 'page');
    await waitForHydration(flow);
    await expect(page).toHaveURL(/schritt=erfahrung/);

    await taps.tap(choice(flow, QUESTIONS.qualification.answer));
    await expect(page).toHaveURL(/schritt=start/);
    await expect(stepHeading(flow, QUESTIONS.start.heading)).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/schritt=erfahrung/);
    await expect(stepHeading(flow, QUESTIONS.qualification.heading)).toBeVisible();
    await expect(choice(flow, QUESTIONS.qualification.answer)).toHaveAttribute('aria-pressed', 'true');

    await page.goForward();
    await expect(page).toHaveURL(/schritt=start/);
    await expect(stepHeading(flow, QUESTIONS.start.heading)).toBeVisible();

    await taps.tap(choice(flow, QUESTIONS.start.answer));
    await expect(page).toHaveURL(/schritt=kontakt/);
    await page.goBack();
    await expect(page).toHaveURL(/schritt=start/);
    await expect(choice(flow, QUESTIONS.start.answer)).toHaveAttribute('aria-pressed', 'true');

    // Der Zurück-Knopf im Flow nutzt dieselbe History.
    await page.goForward();
    await expect(stepHeading(flow, QUESTIONS.contact.heading)).toBeVisible();
    await flow.getByRole('button', { name: 'Zurück', exact: true }).click();
    await expect(page).toHaveURL(/schritt=start/);
    await expect(stepHeading(flow, QUESTIONS.start.heading)).toBeVisible();
  });

  test('Neuladen stellt den Entwurf wieder her', async ({ page }, testInfo) => {
    const taps = new TapCounter(testInfo);
    await page.goto(PAGE_FLOW_PATH);
    const flow = flowRoot(page, 'page');
    await waitForHydration(flow);
    await answerQuestions(flow, taps);
    await fillContact(flow);

    // Entwurf liegt in sessionStorage (nach kurzer Verzögerung gespeichert).
    await expect.poll(() => page.evaluate((key) => sessionStorage.getItem(key) ?? '', DRAFT_KEY)).toContain(APPLICANT.name);
    expect(await page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();

    await page.reload();
    await waitForHydration(flowRoot(page, 'page'));
    const restored = flowRoot(page, 'page');
    await expect(page).toHaveURL(/schritt=kontakt/);
    await expect(stepHeading(restored, QUESTIONS.contact.heading)).toBeVisible();
    await expect(nameField(restored)).toHaveValue(APPLICANT.name);
    await expect(phoneField(restored)).toHaveValue(APPLICANT.phone);

    await page.goBack();
    await expect(choice(restored, QUESTIONS.start.answer)).toHaveAttribute('aria-pressed', 'true');
  });

  test('alter localStorage-Eintrag bad_energie_dossier wird gelöscht', async ({ page }) => {
    await page.goto('/bewerbung');
    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ name: 'Alt Eintrag', phone: '0151 0000000' })), LEGACY_DOSSIER_KEY);
    await page.reload();
    await waitForHydration(flowRoot(page, 'page'));
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), LEGACY_DOSSIER_KEY)).toBeNull();
  });
});

test.describe('Fehler und Prüfung', () => {
  test('503 zeigt den WhatsApp-Rückfallweg und bleibt im Flow', async ({ page }, testInfo) => {
    let calls = 0;
    await page.route('**/api/bewerbung', async (route) => {
      calls += 1;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          code: 'SERVICE_UNAVAILABLE',
          message: 'Die Bewerbung kann gerade nicht angenommen werden.',
        }),
      });
    });
    const taps = new TapCounter(testInfo);
    await page.goto(PAGE_FLOW_PATH);
    const flow = flowRoot(page, 'page');
    await waitForHydration(flow);
    await answerQuestions(flow, taps);
    await fillContact(flow);
    await taps.tap(submitButton(flow));

    const alert = page.getByRole('alert').filter({ hasText: 'Das hat nicht geklappt' });
    await expect(alert).toBeVisible();
    const whatsapp = alert.getByRole('link', { name: /WhatsApp/ });
    const href = (await whatsapp.getAttribute('href')) ?? '';
    expect(href).toMatch(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//);
    expect(safeDecode(href)).toContain(APPLICANT.name);
    await expect(alert.getByRole('link', { name: /Anrufen/ })).toHaveAttribute('href', /^tel:/);

    // Kein Fake-Erfolg: Angaben bleiben, keine Danke-Seite.
    expect(calls).toBe(1);
    await expect(submitButton(flow)).toHaveText('Erneut senden');
    await expect(page).toHaveURL(/\/bewerbung\?/);
    await expect(nameField(flow)).toHaveValue(APPLICANT.name);
    await expectNoAxeViolations(page, testInfo, { include: '[data-apply-flow="page"]' });
    if (isTouch(testInfo)) {
      expect(await findSmallTouchTargets(page, '[data-apply-flow="page"]'), 'Trefferfläche < 44 px').toEqual([]);
    }
  });

  test('leeres Kontaktformular: Fokus springt zum ersten fehlerhaften Feld', async ({ page }, testInfo) => {
    let calls = 0;
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/bewerbung') calls += 1;
    });
    const taps = new TapCounter(testInfo);
    await page.goto(PAGE_FLOW_PATH);
    const flow = flowRoot(page, 'page');
    await waitForHydration(flow);
    await answerQuestions(flow, taps);

    await taps.tap(submitButton(flow));
    await expect(nameField(flow)).toBeFocused();
    await expect(nameField(flow)).toHaveAttribute('aria-invalid', 'true');
    await expect(phoneField(flow)).toHaveAttribute('aria-invalid', 'true');

    // Name ausgefüllt: jetzt die Telefonnummer.
    await nameField(flow).fill(APPLICANT.name);
    await taps.tap(submitButton(flow));
    await expect(phoneField(flow)).toBeFocused();

    expect(calls).toBe(0);
    await expect(page).toHaveURL(/schritt=kontakt/);
    await expectNoAxeViolations(page, testInfo, { include: '[data-apply-flow="page"]' });
  });

  test('kein Doppel-Submit bei schnellem Doppelklick', async ({ page }, testInfo) => {
    let calls = 0;
    await page.route('**/api/bewerbung', async (route) => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });
    const taps = new TapCounter(testInfo);
    await page.goto(PAGE_FLOW_PATH);
    const flow = flowRoot(page, 'page');
    await waitForHydration(flow);
    await answerQuestions(flow, taps);
    await fillContact(flow);

    await submitButton(flow).dblclick();
    await expectThankYou(page);
    expect(calls).toBe(1);
  });
});
