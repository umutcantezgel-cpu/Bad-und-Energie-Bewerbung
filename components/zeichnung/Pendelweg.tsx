import { octilinear, pendelPaths } from '@/components/maps/graphic';
import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface PendelwegProps {
  /** Name des Orts am Punkt, z. B. „Herborn“. */
  ort: string;
  /** Kurs vom Firmensitz zum Ort in Grad (0 = Norden, im Uhrzeigersinn; lib/places/derive.ts bearingDeg). */
  kursGrad: number;
  /** Straßenstrecke in ganzen km (Messung): Länge des Wegs auf der Skala und Wert an der Maßkette. */
  strasseKm: number;
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

/** Skala: 35 km (Gebietsregel, Fakt radius35) = Radius des äußeren Bogens; dazu 15 und 25 km gepunktet. */
export const PENDELWEG_SKALA = Object.freeze({ maxKm: 35, radius: 158, stufen: [15, 25, 35] as readonly number[] });
/** Halbe Öffnung der Zirkelbögen um den Kurs. */
const BOGEN_GRAD = 30;
/**
 * Kürzester gezeichneter Weg als Anteil der Skala: Haus, Punkt und Paar brauchen Platz. Steindorf (2 km) und Aßlar
 * (8 km) stehen darum gleich weit vom Haus, beide innerhalb des 15-km-Bogens; die Zahl an der Kette ist die Messung.
 */
export const PENDELWEG_MIN_ANTEIL = 0.25;

/** Giebel 45° wie das Haus in der Mitte des Plans (RadiusGraphic CENTER_HOUSE, K-010), hier 1,25-fach. */
const HAUS = 'M-8 7V-1L0 -9L8 -1V7Z';
const HAUS_MASS = 1.25;
const SCHRIFT = 13;
const SCHRIFT_SKALA = 12;
/** Mittlere Zeichenbreite in em (Atkinson 700 bzw. Martian Mono 75 %), großzügig für die Lage der Schrift. */
const ZEICHEN_EM = 0.6;
/** Abstand der Maßkette vom geraden Weg und ihres Werts von der Kette. */
const KETTE_ABSTAND = 16;
const WERT_ABSTAND = 11;
const STRICH = 2;
const NORD = Object.freeze({ breite: 14, hoehe: 40 });
/** Der Zirkelschenkel beginnt außerhalb des Hauses. */
const HAUS_FREI = 14;

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

export interface Bogen {
  km: number;
  r: number;
  d: string;
}

export interface PendelLage {
  haus: Punkt;
  ort: Punkt;
  ortSchrift: Schrift;
  hausSchrift: Schrift;
  kette: { a: Punkt; b: Punkt; strich: Punkt };
  wert: Schrift & { winkel: number };
  /** Zirkelbögen 15, 25, 35 km um das Haus, je ±30° um den Kurs. */
  boegen: Bogen[];
  /** Zirkelschenkel vom Haus bis an das Ende des 35-km-Bogens, mit Teilstrich. */
  schenkel: { a: Punkt; b: Punkt; strich: Punkt };
  /** Werte der Bögen am Schenkel: „15“, „25“, „35 km“. */
  skala: Schrift[];
  nord: Punkt;
  /** Belegte Flächen (Haus, Punkt, Schriften, Kette, Wert); liegen im Rahmen und überdecken einander nicht. */
  kaesten: Kasten[];
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

/** Länge des gezeichneten Wegs in Einheiten: maßstäblich auf der 35-km-Skala, mindestens PENDELWEG_MIN_ANTEIL. */
export function pendelLaenge(strasseKm: number): number {
  const { maxKm, radius } = PENDELWEG_SKALA;
  return radius * Math.min(1, Math.max(strasseKm / maxKm, PENDELWEG_MIN_ANTEIL));
}

/**
 * Lage aller Teile: Haus im Ursprung, der Weg in echter Richtung (Kurs) und maßstäblich auf der Skala bis 35 km
 * (der äußere Zirkelbogen). Die Maßkette liegt auf der Seite ohne den Knick der Leitung, der Zirkelschenkel mit den
 * Werten 15, 25, 35 km auf der anderen; dann wird alles im Rahmen mittig gesetzt, der Nordpfeil in eine freie Ecke.
 */
export function pendelLage(kursGrad: number, ort: string, sitz = 'Firmensitz', strasseKm = 0): PendelLage {
  const { radius, maxKm, stufen } = PENDELWEG_SKALA;
  const v = aufKreis(kursGrad, 1);
  const r = pendelLaenge(strasseKm);
  const haus = { x: 0, y: 0 };
  const punkt = { x: v.x * r, y: v.y * r };
  const n = { x: -v.y, y: v.x };
  const knick = octilinear(haus, punkt)[1] ?? punkt;
  const knickSeite = knick.x * n.x + knick.y * n.y;
  // Ohne Knick (Weg genau im 45°-Raster): Kette unter bzw. rechts vom Weg
  const seite = Math.abs(knickSeite) > 0.5 ? -Math.sign(knickSeite) : n.y > 0 || (n.y === 0 && n.x > 0) ? 1 : -1;
  const versatz = { x: n.x * KETTE_ABSTAND * seite, y: n.y * KETTE_ABSTAND * seite };

  // Maßkette parallel zum geraden Weg, Wert mittig daneben (gedreht wie der Weg)
  const kuerzung = Math.min(16, r / 5);
  const a = { x: v.x * kuerzung + versatz.x, y: v.y * kuerzung + versatz.y };
  const b = { x: punkt.x - v.x * kuerzung + versatz.x, y: punkt.y - v.y * kuerzung + versatz.y };
  const strich = { x: n.x * 6, y: n.y * 6 };
  let winkel = (Math.atan2(v.y, v.x) * 180) / Math.PI;
  if (winkel > 90) winkel -= 180;
  if (winkel <= -90) winkel += 180;
  const wertText = `${strasseKm}${NBSP}km`;
  const mitte = { x: (a.x + b.x) / 2 + n.x * WERT_ABSTAND * seite, y: (a.y + b.y) / 2 + n.y * WERT_ABSTAND * seite };
  const rad = (winkel * Math.PI) / 180;
  const wb = breiteVon(wertText);
  const wh = SCHRIFT * 1.2;
  const kw = Math.abs(Math.cos(rad)) * wb + Math.abs(Math.sin(rad)) * wh;
  const kh = Math.abs(Math.sin(rad)) * wb + Math.abs(Math.cos(rad)) * wh;
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

  // Zirkel: Bögen ±30° um den Kurs, der Schenkel auf der Seite des Knicks bis an das Ende des 35-km-Bogens
  const schenkelGrad = kursGrad - seite * BOGEN_GRAD;
  const boegen: Bogen[] = stufen.map((km) => {
    const rb = (radius * km) / maxKm;
    const von = aufKreis(kursGrad - BOGEN_GRAD, rb);
    const bis = aufKreis(kursGrad + BOGEN_GRAD, rb);
    return { km, r: round1(rb), d: `M${round1(von.x)} ${round1(von.y)}A${round1(rb)} ${round1(rb)} 0 0 1 ${round1(bis.x)} ${round1(bis.y)}` };
  });
  const u = aufKreis(schenkelGrad, 1);
  const schenkelA = { x: u.x * HAUS_FREI, y: u.y * HAUS_FREI };
  const schenkelB = { x: u.x * radius, y: u.y * radius };
  const quer = { x: -u.y, y: u.x };
  // Werte der Stufen außen neben dem Schenkel (vom Weg weg)
  const aussen = { x: -n.x * seite, y: -n.y * seite };
  const skala = stufen.map((km) => {
    const p = aufKreis(schenkelGrad, (radius * km) / maxKm);
    return km === maxKm
      ? schriftNeben(`${km}${NBSP}km`, p, u, 10, SCHRIFT_SKALA)
      : schriftNeben(`${km}`, p, aussen, 9, SCHRIFT_SKALA);
  });

  // Leitung und Bögen als Hindernisse für die beiden Namen
  const leitung = octilinear(haus, punkt);
  const linien = [
    ...leitung.slice(1).flatMap((q, i) => laengs(leitung[i], q, 5)),
    ...laengs(schenkelA, schenkelB, 2),
    ...stufen.flatMap((km) => {
      const rb = (radius * km) / maxKm;
      return Array.from({ length: 13 }, (_, i) => um(aufKreis(kursGrad - BOGEN_GRAD + i * 5, rb), 2));
    }),
  ];
  const fest = [um(haus, 12), um(punkt, 11), wert.kasten, ...ketteKaesten, ...skala.map((s) => s.kasten)];

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
  ];
  const passtInsBild = (kaesten: readonly Kasten[]) => {
    const h = huelle(kaesten);
    return h.x1 - h.x0 <= W - 2 * LUFT && h.y1 - h.y0 <= H - 2 * LUFT;
  };
  let ortSchrift = ortKandidaten[0];
  let hausSchrift = hausKandidaten[0];
  suche: for (const weich of [true, false]) {
    for (const o of ortKandidaten) {
      for (const h of hausKandidaten) {
        const hindernisse = weich ? [...fest, ...linien] : fest;
        if (hindernisse.some((k) => ueberlappen(k, o.kasten) || ueberlappen(k, h.kasten))) continue;
        if (ueberlappen(o.kasten, h.kasten)) continue;
        if (!passtInsBild([...fest, ...linien, o.kasten, h.kasten])) continue;
        ortSchrift = o;
        hausSchrift = h;
        break suche;
      }
    }
  }

  const kaesten = [...fest, ortSchrift.kasten, hausSchrift.kasten];
  const alles = huelle([...kaesten, ...linien]);
  const d = { x: (W - (alles.x1 - alles.x0)) / 2 - alles.x0, y: (H - (alles.y1 - alles.y0)) / 2 - alles.y0 };
  const belegt = [...kaesten, ...linien].map((k) => verschieben(k, d));

  // Nordpfeil in die erste freie Ecke
  const ecken: Kasten[] = [
    { x0: W - NORD.breite - LUFT, y0: LUFT, x1: W - LUFT, y1: LUFT + NORD.hoehe },
    { x0: LUFT, y0: LUFT, x1: LUFT + NORD.breite, y1: LUFT + NORD.hoehe },
    { x0: W - NORD.breite - LUFT, y0: H - NORD.hoehe - LUFT, x1: W - LUFT, y1: H - LUFT },
    { x0: LUFT, y0: H - NORD.hoehe - LUFT, x1: LUFT + NORD.breite, y1: H - LUFT },
  ];
  const nordKasten = ecken.find((ecke) => !belegt.some((k) => ueberlappen(k, ecke))) ?? ecken[0];

  const p = (q: Punkt): Punkt => ({ x: round1(q.x + d.x), y: round1(q.y + d.y) });
  const s = <T extends Schrift>(q: T): T => ({ ...q, x: round1(q.x + d.x), y: round1(q.y + d.y), kasten: verschieben(q.kasten, d) });
  const bogen = (bg: Bogen): Bogen => {
    const [von, bis] = [aufKreis(kursGrad - BOGEN_GRAD, bg.r), aufKreis(kursGrad + BOGEN_GRAD, bg.r)].map(p);
    return { ...bg, d: `M${von.x} ${von.y}A${bg.r} ${bg.r} 0 0 1 ${bis.x} ${bis.y}` };
  };
  return {
    haus: p(haus),
    ort: p(punkt),
    ortSchrift: s(ortSchrift),
    hausSchrift: s(hausSchrift),
    kette: { a: p(a), b: p(b), strich },
    wert: s(wert),
    boegen: boegen.map(bogen),
    schenkel: { a: p(schenkelA), b: p(schenkelB), strich: { x: round1(quer.x * 5), y: round1(quer.y * 5) } },
    skala: skala.map(s),
    nord: { x: (nordKasten.x0 + nordKasten.x1) / 2, y: nordKasten.y0 },
    kaesten: kaesten.map((k) => verschieben(k, d)),
    hoehe: H,
  };
}

/**
 * Pendelweg (Ortsseiten, E-028): der tägliche Weg als Leitungspaar zwischen dem Haus des Firmensitzes und dem Ort,
 * in echter Himmelsrichtung (Nordpfeil) und maßstäblich auf der Skala bis 35 km: Der Zirkel des Leitmotivs (E-027)
 * schlägt um das Haus die Bögen 15 und 25 km (gepunktet) und 35 km, die Grenze des Einsatzgebiets. So liegt Steindorf
 * dicht am Haus und Villmar kurz vor dem äußeren Bogen. Vorlauf rot vom Firmensitz zum Ort, Rücklauf blau zurück, im
 * 45°-Raster wie auf dem Plan (components/maps/graphic.ts pendelPaths), dazu die Maßkette der Straßenstrecke. Beim
 * Laden zeichnet sich das Paar einmal (Register `pendel-zeichnen`); reduziert und ohne Skript steht es vollständig.
 * Server-Komponente, Farben nur über Rollen (auf Navy: Creme, Rot hell, Blau hell); Schrift mit Halo in der Fläche.
 */
export function Pendelweg({ ort, kursGrad, strasseKm, sitz = 'Firmensitz', titel, className }: PendelwegProps) {
  const lage = pendelLage(kursGrad, ort, sitz, strasseKm);
  const { haus, ort: punkt, kette, wert, nord, schenkel } = lage;
  const paar = pendelPaths(haus, punkt);
  const linie = (a: Punkt, b: Punkt) => `M${round1(a.x)} ${round1(a.y)}L${round1(b.x)} ${round1(b.y)}`;
  const versetzt = (q: Punkt, s: Punkt, f: number) => ({ x: q.x + s.x * f, y: q.y + s.y * f });

  return (
    <svg
      className={cn(styles.svg, styles.pendelweg, className)}
      viewBox={`0 0 ${W} ${lage.hoehe}`}
      focusable="false"
      data-zeichnung="pendelweg"
      {...(titel ? { role: 'img', 'aria-label': titel } : { 'aria-hidden': true })}
    >
      {/* Zirkel: Bögen 15 und 25 km gepunktet, 35 km (Grenze des Einsatzgebiets) fest, Schenkel mit Teilstrich */}
      {lage.boegen.map((bogen) => (
        <path
          key={bogen.km}
          d={bogen.d}
          strokeWidth={STRICH}
          className={cn(styles.strich, bogen.km === PENDELWEG_SKALA.maxKm ? styles.pendelGrenze : styles.pendelStufe)}
          data-bogen={bogen.km}
        />
      ))}
      <path
        className={cn(styles.strich, styles.pendelSchenkel)}
        strokeWidth={STRICH / 2}
        d={`${linie(schenkel.a, schenkel.b)}${linie(versetzt(schenkel.b, schenkel.strich, -1), versetzt(schenkel.b, schenkel.strich, 1))}`}
      />
      <g className={styles.pendelSkala} fontSize={12} dominantBaseline="central">
        {lage.skala.map((wert) => (
          <text key={wert.text} x={wert.x} y={wert.y} textAnchor={wert.anker}>
            {wert.text}
          </text>
        ))}
      </g>

      {/* Nordpfeil: Die Richtung ist echt */}
      <path
        className={cn(styles.strich, styles.linieLeise)}
        strokeWidth={STRICH}
        d={`M${nord.x} ${nord.y + 24}V${nord.y + 2}M${nord.x - 5} ${nord.y + 7}L${nord.x} ${nord.y + 2}L${nord.x + 5} ${nord.y + 7}`}
      />
      <text x={nord.x} y={nord.y + 34} textAnchor="middle" dominantBaseline="central" fontSize={12} className={styles.pendelSchrift}>
        N
      </text>

      {/* Maßkette der Straßenstrecke, parallel zum geraden Weg */}
      <path
        className={cn(styles.strich, styles.linie)}
        strokeWidth={STRICH}
        d={`${linie(kette.a, kette.b)}${linie(versetzt(kette.a, kette.strich, -1), versetzt(kette.a, kette.strich, 1))}${linie(versetzt(kette.b, kette.strich, -1), versetzt(kette.b, kette.strich, 1))}`}
      />
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

      {/* Leitungspaar: Vorlauf rot hin, Rücklauf blau zurück (zeichnet sich einmal) */}
      {paar ? (
        <g>
          <path
            d={paar.vorlauf}
            pathLength={1}
            strokeWidth={STRICH}
            className={cn(styles.strich, styles.vorlauf, styles.pendelZug, styles.pendelVorlauf)}
            data-motion="pendel-zeichnen"
          />
          <path
            d={paar.ruecklauf}
            pathLength={1}
            strokeWidth={STRICH}
            className={cn(styles.strich, styles.ruecklauf, styles.pendelZug, styles.pendelRuecklauf)}
            data-motion="pendel-zeichnen"
          />
        </g>
      ) : null}

      {/* Ort: Punkt mit Ring */}
      <circle cx={punkt.x} cy={punkt.y} r={9} className={cn(styles.strich, styles.linie, styles.pendelPunktRing)} strokeWidth={STRICH} />
      <circle cx={punkt.x} cy={punkt.y} r={4.5} className={styles.voll} />

      {/* Haus des Firmensitzes */}
      <path
        d={HAUS}
        transform={`translate(${haus.x} ${haus.y}) scale(${HAUS_MASS})`}
        className={styles.pendelHaus}
        strokeWidth={STRICH / HAUS_MASS}
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
