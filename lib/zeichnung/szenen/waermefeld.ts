/**
 * Wärmefeld 2.0 (E-031, KERN K-010): berechnete Isothermen im Rauminneren als Bänder, kühl → heiß.
 *
 * ERZEUGT von scripts/zeichnung/waermefeld.ts (`bun run zeichnung:waermefeld`), nicht von Hand ändern. Geprüft von
 * `bun run zeichnung:waermefeld --pruefen` und lib/zeichnung/__tests__/waermefeld.test.ts (Lock: die Rechnung ergibt
 * genau diese Datei). Rechnung: lib/zeichnung/waerme/ (eingabe.ts Aufgaben, feld.ts Löser, kontur.ts Isothermen,
 * rechnung.ts Ablauf).
 *
 * Vertrag (lib/zeichnung/__tests__/waermefeld-vertrag.test.ts, lib/motion/__tests__/register.test.ts):
 * - Band 0 ist das Innenrechteck `innen` (eine Fläche ohne Pfad, steht still); `baender` sind die Bänder 1 bis
 *   höchstens 4, aufsteigend nach Stufe (kühl → heiß), in der Reihenfolge, in der sie übereinander liegen.
 * - `schwelle`: θ (0 außen, 1 Vorlauf), oberhalb der das Band liegt. Hausschnitt: 64, 36, 16 bzw. 6 % des Raums
 *   (`flaecheAnteil`). Vergleichsräume auf gemeinsamer Skala: gleiche mittlere Raumtemperatur, dieselben Abstände vom
 *   Raummittel wie im Raum mit Heizkörper; ein Band erst ab 2 % der Fläche, die Fußbodenheizung hat darum weniger
 *   Bänder (gleichmäßiger).
 * - Jedes Band liegt in `innen` (± 4 Einheiten Spiegelrand, den die Wände der Zeichnung decken), Band k + 1 liegt in
 *   Band k, alle Zahlen im Pfad liegen auf dem 0,5-Raster.
 * - `startTakte` (Verzögerung in Takten zu 80 ms, halbe Takte) steigt streng von heiß nach kühl. Hausschnitt (Hero,
 *   Auslöser `nachlauf`) im Fenster 7…16,5 Takte, die Vergleichsräume der Wärmepumpen-Seite (Auslöser `sicht`) im
 *   Fenster 0…22 Takte; das Bewegungsregister (lib/motion/register.ts, `waerme-breitet-sich-aus`) führt genau diese
 *   Werte. `ursprung`: Mitte, aus der ein Band wächst (Oberkante des Heizkörpers bzw. Mitte des Bodens);
 *   `wachstum`: radial aus dem Ursprung, mit Fußbodenheizung senkrecht aus der Bodenlinie (die ganze Fläche heizt).
 * - Einheiten wie in der Szene, 1 Einheit = 10 mm: Hausschnitt in den Koordinaten von HAUS_LAGE
 *   (lib/zeichnung/szenen/hausschnitt.ts), die Vergleichsräume ab der linken oberen Ecke des Rauminneren
 *   (lib/zeichnung/szenen/raumschnitt.ts).
 */
import type { Punkt } from '../norm';

/** Rechteck in Einheiten der Szene. */
export interface Rechteck {
  x: number;
  y: number;
  breite: number;
  hoehe: number;
}

export type WaermefeldId = 'hausschnitt' | 'raum-heizkoerper' | 'raum-fussboden';

export interface Waermeband {
  /** 1 = kühlstes bewegtes Band … 4 = heißestes (Band 0 ist das Innenrechteck); gleiche Stufe = gleiche Farbe. */
  stufe: 1 | 2 | 3 | 4;
  /** Temperatur θ (0 außen, 1 Vorlauf), oberhalb der das Band liegt. */
  schwelle: number;
  /** Geschlossene Kontur (beginnt mit M, endet mit Z), alle Zahlen auf dem 0,5-Raster. */
  d: string;
  /** Ursprung des Wachstums (transform-origin) in Einheiten der Szene. */
  ursprung: Punkt;
  /** Startverzögerung in Takten (80 ms), halbe Takte. */
  startTakte: number;
  /** Anteil der Bandfläche am Innenrechteck (0 < a ≤ 1). */
  flaecheAnteil: number;
}

