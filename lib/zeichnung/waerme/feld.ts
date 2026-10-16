/**
 * Raumluftmodell des Wärmefelds (E-031, KERN K-010, Prüfrunde 4): halbempirisch statt gelöst. Das Temperaturfeld im
 * Rauminneren setzt sich aus belegten Bausteinen der Raumluftströmung zusammen; jeder Baustein ist eine geschlossene
 * Formel, deren Form aus der Literatur stammt und deren Größen in lib/zeichnung/waerme/eingabe.ts stehen (Quellen dort,
 * Schätzwerte als Schätzwerte gekennzeichnet). Reiner Rechenkern ohne Bezug zur Szene; das Skript
 * scripts/zeichnung/waermefeld.ts schreibt das Ergebnis nach lib/zeichnung/szenen/waermefeld.ts.
 *
 * Temperaturen in K über der Außentemperatur (T); gezeichnet wird θ = T / spanne (0 außen, 1 Vorlauf). y zeigt nach
 * unten, z = Höhe über dem Boden, beides in Einheiten der Szene (1 Einheit = 10 mm).
 *
 * Bausteine (T = c + Schichtung + Außenwände + Heizfläche; c stellt das Raummittel ein):
 * 1. Schichtung (Filling Box, Baines & Turner 1969): Eine Auftriebsfahne in einem geschlossenen Raum legt ihre warme
 *    Luft unter der Decke ab; die Raumluft außerhalb der Fahne ist stabil geschichtet, ihre Isothermen liegen waagerecht
 *    (waagerechte Dichteunterschiede gleichen Schwereströmungen sofort aus). Hier, nur von der Höhe abhängig: ein
 *    senkrechter Gradient im Kern, eine glatte Stufe zur warmen Schicht unter der Decke und eine zum kühlen Boden
 *    (Kaltluftsee).
 * 2. Auftriebsfahne über dem Heizkörper (Morton, Taylor & Turner 1956; Turner 1973, Kap. 6): Die Halbbreite wächst
 *    linear mit der Höhe über einem virtuellen Ursprung, b = β·ζ; die Übertemperatur auf der Achse fällt bei der
 *    ebenen Fahne (Heizkörper als Linienquelle) wie 1/ζ. Seitlich eine Glocke (1 + u²/2)⁻² (wie die Gaußglocke um
 *    die Achse, mit langsamer auslaufendem Rand, ohne exp); von vorn gesehen reicht sie über die Baulänge. Auf und neben
 *    dem Heizkörper die Luft seiner Grenzschicht (unten Raumluft, oben Vorlauf); unter ihm keine (die erwärmte Luft
 *    steigt, Prüfrunde 1 B1-2).
 * 3. Kalte Außenwand: dünne Fallströmung (Kaltluftabfall, Heiselberg 1994) mit der Oberflächentemperatur der Wand an der
 *    Wand (Wärmeübergangswiderstand innen R_si, DIN EN ISO 6946), nach unten dicker; am Fuß der Wand breitet sich die
 *    kalte Luft als Kaltluftsee über den Boden aus.
 * 4. Fußbodenheizung: schwache Schichtung, am Boden etwas wärmer, nur an der Außenwand kühler.
 *
 * Strömung (nur für die Prüfung der Aussagen im Text): die Kinematik der Filling Box als Stromfunktion – die Fahne
 * saugt über ihre Höhe Raumluft an (Volumenstrom ∝ Höhe, ebene Fahne), die Luft außerhalb sinkt über die ganze Breite
 * gleichmäßig, unter der Decke strömt sie von der Fahne weg, am Boden zu ihr hin.
 *
 * Ankunft (Reihenfolge der Bänder): erst steigt die Fahne (Geschwindigkeit der ebenen Fahne unabhängig von der Höhe,
 * Turner 1973), dann sinkt die erste Front der Deckenschicht, dz/dt = −Q(z)/W (Baines & Turner 1969); mit Q ∝ ζ ist
 * die Zeit bis zur Höhe z proportional zu ln(ζ_Decke/ζ). Mit Fußbodenheizung steigt die Wärme vom Boden auf.
 *
 * Bitgleich in bun (JavaScriptCore) und vitest (V8): nur +, −, ×, ÷, Math.sqrt und Vergleiche in fester Reihenfolge;
 * keine Funktionen wie exp, log, sin, pow, die je Maschine anders runden dürfen (der Logarithmus der Ankunftszeit über
 * wiederholte Quadratwurzeln, siehe ln).
 */

