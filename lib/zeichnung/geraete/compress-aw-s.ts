import { mass, schaetzung, type Aussengeraet } from './typen';

/**
 * Außeneinheit der Bosch Compress 5800i AW / 6800i AW, Größe S (AW 4 | 5 | 7 OR-S, 4–7 kW), als Maße mit Herkunft
 * (KERN K-010, E-029). Grundlage ist die Installationsanleitung 6721840669 (2025/06); jeder Wert ist an der dänischen
 * Ausgabe derselben Anleitung (6721864591, 2023/06) gegengeprüft: dort Seite 5 (Fig. 4–6) und Seite 22 (Tab. 5).
 * Nur Zahlen, keine Grafik (lib/zeichnung/marke.ts). Werte ohne Bemaßung sind `geschaetzt` und begründet.
 *
 * Lage im Koordinatensystem der Zeichnung (components/zeichnung/technik/Aussengeraet.tsx): 1 Einheit = 1 mm,
 * Ansicht von vorn mit Ursprung oben links am Gehäuse, Ansicht von rechts mit der Front links.
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
  hoehe: mass(800, 'Tabelle 26 (DK: S. 22 Tab. 5)', 'Bild 4 nennt 802 mm (DK: Fig. 4)'),
  tiefe: mass(540, 'Bild 5, Tabelle 26 (DK: S. 5 Fig. 5, S. 22 Tab. 5)'),
  tiefeMitKonsolen: mass(580, 'Bild 5 (DK: S. 5 Fig. 5)'),
  oberkante: { radius: schaetzung(60, 'Gerundete Oberkante, Radius nicht bemaßt') },
  konsolen: {
    anzahl: 4,
    abstand: mass(881, 'Bild 6 (DK: S. 5 Fig. 6)'),
    randabstand: mass(107, 'Bild 5 (DK: S. 5 Fig. 5)', '107 + 881 + 112 = 1100; die Gegenseite ist nicht bemaßt'),
    ueberstand: mass(20, 'Bild 5 (DK: S. 5 Fig. 5)', '580 − 540 = 2 × 20'),
    breite: schaetzung(50, 'Breite der Bodenhalterung nicht bemaßt'),
    hoehe: schaetzung(20, 'Höhe der Bodenhalterung nicht bemaßt; Bild 4 nennt 802 mm Gesamthöhe'),
  },
  hydraulik: {
    lage: 'hinten unten links (Blick von hinten), von vorn gesehen rechts hinten',
    hoehe: mass(202, 'Bild 4 (DK: S. 5 Fig. 4)'),
    abstandRand: mass(87, 'Bild 4 (DK: S. 5 Fig. 4)', 'Lesart der Kette 87 | 90: Rand bis erster Anschluss, dann Abstand'),
    abstandZwischen: mass(90, 'Bild 4 (DK: S. 5 Fig. 4)'),
    durchmesser: schaetzung(34, 'Bei AW 4|5|7 nicht bemaßt; AW 10|12 nennt DN 25 (Außendurchmesser rund 34 mm)'),
    laenge: schaetzung(60, 'Überstand der Stutzen nicht bemaßt'),
  },
  kondensat: {
    vonRechts: mass(330, 'Bild 6 (DK: S. 5 Fig. 6)'),
    vonVorn: mass(97, 'Bild 6 (DK: S. 5 Fig. 6)'),
    durchmesser: schaetzung(30, 'Anschlussstutzen Kondensat nicht bemaßt'),
    laenge: schaetzung(40, 'Überstand nach unten nicht bemaßt'),
  },
  verdampfer: {
    lage: 'hinten (Bild 3: Verdampfer auf der Rückseite)',
    tiefe: schaetzung(70, 'Tiefe des Lamellenblocks nicht bemaßt'),
    rand: schaetzung(40, 'Abstand des Lamellenblocks zum Gehäuserand nicht bemaßt'),
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
