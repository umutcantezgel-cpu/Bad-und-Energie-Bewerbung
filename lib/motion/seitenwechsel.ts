/**
 * Seitenwechsel als Wärmefront und Klick-Wärme (E-031, KERN K-009, Kennungen `seitenwechsel` und `klick-waerme`):
 * Linkfilter, Maße und Zeitplan als reine Logik hinter der Insel components/site/waermefront/Waermefront.tsx.
 *
 * Kein Import aus lib/motion/register.ts: Das Register zöge alle Zwecktexte in den Browser (Insel ≤ 2 KB gzip). Die
 * Zeiten hier spiegeln WECHSEL und KLICK_ENDE_MS; lib/motion/__tests__/seitenwechsel.test.ts hält sie gleich.
 *
 * Notschalter (E-031, Entscheidung 8): `false` lässt jeden Link ohne Übergang wechseln (die Klick-Wärme bleibt). Als
 * `boolean` typisiert, damit beide Zweige im Code bleiben; die Tests decken beide Zustände ab.
 */
export const WAERMEFRONT_AN: boolean = true;

/**
 * Zeitplan in ms (Owner-Feedback 16.10.2026, sanfter Wärmeschleier, darauf die Ringe; E-031), ab dem Klick: `vorlauf`
 * (WECHSEL.vorlaufMs, ein Takt: Der Schleier steht in der Startgröße als eigene Ebenen und blendet ein, bevor er wächst;
 * die Ringe wachsen nach FRONT_RINGE im Register), `abdecken`
 * (WECHSEL.abdeckenMs: Vorlauf + d-4 Wachsen; zugleich endet das Einblenden der Seitenfarbe, 5½ Takte + d-2: Sie deckt
 * das Fenster), `wechsel` (WECHSEL.wechselMs: router.push, sobald die Seitenfarbe deckt, also gleich `abdecken`). Ab dem
 * Wechsel-Auftrag `halten` (WECHSEL.haltenMs: spätestens dann wird aufgedeckt, auch wenn die neue Seite noch nicht
 * steht), ab dem neuen Pfad `ruhe` (WECHSEL.ruheMs: so lange höchstens auf die Ruhe der neuen Seite warten, Prüfrunde 5
 * C5-2); `aufdecken` (WECHSEL.aufdeckenMs, ein Takt + d-3) ab seinem Start. `klick` (KLICK_ENDE_MS) ab dem Klick:
 * Die Ringe blenden je ½ Takt versetzt ein (d-2), der äußere zuerst; steht er, verklingen alle gemeinsam (ein Takt +
 * d-3), also nach d-2 + ein Takt + d-3. Die Netze greifen, falls das Ende eines Ablaufs (animationend, transitionend)
 * nicht gemeldet wird: Dann wechselt die Seite bzw. die Überlagerung ist zu. Das Netz des Aufdeckens und der
 * Klick-Wärme greift einen Takt nach dem Ende; das des Wechsels zwei Takte nach der Deckung, denn die Abläufe beginnen
 * erst, wenn Chromium die Ebenen gerastert hat (gemessen 40–100 ms nach dem Klick, Prüfrunde 4).
 */
export const ZEITPLAN = /* @__PURE__ */ Object.freeze({
  vorlauf: 80,
  wechsel: 680,
  wechselNetz: 840,
  abdecken: 680,
  halten: 1200,
  ruhe: 320,
  aufdecken: 480,
  aufdeckenNetz: 560,
  klick: 720,
  klickNetz: 800,
});

/**
 * Die Zeiten, die die Insel braucht, einzeln (das Objekt ZEITPLAN mit seinen Schlüsseln bliebe sonst ganz im Bündel der
 * Insel, ≤ 2 KB gzip); seitenwechsel.test.ts hält sie gleich ZEITPLAN.
 */
export const WECHSEL_NETZ_MS = 840;
export const HALTEN_MS = 1200;
export const RUHE_MS = 320;
export const AUFDECKEN_NETZ_MS = 560;
export const KLICK_ZU_MS = 800;

