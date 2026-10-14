import type { MotionId } from '@/lib/motion/register';
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import { vorderansicht } from '@/lib/zeichnung/geraete/ansicht';
import { r1, type Medium } from '@/lib/zeichnung/norm';
import {
  BAUTEILE,
  EINZELHEIT,
  GERAET_LAGE,
  HAUSSCHNITT_RAHMEN,
  HEIZKOERPER_LAGE,
  INNENEINHEIT_LAGE,
  LEITUNGEN,
  PFEILE,
  type Leitung,
  type Pfeil,
} from '@/lib/zeichnung/szenen/hausschnitt';
import { cn } from '@/lib/utils/cn';
import { Symbol } from './Symbol';
import t from './technik.module.css';

const LEITUNG: Record<Medium, string> = { vorlauf: t.vorlauf, ruecklauf: t.ruecklauf, kaeltemittel: t.kaeltemittel };
const PFEIL: Record<Medium, string> = { vorlauf: t.pfeilVorlauf, ruecklauf: t.pfeilRuecklauf, kaeltemittel: t.pfeilKaeltemittel };

/** Die Außeneinheit im Hausschnitt: dieselbe Vorderansicht wie die Gerätezeichnung, einfache Detailstufe. */
const GERAET = vorderansicht(COMPRESS_AW_S, { detail: 'einfach', massketten: false });

export interface HausschnittInhaltProps {
  /** Leitungen zur Bewerbung (Startseite): Abzweig aus dem Bild (`nur: knopf…`). */
  knopf?: boolean;
  /** Kreis „X“ um die Außeneinheit (Verweis auf die Einzelheit). */
  einzelheit?: boolean;
  /** Klasse je Leitung statt der Linienart `leitung` (Startseite: Rohr in Einheiten, damit sich der Pfad zeichnet). */
  leitungKlasse?: (leitung: Leitung) => string | undefined;
  /** Bewegungskennung je Leitung (Auftakt der Startseite); dann mit pathLength 1. */
  leitungMotion?: (leitung: Leitung) => MotionId | undefined;
  /** Klasse je Fließpfeil (Startseite: Pfeile zur Bewerbung nur in einer Fassung). */
  pfeilKlasse?: (pfeil: Pfeil) => string | undefined;
  /** Bewegungskennung der Fließpfeile (Auftakt). */
  pfeilMotion?: MotionId;
  /**
   * Zusätzliche Klasse je Mantel an der Kreuzung (nur mit `knopf`), wie die Leitung, zu der er gehört (Startseite: nur
   * in der Fassung ihrer Leitung sichtbar). Die Breite in Einheiten setzt --mantel-e (einstieg.module.css).
   */
  mantelKlasse?: (leitung: Leitung) => string | undefined;
  /** Schraffur des Erdreichs mit doppeltem Abstand (kleine Einsätze). */
  grob?: boolean;
}

/**
 * Inhalt des Hausschnitts (lib/zeichnung/szenen/hausschnitt.ts) in Einheiten von 10 mm, als Gruppe für eine Zeichnung
 * mit viewBox 0 0 800 680: Erdreich geschnitten (45°-Schraffur), Rohrgraben, Schotter und Kiesbett (Kreuzschraffur),
 * Haus im Schnitt (Wände, Decke, Bodenplatte, Dach als Schnittflächen), Sockel, Außeneinheit (verschachtelte Zeichnung
 * mit viewBox in mm, 110 × 80 Einheiten), Kondensatrohr, Inneneinheit als Symbol, Flachheizkörper, Leitungen in
 * Fließrichtung mit festen Pfeilen. Die Stücke hinter Gehäuse und Sockel (vom Anschluss hinten am Gerät bis unter den
 * Sockel) stehen als verdeckte Linie.
 */
