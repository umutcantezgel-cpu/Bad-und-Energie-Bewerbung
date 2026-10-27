import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  APPLICANT,
  QUESTIONS,
  TapCounter,
  answerQuestions,
  expectThankYou,
  fillContact,
  flowRoot,
  submitButton,
  waitForHydration,
} from './support/flow';
import { MAIN_JOB_SLUG, PUBLISHED_JOBS, expectNoAxeViolations, findSmallTouchTargets, isTouch, useOwnClientIp } from './support/site';

/** Bewerbungsmappe (ROADMAP §6): Station anlegen, Anschreiben erzeugen, mit der Mappe bewerben. */

const MAIN_JOB = PUBLISHED_JOBS.find((job) => job.slug === MAIN_JOB_SLUG)!;
const STATION = { role: 'Anlagenmechaniker SHK', company: 'Testbetrieb Haustechnik', period: '2019–2024' };
const WORK_STYLE = 'Teamgeist und Zuverlässigkeit';
/** Kleinstes gültiges PNG (1 × 1 px) als Bewerbungsfoto. */
const FOTO_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
/** Kennung des In-App-Browsers von Instagram (iPhone). */
const INSTAGRAM_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 334.0.4.32.98 (iPhone15,2; iOS 17_5; de_DE; de; scale=3.00; 1179x2556; 609529009)';

test.beforeEach(async ({ page }) => {
  await useOwnClientIp(page);
});

test('Station, Anschreiben und „Mit dieser Mappe bewerben“ führen in den Flow mit Mappe', async ({ page }, testInfo) => {
  await page.goto('/bewerbung/mappe');
  const addStation = page.getByRole('button', { name: 'Berufserfahrung hinzufügen' });
  await waitForHydration(addStation);

  // Stelle wählen: bestimmt Betreff und Einleitung.
  await page.getByLabel('Worauf bewirbst du dich?').selectOption({ label: MAIN_JOB.title });

  // Station anlegen; der Fokus springt ins erste Feld des neuen Eintrags.
  await addStation.click();
  const station = page.getByRole('list', { name: 'Berufserfahrung' }).getByRole('listitem').first();
  await expect(station.getByRole('textbox', { name: 'Tätigkeit' })).toBeFocused();
  await station.getByRole('textbox', { name: 'Tätigkeit' }).fill(STATION.role);
  await station.getByRole('textbox', { name: 'Betrieb' }).fill(STATION.company);
  await station.getByRole('textbox', { name: 'Zeitraum' }).fill(STATION.period);

  // Arbeitsstil wählen: Das Anschreiben entsteht aus der Vorlage.
  const letter = page.getByRole('textbox', { name: 'Anschreiben' });
  await page.getByRole('button', { name: WORK_STYLE }).click();
  await expect(page.getByRole('button', { name: WORK_STYLE })).toHaveAttribute('aria-pressed', 'true');
  await expect(letter).toHaveValue(/bewerbe ich mich als/);
  await expect(letter).toHaveValue(/Teamgeist und Verlässlichkeit/);
  const letterText = await letter.inputValue();
  // Editor mit Eintrag und Vorschau (die Seitenprüfung sieht nur den leeren Editor).
  await expectNoAxeViolations(page, testInfo);
  if (isTouch(testInfo)) expect(await findSmallTouchTargets(page, 'main'), 'Trefferfläche < 44 px').toEqual([]);

  await page.getByRole('button', { name: 'Mit dieser Mappe bewerben' }).click();
  await expect(page).toHaveURL(new RegExp(`/bewerbung\\?stelle=${MAIN_JOB_SLUG}`));

  const flow = flowRoot(page, 'page');
  await waitForHydration(flow);
  const taps = new TapCounter(testInfo);
  await answerQuestions(flow, taps);
  await expect(flow.getByText('Deine Bewerbungsmappe wird mitgeschickt.')).toBeVisible();

  // Absenden: Die Mappe hängt an der Bewerbung.
  await fillContact(flow);
  const requestPromise = page.waitForRequest((request) => new URL(request.url()).pathname === '/api/bewerbung');
  await taps.tap(submitButton(flow));
  const payload = (await requestPromise).postDataJSON() as {
    name: string;
    mappe?: { coverLetter: string; careerStations: { role: string; company: string; period: string }[] };
  };
  expect(payload.name).toBe(APPLICANT.name);
  expect(payload.mappe?.coverLetter).toBe(letterText.trim());
  expect(payload.mappe?.careerStations).toEqual([expect.objectContaining(STATION)]);
  await expectThankYou(page);
});

