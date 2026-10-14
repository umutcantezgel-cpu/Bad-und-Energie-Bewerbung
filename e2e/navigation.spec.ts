import { expect, test } from '@playwright/test';
import { EINSATZGEBIET_PATH, getHubKreise, kreisPath } from '../lib/places/registry';
import { ARBEITEN_PATH, getThemen, themaPath } from '../lib/themen/registry';
import { findSmallTouchTargets, isDesktop, isTouch } from './support/site';

/** Regex für einen Namen am Anfang des zugänglichen Namens („Lahn-Dill-Kreis 26 Orte“). */
const beginntMit = (text: string) => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);

/**
 * Anker der Hauptnavigation auf der Startseite (/#faq): Ein Klick springt sofort zum Abschnitt, auch solange die Inseln
 * unter der Falz (HydrateNear, V6-A2) noch Server-HTML sind. Vorher wartete der Router auf deren Hydrierung, und der
 * Klick blieb wirkungslos, bis jemand das Einsatzgebiet erreichte. Seit E-028 ist FAQ der einzige Anker der Navigation.
 */
test('Kopf-Anker „FAQ“ springt oben auf der Startseite ohne Scrollen zum Abschnitt', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  if (isTouch(testInfo)) {
    await page.getByRole('button', { name: 'Menü', exact: true }).click();
    await page.getByRole('dialog', { name: 'Menü' }).getByRole('link', { name: 'FAQ', exact: true }).click();
  } else {
    await page.getByRole('banner').getByRole('link', { name: 'FAQ', exact: true }).click();
  }

  await expect(page).toHaveURL(/\/#faq$/, { timeout: 3000 });
  await expect(page.locator('#faq')).toBeInViewport();
});

