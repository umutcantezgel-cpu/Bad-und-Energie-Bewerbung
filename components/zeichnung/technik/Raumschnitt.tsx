import { cn } from '@/lib/utils/cn';
import { RAUMSCHNITT_RAHMEN } from '@/lib/zeichnung/szenen/raumschnitt';
import { RAUMSCHNITT_RAND, raumschnittBildLage, raumschnittPfad, type RaumschnittArt } from '@/lib/zeichnung/raumschnitt-svg';
import { WaermefeldDateien } from '../waerme/Waermefeld';

export type { RaumschnittArt };

export interface RaumschnittProps {
  /** Womit der Raum geheizt wird: Flachheizkörper an der Außenwand oder Fußbodenheizung. */
  art: RaumschnittArt;
  /** Zugänglicher Name (Alternativtext des Bilds); ohne Titel dekorativ. */
  titel?: string;
  className?: string;
}

const R = RAUMSCHNITT_RAHMEN;

/**
 * Raumschnitt (E-031, KERN K-010): derselbe Raum (4,2 × 2,5 m, lib/zeichnung/szenen/raumschnitt.ts) einmal mit
 * Flachheizkörper an der Außenwand (links, von der Seite geschnitten), einmal mit Fußbodenheizung (Rohre im Estrich,
 * Vorlauf und Rücklauf im Wechsel). Unter der Zeichnung liegt das berechnete Wärmefeld als Ebenen (components/zeichnung/
 * waerme, WaermefeldDateien), das sich beim Sichtbarwerden einmal ausbreitet, wenn der Aufrufer die Zeichnung in
 * SichtStart setzt. Zeichnung und Bänder kommen als Dateien (lib/zeichnung/raumschnitt-svg.ts, lib/zeichnung/waerme/
 * dateien.ts) per `<img loading="lazy">`: Die Abbildung steht weit unten, ihre Pfade gehören nicht ins Dokument
 * (Prüfrunde 1 C1-6). Nur Rollenfarben, keine Verläufe.
 */
export function Raumschnitt({ art, titel, className }: RaumschnittProps) {
  return (
    <div className={cn('relative', className)} style={{ aspectRatio: `${R.breite} / ${R.hoehe}` }} data-zeichnung="raumschnitt" data-raum={art}>
      <WaermefeldDateien id={art === 'heizkoerper' ? 'raum-heizkoerper' : 'raum-fussboden'} rahmen={R} />
      {/* Die Zeichnung über den Bändern; eine Datei ohne Bewegung (next/image ist für SVG-Dateien hier nicht nötig) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="absolute block max-w-none"
        style={raumschnittBildLage()}
        src={raumschnittPfad(art)}
        alt={titel ?? ''}
        loading="lazy"
        decoding="async"
        width={R.breite + 2 * RAUMSCHNITT_RAND}
        height={R.hoehe + 2 * RAUMSCHNITT_RAND}
      />
    </div>
  );
}
