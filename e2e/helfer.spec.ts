import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectNoAxeViolations, MAIN_JOB_SLUG, waitForSettled } from './support/site';

/**
 * Der Helfer (Inhaberwunsch 25.11.2026): die Figur zum Greifen und Werfen und der WhatsApp-Link als Ball.
 *
 * Geprüft wird, was Besucher erleben: Er steht nach dem Laden still unten rechts, lässt sich mit Tastatur und Maus
 * bedienen, zerspringt beim Treffer und baut sich wieder zusammen, lässt sich wegschicken und zurückholen. Der Ball
 * bleibt ein gewöhnlicher Link: Antippen folgt ihm, Ziehen nicht. Im Bewerbungsweg, auf den Rechtsseiten und bei
 * „Bewegung reduzieren“ erscheint nichts.
 */
const FIGUR = 'Helfer: Auswahl öffnen';
const BALL = 'WhatsApp-Ball: Nachricht schreiben (öffnet in neuem Tab)';

const feld = (page: Page): Locator => page.locator('[data-helfer] .hf-feld');
const figur = (page: Page): Locator => page.getByRole('button', { name: FIGUR });
const ball = (page: Page): Locator => page.getByRole('link', { name: BALL });

/** Sammelt console.error und nicht gefangene Fehler. */
function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('console', (meldung) => {
    if (meldung.type() === 'error') fehler.push(`console.error: ${meldung.text()}`);
  });
  page.on('pageerror', (fehlerObjekt) => fehler.push(`pageerror: ${fehlerObjekt.message}`));
  return fehler;
}

/** Lädt die Seite und wartet, bis der Helfer im Leerlauf nachgeladen ist und steht. */
async function mitHelfer(page: Page, pfad = '/'): Promise<void> {
  await page.goto(pfad);
  await expect(feld(page)).toHaveAttribute('data-zustand', 'steht', { timeout: 15_000 });
  await expect(figur(page)).toBeVisible();
}

/** Wartet über den Leerlauf hinaus, in dem der Helfer geladen würde. */
async function leerlaufAbwarten(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise<void>((weiter) => requestIdleCallback(() => setTimeout(() => weiter(), 1200), { timeout: 4500 })),
  );
}

/** Klicks auf Links mitschreiben und nicht ausführen: Der Test öffnet kein WhatsApp. */
async function linkKlicksMitschreiben(page: Page): Promise<() => Promise<string[]>> {
  await page.evaluate(() => {
    const w = window as unknown as { __klicks: string[] };
    w.__klicks = [];
    document.addEventListener(
      'click',
      (e) => {
        const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
        if (a) {
          w.__klicks.push(a.getAttribute('href') ?? '');
          e.preventDefault();
        }
      },
      true,
    );
  });
  return () => page.evaluate(() => (window as unknown as { __klicks: string[] }).__klicks);
}

