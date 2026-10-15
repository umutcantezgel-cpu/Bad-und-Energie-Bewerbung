import { cn } from '@/lib/utils/cn';
import { WAERMEFELD_AN } from '@/lib/zeichnung/waerme/schalter';
import { FUSSBODEN_ROHRE, RAUM_BAUTEILE, RAUM_HEIZKOERPER, RAUMSCHNITT_RAHMEN } from '@/lib/zeichnung/szenen/raumschnitt';
import { WaermefeldDateien } from '../waerme/Waermefeld';
import t from './technik.module.css';

export type RaumschnittArt = 'heizkoerper' | 'fussboden';

export interface RaumschnittProps {
  /** Womit der Raum geheizt wird: Flachheizkörper an der Außenwand oder Fußbodenheizung. */
  art: RaumschnittArt;
  /** Zugänglicher Name (role="img"); ohne Titel dekorativ. */
  titel?: string;
  className?: string;
}

const R = RAUMSCHNITT_RAHMEN;
const VIEWBOX = `${R.x} ${R.y} ${R.breite} ${R.hoehe}`;

/**
 * Raumschnitt (E-031, KERN K-010): derselbe Raum (4,2 × 2,5 m, lib/zeichnung/szenen/raumschnitt.ts) einmal mit
 * Flachheizkörper an der Außenwand (links, von der Seite geschnitten), einmal mit Fußbodenheizung (Rohre im Estrich,
 * Vorlauf und Rücklauf im Wechsel). Unter der Zeichnung liegt das berechnete Wärmefeld als Ebenen aus eigenen Dateien
 * (components/zeichnung/waerme, WaermefeldDateien), das sich beim Sichtbarwerden einmal ausbreitet, wenn der Aufrufer
 * die Zeichnung in SichtStart setzt. Heizkörper und Rohre stehen im Wärmebereich; der Heizkörper ohne Fläche, die Bänder zeigen seine
 * Temperatur (oben der Vorlauf). Nur Rollenfarben, keine Verläufe.
 */
export function Raumschnitt({ art, titel, className }: RaumschnittProps) {
  const hk = RAUM_HEIZKOERPER;
  const warm = WAERMEFELD_AN;
  return (
    <div className={cn('relative', className)} style={{ aspectRatio: `${R.breite} / ${R.hoehe}` }} data-zeichnung="raumschnitt" data-raum={art}>
      {/* Bänder als Dateien (lazy): Die Abbildung steht weit unten, ihre Pfade gehören nicht ins Dokument (C1-6) */}
      <WaermefeldDateien id={art === 'heizkoerper' ? 'raum-heizkoerper' : 'raum-fussboden'} rahmen={R} />
      <svg
        className="absolute inset-0 block size-full overflow-visible"
        viewBox={VIEWBOX}
        focusable="false"
        {...(titel ? { role: 'img' } : { 'aria-hidden': true })}
      >
        {titel ? <title>{titel}</title> : null}
        {/* Wände und Decke geschnitten, darunter der Fußbodenaufbau: Estrich, Dämmung, Rohdecke (angeschnitten) */}
        {RAUM_BAUTEILE.waende.map((d) => (
          <path key={d} d={d} className={cn(t.kontur, t.schnitt)} />
        ))}
        <path d={RAUM_BAUTEILE.decke} className={cn(t.kontur, t.schnitt)} />
        <path d={RAUM_BAUTEILE.rohdecke} className={cn(t.kontur, t.schnitt)} />
        <path d={RAUM_BAUTEILE.daemmung} className={cn(t.fein, t.flaeche)} data-daemmung="" />
        <path d={RAUM_BAUTEILE.estrich} className={cn(t.kontur, t.flaeche)} data-estrich="" />
        {art === 'heizkoerper' ? (
          // Flachheizkörper 600 mm hoch, 150 mm über dem Boden, von der Seite (Bautiefe, Abstand zur Wand), im Wärmebereich
          <g {...(warm ? { 'data-tone': 'warm' } : {})}>
            <rect x={hk.x} y={hk.y} width={hk.breite} height={hk.hoehe} className={cn(t.kontur, !warm && t.flaeche)} data-heizkoerper="" />
          </g>
        ) : null}
        {/* Rohre der Fußbodenheizung im Estrich, Vorlauf und Rücklauf im Wechsel */}
        {art === 'fussboden'
          ? FUSSBODEN_ROHRE.map((r) => (
              <circle key={r.x} cx={r.x} cy={r.y} r={r.r} className={cn(t.leitung, r.medium === 'vorlauf' ? t.vorlauf : t.ruecklauf)} data-medium={r.medium} />
            ))
          : null}
      </svg>
    </div>
  );
}
