import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import type { Mappe } from '@/lib/applications/schema';
import { full, maximal } from '@/lib/email/__tests__/fixtures';
import { SCHRIFTSTILE, VORLAGEN, type MappeDesign } from '@/lib/mappe/blatt/design';
import { mappeDokument } from '@/lib/mappe/blatt/dokument';
import { fuerPdf } from '@/lib/mappe/blatt/zeichen';
import { getMappeRecipient } from '@/lib/mappe/context';
import { mappePdf } from '@/lib/mappe/pdf/blatt';

/**
 * Prüfsummen der Team-PDF für Mappen von vor L5 Teil B (Stand 49a3601): Der Umbau des Lebenslaufs auf Abschnitte
 * (Kurzprofil, Sprachen, Führerschein, Interessen, eigener Abschnitt) darf an ihrem Inhalt nichts ändern. Ändert sich eine
 * Summe, setzt sich eine alte Mappe anders als vorher. Die Summe geht über den entpackten Inhalt (inhaltsSumme), nicht über
 * die Bytes: Die Kompression hängt an der zlib von Node (lokal, CI und spätere Updates können abweichen), der Inhalt nicht.
 * Neu erzeugen nur bei gewollter Änderung des Satzes:
 * `PDF_BASIS_SCHREIBEN=<datei> bunx vitest run lib/mappe/__tests__/pdf-basis.test.ts`.
 */
const BASIS: Record<string, string> = {
  'full-ohne': '8511034b2f274bb85253753626e5ae3682366054a066725184d2f96a24cded83',
  'full-schlicht-sachlich': '7b2dc9023b8d03386706b05207c16b431c89b73a6381a66ca88ee902662d8c65',
  'full-schlicht-markant': 'a6aa90260c0da578d398a2dd0dc0285474e5c58cb9201438d457c22e54806ccc',
  'full-farbband-sachlich': 'ff61fd84cc83d22050a136c3ba3a88f4a08b010963f83084b3f1b8aa93746fdc',
  'full-farbband-markant': 'dfff4b480889e564bcf2addf5dd8da15510f98165002693827b590de29654fb0',
  'full-zweispaltig-sachlich': '6613679a016b1e09bd0cf1c91e5f6f48f4b3ec9e6d79d7faa42d9c9eeb83df9a',
  'full-zweispaltig-markant': 'f0e3e53506136f03b956a381fa0ee062201e55eecf220534e272a92cd0d99db0',
  'maximal-ohne': '05443c67b071c15a43d37385097849950d66f611c78755d6969f66aab49db168',
  'maximal-schlicht-sachlich': '2611fe0e0d087adaecbb97ce1acd44effeea0a8815bbccac17908a5f326d3887',
  'maximal-schlicht-markant': 'b926907bc16d86f2adf2cadaab671c1fcf3872e24e83a642f7e0919042749234',
  'maximal-farbband-sachlich': '977e6afbf10429e60e47d1fc202fc8cd8e0206abae664a1bdb1b8ebd20a2e8d4',
  'maximal-farbband-markant': '035c99874b4cd79ce8ae4e671375874f3c45f6dce3c86192b62300de79b71640',
  'maximal-zweispaltig-sachlich': '08bb6dd01805a8068cd174b155b9c94b06731ea86ed7e8bd49460236525623e5',
  'maximal-zweispaltig-markant': '2e2f1bec76c2764e3ae9d5ed8d677aa3b97f3197e29289b8a9192cb4870a5002',
  'nur-schwerpunkte-zweispaltig': '3bb8a69652f74be1ecb90ac9c8990d2aa72038278d94cd65e37cc258609fa34d',
  'ergaenzung-ohne-name': '3918e007cd1e3294a3bfeea07c9c24355326ed4cab729f4ada713d39a8bac76e',
};

const ERSTELLT = new Date('2026-10-08T07:00:00Z');

function faelle(): [string, Mappe, string | undefined][] {
  const designs: [string, MappeDesign | undefined][] = [
    ['ohne', undefined],
    ...VORLAGEN.flatMap((vorlage) => SCHRIFTSTILE.map((schrift) => [`${vorlage}-${schrift}`, { vorlage, akzent: 'petrol', schrift }] as [string, MappeDesign])),
  ];
  const mit = (mappe: Mappe, design?: MappeDesign): Mappe => (design ? { ...mappe, design } : mappe);
  return [
    ...designs.map(([name, design]): [string, Mappe, string | undefined] => [`full-${name}`, mit(full.mappe!, design), 'Max Mustermann']),
    ...designs.map(([name, design]): [string, Mappe, string | undefined] => [`maximal-${name}`, mit(maximal.mappe!, design), 'Max Mustermann']),
    // Zweispaltig nur mit Schwerpunkten (eine Spalte wie Schlicht) und eine nachgereichte Mappe ohne Namen
    [
      'nur-schwerpunkte-zweispaltig',
      { ...full.mappe!, careerStations: [], educationStations: [], design: { vorlage: 'zweispaltig', akzent: 'kupfer', schrift: 'markant' } },
      'Max Mustermann',
    ],
    ['ergaenzung-ohne-name', full.mappe!, undefined],
  ];
}

