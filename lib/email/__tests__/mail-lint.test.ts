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
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
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

  it('gibt Zeilenhöhen in px nur mit mso-line-height-rule an', () => {
    expect([...html.matchAll(/line-height: \d+px;(?! mso-line-height-rule: exactly;)/g)].map((m) => m[0])).toEqual([]);
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
