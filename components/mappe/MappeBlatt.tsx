import { cn } from '@/lib/utils/cn';
import styles from './mappe.module.css';

export interface MappeBlattProps {
  className?: string;
}

/**
 * Zeichnung für die Navy-Fläche des Seitenkopfs (R5-MAPPE-01, E-023): die Mappe als zwei eingemessene
 * A4-Blätter. Vorn das Anschreiben (Briefkopf mit dem Giebel aus dem Logo, Zeilen), dahinter der Lebenslauf
 * (Fotofeld). Vorlauf und Rücklauf laufen von links ins Anschreiben und gehen dort in die Zeilen über
 * (KERN K-001: der rote Vorlauf endet in deiner Bewerbung). Maßketten 210 und 297 (mm, DIN A4) in Martian Mono.
 * Formsystem K-010: Strich 3 px bei jeder Größe, runde Enden, Farben nur über Rollen. Dekorativ, ohne Bewegung;
 * Inhalt und Maße stehen als Text im Kopf (Unterzeile, Maße).
 */
export function MappeBlatt({ className }: MappeBlattProps) {
  const z = cn(styles.blattStrich, styles.blattLinie);
  return (
    <svg
      className={cn(styles.blatt, className)}
      viewBox="0 0 240 220"
      aria-hidden="true"
      focusable="false"
      data-zeichnung="mappe-blatt"
    >
      {/* Lebenslauf (hinten): Name, Fotofeld, Zeilen rechts neben dem Anschreiben */}
      <path className={z} d="M114 10H210V146H174" />
      <path className={z} d="M114 10V38" />
      <path className={z} d="M124 22H164" />
      <rect className={z} x="182" y="20" width="20" height="26" rx="3" />
      <path className={z} d="M182 62H202M182 74H202M182 86H196M182 104H202M182 116H192" />

      {/* Anschreiben (vorn): Wärmefläche, Briefkopf mit Giebel 45°, Empfänger, Betreff, Zeilen */}
      <path className={styles.blattWaerme} d="M74 38H174V178H74Z" />
      <path className={z} d="M74 38H174V178H74Z" />
      <path className={z} d="M86 62L96 52L106 62" />
      <path className={z} d="M114 57H160" />
      <path className={z} d="M86 78H120M86 88H112" />
      <path className={z} d="M86 106H140" />
      <path className={z} d="M86 120H162M86 132H162M86 144H154M86 156H138" />
      <path className={z} d="M86 168H106" />

      {/* Vorlauf (oben) und Rücklauf (unten) im Paarabstand 12 laufen ins Anschreiben */}
      <path className={cn(styles.blattStrich, styles.blattVorlauf)} d="M6 120H74" />
      <path className={cn(styles.blattStrich, styles.blattRuecklauf)} d="M6 132H74" />

      {/* Maßketten: Breite unter dem Anschreiben, Höhe rechts am Lebenslauf */}
      <path className={z} d="M74 192H174M74 186V198M174 186V198" />
      <text className={styles.blattMass} x="124" y="214" textAnchor="middle">
        210
      </text>
      <path className={z} d="M222 10V146M216 10H228M216 146H228" />
      <text className={styles.blattMass} x="0" y="0" textAnchor="middle" transform="translate(238 78) rotate(-90)">
        297
      </text>
    </svg>
  );
}
