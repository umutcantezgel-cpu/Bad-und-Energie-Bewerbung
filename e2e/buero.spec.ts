import { expect, test, type Locator } from '@playwright/test';
import { expectNoAxeViolations, findSmallText, waitForSettled } from './support/site';

/**
 * Büro und Verwaltung (E-031, Paket W3): Die vier Szenen der Themenseite laufen einmal beim Sichtbarwerden (Register
 * `buero-ablauf`, Auslöser `sicht`, SichtStart): Ist eine Szene beim Laden im Bild, steht sie sofort im Endzustand;
 * liegt sie darunter, wartet sie (`data-ablauf="bereit"`), läuft beim Hineinscrollen (`laeuft`, jede Animation einmal,
 * Ende ≤ 2.400 ms) und steht danach wieder `fertig`. Reduziert und ohne JavaScript: keine Animation, Endzustand. Die
 * Stellenseite der Bürofachkraft zeigt die Szenen nur als stille Dateien. Je ein Projekt mobil und Desktop.
 */

const SEITE = '/arbeiten-bei-uns/buero-und-verwaltung';
const STELLE = '/jobs/buerofachkraft-wetzlar';
const SICHT_ENDE_MS = 2400;

test.beforeEach(() => {
  test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Büro läuft je einmal mobil und am Desktop.');
});

/** Animationen im Bereich (Zahl, längstes Ende in ms, Wiederholungen). */
function animationen(bereich: Locator): Promise<{ zahl: number; ende: number; wiederholungen: number[] }> {
  return bereich.evaluate((el) => {
    const alle = el.getAnimations({ subtree: true });
    return {
      zahl: alle.length,
      ende: Math.max(0, ...alle.map((a) => Number(a.effect?.getComputedTiming().endTime ?? 0))),
      wiederholungen: alle.map((a) => Number(a.effect?.getTiming().iterations ?? 1)),
    };
  });
}

test.describe('Szenen mit Bewegung', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('unter dem ersten Bild: bereit, beim Hineinscrollen einmal laufen, dann fertig; Ende ≤ 2.400 ms', async ({ page }) => {
    await page.goto(SEITE);
    const szenen = page.locator('[data-ablauf]');
    await expect(szenen).toHaveCount(4);
    // Die erste Szene liegt am Handy und am Desktop unter dem Kopf: Sie wartet im Startzustand
    const erste = szenen.first();
    await expect(erste).toHaveAttribute('data-ablauf', 'bereit');
    await erste.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 120));
    await expect(erste).toHaveAttribute('data-ablauf', 'laeuft');
    const lauf = await animationen(erste);
    expect(lauf.zahl).toBeGreaterThan(0);
    expect(lauf.ende).toBeLessThanOrEqual(SICHT_ENDE_MS);
    expect(lauf.wiederholungen.every((n) => n === 1)).toBe(true);
    await expect(erste).toHaveAttribute('data-ablauf', 'fertig', { timeout: 4000 });
    // Einmalig: Wegscrollen und zurück startet nichts neu
    await page.evaluate(() => window.scrollTo(0, 0));
    await erste.scrollIntoViewIfNeeded();
    await expect(erste).toHaveAttribute('data-ablauf', 'fertig');
    expect((await animationen(erste)).zahl).toBe(0);
  });

  test('Deep-Link zu den Aufgaben: was beim Laden im Bild ist, steht im Endzustand (kein Aufblitzen)', async ({ page }) => {
    await page.goto(`${SEITE}#aufgaben`);
    await waitForSettled(page);
    const imBild = page.locator('[data-ablauf]').first();
    await expect(imBild).toHaveAttribute('data-ablauf', 'fertig');
    expect((await animationen(imBild)).zahl).toBe(0);
  });

  test('Leitstelle im Kopf steht still; höchstens die Hälfte der Abschnitte hat einen Sicht-Auftritt (K-011)', async ({ page }) => {
    await page.goto(SEITE);
    const leitstelle = page.locator('[data-zeichnung="leitstelle"]');
    await expect(leitstelle).toHaveCount(1);
    expect((await animationen(leitstelle)).zahl).toBe(0);
    const abschnitte = await page.locator('main section').evaluateAll((alle) => {
      const oben = alle.filter((s) => !s.parentElement?.closest('section'));
      return { alle: oben.length, mitSicht: oben.filter((s) => s.querySelector('[data-ablauf]')).length };
    });
    expect(abschnitte.mitSicht).toBeGreaterThan(0);
    expect(abschnitte.mitSicht * 2).toBeLessThanOrEqual(abschnitte.alle);
  });
});

test('reduzierte Bewegung (Standard der Projekte): keine Animation, alle Szenen im Endzustand; axe ohne Verstöße', async ({ page }, testInfo) => {
  await page.goto(SEITE);
  const szenen = page.locator('[data-ablauf]');
  await expect(szenen).toHaveCount(4);
  for (const szene of await szenen.all()) {
    await szene.scrollIntoViewIfNeeded();
    await expect(szene).toHaveAttribute('data-ablauf', 'fertig');
    expect((await animationen(szene)).zahl).toBe(0);
  }
  await expectNoAxeViolations(page, testInfo);
});

