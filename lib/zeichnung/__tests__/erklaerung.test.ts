import { describe, expect, it } from 'vitest';
import {
  HEIZWASSER,
  KAELTEKREIS_REIHENFOLGE,
  KAELTEKREIS_SCHRITTE,
  TECHNIK_ANTWORT,
  TECHNIK_KOPF,
  WAERMEVERTEILUNG,
  geraetSteckbrief,
} from '../erklaerung';
import { COMPRESS_AW_L } from '../geraete/compress-aw-l';
import { COMPRESS_AW_S } from '../geraete/compress-aw-s';
import { FROSTTIEFE, HAUSSCHNITT_ERDLEITUNG, HAUSSCHNITT_GOK } from '../szenen/hausschnitt';
import { KAELTEKREIS_SYMBOLE, KAELTEKREIS_WEGE } from '../szenen/kaeltekreis';
import { RAUM_INNEN } from '../szenen/raumschnitt';
import { SYMBOLE } from '../symbole';

const NBSP = ' ';
const WAERME_TEXTE = [WAERMEVERTEILUNG.heizkoerper.text, WAERMEVERTEILUNG.fussboden.text, WAERMEVERTEILUNG.hinweis.text];
const alleTexte = [
  TECHNIK_KOPF.heading,
  TECHNIK_ANTWORT.text,
  ...KAELTEKREIS_SCHRITTE.map((s) => s.text),
  HEIZWASSER.text,
  geraetSteckbrief().text,
  WAERMEVERTEILUNG.titel,
  ...WAERME_TEXTE,
];

