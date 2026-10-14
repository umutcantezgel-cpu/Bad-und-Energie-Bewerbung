/**
 * Startbedingung der Dauerbewegung (KERN K-009, E-029): reine Logik ohne Fenster, geprüft in
 * lib/motion/__tests__/dauer.test.ts. Eine Schleife (Auslöser `dauer`: Rotor, Wasser, Kältemittel) läuft nur, wenn
 * alles zutrifft: Das Skript ist geladen, die Zeichnung ist im Sichtfeld, der Tab ist sichtbar, keine reduzierte
 * Bewegung ist gewünscht und niemand hat angehalten. Sonst steht ein vollständiges Standbild mit festen Fließpfeilen;
 * ohne Skript ist das der Normalzustand (`data-dauer="aus"` kommt vom Server).
 */

export interface DauerZustand {
  /** Das Skript ist geladen und die Steuerung hydriert. */
  skript: boolean;
  /** Die Zeichnung liegt (teilweise) im Sichtfeld. */
  sichtbar: boolean;
  /** Der Tab ist sichtbar (document.visibilityState). */
  tabSichtbar: boolean;
  /** prefers-reduced-motion: reduce. */
  reduziert: boolean;
  /** Mit „Anhalten“ angehalten (gilt für alle Schleifen der Seite). */
  angehalten: boolean;
}

/** Wert von `data-dauer` am Bereich der Steuerung. */
export type DauerWert = 'an' | 'aus';

/** Der Ruhezustand: so steht die Seite ohne Skript und bis zur Hydration. */
export const DAUER_RUHE: Readonly<DauerZustand> = Object.freeze({
  skript: false,
  sichtbar: false,
  tabSichtbar: false,
  reduziert: true,
  angehalten: false,
});

/** Läuft die Schleife? Nur wenn alle Bedingungen zutreffen. */
export function dauerLaeuft(z: DauerZustand): boolean {
  return z.skript && z.sichtbar && z.tabSichtbar && !z.reduziert && !z.angehalten;
}

export function dauerWert(z: DauerZustand): DauerWert {
  return dauerLaeuft(z) ? 'an' : 'aus';
}

/**
 * Zeigt die Seite den Knopf? Nur mit Skript und ohne reduzierte Bewegung: Bei reduzierter Bewegung läuft nichts, ein
 * Knopf wäre ohne Wirkung. Sichtfeld und Tab spielen keine Rolle (der Knopf bleibt stehen, wenn die Schleife ruht).
 */
export function knopfSichtbar(z: Pick<DauerZustand, 'skript' | 'reduziert'>): boolean {
  return z.skript && !z.reduziert;
}

/** Beschriftung des Knopfs (K-012: sagt, was passiert). */
export const DAUER_KNOPF = Object.freeze({ anhalten: 'Anhalten', abspielen: 'Abspielen' });

export function knopfText(angehalten: boolean): string {
  return angehalten ? DAUER_KNOPF.abspielen : DAUER_KNOPF.anhalten;
}
