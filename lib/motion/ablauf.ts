import { motionAllowed, type MediaWindow } from './prefers';

/**
 * Einmaliger Ablauf beim Sichtbarwerden (E-031, Auslöser `sicht`, KERN K-009): reine Logik hinter der Insel
 * components/zeichnung/bewegung/SichtStart.tsx, geprüft in lib/motion/__tests__/ablauf.test.ts. Der Bereich trägt
 * `data-ablauf`:
 * - `fertig`: Endzustand. So liefert ihn der Server, so steht er ohne Skript, bei reduzierter Bewegung, ohne
 *   IntersectionObserver und wenn der Bereich beim Laden schon (teilweise) im Bild ist – nichts blitzt auf.
 * - `bereit`: Startzustand, solange der Bereich unterhalb wartet. Nur, wenn Bewegung erlaubt ist und die erste Meldung
 *   des Observers „nicht im Bild“ lautet. Seine Lazy-Bilder lädt der Browser, wenn der Bereich näherkommt; der Ablauf
 *   startet erst, wenn sie dekodiert sind (Prüfrunde 2 C2-5), höchstens ABLAUF_BILD_NETZ_MS nach dem Sichtbarwerden.
 * - `laeuft`: Der Ablauf läuft (CSS unter [data-ablauf="laeuft"], Füllart backwards, bei den Büro-Szenen both, damit
 *   jede Ebene bis zum Schluss besteht; Ende ≤ SICHT_ENDE_MS); nach dem letzten Ablauf (spätestens nach ABLAUF_NETZ_MS)
 *   wieder `fertig`.
 * Das Modul hängt nur an ./prefers, damit die Insel klein bleibt (≤ 1 KB gzip).
 */
export type AblaufWert = 'fertig' | 'bereit' | 'laeuft';

/** Der Ruhezustand: so steht der Bereich ohne Skript und bis zur Hydration. */
export const ABLAUF_RUHE: AblaufWert = 'fertig';

/**
 * Der Ablauf startet, wenn die Oberkante des Bereichs über diese Linie steigt (unten 15 % des Bildes ausgespart): Er ist
 * dann sicher im Blick. Tiefe Bereiche starten so auch, wenn sie nie zu einem Viertel ins Bild passen.
 */
export const ABLAUF_RAND = '0px 0px -15% 0px';

/** Sicherheitsnetz: so lange nach dem Start steht spätestens der Endzustand (SICHT_ENDE_MS 2.400 + d-3 400). */
export const ABLAUF_NETZ_MS = 2800;

/**
 * Bilder des Bereichs (Prüfrunde 2 C2-5, Prüfrunde 3 C3-3, C3-5): Die Bänder und Zeichnungen der Vergleichsräume sind
 * Lazy-Dateien; der Browser lädt sie, wenn der Bereich näherkommt (wer nicht bis dorthin scrollt, lädt sie nicht).
 * Springt man zur Stelle (Ende, Bildlaufleiste, Suche im Text, Überschriften-Navigation), war der Ablauf sonst
 * gestartet, bevor sie geladen waren: Das heißeste Band sprang mitten im Wachsen ein. Darum `laeuft` der Bereich erst,
 * wenn alle Bilder dekodiert sind – höchstens ABLAUF_BILD_NETZ_MS nach dem Sichtbarwerden, dann läuft er trotzdem. Das
 * ist der Start des Auslösers `sicht` (lib/motion/register.ts SICHT_WARTEN_MS): Ende ≤ SICHT_ENDE_MS nach dem Start,
 * also ≤ 3.900 ms nach dem Sichtbarwerden.
 */
export const ABLAUF_BILD_NETZ_MS = 1500;

export type AblaufEreignis =
  /** Erste Meldung des Observers: ist der Bereich irgendwo im Bild? */
  | { art: 'erster-blick'; sichtbar: boolean }
  /** Der Bereich ist über die Startlinie gestiegen. */
  | { art: 'sichtbar' }
  /** Der letzte Ablauf ist zu Ende (oder das Netz greift). */
  | { art: 'ende' };

