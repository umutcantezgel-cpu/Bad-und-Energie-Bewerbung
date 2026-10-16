/**
 * Wärmefeld 2.0 (E-031, KERN K-010): berechnete Isothermen im Rauminneren als Bänder, kühl → heiß.
 *
 * ERZEUGT von scripts/zeichnung/waermefeld.ts (`bun run zeichnung:waermefeld`), nicht von Hand ändern. Geprüft von
 * `bun run zeichnung:waermefeld --pruefen` und lib/zeichnung/__tests__/waermefeld.test.ts (Lock: die Rechnung ergibt
 * genau diese Datei). Rechnung: lib/zeichnung/waerme/ (eingabe.ts Aufgaben und Quellen, feld.ts Raumluftmodell,
 * kontur.ts Isothermen, rechnung.ts Ablauf).
 *
 * Vertrag (lib/zeichnung/__tests__/waermefeld-vertrag.test.ts, lib/motion/__tests__/register.test.ts):
 * - Band 0 ist das Innenrechteck `innen` (eine Fläche ohne Pfad, steht still); `baender` sind die Bänder 1 bis
 *   höchstens 4, aufsteigend nach Stufe (kühl → heiß), in der Reihenfolge, in der sie übereinander liegen.
 * - `schwelle`: θ (0 außen, 1 Vorlauf), oberhalb der das Band liegt; jedes Feld auf das Raummittel 20 °C eingestellt
 *   (Thermostat). Vergleichsräume auf derselben absoluten Skala: Stufe k bei einer festen Temperatur über der mittleren
 *   Raumluft (lib/zeichnung/waerme/eingabe.ts SKALA_VERGLEICH), gleiche Stufe heißt in beiden Räumen gleich warm; die
 *   Fußbodenheizung erreicht die beiden heißesten Stufen nicht (sie stehen nur in der Fahne über dem Heizkörper).
 *   Hausschnitt bei 64, 45, 2 und 1 % der Raumluft (SKALA_HERO). Ein Band erst ab 2 % der Fläche (`flaecheAnteil`).
 * - Jedes Band liegt in `innen` (± 4 Einheiten Spiegelrand, den die Wände der Zeichnung decken), Band k + 1 liegt in
 *   Band k, alle Zahlen im Pfad liegen auf dem 0,5-Raster.
 * - `startTakte` (Verzögerung in Takten zu 80 ms, halbe Takte) steigt streng von heiß nach kühl. Hausschnitt (Hero,
 *   Auslöser `nachlauf`) im Fenster 7…16,5 Takte, die Vergleichsräume der Wärmepumpen-Seite (Auslöser `sicht`) im
 *   Fenster 0…22 Takte; das Bewegungsregister (lib/motion/register.ts, `waerme-breitet-sich-aus`) führt genau diese
 *   Werte. Erst steigt die Fahne, dann erscheint die Deckenschicht (Prüfrunde 4 B4-2): `bewegung` `wachsen` heißt
 *   senkrecht (`wachstum`, scaleY) aus `ursprung` – die Fahne aus der Mitte der Oberkante des Heizkörpers nach oben,
 *   die warme Schicht der Fußbodenheizung aus der Mitte des Bodens; `einblenden` heißt an Ort und Stelle nur über die
 *   Deckkraft – jedes Band, das die Decke außerhalb der Fahne berührt (die Deckenschicht hängt von Anfang an an der
 *   Decke, `ursprung` dort über der Fahne; ohne Heizkörper am Boden).
 * - `herkunft`: `iterationen` = Runden, in denen das Raummittel eingestellt wurde, `residuum` = verbleibende
 *   Abweichung des Raummittels (θ).
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
  /**
   * `wachsen`: senkrecht (scaleY) aus dem Ursprung, die Fahne und die warme Schicht über dem Fußboden;
   * `einblenden`: an Ort und Stelle (nur Deckkraft), jedes Band, das die Decke außerhalb der Fahne berührt.
   */
  bewegung: 'wachsen' | 'einblenden';
  /** Startverzögerung in Takten (80 ms), halbe Takte. */
  startTakte: number;
  /** Anteil der Bandfläche am Innenrechteck (0 < a ≤ 1). */
  flaecheAnteil: number;
}

