/**
 * Bewegungsmodul (E-013, KERN K-009): CSS zuerst, dieses Modul nur für Register, Abfragen,
 * Sichtbarkeits-Auslöser und das Kopfskript. Keine Bibliothek.
 */
export { AUFTAKT_KLASSE, HEAD_SCRIPT, HEAD_SCRIPT_SHA256, REDUZIERT_ABFRAGE, SICHERHEITSNETZ_MS } from './head-script';
export { MEDIA, canHover, hasCoarsePointer, matches, motionAllowed, prefersReducedMotion, subscribe } from './prefers';
export type { MediaName, MediaWindow } from './prefers';
export {
  AUFTAKT_ENDE_MS,
  DAUER_IDS,
  DAUER_MS,
  DIFFUSION_STUETZ,
  EIGENSCHAFTEN,
  KLICK_ENDE_MS,
  MOTION_IDS,
  MOTION_REGISTER,
  NACHLAUF_ENDE_MS,
  NACHLAUF_START_TAKTE,
  SICHT_ENDE_MS,
  SICHT_WARTEN_MS,
  TAKT_MS,
  WECHSEL,
  isMotionId,
  maxDauerMs,
  maxVerzoegerungMs,
  motionEntry,
} from './register';
export type {
  Ausloeser,
  DauerToken,
  Eigenschaft,
  Fenster,
  FensterAusloeser,
  KurveToken,
  MotionEntry,
  MotionId,
  Schleife,
  Seitenart,
  Wechsel,
} from './register';
export { beobachteSicht, beobachteTab, onceVisible } from './sicht';
export { ABLAUF_NETZ_MS, ABLAUF_RAND, ABLAUF_RUHE, ablaufSchritt, beobachteAblauf, warteAufEnde } from './ablauf';
export type { AblaufEreignis, AblaufFenster, AblaufWert } from './ablauf';
export type { SichtOptionen, TabDokument } from './sicht';
export { DAUER_KNOPF, DAUER_RUHE, dauerLaeuft, dauerWert, knopfSichtbar, knopfText } from './dauer';
export type { DauerWert, DauerZustand } from './dauer';
