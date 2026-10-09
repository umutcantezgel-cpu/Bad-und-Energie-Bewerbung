/**
 * Bewegungsmodul (E-013, KERN K-009): CSS zuerst, dieses Modul nur für Register, Abfragen,
 * Sichtbarkeits-Auslöser und das Kopfskript. Keine Bibliothek.
 */
export { AUFTAKT_KLASSE, HEAD_SCRIPT, HEAD_SCRIPT_SHA256, REDUZIERT_ABFRAGE, SICHERHEITSNETZ_MS } from './head-script';
export { MEDIA, canHover, hasCoarsePointer, matches, motionAllowed, prefersReducedMotion, subscribe } from './prefers';
export type { MediaName, MediaWindow } from './prefers';
export {
  AUFTAKT_ENDE_MS,
  DAUER_MS,
  MOTION_IDS,
  MOTION_REGISTER,
  TAKT_MS,
  isMotionId,
  maxDauerMs,
  maxVerzoegerungMs,
  motionEntry,
} from './register';
export type { Ausloeser, DauerToken, Eigenschaft, KurveToken, MotionEntry, MotionId, Seitenart } from './register';
export { onceVisible } from './sicht';
export type { SichtOptionen } from './sicht';