export interface Waermefeld {
  id: WaermefeldId;
  /** Rauminneres = Band 0. */
  innen: Rechteck;
  /** Wie die Bänder wachsen: aus dem Ursprung (radial) oder nur nach oben aus der Bodenlinie (senkrecht). */
  wachstum: 'radial' | 'senkrecht';
  /** Bänder 1 bis höchstens 4, aufsteigend nach Stufe. */
  baender: readonly Waermeband[];
  herkunft: {
    skript: string;
    eingabeHash: string;
    modell: string;
    raster: 2;
    iterationen: number;
    residuum: number;
  };
}

const MODELL =
  'Stationäre Wärmeausbreitung mit Konvektion, K∇²θ − u·∇θ = 0, θ = 0 außen, 1 am Vorlauf; Konvektion aus Walzen (Stromfunktion 16ξ(1−ξ)η(1−η), divergenzfrei, Pe 16 am Heizkörper, 2 an der Fußbodenheizung; im Vergleichsraum mit Heizkörper steigt die Luft in einer dünnen Schicht am Heizkörper, F(ξ) = (1−ξ)ξ/(ξ+0,05)); Heizkörper mit fester Temperatur (1,0 oben, 0,8 unten), Unterseite ohne Wärmeabgabe nach unten; mit Heizkörper konvektive Anpassung als Ersatz für den Auftrieb (wo die Luft oben kühler ist als darunter, 41-fache senkrechte Leitfähigkeit, außer 0,1 m an Decke und Boden); Wände, Decke und Boden als Robin-Rand mit U nach dem GEG-Referenzgebäude (0,28 / 0,20 / 0,35 × 0,6), Fußbodenheizung als Robin-Rand mit θ 0,6 und 10,8 W/(m²·K) (DIN EN 1264-5), vierfache Leitfähigkeit über dem Boden als Ersatz für den Strahlungsaustausch (Kalibrierung ohne Quelle); Kalibrierkonstante der Ränder 0,01. Linien-SOR (ω 1,7) auf 2 Einheiten. Bänder: Hausschnitt bei 64, 36, 16 und 6 % der Raumfläche; Vergleichsräume bei gleicher mittlerer Raumtemperatur auf derselben Skala (Abstände vom Raummittel wie im Raum mit Heizkörper bei 64/36/16/6 %), ein Band nur ab 2 % der Fläche. Reihenfolge aus einem expliziten Zeitlauf auf rund 4 Einheiten (Ring eines Bands zu 60 % erwärmt). Hausschnitt: Schnittebene vor der Rückwand, der Heizkörper an der Rückwand liegt in der Ebene.';

/** Tief eingefroren: Die Daten ändert nur das Skript. */
function fest<T>(wert: T): T {
  if (wert && typeof wert === 'object') {
    for (const teil of Object.values(wert)) fest(teil);
    Object.freeze(wert);
  }
  return wert;
}

