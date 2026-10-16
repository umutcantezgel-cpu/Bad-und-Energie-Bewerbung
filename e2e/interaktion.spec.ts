import { expect, test, type Page } from '@playwright/test';
import { DIFFUSION_STUETZ, MOTION_REGISTER, TAKT_MS, WECHSEL, KLICK_ENDE_MS } from '../lib/motion/register';
import { FRONT_START, ZEITPLAN } from '../lib/motion/seitenwechsel';
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

  test('Wärmefront: Klick auf eine Stelle deckt vom Klickpunkt ab (Vorlauf, √t ab FRONT_START, ½ Takt versetzt, d-2), wechselt danach und deckt auf', async ({ page }) => {
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

    // vier Schichten, je d-2, nach dem Vorlauf ½ Takt versetzt, linear auf den Stützstellen von FRONT_START (nicht 0,
    // Prüfrunde 4 A4-3) auf 1
    const baender = await gemerkteAblaeufe(page);
    expect(baender).toHaveLength(4);
    expect(baender.map((b) => b.dauer)).toEqual([240, 240, 240, 240]);
    expect(baender.map((b) => b.verzoegerung)).toEqual(MOTION_REGISTER.seitenwechsel.verzoegerungTakte.map((n) => n * TAKT_MS));
    expect(baender[0].verzoegerung).toBe(WECHSEL.vorlaufMs);
    for (const b of baender) {
      expect(b.kurve).toBe('linear');
      expect(b.stellen).toEqual(DIFFUSION_STUETZ.map(([t]) => t));
      expect(b.werte.map((w) => Math.round(Number(w) * 1e4) / 1e4)).toEqual(DIFFUSION_STUETZ.map(([, f]) => Math.round((FRONT_START + f * (1 - FRONT_START)) * 1e4) / 1e4));
    }

    await expect(page).toHaveURL(ziel!);
    await frontZu(page);
    const log = await protokoll(page);
    const klick = log.find((e) => e.art === 'klick')!;
    const auf = log.find((e) => e.art === 'toggle' && e.motion === 'seitenwechsel' && e.zustand === 'open')!;
    const zu = log.find((e) => e.art === 'toggle' && e.motion === 'seitenwechsel' && e.zustand === 'closed')!;
    const push = log.find((e) => e.art === 'push')!;
    // Start beim Klick, Wechsel erst, wenn die erste Schicht deckt, Aufdecken nach dem Wechsel, spätestens nach halten
    expect(auf.t - klick.t).toBeLessThan(50);
    expect(push.t - klick.t).toBeGreaterThanOrEqual(ZEITPLAN.wechsel);
    expect(zu.t).toBeGreaterThan(push.t);
    expect(zu.t - klick.t).toBeLessThanOrEqual(ZEITPLAN.wechselNetz + WECHSEL.haltenMs + ZEITPLAN.aufdeckenNetz + 500);
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
    // Während die Front deckt: Treffer gehen an die Seite (inert wirkt beim Treffertest wie pointer-events: none; unter
    // dem Punkt ist weder die Überlagerung noch eine ihrer Schichten, das oberste Element gehört zur Seite), der Fokus
    // bleibt außerhalb, die Überlagerung ist nicht im Baum
    const lage = await page.evaluate(({ x, y }) => {
      const alle = document.elementsFromPoint(x, y);
      return {
        oben: Boolean(alle[0]) && !alle[0].closest('[popover]'),
        treffer: alle.some((el) => el.closest('[popover]')),
        fokus: Boolean(document.activeElement?.closest('[popover]')),
      };
    }, mitte);
    expect(lage).toEqual({ oben: true, treffer: false, fokus: false });
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

  test('Klick-Wärme: drei Ringe (½ Takt versetzt, d-3, linear auf den Stützstellen ab FRONT_START) am Knopf; nach 480 ms zu', async ({ page }) => {
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
    // Dieselben Keyframes wie die Front: von FRONT_START (nicht 0, Prüfrunde 4 A4-3) auf 1, ohne Vorlauf (--v: 0)
    for (const s of ab) {
      expect(s.kurve).toBe('linear');
      expect(s.stellen).toEqual(DIFFUSION_STUETZ.map(([t]) => t));
      expect(s.werte.map((w) => Math.round(Number(w) * 1e4) / 1e4)).toEqual(DIFFUSION_STUETZ.map(([, f]) => Math.round((FRONT_START + f * (1 - FRONT_START)) * 1e4) / 1e4));
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
      { ms: ZEITPLAN.wechselNetz, sel: FRONT },
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
      const w = window as unknown as { __auf: Promise<{ uebergaenge: string[]; ablaeufe: string[] }>; __halt: boolean; __deckkraft: string[]; __seitenfarbe: boolean };
      w.__halt = true;
      w.__auf = new Promise((fertig) => {
        new MutationObserver((_, beob) => {
          if (!fr.hasAttribute('data-auf')) return;
          beob.disconnect();
          // Die letzte Schicht trägt die Seitenfarbe (Prüfrunde 4 A4-2): für die Auswertung eine Markierfarbe, sonst wäre
          // sie von der Seite nicht zu unterscheiden. Die warmen Schichten sind schon ausgeblendet.
          w.__deckkraft = [...fr.children].map((s) => getComputedStyle(s).opacity);
          const probe = document.body.appendChild(document.createElement('i'));
          probe.style.background = 'var(--surface)';
          w.__seitenfarbe = getComputedStyle(fr.lastElementChild!).backgroundColor === getComputedStyle(probe).backgroundColor;
          probe.remove();
          fr.style.setProperty('--surface', 'rgb(255, 0, 255)');
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
    // Prüfrunde 4 A4-2: Beim Aufdecken deckt die letzte Schicht in der Seitenfarbe; die warmen darunter sind ausgeblendet
    // (kein warmer Saum am Bogen), sie selbst nie
    const stand = await page.evaluate(() => {
      const w = window as unknown as { __deckkraft: string[]; __seitenfarbe: boolean };
      return { deckkraft: w.__deckkraft, seitenfarbe: w.__seitenfarbe };
    });
    expect(stand.deckkraft).toEqual(['0', '0', '0', '1']);
    expect(stand.seitenfarbe).toBe(true);

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

  test('Abdecken (Prüfrunde 4 A4-2, A4-3, C4-1): in fünf Läufen keine gerade Kante in den Bildern bis zum Aufdecken, nie eine einfarbige Pfirsichfläche; von voller Deckung bis zum Aufdecken unter 160 ms', async ({
    page,
    context,
  }) => {
    test.skip(test.info().project.name !== 'desktop-light', 'Gemessen am Desktop: Dort sind die Scheiben am größten (bis rund 3.400 px).');
    test.setTimeout(120_000);
    const ZIEL = '/arbeiten-bei-uns/buero-und-verwaltung';
    const auswertung = await context.newPage();
    const luecken: number[] = [];
    for (let lauf = 1; lauf <= 5; lauf += 1) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const link = page.locator(`main a[href="${ZIEL}"]`).first();
      await link.scrollIntoViewIfNeeded();
      // Phasen in Zeit der Seite: Klick, Ende der letzten Schicht (die Seitenfarbe deckt), Aufdecken (data-auf), zu
      await page.locator(FRONT).evaluate((el) => {
        const p: Record<string, number> = {};
        (window as unknown as { __p: Record<string, number> }).__p = p;
        document.addEventListener('click', () => (p.klick = performance.now()), { capture: true, once: true });
        el.addEventListener('animationend', (e) => {
          if (e.target === el.lastElementChild) p.voll ??= performance.now();
        });
        new MutationObserver(() => {
          if (el.hasAttribute('data-auf')) p.auf ??= performance.now();
        }).observe(el, { attributes: true, attributeFilter: ['data-auf'] });
        el.addEventListener('beforetoggle', (e) => {
          if ((e as ToggleEvent).newState === 'closed') p.zu ??= performance.now();
        });
      });
      const cdp = await context.newCDPSession(page);
      const bilder: { t: number; data: string }[] = [];
      cdp.on('Page.screencastFrame', (f) => {
        bilder.push({ t: (f.metadata.timestamp ?? 0) * 1000, data: f.data });
        void cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
      });
      await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
      await page.waitForTimeout(200);
      const box = (await link.boundingBox())!;
      const klick = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      await page.mouse.click(klick.x, klick.y);
      await expect(page).toHaveURL(ZIEL);
      await frontZu(page);
      await cdp.send('Page.stopScreencast');
      await cdp.detach();
      const p = await page.evaluate(() => {
        const q = (window as unknown as { __p: Record<string, number> }).__p;
        return { klick: q.klick, voll: q.voll, auf: q.auf, zu: q.zu, ursprung: performance.timeOrigin };
      });
      const farben = await page.locator(FRONT).evaluate((el) => [...el.children].map((s) => getComputedStyle(s).backgroundColor));
      const wo = `Lauf ${lauf}`;
      // Zeitplan (Prüfrunde 4 A4-2): Chromium beginnt die Abläufe, sobald die Ebenen gerastert sind (lokal 40–100 ms);
      // ruht die Seite, deckt die Front kurz nach voller Deckung auf; sie ist zu, sobald sie aus dem Bild gestiegen ist
      expect(p.voll - p.klick, wo).toBeLessThanOrEqual(ZEITPLAN.abdecken + 160);
      expect(p.auf - p.voll, wo).toBeGreaterThanOrEqual(0);
      expect(p.auf - p.voll, wo).toBeLessThan(3 * TAKT_MS);
      luecken.push(p.auf - p.voll);
      expect(p.zu - p.auf, wo).toBeLessThanOrEqual(ZEITPLAN.aufdecken + TAKT_MS);
      // Alle Bilder vom Klick bis zum Aufdecken: gerade Kanten zwischen zwei Schichtfarben oder zwischen einer warmen
      // Schicht und der Seite (fehlende Kacheln), länger als 120 px und nicht die Tangente eines Kreises
      const vorher = bilder.filter((b) => b.t >= p.ursprung + p.klick && b.t <= p.ursprung + p.auf);
      expect(vorher.length, wo).toBeGreaterThan(8);
      for (const bild of vorher) {
        const befund = await auswertung.evaluate(
          async ({ bild, farben, klick }) => {
            const bytes = Uint8Array.from(atob(bild), (c) => c.charCodeAt(0));
            const b = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
            const c = new OffscreenCanvas(b.width, b.height);
            const ctx = c.getContext('2d')!;
            ctx.drawImage(b, 0, 0);
            const { data, width, height } = ctx.getImageData(0, 0, b.width, b.height);
            const rgb = farben.map((f) => f.match(/\d+/g)!.slice(0, 3).map(Number));
            const letzte = rgb.length;
            // Klasse je Pixel: 1…n = Schicht (Toleranz 6), 0 = Seite
            const klasse = new Uint8Array(width * height);
            const anteil = new Array(letzte + 1).fill(0);
            for (let i = 0; i < width * height; i += 1) {
              for (let k = 0; k < letzte; k += 1) {
                if (Math.abs(data[i * 4] - rgb[k][0]) + Math.abs(data[i * 4 + 1] - rgb[k][1]) + Math.abs(data[i * 4 + 2] - rgb[k][2]) <= 6) {
                  klasse[i] = k + 1;
                  anteil[k + 1] += 1;
                  break;
                }
              }
            }
            const kante = (a: number, b: number) => {
              const ka = klasse[a];
              const kb = klasse[b];
              if (ka === kb) return false;
              if (ka && kb) return true;
              const warm = (k: number) => k > 0 && k < letzte;
              return warm(ka) || warm(kb);
            };
            const MIN = 120;
            const gerade: string[] = [];
            // waagerecht: Zeile y gegen y + 1; Tangente: Mitte auf der Senkrechten durch den Klick, nicht länger als 2√(5R)
            for (let y = 0; y + 1 < height; y += 1) {
              let lauf = 0;
              for (let x = 0; x <= width; x += 1) {
                if (x < width && kante(y * width + x, (y + 1) * width + x)) lauf += 1;
                else {
                  const mitte = x - lauf / 2;
                  const tangente = Math.abs(mitte - klick.x) <= 6 && lauf <= 2 * Math.sqrt(5 * Math.abs(y - klick.y)) + 12;
                  if (lauf >= MIN && !tangente) gerade.push(`Zeile ${y} ab ${x - lauf}, ${lauf} px`);
                  lauf = 0;
                }
              }
            }
            for (let x = 0; x + 1 < width; x += 1) {
              let lauf = 0;
              for (let y = 0; y <= height; y += 1) {
                if (y < height && kante(y * width + x, y * width + x + 1)) lauf += 1;
                else {
                  const mitte = y - lauf / 2;
                  const tangente = Math.abs(mitte - klick.y) <= 6 && lauf <= 2 * Math.sqrt(5 * Math.abs(x - klick.x)) + 12;
                  if (lauf >= MIN && !tangente) gerade.push(`Spalte ${x} ab ${y - lauf}, ${lauf} px`);
                  lauf = 0;
                }
              }
            }
            const warmGroesst = Math.max(...anteil.slice(1, letzte)) / (width * height);
            return { gerade: gerade.slice(0, 3), warmGroesst };
          },
          { bild: bild.data, farben, klick },
        );
        const ms = Math.round(bild.t - p.ursprung - p.klick);
        expect(befund.gerade, `${wo}, Bild ab ${ms} ms`).toEqual([]);
        // Nie eine einfarbige Pfirsichfläche: keine warme Schicht deckt das Fenster (die letzte trägt die Seitenfarbe)
        expect(befund.warmGroesst, `${wo}, Bild ab ${ms} ms`).toBeLessThan(0.95);
      }
    }
    await auswertung.close();
    // Von voller Deckung bis zum Aufdecken im Mittel (Median der fünf Läufe) unter 160 ms; die neue Seite setzt nach dem
    // Wechsel noch Kopf, Leiste und Sicht-Bereiche, das zählt gegen die Ruhe
    expect(luecken.sort((a, b) => a - b)[2]).toBeLessThan(160);
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
    // Kein Abdecken vor dem Wechsel (der Wechsel wartet nur auf die Seite, nicht auf die 280 ms bis zur ersten Deckung)
    expect(push.t).toBeGreaterThan(klick.t);
    expect(await offen(page, FRONT)).toBe(false);
  });
});
