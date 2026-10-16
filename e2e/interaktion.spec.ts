import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { DAUER_MS, DIFFUSION_STUETZ, FRONT_RINGE, MOTION_REGISTER, TAKT_MS, WECHSEL, KLICK_ENDE_MS } from '../lib/motion/register';
import { FRONT_SCHICHTEN, FRONT_START, RING_START, ZEITPLAN } from '../lib/motion/seitenwechsel';
import { kurveAus } from '../lib/motion/__tests__/keyframes';
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
/** Schichten der Front (Owner-Feedback 16.10.2026 (2)): Schleier und Seitenfarbe wachsen mit w, die Ringe nach √t (r). */
const MIT_W = [0, 1, 5];
const RINGE = [2, 3, 4];
/** k-wechsel aus theme.css: Wachsen der Front, Verblassen der Front und der Klick-Wärme, Steigen des Hauptinhalts. */
const WECHSEL_KURVE = kurveAus(readFileSync(path.join(__dirname, '../app/styles/theme.css'), 'utf8'), 'k-wechsel');

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
  /** Name des Keyframe-Ablaufs ohne den Präfix des CSS-Moduls (w, f). */
  name: string;
  /** Index der Schicht in der Überlagerung. */
  schicht: number;
  dauer: number;
  verzoegerung: number;
  /** Kurve der Keyframes (CSS-Abläufe tragen sie dort, die Wirkung selbst ist linear). */
  kurve: string;
  stellen: number[];
  werte: Record<string, string>[];
}

