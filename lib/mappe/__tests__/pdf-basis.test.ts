import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
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
 * (Kurzprofil, Sprachen, Führerschein, Interessen, eigener Abschnitt) darf an ihnen kein Byte ändern. Ändert sich eine
 * Summe, setzt sich eine alte Mappe anders als vorher. Neu erzeugen nur bei gewollter Änderung des Satzes:
 * `PDF_BASIS_SCHREIBEN=<datei> bunx vitest run lib/mappe/__tests__/pdf-basis.test.ts`.
 */
const BASIS: Record<string, string> = {
  'full-ohne': 'cbc4f5825d94fd8310b8bd5f67a0588d21bdeb627b8187a7741aab56a99557d0',
  'full-schlicht-sachlich': '4b8a894c5d51278a93039a70101651e0b7e6298e7afdf87f5a6bb819160140b4',
  'full-schlicht-markant': 'b4dc036925aa9abfc93892310fe676db669ff35fc771790f8050af5039b8c6bf',
  'full-farbband-sachlich': 'd720faaa24435bb6504b26fe1c5029d14550cc860b43b5eb784df6533b62eb6a',
  'full-farbband-markant': 'adbf5f4b3e1ecbce535529d83b692b0a57d9e8364c67186ccbb4891c896da836',
  'full-zweispaltig-sachlich': 'cd4a68095d640f958b7884a33c274f006ac9889a46dddbf87ee7196fe39d7e6f',
  'full-zweispaltig-markant': 'f092396c6f98cafd1561511e1bc507e043908320fb79173f10125f70e1329ddf',
  'maximal-ohne': '54480dcd0e75cd946476a3552f2a1eeaade1d297be908dd97bed44aecfada84f',
  'maximal-schlicht-sachlich': 'f5892b21fb0e4b533a99ddd585c948a08fc95a29435f030f00b6c8904d45f645',
  'maximal-schlicht-markant': 'c8bdc746a07425a579b8337717d2d5f198337ec544a13175c02ed2f2aeb69dbc',
  'maximal-farbband-sachlich': 'ae1bdd9904e1c764b6c75bd955b34864999911208bf608d2c8357a150f928b09',
  'maximal-farbband-markant': '7adf4964f4d81c7709c18ede695f4e08547d7f646fecf5313291140ca96e5449',
  'maximal-zweispaltig-sachlich': '89651d224c20022536c163816606d378992af375ca1018f200a14fe618e2a9b1',
  'maximal-zweispaltig-markant': 'b9a9cd61f3715b0f8bfbeea868c3a70d9a62e0c542d521e31886de999aa89337',
  'nur-schwerpunkte-zweispaltig': 'be395a94616c3e927d8e601f84601580f6b92e34413ccc0504524b5d09147e4b',
  'ergaenzung-ohne-name': '60b28ed1b98628241d5ee6fd620134f7518c2134fc2528d3836c848a016f3374',
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

async function summe(mappe: Mappe, name: string | undefined): Promise<string> {
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
  const { pdf } = await mappePdf(dokument, ERSTELLT);
  return createHash('sha256').update(pdf).digest('hex');
}

describe('Team-PDF alter Mappen bleibt byte-gleich (Basis vor L5 Teil B)', () => {
  it('alle Designs, volle und maximale Mappe, Zweispaltig-Rückfall und Ergänzung', async () => {
    const summen: Record<string, string> = {};
    for (const [fall, mappe, name] of faelle()) summen[fall] = await summe(mappe, name);
    const ziel = process.env.PDF_BASIS_SCHREIBEN;
    if (ziel) writeFileSync(ziel, `${JSON.stringify(summen, null, 2)}\n`);
    expect(summen).toEqual(BASIS);
  }, 180_000);
});
