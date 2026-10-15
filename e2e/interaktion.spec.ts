import { expect, test, type Page } from '@playwright/test';
import { DIFFUSION_STUETZ, TAKT_MS, WECHSEL, KLICK_ENDE_MS } from '../lib/motion/register';
import { ZEITPLAN } from '../lib/motion/seitenwechsel';
import { isDesktop } from './support/site';

/**
 * Klick-Wärme und Wärmefront (E-031, KERN K-009; Insel components/site/waermefront/Waermefront.tsx, Logik
 * lib/motion/seitenwechsel.ts). Die Projekte laufen sonst mit `reducedMotion: 'reduce'` (playwright.config.ts): Dort
 * zeigt die Insel nichts. Die Läufe mit Bewegung schalten `no-preference` ein, je einmal mobil und am Desktop.
 *
 * Gemessen wird mit einem Protokoll, das vor jedem Skript der Seite steht (addInitScript): beforetoggle der beiden
 * Überlagerungen, Klicks (Erfassungsphase, vor der Insel) und history.pushState (der Wechsel von Next).
 */

const FRONT = '[data-motion="seitenwechsel"]';
const KLICK = '[data-motion="klick-waerme"]';
const STELLE_LINK = 'main a[href^="/jobs/"]';

interface Eintrag {
  art: 'toggle' | 'klick' | 'push';
  motion?: string;
  zustand?: string;
  t: number;
  pfad: string;
  wert?: string;
}

declare global {
  interface Window {
    __protokoll: Eintrag[];
  }
}

async function protokollieren(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__protokoll = [];
    const log = (e: Omit<Eintrag, 't' | 'pfad'>) => window.__protokoll.push({ ...e, t: performance.now(), pfad: location.pathname });
    document.addEventListener(
      'beforetoggle',
      (event) => {
        const el = event.target as HTMLElement;
        if (el.dataset?.motion) log({ art: 'toggle', motion: el.dataset.motion, zustand: (event as ToggleEvent).newState });
      },
      true,
    );
    document.addEventListener('click', () => log({ art: 'klick' }), true);
    const push = history.pushState.bind(history);
    history.pushState = (daten, titel, url) => {
      log({ art: 'push', wert: String(url) });
      return push(daten, titel, url);
    };
  });
}

const protokoll = (page: Page) => page.evaluate(() => window.__protokoll.slice());
const offen = (page: Page, sel: string) => page.locator(sel).evaluate((el) => el.matches(':popover-open'));

/** Wartet, bis die Front zu ist (oder zu bleibt). */
async function frontZu(page: Page): Promise<void> {
  await expect.poll(() => offen(page, FRONT), { timeout: 4000 }).toBe(false);
}

interface Ablauf {
  dauer: number;
  verzoegerung: number;
  kurve: string;
  stellen: number[];
  werte: string[];
}

/**
 * Merkt sich beim Öffnen einer Überlagerung (beforetoggle) ein Bild später ihre Abläufe: Dauer, Verzögerung, Kurve,
 * Stellen und Maßstäbe, ohne den Ablauf der Überlagerung selbst (nur die Schichten). Erst setzen, dann klicken.
 */
async function ablaeufeMerken(page: Page, sel: string): Promise<void> {
  await page.locator(sel).evaluate((el) => {
    const w = window as unknown as { __ablaeufe?: Promise<Ablauf[]> };
    w.__ablaeufe = new Promise((fertig) =>
      el.addEventListener(
        'beforetoggle',
        () =>
          requestAnimationFrame(() =>
            fertig(
              el
                .getAnimations({ subtree: true })
                .filter((a) => (a.effect as KeyframeEffect).target !== el)
                .map((a) => {
                  const t = a.effect!.getTiming();
                  const k = (a.effect as KeyframeEffect).getKeyframes();
                  return {
                    dauer: Number(t.duration),
                    verzoegerung: Number(t.delay),
                    kurve: String(t.easing),
                    stellen: k.map((s) => s.computedOffset as number),
                    werte: k.map((s) => String(s.scale ?? '')),
                  };
                }),
            ),
          ),
        { once: true },
      ),
    );
  });
}