describe('Erklärtext zur Wärmepumpe (E-029, AEO)', () => {
  it('Frage als Überschrift, die Antwort im ersten Absatz: Monoblock, Kältekreis in der Außeneinheit, ins Haus nur Heizwasser', () => {
    expect(TECHNIK_KOPF.heading).toMatch(/\?$/);
    expect(TECHNIK_ANTWORT.quelle).toBe('zeichnung:kaeltekreis');
    expect(TECHNIK_ANTWORT.text).toMatch(/^Eine Luft\/Wasser-Wärmepumpe holt Wärme aus der Außenluft/);
    expect(TECHNIK_ANTWORT.text).toContain('Monoblock');
    expect(TECHNIK_ANTWORT.text).toContain('ganze Kältekreis in der Außeneinheit');
    expect(TECHNIK_ANTWORT.text).toContain('nur Vorlauf und Rücklauf');
  });

  it('die Schritte folgen dem Kältekreis in Fließrichtung, je Symbol einer, mit dem Namen des Bauteils', () => {
    expect(KAELTEKREIS_SCHRITTE.map((s) => s.symbol)).toEqual([...KAELTEKREIS_REIHENFOLGE]);
    expect(KAELTEKREIS_REIHENFOLGE).toEqual(KAELTEKREIS_SYMBOLE.map((s) => s.key));
    expect(KAELTEKREIS_REIHENFOLGE).toEqual(['verdampfer', 'verdichter', 'verfluessiger', 'expansionsventil']);
    for (const schritt of KAELTEKREIS_SCHRITTE) {
      const def = SYMBOLE[KAELTEKREIS_SYMBOLE.find((s) => s.key === schritt.symbol)!.id];
      expect(def.name, schritt.symbol).toBeTruthy();
      expect(schritt.text.length, schritt.symbol).toBeGreaterThan(40);
    }
  });

  it('fachlich in der Reihenfolge der Zeichnung: verdampft, Sauggas → Heißgas, flüssig, Druck sinkt; der Vorlauf beginnt am Verflüssiger', () => {
    const [verdampfer, verdichter, verfluessiger, expansion] = KAELTEKREIS_SCHRITTE.map((s) => s.text);
    expect(verdampfer).toMatch(/Außenluft[\s\S]*verdampft/);
    expect(verdichter).toMatch(/verdichtet[\s\S]*Druck und Temperatur steigen[\s\S]*Sauggas wird Heißgas/);
    expect(verfluessiger).toMatch(/Heißgas[\s\S]*Heizwasser[\s\S]*flüssig[\s\S]*Hier beginnt der Vorlauf/);
    expect(expansion).toMatch(/senkt den Druck[\s\S]*zurück zum Verdampfer/);
    // Die Etiketten der Zeichnung kommen im Text vor (Sauggas, Heißgas, flüssig, Nassdampf)
    for (const weg of KAELTEKREIS_WEGE) expect(KAELTEKREIS_SCHRITTE.map((s) => s.text).join(' '), weg.key).toContain(weg.etikett!.wert);
  });

  it('Heizwasser: erst der Vorlauf von der Außeneinheit über Erdleitung und Wanddurchführung, dann der Rücklauf zurück', () => {
    const t = HEIZWASSER.text;
    expect(HEIZWASSER.quelle).toBe('zeichnung:anlagenschema');
    expect(t.indexOf('Vorlauf')).toBeGreaterThanOrEqual(0);
    expect(t.indexOf('Vorlauf')).toBeLessThan(t.indexOf('Rücklauf'));
    expect(t).toMatch(/Erdleitung[\s\S]*Wanddurchführung[\s\S]*Inneneinheit/);
    // Tiefe und Frostgrenze aus dem Hausschnitt (Prüfung E-029, Runde 2): nur „unter der Frostgrenze“, weil die
    // gezeichnete Leitung tiefer liegt als die Frosttiefe
    const tiefe = (HAUSSCHNITT_ERDLEITUNG.vorlauf - HAUSSCHNITT_GOK) * 10;
    expect(tiefe).toBeGreaterThan(FROSTTIEFE.mm);
    const m = (mm: number) => `${(mm / 1000).toFixed(2).replace('.', ',')}${NBSP}m`;
    expect(t).toContain(`Erdleitung rund ${m(tiefe)} tief, unter der Frostgrenze von ${m(FROSTTIEFE.mm)}`);
    expect(t).toMatch(/Rücklauf[\s\S]*zurück zur Außeneinheit/);
    for (const bauteil of ['Umwälzpumpe', 'Sicherheitsventil', 'Ausdehnungsgefäß', 'Umschaltventil', 'Speicher']) expect(t).toContain(bauteil);
    // Hydraulik wie im Anlagenschema (Prüfung E-029, Runde 2): Pufferspeicher trennt die Umwälzpumpe von den
    // Heizkreisen, jeder Heizkreis mit eigener Pumpe, die Fußbodenheizung gemischt (DIN EN 1264-4), Filter im Rücklauf
    expect(t).toMatch(/Pufferspeicher[\s\S]*Puffer trennt die Umwälzpumpe[\s\S]*jeder Heizkreis hat dahinter seine eigene Pumpe/);
    expect(t).toMatch(/Fußbodenheizung[\s\S]*Mischer[\s\S]*Sicherheitstemperaturwächter/);
    expect(t).toMatch(/Rücklauf[\s\S]*Partikelfilter zurück zur Außeneinheit/);
  });

  it('Steckbrief: jede Zahl aus dem Geräte-Modul, mit geschütztem Leerzeichen vor der Einheit und der Fundstelle', () => {
    for (const g of [COMPRESS_AW_S, COMPRESS_AW_L]) {
      const { text, quelle } = geraetSteckbrief(g);
      expect(quelle).toBe(`geraet:${g.id}`);
      for (const mm of [g.breite.mm, g.hoehe.mm, g.tiefe.mm]) expect(text).toContain(`${mm.toLocaleString('de-DE')}${NBSP}mm`);
      expect(text).toContain(`${g.gewichtKg.wert.toLocaleString('de-DE')}${NBSP}kg`);
      expect(text).toContain(`${g.kaeltemittel.name} (Propan), ${g.kaeltemittel.fuellmengeKg.toLocaleString('de-DE')}${NBSP}kg`);
      expect(text).toContain(`Dok.-Nr. ${g.quelle.dokument}`);
      // Keine geschätzten Werte im Text (Lage der Ausblasöffnung, Rotor, Stutzen sind nicht bemaßt)
      for (const geschaetzt of [g.ausblas.mitteX, g.rotor.durchmesser, g.rotor.nabe, g.hydraulik.laenge]) {
        expect(geschaetzt.geschaetzt).toBe('geschaetzt');
        expect(text).not.toMatch(new RegExp(`\\b${geschaetzt.mm.toLocaleString('de-DE').replace('.', '\\.')}\\b`));
      }
    }
    expect(geraetSteckbrief().text).toBe(geraetSteckbrief(COMPRESS_AW_S).text);
  });

  it('Wärme im Raum (E-031): nur Physik aus dem gerechneten Wärmefeld, keine Temperaturen, Maße aus dem Raumschnitt', () => {
    for (const satz of [WAERMEVERTEILUNG.heizkoerper, WAERMEVERTEILUNG.fussboden, WAERMEVERTEILUNG.hinweis]) expect(satz.quelle).toBe('zeichnung:waermefeld');
    for (const text of WAERME_TEXTE) {
      expect(text).not.toMatch(/°|Grad|Kelvin|Celsius|warm genug|spar|effizien|Kosten|Prozent|%/i);
      expect(text).not.toMatch(/\d\s*K\b/);
    }
    // Die einzigen Zahlen sind die Maße des Raums (lichte Breite und Höhe aus lib/zeichnung/szenen/raumschnitt.ts)
    expect(WAERME_TEXTE.join(' ').match(/\d+(?:,\d+)?/g)).toEqual([
      (RAUM_INNEN.breite / 100).toLocaleString('de-DE'),
      (RAUM_INNEN.hoehe / 100).toLocaleString('de-DE'),
    ]);
    expect(WAERMEVERTEILUNG.hinweis.text).toContain(`4,2${NBSP}×${NBSP}2,5${NBSP}m`);
    // Was der Text sagt, prüft lib/zeichnung/__tests__/waermefeld.test.ts am Feld: Fahne, Schicht unter der Decke, kühler
    // Boden; Fußbodenheizung gleichmäßiger, am Boden wärmer, an der Außenwand kühler
    expect(WAERMEVERTEILUNG.heizkoerper.text).toMatch(
      /steigt[\s\S]*Fahne[\s\S]*unter die Decke[\s\S]*warme Schicht[\s\S]*sinkt im ganzen Raum[\s\S]*über den Boden[\s\S]*zum Heizkörper[\s\S]*zurück[\s\S]*Am Boden bleibt es kühler als unter der Decke/,
    );
    // Prüfrunde 2 B2-2: Das Feld zeigt kein Absinken an der Gegenwand (die Walze lässt die Luft über die Breite sinken)
    expect(WAERMEVERTEILUNG.heizkoerper.text).not.toMatch(/gegenüberliegenden Wand|an der Innenwand/);
    expect(WAERMEVERTEILUNG.fussboden.text).toMatch(/ganze Bodenfläche[\s\S]*gleichmäßiger warm[\s\S]*am Boden ein wenig wärmer als unter der Decke[\s\S]*Außenwand/);
    expect(WAERMEVERTEILUNG.hinweis.text).toMatch(/links die Außenwand/);
    // Vergleich auf einer Skala (Prüfrunde 1 B1-1): gleiche Farbe heißt in beiden Räumen gleich warm
    expect(WAERMEVERTEILUNG.hinweis.text).toMatch(
      /im Mittel gleich warm und auf derselben Skala[\s\S]*beiden kräftigsten Stufen zeigt nur der Raum mit Heizkörper[\s\S]*Fußbodenheizung ist die Luft fast nirgends so warm/,
    );
  });

  it('reine Technik (K-012): keine Aussage über den Betrieb, keine Beträge, keine Floskeln (S-13), Einheiten geschützt', () => {
    for (const text of alleTexte) {
      expect(text).not.toMatch(/\b(?:wir|uns|unser\w*|Bad und Energie|Bad & Energie)\b/i);
      expect(text).not.toMatch(/€|Euro|Premium Partner/);
      expect(text).not.toMatch(/nahtlos|innovativ|ganzheitlich|maßgeschneidert|Entdecken Sie|nächste Level/i);
      expect(text).not.toMatch(/\d (?:mm|kg|kW)\b/);
      expect(text).not.toMatch(/  |\s[,.]/);
    }
  });
});