export interface Waermefeld {
  id: WaermefeldId;
  /** Rauminneres = Band 0. */
  innen: Rechteck;
  /** Wie die Bänder wachsen: senkrecht (scaleY) aus dem Ursprung jedes Bands. */
  wachstum: 'senkrecht';
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
  'Halbempirisches Raumluftmodell (Prüfrunde 4), θ = 0 außen, 1 am Vorlauf (Schätzwerte −12 und 55 °C), Raumluft im Mittel 20 °C (DIN/TS 12831-1, außerhalb der Fahne gemittelt, wie ein Thermostat). Mit Heizkörper stabile Schichtung nach dem Filling-Box-Modell (Baines & Turner 1969): Isothermen außerhalb von Fahne und Wandgrenzschicht waagerecht, 1 K/m im Kern, warme Schicht unter der Decke (+1,5 K, Grenze 0,7 m unter der Decke), Kaltluftsee am Boden (−1,2 K); Auftriebsfahne über dem Heizkörper nach Morton, Taylor & Turner 1956 (Halbbreite 0,12·ζ ab dem virtuellen Ursprung, Übertemperatur auf der Achse ∝ 1/ζ, 8 K an der Oberkante, von vorn eine Glocke über die Baulänge); auf und am Heizkörper die Luft seiner Grenzschicht, darunter keine; kalte Außenwand mit der Oberfläche U·R_si unter der Raumluft (0,28 W/(m²·K), 0,13 m²·K/W), Fallströmung 80 mm am Boden und Kaltluftsee am Fuß, außer wo der Heizkörper davor steht (VDI 6030). Fußbodenheizung: −0,2 K/m, +1 K über dem warmen Boden, nur an der Außenwand kühler. Größen ohne Quelle sind Schätzwerte (lib/zeichnung/waerme/eingabe.ts). Bänder: Vergleichsräume auf derselben absoluten Skala bei −0,4, +0,3, +3 und +3,7 K über der mittleren Raumluft (die beiden heißesten nur in der Fahne), Hausschnitt bei 64, 45, 2 und 1 % der Raumluft; ein Band nur ab 2 % der Fläche. Reihenfolge aus der Ankunft der Wärme, nach √t ins Fenster: erst die Fahne, dann die Deckenschicht von oben (erste Front nach Baines & Turner), mit Fußbodenheizung vom Boden. Gitter 2 Einheiten, auf 1 Einheit gleiches Mittel und gleiche Flächen. Hausschnitt: Schnittebene vor der Rückwand, der Heizkörper an der Rückwand liegt in der Ebene.';

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
    wachstum: 'senkrecht',
    baender: [
      {
        stufe: 1,
        schwelle: 0.474,
        d: 'M326 301C326 301.5 326 303.5 326 305C326 317.5 326 330.5 326 343C326 347 326 351 326 355C326 367 326 379 326 391C326 395.5 326 404 326 404.5C326.5 404.5 327 396.5 328 392.5C328.5 391 329.5 387.5 330 387.5C330.5 387.5 331.5 390.5 332 392.5C334.5 405.5 335.5 419 338 432C338.5 433.5 339 435 340 436C340.5 436.5 341.5 436 342 436C350.5 436 359.5 436.5 368 436.5C374.5 436.5 381.5 436.5 388 436.5C398.5 436.5 409.5 436.5 420 437C427.5 437 434.5 437.5 442 438C448 438.5 454 439 460 439.5C465.5 440 470.5 440.5 476 441C480.5 441.5 485.5 442.5 490 443.5C493.5 444 496.5 445 500 446C503.5 447 507 448.5 510 450C513 451.5 515.5 453 518 454.5C520 456 522 457.5 524 459C527 461.5 529.5 464 532 467C534 469.5 535 472.5 537 475C537.5 476 538.5 476.5 539.5 477C541.5 478 544 479 546 480C546.5 480 546.5 480.5 546.5 481C547 482.5 548 483.5 548 485C549.5 493 550 501 551 509C551.5 514.5 552.5 519.5 553.5 525C553.5 526.5 554 527.5 554.5 529C555 530.5 556 531.5 556.5 533C557 533.5 557.5 534.5 558 535C558.5 535.5 559.5 536 560 536C561.5 536.5 562.5 536.5 564 536.5C571.5 536.5 578.5 536.5 586 536.5C594 536.5 602 536.5 610 536.5C617.5 536.5 624.5 536.5 632 536.5C640 536.5 648 536.5 656 536.5C657.5 536.5 658.5 536.5 660 536C660.5 536 661.5 535.5 662 535C663 534 664.5 532.5 665 531C666 528.5 666.5 525.5 667 523C669 510.5 670 497.5 672 485C672.5 483 673 481 674 480C675.5 478.5 678.5 478 680.5 477C681.5 476.5 682.5 476 683 475C684.5 473 685 471 686.5 469C688 466.5 690 464.5 692 462.5C694 460.5 696 458.5 698 457C700 455.5 702 454 704 453C706 452 708 451 710 450C712.5 449 715.5 448 718 447C725.5 445 733.5 444 740 441C741.5 440.5 741.5 438.5 742 437C743.5 429 744 421 745 413C745.5 407.5 746.5 402.5 747.5 397C747.5 396 747.5 395.5 748 394.5C748.5 392.5 749.5 389 750 389C750.5 389 751.5 392.5 752 394.5C753 398.5 753.5 407.5 754 407C754 406.5 754 396.5 754 391C754 381 754 371 754 361C754 355 754 349 754 343C754 330.5 754 317.5 754 305C754 303.5 754 301.5 754 301C753.5 301 751.5 301 750 301C748 301 746 301 744 301C732 301 720 301 708 301C698.5 301 689.5 301 680 301C673.5 301 666.5 301 660 301C648 301 636 301 624 301C619.5 301 614.5 301 610 301C604.5 301 599.5 301 594 301C580.5 301 567.5 301 554 301C543.5 301 532.5 301 522 301C514.5 301 507.5 301 500 301C490 301 480 301 470 301C462 301 454 301 446 301C438 301 430 301 422 301C416 301 410 301 404 301C402.5 301 401.5 301 400 301C395.5 301 390.5 301 386 301C384 301 382 301 380 301C379.5 301 378.5 301 378 301C364.5 301 351.5 301 338 301C335.5 301 332.5 301 330 301C328.5 301 326.5 301 326 301Z',
        ursprung: { x: 610, y: 305 },
        bewegung: 'einblenden',
        startTakte: 16.5,
        flaecheAnteil: 0.659,
      },
      {
        stufe: 2,
        schwelle: 0.49,
        d: 'M326 301C326 301.5 326 303.5 326 305C326 316.5 326 327.5 326 339C326 349.5 326 366 326 371C326 373 327 363.5 328 360C328.5 358 329.5 354 330 354C330.5 354 331.5 358 332 360C333.5 366.5 334.5 373 336 379.5C336.5 381 337 382.5 338 383.5C338.5 384 339.5 384 340 384C347.5 384 354.5 384 362 384C368 384 374 384 380 384C390 384 400 384.5 410 384.5C418 384.5 426 384.5 434 384.5C440 384.5 446 385 452 385C460 385.5 468 385.5 476 386C482.5 386.5 489.5 387 496 387.5C502 388 508 389 514 390C518.5 391 523.5 392 528 393.5C532 395 536 397 540 399C543 400.5 545.5 402.5 548 405C550.5 407 552.5 410 554 412.5C555.5 415 557 418 558 421C559.5 426 560.5 431.5 561.5 437C562.5 442.5 563.5 448 564 453.5C564.5 458 565 462.5 565 467C565 467.5 564.5 468.5 564 469C562.5 470 560 469.5 558 470.5C556.5 471 555 472 554 473C553 474 551.5 475.5 551 477C550.5 478 550.5 479.5 550.5 481C551 489.5 552 498.5 553 507C553.5 512.5 554 517.5 555 523C555.5 525.5 556.5 528.5 557.5 531C558 532 559 533 560 533.5C560.5 534 561.5 534 562 534C562.5 534 563.5 534.5 564 534.5C571.5 534.5 578.5 534.5 586 534.5C594 534.5 602 534.5 610 534.5C617.5 534.5 624.5 534.5 632 534.5C640 534.5 648 534.5 656 534.5C656.5 534.5 657.5 534 658 534C659 533.5 660.5 533.5 661 533C662 532 663 530.5 663.5 529C664.5 526.5 665 523.5 665.5 521C666 516.5 666.5 511.5 667 507C668 497.5 668.5 488.5 669 479C669 477.5 668.5 476 668 475C667.5 474 666.5 473.5 666 473C664.5 472 663.5 471 662 470.5C660 469.5 657.5 470 656 469C655.5 468.5 655 467.5 655 467C655 461 655.5 455 656.5 449C657.5 442.5 658.5 435.5 660 429C660.5 426 661 423 662 420.5C663 418 664 415.5 665.5 413C667 411 668.5 409 670 407C672 405 674 403.5 676 402C678 400.5 680 399 682 398C684.5 396.5 687.5 395.5 690 394.5C693.5 393.5 696.5 392.5 700 391.5C703.5 390.5 706.5 390 710 389.5C714.5 388.5 719.5 388 724 387.5C729.5 387 734.5 386.5 740 386C740.5 386 741.5 386 742 385.5C743 384.5 743.5 383 744 381.5C745.5 375 746.5 368 748 361.5C748.5 359.5 749.5 356 750 356C750.5 356 751.5 359.5 752 361.5C753 365 754 374.5 754 372.5C754 367 754 350 754 339C754 327.5 754 316.5 754 305C754 303.5 754 301.5 754 301C753.5 301 751.5 301 750 301C748 301 746 301 744 301C732 301 720 301 708 301C698.5 301 689.5 301 680 301C673.5 301 666.5 301 660 301C648 301 636 301 624 301C619.5 301 614.5 301 610 301C604.5 301 599.5 301 594 301C580.5 301 567.5 301 554 301C543.5 301 532.5 301 522 301C514.5 301 507.5 301 500 301C490 301 480 301 470 301C467.5 301 464.5 301 462 301C448.5 301 435.5 301 422 301C416 301 410 301 404 301C400 301 396 301 392 301C387.5 301 382.5 301 378 301C364.5 301 351.5 301 338 301C335.5 301 332.5 301 330 301C328.5 301 326.5 301 326 301Z',
        ursprung: { x: 610, y: 305 },
        bewegung: 'einblenden',
        startTakte: 13,
        flaecheAnteil: 0.479,
      },
      {
        stufe: 3,
        schwelle: 0.547,
        d: 'M608 442.5C607.5 443 606.5 443.5 606 444C604.5 445.5 603 447.5 602 449.5C600.5 452.5 599 456 598 459C596.5 463 596.5 468 594 471C592.5 473 589 473 586.5 473C577.5 473.5 569 473 560 473.5C559.5 473.5 558.5 474 558 474.5C557 475 556 476 555 477C554.5 477.5 554 478.5 554 479C554 480.5 554 481.5 554 483C554.5 489.5 555 496.5 555.5 503C556 507.5 556 512.5 557 517C557 518.5 558 519.5 558.5 521C559 522.5 559 524 560 525C560.5 525.5 561.5 525.5 562 526C562.5 526 563.5 526.5 564 526.5C571.5 526.5 578.5 526.5 586 526.5C594 526.5 602 526.5 610 526.5C617.5 526.5 624.5 526.5 632 526.5C640 526.5 648 526.5 656 526.5C656.5 526.5 657.5 526 658 526C658.5 525.5 659.5 525.5 660 525C660.5 524.5 660.5 523.5 661 523C661.5 521.5 662 520.5 662.5 519C663 517 663 515 663.5 513C664 508.5 664.5 503.5 665 499C665.5 493.5 665.5 488.5 666 483C666 481.5 666 480.5 666 479C666 478.5 665.5 477.5 665 477C664 476 663 475 662 474.5C661.5 474 660.5 473.5 660 473.5C651 473 642.5 473.5 633.5 473C631 473 627.5 473 626 471C623 466.5 622 459.5 620 454C619 451 617.5 448.5 616 446C615 444.5 613.5 443.5 612 442.5C611.5 442 610.5 442 610 442C609.5 442 608.5 442 608 442.5Z',
        ursprung: { x: 610, y: 480 },
        bewegung: 'wachsen',
        startTakte: 8,
        flaecheAnteil: 0.061,
      },
      {
        stufe: 4,
        schwelle: 0.566,
        d: 'M608 466C607.5 466.5 606.5 466.5 606 467C604.5 468 604 470 602.5 471C601 472 599 473 597 473C585.5 474 573.5 473.5 562 474C560.5 474 559 474.5 558 475C557 475.5 556.5 476 556 476.5C555.5 477 555 478 554.5 479C554.5 479.5 554.5 480.5 554.5 481C554.5 485.5 554.5 490.5 555 495C555.5 501 556.5 507 557.5 513C558 516 559 519 560 522C560.5 522.5 561.5 523 562 523.5C562.5 524 563.5 524 564 524C571.5 524 578.5 524 586 524C594 524 602 524 610 524C617.5 524 624.5 524 632 524C640 524 648 524 656 524C656.5 524 657.5 524 658 523.5C658.5 523 659.5 522.5 660 522C661 519 662 516 662.5 513C663.5 507 664.5 501 665 495C665.5 490.5 665.5 485.5 665.5 481C665.5 480.5 665.5 479.5 665.5 479C665 478 664.5 477 664 476.5C663.5 476 663 475.5 662 475C661 474.5 659.5 474 658 474C646.5 473.5 634.5 474 623 473C621 473 619 472 617.5 471C616 470 615.5 468 614 467C613.5 466.5 612.5 466.5 612 466C611.5 466 610.5 465.5 610 465.5C609.5 465.5 608.5 466 608 466Z',
        ursprung: { x: 610, y: 480 },
        bewegung: 'wachsen',
        startTakte: 7,
        flaecheAnteil: 0.051,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '1efb5faa812c3ad3',
      modell: MODELL,
      raster: 2,
      iterationen: 5,
      residuum: 5.4567461660326444e-14,
    },
  },
  'raum-heizkoerper': {
    id: 'raum-heizkoerper',
    innen: { x: 0, y: 0, breite: 420, hoehe: 250 },
    wachstum: 'senkrecht',
    baender: [
      {
        stufe: 1,
        schwelle: 0.472,
        d: 'M-4 -4C-4 5 -4 20 -4 32C-4 36.5 -4 41.5 -4 46C-4 58.5 -4 71.5 -4 84C-4 91.5 -4 98.5 -4 106C-4 116 -4 126 -4 136C-4 146 -4 156 -4 166C-4 170 -4 174 -4 178C-4 186.5 -4 195.5 -4 204C-4 213 -4 223.5 -4 230.5C-4 231.5 -1.5 228 0 228C1.5 228 2.5 229.5 4 230.5C4.5 231 5.5 231.5 6 231.5C8.5 232 11.5 232 14 231.5C14.5 231.5 15.5 231 16 230.5C17 230 18 229 18.5 228C19.5 226 20.5 224 21 222C21.5 219.5 22 216.5 22.5 214C24.5 202 26 190 27.5 178C27.5 176 28 174 27.5 172C27 169.5 25 166.5 24.5 164C24.5 163.5 24.5 162.5 25 162C26.5 159 28 155.5 30 152.5C31 150.5 32.5 149 34 147.5C35.5 146 36.5 144.5 38 143.5C40.5 141.5 43 140 46 138.5C49 137 52.5 136.5 56 135.5C58.5 135 61.5 134.5 64 134C68 133.5 72 133 76 133C88 132.5 100 132.5 112 132C120.5 132 129.5 131.5 138 131.5C144.5 131.5 151.5 131.5 158 131.5C166 131.5 174 131.5 182 131.5C192 131.5 202 131.5 212 131.5C218.5 131.5 225.5 131.5 232 131.5C240 131.5 248 131.5 256 131.5C265.5 131.5 274.5 131.5 284 131.5C296 131.5 308 131.5 320 131.5C327.5 131.5 334.5 131.5 342 131.5C350.5 131.5 359.5 131.5 368 131.5C379.5 131.5 390.5 131.5 402 131.5C409.5 131.5 421 136 424 131.5C424 125.5 424 110.5 424 100C424 95.5 424 90.5 424 86C424 74 424 62 424 50C424 45.5 424 40.5 424 36C424 24 424 12 424 0C424 -1.5 424 -3.5 424 -4C421.5 -4 417.5 -4 414 -4C406 -4 398 -4 390 -4C382.5 -4 375.5 -4 368 -4C360 -4 352 -4 344 -4C343.5 -4 342.5 -4 342 -4C336 -4 330 -4 324 -4C312.5 -4 301.5 -4 290 -4C285.5 -4 280.5 -4 276 -4C266 -4 256 -4 246 -4C232.5 -4 219.5 -4 206 -4C193.5 -4 180.5 -4 168 -4C158 -4 148 -4 138 -4C130 -4 122 -4 114 -4C108 -4 102 -4 96 -4C88 -4 80 -4 72 -4C61.5 -4 50.5 -4 40 -4C29.5 -4 18.5 -4 8 -4C4 -4 -3 -4 -4 -4Z',
        ursprung: { x: 10, y: 0 },
        bewegung: 'einblenden',
        startTakte: 22,
        flaecheAnteil: 0.552,
      },
      {
        stufe: 2,
        schwelle: 0.482,
        d: 'M-4 -4C-4 5 -4 20 -4 32C-4 36.5 -4 41.5 -4 46C-4 58.5 -4 71.5 -4 84C-4 91.5 -4 98.5 -4 106C-4 116 -4 126 -4 136C-4 146 -4 156 -4 166C-4 170 -4 174 -4 178C-4 186.5 -4 195.5 -4 204C-4 212.5 -4 223.5 -4 229C-4 230.5 -1.5 225 0 225C1.5 225 2.5 228 4 229C4.5 229.5 5.5 230 6 230C8.5 230.5 11.5 230.5 14 230C15 230 16.5 229 17 228C18 227 18.5 225.5 19 224C20 220.5 21 217.5 21.5 214C23 201.5 24 188.5 25 176C25 174.5 25 173.5 24.5 172C24.5 171.5 24 170.5 23.5 170C23 169 22.5 168 22 167.5C20.5 166 18.5 165.5 17 164C16.5 163.5 16.5 162.5 16.5 162C17.5 156.5 18.5 151 20 145.5C22 138 23.5 130 26 122.5C27 119 28.5 115.5 30 112.5C31 110.5 32.5 108.5 34 106.5C35 105 36.5 104 38 103C39.5 102 40.5 101 42 100C44 99 46 98 48 97.5C50.5 96.5 53.5 96 56 95.5C60 95 64 94 68 94C79.5 93.5 90.5 93.5 102 93C110.5 93 119.5 92.5 128 92.5C134 92.5 140 92.5 146 92.5C154.5 92.5 163.5 92.5 172 92.5C182.5 92.5 193.5 92.5 204 92.5C210.5 92.5 217.5 92.5 224 92.5C232 92.5 240 92.5 248 92.5C258 92.5 268 92.5 278 92.5C290 92.5 302 92.5 314 92.5C322 92.5 330 92.5 338 92.5C346.5 92.5 355.5 92.5 364 92.5C376 92.5 388 92.5 400 92.5C408 92.5 418 94.5 424 92.5C424 92 424 87 424 84C424 73.5 424 62.5 424 52C424 47.5 424 42.5 424 38C424 25.5 424 12.5 424 0C424 -1.5 424 -3.5 424 -4C421.5 -4 417.5 -4 414 -4C406 -4 398 -4 390 -4C382.5 -4 375.5 -4 368 -4C358 -4 348 -4 338 -4C337.5 -4 336.5 -4 336 -4C332 -4 328 -4 324 -4C312.5 -4 301.5 -4 290 -4C285.5 -4 280.5 -4 276 -4C266 -4 256 -4 246 -4C232.5 -4 219.5 -4 206 -4C193.5 -4 180.5 -4 168 -4C158 -4 148 -4 138 -4C130 -4 122 -4 114 -4C108 -4 102 -4 96 -4C88 -4 80 -4 72 -4C61.5 -4 50.5 -4 40 -4C29.5 -4 18.5 -4 8 -4C4 -4 -3 -4 -4 -4Z',
        ursprung: { x: 10, y: 0 },
        bewegung: 'einblenden',
        startTakte: 11,
        flaecheAnteil: 0.406,
      },
      {
        stufe: 3,
        schwelle: 0.522,
        d: 'M-4 -4C-4 5 -4 20 -4 32C-4 36.5 -4 41.5 -4 46C-4 58.5 -4 71.5 -4 84C-4 91.5 -4 98.5 -4 106C-4 116 -4 126 -4 136C-4 146 -4 156 -4 166C-4 170 -4 174 -4 178C-4 185.5 -4 192.5 -4 200C-4 207.5 -4 219 -4 222C-3.5 223.5 -1.5 212.5 0 212.5C1.5 212.5 2.5 219 4 222C4.5 223 5 223.5 6 224C6.5 224.5 7.5 224.5 8 224.5C9.5 224.5 10.5 224.5 12 224.5C12.5 224.5 13.5 224.5 14 224C15 223.5 15.5 223 16 222C17 219.5 18 216.5 18.5 214C19.5 207.5 20.5 200.5 21 194C21.5 188 22 182 22 176C22 174.5 21.5 173 21 172C20.5 171 20 170.5 19.5 170C19 169.5 18.5 169 18 169C15.5 168 12.5 168 10 167C9.5 167 8.5 166.5 8 166C7.5 165.5 7.5 164.5 7.5 164C7.5 156.5 8 149.5 8 142C8 132 7.5 122 7.5 112C7.5 106 8 100 8.5 94C9 88.5 10.5 83.5 11.5 78C13 72.5 14.5 67.5 16 62C17 58 18.5 54.5 20 50.5C23.5 41.5 27.5 33 31 24C34 16 37.5 8 39.5 0C40 -1.5 40 -4 38.5 -4C29.5 -4 18 -4 8 -4C4 -4 -3 -4 -4 -4Z',
        ursprung: { x: 10, y: 175 },
        bewegung: 'wachsen',
        startTakte: 0.5,
        flaecheAnteil: 0.037,
      },
      {
        stufe: 4,
        schwelle: 0.533,
        d: 'M0 107C-0.5 107 -1.5 111 -2 113C-3 117 -4 121.5 -4 125.5C-4 138.5 -4 151 -4 164C-4 165.5 -4 166.5 -4 168C-4 171.5 -4 174.5 -4 178C-4 185.5 -4 192.5 -4 200C-4 206.5 -4 218 -4 220C-3.5 221 -1.5 209.5 0 209.5C1.5 209.5 2.5 216.5 4 220C4.5 221 5 221.5 5.5 222C6 222.5 7 223 8 223C9.5 223 10.5 223 12 223C12.5 223 13.5 223 14 222.5C15 222 15.5 221 16 220C17 217.5 18 214.5 18.5 212C19.5 204.5 20.5 197.5 21 190C21.5 184.5 21.5 179.5 21.5 174C21.5 173.5 21 172.5 20.5 172C20 171 19 170 18 169.5C17.5 169 16.5 168.5 16 168.5C14 168 12 168.5 10 168C8.5 167.5 6.5 167 6.5 166C5 158.5 6 150 5.5 142C5 136.5 4.5 131 4 125.5C3.5 121.5 3 117 2 113C1.5 111 0.5 107 0 107Z',
        ursprung: { x: 10, y: 175 },
        bewegung: 'wachsen',
        startTakte: 0,
        flaecheAnteil: 0.025,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '1efb5faa812c3ad3',
      modell: MODELL,
      raster: 2,
      iterationen: 4,
      residuum: 8.93729534823251e-15,
    },
  },
  'raum-fussboden': {
    id: 'raum-fussboden',
    innen: { x: 0, y: 0, breite: 420, hoehe: 250 },
    wachstum: 'senkrecht',
    baender: [
      {
        stufe: 1,
        schwelle: 0.472,
        d: 'M46 -4C45.5 -4 44.5 -4 44.5 -4C44.5 -3 46 -1.5 46 0C46 0.5 46 1.5 45.5 2C42.5 9 39 16 36 23C33 29.5 30.5 36 28 42.5C24.5 51.5 21 60.5 18 69.5C15 77.5 11.5 85.5 10 93.5C8.5 102 8.5 110.5 8 119C7.5 126 7.5 133 7.5 140C7.5 148 7.5 156 7.5 164C7.5 174 7 184 7 194C7 206 6.5 218 6.5 230C6.5 232.5 7 235.5 6.5 238C6 241.5 4 244.5 3 248C3 248.5 3 249.5 3 250C3 251.5 2.5 254 4 254C13.5 254 25.5 254 36 254C44.5 254 53.5 254 62 254C74 254 86 254 98 254C104.5 254 111.5 254 118 254C126 254 134 254 142 254C150.5 254 159.5 254 168 254C176.5 254 185.5 254 194 254C202.5 254 211.5 254 220 254C228 254 236 254 244 254C252.5 254 261.5 254 270 254C278.5 254 287.5 254 296 254C304.5 254 313.5 254 322 254C330 254 338 254 346 254C354.5 254 363.5 254 372 254C380.5 254 389.5 254 398 254C406.5 254 419 254 424 254C424 251.5 424 242 424 236C424 235.5 424 234.5 424 234C424 230.5 424 227.5 424 224C424 221.5 424 218.5 424 216C424 212 424 208 424 204C424 201.5 424 198.5 424 196C424 191.5 424 186.5 424 182C424 180 424 178 424 176C424 171.5 424 166.5 424 162C424 160 424 158 424 156C424 150.5 424 145.5 424 140C424 138.5 424 137.5 424 136C424 123.5 424 110.5 424 98C424 97.5 424 96.5 424 96C424 92.5 424 89.5 424 86C424 76.5 424 67.5 424 58C424 57.5 424 56.5 424 56C424 42.5 424 29.5 424 16C424 9.5 424 -0.5 424 -4C420.5 -4 410.5 -4 404 -4C396.5 -4 389.5 -4 382 -4C375.5 -4 368.5 -4 362 -4C354.5 -4 347.5 -4 340 -4C333.5 -4 326.5 -4 320 -4C312.5 -4 305.5 -4 298 -4C291.5 -4 284.5 -4 278 -4C270.5 -4 263.5 -4 256 -4C245.5 -4 234.5 -4 224 -4C212.5 -4 201.5 -4 190 -4C179.5 -4 168.5 -4 158 -4C146.5 -4 135.5 -4 124 -4C120 -4 116 -4 112 -4C100.5 -4 89.5 -4 78 -4C67.5 -4 56.5 -4 46 -4Z',
        ursprung: { x: 210, y: 250 },
        bewegung: 'einblenden',
        startTakte: 22,
        flaecheAnteil: 0.963,
      },
      {
        stufe: 2,
        schwelle: 0.482,
        d: 'M66 240C55.5 240.5 44.5 240.5 34 241.5C26.5 242 19.5 243 12 244C11.5 244 10.5 244.5 10 245C9.5 245.5 8.5 246 8 246.5C7.5 247.5 7 249 7 250C7 250.5 7 251.5 7 252C7.5 252.5 7.5 254 8.5 254C15.5 254 23 254 30 254C41.5 254 52.5 254 64 254C72 254 80 254 88 254C94.5 254 101.5 254 108 254C110.5 254 113.5 254 116 254C126 254 136 254 146 254C156.5 254 167.5 254 178 254C188.5 254 199.5 254 210 254C220.5 254 231.5 254 242 254C249.5 254 256.5 254 264 254C271.5 254 278.5 254 286 254C293.5 254 300.5 254 308 254C316 254 324 254 332 254C339.5 254 346.5 254 354 254C362 254 370 254 378 254C385.5 254 392.5 254 400 254C408 254 419 254 424 254C424 252 424 240.5 424 238C420.5 235 410.5 238 404 238C396.5 238 389.5 238 382 238C375.5 238 368.5 238 362 238C354.5 238 347.5 238 340 238C333.5 238 326.5 238 320 238C312.5 238 305.5 238 298 238C291.5 238 284.5 238 278 238C270.5 238 263.5 238 256 238C245.5 238 234.5 238 224 238C212.5 238 201.5 238 190 238C179.5 238 168.5 238 158 238C146.5 238 135.5 238 124 238C121.5 238 118.5 238 116 238C107.5 238 98.5 238 90 238.5C82 239 74 239.5 66 240Z',
        ursprung: { x: 210, y: 250 },
        bewegung: 'wachsen',
        startTakte: 0,
        flaecheAnteil: 0.045,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: '1efb5faa812c3ad3',
      modell: MODELL,
      raster: 2,
      iterationen: 4,
      residuum: 2.1999069232947477e-13,
    },
  },
});
