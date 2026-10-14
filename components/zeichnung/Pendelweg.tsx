import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface PendelwegProps {
  /** Name des Orts am Punkt, z. B. „Herborn“. */
  ort: string;
  /** Kurs vom Firmensitz zum Ort in Grad (0 = Norden, im Uhrzeigersinn; lib/places/derive.ts bearingDeg). */
  kursGrad: number;
  /** Straßenstrecke in ganzen km (Messung): Wert an der Maßkette; Länge auf dem Plan, solange `luftlinieKm` fehlt. */
  strasseKm: number;
  /**
   * Luftlinie in km (Messung, lib/places/derive.ts airKm). Mit ihr liegt der Ort maßstäblich auf dem Plan und die
   * Maßkette nennt die Luftlinie (eine Stelle nach dem Komma); ohne sie gilt die Straßenstrecke (Etikett „Straße“).
   * Die Ortsseite übergibt sie immer: Ein Lageplan mit Maßstabsleiste zeigt die Luftlinie.
   */
  luftlinieKm?: number;
  /** Beschriftung am Haus (Standard „Firmensitz“). */
  sitz?: string;
  /** Zugänglicher Name (role="img"); ohne Titel dekorativ (aria-hidden), wenn die Seite die Werte schon nennt. */
  titel?: string;
  className?: string;
}

/**
 * Rahmen in Einheiten. Bei 28,125rem (450 px) Breite ist eine Einheit 1,5 px: Strich 2 Einheiten = 3 px (K-010),
 * Schrift 13 Einheiten ≈ 19,5 px. Fester Rahmen, damit jede Ortsseite dieselbe Skala zeigt.
 */
export const PENDELWEG_RAHMEN = Object.freeze({ breite: 300, hoehe: 240 });
const W = PENDELWEG_RAHMEN.breite;
const H = PENDELWEG_RAHMEN.hoehe;
const LUFT = 4;

/**
 * Maßstab des Lageplans (E-029): Der Regelfall ist dieselbe Skala auf jeder Ortsseite, 35 km (Gebietsregel, Fakt
 * radius35) auf `radius` Einheiten. Nahe Orte lägen dort auf dem Haus; sie bekommen die nächste Stufe (15 bzw. 5 km auf
 * derselben Länge), damit der Abstand mindestens PENDELWEG_MIN_ANTEIL der Länge ist. Die Maßstabsleiste zeigt immer den
 * Maßstab des Bilds: Nichts ist aus Gefälligkeit länger gezeichnet (K-010).
 */
export const PENDELWEG_SKALA = Object.freeze({ maxKm: 35, radius: 158, stufen: [35, 15, 5] as readonly number[] });
/** Kürzester gezeichneter Abstand als Anteil der Länge: Haus, Punkt, Kette und Namen brauchen Platz. */
export const PENDELWEG_MIN_ANTEIL = 0.3;
/** Maßstabsleiste je Stufe: Teilung in km (0, a, 2a). */
const LEISTE_TEILUNG: Readonly<Record<number, number>> = Object.freeze({ 35: 5, 15: 2, 5: 1 });

/** Giebel 45° wie das Haus in der Mitte des Plans (RadiusGraphic CENTER_HOUSE, K-010), hier 1,25-fach. */
const HAUS = 'M-8 7V-1L0 -9L8 -1V7Z';
const HAUS_MASS = 1.25;
const SCHRIFT = 13;
/** Mittlere Zeichenbreite in em (Atkinson 700 bzw. Martian Mono 75 %), großzügig für die Lage der Schrift. */
const ZEICHEN_EM = 0.6;
/** Abstand der Maßkette vom geraden Weg und ihres Werts von der Kette. */
const KETTE_ABSTAND = 16;
const WERT_ABSTAND = 11;
/** Linienarten in Einheiten des Plans (bei 450 px Breite 1 Einheit = 1,5 px): Kontur 2 px, fein und Maß 1 px. */
const KONTUR = 4 / 3;
const FEIN = 2 / 3;
const NORD = Object.freeze({ breite: 14, hoehe: 40 });
/** Maßstabsleiste: Höhe des Balkens und Fläche mit Zahlen und Etikett darunter. */
const LEISTE = Object.freeze({ balken: 4, hoehe: 36, rand: 14 });

