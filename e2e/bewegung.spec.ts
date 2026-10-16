import { expect, test, type Locator, type Page } from '@playwright/test';
import { malzeitJeBild, messeMitDrossel } from './support/malzeit';
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

/** Reihenfolge, in der die Ziele mit der Tab-Taste den Fokus bekommen (Indizes in `ziele`), von oben auf der Seite. */
async function tabFolge(page: Page, ziele: readonly Locator[], hoechstens = 80): Promise<number[]> {
  for (const [i, ziel] of ziele.entries()) await ziel.evaluate((el, n) => el.setAttribute('data-tab-ziel', String(n)), i);
  const folge: number[] = [];
  for (let n = 0; n < hoechstens && folge.length < ziele.length; n++) {
    await page.keyboard.press('Tab');
    const ziel = await page.evaluate(() => document.activeElement?.closest('[data-tab-ziel]')?.getAttribute('data-tab-ziel'));
    if (ziel != null && !folge.includes(Number(ziel))) folge.push(Number(ziel));
  }
  return folge;
}

/** Reihenfolge der Ziele nach ihrer Lage auf der Seite (Oberkante, von oben nach unten). */
async function lageFolge(ziele: readonly Locator[]): Promise<number[]> {
  const oben = await Promise.all(ziele.map((z) => z.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)));
  return oben.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y).map(({ i }) => i);
}

/**
 * Teildokument im Kopf (Einstieg, Seitenkopf): Der Browser kann malen, bevor der ganze Kopf geparst ist. Hier steht
 * der Kopf nacheinander nur bis zum k-ten Block im DOM; verfolgt werden die Blöcke, die Einzelheit „X“ und der Knopf.
 * Gemeldet wird, was dann nicht dort steht, wo es am Ende steht (`bisKnopf`: nur, was am Ende bis zum Knopf steht).
 */
function rutscher(page: Page, umfang: 'alles' | 'bisKnopf'): Promise<string[]> {
  return page.locator('h1').evaluate((h1, umfang) => {
    const kopf = h1.parentElement!.parentElement!;
    const bloecke = [...kopf.children] as HTMLElement[];
    const knopf = kopf.querySelector<HTMLElement>('[data-primary-cta]');
    if (!knopf) return ['kein Knopf im Kopf'];
    const einzelheit = kopf.querySelector<HTMLElement>('div[data-einzelheit="X"]');
    const oben = (el: HTMLElement) => (el.isConnected ? el.getBoundingClientRect().top + window.scrollY : NaN);
    const grenze = oben(knopf);
    const verfolgt = [...bloecke, einzelheit, knopf].filter(
      (el): el is HTMLElement => el != null && (umfang === 'alles' || oben(el) <= grenze),
    );
    const ende = verfolgt.map(oben);
    const funde: string[] = [];
    for (let k = 1; k < bloecke.length; k++) {
      const spaeter = bloecke.slice(k);
      spaeter.forEach((b) => b.remove());
      verfolgt.forEach((el, i) => {
        const y = oben(el);
        if (!Number.isNaN(y) && Math.abs(y - ende[i]) > 1) funde.push(`${el.className} bei ${k} Blöcken: ${Math.round(y - ende[i])} px`);
      });
      kopf.append(...spaeter);
    }
    return funde;
  }, umfang);
}