export interface Rechteck {
  x: number;
  y: number;
  breite: number;
  hoehe: number;
}

/** Knotengitter über dem Rechteck, Ränder auf Knoten; Abstand dx waagerecht, dy senkrecht. */
export interface Gitter {
  nx: number;
  ny: number;
  dx: number;
  dy: number;
  x0: number;
  y0: number;
}

/**
 * Schichtung der Raumluft außerhalb von Fahne und Wandgrenzschichten (Baustein 1), Temperaturen in K, Längen in
 * Einheiten, nur von der Höhe z abhängig (waagerechte Isothermen): T = gradient·z
 * + decke.stufe·S((z − (Höhe − decke.tiefe))/decke.breite) + boden.stufe·(1 − S((z − boden.hoehe)/boden.breite)) mit der
 * glatten Stufe S (stufe()).
 */
export interface Schichtung {
  /** K je Einheit Höhe; positiv: oben wärmer. */
  gradient: number;
  /** Warme Schicht unter der Decke (nur mit Heizkörper). */
  decke: Readonly<{ stufe: number; tiefe: number; breite: number }> | null;
  /** Schicht über dem Boden: negativ kühler (Kaltluftsee), positiv wärmer (Fußbodenheizung). */
  boden: Readonly<{ stufe: number; hoehe: number; breite: number }>;
}

/** Kalte Außenwand (Baustein 3). */
export interface Aussenwand {
  /** x der Wandoberfläche. */
  x: number;
  /** In den Raum: +1 (Wand links) bzw. −1 (Wand rechts). */
  richtung: 1 | -1;
  /**
   * Anteil der Temperatur über außen, um den die Wandoberfläche kühler ist als die Raumluft: U · R_si (stationärer
   * Wärmedurchgang, die Oberfläche liegt um U·R_si·(T_i − T_a) unter der Raumluft).
   */
  oberflaeche: number;
  /** Dicke der Fallströmung am Boden (Einheiten), an der Decke null; 0 = kein Kaltluftabfall. */
  grenzschicht: number;
  /** Kaltluftsee am Fuß der Wand: Stufe (K, negativ), Reichweite über den Boden und Höhe (Einheiten). */
  fuss: Readonly<{ stufe: number; reichweite: number; hoehe: number }>;
  /** Raumluft nahe der Wand kühler: Stufe (K, negativ) und Reichweite (Einheiten), oder ohne. */
  naehe: Readonly<{ stufe: number; reichweite: number }> | null;
}

/** Auftriebsfahne über einem Heizkörper (Baustein 2). */
export interface Fahne {
  /** db/dζ (Morton, Taylor & Turner 1956). */
  ausbreitung: number;
  /** Halbbreite an der Oberkante (Einheiten); der virtuelle Ursprung liegt halbbreite/ausbreitung darunter. */
  halbbreite: number;
  /** Übertemperatur auf der Achse an der Oberkante (K). */
  uebertemperatur: number;
  /** x der Achse: an der Wand (Heizkörper von der Seite) oder in der Mitte (Heizkörper von vorn). */
  achse: number;
  /** Halbe Länge des Fahnenblatts (Heizkörper von vorn: halbe Baulänge; von der Seite 0). */
  halbeLaenge: number;
  /** Von vorn: Anteil der halben Baulänge in der Halbbreite der Glocke (0 … 1). */
  kern: number;
  /** Einmischkoeffizient α (Volumenstrom der Fahne je Höhe 2α·w, Ankunft der Front). */
  einmischung: number;
}

/** Heizkörper mit fester Oberflächentemperatur (θ oben, unten, linear dazwischen). */
export interface Heizkoerper {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  oben: number;
  unten: number;
  /** Dicke der warmen Grenzschicht an der Oberfläche (Einheiten); unter dem Heizkörper keine. */
  grenzschicht: number;
  fahne: Readonly<Fahne>;
}

export interface Feldaufgabe {
  innen: Rechteck;
  /** Vorlauf − außen in K: θ = T / spanne. */
  spanne: number;
  /** Mittlere Raumlufttemperatur in K über außen (Thermostat; ohne Heizfläche gemittelt). */
  mittel: number;
  schichtung: Readonly<Schichtung>;
  waende: readonly Readonly<Aussenwand>[];
  heizkoerper: Readonly<Heizkoerper> | null;
}

