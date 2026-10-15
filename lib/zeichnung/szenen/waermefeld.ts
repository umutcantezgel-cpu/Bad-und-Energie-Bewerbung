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
  'Stationäre Wärmeausbreitung mit Konvektion, K∇²θ − u·∇θ = 0, θ = 0 außen, 1 am Vorlauf; Konvektion aus Walzen (Stromfunktion, divergenzfrei, Pe 16 am Heizkörper, 2 an der Fußbodenheizung); mit Heizkörper in dünnen Schichten je F(ξ)·G(η), Profil x(1−x)/((x+p)(1−x+q)): Fahne über dem Heizkörper, Deckenstrahl unter der Decke, Abstrom an den Außenwänden (Hausschnitt) bzw. im ganzen Raum (Vergleichsraum); Heizkörper mit fester Temperatur (1,0 oben, 0,8 unten), Unterseite ohne Wärmeabgabe nach unten; mit Heizkörper konvektive Anpassung als Ersatz für den Auftrieb (wo die Luft oben kühler ist als darunter, 41-fache senkrechte Leitfähigkeit, außer 20 mm an Decke und Boden); Wände, Decke und Boden als Robin-Rand mit U nach dem GEG-Referenzgebäude (0,28 / 0,20 / 0,35 × 0,6), Fußbodenheizung als Robin-Rand mit θ 0,6 und 10,8 W/(m²·K) (DIN EN 1264-5), vierfache Leitfähigkeit über dem Boden als Ersatz für den Strahlungsaustausch (Kalibrierung ohne Quelle); Kalibrierkonstante der Ränder 0,01. Hybridverfahren, direkt gelöst auf 2 Einheiten. Bänder: Hausschnitt bei 64, 36, 16 und 6 % der Raumfläche; Vergleichsräume bei gleicher mittlerer Raumtemperatur auf derselben Skala (Schwellen des Raums mit Heizkörper bei 64/36/16/6 % im Verhältnis der Raummittel), ein Band nur ab 2 % der Fläche. Reihenfolge aus einem expliziten Zeitlauf auf rund 4 Einheiten (Ring eines Bands aus Luftknoten zu 60 % erwärmt). Hausschnitt: Schnittebene vor der Rückwand, der Heizkörper an der Rückwand liegt in der Ebene.';

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
        schwelle: 0.801,
        d: 'M336 301C335.5 301 334 301 334 301C333.5 302 334.5 303.5 334.5 305C334.5 311 334 317 334 323C334 327.5 335 332.5 335.5 337C336 341.5 337 346.5 338 351C339 355 340 359 341.5 363C342.5 366.5 344 369.5 345.5 373C347 376 348 379 350 381.5C351.5 384 354 386.5 356 389C358 391 360 393 362 394.5C364 396 366 397 368 398.5C370 399.5 372 401 374 402C376.5 403 379 404 381.5 405C387 407 392.5 408.5 398 410C401.5 411 404.5 411.5 408 412C418.5 414.5 429.5 416.5 440 419C446.5 420.5 453.5 422.5 460 424.5C463.5 425.5 466.5 427 470 428C473.5 429.5 477 430.5 480 432C483 433.5 485.5 435 488 436.5C490.5 438 493.5 439.5 496 441.5C498 443 500 445 502 446.5C504 448.5 506 450 508 452C510 454 512 456.5 514 459C515.5 461 516.5 462.5 518 464.5C519.5 466.5 521 469 522 471C527 480.5 532 489.5 537 499C540.5 505 544 511 547.5 517C551 523 554 529 558 534.5C558.5 535.5 560 536.5 561 537C562 537.5 563 537 564 537C575.5 537 586.5 537 598 537C603.5 537 608.5 537 614 537C624 537 634 537 644 537C648.5 537 653.5 537.5 658 537.5C658.5 537.5 659.5 537.5 660 537C660.5 536.5 661.5 536 662 535.5C666.5 531.5 671 527.5 675.5 523C680 518.5 684 514 688 509C691.5 504.5 695 499.5 698.5 495C703 489 707 483 711 477C715 470.5 719 463.5 722.5 457C726 450.5 730 444 733 437C736 430.5 739 423.5 741.5 417C744 411 745.5 404.5 748 398.5C748.5 397.5 749.5 395.5 750 395.5C750.5 395.5 751.5 397.5 752 398.5C753 400.5 754 405.5 754 404.5C754 400 754 389 754 381C754 371.5 754 362.5 754 353C754 342.5 754 331.5 754 321C754 314.5 754 306 754 301C753.5 301 750 301 748 301C737.5 301 726.5 301 716 301C708 301 700 301 692 301C680 301 668 301 656 301C648 301 640 301 632 301C623.5 301 614.5 301 606 301C597.5 301 588.5 301 580 301C568 301 556 301 544 301C536.5 301 529.5 301 522 301C513.5 301 504.5 301 496 301C485.5 301 474.5 301 464 301C454.5 301 445.5 301 436 301C433.5 301 430.5 301 428 301C416.5 301 405.5 301 394 301C387.5 301 380.5 301 374 301C361.5 301 348.5 301 336 301Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 16.5,
        flaecheAnteil: 0.638,
      },
      {
        stufe: 2,
        schwelle: 0.883,
        d: 'M434 301C434 301 433.5 301 433.5 301C434 302 435.5 303.5 435.5 305C435.5 307 433.5 309 433 311C432.5 313.5 433 316.5 433.5 319C433.5 320.5 434 322 434.5 323C435.5 325 437.5 327 439 329C441 331 443.5 333 445.5 335C448 337 450.5 339 453 341C456 343 459.5 345 462.5 347C471.5 353 481 358.5 490 364.5C495.5 368 501 372 506 376C509 378.5 511.5 381 514 383.5C516 385.5 518 387.5 520 389.5C522 392 523.5 394.5 525.5 397C527 399.5 528.5 401.5 530 404C532.5 409 535.5 414 537.5 419C540 425 542.5 431 544 437C545 440 545.5 443.5 545.5 447C546 456.5 545.5 465.5 546 475C546 477 546.5 479 547 481C549 487 551 493 553 499C554.5 503 556 506.5 558 510.5C558.5 511.5 559 512.5 560 513.5C560.5 514 561.5 514.5 562 515C562.5 515 563.5 515 564 515C571.5 515 578.5 515 586 515C594 515 602 515 610 515C617.5 515 624.5 515 632 515C640 515 648 515.5 656 515C657.5 515 659 514.5 660 514C661 513.5 661.5 512.5 662 512C664 509.5 665.5 507.5 667 505C669 501.5 671 498.5 673 495C675 491 677 487 679 483C680 481 681 479 681.5 477C682.5 474 683 470.5 683 467C684 454.5 684 441.5 684.5 429C684.5 426.5 685 423.5 685.5 421C687.5 414 689.5 407 692 400C694.5 393 697 386 699.5 379C703.5 368.5 707.5 357.5 711.5 347C713 342.5 714.5 337.5 716 333C717 329 718 325 718.5 321C719 317.5 719 314.5 719 311C719 309 718 307 718 305C718 303.5 720 301 719 301C711.5 301 701 301 692 301C685.5 301 678.5 301 672 301C664 301 656 301 648 301C634.5 301 621.5 301 608 301C599.5 301 590.5 301 582 301C570 301 558 301 546 301C540 301 534 301 528 301C526.5 301 525.5 301 524 301C522.5 301 521.5 301 520 301C519.5 301 518.5 301 518 301C504.5 301 491.5 301 478 301C472 301 466 301 460 301C451.5 301 442.5 301 434 301Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 10,
        flaecheAnteil: 0.36,
      },
      {
        stufe: 3,
        schwelle: 0.958,
        d: 'M562 301C561.5 301 560 301 560 301C560 302 562 303.5 562 305C562 307 559.5 309 559.5 311C559 316 559.5 321.5 559.5 327C559.5 328.5 559.5 329.5 560 331C561.5 337 564 343 565.5 349C566.5 352.5 567 355.5 567.5 359C568 363 568.5 367 568.5 371C569 377 569 383 569 389C569 401 568 413 567.5 425C567 435 566 445 565 455C564.5 461.5 564 468.5 562.5 475C562 476.5 560 477.5 559.5 479C559 480 558.5 481.5 558.5 483C558.5 484.5 558.5 485.5 559 487C559 488 559.5 489.5 560 490.5C560.5 491 561.5 491.5 562 492C562.5 492.5 563.5 492.5 564 492.5C571.5 492.5 578.5 492.5 586 492.5C594 492.5 602 492.5 610 492.5C617.5 492.5 624.5 492.5 632 492.5C640 492.5 648 492.5 656 492.5C656.5 492.5 657.5 492.5 658 492.5C658.5 492 659.5 491.5 660 491C660.5 490.5 661.5 490 661.5 489C662 487 662.5 485 662.5 483C662.5 482 662.5 480.5 662 479.5C661.5 478 661 476.5 660.5 475C660 471 659.5 467 659 463C658 455.5 657 448.5 656.5 441C655.5 431.5 655 422.5 654.5 413C654 406.5 654 399.5 653.5 393C653 386.5 652.5 379.5 652.5 373C652.5 369 652.5 365 652.5 361C652.5 349.5 652.5 338.5 652.5 327C652.5 321.5 652.5 316.5 652 311C652 309 650.5 307 650.5 305C650.5 303.5 653 301 652 301C647 301 638.5 301 632 301C624.5 301 617.5 301 610 301C603.5 301 596.5 301 590 301C580.5 301 571.5 301 562 301Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 7.5,
        flaecheAnteil: 0.159,
      },
      {
        stufe: 4,
        schwelle: 0.979,
        d: 'M608 326.5C607 327 606.5 327.5 606 328.5C605 330.5 604 333 603 335C602 338.5 601 341.5 600 345C599 348 598.5 351 598 354C596.5 361.5 595.5 369.5 594 377C592.5 387.5 590.5 398.5 589 409C588.5 413 588 417 587.5 421C586.5 426.5 585.5 431.5 584.5 437C583.5 443.5 582.5 450.5 581 457C580 463 578.5 469 577 475C576.5 476 576 476.5 575 477C571 478.5 566 479 562 480.5C561 481 561 482 561 483C561 484 561.5 485 562 485.5C562.5 486 563.5 486.5 564 486.5C571.5 487 578.5 486.5 586 486.5C594 486.5 602 486.5 610 486.5C617.5 486.5 624.5 486.5 632 486.5C640 486.5 648 486.5 656 486.5C656.5 486.5 657.5 486.5 658 486C658.5 485.5 659.5 484 659.5 483C659.5 482.5 659.5 481.5 659 481C659 480.5 658.5 480 658 480C654.5 479 651 478.5 647.5 477C646.5 476.5 645.5 476 645.5 475C642 463 639.5 451 637 439C635.5 432.5 634.5 425.5 633 419C630.5 406.5 628.5 394.5 626 382C625.5 378.5 624.5 375 624 371.5C622 362.5 620.5 353.5 618 344.5C617 340.5 615.5 336 614 332C613.5 330.5 613 329.5 612 328.5C611.5 327.5 611 327 610 326.5C609.5 326 608.5 326 608 326.5Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 7,
        flaecheAnteil: 0.063,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '16a63379aa04f60f',
      modell: MODELL,
      raster: 2,
      iterationen: 5,
      residuum: 2.55351295663786e-15,
    },
  },
  'raum-heizkoerper': {
    id: 'raum-heizkoerper',
    innen: { x: 0, y: 0, breite: 420, hoehe: 250 },
    wachstum: 'radial',
    baender: [
      {
        stufe: 1,
        schwelle: 0.725,
        d: 'M-4 -4C-4 -4 -4 -1.5 -4 0C-4 2 -4 4 -4 6C-4 12.5 -4 19.5 -4 26C-4 34 -4 42 -4 50C-4 60 -4 70 -4 80C-4 90 -4 100 -4 110C-4 120.5 -4 131.5 -4 142C-4 151.5 -4 160.5 -4 170C-4 172.5 -4 175.5 -4 178C-4 182 -4 186 -4 190C-4 201.5 -4 212.5 -4 224C-4 228.5 -4 235 -4 237C0 239.5 9.5 238 16 237.5C17.5 237.5 19 237 20 236C21.5 235 23 233.5 24.5 232C30 226 34.5 219 40 213C42.5 210.5 45 208 48 205.5C50 204 52 203 54 201.5C56 200.5 58 199 60 198C64 196.5 68 195 72 194C74.5 193.5 77.5 193 80 192.5C83.5 192 86.5 191.5 90 191.5C94 191 98 191 102 191C114.5 190.5 127.5 190 140 189.5C147.5 189 154.5 189 162 188.5C170.5 188 179.5 187.5 188 186.5C196 185.5 204 184.5 212 183.5C220.5 182.5 229 181.5 237.5 180C245 179 252.5 177.5 260 176C267.5 174.5 274.5 172.5 282 170.5C288 169 294 167 300 165C304.5 163.5 309.5 162 314 160C318.5 158 322.5 156 326.5 154C330 152 333.5 150 337 148C340 146 342.5 144 345 142C347.5 140 349.5 138 351.5 136C353.5 133.5 355.5 131 357.5 128C359 125.5 360.5 122.5 362 120C363.5 117.5 364.5 115 365.5 112C366.5 108.5 367.5 104.5 368 101C368.5 98 368.5 95 368.5 92C368.5 85.5 368.5 78.5 368.5 72C368.5 64.5 368.5 57.5 368.5 50C368.5 38 368.5 26 368 14C368 11.5 368 8.5 367.5 6C367 4 365.5 2 365.5 0C365.5 -1.5 368 -3.5 367 -4C364 -4 358.5 -4 354 -4C341.5 -4 328.5 -4 316 -4C308 -4 300 -4 292 -4C281.5 -4 270.5 -4 260 -4C246.5 -4 233.5 -4 220 -4C210.5 -4 201.5 -4 192 -4C181.5 -4 170.5 -4 160 -4C150.5 -4 141.5 -4 132 -4C124.5 -4 117.5 -4 110 -4C102 -4 94 -4 86 -4C80 -4 74 -4 68 -4C61.5 -4 54.5 -4 48 -4C38.5 -4 29.5 -4 20 -4C12 -4 3 -4 -4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 22,
        flaecheAnteil: 0.641,
      },
      {
        stufe: 2,
        schwelle: 0.783,
        d: 'M-4 -4C-4 -4 -4 -1.5 -4 0C-4 2 -4 4 -4 6C-4 12.5 -4 19.5 -4 26C-4 34 -4 42 -4 50C-4 60 -4 70 -4 80C-4 90 -4 100 -4 110C-4 120.5 -4 131.5 -4 142C-4 151.5 -4 160.5 -4 170C-4 172.5 -4 175.5 -4 178C-4 183.5 -4 188.5 -4 194C-4 207 -4 221 -4 232.5C-4 233.5 -2.5 231.5 -2 231C-1.5 230.5 -0.5 230 0 230C2 230.5 4 232 6 233C6.5 233.5 7.5 233.5 8 233.5C9.5 233.5 10.5 234 12 233.5C13 233.5 14.5 232.5 15.5 232C16 231.5 16.5 231 17 230C20 223.5 23 216.5 26 210C28.5 204.5 31 199 34 193.5C38 186 42 179 46 172C48 169 50 166 52 163.5C54 161 56 159 58 157C60 155 62 153.5 64 152C66 150.5 68 149 70 148C73 146.5 76.5 145 80 143.5C84.5 142 89.5 140 94 139C98 138 102 137.5 106 137C116.5 135.5 127.5 134 138 132.5C142.5 132 147.5 131 152 130C157.5 129 162.5 127.5 168 126.5C172.5 125.5 177.5 124.5 182 123C187 121.5 191.5 120 196.5 118C201 116.5 205.5 114.5 210 112.5C214 110.5 218 108.5 222 106C225.5 104 228.5 102 232 99.5C234.5 97.5 237.5 95.5 240 93.5C243 91 246 88.5 248.5 86C251 83.5 253.5 80.5 255.5 78C258 75 260 72.5 262 69.5C264 66.5 266 63 267.5 60C269.5 56.5 271 53.5 272.5 50C274 47 274.5 43.5 275.5 40C276 37.5 277 34.5 277 32C277.5 23.5 278 14.5 277.5 6C277.5 4 275 2 275 0C275 -1.5 278 -4 277 -4C268 -4 255 -4 244 -4C230.5 -4 217.5 -4 204 -4C196 -4 188 -4 180 -4C170.5 -4 161.5 -4 152 -4C143.5 -4 134.5 -4 126 -4C120 -4 114 -4 108 -4C98 -4 88 -4 78 -4C74 -4 70 -4 66 -4C60 -4 54 -4 48 -4C39.5 -4 30.5 -4 22 -4C13.5 -4 3.5 -4 -4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 14,
        flaecheAnteil: 0.358,
      },
      {
        stufe: 3,
        schwelle: 0.831,
        d: 'M-4 -4C-4 -4 -4 -1.5 -4 0C-4 2 -4 4 -4 6C-4 12.5 -4 19.5 -4 26C-4 34 -4 42 -4 50C-4 60 -4 70 -4 80C-4 90 -4 100 -4 110C-4 120.5 -4 131.5 -4 142C-4 151.5 -4 160.5 -4 170C-4 172.5 -4 175.5 -4 178C-4 182 -4 186 -4 190C-4 201 -4 213 -4 222.5C-4 223.5 -3 221 -2 220.5C-1.5 220 -0.5 220 0 220C0.5 220 1.5 220 2 220.5C3.5 221.5 4.5 223.5 6 224.5C6.5 225 7.5 225.5 8 225.5C8.5 225.5 9.5 225.5 10 225.5C10.5 225.5 11.5 226 12 225.5C13 225 13.5 224.5 14 223.5C15 222 16 220 16.5 218C20 208 24 198 27 188C29.5 181 31 173.5 33 166C34.5 159.5 36 152.5 38 146C39 141.5 40.5 137 42 132.5C44 127.5 45.5 122.5 48 118C49.5 114.5 52 111 54 108C56.5 104.5 59 101 62 98C64 96 66 94 68 92.5C70 91 72 89.5 74 88C78 85.5 82 82.5 86 80.5C95.5 75.5 105 71 114.5 66C118 64 122 62 125.5 60C129 58 132.5 55.5 136 53C139 51 141.5 48.5 144 46C146.5 43.5 149 41 151 38C152.5 35.5 154 33 155 30C155.5 28 156 26 156 24C156 18 156 12 155.5 6C155.5 5.5 155.5 4.5 155 4C154 2.5 152 1.5 152 0C152 -1.5 156.5 -4 155 -4C148.5 -4 137 -4 128 -4C122 -4 116 -4 110 -4C102 -4 94 -4 86 -4C79.5 -4 72.5 -4 66 -4C60 -4 54 -4 48 -4C38.5 -4 29.5 -4 20 -4C12 -4 3 -4 -4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 6,
        flaecheAnteil: 0.161,
      },
      {
        stufe: 4,
        schwelle: 0.868,
        d: 'M4 -4C3 -4 5 -1.5 5 0C5 2 4 4 3.5 6C3 11.5 3 17 2 22.5C1.5 25 0.5 29.5 0 29.5C-0.5 29.5 -1.5 25 -2 22.5C-3 16 -3.5 2 -4 3.5C-4 5.5 -4 22.5 -4 32C-4 41.5 -4 50.5 -4 60C-4 69.5 -4 78.5 -4 88C-4 97.5 -4 106.5 -4 116C-4 125.5 -4 134.5 -4 144C-4 152.5 -4 161.5 -4 170C-4 172.5 -4 175.5 -4 178C-4 189 -4 202 -4 211.5C-4 212.5 -2.5 210 -2 209.5C-1.5 209 -0.5 208.5 0 208.5C0.5 208.5 1.5 209 2 209.5C3.5 210.5 4.5 212.5 6 213.5C7 214 8.5 214.5 10 214.5C10.5 214.5 11.5 214.5 12 214C13 213.5 13.5 213 14 212C15 210 16 208 16.5 206C18.5 200.5 20 195.5 21.5 190C23 184 23.5 178 24.5 172C25 168.5 25.5 165.5 25.5 162C26 149.5 26.5 136.5 27 124C27.5 118 27.5 112 28 106C28.5 98 29 90 30.5 82C32.5 70.5 35.5 59.5 37.5 48C38.5 41.5 38.5 34.5 39 28C39.5 21.5 39.5 14.5 39.5 8C39.5 6.5 39.5 5 39 4C38.5 2.5 36.5 1.5 36.5 0C36.5 -1.5 40.5 -4 39 -4C29.5 -4 14 -4 4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 0,
        flaecheAnteil: 0.06,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '16a63379aa04f60f',
      modell: MODELL,
      raster: 2,
      iterationen: 5,
      residuum: 2.220446049250313e-15,
    },
  },
  'raum-fussboden': {
    id: 'raum-fussboden',
    innen: { x: 0, y: 0, breite: 420, hoehe: 250 },
    wachstum: 'senkrecht',
    baender: [
      {
        stufe: 1,
        schwelle: 0.513,
        d: 'M284 -4C283.5 -4 282 -4 282.5 -4C283.5 -3.5 286.5 -3 288.5 -2C289.5 -1.5 291 -0.5 291 0C291 0.5 289.5 1.5 288.5 2C278.5 6 268 9 258 12.5C249 16 240.5 19 232 23C224 26.5 216 30.5 208 34.5C199 39 190.5 43.5 182 48.5C172.5 54 163 59 154 65C144 71.5 134 78.5 124 85C116 90.5 108 96 100 101.5C95.5 104.5 90.5 108 86 111C79.5 115.5 73.5 119.5 67 124C60 129 53 133.5 46 138.5C42 141.5 38 144 34 147C24 154 14 161 4 168C3 169 1.5 170 0 170C-1.5 170 -4 167 -4 168C-4 173.5 -4 182.5 -4 190C-4 197.5 -4 204.5 -4 212C-4 224 -4 236 -4 248C-4 250 -4 253.5 -4 254C6.5 254 20 254 32 254C40 254 48 254 56 254C67.5 254 78.5 254 90 254C102.5 254 115.5 254 128 254C135.5 254 142.5 254 150 254C159.5 254 168.5 254 178 254C186.5 254 195.5 254 204 254C215.5 254 226.5 254 238 254C248.5 254 259.5 254 270 254C279.5 254 288.5 254 298 254C306.5 254 315.5 254 324 254C336.5 254 349.5 254 362 254C371.5 254 380.5 254 390 254C401.5 254 414 254 424 254C424 254 424 251.5 424 250C424 248.5 424 247.5 424 246C424 234 424 222 424 210C424 209.5 424 208.5 424 208C424 201.5 424 194.5 424 188C424 186 424 184 424 182C424 179.5 424 176.5 424 174C424 166 424 158 424 150C424 143.5 424 136.5 424 130C424 129.5 424 128.5 424 128C424 116 424 104 424 92C424 88 424 84 424 80C424 67.5 424 54.5 424 42C424 29.5 424 16.5 424 4C424 1.5 424 -2 424 -4C424 -4 422.5 -4 422 -4C410.5 -4 399.5 -4 388 -4C376 -4 364 -4 352 -4C340.5 -4 329.5 -4 318 -4C306.5 -4 295.5 -4 284 -4Z',
        ursprung: { x: 210, y: 250 },
        startTakte: 22,
        flaecheAnteil: 0.788,
      },
      {
        stufe: 2,
        schwelle: 0.554,
        d: 'M388 132C380 132.5 372 133 364 134C356 135 348 136 340 137C332 138 324 139.5 316 141C307.5 142.5 298.5 144.5 290 146.5C281.5 148.5 272.5 150.5 264 152.5C254.5 155 245.5 157.5 236 160C225.5 163 214.5 166.5 204 169.5C191.5 173.5 178.5 177 166 181C155.5 184.5 144.5 187.5 134 191C121.5 195 108.5 199 96 203C88 205.5 80 208.5 72 211C65.5 213 58.5 215 52 217.5C42.5 220.5 33.5 224 24 227.5C16.5 230.5 9.5 233.5 2 236.5C1.5 237 0.5 237 0 237C-1.5 237 -4 235 -4 236C-4 240.5 -4 249.5 -4 254C-3.5 254 0 254 2 254C8.5 254 15.5 254 22 254C30.5 254 39.5 254 48 254C56 254 64 254 72 254C84 254 96 254 108 254C115.5 254 122.5 254 130 254C141.5 254 152.5 254 164 254C174 254 184 254 194 254C200.5 254 207.5 254 214 254C224 254 234 254 244 254C256 254 268 254 280 254C286.5 254 293.5 254 300 254C310 254 320 254 330 254C337.5 254 344.5 254 352 254C361.5 254 370.5 254 380 254C385.5 254 390.5 254 396 254C405.5 254 416 254 424 254C424 254 424 251.5 424 250C424 248.5 424 247.5 424 246C424 238 424 230 424 222C424 213.5 424 204.5 424 196C424 195.5 424 194.5 424 194C424 191.5 424 188.5 424 186C424 185.5 424 184.5 424 184C424 181.5 424 178.5 424 176C424 168.5 424 161.5 424 154C424 146.5 424 134 424 131C416.5 126.5 400 131.5 388 132Z',
        ursprung: { x: 210, y: 250 },
        startTakte: 0,
        flaecheAnteil: 0.312,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '16a63379aa04f60f',
      modell: MODELL,
      raster: 2,
      iterationen: 1,
      residuum: 1.1102230246251565e-15,
    },
  },
});