/**
 * Startgröße der Front (Owner-Feedback 16.10.2026: „nicht als winziger explodierender Punkt“): Die Schicht in der
 * Seitenfarbe beginnt mit diesem Anteil der Fensterdiagonale als Durchmesser, die zwei Schichten des Schleiers mit 1,12
 * und 1,08 davon (also 16,2–16,8 %). Sichtbar beginnt der Schleier; die Seitenfarbe ist bis zu ihrem Einblenden
 * unsichtbar. Nicht 0: Eine Scheibe ohne Fläche hat nichts vorzurastern (Prüfrunde 4 A4-3, C4-1). Die Ringe beginnen
 * bei RING_START ihrer Endgröße, also bei mindestens der Hälfte davon.
 */
export const FRONT_START = 0.15;

/**
 * Durchmesser der Schichten der Front am Ende, relativ zum Kreis bis zur fernsten Ecke (frontDurchmesser), von unten
 * nach oben (waermefront.module.css: Innenabstand (29 − n) × --s / 50): der Schleier 1,12 und 1,08 (n = 1, 2), die drei
 * Ringe 0,92, 0,8 und 0,6 (n = 6, 9, 14: Sie kommen im Fenster zur Ruhe, außen bleibt der Schleier, und der heißeste
 * überzieht das Fenster nie ganz), zuletzt die Seitenfarbe 1 (n = 4).
 */
export const FRONT_SCHICHTEN: readonly number[] = /* @__PURE__ */ Object.freeze([1.12, 1.08, 0.92, 0.8, 0.6, 1]);

/**
 * Startmaßstab der Ringe relativ zu ihrer Endgröße (@keyframes r: 0,16 → 1 nach √t). Kein Punkt (Owner-Feedback
 * 16.10.2026): Auch der innerste Ring (0,6) beginnt bei mindestens FRONT_START / 2 der Fensterdiagonale, denn der Kreis
 * bis zur fernsten Ecke ist nie kleiner als die Diagonale.
 */
export const RING_START = 0.16;

/**
 * Ruhe der neuen Seite vor dem Aufdecken (Prüfrunde 3 C3-1, KERN K-013): so viele Bilder in Folge ohne Änderung im
 * Dokument, ohne ladendes Bild und ohne endlichen Ablauf der Seite. Die neue Seite malt beim Einsetzen und beim Start
 * ihrer Teile mehrmals; das soll unter der deckenden Front geschehen, nicht während sie verblasst. Gezählt wird ab dem
 * neuen Pfad, höchstens `ruhe` lang (Prüfrunde 5 C5-2): Bereiche, die nachladen – etwa die Bewerbung auf der
 * Stellenseite als React.lazy –, wartet die Front nicht mehr ab. React zeigte deren Platzhalter frühestens 300 ms nach
 * dem Einsetzen, und so lange stand eine leere Fläche über dem Fenster.
 */
export const RUHE_BILDER = 4;

/** Die Überlagerung der Wärmefront (Waermefront.tsx, data-motion = Kennung im Register). */
export const FRONT_SELEKTOR = '[data-motion="seitenwechsel"]';

/**
 * Nachladende Bereiche warten auf die Front, nicht die Front auf sie (Prüfrunde 5 C5-2; KERN K-013 Malzeit): Ein
 * Bereich, der nach einem Seitenwechsel nachlädt (React.lazy, etwa die Bewerbung auf der Stellenseite), setzt seinen
 * Inhalt erst ein, wenn die Wärmefront zu ist. So malt er weder unter der Deckung noch beim Aufdecken, und die neue
 * Seite steht ohne Wartezeit. Das Versprechen geht sofort auf, wenn keine Front offen ist (erstes Laden, reduzierte
 * Bewegung, ohne Popover-Unterstützung, auf dem Server).
 */
export function nachDerFront(dokument: Pick<Document, 'querySelector'> | undefined = typeof document === 'undefined' ? undefined : document): Promise<void> {
  return new Promise((fertig) => {
    const front = dokument?.querySelector<HTMLElement>(FRONT_SELEKTOR);
    if (!front || typeof front.showPopover !== 'function' || !front.matches(':popover-open')) return fertig();
    const warte = (event: Event) => {
      if ((event as ToggleEvent).newState !== 'closed') return;
      front.removeEventListener('toggle', warte);
      fertig();
    };
    front.addEventListener('toggle', warte);
  });
}

/**
 * Klasse des Kopfskripts (lib/motion/head-script.ts, AUFTAKT_KLASSE; hier als Text, die Logik hängt an nichts): Bei
 * einem Seitenwechsel innerhalb der Seite nimmt die Insel sie weg, damit die neue Seite im Endzustand steht (Plan §5,
 * Prüfrunde 1 C1-2) und kein Auftakt mitten im Lauf vom Sicherheitsnetz abgebrochen wird.
 */
