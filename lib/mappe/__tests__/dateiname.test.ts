import { describe, expect, it } from 'vitest';
import { asciiUmschrift, mappeDateiname, nachnameFuerDatei } from '@/lib/mappe/pdf/dateiname';

describe('Dateiname der Mappe-PDF (nur ASCII, überall gleich lesbar)', () => {
  it('Bewerbungsnummer und Nachname, Umlaute ausgeschrieben', () => {
    expect(mappeDateiname('BE-26-K7M4QX', 'Max Müller')).toBe('Bewerbungsmappe_BE-26-K7M4QX_Mueller.pdf');
    expect(mappeDateiname('BE-26-K7M4QX', 'Jörg Weiß')).toBe('Bewerbungsmappe_BE-26-K7M4QX_Weiss.pdf');
    expect(mappeDateiname('BE-26-K7M4QX', 'Erika')).toBe('Bewerbungsmappe_BE-26-K7M4QX_Erika.pdf');
  });

  it('ohne Namen (nachgereichte Mappe) nur die Nummer', () => {
    expect(mappeDateiname('BE-26-K7M4QX')).toBe('Bewerbungsmappe_BE-26-K7M4QX.pdf');
    expect(mappeDateiname('BE-26-K7M4QX', '   ')).toBe('Bewerbungsmappe_BE-26-K7M4QX.pdf');
  });

  it('Namen aus Polen, der Türkei, Tschechien, Skandinavien und Frankreich in ASCII', () => {
    expect(nachnameFuerDatei('Paweł Łukasiewicz')).toBe('Lukasiewicz');
    expect(nachnameFuerDatei('Ayşe Yılmaz')).toBe('Yilmaz');
    expect(nachnameFuerDatei('Mehmet Öztürk')).toBe('Oeztuerk');
    expect(nachnameFuerDatei('Jiří Dvořák')).toBe('Dvorak');
    expect(nachnameFuerDatei('Søren Kjærgaard')).toBe('Kjaergaard');
    expect(nachnameFuerDatei('Zoé Lefèvre')).toBe('Lefevre');
    expect(nachnameFuerDatei('Hans-Peter Schmidt-Rüdiger')).toBe('Schmidt-Ruediger');
  });

  it('nichts Darstellbares: kein Nachname; sehr lange Namen gekürzt; keine Sonderzeichen', () => {
    expect(nachnameFuerDatei('Иван Петров')).toBe('');
    expect(mappeDateiname('BE-26-K7M4QX', 'Иван Петров')).toBe('Bewerbungsmappe_BE-26-K7M4QX.pdf');
    expect(nachnameFuerDatei(`Max ${'Sehr'.repeat(20)}langername`).length).toBeLessThanOrEqual(40);
    expect(mappeDateiname('BE-26-K7M4QX', 'Max <Muster>/../"x"')).toMatch(/^Bewerbungsmappe_BE-26-K7M4QX_[A-Za-z0-9-]+\.pdf$/);
    expect(asciiUmschrift('  ä  ö  ')).toBe('ae-oe');
  });
});
