// Szene „Wärmebild“: eine Geometrie für Wärmefeld (Textur und SVG-Bänder) und Strichzeichnung.
// Einheiten: Szene 800 × 800. Links bündig, unten bündig in den Bildrahmen gelegt; mobil wird rechts angeschnitten.

export const W = 800;
export const H = 800;

// Haus im Schnitt: Giebel 45° wie im Logo.
export const HAUS = {
  firstX: 400,
  firstY: 344,
  halb: 216, // halbe Breite an der Traufe
  wand: 14,
  dach: 20, // senkrechte Dachstärke (14 × √2)
  ueberstand: 16,
  boden: 740, // Geländelinie
  deckeD: 12,
  estrichD: 14,
  innenwandX: 392,
  innenwandD: 12,
};
HAUS.traufeY = HAUS.firstY + HAUS.halb; // 560
HAUS.links = HAUS.firstX - HAUS.halb; // 184
HAUS.rechts = HAUS.firstX + HAUS.halb; // 616
HAUS.estrichY = HAUS.boden - HAUS.estrichD; // 726

// Wärmepumpe (Außengerät) links neben dem Haus
export const PUMPE = { x: 50, y: 642, w: 104, h: 98, r: 12, lx: 102, ly: 691, lr: 29 };

// Heizkörper im Wohnraum (links), Badewanne mit Fußbodenheizung im Bad (rechts)
export const HEIZKOERPER = { x: 226, y: 640, w: 64, h: 72, rippen: 5 };
export const WANNE = { x: 448, y: 668, w: 140, h: 48, r: 20 };
export const FBH = { y: 733, von: 414, bis: 590, abstand: 16, r: 3 };

// Giebeluhr auf 13:30 (Stundenzeiger 45° = Dachneigung, Fügung aus B Runde 1)
export const UHR = { x: 400, y: 468, r: 34 };

// Leitungen als Polylinien in Fließrichtung
export const LEITUNG = {
  vlHeiz: [[154, 662], [226, 662]],
  rlHeiz: [[226, 704], [154, 704]],
  vlBad: [[128, 740], [128, 756], [404, 756], [404, 733], [590, 733]],
  rlBad: [[590, 733], [596, 733], [596, 774], [140, 774], [140, 740]],
  // Abgang zum Knopf (Desktop): aus der Pumpe nach links aus dem Bild
  knopfQuer: [[50, 676], [0, 676]],
  // Paar nach unten aus dem Bild (mobil: zum Knopf und weiter als Leitfaden; Desktop: Leitfaden)
  vlUnten: [[50, 728], [28, 728], [28, 800]],
  rlUnten: [[50, 712], [14, 712], [14, 800]],
};

// Zonen für das Zeigen (= js/waermebild.js ZONEN): Wärmepumpe, Wohnraum mit Heizkörper, Bad mit Fußbodenheizung
export const ZONEN = [
  { x0: 36, x1: 172, y0: 604, y1: 752 },
  { x0: 198, x1: 392, y0: 580, y1: 726 },
  { x0: 404, x1: 602, y0: 580, y1: 726 },
];

// Dachlinie außen (y der Dachoberkante bei x)
export const dachAussen = (x) => HAUS.firstY + Math.abs(x - HAUS.firstX);

/** Materialklasse eines Punktes. */
export function material(x, y) {
  const h = HAUS;
  if (y >= h.boden) return 'erde';
  const p = PUMPE;
  if (x >= p.x && x <= p.x + p.w && y >= p.y) return 'pumpe';
  const ya = dachAussen(x);
  const imHausX = x >= h.links - h.ueberstand && x <= h.rechts + h.ueberstand;
  if (imHausX && y >= ya && y < ya + h.dach && y < h.traufeY + h.dach) return 'dach';
  if (x < h.links || x > h.rechts) return 'luft';
  if (y < ya) return 'luft';
  if (x < h.links + h.wand || x > h.rechts - h.wand) return y >= h.traufeY ? 'wand' : 'dachboden';
  if (y < h.traufeY) return 'dachboden';
  if (y < h.traufeY + h.deckeD) return 'decke';
  if (y >= h.estrichY) return 'estrich';
  if (x >= h.innenwandX && x < h.innenwandX + h.innenwandD) return 'innenwand';
  return 'raum';
}
