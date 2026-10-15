import { TOKENS } from '@/lib/tokens';
import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

/** Auf zwei Nachkommastellen (kurze Pfade, stabile Prüfungen). */
const r2d = (wert: number) => Math.round(wert * 100) / 100;

const HALB = TOKENS.strich / 2;
const INNEN = TOKENS.radius.r2;
const AUSSEN = TOKENS.radius.r3;
/**
 * Drehwinkel je Bogen: Zwei Bögen mit den Halbmessern r2 und r3 (Summe 36) versetzen eine Leitung um
 * (r2 + r3) · (1 − cos θ). Das soll genau ein Paarabstand sein, also cos θ = 1 − --paar / (r2 + r3) = 2/3 (θ ≈ 48,2°).
 */
const COS = 1 - TOKENS.paar / (INNEN + AUSSEN);
const SIN = Math.sqrt(1 - COS * COS);

/**
 * Geometrie des S-Bogens (E-031) in px, Ursprung am Anfang des Bogens: Vorlauf oben auf y = --m-strich/2, Rücklauf
 * einen Paarabstand darunter; beide springen um einen Paarabstand nach unten. Der erste Bogen ist für beide
 * konzentrisch um (0 | Vorlauf + r3), der Vorlauf außen mit r3 (24), der Rücklauf innen mit r2 (12); der zweite
 * konzentrisch um (Breite | Vorlauf), nun der Vorlauf innen mit r2 und der Rücklauf außen mit r3. So bleibt das Paar
 * überall im Abstand --paar. Der Rücklauf ist in Fließrichtung gezeichnet (von rechts zurück, K-003.2).
 */
export const TRENNER_BOGEN = (() => {
  const vor = HALB;
  const rueck = HALB + TOKENS.paar;
  const breite = r2d((INNEN + AUSSEN) * SIN);
  const hoehe = 2 * TOKENS.paar + TOKENS.strich;
  return Object.freeze({
    breite,
    hoehe,
    /** Lage der geraden Stücke: vor dem Bogen und danach (y in px). */
    vorher: Object.freeze({ vorlauf: vor, ruecklauf: rueck }),
    nachher: Object.freeze({ vorlauf: vor + TOKENS.paar, ruecklauf: rueck + TOKENS.paar }),
    vorlauf:
      `M0 ${vor}A${AUSSEN} ${AUSSEN} 0 0 1 ${r2d(AUSSEN * SIN)} ${r2d(vor + AUSSEN - AUSSEN * COS)}` +
      `A${INNEN} ${INNEN} 0 0 0 ${breite} ${vor + TOKENS.paar}`,
    ruecklauf:
      `M${breite} ${rueck + TOKENS.paar}A${AUSSEN} ${AUSSEN} 0 0 1 ${r2d(INNEN * SIN)} ${r2d(rueck + INNEN - INNEN * COS)}` +
      `A${INNEN} ${INNEN} 0 0 0 0 ${rueck}`,
  });
})();

export interface LeitungstrennerProps {
  /**
   * Lage des S-Bogens, gemessen vom Anfang der Leitung (Prozent oder Länge). Standard 18 % wie in Variante 1;
   * so steht der Bogen nie auf einer Satzkante.
   */
  knick?: string;
  className?: string;
}

/**
 * Leitungstrenner (B Runde 1, Variante 1 `.trenner`; seit E-031 mit S-Bogen): Vorlauf und Rücklauf laufen als Paar
 * quer durch den Behälter und versetzen sich einmal in einem S-Bogen mit konzentrischen Bögen (--radius-2 und
 * --radius-3) um einen Paarabstand nach unten. Die Leitungen enden im Seitenrand mit runden Enden (Linienart leitung,
 * `.strich`), statt an der Kante abgeschnitten zu werden. Dekorativ (`aria-hidden`), ohne Bewegung. Der Behälter
 * bestimmt die Breite; für eine randlose Linie setzt der Aufrufer die Breite selbst.
 *
 * Aufbau: drei SVG nebeneinander (gerades Stück bis zum Bogen, Bogen in fester Breite, gerades Stück bis zum Ende),
 * damit der Bogen bei jeder Breite rund bleibt und die Enden rund im Behälter liegen. Ändert sich --paar, --m-strich
 * oder ein Radius, rechnet TRENNER_BOGEN aus lib/tokens neu; components/zeichnung/__tests__/zeichnung.test.ts prüft
 * Bögen, Mittelpunkte und Versatz.
 */
export function Leitungstrenner({ knick = '18%', className }: LeitungstrennerProps) {
  const { breite, hoehe, vorher, nachher } = TRENNER_BOGEN;
  const vl = cn(styles.strich, styles.vorlauf);
  const rl = cn(styles.strich, styles.ruecklauf);
  return (
    <span className={cn(styles.trenner, className)} aria-hidden="true" data-zeichnung="leitungstrenner">
      <svg className={styles.trennerGerade} style={{ flexBasis: knick }} focusable="false">
        <line className={vl} x1="0" y1={vorher.vorlauf} x2="100%" y2={vorher.vorlauf} />
        <line className={rl} x1="100%" y1={vorher.ruecklauf} x2="0" y2={vorher.ruecklauf} />
      </svg>
      <svg className={styles.trennerBogen} width={breite} height={hoehe} viewBox={`0 0 ${breite} ${hoehe}`} focusable="false">
        <path className={vl} d={TRENNER_BOGEN.vorlauf} />
        <path className={rl} d={TRENNER_BOGEN.ruecklauf} />
      </svg>
      <svg className={cn(styles.trennerGerade, styles.trennerRest)} focusable="false">
        <line className={vl} x1="0" y1={nachher.vorlauf} x2="100%" y2={nachher.vorlauf} />
        <line className={rl} x1="100%" y1={nachher.ruecklauf} x2="0" y2={nachher.ruecklauf} />
      </svg>
    </span>
  );
}
