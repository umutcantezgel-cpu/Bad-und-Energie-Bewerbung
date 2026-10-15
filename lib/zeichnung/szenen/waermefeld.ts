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
  'Stationäre Wärmeausbreitung mit Konvektion, K∇²θ − u·∇θ = 0, θ = 0 außen, 1 am Vorlauf; Konvektion aus Walzen (Stromfunktion 16ξ(1−ξ)η(1−η), divergenzfrei, Pe 16 am Heizkörper, 2 an der Fußbodenheizung; im Vergleichsraum mit Heizkörper steigt die Luft in einer dünnen Schicht am Heizkörper, F(ξ) = (1−ξ)ξ/(ξ+0,05)); Heizkörper mit fester Temperatur (1,0 oben, 0,8 unten), Unterseite ohne Wärmeabgabe nach unten; Wände, Decke und Boden als Robin-Rand mit U nach dem GEG-Referenzgebäude (0,28 / 0,20 / 0,35 × 0,6), Fußbodenheizung als Robin-Rand mit θ 0,6 und 10,8 W/(m²·K) (DIN EN 1264-5), vierfache Leitfähigkeit über dem Boden als Ersatz für den Strahlungsaustausch (Kalibrierung ohne Quelle); Kalibrierkonstante der Ränder 0,01. SOR (ω 1,5) auf 2 Einheiten. Bänder: Hausschnitt bei 64, 36, 16 und 6 % der Raumfläche; Vergleichsräume bei gleicher mittlerer Raumtemperatur auf derselben Skala (Abstände vom Raummittel wie im Raum mit Heizkörper bei 64/36/16/6 %), ein Band nur ab 2 % der Fläche. Reihenfolge aus einem expliziten Zeitlauf auf rund 4 Einheiten (Ring eines Bands zu 60 % erwärmt). Hausschnitt: Schnittebene vor der Rückwand, der Heizkörper an der Rückwand liegt in der Ebene.';

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
        schwelle: 0.737,
        d: 'M396 301C395 301 397.5 302 398 303C398.5 303.5 398.5 304.5 398.5 305C398.5 305.5 398.5 306.5 398 307C396.5 309 394 311 392 313C390.5 315 389 317 387.5 319C386 321.5 384.5 324.5 383.5 327C382.5 329.5 381.5 332.5 380.5 335C379 339.5 378 344.5 377 349C376 353.5 375.5 358.5 375.5 363C375.5 369 375.5 375 376 381C376.5 386.5 377.5 391.5 378.5 397C379 399.5 379.5 402.5 380.5 405C381.5 407.5 382.5 410.5 383.5 413C385.5 417 387.5 421 390 425C392 428 394 430.5 396 433C398 435 400 437 402.5 439C405 441 407.5 442.5 410 444C413 446 416.5 447.5 420 449C422.5 450 425.5 451 428 451.5C431.5 452.5 434.5 453 438 453.5C448.5 455 459.5 456.5 470 458C474 458.5 478 459.5 482 460.5C486 461.5 490 463 494 464.5C496 465.5 498 466.5 500 467.5C502 468.5 504 469.5 506 471C509.5 473.5 513 477 516 480C519 483 521.5 486 524 489.5C527.5 494.5 531 499.5 534 505C539 513.5 544 522.5 549 531C550.5 533 552 535 553.5 537C554 538 555 539 556 539.5C557 540 558.5 540.5 560 540.5C570.5 540.5 581.5 539.5 592 539.5C605.5 539.5 618.5 539.5 632 539.5C639.5 539.5 646.5 540 654 540.5C657.5 541 660.5 542 664 542.5C665.5 542.5 666.5 543 668 542.5C669.5 542 670.5 541 672 540.5C674 539.5 676 538.5 677.5 537C683.5 532 689.5 526.5 695 521C700.5 515.5 706.5 509.5 711.5 503C715 498.5 718.5 494 721.5 489C723 486.5 724 483.5 725.5 481C726.5 478.5 728 475.5 729 473C730 469.5 731 466.5 732 463C733 459.5 733.5 456.5 734 453C734.5 449 735 445 735.5 441C736 437 736.5 433 736.5 429C736.5 420.5 737 411.5 736.5 403C736 393.5 735 384.5 734 375C733 367 731 359 729.5 351C728.5 347 727.5 343 726.5 339C725.5 335 724 331 722.5 327C721 323.5 719.5 320.5 717.5 317C715.5 313.5 713.5 310.5 711.5 307C711 306.5 711 305.5 711 305C711 303.5 714 301 712.5 301C609 301 500 301 396 301Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 16.5,
        flaecheAnteil: 0.639,
      },
      {
        stufe: 2,
        schwelle: 0.825,
        d: 'M538 301C535.5 301 544 302 547 303C548.5 303.5 551.5 304.5 551.5 305C551.5 305.5 548.5 306.5 547 307C538 309.5 529 311 520 313.5C514.5 315 508.5 317 503 319C500 320 497 321.5 494 323C491.5 324 489 325.5 486.5 327C484.5 328 482.5 329.5 480.5 331C479 332 477.5 333.5 476 335C474.5 336.5 473.5 337.5 472.5 339C471.5 340.5 470 341.5 469.5 343C468 345.5 467 348 466.5 351C466 353.5 466.5 356.5 466.5 359C466.5 360.5 466.5 361.5 467 363C467.5 365 468.5 367 469.5 369C470.5 371 472 373 473.5 375C476 378 478.5 380.5 481 383C488.5 390 496.5 396.5 504 403.5C507.5 406.5 511 410 514 413.5C517 416.5 519.5 419.5 522 423C524 425.5 525.5 428 527 431C529 434.5 530.5 438 532 441.5C533.5 445 535 448.5 536 452.5C538.5 462.5 540 473 542.5 483C543.5 488 545.5 492.5 547 497C550.5 506.5 554 516.5 558 526C558.5 527.5 559 529 560 530C560.5 531 561 531.5 562 532C562.5 532.5 563.5 532.5 564 532.5C595.5 532.5 626.5 532.5 658 532C658.5 532 659.5 531.5 660 531C661.5 529 663 527 664.5 525C668 519.5 671.5 514.5 675 509C677.5 505 679.5 501 681.5 497C683 494.5 684 491.5 685 489C686 486.5 686.5 483.5 687.5 481C688 478.5 689 475.5 689.5 473C690.5 469 691 465 691.5 461C692 455.5 692.5 450.5 693 445C693.5 438.5 694 431.5 694.5 425C694.5 419 694.5 413 694.5 407C694.5 401.5 694.5 396.5 694 391C693.5 386.5 692.5 381.5 692 377C691.5 373 691 369 690 365C689 361.5 688 358.5 687 355C685.5 351.5 684 348.5 682.5 345C681.5 343 680.5 341 679 339C677.5 336.5 676 334.5 674 332.5C672.5 330.5 670.5 329 668.5 327C666.5 325 664.5 323 662 321.5C660 320 658 319 656 318C653.5 316.5 650.5 315 648 314C645.5 313 642.5 312 640 311C636 309.5 631.5 308.5 627.5 307C626.5 306.5 624.5 305.5 624.5 305C624.5 304.5 626.5 303.5 627.5 303C629.5 302 636 301 634 301C606 301 564.5 301 538 301Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 12,
        flaecheAnteil: 0.359,
      },
      {
        stufe: 3,
        schwelle: 0.89,
        d: 'M588 347C585.5 347.5 582.5 348 580 348.5C578 349 576 350 574 351C572 352 570 353.5 568 354.5C567 355.5 565.5 356 564.5 357C563 358 561.5 359.5 560.5 361C559.5 362 558.5 363.5 558 365C557 366.5 556.5 368 556 369.5C555.5 371.5 554.5 373 554.5 375C554 379 554 383 554 387C554.5 397.5 556 408.5 556.5 419C557 425 557 431 557 437C557 441.5 556 446.5 555.5 451C554.5 458.5 553 466 552 473.5C551.5 476 551.5 478.5 551.5 481C551.5 484.5 552 487.5 553 491C554.5 496 556 501.5 558 506.5C558.5 508 559 509.5 560 510.5C560.5 511.5 561 512 562 512.5C562.5 513 563.5 513 564 513C595.5 513 627 513.5 658 513C659 513 659.5 512 660 511.5C660.5 511 661.5 510 662 509C664.5 504.5 667 500 669 495C670.5 492 671 488.5 671.5 485C672 482.5 672.5 479.5 672.5 477C672.5 473 671.5 469 671 465C667.5 446 664 426.5 660 407.5C659 402.5 658 398 656.5 393C655.5 389 654 385 652 381C650.5 377.5 648.5 374 646.5 371C644.5 368 642.5 365.5 640.5 363C638.5 361 636.5 359 634 357C631.5 355 629 353.5 626 352C623.5 350.5 621 349.5 618 348.5C615 347.5 611.5 347 608 346.5C604.5 346 601.5 346 598 346C594.5 346 591.5 346.5 588 347Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 8.5,
        flaecheAnteil: 0.162,
      },
      {
        stufe: 4,
        schwelle: 0.943,
        d: 'M604 411C602.5 411.5 601.5 412.5 600 413C598.5 414 597 414.5 596 415.5C594 417.5 592 420 590 422.5C588 425.5 586 429 584 432.5C579.5 441 575.5 450.5 570.5 459C567 465.5 562 471 558 477.5C557.5 478.5 557 480 557 481C557 482.5 557 483.5 557 485C557 486.5 557.5 488 558 489.5C558.5 491 559 493 560 494.5C560.5 495.5 561 496 562 496.5C562.5 497 563.5 497 564 497C595.5 497 627 497.5 658 497C659 497 659.5 496 660 495.5C661 494.5 661.5 493 662 492C663 489.5 663.5 487.5 664 485C664.5 483 664.5 481 664 479C663.5 477.5 663 476 662 474.5C658 468.5 654 463 650 457C644.5 448.5 639.5 439 634 430.5C631.5 427 629 423.5 626 420C624 418 622 416 620 414.5C618 413 616 412 614 411.5C612 411 610 410.5 608 410.5C606.5 410.5 605.5 410.5 604 411Z',
        ursprung: { x: 610, y: 480 },
        startTakte: 7,
        flaecheAnteil: 0.06,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: 'b15f783ab7ae127a',
      modell: MODELL,
      raster: 2,
      iterationen: 17503,
      residuum: 6.058131774011599e-11,
    },
  },
  'raum-heizkoerper': {
    id: 'raum-heizkoerper',
    innen: { x: 0, y: 0, breite: 420, hoehe: 250 },
    wachstum: 'radial',
    baender: [
      {
        stufe: 1,
        schwelle: 0.681,
        d: 'M-4 -4C-4 33 -4 162 -4 242.5C-4 244 -1.5 242 0 242C2 242 4 242.5 6 242.5C8.5 242.5 11.5 243 14 243C16 243 18 242.5 20 241.5C22 240.5 23.5 239.5 25 238C29.5 234 33.5 229 38 225C40 223.5 42 222 44 220.5C46.5 219 49 217.5 52 216.5C54.5 215.5 57.5 214.5 60 214C64.5 213 69.5 212.5 74 212C95.5 210.5 116.5 210 138 208C153.5 206.5 168.5 204.5 184 202.5C192.5 201.5 201.5 199.5 210 198C217.5 196.5 224.5 195 232 193.5C239.5 192 246.5 190.5 254 188.5C260 187 266 185 272 183C277 181.5 281.5 180 286.5 178C291 176 296 174 300.5 172C304.5 170 308.5 168 312 166C315 164 318 162 321 160C323.5 158 326 156 328.5 154C331 151.5 333.5 149 336 146C338 143.5 340 141 341.5 138C343 135.5 344 132.5 345 130C346 128 346.5 126 347 124C347.5 121.5 348 118.5 348.5 116C349 113.5 349.5 110.5 349.5 108C349.5 105.5 349.5 102.5 349 100C348.5 94 347.5 88 346.5 82C346 78.5 345 75.5 344 72C343 68.5 342 65.5 341 62C340 58.5 338.5 55.5 337 52C336 49.5 334.5 46.5 333 44C331.5 41.5 329.5 38.5 328 36C326 33 324 30 322 27.5C320 25 318 22.5 315.5 20C313.5 18 311 16 309 14C306.5 12 304 10 301.5 8C298.5 6 295.5 4 293 2C292.5 1.5 291.5 0.5 291.5 0C291.5 -0.5 292.5 -1.5 293 -2C293.5 -2.5 296.5 -4 295.5 -4C197.5 -4 51 -4 -4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 22,
        flaecheAnteil: 0.64,
      },
      {
        stufe: 2,
        schwelle: 0.751,
        d: 'M4 -4C3.5 -4 2.5 -4 2.5 -4C2.5 -3.5 4.5 -3 5 -2C5.5 -1.5 6 -0.5 6 0C6 0.5 5.5 1.5 5 2C4 3 3 4 2 4.5C1.5 5 0.5 5 0 5C-0.5 5 -1.5 5 -2 4.5C-2.5 4 -4 2 -4 3C-4 79 -4 159 -4 234.5C-4 236 -1.5 233 0 233C2.5 233 5.5 234.5 8 235C10 235 12 234.5 14 234.5C14.5 234.5 15.5 234.5 16 234C17 233 18.5 231.5 19 230C23 222 26 213.5 30 205.5C32.5 200.5 35 196 38 191.5C39 189.5 40.5 188 42 186.5C44 184.5 46 182 48 180C49.5 178.5 50.5 177.5 52 176.5C54 175 56 173.5 58 172.5C60.5 171 63.5 170 66 169C70 167.5 74 166 78 165.5C94.5 162.5 111.5 160.5 128 158C136 156.5 144 155.5 152 153.5C158.5 152 165.5 150 172 148C178 146 184 144 190 141.5C193.5 140 196.5 138.5 200 137C203 135.5 206 134 209 132C212 130 215.5 128 218.5 126C221 124 223.5 122 226 120C228 118 230.5 116 232.5 114C234.5 112 236 110 237.5 108C239 106 240.5 103.5 242 101C243.5 98.5 244.5 96.5 245.5 94C246.5 92 247 90 247.5 88C248 85.5 248.5 82.5 249 80C249 77.5 249 74.5 249 72C249 70 249 68 248.5 66C248 64 247.5 62 247 60C246.5 58 246 56 245 54C244 52 242.5 50 241.5 48C240 46 239 44 237.5 42C236 40 234 38 232 36C230 34 227.5 32 225 30C222 28 219 26 216 24C213.5 22.5 211.5 21 209 20C203 17 196.5 14.5 190.5 12C186.5 10.5 183 9 179 8C172 6 165 4.5 158.5 2C157.5 1.5 155.5 0.5 155.5 0C155.5 -0.5 157.5 -1.5 158.5 -2C160.5 -3 167.5 -4 165.5 -4C116 -4 58 -4 4 -4Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 11.5,
        flaecheAnteil: 0.362,
      },
      {
        stufe: 3,
        schwelle: 0.802,
        d: 'M28 20C25.5 20 22.5 20 20 20.5C17.5 21 14.5 21.5 12 22C10.5 22.5 9.5 23 8 23.5C5.5 24.5 2.5 27 0 27.5C-1.5 27.5 -4 24 -4 25.5C-4 91 -4 163 -4 229C-4 230 -3 227.5 -2 227C-1.5 226.5 -0.5 226.5 0 226.5C0.5 226.5 1.5 226.5 2 227C3.5 228 4.5 230 6 231C6.5 231.5 7.5 232 8 232C9.5 232 11 232.5 12 232C13 231.5 14 231 14.5 230C18 220.5 20.5 210 24 200.5C27.5 190 32 179.5 36 169C38 164.5 40 160 42 156C43 154 44.5 152 46 150C47.5 148.5 48.5 146.5 50 145C52.5 142.5 55 139.5 58 137.5C61 135 64.5 133 68 131C72 129 76 127 80 125C90 120.5 100 116 110 111.5C113.5 110 117 108 120 106C123 104.5 125.5 102.5 128 100.5C130.5 98.5 133 96.5 135.5 94C137.5 92 139 90 140.5 88C142 86 143 84 144 82C145 79.5 145.5 76.5 146 74C146.5 72 146 70 146 68C145.5 66 145.5 64 144.5 62C143.5 60 142.5 58 141 56C140 54.5 139 53.5 138 52C137 50.5 135.5 49 134 48C132 46.5 130 45 128 43.5C126 42 124 40.5 122 39.5C119.5 38 116.5 37 114 35.5C111.5 34.5 108.5 33 106 32C102 30.5 98 29 94 28C87.5 26 80.5 24.5 74 23.5C66 22 58 21 50 20.5C42.5 20 35.5 20 28 20Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 4,
        flaecheAnteil: 0.159,
      },
      {
        stufe: 4,
        schwelle: 0.843,
        d: 'M16 48C14.5 48.5 13 49 12 49.5C10.5 50.5 9 51.5 8 52.5C5.5 55 4 58.5 2 61C1.5 61.5 0.5 62.5 0 62.5C-0.5 62.5 -1.5 61.5 -2 61C-3 60 -4 56 -4 57.5C-4 109 -4 167 -4 219C-4 220 -3 217 -2 216.5C-1.5 216 -0.5 216 0 216C0.5 216 1.5 216 2 216.5C3.5 217.5 4.5 219.5 6 221C6.5 221.5 7.5 222 8 222C8.5 222 9.5 222 10 222C10.5 222 11.5 222 12 221.5C13 221 13.5 220 14 219C15 217.5 15.5 215.5 16 213.5C19 203.5 22 194 24.5 184C25.5 180.5 26.5 177.5 27 174C28.5 164.5 29 155 31 146C32 140.5 33.5 135 35.5 130C37.5 125 39.5 120 42 115C46.5 106 52.5 97 57 88C58 86 58.5 84 59 82C59.5 80 60 78 60 76C60 74 60 72 59.5 70C59 68 58 66 57 64C55.5 62 54 60 52 58.5C50 57 48 55 46 54C43.5 52.5 40.5 51.5 38 50.5C35.5 49.5 32.5 48.5 30 48C27.5 47.5 24.5 47.5 22 47.5C20 47.5 18 47.5 16 48Z',
        ursprung: { x: 10, y: 175 },
        startTakte: 0,
        flaecheAnteil: 0.061,
      },
    ],
    herkunft: {
      skript: 'scripts/zeichnung/waermefeld.ts',
      eingabeHash: 'b15f783ab7ae127a',
      modell: MODELL,
      raster: 2,
      iterationen: 24102,
      residuum: 4.845412959753048e-11,
    },
  },
  'raum-fussboden': {
    id: 'raum-fussboden',
    innen: { x: 0, y: 0, breite: 420, hoehe: 250 },
    wachstum: 'senkrecht',
    baender: [
      {
        stufe: 1,
        schwelle: 0.496,
        d: 'M150 -4C149 -4 151.5 -2.5 152 -2C152.5 -1.5 153 -0.5 153 0C153 0.5 152.5 1.5 152 2C144 8.5 136 14.5 128 21C120.5 27 113 33 106 39C72 69 38 99 4 129C3.5 129.5 2.5 130 2 130.5C1.5 131 0.5 131.5 0 131.5C-0.5 131.5 -1.5 131 -2 130.5C-2.5 130 -4 128 -4 129C-4 169.5 -4 244.5 -4 254C106.5 254 335 254 424 254C424 221.5 424 37.5 424 -4C377 -4 239.5 -4 150 -4Z',
        ursprung: { x: 210, y: 250 },
        startTakte: 22,
        flaecheAnteil: 0.903,
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
      eingabeHash: 'b15f783ab7ae127a',
      modell: MODELL,
      raster: 2,
      iterationen: 4950,
      residuum: 9.911416132268869e-11,
    },
  },
});
