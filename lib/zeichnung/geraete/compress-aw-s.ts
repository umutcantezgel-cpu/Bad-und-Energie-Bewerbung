import { mass, schaetzung, type Aussengeraet } from './typen';

/**
 * Außeneinheit der Bosch Compress 5800i AW / 6800i AW, Größe S (AW 4 | 5 | 7 OR-S, 4–7 kW), als Maße mit Herkunft
 * (KERN K-010, E-029). Grundlage ist die Installationsanleitung 6721840669 (2025/06); jeder Wert ist an der dänischen
 * Ausgabe derselben Anleitung (6721864591, 2023/06) gegengeprüft: dort Seite 5 (Fig. 4–6), Seite 14 (Fig. 24,
 * Fundamentplan), Seite 16 (Fig. 28, Zuordnung von Vor- und Rücklauf) und Seite 22 (Tab. 5). Nur Zahlen, keine Grafik
 * (lib/zeichnung/marke.ts). Werte ohne Bemaßung sind `geschaetzt` und begründet.
 * Zweite Gegenprobe am 14.10.2026 (Websuche; das PDF 6721840669 war nicht abrufbar): Das Bosch-Artikeldatenblatt
 * 8738213464 (AW 4 OR-S, Händlerausgabe) nennt ebenfalls 800 × 1.100 × 540 mm, 143 kg und 0,95 kg R290.
 *
 * Lage im Koordinatensystem der Zeichnung (components/zeichnung/technik/Aussengeraet.tsx): 1 Einheit = 1 mm,
 * Ansicht von vorn mit Ursprung oben links am Gehäuse, Ansicht von rechts mit der Front links; die Aufstellfläche
 * (Unterkante der Bodenhalterungen) liegt bei y = Höhe, von dort zählen 202 und 802 in Bild 4.
 */