export const WAERMEFELDER: Readonly<Record<WaermefeldId, Waermefeld>> = fest<Record<WaermefeldId, Waermefeld>>({
  'hausschnitt': {
    id: 'hausschnitt',
    innen: { x: 330, y: 305, breite: 420, hoehe: 250 },
    wachstum: 'radial',
    baender: [
      {
        stufe: 1,
        schwelle: 0.797,
        d: 'M380 301C379.5 301 378.5 301 378.5 301C378.5 301.5 379.5 302.5 380 303C380.5 303.5 381 304.5 381 305C381 305.5 380.5 306.5 380 307C378.5 309 377 311 375.5 313C375 314 374 315.5 374 317C373.5 333 373.5 349 373.5 365C373.5 369 373.5 373 374 377C374.5 381.5 375 386.5 376 391C377 395.5 378 400.5 379.5 405C381 409 383 413 385 417C387 420.5 388.5 424 391 427C392.5 429 394.5 431 396.5 433C399 435 401.5 437 404 439C406.5 441 409 442.5 412 444C414.5 445.5 417.5 446 420 447C422.5 448 425.5 449 428 449.5C431.5 450.5 434.5 451 438 451.5C450 453 462 453.5 474 454.5C478 455 482 455.5 486 456.5C490 457.5 494 458.5 498 460C500 460.5 502 461.5 504 462.5C506 463.5 508 464.5 510 466C513.5 468.5 517 471.5 520 474.5C523.5 478.5 527 482.5 530 487C534.5 493 538 499.5 542 506C547.5 515.5 552.5 525.5 558 535C558.5 536 559 536.5 560 537C561 537.5 562.5 537.5 564 537.5C581.5 537.5 598.5 537 616 537C630 537 644 537.5 658 537.5C659 537.5 660.5 537.5 661.5 537C672.5 529 683 520 693.5 511C699 506.5 704 502 709 497C713 493 716 489 719.5 485C721 483 722.5 480.5 724 478.5C725.5 476 727 473.5 728 471C729.5 467.5 731.5 464.5 732.5 461C734 457 735 452.5 736 448.5C737 444 738 439.5 738.5 435C739.5 429.5 740.5 424.5 740.5 419C741 385.5 740.5 352.5 740 319C740 317.5 740 316 739.5 315C738.5 312 736.5 309.5 735 307C734.5 306.5 734.5 305.5 734.5 305C734.5 303.5 737.5 301 736 301C619 301 498.5 301 380 301Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 16.5,
        flaecheAnteil: 0.641,
      },
      {
        stufe: 2,
        schwelle: 0.887,
        d: 'M478 301C478 301 477.5 301 477.5 301C478.5 301.5 480.5 302 481.5 303C482.5 303.5 483.5 304.5 483.5 305C483.5 305.5 482.5 306.5 481.5 307C477.5 309 473 311 468.5 313C467.5 313.5 466.5 314 465.5 315C465 315.5 464 316 464 317C463.5 321 463.5 325 463.5 329C463.5 337 463.5 345 463.5 353C463.5 354.5 463.5 355.5 463.5 357C464 358.5 464.5 359.5 465 361C466.5 363.5 467.5 366.5 469.5 369C471 371 473 373 475 375C477 377 479.5 379 482 381C489 386.5 496.5 392 504 397.5C507.5 400 511 402.5 514 405.5C517.5 409 521 412.5 524 416C527 419.5 529.5 423 532 427C534.5 430.5 536 434.5 538 438.5C539.5 442 541 445.5 542 449C543 452.5 544 455.5 544.5 459C545.5 463.5 545 468.5 546 473C546.5 476.5 547.5 479.5 548.5 483C550.5 489 553 495 555 501C556 503.5 557 506 558 508.5C558.5 509.5 559 511 560 512C560.5 512.5 561.5 513 562 513.5C562.5 514 563.5 514 564 514C594.5 514 625.5 514.5 656 514C657.5 514 659 513.5 660 513C661.5 512 663 510 664 508.5C667.5 504 670.5 499.5 673.5 495C675.5 492 677.5 488.5 679.5 485C681 482 682.5 478.5 684 475C685 472.5 686 469.5 687 467C688 463 689 459 690 455C692 444.5 694 433.5 696 423C697 417.5 698 412.5 698 407C698.5 377.5 698.5 348.5 698 319C698 317.5 697.5 316 697 315C695.5 312 693.5 309.5 691.5 307C691 306.5 690.5 305.5 690.5 305C690.5 304.5 691 303.5 691.5 303C692 302.5 694 301 693 301C622.5 301 549.5 301 478 301Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 9.5,
        flaecheAnteil: 0.359,
      },
      {
        stufe: 3,
        schwelle: 0.96,
        d: 'M582 301C580 301 587.5 302 590.5 303C592.5 303.5 597.5 304.5 596.5 305C592 307 581.5 309 574 311.5C572 312 570 313 568 314C567.5 314 567.5 314.5 567 315C566.5 315.5 565.5 316 565.5 317C564.5 331 564 345 564 359C563.5 384.5 564 409.5 563.5 435C563.5 441.5 563 448.5 562.5 455C562 461.5 562 468.5 561 475C560.5 477 559.5 479 558.5 481C558.5 481.5 558 482.5 558 483C558.5 485 558.5 487 559.5 489C560 490 561 491 562 491.5C562.5 492 563.5 492 564 492C595.5 492 627 492.5 658 492C659 492 659.5 491 660 490.5C661 489.5 661.5 488.5 662 487.5C662.5 486.5 662.5 486 662.5 485C662.5 483.5 663 482.5 663 481C663 478.5 662 475.5 661.5 473C660 455 658 437 657 419C655 385 654 351 651.5 317C651.5 316 650.5 315.5 650 315C648 313.5 646 312.5 644 311.5C636.5 309 626 307 621.5 305C620.5 304.5 625.5 303.5 627.5 303C630.5 302 638 301 636 301C623 301 595 301 582 301Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 8.5,
        flaecheAnteil: 0.161,
      },
      {
        stufe: 4,
        schwelle: 0.98,
        d: 'M606 353C605.5 353.5 604.5 354 604 355C602.5 357.5 601 360 600 362.5C597.5 368 595.5 374 594 380C591.5 388 590 396 588 404C583 427.5 578.5 451.5 573 475C573 476 572 476.5 571.5 477C568.5 478.5 565 479 562 480.5C561.5 481 561 482 561 483C561 484 561.5 485 562 485.5C562.5 486 563.5 486 564 486C594.5 486 625.5 486 656 486C656.5 486 657.5 486 658 485.5C659 485 659.5 484 660 483C660 482.5 660 481.5 659.5 481C659 480.5 658.5 480 658 480C655.5 479 652.5 478.5 650 477C649 476.5 648 476 648 475C641 447.5 635 419.5 628 392C627 387 625.5 382.5 624 377.5C623 373.5 621.5 369.5 620 365.5C619 362.5 617.5 359.5 616 357C615 355.5 613.5 354 612 352.5C611.5 352 610.5 351.5 610 351.5C609.5 351.5 608.5 351.5 608 351.5C607.5 352 606.5 352.5 606 353Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 7,
        flaecheAnteil: 0.062,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '998126d450374781',
      modell: MODELL,
      raster: 2,
      iterationen: 8407,
      residuum: 4.393518882039871e-11,
    },
  },
  'raum-heizkoerper': {
    id: 'raum-heizkoerper',
    innen: { x: 0, y: 0, breite: 420, hoehe: 250 },
    wachstum: 'radial',
    baender: [
      {
        stufe: 1,
        schwelle: 0.736,
        d: 'M-4 -4C-4 29 -4 158 -4 236.5C-4 238 -1.5 236 0 236C4.5 236 9.5 237 14 237C15.5 237 17 236.5 18 236C20 235 22 233.5 23.5 232C27.5 228 30.5 223.5 34 219.5C36 217.5 38 215.5 40 214C42.5 212 45 210.5 48 209.5C51 208 54.5 207 58 206.5C62.5 205.5 67.5 205 72 205C84 204.5 96 204.5 108 204C116 203.5 124 203.5 132 203C147.5 202 162.5 200.5 178 198.5C187.5 197.5 196.5 196 206 194.5C214 193 222 191.5 230 190C237.5 188.5 244.5 187 252 185C258.5 183 265.5 181 272 179C277 177.5 282 176 287 174C291.5 172 296.5 170 301 168C305 166 309 164 312.5 162C315.5 160 318.5 158 321.5 156C324 154 326.5 152 329 150C331.5 147.5 334.5 145 336.5 142C338.5 139.5 340 136.5 341.5 134C343 131.5 344.5 129 345.5 126C347 123 348 119.5 348.5 116C349.5 112 350 108 350 104C350.5 88 350 72 349.5 56C349.5 42 349 28 348.5 14C348.5 13.5 348.5 12.5 348 12C347.5 11.5 347 10.5 346.5 10C346 9.5 345 8.5 344 8C340.5 6 336 4 332.5 2C332 1.5 331 0.5 331 0C331 -0.5 332 -1.5 332.5 -2C333.5 -3 337.5 -4 336 -4C225 -4 62.5 -4 -4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 22,
        flaecheAnteil: 0.639,
      },
      {
        stufe: 2,
        schwelle: 0.804,
        d: 'M-4 -4C-4 35 -4 153 -4 229C-4 230 -3 227.5 -2 227C-1.5 226.5 -0.5 226.5 0 226.5C0.5 226.5 1.5 226.5 2 227C3.5 228 4.5 230 6 231C6.5 231.5 7.5 232 8 232C9.5 232 11 232.5 12 232C13 232 13.5 231 14 230.5C15 229.5 15.5 228 16 227C19.5 219 22.5 210.5 26 202.5C29 196 32.5 189.5 36 183.5C37 181.5 38.5 179.5 40 177.5C42 175 44 172.5 46 170.5C47 169 48.5 168 50 167C52 165.5 54 164 56 163C59 161.5 62.5 160 66 159C69 158 72.5 157.5 76 157C92 155 108 153.5 124 151.5C132 150.5 140 149 148 147.5C155.5 146 163 144.5 170 142.5C176 140.5 182 138 188 136C191.5 134.5 195 133.5 198 132C201.5 130.5 204.5 128.5 208 126.5C210.5 125 212.5 123.5 215 122C217.5 120 220.5 118 223 116C225.5 114 227.5 112 229.5 110C231.5 108 233 106 234.5 104C236 102 237.5 100 238.5 98C240 95.5 241.5 93 242.5 90C243.5 87.5 244 84.5 244.5 82C245 79.5 245.5 76.5 245.5 74C246 63.5 246 52.5 245.5 42C245.5 32.5 244.5 23.5 244 14C244 13.5 244.5 12.5 244 12C243.5 11 243 10.5 242 10C241 9 239.5 8.5 238.5 8C233 6 227.5 4.5 222.5 2C221.5 1.5 220.5 0.5 220.5 0C220.5 -0.5 221.5 -1.5 222.5 -2C224 -3 230 -4 228 -4C154.5 -4 34.5 -4 -4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 7,
        flaecheAnteil: 0.358,
      },
      {
        stufe: 3,
        schwelle: 0.855,
        d: 'M-4 -4C-4 45.5 -4 144 -4 215.5C-4 216.5 -3 213.5 -2 213C-1.5 212.5 -0.5 212 0 212C0.5 212 1.5 212.5 2 213C3.5 214.5 4.5 216 6 217.5C6.5 218 7.5 218.5 8 218.5C8.5 218.5 9.5 218.5 10 218.5C10.5 218.5 11.5 218.5 12 218C13 217.5 13.5 217 14 216C15 214.5 15.5 213 16 211.5C19 202.5 22.5 193.5 25 184C27 177 28 170 30 163C31 159.5 32 155.5 33.5 152C35 148.5 36 144.5 38 141C39.5 137.5 41.5 134.5 44 131.5C46.5 128.5 49 126 52 123.5C55 121 58.5 118 62 116C66 113.5 70 111.5 74 109.5C82 105.5 90.5 102 98.5 98C103 95.5 107.5 93 112 90C115 88 117.5 86 120 83.5C122.5 81 124.5 78.5 126 76C127 75 127 73.5 127.5 72C128 70.5 128 69.5 128 68C128 60 128 52 127.5 44C127.5 37.5 127 30.5 126.5 24C126.5 20.5 126.5 17.5 126 14C126 13.5 126 12.5 125.5 12C125 11 124 10.5 123 10C121.5 9 119.5 8.5 117.5 8C109.5 6 101.5 4.5 93.5 2C92 1.5 90 0.5 90 0C90 -0.5 92 -1.5 93.5 -2C96 -3 103 -4 101 -4C70.5 -4 7.5 -4 -4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 1,
        flaecheAnteil: 0.158,
      },
      {
        stufe: 4,
        schwelle: 0.885,
        d: 'M18 8C15.5 8.5 12.5 9 10 10C9.5 10.5 8.5 11 8.5 12C6.5 24.5 5.5 37.5 3.5 50C3 52.5 2.5 55.5 2 58C1.5 59.5 0.5 62.5 0 62.5C-0.5 62.5 -1.5 59.5 -2 58C-3 54 -4 43 -4 46.5C-4 92.5 -4 154.5 -4 206C-4 207 -3 204 -2 203.5C-1.5 203 -0.5 202.5 0 202.5C0.5 202.5 1.5 203 2 203.5C3.5 205 4.5 207 6 208.5C6.5 209 7.5 209.5 8 209.5C8.5 209.5 9.5 209.5 10 209.5C10.5 209.5 11.5 209.5 12 209C13 208.5 13.5 208 14 207C15 205.5 15.5 203.5 16 202C17.5 198 18.5 194 19.5 190C20.5 186.5 21 183.5 21.5 180C23 168 23.5 156 25 144C26 137 26.5 130 28 123C29 117 31 111.5 33 106C35.5 98.5 39.5 91.5 42 84C42.5 82 43 80 43 78C43.5 66.5 43.5 55.5 43 44C42.5 34 42 24 41 14C41 13.5 41 12.5 40.5 12C40 11 38.5 10.5 37.5 10C36.5 9.5 35 9.5 34 9C31.5 8.5 28.5 7.5 26 7.5C23.5 7.5 20.5 7.5 18 8Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 0,
        flaecheAnteil: 0.059,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '998126d450374781',
      modell: MODELL,
      raster: 2,
      iterationen: 13639,
      residuum: 3.4431124618095055e-11,
    },
  },
  'raum-fussboden': {
    id: 'raum-fussboden',
    innen: { x: 0, y: 0, breite: 420, hoehe: 250 },
    wachstum: 'senkrecht',
    baender: [
      {
        stufe: 1,
        schwelle: 0.499,
        d: 'M168 -4C167.5 -4 167 -4 167 -4C167.5 -3.5 169 -3 169.5 -2C170 -1.5 170.5 -0.5 170.5 0C170.5 0.5 170 1.5 169.5 2C160.5 8.5 151 15 142 21.5C132.5 28.5 123 36 114 43.5C77 74 40.5 105.5 4 136.5C3.5 137 2.5 137.5 2 138C1.5 138.5 0.5 138.5 0 138.5C-0.5 138.5 -1.5 138.5 -2 138C-2.5 137.5 -4 135.5 -4 136.5C-4 174.5 -4 245.5 -4 254C108 254 335 254 424 254C424 221.5 424 39 424 -4C381.5 -4 253.5 -4 168 -4Z',
        ursprung: { x: 210, y: 250 },
        startTakte: 22,
        flaecheAnteil: 0.887,
      },
      {
        stufe: 2,
        schwelle: 0.566,
        d: 'M374 174C364 175 354 176 344 177C332.5 178.5 321.5 180 310 181.5C298 183.5 286 185.5 274 187.5C260 190 246 193 232 196C206 201.5 180 207 154 213C122.5 220 91 227 60 234.5C45.5 238 31.5 242 17 246C15 246.5 13 247 11.5 248C10.5 248.5 9 249.5 9 250C9 250.5 10.5 251.5 11.5 252C13 253 15 254 17 254C152.5 254 311 254 424 254C424 249.5 424 193 424 172C422 166 408 172 400 172.5C391.5 173 382.5 173.5 374 174Z',
        ursprung: { x: 210, y: 250 },
        startTakte: 0,
        flaecheAnteil: 0.188,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '998126d450374781',
      modell: MODELL,
      raster: 2,
      iterationen: 2347,
      residuum: 4.964373356841634e-11,
    },
  },
});
