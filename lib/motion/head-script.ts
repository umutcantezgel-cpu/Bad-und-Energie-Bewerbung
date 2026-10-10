/**
 * Kopfskript (E-013, KERN K-009): setzt die Klasse `auftakt` auf <html>, bevor der Browser das erste
 * Bild malt, aber nur ohne reduzierte Bewegung. Die Signaturmomente (Startseite „Der Kreislauf läuft
 * an“) laufen nur unter `.auftakt`; ihre Grundwerte sind der Endzustand (Füllart `backwards`), ohne
 * Skript steht also alles sofort richtig da.
 *
 * Sicherheitsnetz: Nach 2 s entfernt das Skript die Klasse wieder. Alles, was dann noch liefe, steht
 * sofort im Endzustand (der längste Auftakt endet nach 1.120 ms).
 *
 * Eingebunden in app/layout.tsx als Inline-Skript im <head>.
 *
 * CSP (KERN K-004, R2-FUND-01 Runde 2): Der sha256-Hash steht als HEAD_SCRIPT_SHA256 unten, aber bewusst
 * NICHT in next.config.ts. Sobald script-src einen Hash oder eine Nonce führt, ignorieren Browser
 * (CSP Level 2+) 'unsafe-inline' – dann verstießen alle Inline-Skripte von Next (RSC-Flight-Daten
 * `self.__next_f.push`, in jedem Dokument mehrfach) gegen die Richtlinie: Fehlmeldungen bei jedem
 * Aufruf im Report-Only-Betrieb, gesperrte Hydration nach dem Scharfschalten. Bis zur Nonce-Strategie
 * (proxy.ts, 'nonce-…' + 'strict-dynamic', eigenes Paket) deckt 'unsafe-inline' alle Inline-Skripte ab,
 * auch dieses. lib/motion/__tests__/head-script.test.ts prüft den Hash, lib/motion/__tests__/csp.test.ts
 * die Regel „Hash nur, wenn jedes Inline-Skript des Builds abgedeckt ist“.
 */

/** Klasse auf <html>, unter der die Auftakt-Abläufe laufen. */
export const AUFTAKT_KLASSE = 'auftakt';

/** Nach dieser Zeit entfernt das Kopfskript die Klasse (Sicherheitsnetz). */
export const SICHERHEITSNETZ_MS = 2000;

/** Medienabfrage für reduzierte Bewegung, gleich mit lib/motion/prefers.ts. */
export const REDUZIERT_ABFRAGE = '(prefers-reduced-motion: reduce)';

/**
 * Das Skript selbst (≤ 1 KB, ES5, ohne Abhängigkeiten). try/catch: Fehlt matchMedia, bleibt die
 * Klasse aus und die Seite zeigt den Endzustand.
 */
export const HEAD_SCRIPT = `!function(d){try{if(!matchMedia("${REDUZIERT_ABFRAGE}").matches){d.classList.add("${AUFTAKT_KLASSE}");setTimeout(function(){d.classList.remove("${AUFTAKT_KLASSE}")},${SICHERHEITSNETZ_MS})}}catch(e){}}(document.documentElement)`;

/**
 * sha256 des Skripts als CSP-Quelle (für die spätere Nonce-/Hash-Strategie). Ändert sich ein Zeichen
 * am Skript, schlägt lib/motion/__tests__/head-script.test.ts an.
 */
export const HEAD_SCRIPT_SHA256 = "'sha256-Ku9H9pawJNtuSR7KCYsMyrpSTb24tva6DXVGib1WVAM='";
