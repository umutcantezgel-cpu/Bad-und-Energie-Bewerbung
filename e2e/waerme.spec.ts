import { expect, test, type Locator, type Page } from '@playwright/test';
import { WAERMEFELDER, type WaermefeldId } from '../lib/zeichnung/szenen/waermefeld';
import { malzeitJeBild, messeMitDrossel } from './support/malzeit';

/**
 * Wärmefeld 2.0 (E-031, KERN K-009/K-015, Register `waerme-breitet-sich-aus`): Die Bänder wachsen einmal nach √t,
 * das heißeste zuerst. Im Hero als Nachlauf unter `.auftakt` (ab 560 ms, Ende ≤ 1.920 ms vor dem Sicherheitsnetz), auf
 * der Wärmepumpen-Seite beim Sichtbarwerden (SichtStart: Start, sobald die Bilder dekodiert sind, höchstens 1.500 ms
 * danach; Ende ≤ 2.400 ms nach dem Start, Prüfrunde 3 C3-3). Reduziert, ohne Skript und per Sprung an die
 * Stelle steht der Endzustand. Malzeit je Bild unter 2 ms (Handy, CPU 4×). Beim echten Laden (Handy, CPU 4×, langsames
 * 4G) bricht kein Band am Sicherheitsnetz ab (Prüfrunde 1 C1-1: Das Netz zählt ab dem ersten Ablaufstart).
 *
 * Die Projekte laufen sonst mit `reducedMotion: 'reduce'` (playwright.config.ts); die Abläufe prüft ein Block mit
 * `no-preference`. Den Auftakt des Heros startet der Test selbst (Klasse `auftakt` neu setzen), damit die Zeiten nicht
 * vom Laden abhängen.
 */

const START = '/';
const WAERMEPUMPEN = '/arbeiten-bei-uns/waermepumpen';
const HERO_FELD = '[data-waermefeld="hausschnitt"]';
const RAUM = '[data-ablauf]:has([data-zeichnung="raumschnitt"])';
const BAND = '[data-motion="waerme-breitet-sich-aus"]';
/** Register (lib/motion/register.ts): Takt 80 ms, d-4 600 ms, Fenster nachlauf ab 7 Takten bis 1.920 ms, sicht bis 2.400 ms. */
const TAKT_MS = 80;
const D4_MS = 600;
const NACHLAUF_START_MS = 560;
const NACHLAUF_ENDE_MS = 1920;
const SICHT_ENDE_MS = 2400;
/** Prüfrunde 3 C3-3: Start spätestens 1.500 ms nach dem Sichtbarwerden (Bilder dekodiert oder Netz). */
const SICHT_WARTEN_MS = 1500;

test.beforeEach(() => {
  test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Die Wärme läuft je einmal mobil und am Desktop.');
});

interface Ablauf {
  name: string;
  iterationen: number;
  verzoegerung: number;
  dauer: number;
  zustand: string;
}

/** Laufende und wartende Abläufe der Bänder im Bereich. */
function ablaeufe(bereich: Locator): Promise<Ablauf[]> {
  return bereich.evaluate((el, band) =>
    [...el.querySelectorAll(band)].flatMap((svg) =>
      svg.getAnimations().map((a) => {
        const t = a.effect!.getTiming();
        return {
          name: (a as CSSAnimation).animationName,
          iterationen: Number(t.iterations),
          verzoegerung: Number(t.delay),
          dauer: Number(t.duration),
          zustand: a.playState,
        };
      }),
    ),
  BAND);
}

/** Bänder der Felder im Bereich laut Daten (Hero 4; Wärmepumpen-Seite 4 + die der Fußbodenheizung, Prüfrunde 1 B1-1). */
async function bandAnzahl(bereich: Locator): Promise<number> {
  const ids = await bereich.evaluate((el) =>
    (el.matches('[data-waermefeld]') ? [el] : [...el.querySelectorAll('[data-waermefeld]')]).map((feld) => feld.getAttribute('data-waermefeld')),
  );
  expect(ids.length).toBeGreaterThan(0);
  return ids.reduce((n, id) => n + WAERMEFELDER[id as WaermefeldId].baender.length, 0);
}

/** Endzustand: jedes Band der Daten ganz sichtbar, ohne Maßstab. */
async function endzustand(bereich: Locator): Promise<void> {
  const baender = bereich.locator(BAND);
  expect(await baender.count()).toBe(await bandAnzahl(bereich));
  for (const band of await baender.all()) {
    await expect(band).toHaveCSS('opacity', '1');
    await expect(band).toHaveCSS('transform', 'none');
  }
}