test.describe('mit Bewegung (no-preference)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('Handy: „Anhalten“ und „Jetzt bewerben“ bekommen den Fokus in der Reihenfolge, in der sie untereinander stehen (WCAG 2.4.3)', async ({
    page,
  }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Die Lage untereinander gilt am Handy.');
    const seiten = [
      { pfad: START, anhalten: 'div[data-einzelheit="X"]' },
      { pfad: STELLE, anhalten: '[data-stelle-kopfbild="aussengeraet"]' },
    ];
    for (const { pfad, anhalten } of seiten) {
      await page.goto(pfad);
      const ziele = [
        page.locator(anhalten).getByRole('button', { name: 'Anhalten' }),
        page.locator('main [data-primary-cta] a').first(),
      ];
      // Der Knopf erscheint, sobald der Auftakt der Seite vorbei ist (Prüfrunde 4 C4-2); vorher hält er unsichtbar
      // seinen Platz und ist nicht fokussierbar
      await expect(ziele[0]).toBeVisible();
      const lage = await lageFolge(ziele);
      expect(await tabFolge(page, ziele), pfad).toEqual(lage);
    }
  });

  test('Handy: kommt der Kopf in Stücken an, rutscht nichts nach (CLS, K-013): Einstieg der Startseite, Seitenkopf der Stelle', async ({
    page,
  }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Das Nachrutschen betraf die Lage am Handy.');
    await page.goto(START);
    expect(await rutscher(page, 'alles')).toEqual([]);
    await page.goto(STELLE);
    // Die Einleitung steht am Handy unter dem Knopf, im DOM davor (Lesefolge am Desktop); dafür hält
    // <link rel="expect" blocking="render"> das erste Bild an (components/seitenkopf/Seitenkopf.tsx)
    expect(await rutscher(page, 'bisKnopf')).toEqual([]);
  });

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

  test('Malzeit (KERN K-009): während Wasser und Kältemittel fließen, malt kein Bild 2 ms oder länger (Handy, CPU 4×)', async ({
    page,
    browser,
  }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Das Budget gilt für das Moto-G-Profil (Handy, CPU 4×).');
    await page.goto(WAERMEPUMPEN);
    for (const zeichnung of ['kaeltekreis', 'anlagenschema']) {
      const bereich = page.locator(`[data-dauer]:has([data-zeichnung="${zeichnung}"])`);
      await bereich.scrollIntoViewIfNeeded();
      await expect(bereich).toHaveAttribute('data-dauer', 'an');
      await expect.poll(() => schleifenLaufen(bereich)).toBe(true);
      await page.waitForTimeout(500);
      const bilder = malzeitJeBild(await messeMitDrossel(page, browser, () => page.waitForTimeout(3000)));
      // Der Trace hat den Hauptthread erfasst; Bilder, die der Compositor allein abspielt, malen dort nichts
      expect(bilder.hauptthread, `${zeichnung}: Ereignisse des Hauptthreads`).toBeGreaterThan(0);
      expect(bilder.bilder.filter((b) => b.ms >= 2), `${zeichnung}: Bilder mit Malzeit ≥ 2 ms`).toEqual([]);
      // Die Schleifen laufen allein im Compositor: Über drei Sekunden zusammen weniger als 2 ms Malzeit (so streng wie
      // bisher, als die Hilfe alle Paints in ein „Bild“ legte; Prüfrunde 1 C1-4)
      expect(bilder.gesamtMs, `${zeichnung}: Malzeit in 3 s`).toBeLessThan(2);
    }
  });

  test('Echter Ladeweg (E-031 Prüfrunde 4 C4-2): Knopf und Schleife der Startseite warten, bis die Wärme im Hero vorbei ist (Handy, CPU 4×)', async ({
    page,
  }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Gemessen im Moto-G-Profil (Handy, CPU 4×).');
    // Beim echten Laden hydrierte die Steuerung mitten im Nachlauf der Wärme; der sichtbar werdende Knopf ließ die
    // ganze Seite neu malen (bis 5 ms je Bild). Gemessen in Zeit der Seite: Start und Ende der Bänder im Hero (Ende
    // auch als Abbruch, falls das Sicherheitsnetz die Klasse `auftakt` nimmt), jede Änderung an Knopf und Bereich
    await page.addInitScript(() => {
      const p = { start: [] as number[], ende: [] as number[], steuerung: [] as { t: number; was: string }[] };
      (window as unknown as { __c42: typeof p }).__c42 = p;
      const imHero = (e: Event) => (e.target as Element).closest?.('[data-waermefeld="hausschnitt"]');
      document.addEventListener('animationstart', (e) => imHero(e) && p.start.push(performance.now()), true);
      for (const typ of ['animationend', 'animationcancel']) document.addEventListener(typ, (e) => imHero(e) && p.ende.push(performance.now()), true);
      new MutationObserver((liste) => {
        for (const m of liste) {
          const el = m.target as Element;
          if (el.matches('[data-dauer], [data-dauer-knopf]')) p.steuerung.push({ t: performance.now(), was: `${m.attributeName}=${el.getAttribute(m.attributeName!)}` });
        }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class', 'data-dauer'] });
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    try {
      await page.goto(START);
      // Der Auftakt ist vorbei: Das Kopfskript nimmt die Klasse spätestens 2 s nach dem ersten Ablauf
      await expect(page.locator('html')).not.toHaveClass(/auftakt/, { timeout: 15_000 });
      const knopf = page.locator('[data-einzelheit="X"] [data-dauer-knopf]');
      await expect(knopf).toBeVisible();
      await expect(knopf).not.toHaveClass(/wartet/);
    } finally {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      await cdp.detach();
    }
    const p = await page.evaluate(() => (window as unknown as { __c42: { start: number[]; ende: number[]; steuerung: { t: number; was: string }[] } }).__c42);
    // Die Wärme lief beim Laden (sonst misst der Fall nichts), und die Steuerung hat danach umgeschaltet
    expect(p.start.length, 'Abläufe im Hero').toBeGreaterThan(0);
    expect(p.ende.length, 'Ende der Abläufe im Hero').toBeGreaterThan(0);
    expect(p.steuerung.length, 'Änderungen an Knopf und Bereich').toBeGreaterThan(0);
    // Fenster wie in Prüfrunde 4: vom Ende des Linienzeichnens (erster Bandstart + 560 ms) bis zum Ende der Bänder.
    // Keine Änderung der Steuerung vor dem Ende des letzten Bands (enthält das Fenster)
    const ende = Math.max(...p.ende);
    const frueh = p.steuerung.filter((s) => s.t < ende).map((s) => `${Math.round(s.t - Math.min(...p.start))} ms nach Bandstart: ${s.was}`);
    expect(frueh, 'Änderungen der Steuerung, solange die Wärme läuft').toEqual([]);
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
