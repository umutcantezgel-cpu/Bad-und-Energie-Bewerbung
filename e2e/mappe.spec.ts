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
