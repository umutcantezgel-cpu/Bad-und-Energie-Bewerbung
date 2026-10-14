/**
 * Anlagenschema einer Luft/Wasser-Wärmepumpe in Monoblock-Bauweise (KERN K-010, E-029) als Fließschema mit
 * Normsymbolen: Außeneinheit (Kältekreis vereinfacht, Plattenwärmeübertrager) → Erdleitung und Wanddurchführung →
 * Inneneinheit (Sicherheitsventil, Absperrung, Vorlauffühler, Erzeugerpumpe, Rückschlagventil, 3-Wege-Ventil, Speicher,
 * Ausdehnungsgefäß) → Pufferspeicher → zwei Heizkreise mit je eigener Pumpe. Sicherheitsventil und Ausdehnungsgefäß
 * sitzen zwischen Wärmeerzeuger und Absperrung (DIN EN 12828: vom Wärmeerzeuger nicht absperrbar).
 *
 * Hydraulik nach der Systemlösung des Herstellers (Prüfung E-029, Runde 2; Bosch 6721892042, Kap. 10.2, Bild 42
 * „zwei Heizkreise, Inneneinheit, Pufferspeicher und Warmwasserspeicher“): Der Pufferspeicher (Trennpuffer) entkoppelt
 * die Erzeugerpumpe von den Pumpen der Heizkreise, so liegen nie zwei Pumpen ohne Entkopplung in Reihe. Dahinter hat
 * jeder Heizkreis seine eigene Pumpe: der Heizkörperkreis ungemischt, die Fußbodenheizung gemischt mit 3-Wege-Mischer
 * in Beimischschaltung (am differenzdruckarmen Puffer ohne Fehlzirkulation), eigener Pumpe und Sicherheits-
 * temperaturwächter im Vorlauf (DIN EN 1264-4, Estrichschutz; die Außeneinheit liefert bis 75 °C, Bosch 6721864591,
 * Tab. 5). Im Rücklauf vor der Inneneinheit sitzt der Partikelfilter (Bosch 6721109817, S. 9: „für alle Anlagen
 * zwingend erforderlich“).
 *
 * Fließrichtung (K-003.2): Der Vorlauf beginnt am Plattenwärmeübertrager der Außeneinheit (Wärmeerzeuger) und endet
 * im Speicher bzw. im Pufferspeicher; die Heizkreise beginnen am Pufferspeicher und enden an den Verbrauchern. Der
 * Rücklauf läuft umgekehrt. Die Inneneinheit ist eine typische Anordnung, kein bestimmtes Modell (M-022); die
 * Systemgrenze steht als Strich-Punkt-Linie. Gezeichnet in components/zeichnung/technik/Anlagenschema.tsx, geprüft in
 * lib/zeichnung/__tests__/schemata.test.ts.
 */
import { an, leitung, pfeil, symbol, type SchemaLeitung, type SchemaPfeil, type SchemaSymbol } from './schema';

export const ANLAGENSCHEMA_RAHMEN = Object.freeze({ breite: 1300, hoehe: 620 });

const S = 2;

/** Bereiche: Außeneinheit (Gehäuse), Inneneinheit (Systemgrenze), Wand und Erdreich. */
export const ANLAGENSCHEMA_BEREICHE = Object.freeze({
  aussen: { x: 4, y: 170, breite: 300, hoehe: 280 },
  innen: { x: 476, y: 74, breite: 410, hoehe: 486 },
  wand: { x: 436, y: 40, breite: 32, hoehe: 580 },
  gok: 470,
  durchfuehrung: { x: 430, y: 494, breite: 44, hoehe: 52 },
});

