import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import type { UploadAdapter, UploadDatei, UploadNachweis, UploadSitzung } from '../adapter';
import { Dateiliste } from '../Dateiliste';
import { groesseText, pruefeDatei, UNTERLAGEN_ACCEPT, UNTERLAGEN_FEHLER, UNTERLAGEN_GRENZEN } from '../regeln';
import { ENTFERNEN_FEHLER, erstelleSteuerung, LEERER_ZUSTAND, UEBERTRAGUNG_FEHLER, type UnterlagenEintrag } from '../steuerung';
import { Unterlagen } from '../Unterlagen';
import { UnterlagenAuswahl } from '../UnterlagenAuswahl';
import { UNTERLAGEN_ANKER, UNTERLAGEN_TEXT, UNTERLAGEN_WHATSAPP_TEXT } from '../unterlagen-text';

const MIB = 1024 * 1024;
const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/[ \t\n\r]+/g, ' ').trim();
/** Wörter, die vor einer echten Prüfung nie im DOM stehen dürfen (E-BEW-012, E-BEW-033). */
const VERBOTEN = /verifiziert|beigefügt/i;

/** Eine Datei, wie der Browser sie liefert (Inhalt egal, Größe zählt). */
function datei(name: string, bytes: number, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

/** Attrappe des Upload-Vertrags: jede Übertragung wartet, bis der Test sie mit `fertig`/`fehler` beendet. */
function attrappe(options: { sitzungFehlt?: boolean; entfernenFehlt?: boolean } = {}) {
  const laeufe = new Map<string, { fortschritt: (anteil: number) => void; fertig: () => void; fehler: () => void; signal: AbortSignal; datei: UploadDatei }>();
  const aufrufe = { sitzungen: [] as (UploadNachweis | null)[], entfernt: [] as string[], abgeschlossen: [] as (readonly string[])[] };
  let nummer = 0;
  const sitzung: UploadSitzung = {
    hochladen(d, fortschritt, signal) {
      return new Promise((resolve, reject) => {
        nummer += 1;
        const id = `datei-${nummer}`;
        laeufe.set(d.name, { fortschritt, fertig: () => resolve({ id }), fehler: () => reject(new Error('netz')), signal, datei: d });
      });
    },
    async entfernen(id) {
      if (options.entfernenFehlt) throw new Error('weg');
      aufrufe.entfernt.push(id);
    },
    async abschliessen(ids) {
      aufrufe.abgeschlossen.push(ids);
    },
  };
  const adapter: UploadAdapter = {
    async sitzungAnlegen(nachweis) {
      aufrufe.sitzungen.push(nachweis);
      if (options.sitzungFehlt) throw new Error('keine Sitzung');
      return sitzung;
    },
  };
  return { adapter, laeufe, aufrufe };
}

/** Wartet, bis alle anstehenden Mikroaufgaben gelaufen sind (Sitzung anlegen, Übertragung starten). */
const ruhe = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Unterlagen: Regeln (Formate und Grenzen aus der Architektur von Phase 2)', () => {
  it('nimmt PDF, JPG, PNG, HEIC/HEIF und WebP, auch ohne gemeldeten Typ nach der Endung', () => {
    expect(pruefeDatei({ name: 'lebenslauf.pdf', size: 200_000, type: 'application/pdf' })).toEqual({ ok: true, mime: 'application/pdf' });
    expect(pruefeDatei({ name: 'zeugnis.JPG', size: 900_000, type: '' })).toEqual({ ok: true, mime: 'image/jpeg' });
    expect(pruefeDatei({ name: 'IMG_0042.HEIC', size: 2 * MIB, type: '' })).toEqual({ ok: true, mime: 'image/heic' });
    expect(pruefeDatei({ name: 'foto.heif', size: 2 * MIB, type: 'application/octet-stream' })).toEqual({ ok: true, mime: 'image/heif' });
    expect(pruefeDatei({ name: 'scan.webp', size: 10 * MIB, type: 'image/webp' }).ok).toBe(true);
    for (const format of ['.pdf', '.jpeg', '.png', '.heic', '.webp', 'application/pdf', 'image/heic']) {
      expect(UNTERLAGEN_ACCEPT.split(',')).toContain(format);
    }
  });

  it('lehnt falsche Typen, leere Dateien und mehr als 10 MB mit Ursache und Ausweg ab', () => {
    expect(pruefeDatei({ name: 'anschreiben.docx', size: 30_000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).toEqual({
      ok: false,
      grund: 'typ',
      text: '„anschreiben.docx“ geht nicht: Bitte nur PDF, JPG, PNG, HEIC oder WebP.',
    });
    // Endung passt, Typ nicht: Der gemeldete Typ entscheidet.
    expect(pruefeDatei({ name: 'tarnung.pdf', size: 30_000, type: 'application/zip' }).ok).toBe(false);
    expect(pruefeDatei({ name: 'leer.pdf', size: 0, type: 'application/pdf' })).toMatchObject({ ok: false, grund: 'leer' });
    expect(pruefeDatei({ name: 'riesig.pdf', size: 10 * MIB + 1, type: 'application/pdf' })).toEqual({
      ok: false,
      grund: 'groesse',
      text: '„riesig.pdf“ ist zu groß (10 MB). Höchstens 10 MB je Datei.',
    });
    expect(UNTERLAGEN_FEHLER.groesse('video.png', 23.4 * MIB)).toBe('„video.png“ ist zu groß (23,4 MB). Höchstens 10 MB je Datei.');
  });

  it('schreibt Größen mit Komma und geschütztem Leerzeichen', () => {
    expect(groesseText(512)).toBe('1 KB');
    expect(groesseText(850 * 1024)).toBe('850 KB');
    expect(groesseText(2.44 * MIB)).toBe('2,4 MB');
    expect(groesseText(UNTERLAGEN_GRENZEN.maxBytes)).toBe('10 MB');
  });
});

describe('Unterlagen: Steuerung mit Attrappe (E-BEW-012 Abnahme)', () => {
  it('Dateien wählen zeigt Liste und Fortschritt; falscher Typ und über 10 MB zeigen die Fehlertexte', async () => {
    const { adapter, laeufe, aufrufe } = attrappe();
    const nachweis = { bewerbungsnummer: 'BE-26-0042', pruefschluessel: 'pruef' };
    const steuerung = erstelleSteuerung({ adapter, nachweis });
    let meldungen = 0;
    steuerung.abonnieren(() => {
      meldungen += 1;
    });
    expect(steuerung.zustand()).toBe(LEERER_ZUSTAND);

    const auswahl = steuerung.waehlen([
      datei('lebenslauf.pdf', 300_000, 'application/pdf'),
      datei('anschreiben.docx', 20_000, 'application/msword'),
      datei('video.png', 11 * MIB, 'image/png'),
    ]);
    let zustand = steuerung.zustand();
    expect(zustand.eintraege).toEqual([{ schluessel: 'u1', name: 'lebenslauf.pdf', groesse: 300_000, status: 'laedt', anteil: 0 }]);
    expect(zustand.meldungen).toEqual([UNTERLAGEN_FEHLER.typ('anschreiben.docx'), UNTERLAGEN_FEHLER.groesse('video.png', 11 * MIB)]);
    expect(zustand.meldungen[1]).toContain('Höchstens 10 MB');

    await ruhe();
    expect(aufrufe.sitzungen).toEqual([nachweis]);
    const lauf = laeufe.get('lebenslauf.pdf');
    expect(lauf?.datei).toMatchObject({ name: 'lebenslauf.pdf', mime: 'application/pdf', groesse: 300_000 });
    lauf?.fortschritt(0.45);
    expect(steuerung.zustand().eintraege[0]).toMatchObject({ status: 'laedt', anteil: 0.45 });

    // Statisch gerendert: Liste mit Name, Größe und Fortschritt als progressbar, ohne Prüfstatus.
    const html = renderToStaticMarkup(createElement(Dateiliste, { eintraege: steuerung.zustand().eintraege }));
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="45"');
    expect(plain(html)).toContain('lebenslauf.pdf 293 KB · wird übertragen 45 %');
    expect(html).not.toMatch(VERBOTEN);

    lauf?.fertig();
    await auswahl;
    zustand = steuerung.zustand();
    expect(zustand.eintraege[0]).toMatchObject({ status: 'uebertragen', anteil: 1 });
    expect(meldungen).toBeGreaterThan(2);
    expect(renderToStaticMarkup(createElement(Dateiliste, { eintraege: zustand.eintraege }))).not.toMatch(VERBOTEN);

    await steuerung.abschliessen();
    expect(aufrufe.abgeschlossen).toEqual([['datei-1']]);
    expect(steuerung.zustand().abschluss).toBe('abgeschlossen');
    // Nach dem Abschluss nimmt die Auswahl nichts mehr an.
    await steuerung.waehlen([datei('nachzuegler.pdf', 1000, 'application/pdf')]);
    expect(steuerung.zustand().eintraege).toHaveLength(1);
  });

  it('nimmt höchstens fünf Dateien und sagt, welche nicht dabei ist', async () => {
    const { adapter } = attrappe();
    const steuerung = erstelleSteuerung({ adapter });
    void steuerung.waehlen(Array.from({ length: 6 }, (_, i) => datei(`nachweis-${i + 1}.pdf`, 1000, 'application/pdf')));
    expect(steuerung.zustand().eintraege).toHaveLength(UNTERLAGEN_GRENZEN.maxDateien);
    expect(steuerung.zustand().meldungen).toEqual([UNTERLAGEN_FEHLER.anzahl('nachweis-6.pdf')]);
  });

  it('bricht beim Entfernen die laufende Übertragung ab und entfernt übertragene Dateien beim Server', async () => {
    const { adapter, laeufe, aufrufe } = attrappe();
    const steuerung = erstelleSteuerung({ adapter });
    const auswahl = steuerung.waehlen([datei('a.pdf', 1000, 'application/pdf'), datei('b.png', 1000, 'image/png')]);
    await ruhe();
    await steuerung.entfernen('u1');
    expect(laeufe.get('a.pdf')?.signal.aborted).toBe(true);
    expect(steuerung.zustand().eintraege.map((e) => e.name)).toEqual(['b.png']);
    laeufe.get('a.pdf')?.fehler();
    laeufe.get('b.png')?.fertig();
    await auswahl;
    expect(steuerung.zustand().eintraege).toEqual([expect.objectContaining({ name: 'b.png', status: 'uebertragen' })]);
    await steuerung.entfernen('u2');
    expect(aufrufe.entfernt).toEqual(['datei-2']);
    expect(steuerung.zustand().eintraege).toEqual([]);
  });

  it('meldet Fehler am Eintrag statt eines Erfolgs (Sitzung, Übertragung, Entfernen)', async () => {
    const ohneSitzung = erstelleSteuerung({ adapter: attrappe({ sitzungFehlt: true }).adapter });
    await ohneSitzung.waehlen([datei('a.pdf', 1000, 'application/pdf')]);
    expect(ohneSitzung.zustand().eintraege[0]).toMatchObject({ status: 'fehler', fehler: UEBERTRAGUNG_FEHLER });
    await ohneSitzung.abschliessen();
    expect(ohneSitzung.zustand().abschluss).toBe('offen');

    const netz = attrappe({ entfernenFehlt: true });
    const steuerung = erstelleSteuerung({ adapter: netz.adapter });
    const auswahl = steuerung.waehlen([datei('a.pdf', 1000, 'application/pdf'), datei('b.pdf', 1000, 'application/pdf')]);
    await ruhe();
    netz.laeufe.get('a.pdf')?.fehler();
    netz.laeufe.get('b.pdf')?.fertig();
    await auswahl;
    expect(steuerung.zustand().eintraege.map((e) => e.status)).toEqual(['fehler', 'uebertragen']);
    await steuerung.entfernen('u2');
    expect(steuerung.zustand().eintraege[1]).toMatchObject({ status: 'uebertragen', fehler: ENTFERNEN_FEHLER });
    const html = renderToStaticMarkup(createElement(Dateiliste, { eintraege: steuerung.zustand().eintraege }));
    expect(plain(html)).toContain(UEBERTRAGUNG_FEHLER);
    expect(html).not.toMatch(VERBOTEN);
  });
});

describe('Unterlagen: Abschnitt im Betrieb ohne Anbindung (E-BEW-012, E-START-007)', () => {
  const html = renderToStaticMarkup(createElement(Unterlagen));
  const text = plain(html);

  it('steht unter dem Anker #unterlagen mit h2 und sagt ehrlich, dass Hochladen noch nicht geht', () => {
    expect(html).toContain(`id="${UNTERLAGEN_ANKER}"`);
    expect(html).toMatch(/<h2 id="unterlagen-titel"[^>]*>Unterlagen einreichen<\/h2>/);
    expect(html).toContain('data-unterlagen="aus"');
    expect(text).toContain('Hochladen ist noch nicht verfügbar. Schick uns die Unterlagen per WhatsApp oder E-Mail.');
  });

  it('bietet WhatsApp mit vorausgefülltem Text und E-Mail mit Betreff, ohne Dateifeld', () => {
    expect(html).toContain(`text=${encodeURIComponent(UNTERLAGEN_WHATSAPP_TEXT)}`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain(`href="${COMPANY.emailHref}?subject=Bewerbungsunterlagen"`);
    expect(html).not.toContain('type="file"');
    expect(text).toContain(UNTERLAGEN_TEXT.whatsapp);
    expect(text).toContain(UNTERLAGEN_TEXT.mail);
  });

  it('kein Erfolgs- oder Prüfstatus und kein Wort „Upload“', () => {
    expect(html).not.toMatch(VERBOTEN);
    expect(text).not.toMatch(/upload/i);
  });

  it('mit Anbindung steht die Auswahl an ihrer Stelle (Knopf, Dateifeld, Formate)', () => {
    const { adapter } = attrappe();
    const mit = renderToStaticMarkup(createElement(Unterlagen, { auswahl: createElement(UnterlagenAuswahl, { adapter }) }));
    expect(mit).toContain('data-unterlagen="an"');
    expect(mit).toContain('type="file"');
    expect(mit).toContain(`accept="${UNTERLAGEN_ACCEPT}"`);
    expect(plain(mit)).toContain('Dateien auswählen');
    expect(plain(mit)).toContain('PDF, JPG, PNG, HEIC oder WebP · bis zu 5 Dateien, je höchstens 10 MB');
    expect(plain(mit)).not.toContain(UNTERLAGEN_TEXT.hinweis);
    expect(mit).not.toMatch(VERBOTEN);
  });
});

describe('Unterlagen: Dateiliste', () => {
  it('rendert nichts ohne Einträge und Entfernen-Knöpfe nur mit Rückruf', () => {
    expect(renderToStaticMarkup(createElement(Dateiliste, { eintraege: [] }))).toBe('');
    const eintraege: UnterlagenEintrag[] = [{ schluessel: 'u1', name: 'gesellenbrief.pdf', groesse: 2 * MIB, status: 'uebertragen', anteil: 1 }];
    const ohne = renderToStaticMarkup(createElement(Dateiliste, { eintraege }));
    expect(ohne).not.toContain('<button');
    expect(plain(ohne)).toContain('gesellenbrief.pdf 2 MB · übertragen');
    const mit = renderToStaticMarkup(createElement(Dateiliste, { eintraege, onEntfernen: () => {} }));
    expect(mit).toContain('aria-label="gesellenbrief.pdf: Entfernen"');
  });
});
