import { cn } from '@/lib/utils/cn';
import { Etikettkasten } from './Etikettkasten';
import styles from './zeichnung.module.css';

export interface WaermebildProps {
  /** Zugänglicher Name (role="img"). Standard: der Satz unten. `null` macht das Bild dekorativ. */
  titel?: string | null;
  /** Etiketten-Kästchen „Wärmepumpen“, „Heizungen“, „Bäder“ mit Familien-Icons (Standard an). */
  etiketten?: boolean;
  className?: string;
}

export const WAERMEBILD_TITEL =
  'Wärmebild eines Hauses: Die Wärme geht von der Wärmepumpe über den Heizkörper bis ins Bad, das Haus ist innen warm und außen kalt.';

/**
 * Wärmebild, statisch (Variante 3 ohne WebGL, für die Wärmepumpen-Stelle; 480 × 360 Einheiten): das Haus aus
 * dem Logo in vier Isothermen, kalt außen, warm an Heizkörper und Boden. Das Bild steht immer auf Navy
 * (data-tone="inverse" am Rahmen), damit die Skala in hell und dunkel gleich gelesen wird.
 *
 * Skala nur aus Rollen: kalt = Navy (Fläche), --surface-3, Rücklauf; lau und warm kommen aus
 * --wb-lau / --wb-warm, die der Seitenkopf auf Papier auflöst (Wand und Wärme, wie Variante 3); ohne sie
 * gelten Tinte 2 und Creme. Striche in der Markenrolle mit einem Mantel in Navy, damit sie auch auf den
 * hellen Isothermen eine Kante haben. Rot nur als Vorlauf-Linie.
 */
export function Waermebild({ titel = WAERMEBILD_TITEL, etiketten = true, className }: WaermebildProps) {
  const linien = (mantel: boolean) => {
    const z = cn(styles.strich, styles.fest, mantel ? styles.mantel : styles.linie);
    const vl = cn(styles.strich, styles.fest, mantel ? styles.mantel : styles.vorlauf);
    const rl = cn(styles.strich, styles.fest, mantel ? styles.mantel : styles.ruecklauf);
    return (
      <g>
        {/* Haus: Giebel 45° mit Traufe, Wände */}
        <path className={z} d="M100 220L260 60L420 220M120 200V330M400 200V330" />
        {/* Uhr im Giebel auf 13:30 mit Fadenkreuz (Messpunkt) */}
        <circle className={z} cx="260" cy="150" r="26" />
        <path className={z} d="M260 150V170M260 150L273 137M260 116V106M260 184V194M226 150H216M294 150H304" />
        {/* Heizkörper */}
        <rect className={z} x="168" y="250" width="60" height="48" rx="6" />
        <path className={z} d="M184 260V288M198 260V288M212 260V288" />
        {/* Badewanne mit Hahn */}
        <path className={z} d="M276 286H384V300A20 20 0 0 1 364 320H296A20 20 0 0 1 276 300Z" />
        <path className={z} d="M292 286V262H306" />
        {/* Wärmepumpe mit Lüfter */}
        <rect className={z} x="24" y="258" width="72" height="64" rx="10" />
        <circle className={z} cx="60" cy="290" r="20" />
        <path className={z} d="M60 290C60 279 66 272 75 272M60 290C69 296 71 305 66 311M60 290C51 296 43 294 39 287" />
        {/* Vorlauf zum Heizkörper, Rücklauf zurück (Paarabstand 12) */}
        <path className={vl} d="M96 268H168" />
        <path className={rl} d="M168 280H96" />
        {/* Bodenlinie */}
        <path className={z} d="M0 330H480" />
      </g>
    );
  };

  return (
    <div
      className={cn(styles.waermebild, className)}
      data-tone="inverse"
      data-zeichnung="waermebild"
      {...(titel ? { role: 'img', 'aria-label': titel } : {})}
    >
      <svg className={styles.svg} viewBox="0 0 480 360" aria-hidden="true" focusable="false">
        {/* Isothermen von kalt nach warm */}
        <path
          className={styles.isoKalt}
          d="M84 336V214C132 186 196 128 262 76C326 128 388 186 436 214V336Z"
        />
        <path
          className={styles.isoKuehl}
          d="M108 336V236C142 218 170 196 214 200C262 204 286 168 330 182C368 194 396 218 412 238V336ZM8 336V274C26 246 70 238 104 250V336Z"
        />
        <path
          className={styles.isoLau}
          d="M124 336V244C150 222 186 214 216 222C250 232 278 214 318 220C356 226 382 242 398 260V336ZM20 336V290C38 270 72 266 100 280V336Z"
        />
        <path
          className={styles.isoWarm}
          d="M132 336V270C150 248 186 240 214 252C240 262 262 284 300 284C340 284 368 292 388 308V336ZM34 336V308C50 294 76 294 96 304V336Z"
        />
        {linien(true)}
        {linien(false)}
      </svg>
      {etiketten ? (
        <span className={styles.wbEtiketten}>
          <Etikettkasten icon="waermepumpe" className={cn(styles.wbEtikett, styles.wbPumpe)}>
            Wärmepumpen
          </Etikettkasten>
          <Etikettkasten icon="flamme" className={cn(styles.wbEtikett, styles.wbHeizung)}>
            Heizungen
          </Etikettkasten>
          <Etikettkasten icon="tropfen" className={cn(styles.wbEtikett, styles.wbBad)}>
            Bäder
          </Etikettkasten>
        </span>
      ) : null}
    </div>
  );
}
