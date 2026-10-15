/**
 * Notschalter des Wärmefelds (E-031, Entscheidung 8): `false` zeigt jede Zeichnung ohne Bänder, so wie vor E-031,
 * ohne weiteren Rückbau. Die Darstellung (components/zeichnung/waerme) liest nur diesen Wert; die Tests decken beide
 * Zustände ab. Als `boolean` typisiert, damit beide Zweige im Code bleiben.
 */
export const WAERMEFELD_AN: boolean = true;
