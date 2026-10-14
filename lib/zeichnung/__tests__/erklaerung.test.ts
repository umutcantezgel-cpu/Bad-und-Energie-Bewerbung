import { describe, expect, it } from 'vitest';
import {
  HEIZWASSER,
  KAELTEKREIS_REIHENFOLGE,
  KAELTEKREIS_SCHRITTE,
  TECHNIK_ANTWORT,
  TECHNIK_KOPF,
  geraetSteckbrief,
} from '../erklaerung';
import { COMPRESS_AW_L } from '../geraete/compress-aw-l';
import { COMPRESS_AW_S } from '../geraete/compress-aw-s';
import { KAELTEKREIS_SYMBOLE, KAELTEKREIS_WEGE } from '../szenen/kaeltekreis';
import { SYMBOLE } from '../symbole';

const NBSP = ' ';
const alleTexte = [TECHNIK_KOPF.heading, TECHNIK_ANTWORT.text, ...KAELTEKREIS_SCHRITTE.map((s) => s.text), HEIZWASSER.text, geraetSteckbrief().text];

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
    expect(t).toMatch(/Rücklauf[\s\S]*zurück zur Außeneinheit/);
    for (const bauteil of ['Umwälzpumpe', 'Sicherheitsventil', 'Ausdehnungsgefäß', 'Umschaltventil', 'Speicher']) expect(t).toContain(bauteil);
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