/** E-028: Die neuen Seiten hängen im Kopf. Beide Hubs sind ein Klick, jede Kreis- und Themenseite zwei. */
test.describe('Kopf am Desktop: Arbeiten bei uns und Einsatzgebiet', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(!isDesktop(testInfo), 'Die Navigation steht ab 64em mit feinem Zeiger im Kopf.');
  });

  test('Hubs sind Links, aria-current markiert Seite und Bereich', async ({ page }) => {
    await page.goto('/jobs');
    const kopf = page.getByRole('banner');

    await kopf.getByRole('link', { name: 'Einsatzgebiet', exact: true }).click();
    await expect(page).toHaveURL(EINSATZGEBIET_PATH);
    await expect(kopf.getByRole('link', { name: 'Einsatzgebiet', exact: true })).toHaveAttribute('aria-current', 'page');

    await kopf.getByRole('link', { name: 'Arbeiten bei uns', exact: true }).click();
    await expect(page).toHaveURL(ARBEITEN_PATH);
    await expect(kopf.getByRole('link', { name: 'Arbeiten bei uns', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(kopf.getByRole('link', { name: 'Einsatzgebiet', exact: true })).not.toHaveAttribute('aria-current', /.+/);
  });

  test('Untermenü öffnet beim Überfahren; ein Kreis-Hub ist einen Klick entfernt', async ({ page }) => {
    await page.goto('/jobs');
    const kopf = page.getByRole('banner');
    const unter = page.locator('#kopf-unter-einsatzgebiet');
    await expect(unter).toBeHidden();

    await kopf.getByRole('link', { name: 'Einsatzgebiet', exact: true }).hover();
    await expect(unter).toBeVisible();
    for (const kreis of getHubKreise()) await expect(unter.getByRole('link', { name: beginntMit(kreis.shortName) })).toBeVisible();
    await expect(unter.getByRole('link', { name: /^Alle \d+ Orte von A bis Z$/ })).toHaveAttribute('href', `${EINSATZGEBIET_PATH}#orte`);

    const kreis = getHubKreise()[0];
    await unter.getByRole('link', { name: beginntMit(kreis.shortName) }).click();
    await expect(page).toHaveURL(kreisPath(kreis));
    await expect(kopf.getByRole('link', { name: 'Einsatzgebiet', exact: true })).toHaveAttribute('aria-current', 'true');
  });

  test('Escape schließt das per Maus geöffnete Untermenü, auch ohne Fokus in der Navigation (WCAG 1.4.13)', async ({ page }) => {
    await page.goto('/jobs');
    const eintrag = page.getByRole('banner').getByRole('link', { name: 'Arbeiten bei uns', exact: true });
    const unter = page.locator('#kopf-unter-arbeiten');

    await eintrag.hover();
    await expect(unter).toBeVisible();
    // Der Fokus steht auf body, nicht in der Navigation
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(unter).toBeHidden();

    // Zeiger raus und wieder drauf: Das Untermenü öffnet wieder
    await page.mouse.move(8, 600);
    await eintrag.hover();
    await expect(unter).toBeVisible();
  });

  test('Tastatur: Fokus öffnet das Untermenü, Tab führt hinein, Escape schließt es', async ({ page }) => {
    await page.goto('/');
    const kopf = page.getByRole('banner');
    const unter = page.locator('#kopf-unter-arbeiten');
    const thema = getThemen()[0];

    // Fokus per Tastatur (Shift+Tab, Tab), damit :focus-visible greift
    await kopf.getByRole('link', { name: 'Arbeiten bei uns', exact: true }).focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(kopf.getByRole('link', { name: 'Arbeiten bei uns', exact: true })).toBeFocused();
    await expect(unter).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(unter.getByRole('link', { name: thema.name, exact: true })).toBeFocused();

    // Escape schließt und führt zurück auf den Eintrag (WCAG 1.4.13)
    await page.keyboard.press('Escape');
    await expect(unter).toBeHidden();
    await expect(kopf.getByRole('link', { name: 'Arbeiten bei uns', exact: true })).toBeFocused();

    // Tab überspringt das geschlossene Untermenü; der nächste Eintrag öffnet seins
    await page.keyboard.press('Tab');
    await expect(kopf.getByRole('link', { name: 'Einsatzgebiet', exact: true })).toBeFocused();
    await expect(page.locator('#kopf-unter-einsatzgebiet')).toBeVisible();
    await expect(unter).toBeHidden();

    // Immer nur ein Untermenü: Der Zeiger auf „Arbeiten bei uns“ verdrängt das per Tastatur offene
    await kopf.getByRole('link', { name: 'Arbeiten bei uns', exact: true }).hover();
    await expect(unter).toBeVisible();
    await expect(page.locator('#kopf-unter-einsatzgebiet')).toBeHidden();
    await page.mouse.move(8, 600);
    await expect(page.locator('#kopf-unter-einsatzgebiet')).toBeVisible();

    // Zurück, hinein, Enter: das Thema öffnet
    await page.keyboard.press('Shift+Tab');
    await expect(unter).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(unter.getByRole('link', { name: thema.name, exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(themaPath(thema));
  });
});

/**
 * Tablets ab 64em (iPad quer 1180 × 820): kein Hover, also keine Untermenüs im Kopf. Sie behalten den Menüknopf, das
 * Menü führt alle Unterseiten (Kreis-Hubs, Themen) wie am Handy.
 */
test.describe('Tablet quer mit Touch: Menü statt Untermenüs', () => {
  test.use({ viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true });

  test.beforeEach(({}, testInfo) => {
    test.skip(!isDesktop(testInfo), 'Einmal je Farbschema genügt (Desktop-Projekte mit Touch-Tablet-Kontext).');
  });

  test('Menüknopf sichtbar, das Menü listet alle Kreis-Hubs; keine Navigation im Kopf', async ({ page }) => {
    await page.goto('/jobs');
    const kopf = page.getByRole('banner');
    await expect(kopf.getByRole('navigation', { name: 'Hauptnavigation' })).toBeHidden();
    await expect(kopf.getByRole('link', { name: 'Bewerben', exact: true })).toBeVisible();

    const menueKnopf = page.getByRole('button', { name: 'Menü', exact: true });
    await expect(menueKnopf).toBeVisible();
    await menueKnopf.click();
    const menue = page.getByRole('dialog', { name: 'Menü' });
    await expect(menue).toBeVisible();
    for (const kreis of getHubKreise()) {
      await expect(menue.getByRole('link', { name: beginntMit(kreis.shortName) })).toHaveAttribute('href', kreisPath(kreis));
    }
    for (const thema of getThemen()) {
      await expect(menue.getByRole('link', { name: thema.name, exact: true })).toHaveAttribute('href', themaPath(thema));
    }
    expect(await findSmallTouchTargets(page, 'dialog[open]'), 'Trefferfläche kleiner als 44 × 44 px').toEqual([]);
  });
});

/** E-028: Im Menü am Handy stehen dieselben Einträge, darunter die Unterseiten als kompakte Liste. */
test.describe('Menü am Handy: Kreis- und Themenseiten', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(!isTouch(testInfo), 'Das Menü gibt es unter 64em und auf Touch-Geräten.');
  });

  test('ein Kreis-Hub und ein Thema sind einen Tipp entfernt, aria-current folgt', async ({ page }) => {
    await page.goto('/');
    const menueKnopf = page.getByRole('button', { name: 'Menü', exact: true });
    const menue = page.getByRole('dialog', { name: 'Menü' });

    // Kreis-Hub ganz unten in der Liste: Der Dialog scrollt selbst
    const kreis = getHubKreise().at(-1)!;
    await menueKnopf.click();
    await expect(menue).toBeVisible();
    await menue.getByRole('link', { name: beginntMit(kreis.shortName) }).click();
    await expect(page).toHaveURL(kreisPath(kreis));
    await expect(menue).toBeHidden();

    const thema = getThemen().at(-1)!;
    await menueKnopf.click();
    await expect(menue.getByRole('link', { name: 'Einsatzgebiet', exact: true })).toHaveAttribute('aria-current', 'true');
    await menue.getByRole('link', { name: thema.name, exact: true }).click();
    await expect(page).toHaveURL(themaPath(thema));

    await menueKnopf.click();
    await expect(menue.getByRole('link', { name: 'Arbeiten bei uns', exact: true })).toHaveAttribute('aria-current', 'true');
    await expect(menue.getByRole('link', { name: thema.name, exact: true })).toHaveAttribute('aria-current', 'page');
  });

  test('jede Zeile im offenen Menü ist mindestens 44 × 44 px groß', async ({ page }) => {
    await page.goto('/einsatzgebiet/herborn');
    await page.getByRole('button', { name: 'Menü', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Menü' })).toBeVisible();
    expect(await findSmallTouchTargets(page, 'dialog[open]'), 'Trefferfläche kleiner als 44 × 44 px').toEqual([]);
  });
});

/**
 * E-029 (Plan §B): Im Fuß stehen nur noch die Kreis-Hubs und „Alle Orte im Einsatzgebiet“, keine 54 Ortslinks. Jeder
 * Weg ist mindestens 44 × 44 px groß, ein Tipp auf einen Kreis-Hub führt hin.
 */
test('Fuß: Kreis-Hubs und „Alle Orte im Einsatzgebiet“, jeder Weg mindestens 44 × 44 px', async ({ page }) => {
  await page.goto('/einsatzgebiet/herborn');
  const orte = page.getByRole('contentinfo').getByRole('navigation', { name: 'Orte im Einsatzgebiet' });
  await expect(orte).toBeVisible();
  const hubs = getHubKreise();
  for (const kreis of hubs) {
    await expect(orte.getByRole('link', { name: beginntMit(kreis.shortName) })).toHaveAttribute('href', kreisPath(kreis));
  }
  await expect(orte.getByRole('link', { name: 'Alle Orte im Einsatzgebiet', exact: true })).toHaveAttribute('href', EINSATZGEBIET_PATH);
  await expect(orte.getByRole('link')).toHaveCount(hubs.length + 1);
  expect(await findSmallTouchTargets(page, 'nav[aria-labelledby="footer-einsatzgebiet"]'), 'Trefferfläche kleiner als 44 × 44 px').toEqual([]);

  await orte.getByRole('link', { name: beginntMit(hubs[0].shortName) }).click();
  await expect(page).toHaveURL(kreisPath(hubs[0]));
});
