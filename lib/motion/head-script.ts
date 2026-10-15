/**
 * Kopfskript (E-013, KERN K-009): setzt die Klasse `auftakt` auf <html>, bevor der Browser das erste
 * Bild malt, aber nur ohne reduzierte Bewegung. Die Signaturmomente (Startseite „Der Kreislauf läuft
 * an“) laufen nur unter `.auftakt`; ihre Grundwerte sind der Endzustand (Füllart `backwards`), ohne
 * Skript steht also alles sofort richtig da.
 *
 * Sicherheitsnetz: 2 s nach dem ersten Ablaufstart (animationstart, er steigt bis <html> auf) entfernt das Skript
 * die Klasse wieder. Alles, was dann noch liefe, steht sofort im Endzustand (der längste Auftakt endet nach
 * 1.120 ms, der Nachlauf der Wärme im Hero nach 1.920 ms ab demselben Stilaufbau). Bis E-031 Prüfrunde 1 begann das
 * Netz schon beim Skriptstart im <head>; die Abläufe beginnen aber erst mit dem ersten Stil- und Bildaufbau der
 * Seite, auf langsamen Geräten und Netzen bis zu einer Sekunde später, und der Nachlauf brach mitten im Lauf ab
 * (Prüfrunde 1 C1-1, e2e/waerme.spec.ts misst es beim echten Laden). Startet nie ein Ablauf, bleibt die Klasse stehen
 * und bewirkt nichts; ein Seitenwechsel innerhalb der Seite nimmt sie ohnehin weg (Waermefront.tsx).
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

/** So lange nach dem ersten Ablaufstart entfernt das Kopfskript die Klasse (Sicherheitsnetz). */
export const SICHERHEITSNETZ_MS = 2000;

/** Medienabfrage für reduzierte Bewegung, gleich mit lib/motion/prefers.ts. */
export const REDUZIERT_ABFRAGE = '(prefers-reduced-motion: reduce)';

/**
 * Das Skript selbst (≤ 1 KB, ES5, ohne Abhängigkeiten). try/catch: Fehlt matchMedia, bleibt die
 * Klasse aus und die Seite zeigt den Endzustand.
 */
export const HEAD_SCRIPT = `!function(d){try{if(!matchMedia("${REDUZIERT_ABFRAGE}").matches){d.classList.add("${AUFTAKT_KLASSE}");var s=function(){d.removeEventListener("animationstart",s);setTimeout(function(){d.classList.remove("${AUFTAKT_KLASSE}")},${SICHERHEITSNETZ_MS})};d.addEventListener("animationstart",s)}}catch(e){}}(document.documentElement)`;

/**
 * sha256 des Skripts als CSP-Quelle (für die spätere Nonce-/Hash-Strategie). Ändert sich ein Zeichen
 * am Skript, schlägt lib/motion/__tests__/head-script.test.ts an.
 */
export const HEAD_SCRIPT_SHA256 = "'sha256-GPgCpr5xQMh0wOSvyPh2/rpglK89bJs3HHrdcnyeE0Q='";