export interface Punkt {
  x: number;
  y: number;
}

export interface Kasten {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface Schrift {
  text: string;
  /** Zeilen der Schrift (lange Namen in zwei Zeilen, z. B. „Waldbrunn“ / „(Westerwald)“). */
  zeilen: string[];
  x: number;
  y: number;
  anker: 'start' | 'middle' | 'end';
  kasten: Kasten;
}

/** Freistellung (Maske): Rechteck um eine Schrift, um seine Mitte gedreht; Bögen und Schenkel setzen dort aus. */
export interface Freistellung {
  x: number;
  y: number;
  breite: number;
  hoehe: number;
  winkel: number;
}

export interface PendelLage {
  haus: Punkt;
  ort: Punkt;
  ortSchrift: Schrift;
  hausSchrift: Schrift;
  kette: { a: Punkt; b: Punkt; strich: Punkt };
  wert: Schrift & { winkel: number };
  /** Verbindung Firmensitz → Ort (gerade, in echter Richtung), vom Rand des Hauses bis an den Ring des Punkts. */
  linie: { a: Punkt; b: Punkt };
  /** Maßstabsleiste unten in einer freien Ecke: Lage (links oben), Länge je Teilung, Werte, Etikett. */
  leiste: { x: number; y: number; teilung: number; einheiten: number; werte: number[]; etikett: string; kasten: Kasten };
  /** Maßstab des Bilds: so viele km liegen auf `PENDELWEG_SKALA.radius` Einheiten. */
  massstabKm: number;
  nord: Punkt;
  /** Belegte Flächen (Haus, Punkt, Schriften, Kette, Wert); liegen im Rahmen und überdecken einander nicht. */
  kaesten: Kasten[];
  /** Flächen der Schriften, in denen Linien aussetzen (wie ein Halo, nur breiter): keine Linie durch Schrift. */
  frei: Freistellung[];
  hoehe: number;
}

const NBSP = '\u00A0';
const ZEILE_EM = 1.2;
const round1 = (value: number) => Math.round(value * 10) / 10;
const breiteVon = (text: string, schrift = SCHRIFT) => text.length * schrift * ZEICHEN_EM;

/** Ein langer Name mit Leerzeichen in zwei Zeilen, getrennt am Leerzeichen nahe der Mitte; sonst eine Zeile. */
export function zweiZeilen(text: string): string[] | null {
  const luecken = [...text.matchAll(/ /g)].map((m) => m.index);
  if (luecken.length === 0) return null;
  const mitte = text.length / 2;
  const at = luecken.reduce((best, i) => (Math.abs(i - mitte) < Math.abs(best - mitte) ? i : best));
  return [text.slice(0, at), text.slice(at + 1)];
}
const um = (p: Punkt, halb: number): Kasten => ({ x0: p.x - halb, y0: p.y - halb, x1: p.x + halb, y1: p.y + halb });
const verschieben = (k: Kasten, d: Punkt): Kasten => ({ x0: k.x0 + d.x, y0: k.y0 + d.y, x1: k.x1 + d.x, y1: k.y1 + d.y });
const ueberlappen = (a: Kasten, b: Kasten) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
/** Punkt auf dem Kreis um den Ursprung bei Kurs `grad` (0 = Norden, im Uhrzeigersinn). */
const aufKreis = (grad: number, r: number): Punkt => {
  const rad = (grad * Math.PI) / 180;
  return { x: Math.sin(rad) * r, y: -Math.cos(rad) * r };
};

/**
 * Schrift mit Anker; `y` ist die Mitte der ersten Zeile. Mehrzeilig wächst sie nach unten, mit `hoch` nach oben
 * (Name über einem Punkt).
 */
function schrift(
  text: string,
  x: number,
  y: number,
  anker: Schrift['anker'],
  groesse = SCHRIFT,
  zeilen: string[] = [text],
  hoch = false,
): Schrift {
  const breite = Math.max(...zeilen.map((zeile) => breiteVon(zeile, groesse)));
  const extra = (zeilen.length - 1) * ZEILE_EM * groesse;
  const y1 = hoch ? y - extra : y;
  const x0 = anker === 'start' ? x : anker === 'end' ? x - breite : x - breite / 2;
  return { text, zeilen, x, y: y1, anker, kasten: { x0, y0: y1 - groesse * 0.6, x1: x0 + breite, y1: y1 + extra + groesse * 0.6 } };
}

/** Schrift neben einem Punkt in Richtung `u` (Einheitsvektor), Abstand `abstand`: Anker so, dass sie von ihm wegläuft. */
function schriftNeben(text: string, p: Punkt, u: Punkt, abstand: number, groesse = SCHRIFT, zeilen: string[] = [text]): Schrift {
  const x = p.x + u.x * abstand;
  const y = p.y + u.y * abstand;
  const anker: Schrift['anker'] = u.x > 0.38 ? 'start' : u.x < -0.38 ? 'end' : 'middle';
  // Senkrecht über bzw. unter dem Punkt: die halbe Schrifthöhe dazu, damit die Zeile frei steht
  const dy = anker === 'middle' ? Math.sign(u.y || 1) * groesse * 0.35 : 0;
  const hoch = anker === 'middle' ? u.y < 0 : u.y < -0.38;
  // Seitlich mehrzeilig: der Block mittig zur Höhe des Punkts
  const mittig = anker !== 'middle' && !hoch && u.y <= 0.38 ? ((zeilen.length - 1) * ZEILE_EM * groesse) / 2 : 0;
  return schrift(text, x, y + dy - mittig, anker, groesse, zeilen, hoch);
}

/**
 * Schrift quer neben einem Punkt am Ende des Wegs, zum Haus hin ausgerichtet: Bei waagerechtem Weg endet ein langer
 * Name („Waldbrunn (Westerwald)“) über dem Punkt und läuft nach innen, statt aus dem Rahmen.
 */
function schriftInnen(text: string, p: Punkt, quer: Punkt, abstand: number, v: Punkt, zeilen: string[] = [text]): Schrift {
  const x = p.x + quer.x * abstand;
  const y = p.y + quer.y * abstand + Math.sign(quer.y || 1) * SCHRIFT * 0.35;
  const hoch = quer.y < 0;
  if (v.x > 0.38) return schrift(text, x + 12, y, 'end', SCHRIFT, zeilen, hoch);
  if (v.x < -0.38) return schrift(text, x - 12, y, 'start', SCHRIFT, zeilen, hoch);
  return schrift(text, x, y, 'middle', SCHRIFT, zeilen, hoch);
}

/** Kleine Kästen entlang einer Strecke (für Schriften, die Linien meiden). */
function laengs(a: Punkt, b: Punkt, halb = 2, schritt = 5): Kasten[] {
  const laenge = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(1, Math.ceil(laenge / schritt));
  return Array.from({ length: n + 1 }, (_, i) => um({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n }, halb));
}

function huelle(kaesten: readonly Kasten[]): Kasten {
  return {
    x0: Math.min(...kaesten.map((k) => k.x0)),
    y0: Math.min(...kaesten.map((k) => k.y0)),
    x1: Math.max(...kaesten.map((k) => k.x1)),
    y1: Math.max(...kaesten.map((k) => k.y1)),
  };
}

/** Maßstab (km auf der Länge `radius`) für einen Abstand: 35 km, für nahe Orte 15 bzw. 5 km. */
export function pendelMassstab(km: number): number {
  const { stufen, maxKm } = PENDELWEG_SKALA;
  return stufen.find((stufe) => km / stufe >= PENDELWEG_MIN_ANTEIL) ?? stufen[stufen.length - 1] ?? maxKm;
}

/** Länge des gezeichneten Abstands in Einheiten: maßstäblich im Maßstab des Bilds, nie länger als `radius`. */
export function pendelLaenge(km: number, massstabKm = pendelMassstab(km)): number {
  const { radius } = PENDELWEG_SKALA;
  return radius * Math.min(1, Math.max(km / massstabKm, PENDELWEG_MIN_ANTEIL));
}

/**
 * Lage aller Teile: Haus im Ursprung, der Ort in echter Richtung (Kurs) und maßstäblich (pendelMassstab). Die Maßkette
 * liegt parallel zur Verbindung auf der Seite, die mehr Platz hat; dann wird alles im Rahmen mittig gesetzt, der
 * Nordpfeil und die Maßstabsleiste in freie Ecken.
 */
export function pendelLage(kursGrad: number, ort: string, sitz = 'Firmensitz', strasseKm = 0, luftlinieKm?: number): PendelLage {
  const km = luftlinieKm ?? strasseKm;
  const massstabKm = pendelMassstab(km);
  const v = aufKreis(kursGrad, 1);
  const r = pendelLaenge(km, massstabKm);
  const haus = { x: 0, y: 0 };
  const punkt = { x: v.x * r, y: v.y * r };
  const n = { x: -v.y, y: v.x };
  // Kette unter bzw. rechts von der Verbindung (lesbar von unten bzw. von rechts, DIN 406)
  const seite = n.y > 0 || (n.y === 0 && n.x > 0) ? 1 : -1;
  const versatz = { x: n.x * KETTE_ABSTAND * seite, y: n.y * KETTE_ABSTAND * seite };

  // Maßkette parallel zur Verbindung, Wert mittig daneben (gedreht wie die Verbindung)
  const kuerzung = Math.min(16, r / 5);
  const a = { x: v.x * kuerzung + versatz.x, y: v.y * kuerzung + versatz.y };
  const b = { x: punkt.x - v.x * kuerzung + versatz.x, y: punkt.y - v.y * kuerzung + versatz.y };
  const strich = { x: n.x * 6, y: n.y * 6 };
  // Straße in ganzen km; Luftlinie mit einer Stelle nach dem Komma wie das Maß „Luftlinie“ im Kopf (formatAirKm)
  const wertKm = luftlinieKm === undefined ? String(strasseKm) : luftlinieKm.toFixed(1);
  const wertText = `${wertKm.replace('.', ',')}${NBSP}km`;
  const wb = breiteVon(wertText);
  const wh = SCHRIFT * 1.2;
  // Wert gedreht wie die Verbindung, mittig an der Kette. Ist die Kette kürzer als der Wert (kurze Wege), steht er
  // waagerecht daneben, so weit weg, dass er weder die Kette noch ihre Endstriche berührt.
  const kurz = Math.hypot(b.x - a.x, b.y - a.y) < wb + 6;
  let winkel = kurz ? 0 : (Math.atan2(v.y, v.x) * 180) / Math.PI;
  if (winkel > 90) winkel -= 180;
  if (winkel <= -90) winkel += 180;
  const rad = (winkel * Math.PI) / 180;
  const kw = Math.abs(Math.cos(rad)) * wb + Math.abs(Math.sin(rad)) * wh;
  const kh = Math.abs(Math.sin(rad)) * wb + Math.abs(Math.cos(rad)) * wh;
  const wertAbstand = kurz ? 7 + (Math.abs(n.x) * kw + Math.abs(n.y) * kh) / 2 : WERT_ABSTAND;
  const mitte = { x: (a.x + b.x) / 2 + n.x * wertAbstand * seite, y: (a.y + b.y) / 2 + n.y * wertAbstand * seite };
  const wert = {
    text: wertText,
    zeilen: [wertText],
    x: mitte.x,
    y: mitte.y,
    anker: 'middle' as const,
    winkel,
    kasten: { x0: mitte.x - kw / 2, y0: mitte.y - kh / 2, x1: mitte.x + kw / 2, y1: mitte.y + kh / 2 },
  };
  // Die Kette als Reihe kleiner Kästen (ein Kasten um die schräge Kette sperrte eine viel zu große Fläche)
  const ketteKaesten = laengs(a, b, 6, 4);

  // Verbindung vom Rand des Hauses bis an den Ring des Punkts: nie Schrift darauf
  const linieA = { x: v.x * 12, y: v.y * 12 };
  const linieB = { x: punkt.x - v.x * 10, y: punkt.y - v.y * 10 };
  const linienKaesten = laengs(linieA, linieB, 5);
  const fest = [um(haus, 12), um(punkt, 11), wert.kasten, ...ketteKaesten];
  const hart = [...fest, ...linienKaesten];
  /** Acht Richtungen (Norden, Nordosten …) für weitere Lagen der Namen. */
  const acht = Array.from({ length: 8 }, (_, i) => aufKreis(i * 45, 1));

  // Ortsname: hinter dem Punkt (in Wegrichtung), sonst quer zum Weg auf der Seite ohne Kette, sonst gegenüber
  const ohneKette = { x: -n.x * seite, y: -n.y * seite };
  const mitKette = { x: n.x * seite, y: n.y * seite };
  // Erst einzeilig, dann (lange Namen) zweizeilig
  const ortZeilen = [[ort], ...(breiteVon(ort) > 110 && zweiZeilen(ort) ? [zweiZeilen(ort)!] : [])];
  const ortKandidaten = ortZeilen.flatMap((zeilen) => [
    schriftNeben(ort, punkt, v, 18, SCHRIFT, zeilen),
    schriftNeben(ort, punkt, ohneKette, 18, SCHRIFT, zeilen),
    schriftInnen(ort, punkt, ohneKette, 18, v, zeilen),
    schriftNeben(ort, punkt, mitKette, 30, SCHRIFT, zeilen),
    schriftInnen(ort, punkt, mitKette, 30, v, zeilen),
    ...acht.map((u) => schriftNeben(ort, punkt, u, 18, SCHRIFT, zeilen)),
  ]);
  // Hausname: hinter dem Haus (gegen den Weg), sonst quer
  const hausKandidaten = [
    schriftNeben(sitz, haus, { x: -v.x, y: -v.y }, 18),
    schriftNeben(sitz, haus, ohneKette, 20),
    schriftNeben(sitz, haus, mitKette, 20),
    schriftNeben(sitz, haus, { x: -v.x * 0.7 + ohneKette.x * 0.7, y: -v.y * 0.7 + ohneKette.y * 0.7 }, 18),
    schriftNeben(sitz, haus, { x: -v.x * 0.7 + mitKette.x * 0.7, y: -v.y * 0.7 + mitKette.y * 0.7 }, 18),
    // Unter bzw. über dem Haus, zum Weg hin ausgerichtet: braucht keinen Platz hinter dem Haus
    ...[26, -26].map((dy) => schrift(sitz, haus.x - Math.sign(v.x || 1) * 10, haus.y + dy, v.x >= 0 ? 'start' : 'end')),
    // Sonst ringsum, erst nah, dann weiter
    ...[18, 28].flatMap((abstand) => acht.map((u) => schriftNeben(sitz, haus, u, abstand))),
  ];
  // Platz für Nordpfeil und Maßstabsleiste: das Bild darf nicht ganz bis an den Rahmen reichen
  const passtInsBild = (kaesten: readonly Kasten[]) => {
    const h = huelle(kaesten);
    return h.x1 - h.x0 <= W - 2 * LUFT && h.y1 - h.y0 <= H - 2 * LUFT;
  };
  let ortSchrift = ortKandidaten[0];
  let hausSchrift = hausKandidaten[0];
  suche: for (const o of ortKandidaten) {
    for (const h of hausKandidaten) {
      if (hart.some((k) => ueberlappen(k, o.kasten) || ueberlappen(k, h.kasten))) continue;
      if (ueberlappen(o.kasten, h.kasten)) continue;
      if (!passtInsBild([...hart, o.kasten, h.kasten])) continue;
      ortSchrift = o;
      hausSchrift = h;
      break suche;
    }
  }

  const kaesten = [...fest, ortSchrift.kasten, hausSchrift.kasten];
  const alles = huelle([...kaesten, ...linienKaesten]);
  const LUFT_SCHRIFT = 3;
  const freiUm = (k: Kasten): Freistellung => ({
    x: (k.x0 + k.x1) / 2,
    y: (k.y0 + k.y1) / 2,
    breite: k.x1 - k.x0 + 2 * LUFT_SCHRIFT,
    hoehe: k.y1 - k.y0 + 2 * LUFT_SCHRIFT,
    winkel: 0,
  });
  const frei: Freistellung[] = [
    freiUm(ortSchrift.kasten),
    freiUm(hausSchrift.kasten),
    // Der Wert gedreht wie seine Schrift
    { x: wert.x, y: wert.y, breite: wb + 2 * LUFT_SCHRIFT, hoehe: wh + 2 * LUFT_SCHRIFT, winkel },
  ];
  const d = { x: (W - (alles.x1 - alles.x0)) / 2 - alles.x0, y: (H - (alles.y1 - alles.y0)) / 2 - alles.y0 };
  const belegt = [...kaesten, ...linienKaesten].map((k) => verschieben(k, d));

  // Maßstabsleiste: 0, a, 2a km; Breite des Balkens im Maßstab des Bilds
  const teilung = LEISTE_TEILUNG[massstabKm] ?? 5;
  const einheiten = round1((PENDELWEG_SKALA.radius * teilung) / massstabKm);
  const etikett = luftlinieKm === undefined ? 'Straße' : 'Luftlinie';
  // Balken, halbe Breite der ersten und letzten Zahl, „km“ dahinter
  const leisteBreite = 2 * einheiten + LEISTE.rand + 32;
  const leisteEcken: Kasten[] = [
    { x0: LUFT, y0: H - LEISTE.hoehe - LUFT, x1: LUFT + leisteBreite, y1: H - LUFT },
    { x0: W - leisteBreite - LUFT, y0: H - LEISTE.hoehe - LUFT, x1: W - LUFT, y1: H - LUFT },
    { x0: LUFT, y0: LUFT, x1: LUFT + leisteBreite, y1: LUFT + LEISTE.hoehe },
    { x0: W - leisteBreite - LUFT, y0: LUFT, x1: W - LUFT, y1: LUFT + LEISTE.hoehe },
  ];
  const leisteKasten = leisteEcken.find((ecke) => !belegt.some((k) => ueberlappen(k, ecke))) ?? leisteEcken[0];

  // Nordpfeil in die erste freie Ecke (nicht auf der Maßstabsleiste)
  const ecken: Kasten[] = [
    { x0: W - NORD.breite - LUFT, y0: LUFT, x1: W - LUFT, y1: LUFT + NORD.hoehe },
    { x0: LUFT, y0: LUFT, x1: LUFT + NORD.breite, y1: LUFT + NORD.hoehe },
    { x0: W - NORD.breite - LUFT, y0: H - NORD.hoehe - LUFT, x1: W - LUFT, y1: H - LUFT },
    { x0: LUFT, y0: H - NORD.hoehe - LUFT, x1: LUFT + NORD.breite, y1: H - LUFT },
  ];
  const nordKasten = ecken.find((ecke) => ![...belegt, leisteKasten].some((k) => ueberlappen(k, ecke))) ?? ecken[0];

  const p = (q: Punkt): Punkt => ({ x: round1(q.x + d.x), y: round1(q.y + d.y) });
  const s = <T extends Schrift>(q: T): T => ({ ...q, x: round1(q.x + d.x), y: round1(q.y + d.y), kasten: verschieben(q.kasten, d) });
  return {
    haus: p(haus),
    ort: p(punkt),
    ortSchrift: s(ortSchrift),
    hausSchrift: s(hausSchrift),
    kette: { a: p(a), b: p(b), strich },
    wert: s(wert),
    linie: { a: p(linieA), b: p(linieB) },
    leiste: {
      x: leisteKasten.x0 + LEISTE.rand,
      y: leisteKasten.y0 + 6,
      teilung,
      einheiten,
      werte: [0, teilung, 2 * teilung],
      etikett,
      kasten: leisteKasten,
    },
    massstabKm,
    nord: { x: (nordKasten.x0 + nordKasten.x1) / 2, y: nordKasten.y0 },
    kaesten: [...kaesten.map((k) => verschieben(k, d)), leisteKasten],
    frei: frei.map((f) => ({ ...f, x: round1(f.x + d.x), y: round1(f.y + d.y), breite: round1(f.breite), hoehe: round1(f.hoehe), winkel: round1(f.winkel) })),
    hoehe: H,
  };
}

/**
 * Lageplan der Ortsseite (E-028, seit E-029 statt des Pendelwegs mit Leitungspaar und Zirkel): Firmensitz (Giebel
 * 45°) und Ort (Punkt mit Ring) in echter Himmelsrichtung (Nordpfeil) und maßstäblich (Maßstabsleiste; Regelfall
 * 35 km auf derselben Länge wie auf jeder Ortsseite, nahe Orte in der nächsten Stufe), verbunden durch eine feine
 * Linie, daneben die Maßkette nach DIN 406 (45°-Begrenzungsstriche) mit der Messung. Rohr nur, wo Wasser fließt:
 * Vorlauf und Rücklauf gibt es hier nicht mehr. Beim Laden zeichnen sich Verbindung und Maßkette einmal (Register
 * `pendel-zeichnen`); reduziert und ohne Skript stehen sie. Server-Komponente, Farben nur über Rollen (auf Navy
 * Creme); Schrift mit Halo in der Fläche. Die Props bleiben stabil; `luftlinieKm` ist neu und optional.
 */
export function Pendelweg({ ort, kursGrad, strasseKm, luftlinieKm, sitz = 'Firmensitz', titel, className }: PendelwegProps) {
  const lage = pendelLage(kursGrad, ort, sitz, strasseKm, luftlinieKm);
  const { haus, ort: punkt, kette, wert, nord, linie, leiste } = lage;
  // Eine Zeichnung je Seite; die Id hängt am Ort, damit sie ohne Zustand eindeutig bleibt
  const maskeId = `pendelweg-frei-${[...ort].map((c) => (/[a-z0-9]/i.test(c) ? c : '-')).join('')}`;
  const strecke = (a: Punkt, b: Punkt) => `M${round1(a.x)} ${round1(a.y)}L${round1(b.x)} ${round1(b.y)}`;
  const versetzt = (q: Punkt, s: Punkt, f: number) => ({ x: q.x + s.x * f, y: q.y + s.y * f });
  // 45°-Begrenzungsstrich (DIN 406) an jedem Ende der Kette, zwischen Laufrichtung und Normale
  const v = { x: kette.b.x - kette.a.x, y: kette.b.y - kette.a.y };
  const l = Math.hypot(v.x, v.y) || 1;
  const u = { x: v.x / l, y: v.y / l };
  const schraeg = { x: (u.x + kette.strich.x / 6) * 0.7071 * 6, y: (u.y + kette.strich.y / 6) * 0.7071 * 6 };
  const begrenzung = (q: Punkt) => strecke(versetzt(q, schraeg, -1), versetzt(q, schraeg, 1));
  const teil = leiste.einheiten;

  return (
    <svg
      className={cn(styles.svg, styles.pendelweg, className)}
      viewBox={`0 0 ${W} ${lage.hoehe}`}
      focusable="false"
      data-zeichnung="lageplan"
      data-massstab-km={lage.massstabKm}
      {...(titel ? { role: 'img', 'aria-label': titel } : { 'aria-hidden': true })}
    >
      {/* Freistellung: Verbindung und Kette setzen unter jeder Schrift aus (keine Linie durch einen Namen oder Wert) */}
      <mask id={maskeId} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={lage.hoehe}>
        <rect width={W} height={lage.hoehe} fill="white" />
        {lage.frei.map((f, i) => (
          <rect
            key={i}
            x={round1(f.x - f.breite / 2)}
            y={round1(f.y - f.hoehe / 2)}
            width={f.breite}
            height={f.hoehe}
            rx={3}
            transform={f.winkel ? `rotate(${f.winkel} ${f.x} ${f.y})` : undefined}
            fill="black"
          />
        ))}
      </mask>

      <g mask={`url(#${maskeId})`}>
        {/* Verbindung Firmensitz → Ort (fein), zeichnet sich einmal */}
        <path
          d={strecke(linie.a, linie.b)}
          pathLength={1}
          strokeWidth={FEIN}
          className={cn(styles.pendelLinie, styles.pendelZug, styles.pendelVerbindung)}
          data-motion="pendel-zeichnen"
          data-verbindung=""
        />
        {/* Maßkette nach DIN 406 parallel zur Verbindung: Maßlinie mit 45°-Begrenzungsstrichen */}
        <path
          d={strecke(kette.a, kette.b)}
          pathLength={1}
          strokeWidth={FEIN}
          className={cn(styles.pendelLinie, styles.pendelZug, styles.pendelKette)}
          data-motion="pendel-zeichnen"
        />
        <path d={`${begrenzung(kette.a)}${begrenzung(kette.b)}`} strokeWidth={FEIN} className={styles.pendelLinie} data-begrenzung="" />
      </g>
      <text
        x={wert.x}
        y={wert.y}
        transform={`rotate(${round1(wert.winkel)} ${wert.x} ${wert.y})`}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={SCHRIFT}
        className={cn(styles.pendelSchrift, styles.pendelWert, styles.pendelHalo)}
      >
        {wert.text}
      </text>

      {/* Nordpfeil: Die Richtung ist echt */}
      <path
        className={styles.pendelLinie}
        strokeWidth={KONTUR}
        d={`M${nord.x} ${nord.y + 24}V${nord.y + 2}M${nord.x - 5} ${nord.y + 7}L${nord.x} ${nord.y + 2}L${nord.x + 5} ${nord.y + 7}`}
        data-nordpfeil=""
      />
      <text x={nord.x} y={nord.y + 34} textAnchor="middle" dominantBaseline="central" fontSize={12} className={styles.pendelSchrift}>
        N
      </text>

      {/* Maßstabsleiste: zwei Felder (das erste voll), Teilstriche, Werte in Martian Mono, darunter das Etikett */}
      <g data-massstabsleiste="" data-teilung-km={leiste.teilung}>
        <rect x={leiste.x} y={leiste.y} width={teil} height={LEISTE.balken} strokeWidth={FEIN} className={cn(styles.pendelLinie, styles.pendelVoll)} />
        <rect x={round1(leiste.x + teil)} y={leiste.y} width={teil} height={LEISTE.balken} strokeWidth={FEIN} className={cn(styles.pendelLinie, styles.pendelPunktRing)} />
        <g className={styles.pendelSkala} fontSize={12} dominantBaseline="central" textAnchor="middle">
          {leiste.werte.map((km, i) => (
            <text key={km} x={round1(leiste.x + i * teil)} y={leiste.y + LEISTE.balken + 10}>
              {km}
            </text>
          ))}
          {/* Einheit hinter der letzten Zahl (die Zahlen stehen mittig unter ihren Teilstrichen) */}
          <text x={round1(leiste.x + 2 * teil + 4 + String(leiste.werte[2]).length * 3.6)} y={leiste.y + LEISTE.balken + 10} textAnchor="start">
            km
          </text>
          <text x={leiste.x} y={leiste.y + LEISTE.balken + 24} textAnchor="start" className={styles.pendelEtikett}>
            {leiste.etikett.toLocaleUpperCase('de-DE')}
          </text>
        </g>
      </g>

      {/* Ort: Punkt mit Ring */}
      <circle cx={punkt.x} cy={punkt.y} r={9} className={cn(styles.pendelLinie, styles.pendelPunktRing)} strokeWidth={KONTUR} />
      <circle cx={punkt.x} cy={punkt.y} r={4.5} className={styles.voll} />

      {/* Haus des Firmensitzes: Giebel 45°, Kontur ohne Wärmefläche */}
      <path
        d={HAUS}
        transform={`translate(${haus.x} ${haus.y}) scale(${HAUS_MASS})`}
        className={styles.pendelHaus}
        strokeWidth={KONTUR / HAUS_MASS}
      />

      <g className={cn(styles.pendelSchrift, styles.pendelHalo)} fontSize={SCHRIFT} dominantBaseline="central">
        <text x={lage.ortSchrift.x} y={lage.ortSchrift.y} textAnchor={lage.ortSchrift.anker} className={styles.pendelOrt}>
          {lage.ortSchrift.zeilen.length === 1
            ? ort
            : lage.ortSchrift.zeilen.map((zeile, i) => (
                <tspan key={zeile} x={lage.ortSchrift.x} dy={i === 0 ? 0 : `${ZEILE_EM}em`}>
                  {zeile}
                </tspan>
              ))}
        </text>
        <text x={lage.hausSchrift.x} y={lage.hausSchrift.y} textAnchor={lage.hausSchrift.anker}>
          {sitz}
        </text>
      </g>
    </svg>
  );
}
