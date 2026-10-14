import type { ReactNode } from 'react';
import type { SchemaLeitung, SchemaPfeil, SchemaSymbol } from '@/lib/zeichnung/szenen/schema';
import { SYMBOLE, type SymbolDef } from '@/lib/zeichnung/symbole';
import { versal, type Medium } from '@/lib/zeichnung/norm';
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

/** Leitungen in Fließrichtung; mit `bewegt` liegt über jeder ein Überlagerungspfad für die Dauerbewegung. */
export function Leitungen({ wege, bewegt }: { wege: readonly SchemaLeitung[]; bewegt: boolean }) {
  return (
    <g data-leitungen="">
      {wege.map((w) => (
        <path key={w.key} d={w.d} className={cn(t.leitung, LEITUNG[w.medium])} data-medium={w.medium} data-weg={w.key} />
      ))}
      {bewegt
        ? wege.map((w) => <path key={`f${w.key}`} d={w.d} className={cn(t.fluss, bewegung.fluss)} data-motion={FLUSS[w.medium]} />)
        : null}
    </g>
  );
}

export function Pfeile({ pfeile }: { pfeile: readonly SchemaPfeil[] }) {
  return (
    <g data-pfeile="">
      {pfeile.map((p) => (
        <path key={p.d} d={p.d} className={PFEIL[p.medium]} />
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
export function Legende({ symbole, extra }: { symbole: readonly SchemaSymbol[]; extra?: ReactNode }) {
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
            <span>{def.name}</span>
          </li>
        );
      })}
      {extra}
    </ul>
  );
}
