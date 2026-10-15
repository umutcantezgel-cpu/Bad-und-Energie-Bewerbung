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

  test('Wärmefront ist immer ein Kreis (Prüfrunde 2 A2-1, C2-2): Klick nahe der Ecke, jede Scheibe gezeichnet höchstens 2 × --radius-voll breit, voll gerundet, per transform bis über die fernste Ecke', async ({
    page,
  }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.locator('a[href="/"]').first();
    const box = (await link.boundingBox())!;
    // Den Link möglichst nah an der Ecke links oben treffen (Logo im Kopf)
    const x = Math.max(1, Math.round(box.x + 2));
    const y = Math.max(1, Math.round(box.y + 2));
    await page.mouse.click(x, y);
    const schichten = await page.locator(FRONT).evaluate((el) =>
      [...el.children].map((i) => {
        const cs = getComputedStyle(i);
        const r = (i as HTMLElement).getBoundingClientRect();
        return {
          breite: parseFloat(cs.width),
          radius: parseFloat(cs.borderTopLeftRadius),
          transform: cs.transform,
          voll: { links: r.left, oben: r.top, rechts: r.right, unten: r.bottom },
        };
      }),
    );
    const radiusVoll = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius-voll')));
    const fenster = page.viewportSize()!;
    const ecke = Math.max(Math.hypot(x, y), Math.hypot(fenster.width - x, y), Math.hypot(x, fenster.height - y), Math.hypot(fenster.width - x, fenster.height - y));
    expect(schichten).toHaveLength(4);
    for (const s of schichten) {
      // Gezeichnet ein Kreis: der Radius ist mindestens die halbe Breite (sonst blieben gerade Flanken)
      expect(s.breite).toBeLessThanOrEqual(2 * radiusVoll);
      expect(s.radius).toBeGreaterThanOrEqual(s.breite / 2);
      const faktor = Number(s.transform.match(/^matrix\(([\d.]+), 0, 0, ([\d.]+), 0, 0\)$/)?.[1]);
      expect(faktor).toBeGreaterThanOrEqual(1);
      // Endgröße (ohne den laufenden Ablauf) reicht über die fernste Ecke
      expect((s.breite * faktor) / 2).toBeGreaterThanOrEqual(ecke);
    }
    await expect(page).toHaveURL('/');
    await frontZu(page);
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

  test('Klick-Wärme achtet auf den Ton der Fläche (Prüfrunde 3 A3-1): auf Papier und im Navy-Band jeder Ring 1,5–3:1 gegen die Fläche', async ({ page }) => {
    await protokollieren(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const lum = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const kontrast = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    };
    const hex = (rgb: string) => `#${rgb.match(/\d+/g)!.slice(0, 3).map((v) => Number(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    // „Anhalten“ steht im Navy-Band der Einzelheit, die Telefonnummer im Kopf auf Papier (keine Front: fremdes Ziel)
    const ziele = [
      { ort: 'Band', el: page.getByRole('button', { name: 'Anhalten' }).first(), ton: 'inverse' },
      { ort: 'Papier', el: page.getByRole('banner').locator('a[href^="tel:"]').first(), ton: '' },
    ];
    for (const z of ziele) {
      await z.el.scrollIntoViewIfNeeded();
      // Fläche des Tons, auf dem das Element steht (die Rolle --surface dort; gezeichnet ist sie oft von einem Geschwister)
      const flaeche = await z.el.evaluate((el) => getComputedStyle(el.closest('[data-tone]') ?? document.documentElement).getPropertyValue('--surface').trim().toUpperCase());
      await z.el.evaluate((el) => el.addEventListener('click', (e) => e.preventDefault(), { once: true }));
      const vorher = (await protokoll(page)).length;
      await z.el.click();
      await expect.poll(async () => (await protokoll(page)).slice(vorher).some((e) => e.motion === 'klick-waerme' && e.zustand === 'open')).toBe(true);
      const lage = await page.locator(KLICK).evaluate((el) => ({ ton: (el as HTMLElement).dataset.tone ?? null, ringe: [...el.children].map((r) => getComputedStyle(r).borderTopColor) }));
      expect(lage.ton, z.ort).toBe(z.ton);
      expect(new Set(lage.ringe).size, `${z.ort}: drei verschiedene Ringe`).toBe(3);
      for (const ring of lage.ringe.map(hex)) {
        const k = kontrast(ring, flaeche);
        expect(k, `${z.ort} ${ring} auf ${flaeche}`).toBeGreaterThanOrEqual(1.5);
        expect(k, `${z.ort} ${ring} auf ${flaeche}`).toBeLessThanOrEqual(3);
      }
      await expect.poll(() => offen(page, KLICK), { timeout: 2000 }).toBe(false);
    }
  });

  test('Malzeit (KERN K-009): während die Front deckt, malt nach den ersten zwei Bildern kein Bild 2 ms oder länger; während sie aufdeckt, keines (Handy, CPU 4×)', async ({
    page,
    browser,
  }) => {
    test.skip(test.info().project.name !== 'mobile-light', 'Gemessen am Handy.');
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    // Die Stelle führt zu einer Seite, die nach dem Wechsel nachlädt (Bewerbung als React.lazy) und dabei einblendet
    const link = page.locator(STELLE_LINK).first();
    await link.scrollIntoViewIfNeeded();
    // Fenster 1 (Prüfrunde 2 C2-4): das ganze Abdecken, vom Klick bis zum Wechsel (router.push, hier am pushState
    // erkannt), spätestens bis zum Netz. Jedes Bandende liegt darin; seit der Füllung both malt dort nichts mehr neu.
    // Danach malt die neue Seite unter der deckenden Front (die eine Ausnahme im Register), bis sie ruht.
    // Fenster 2 (Prüfrunde 3 C3-1): das ganze Aufdecken, vom Start (data-auf) bis die Front zu ist (beforetoggle).
    await page.evaluate(
      ({ ms, sel }) => {
        const fr = document.querySelector<HTMLElement>(sel)!;
        new MutationObserver(() => {
          if (fr.hasAttribute('data-auf')) performance.mark('auf-start');
        }).observe(fr, { attributes: true, attributeFilter: ['data-auf'] });
        fr.addEventListener('beforetoggle', (e) => {
          if ((e as ToggleEvent).newState === 'closed') performance.mark('auf-ende');
        });
        document.addEventListener(
          'click',
          () => {
            performance.mark('lauf-start');
            let ende = false;
            const markiere = () => {
              if (ende) return;
              ende = true;
              performance.mark('lauf-ende');
            };
            const push = history.pushState.bind(history);
            history.pushState = (...args: Parameters<History['pushState']>) => {
              markiere();
              push(...args);
            };
            setTimeout(markiere, ms);
          },
          { capture: true, once: true },
        );
      },
      { ms: ZEITPLAN.abdeckenNetz, sel: FRONT },
    );
    const ereignisse = await messeMitDrossel(page, browser, async () => {
      await link.click();
      await expect(page).not.toHaveURL('/jobs', { timeout: 5000 });
      await frontZu(page);
    });
    const front = malzeitJeBild(ereignisse, { von: 'lauf-start', bis: 'lauf-ende' });
    expect(front.hauptthread).toBeGreaterThan(0);
    expect(front.bilder.length, 'Bilder im Fenster').toBeGreaterThan(6);
    // Die ersten zwei Bilder zeichnen die Ebenen einmal; danach bewegt nur noch der Compositor, auch an jedem Bandende
    expect(front.bilder.slice(2).filter((b) => b.ms >= 2)).toEqual([]);
    // Aufdecken: Die neue Seite hat unter der Front fertig gemalt (auch die nachgeladene Bewerbung und ihr Einblenden);
    // die Ebenen stehen schon, also gilt das Budget ab dem ersten Bild
    const auf = malzeitJeBild(ereignisse, { von: 'auf-start', bis: 'auf-ende' });
    expect(auf.bilder.length, 'Bilder beim Aufdecken').toBeGreaterThanOrEqual(5);
    expect(auf.bilder.filter((b) => b.ms >= 2)).toEqual([]);
  });

  test('Aufdecken (Prüfrunde 3 A3-2): Die Front steigt nur per transform aus dem Bild, ohne Verblassen; unten ein Kreisbogen, keine gerade Kante, kein Streifen', async ({
    page,
  }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.locator(STELLE_LINK).first();
    await link.scrollIntoViewIfNeeded();
    // Beim Start des Aufdeckens anhalten: die Übergänge der Schichten pausieren; die Front bleibt offen, bis gemessen ist
    await page.locator(FRONT).evaluate((el) => {
      const fr = el as HTMLElement;
      const w = window as unknown as { __auf: Promise<{ uebergaenge: string[]; ablaeufe: string[] }>; __halt: boolean };
      w.__halt = true;
      w.__auf = new Promise((fertig) => {
        new MutationObserver((_, beob) => {
          if (!fr.hasAttribute('data-auf')) return;
          beob.disconnect();
          fr.hidePopover = () => {};
          new MutationObserver(() => {
            if (w.__halt && !fr.hasAttribute('data-auf')) fr.setAttribute('data-auf', '');
          }).observe(fr, { attributes: true, attributeFilter: ['data-auf'] });
          for (const s of fr.children) void getComputedStyle(s).translate;
          const alle = fr.getAnimations({ subtree: true });
          const uebergaenge = alle.filter((a) => a instanceof CSSTransition) as CSSTransition[];
          for (const a of uebergaenge) a.pause();
          fertig({
            uebergaenge: uebergaenge.map((a) => `${a.transitionProperty}@${[...fr.children].indexOf((a.effect as KeyframeEffect).target as Element)}`),
            ablaeufe: alle
              .filter((a) => !(a instanceof CSSTransition))
              .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k)))
              .filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k)),
          });
        }).observe(fr, { attributes: true, attributeFilter: ['data-auf'] });
      });
    });
    await link.click();
    const lauf = await page.evaluate(() => (window as unknown as { __auf: Promise<{ uebergaenge: string[]; ablaeufe: string[] }> }).__auf);
    // Nur translate, je Schicht einmal; die Front verblasst nicht (keine Mischfarbe), das Wachsen steht nur still
    expect(lauf.uebergaenge.sort()).toEqual(['translate@0', 'translate@1', 'translate@2', 'translate@3']);
    expect([...new Set(lauf.ablaeufe)]).toEqual(['scale']);

    const farbe = await page.locator(FRONT).evaluate((el) => getComputedStyle(el.lastElementChild!).backgroundColor);
    const [R, G, B] = farbe.match(/\d+/g)!.map(Number);
    const auswertung = await page.context().newPage();
    const proben: { zeit: number; front: number; gerade: number[] }[] = [];
    for (const zeit of [30, 60, 90, 130]) {
      await page.locator(FRONT).evaluate((el, t) => {
        for (const a of el.getAnimations({ subtree: true })) if (a instanceof CSSTransition) a.currentTime = t;
      }, zeit);
      await page.evaluate(() => new Promise((fertig) => requestAnimationFrame(() => requestAnimationFrame(fertig))));
      const bild = (await page.screenshot({ scale: 'css' })).toString('base64');
      proben.push({
        zeit,
        ...(await auswertung.evaluate(
          async ({ bild, R, G, B }) => {
            const bytes = Uint8Array.from(atob(bild), (c) => c.charCodeAt(0));
            const b = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
            const c = new OffscreenCanvas(b.width, b.height);
            const ctx = c.getContext('2d')!;
            ctx.drawImage(b, 0, 0);
            const { data, width, height } = ctx.getImageData(0, 0, b.width, b.height);
            const istFront = (x: number, y: number) => {
              const i = (y * width + x) * 4;
              return Math.abs(data[i] - R) + Math.abs(data[i + 1] - G) + Math.abs(data[i + 2] - B) <= 12;
            };
            let front = 0;
            const gerade: number[] = [];
            for (let y = 0; y < height; y += 1) {
              let wechsel = 0;
              for (let x = 0; x < width; x += 1) {
                const f = istFront(x, y);
                if (f) front += 1;
                if (y + 1 < height && f !== istFront(x, y + 1)) wechsel += 1;
              }
              // Gerade Kante: in einer Zeile wechselt fast die ganze Breite zwischen Front und Seite
              if (wechsel >= 0.9 * width) gerade.push(y);
            }
            return { front: front / (width * height), gerade };
          },
          { bild, R, G, B },
        )),
      });
    }
    for (const p of proben) expect(p.gerade, `gerade Kante bei ${p.zeit} ms`).toEqual([]);
    // Die Proben zeigen den Bogen: Front und Seite zugleich im Bild, die Front nimmt ab
    expect(proben.some((p) => p.front > 0.05 && p.front < 0.95)).toBe(true);
    for (let i = 1; i < proben.length; i += 1) expect(proben[i].front).toBeLessThanOrEqual(proben[i - 1].front);
    // Am Ende liegt jede Schicht ganz über dem Fenster: kein ungetönter oder getönter Streifen
    const unten = await page.locator(FRONT).evaluate((el) => {
      for (const a of el.getAnimations({ subtree: true })) if (a instanceof CSSTransition) a.finish();
      return [...el.children].map((s) => s.getBoundingClientRect().bottom);
    });
    for (const u of unten) expect(u).toBeLessThanOrEqual(0);
    await auswertung.close();
    await page.locator(FRONT).evaluate((el) => {
      (window as unknown as { __halt: boolean }).__halt = false;
      const fr = el as HTMLElement;
      delete (fr as Partial<HTMLElement>).hidePopover;
      fr.removeAttribute('data-auf');
      fr.hidePopover();
    });
    await frontZu(page);
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

test.describe('erzwungene Farben (Prüfrunde 3 C3-4)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference', forcedColors: 'active' } });

  test('keine Front und keine Klick-Wärme: Die Systempalette bleibt ungestört, der Link wechselt sofort', async ({ page }) => {
    await protokollieren(page);
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    const link = page.locator(STELLE_LINK).first();
    const ziel = await link.getAttribute('href');
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(ziel!);
    // Auch ein Knopf: keine Ringe
    const knopf = page.locator('main button:not([aria-disabled="true"])').first();
    if (await knopf.count()) await knopf.click({ trial: false }).catch(() => {});
    await page.waitForTimeout(KLICK_ENDE_MS);
    expect((await protokoll(page)).filter((e) => e.art === 'toggle')).toEqual([]);
    expect(await offen(page, FRONT)).toBe(false);
    expect(await offen(page, KLICK)).toBe(false);
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
