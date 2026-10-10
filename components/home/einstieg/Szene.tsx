import type { MotionId } from '@/lib/motion/register';
import { cn } from '@/lib/utils/cn';
import { WAERMEBAENDER } from './waermefeld';
import styles from './einstieg.module.css';

const BAND = [styles.band1, styles.band2, styles.band3, styles.band4] as const;

/** Leitungen der Szene (Variante 3, `wb__rohre`): Lage, Richtung und Kennung je Stück. */
interface Leitung {
  d: string;
  motion: MotionId;
  klasse?: string;
}

const VORLAUF: readonly Leitung[] = [
  // Desktop: aus dem Knopf über den Panelrand in die Pumpe (Fortsetzung von `rohrD` in Einstieg.tsx)
  { d: 'M0 676H50', motion: 'erdleitung-d', klasse: styles.nurDesktop },
  { d: 'M154 662H226', motion: 'vorlauf-haus' },
  { d: 'M128 740V756H404V733H590', motion: 'vorlauf-haus' },
  // Verbindung zum Leitungsschacht: mobil steigt der Vorlauf aus dem Knopf hier in die Pumpe
  { d: 'M50 728H28V800', motion: 'vorlauf-haus', klasse: styles.vlSchacht },
];

const RUECKLAUF: readonly Leitung[] = [
  { d: 'M226 704H154', motion: 'ruecklauf-haus' },
  { d: 'M590 733H596V774H140V740', motion: 'ruecklauf-haus' },
  { d: 'M50 712H14V800', motion: 'ruecklauf-haus' },
];

/**
 * Haus im Wärmebild (Variante 3, statischer Ersatz ohne WebGL, E-021): Szene 800 × 800 Einheiten aus
 * _relaunch/ausbau/richtungen/3/index.html (`wb__feld`, `wb__linien`, `wb__rohre`). Vier Isothermen als
 * weiche Flächen (kalt Navy → Rücklaufblau → Wand → Wärme → Papier), darauf das Haus aus dem Logo mit
 * 45°-Giebel in Creme, innen Navy auf den warmen Flächen: Wärmepumpe, Heizkörper, Wanne, Fußbodenheizung,
 * die Uhr im Giebel auf 13:30 mit Fadenkreuz. Vorlauf rot und Rücklauf blau mit einem Mantel in der Seitenfarbe.
 *
 * Dekorativ (`aria-hidden`): Maße, Einleitung und der Erklärsatz T-001 tragen dieselbe Information als Text.
 * Jedes bewegte Teil trägt seine Kennung aus lib/motion/register.ts; ohne Auftakt steht der Endzustand.
 */
export function Szene() {
  const kalt = styles.kalt;
  const fein = styles.fein;
  return (
    <svg className={styles.szene} viewBox="0 0 800 800" aria-hidden="true" focusable="false" data-szene="einstieg">
      {/* Wärmefeld: Bänder von kalt nach heiß, die Wärme breitet sich vom Heizkörper aus */}
      <g className={styles.feld}>
        {WAERMEBAENDER.map((d, i) => (
          <path key={d.slice(0, 12)} className={cn(styles.band, BAND[i])} data-motion="waerme" d={d} />
        ))}
      </g>

      {/* Kalt (Creme): Giebel und Wände des Hauses, Bodenlinie bis über den Bildrand, Lüfterring */}
      <path className={kalt} d="M168 576L400 344L632 576M184 560V740M616 560V740M0 740H2000" />
      <circle className={kalt} cx="102" cy="691" r="29" />

      {/* Innen (Navy auf den warmen Flächen): Decke, Boden, Innenwand, Wärmepumpe, Heizkörper, Wanne */}
      <path className={fein} d="M198 580H602M198 726H602M392 580V726M404 580V726" />
      <path className={fein} d="M62 642H142A12 12 0 0 1 154 654V740H50V654A12 12 0 0 1 62 642Z" />
      <path
        className={fein}
        d="M232 640H284A6 6 0 0 1 290 646V706A6 6 0 0 1 284 712H232A6 6 0 0 1 226 706V646A6 6 0 0 1 232 640ZM238.8 648V704M251.6 648V704M264.4 648V704M277.2 648V704"
      />
      <path className={fein} d="M468 668H568A20 20 0 0 1 568 716H468A20 20 0 0 1 468 668ZM466 642V668M458 642H474" />

      {/* Lüfter der Wärmepumpe: läuft eine halbe Umdrehung an */}
      <path
        className={cn(kalt, styles.luefter)}
        data-motion="luefter"
        d="M102 691c-6-10-4-19 3-25M102 691c11 1 18 7 18 16M102 691c-6 9-15 12-22 8"
      />

      {/* Uhr im Giebel: rastet auf 13:30 ein */}
      <circle className={styles.blatt} cx="400" cy="468" r="34" />
      <path className={fein} d="M400 438V444M430 468H424M400 498V492M370 468H376" />
      <path className={cn(fein, styles.zeiger, styles.zeigerStd)} data-motion="uhr" d="M400 468L412.5 455.5" />
      <path className={cn(fein, styles.zeiger)} data-motion="uhr" d="M400 468V493" />
      <circle className={styles.achse} cx="400" cy="468" r="4" />

      {/* Messpunkt (Fadenkreuz) an der Uhr; am Desktop die Hinweislinie zum Maß „13:30“ */}
      <g className={styles.messpunkt} data-motion="uhr">
        <circle className={styles.mess} cx="400" cy="468" r="46" />
        <path className={styles.mess} d="M400 414V428M400 508V522M346 468H360M440 468H454" />
      </g>
      <path className={cn(styles.mess, styles.nurDesktop)} d="M367.5 435.5L232 300" />

      {/* Leitungen: zuerst der Mantel in der Seitenfarbe, darüber das Rohr */}
      <g>
        {[...VORLAUF, ...RUECKLAUF].map((r) => (
          <path key={`m${r.d}`} className={cn(styles.mantel, r.motion === 'erdleitung-d' && styles.nurDesktop)} d={r.d} />
        ))}
        {RUECKLAUF.map((r) => (
          <path key={r.d} className={cn(styles.rohr, styles.rl, r.klasse)} data-motion={r.motion} pathLength={1} d={r.d} />
        ))}
        {VORLAUF.map((r) => (
          <path key={r.d} className={cn(styles.rohr, styles.vl, r.klasse)} data-motion={r.motion} pathLength={1} d={r.d} />
        ))}
      </g>
    </svg>
  );
}
