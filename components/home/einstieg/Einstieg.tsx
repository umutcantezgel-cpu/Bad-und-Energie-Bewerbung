import Link from 'next/link';
import { Icon } from '@/components/icons';
import { APPLY_PATH, SHORT_APPLY_LABEL } from '@/components/site/nav';
import { Rohrklammer } from '@/components/zeichnung';
import { AUFTAKT_ENDE_MS } from '@/lib/motion/register';
import { cn } from '@/lib/utils/cn';
import { HERO } from '../content';
import { KREISLAUF_KNOPF, KREISLAUF_SATZ, ZWEITWEG, einstiegMasse, jahreskette, ortsmarke } from './einstieg-text';
import { KreislaufKnopf } from './KreislaufKnopf';
import { Szene } from './Szene';
import { mitZiffern } from './ziffern';
import styles from './einstieg.module.css';

/** „SHK-Jobs in Wetzlar.“ → „SHK-Jobs“ / „in Wetzlar.“ (zwei Plakatzeilen ohne Umbruch). */
function plakatzeilen(titel: string): [string, string] {
  const i = titel.indexOf(' ');
  return i < 0 ? [titel, ''] : [titel.slice(0, i), titel.slice(i + 1)];
}

/** „Ehrliches Handwerk. Pünktlich Feierabend.“ → je Satz eine Zeile. */
function saetze(text: string): string[] {
  return text.split(/(?<=\.)\s+/);
}

/** Sonne (30 Tage Urlaub) vor dem Wert: Kreis und acht Strahlen im 24er-Raster, Strich currentColor. */
function Sonne() {
  return (
    <svg className={styles.sonne} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M4.9 4.9l2.5 2.5M16.6 16.6l2.5 2.5M4.9 19.1l2.5-2.5M16.6 7.4l2.5-2.5" />
    </svg>
  );
}

/**
 * Etiketten-Kästchen an der Zeichnung (Variante 3): die drei Gewerke mit ihren Familien-Icons. Am Desktop
 * mit Beschriftung in Versalien, am Handy nur die Zeichen. Dekorativ: die Einleitung nennt dieselben Gewerke.
 */
function Marken() {
  return (
    <div className={styles.marken} aria-hidden="true">
      <span className={cn(styles.marke, styles.markePumpe)}>
        <span className={styles.platte}>
          <Icon name="waermepumpe" size="md" />
        </span>
        <span className={cn(styles.markeText, 'text-etikett')}>Wärmepumpen</span>
      </span>
      <span className={cn(styles.marke, styles.markeHeizung)}>
        <span className={styles.platte}>
          <Icon name="flamme" size="md" />
        </span>
        <span className={cn(styles.markeText, 'text-etikett')}>Heizungen</span>
      </span>
      <span className={cn(styles.marke, styles.markeBad)}>
        <span className={styles.platte}>
          <Icon name="tropfen" size="md" />
        </span>
        <span className={cn(styles.markeText, 'text-etikett')}>Bäder</span>
      </span>
    </div>
  );
}

export interface EinstiegProps {
  /** Stichtag für das Jubiläum (E-START-002); die Seite rendert stündlich neu (revalidate). */
  now: Date;
  /** Id der h1; der Abschnitt zeigt mit aria-labelledby darauf. */
  titleId: string;
}

/**
 * Einstieg der Startseite nach den Bildern des Auftraggebers (Variante 3 „Wärmebild“, statisch, E-024):
 * - Desktop: links auf Papier Etikett, h1, Unterzeile mit Rohrklammer, Einleitung, der rote Knopf, Mikrotext,
 *   Zweitweg; rechts die Navy-Fläche vom Kopf bis zur Falz mit den Maßen im Himmel, „13:30“ groß mit
 *   Hinweislinie zur Uhr im Giebel und dem Haus im Wärmebild. Der Vorlauf läuft aus dem Knopf in die Pumpe.
 * - Handy: ein Navy-Block (Etikett, h1 und Unterzeile weiß, das Haus, die Maße als Leiste), dann fallen
 *   Vorlauf und Rücklauf links senkrecht auf Papier; der Vorlauf zweigt in den Knopf ab.
 * Reihenfolge im DOM (Lesen, Tab): Etikett, h1, Zeichnung (dekorativ), Maße, Einleitung, Knopf, Mikrotext,
 * Zweitweg, Erklärsatz T-001 mit „Kreislauf zeigen“.
 */
