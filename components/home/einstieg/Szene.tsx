import { cn } from '@/lib/utils/cn';
import { WEGWEISER } from './einstieg-text';
import styles from './einstieg.module.css';

/** Id des Clip-Pfads für den Wärmepegel (eine Szene je Seite). */
const PEGEL_ID = 'einstieg-waerme-pegel';

/**
 * Haus mit Wärmepumpe (Variante 1, Zeichnung 760 × 520 Einheiten; Wegweiser aus B Runde 1).
 * Dekorativ (`aria-hidden`): der Erklärsatz T-001 unter der Szene und die Maße als echte Liste tragen
 * dieselbe Information als Text. Jedes animierte Teil trägt seine Kennung aus lib/motion/register.ts.
 * Rot ist nur Vorlauf-Linie, Blau nur Rücklauf (E-016); das Haus aus dem Logo hat den 45°-Giebel.
 */
export function Szene() {
  const z = styles.z;
  return (
    <svg className={styles.zeichnung} viewBox="0 0 760 520" aria-hidden="true" focusable="false" data-szene="einstieg">
      {/* Sonne mit 30 Teilstrichen: 30 Tage Urlaub */}
      <g className={styles.sonne}>
        <circle className={z} cx="0" cy="0" r="24" />
        <path
          className={z}
          d="M0.0 -36.0L0.0 -52.0M7.5 -35.2L9.6 -45.0M14.6 -32.9L18.7 -42.0M21.2 -29.1L27.0 -37.2M26.8 -24.1L34.2 -30.8M31.2 -18.0L45.0 -26.0M34.2 -11.1L43.7 -14.2M35.8 -3.8L45.7 -4.8M35.8 3.8L45.7 4.8M34.2 11.1L43.7 14.2M31.2 18.0L45.0 26.0M26.8 24.1L34.2 30.8M21.2 29.1L27.0 37.2M14.6 32.9L18.7 42.0M7.5 35.2L9.6 45.0M0.0 36.0L0.0 52.0M-7.5 35.2L-9.6 45.0M-14.6 32.9L-18.7 42.0M-21.2 29.1L-27.0 37.2M-26.8 24.1L-34.2 30.8M-31.2 18.0L-45.0 26.0M-34.2 11.1L-43.7 14.2M-35.8 3.8L-45.7 4.8M-35.8 -3.8L-45.7 -4.8M-34.2 -11.1L-43.7 -14.2M-31.2 -18.0L-45.0 -26.0M-26.8 -24.1L-34.2 -30.8M-21.2 -29.1L-27.0 -37.2M-14.6 -32.9L-18.7 -42.0M-7.5 -35.2L-9.6 -45.0"
        />
      </g>

      {/* Luft strömt zur Wärmepumpe (mobil größere Wirbel, am Desktop näher an der Pumpe) */}
      <g className={styles.nurMobil}>
        <path className={z} data-motion="luft" pathLength={1} d="M88 420A12 12 0 1 0 76 432H166" />
        <path className={z} data-motion="luft" pathLength={1} d="M68 450A12 12 0 1 0 56 462H166" />
        <path className={z} data-motion="luft" pathLength={1} d="M104 480A12 12 0 1 0 92 492H166" />
      </g>
      <g className={styles.nurDesktop}>
        <path className={z} data-motion="luft" pathLength={1} d="M124 420A10 10 0 1 0 114 430H166" />
        <path className={z} data-motion="luft" pathLength={1} d="M108 452A10 10 0 1 0 98 462H166" />
        <path className={z} data-motion="luft" pathLength={1} d="M134 484A10 10 0 1 0 124 494H166" />
      </g>

      {/* Wärmepumpe (Außeneinheit) */}
      <rect className={z} x="176" y="412" width="120" height="100" rx="12" />
      <path className={z} d="M194 512V520M278 512V520" />
      <circle className={z} cx="236" cy="462" r="32" />
      <g data-motion="luefter">
        <path className={z} d="M236 462C236 448 244 438 256 438M236 462C248 469 252 481 246 491M236 462C224 469 212 467 206 457" />
      </g>
      <circle className={styles.voll} cx="236" cy="462" r="4.5" />
      <path className={cn(z, styles.vl, styles.stummelVl)} d="M236 512V520" />
      <path className={cn(z, styles.rl, styles.stummelRl)} d="M236 512V520" />

      {/* Haus aus dem Logo: Giebel 45°, Wärmepegel steigt vom Boden bis unter den First */}
      <clipPath id={PEGEL_ID}>
        <rect data-motion="waerme" x="330" y="180" width="280" height="345" />
      </clipPath>
      <path className={styles.hausFlaeche} clipPath={`url(#${PEGEL_ID})`} d="M340 520V320L470 190L600 320V520Z" />
      <path className={z} d="M316 344L470 190L624 344M340 320V520M600 320V520" />

      {/* Fenster mit Sprossenkreuz, Tür (mobil hoch im Anschnitt, dort entfallen sie) */}
      <g className={styles.fenster}>
        <rect className={z} x="520" y="352" width="48" height="48" rx="4" />
        <path className={z} d="M544 352V400M520 376H568M522 520V448H566V520" />
        <circle className={styles.voll} cx="557" cy="486" r="3.5" />
      </g>

      {/* Heizkörper */}
      <rect className={z} x="392" y="428" width="84" height="60" rx="8" />
      <path className={z} d="M413 440V476M434 440V476M455 440V476" />

      {/* Vorlauf und Rücklauf im Haus (Zeichnungsmaß: 28 Einheiten Abstand), Fließpfeile */}
      <path className={cn(z, styles.vl)} data-motion="vorlauf-haus" pathLength={1} d="M296 444H392" />
      <path className={cn(z, styles.rl)} data-motion="ruecklauf-haus" pathLength={1} d="M392 472H296" />
      <g data-motion="pfeile">
        <path className={cn(z, styles.vl)} d="M358 437L365 444L358 451" />
        <path className={cn(z, styles.rl)} d="M322 465L315 472L322 479" />
      </g>

      {/* Uhr im Giebel: rastet auf 13:30 ein */}
      <circle className={z} cx="470" cy="272" r="34" />
      <path className={cn(z, styles.zeiger, styles.zeigerStd)} data-motion="uhr" d="M470 272L484.1 257.9" />
      <path className={cn(z, styles.zeiger)} data-motion="uhr" d="M470 272V298" />
      <circle className={styles.voll} cx="470" cy="272" r="4" />
      <path className={cn(z, styles.nurDesktop)} d="M494 248L560 182" />
      <path className={cn(z, styles.nurMobil, styles.hinweis1330)} d="M446 248L428 230H412" />

      {/* Maßkette 35 km: vom Dach bis über den Bildrand (Desktop) */}
      <path className={cn(z, styles.nurDesktop)} d="M570 284H900M570 272V296" />

      {/* Wegweiser „Wetzlar“ (B Runde 1), rechts neben dem Haus auf der Bodenlinie (Desktop) */}
      <g className={styles.nurDesktop}>
        <path className={z} d="M708 520V404" />
        <path className={cn(z, styles.schild)} d="M632 434L650 416H724V452H650Z" />
        <text className={cn(styles.schildText, 'font-display font-bold')} x="687" y="439.5" textAnchor="middle">
          {WEGWEISER}
        </text>
      </g>
    </svg>
  );
}
