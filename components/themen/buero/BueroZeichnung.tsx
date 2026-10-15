import type { CSSProperties } from 'react';
import t from '@/components/zeichnung/technik/technik.module.css';
import type { MotionId } from '@/lib/motion/register';
import { cn } from '@/lib/utils/cn';
import { beschriftungsLage, type Art, type BueroSzene, type Gruppe } from '@/lib/zeichnung/buero/szene';
import styles from '../stil';

/** Klassen der Komponente je Linienart (Gegenstück zu DATEI_KLASSE in lib/zeichnung/buero/svg.ts). */
export const KLASSE: Readonly<Record<Art, string>> = Object.freeze({
  kontur: cn(t.kontur, t.flaeche),
  konturOffen: t.kontur,
  fein: t.fein,
  mass: t.mass,
  voll: t.voll,
  markiert: cn(t.kontur, styles.bueroMarkiert),
});

/** Wert von `data-a`: Art und Dauer des Ablaufs (CSS im Büro-Block von themen.module.css). */
export function ablaufWert(g: Gruppe): 'ein' | 'lang' | 'schreiben' | undefined {
  if (!g.ablauf) return undefined;
  if (g.ablauf.art === 'schreiben') return 'schreiben';
  return g.ablauf.dauer === 'd-4' ? 'lang' : 'ein';
}

function GruppeSvg({ g, bewegt }: { g: Gruppe; bewegt: boolean }) {
  const pfade = g.teile.map((teil) => <path key={teil.d} d={teil.d} className={KLASSE[teil.art]} />);
  const inhalt = g.lage ? <g transform={`translate(${g.lage.x} ${g.lage.y}) scale(${g.lage.s})`}>{pfade}</g> : pfade;
  const a = bewegt ? ablaufWert(g) : undefined;
  if (!a || !g.ablauf) return <>{inhalt}</>;
  // Versatz und Verzögerung je Gruppe als Variablen; Endlage ist die Lage in den Daten (transform nur hier, am äußeren g)
  const stil = { '--v': g.ablauf.takte, '--x': `${g.ablauf.x ?? 0}px`, '--y': `${g.ablauf.y ?? 0}px` } as CSSProperties;
  return (
    <g data-a={a} style={stil}>
      {inhalt}
    </g>
  );
}

export interface BueroZeichnungProps {
  szene: BueroSzene;
  /** Wörter an den Beschriftungen (lib/themen/text.ts), je id; ohne Eintrag bleibt die Stelle leer. */
  beschriftungen?: Readonly<Record<string, string>>;
  /**
   * Kennung des einmaligen Ablaufs (Register): Mit ihr bekommt jede Gruppe mit Ablauf `data-a`; nur in SichtStart (der
   * Aufrufer setzt beides). Ohne sie still im Endzustand.
   */
  motion?: MotionId;
  className?: string;
}

/**
 * Eine Büro-Zeichnung inline (E-031, Paket W3): dieselben Pfade wie die Datei (lib/zeichnung/buero/svg.ts), Linienarten
 * aus technik.module.css, Wärmeflächen und Ablauf aus dem Büro-Block. Die Beschriftungen stehen als HTML in Versalien
 * über dem Bild (für Hilfsmittel verborgen; den Namen trägt der Aufrufer am Bild).
 */
export function BueroZeichnung({ szene, beschriftungen = {}, motion, className }: BueroZeichnungProps) {
  const bewegt = motion !== undefined;
  return (
    <>
      <svg
        className={cn(t.zeichnung, className)}
        viewBox={`0 0 ${szene.rahmen.breite} ${szene.rahmen.hoehe}`}
        aria-hidden="true"
        focusable="false"
        data-motion={motion}
      >
        {szene.gruppen.map((g) => (
          <GruppeSvg key={g.id} g={g} bewegt={bewegt} />
        ))}
      </svg>
      {szene.beschriftungen.map((b) =>
        beschriftungen[b.id] ? (
          <span key={b.id} className={cn(styles.bueroText, 'text-etikett')} style={beschriftungsLage(szene, b)} aria-hidden="true">
            {beschriftungen[b.id]}
          </span>
        ) : null,
      )}
    </>
  );
}
