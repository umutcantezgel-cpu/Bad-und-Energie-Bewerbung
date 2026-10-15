import type { Browser, Page } from '@playwright/test';

/**
 * Malzeit je Bild aus einem Performance-Trace (KERN K-009/K-013; Prüfung E-029 Befund 10, E-031 Prüfrunde 1 C1-4).
 *
 * Bilder beginnen mit `AnimationFrame` (ph „b“) auf dem Hauptthread der Seite (dem CrRendererMain mit den meisten
 * Ereignissen); jedes Paint-Ereignis zählt zu dem Bild, in dem es liegt. `BeginMainThreadFrame`, an dem die frühere
 * Fassung die Bilder trennte, kommt in den Traces der genutzten Chromium-Versionen nicht vor: Alles landete in einem
 * „Bild“, und die Prüfung „ab dem 3. Bild“ war immer leer. Darum gibt es jetzt eine Plausibilitätsprüfung (genug Bilder
 * im Fenster), und das Fenster ist an Marken der Seite gebunden (performance.mark, Kategorie blink.user_timing): von
 * dem Moment, in dem die Bewegung beginnt, bis zu ihrem Ende – nicht das Scrollen davor und nicht das Aufräumen danach.
 */

export interface TraceEreignis {
  name: string;
  cat?: string;
  ph: string;
  pid: number;
  tid: number;
  ts: number;
  dur?: number;
  args?: { name?: string };
}

/** Kategorien für startTracing: Zeitachse der Entwicklerwerkzeuge und die Marken der Seite. */
export const MALZEIT_KATEGORIEN = ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing'];

export interface Bild {
  /** Beginn des Bilds in µs (Uhr des Traces). */
  ts: number;
  /** Summe der Malzeit im Bild in ms (auf 0,01 gerundet). */
  ms: number;
}

export interface Malzeit {
  /** Ereignisse auf dem Hauptthread (> 0: der Trace hat ihn erfasst). */
  hauptthread: number;
  /** Bilder im Fenster in der Reihenfolge ihres Beginns, auch die ohne Malen. */
  bilder: Bild[];
  /** Malzeit aller Paint-Ereignisse im Fenster in ms, auch außerhalb eines erkannten Bilds. */
  gesamtMs: number;
}

function hauptthreadVon(ereignisse: readonly TraceEreignis[]): string | undefined {
  const namen = new Map<string, string>();
  for (const e of ereignisse) if (e.ph === 'M' && e.name === 'thread_name' && e.args?.name) namen.set(`${e.pid}:${e.tid}`, e.args.name);
  const zahl = new Map<string, number>();
  for (const e of ereignisse) {
    const k = `${e.pid}:${e.tid}`;
    if (namen.get(k) === 'CrRendererMain') zahl.set(k, (zahl.get(k) ?? 0) + 1);
  }
  return [...zahl.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

/** Zeitpunkt einer Marke der Seite (performance.mark) im Trace, sonst ein Fehler. */
export function marke(ereignisse: readonly TraceEreignis[], name: string): number {
  const treffer = ereignisse.filter((e) => e.name === name && (e.cat ?? '').includes('blink.user_timing')).map((e) => e.ts);
  if (treffer.length === 0) throw new Error(`malzeit: Marke „${name}“ fehlt im Trace`);
  return Math.min(...treffer);
}

/**
 * Bilder im Fenster [von, bis) (Marken der Seite; ohne Fenster: der ganze Trace) mit ihrer Malzeit. Ein Bild gehört zum
 * Fenster, wenn es darin beginnt; es zählen nur die Paints im Fenster.
 */
export function malzeitJeBild(ereignisse: readonly TraceEreignis[], fenster?: { von: string; bis: string }): Malzeit {
  const haupt = hauptthreadVon(ereignisse);
  const aufHaupt = ereignisse.filter((e) => `${e.pid}:${e.tid}` === haupt);
  const von = fenster ? marke(ereignisse, fenster.von) : -Infinity;
  const bis = fenster ? marke(ereignisse, fenster.bis) : Infinity;
  const imFenster = (ts: number) => ts >= von && ts < bis;
  // Paints zählen nur im Fenster: Ein Bild, das kurz vor dem Ende beginnt, trägt nicht das Malen nach der Endmarke
  const paints = aufHaupt.filter((e) => e.name === 'Paint' && e.ph === 'X' && imFenster(e.ts));
  const anfaenge = [...new Set(aufHaupt.filter((e) => e.name === 'AnimationFrame' && e.ph === 'b').map((e) => e.ts))].sort((a, b) => a - b);
  const summen = new Map<number, number>(anfaenge.map((t) => [t, 0]));
  for (const e of paints) {
    const bild = anfaenge.filter((t) => t <= e.ts).at(-1);
    if (bild === undefined) continue;
    summen.set(bild, (summen.get(bild) ?? 0) + (e.dur ?? 0) / 1000);
  }
  const bilder = [...summen.entries()]
    .filter(([ts]) => imFenster(ts))
    .sort((a, b) => a[0] - b[0])
    .map(([ts, ms]) => ({ ts, ms: Math.round(ms * 100) / 100 }));
  const gesamt = paints.reduce((summe, e) => summe + (e.dur ?? 0) / 1000, 0);
  return { hauptthread: aufHaupt.length, bilder, gesamtMs: Math.round(gesamt * 100) / 100 };
}

/**
 * Misst mit gedrosselter CPU (Moto-G-Profil, 4×): Trace an, `ablauf` (startet die Bewegung und wartet ihr Ende ab; die
 * Seite setzt die Marken), ein paar Bilder Nachlauf, Trace aus. Gibt die Ereignisse zurück.
 */
export async function messeMitDrossel(page: Page, browser: Browser, ablauf: () => Promise<void>): Promise<TraceEreignis[]> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await browser.startTracing(page, { categories: MALZEIT_KATEGORIEN });
  let ereignisse: TraceEreignis[] = [];
  try {
    await ablauf();
    await page.waitForTimeout(200);
  } finally {
    const puffer = await browser.stopTracing();
    ereignisse = (JSON.parse(puffer.toString('utf8')) as { traceEvents: TraceEreignis[] }).traceEvents;
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await cdp.detach();
  }
  return ereignisse;
}