/** Bilder des Bereichs (ohne querySelectorAll: keine). */
const bilderIn = (element: Element) => [...((element as Partial<ParentNode>).querySelectorAll?.('img') ?? [])] as HTMLImageElement[];

/** Übergänge: fertig → bereit (erster Blick, nicht im Bild) → laeuft (sichtbar) → fertig (Ende); sonst bleibt alles. */
export function ablaufSchritt(jetzt: AblaufWert, ereignis: AblaufEreignis): AblaufWert {
  if (ereignis.art === 'erster-blick') return jetzt === 'fertig' && !ereignis.sichtbar ? 'bereit' : jetzt;
  if (ereignis.art === 'sichtbar') return jetzt === 'bereit' ? 'laeuft' : jetzt;
  return jetzt === 'laeuft' ? 'fertig' : jetzt;
}

/** Der Teil von window, den die Beobachtung braucht (für Tests austauschbar). */
export interface AblaufFenster extends MediaWindow {
  IntersectionObserver?: typeof IntersectionObserver;
  innerHeight?: number;
}

function fenster(): AblaufFenster | undefined {
  return typeof window === 'undefined' ? undefined : window;
}

/**
 * Beobachtet den Bereich und meldet `bereit` und `laeuft`. Ohne Observer oder bei reduzierter Bewegung meldet sie
 * nichts (der Endzustand bleibt). Die erste Meldung entscheidet über das ganze Bild: Ist der Bereich irgendwo zu sehen,
 * bleibt er fertig und die Beobachtung endet. Gibt die Abmeldung zurück.
 */
export function beobachteAblauf(element: Element, melden: (wert: AblaufWert) => void, win: AblaufFenster | undefined = fenster()): () => void {
  const Observer = win?.IntersectionObserver;
  if (!Observer || !motionAllowed(win)) return () => {};
  let wert = ABLAUF_RUHE;
  let erster = true;
  const schritt = (ereignis: AblaufEreignis) => {
    const neu = ablaufSchritt(wert, ereignis);
    if (neu !== wert) melden((wert = neu));
  };
  const observer = new Observer(
    (eintraege) => {
      const e = eintraege[eintraege.length - 1];
      if (!e) return;
      if (erster) {
        erster = false;
        const r = e.boundingClientRect;
        const hoehe = win?.innerHeight ?? 0;
        schritt({ art: 'erster-blick', sichtbar: e.isIntersecting || (r.bottom > 0 && r.top < hoehe && r.height > 0) });
        if (wert === ABLAUF_RUHE) return observer.disconnect();
      }
      if (e.isIntersecting) {
        observer.disconnect();
        // laeuft erst, wenn alle Bilder dekodiert sind (ein fehlerhaftes zählt als fertig), spätestens nach dem Netz;
        // ein zweiter Aufruf ändert nichts mehr (laeuft bleibt laeuft)
        const los = () => schritt({ art: 'sichtbar' });
        setTimeout(los, ABLAUF_BILD_NETZ_MS);
        void Promise.allSettled(bilderIn(element).map((bild) => bild.decode())).then(los);
      }
    },
    { threshold: 0, rootMargin: ABLAUF_RAND },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

/** Ein Element mit Web-Animations-API (getAnimations fehlt in alten Browsern und im Test). */
type MitAnimationen = Element & { getAnimations?: (o?: { subtree?: boolean }) => ReadonlyArray<{ finished: Promise<unknown> }> };

/**
 * Wartet, bis alle Abläufe im Bereich zu Ende sind (das letzte animationend), höchstens ABLAUF_NETZ_MS, und ruft `ende`
 * genau einmal. Ohne getAnimations gilt nur das Netz. Gibt die Abmeldung zurück.
 */
export function warteAufEnde(element: Element, ende: () => void): () => void {
  let aus = false;
  const einmal = () => {
    if (aus) return;
    aus = true;
    clearTimeout(netz);
    ende();
  };
  const netz = setTimeout(einmal, ABLAUF_NETZ_MS);
  const laeufe = (element as MitAnimationen).getAnimations?.({ subtree: true });
  if (laeufe) void Promise.allSettled(laeufe.map((a) => a.finished)).then(einmal);
  return () => {
    aus = true;
    clearTimeout(netz);
  };
}