/** Startet den Nachlauf des Heros neu: Klasse `auftakt` ab- und wieder ansetzen (wie das Kopfskript beim Laden). */
async function auftaktNeu(page: Page): Promise<void> {
  await page.evaluate(() => {
    const html = document.documentElement;
    html.classList.remove('auftakt');
    void html.offsetWidth;
    html.classList.add('auftakt');
  });
}

test.describe('mit Bewegung (no-preference)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('Hero: vier Bänder wachsen einmal, das heißeste zuerst, ab dem Ende des Vorlaufs; Ende ≤ 1.920 ms, danach Endzustand', async ({ page }) => {
    await page.goto(START);
    const feld = page.locator(HERO_FELD);
    await expect(feld).toBeVisible();
    // Erst wenn das Kopfskript die Klasse nach dem Sicherheitsnetz entfernt hat, startet der Test den Nachlauf neu
    await expect(page.locator('html')).not.toHaveClass(/auftakt/);
    await auftaktNeu(page);
    const liste = await ablaeufe(feld);
    expect(liste).toHaveLength(4);
    for (const a of liste) {
      expect(a.name).toMatch(/wachsen/);
      expect(a.iterationen).toBe(1);
      expect(a.dauer).toBe(D4_MS);
      expect(a.verzoegerung % (TAKT_MS / 2)).toBe(0);
      expect(a.verzoegerung + a.dauer).toBeLessThanOrEqual(NACHLAUF_ENDE_MS);
    }
    // In der Reihenfolge der Bänder 1–4 (kühl → heiß) startet das heißeste zuerst, nach dem Vorlauf
    const starts = liste.map((a) => a.verzoegerung);
    expect(starts).toEqual([...starts].sort((x, y) => y - x));
    expect(Math.min(...starts)).toBe(NACHLAUF_START_MS);
    expect(Math.max(...liste.map((a) => a.verzoegerung + a.dauer))).toBe(NACHLAUF_ENDE_MS);
    // Alle enden, spätestens kurz nach 1.920 ms
    const dauer = await feld.evaluate(async (el, band) => {
      const t0 = performance.now();
      await Promise.all([...el.querySelectorAll(band)].flatMap((svg) => svg.getAnimations().map((a) => a.finished)));
      return performance.now() - t0;
    }, BAND);
    expect(dauer).toBeLessThan(NACHLAUF_ENDE_MS + 400);
    expect(await ablaeufe(feld)).toEqual([]);
    await endzustand(feld);
    // Band 0 steht immer
    await expect(feld.locator('[data-band="0"]')).toHaveCSS('opacity', '1');
  });

  test('Wärmepumpen-Seite: wartet unsichtbar, läuft beim Hinscrollen einmal (≤ 2.400 ms) und steht dann im Endzustand', async ({ page }) => {
    await page.goto(WAERMEPUMPEN);
    const raum = page.locator(RAUM);
    await expect(raum).toHaveAttribute('data-ablauf', 'bereit');
    await expect(raum.locator(BAND).first()).toHaveCSS('opacity', '0');
    // Band 0 steht auch vor dem Ablauf
    await expect(raum.locator('[data-band="0"]').first()).toHaveCSS('opacity', '1');
    await raum.scrollIntoViewIfNeeded();
    await expect(raum).toHaveAttribute('data-ablauf', 'laeuft');
    const liste = await ablaeufe(raum);
    expect(liste).toHaveLength(await bandAnzahl(raum));
    // Heizkörper wächst aus dem Ursprung, die Fußbodenheizung nur nach oben (Prüfrunde 1 B1-6)
    // Namen im Build mit dem Präfix des CSS-Moduls (`waerme-module__<hash>__wachsen`)
    expect(liste.map((a) => a.name.replace(/^.*__/, ''))).toEqual([
      ...WAERMEFELDER['raum-heizkoerper'].baender.map(() => 'wachsen'),
      ...WAERMEFELDER['raum-fussboden'].baender.map(() => 'steigen'),
    ]);
    for (const a of liste) {
      expect(a.iterationen).toBe(1);
      expect(a.dauer).toBe(D4_MS);
      expect(a.verzoegerung + a.dauer).toBeLessThanOrEqual(SICHT_ENDE_MS);
    }
    await expect(raum).toHaveAttribute('data-ablauf', 'fertig', { timeout: SICHT_ENDE_MS + 2000 });
    await endzustand(raum);
  });

  test('Sprung bei langsamem Netz (Prüfrunde 2 C2-5, Prüfrunde 3 C3-3): der Ablauf startet erst, wenn alle Bilder des Vergleichs geladen und dekodiert sind, höchstens 1,5 s nach dem Sichtbarwerden, und endet ≤ 2,4 s nach dem Start', async ({
    page,
  }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Gemessen am Handy mit Drossel.');
    test.setTimeout(90_000);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    // Lighthouse „Slow 4G“: 150 ms RTT, 1,6 Mbit/s herunter, 750 kbit/s hinauf
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    try {
      await page.goto(WAERMEPUMPEN, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const raum = page.locator(RAUM);
      await expect(raum).toHaveAttribute('data-ablauf', 'bereit', { timeout: 30_000 });
      // Prüfrunde 3 C3-5: Bis zum Sprung lädt der Vergleich seine Bilder nicht (lazy, weit unter dem Bildschirm)
      const vorher = await raum.evaluate((el) => [...el.querySelectorAll('img')].map((b) => ({ lazy: b.loading === 'lazy', geladen: b.complete && b.naturalWidth > 0 })));
      expect(vorher.length, 'Bilder im Vergleich').toBeGreaterThan(3);
      expect(vorher.every((b) => b.lazy && !b.geladen)).toBe(true);
      // Beim Wechsel auf „laeuft“ und „fertig“ den Stand der Bilder und die Zeit festhalten
      await raum.evaluate((el) => {
        const w = window as unknown as { __bilderBeimStart?: { geladen: boolean; breite: number }[]; __zeiten?: Record<string, number> };
        w.__zeiten = {};
        new MutationObserver(() => {
          const zustand = el.getAttribute('data-ablauf')!;
          w.__zeiten![zustand] ??= performance.now();
          if (zustand === 'laeuft' && !w.__bilderBeimStart) {
            w.__bilderBeimStart = [...el.querySelectorAll('img')].map((b) => ({ geladen: b.complete, breite: b.naturalWidth }));
          }
        }).observe(el, { attributes: true, attributeFilter: ['data-ablauf'] });
      });
      // Sprung (wie Ende, Bildlaufleiste oder Suche im Text): ohne weiches Scrollen direkt an die Stelle; ab hier ist der
      // Bereich sichtbar
      await raum.evaluate((el) => {
        (window as unknown as { __sprung?: number }).__sprung = performance.now();
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
      await expect(raum).toHaveAttribute('data-ablauf', 'laeuft', { timeout: 30_000 });
      const bilder = await page.evaluate(() => (window as unknown as { __bilderBeimStart?: { geladen: boolean; breite: number }[] }).__bilderBeimStart);
      expect(bilder!.length, 'Bilder im Vergleich').toBeGreaterThan(3);
      for (const b of bilder!) {
        expect(b.geladen).toBe(true);
        expect(b.breite).toBeGreaterThan(0);
      }
      await expect(raum).toHaveAttribute('data-ablauf', 'fertig', { timeout: 30_000 });
      const { sprung, zeiten } = await page.evaluate(() => {
        const w = window as unknown as { __sprung: number; __zeiten: Record<string, number> };
        return { sprung: w.__sprung, zeiten: w.__zeiten };
      });
      // Start höchstens SICHT_WARTEN_MS nach dem Sichtbarwerden, Ende höchstens SICHT_ENDE_MS nach dem Start (+ 400 ms für
      // Zeitgeber und Mikroaufgaben unter CPU 4×; das Netz des Endes liegt bei SICHT_ENDE_MS + d-3)
      expect(zeiten.laeuft - sprung, 'sichtbar → Start').toBeLessThanOrEqual(SICHT_WARTEN_MS + 400);
      expect(zeiten.fertig - zeiten.laeuft, 'Start → Ende').toBeLessThanOrEqual(SICHT_ENDE_MS + 400);
    } finally {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      await cdp.detach();
    }
  });

  test('Sprung an die Stelle (Deep-Link): der Vergleich ist beim Laden sichtbar und steht sofort im Endzustand', async ({ page }) => {
    await page.goto(`${WAERMEPUMPEN}#waermeverteilung`);
    const raum = page.locator(RAUM);
    await expect(raum).toBeInViewport();
    await page.waitForTimeout(600);
    await expect(raum).toHaveAttribute('data-ablauf', 'fertig');
    expect(await ablaeufe(raum)).toEqual([]);
    await endzustand(raum);
  });

  test('Malzeit (K-013): während sich die Wärme ausbreitet, malt nach den ersten zwei Bildern kein Bild 2 ms oder länger (Handy, CPU 4×)', async ({
    page,
    browser,
  }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Das Budget gilt für das Moto-G-Profil (Handy, CPU 4×).');
    // Hero: Nachlauf neu gestartet. Das Linienzeichnen des Auftakts (vorlauf-haus, ruecklauf-haus, erdleitung-d:
    // stroke-dashoffset, E-013) malt bis 1.120 ms auf dem Hauptthread; es gehört nicht zur Wärme. Zwei Messungen:
    // (1) nur die Wärme (die übrigen Abläufe stehen sofort im Endzustand), Fenster vom Start bis zum letzten Band;
    // (2) der ganze Auftakt, Fenster vom Ende des Linienzeichnens bis zum letzten Band – dort läuft nur noch die Wärme.
    await page.goto(START);
    await expect(page.locator(HERO_FELD)).toBeVisible();
    for (const nurWaerme of [true, false]) {
      await expect(page.locator('html')).not.toHaveClass(/auftakt/);
      const ereignisse = await messeMitDrossel(page, browser, () =>
        page.locator(HERO_FELD).evaluate(
          async (feld, { band, nur }) => {
            performance.mark('lauf-start');
            const html = document.documentElement;
            html.classList.remove('auftakt');
            void html.offsetWidth;
            html.classList.add('auftakt');
            const baender = [...feld.querySelectorAll(band)].flatMap((svg) => svg.getAnimations());
            const andere = document.getAnimations().filter((a) => !baender.includes(a));
            if (nur) for (const a of andere) a.finish();
            await Promise.all(andere.map((a) => a.finished));
            performance.mark('auftakt-ende');
            await Promise.all(baender.map((a) => a.finished));
            performance.mark('lauf-ende');
            html.classList.remove('auftakt');
          },
          { band: BAND, nur: nurWaerme },
        ),
      );
      const hero = malzeitJeBild(ereignisse, { von: nurWaerme ? 'lauf-start' : 'auftakt-ende', bis: 'lauf-ende' });
      const art = nurWaerme ? 'Hero, nur die Wärme' : 'Hero nach dem Linienzeichnen';
      expect(hero.hauptthread).toBeGreaterThan(0);
      // Plausibel: Im Fenster liegen viele Bilder (sonst misst die Prüfung nichts)
      expect(hero.bilder.length, `${art}: Bilder im Fenster`).toBeGreaterThan(4);
      // Die ersten beiden Bilder legen die Ebenen an bzw. malen den Endzustand der Linien; danach bewegt der Compositor
      expect(hero.bilder.slice(2).filter((b) => b.ms >= 2), `${art}: Bilder mit Malzeit ≥ 2 ms`).toEqual([]);
    }

    // Wärmepumpen-Seite: Fenster von „laeuft“ bis „fertig“ (SichtStart); das Scrollen davor malt neue Inhalte, das
    // Aufräumen danach (will-change fällt, die Zeichnung wird einmal flach gemalt) liegt außerhalb der Bewegung
    await page.goto(WAERMEPUMPEN);
    const raum = page.locator(RAUM);
    await expect(raum).toHaveAttribute('data-ablauf', 'bereit');
    // Erst bis knapp vor die Abbildung scrollen: Die Bewerben-Leiste fährt beim ersten Scrollen ein (Übergang mit
    // transitionend, malt die Seite neu); das gehört nicht zur Wärme. Danach liegt die Abbildung noch unter dem Rand.
    await raum.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight - 40, behavior: 'instant' }));
    await page.waitForTimeout(800);
    await expect(raum).toHaveAttribute('data-ablauf', 'bereit');
    await raum.evaluate((el) => {
      new MutationObserver(() => {
        const zustand = el.getAttribute('data-ablauf');
        if (zustand === 'laeuft') performance.mark('lauf-start');
        if (zustand === 'fertig') performance.mark('lauf-ende');
      }).observe(el, { attributes: true, attributeFilter: ['data-ablauf'] });
    });
    const seite = malzeitJeBild(
      await messeMitDrossel(page, browser, async () => {
        await raum.scrollIntoViewIfNeeded();
        await expect(raum).toHaveAttribute('data-ablauf', 'fertig', { timeout: SICHT_ENDE_MS + 3000 });
      }),
      { von: 'lauf-start', bis: 'lauf-ende' },
    );
    expect(seite.bilder.length, 'Wärmepumpen: Bilder im Fenster').toBeGreaterThan(4);
    expect(seite.bilder.slice(2).filter((b) => b.ms >= 2), 'Wärmepumpen: Bilder mit Malzeit ≥ 2 ms').toEqual([]);
  });

  test('beim echten Laden bricht kein Band am Sicherheitsnetz ab; alle vier enden (mobil: CPU 4×, langsames 4G)', async ({ page }) => {
    // Prüfrunde 1 C1-1: Vorher zählte das Netz ab dem Skriptstart im <head>; die Bänder begannen erst mit dem ersten
    // Stilaufbau und brachen bei 1,85 s (Desktop) bzw. 1,0–1,4 s (gedrosselt) ab und sprangen in den Endzustand.
    test.setTimeout(90_000);
    const mobil = test.info().project.name === 'mobile-light';
    await page.addInitScript(() => {
      const w = window as unknown as { __baender: { typ: string; band: string | null; t: number }[] };
      w.__baender = [];
      for (const typ of ['animationstart', 'animationend', 'animationcancel']) {
        document.addEventListener(
          typ,
          (event) => {
            const el = event.target;
            if (el instanceof Element && el.hasAttribute('data-band') && el.closest('[data-waermefeld="hausschnitt"]')) {
              w.__baender.push({ typ, band: el.getAttribute('data-band'), t: performance.now() });
            }
          },
          true,
        );
      }
    });
    const cdp = await page.context().newCDPSession(page);
    if (mobil) {
      await cdp.send('Network.enable');
      // Lighthouse „Slow 4G“: 150 ms RTT, 1,6 Mbit/s herunter, 750 kbit/s hinauf
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    try {
      // domcontentloaded kommt nach dem Kopfskript: Die Klasse steht, bis das Netz sie nach dem Lauf nimmt
      await page.goto(START, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(page.locator('html')).not.toHaveClass(/auftakt/, { timeout: 30_000 });
    } finally {
      if (mobil) {
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
        await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      }
      await cdp.detach();
    }
    const log = await page.evaluate(() => (window as unknown as { __baender: { typ: string; band: string | null; t: number }[] }).__baender);
    expect(log.filter((e) => e.typ === 'animationcancel'), 'abgebrochene Bänder').toEqual([]);
    expect([...new Set(log.filter((e) => e.typ === 'animationend').map((e) => e.band))].sort()).toEqual(['1', '2', '3', '4']);
    await endzustand(page.locator(HERO_FELD));
  });
});

