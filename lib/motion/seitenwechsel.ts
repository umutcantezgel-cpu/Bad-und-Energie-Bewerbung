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
 * Zeitplan in ms: `abdecken` ab dem Klick (WECHSEL.abdeckenMs: vier Bänder, ½ Takt versetzt, je d-2), `halten` ab dem
 * Wechsel-Auftrag (WECHSEL.haltenMs: spätestens dann wird aufgedeckt, auch wenn die neue Seite noch nicht steht),
 * `aufdecken` (WECHSEL.aufdeckenMs, d-2), `klick` (KLICK_ENDE_MS). Die Netze greifen einen Takt nach dem Ende eines
 * Ablaufs, falls sein Ende (animationend) nicht gemeldet wird: Dann wechselt die Seite bzw. die Front ist weg.
 */
export const ZEITPLAN = Object.freeze({
  abdecken: 360,
  abdeckenNetz: 440,
  halten: 1200,
  aufdecken: 240,
  aufdeckenNetz: 320,
  klick: 480,
});

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
