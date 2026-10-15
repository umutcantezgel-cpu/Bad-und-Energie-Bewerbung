import { cn } from '@/lib/utils/cn';
import { LEITSTELLE } from '@/lib/zeichnung/buero/leitstelle';
import styles from '../stil';
import { BueroZeichnung } from './BueroZeichnung';

export interface LeitstelleProps {
  /** Zugänglicher Name aus lib/themen/text.ts (`leitstelle.titel`); er beschreibt genau diese Zeichnung. */
  titel: string;
  /** Wörter an den vier Zielen (lib/themen/text.ts `leitstelle.ziele`). */
  ziele: Readonly<Record<'monteure' | 'kundendienst' | 'kunden' | 'lager', string>>;
  className?: string;
}

/**
 * Leitstelle (Signatur der Seite „Büro und Verwaltung“, E-031, Paket W3): der Schreibtisch von oben, maßstäblich, mit
 * Bezugslinien zu Monteuren, Kundendienst, Kunden sowie Großhandel und Lager (lib/zeichnung/buero/leitstelle.ts). Still
 * im Kopf auf Navy; dieselbe Zeichnung ist als Datei das Kopfbild der Bürofachkraft. Die Ziele stehen in jeder Breite
 * als Beschriftung direkt an ihren Glyphen, ohne Kasten (Prüfrunde 1 A1-7: am Handy war es eine losgelöste Reihe aus
 * Kästen unter dem Bild, die wie Knöpfe wirkte).
 */
export function Leitstelle({ titel, ziele, className }: LeitstelleProps) {
  return (
    <div className={cn(styles.bueroLeitstelle, className)} role="img" aria-label={titel} data-zeichnung="leitstelle">
      <BueroZeichnung szene={LEITSTELLE} beschriftungen={ziele} />
    </div>
  );
}
