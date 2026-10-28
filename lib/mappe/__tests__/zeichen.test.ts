import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { STANDARD_DESIGN } from '@/lib/mappe/blatt/design';
import type { MappeDokument } from '@/lib/mappe/blatt/dokument';
import {
  SCHRIFT_BEREICHE,
  TITEL_BEREICHE,
  fehlendeZeichen,
  fuerPdf,
  fuerSchrift,
  mitInhaltFuerSchrift,
  texte,
  titelschriftDeckt,
  zeichenFunde,
} from '@/lib/mappe/blatt/zeichen';

/** fontkit kommt mit @react-pdf/renderer (über @react-pdf/font); hier nur, um die Bereiche gegen die Dateien zu prüfen. */
const fontkit = createRequire(import.meta.url)('fontkit') as {
  openSync(datei: string): { characterSet: number[] };
};

const SCHRIFTEN = path.join(process.cwd(), 'lib/mappe/schriften');

function bereicheAus(codepoints: number[]): [number, number][] {
  const bereiche: [number, number][] = [];
  for (const cp of [...codepoints].sort((a, b) => a - b)) {
    const letzter = bereiche.at(-1);
    if (letzter && cp === letzter[1] + 1) letzter[1] = cp;
    else bereiche.push([cp, cp]);
  }
  return bereiche;
}

const DOKUMENT: MappeDokument = {
  titel: 'Bewerbung Max Müller – Anlagenmechaniker SHK',
  name: 'Max Müller',
  betreff: 'Bewerbung als Anlagenmechaniker SHK (m/w/d)',
  datum: '27. Oktober 2026',
  anschreiben: { empfaenger: ['Bad und Energie GmbH Lahn Dill'], text: 'Sehr geehrter Herr Demir,\n\nich freue mich 🙂' },
  lebenslauf: {
    beruf: [{ zeit: '2019–2024', titel: 'Geselle', ort: 'Muster GmbH, Gießen', aufgaben: ['Wärmepumpen\u00adeinbau'] }],
    ausbildung: [{ zeit: '2016–2019', titel: 'Ausbildung SHK', ort: 'Berufsschule Wetzlar' }],
    schwerpunkte: ['Löten', 'Ölheizung'],
  },
  design: STANDARD_DESIGN,
};

