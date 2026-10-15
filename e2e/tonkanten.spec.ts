import { expect, test } from '@playwright/test';
import { LOCAL_SAMPLES, PUBLISHED_JOBS, THEMEN_PAGES, waitForSettled } from './support/site';

/**
 * Tonkanten der Erzählseiten (E-031, Prüfrunde 2 A2-2, A2-3): Jeder Wechsel des Tons (Papier, Wand, Band) zwischen zwei
 * Flächen schließt oben rund an (--radius-3 = 24 px), darunter zeigt ein Streifen die Fläche davor, und an der Kante
 * steht kein Leitungstrenner (Ecke oder Trenner, nie beides). Gleicher Ton nacheinander: eckig, der Trenner trennt.
 * Das gilt vom Seitenkopf an (er steht auf Papier) bis zum Navy-Fuß. Ab der ersten Fläche mit Ton steht in <main>
 * nichts ohne Ton mehr (kein umschließendes Element, an dem die Regel nicht griffe); Skripte, Vorlagen und leere
 * Sprungmarken zählen nicht.
 */

const SEITEN = [
  '/',
  '/jobs',
  ...PUBLISHED_JOBS.map((job) => `/jobs/${job.slug}`),
  ...LOCAL_SAMPLES,
  ...THEMEN_PAGES.map((thema) => thema.path),
];

interface Kante {
  von: string;
  zu: string;
  wechsel: boolean;
  radien: string[];
  trenner: string[];
  streifen: { inhalt: string; hoehe: string; farbe: string; flaeche: string };
  farben: [string, string];
}

for (const pfad of SEITEN) {
  test(`Tonkanten ${pfad}`, async ({ page }) => {
    await page.goto(pfad);
    await waitForSettled(page);
    const befund = await page.evaluate(() => {
      const main = document.querySelector('main#main')!;
      const zaehlt = (el: Element) => !['SCRIPT', 'TEMPLATE'].includes(el.tagName) && !(el.tagName === 'SPAN' && el.childElementCount === 0 && el.textContent === '');
      const kinder = [...main.children].filter(zaehlt);
      const erste = kinder.findIndex((el) => el.hasAttribute('data-ton'));
      const ohneTon = kinder.slice(erste).filter((el) => !el.hasAttribute('data-ton')).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
      const flaechen = kinder.slice(erste);
      const fuss = main.nextElementSibling as HTMLElement;
      const ton = (el: Element) => (el === fuss ? 'band' : el.getAttribute('data-ton')!);
      const name = (el: Element) => (el === fuss ? 'fuss' : `${el.tagName.toLowerCase()}[${el.getAttribute('data-ton')}]#${el.id}`);
      const kante = (oben: Element, unten: Element) => {
        const cs = getComputedStyle(unten);
        const nach = getComputedStyle(oben, '::after');
        return {
          von: name(oben),
          zu: name(unten),
          wechsel: ton(oben) !== ton(unten),
          radien: [cs.borderTopLeftRadius, cs.borderTopRightRadius],
          trenner: [...unten.children].filter((k) => k.matches('[data-zeichnung="leitungstrenner"]')).map((k) => getComputedStyle(k).visibility),
          streifen: { inhalt: nach.content, hoehe: nach.height, farbe: nach.backgroundColor, flaeche: getComputedStyle(oben).backgroundColor },
          farben: [getComputedStyle(oben).backgroundColor, cs.backgroundColor] as [string, string],
        };
      };
      const kanten = flaechen.slice(1).map((el, i) => kante(flaechen[i], el));
      kanten.push(kante(flaechen[flaechen.length - 1], fuss));
      return { fussTag: fuss.tagName, ohneTon, kanten };
    });

    expect(befund.fussTag).toBe('FOOTER');
    expect(befund.ohneTon, 'Element ohne Ton zwischen den Flächen').toEqual([]);
    expect(befund.kanten.length).toBeGreaterThan(1);
    for (const k of befund.kanten as Kante[]) {
      const wo = `${k.von} → ${k.zu}`;
      if (k.wechsel) {
        // Der Ton wechselt wirklich (andere Fläche), die untere schließt rund an, ohne Trenner, auf dem Streifen der oberen
        expect(k.farben[0], wo).not.toBe(k.farben[1]);
        expect(k.radien, wo).toEqual(['24px', '24px']);
        for (const sichtbar of k.trenner) expect(sichtbar, `${wo}: Trenner an der Tonkante`).toBe('hidden');
        expect(k.streifen.inhalt, `${wo}: Streifen`).not.toBe('none');
        expect(k.streifen.hoehe, `${wo}: Streifen`).toBe('24px');
        expect(k.streifen.farbe, `${wo}: Streifen in der Fläche davor`).toBe(k.streifen.flaeche);
      } else {
        expect(k.radien, wo).toEqual(['0px', '0px']);
        for (const sichtbar of k.trenner) expect(sichtbar, wo).toBe('visible');
      }
    }
  });
}
