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

/** „SHK-Jobs in Wetzlar.“ → „SHK-Jobs“ / „in Wetzlar.“ (zwei Plakatzeilen ohne Umbruch, Variante 1). */
function plakatzeilen(titel: string): [string, string] {
  const i = titel.indexOf(' ');
  return i < 0 ? [titel, ''] : [titel.slice(0, i), titel.slice(i + 1)];
}

/** „Ehrliches Handwerk. Pünktlich Feierabend.“ → je Satz eine Zeile. */
function saetze(text: string): string[] {
  return text.split(/(?<=\.)\s+/);
}

export interface EinstiegProps {
  /** Stichtag für das Jubiläum (E-START-002); die Seite rendert stündlich neu (revalidate). */
  now: Date;
  /** Id der h1; der Abschnitt zeigt mit aria-labelledby darauf. */
  titleId: string;
}

/**
 * Einstieg der Startseite (Variante 1 „Der Kreislauf läuft an“): Plakatzeile, Zweitzeile mit Rohrklammer,
 * Einleitung; das Haus mit Wärmepumpe an der Bodenlinie, die vier Zusagen als Maße an der Zeichnung; im
 * Erdreich fallen Vorlauf und Rücklauf in „Jetzt bewerben“. Mobil eigens komponiert (Höhenstufen B–D).
 */
export function Einstieg({ now, titleId }: EinstiegProps) {
  const [zeile1, zeile2] = plakatzeilen(HERO.title);
  const masse = einstiegMasse();
  const jahre = jahreskette(now);
  // Das letzte Wort und der Pfeil bleiben zusammen (auf 320 px sonst eine vierte Zeile nur für den Pfeil)
  const trenn = ZWEITWEG.label.lastIndexOf(' ');
  const [zweitwegAnfang, zweitwegEnde] = [ZWEITWEG.label.slice(0, trenn), ZWEITWEG.label.slice(trenn + 1)];

  return (
    <>
      <div className={styles.einstieg}>
        <div className={styles.text}>
          <p className={cn(styles.ortsmarke, 'text-etikett text-ink-2')}>{ortsmarke(now)}</p>
          <h1 id={titleId} className="text-brand">
            <span className={cn(styles.titelHaupt, 'text-plakat')}>
              <span>{zeile1}</span> <span>{zeile2}</span>
            </span>{' '}
            <span className={cn(styles.titelZweit, 'text-title-3 text-ink-2')}>
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
          <p className={cn(styles.lead, 'text-ink')}>{HERO.lead}</p>
        </div>

        <div className={styles.bild}>
          <div className={styles.rahmen}>
            <Szene />
          </div>
          <div className={styles.fundament} aria-hidden="true" />
          <div className={cn(styles.kette, styles.kette35)} aria-hidden="true" />
          {jahre ? (
            <p className={cn(styles.jahre, 'text-footnote text-ink-2')} aria-hidden="true" data-bis={`${jahre.bis}-12-31`}>
              <span className={cn(styles.kette, styles.jahreKette)} />
              <span className={cn(styles.jahreEnde, 'font-mass text-ink')}>{jahre.bis}</span>
            </p>
          ) : null}
        </div>

        <div className={styles.boden} data-primary-cta="">
          <ul className={styles.masse}>
            <li className={cn(styles.mass, styles.mass1330)}>
              <span className={cn(styles.wert, 'font-mass text-brand')}>{masse.freitag.value}</span>{' '}
              <span className={cn(styles.name, 'text-etikett text-ink-2')}>{masse.freitag.label}</span>
            </li>
            <li className={cn(styles.mass, styles.mass30)}>
              <span className={cn(styles.wert, 'font-mass text-brand')}>{masse.urlaub.value}</span>{' '}
              <span className={cn(styles.name, 'text-etikett text-ink-2')}>{masse.urlaub.label}</span>
            </li>
            <li className={cn(styles.mass, styles.mass35)}>
              <span className={cn(styles.wert, 'font-mass text-brand')}>{masse.radius.value}</span>{' '}
              <span className={cn(styles.name, 'text-etikett text-ink-2')}>{masse.radius.label}</span>
            </li>
            <li className={cn(styles.mass, styles.mass1926)}>
              <span className={cn(styles.wert, 'font-mass text-brand')}>{masse.gruendung.value}</span>{' '}
              <span className={cn(styles.name, 'text-etikett text-ink-2')}>{masse.gruendung.label}</span>
            </li>
          </ul>

          {/* Mobil: Vorlauf und Rücklauf fallen senkrecht in den Knopf */}
          <span className={cn(styles.erdleitung, styles.erdleitungVl)} data-motion="erdleitung" aria-hidden="true" />
          <span className={cn(styles.erdleitung, styles.erdleitungRl)} data-motion="erdleitung" aria-hidden="true" />
          {/* Desktop: Fall, Bogen (--r-2 / --r-3, konzentrisch) und Lauf in den Flansch des Knopfs */}
          <svg className={cn(styles.erdleitungD, styles.erdleitungDVl)} aria-hidden="true" focusable="false">
            <line className={styles.fallD} data-motion="erdleitung-d" pathLength={1} x1="100%" y1="0" x2="100%" y2="42" transform="translate(-1.5 0)" />
            <svg x="100%" overflow="visible">
              <path className={styles.bogenD} data-motion="erdleitung-d" pathLength={1} d="M-1.5 42A12 12 0 0 1 -13.5 54" />
            </svg>
            <line className={styles.laufD} data-motion="erdleitung-d" pathLength={1} x1="100%" y1="54" x2="0" y2="54" transform="translate(-13.5 0)" />
          </svg>
          <svg className={cn(styles.erdleitungD, styles.erdleitungDRl)} aria-hidden="true" focusable="false">
            <line className={styles.laufD} data-motion="erdleitung-d" pathLength={1} x1="0" y1="66" x2="100%" y2="66" transform="translate(-25.5 0)" />
            <svg x="100%" overflow="visible">
              <path className={styles.bogenD} data-motion="erdleitung-d" pathLength={1} d="M-25.5 66A24 24 0 0 0 -1.5 42" />
            </svg>
            <line className={styles.fallD} data-motion="erdleitung-d" pathLength={1} x1="100%" y1="42" x2="100%" y2="0" transform="translate(-1.5 0)" />
          </svg>

          <Link href={APPLY_PATH} className={cn(styles.aktion, 'rounded-1')} data-motion="druck">
            {SHORT_APPLY_LABEL}
            <Icon name="arrow-right" size="md" />
          </Link>
          <p className={styles.mikro}>{mitZiffern(HERO.microcopy)}</p>
          <a className={cn(styles.zweitweg, 'rounded-1')} href={ZWEITWEG.href} data-motion="druck">
            <span>
              {zweitwegAnfang}{' '}
              <span className={styles.zusammen}>
                {zweitwegEnde}
                <Icon name="arrow-down" size={18} className={styles.zweitwegIkon} />
              </span>
            </span>
          </a>
        </div>
      </div>

      <div className={styles.fuss}>
        <p className={styles.satz}>{KREISLAUF_SATZ}</p>
        <KreislaufKnopf className={cn(styles.knopf, 'rounded-1')} wartetClassName={styles.knopfWartet} dauerMs={AUFTAKT_ENDE_MS}>
          <Icon name="rotate-ccw" size="md" />
          {KREISLAUF_KNOPF}
        </KreislaufKnopf>
      </div>
    </>
  );
}