test.describe('reduzierte Bewegung (Standard der Projekte)', () => {
  test('keine Abläufe: Hero und Wärmepumpen-Seite stehen im Endzustand', async ({ page }) => {
    await page.goto(START);
    const feld = page.locator(HERO_FELD);
    await expect(page.locator('html')).not.toHaveClass(/auftakt/);
    expect(await ablaeufe(feld)).toEqual([]);
    await endzustand(feld);
    await page.goto(WAERMEPUMPEN);
    const raum = page.locator(RAUM);
    await expect(raum).toHaveAttribute('data-ablauf', 'fertig');
    await raum.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(raum).toHaveAttribute('data-ablauf', 'fertig');
    expect(await ablaeufe(raum)).toEqual([]);
    await endzustand(raum);
  });
});

test.describe('ohne JavaScript', () => {
  test.use({ javaScriptEnabled: false, contextOptions: { reducedMotion: 'no-preference' } });

  test('der Server liefert den Endzustand: kein Auftakt, der Vergleich „fertig“, alle Bänder sichtbar', async ({ page }) => {
    await page.goto(START);
    const feld = page.locator(HERO_FELD);
    await expect(page.locator('html')).not.toHaveClass(/auftakt/);
    await endzustand(feld);
    await page.goto(WAERMEPUMPEN);
    const raum = page.locator(RAUM);
    await expect(raum).toHaveAttribute('data-ablauf', 'fertig');
    await raum.scrollIntoViewIfNeeded();
    await endzustand(raum);
  });
});
