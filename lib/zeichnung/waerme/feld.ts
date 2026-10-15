/**
 * Wärmefeld-Löser (E-031, KERN K-010): stationäre und zeitabhängige Wärmeausbreitung im Rauminneren einer Zeichnung.
 * Reiner Rechenkern ohne Bezug zur Szene; die Aufgaben baut lib/zeichnung/waerme/eingabe.ts, das Skript
 * scripts/zeichnung/waermefeld.ts schreibt das Ergebnis nach lib/zeichnung/szenen/waermefeld.ts.
 *
 * Gleichung (θ normiert: 0 außen, 1 Vorlauf an der Oberfläche des Heizkörpers):
 *
 *     ∂θ/∂t = K' ∇²θ − u·∇θ          stationär: K' ∇²θ − u·∇θ = 0
 *
 * - K' = K · durchmischung: wirksame Leitfähigkeit der Raumluft, K = 1 (Länge in Einheiten der Szene, Zeit in
 *   K-Einheiten). Über einem Heizkörper ist die Luft stabil geschichtet (durchmischung 1), über einer warmen Bodenfläche
 *   steigen überall kleine Warmluftsäulen auf und mischen sie (größer).
 * - u: Konvektion als Stromfunktion von Walzen, je Walze ψ = A · 16 ξ(1−ξ) η(1−η) (ξ, η: Lage in der Walze, 0…1),
 *   u = ∂ψ/∂y, v = −∂ψ/∂x. Das Feld ist divergenzfrei und senkrecht zu den Wänden null. Die größte senkrechte
 *   Geschwindigkeit liegt am Aufstrom und beträgt U₀ = Pe · K / H (H = Raumhöhe), gleich für alle Walzen eines Raums.
 *   Mit `grenzschicht` steigt die Luft in einer dünnen Schicht an der Heizfläche (siehe Walze).
 * - Heizflächen (Heizkörper): feste Temperatur (Dirichlet), oben `oben`, unten `unten`, linear dazwischen; mit
 *   `unterseiteAdiabat` gibt die Unterseite keine Wärme nach unten ab (die erwärmte Luft steigt, Prüfrunde 1 B1-2).
 * - Wände, Decke, Boden: Robin-Bedingung −K' ∂θ/∂n = h (θ − bezug); h = 0 heißt adiabat (Innenwand).
 *
 * Diskretisierung: Knotengitter mit den Rändern auf Knoten, Differenzen zweiter Ordnung (zentral, auch für die
 * Konvektion: die Zell-Péclet-Zahl bleibt unter 2), Robin über Geisterknoten. Stationär mit SOR (ω = 1,85), Startwert
 * auf Wunsch die Lösung eines gröberen Gitters, bis die größte Änderung eines Durchlaufs unter `TOLERANZ` liegt;
 * zeitabhängig explizit (Euler vorwärts) mit stabilem Schritt.
 *
 * Bitgleich in bun (JavaScriptCore) und vitest (V8): nur +, −, ×, ÷ und Vergleiche in fester Reihenfolge, keine
 * Funktionen wie exp, sin, pow, die je Maschine anders runden dürfen (Math.sqrt ist exakt gerundet und erlaubt).
 */

export interface Rechteck {
  x: number;
  y: number;
  breite: number;
  hoehe: number;
}

/** Robin-Rand: −K ∂θ/∂n = h (θ − bezug). */
export interface Rand {
  h: number;
  bezug: number;
}

/** Heizfläche mit fester Temperatur (Dirichlet), in Einheiten der Szene. */
export interface Heizflaeche {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** θ an der Oberkante (Vorlauf) … */
  oben: number;
  /** … und an der Unterkante (abgekühlt). */
  unten: number;
  /**
   * Unterseite ohne Wärmeabgabe an die Luft darunter (Neumann, kein Fluss): Die Luft, die ein Heizkörper erwärmt,
   * steigt an seiner Vorder- und Oberseite auf; unter ihm strömt die kühle Raumluft vom Boden zu. Ohne diese Angabe
   * diffundierte die feste Temperatur der Heizfläche auch nach unten bis auf den Boden (Prüfrunde 1 B1-2).
   */
  unterseiteAdiabat?: boolean;
}

