/**
 * Lage aller Bildebenen des Helfers im Kasten 620 × 660.
 * Erzeugt vom Zeichenwerkzeug im Repository der Hauptseite (bad-energie, _werkstatt/maskottchen/werkzeug/avatar-bauen.mjs),
 * zusammen mit den Bildern unter public/helfer/v1. Nicht von Hand ändern: Ändert sich die Zeichnung, kommen Bilder und
 * diese Datei gemeinsam neu, die Bilder in einen neuen Ordner (v2 …), weil Bilddateien ein Jahr im Cache bleiben.
 */
export const DATEN = {
  kasten: [
    620,
    660
  ],
  kopf: {
    x: 330,
    y: 205,
    rot: -2
  },
  augen: [
    {
      cx: 8,
      cy: -17,
      rx: 15,
      ry: 12.5
    },
    {
      cx: 72,
      cy: -19,
      rx: 12,
      ry: 11.5
    }
  ],
  pupille: {
    dx: 4,
    dy: 0.5,
    r: 7.4,
    rGross: 6.5
  },
  gelenke: {
    hals: [
      334,
      292
    ],
    schulterNah: [
      276,
      372
    ],
    schulterFern: [
      372,
      372
    ],
    ellbogenFern: [
      444,
      388
    ],
    fuesse: [
      320,
      618
    ]
  },
  farben: {
    auge: "#2B1A10"
  },
  ebenen: {
    koerper: {
      x: 191.2,
      y: 249.6,
      w: 255.2,
      h: 375.2
    },
    "arm-nah-unten": {
      x: 224,
      y: 345.6,
      w: 76,
      h: 213.6
    },
    "arm-nah-zeigen": {
      x: 68.8,
      y: 303.2,
      w: 232.8,
      h: 118.4
    },
    "arm-nah-polieren": {
      x: 212.8,
      y: 346.4,
      w: 148,
      h: 115.2
    },
    "arm-fern-unten": {
      x: 345.6,
      y: 346.4,
      w: 83.2,
      h: 212
    },
    "arm-fern-winken": {
      x: 345.6,
      y: 244.8,
      w: 196.8,
      h: 168.8
    },
    "arm-fern-daumen": {
      x: 348,
      y: 291.2,
      w: 187.2,
      h: 146.4
    },
    "kopf-lachen": {
      x: 204.8,
      y: 45.6,
      w: 236.8,
      h: 288.8
    },
    "kopf-schmunzeln": {
      x: 204.8,
      y: 45.6,
      w: 236.8,
      h: 288.8
    },
    "kopf-staunen": {
      x: 204.8,
      y: 45.6,
      w: 236.8,
      h: 288.8
    },
    "kopf-zwinkern": {
      x: 204.8,
      y: 45.6,
      w: 236.8,
      h: 288.8
    },
    "kopf-jubel": {
      x: 204.8,
      y: 45.6,
      w: 236.8,
      h: 288.8
    },
    lider: {
      x: 316,
      y: 166.4,
      w: 103.2,
      h: 38.4
    },
    rumpf: {
      x: 248.8,
      y: 287.2,
      w: 141.6,
      h: 220.8
    },
    "bein-nah": {
      x: 191.2,
      y: 455.2,
      w: 136,
      h: 168.8
    },
    "bein-fern": {
      x: 313.6,
      y: 455.2,
      w: 132.8,
      h: 169.6
    },
    "lauf-a": {
      x: 92,
      y: 59.2,
      w: 436,
      h: 564.8
    },
    "lauf-b": {
      x: 117.6,
      y: 58.4,
      w: 344.8,
      h: 565.6
    }
  }
} as const;

export type EbenenName = keyof typeof DATEN.ebenen;
