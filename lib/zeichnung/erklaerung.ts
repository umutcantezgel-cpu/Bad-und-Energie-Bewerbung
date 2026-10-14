/**
 * Erklärtext zu den Zeichnungen der Wärmepumpen-Seite (E-029, AEO): Wie eine Luft/Wasser-Wärmepumpe arbeitet, in der
 * Reihenfolge der Fließschemata (szenen/kaeltekreis.ts, szenen/anlagenschema.ts) und mit den Werten des Beispielgeräts
 * (geraete/compress-aw-s.ts). Reine Technik, keine Aussage über den Betrieb (die stehen nur in lib/content/facts.ts);
 * jede Zahl kommt aus dem Geräte-Modul. Gesetzt mit geschützten Leerzeichen vor Einheiten und Halbgeviert in Spannen.
 * Geprüft in lib/zeichnung/__tests__/erklaerung.test.ts.
 */
import { COMPRESS_AW_S } from './geraete/compress-aw-s';
import type { Aussengeraet } from './geraete/typen';
import { FROSTTIEFE, HAUSSCHNITT_ERDLEITUNG, HAUSSCHNITT_GOK } from './szenen/hausschnitt';
import { KAELTEKREIS_SYMBOLE } from './szenen/kaeltekreis';

const NBSP = ' ';
const zahl = (wert: number) => wert.toLocaleString('de-DE');
const mm = (wert: number) => `${zahl(wert)}${NBSP}mm`;

/** Herkunft eines Satzes: Zeichnung bzw. Geräte-Modul, aus dem er abgeleitet ist. */
export type ErklaerQuelle = 'zeichnung:kaeltekreis' | 'zeichnung:anlagenschema' | `geraet:${string}`;

export interface ErklaerSatz {
  text: string;
  quelle: ErklaerQuelle;
}

/** Abschnittskopf (Form wie lib/themen/text.ts `Kopfzeile`): Frage als Überschrift, Antwort im ersten Satz. */
export const TECHNIK_KOPF = Object.freeze({
  id: 'technik',
  etikett: 'Technik',
  heading: 'Wie arbeitet eine Luft/Wasser-Wärmepumpe?',
});

/** Die direkte Antwort (erster Absatz unter der Überschrift). */
export const TECHNIK_ANTWORT: ErklaerSatz = {
  text:
    'Eine Luft/Wasser-Wärmepumpe holt Wärme aus der Außenluft und gibt sie an das Heizwasser ab. In der ' +
    'Monoblock-Bauweise steckt der ganze Kältekreis in der Außeneinheit; ins Haus führen nur Vorlauf und Rücklauf.',
  quelle: 'zeichnung:kaeltekreis',
};

/** Die vier Stationen des Kältekreises, je Symbol des Fließschemas in Fließrichtung. */
export const KAELTEKREIS_SCHRITTE: readonly { symbol: string; bauteil: string; text: string }[] = [
  {
    symbol: 'verdampfer',
    bauteil: 'Verdampfer',
    text: 'Der Ventilator zieht Außenluft durch den Lamellenblock. Das Kältemittel nimmt ihre Wärme auf und verdampft.',
  },
  {
    symbol: 'verdichter',
    bauteil: 'Verdichter',
    text: 'Er saugt den Dampf an und verdichtet ihn. Druck und Temperatur steigen, aus dem Sauggas wird Heißgas.',
  },
  {
    symbol: 'verfluessiger',
    bauteil: 'Verflüssiger',
    text: 'Im Plattenwärmeübertrager gibt das Heißgas seine Wärme an das Heizwasser ab und wird flüssig. Hier beginnt der Vorlauf.',
  },
  {
    symbol: 'expansionsventil',
    bauteil: 'Expansionsventil',
    text: 'Es senkt den Druck. Das Kältemittel kühlt ab und fließt als Nassdampf zurück zum Verdampfer.',
  },
];

/** Meter mit Komma und geschütztem Leerzeichen („0,88 m“). */
const meter = (mm: number) => `${(mm / 1000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${NBSP}m`;

/**
 * Tiefe der Erdleitung (Achse des Vorlaufs) und die Frosttiefe aus dem Hausschnitt (szenen/hausschnitt.ts): Der Text
 * nennt die Frostgrenze nur, weil die Zeichnung die Leitung darunter legt (Prüfung E-029, Runde 2).
 */
const ERDLEITUNG_MM = (HAUSSCHNITT_ERDLEITUNG.vorlauf - HAUSSCHNITT_GOK) * 10;
if (ERDLEITUNG_MM <= FROSTTIEFE.mm) throw new Error('lib/zeichnung: Die Erdleitung liegt nicht unter der Frosttiefe');

/** Der Weg des Heizwassers (Anlagenschema). */
export const HEIZWASSER: ErklaerSatz = {
  text:
    `Der Vorlauf läuft in der Erdleitung rund ${meter(ERDLEITUNG_MM)} tief, unter der Frostgrenze von ${meter(FROSTTIEFE.mm)}, ` +
    'durch die Wanddurchführung zur Inneneinheit. Dort sitzen ' +
    'Umwälzpumpe, Sicherheitsventil, Ausdehnungsgefäß und das Umschaltventil: Es schickt das Wasser in den Speicher für ' +
    'das Warmwasser oder in den Pufferspeicher. Der Puffer trennt die Umwälzpumpe hydraulisch von den Heizkreisen, und ' +
    'jeder Heizkreis hat dahinter seine eigene Pumpe. Die Heizkörper bekommen das Wasser direkt, die Fußbodenheizung ' +
    'über einen gemischten Kreis: Ein Mischer gibt Wasser aus ihrem Rücklauf dazu, und ein Sicherheitstemperaturwächter ' +
    'schaltet ab, wenn der Vorlauf zu heiß wird. So nimmt der Estrich keinen Schaden. Der Rücklauf bringt das ' +
    'abgekühlte Wasser durch einen Partikelfilter zurück zur Außeneinheit.',
  quelle: 'zeichnung:anlagenschema',
};

/** Steckbrief des Beispielgeräts aus dem Geräte-Modul (Maße, Gewicht, Kältemittel, Fundstelle). */
export function geraetSteckbrief(g: Aussengeraet = COMPRESS_AW_S): ErklaerSatz {
  const km = g.kaeltemittel;
  return {
    text:
      `Beispielgerät: ${g.name}, ${mm(g.breite.mm)} breit, ${mm(g.hoehe.mm)} hoch, ${mm(g.tiefe.mm)} tief, ` +
      `${zahl(g.gewichtKg.wert)}${NBSP}kg. Kältemittel ${km.name} (Propan), ${zahl(km.fuellmengeKg)}${NBSP}kg. ` +
      `Maße nach ${g.quelle.titel} (Dok.-Nr. ${g.quelle.dokument}).`,
    quelle: `geraet:${g.id}`,
  };
}

/** Reihenfolge der Schritte = Reihenfolge der Symbole im Kältekreis (für den Test und die Legende). */
export const KAELTEKREIS_REIHENFOLGE = KAELTEKREIS_SYMBOLE.map((s) => s.key);
