import { Symbol } from '@/components/zeichnung/technik/Symbol';
import t from '@/components/zeichnung/technik/technik.module.css';
import { cn } from '@/lib/utils/cn';
import { anschlussPunkt } from '@/lib/zeichnung/symbole';
import styles from './stil';

export interface AbsperrungProps {
  /** Beschriftungen: Anfang des Wegs (du), wohin nichts geht (derzeitiger Arbeitgeber), Ziel (Firmensitz). */
  etiketten: { du: string; arbeitgeber: string; ziel: string };
  className?: string;
}

/** Zeilenköpfe des Laufzettels (Mikrotext, K-012). */
export const LAUFZETTEL = Object.freeze({ von: 'Von', an: 'An', nichtAn: 'Nicht an' });

/**
 * Kurze Leitung vor „Dein Arbeitgeber“ (E-031, KERN 1.3 K-003.2): der Vorlauf läuft auf einen geschlossenen Kugelhahn
 * (Symbol nach DIN EN ISO 10628-2, Körper gefüllt = geschlossen, lib/zeichnung/symbole.ts) und endet danach rund. In
 * px (viewBox 48 × 24 in --a-7 × --a-5), der Hahn in 7/8 der Schemagröße (21 px breit), damit „Dein Arbeitgeber“ am
 * Desktop daneben in eine Zeile passt. Leitung in Fließrichtung von links. Dekorativ (aria-hidden).
 */
const HAHN = { x: 24, y: 0, massstab: 0.875 } as const;
const VOR = anschlussPunkt('kugelhahnGeschlossen', 'ein', HAHN);
const NACH = anschlussPunkt('kugelhahnGeschlossen', 'aus', HAHN);
export const ABSPERR_LEITUNG = Object.freeze({ vor: `M3 0H${VOR.x}`, nach: `M${NACH.x} 0H45` });

function Abgesperrt() {
  return (
    <svg className={styles.absperrLeitung} viewBox="0 -12 48 24" aria-hidden="true" focusable="false" data-zeichnung="absperrung">
      <path d={ABSPERR_LEITUNG.vor} className={cn(t.leitung, t.vorlauf)} />
      <path d={ABSPERR_LEITUNG.nach} className={cn(t.leitung, t.vorlauf)} />
      <Symbol id="kugelhahnGeschlossen" {...HAHN} />
    </svg>
  );
}

/**
 * Signatur der Seite „Diskret wechseln“ (E-028): ein Laufzettel in drei Zeilen, „Von: Du“, „An: Wetzlar“, „Nicht an:
 * Dein Arbeitgeber“ (seit E-029 Typografie statt Absperrung und Blindflansch). Seit E-031 steht vor „Dein Arbeitgeber“
 * wieder die Absperrung, aufgewertet und normgerecht: eine kurze Leitung mit geschlossenem Kugelhahn. Der Zettel sagt
 * dasselbe wie die Zusage FACTS.discretion („Wir kontaktieren unter keinen Umständen deinen derzeitigen Arbeitgeber.“,
 * im Kopf direkt daneben), ohne neue Aussage. Zeilenköpfe in Martian Mono (Etikett), Werte in Bricolage, feine Linien
 * zwischen den Zeilen; die letzte Zeile leiser. Echter Text (Beschreibungsliste), steht immer auf Navy.
 */
export function Absperrung({ etiketten, className }: AbsperrungProps) {
  const zeilen = [
    { kopf: LAUFZETTEL.von, wert: etiketten.du },
    { kopf: LAUFZETTEL.an, wert: etiketten.ziel },
    { kopf: LAUFZETTEL.nichtAn, wert: etiketten.arbeitgeber, leise: true, abgesperrt: true },
  ];
  return (
    <div className={cn(styles.absperrung, className)} data-zeichnung="laufzettel">
      <dl className={styles.laufzettel}>
        {zeilen.map((z) => (
          <div key={z.kopf} className={cn(styles.laufzeile, z.leise && styles.laufzeileLeise)}>
            <dt className="text-etikett text-ink-2">{z.kopf}</dt>
            <dd className={cn(styles.laufwert, z.abgesperrt && styles.laufwertAbgesperrt, 'font-display')}>
              {z.abgesperrt ? <Abgesperrt /> : null}
              {z.wert}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