/** Konvektionswalze über die ganze Raumhöhe zwischen x0 und x1; `aufstrom`: Seite, an der die Luft steigt. */
export interface Walze {
  x0: number;
  x1: number;
  aufstrom: 'links' | 'rechts';
  /**
   * Dicke der Aufstromschicht als Anteil der Walzenbreite (δ, Prüfrunde 1 B1-2). Ohne: die symmetrische Walze
   * F(ξ) = 4ξ(1−ξ), Aufstrom und Abstrom gleich breit. Mit: F(ξ) = (1−ξ) ξ / (ξ + δ), ξ von der Aufstromseite – die
   * warme Luft steigt in einer dünnen Schicht an der Heizfläche auf (freie Konvektion an einer senkrechten Fläche), die
   * Rückströmung am Boden reicht bis an die Wand und unter den Heizkörper. Gleicher Volumenstrom wie die symmetrische
   * Walze (größtes ψ = U₀ · lx / 4).
   */
  grenzschicht?: number;
}

export interface Feldaufgabe {
  innen: Rechteck;
  /**
   * Wirksame Leitfähigkeit der Raumluft in Vielfachen von K: 1 mit Heizkörper; größer mit Fußbodenheizung als Ersatz
   * für den Strahlungsaustausch der warmen Bodenfläche, den das Modell nicht eigens abbildet (Kalibrierung ohne Quelle,
   * lib/zeichnung/waerme/eingabe.ts DURCHMISCHUNG, Prüfrunde 1 B1-4).
   */
  durchmischung: number;
  heizflaechen: readonly Heizflaeche[];
  raender: Readonly<{ links: Rand; rechts: Rand; oben: Rand; unten: Rand }>;
  walzen: readonly Walze[];
  /** Péclet-Zahl Pe = U₀ · H / K (mit K ohne den Faktor `durchmischung`; wirksam ist Pe / durchmischung). */
  peclet: number;
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

/** Ergebnis eines stationären Laufs. */
export interface Loesung {
  gitter: Gitter;
  theta: Float64Array;
  iterationen: number;
  /** Größte Abweichung eines Knotens von seiner Gleichung (Maximumnorm, in θ) nach dem letzten Durchlauf. */
  residuum: number;
}

/** Wirksame Leitfähigkeit der Raumluft (Einheiten² je Zeiteinheit). */
export const K = 1;
/**
 * Überrelaxation des stationären Lösers (E-031). 1,5 statt der geplanten 1,85: Mit der dünnen Aufstromschicht im
 * Vergleichsraum (Prüfrunde 1 B1-2) ist die Konvektion an der Heizfläche stark, und SOR divergiert mit 1,85.
 */
export const OMEGA = 1.5;
/** Abbruch: größte Änderung eines Durchlaufs (der gespeicherte Rest liegt darunter, Vertrag: < 1e-7). */
export const TOLERANZ = 1e-10;
const MAX_DURCHLAEUFE = 200_000;

/**
 * Gitter mit rund `schritt` Einheiten Abstand: so viele Felder, dass sie die Breite und die Höhe genau teilen (2 → 2 × 2,
 * 4 → 4 × 250/63 im Raum von 4,2 × 2,5 m).
 */
export function gitterFuer(innen: Rechteck, schritt: number): Gitter {
  const felderX = Math.round(innen.breite / schritt);
  const felderY = Math.round(innen.hoehe / schritt);
  return { nx: felderX + 1, ny: felderY + 1, dx: innen.breite / felderX, dy: innen.hoehe / felderY, x0: innen.x, y0: innen.y };
}

/** Geschwindigkeit (u, v) am Punkt (x, y); y zeigt nach unten, v < 0 heißt aufwärts. */
export function stroemung(aufgabe: Feldaufgabe, x: number, y: number): [number, number] {
  const { innen, walzen, peclet } = aufgabe;
  const hoehe = innen.hoehe;
  const u0 = (peclet * K) / hoehe;
  for (const w of walzen) {
    if (x < w.x0 || x > w.x1) continue;
    const lx = w.x1 - w.x0;
    const xi = (x - w.x0) / lx;
    const eta = (y - innen.y) / hoehe;
    if (w.grenzschicht !== undefined) {
      // ψ = s · a · F(ξa) · G(η) mit G = 4η(1−η); u = ∂ψ/∂y, v = −∂ψ/∂x; F' = (δ − ξa² − 2ξa δ) / (ξa + δ)²
      const d = w.grenzschicht;
      const links = w.aufstrom === 'links';
      const xa = links ? xi : 1 - xi;
      const xm = Math.sqrt(d * d + d) - d;
      const fmax = ((1 - xm) * xm) / (xm + d);
      const a = (u0 * lx) / 4 / fmax;
      const f = ((1 - xa) * xa) / (xa + d);
      const fs = (d - xa * xa - 2 * xa * d) / ((xa + d) * (xa + d));
      const s = links ? 1 : -1;
      return [(s * a * f * 4 * (1 - 2 * eta)) / hoehe, -(a * fs * 4 * eta * (1 - eta)) / lx];
    }
    // Aufstrom links: A > 0, rechts: A < 0; |v| am Aufstrom in halber Höhe = U₀
    const a = ((w.aufstrom === 'links' ? 1 : -1) * u0 * lx) / 4;
    const u = (a * 16 * xi * (1 - xi) * (1 - 2 * eta)) / hoehe;
    const v = -(a * 16 * (1 - 2 * xi) * eta * (1 - eta)) / lx;
    return [u, v];
  }
  return [0, 0];
}

/** Feste Temperatur eines Knotens auf einer Heizfläche oder NaN. */
function heizwert(aufgabe: Feldaufgabe, x: number, y: number): number {
  for (const f of aufgabe.heizflaechen) {
    if (x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1) return f.oben + ((f.unten - f.oben) * (y - f.y0)) / (f.y1 - f.y0);
  }
  return NaN;
}

/** Liegt über dem Knoten (x, y) die Unterseite einer Heizfläche, die nach unten keine Wärme abgibt? */
function unterAdiabat(aufgabe: Feldaufgabe, x: number, yOben: number): boolean {
  return aufgabe.heizflaechen.some((f) => f.unterseiteAdiabat === true && x >= f.x0 && x <= f.x1 && yOben >= f.y0 && yOben <= f.y1);
}

/**
 * Fünf-Punkte-Stern je Knoten: θ_P = cO·θ_O + cW·θ_W + cU·θ_U + cN·θ_N + c0 (O = Osten, U = unten); `diagonale` ist der
 * Faktor vor θ_P in der ungeteilten Gleichung (für den Zeitschritt). Feste Knoten tragen ihren Wert in `fest`.
 */
interface Stern {
  cO: Float64Array;
  cW: Float64Array;
  cU: Float64Array;
  cN: Float64Array;
  c0: Float64Array;
  diagonale: Float64Array;
  fest: Float64Array;
}

function stern(aufgabe: Feldaufgabe, g: Gitter): Stern {
  const n = g.nx * g.ny;
  const s: Stern = {
    cO: new Float64Array(n),
    cW: new Float64Array(n),
    cU: new Float64Array(n),
    cN: new Float64Array(n),
    c0: new Float64Array(n),
    diagonale: new Float64Array(n),
    fest: new Float64Array(n).fill(NaN),
  };
  const { links, rechts, oben, unten } = aufgabe.raender;
  const { dx, dy } = g;
  const kr = K * aufgabe.durchmischung;
  // Gleichung mal dx²/K: waagerecht Gewicht 1, senkrecht r = dx²/dy²
  const r = (dx * dx) / (dy * dy);
  for (let j = 0; j < g.ny; j += 1) {
    for (let i = 0; i < g.nx; i += 1) {
      const k = j * g.nx + i;
      const x = g.x0 + i * dx;
      const y = g.y0 + j * dy;
      const fest = heizwert(aufgabe, x, y);
      if (!Number.isNaN(fest)) {
        s.fest[k] = fest;
        continue;
      }
      const [u, v] = stroemung(aufgabe, x, y);
      const a = (u * dx) / (2 * kr);
      const b = (v * dy) / (2 * kr);
      // Gewichte der Nachbarn in K'∇²θ − u·∇θ (mal dx²/K', K' = K · durchmischung): Osten 1 − a, Westen 1 + a, unten
      // r (1 − b), oben r (1 + b)
      let cO = 1 - a;
      let cW = 1 + a;
      let cU = r * (1 - b);
      let cN = r * (1 + b);
      let diag = 2 + 2 * r;
      let c0 = 0;
      // Geisterknoten außerhalb: θ_G = θ_innen − β (θ_P − bezug), β = 2 d h / K' (d = dx bzw. dy); das Gewicht des Geists
      // geht auf den gespiegelten Nachbarn, β auf die Diagonale und die Konstante
      if (i === 0) {
        const beta = (2 * dx * links.h) / kr;
        cO += cW;
        diag += cW * beta;
        c0 += cW * beta * links.bezug;
        cW = 0;
      }
      if (i === g.nx - 1) {
        const beta = (2 * dx * rechts.h) / kr;
        cW += cO;
        diag += cO * beta;
        c0 += cO * beta * rechts.bezug;
        cO = 0;
      }
      if (j === 0) {
        const beta = (2 * dy * oben.h) / kr;
        cU += cN;
        diag += cN * beta;
        c0 += cN * beta * oben.bezug;
        cN = 0;
      } else if (unterAdiabat(aufgabe, x, y - dy)) {
        // Unterseite eines Heizkörpers darüber: kein Fluss (gespiegelter Nachbar wie an einer adiabaten Wand)
        cU += cN;
        cN = 0;
      }
      if (j === g.ny - 1) {
        const beta = (2 * dy * unten.h) / kr;
        cN += cU;
        diag += cU * beta;
        c0 += cU * beta * unten.bezug;
        cU = 0;
      }
      s.cO[k] = cO / diag;
      s.cW[k] = cW / diag;
      s.cU[k] = cU / diag;
      s.cN[k] = cN / diag;
      s.c0[k] = c0 / diag;
      s.diagonale[k] = diag;
    }
  }
  return s;
}

/** Gauß-Seidel-Wert eines freien Knotens (Nachbarn außerhalb haben Gewicht 0). */
function gs(s: Stern, t: Float64Array, g: Gitter, k: number, i: number, j: number): number {
  let w = s.c0[k];
  if (i < g.nx - 1) w += s.cO[k] * t[k + 1];
  if (i > 0) w += s.cW[k] * t[k - 1];
  if (j < g.ny - 1) w += s.cU[k] * t[k + g.nx];
  if (j > 0) w += s.cN[k] * t[k - g.nx];
  return w;
}

function startfeld(s: Stern): Float64Array {
  const t = new Float64Array(s.fest.length);
  for (let k = 0; k < t.length; k += 1) t[k] = Number.isNaN(s.fest[k]) ? 0 : s.fest[k];
  return t;
}

/** Größte Abweichung eines freien Knotens von seiner Gleichung. */
function rest(s: Stern, t: Float64Array, g: Gitter): number {
  let max = 0;
  for (let j = 0; j < g.ny; j += 1) {
    for (let i = 0; i < g.nx; i += 1) {
      const k = j * g.nx + i;
      if (!Number.isNaN(s.fest[k])) continue;
      const r = gs(s, t, g, k, i, j) - t[k];
      const betrag = r < 0 ? -r : r;
      if (betrag > max) max = betrag;
    }
  }
  return max;
}

/** Stationäres Feld auf einem Gitter mit Schritt `schritt` (SOR, ω = OMEGA). */
/**
 * Bilinear aus einer Lösung auf einem anderen Gitter über demselben Rechteck (Startwert: Das grobe Feld enthält schon die
 * langwelligen Anteile, an denen SOR am längsten rechnet).
 */
function interpoliert(von: Loesung, g: Gitter): Float64Array {
  const a = von.gitter;
  const t = new Float64Array(g.nx * g.ny);
  for (let j = 0; j < g.ny; j += 1) {
    const fy = (j * g.dy) / a.dy;
    const j0 = fy >= a.ny - 1 ? a.ny - 2 : Math.floor(fy);
    const wy = fy - j0;
    for (let i = 0; i < g.nx; i += 1) {
      const fx = (i * g.dx) / a.dx;
      const i0 = fx >= a.nx - 1 ? a.nx - 2 : Math.floor(fx);
      const wx = fx - i0;
      const k = j0 * a.nx + i0;
      const oben = von.theta[k] + wx * (von.theta[k + 1] - von.theta[k]);
      const unten = von.theta[k + a.nx] + wx * (von.theta[k + a.nx + 1] - von.theta[k + a.nx]);
      t[j * g.nx + i] = oben + wy * (unten - oben);
    }
  }
  return t;
}

/**
 * Stationäres Feld auf einem Gitter mit Schritt `schritt` (SOR, ω = OMEGA), mit `start` als Startwert (eine Lösung auf
 * einem gröberen Gitter derselben Aufgabe) oder ab θ = 0.
 */
export function loeseStationaer(aufgabe: Feldaufgabe, schritt: number, start?: Loesung): Loesung {
  const g = gitterFuer(aufgabe.innen, schritt);
  const s = stern(aufgabe, g);
  const t = startfeld(s);
  if (start) {
    const grob = interpoliert(start, g);
    for (let k = 0; k < t.length; k += 1) if (Number.isNaN(s.fest[k])) t[k] = grob[k];
  }
  let iterationen = 0;
  for (;;) {
    let max = 0;
    for (let j = 0; j < g.ny; j += 1) {
      for (let i = 0; i < g.nx; i += 1) {
        const k = j * g.nx + i;
        if (!Number.isNaN(s.fest[k])) continue;
        const r = gs(s, t, g, k, i, j) - t[k];
        t[k] += OMEGA * r;
        const betrag = r < 0 ? -r : r;
        // !(≤) statt >: ein NaN landet in max und bricht unten ab
        if (!(betrag <= max)) max = betrag;
      }
    }
    iterationen += 1;
    if (!(max < 1e6)) throw new Error(`waerme/feld: SOR divergiert nach ${iterationen} Durchläufen`);
    if (max < TOLERANZ) break;
    if (iterationen >= MAX_DURCHLAEUFE) throw new Error(`waerme/feld: SOR nach ${iterationen} Durchläufen nicht konvergiert (Rest ${max})`);
  }
  return { gitter: g, theta: t, iterationen, residuum: rest(s, t, g) };
}

/**
 * Zeitabhängiger Lauf ab θ = 0 im ganzen Raum, die Heizflächen und Ränder ab t = 0 eingeschaltet. Ruft `beobachten`
 * nach jedem Schritt mit Zeit und Feld; liefert `true` zurück, endet der Lauf. Schritt: 90 % der Stabilitätsgrenze
 * des expliziten Verfahrens.
 */
export function laufeZeit(
  aufgabe: Feldaufgabe,
  schritt: number,
  beobachten: (zeit: number, theta: Float64Array) => boolean,
  maxZeit: number,
): void {
  const g = gitterFuer(aufgabe.innen, schritt);
  const s = stern(aufgabe, g);
  let t: Float64Array = startfeld(s);
  let maxDiag = 0;
  for (let k = 0; k < t.length; k += 1) if (s.diagonale[k] > maxDiag) maxDiag = s.diagonale[k];
  const kr = K * aufgabe.durchmischung;
  const dt = (0.9 * g.dx * g.dx) / (kr * maxDiag);
  const faktor = (kr * dt) / (g.dx * g.dx);
  let neu: Float64Array = new Float64Array(t.length);
  let zeit = 0;
  for (;;) {
    for (let j = 0; j < g.ny; j += 1) {
      for (let i = 0; i < g.nx; i += 1) {
        const k = j * g.nx + i;
        neu[k] = Number.isNaN(s.fest[k]) ? t[k] + faktor * s.diagonale[k] * (gs(s, t, g, k, i, j) - t[k]) : t[k];
      }
    }
    [t, neu] = [neu, t];
    zeit += dt;
    if (beobachten(zeit, t)) return;
    if (zeit > maxZeit) throw new Error(`waerme/feld: zeitabhängiger Lauf nach t = ${zeit} ohne Ende`);
  }
}
