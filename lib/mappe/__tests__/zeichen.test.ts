import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { MappeDokument } from '@/lib/mappe/blatt/dokument';
import { SCHRIFT_BEREICHE, fehlendeZeichen, fuerPdf, fuerSchrift, texte } from '@/lib/mappe/blatt/zeichen';

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
