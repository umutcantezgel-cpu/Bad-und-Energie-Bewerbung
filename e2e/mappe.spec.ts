import { readFileSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
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

test('Betreff der Mappe (L5): eigener Text in Vorschau und Bewerbung, „Vorschlag nehmen“ folgt wieder der Stelle', async ({ page }, testInfo) => {
  await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
  const betreff = page.getByRole('textbox', { name: 'Betreff', exact: true });
  await waitForHydration(betreff);
  const vorschlag = `Bewerbung als ${MAIN_JOB.title}`;
  const eigener = 'Bewerbung als Anlagenmechaniker SHK – Schwerpunkt Wärmepumpen';
  const ansage = page.locator('[data-mappe-werkbank] > p[aria-live="polite"]');

  // Vorschlag aus der Stelle; ein eigener Text steht auf beiden Blättern der Vorschau
  await expect(betreff).toHaveValue(vorschlag);
  await expect(page.getByText('Vorschlag aus der Stelle. Er passt sich an, bis du ihn selbst änderst.')).toBeVisible();
  await betreff.fill(eigener);
  const vorschau = page.locator('section[aria-labelledby="mappe-vorschau-title"]');
  await expect(vorschau.getByText(eigener, { exact: true })).toHaveCount(2);
  await expect(page.getByText('Dein eigener Betreff. Ein Wechsel der Stelle ändert ihn nicht mehr.')).toBeVisible();
  await expectNoAxeViolations(page, testInfo);
  if (isTouch(testInfo)) expect(await findSmallTouchTargets(page, 'main'), 'Trefferfläche < 44 px').toEqual([]);

  // Stellenwechsel: Der eigene Betreff bleibt; „Vorschlag nehmen“ nimmt den der neuen Stelle, Fokus im Feld
  const stelle = page.getByLabel('Worauf bewirbst du dich?');
  await stelle.selectOption({ value: 'initiativ' });
  await expect(betreff).toHaveValue(eigener);
  await page.getByRole('button', { name: 'Vorschlag nehmen' }).click();
  await expect(betreff).toHaveValue('Initiativbewerbung');
  await expect(betreff).toBeFocused();
  await expect(page.getByRole('button', { name: 'Vorschlag nehmen' })).toHaveCount(0);
  await expect(ansage).toHaveText('Vorschlag übernommen.');
  await stelle.selectOption({ label: MAIN_JOB.title });
  await expect(betreff).toHaveValue(vorschlag);

  // Mit eigenem Betreff bewerben: Er geht mit der Mappe mit
  await betreff.fill(eigener);
  await page.getByRole('button', { name: WORK_STYLE }).click();
  await page.getByRole('button', { name: 'Mit dieser Mappe bewerben' }).click();
  await expect(page).toHaveURL(new RegExp(`/bewerbung\\?stelle=${MAIN_JOB_SLUG}`));
  const flow = flowRoot(page, 'page');
  await waitForHydration(flow);
  const taps = new TapCounter(testInfo);
  await answerQuestions(flow, taps);
  await fillContact(flow);
  const requestPromise = page.waitForRequest((request) => new URL(request.url()).pathname === '/api/bewerbung');
  await taps.tap(submitButton(flow));
  const payload = (await requestPromise).postDataJSON() as { mappe?: { subject?: string } };
  expect(payload.mappe?.subject).toBe(eigener);
  await expectThankYou(page);
});

test('Zeichen-Hinweis der Mappe (L5): kyrillisches Wort und Emoji im Anschreiben, höflich angesagt, axe ohne Verstöße', async ({ page }, testInfo) => {
  await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
  const letter = page.getByRole('textbox', { name: 'Anschreiben' });
  await waitForHydration(letter);
  await page.getByLabel('Vor- und Nachname').fill('Max Müller');
  await page.getByRole('button', { name: WORK_STYLE }).click();
  await expect(letter).toHaveValue(/Max Müller/);
  const hinweis = page.locator('[data-mappe-zeichen]');
  await expect(hinweis).toHaveCount(0);

  await letter.fill(`${await letter.inputValue()}\n\nДякую! 😊`);
  const notiz = page.getByRole('note', { name: 'Diese Zeichen fehlen im PDF' });
  await expect(notiz).toBeVisible();
  await expect(notiz.getByRole('list', { name: 'Damit entsteht kein PDF:', exact: true })).toHaveText('Anschreiben: Д я к у ю');
  await expect(notiz.getByRole('list', { name: 'Fallen weg, der übrige Text bleibt:', exact: true })).toHaveText('Anschreiben: 😊');
  await expect(notiz).toContainText('Ersetze diese Zeichen oder nimm „Drucken“. Das Team bekommt deine Mappe auch ohne PDF, als Text in der E-Mail.');
  // Höfliche Ansage über die Live-Region der Mappe, erst nach einer Pause beim Tippen
  await expect(page.locator('[data-mappe-werkbank] > p[aria-live="polite"]')).toHaveText(
    'Hinweis: Einige Zeichen fehlen im PDF. Welche das sind, steht unter „Per WhatsApp schicken“.',
  );
  await expectNoAxeViolations(page, testInfo);
  if (!isTouch(testInfo)) {
    // Am Computer bleibt die Vorschau mit dem höheren Pult sichtbar (Prüfrunde L5: vorher 32 px unter dem Fensterrand)
    const rahmen = page.locator('section[aria-labelledby="mappe-vorschau-title"]');
    await rahmen.focus();
    const box = await rahmen.boundingBox();
    expect(box?.height ?? 0, 'Höhe der Vorschau').toBeGreaterThanOrEqual(200);
    expect(box?.y ?? Infinity, 'Vorschau nach dem Fokus im Fenster').toBeLessThan(page.viewportSize()!.height);
  }
  if (isTouch(testInfo)) expect(await findSmallTouchTargets(page, 'main'), 'Trefferfläche < 44 px').toEqual([]);
  await page.setViewportSize({ width: 320, height: 720 });
  // Nach dem Verkleinern setzt der ResizeObserver den Maßstab der Vorschau einen Frame später: messen, wenn das Layout steht
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), { message: 'Querscroll bei 320 px' })
    .toBeLessThanOrEqual(0);

  // Zeichen ersetzt: Der Hinweis verschwindet
  await letter.fill((await letter.inputValue()).replace('Дякую! 😊', 'Danke!'));
  await expect(hinweis).toHaveCount(0);
});

