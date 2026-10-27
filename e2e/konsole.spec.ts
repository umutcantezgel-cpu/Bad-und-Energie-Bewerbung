import { expect, test, type Page } from '@playwright/test';
import { LOCAL_SAMPLES, MAIN_JOB_SLUG, waitForSettled } from './support/site';

/**
 * Wache „keine Konsolenfehler“ (React #418 auf der Startseite, PageSpeed und live am 27.10.2026). Jede Seite lädt und
 * hydriert ganz, auch die Inseln unter der Falz (HydrateNear), und schreibt weder console.error noch einen nicht
 * gefangenen Fehler. Bewegung wie bei Besuchern und PageSpeed (das Kopfskript setzt `auftakt`, die Dauerbewegung
 * startet); die Grundeinstellung reducedMotion: 'reduce' würde das verdecken.
 */
const SEITEN = ['/', '/jobs', `/jobs/${MAIN_JOB_SLUG}`, '/bewerbung', `/bewerbung?stelle=${MAIN_JOB_SLUG}`, LOCAL_SAMPLES[2]];

test.use({ contextOptions: { reducedMotion: 'no-preference' } });

/** Sammelt ab jetzt console.error und nicht gefangene Fehler der Seite. */
function fehlerSammeln(page: Page): string[] {
  const fehler: string[] = [];
  page.on('console', (meldung) => {
    if (meldung.type() === 'error') fehler.push(`console.error: ${meldung.text()} @ ${meldung.location().url}`);
  });
  page.on('pageerror', (fehlerObjekt) => fehler.push(`pageerror: ${fehlerObjekt.message}`));
  return fehler;
}

/** Scrollt in Schritten bis ganz unten und zurück: Jede HydrateNear-Insel kommt in Reichweite, lädt und hydriert. */
async function allesHydrieren(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const schritt = Math.max(200, Math.round(window.innerHeight * 0.8));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += schritt) {
      window.scrollTo(0, y);
      await new Promise((weiter) => requestAnimationFrame(() => setTimeout(weiter, 60)));
    }
    window.scrollTo(0, 0);
    await new Promise((weiter) => requestIdleCallback(() => weiter(undefined), { timeout: 3000 }));
  });
  await waitForSettled(page);
}

test.describe('Konsole ohne Fehler', () => {
  for (const pfad of SEITEN) {
    test(`keine Fehler auf ${pfad}`, async ({ page }) => {
      const fehler = fehlerSammeln(page);
      const antwort = await page.goto(pfad);
      expect(antwort?.status(), `Status von ${pfad}`).toBe(200);
      await waitForSettled(page);
      await allesHydrieren(page);
      expect(fehler, `Konsole auf ${pfad}`).toEqual([]);
    });
  }

  /**
   * Vercel rechnet / bei jeder ISR-Neuberechnung mit req.url „/index“ (live am 27.10.2026: Jubiläumsmarke im Kopf,
   * Agenturlink nofollow); der Browser hydriert mit „/“. next start rendert hier immer „/“, die Probe dreht es deshalb
   * um: Der Browser meldet vor dem Start von Next „/index“. Was am Pfad hängt (Kopf, Menü, Fuß, Leiste, Agenturlink),
   * muss „/index“ wie „/“ behandeln. Ohne das: Minified React error #418 (args[]=HTML).
   */
  test('Startseite hydriert auch mit dem internen Pfad /index', async ({ page }) => {
    const fehler = fehlerSammeln(page);
    await page.addInitScript(() => {
      if (location.pathname === '/') history.replaceState(history.state, '', `/index${location.search}${location.hash}`);
    });
    await page.goto('/');
    await waitForSettled(page);
    expect(fehler, 'Konsole mit Browserpfad /index').toEqual([]);
    await expect(page.locator('header [class*="__marke"]')).toHaveCount(0);
  });
});