/** Ergebnis auf einem Gitter. */
export interface Loesung {
  gitter: Gitter;
  /** θ (0 außen, 1 Vorlauf) je Knoten. */
  theta: Float64Array;
  /** Konstante c (K) der Schichtung nach der Einstellung des Raummittels. */
  versatz: number;
  /** Runden der Einstellung des Raummittels. */
  iterationen: number;
  /** Abweichung des Raummittels vom Sollwert nach der letzten Runde (in θ). */
  residuum: number;
}

/** Runden der Einstellung des Raummittels höchstens. */
const MAX_RUNDEN = 50;

/**
 * Gitter mit rund `schritt` Einheiten Abstand: so viele Felder, dass sie die Breite und die Höhe genau teilen (2 → 2 × 2,
 * 1 → 1 × 1 im Raum von 4,2 × 2,5 m).
 */
export function gitterFuer(innen: Rechteck, schritt: number): Gitter {
  const felderX = Math.round(innen.breite / schritt);
  const felderY = Math.round(innen.hoehe / schritt);
  return { nx: felderX + 1, ny: felderY + 1, dx: innen.breite / felderX, dy: innen.hoehe / felderY, x0: innen.x, y0: innen.y };
}

/** Glatte Stufe von 0 (u ≤ −1) bis 1 (u ≥ 1): 1/2 + 3u/4 − u³/4, stetig differenzierbar. */
export function stufe(u: number): number {
  if (u <= -1) return 0;
  if (u >= 1) return 1;
  return 0.5 + 0.75 * u - 0.25 * u * u * u;
}

/** Kompakte Glocke (1 − u²)² für |u| < 1, sonst 0 (Näherung der Gaußglocke ohne exp). */
export function glocke(u: number): number {
  const q = 1 - u * u;
  return q > 0 ? q * q : 0;
}

/**
 * Glocke mit algebraischem Rand (1 + u²/2)⁻² für das Profil der Fahne: um die Achse wie die Gaußglocke, nach außen
 * langsamer abfallend, ohne exp. Der Rand lässt die Isothermen der Fahne glatt in die Schichtung auslaufen, statt an
 * einer festen Breite zu knicken.
 */
export function fahnenprofil(u: number): number {
  const q = 1 + (u * u) / 2;
  return 1 / (q * q);
}

/** (1 − u)² für 0 ≤ u < 1, sonst 0: fällt von der Wand bzw. Achse in den Raum ab. */
function nah(u: number): number {
  if (u < 0) return 1;
  return u < 1 ? (1 - u) * (1 - u) : 0;
}

/**
 * Natürlicher Logarithmus für x ≥ 1 nur mit Quadratwurzeln und Grundrechenarten: ln x = 2^n · ln(x^(1/2^n)) mit der
 * Reihe ln(1 + e) ≈ e − e²/2 + e³/3 für die kleine Restgröße e (n = 16, Fehler unter 1e-12).
 */
export function ln(x: number): number {
  if (!(x >= 1)) throw new Error(`waerme/feld: ln nur für x ≥ 1 (${x})`);
  let y = x;
  for (let k = 0; k < 16; k += 1) y = Math.sqrt(y);
  const e = y - 1;
  return 65536 * (e - (e * e) / 2 + (e * e * e) / 3);
}

/** Höhe über dem Boden. */
const hoehe = (a: Feldaufgabe, y: number) => a.innen.y + a.innen.hoehe - y;

/** Liegt (x, y) auf dem Heizkörper (feste Oberflächentemperatur, keine Raumluft)? */
export function aufHeizkoerper(a: Feldaufgabe, x: number, y: number): boolean {
  const h = a.heizkoerper;
  return h !== null && x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1;
}

/** Oberflächentemperatur des Heizkörpers in der Höhe y (θ). */
function oberflaeche(h: Heizkoerper, y: number): number {
  const yy = y < h.y0 ? h.y0 : y > h.y1 ? h.y1 : y;
  return h.oben + ((h.unten - h.oben) * (yy - h.y0)) / (h.y1 - h.y0);
}

/** Waagerechter Abstand von der Achse der Fahne (ohne Heizkörper 0). */
function achsabstand(a: Feldaufgabe, x: number): number {
  const f = a.heizkoerper?.fahne;
  if (!f) return 0;
  return x < f.achse ? f.achse - x : x - f.achse;
}


/** Laufkoordinate ζ der Fahne über ihrem virtuellen Ursprung (Einheiten) in der Höhe y über der Oberkante. */
function zeta(h: Heizkoerper, y: number): number {
  const zeta0 = h.fahne.halbbreite / h.fahne.ausbreitung;
  return (y < h.y0 ? h.y0 - y : 0) + zeta0;
}

