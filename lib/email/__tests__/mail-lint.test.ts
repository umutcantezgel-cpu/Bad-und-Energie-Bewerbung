import { describe, expect, it } from 'vitest';

import { MAIL_VARIANTEN } from './fixtures';

/**
 * Technik hinter dem Aussehen jeder Bewerbungs-Mail (Outlook für Windows, Apple Mail, Gmail, GMX/WEB.DE), über alle
 * Varianten aus fixtures.ts. Wie die Mails aussehen, zeigen `bun run mail:vorschau` und `bun run mail:bilder`.
 */

/** Entities, die escapeHTML erzeugt, zurück in Zeichen. */
function unescape(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

describe.each(MAIL_VARIANTEN.map((variante) => [variante.name, variante] as const))('%s', (_, variante) => {
  const { html, text } = variante.render();

  it('bringt den Kopf für Outlook, Apple Mail und die Gmail-Apps mit', () => {
    expect(html).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"');
    expect(html).toContain('xmlns:w="urn:schemas-microsoft-com:office:word"');
    expect(html).toContain('<o:PixelsPerInch>96</o:PixelsPerInch>');
    expect(html).toContain('<w:DontUseAdvancedTypographyReadingMail/>');
    expect(html).toContain('<meta name="color-scheme" content="light only">');
    expect(html).toContain('<meta name="supported-color-schemes" content="light only">');
    expect(html).toContain('<meta name="x-apple-disable-message-reformatting"');
    expect(html).toContain('<meta name="format-detection" content="date=no, address=no">');
  });

  it('setzt Apples Datenerkennung nur über das Attribut zurück (#MessageViewBody träfe jeden Link in Samsung Mail)', () => {
    expect(html).toContain('a[x-apple-data-detectors]');
    expect(html).not.toContain('MessageViewBody');
  });

  it('hält Outlook bei 600 px, alle anderen bei max-width, und schließt jeden bedingten Kommentar', () => {
    expect(html).toContain('width="600" style="width: 600px;"');
    expect(html).toContain('max-width: 600px;');
    expect(html.split('<!--[if mso]>').length).toBe(html.split('<![endif]-->').length);
  });

  it('beginnt jeden Schriftstapel mit Segoe UI (Outlook nimmt nur die erste Familie)', () => {
    const stapel = [...html.matchAll(/font-family: ([^;"]+)/g)].map((m) => m[1].trim()).filter((s) => s !== 'inherit !important');
    expect(stapel.length).toBeGreaterThan(0);
    for (const familien of stapel) expect(familien).toMatch(/^'Segoe UI'/);
  });

  it('gibt Zeilenhöhen in px an, außerhalb des Knopfs mit mso-line-height-rule', () => {
    // Am <a> des Knopfs verschöbe `exactly` in Outlook die Höhe (goodemailcode „link button“).
    const ohneLinks = html.replace(/<a\b[^>]*>/g, '');
    expect([...ohneLinks.matchAll(/line-height: \d+px;(?! mso-line-height-rule: exactly;)/g)].map((m) => m[0])).toEqual([]);
    expect(html).not.toMatch(/line-height:\s*[\d.]+\s*[;"]/);
  });

  it('baut alles aus Tabellenzellen: keine Listen-Tags, kein Abstand an div oder table, keine inline-block-Spans', () => {
    // Outlook rückt <ul>/<li> unvorhersehbar ein, kennt padding nur an Zellen und kopiert margin an Tabellen auf jede
    // innere Zelle; display: inline-block kennt es nicht.
    expect(html).not.toMatch(/<(?:ul|ol|li)\b/);
    expect(html).not.toMatch(/<div\b[^>]*style="[^"]*(?:padding|margin)\s*:/);
    expect(html).not.toMatch(/<table\b[^>]*style="[^"]*margin\s*:/);
    expect(html).not.toMatch(/<span\b[^>]*display:\s*inline-block/);
  });

  it('rundet Zellen nur in Tabellen mit border-collapse: separate (sonst ignorieren Browser die Ecken)', () => {
    const offen: string[] = [];
    const eckig: string[] = [];
    for (const [tag] of html.matchAll(/<\/?table\b[^>]*>|<td\b[^>]*>/g)) {
      if (tag.startsWith('</table')) offen.pop();
      else if (tag.startsWith('<table')) offen.push(tag);
      else if (tag.includes('border-radius') && !(offen.at(-1) ?? '').includes('border-collapse: separate')) eckig.push(tag.slice(0, 90));
    }
    expect(offen).toEqual([]);
    expect(eckig).toEqual([]);
  });

  it('verlinkt nur http(s), mailto und tel, lesbar ohne Entitäten wie &#x2F;', () => {
    for (const [, href] of html.matchAll(/href="([^"]*)"/g)) {
      expect(href).toMatch(/^(?:https?:\/\/|mailto:|tel:)/);
      expect(href).not.toContain('&#');
    }
  });

  it('versteckt den Vorschautext auch in Outlook und füllt danach auf', () => {
    expect(html).toMatch(/<div style="display: none;[^"]*mso-hide: all;">[^<]+&zwnj;&nbsp;&zwnj;&nbsp;/);
  });

  it('beginnt die Textfassung mit dem Vorschautext (Vorschau der GMX- und WEB.DE-Apps)', () => {
    const vorschau = /<div style="display: none;[^"]*">([^<]*?)&zwnj;/.exec(html)?.[1] ?? '';
    expect(vorschau).not.toBe('');
    expect(text.split('\n')[0]).toBe(unescape(vorschau));
  });

  it('bricht lange Werte um, statt die Mail zu verbreitern', () => {
    expect(html).toContain('word-break: break-word;');
  });

  it('bleibt unter 90 000 Byte HTML (Gmail kürzt ab etwa 102 KB)', () => {
    expect(Buffer.byteLength(html, 'utf8')).toBeLessThan(90_000);
  });

  it('ist bei gleichen Daten Byte für Byte gleich', () => {
    expect(variante.render()).toEqual(variante.render());
  });
});