/** Bewerbung aus der Mappe absenden und die gesendete Mappe zurückgeben. */
async function mitMappeBewerben(page: Page, testInfo: TestInfo) {
  await page.getByRole('button', { name: 'Mit dieser Mappe bewerben' }).click();
  await expect(page).toHaveURL(new RegExp(`/bewerbung\\?stelle=${MAIN_JOB_SLUG}`));
  const flow = flowRoot(page, 'page');
  await waitForHydration(flow);
  const taps = new TapCounter(testInfo);
  await answerQuestions(flow, taps);
  await fillContact(flow);
  const requestPromise = page.waitForRequest((request) => new URL(request.url()).pathname === '/api/bewerbung');
  await taps.tap(submitButton(flow));
  const payload = (await requestPromise).postDataJSON() as { mappe?: Record<string, unknown> };
  await expectThankYou(page);
  return payload.mappe;
}

/** Ohne Querscroll bei 320 px (der Maßstab der Vorschau folgt einen Frame später). */
async function ohneQuerscroll(page: Page) {
  await page.setViewportSize({ width: 320, height: 720 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), { message: 'Querscroll bei 320 px' })
    .toBeLessThanOrEqual(0);
}

test('Mehr im Lebenslauf (L5): Kurzprofil, Sprache, Führerschein, Interessen und eigener Abschnitt in Vorschau und Bewerbung', async ({ page }, testInfo) => {
  await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
  const profil = page.getByRole('textbox', { name: 'Kurzprofil', exact: true });
  await waitForHydration(profil);
  await expect(page.getByText('Angaben zu Religion, Gesundheit, Partei oder Gewerkschaft brauchen wir für deine Bewerbung nicht.')).toBeVisible();

  await profil.fill('Ruhig und genau, seit 2019 im Kundendienst.');
  await page.getByRole('button', { name: 'Sprache hinzufügen' }).click();
  const sprache = page.getByRole('list', { name: 'Sprachen' }).getByRole('listitem').first();
  await expect(sprache.getByRole('textbox', { name: 'Sprache', exact: true })).toBeFocused();
  // Die Knöpfe nennen die Sprache, nicht nur „Eintrag“ (Berufserfahrung und Schule heißen weiter so)
  await expect(sprache.getByRole('button', { name: 'Sprache 1 entfernen' })).toBeVisible();
  await sprache.getByRole('textbox', { name: 'Sprache', exact: true }).fill('Deutsch');
  await sprache.getByRole('textbox', { name: /^Niveau/ }).fill('Muttersprache');
  await page.getByRole('button', { name: 'Klasse BE', exact: true }).click();
  await page.getByRole('button', { name: 'Klasse B', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Klasse B', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('textbox', { name: 'Interessen', exact: true }).fill('Angeln');
  await page.getByRole('textbox', { name: 'Überschrift des eigenen Abschnitts' }).fill('Weiterbildungen');
  await page.getByRole('textbox', { name: 'Text des eigenen Abschnitts' }).fill('Ersthelfer seit 2024');

  // Vorschau: Kurzprofil oben, die neuen Abschnitte hinter den Schwerpunkten, der eigene mit seiner Überschrift
  const lebenslauf = page.locator('article[aria-labelledby="mappe-seite-lebenslauf"]');
  await expect(lebenslauf.locator('h4')).toHaveText([
    'Kurzprofil',
    'Berufserfahrung',
    'Schule und Ausbildung',
    'Schwerpunkte',
    'Sprachen',
    'Führerschein',
    'Interessen',
    'Weiterbildungen',
  ]);
  for (const text of ['Ruhig und genau, seit 2019 im Kundendienst.', 'Deutsch (Muttersprache)', 'Klassen B und BE', 'Angeln', 'Ersthelfer seit 2024']) {
    await expect(lebenslauf).toContainText(text);
  }
  await expectNoAxeViolations(page, testInfo);
  if (isTouch(testInfo)) expect(await findSmallTouchTargets(page, 'main'), 'Trefferfläche < 44 px').toEqual([]);
  const groesse = page.viewportSize()!;
  await ohneQuerscroll(page);
  await page.setViewportSize(groesse);

  await page.getByRole('button', { name: WORK_STYLE }).click();
  const mappe = await mitMappeBewerben(page, testInfo);
  expect(mappe).toMatchObject({
    profile: 'Ruhig und genau, seit 2019 im Kundendienst.',
    languages: [{ language: 'Deutsch', level: 'Muttersprache' }],
    drivingLicenses: ['B', 'BE'],
    interests: 'Angeln',
    customText: 'Ersthelfer seit 2024',
  });
  expect(mappe?.sections).toEqual([
    { id: 'profile' },
    { id: 'career' },
    { id: 'education' },
    { id: 'skills' },
    { id: 'languages' },
    { id: 'drivingLicenses' },
    { id: 'interests' },
    { id: 'custom', title: 'Weiterbildungen' },
  ]);
});

test('Aufbau des Lebenslaufs (L5): verschieben, umbenennen und ausblenden; Vorschau und Bewerbung folgen, der Fokus bleibt', async ({ page }, testInfo) => {
  await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
  const profil = page.getByRole('textbox', { name: 'Kurzprofil', exact: true });
  await waitForHydration(profil);
  await page.getByRole('group', { name: 'Schwerpunkte' }).getByRole('button').first().click();
  await profil.fill('Kurzprofil zum Ausblenden');
  await page.getByRole('button', { name: WORK_STYLE }).click();
  const ansage = page.locator('[data-mappe-werkbank] > p[aria-live="polite"]');

  // Schwerpunkte zweimal nach oben: Der Fokus bleibt auf dem Pfeil der verschobenen Zeile
  const hoch = page.getByRole('button', { name: 'Schwerpunkte nach oben verschieben' });
  await hoch.click();
  await expect(hoch).toBeFocused();
  await hoch.click();
  await expect(hoch).toBeFocused();
  await expect(ansage).toHaveText('Schwerpunkte steht jetzt an Stelle 2 von 8.');

  // Umbenennen, „Standardtitel nehmen“ (Fokus zurück ins Feld), wieder umbenennen
  const titel = page.getByRole('textbox', { name: 'Überschrift für „Berufserfahrung“' });
  await titel.fill('Praxis');
  await page.getByRole('button', { name: 'Standardtitel nehmen für „Berufserfahrung“' }).click();
  await expect(titel).toHaveValue('Berufserfahrung');
  await expect(titel).toBeFocused();
  await expect(ansage).toHaveText('Standardtitel übernommen.');
  await titel.fill('Praxis');

  // Kurzprofil ausblenden: weg aus der Vorschau, im Aufbau als ausgeblendet benannt
  const zeigen = page.getByRole('button', { name: 'Im Lebenslauf zeigen: Kurzprofil' });
  await zeigen.click();
  await expect(zeigen).toHaveAttribute('aria-pressed', 'false');
  await expect(ansage).toHaveText('Kurzprofil ausgeblendet.');
  await expect(page.getByText('Ausgeblendet: steht nicht im Lebenslauf und geht nicht mit.')).toBeVisible();
  const lebenslauf = page.locator('article[aria-labelledby="mappe-seite-lebenslauf"]');
  await expect(lebenslauf.locator('h4')).toHaveText(['Schwerpunkte', 'Praxis', 'Schule und Ausbildung']);
  await expect(lebenslauf).not.toContainText('Kurzprofil zum Ausblenden');
  await expectNoAxeViolations(page, testInfo);
  if (isTouch(testInfo)) expect(await findSmallTouchTargets(page, 'main'), 'Trefferfläche < 44 px').toEqual([]);
  const groesse = page.viewportSize()!;
  await ohneQuerscroll(page);
  await page.setViewportSize(groesse);

  const mappe = await mitMappeBewerben(page, testInfo);
  expect(mappe).not.toHaveProperty('profile');
  expect(mappe?.sections).toEqual([
    { id: 'skills' },
    { id: 'career', title: 'Praxis' },
    { id: 'education' },
    { id: 'languages' },
    { id: 'drivingLicenses' },
    { id: 'interests' },
    { id: 'custom' },
  ]);
});

test('Schwerpunkte ausblenden (L5): Die Vorlage nennt sie nicht mehr; im eigenen Brief ein Hinweis mit Sprung ins Anschreiben', async ({ page }, testInfo) => {
  await page.goto(`/bewerbung/mappe?stelle=${MAIN_JOB_SLUG}`);
  const letter = page.getByRole('textbox', { name: 'Anschreiben' });
  await waitForHydration(letter);
  const chip = page.getByRole('group', { name: 'Schwerpunkte' }).getByRole('button').first();
  const schwerpunkt = (await chip.innerText()).trim();
  await chip.click();
  await page.getByRole('button', { name: WORK_STYLE }).click();
  await expect.poll(() => letter.inputValue()).toContain(schwerpunkt);

  const zeigen = page.getByRole('button', { name: 'Im Lebenslauf zeigen: Schwerpunkte' });
  await zeigen.click();
  await expect.poll(() => letter.inputValue()).not.toContain(schwerpunkt);
  await zeigen.click();
  await expect.poll(() => letter.inputValue()).toContain(schwerpunkt);

  // Selbst geänderter Brief: Er bleibt, wie er ist; der Hinweis sagt es und springt ins Feld
  await letter.fill(`${await letter.inputValue()}\nIch freue mich auf ein Gespräch.`);
  await zeigen.click();
  await expect(page.getByText('Dein Anschreiben hast du selbst geändert: Steht darin etwas zu deinen Schwerpunkten, bleibt es dort stehen.')).toBeVisible();
  await page.getByRole('link', { name: 'Zum Anschreiben' }).click();
  await expect(letter).toBeFocused();
  expect(await letter.inputValue()).toContain(schwerpunkt);
  await expectNoAxeViolations(page, testInfo);
  await ohneQuerscroll(page);
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
