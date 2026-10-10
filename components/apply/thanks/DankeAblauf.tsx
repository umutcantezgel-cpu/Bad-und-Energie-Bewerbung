import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './danke.module.css';

export interface DankeAngabe {
  name: string;
  wert: ReactNode;
  icon?: IconName;
}

export interface DankeSchritt {
  id: string;
  titel: string;
  /** Erledigt (nur „Bewerbung gesendet“): Haken an der Nummer, Hinweis für Screenreader. */
  erledigt?: boolean;
  text?: ReactNode;
  /** Zusatz in Tinte (z. B. Büro gerade nicht besetzt). */
  hinweis?: ReactNode;
  /** Etikett unter dem Text wie im Ablauf der Startseite (step.highlight). */
  etikett?: string;
  /** Angaben-Schild unter dem Titel (E-START-020). */
  angaben?: readonly DankeAngabe[];
}

/**
 * „So geht es weiter“ als Leitungsstrang (E-START-020, Formsystem wie #ablauf der Startseite): Vorlauf und
 * Rücklauf kommen vom linken Rand, laufen senkrecht an den Schritten entlang und kehren unten im Bogen um.
 * Jeder Schritt hängt mit einem Abgang in Navy am Rücklauf und trägt seine Nummer in Martian Mono. Der erste
 * Schritt ist erledigt und trägt das Angaben-Schild (Stelle, Eingang, Rückmeldeweg). Rein statisch.
 */
export function DankeAblauf({ titelId, titel, schritte }: { titelId: string; titel: string; schritte: readonly DankeSchritt[] }) {
  return (
    <section aria-labelledby={titelId} className={styles.ablauf} data-danke="ablauf">
      <h2 id={titelId} className="text-title-2 text-brand">
        {titel}
      </h2>
      <div className={styles.strangRahmen}>
        <ol className={styles.strang}>
          {schritte.map((schritt, index) => (
            <li key={schritt.id} className={styles.schritt} data-stand={schritt.erledigt ? 'erledigt' : 'offen'}>
              <p className={styles.marke} aria-hidden="true">
                <span className="font-mass text-lead font-semibold text-brand">{String(index + 1).padStart(2, '0')}</span>
                {schritt.erledigt ? <Icon name="check" size="md" className="text-brand" /> : null}
              </p>
              <h3 className="text-title-3 text-brand">
                <span className="sr-only">Schritt {index + 1}: </span>
                {schritt.titel}
                {schritt.erledigt ? <span className="sr-only"> (erledigt)</span> : null}
              </h3>
              {schritt.angaben ? <Angaben angaben={schritt.angaben} /> : null}
              {schritt.text ? <p className="max-w-prose text-body text-ink-muted">{schritt.text}</p> : null}
              {schritt.hinweis ? <p className="max-w-prose text-callout text-ink">{schritt.hinweis}</p> : null}
              {schritt.etikett ? <p className="text-etikett text-ink">{schritt.etikett}</p> : null}
            </li>
          ))}
        </ol>
        <span className={styles.paar} aria-hidden="true">
          <span className={styles.paarRueck} />
          <span className={styles.paarVor} />
          <span className={styles.paarLauf} />
        </span>
      </div>
    </section>
  );
}

/** Angaben-Schild: Navy-Kontur in Strichstärke wie die Etikett-Kästchen an der Zeichnung des Einstiegs. */
function Angaben({ angaben }: { angaben: readonly DankeAngabe[] }) {
  return (
    <dl className={styles.schild} data-danke="angaben">
      {angaben.map((angabe) => (
        <div key={angabe.name} className={styles.zeile}>
          <dt className="text-etikett text-ink-2">{angabe.name}</dt>
          <dd className={cn(styles.wert, 'text-body font-bold text-ink')}>
            {angabe.icon ? <Icon name={angabe.icon} size="md" className="text-brand" /> : null}
            <span>{angabe.wert}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
