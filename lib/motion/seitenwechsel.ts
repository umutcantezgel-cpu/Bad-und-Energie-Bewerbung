/**
 * Seitenwechsel als Wärmefront (E-031, KERN K-009, Kennung `seitenwechsel`): Linkfilter und Zeitplan als reine Logik;
 * Paket W4 füllt diese Datei, der Zeitplan selbst steht im Bewegungsregister (`WECHSEL` in lib/motion/register.ts).
 *
 * Notschalter (E-031, Entscheidung 8): `false` lässt jeden Link ohne Übergang wechseln. Als `boolean` typisiert, damit
 * beide Zweige im Code bleiben; die Tests decken beide Zustände ab.
 */
export const WAERMEFRONT_AN: boolean = true;