export const COMPRESS_AW_S: Aussengeraet = {
  id: 'compress-aw-s',
  name: 'Außeneinheit 4–7\u00A0kW',
  modelle: ['Compress 5800i AW 4 | 5 | 7 OR-S', 'Compress 6800i AW 4 | 5 | 7 OR-S'],
  quelle: {
    titel: 'Bosch Installationsanleitung AW 4|5|7 OR-S',
    dokument: '6721840669',
    ausgabe: '2025/06',
    gegenprobe: {
      titel: 'Installationsvejledning Luft til vand-varmepumpe Compress 5800iAW 4 | 5 | 7',
      dokument: '6721864591',
      ausgabe: '2023/06',
      sprache: 'da',
      geprueft: '2026-10-14',
    },
  },
  breite: mass(1100, 'Bild 4, Tabelle 26 (DK: S. 5 Fig. 4, S. 22 Tab. 5)'),
  hoehe: mass(
    800,
    'Tabelle 26 (DK: S. 22 Tab. 5)',
    'Gesamthöhe ab Aufstellfläche; Bild 4 bemaßt 802 mm von der Unterkante der Bodenhalterungen (DK: S. 5 Fig. 4)',
  ),
  tiefe: mass(540, 'Bild 5, Tabelle 26 (DK: S. 5 Fig. 5, S. 22 Tab. 5)'),
  oberkante: { radius: schaetzung(60, 'Obere Längskanten links und rechts gerundet (Bild 4, 18, 28; DK: S. 5, 11, 16), Radius nicht bemaßt') },
  konsolen: {
    anzahl: 4,
    abstand: mass(881, 'Bild 6 (DK: S. 5 Fig. 6)'),
    randabstand: mass(107, 'Bild 5 (DK: S. 5 Fig. 5)', '107 + 881 + 112 = 1100; die Gegenseite ist nicht bemaßt'),
    // Bild 5 (DK: S. 5 Fig. 5, Draufsicht) zeigt vier getrennte Halterungen, je eine vorn und eine hinten; die
    // Maßhilfslinien der 580 setzen an ihren Bohrungen an, die 20 reicht von der Gehäusekante bis zur Bohrung.
    // Bild 24 (DK: S. 14 Fig. 24, Fundamentplan) bohrt im Raster 881 × 580
    lochabstandTiefe: mass(580, 'Bild 5 (DK: S. 5 Fig. 5)', 'Abstand der Bohrungen vorn und hinten; ebenso Bild 24 (DK: S. 14 Fig. 24), Raster 881 × 580'),
    lochRand: mass(20, 'Bild 5 (DK: S. 5 Fig. 5)', 'Gehäusekante bis Bohrung; 580 − 540 = 2 × 20'),
    laenge: schaetzung(
      157,
      'Länge der Halterung nicht bemaßt; in Bild 5 (DK: S. 5 Fig. 5) am Gehäuse von 540 mm gemessen rund 157 mm, vorn wie hinten',
    ),
    ueberstand: schaetzung(
      50,
      'Überstand nicht bemaßt; in Bild 5 (DK: S. 5 Fig. 5) endet die Halterung rund 30 mm hinter der Bohrung, also 20 + 30 mm (gemessen 44 mm vorn, 53 mm hinten)',
    ),
    breite: schaetzung(50, 'Breite der Bodenhalterung nicht bemaßt'),
    hoehe: schaetzung(25, 'Höhe der Bodenhalterung nicht bemaßt; in Bild 4 und Bild 17 rund ein Dreißigstel der Gesamthöhe'),
  },
  hydraulik: {
    lage: 'hinten unten links (Blick von hinten), von vorn gesehen rechts hinten',
    hoehe: mass(202, 'Bild 4 (DK: S. 5 Fig. 4)', 'Maßhilfslinie an der Unterkante der Bodenhalterungen: Höhe über der Aufstellfläche'),
    abstandRand: mass(87, 'Bild 4 (DK: S. 5 Fig. 4)', 'Lesart der Kette 87 | 90: Rand bis erster Anschluss, dann Abstand'),
    abstandZwischen: mass(90, 'Bild 4 (DK: S. 5 Fig. 4)'),
    durchmesser: schaetzung(34, 'Bei AW 4|5|7 nicht bemaßt; Bild 28 nennt DN 25 (Außendurchmesser rund 34 mm)'),
    laenge: schaetzung(60, 'Überstand der Stutzen nicht bemaßt'),
    vorlauf: {
      lage: 'aussen',
      stelle:
        'Bild 28 (DK: S. 16 Fig. 28): [1] Heizwasseraustritt zur Inneneinheit (Vorlauf) am Rand, 87 mm; ' +
        '[2] Heizwassereintritt von der Inneneinheit (Rücklauf) innen, 87 + 90 mm',
    },
  },
  kondensat: {
    vonLinks: mass(
      330,
      'Bild 6 (DK: S. 5 Fig. 6)',
      'Ansicht von unten, Front oben: vom linken Rand; ebenso Bild 24 (DK: S. 14 Fig. 24, 107 + 223) und die Rückansichten Bild 4 und 28',
    ),
    vonHinten: mass(97, 'Bild 6 (DK: S. 5 Fig. 6)', 'zum unteren Bildrand, also zur Rückseite'),
    durchmesser: schaetzung(30, 'Anschlussstutzen Kondensat nicht bemaßt'),
    laenge: schaetzung(20, 'Überstand nach unten nicht bemaßt; kürzer als die Bodenhalterung hoch ist'),
    // Kap. 5.2 (DK: S. 15): frostfreie Ableitung, „Kondensatet kan tømmes ud i en stenseng“; Bild 27 (DK: S. 16 Fig. 27)
    ableitung: {
      rohr: mass(100, 'Bild 27 (DK: S. 16 Fig. 27 [3]): Kondensatrohr Ø 100 mm'),
      tiefe: mass(900, 'Bild 27 (DK: S. 16 Fig. 27): 900 mm von der Geländeoberkante bis zum Kiesbett [4]'),
      schotter: mass(300, 'Bild 27 (DK: S. 16 Fig. 27 [2]): Schotter 300 mm unter den Betonsockeln [1]'),
    },
  },
  verdampfer: {
    lage: 'hinten (Bild 3: Verdampfer auf der Rückseite)',
    tiefe: schaetzung(70, 'Tiefe des Lamellenblocks nicht bemaßt'),
    rand: schaetzung(40, 'Abstand des Lamellenblocks zum Gehäuserand nicht bemaßt'),
    // Bild 3 zeigt Verdampfer [6] und Maschinenraum mit Kondensator [1] nebeneinander; das Lamellengitter in Bild 4
    // (Rückansicht, DK: S. 5 Fig. 3/4) liegt, am Gehäuse von 1.100 mm gemessen, 336–1.048 mm vom linken Rand, von vorn
    // also 52–764 mm. Abgeleitet aus dem Gitter, nicht bemaßt
    vonLinks: schaetzung(52, 'Bild 3/4 (DK: S. 5 Fig. 3/4): Lamellengitter der Rückansicht gemessen und gespiegelt, 1.100 − 1.048 mm'),
    breite: schaetzung(712, 'Bild 3/4 (DK: S. 5 Fig. 3/4): Lamellengitter der Rückansicht gemessen, 1.048 − 336 mm'),
  },
  ausblas: {
    mitteX: schaetzung(430, 'Lage der Ausblasöffnung nicht bemaßt: links der Mitte'),
    mitteY: schaetzung(400, 'Lage der Ausblasöffnung nicht bemaßt: halbe Höhe'),
    durchmesser: schaetzung(540, 'Durchmesser der Ausblasöffnung nicht bemaßt'),
  },
  rotor: {
    durchmesser: schaetzung(480, 'Allgemeiner Axialrotor (neutrale Fassung), kleiner als die Öffnung'),
    nabe: schaetzung(110, 'Allgemeiner Axialrotor (neutrale Fassung)'),
    blaetter: 4,
  },
  kaeltemittel: { name: 'R290', fuellmengeKg: 0.95, stelle: 'Tabelle 26 (DK: S. 22 Tab. 5)' },
  gewichtKg: { wert: 143, stelle: 'Tabelle 26 (DK: S. 22 Tab. 5)' },
};
