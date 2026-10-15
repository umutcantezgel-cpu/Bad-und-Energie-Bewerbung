import { expect, test, type Page } from '@playwright/test';
import { DIFFUSION_STUETZ, TAKT_MS, WECHSEL, KLICK_ENDE_MS } from '../lib/motion/register';
import { ZEITPLAN } from '../lib/motion/seitenwechsel';
import { malzeitJeBild, messeMitDrossel } from './support/malzeit';
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
    // Die letzte Stelle: Die Seite steht beim Klick ein Stück tiefer, die neue Seite muss trotzdem oben stehen
    const link = page.locator(STELLE_LINK).last();
    const ziel = await link.getAttribute('href');
    await link.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY), 'Ausgangsseite gescrollt').toBeGreaterThan(0);
    // Lage der Seite in dem Moment, in dem die Front aufdeckt (Prüfrunde 1 A1-2, C1-5)
    await page.locator(FRONT).evaluate((el) => {
      const w = window as unknown as { __beimAufdecken?: number };
      new MutationObserver(() => {
        if (el.hasAttribute('data-auf') && w.__beimAufdecken === undefined) w.__beimAufdecken = window.scrollY;
      }).observe(el, { attributes: true, attributeFilter: ['data-auf'] });
    });
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
    // Die neue Seite steht oben, schon wenn die Front aufdeckt (kein weiches Scrollen beim Wechsel)
    expect(await page.evaluate(() => (window as unknown as { __beimAufdecken?: number }).__beimAufdecken)).toBe(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
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

  test('Klick-Wärme: drei Ringe (½ Takt versetzt, d-3, linear auf den Stützstellen) am Knopf; nach 480 ms zu', async ({ page }) => {
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

  test('Malzeit (KERN K-009): während die Front deckt, malt nach den ersten zwei Bildern kein Bild 2 ms oder länger (Handy, CPU 4×)', async ({
    page,
    browser,
  }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Gemessen am Handy.');
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.locator(STELLE_LINK).first();
    await link.scrollIntoViewIfNeeded();
    // Fenster: nur das Abdecken, vom Klick bis einen Takt vor dem Wechsel (danach deckt die heißeste Schicht das Fenster;
    // wenn die Abläufe enden, malt der Browser die Front einmal flach, und die neue Seite malt unter ihr)
    await page.evaluate((ms) => {
      document.addEventListener(
        'click',
        () => {
          performance.mark('lauf-start');
          setTimeout(() => performance.mark('lauf-ende'), ms);
        },
        { capture: true, once: true },
      );
    }, ZEITPLAN.abdecken - TAKT_MS);
    const front = malzeitJeBild(
      await messeMitDrossel(page, browser, async () => {
        await link.click();
        await expect(page).not.toHaveURL('/jobs', { timeout: 5000 });
      }),
      { von: 'lauf-start', bis: 'lauf-ende' },
    );
    expect(front.hauptthread).toBeGreaterThan(0);
    expect(front.bilder.length, 'Bilder im Fenster').toBeGreaterThan(4);
    // Die ersten zwei Bilder zeichnen die Ebenen einmal; danach bewegt nur noch der Compositor
    expect(front.bilder.slice(2).filter((b) => b.ms >= 2)).toEqual([]);
  });

  test('Klick auf „Jetzt bewerben“: keine Klick-Wärme auf dem Weg in den Bewerbungsweg, auch nicht nach dem Wechsel (Prüfrunde 1 C1-3)', async ({
    page,
  }) => {
    await protokollieren(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const bewerben = page.locator('main a[href^="/bewerbung"]').first();
    await bewerben.scrollIntoViewIfNeeded();
    await bewerben.click();
    await expect(page).toHaveURL(/\/bewerbung/);
    await page.waitForTimeout(KLICK_ENDE_MS);
    const log = await protokoll(page);
    expect(log.filter((e) => e.art === 'toggle')).toEqual([]);
    expect(await offen(page, KLICK)).toBe(false);
  });

  test('Seitenwechsel in den ersten Sekunden: die Startseite steht im Endzustand, kein Auftakt läuft an (Prüfrunde 1 C1-2)', async ({ page }) => {
    for (const [von, link] of [
      ['/jobs', 'Wärmefront'],
      ['/bewerbung', 'ohne Front'],
    ] as const) {
      await page.goto(von);
      await page.waitForLoadState('networkidle');
      // Wie in den ersten 2 s nach dem Laden: Die Klasse des Kopfskripts steht noch
      await page.evaluate(() => document.documentElement.classList.add('auftakt'));
      await page.getByRole('banner').getByRole('link').first().click();
      await expect(page, link).toHaveURL('/');
      await expect(page.locator('html'), link).not.toHaveClass(/auftakt/);
      const feld = page.locator('[data-waermefeld="hausschnitt"]');
      await expect(feld).toBeVisible();
      const ablaeufe = await feld.evaluate((el) => el.getAnimations({ subtree: true }).length);
      expect(ablaeufe, link).toBe(0);
      for (const band of await feld.locator('[data-band]').all()) await expect(band).toHaveCSS('opacity', '1');
    }
  });
});

test.describe('Zeiger (E-031)', () => {
  test('über deaktivierten Knöpfen (aria-disabled) not-allowed statt der Hand (Prüfrunde 1 C1-7)', async ({ page }, testInfo) => {
    test.skip(!isDesktop(testInfo), 'Der eigene Zeiger gilt bei feinem Zeiger mit Hover.');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const zeiger = await page.evaluate(() => {
      const aus = [...document.querySelectorAll('button[aria-disabled="true"], [role="button"][aria-disabled="true"]')];
      const an = document.querySelector('main button:not(:disabled):not([aria-disabled="true"])');
      return { aus: aus.map((el) => getComputedStyle(el).cursor), an: an ? getComputedStyle(an).cursor : null };
    });
    expect(zeiger.aus.length, 'deaktivierte Knöpfe auf der Startseite').toBeGreaterThan(0);
    for (const cursor of zeiger.aus) expect(cursor).toBe('not-allowed');
    expect(zeiger.an).toMatch(/hand\.svg/);
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