/** Schichtung (Baustein 1) in K ohne den Versatz c. */
function schichtung(a: Feldaufgabe, z: number): number {
  const s = a.schichtung;
  const b = s.boden;
  let t = s.gradient * z + b.stufe * (1 - stufe((z - b.hoehe) / b.breite));
  if (s.decke) t += s.decke.stufe * stufe((z - (a.innen.hoehe - s.decke.tiefe)) / s.decke.breite);
  return t;
}

/** Abstand des Punkts vom Heizkörper (0 auf ihm). */
function abstandHeizkoerper(h: Heizkoerper, x: number, y: number): number {
  const ex = x < h.x0 ? h.x0 - x : x > h.x1 ? x - h.x1 : 0;
  const ey = y < h.y0 ? h.y0 - y : y > h.y1 ? y - h.y1 : 0;
  return Math.sqrt(ex * ex + ey * ey);
}

/**
 * Luft in der Grenzschicht des Heizkörpers in der Höhe y (K über außen), bei der Raumluft t daneben: An der Unterkante
 * tritt Raumluft ein, an der Oberkante ist sie so warm wie die Oberfläche (Vorlauf); dazwischen linear. Auf der Fläche
 * des Heizkörpers zeigt das Feld diese Luft (die Bänder zeigen Luft, der Heizkörper ist darüber gezeichnet).
 */
function grenzschichtluft(a: Feldaufgabe, h: Heizkoerper, y: number, t: number): number {
  const yy = y < h.y0 ? h.y0 : y > h.y1 ? h.y1 : y;
  return t + (oberflaeche(h, yy) * a.spanne - t) * ((h.y1 - yy) / (h.y1 - h.y0));
}

/** Temperatur in K über außen am Punkt (x, y) mit dem Versatz c (auf dem Heizkörper: die Luft seiner Grenzschicht). */
export function temperatur(a: Feldaufgabe, x: number, y: number, c: number): number {
  const h = a.heizkoerper;
  const z = hoehe(a, y);
  const H = a.innen.hoehe;
  // 1. Schichtung
  let t = c + schichtung(a, z);
  // 3. Außenwände: kühlere Luft nahe der Wand, Kaltluftsee am Fuß, Fallströmung an der Wand
  for (const w of a.waende) {
    const d = (x - w.x) * w.richtung;
    if (w.naehe) t += w.naehe.stufe * nah(d / w.naehe.reichweite);
    t += w.fuss.stufe * nah(d / w.fuss.reichweite) * (1 - stufe((z - w.fuss.hoehe) / w.fuss.hoehe));
    if (w.grenzschicht > 0) {
      // An der Wand selbst immer die Oberflächentemperatur, auch in der Ecke unter der Decke (dort ist die Schicht null dick)
      const dicke = w.grenzschicht * Math.sqrt(Math.sqrt(z < H ? (H - z) / H : 0));
      const anteil = d <= 0 ? 1 : dicke > 0 ? glocke(d / dicke) : 0;
      t -= w.oberflaeche * t * anteil;
    }
  }
  // 2. Heizkörper: Luft seiner Grenzschicht auf ihm und daneben (nicht darunter: die Unterseite gibt keine Wärme nach
  // unten ab), Fahne über der Oberkante
  if (h) {
    if (aufHeizkoerper(a, x, y)) return grenzschichtluft(a, h, y, t);
    let zuschlag = 0;
    if (y <= h.y1) zuschlag = (grenzschichtluft(a, h, y, t) - t) * fahnenprofil(abstandHeizkoerper(h, x, y) / h.grenzschicht);
    const fahne = fahnenzuschlag(a, x, y);
    if (fahne > zuschlag) zuschlag = fahne;
    if (zuschlag > 0) t += zuschlag;
  }
  return t;
}

/** Übertemperatur der Fahne (Baustein 2, ohne die Grenzschicht am Heizkörper) am Punkt (x, y) in K; 0 unter der Oberkante. */
export function fahnenzuschlag(a: Feldaufgabe, x: number, y: number): number {
  const h = a.heizkoerper;
  if (!h || y >= h.y0) return 0;
  const f = h.fahne;
  return ((f.uebertemperatur * (f.halbbreite / f.ausbreitung)) / zeta(h, y)) * fahnenprofil(achsabstand(a, x) / halbbreite(h, y));
}

