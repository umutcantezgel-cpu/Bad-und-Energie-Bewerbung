import { mass, schaetzung, type Aussengeraet } from './typen';

/**
 * Außeneinheit der Bosch Compress 5800i AW / 6800i AW, Größe L (AW 10 | 12 OR-T, 10–12 kW), als Maße mit Herkunft
 * (KERN K-010, E-029). Grundlage ist die Installationsanleitung 6721842854 (2023/10), Tabelle 5; jeder Wert ist an der
 * dänischen Ausgabe derselben Anleitung (6721864567, 2023/10) gegengeprüft: dort Seite 5 (Fig. 4–6), Seite 16
 * (Fig. 26, Zuordnung von Vor- und Rücklauf) und Seite 23 (Tab. 5). Nur Zahlen, keine Grafik (lib/zeichnung/marke.ts). Werte ohne Bemaßung sind `geschaetzt` und begründet.
 */
export const COMPRESS_AW_L: Aussengeraet = {
  id: 'compress-aw-l',
  name: 'Außeneinheit 10–12\u00A0kW',
  modelle: ['Compress 5800i AW 10 | 12 OR-T', 'Compress 6800i AW 10 | 12 OR-T'],
  quelle: {
    titel: 'Bosch Installationsanleitung AW 10|12 OR-T',
    dokument: '6721842854',
    ausgabe: '2023/10',
    gegenprobe: {
      titel: 'Installationsvejledning Luft til vand-varmepumpe Compress 5800i AW, AW 10 | 12 OR-T',
      dokument: '6721864567',
      ausgabe: '2023/10',
      sprache: 'da',
      geprueft: '2026-10-14',
    },
  },
  breite: mass(1350, 'Bild 4, Tabelle 5 (DK: S. 5 Fig. 4, S. 23 Tab. 5)'),
  hoehe: mass(
    1100,
    'Tabelle 5 (DK: S. 23 Tab. 5)',
    'Gesamthöhe ab Aufstellfläche wie bei AW 4|5|7; Bild 4 nennt 1050 mm (DK: Fig. 4), Bezug nicht eindeutig',
  ),
  tiefe: mass(540, 'Bild 5, Tabelle 5 (DK: S. 5 Fig. 5, S. 23 Tab. 5)'),
  oberkante: { radius: schaetzung(60, 'Obere Längskanten links und rechts gerundet (Bild 4, 26, 27; DK: S. 5, 16), Radius nicht bemaßt') },
  konsolen: {
    anzahl: 4,
    abstand: mass(1266, 'Bild 6 (DK: S. 5 Fig. 6)'),
    randabstand: mass(42, 'Bild 5 (DK: S. 5 Fig. 5)', '42 + 1266 + 42 = 1350'),
    // Wie bei AW 4|5|7: vier getrennte Halterungen, die 580 von Bohrung zu Bohrung, die 20 von der Gehäusekante bis zur
    // Bohrung (Bild 5, DK: S. 5 Fig. 5); unter dem Gehäuse zeigt Bild 5 die Halterungen hier nicht
    lochabstandTiefe: mass(580, 'Bild 5 (DK: S. 5 Fig. 5)', 'Abstand der Bohrungen vorn und hinten'),
    lochRand: mass(20, 'Bild 5 (DK: S. 5 Fig. 5)', 'Gehäusekante bis Bohrung; 580 − 540 = 2 × 20'),
    laenge: schaetzung(157, 'Länge der Halterung nicht bemaßt und in Bild 5 unter dem Gehäuse verdeckt; gleiche Halterung wie bei AW 4|5|7 angenommen'),
    ueberstand: schaetzung(
      50,
      'Überstand nicht bemaßt; in Bild 5 (DK: S. 5 Fig. 5) endet die Halterung rund 30 mm hinter der Bohrung, also 20 + 30 mm (gemessen 42 mm vorn, 47 mm hinten)',
    ),
    breite: schaetzung(50, 'Breite der Bodenhalterung nicht bemaßt'),
    hoehe: schaetzung(25, 'Höhe der Bodenhalterung nicht bemaßt; gleiche Halterung wie bei AW 4|5|7 angenommen'),
  },
  hydraulik: {
    lage: 'hinten unten links (Blick von hinten), von vorn gesehen rechts hinten',
    hoehe: mass(202, 'Bild 4 (DK: S. 5 Fig. 4)', 'Höhe über der Aufstellfläche wie bei AW 4|5|7'),
    abstandRand: mass(87, 'Bild 4 (DK: S. 5 Fig. 4)', 'Lesart der Kette 87 | 90 wie bei AW 4|5|7'),
    abstandZwischen: mass(90, 'Bild 4 (DK: S. 5 Fig. 4)'),
    durchmesser: schaetzung(34, 'Bild 4 nennt DN 25; Außendurchmesser rund 34 mm'),
    laenge: schaetzung(60, 'Überstand der Stutzen nicht bemaßt'),
    vorlauf: {
      lage: 'aussen',
      stelle:
        'Bild 26 (DK: S. 16 Fig. 26): [1] Heizwasseraustritt zur Inneneinheit (Vorlauf) am Rand; ' +
        '[2] Heizwassereintritt von der Inneneinheit (Rücklauf) innen',
    },
  },
  kondensat: {
    vonLinks: mass(270, 'Bild 6 (DK: S. 5 Fig. 6)', 'Ansicht von unten, Front oben: vom linken Rand, Lesart wie bei AW 4|5|7'),
    vonHinten: mass(97, 'Bild 6 (DK: S. 5 Fig. 6)', 'zum unteren Bildrand, also zur Rückseite'),
    durchmesser: schaetzung(30, 'Anschlussstutzen Kondensat nicht bemaßt'),
    laenge: schaetzung(20, 'Überstand nach unten nicht bemaßt; kürzer als die Bodenhalterung hoch ist'),
    // Fundamentplan Bild 21/22 (DK: S. 13/14 Fig. 21/22): Kondensatablauf Ø 100 mm endet frostfrei im Kiesbett
    ableitung: {
      rohr: mass(100, 'Bild 21/22 (DK: S. 13/14 Fig. 21/22 [5]): Kondensatablauf Ø 100 mm'),
      tiefe: mass(900, 'Bild 21/22 (DK: S. 13/14 Fig. 21/22): 900 mm bis zum Kiesbett [4]'),
      schotter: mass(300, 'Bild 21/22 (DK: S. 13/14 Fig. 21/22 [3]): verdichtete Schotterschicht 300 mm'),
    },
  },
  verdampfer: {
    lage: 'hinten (Bild 3: Verdampfer auf der Rückseite)',
    tiefe: schaetzung(70, 'Tiefe des Lamellenblocks nicht bemaßt'),
    rand: schaetzung(40, 'Abstand des Lamellenblocks zum Gehäuserand nicht bemaßt'),
    // Wie bei AW 4|5|7: Lamellengitter in Bild 4 (Rückansicht, DK: S. 5 Fig. 3/4), am Gehäuse von 1.350 mm gemessen
    // 367–1.294 mm vom linken Rand, von vorn also 56–983 mm; rechts davon (von vorn) die Anschlüsse
    vonLinks: schaetzung(56, 'Bild 3/4 (DK: S. 5 Fig. 3/4): Lamellengitter der Rückansicht gemessen und gespiegelt, 1.350 − 1.294 mm'),
    breite: schaetzung(927, 'Bild 3/4 (DK: S. 5 Fig. 3/4): Lamellengitter der Rückansicht gemessen, 1.294 − 367 mm'),
  },
  ausblas: {
    mitteX: schaetzung(560, 'Lage der Ausblasöffnung nicht bemaßt: links der Mitte'),
    mitteY: schaetzung(550, 'Lage der Ausblasöffnung nicht bemaßt: halbe Höhe'),
    durchmesser: schaetzung(720, 'Durchmesser der Ausblasöffnung nicht bemaßt'),
  },
  rotor: {
    durchmesser: schaetzung(650, 'Allgemeiner Axialrotor (neutrale Fassung), kleiner als die Öffnung'),
    nabe: schaetzung(140, 'Allgemeiner Axialrotor (neutrale Fassung)'),
    blaetter: 4,
  },
  kaeltemittel: { name: 'R290', fuellmengeKg: 1.6, stelle: 'Tabelle 5 (DK: S. 23 Tab. 5)' },
  gewichtKg: { wert: 212, stelle: 'Tabelle 5 (DK: S. 23 Tab. 5)' },
};