export const AUFTAKT = 'auftakt';

/** Ziele der Wärmefront: nur Erzählseiten (KERN K-011): `/`, `/jobs/[slug]`, `/einsatzgebiet/**`, `/arbeiten-bei-uns/**`. */
const ERZAEHLSEITE = /^\/(?:jobs\/[^/]+|(?:einsatzgebiet|arbeiten-bei-uns)(?:\/[^/]+)*)?$/;
/** Nie mit Front: Schnittstellen, Feeds, Zeichnungsdateien, Dateien von Next und alles mit Dateiendung. */
const OHNE_FRONT = /^\/(?:api|feeds|zeichnung|_next)(?:\/|$)|\.\w+$/;
/** Der Bewerbungsweg (`/bewerbung*`) bleibt ruhig (KERN K-011): keine Klick-Wärme, keine Front hin oder weg. */
export const imBewerbungsweg = (pfad: string): boolean => pfad.startsWith('/bewerbung');

/** Darf die Wärmefront zu diesem Pfad führen? */
export function frontSeite(pfad: string): boolean {
  return ERZAEHLSEITE.test(pfad) && !OHNE_FRONT.test(pfad) && !imBewerbungsweg(pfad);
}

/** Was der Linkfilter vom Klick liest (MouseEvent). */
export interface FrontKlick {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}

/** Was der Linkfilter vom Link liest (HTML- oder SVG-`<a>`). */
export interface FrontLink {
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  closest(selector: string): unknown;
}

/** Wo die Seite steht (Location). */
export interface FrontOrt {
  href: string;
  origin: string;
  pathname: string;
}

/**
 * Ziel der Wärmefront für einen Klick auf einen Link, sonst null (dann wechselt die Seite wie immer, über next/link oder
 * den Browser). Die Front läuft nur bei einem einfachen Klick (linke Taste, keine Zusatztaste, von niemandem
 * abgefangen) auf einen Link ins selbe Fenster (target leer oder _self), ohne download, auf derselben Herkunft, zu
 * einem anderen Pfad (nicht nur Anker oder Suche), zu einer Erzählseite, nicht aus dem Bewerbungsweg und nicht aus
 * einem Bereich mit `data-kein-front` (Links mit `replace` oder `scroll={false}` tragen es, damit ihr Verhalten bleibt).
 * Zurückgegeben wird Pfad, Suche und Anker für router.push.
 */
export function frontZiel(klick: FrontKlick, link: FrontLink, ort: FrontOrt): string | null {
  if (!WAERMEFRONT_AN || klick.defaultPrevented || klick.button !== 0) return null;
  if (klick.metaKey || klick.ctrlKey || klick.shiftKey || klick.altKey) return null;
  const href = link.getAttribute('href');
  const fenster = link.getAttribute('target');
  if (href === null || (fenster && fenster !== '_self') || link.hasAttribute('download') || link.closest('[data-kein-front]')) return null;
  if (imBewerbungsweg(ort.pathname)) return null;
  let ziel: URL;
  try {
    ziel = new URL(href, ort.href);
  } catch {
    return null;
  }
  if (ziel.origin !== ort.origin || ziel.pathname === ort.pathname || !frontSeite(ziel.pathname)) return null;
  return ziel.pathname + ziel.search + ziel.hash;
}

/**
 * Pfad, zu dem ein Link auf derselben Herkunft führt, sonst null (fremde Herkunft, ungültige Adresse, ohne href).
 * Die Klick-Wärme fragt damit, ob ein Link in den Bewerbungsweg führt (Prüfrunde 1 C1-3): Sie stünde sonst nach dem
 * Wechsel über dem ersten Schritt des Formulars.
 */
export function linkPfad(link: Pick<FrontLink, 'getAttribute'>, ort: FrontOrt): string | null {
  const href = link.getAttribute('href');
  if (href === null) return null;
  try {
    const ziel = new URL(href, ort.href);
    return ziel.origin === ort.origin ? ziel.pathname : null;
  } catch {
    return null;
  }
}

/** Bedienelemente, an denen die Klick-Wärme erscheint. */
export const BEDIENELEMENT = 'a[href],button,summary,[role="button"]';

/** Was die Klick-Wärme vom Ziel des Klicks liest (Element). */
export interface KlickElement {
  closest(selector: string): KlickElement | null;
  getAttribute(name: string): string | null;
}

