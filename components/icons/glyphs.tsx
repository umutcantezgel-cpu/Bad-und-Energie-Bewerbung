import type { ReactElement } from 'react';

/**
 * Glyphen im Formsystem (KERN K-010): Raster 24 × 24 mit Rand 2, Giebel 45° und Kreis, runde Enden,
 * eine Strichstärke (--m-strich, 3 px) über vector-effect: non-scaling-stroke, Farbe currentColor.
 * Alles ist Strich, nichts Fläche: Punkte sind Striche der Länge 0,01 mit rundem Ende.
 *
 * Die acht Familien-Icons stammen aus B Runde 1 (_relaunch/ausbau/referenz/b-runde1, Sprite i-*).
 * Die übrigen ersetzen die lucide-Icons der Plattform (Zuordnung in LUCIDE_ERSATZ); die Wellen
 * R3–R5 tauschen die Importe. WhatsApp erscheint als eigene Sprechblase ohne Fremdlogo.
 */

type Shape =
  | { d: string; transform?: string }
  | { cx: number; cy: number; r: number }
  | { x: number; y: number; width: number; height: number; rx?: number };

const BLATT = 'M12 11.2c-.9-1.5-.6-2.9.5-3.8';
const BRIEF: readonly Shape[] = [{ x: 3, y: 5, width: 18, height: 14, rx: 2.5 }, { d: 'M4.5 8 12 15.5 19.5 8' }];