/**
 * Merkt sich beim Öffnen einer Überlagerung (beforetoggle) ein Bild später ihre Abläufe: Name, Schicht, Dauer,
 * Verzögerung, Kurve, Stellen und Werte (scale, opacity), ohne Abläufe der Überlagerung selbst. Erst setzen, dann klicken.
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
                    name: String((a as CSSAnimation).animationName).replace(/^.*__/, ''),
                    schicht: [...el.children].indexOf((a.effect as KeyframeEffect).target as Element),
                    dauer: Number(t.duration),
                    verzoegerung: Number(t.delay),
                    kurve: String(k[0].easing),
                    stellen: k.map((s) => s.computedOffset as number),
                    werte: k.map((s) => Object.fromEntries(['scale', 'opacity'].filter((p) => p in s).map((p) => [p, String(s[p])]))),
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

  test('Wärmefront (Owner-Feedback 16.10.2026 (2)): vom Klickpunkt ein sanfter Wärmeschleier – Start bei 15 % der Diagonale, nach einem Takt mit k-wechsel gewachsen –, darauf drei Ringe nach √t, versetzt und verschieden lang; Wechsel erst gedeckt, dann verblasst sie', async ({ page }) => {
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

    // Sechs Schichten mit je zwei Abläufen: Schleier und Seitenfarbe w (Wachsen, d-4 mit k-wechsel nach einem Takt Vorlauf,
    // von --z auf --m), die Ringe r (√t auf den Stützstellen, ganze Takte, ab ihrer Verzögerung); alle f (Einblenden,
    // Schleier ½ Takt versetzt ab dem Klick, die Ringe nach 1, 2½, 4 Takten mit d-1, die Seitenfarbe nach 5½ Takten)
    const ab = await gemerkteAblaeufe(page);
    expect(ab).toHaveLength(12);
    const w = ab.filter((a) => a.name === 'w').sort((x, y) => x.schicht - y.schicht);
    const r = ab.filter((a) => a.name === 'r').sort((x, y) => x.schicht - y.schicht);
    const f = ab.filter((a) => a.name === 'f').sort((x, y) => x.schicht - y.schicht);
    expect(w.map((a) => a.schicht)).toEqual(MIT_W);
    expect(r.map((a) => a.schicht)).toEqual(RINGE);
    expect(f.map((a) => a.schicht)).toEqual([0, 1, 2, 3, 4, 5]);
    r.forEach((a, j) => {
      expect(a.dauer).toBe(FRONT_RINGE.dauerTakte[j] * TAKT_MS);
      expect(a.verzoegerung).toBe(FRONT_RINGE.verzoegerungTakte[j] * TAKT_MS);
      expect(a.kurve).toBe('linear');
      expect(a.stellen).toEqual(DIFFUSION_STUETZ.map(([t]) => t));
      a.werte.forEach((v, i) => expect(Number(v.scale)).toBeCloseTo(RING_START + DIFFUSION_STUETZ[i][1] * (1 - RING_START), 4));
    });
    const lage = await page.locator(FRONT).evaluate((el) => ({
      z: Number(el.style.getPropertyValue('--z')),
      m: Number(el.style.getPropertyValue('--m')),
      s: parseFloat(el.style.getPropertyValue('--s')),
      fenster: [innerWidth, innerHeight],
    }));
    for (const a of w) {
      expect(a.dauer).toBe(DAUER_MS['d-4']);
      expect(a.verzoegerung).toBe(WECHSEL.vorlaufMs);
      expect(a.kurve).toBe('cubic-bezier(0.65, 0, 0.35, 1)');
      expect(a.stellen).toEqual([0, 1]);
      expect(Number(a.werte[0].scale)).toBeCloseTo(lage.z, 4);
      expect(Number(a.werte[1].scale)).toBeCloseTo(lage.m, 4);
    }
    expect(f.map((a) => a.dauer)).toEqual([240, 240, 120, 120, 120, 240]);
    expect(f.map((a) => a.verzoegerung)).toEqual(MOTION_REGISTER.seitenwechsel.verzoegerungTakte.map((n) => n * TAKT_MS));
    expect(f.map((a) => a.kurve)).toEqual(Array(6).fill('linear'));
    expect(f.map((a) => Number(a.werte[0].opacity))).toEqual(Array(6).fill(0));
    expect(f.map((a) => Math.round(Number(a.werte[1].opacity) * 1000) / 1000)).toEqual([0.25, 0.333, ...FRONT_RINGE.deckkraft, 1]);
    // Kein winziger Punkt: Schleier und Seitenfarbe beginnen bei 12–18 % der Fensterdiagonale (die Seitenfarbe bei
    // FRONT_START), die Ringe bei mindestens der Hälfte davon
    const diagonale = Math.hypot(lage.fenster[0], lage.fenster[1]);
    expect((lage.s * lage.z) / diagonale).toBeCloseTo(FRONT_START, 3);
    for (const i of MIT_W) {
      expect((lage.s * lage.z * FRONT_SCHICHTEN[i]) / diagonale).toBeGreaterThanOrEqual(0.12);
      expect((lage.s * lage.z * FRONT_SCHICHTEN[i]) / diagonale).toBeLessThanOrEqual(0.18);
    }
    for (const i of RINGE) expect((lage.s * lage.m * RING_START * FRONT_SCHICHTEN[i]) / diagonale).toBeGreaterThanOrEqual(FRONT_START / 2);

    await expect(page).toHaveURL(ziel!);
    await frontZu(page);
    const log = await protokoll(page);
    const klick = log.find((e) => e.art === 'klick')!;
    const auf = log.find((e) => e.art === 'toggle' && e.motion === 'seitenwechsel' && e.zustand === 'open')!;
    const zu = log.find((e) => e.art === 'toggle' && e.motion === 'seitenwechsel' && e.zustand === 'closed')!;
    const push = log.find((e) => e.art === 'push')!;
    // Start beim Klick, Wechsel erst, wenn die Seitenfarbe deckt, Aufdecken nach dem Wechsel, spätestens nach halten
    expect(auf.t - klick.t).toBeLessThan(50);
    expect(push.t - klick.t).toBeGreaterThanOrEqual(ZEITPLAN.wechsel);
    expect(zu.t).toBeGreaterThan(push.t);
    expect(zu.t - klick.t).toBeLessThanOrEqual(ZEITPLAN.wechselNetz + WECHSEL.haltenMs + ZEITPLAN.aufdeckenNetz + 500);
    expect(await page.locator(FRONT).getAttribute('data-auf')).toBeNull();
    // Der Hauptinhalt hat seine Ebene und seinen Versatz wieder abgegeben
    expect(await page.locator('main').evaluate((el) => [getComputedStyle(el).translate, getComputedStyle(el).willChange])).toEqual(['none', 'auto']);
    // Die neue Seite steht oben, schon wenn die Front aufdeckt (kein weiches Scrollen beim Wechsel)
    expect(await page.evaluate(() => (window as unknown as { __beimAufdecken?: number }).__beimAufdecken)).toBe(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('Wärmefront ist immer ein Kreis (Prüfrunde 2 A2-1, C2-2): Klick nahe der Ecke, jede Schicht gezeichnet höchstens 2 × --radius-voll breit, voll gerundet, am Ende bis über die fernste Ecke', async ({
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
    const { schichten, faktor } = await page.locator(FRONT).evaluate((el) => ({
      faktor: Number((el as HTMLElement).style.getPropertyValue('--m')),
      schichten: [...el.children].map((i) => {
        const cs = getComputedStyle(i);
        const transform = cs.transform === 'none' ? 1 : new DOMMatrix(cs.transform).a;
        return { breite: parseFloat(cs.width), hoehe: parseFloat(cs.height), radius: parseFloat(cs.borderTopLeftRadius), transform };
      }),
    }));
    const radiusVoll = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius-voll')));
    const fenster = page.viewportSize()!;
    const ecke = Math.max(Math.hypot(x, y), Math.hypot(fenster.width - x, y), Math.hypot(x, fenster.height - y), Math.hypot(fenster.width - x, fenster.height - y));
    expect(schichten).toHaveLength(6);
    expect(faktor).toBeGreaterThanOrEqual(1);
    for (const s of schichten) {
      // Gezeichnet ein Kreis: der Radius ist mindestens die halbe Breite (sonst blieben gerade Flanken)
      expect(s.hoehe).toBeCloseTo(s.breite, 1);
      expect(s.breite).toBeLessThanOrEqual(2 * radiusVoll);
      expect(s.radius).toBeGreaterThanOrEqual(s.breite / 2);
    }
    // Schleier und Seitenfarbe: Endgröße (Grundwert scale --m) über die fernste Ecke, der Schleier noch weiter (Saum
    // außen), die Seitenfarbe innen; ohne festes transform
    for (const i of MIT_W) {
      expect(schichten[i].transform).toBe(1);
      expect((schichten[i].breite * faktor) / 2).toBeGreaterThanOrEqual(ecke);
    }
    expect(schichten[0].breite).toBeGreaterThan(schichten[1].breite);
    expect(schichten[1].breite).toBeGreaterThan(schichten[5].breite);
    // Ringe: der Faktor --m als festes transform, Endgröße (scale 1) im Fenster, nach innen enger; außen bleibt der Schleier
    for (const [j, i] of RINGE.entries()) {
      expect(schichten[i].transform).toBeCloseTo(faktor, 4);
      expect((schichten[i].breite * faktor) / 2).toBeLessThan(ecke);
      expect((schichten[i].breite * faktor) / 2).toBeGreaterThan(0.5 * ecke);
      if (j > 0) expect(schichten[i].breite).toBeLessThan(schichten[RINGE[j - 1]].breite);
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

  test('Klick-Wärme (Owner-Feedback 16.10.2026, Prüfrunde 5 A5-4, C5-3): drei Ringe um die Box des Knopfs (24 · 16 · 8 px), ½ Takt versetzt eingeblendet, gemeinsam verklungen; zu am Ende dieses Übergangs, fast unsichtbar', async ({
    page,
  }) => {
    await protokollieren(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const knopf = page.getByRole('button', { name: 'Anhalten' }).first();
    await knopf.scrollIntoViewIfNeeded();
    const box = (await knopf.boundingBox())!;
    // Deckkraft der Überlagerung je Bild bis zum Schließen; Zeit des Übergangsendes (Erfassung vor der Insel)
    await page.locator(KLICK).evaluate((el) => {
      const w = window as unknown as { __klick: { deckkraft: number[]; ende?: number; zu?: number } };
      w.__klick = { deckkraft: [] };
      const probe = () => {
        if (!el.matches(':popover-open')) return;
        w.__klick.deckkraft.push(Number(getComputedStyle(el).opacity));
        requestAnimationFrame(probe);
      };
      el.addEventListener('toggle', (e) => (e as ToggleEvent).newState === 'open' && requestAnimationFrame(probe));
      document.addEventListener('transitionend', (e) => e.target === el && (w.__klick.ende ??= performance.now()), true);
      el.addEventListener('beforetoggle', (e) => (e as ToggleEvent).newState === 'closed' && (w.__klick.zu ??= performance.now()));
    });
    await ablaeufeMerken(page, KLICK);
    await knopf.click();
    const ab = (await gemerkteAblaeufe(page)).sort((x, y) => x.schicht - y.schicht);
    // Nur Einblenden (f), kein Wachsen: je d-2, linear, ½ Takt versetzt, der äußere zuerst; nach außen zarter
    expect(ab.map((a) => a.name)).toEqual(['f', 'f', 'f']);
    expect(ab.map((a) => a.dauer)).toEqual([240, 240, 240]);
    expect(ab.map((a) => a.verzoegerung)).toEqual(MOTION_REGISTER['klick-waerme'].verzoegerungTakte.map((n) => n * TAKT_MS));
    expect(ab.map((a) => a.kurve)).toEqual(['linear', 'linear', 'linear']);
    expect(ab.map((a) => Number(a.werte[0].opacity))).toEqual([0, 0, 0]);
    expect(ab.map((a) => Math.round(Number(a.werte[1].opacity) * 1000) / 1000)).toEqual([0.25, 0.333, 0.5]);
    // Die Ringe umgeben die Box des Knopfs: gleich groß und gleich gelegen, der Umriss liegt außerhalb (außen 24, dann
    // 16, innen 8 px)
    const ringe = await page.locator(KLICK).evaluate((el) =>
      [...el.children].map((r) => {
        const b = r.getBoundingClientRect();
        const cs = getComputedStyle(r);
        return { x: b.x, y: b.y, w: b.width, h: b.height, abstand: parseFloat(cs.outlineOffset), dicke: parseFloat(cs.outlineWidth), flaeche: cs.backgroundColor, scale: cs.scale };
      }),
    );
    for (const [i, r] of ringe.entries()) {
      expect(Math.abs(r.x - box.x), `Ring ${i + 1}`).toBeLessThanOrEqual(1);
      expect(Math.abs(r.y - box.y), `Ring ${i + 1}`).toBeLessThanOrEqual(1);
      expect(Math.abs(r.w - box.width), `Ring ${i + 1}`).toBeLessThanOrEqual(1);
      expect(Math.abs(r.h - box.height), `Ring ${i + 1}`).toBeLessThanOrEqual(1);
      expect(r.abstand).toBe(8 * (3 - i));
      expect(r.dicke).toBe(2);
      expect(r.flaeche).toBe('rgba(0, 0, 0, 0)');
      expect(r.scale).toBe('none');
    }
    await expect.poll(() => offen(page, KLICK), { timeout: 2000 }).toBe(false);
    const log = (await protokoll(page)).filter((e) => e.motion === 'klick-waerme');
    expect(log.map((e) => e.zustand)).toEqual(['open', 'closed']);
    // Ende nach den eigenen Abläufen (C5-3): Einblenden des äußeren (d-2), ein Takt, Verklingen (d-3); geschlossen in
    // demselben Moment wie das Ende des Übergangs, nicht von der Uhr
    expect(log[1].t - log[0].t).toBeGreaterThanOrEqual(KLICK_ENDE_MS - 20);
    expect(log[1].t - log[0].t).toBeLessThan(ZEITPLAN.klickNetz);
    const k = await page.evaluate(() => (window as unknown as { __klick: { deckkraft: number[]; ende?: number; zu?: number } }).__klick);
    expect(k.ende, 'Ende des Verklingens').toBeDefined();
    expect(k.zu! - k.ende!).toBeLessThan(20);
    // Beim Schließen ist sie verklungen: Das letzte gemalte Bild zeigt höchstens 2 % (C5-3: kein Sprung am Ende)
    expect(k.deckkraft.length).toBeGreaterThan(10);
    expect(k.deckkraft.at(-1)).toBeLessThanOrEqual(0.02);
    // Nichts Plötzliches: von Bild zu Bild nie mehr als ein Viertel Deckkraft weniger
    for (let i = 1; i < k.deckkraft.length; i += 1) expect(k.deckkraft[i - 1] - k.deckkraft[i]).toBeLessThanOrEqual(0.25);
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
      const lage = await page.locator(KLICK).evaluate((el) => ({ ton: (el as HTMLElement).dataset.tone ?? null, ringe: [...el.children].map((r) => getComputedStyle(r).outlineColor) }));
      expect(lage.ton, z.ort).toBe(z.ton);
      expect(new Set(lage.ringe).size, `${z.ort}: drei verschiedene Ringe`).toBe(3);
      const kontraste = lage.ringe.map(hex).map((ring) => kontrast(ring, flaeche));
      for (const [i, k] of kontraste.entries()) {
        expect(k, `${z.ort} ${lage.ringe[i]} auf ${flaeche}`).toBeGreaterThanOrEqual(1.5);
        expect(k, `${z.ort} ${lage.ringe[i]} auf ${flaeche}`).toBeLessThanOrEqual(3);
      }
      // Innen der heißeste: Der innere Ring (der letzte) hebt sich am stärksten ab, nach außen schwächer
      expect(kontraste[2], z.ort).toBeGreaterThan(kontraste[1]);
      expect(kontraste[1], z.ort).toBeGreaterThan(kontraste[0]);
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

  test('Aufdecken (Owner-Feedback 16.10.2026): Die Front ist eine Fläche in der Seitenfarbe und verblasst als Ganzes, gleichmäßig, ohne Loch; der Hauptinhalt taucht auf und steigt um 24 px an seinen Platz; kein Sprung', async ({
    page,
  }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.locator(STELLE_LINK).first();
    await link.scrollIntoViewIfNeeded();
    // Beim Start des Aufdeckens anhalten: Übergang der Front und Ablauf des Hauptinhalts pausieren; die Front bleibt
    // offen, bis gemessen ist
    await page.locator(FRONT).evaluate((el) => {
      const fr = el as HTMLElement;
      const w = window as unknown as { __auf: Promise<{ front: string[]; haupt: string[]; schichten: string[] }>; __halt: boolean; __seitenfarbe: boolean };
      w.__halt = true;
      w.__auf = new Promise((fertig) => {
        new MutationObserver((_, beob) => {
          if (!fr.hasAttribute('data-auf')) return;
          beob.disconnect();
          // Die oberste Schicht trägt die Seitenfarbe: für die Auswertung eine Markierfarbe (sonst von der Seite nicht zu
          // unterscheiden)
          const probe = document.body.appendChild(document.createElement('i'));
          probe.style.background = 'var(--surface)';
          w.__seitenfarbe = getComputedStyle(fr.lastElementChild!).backgroundColor === getComputedStyle(probe).backgroundColor;
          probe.remove();
          fr.style.setProperty('--surface', 'rgb(255, 0, 255)');
          fr.hidePopover = () => {};
          new MutationObserver(() => {
            if (w.__halt && !fr.hasAttribute('data-auf')) fr.setAttribute('data-auf', '');
          }).observe(fr, { attributes: true, attributeFilter: ['data-auf'] });
          // Das Netz der Insel schlösse die Front während der Messung und nähme <main> seine Klassen: zurück damit
          const haupt = document.querySelector('main')!;
          const klassen = haupt.className;
          new MutationObserver(() => {
            if (w.__halt && haupt.className !== klassen) haupt.className = klassen;
          }).observe(haupt, { attributes: true, attributeFilter: ['class'] });
          void getComputedStyle(fr).opacity;
          void getComputedStyle(haupt).opacity;
          const vorne = fr.getAnimations();
          const hinten = haupt.getAnimations();
          for (const a of [...vorne, ...hinten]) a.pause();
          fertig({
            front: vorne.map((a) => (a instanceof CSSTransition ? `Übergang ${a.transitionProperty}` : `Ablauf ${(a as CSSAnimation).animationName}`)),
            haupt: hinten.map((a) => (a instanceof CSSTransition ? `Übergang ${a.transitionProperty}` : `Ablauf ${(a as CSSAnimation).animationName.replace(/^.*__/, '')}`)),
            schichten: fr.getAnimations({ subtree: true }).filter((a) => (a.effect as KeyframeEffect).target !== fr && a.playState === 'running').map((a) => String((a as CSSAnimation).animationName)),
          });
        }).observe(fr, { attributes: true, attributeFilter: ['data-auf'] });
      });
    });
    await link.click();
    const lauf = await page.evaluate(() => (window as unknown as { __auf: Promise<{ front: string[]; haupt: string[]; schichten: string[] }> }).__auf);
    // Genau ein Übergang an der Überlagerung (Deckkraft, nicht an den Schichten) und ein Ablauf am Hauptinhalt; die
    // Schichten stehen still (ihre Abläufe sind zu Ende)
    expect(lauf.front).toEqual(['Übergang opacity']);
    expect(lauf.haupt).toEqual(['Ablauf f']);
    expect(lauf.schichten).toEqual([]);
    expect(await page.evaluate(() => (window as unknown as { __seitenfarbe: boolean }).__seitenfarbe)).toBe(true);

    const auswertung = await page.context().newPage();
    const kopf = await page.locator('header').first().evaluate((el) => Math.floor(el.getBoundingClientRect().bottom));
    /** Anteil der Markierfarbe (Magenta hat kein Grün) im Bild; im Kopf (er bewegt sich nicht) je Pixel die Deckung. */
    const messen = async (bild: string, unten: string) =>
      auswertung.evaluate(
        async ({ bild, unten, kopf }) => {
          const lese = async (b64: string) => {
            const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
            const b = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
            const c = new OffscreenCanvas(b.width, b.height);
            const ctx = c.getContext('2d')!;
            ctx.drawImage(b, 0, 0);
            return ctx.getImageData(0, 0, b.width, b.height);
          };
          const a = await lese(bild);
          const u = await lese(unten);
          const { width, height } = a;
          // Deckung: Anteil der Pixel, die (fast) die Markierfarbe tragen – ein Loch im Bild der Front zeigte die Seite
          let magenta = 0;
          for (let i = 0; i < width * height; i += 1) {
            const [r, g, b] = [a.data[i * 4], a.data[i * 4 + 1], a.data[i * 4 + 2]];
            if (r > 200 && g < 40 && b > 200) magenta += 1;
          }
          // Gleichmäßiges Verblassen: im Kopf je Pixel mit hellem Grund α = 1 − G / G_unten, und zwar Zeile für Zeile
          const alpha: number[] = [];
          const zeilen: number[] = [];
          for (let y = 0; y < Math.min(kopf, height); y += 1) {
            const zeile: number[] = [];
            for (let x = 0; x < width; x += 2) {
              const i = (y * width + x) * 4;
              if (u.data[i + 1] > 150) zeile.push(1 - a.data[i + 1] / u.data[i + 1]);
            }
            if (zeile.length < 20) continue;
            zeile.sort((p, q) => p - q);
            zeilen.push(zeile[Math.floor(zeile.length / 2)]);
            alpha.push(...zeile);
          }
          alpha.sort((p, q) => p - q);
          zeilen.sort((p, q) => p - q);
          return {
            magenta: magenta / (width * height),
            alpha: { p10: alpha[Math.floor(alpha.length * 0.1)], p50: alpha[Math.floor(alpha.length / 2)], p90: alpha[Math.floor(alpha.length * 0.9)] },
            zeilenSpanne: zeilen.at(-1)! - zeilen[0],
          };
        },
        { bild, unten, kopf },
      );
    const stellen = async (t: number) => {
      await page.evaluate((t) => {
        const fr = document.querySelector('[data-motion="seitenwechsel"]')!;
        for (const a of [...fr.getAnimations(), ...document.querySelector('main')!.getAnimations()]) {
          a.pause();
          a.currentTime = t;
        }
      }, t);
      await page.evaluate(() => new Promise((fertig) => requestAnimationFrame(() => requestAnimationFrame(fertig))));
      return {
        bild: (await page.screenshot({ scale: 'css' })).toString('base64'),
        stand: await page.evaluate(() => {
          const haupt = getComputedStyle(document.querySelector('main')!);
          return {
            deckkraft: Number(getComputedStyle(document.querySelector('[data-motion="seitenwechsel"]')!).opacity),
            sichtbar: Number(haupt.opacity),
            versatz: haupt.translate === 'none' ? 0 : parseFloat(haupt.translate.split(' ')[1] ?? '0'),
          };
        }),
      };
    };
    // Ende (eine halbe Millisekunde davor, sonst endet der Übergang und die Insel schlösse): die Seite ohne Front,
    // <main> an seinem Platz – der Bezug für den Grünkanal im Kopf
    const ende = await stellen(WECHSEL.aufdeckenMs - 0.5);
    expect(ende.stand.deckkraft).toBeLessThan(0.001);
    expect(ende.stand.sichtbar).toBeGreaterThan(0.999);
    expect(ende.stand.versatz).toBeLessThan(0.01);
    // Beginn und der erste Takt: Das Fenster ist ganz in der Seitenfarbe gedeckt – kein Loch, kein warmer Saum
    for (const t of [0, TAKT_MS]) {
      const p = await stellen(t);
      expect(p.stand, `${t} ms`).toEqual({ deckkraft: 1, sichtbar: 0, versatz: 24 });
      expect((await messen(p.bild, ende.bild)).magenta, `${t} ms`).toBeGreaterThan(0.999);
    }
    let vorher = { deckkraft: 1, sichtbar: 0, versatz: 24 };
    for (const t of [120, 160, 200, 280, 360, 420]) {
      const p = await stellen(t);
      const soll = WECHSEL_KURVE(Math.max(0, t - TAKT_MS) / DAUER_MS['d-3']);
      expect(p.stand.deckkraft, `${t} ms`).toBeCloseTo(1 - soll, 2);
      expect(p.stand.sichtbar, `${t} ms`).toBeCloseTo(soll, 2);
      expect(p.stand.versatz, `${t} ms`).toBeCloseTo(24 * (1 - soll), 1);
      expect(p.stand.deckkraft).toBeLessThanOrEqual(vorher.deckkraft);
      expect(p.stand.sichtbar).toBeGreaterThanOrEqual(vorher.sichtbar);
      expect(p.stand.versatz).toBeLessThanOrEqual(vorher.versatz);
      vorher = p.stand;
      const m = await messen(p.bild, ende.bild);
      // Solange die Front noch fast deckt, kein Loch in ihr
      if (p.stand.deckkraft > 0.9) expect(m.magenta, `${t} ms`).toBeGreaterThan(0.999);
      // Als Ganzes: Überall im Kopf dieselbe Deckung der Seitenfarbe – je Pixel (Spanne der mittleren 80 % höchstens
      // 0,06) und von Zeile zu Zeile (keine Kante, kein Streifen: höchstens 0,04)
      expect(m.alpha.p50, `${t} ms`).toBeCloseTo(p.stand.deckkraft, 1);
      expect(m.alpha.p90 - m.alpha.p10, `${t} ms`).toBeLessThanOrEqual(0.06);
      expect(m.zeilenSpanne, `${t} ms`).toBeLessThanOrEqual(0.04);
    }
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

  test('Abdecken (Owner-Feedback 16.10.2026 (2); Prüfrunde 5 A5-1, B5-1, C5-1, C5-2): in fünf Läufen keine gerade Kante bis zum Aufdecken, kein Loch und kein kalter Kern; bis zur Deckung in jedem Bild mindestens zwei Töne, nie eine satte Fläche (Ton ≥ --waerme-2) über 60 % des Fensters, sichtbare Ringe; aufgedeckt höchstens `ruhe` nach dem neuen Pfad', async ({
    page,
    context,
  }) => {
    test.skip(test.info().project.name !== 'desktop-light', 'Gemessen am Desktop: Dort sind die Schichten am größten (bis rund 3.800 px).');
    test.setTimeout(150_000);
    const ZIEL = '/arbeiten-bei-uns/buero-und-verwaltung';
    const auswertung = await context.newPage();
    const luecken: number[] = [];
    for (let lauf = 1; lauf <= 5; lauf += 1) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const link = page.locator(`main a[href="${ZIEL}"]`).first();
      await link.scrollIntoViewIfNeeded();
      // Abläufe der Seite in Sichtweite zu Ende kommen lassen (verglichen wird mit dem Bild vor dem Klick)
      await page.waitForTimeout(1500);
      // Phasen in Zeit der Seite: Klick, Start der Abläufe, Deckung (Ende der letzten Schicht), Wechsel (pushState),
      // Aufdecken (data-auf), zu
      await page.locator(FRONT).evaluate((el) => {
        const p: Record<string, number> = {};
        (window as unknown as { __p: Record<string, number> }).__p = p;
        document.addEventListener('click', () => (p.klick = performance.now()), { capture: true, once: true });
        el.addEventListener('animationstart', (e) => {
          if (e.target === el.firstElementChild) p.start ??= performance.now();
        });
        el.addEventListener('animationend', (e) => {
          if (e.target === el.lastElementChild) p.voll ??= performance.now();
        });
        const push = history.pushState.bind(history);
        history.pushState = (...a: Parameters<History['pushState']>) => {
          p.push ??= performance.now();
          push(...a);
        };
        new MutationObserver(() => {
          if (el.hasAttribute('data-auf')) p.auf ??= performance.now();
        }).observe(el, { attributes: true, attributeFilter: ['data-auf'] });
        el.addEventListener('beforetoggle', (e) => {
          if ((e as ToggleEvent).newState === 'closed') p.zu ??= performance.now();
        });
      });
      const farben = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        return { papier: cs.getPropertyValue('--surface').trim(), waerme2: cs.getPropertyValue('--waerme-2').trim() };
      });
      const cdp = await context.newCDPSession(page);
      const bilder: { t: number; data: string }[] = [];
      cdp.on('Page.screencastFrame', (f) => {
        bilder.push({ t: (f.metadata.timestamp ?? 0) * 1000, data: f.data });
        void cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
      });
      const box = (await link.boundingBox())!;
      const klick = { x: Math.round(box.x + Math.min(box.width / 2, 60)), y: Math.round(box.y + box.height / 2) };
      // Erst über den Link (sein Hover-Zustand steht dann schon im Bild vor dem Klick), dann aufnehmen und klicken
      await page.mouse.move(klick.x, klick.y);
      await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
      await page.waitForTimeout(300);
      await page.mouse.click(klick.x, klick.y);
      await expect(page).toHaveURL(ZIEL);
      await frontZu(page);
      await cdp.send('Page.stopScreencast');
      await cdp.detach();
      const p = await page.evaluate(() => {
        const q = (window as unknown as { __p: Record<string, number> }).__p;
        return { klick: q.klick, start: q.start, voll: q.voll, push: q.push, auf: q.auf, zu: q.zu, ursprung: performance.timeOrigin };
      });
      const wo = `Lauf ${lauf}`;
      // Zeitplan: Deckung nach Vorlauf und Wachsen (Chromium beginnt die Abläufe, sobald die Ebenen gerastert sind, lokal
      // 40–100 ms nach dem Klick); gewechselt erst danach; aufgedeckt höchstens `ruhe` nach dem neuen Pfad (Prüfrunde 5
      // C5-2: kein Warten auf nachladende Bereiche); zu, sobald die Front verblasst ist
      expect(p.voll - p.klick, wo).toBeLessThanOrEqual(ZEITPLAN.abdecken + 160);
      expect(p.push, wo).toBeGreaterThanOrEqual(p.voll);
      expect(p.auf - p.voll, wo).toBeGreaterThanOrEqual(0);
      expect(p.auf - p.push, wo).toBeLessThanOrEqual(ZEITPLAN.ruhe + 34);
      luecken.push(p.auf - p.voll);
      expect(p.zu - p.auf, wo).toBeLessThanOrEqual(ZEITPLAN.aufdecken + TAKT_MS);
      const vorKlick = bilder.filter((b) => b.t <= p.ursprung + p.klick).at(-1);
      expect(vorKlick, `${wo}: Bild vor dem Klick`).toBeDefined();
      const bisAuf = bilder.filter((b) => b.t > p.ursprung + p.klick && b.t <= p.ursprung + p.auf);
      expect(bisAuf.length, wo).toBeGreaterThan(12);
      // Die Seitenfarbe blendet nach 5½ Takten ab dem Start der Abläufe ein; bis dahin muss es am Klickpunkt warm sein
      const seitenfarbeAb = p.ursprung + p.start + MOTION_REGISTER.seitenwechsel.verzoegerungTakte.at(-1)! * TAKT_MS - 17;
      let gepruefteKerne = 0;
      // Bilder bis zur Deckung, in denen mindestens drei Töne stehen: Schleier und Ringe (Owner-Feedback 16.10.2026 (2))
      let ringBilder = 0;
      for (const bild of bisAuf) {
        const kernPruefen = bild.t < seitenfarbeAb;
        const befund = await auswertung.evaluate(
          async ({ bild, grund, farben, klick, linkBox }) => {
            const lese = async (b64: string) => {
              const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
              const b = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
              const c = new OffscreenCanvas(b.width, b.height);
              const ctx = c.getContext('2d')!;
              ctx.drawImage(b, 0, 0);
              return ctx.getImageData(0, 0, b.width, b.height);
            };
            const f = await lese(bild);
            const g = await lese(grund);
            const { width, height } = f;
            const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
            const papier = hex(farben.papier);
            const w2 = hex(farben.waerme2);
            const satt = (r: number, gg: number, b: number) => (Math.max(r, gg, b) - Math.min(r, gg, b)) / Math.max(r, gg, b, 1);
            // Ein Ton mindestens so satt wie --waerme-2 gilt als satt (Owner-Feedback 16.10.2026 (2))
            const grenzeSatt = satt(w2[0], w2[1], w2[2]);
            const d = (b: ImageData, i: number, j: number) => Math.abs(b.data[i] - b.data[j]) + Math.abs(b.data[i + 1] - b.data[j + 1]) + Math.abs(b.data[i + 2] - b.data[j + 2]);
            const d2 = (a: ImageData, b: ImageData, i: number) => Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
            const istPapier = (i: number) => Math.abs(g.data[i] - papier[0]) + Math.abs(g.data[i + 1] - papier[1]) + Math.abs(g.data[i + 2] - papier[2]) <= 6;
            const rein = (i: number) => Math.abs(g.data[i] - papier[0]) + Math.abs(g.data[i + 1] - papier[1]) + Math.abs(g.data[i + 2] - papier[2]) <= 1;
            // Kante der Front: Zwei Nachbarpixel waren vor dem Klick gleich und sind es jetzt nicht mehr (die Seite steht
            // still, bis gewechselt wird); gerade, wenn eine solche Kante über 120 px in einer Zeile oder Spalte läuft und
            // nicht die Tangente eines Kreises ist (fehlende Kacheln)
            const MIN = 120;
            // Der geklickte Link selbst darf sich ändern (aktiver Zustand); das ist die Seite, nicht die Front
            const imLink = (i: number) => {
              const x = (i / 4) % width;
              const y = Math.floor(i / 4 / width);
              return x >= linkBox.x - 4 && x <= linkBox.x + linkBox.width + 4 && y >= linkBox.y - 4 && y <= linkBox.y + linkBox.height + 4;
            };
            const kante = (a: number, b: number) => d(g, a, b) === 0 && d(f, a, b) > 6 && !imLink(a);
            const gerade: string[] = [];
            for (let y = 0; y + 1 < height; y += 1) {
              let lauf = 0;
              for (let x = 0; x <= width; x += 1) {
                if (x < width && kante((y * width + x) * 4, ((y + 1) * width + x) * 4)) lauf += 1;
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
                if (y < height && kante((y * width + x) * 4, (y * width + x + 1) * 4)) lauf += 1;
                else {
                  const mitte = y - lauf / 2;
                  const tangente = Math.abs(mitte - klick.y) <= 6 && lauf <= 2 * Math.sqrt(5 * Math.abs(x - klick.x)) + 12;
                  if (lauf >= MIN && !tangente) gerade.push(`Spalte ${x} ab ${y - lauf}, ${lauf} px`);
                  lauf = 0;
                }
              }
            }
            // Je Pixel auf Papiergrund: Wärme, Sättigung, Abstand zur Seitenfarbe und die Farbe für die Töne. Wärme ist der
            // Abstand zum Bild vor dem Klick (Summe über R, G, B): Jede Stufe der Rampe ist in jedem Kanal dunkler als das
            // Papier, also wächst er mit jeder Schicht und jeder wärmeren Stufe (--waerme-0 39 … -4 153) und kehrt sich nicht
            // durch Rundung um (Rot gegen Blau tat das bei zartester Deckung: In der Mitte sank auch Rot eine Stufe mehr)
            const waerme: number[] = [];
            const kern: number[] = [];
            const farbe = new Map<number, number>();
            let papierPixel = 0;
            let sattPixel = 0;
            let abstandSeitenfarbe = 0;
            for (let y = 0; y < height; y += 2) {
              for (let x = 0; x < width; x += 2) {
                const i = (y * width + x) * 4;
                if (!istPapier(i)) continue;
                papierPixel += 1;
                const w = d2(f, g, i);
                // Wärme der Front: auf reinem Papiergrund (vor dem Klick genau die Seitenfarbe ±1; fast papierfarbene
                // Kantenpixel von Schrift und Linien runden beim Mischen eine Stufe anders) und ohne den geklickten Link (sein
                // Druckzustand versetzt die Schrift um 1 px; das ist die Seite, nicht die Front, wie bei den Kanten)
                if (!imLink(i) && rein(i)) {
                  waerme.push(w);
                  if (Math.hypot(x - klick.x, y - klick.y) <= 24) kern.push(w);
                }
                if (satt(f.data[i], f.data[i + 1], f.data[i + 2]) >= grenzeSatt) sattPixel += 1;
                abstandSeitenfarbe = Math.max(abstandSeitenfarbe, d2(f, g, i));
                const k = (f.data[i] << 16) | (f.data[i + 1] << 8) | f.data[i + 2];
                farbe.set(k, (farbe.get(k) ?? 0) + 1);
              }
            }
            // Töne: von der häufigsten Farbe an je alle Farben bis 4 Stufen Abstand (Summe über R, G, B) zusammenfassen;
            // ein Ton zählt mit mindestens 2 % des Papiergrunds
            const reihe = [...farbe.entries()].sort((a, b) => b[1] - a[1]);
            const frei = new Set(reihe.map(([k]) => k));
            const kanal = (k: number) => [k >> 16, (k >> 8) & 255, k & 255];
            let toene = 0;
            for (const [k] of reihe) {
              if (!frei.has(k)) continue;
              const [r0, g0, b0] = kanal(k);
              let anteil = 0;
              for (const [k2, n] of reihe) {
                if (!frei.has(k2)) continue;
                const [r1, g1, b1] = kanal(k2);
                if (Math.abs(r1 - r0) + Math.abs(g1 - g0) + Math.abs(b1 - b0) > 4) continue;
                anteil += n;
                frei.delete(k2);
              }
              if (anteil >= 0.02 * papierPixel) toene += 1;
            }
            waerme.sort((a, b) => a - b);
            kern.sort((a, b) => a - b);
            return {
              gerade: gerade.slice(0, 3),
              satt: sattPixel / Math.max(papierPixel, 1),
              toene,
              seitenfarbig: abstandSeitenfarbe <= 12,
              abstand: abstandSeitenfarbe,
              hoechste: waerme[Math.floor(waerme.length * 0.99)] ?? 0,
              amKlick: kern[Math.floor(kern.length / 2)] ?? 0,
              kernPixel: kern.length,
            };
          },
          { bild: bild.data, grund: vorKlick!.data, farben, klick, linkBox: box },
        );
        const ms = Math.round(bild.t - p.ursprung - p.klick);
        expect(befund.gerade, `${wo}, Bild ab ${ms} ms`).toEqual([]);
        // Nie eine satte Einzelfläche (Owner-Feedback 16.10.2026 (2), statt „nie satter als --waerme-1“): höchstens 60 %
        // des Papiergrunds in einem Ton, der mindestens so satt ist wie --waerme-2
        expect(befund.satt, `${wo}, Bild ab ${ms} ms: satt ${befund.satt.toFixed(3)}`).toBeLessThanOrEqual(0.6);
        // Bis zur Deckung (mit zwei Bildern Spielraum: Der Zeitstempel eines Bildes und die Uhr der Seite laufen bis zu
        // einem Bild auseinander) in jedem Bild mindestens zwei Töne: nie eine einfarbige Fläche, die steht. Ausgenommen nur
        // ein Bild, das überall die Seitenfarbe zeigt (vor dem ersten Einblenden und in den letzten Bildern der Deckung)
        if (bild.t <= p.ursprung + p.voll + 34) {
          if (!befund.seitenfarbig) expect(befund.toene, `${wo}, Bild ab ${ms} ms: Abstand zur Seitenfarbe ${befund.abstand}`).toBeGreaterThanOrEqual(2);
          if (befund.toene >= 3) ringBilder += 1;
        } else {
          // Gedeckt: nur noch die Seitenfarbe, keine warme Fläche, die stehen bleibt
          expect(befund.seitenfarbig, `${wo}, Bild ab ${ms} ms: Abstand zur Seitenfarbe ${befund.abstand}`).toBe(true);
        }
        if (kernPruefen) {
          // Kein Loch, kein kalter Kern (A5-1, B5-1, C5-1): Bis die Seitenfarbe einblendet, ist es am Klickpunkt mindestens
          // so warm wie überall sonst, und ist irgendwo Wärme, dann auch dort
          gepruefteKerne += 1;
          expect(befund.kernPixel, `${wo}, Bild ab ${ms} ms`).toBeGreaterThan(20);
          expect(befund.amKlick, `${wo}, Bild ab ${ms} ms: am Klickpunkt ${befund.amKlick}, höchste ${befund.hoechste}`).toBeGreaterThanOrEqual(befund.hoechste - 2);
          if (befund.hoechste > 3) expect(befund.amKlick, `${wo}, Bild ab ${ms} ms`).toBeGreaterThan(3);
        }
      }
      expect(gepruefteKerne, `${wo}: Bilder vor dem Einblenden der Seitenfarbe`).toBeGreaterThan(8);
      // Die Ringe sind zu sehen: mehrere Bilder mit Schleier und mindestens zwei Ringen (drei Töne und mehr)
      expect(ringBilder, `${wo}: Bilder mit Ringen`).toBeGreaterThanOrEqual(6);
    }
    await auswertung.close();
    // Von voller Deckung bis zum Aufdecken im Mittel (Median der fünf Läufe) unter drei Takten: Einsetzen der neuen Seite
    // (gewechselt wird erst bei Deckung, Owner-Feedback 16.10.2026) und ihre Ruhe; Kopf, Leiste und Sicht-Bereiche
    // zählen dagegen
    expect(luecken.sort((a, b) => a - b)[2]).toBeLessThan(3 * TAKT_MS);
  });

  test('Stellenliste → Stellenseite (Prüfrunde 5 C5-2): Die Front wartet nicht auf die nachladende Bewerbung; die neue Seite ist nach Deckung, Ruhe und Aufdecken voll sichtbar', async ({
    page,
  }, testInfo) => {
    test.skip(!isDesktop(testInfo), 'Gemessen am Desktop (am Handy misst der Malzeit-Fall denselben Weg).');
    await protokollieren(page);
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const link = page.locator(STELLE_LINK).first();
    await link.scrollIntoViewIfNeeded();
    await page.locator(FRONT).evaluate((el) => {
      const w = window as unknown as { __auf?: number };
      new MutationObserver(() => el.hasAttribute('data-auf') && (w.__auf ??= performance.now())).observe(el, { attributes: true, attributeFilter: ['data-auf'] });
    });
    await link.click();
    await expect(page).not.toHaveURL('/jobs');
    await frontZu(page);
    const log = await protokoll(page);
    const klick = log.find((e) => e.art === 'klick')!;
    const push = log.find((e) => e.art === 'push')!;
    const zu = log.find((e) => e.art === 'toggle' && e.motion === 'seitenwechsel' && e.zustand === 'closed')!;
    const auf = await page.evaluate(() => (window as unknown as { __auf?: number }).__auf!);
    // Aufgedeckt höchstens `ruhe` nach dem neuen Pfad (vorher wartete die Front bis zu 0,3 s auf den Platzhalter)
    expect(auf - push.t).toBeLessThanOrEqual(ZEITPLAN.ruhe + 34);
    // Klick bis neue Seite voll sichtbar: Deckung (mit Rasterzeit), Einsetzen und Ruhe, Aufdecken mit Netz
    expect(zu.t - klick.t).toBeLessThanOrEqual(ZEITPLAN.abdecken + 160 + ZEITPLAN.ruhe + ZEITPLAN.aufdeckenNetz);
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