test.describe('Helfer mit Bewegung', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('steht nach dem Laden still unten rechts, der Ball ist ein WhatsApp-Link, axe ohne Verstöße', async ({ page }, testInfo) => {
    const fehler = fehlerSammeln(page);
    await mitHelfer(page);

    const link = ball(page);
    await expect(link).toBeVisible();
    // Der schwebende Knopf schreibt an die Nummer des Inhabers, mit eigenem Text ohne Namen in der Anrede.
    await expect(link).toHaveAttribute('href', /^https:\/\/api\.whatsapp\.com\/send\?phone=4917641195301&text=Guten%20Tag%2C%20ich/);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);

    // unten rechts, ganz im Bild
    const sicht = page.viewportSize()!;
    const kasten = (await figur(page).boundingBox())!;
    expect(kasten.x + kasten.width).toBeLessThanOrEqual(sicht.width);
    expect(kasten.x).toBeGreaterThan(sicht.width / 2);
    expect(kasten.y + kasten.height).toBeLessThanOrEqual(sicht.height);
    const rund = (await link.boundingBox())!;
    expect(rund.width).toBeGreaterThanOrEqual(44);
    expect(rund.height).toBeGreaterThanOrEqual(44);
    expect(rund.x + rund.width).toBeLessThan(kasten.x + 8);

    // In Ruhe bewegt sich nichts: keine laufende Animation im Helfer, und Figur wie Ball bleiben, wo sie sind.
    const lage = () =>
      page.evaluate(() => {
        const halter = document.querySelector('[data-helfer]')!;
        const koerper = halter.shadowRoot!.querySelector<HTMLElement>('.hf-koerper')!;
        const b = document.querySelector('.hf-ball-halter')!.getBoundingClientRect();
        return {
          figur: koerper.style.transform,
          ball: `${b.x.toFixed(2)}/${b.y.toFixed(2)}`,
          laeuft: halter.shadowRoot!.getAnimations().filter((a) => a.playState === 'running').length,
        };
      });
    const vorher = await lage();
    await page.waitForTimeout(700);
    const nachher = await lage();
    expect(nachher).toEqual(vorher);
    expect(nachher.laeuft).toBe(0);

    await expectNoAxeViolations(page, testInfo);
    expect(fehler).toEqual([]);
  });

  test('Tastatur: Enter öffnet die Auswahl, Escape schließt sie und gibt den Fokus zurück', async ({ page }, testInfo) => {
    const fehler = fehlerSammeln(page);
    await mitHelfer(page);
    await figur(page).focus();
    await page.keyboard.press('Enter');
    await expect(figur(page)).toHaveAttribute('aria-expanded', 'true');
    const auswahl = page.getByRole('group', { name: FIGUR });
    await expect(auswahl).toBeVisible();
    for (const name of ['Fußball spielen', 'Basketball spielen', 'Hochwerfen', 'Mit dem Ball bewerfen', 'Wegschicken', 'Sprechblase schließen']) {
      const knopf = auswahl.getByRole('button', { name, exact: true });
      await expect(knopf).toBeVisible();
      const flaeche = (await knopf.boundingBox())!;
      expect(flaeche.height, `Trefferfläche ${name}`).toBeGreaterThanOrEqual(44);
      expect(flaeche.width, `Trefferfläche ${name}`).toBeGreaterThanOrEqual(44);
    }
    // die Auswahl liegt ganz im Bild
    const sicht = page.viewportSize()!;
    const blase = (await auswahl.boundingBox())!;
    expect(blase.x).toBeGreaterThanOrEqual(0);
    expect(blase.y).toBeGreaterThanOrEqual(0);
    expect(blase.x + blase.width).toBeLessThanOrEqual(sicht.width);

    await expectNoAxeViolations(page, testInfo);

    await page.keyboard.press('Escape');
    await expect(auswahl).toBeHidden();
    await expect(figur(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(figur(page)).toBeFocused();
    expect(fehler).toEqual([]);
  });

  test('Ball: Ziehen wirft ihn und öffnet nichts, Antippen folgt dem Link', async ({ page }) => {
    test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Die Spielabläufe laufen je einmal mobil und am Desktop.');
    const fehler = fehlerSammeln(page);
    await mitHelfer(page);
    const klicks = await linkKlicksMitschreiben(page);
    const link = ball(page);
    const start = (await link.boundingBox())!;
    const mx = start.x + start.width / 2;
    const my = start.y + start.height / 2;

    await page.mouse.move(mx, my);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(mx - i * 14, my - i * 22);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    // Er fliegt: Kurz nach dem Loslassen ist er weit weg von seinem Platz.
    await expect.poll(async () => Math.abs(((await link.boundingBox())?.x ?? start.x) - start.x), { timeout: 3000 }).toBeGreaterThan(40);
    expect(await klicks()).toEqual([]);

    // Er kommt zur Ruhe und rastet wieder an seinem Platz ein, dann zählt ein Antippen als Klick auf den Link.
    await expect
      .poll(
        async () => {
          const a = await link.boundingBox();
          // länger als die Pause, nach der er an seinen Platz zurückrollt
          await page.waitForTimeout(600);
          const b = await link.boundingBox();
          return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 99;
        },
        { timeout: 20_000 },
      )
      .toBeLessThan(0.5);
    const ruht = (await link.boundingBox())!;
    expect(Math.abs(ruht.x - start.x), 'wieder am Platz').toBeLessThan(2);
    expect(Math.abs(ruht.y - start.y), 'wieder am Platz').toBeLessThan(2);
    await page.mouse.click(ruht.x + ruht.width / 2, ruht.y + ruht.height / 2);
    const gezaehlt = await klicks();
    expect(gezaehlt).toHaveLength(1);
    expect(gezaehlt[0]).toMatch(/^https:\/\/api\.whatsapp\.com\/send\?/);
    expect(fehler).toEqual([]);
  });

  test('„Mit dem Ball bewerfen“: Er zerspringt in sechs Teile, baut sich zusammen und steht wieder', async ({ page }) => {
    test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Die Spielabläufe laufen je einmal mobil und am Desktop.');
    test.slow();
    const fehler = fehlerSammeln(page);
    await mitHelfer(page);
    await figur(page).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Mit dem Ball bewerfen', exact: true }).click();

    await expect(feld(page)).toHaveAttribute('data-zustand', 'zerlegt', { timeout: 5000 });
    await expect(page.locator('[data-helfer] .hf-teil')).toHaveCount(6);
    await expect(feld(page)).toHaveAttribute('data-zustand', 'putzt', { timeout: 20_000 });
    await expect(page.locator('[data-helfer] .hf-teil')).toHaveCount(0);
    await expect(feld(page)).toHaveAttribute('data-zustand', 'steht', { timeout: 10_000 });
    await expect(figur(page)).toBeVisible();
    // und dann ist wieder Ruhe
    await waitForSettled(page);
    expect(fehler).toEqual([]);
  });

  test('„Hochwerfen“: Er fliegt, landet, steht wieder auf', async ({ page }) => {
    test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Die Spielabläufe laufen je einmal mobil und am Desktop.');
    test.slow();
    const fehler = fehlerSammeln(page);
    await mitHelfer(page);
    const boden = (await figur(page).boundingBox())!;
    await figur(page).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Hochwerfen', exact: true }).click();
    await expect(feld(page)).toHaveAttribute('data-zustand', 'frei');
    await expect.poll(async () => boden.y - ((await figur(page).boundingBox())?.y ?? boden.y), { timeout: 3000 }).toBeGreaterThan(60);
    await expect(feld(page)).toHaveAttribute('data-zustand', 'steht', { timeout: 25_000 });
    const wieder = (await figur(page).boundingBox())!;
    expect(Math.abs(wieder.y + wieder.height - (boden.y + boden.height))).toBeLessThan(3);
    expect(fehler).toEqual([]);
  });

  test('„Wegschicken“ und zurückholen', async ({ page }, testInfo) => {
    test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Die Spielabläufe laufen je einmal mobil und am Desktop.');
    const fehler = fehlerSammeln(page);
    await mitHelfer(page);
    await figur(page).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Wegschicken', exact: true }).click();
    await expect(feld(page)).toHaveAttribute('data-zustand', 'weg', { timeout: 10_000 });
    await expect(figur(page)).toBeHidden();
    const zurueck = page.getByRole('button', { name: 'Helfer zurückholen', exact: true });
    await expect(zurueck).toBeVisible();
    const flaeche = (await zurueck.boundingBox())!;
    expect(flaeche.width).toBeGreaterThanOrEqual(44);
    expect(flaeche.height).toBeGreaterThanOrEqual(44);
    // der WhatsApp-Ball bleibt als Link da
    await expect(ball(page)).toBeVisible();
    await expectNoAxeViolations(page, testInfo);

    await zurueck.click();
    await expect(feld(page)).toHaveAttribute('data-zustand', 'steht');
    await expect(figur(page)).toBeVisible();
    await expect(zurueck).toBeHidden();
    expect(fehler).toEqual([]);
  });

  test('Handy: Die Bewerbenleiste ist der Boden, Helfer und Ball stehen darauf', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Die Leiste gibt es nur unter 64em.');
    await mitHelfer(page, `/jobs/${MAIN_JOB_SLUG}`);
    const leiste = page.locator('[data-sticky-apply-bar]');
    await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.4)));
    await expect(leiste).not.toHaveAttribute('data-hidden', /.*/);
    await waitForSettled(page);
    await expect
      .poll(async () => {
        const oben = (await leiste.boundingBox())!.y;
        const b = (await ball(page).boundingBox())!;
        return Math.abs(oben - (b.y + b.height));
      })
      .toBeLessThan(14);
    const oben = (await leiste.boundingBox())!.y;
    const f = (await figur(page).boundingBox())!;
    expect(f.y + f.height).toBeLessThanOrEqual(oben + 1);
  });

  test('bleibt beim Wechsel zwischen Seiten bestehen und verschwindet im Bewerbungsweg', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop-light', 'Ein Lauf genügt.');
    const fehler = fehlerSammeln(page);
    await mitHelfer(page);
    await page.locator('a[href="/jobs"]:visible').first().click();
    await page.waitForURL('**/jobs');
    await expect(feld(page)).toHaveAttribute('data-zustand', 'steht');
    await page.goto('/bewerbung');
    await leerlaufAbwarten(page);
    await expect(page.locator('.hf-ball-halter')).toHaveCount(0);
    await expect(feld(page)).toHaveCount(0);
    expect(fehler).toEqual([]);
  });

  for (const pfad of ['/bewerbung', `/bewerbung?stelle=${MAIN_JOB_SLUG}`, '/bewerbung/mappe', '/impressum', '/datenschutz']) {
    test(`fehlt auf ${pfad}`, async ({ page }) => {
      test.skip(test.info().project.name !== 'mobile-light', 'Ein Lauf genügt.');
      await page.goto(pfad);
      await leerlaufAbwarten(page);
      await expect(feld(page)).toHaveCount(0);
      await expect(page.locator('.hf-ball-halter')).toHaveCount(0);
      expect(await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => e.name.includes('/helfer/')).length)).toBe(0);
    });
  }
});

test.describe('Helfer ohne Bewegung', () => {
  // Grundeinstellung der Projekte: reducedMotion 'reduce'.
  test('erscheint bei „Bewegung reduzieren“ nicht und lädt nichts nach', async ({ page }) => {
    test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Je einmal mobil und am Desktop.');
    await page.goto('/');
    await leerlaufAbwarten(page);
    await expect(feld(page)).toHaveCount(0);
    await expect(page.locator('.hf-ball-halter')).toHaveCount(0);
    expect(await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => e.name.includes('/helfer/')).length)).toBe(0);
    // WhatsApp bleibt über die gewohnten Wege erreichbar.
    expect(await page.locator('a[href^="https://api.whatsapp.com/send"]').count()).toBeGreaterThan(0);
  });
});