/** Beschriftungen, die über den Rand ihres Bilds ragen (Text der Spans), je Bild-Behälter. */
function ausDemBild(bilder: Locator): Promise<(string | null)[]> {
  return bilder.evaluateAll((alle) =>
    alle.flatMap((bild) => {
      const r = bild.getBoundingClientRect();
      return [...bild.querySelectorAll('span')]
        .filter((s) => {
          const t = s.getBoundingClientRect();
          return t.left < r.left - 0.5 || t.right > r.right + 0.5 || t.top < r.top - 0.5 || t.bottom > r.bottom + 0.5;
        })
        .map((s) => s.textContent);
    }),
  );
}

test('Beschriftungen ≥ 12 px, ganz im Bild, kein horizontaler Scroll bei 320 und 390 px', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(SEITE);
    await waitForSettled(page);
    expect(await findSmallText(page), `Text kleiner als 12 px bei ${width} px`).toEqual([]);
    const breit = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(breit, `horizontaler Scroll bei ${width} px`).toBeLessThanOrEqual(0);
    // Die Ziele der Leitstelle stehen auch am Handy an ihren Glyphen, ohne Kasten, ganz im Bild (Prüfrunde 1 A1-7)
    const leitstelle = page.locator('[data-zeichnung="leitstelle"]');
    await expect(leitstelle.locator('span')).toHaveCount(4);
    await expect(leitstelle.locator('[data-zeichnung="etikettkasten"]')).toHaveCount(0);
    expect(await ausDemBild(leitstelle), `Ziel der Leitstelle ragt bei ${width} px aus dem Bild`).toEqual([]);
    // Jede Beschriftung einer Szene liegt ganz in ihrem Bild (nichts wird am Rand abgeschnitten)
    const draussen = await page.locator('[data-ablauf]').evaluateAll((bilder) =>
      bilder.flatMap((bild) => {
        const r = bild.getBoundingClientRect();
        return [...bild.querySelectorAll('span')]
          .filter((s) => {
            const t = s.getBoundingClientRect();
            return t.left < r.left - 0.5 || t.right > r.right + 0.5 || t.top < r.top - 0.5 || t.bottom > r.bottom + 0.5;
          })
          .map((s) => s.textContent);
      }),
    );
    expect(draussen, `Beschriftung ragt bei ${width} px aus dem Bild`).toEqual([]);
  }
});

test.describe('ohne JavaScript', () => {
  test.use({ javaScriptEnabled: false, contextOptions: { reducedMotion: 'no-preference' } });

  test('der Server liefert den Endzustand', async ({ page }) => {
    await page.goto(SEITE);
    await expect(page.locator('[data-ablauf="fertig"]')).toHaveCount(4);
    await expect(page.locator('[data-ablauf="bereit"], [data-ablauf="laeuft"]')).toHaveCount(0);
  });
});

test('Stellenseite der Bürofachkraft: Kopfbild Leitstelle und die Szenen nur als Dateien, ohne Ablauf; Weg zur Themenseite', async ({ page }) => {
  await page.goto(STELLE);
  await expect(page.locator('[data-stelle-kopfbild="buero"]')).toHaveCount(1);
  const bilder = page.locator('img[src^="/zeichnung/buero-"]');
  // Kopfbild (ab 64em sichtbar) und die vier Szenen im Einblick
  await expect(bilder).toHaveCount(5);
  await expect(page.locator('[data-motion="buero-ablauf"], [data-ablauf]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Mehr zu Büro und Verwaltung' })).toHaveAttribute('href', SEITE);
  const antwort = await page.request.get((await bilder.last().getAttribute('src'))!);
  expect(antwort.status()).toBe(200);
  expect(antwort.headers()['content-type']).toContain('image/svg+xml');
  // Prüfrunde 1 A1-6: die Wörter wie auf der Themenseite über den Bildern, ganz im Bild, mindestens 12 px
  const szenen = page.locator('[data-zeichnung^="buero-"] > div');
  await expect(szenen).toHaveCount(4);
  await expect(szenen.locator('span')).toHaveCount(5 + 3 + 4 + 2);
  await szenen.first().scrollIntoViewIfNeeded();
  expect(await ausDemBild(szenen)).toEqual([]);
  expect(await findSmallText(page)).toEqual([]);
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    const kopf = page.locator('[data-stelle-kopfbild="buero"] [data-zeichnung="leitstelle"] > div');
    await expect(kopf.locator('span')).toHaveCount(4);
    expect(await ausDemBild(kopf)).toEqual([]);
    // Prüfrunde 2 A2-8: die Leitstelle so breit wie die Fläche (wie Gerät und Schema), der Lohn-Block darunter
    const flaeche = (await page.locator('[data-stelle-kopfbild="buero"]').boundingBox())!;
    const bild = (await page.locator('[data-stelle-kopfbild="buero"] [data-zeichnung="leitstelle"]').boundingBox())!;
    expect(bild.width).toBeGreaterThanOrEqual(flaeche.width - 1);
    expect(bild.width).toBeGreaterThan(24 * 16);
  }
});