export function Einstieg({ now, titleId }: EinstiegProps) {
  const [zeile1, zeile2] = plakatzeilen(HERO.title);
  const masse = einstiegMasse();
  const jahre = jahreskette(now);
  // Das letzte Wort und der Pfeil bleiben zusammen (auf 320 px sonst eine Zeile nur für den Pfeil)
  const trenn = ZWEITWEG.label.lastIndexOf(' ');
  const [zweitwegAnfang, zweitwegEnde] = [ZWEITWEG.label.slice(0, trenn), ZWEITWEG.label.slice(trenn + 1)];

  return (
    <div className={styles.einstieg}>
      {/* Titelblock: mobil auf Navy, am Desktop auf Papier (die Rollen kommen dort per inherit zurück) */}
      <div className={styles.kopf} data-tone="inverse">
        <p className={cn(styles.ortsmarke, 'text-etikett text-ink')}>{ortsmarke(now)}</p>
        <h1 id={titleId} className={cn(styles.titel, 'font-display text-brand')}>
          <span className={styles.titelHaupt}>
            <span>{zeile1}</span> <span>{zeile2}</span>
          </span>{' '}
          <span className={cn(styles.titelZweit, 'text-title-3')}>
            <span className={styles.klammer}>
              <Rohrklammer />
            </span>
            {saetze(HERO.titleSecondLine).map((satz, i) => (
              <span key={satz}>
                {i > 0 ? ' ' : null}
                {satz}
              </span>
            ))}
          </span>
        </h1>
      </div>

      {/* Navy-Fläche mit dem Haus im Wärmebild und den Maßen */}
      <div className={styles.bild} data-tone="inverse">
        <div className={styles.rahmen}>
          <div className={styles.lage}>
            <Szene />
            <Marken />
            <span className={cn(styles.ablesung, 'font-mass')} aria-hidden="true">
              {masse.freitag.value}
            </span>
          </div>
        </div>
        <div className={styles.leiste}>
          {/* Mobil laufen Rücklauf und Vorlauf durch die Leiste (mit Mantel in der Seitenfarbe) */}
          <span className={cn(styles.leitung, styles.leisteRl)} data-motion="erdleitung" aria-hidden="true" />
          <span className={cn(styles.leitung, styles.leisteVl)} data-motion="erdleitung" aria-hidden="true" />
          <ul className={styles.masse}>
            <li className={cn(styles.mass, styles.mass1330)}>
              <span className={cn(styles.wert, 'font-display')}>{masse.freitag.value}</span>{' '}
              <span className={styles.name}>{masse.freitag.label}</span>
            </li>
            <li className={styles.mass}>
              <span className={cn(styles.wert, 'font-display')}>
                <Sonne />
                {masse.urlaub.value}
              </span>{' '}
              <span className={styles.name}>{masse.urlaub.label}</span>
            </li>
            <li className={styles.mass}>
              <span className={cn(styles.wert, 'font-display')}>{masse.radius.value}</span>{' '}
              <span className={cn(styles.name, styles.trennbar)}>{masse.radius.label.replace('Einsatz', 'Einsatz­')}</span>
            </li>
            <li className={cn(styles.mass, styles.massLetzt)}>
              <span className={cn(styles.wert, 'font-display')}>{masse.gruendung.value}</span>{' '}
              <span className={styles.name}>{masse.gruendung.label}</span>
              {/* Jubiläumsjahr: das Ende der Maßkette 1926 … 2026, ohne Satz (E-023), nur am Desktop */}
              {jahre ? (
                <span className={cn(styles.jahre, 'font-mass')} aria-hidden="true" data-bis={`${jahre.bis}-12-31`}>
                  {jahre.bis}
                </span>
              ) : null}
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.rest}>
        {/* Mobil: Leitungsschacht links; der Vorlauf zweigt auf Knopfhöhe in die Hauptaktion ab */}
        <span className={cn(styles.leitung, styles.schachtRl)} data-motion="erdleitung" aria-hidden="true" />
        <span className={cn(styles.leitung, styles.schachtVlOben)} data-motion="erdleitung" aria-hidden="true" />
        <span className={cn(styles.leitung, styles.schachtVlUnten)} data-motion="erdleitung" aria-hidden="true" />

        <p className={styles.lead}>{HERO.lead}</p>
        <div className={styles.aktion} data-primary-cta="">
          <span className={styles.abzweig} data-motion="erdleitung" aria-hidden="true" />
          <Link href={APPLY_PATH} className={cn(styles.bewerben, 'font-display rounded-1')} data-motion="druck">
            {SHORT_APPLY_LABEL}
          </Link>
        </div>
        <p className={styles.mikro}>{mitZiffern(HERO.microcopy)}</p>
        <a className={cn(styles.zweitweg, 'rounded-1')} href={ZWEITWEG.href} data-motion="druck">
          <span>
            {zweitwegAnfang}{' '}
            <span className={styles.zusammen}>
              {zweitwegEnde}
              <Icon name="chevron-down" size="md" className={styles.zweitwegIkon} />
            </span>
          </span>
        </a>

        <div className={styles.fuss}>
          <p className={styles.satz}>{KREISLAUF_SATZ}</p>
          <KreislaufKnopf className={cn(styles.knopf, 'rounded-1')} wartetClassName={styles.knopfWartet} dauerMs={AUFTAKT_ENDE_MS}>
            <Icon name="rotate-ccw" size="md" />
            {KREISLAUF_KNOPF}
          </KreislaufKnopf>
        </div>
      </div>

      {/* Desktop: der Vorlauf aus dem Knopf, Bogen (--radius-2) nach unten und auf Pumpenhöhe über den Panelrand.
          Lage über Ankerpositionierung am Knopf (--einstieg-knopf) und an der Pumpe (124 Einheiten über der Falz);
          Zeichnungswerte: 3 = halbe Rohrbreite mit Reserve, 12 = --radius-2, 32 = Abstand der Steigleitung zur Fläche. */}
      <svg className={styles.rohrD} aria-hidden="true" focusable="false">
        <line className={styles.rohrD1} data-motion="erdleitung-d" pathLength={1} x1="44" y1="3" x2="100%" y2="3" transform="translate(-44 0)" />
        <svg x="100%" overflow="visible">
          <path className={styles.rohrD2} data-motion="erdleitung-d" pathLength={1} d="M-44 3A12 12 0 0 1 -32 15" />
        </svg>
        <line className={styles.rohrD3} data-motion="erdleitung-d" pathLength={1} x1="100%" y1="30" x2="100%" y2="100%" transform="translate(-32 -15)" />
        <svg x="100%" y="100%" overflow="visible">
          <path className={styles.rohrD4} data-motion="erdleitung-d" pathLength={1} d="M-32 -15A12 12 0 0 0 -20 -3H0" />
        </svg>
      </svg>
    </div>
  );
}