const gemerkteAblaeufe = (page: Page) => page.evaluate(() => (window as unknown as { __ablaeufe: Promise<Ablauf[]> }).__ablaeufe);

test.beforeEach(() => {
  test.skip(!['mobile-light', 'desktop-light'].includes(test.info().project.name), 'Die Interaktion läuft je einmal mobil und am Desktop.');
});

test.describe('mit Bewegung (no-preference)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('Wärmefront: Klick auf eine Stelle deckt vom Klickpunkt ab (√t, ½ Takt versetzt, d-2), wechselt danach und deckt auf', async ({ page }) => {
    await protokollieren(page);
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.locator(STELLE_LINK).first();
    const ziel = await link.getAttribute('href');
    await link.scrollIntoViewIfNeeded();
    await ablaeufeMerken(page, FRONT);
    await link.click();

    // vier Bänder, je d-2, ½ Takt versetzt, linear auf den Stützstellen von 0 auf 1
    const baender = await gemerkteAblaeufe(page);
    expect(baender).toHaveLength(4);
    expect(baender.map((b) => b.dauer)).toEqual([240, 240, 240, 240]);
    expect(baender.map((b) => b.verzoegerung)).toEqual([0, 0.5, 1, 1.5].map((n) => n * TAKT_MS));
    for (const b of baender) {
      expect(b.kurve).toBe('linear');
      expect(b.stellen).toEqual(DIFFUSION_STUETZ.map(([t]) => t));
      expect(b.werte.map(Number)).toEqual(DIFFUSION_STUETZ.map(([, f]) => f));
    }

    await expect(page).toHaveURL(ziel!);
    await frontZu(page);
    const log = await protokoll(page);
    const klick = log.find((e) => e.art === 'klick')!;
    const auf = log.find((e) => e.art === 'toggle' && e.motion === 'seitenwechsel' && e.zustand === 'open')!;
    const zu = log.find((e) => e.art === 'toggle' && e.motion === 'seitenwechsel' && e.zustand === 'closed')!;
    const push = log.find((e) => e.art === 'push')!;
    // Start beim Klick, Wechsel erst nach dem Abdecken, Aufdecken nach dem Wechsel, spätestens nach halten
    expect(auf.t - klick.t).toBeLessThan(50);
    expect(push.t - klick.t).toBeGreaterThanOrEqual(ZEITPLAN.abdecken - TAKT_MS);
    expect(zu.t).toBeGreaterThan(push.t);
    expect(zu.t - klick.t).toBeLessThanOrEqual(ZEITPLAN.abdeckenNetz + WECHSEL.haltenMs + ZEITPLAN.aufdeckenNetz + 500);
    expect(await page.locator(FRONT).getAttribute('data-auf')).toBeNull();
  });

  test('die Front ist still für Hilfsmittel und Zeiger: aria-hidden, inert, nicht trefferbar, ohne Fokus; kein Layout-Versatz', async ({ page }) => {
    await protokollieren(page);
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      (window as unknown as { __versatz: string[] }).__versatz = [];
      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries() as unknown as { sources?: { node?: Node | null }[] }[]) {
          for (const q of e.sources ?? []) {
            const el = q.node instanceof Element ? q.node : q.node?.parentElement;
            if (el?.closest('[popover]')) (window as unknown as { __versatz: string[] }).__versatz.push(el.outerHTML.slice(0, 80));
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    for (const sel of [FRONT, KLICK]) {
      const el = page.locator(sel);
      await expect(el).toHaveAttribute('popover', 'manual');
      await expect(el).toHaveAttribute('aria-hidden', 'true');
      await expect(el).toHaveAttribute('inert', '');
      await expect(el).toBeHidden();
    }
    const link = page.locator(STELLE_LINK).first();
    await link.scrollIntoViewIfNeeded();
    const box = (await link.boundingBox())!;
    const mitte = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await link.click();
    await expect.poll(() => offen(page, FRONT)).toBe(true);
    // Während die Front deckt: Treffer gehen an die Seite, der Fokus bleibt außerhalb, die Überlagerung ist nicht im Baum
    const lage = await page.evaluate(({ x, y }) => {
      const treffer = document.elementFromPoint(x, y);
      return {
        treffer: Boolean(treffer?.closest('[popover]')),
        fokus: Boolean(document.activeElement?.closest('[popover]')),
        zeiger: getComputedStyle(document.querySelector('[data-motion="seitenwechsel"]')!).pointerEvents,
      };
    }, mitte);
    expect(lage).toEqual({ treffer: false, fokus: false, zeiger: 'none' });
    // Im Baum der Barrierefreiheit (Chromium) ist die offene Front samt Schichten ausgeblendet
    const cdp = await page.context().newCDPSession(page);
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: FRONT });
    const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.every((n) => n.ignored)).toBe(true);
    await cdp.detach();
    await frontZu(page);
    expect(await page.evaluate(() => (window as unknown as { __versatz: string[] }).__versatz)).toEqual([]);
  });

  test('Tastatur: Enter startet die Front in der Mitte des Links; der Fokus bleibt in der Seite und Tab geht weiter', async ({ page }, testInfo) => {
    test.skip(!isDesktop(testInfo), 'Die Kopf-Navigation steht am Desktop.');
    await protokollieren(page);
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.getByRole('banner').getByRole('link', { name: 'Einsatzgebiet', exact: true });
    await link.focus();
    const box = (await link.boundingBox())!;
    await page.keyboard.press('Enter');
    await expect.poll(() => offen(page, FRONT)).toBe(true);
    const lage = await page.locator(FRONT).evaluate((el) => [parseFloat(el.style.getPropertyValue('--x')), parseFloat(el.style.getPropertyValue('--y'))]);
    expect(Math.abs(lage[0] - (box.x + box.width / 2))).toBeLessThanOrEqual(1);
    expect(Math.abs(lage[1] - (box.y + box.height / 2))).toBeLessThanOrEqual(1);
    await expect(page).toHaveURL('/einsatzgebiet');
    await frontZu(page);
    const fokus = await page.evaluate(() => {
      const a = document.activeElement;
      return { inPopover: Boolean(a?.closest('[popover]')), imDokument: Boolean(a && document.contains(a)) };
    });
    expect(fokus).toEqual({ inPopover: false, imDokument: true });
    await page.keyboard.press('Tab');
    const naechstes = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement | null;
      const r = a?.getBoundingClientRect();
      return { body: a === document.body, sichtbar: Boolean(r && r.width > 0 && r.height > 0), inPopover: Boolean(a?.closest('[popover]')) };
    });
    expect(naechstes).toEqual({ body: false, sichtbar: true, inPopover: false });
  });

  test('keine Front zu Arbeitsseiten, bei Zurück und Vor und aus dem Bewerbungsweg; die Klick-Wärme dort, wo sie hingehört', async ({ page }) => {
    await protokollieren(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Zu einer Arbeitsseite (/impressum): sofortiger Wechsel, nur die Klick-Wärme am Link
    const impressum = page.getByRole('contentinfo').getByRole('link', { name: 'Impressum', exact: true });
    await impressum.scrollIntoViewIfNeeded();
    await impressum.click();
    await expect(page).toHaveURL('/impressum');
    let log = await protokoll(page);
    expect(log.filter((e) => e.motion === 'seitenwechsel')).toEqual([]);
    expect(log.filter((e) => e.motion === 'klick-waerme').map((e) => e.zustand)).toContain('open');

    // Zurück und Vor: sofort, ohne Front
    await page.goBack();
    await expect(page).toHaveURL('/');
    await page.goForward();
    await expect(page).toHaveURL('/impressum');
    log = await protokoll(page);
    expect(log.filter((e) => e.motion === 'seitenwechsel')).toEqual([]);

    // Bewerbungsweg: keine Klick-Wärme, keine Front, auch nicht zur Startseite
    await page.goto('/bewerbung');
    await page.waitForLoadState('networkidle');
    await page.getByRole('banner').getByRole('link').first().click();
    await expect(page).not.toHaveURL(/\/bewerbung/);
    log = await protokoll(page);
    expect(log.filter((e) => e.art === 'toggle')).toEqual([]);
  });

  test('Klick-Wärme: drei Scheiben (½ Takt versetzt, d-3, linear auf den Stützstellen) am Knopf; nach 480 ms zu', async ({ page }) => {
    await protokollieren(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const knopf = page.getByRole('button', { name: 'Anhalten' }).first();
    await knopf.scrollIntoViewIfNeeded();
    await ablaeufeMerken(page, KLICK);
    await knopf.click();
    const ab = await gemerkteAblaeufe(page);
    expect(ab.map((s) => s.dauer)).toEqual([400, 400, 400]);
    expect(ab.map((s) => s.verzoegerung)).toEqual([0, 0.5, 1].map((n) => n * TAKT_MS));
    for (const s of ab) {
      expect(s.kurve).toBe('linear');
      expect(s.stellen).toEqual(DIFFUSION_STUETZ.map(([t]) => t));
      expect(s.werte.map(Number)).toEqual(DIFFUSION_STUETZ.map(([, f]) => f));
    }
    await expect.poll(() => offen(page, KLICK), { timeout: 2000 }).toBe(false);
    const log = (await protokoll(page)).filter((e) => e.motion === 'klick-waerme');
    expect(log.map((e) => e.zustand)).toEqual(['open', 'closed']);
    expect(log[1].t - log[0].t).toBeGreaterThanOrEqual(KLICK_ENDE_MS - 20);
    expect(log[1].t - log[0].t).toBeLessThan(KLICK_ENDE_MS + 400);
  });

  test('Malzeit (KERN K-009): während die Front deckt, malt kein Bild 2 ms oder länger (Handy, CPU 4×)', async ({ page, browser }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Gemessen am Handy.');
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.locator(STELLE_LINK).first();
    await link.scrollIntoViewIfNeeded();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'] });
    await link.click();
    // Nur das Abdecken (bis einen Takt vor dem Wechsel): die neue Seite malt danach unter der Front
    await page.waitForTimeout(ZEITPLAN.abdecken - TAKT_MS);
    const puffer = await browser.stopTracing();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await cdp.detach();
    const { traceEvents } = JSON.parse(puffer.toString('utf8')) as { traceEvents: TraceEreignis[] };
    const { hauptthread, malzeitenMs } = malzeitJeBild(traceEvents);
    expect(hauptthread).toBeGreaterThan(0);
    expect(malzeitenMs.length).toBeGreaterThan(0);
    // Die ersten zwei Bilder zeichnen die Ebenen einmal; danach bewegt nur noch der Compositor
    expect(malzeitenMs.slice(2).filter((ms) => ms >= 2)).toEqual([]);
  });
});