async function pdfVon(mappe: Mappe, name: string | undefined): Promise<Buffer> {
  const dokument = fuerPdf(
    mappeDokument({
      name,
      betreff: name ? 'Bewerbung als Anlagenmechaniker SHK (m/w/d)' : 'Bewerbungsmappe zur Bewerbung BE-26-TEST01',
      stelle: name ? 'Anlagenmechaniker SHK' : undefined,
      datum: '8. Oktober 2026',
      empfaenger: getMappeRecipient(),
      mappe,
    })!,
  )!;
  return (await mappePdf(dokument, ERSTELLT)).pdf;
}

const STREAM = '\nstream\n';

/** Lage der Stream-Daten, wie pdfkit sie schreibt: `<< /Length n /Filter /FlateDecode >>` direkt vor `stream`. */
function streams(pdf: Buffer): { start: number; ende: number; flate: boolean }[] {
  const text = pdf.toString('latin1');
  const liste: { start: number; ende: number; flate: boolean }[] = [];
  let i = text.indexOf(STREAM);
  while (i >= 0) {
    const kopf = text.slice(text.lastIndexOf(' obj\n', i), i);
    const laenge = /\/Length (\d+)\n/.exec(kopf);
    if (!laenge) throw new Error(`Stream ohne direkte Länge: ${kopf}`);
    const start = i + STREAM.length;
    const ende = start + Number(laenge[1]);
    liste.push({ start, ende, flate: kopf.includes('/Filter /FlateDecode') });
    i = text.indexOf(STREAM, ende);
  }
  return liste;
}

/**
 * Prüfsumme über den Inhalt: Streams entpackt; Längen, Querverweise und startxref ausgeblendet (sie nennen nur
 * Byte-Positionen, die an der Kompression hängen). Text, Lage, Schriften und Seitenaufbau gehen alle ein.
 */
function inhaltsSumme(pdf: Buffer): string {
  const summe = createHash('sha256');
  let rest = 0;
  for (const { start, ende, flate } of streams(pdf)) {
    summe.update(pdf.subarray(rest, start).toString('latin1').replace(/\/Length \d+\n/g, '/Length\n'), 'latin1');
    summe.update(flate ? inflateSync(pdf.subarray(start, ende)) : pdf.subarray(start, ende));
    rest = ende;
  }
  const schluss = pdf.subarray(rest).toString('latin1');
  summe.update(schluss.replace(/\nxref\n[^]*?\ntrailer\n/, '\ntrailer\n').replace(/\nstartxref\n\d+\n/, '\nstartxref\n'), 'latin1');
  return summe.digest('hex');
}

/** Dieselbe PDF mit anders gepackten Streams (zlib-Stufe 1), wie sie eine andere zlib-Version liefern könnte. */
function neuGepackt(pdf: Buffer): Buffer {
  const teile: Buffer[] = [];
  let rest = 0;
  for (const { start, ende, flate } of streams(pdf)) {
    const daten = flate ? deflateSync(inflateSync(pdf.subarray(start, ende)), { level: 1 }) : pdf.subarray(start, ende);
    const davor = pdf.subarray(rest, start).toString('latin1').replace(/\/Length \d+\n/, `/Length ${daten.length}\n`);
    teile.push(Buffer.from(davor, 'latin1'), daten);
    rest = ende;
  }
  teile.push(pdf.subarray(rest));
  return Buffer.concat(teile);
}

describe('Team-PDF alter Mappen bleibt inhaltsgleich (Basis vor L5 Teil B)', () => {
  it('alle Designs, volle und maximale Mappe, Zweispaltig-Rückfall und Ergänzung', async () => {
    const summen: Record<string, string> = {};
    for (const [fall, mappe, name] of faelle()) summen[fall] = inhaltsSumme(await pdfVon(mappe, name));
    const ziel = process.env.PDF_BASIS_SCHREIBEN;
    if (ziel) writeFileSync(ziel, `${JSON.stringify(summen, null, 2)}\n`);
    expect(summen).toEqual(BASIS);
  }, 180_000);

  it('die Summe hängt am Inhalt, nicht an der Kompression', async () => {
    const [, mappe, name] = faelle()[0];
    const pdf = await pdfVon(mappe, name);
    const anders = neuGepackt(pdf);
    expect(streams(anders).length).toBe(streams(pdf).length);
    expect(anders.equals(pdf)).toBe(false);
    expect(inhaltsSumme(anders)).toBe(inhaltsSumme(pdf));
    // Gegenprobe: Ein anderer Inhalt ändert die Summe
    expect(inhaltsSumme(await pdfVon({ ...mappe, skills: [...mappe.skills, 'Gegenprobe'] }, name))).not.toBe(inhaltsSumme(pdf));
  }, 60_000);
});
