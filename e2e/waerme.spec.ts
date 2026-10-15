import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Wärmefeld 2.0 (E-031, KERN K-009/K-015, Register `waerme-breitet-sich-aus`): Die Bänder 1–4 wachsen einmal nach √t,
 * das heißeste zuerst. Im Hero als Nachlauf unter `.auftakt` (ab 560 ms, Ende ≤ 1.920 ms vor dem Sicherheitsnetz), auf
 * der Wärmepumpen-Seite beim Sichtbarwerden (SichtStart, Ende ≤ 2.400 ms). Reduziert, ohne Skript und per Sprung an die
 * Stelle steht der Endzustand. Malzeit je Bild unter 2 ms (Handy, CPU 4×).
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

/** Endzustand: jedes Band ganz sichtbar, ohne Maßstab (je Feld vier Bänder: Hero 4, Wärmepumpen-Seite 8). */
async function endzustand(bereich: Locator): Promise<void> {
  const baender = bereich.locator(BAND);
  const anzahl = await baender.count();
  expect(anzahl).toBeGreaterThanOrEqual(4);
  expect(anzahl % 4).toBe(0);
  for (const band of await baender.all()) {
    await expect(band).toHaveCSS('opacity', '1');
    await expect(band).toHaveCSS('transform', 'none');
  }
}

interface TraceEreignis {
  name: string;
  ph: string;
  pid: number;
  tid: number;
  ts: number;
  dur?: number;
  args?: { name?: string };
}

/** Malzeit je Bild auf dem Hauptthread der Seite (wie e2e/bewegung.spec.ts), in der Reihenfolge der Bilder. */
function malzeitJeBild(ereignisse: readonly TraceEreignis[]): { hauptthread: number; malzeitenMs: number[] } {
  const namen = new Map<string, string>();
  for (const e of ereignisse) if (e.ph === 'M' && e.name === 'thread_name' && e.args?.name) namen.set(`${e.pid}:${e.tid}`, e.args.name);
  const zahl = new Map<string, number>();
  for (const e of ereignisse) {
    const k = `${e.pid}:${e.tid}`;
    if (namen.get(k) === 'CrRendererMain') zahl.set(k, (zahl.get(k) ?? 0) + 1);
  }
  const haupt = [...zahl.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const aufHaupt = ereignisse.filter((e) => `${e.pid}:${e.tid}` === haupt);
  const anfaenge = aufHaupt.filter((e) => e.name === 'BeginMainThreadFrame').map((e) => e.ts).sort((a, b) => a - b);
  const summen = new Map<number, number>();
  for (const e of aufHaupt) {
    if (e.name !== 'Paint' || e.ph !== 'X') continue;
    const bild = anfaenge.filter((t) => t <= e.ts).at(-1) ?? 0;
    summen.set(bild, (summen.get(bild) ?? 0) + (e.dur ?? 0) / 1000);
  }
  const reihe = [...summen.entries()].sort((a, b) => a[0] - b[0]).map(([, ms]) => Math.round(ms * 100) / 100);
  return { hauptthread: aufHaupt.length, malzeitenMs: reihe };
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
    expect(liste).toHaveLength(8);
    for (const a of liste) {
      expect(a.iterationen).toBe(1);
      expect(a.dauer).toBe(D4_MS);
      expect(a.verzoegerung + a.dauer).toBeLessThanOrEqual(SICHT_ENDE_MS);
    }
    await expect(raum).toHaveAttribute('data-ablauf', 'fertig', { timeout: SICHT_ENDE_MS + 2000 });
    await endzustand(raum);
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

  test('Malzeit (K-013): während sich die Wärme ausbreitet, malt kein Bild 2 ms oder länger (Handy, CPU 4×)', async ({ page, browser }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Das Budget gilt für das Moto-G-Profil (Handy, CPU 4×).');
    const messen = async (starten: () => Promise<void>, ms: number) => {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'] });
      await starten();
      await page.waitForTimeout(ms);
      const trace = JSON.parse((await browser.stopTracing()).toString('utf8')) as { traceEvents: TraceEreignis[] };
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      await cdp.detach();
      return malzeitJeBild(trace.traceEvents);
    };
    // Hero: Nachlauf neu gestartet
    await page.goto(START);
    await expect(page.locator(HERO_FELD)).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/auftakt/);
    const hero = await messen(() => auftaktNeu(page), 2400);
    expect(hero.hauptthread).toBeGreaterThan(0);
    // Die ersten beiden Bilder legen die Ebenen an; danach bewegt der Compositor sie
    expect(hero.malzeitenMs.slice(2).filter((ms) => ms >= 2), 'Hero: Bilder mit Malzeit ≥ 2 ms').toEqual([]);
    // Wärmepumpen-Seite: Ablauf beim Hinscrollen
    await page.goto(WAERMEPUMPEN);
    const raum = page.locator(RAUM);
    await expect(raum).toHaveAttribute('data-ablauf', 'bereit');
    const seite = await messen(() => raum.scrollIntoViewIfNeeded(), 2800);
    expect(seite.malzeitenMs.slice(2).filter((ms) => ms >= 2), 'Wärmepumpen: Bilder mit Malzeit ≥ 2 ms').toEqual([]);
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
