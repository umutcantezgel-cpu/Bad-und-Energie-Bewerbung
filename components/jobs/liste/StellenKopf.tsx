import { Seitenkopf } from '@/components/seitenkopf';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import { Heizkreis } from '@/components/zeichnung/Heizkreis';
import { APPLY_PATH, SHORT_APPLY_LABEL } from '@/components/site/nav';
import { BREADCRUMB_HOME, BREADCRUMB_JOBS } from '@/lib/content/breadcrumbs';
import type { Job } from '@/lib/jobs/registry';
import {
  GEWERKE,
  HEIZKREIS,
  LISTEN_EINLEITUNG,
  LISTEN_MASSE,
  LISTEN_MIKROTEXT,
  listenEtikett,
  listenUnterzeile,
  listenZweitweg,
} from './liste-text';
import styles from './liste.module.css';

export interface StellenKopfProps {
  /** Die Stellen, die gerade live sind (Etikett, Unterzeile und Zweitweg zählen sie). */
  jobs: readonly Job[];
  /** Text der h1, im Wortlaut der bisherigen Seite (Metadaten und Abnahme hängen daran). */
  titel: string;
}

/**
 * Zeichnung der Stellenliste auf der Navy-Fläche (Variante 2 „Schleife um 13:30“): der Heizkreis mit 13:30 in
 * Bildgröße, daran am Rücklauf die drei Gewerke als Etiketten-Kästchen mit Familien-Icons (Variante 3).
 * Echter Text, kein Bild: Der Screenreader liest „13:30 Freitags Feierabend“ und die Gewerke.
 */
export function StellenZeichnung() {
  return (
    <div className={styles.zeichnung}>
      <Heizkreis wert={<span className={styles.zahl}>{HEIZKREIS.wert}</span>} name={HEIZKREIS.name} groesse="gross" />
      <ul className={styles.gewerke} aria-label="Gewerke">
        {GEWERKE.map((gewerk) => (
          <li key={gewerk.name} className={styles.gewerk}>
            <Etikettkasten icon={gewerk.icon}>{gewerk.name}</Etikettkasten>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Kopf der Stellenliste (R5-JOBS-01): Pfad, dann der gemeinsame Seitenkopf in der Variante `erzaehl` wie der
 * Einstieg der Startseite – Papier links mit Etikett, h1, Rohrklammer-Unterzeile und „Jetzt bewerben“, Navy
 * rechts (mobil oben) mit dem Heizkreis und den Maßen 30 Tage und 35 km. Server-Komponente ohne Bewegung.
 *
 * Der Pfad steht über dem Kopf (Breadcrumbs: „Pfad über dem Seitenkopf“); das BreadcrumbList-Markup der Seite
 * entspricht ihm (app/jobs/__tests__/seo.test.ts). Ab 64em reicht die Navy-Fläche durch die Pfadleiste bis
 * an den Kopf der Website, wie im Einstieg.
 */
export function StellenKopf({ jobs, titel }: StellenKopfProps) {
  const [satz1, satz2] = listenUnterzeile(jobs);

  return (
    <>
      <div className={styles.pfadleiste}>
        {/* Pfad ohne eigene Klasse: Abnahme und Test lesen <nav aria-label="Brotkrümelnavigation"> wörtlich */}
        <div className={styles.pfad}>
          <Breadcrumbs items={[BREADCRUMB_HOME, { label: BREADCRUMB_JOBS.label }]} />
        </div>
        <span className={styles.pfadNavy} data-tone="inverse" aria-hidden="true" />
      </div>
      <Seitenkopf
        variante="erzaehl"
        etikett={listenEtikett(jobs.length)}
        titel={titel}
        unterzeile={
          <>
            <span className="block">{satz1}</span> <span className="block">{satz2}</span>
          </>
        }
        einleitung={<p>{LISTEN_EINLEITUNG}</p>}
        aktion={{ href: APPLY_PATH, label: SHORT_APPLY_LABEL }}
        mikrotext={LISTEN_MIKROTEXT}
        zweitweg={listenZweitweg(jobs.length)}
        masse={LISTEN_MASSE}
        panel={<StellenZeichnung />}
      />
    </>
  );
}
