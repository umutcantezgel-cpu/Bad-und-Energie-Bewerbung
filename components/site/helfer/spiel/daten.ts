/**
 * Lage aller Bildebenen des Helfers im Kasten 620 × 660. Version 2: gemalte Figur.
 * Erzeugt von bauen.py aus dem Teileblatt (Körper, Kopf A und B, vier Arme), dem Mimikblatt (Zwinkern, Staunen,
 * Jubel) und dem runden Profilbild, zusammen mit den Bildern unter public/helfer/v2. Nicht von Hand ändern:
 * Ändert sich die Zeichnung, kommen Bilder und diese Datei gemeinsam neu, die Bilder in einen neuen Ordner (v3 …),
 * weil Bilddateien ein Jahr im Cache bleiben.
 * augen[0] ist das rechte Auge im Bild (bleibt beim Zwinkern offen), augen[1] das linke (beim Zwinkern zu).
 */
export const DATEN = {
  kasten: [
    620,
    660
  ],
  kopf: {
    x: 322,
    y: 190,
    rot: 0
  },
  augen: [
    {
      cx: 78.2,
      cy: -4.4,
      rx: 14.4,
      ry: 6.3
    },
    {
      cx: 4.8,
      cy: 1.4,
      rx: 17.4,
      ry: 7.1
    }
  ],
  pupille: {
    dx: -1,
    dy: -0.5,
    r: 10.8,
    rGross: 9.4
  },
  gelenke: {
    hals: [
      303.6,
      326.2
    ],
    schulterNah: [
      253.6,
      358.6
    ],
    schulterFern: [
      369.1,
      350.9
    ],
    ellbogenFern: [
      391,
      360.2
    ],
    fuesse: [
      320,
      620
    ]
  },
  farben: {
    auge: "#341C10"
  },
  ebenen: {
    koerper: {
      x: 218,
      y: 298,
      w: 204,
      h: 325
    },
    "arm-nah-unten": {
      x: 220,
      y: 339,
      w: 58,
      h: 173
    },
    "arm-nah-zeigen": {
      x: 94,
      y: 337,
      w: 178,
      h: 47
    },
    "arm-nah-polieren": {
      x: 230,
      y: 337,
      w: 107,
      h: 90
    },
    "arm-fern-unten": {
      x: 344,
      y: 331,
      w: 59,
      h: 173
    },
    "arm-fern-winken": {
      x: 321,
      y: 281,
      w: 165,
      h: 102
    },
    "arm-fern-daumen": {
      x: 350,
      y: 328,
      w: 116,
      h: 86
    },
    "kopf-lachen": {
      x: 208,
      y: 41,
      w: 227,
      h: 301
    },
    "kopf-schmunzeln": {
      x: 208,
      y: 41,
      w: 227,
      h: 301
    },
    "kopf-staunen": {
      x: 208,
      y: 41,
      w: 227,
      h: 301
    },
    "kopf-zwinkern": {
      x: 208,
      y: 41,
      w: 227,
      h: 301
    },
    "kopf-jubel": {
      x: 208,
      y: 41,
      w: 227,
      h: 301
    },
    lider: {
      x: 288,
      y: 155,
      w: 139,
      h: 62
    },
    rumpf: {
      x: 234,
      y: 298,
      w: 134,
      h: 157
    },
    "bein-nah": {
      x: 218,
      y: 436,
      w: 102,
      h: 187
    },
    "bein-fern": {
      x: 312,
      y: 435,
      w: 110,
      h: 180
    },
    "lauf-a": {
      x: 191,
      y: 36,
      w: 257,
      h: 587
    },
    "lauf-b": {
      x: 191,
      y: 53,
      w: 257,
      h: 570
    }
  }
} as const;

export type EbenenName = keyof typeof DATEN.ebenen;