/** Feld θ auf dem Gitter für den Versatz c. */
function abtasten(a: Feldaufgabe, g: Gitter, c: number): Float64Array {
  const theta = new Float64Array(g.nx * g.ny);
  for (let j = 0; j < g.ny; j += 1) {
    for (let i = 0; i < g.nx; i += 1) theta[j * g.nx + i] = temperatur(a, g.x0 + i * g.dx, g.y0 + j * g.dy, c) / a.spanne;
  }
  return theta;
}

/**
 * Gehört (x, y) zur Raumluft, über die das Raummittel gebildet wird? Alle Luft außer dem Heizkörper, seiner Grenzschicht
 * und der Fahne (im Raum ein dünnes Blatt über dem Heizkörper, im Schnitt aber der Länge nach angeschnitten; ein
 * Thermostat regelt die Raumluft, nicht die Fahne).
 */
export function inRaumluft(a: Feldaufgabe, x: number, y: number): boolean {
  return !aufHeizkoerper(a, x, y) && !inFahne(a, x, y);
}

/**
 * Liegt (x, y) in der Fahne (bis zu ihrem Rand) oder in der Grenzschicht des Heizkörpers (bis zum Dreifachen ihrer
 * Dicke), nicht unter ihm?
 */
export function inFahne(a: Feldaufgabe, x: number, y: number): boolean {
  const h = a.heizkoerper;
  if (!h || aufHeizkoerper(a, x, y) || y > h.y1) return false;
  return achsabstand(a, x) <= fahnenrand(h, y) || abstandHeizkoerper(h, x, y) <= 3 * h.grenzschicht;
}

/** Mittel von θ über die Knoten der Raumluft (inRaumluft). */
export function luftmittel(a: Feldaufgabe, g: Gitter, theta: Float64Array): number {
  let summe = 0;
  let n = 0;
  for (let j = 0; j < g.ny; j += 1) {
    for (let i = 0; i < g.nx; i += 1) {
      if (!inRaumluft(a, g.x0 + i * g.dx, g.y0 + j * g.dy)) continue;
      summe += theta[j * g.nx + i];
      n += 1;
    }
  }
  return summe / n;
}

/**
 * Feld auf dem Gitter mit Schritt `schritt`; der Versatz c stellt das Mittel der Raumluft auf `mittel` ein (wie ein
 * Thermostat). Das Mittel hängt fast linear von c ab (die Wandgrenzschicht ist ein Anteil der Temperatur), darum
 * c ← c + Abweichung, bis sie unter 1e-12 liegt.
 */
export function rechneFeld(a: Feldaufgabe, schritt: number): Loesung {
  const g = gitterFuer(a.innen, schritt);
  const soll = a.mittel / a.spanne;
  let c = a.mittel;
  let theta = abtasten(a, g, c);
  let abweichung = soll - luftmittel(a, g, theta);
  let runden = 1;
  while (Math.abs(abweichung) > 1e-12) {
    if (runden >= MAX_RUNDEN) throw new Error(`waerme/feld: Raummittel nach ${runden} Runden nicht eingestellt (${abweichung})`);
    c += abweichung * a.spanne;
    theta = abtasten(a, g, c);
    abweichung = soll - luftmittel(a, g, theta);
    runden += 1;
  }
  return { gitter: g, theta, versatz: c, iterationen: runden, residuum: Math.abs(abweichung) };
}

/**
 * Halbbreite der Fahne in der Höhe y (Einheiten von der Achse): b = β·ζ (Morton, Taylor & Turner 1956); von vorn
 * gesehen dazu `kern` × die halbe Baulänge (eine Glocke über die ganze Länge, in der Mitte am wärmsten, an den Enden
 * mischt sich Raumluft ein). Unter der Oberkante wie an der Oberkante. Die Breite wächst linear mit der Höhe.
 */
export function halbbreite(h: Heizkoerper, y: number): number {
  return h.fahne.kern * h.fahne.halbeLaenge + h.fahne.ausbreitung * zeta(h, y);
}

/** Rand der Fahne (Einheiten von der Achse) in der Höhe y: die doppelte Halbbreite; dort ist die Übertemperatur auf ein Neuntel gefallen. */
export function fahnenrand(h: Heizkoerper, y: number): number {
  return 2 * halbbreite(h, y);
}