test('Design wählen: Vorschau folgt, axe ohne Verstöße, das Design geht mit der Mappe mit', async ({ page }, testInfo) => {
  await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
  const addStation = page.getByRole('button', { name: 'Berufserfahrung hinzufügen' });
  await waitForHydration(addStation);
  await addStation.click();
  const station = page.getByRole('list', { name: 'Berufserfahrung' }).getByRole('listitem').first();
  await station.getByRole('textbox', { name: 'Tätigkeit' }).fill(STATION.role);
  await station.getByRole('textbox', { name: 'Betrieb' }).fill(STATION.company);
  await station.getByRole('textbox', { name: 'Zeitraum' }).fill(STATION.period);
  await page.getByRole('group', { name: 'Schwerpunkte' }).getByRole('button').first().click();
  await page.getByRole('button', { name: WORK_STYLE }).click();

  // Farbband in Petrol mit Markant: Name (noch Platzhalter) und Kontaktzeile stehen weiß auf dem Band.
  const blatt = page.locator('[data-vorlage]');
  await page.getByRole('button', { name: /^Farbband/ }).click();
  await page.getByText('Petrol', { exact: true }).click();
  await page.getByText('Markant', { exact: true }).click();
  await expect(blatt).toHaveAttribute('data-vorlage', 'farbband');
  await expect(blatt).toHaveAttribute('data-schrift', 'markant');
  await expectNoAxeViolations(page, testInfo);

  // Zweispaltig in Kupfer: Schwerpunkte in der getönten Seitenspalte.
  await page.getByRole('button', { name: /^Zweispaltig/ }).click();
  await page.getByText('Kupfer', { exact: true }).click();
  await expect(blatt).toHaveAttribute('data-vorlage', 'zweispaltig');

  // Foto (bleibt im Browser): Erst damit gibt es die Fotoform; Standard ist „Abgerundet“ wie vor den Designs.
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from(FOTO_PNG, 'base64') });
  await expect(page.getByRole('radio', { name: 'Abgerundet' })).toBeChecked();
  await page.getByText('Rund', { exact: true }).click();
  await expect(blatt).toHaveAttribute('data-fotoform', 'rund');
  await expectNoAxeViolations(page, testInfo);
  if (isTouch(testInfo)) expect(await findSmallTouchTargets(page, 'main'), 'Trefferfläche < 44 px').toEqual([]);

  await page.getByRole('button', { name: 'Mit dieser Mappe bewerben' }).click();
  const flow = flowRoot(page, 'page');
  await waitForHydration(flow);
  const taps = new TapCounter(testInfo);
  await answerQuestions(flow, taps);
  await fillContact(flow);
  const requestPromise = page.waitForRequest((request) => new URL(request.url()).pathname === '/api/bewerbung');
  await taps.tap(submitButton(flow));
  const request = await requestPromise;
  const payload = request.postDataJSON() as { mappe?: { design?: unknown } };
  expect(payload.mappe?.design).toEqual({ vorlage: 'zweispaltig', akzent: 'kupfer', schrift: 'markant' });
  // Foto und Fotoform verlassen das Gerät nicht.
  expect(request.postData() ?? '').not.toMatch(/fotoform|data:image|blob:/);
  await expectThankYou(page);
});

test('Mappe abwählen: Hinweis wechselt, Bewerbung geht ohne Mappe', async ({ page }) => {
  await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
  const workStyle = page.getByRole('button', { name: WORK_STYLE });
  await waitForHydration(workStyle);
  await workStyle.click();
  await expect(page.getByRole('textbox', { name: 'Anschreiben' })).toHaveValue(/Teamgeist und Verlässlichkeit/);
  await page.getByRole('button', { name: 'Mit dieser Mappe bewerben' }).click();
  await expect(page).toHaveURL(/\/bewerbung\?stelle=/);

  const flow = flowRoot(page, 'page');
  await waitForHydration(flow);
  await answerQuestions(flow, new TapCounter(test.info()));
  await expect(flow.getByText('Deine Bewerbungsmappe wird mitgeschickt.')).toBeVisible();
  await flow.getByRole('button', { name: 'Entfernen' }).click();
  await expect(flow.getByText('Deine Bewerbungsmappe wird nicht mitgeschickt.')).toBeVisible();
  await expect(flow.getByRole('heading', { name: QUESTIONS.contact.heading })).toBeVisible();
});

test('„PDF herunterladen“: A4-PDF aus dem Browser mit Foto, Status „Fertig“, axe danach', async ({ page }, testInfo) => {
  await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
  const knopf = page.getByRole('button', { name: 'PDF herunterladen' });
  await waitForHydration(knopf);
  await page.getByLabel('Vor- und Nachname').fill('Max Müller');
  await page.getByLabel('Telefon').fill('0171 2345678');
  await page.getByRole('group', { name: 'Schwerpunkte' }).getByRole('button').first().click();
  await page.getByRole('button', { name: WORK_STYLE }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from(FOTO_PNG, 'base64') });
  await page.getByText('Rund', { exact: true }).click();

  const [download] = await Promise.all([page.waitForEvent('download'), knopf.click()]);
  expect(download.suggestedFilename()).toBe('Bewerbungsmappe_Mueller.pdf');
  const pdf = readFileSync(await download.path()).toString('latin1');
  expect(pdf.startsWith('%PDF-')).toBe(true);
  // Seiten wie seitenZaehlen (lib/mappe/pdf/satz.tsx): Anschreiben und Lebenslauf; das Foto als ein Bild
  expect(pdf.match(/^\/Type \/Page$/gm)).toHaveLength(2);
  expect(pdf.match(/\/Subtype \/Image/g)).toHaveLength(1);
  await expect(page.getByText('Fertig: Bewerbungsmappe_Mueller.pdf (2 Seiten)')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nochmal herunterladen' })).toBeVisible();
  await expectNoAxeViolations(page, testInfo);
  if (isTouch(testInfo)) expect(await findSmallTouchTargets(page, 'main'), 'Trefferfläche < 44 px').toEqual([]);
});