export const GLYPH_SHAPES = {
  // ── Familie (B Runde 1) ──
  /** Wärmepumpe: Gehäuse, Lüfter mit drei Blättern, Füße */
  waermepumpe: [
    { x: 3, y: 4, width: 18, height: 14, rx: 3 },
    { cx: 12, cy: 11, r: 4.2 },
    { d: BLATT },
    { d: BLATT, transform: 'rotate(120 12 11.2)' },
    { d: BLATT, transform: 'rotate(240 12 11.2)' },
    { d: 'M7 18v3M17 18v3' },
  ],
  /** Tropfen (Bad): Giebel 45° auf einem Kreis r 7 */
  tropfen: [{ d: 'M12 4.6 7.05 9.55a7 7 0 1 0 9.9 0Z' }, { d: 'M9 15.2a3.2 3.2 0 0 0 2.4 2.4' }],
  /** Flamme (Heizung): Spitze und Kreis, eine Flanke eingerollt */
  flamme: [{ d: 'M12 3c.4 3 5.8 5.6 5.8 11a5.8 5.8 0 0 1-11.6 0c0-2.2 1-3.6 2.2-4.8.2 1.6.9 2.6 1.9 3C10.1 9.4 10.3 6 12 3Z' }],
  /** Werkzeug: Maulschlüssel, 45° gedreht */
  werkzeug: [
    { d: 'M10.5 3.3A4.5 4.5 0 1 0 13.5 3.3V6.5h-3Z', transform: 'rotate(45 12 12)' },
    { d: 'M10.5 11.9v7.6a1.5 1.5 0 0 0 3 0v-7.6', transform: 'rotate(45 12 12)' },
  ],
  /** Servicefahrzeug */
  servicefahrzeug: [
    { d: 'M5.5 16.5h-3v-8a1 1 0 0 1 1-1H15l4 4h1.5a1 1 0 0 1 1 1v4H19' },
    { d: 'M9.5 16.5H15' },
    { cx: 7.5, cy: 16.5, r: 2 },
    { cx: 17, cy: 16.5, r: 2 },
  ],
  /** Uhr auf 13:30 (Feierabend am Freitag) */
  uhr: [{ cx: 12, cy: 12, r: 9 }, { d: 'M12 12l4.2-4.2M12 12v6' }],
  /** Standort: Giebel 45° unter einem Kreis */
  standort: [{ d: 'M12 19.9 7.05 14.95a7 7 0 1 1 9.9 0Z' }, { cx: 12, cy: 10, r: 2.5 }],
  /** Nachricht: Umschlag */
  nachricht: BRIEF,

  // ── Ersatz für lucide (Formsystem: 45°, Kreis, runde Enden) ──
  'arrow-right': [{ d: 'M5 12h14' }, { d: 'M13 6l6 6-6 6' }],
  'arrow-left': [{ d: 'M19 12H5' }, { d: 'M11 6l-6 6 6 6' }],
  'arrow-down': [{ d: 'M12 5v14' }, { d: 'M6 13l6 6 6-6' }],
  'arrow-up': [{ d: 'M12 19V5' }, { d: 'M6 11l6-6 6 6' }],
  'chevron-right': [{ d: 'M9 5.5 15.5 12 9 18.5' }],
  'chevron-left': [{ d: 'M15 5.5 8.5 12 15 18.5' }],
  'chevron-down': [{ d: 'M5.5 9 12 15.5 18.5 9' }],
  check: [{ d: 'M5 12.5l4.5 4.5L19 7.5' }],
  x: [{ d: 'M6 6l12 12M18 6 6 18' }],
  plus: [{ d: 'M12 5v14M5 12h14' }],
  menu: [{ d: 'M4 7h16M4 12h16M4 17h16' }],
  'circle-alert': [{ cx: 12, cy: 12, r: 9 }, { d: 'M12 7.5v5.5M12 16.5h.01' }],
  'circle-check': [{ cx: 12, cy: 12, r: 9 }, { d: 'M8 12.5l2.75 2.75L16 10' }],
  'eye-off': [
    { d: 'M2.5 12C5 7.5 8.3 5.5 12 5.5s7 2 9.5 6.5C19 16.5 15.7 18.5 12 18.5S5 16.5 2.5 12Z' },
    { cx: 12, cy: 12, r: 2.5 },
    { d: 'M4 4l16 16' },
  ],
  'file-text': [
    { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z' },
    { d: 'M14 3v5h5' },
    { d: 'M9 12.5h6M9 17h4' },
  ],
  mail: BRIEF,
  map: [{ d: 'M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20Z' }, { d: 'M9 4v13.5M15 6.5V20' }],
  /** Sprechblase für WhatsApp und Chat, ohne Fremdlogo */
  'message-circle': [{ d: 'M12 3a9 9 0 1 1-4.6 16.7L3 21l1.3-4.4A9 9 0 0 1 12 3Z' }],
  /** Hörer (aus Variante 1) */
  phone: [{ d: 'M7 3h3l1.5 4.5-2 1.5a10 10 0 0 0 5.5 5.5l1.5-2L21 14v3a3 3 0 0 1-3 3A15 15 0 0 1 4 6a3 3 0 0 1 3-3Z' }],
  printer: [
    { d: 'M7 9V3h10v6' },
    { d: 'M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2' },
    { x: 7, y: 14, width: 10, height: 7, rx: 1 },
  ],
  /** Gegen den Uhrzeigersinn: Bogen um den Mittelpunkt, Spitze im 45°-Winkel */
  'rotate-ccw': [{ d: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3' }, { d: 'M10.7 6.7h-4v-4' }],
  'rotate-cw': [{ d: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3' }, { d: 'M13.3 6.7h4v-4' }],
  'shield-check': [
    { d: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z' },
    { d: 'M8.5 12l2.5 2.5 4.5-4.5' },
  ],
  trash: [{ d: 'M4 6.5h16' }, { d: 'M9.5 6.5V4h5v2.5' }, { d: 'M6 6.5 7 20h10l1-13.5' }, { d: 'M10 10.5v6M14 10.5v6' }],
  'user-plus': [{ cx: 9, cy: 8, r: 3.5 }, { d: 'M2.5 20a6.5 6.5 0 0 1 13 0' }, { d: 'M19 8v6M16 11h6' }],
  camera: [
    { d: 'M3 8.5a2 2 0 0 1 2-2h2.5L9 4h6l1.5 2.5H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z' },
    { cx: 12, cy: 13, r: 3.5 },
  ],
  // Vorteile der Startseite (BenefitGrid); Fahrzeug und Werkzeug kommen aus der Familie
  banknote: [{ x: 3, y: 6, width: 18, height: 12, rx: 2 }, { cx: 12, cy: 12, r: 2.5 }, { d: 'M6.5 12h.01M17.5 12h.01' }],
  'calendar-off': [{ x: 3, y: 5, width: 18, height: 16, rx: 2 }, { d: 'M8 3v4M16 3v4M3 10h18' }, { d: 'M4 4l16 16' }],
  'file-check': [
    { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z' },
    { d: 'M14 3v5h5' },
    { d: 'M9 14.5l2 2 4-4' },
  ],
  'graduation-cap': [
    { d: 'M12 4 2.5 9 12 14l9.5-5Z' },
    { d: 'M6.5 11.3V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.7' },
    { d: 'M21.5 9v5' },
  ],
  'tablet-smartphone': [
    { x: 3, y: 4, width: 11, height: 16, rx: 2 },
    { x: 16, y: 9, width: 6, height: 11, rx: 1.5 },
    { d: 'M8.5 16.5h.01M19 17h.01' },
  ],
  users: [
    { cx: 9, cy: 8, r: 3.5 },
    { d: 'M2.5 20a6.5 6.5 0 0 1 13 0' },
    { d: 'M16 4.7a3.5 3.5 0 0 1 0 6.6' },
    { d: 'M18 14.2a6.5 6.5 0 0 1 3.5 5.8' },
  ],
} as const satisfies Record<string, readonly Shape[]>;

export type IconName = keyof typeof GLYPH_SHAPES;

export const ICON_NAMES = Object.keys(GLYPH_SHAPES) as IconName[];

/** Die acht Familien-Icons aus B Runde 1. */
export const FAMILIE: readonly IconName[] = [
  'waermepumpe',
  'tropfen',
  'flamme',
  'werkzeug',
  'servicefahrzeug',
  'uhr',
  'standort',
  'nachricht',
];

/** lucide-Name → Glyphe. Grundlage für den Tausch der Importe in R3–R5. */
export const LUCIDE_ERSATZ = {
  ArrowDown: 'arrow-down',
  ArrowLeft: 'arrow-left',
  ArrowRight: 'arrow-right',
  ArrowUp: 'arrow-up',
  Banknote: 'banknote',
  CalendarOff: 'calendar-off',
  Camera: 'camera',
  Check: 'check',
  ChevronDown: 'chevron-down',
  ChevronLeft: 'chevron-left',
  ChevronRight: 'chevron-right',
  CircleAlert: 'circle-alert',
  CircleCheck: 'circle-check',
  EyeOff: 'eye-off',
  FileCheck: 'file-check',
  FileText: 'file-text',
  GraduationCap: 'graduation-cap',
  Mail: 'mail',
  Map: 'map',
  Menu: 'menu',
  MessageCircle: 'message-circle',
  Phone: 'phone',
  Plus: 'plus',
  Printer: 'printer',
  RotateCcw: 'rotate-ccw',
  RotateCw: 'rotate-cw',
  ShieldCheck: 'shield-check',
  TabletSmartphone: 'tablet-smartphone',
  Trash: 'trash',
  Trash2: 'trash',
  Truck: 'servicefahrzeug',
  UserPlus: 'user-plus',
  Users: 'users',
  Wrench: 'werkzeug',
  X: 'x',
} as const satisfies Record<string, IconName>;

/** Rendert die Formen einer Glyphe; jede Form skaliert ihren Strich nicht mit. */
export function renderGlyph(name: IconName): ReactElement[] {
  const shapes: readonly Shape[] = GLYPH_SHAPES[name];
  return shapes.map((shape, i) => {
    if ('d' in shape) {
      return <path key={i} d={shape.d} transform={shape.transform} vectorEffect="non-scaling-stroke" />;
    }
    if ('cx' in shape) {
      return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} vectorEffect="non-scaling-stroke" />;
    }
    return (
      <rect
        key={i}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rx={shape.rx}
        vectorEffect="non-scaling-stroke"
      />
    );
  });
}
