import type { CSSProperties } from 'react';
import {
  flussMuster,
  flussStrecken,
  flussStriche,
  type FlussSperre,
  type SchemaLeitung,
  type SchemaPfeil,
  type SchemaSymbol,
} from '@/lib/zeichnung/szenen/schema';
import { SYMBOLE, type SymbolDef } from '@/lib/zeichnung/symbole';
import { r1, versal, type Medium } from '@/lib/zeichnung/norm';
import { cn } from '@/lib/utils/cn';
import bewegung from '../bewegung/dauer.module.css';
import { Symbol } from './Symbol';
import t from './technik.module.css';

const LEITUNG: Record<Medium, string> = { vorlauf: t.vorlauf, ruecklauf: t.ruecklauf, kaeltemittel: t.kaeltemittel };
const PFEIL: Record<Medium, string> = { vorlauf: t.pfeilVorlauf, ruecklauf: t.pfeilRuecklauf, kaeltemittel: t.pfeilKaeltemittel };
const FLUSS: Record<Medium, 'wasser-fliesst' | 'kaeltemittel-fliesst'> = {
  vorlauf: 'wasser-fliesst',
  ruecklauf: 'wasser-fliesst',
  kaeltemittel: 'kaeltemittel-fliesst',
};

/** Leitungen in Fließrichtung (Pfad = Fließrichtung, K-003.2). */
export function Leitungen({ wege }: { wege: readonly SchemaLeitung[] }) {
  return (
    <g data-leitungen="">
      {wege.map((w) => (
        <path key={w.key} d={w.d} className={cn(t.leitung, LEITUNG[w.medium])} data-medium={w.medium} data-weg={w.key} />
      ))}
    </g>
  );
}

/** Anteil in Prozent mit drei Nachkommastellen (Lage der HTML-Ebene über der Zeichnung). */
const anteil = (wert: number, bezug: number) => `${Math.round((wert / bezug) * 100_000) / 1000}%`;

/**
 * Strichmuster der Dauerbewegung (Prüfung E-029, Befund 10) als eigene HTML-Ebene über der Zeichnung, wie der Rotor
 * der Außeneinheit: je gerades Stück einer Leitung ein Ausschnitt (`overflow: clip`, in Fließrichtung gedreht), darin
 * ein SVG mit den Strichen, das dauer.module.css per `transform` um eine Periode weiterschiebt. So spielt der
 * Compositor die Schleife ab, ohne dass der Browser je Bild neu zeichnet (Malzeit unter 2 ms); `stroke-dashoffset` auf
 * einem Pfad in der Zeichnung malte je Bild das ganze Dokument neu. `breite` und `hoehe`: Rahmen der Zeichnung in
 * Einheiten. Liegt in einem Element mit `position: relative` genau über dem SVG der Zeichnung. Unter Symbolen,
 * festen Fließpfeilen und der Wanddurchführung (`sperren`) setzt das Muster aus (Prüfung E-029, Runde 3); Reste kürzer
 * als ein Strich entfallen.
 */
export function Fluss({
  wege,
  breite,
  hoehe,
  sperren,
}: {
  wege: readonly SchemaLeitung[];
  breite: number;
  hoehe: number;
  sperren: readonly FlussSperre[];
}) {
  const muster = flussMuster(breite);
  const { periode, rand } = muster;
  return (
    <div className={t.flussEbene} aria-hidden="true" data-fluss="">
      {wege.map((w) => (
        <div key={w.key} className={cn(t.fluss, bewegung.fluss)} data-motion={FLUSS[w.medium]} data-weg={w.key}>
          {flussStrecken(w, sperren, muster.strich).map((s) => {
            const laenge = r1(s.laenge);
            const lage: CSSProperties = {
              left: anteil(s.von.x, breite),
              top: anteil(s.von.y - rand, hoehe),
              width: anteil(laenge, breite),
              height: anteil(2 * rand, hoehe),
              transform: `rotate(${r1(s.winkel)}deg)`,
            };
            const band = {
              left: anteil(-periode, laenge),
              width: anteil(laenge + periode, laenge),
              '--fluss-schritt': anteil(periode, laenge + periode),
            } as CSSProperties;
            return (
              <span key={r1(s.anfang)} className={t.strecke} style={lage} data-strecke="">
                <svg
                  className={cn(t.band, bewegung.band)}
                  style={band}
                  viewBox={`${-periode} ${-rand} ${r1(laenge + periode)} ${2 * rand}`}
                  preserveAspectRatio="none"
                  focusable="false"
                >
                  <path d={flussStriche(s, muster)} />
                </svg>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Feste Fließpfeile (Standbild). Jeder wächst um seine Spitze auf die Größe der Stufe (--pfeil in technik.module.css,
 * je Breite der Fläche): am Handy mindestens 10 px lang und 9 px breit (Prüfung E-029, Runde 2, Befund 6). Ohne CSS
 * steht die Grundgröße.
 */
export function Pfeile({ pfeile }: { pfeile: readonly SchemaPfeil[] }) {
  return (
    <g data-pfeile="">
      {pfeile.map((p) => (
        <path key={p.d} d={p.d} className={cn(PFEIL[p.medium], t.pfeil)} style={{ transformOrigin: `${p.spitze.x}px ${p.spitze.y}px` }} />
      ))}
    </g>
  );
}

export function Symbole({ symbole }: { symbole: readonly SchemaSymbol[] }) {
  return (
    <g>
      {symbole.map((s) => (
        <Symbol key={s.key} id={s.id} {...s.lage} />
      ))}
      {symbole.map((s) =>
        s.text ? (
          <text key={`t${s.key}`} x={s.text.x} y={s.text.y} className={cn(t.etikett, t.symbolText)} fontSize={20} textAnchor={s.text.anker} dominantBaseline="central">
            {versal(s.text.wert)}
          </text>
        ) : null,
      )}
    </g>
  );
}

/** Legende der verwendeten Symbole (HTML, auf jeder Breite lesbar): kleines Zeichen und Name. */
export function Legende({ symbole }: { symbole: readonly SchemaSymbol[] }) {
  const ids = [...new Set(symbole.map((s) => s.id))];
  return (
    <ul className={t.legende} aria-label="Legende">
      {ids.map((id) => {
        const def: SymbolDef = SYMBOLE[id];
        // Alle Zeichen im selben Kasten: das größte Maß füllt ihn, kleine Symbole werden nicht winzig
        const massstab = Math.min(1.6, 26 / Math.max(def.halb.x, def.halb.y));
        return (
          <li key={id} className={t.legendePunkt}>
            <svg className={t.legendeZeichen} viewBox="-30 -30 60 60" aria-hidden="true" focusable="false">
              <Symbol id={id} x={0} y={0} massstab={massstab} />
            </svg>
            <span className={t.legendeName}>{def.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