test.describe('Im Instagram-Browser bei 320 px', () => {
  test.use({ userAgent: INSTAGRAM_UA, viewport: { width: 320, height: 720 } });

  test('Hinweis und „Link kopieren“; der Download bleibt, kein Querscroll, axe ohne Verstöße', async ({ page }, testInfo) => {
    await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
    const knopf = page.getByRole('button', { name: 'PDF herunterladen' });
    await waitForHydration(knopf);
    await expect(page.getByText(/^Du bist im Instagram-Browser\. Dort klappt Herunterladen oft nicht\. Bewerben geht trotzdem/)).toBeVisible();
    const kopieren = page.getByRole('button', { name: 'Link kopieren' });
    await expect(kopieren).toBeVisible();
    await kopieren.click();
    // Zwischenablage erlaubt: „Link kopiert.“; verweigert: die Adresse steht markierbar da
    await expect(page.getByText('Link kopiert.').or(page.getByRole('textbox', { name: 'Adresse dieser Seite' }))).toBeVisible();

    // Langer Nachname: Der Dateiname im Status bricht um, statt die Seite zu verbreitern
    await page.getByLabel('Vor- und Nachname').fill('Zoë Müller-Lüdenscheidt');
    const [download] = await Promise.all([page.waitForEvent('download'), knopf.click()]);
    expect(download.suggestedFilename()).toBe('Bewerbungsmappe_Mueller-Luedenscheidt.pdf');
    await expect(page.getByText(/^Fertig: Bewerbungsmappe_Mueller-Luedenscheidt\.pdf/)).toBeVisible();
    const querscroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(querscroll, 'Querscroll bei 320 px').toBeLessThanOrEqual(0);
    await expectNoAxeViolations(page, testInfo);
  });
});

test.describe('Teilen-Menü am Handy (nachgebildet)', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'mobile-light', 'Ein Projekt mit Touch genügt; Chromium hat kein echtes Teilen-Menü.');
  });

  test('„PDF teilen“ und „PDF speichern“; ein Teilen-Fehler lässt beide Knöpfe stehen', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
      Object.defineProperty(navigator, 'share', {
        value: async () => {
          throw new DOMException('verweigert', 'NotAllowedError');
        },
        configurable: true,
      });
    });
    await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
    const knopf = page.getByRole('button', { name: 'PDF herunterladen' });
    await waitForHydration(knopf);
    await page.getByLabel('Vor- und Nachname').fill('Max Müller');
    await page.getByRole('group', { name: 'Schwerpunkte' }).getByRole('button').first().click();
    await page.getByRole('button', { name: WORK_STYLE }).click();
    await knopf.click();
    await expect(page.getByText(/^Dein PDF ist fertig \(\d Seiten?\)\. Teilen oder speichern\?$/)).toBeVisible();

    const teilen = page.getByRole('button', { name: 'PDF teilen' });
    const speichern = page.getByRole('button', { name: 'PDF speichern' });
    await teilen.click();
    await expect(page.getByRole('alert').filter({ hasText: 'Teilen hat nicht geklappt' })).toBeVisible();
    await expect(teilen).toBeVisible();
    await expect(speichern).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent('download'), speichern.click()]);
    expect(download.suggestedFilename()).toBe('Bewerbungsmappe_Mueller.pdf');
    await expectNoAxeViolations(page, testInfo);
  });
});

test.describe('Im Instagram-Browser nach dem Absenden', () => {
  test.use({ userAgent: INSTAGRAM_UA });
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'mobile-light', 'Ein Projekt genügt.');
  });

  test('der Hinweis nennt den Knopf, den es dann gibt: „Mappe nachreichen“', async ({ page }) => {
    const gesendet = { reference: 'BE-26-K7M4QX', followUpToken: 'token.zum.test', firstName: 'Max', jobId: 'anlagenmechaniker-shk', submittedAt: new Date().toISOString() };
    await page.addInitScript((wert) => sessionStorage.setItem('be:application:v1', wert), JSON.stringify(gesendet));
    await page.goto('/bewerbung/mappe');
    await expect(page.getByRole('button', { name: 'Mappe nachreichen' })).toBeVisible();
    await expect(page.getByText(/Nachreichen geht trotzdem: „Mappe nachreichen“ hängt deine Mappe an deine Bewerbung\./)).toBeVisible();
    await expect(page.getByText(/Mit dieser Mappe bewerben/)).toHaveCount(0);
  });
});