export const ANLAGENSCHEMA_SYMBOLE: readonly SchemaSymbol[] = [
  // Außeneinheit: Ventilator, Verdampfer, Verdichter, Expansionsventil, Plattenwärmeübertrager. Der Kältekreis läuft
  // als Rechteck mit langen geraden Stücken oben und unten, dort stehen seine Fließpfeile
  symbol('ventilator', 'ventilator', { x: 34, y: 300, massstab: S }),
  symbol('verdampfer', 'verdampfer', { x: 84, y: 300, massstab: S }),
  symbol('verdichter', 'verdichter', { x: 184, y: 210, massstab: S }),
  symbol('expansionsventil', 'expansionsventil', { x: 184, y: 410, drehung: 180, massstab: S }),
  symbol('pwt', 'plattenwaermetauscher', { x: 264, y: 300, massstab: S }),
  // Inneneinheit, Vorlauf: das Sicherheitsventil vor der ersten Absperrung (DIN EN 12828: vom Wärmeerzeuger nicht
  // absperrbar), dahinter Absperrung, Vorlauffühler, Erzeugerpumpe, Rückschlagventil und Umschaltventil
  symbol('sicherheitsventil', 'sicherheitsventil', { x: 548, y: 126, massstab: S }, { wert: 'SV', x: 522, y: 104, anker: 'end' }),
  symbol('absperrung-vl', 'absperrventil', { x: 600, y: 150, massstab: S }),
  symbol('fuehler', 'fuehler', { x: 662, y: 150, massstab: S }),
  symbol('pumpe', 'pumpe', { x: 724, y: 150, massstab: S }, { wert: 'Pumpe', x: 724, y: 204, anker: 'middle' }),
  symbol('rueckschlag', 'rueckschlagventil', { x: 786, y: 150, massstab: S }),
  symbol('umschaltventil', 'dreiwegeventil', { x: 850, y: 150, massstab: S }),
  symbol('speicher', 'speicher', { x: 850, y: 342, massstab: S }, { wert: 'Speicher', x: 850, y: 424, anker: 'middle' }),
  // Inneneinheit, Rücklauf (Fließrichtung nach links): erst die Absperrung, dann das Ausdehnungsgefäß, damit es zum
  // Wärmeerzeuger hin nicht absperrbar ist (DIN EN 12828)
  symbol('absperrung-rl', 'absperrventil', { x: 690, y: 450, massstab: S }),
  symbol('ausdehnung', 'ausdehnungsgefaess', { x: 580, y: 410, massstab: S }, { wert: 'MAG', x: 604, y: 404, anker: 'start' }),
  // Pufferspeicher (Trennpuffer) außerhalb der Inneneinheit, davor im Rücklauf der Partikelfilter (senkrecht, nach unten)
  symbol('puffer', 'pufferspeicher', { x: 966, y: 198, massstab: S }, { wert: 'Puffer', x: 966, y: 112, anker: 'middle' }),
  symbol('filter', 'partikelfilter', { x: 914, y: 350, drehung: 90, massstab: S }),
  // Heizkreis Fußbodenheizung (oben): Mischer (Beimischung von unten aus ihrem Rücklauf), eigene Pumpe,
  // Sicherheitstemperaturwächter (Fühler, schaltet die Pumpe ab), erst dann die Fußbodenheizung
  symbol('mischer', 'dreiwegeventil', { x: 1048, y: 150, massstab: S }),
  symbol('pumpe-fbh', 'pumpe', { x: 1110, y: 150, massstab: S }),
  symbol('stw', 'fuehler', { x: 1154, y: 150, massstab: S }),
  symbol('fussboden', 'fussbodenheizung', { x: 1222, y: 160, massstab: S }, { wert: 'Fußbodenheizung', x: 1296, y: 198, anker: 'end' }),
  // Heizkreis Heizkörper (unten, ungemischt): eigene Pumpe, dann der Heizkörper
  symbol('pumpe-hk', 'pumpe', { x: 1050, y: 330, massstab: S }),
  symbol('heizkoerper', 'heizkoerper', { x: 1150, y: 342, massstab: S }, { wert: 'Heizkörper', x: 1150, y: 388, anker: 'middle' }),
];

const p = (key: string, anschluss: string) => an(ANLAGENSCHEMA_SYMBOLE, key, anschluss);

/** Abzweig des Heizkörperkreises vom Vorlauf der Heizkreise, gleich hinter dem Pufferspeicher. */
const ABZWEIG_HK = { x: 1008, y: 150 };
/** Sammelleitung der Rücklaufe beider Heizkreise (rechts senkrecht, unten waagerecht zum Puffer). */
const SAMMLER = { x: 1284, y: 420 };
/** Abzweig der Beimischung aus dem Rücklauf der Fußbodenheizung, bevor der Heizkörper-Rücklauf dazukommt. */
const BEIMISCHUNG = { x: SAMMLER.x, y: 226 };
/** Senkrechter Rücklauf vom Pufferspeicher zur Inneneinheit (mit Partikelfilter). */
const RL_PUFFER_X = 914;

