import { expect, test, type Locator, type Page } from '@playwright/test';
import { MIN_TOUCH_TARGET_PX, expectNoAxeViolations } from './support/site';

/**
 * Dauerbewegung (E-029, KERN K-009): Rotor, Wasser und Kältemittel laufen nur, wenn alles zutrifft – Skript geladen,
 * Zeichnung im Sichtfeld, Tab sichtbar, keine reduzierte Bewegung, nicht angehalten. Der Knopf „Anhalten“/„Abspielen“
 * (44 × 44 px) hält alle Schleifen der Seite an (WCAG 2.2.2). Die Projekte laufen sonst mit `reducedMotion: 'reduce'`
 * (playwright.config.ts); dieser Lauf schaltet für die Bewegung `no-preference` ein. Je ein Projekt mobil und Desktop.
 */

const START = '/';
const STELLE = '/jobs/kundendiensttechniker-waermepumpe-wetzlar';
const WAERMEPUMPEN = '/arbeiten-bei-uns/waermepumpen';

test.beforeEach(() => {
  test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Bewegung läuft je einmal mobil und am Desktop.');
});

/** Laufen im Bereich Schleifen (Animationen mit unendlicher Wiederholung im Zustand running)? */
function schleifenLaufen(bereich: Locator): Promise<boolean> {
  return bereich.evaluate((el) =>
    el.getAnimations({ subtree: true }).some((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity),
  );
}

/** Alle Schleifen der Seite. */
function schleifenDerSeite(page: Page): Promise<number> {
  return page.evaluate(
    () => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length,
  );
}

/** Schaltet die Sichtbarkeit des Dokuments um (wie ein Tab im Hintergrund) und meldet den Wechsel. */
async function tabSichtbar(page: Page, sichtbar: boolean): Promise<void> {
  await page.evaluate((wert) => {
    Object.defineProperty(document, 'visibilityState', { value: wert ? 'visible' : 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  }, sichtbar);
}

test.describe('mit Bewegung (no-preference)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('Startseite: der Rotor der Einzelheit X läuft im Sichtfeld; „Anhalten“ hält an, „Abspielen“ startet wieder', async ({ page }) => {
    await page.goto(START);
    const bereich = page.locator('[data-einzelheit="X"] [data-dauer]');
    await bereich.scrollIntoViewIfNeeded();
    await expect(bereich).toHaveAttribute('data-dauer', 'an');
    await expect.poll(() => schleifenLaufen(bereich)).toBe(true);

    const knopf = bereich.getByRole('button', { name: 'Anhalten' });
    await expect(knopf).toBeVisible();
    const box = await knopf.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);

    await knopf.click();
    await expect(bereich).toHaveAttribute('data-dauer', 'aus');
    await expect(bereich.getByRole('button', { name: 'Abspielen' })).toBeVisible();
    await expect.poll(() => schleifenLaufen(bereich)).toBe(false);

    await bereich.getByRole('button', { name: 'Abspielen' }).click();
    await expect(bereich).toHaveAttribute('data-dauer', 'an');
    await expect.poll(() => schleifenLaufen(bereich)).toBe(true);
  });

  test('Wegscrollen und ein versteckter Tab halten an; zurück im Bild läuft es weiter', async ({ page }) => {
    await page.goto(STELLE);
    const bereich = page.locator('[data-stelle-kopfbild="aussengeraet"] [data-dauer]');
    await bereich.scrollIntoViewIfNeeded();
    await expect(bereich).toHaveAttribute('data-dauer', 'an');

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(bereich).toHaveAttribute('data-dauer', 'aus');
    await expect.poll(() => schleifenLaufen(bereich)).toBe(false);

    await bereich.scrollIntoViewIfNeeded();
    await expect(bereich).toHaveAttribute('data-dauer', 'an');

    await tabSichtbar(page, false);
    await expect(bereich).toHaveAttribute('data-dauer', 'aus');
    await tabSichtbar(page, true);
    await expect(bereich).toHaveAttribute('data-dauer', 'an');
  });

  test('Wärmepumpen-Seite: Wasser und Kältemittel fließen; ein Druck hält alle Schleifen der Seite an; axe ohne Verstöße', async ({ page }, testInfo) => {
    await page.goto(WAERMEPUMPEN);
    const kaelte = page.locator('[data-dauer]:has([data-zeichnung="kaeltekreis"])');
    const anlage = page.locator('[data-dauer]:has([data-zeichnung="anlagenschema"])');
    await kaelte.scrollIntoViewIfNeeded();
    await expect(kaelte).toHaveAttribute('data-dauer', 'an');
    await expect(kaelte.locator('[data-motion="kaeltemittel-fliesst"]').first()).toHaveCSS('opacity', '1');
    await expectNoAxeViolations(page, testInfo);

    await kaelte.getByRole('button', { name: 'Anhalten' }).click();
    await anlage.scrollIntoViewIfNeeded();
    await expect(anlage).toHaveAttribute('data-dauer', 'aus');
    await expect(anlage.getByRole('button', { name: 'Abspielen' })).toBeVisible();
    await expect.poll(() => schleifenDerSeite(page)).toBe(0);
    // Angehalten ist das Standbild: keine gestrichelten Leitungen, die festen Pfeile stehen
    await expect(anlage.locator('[data-motion="wasser-fliesst"]').first()).toHaveCSS('opacity', '0');
  });
});

test.describe('reduzierte Bewegung (Standard der Projekte)', () => {
  test('nichts läuft und kein Knopf: Standbild mit festen Fließpfeilen', async ({ page }) => {
    for (const pfad of [START, WAERMEPUMPEN]) {
      await page.goto(pfad);
      const bereiche = page.locator('[data-dauer]');
      expect(await bereiche.count(), pfad).toBeGreaterThan(0);
      for (const bereich of await bereiche.all()) {
        await bereich.scrollIntoViewIfNeeded();
        await expect(bereich, pfad).toHaveAttribute('data-dauer', 'aus');
        await expect(bereich.locator('[data-dauer-knopf]'), pfad).toBeHidden();
      }
      expect(await schleifenDerSeite(page), pfad).toBe(0);
      for (const fluss of await page.locator('[data-motion="wasser-fliesst"], [data-motion="kaeltemittel-fliesst"]').all()) {
        await expect(fluss).toHaveCSS('opacity', '0');
      }
    }
  });
});

test.describe('ohne JavaScript', () => {
  test.use({ javaScriptEnabled: false, contextOptions: { reducedMotion: 'no-preference' } });

  test('das Standbild steht vom Server, der Knopf ist ausgeblendet', async ({ page }) => {
    await page.goto(WAERMEPUMPEN);
    for (const bereich of await page.locator('[data-dauer]').all()) {
      await expect(bereich).toHaveAttribute('data-dauer', 'aus');
      await expect(bereich.locator('[data-dauer-knopf]')).toBeHidden();
    }
    expect(await schleifenDerSeite(page)).toBe(0);
  });
});
