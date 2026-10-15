import { expect, test } from '@playwright/test';
import { THEMEN_PAGES, findSmallText, waitForSettled } from './support/site';

/**
 * Alle Themenseiten (E-028): Hub /arbeiten-bei-uns und die sechs Themen (seit E-031 mit „Büro und Verwaltung“). Nur
 * im Projekt mobile-light (die vier Projekte laufen über die Stichproben in ROUTES, mit axe): Status 200, genau eine h1, Canonical auf sich selbst, bei 320 px der
 * kurze Pfad eine Stufe zurück, ab 40em der ganze Pfad mit der Seite als letzter Stufe, ein JSON-LD-Graph ohne
 * JobPosting und FAQPage, kein horizontaler Scroll bei 320 px, Schrift bei 320 und 390 px gezeichnet ≥ 12 px (auch in
 * den Zeichnungen, Prüfung E-029, Befund 7).
 */

test.beforeEach(() => {
  test.skip(test.info().project.name !== 'mobile-light', 'Alle Themenseiten laufen einmal (mobile-light).');
});

test.use({ viewport: { width: 320, height: 700 } });

for (const thema of THEMEN_PAGES) {
  test(`Themenseite ${thema.path}`, async ({ page }) => {
    const response = await page.goto(thema.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).pathname).toBe(thema.path);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks).toHaveLength(1);
    const types = (JSON.parse(blocks[0])['@graph'] as { '@type': string }[]).map((node) => node['@type']);
    expect(types).toContain('BreadcrumbList');
    expect(types).not.toContain('JobPosting');
    expect(types).not.toContain('FAQPage');

    // Unter 40em nur der Weg eine Stufe zurück, ab 40em der ganze Pfad
    const pfad = page.getByRole('navigation', { name: 'Brotkrümelnavigation' });
    await expect(pfad).toHaveCount(1);
    await expect(pfad.getByRole('link')).toHaveCount(1);
    await page.setViewportSize({ width: 800, height: 700 });
    const crumbs = page.getByRole('navigation', { name: 'Brotkrümelnavigation' }).locator('li');
    await expect(crumbs.first()).toHaveText('Startseite');
    await expect(crumbs.last()).toHaveText(thema.name);
    await expect(crumbs.last().locator('[aria-current="page"]')).toHaveCount(1);
    await page.setViewportSize({ width: 320, height: 700 });

    await waitForSettled(page);
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      const width = root.clientWidth;
      const wide = [...document.body.querySelectorAll<HTMLElement>('*')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.right > width + 1 && element.checkVisibility();
        })
        .slice(0, 5)
        .map((element) => `${element.tagName.toLowerCase()}.${String(element.className).split(' ').slice(0, 3).join('.')}`);
      return { scrollWidth: root.scrollWidth, width, wide };
    });
    expect(overflow.scrollWidth, `Zu breit: ${overflow.wide.join(', ')}`).toBeLessThanOrEqual(overflow.width);

    // Schrift gezeichnet ≥ 12 px auf der schmalsten Breite und auf der des Handy-Projekts
    expect(await findSmallText(page), 'Text kleiner als 12 px bei 320 px').toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await findSmallText(page), 'Text kleiner als 12 px bei 390 px').toEqual([]);
  });
}

/**
 * Layout der Kästchen „Was dazukommt“ auf /arbeiten-bei-uns/gehalt (Prüfung E-029, Runde 2, Befund 13): Kästchen,
 * Satz und „Gehört zu“ liegen untereinander. Das Raster ist ein Subgrid mit zwei Zeilen; ein drittes Kind lag dort
 * über dem Satz. Geprüft am Handy (390 px) und am Desktop (1280 px): Kein Rechteck der Textelemente eines Kästchens
 * überschneidet ein anderes, und „Gehört zu“ steht unter dem Satz.
 */
test('Gehalt „Was dazukommt“: Kästchen, Satz und „Gehört zu“ überschneiden sich nicht (390 und 1280 px)', async ({ page }) => {
  await page.goto(`${THEMEN_PAGES.find((thema) => thema.path.endsWith('/gehalt'))!.path}#dazu`);
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await waitForSettled(page);
    const kaesten = await page.locator('section#dazu ul > li').evaluateAll((items) =>
      items.map((item) => {
        const teile = [...item.querySelectorAll<HTMLElement>('[data-zeichnung="etikettkasten"], p')].map((element) => {
          const rect = element.getBoundingClientRect();
          return { text: (element.textContent ?? '').trim().slice(0, 40), top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
        });
        return { titel: teile[0]?.text ?? '', teile };
      }),
    );
    expect(kaesten.length, `${width} px`).toBeGreaterThan(0);
    expect(kaesten.some((kasten) => kasten.teile.some((teil) => teil.text.startsWith('Gehört zu'))), `${width} px: „Gehört zu“ fehlt`).toBe(true);
    for (const kasten of kaesten) {
      for (let i = 0; i < kasten.teile.length; i += 1) {
        for (let j = i + 1; j < kasten.teile.length; j += 1) {
          const a = kasten.teile[i];
          const b = kasten.teile[j];
          const hoehe = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          const breite = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          expect(hoehe > 0.5 && breite > 0.5, `${width} px, ${kasten.titel}: „${a.text}“ überdeckt „${b.text}“ (${hoehe.toFixed(1)} px)`).toBe(false);
          // In Lesereihenfolge untereinander: das spätere Element beginnt unter dem früheren
          expect(b.top, `${width} px, ${kasten.titel}: „${b.text}“ steht nicht unter „${a.text}“`).toBeGreaterThanOrEqual(a.bottom - 0.5);
        }
      }
    }
  }
});

/**
 * Fließpfeile im Standbild der Schemata (Prüfung E-029, Runde 2, Befund 6): Am Handy (320 und 390 px) misst jeder Pfeil
 * gezeichnet mindestens 10 px in Fließrichtung und 9 px quer, das Dreifache der 3-px-Leitung. Gemessen am Rechteck des
 * gezeichneten Pfeils (mit dem Faktor --pfeil der Stufe, technik.module.css).
 */
test('Wärmepumpen: Fließpfeile in Kältekreis und Anlagenschema am Handy ≥ 10 × 9 px', async ({ page }) => {
  await page.goto(`${THEMEN_PAGES.find((thema) => thema.path.endsWith('/waermepumpen'))!.path}`);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await waitForSettled(page);
    for (const zeichnung of ['kaeltekreis', 'anlagenschema']) {
      const pfeile = await page.locator(`[data-zeichnung="${zeichnung}"] [data-pfeile] path`).evaluateAll((pfade) =>
        pfade.map((pfad) => {
          const rect = pfad.getBoundingClientRect();
          return { d: pfad.getAttribute('d'), lang: Math.max(rect.width, rect.height), quer: Math.min(rect.width, rect.height) };
        }),
      );
      expect(pfeile.length, `${zeichnung} ${width} px`).toBeGreaterThan(3);
      for (const p of pfeile) {
        expect(p.lang, `${zeichnung} ${width} px: ${p.d}`).toBeGreaterThanOrEqual(10);
        expect(p.quer, `${zeichnung} ${width} px: ${p.d}`).toBeGreaterThanOrEqual(9);
      }
    }
  }
});
