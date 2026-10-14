/**
 * Inneneinheit der Anlage (KERN K-010): Das Modell steht noch nicht fest (M-022, Angabe des Inhabers offen). Bis dahin
 * gibt es keine Maße und die Zeichnungen zeigen sie nur als Symbol (Rechteck mit Systemgrenze, Fließschema mit
 * Speicher, Pumpe und Umschaltventil), nie maßstäblich.
 */
export interface Inneneinheit {
  id: 'inneneinheit';
  modell: string | null;
  /** Außenmaße in mm (B × H × T); `null`, solange das Modell offen ist. */
  masse: { breite: number; hoehe: number; tiefe: number } | null;
  /** Offene Angabe in _relaunch/MENSCHEN.md. */
  offen: 'M-022';
  /** Wie die Zeichnungen sie zeigen, solange `masse` fehlt. */
  darstellung: 'symbol';
}

export const INNENEINHEIT: Inneneinheit = Object.freeze({
  id: 'inneneinheit',
  modell: null,
  masse: null,
  offen: 'M-022',
  darstellung: 'symbol',
});