describe('Zeichen der PDF-Schrift', () => {
  it('die Bereiche sind genau die Zeichentabelle beider Schnitte (400 und 700)', () => {
    for (const schnitt of ['400', '700']) {
      const font = fontkit.openSync(path.join(SCHRIFTEN, `atkinson-hyperlegible-next-${schnitt}.ttf`));
      // U+FFFF steht als Platzhalter in der Tabelle, ist aber kein Zeichen
      const zeichen = font.characterSet.filter((cp) => cp !== 0xffff);
      expect(bereicheAus(zeichen), schnitt).toEqual(SCHRIFT_BEREICHE.map(([von, bis]) => [von, bis]));
    }
  });

  it('die Titelschrift („Markant“) hat genau die Zeichen der Bricolage-Datei', () => {
    const font = fontkit.openSync(path.join(SCHRIFTEN, 'bricolage-grotesque-700.ttf'));
    expect(bereicheAus(font.characterSet.filter((cp) => cp !== 0xffff))).toEqual(TITEL_BEREICHE.map(([von, bis]) => [von, bis]));
    expect(titelschriftDeckt('Ayşe Yılmaz-Öztürk')).toBe(true);
    // Ţ (T mit Cedille, alte rumänische Form) fehlt der Titelschrift
    expect(titelschriftDeckt('\u0162epe\u015f')).toBe(false);
  });

  it('Markant mit einem Namen, den die Titelschrift nicht zeichnen kann: sachlich statt Kästchen', () => {
    const markant = { ...DOKUMENT, design: { ...DOKUMENT.design, schrift: 'markant' as const } };
    expect(fuerPdf(markant)!.design.schrift).toBe('markant');
    expect(fuerPdf({ ...markant, name: 'Ion \u0162epe\u015f' })!.design.schrift).toBe('sachlich');
  });

  it('Deutsch, Türkisch, Polnisch, Tschechisch, Rumänisch und die Satzzeichen eines Briefs sind gedeckt', () => {
    const text = 'Grüße aus Gießen: ÄÖÜäöüß ẞ – „Zitat“ ‚x‘ … € · • Çç Ğğ İı Şş Ąą Ćć Ęę Łł Ńń Śś Źź Żż Čč Řř Šš Žž Ůů Țț Șș';
    expect(fehlendeZeichen(text)).toEqual([]);
  });

  it('fuerSchrift: macOS-Umlaute zusammengesetzt, weiches Trennzeichen und Emojis weg, schmale Leerzeichen normal', () => {
    expect(fuerSchrift('Mu\u0308ller')).toBe('Müller');
    expect(fuerSchrift('Wärme\u00adpumpe')).toBe('Wärmepumpe');
    expect(fuerSchrift('Danke 🙂👍🏽 und 🇩🇪!')).toBe('Danke und !');
    expect(fuerSchrift('10\u202fkW und 5\u00a0m')).toBe('10 kW und 5\u00a0m');
    expect(fuerSchrift('Kälte\u2011technik, 3\u2032')).toBe("Kälte-technik, 3'");
    expect(fuerSchrift('Zeile 1  \nZeile 2')).toBe('Zeile 1\nZeile 2');
    // Prüfrunde L2: Zeichen, die die Schrift hat, bleiben; Tabs aus Word werden Leerzeichen; Windows-Zeilenenden
    expect(fuerSchrift('Vitodens™, Office® und © 2026 ♪')).toBe('Vitodens™, Office® und © 2026 ♪');
    expect(fuerSchrift('©\ufe0f 2026')).toBe('© 2026');
    expect(fuerSchrift('Energie“.\tTab hier')).toBe('Energie“. Tab hier');
    expect(fuerSchrift('Heizung\tSanitär')).toBe('Heizung Sanitär');
    expect(fuerSchrift('Zeile 1\r\nZeile 2\rZeile 3')).toBe('Zeile 1\nZeile 2\nZeile 3');
    expect(fuerSchrift('✔ Kundendienst')).toBe('Kundendienst');
    expect(fuerSchrift('a\u0007b')).toBe('ab');
  });

  it('fuerPdf: setzbares Dokument bereinigt, sonst null (kein Kästchen statt eines Buchstabens)', () => {
    const sauber = fuerPdf(DOKUMENT);
    expect(sauber?.anschreiben?.text).toBe('Sehr geehrter Herr Demir,\n\nich freue mich');
    expect(sauber?.lebenslauf?.beruf[0].aufgaben).toEqual(['Wärmepumpeneinbau']);
    expect(texte(sauber!).flatMap(fehlendeZeichen)).toEqual([]);
    expect(fuerPdf({ ...DOKUMENT, name: 'Иван Петров' })).toBeNull();
    expect(fuerPdf({ ...DOKUMENT, lebenslauf: { ...DOKUMENT.lebenslauf!, schwerpunkte: ['日本語'] } })).toBeNull();
    // Ohne Namen (nachgereichte Mappe) geht es auch
    expect(fuerPdf({ ...DOKUMENT, name: null })?.name).toBeNull();
  });

  it('fuerPdf: was erst beim Bereinigen leer wird, fällt weg (kein leerer Punkt, kein leerer Kopf)', () => {
    const nurEmoji = fuerPdf({
      ...DOKUMENT,
      name: '😀😀',
      lebenslauf: {
        beruf: [{ zeit: '', titel: '👷', ort: '', aufgaben: ['👍'] }, ...DOKUMENT.lebenslauf!.beruf],
        ausbildung: DOKUMENT.lebenslauf!.ausbildung,
        schwerpunkte: ['👍', 'Löten'],
      },
    })!;
    expect(nurEmoji.name).toBeNull();
    expect(nurEmoji.titel).toBe(DOKUMENT.betreff);
    expect(nurEmoji.lebenslauf!.schwerpunkte).toEqual(['Löten']);
    expect(nurEmoji.lebenslauf!.beruf).toHaveLength(1);
    const leer = fuerPdf({ ...DOKUMENT, anschreiben: { empfaenger: ['x'], text: '🙂' }, lebenslauf: { beruf: [], ausbildung: [], schwerpunkte: ['🙂'] } })!;
    expect(leer.anschreiben).toBeNull();
    expect(leer.lebenslauf).toBeNull();
  });
});

