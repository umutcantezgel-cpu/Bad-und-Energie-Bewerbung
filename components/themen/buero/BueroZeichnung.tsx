import type { CSSProperties } from 'react';
import t from '@/components/zeichnung/technik/technik.module.css';
import type { MotionId } from '@/lib/motion/register';
import { cn } from '@/lib/utils/cn';
import { EBENE_RAND, beschriftungsLage, ebenenVon, type Art, type BueroSzene, type Gruppe } from '@/lib/zeichnung/buero/szene';
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

function GruppeSvg({ g }: { g: Gruppe }) {
  const pfade = g.teile.map((teil) => <path key={teil.d} d={teil.d} className={KLASSE[teil.art]} />);
  return g.lage ? <g transform={`translate(${g.lage.x} ${g.lage.y}) scale(${g.lage.s})`}>{pfade}</g> : <>{pfade}</>;
}

/** Prozent eines Maßes der Szene (Lage der Ebenen und Beschriftungen über der Zeichnung). */
const pct = (wert: number, von: number) => `${Math.round((wert / von) * 100_000) / 1000}%`;

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
 * Eine Büro-Zeichnung inline (E-031, Paket W3): dieselben Pfade in derselben Reihenfolge wie die Datei
 * (lib/zeichnung/buero/svg.ts), Linienarten aus technik.module.css, Wärmeflächen und Ablauf aus dem Büro-Block. Mit
 * Ablauf steht jede bewegte Gruppe auf eigener Ebene (ebenenVon); der Aufrufer gibt dem Bild position: relative und
 * container-type: inline-size (Büro-Block .bueroBild). Die Beschriftungen stehen als HTML in Versalien über dem Bild
 * (für Hilfsmittel verborgen; den Namen trägt der Aufrufer am Bild).
 */
export function BueroZeichnung({ szene, beschriftungen = {}, motion, className }: BueroZeichnungProps) {
  const { breite, hoehe } = szene.rahmen;
  const ganz = `0 0 ${breite} ${hoehe}`;
  // Still: eine Zeichnung. Mit Ablauf (Prüfrunde 3 C3-2): Ebenen in Zeichenreihenfolge, jede bewegte Gruppe als eigenes
  // <svg> in der Größe ihres Rahmens über der Zeichnung; der Compositor bewegt es, die Zeichnung malt nicht je Bild neu.
  const ebenen = motion ? ebenenVon(szene) : [{ still: szene.gruppen }];
  return (
    <>
      {ebenen.map((e, i) => {
        if ('still' in e) {
          return (
            <svg
              key={`still-${i}`}
              className={cn(t.zeichnung, i === 0 ? className : styles.bueroLage)}
              style={i === 0 ? undefined : { left: 0, top: 0, width: '100%', height: '100%' }}
              viewBox={ganz}
              aria-hidden="true"
              focusable="false"
            >
              {e.still.map((g) => (
                <GruppeSvg key={g.id} g={g} />
              ))}
            </svg>
          );
        }
        const { gruppe: g, rahmen: r } = e;
        const a = ablaufWert(g)!;
        // Versatz in Einheiten der Zeichnung als Anteil ihrer Breite (cqi des Bilds), Verzögerung in Takten; Endlage ist
        // die Lage in den Daten. Zeilen schreiben sich vom Anfang der Linie (Rand der Ebene abgezogen).
        const stil = {
          left: pct(r.x, breite),
          top: pct(r.y, hoehe),
          width: pct(r.b, breite),
          height: pct(r.h, hoehe),
          '--v': g.ablauf.takte,
          '--x': `${Math.round(((g.ablauf.x ?? 0) / breite) * 100_000) / 1000}cqi`,
          '--y': `${Math.round(((g.ablauf.y ?? 0) / breite) * 100_000) / 1000}cqi`,
          ...(a === 'schreiben' ? { transformOrigin: `${pct(EBENE_RAND, r.b)} 50%` } : {}),
        } as CSSProperties;
        return (
          <svg
            key={g.id}
            className={cn(t.zeichnung, styles.bueroLage)}
            style={stil}
            viewBox={`${r.x} ${r.y} ${r.b} ${r.h}`}
            aria-hidden="true"
            focusable="false"
            data-a={a}
            data-motion={motion}
          >
            <GruppeSvg g={g} />
          </svg>
        );
      })}
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