export function HausschnittInhalt({
  knopf = false,
  einzelheit = false,
  leitungKlasse,
  leitungMotion,
  pfeilKlasse,
  pfeilMotion,
  mantelKlasse,
  grob = false,
}: HausschnittInhaltProps) {
  const leitungen = LEITUNGEN.filter((l) => knopf || !l.nur);
  const pfeile = PFEILE.filter((p) => knopf || !p.nur);
  const ie = INNENEINHEIT_LAGE;
  const hk = HEIZKOERPER_LAGE;
  const g = GERAET_LAGE;
  const lamellen = Array.from({ length: hk.lamellen }, (_, i) => r1(hk.x + ((i + 1) * hk.breite) / (hk.lamellen + 1)));
  return (
    <g data-hausschnitt="">
      {/* Erdreich (Schnitt), Rohrgraben mit Sandbett, Schotter unter den Sockeln, Kiesbett am Kondensatrohr */}
      <path d={grob ? BAUTEILE.schraffurGrob : BAUTEILE.schraffur} className={t.schraffur} />
      <path d={BAUTEILE.graben} className={cn(t.fein, t.flaeche)} />
      <path d={BAUTEILE.schotter} className={cn(t.fein, t.flaeche)} data-schotter="" />
      <path d={BAUTEILE.schotterSchraffur} className={t.schraffur} />
      <path d={BAUTEILE.kiesbett} className={cn(t.fein, t.flaeche)} data-kiesbett="" />
      <path d={BAUTEILE.kiesbettSchraffur} className={t.schraffur} />
      {/* Haus im Schnitt */}
      <path d={BAUTEILE.dach} className={cn(t.kontur, t.schnitt)} />
      <path d={BAUTEILE.decke} className={cn(t.kontur, t.schnitt)} />
      <path d={BAUTEILE.bodenplatte} className={cn(t.kontur, t.schnitt)} />
      {BAUTEILE.waende.map((d) => (
        <path key={d} d={d} className={cn(t.kontur, t.schnitt)} />
      ))}
      <path d={BAUTEILE.gelaende} className={t.kontur} />

      {/* Außeneinheit maßstäblich: viewBox in mm, eingesetzt 110 × 80 Einheiten */}
      <svg x={g.x} y={g.y} width={g.breite} height={g.hoehe} viewBox={`0 0 ${GERAET.breite} ${GERAET.hoehe}`} overflow="visible" data-geraet-im-schnitt="">
        {GERAET.kontur.map((d) => (
          <path key={d} d={d} className={cn(t.kontur, t.flaeche)} />
        ))}
        {GERAET.fein.map((d) => (
          <path key={d} d={d} className={t.fein} />
        ))}
        {GERAET.kreise.map((k) => (
          <circle key={`${k.cx}-${k.r}`} cx={k.cx} cy={k.cy} r={k.r} className={k.art === 'fein' ? t.fein : t.kontur} />
        ))}
        {GERAET.rotor ? <path d={GERAET.rotor.blaetter} transform={`translate(${GERAET.rotor.cx} ${GERAET.rotor.cy})`} className={t.fein} /> : null}
      </svg>
      {BAUTEILE.sockel.map((d) => (
        <path key={d} d={d} className={cn(t.kontur, t.schnitt)} />
      ))}
      {/* Kondensatrohr Ø 100 mm vom Ablauf unter dem Gerät ins Kiesbett unter der Frosttiefe (Umriss) */}
      <path d={BAUTEILE.kondensat} className={cn(t.fein, t.flaeche)} data-kondensat="" />
      <path d={BAUTEILE.durchfuehrung} className={cn(t.kontur, t.flaeche)} data-wanddurchfuehrung="" />

      {/* Inneneinheit als Symbol (Systemgrenze, Modell offen) mit Umwälzpumpe */}
      <rect x={ie.x} y={ie.y} width={ie.breite} height={ie.hoehe} className={cn(t.mittellinie, t.flaeche)} data-inneneinheit="" />
      <Symbol id="pumpe" x={ie.pumpe.x} y={ie.pumpe.y} massstab={1.4} />

      {/* Flachheizkörper 600 × 1.000 mm, 150 mm über dem Boden */}
      <rect x={hk.x} y={hk.y} width={hk.breite} height={hk.hoehe} className={cn(t.kontur, t.flaeche)} data-heizkoerper="" />
      <path d={lamellen.map((x) => `M${x} ${hk.y}V${hk.y + hk.hoehe}`).join('')} className={t.fein} />

      {/* Hinter Gehäuse und Sockel (vom Anschluss bis unter das Gelände): verdeckte Linie, ohne Bewegung */}
      {leitungen
        .filter((l) => l.verdeckt)
        .map((l) => (
          <path key={l.id} d={l.d} className={cn(t.verdeckt, LEITUNG[l.medium])} data-medium={l.medium} data-weg={l.id} data-verdeckt="" />
        ))}
      {/* Leitungen in Fließrichtung; an einer Kreuzung liegt die vordere mit einem Mantel in der Fläche darüber */}
      {leitungen
        .filter((l) => !l.verdeckt)
        .sort((a, b) => Number(Boolean(a.mantel)) - Number(Boolean(b.mantel)))
        .map((l) => {
        const motion = leitungMotion?.(l);
        return (
          <g key={l.id}>
            {knopf && l.mantel ? <path d={l.mantel} className={cn(t.mantel, mantelKlasse?.(l))} data-mantel="" /> : null}
            <path
              d={l.d}
              className={cn(leitungKlasse?.(l) ?? t.leitung, LEITUNG[l.medium])}
              data-medium={l.medium}
              data-weg={l.id}
              {...(motion ? { 'data-motion': motion, pathLength: 1 } : {})}
            />
          </g>
        );
      })}
      <g {...(pfeilMotion ? { 'data-motion': pfeilMotion } : {})}>
        {pfeile.map((p) => (
          <path key={p.d} d={p.d} className={cn(PFEIL[p.medium], pfeilKlasse?.(p))} />
        ))}
      </g>

      {einzelheit ? (
        <g data-einzelheit={EINZELHEIT.buchstabe}>
          <circle cx={EINZELHEIT.cx} cy={EINZELHEIT.cy} r={EINZELHEIT.r} className={t.fein} />
          <text x={EINZELHEIT.schrift.x} y={EINZELHEIT.schrift.y} className={t.schrift} fontSize={30} textAnchor="middle" dominantBaseline="central">
            {EINZELHEIT.buchstabe}
          </text>
        </g>
      ) : null}
    </g>
  );
}

