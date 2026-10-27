import { describe, expect, it } from 'vitest';
import { GET } from '@/app/bad-und-energie.vcf/route';

/** „Nummern speichern“ (Danke-Seite): echte Datei mit Typ und Namen, Büro für Anrufe und Mobilnummer für WhatsApp. */
describe('/bad-und-energie.vcf', () => {
  it('liefert eine vCard als Datei, nicht für Suchmaschinen', async () => {
    const antwort = GET();
    expect(antwort.headers.get('Content-Type')).toBe('text/vcard; charset=utf-8');
    expect(antwort.headers.get('Content-Disposition')).toBe('attachment; filename="bad-und-energie.vcf"');
    expect(antwort.headers.get('X-Robots-Tag')).toBe('noindex');
    const vcf = await antwort.text();
    expect(vcf.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true);
    expect(vcf).toContain('TEL;TYPE=WORK,VOICE:+49644142956\r\n');
    expect(vcf).toContain('item1.TEL;TYPE=CELL:+491608834290\r\nitem1.X-ABLabel:WhatsApp\r\n');
    expect(vcf.endsWith('END:VCARD\r\n')).toBe(true);
  });
});