test.describe('reduzierte Bewegung', () => {
  test('keine Front und keine Klick-Wärme: Der Link wechselt sofort', async ({ page }) => {
    await protokollieren(page);
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.locator(STELLE_LINK).first();
    const ziel = await link.getAttribute('href');
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(ziel!);
    const log = await protokoll(page);
    expect(log.filter((e) => e.art === 'toggle')).toEqual([]);
    const klick = log.find((e) => e.art === 'klick')!;
    const push = log.find((e) => e.art === 'push')!;
    // Kein Abdecken vor dem Wechsel (der Wechsel wartet nur auf die Seite, nicht auf 360 ms Bewegung)
    expect(push.t).toBeGreaterThan(klick.t);
    expect(await offen(page, FRONT)).toBe(false);
  });
});

interface TraceEreignis {
  name: string;
  ph: string;
  pid: number;
  tid: number;
  ts: number;
  dur?: number;
  args?: { name?: string };
}

/** Malzeit je Bild auf dem Hauptthread der Seite (wie e2e/bewegung.spec.ts, Prüfung E-029 Befund 10). */
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
  const anfaenge = aufHaupt
    .filter((e) => e.name === 'BeginMainThreadFrame')
    .map((e) => e.ts)
    .sort((a, b) => a - b);
  const summen = new Map<number, number>();
  for (const e of aufHaupt) {
    if (e.name !== 'Paint' || e.ph !== 'X') continue;
    const bild = anfaenge.filter((t) => t <= e.ts).at(-1) ?? 0;
    summen.set(bild, (summen.get(bild) ?? 0) + (e.dur ?? 0) / 1000);
  }
  return {
    hauptthread: aufHaupt.length,
    malzeitenMs: [...summen.entries()].sort((a, b) => a[0] - b[0]).map(([, ms]) => Math.round(ms * 100) / 100),
  };
}
