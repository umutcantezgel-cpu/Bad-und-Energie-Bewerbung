import { mass, schaetzung, type Aussengeraet } from './typen';

/**
 * Außeneinheit der Bosch Compress 5800i AW / 6800i AW, Größe L (AW 10 | 12 OR-T, 10–12 kW), als Maße mit Herkunft
 * (KERN K-010, E-029). Grundlage ist die Installationsanleitung 6721842854 (2023/10), Tabelle 5; jeder Wert ist an der
 * dänischen Ausgabe derselben Anleitung (6721864567, 2023/10) gegengeprüft: dort Seite 5 (Fig. 4–6) und Seite 23
 * (Tab. 5). Nur Zahlen, keine Grafik (lib/zeichnung/marke.ts). Werte ohne Bemaßung sind `geschaetzt` und begründet.
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
  hoehe: mass(1100, 'Tabelle 5 (DK: S. 23 Tab. 5)', 'Bild 4 nennt 1050 mm (DK: Fig. 4); Bezug nicht eindeutig'),
  tiefe: mass(540, 'Bild 5, Tabelle 5 (DK: S. 5 Fig. 5, S. 23 Tab. 5)'),
  tiefeMitKonsolen: mass(580, 'Bild 5 (DK: S. 5 Fig. 5)'),
  oberkante: { radius: schaetzung(60, 'Gerundete Oberkante, Radius nicht bemaßt') },
  konsolen: {
    anzahl: 4,
    abstand: mass(1266, 'Bild 6 (DK: S. 5 Fig. 6)'),
    randabstand: mass(42, 'Bild 5 (DK: S. 5 Fig. 5)', '42 + 1266 + 42 = 1350'),
    ueberstand: mass(20, 'Bild 5 (DK: S. 5 Fig. 5)', '580 − 540 = 2 × 20'),
    breite: schaetzung(50, 'Breite der Bodenhalterung nicht bemaßt'),
    hoehe: schaetzung(20, 'Höhe der Bodenhalterung nicht bemaßt'),
  },
  hydraulik: {
    lage: 'hinten unten links (Blick von hinten), von vorn gesehen rechts hinten',
    hoehe: mass(202, 'Bild 4 (DK: S. 5 Fig. 4)'),
    abstandRand: mass(87, 'Bild 4 (DK: S. 5 Fig. 4)', 'Lesart der Kette 87 | 90 wie bei AW 4|5|7'),
    abstandZwischen: mass(90, 'Bild 4 (DK: S. 5 Fig. 4)'),
    durchmesser: schaetzung(34, 'Bild 4 nennt DN 25; Außendurchmesser rund 34 mm'),
    laenge: schaetzung(60, 'Überstand der Stutzen nicht bemaßt'),
  },
  kondensat: {
    vonRechts: mass(270, 'Bild 6 (DK: S. 5 Fig. 6)', 'Bezugskante wie bei AW 4|5|7 gelesen'),
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