/** Heizwasser in Fließrichtung. Vorlauf außen um den Rücklauf herum, damit sich keine Leitungen kreuzen. */
export const ANLAGENSCHEMA_LEITUNGEN: readonly SchemaLeitung[] = [
  leitung('vorlauf-erzeuger', 'vorlauf', [
    p('pwt', 'rechtsAus'),
    { x: 350, y: p('pwt', 'rechtsAus').y },
    { x: 350, y: 512 },
    { x: 500, y: 512 },
    { x: 500, y: 150 },
    p('umschaltventil', 'ein'),
  ]),
  // Umschaltventil Heizen (a) → Pufferspeicher, Erzeugerseite
  leitung('vorlauf-puffer', 'vorlauf', [p('umschaltventil', 'a'), p('puffer', 'primaerEin')]),
  leitung('vorlauf-speicher', 'vorlauf', [
    p('umschaltventil', 'b'),
    { x: 850, y: 232 },
    { x: 790, y: 232 },
    { x: 790, y: p('speicher', 'wendelEin').y },
    p('speicher', 'wendelEin'),
  ]),
  // Heizkreise ab dem Pufferspeicher: durch Mischer (ein → a), Pumpe und Sicherheitstemperaturwächter zur Fußbodenheizung …
  leitung('vorlauf-fussboden', 'vorlauf', [p('puffer', 'sekundaerAus'), p('fussboden', 'ein')]),
  // … und abgezweigt durch die eigene Pumpe zum Heizkörper
  leitung('vorlauf-heizkoerper', 'vorlauf', [ABZWEIG_HK, { x: ABZWEIG_HK.x, y: p('pumpe-hk', 'ein').y }, p('heizkoerper', 'ein')]),
  // Rücklauf der Fußbodenheizung zum Sammler und zurück in den Pufferspeicher (unten)
  leitung('ruecklauf-fussboden', 'ruecklauf', [
    p('fussboden', 'aus'),
    { x: SAMMLER.x, y: p('fussboden', 'aus').y },
    { x: SAMMLER.x, y: SAMMLER.y },
    { x: p('puffer', 'sekundaerEin').x, y: SAMMLER.y },
    p('puffer', 'sekundaerEin'),
  ]),
  leitung('ruecklauf-heizkoerper', 'ruecklauf', [p('heizkoerper', 'aus'), { x: SAMMLER.x, y: p('heizkoerper', 'aus').y }]),
  // Beimischung: ein Teil des Rücklaufs der Fußbodenheizung zurück in den Mischer (Anschluss b, von unten)
  leitung('ruecklauf-beimischung', 'ruecklauf', [BEIMISCHUNG, { x: p('mischer', 'b').x, y: BEIMISCHUNG.y }, p('mischer', 'b')]),
  // Erzeugerseite: vom Pufferspeicher durch den Partikelfilter in die Inneneinheit und zurück zur Außeneinheit
  leitung('ruecklauf-erzeuger', 'ruecklauf', [
    p('puffer', 'primaerAus'),
    { x: RL_PUFFER_X, y: p('puffer', 'primaerAus').y },
    { x: RL_PUFFER_X, y: 450 },
    { x: 530, y: 450 },
    { x: 530, y: 532 },
    { x: 330, y: 532 },
    { x: 330, y: p('pwt', 'rechtsEin').y },
    p('pwt', 'rechtsEin'),
  ]),
  leitung('ruecklauf-speicher', 'ruecklauf', [p('speicher', 'wendelAus'), { x: 776, y: p('speicher', 'wendelAus').y }, { x: 776, y: 450 }]),
];

/** Kältemittel im Außengerät (vereinfacht; der Kältekreis im Einzelnen: kaeltekreis.ts). */
export const ANLAGENSCHEMA_KAELTE: readonly SchemaLeitung[] = [
  leitung('sauggas', 'kaeltemittel', [p('verdampfer', 'aus'), { x: 84, y: 210 }, p('verdichter', 'ein')]),
  leitung('heissgas', 'kaeltemittel', [p('verdichter', 'aus'), { x: 224, y: 210 }, { x: 224, y: p('pwt', 'linksEin').y }, p('pwt', 'linksEin')]),
  leitung('fluessig', 'kaeltemittel', [p('pwt', 'linksAus'), { x: 224, y: p('pwt', 'linksAus').y }, { x: 224, y: 410 }, p('expansionsventil', 'ein')]),
  leitung('nassdampf', 'kaeltemittel', [p('expansionsventil', 'aus'), { x: 84, y: 410 }, p('verdampfer', 'ein')]),
];

/**
 * Feste Fließpfeile (Standbild) auf langen geraden Stücken ohne Nachbarleitung: Am Handy wächst ein Pfeil auf rund
 * 47 × 43 Einheiten (technik.module.css, --pfeil), um die Spitze, entgegen der Fließrichtung.
 */
export const ANLAGENSCHEMA_PFEILE: readonly SchemaPfeil[] = [
  pfeil('kaeltemittel', { x: 149, y: 210 }, { x: 1, y: 0 }),
  pfeil('kaeltemittel', { x: 103, y: 410 }, { x: -1, y: 0 }),
  pfeil('vorlauf', { x: 500, y: 300 }, { x: 0, y: -1 }),
  pfeil('vorlauf', { x: 936, y: 150 }, { x: 1, y: 0 }),
  pfeil('vorlauf', { x: ABZWEIG_HK.x, y: 305 }, { x: 0, y: 1 }),
  pfeil('ruecklauf', { x: 1100, y: SAMMLER.y }, { x: -1, y: 0 }),
  pfeil('ruecklauf', { x: RL_PUFFER_X, y: 324 }, { x: 0, y: 1 }),
  pfeil('ruecklauf', { x: 720, y: 450 }, { x: -1, y: 0 }),
];

/** Beschriftung der Bereiche (Versalien, immer sichtbar). */
export const ANLAGENSCHEMA_TEXTE = Object.freeze([
  { wert: 'Außeneinheit', x: 4, y: 150, anker: 'start' as const },
  { wert: 'Inneneinheit', x: 476, y: 50, anker: 'start' as const },
  { wert: 'Erdreich', x: 14, y: 600, anker: 'start' as const },
  { wert: 'Heizkreise', x: 1296, y: 50, anker: 'end' as const },
]);
