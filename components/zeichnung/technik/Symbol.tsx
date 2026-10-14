import { SYMBOLE, type Lage, type SymbolDef, type SymbolForm, type SymbolId } from '@/lib/zeichnung/symbole';
import { cn } from '@/lib/utils/cn';
import t from './technik.module.css';

export interface SymbolProps extends Lage {
  id: SymbolId;
  className?: string;
}

const form = (f: SymbolForm, i: number) => {
  const klasse = 'fein' in f && f.fein ? cn(t.fein) : cn(t.kontur, t.flaeche);
  if ('d' in f) return <path key={i} d={f.d} className={f.voll ? cn(t.kontur, t.voll) : klasse} />;
  if ('cx' in f) return <circle key={i} cx={f.cx} cy={f.cy} r={f.r} className={klasse} />;
  return <rect key={i} x={f.x} y={f.y} width={f.width} height={f.height} rx={f.rx} className={klasse} />;
};

/**
 * Normsymbol im Fließschema (lib/zeichnung/symbole.ts, DIN EN ISO 10628-2): Kontur 2 px mit Fläche in der
 * Umgebungsfarbe (deckt die Leitung darunter), Fein-Linien für Lamellen und Platten, gefüllte Teile in der
 * Markenrolle. Lage, Drehung und Vergrößerung wie im Schema; die Strichstärke bleibt die Linienart.
 */
export function Symbol({ id, x, y, drehung = 0, massstab = 1, className }: SymbolProps) {
  const def: SymbolDef = SYMBOLE[id];
  const transform = [`translate(${x} ${y})`, drehung ? `rotate(${drehung})` : '', massstab !== 1 ? `scale(${massstab})` : ''].filter(Boolean).join(' ');
  return (
    <g transform={transform} className={className} data-symbol={id}>
      {def.formen.map(form)}
    </g>
  );
}