export interface HausschnittKleinProps {
  /** Zugänglicher Name (role="img"); ohne Titel dekorativ. */
  titel?: string;
  /** Schraffur mit doppeltem Abstand für schmale Einsätze (HausKlein, rund 11–15rem). */
  grob?: boolean;
  className?: string;
}

/** Ausschnitt ohne Himmel und ohne linken Rand (Haus, Gerät, Erdleitung). */
const KLEIN_VIEWBOX = `60 0 ${HAUSSCHNITT_RAHMEN.breite - 40} ${HAUSSCHNITT_RAHMEN.hoehe}`;

/**
 * Kleiner Hausschnitt (Stellenkopf Obermonteur und weitere Stellen, über HausKlein auch Bewerbung, Danke und „Der
 * Betrieb“): derselbe Schnitt wie im Einstieg, ohne Leitungen zur Bewerbung und ohne Bewegung. Breite setzt der Aufrufer.
 */
export function HausschnittKlein({ titel, grob = false, className }: HausschnittKleinProps) {
  return (
    <svg
      className={cn(t.zeichnung, t.beschnitten, className)}
      viewBox={KLEIN_VIEWBOX}
      focusable="false"
      data-zeichnung="hausschnitt-klein"
      {...(titel ? { role: 'img' } : { 'aria-hidden': true })}
    >
      {titel ? <title>{titel}</title> : null}
      <HausschnittInhalt grob={grob} />
    </svg>
  );
}