/**
 * Das Bedienelement der Klick-Wärme oder null: nur Links und Knöpfe (auch `summary`, `role="button"`), nicht in
 * Formularen, nicht deaktiviert (`aria-disabled`; deaktivierte Knöpfe melden keinen Klick), nicht im Bewerbungsweg und
 * nicht auf dem Weg dorthin (`ziel`: Pfad des Links, linkPfad; „Jetzt bewerben“ wechselt vor dem Ende der Wärme).
 */
export function klickZiel(start: KlickElement | null, pfad: string, ziel: string | null = null): KlickElement | null {
  const element = start?.closest(BEDIENELEMENT) ?? null;
  if (!element || imBewerbungsweg(pfad) || (ziel !== null && imBewerbungsweg(ziel))) return null;
  if (element.closest('form') || element.getAttribute('aria-disabled') === 'true') return null;
  return element;
}

/**
 * Wo die Wärme beginnt: am Zeiger (Maus, Finger), mit der Tastatur (`detail` 0: Enter oder Leertaste) in der Mitte
 * des Elements.
 */
export function klickPunkt(
  klick: { detail: number; clientX: number; clientY: number },
  box: { left: number; top: number; width: number; height: number },
): [number, number] {
  return klick.detail ? [klick.clientX, klick.clientY] : [box.left + box.width / 2, box.top + box.height / 2];
}

/**
 * Durchmesser der Front in px: ein Kreis um den Klickpunkt bis zur fernsten Ecke des Fensters (breite × hoehe), auf
 * ganze Pixel aufgerundet und 1 px Rand je Seite, damit die Kante der Scheibe sicher hinter der Ecke liegt.
 */
export function frontDurchmesser(x: number, y: number, breite: number, hoehe: number): number {
  return 2 * Math.ceil(Math.hypot(Math.max(x, breite - x), Math.max(y, hoehe - y))) + 2;
}

/**
 * Größte Grundgröße einer Scheibe der Front in px (Prüfrunde 2 A2-1, C2-2, C2-3, B2-3). Die Scheibe ist so groß
 * gezeichnet und wächst darüber hinaus per transform: scale(faktor).
 * - Kreis: --radius-voll (999 px) rundet eine Scheibe nur bis 1.998 px Durchmesser zum Kreis; darüber blieben gerade
 *   Flanken stehen (am Desktop bis rund 3.400 px). Bei höchstens 1.024 px ist die Scheibe immer ein Kreis, das
 *   Skalieren erhält die Form.
 * - Ebenen: Vier Ebenen von bis zu 3.400 px Kantenlänge, die ab Maßstab 0 wachsen, musste Chromium ganz rastern
 *   (Kacheln fehlten, große Lücken in der Bildfolge). Eine Grundgröße von 1.024 px rastert ein Viertel bis ein Elftel
 *   der Fläche, und die Rasterzeit halbierte sich. Gerade Farbkanten blieben trotzdem im ersten Bild nach dem Klick
 *   (Prüfrunde 4 A4-3, C4-1: 3 von 4 Läufen, Kante an der Kachelgrenze): Eine Scheibe, die im Vorlauf bei Maßstab 0
 *   stand, hatte nichts vorzurastern. Dagegen helfen erst FRONT_START, will-change und der Vorlauf (ZEITPLAN.vorlauf).
 */
export const FRONT_GRUND = 1024;

/**
 * Maß der Front als [grund, faktor, start]: Grundgröße der Schichten (px, höchstens FRONT_GRUND), der Faktor, mit dem
 * die Schicht in der Seitenfarbe auf den Durchmesser bis zur fernsten Ecke wächst (frontDurchmesser = grund × faktor),
 * und ihr Startmaßstab, FRONT_START der Fensterdiagonale (waermefront.module.css: @keyframes w von --z auf --m). Ein
 * Tupel statt eines Objekts: Die Schlüssel stünden sonst im Bündel der Insel (≤ 2 KB gzip).
 */
export function frontMass(x: number, y: number, breite: number, hoehe: number): [grund: number, faktor: number, start: number] {
  const durchmesser = frontDurchmesser(x, y, breite, hoehe);
  const grund = Math.min(durchmesser, FRONT_GRUND);
  return [grund, durchmesser / grund, (FRONT_START * Math.hypot(breite, hoehe)) / grund];
}
