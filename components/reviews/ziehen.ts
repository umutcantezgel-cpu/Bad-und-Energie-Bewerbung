/**
 * Rechenkern der Stimmen-Reihe (E-START-046, neu interpretiert): Rastpunkte, nächste Karte, Ziehen mit
 * Auslaufen. Reine Funktionen ohne DOM, damit sie testbar sind und der Client klein bleibt.
 *
 * Wesen des Altstands war die greifbare Bewegung (packen, werfen). Neu: kein Autoplay, keine Schleife;
 * mit der Maus ziehen (1:1), beim Loslassen läuft die Reihe in Wurfrichtung aus und rastet auf einer Karte
 * ein. Touch und Trackpad scrollen nativ; Pfeile und Tastatur springen um eine Karte.
 */

export interface ZugProbe {
  /** Zeitstempel in ms (performance.now / event.timeStamp). */
  t: number;
  /** scrollLeft der Reihe zu diesem Zeitpunkt. */
  x: number;
}

/** Bewegungen unter dieser Strecke (px) gelten als Klick, nicht als Ziehen. */
export const ZIEH_SCHWELLE_PX = 6;

/** Zeitfenster (ms) für die Wurfgeschwindigkeit: nur die letzten Proben zählen. */
export const WURF_FENSTER_MS = 100;

/** Ruht die Maus vor dem Loslassen länger als so viele ms, gilt das Loslassen als ruhig (kein Wurf). */
export const STILL_MS = 60;

/** Projektion des Auslaufens: so viele ms läuft die Wurfgeschwindigkeit weiter (wie --d-3 + --d-1). */
export const AUSLAUF_MS = 520;

/** Ein Wurf überspringt höchstens so viele Karten. */
export const WURF_MAX_KARTEN = 4;

/** Unter dieser Geschwindigkeit (px/ms) gilt das Loslassen als ruhig: die nächste Karte rastet ein. */
export const WURF_MIN_PX_MS = 0.2;

/**
 * Rastpunkte aus den linken Kanten der Karten (bereits um das Scroll-Padding bereinigt). Werte über dem
 * Maximum fallen auf das Maximum zusammen: Am Ende stehen mehrere Karten zugleich ganz im Bild.
 */
export function rastpunkte(kanten: readonly number[], max: number): number[] {
  const out: number[] = [];
  for (const kante of kanten) {
    const punkt = Math.round(Math.min(Math.max(kante, 0), Math.max(max, 0)));
    if (out.length === 0 || punkt > out[out.length - 1]) out.push(punkt);
  }
  return out.length > 0 ? out : [0];
}

/** Index des Rastpunkts, der `x` am nächsten liegt. */
export function naechsterIndex(punkte: readonly number[], x: number): number {
  let best = 0;
  for (let i = 1; i < punkte.length; i++) {
    if (Math.abs(punkte[i] - x) < Math.abs(punkte[best] - x)) best = i;
  }
  return best;
}

/**
 * Geschwindigkeit des Scrollens (px/ms, positiv = nach rechts weiter) aus den Proben im Wurffenster. Mit `jetzt`
 * (Zeitpunkt des Loslassens): lag die letzte Bewegung länger als STILL_MS zurück, ist die Geschwindigkeit 0.
 */
export function wurfGeschwindigkeit(proben: readonly ZugProbe[], fensterMs: number = WURF_FENSTER_MS, jetzt?: number): number {
  if (proben.length < 2) return 0;
  const letzte = proben[proben.length - 1];
  if (jetzt !== undefined && jetzt - letzte.t > STILL_MS) return 0;
  let erste = letzte;
  for (let i = proben.length - 2; i >= 0; i--) {
    if (letzte.t - proben[i].t > fensterMs) break;
    erste = proben[i];
  }
  const dt = letzte.t - erste.t;
  return dt > 0 ? (letzte.x - erste.x) / dt : 0;
}

/**
 * Ziel nach dem Loslassen: Die Wurfgeschwindigkeit läuft AUSLAUF_MS weiter, dann rastet die nächste Karte ein.
 * Ein deutlicher Wurf bewegt die Reihe mindestens um eine Karte in Wurfrichtung, höchstens um WURF_MAX_KARTEN.
 * Ohne Bewegung (reduzierte Bewegung) rastet einfach die nächste Karte ein.
 */
export function wurfZiel(punkte: readonly number[], x: number, geschwindigkeit: number, mitSchwung = true): number {
  const start = naechsterIndex(punkte, x);
  if (!mitSchwung || Math.abs(geschwindigkeit) < WURF_MIN_PX_MS) return start;
  const projiziert = naechsterIndex(punkte, x + geschwindigkeit * AUSLAUF_MS);
  const richtung = Math.sign(geschwindigkeit);
  // Mindestens eine Karte weiter in Wurfrichtung, gemessen an der Karte, die beim Loslassen links anliegt.
  const anliegend = richtung > 0 ? letzterIndexBis(punkte, x) : ersterIndexAb(punkte, x);
  const mindestens = anliegend + richtung;
  const ziel = richtung > 0 ? Math.max(projiziert, mindestens) : Math.min(projiziert, mindestens);
  const grenze = start + richtung * WURF_MAX_KARTEN;
  const begrenzt = richtung > 0 ? Math.min(ziel, grenze) : Math.max(ziel, grenze);
  return Math.min(Math.max(begrenzt, 0), punkte.length - 1);
}

/** Letzter Rastpunkt links von oder auf `x`. */
function letzterIndexBis(punkte: readonly number[], x: number): number {
  let i = 0;
  while (i + 1 < punkte.length && punkte[i + 1] <= x + 1) i++;
  return i;
}

/** Erster Rastpunkt rechts von oder auf `x`. */
function ersterIndexAb(punkte: readonly number[], x: number): number {
  let i = punkte.length - 1;
  while (i - 1 >= 0 && punkte[i - 1] >= x - 1) i--;
  return i;
}

/** „03“: zweistellige Position für die sichtbare Zählung (Maß in Martian Mono). */
export function zweistellig(n: number): string {
  return String(n).padStart(2, '0');
}

/** Sichtbare Zählung „01 / 13“ oder „01–03 / 13“, wenn mehrere Karten ganz im Bild stehen. */
export function zaehlung(erste: number, letzte: number, gesamt: number): string {
  const bereich = letzte > erste ? `${zweistellig(erste)}–${zweistellig(letzte)}` : zweistellig(erste);
  return `${bereich} / ${zweistellig(gesamt)}`;
}

/** Ansage für Screenreader: „Stimme 1 von 13“ bzw. „Stimmen 1 bis 3 von 13“. */
export function ansage(erste: number, letzte: number, gesamt: number): string {
  if (gesamt === 0) return '';
  return letzte > erste ? `Stimmen ${erste} bis ${letzte} von ${gesamt}` : `Stimme ${erste} von ${gesamt}`;
}
