import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import z from '@/components/zeichnung/zeichnung.module.css';
import { cn } from '@/lib/utils/cn';
import styles from './themen.module.css';

export interface AbsperrungProps {
  /** Zugänglicher Name (role="img"). */
  titel: string;
  /** Beschriftungen: Anfang der Leitung, Abzweig, Ziel. */
  etiketten: { du: string; arbeitgeber: string; ziel: string };
  className?: string;
}

/**
 * Absperrung (Signatur der Seite „Diskret wechseln“, 480 × 300 Einheiten): Vorlauf und Rücklauf laufen von dir bis
 * ins Haus mit dem Zirkelzeichen (Firmensitz Wetzlar). Der Abzweig nach oben, zu deinem derzeitigen Arbeitgeber, endet
 * an einem Blindflansch: Dort fließt nichts. Das Bild zeigt die Zusage DISCRETION_PROMISE (lib/content/process.ts) in
 * der Sprache der Zeichnungen, ohne neue Aussage. Wo der Rücklauf des Abzweigs den Vorlauf kreuzt, läuft der Vorlauf
 * mit einem Mantel in der Fläche darüber (wie im Wärmebild). Strich 3 px bei jeder Größe; steht immer auf Navy.
 */
export function Absperrung({ titel, etiketten, className }: AbsperrungProps) {
  const l = cn(z.strich, z.linie, z.fest);
  const vl = cn(z.strich, z.vorlauf, z.fest);
  const rl = cn(z.strich, z.ruecklauf, z.fest);
  return (
    <div className={cn(styles.absperrung, className)} role="img" aria-label={titel} data-zeichnung="absperrung">
      <svg className={z.svg} viewBox="0 0 480 300" aria-hidden="true" focusable="false">
        {/* Haus (Firmensitz): Wärmefüllung, Giebel 45° mit Traufe, Wände, Zirkelzeichen, Heizkörper */}
        <path className={z.waermeFlaeche} d="M364 262V160L410 114L456 160V262Z" />
        <path className={l} d="M348 176L410 114L472 176M364 160V262M456 160V262" />
        <circle className={l} cx="410" cy="166" r="16" />
        <circle className={l} cx="410" cy="166" r="7" />
        <path className={l} d="M410 166L398.69 154.69" />
        <circle className={z.voll} cx="410" cy="166" r="3" />
        <rect className={l} x="404" y="204" width="38" height="30" rx="4" />
        <path className={l} d="M416 210V228M430 210V228" />
        {/* Abzweig zum derzeitigen Arbeitgeber: Rücklauf zuerst, der Vorlauf kreuzt mit Mantel darüber */}
        <path className={rl} d="M168 224V122" />
        <path className={cn(z.strich, z.fest, z.mantel)} d="M24 212H404" />
        <path className={vl} d="M24 212H404" />
        <path className={vl} d="M156 212V122" />
        <path className={rl} d="M404 224H24" />
        {/* Absperrventil, geschlossen (gefülltes Ventilzeichen über beiden Leitungen) */}
        <path className={cn(l, z.voll)} d="M146 150H178L162 166ZM146 182H178L162 166Z" />
        {/* Blindflansch: zwei Scheiben, verschraubt, darüber nichts */}
        <rect className={cn(l, styles.flansch)} x="136" y="110" width="52" height="12" rx="2" />
        <rect className={cn(l, styles.flansch)} x="136" y="98" width="52" height="12" rx="2" />
        <path className={l} d="M143 92V128M181 92V128" />
        {/* Anfang der Leitung (du): zwei Endkappen */}
        <path className={l} d="M20 204V232" />
        {/* Bodenlinie */}
        <path className={l} d="M4 262H476" />
      </svg>
      <span className={styles.absperrungEtiketten} aria-hidden="true">
        <Etikettkasten icon="users" className={cn(styles.absperrungEtikett, styles.abDu)}>
          {etiketten.du}
        </Etikettkasten>
        <Etikettkasten icon="shield-check" className={cn(styles.absperrungEtikett, styles.abArbeitgeber)}>
          {etiketten.arbeitgeber}
        </Etikettkasten>
        <Etikettkasten icon="standort" className={cn(styles.absperrungEtikett, styles.abZiel)}>
          {etiketten.ziel}
        </Etikettkasten>
      </span>
    </div>
  );
}