describe('zeichenFunde (L5): was das PDF mit den Texten des Editors macht, vorher sichtbar', () => {
  it('Emojis fallen weg (ein Graphem je Zeichen), Kyrillisch und → (U+2192) verhindern das PDF', () => {
    expect(
      zeichenFunde([
        { ort: 'Name', text: 'Ян Müller' },
        { ort: 'Betreff', text: 'Bewerbung → Wärmepumpen' },
        { ort: 'Anschreiben', text: 'Danke 😊 und 👍🏽 aus 🇩🇪, nochmal 😊 und Привет' },
      ]),
    ).toEqual([
      { ort: 'Name', fallenWeg: [], fehlen: ['Я', 'н'] },
      { ort: 'Betreff', fallenWeg: [], fehlen: ['→'] },
      { ort: 'Anschreiben', fallenWeg: ['😊', '👍🏽', '🇩🇪'], fehlen: ['П', 'р', 'и', 'в', 'е', 'т'] },
    ]);
  });

  it('kein Fund für das, was die Schrift hat oder fuerSchrift ersetzt: ©, ™, weiches Trennzeichen, Leerraum, Trenner', () => {
    const text = 'Vitodens™ © 2026 Wärme­pumpe​, 10 kW,\tTab\r\nZeile Zeile Absatz Ogham, ©️, Müller';
    expect(zeichenFunde([{ ort: 'Anschreiben', text }])).toEqual([]);
    expect(zeichenFunde([])).toEqual([]);
  });

  it('nur Orte mit Funden, in ihrer Reihenfolge; weitere Angaben des Orts reisen mit', () => {
    const funde = zeichenFunde([
      { ort: 'Telefon', text: '0171 2345678', nurDownload: true },
      { ort: 'Wohnort', text: 'Київ', nurDownload: true },
      { ort: 'Schwerpunkte', text: 'Löten\n🔧 Rohrbau', nurDownload: false },
    ]);
    expect(funde).toEqual([
      { ort: 'Wohnort', nurDownload: true, fallenWeg: [], fehlen: ['К', 'и', 'ї', 'в'] },
      { ort: 'Schwerpunkte', nurDownload: false, fallenWeg: ['🔧'], fehlen: [] },
    ]);
  });

  it('fuerSchrift: Zeilen- und Absatztrenner (U+2028, U+2029) werden Umbrüche, das Ogham-Leerzeichen (U+1680) ein Leerzeichen', () => {
    expect(fuerSchrift('Zeile 1 Zeile 2 Zeile 3')).toBe('Zeile 1\nZeile 2\nZeile 3');
    expect(fuerSchrift('Wärme pumpe')).toBe('Wärme pumpe');
    expect(fehlendeZeichen(fuerSchrift('a b c d'))).toEqual([]);
    expect(fuerPdf({ ...DOKUMENT, anschreiben: { empfaenger: ['x'], text: 'Hallo Welt' } })?.anschreiben?.text).toBe('Hallo\nWelt');
  });

  it('Richtungszeichen (etwa aus kopierten Kontakten) fallen still weg: kein leerer Fund, das PDF entsteht', () => {
    const telefon = '\u202d+49 171 2345678\u202c';
    expect(fuerSchrift(telefon)).toBe('+49 171 2345678');
    expect(fuerSchrift('Anlage\u200e. \u2066Wetzlar\u2069 \u202aa\u202b\u202e\u061c\u200f')).toBe('Anlage. Wetzlar a');
    expect(
      zeichenFunde([
        { ort: 'Telefon', text: telefon },
        { ort: 'Anschreiben', text: 'Mit freundlichen Grüßen\u200e' },
      ]),
    ).toEqual([]);
  });

  it('Flaggen mit Tag-Zeichen (England, Schottland, Wales) fallen weg wie alle Emojis', () => {
    const england = '\u{1f3f4}\u{e0067}\u{e0062}\u{e0065}\u{e006e}\u{e0067}\u{e007f}';
    expect(fuerSchrift(`Fan ${england}!`)).toBe('Fan !');
    expect(zeichenFunde([{ ort: 'Interessen', text: `Fußball ${england}` }])).toEqual([{ ort: 'Interessen', fallenWeg: [england], fehlen: [] }]);
  });

  it('mitInhaltFuerSchrift: ein Betreff nur aus Emojis oder Unsichtbarem zählt nicht, sonst getrimmt', () => {
    expect(mitInhaltFuerSchrift('  Bewerbung als Monteur  ')).toBe('Bewerbung als Monteur');
    expect(mitInhaltFuerSchrift('Bewerbung 🔥')).toBe('Bewerbung 🔥');
    expect(mitInhaltFuerSchrift('🔥🔥')).toBeUndefined();
    expect(mitInhaltFuerSchrift('\u200e \ufe0f')).toBeUndefined();
    expect(mitInhaltFuerSchrift('')).toBeUndefined();
    expect(mitInhaltFuerSchrift(null)).toBeUndefined();
    expect(mitInhaltFuerSchrift(undefined)).toBeUndefined();
  });
});