/**
 * Stromfunktion der Filling Box (Volumenstrom je Tiefe, Vorzeichen: u = ∂ψ/∂y, v = −∂ψ/∂x, y nach unten). Die Fahne
 * führt Q(z) = 2α·w·z nach oben (ebene Fahne: linear in der Höhe; w = 1, nur Verhältnisse zählen); unter der Decke
 * biegt sie in der Dicke der Deckenschicht ab (Q fällt glatt auf null). Außerhalb der Fahne fällt ψ linear zur Wand
 * ab: Die Luft sinkt über die ganze Breite gleichmäßig. Ohne Heizkörper ruht die Luft (ψ = 0).
 */
export function stromfunktion(a: Feldaufgabe, x: number, y: number): number {
  const h = a.heizkoerper;
  if (!h) return 0;
  const { innen } = a;
  const H = innen.hoehe;
  const z = hoehe(a, y);
  if (z <= 0 || z >= H || x <= innen.x || x >= innen.x + innen.breite) return 0;
  const f = h.fahne;
  const dicke = a.schichtung.decke ? a.schichtung.decke.tiefe : H / 5;
  const q = 2 * f.einmischung * z * (1 - stufe((z - (H - dicke / 2)) / (dicke / 2)));
  const rand = fahnenrand(h, y);
  const links = f.achse - rand;
  const rechts = f.achse + rand;
  const ende = innen.x + innen.breite;
  if (links <= innen.x) {
    // Fahne an der linken Wand: eine Zelle, ψ von 0 an der Wand auf Q am Rand der Fahne, dann linear auf 0 an der Gegenwand
    return x <= rechts ? (q * (x - innen.x)) / (rechts - innen.x) : (q * (ende - x)) / (ende - rechts);
  }
  // Fahne im Raum: zwei gegenläufige Zellen mit je der Hälfte des Volumenstroms
  if (x <= links) return (-q / 2) * ((x - innen.x) / (links - innen.x));
  if (x >= rechts) return (q / 2) * ((ende - x) / (ende - rechts));
  return -q / 2 + (q * (x - links)) / (rechts - links);
}

/** Geschwindigkeit (u, v) am Punkt (x, y) aus der Stromfunktion (zentrale Differenzen über 0,5 Einheiten); v > 0 abwärts. */
export function stroemung(a: Feldaufgabe, x: number, y: number): [number, number] {
  const e = 0.25;
  const u = (stromfunktion(a, x, y + e) - stromfunktion(a, x, y - e)) / (2 * e);
  const v = -(stromfunktion(a, x + e, y) - stromfunktion(a, x - e, y)) / (2 * e);
  return [u, v];
}

/**
 * Ankunft der Wärme am Punkt (x, y) in Zeiteinheiten (nur Verhältnisse innerhalb eines Felds zählen).
 * - Mit Heizkörper: an der Oberfläche sofort; in der Fahne nach der Steigzeit (y₀ − y)/w mit w = 1 (die Geschwindigkeit
 *   der ebenen Fahne hängt nicht von der Höhe ab); außerhalb der Fahne, wenn die erste Front der Deckenschicht die Höhe
 *   erreicht: Steigzeit bis zur Decke + W/(2α)·ln(ζ_Decke/ζ) (W = Breite der Zelle von der Fahne bis zur Wand).
 * - Ohne Heizkörper (Fußbodenheizung): die Wärme steigt vom Boden auf, Ankunft ∝ Höhe.
 */
export function ankunft(a: Feldaufgabe, x: number, y: number): number {
  const h = a.heizkoerper;
  const z = hoehe(a, y);
  if (!h) return z;
  const f = h.fahne;
  const steigen = (yy: number) => (yy < h.y0 ? h.y0 - yy : 0);
  // Am Heizkörper und in der Fahne: sofort bzw. nach der Steigzeit
  if (aufHeizkoerper(a, x, y) || inFahne(a, x, y)) return steigen(y);
  const { innen } = a;
  const zellenbreite = x < f.achse ? f.achse - f.halbeLaenge - innen.x : innen.x + innen.breite - f.achse - f.halbeLaenge;
  // ζ = Höhe über dem virtuellen Ursprung der Fahne, mindestens eine Einheit (die Front erreicht ihn nie)
  const ursprung = hoehe(a, h.y0) - f.halbbreite / f.ausbreitung;
  const hier = z - ursprung > 1 ? z - ursprung : 1;
  return steigen(innen.y) + (zellenbreite / (2 * f.einmischung)) * ln((innen.hoehe - ursprung) / hier);
}
