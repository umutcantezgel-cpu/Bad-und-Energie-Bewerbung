import Link from 'next/link';
import { Icon } from '@/components/icons';
import { APPLY_PATH, SHORT_APPLY_LABEL } from '@/components/site/nav';
import { Heizkreis, Rohrklammer } from '@/components/zeichnung';
import { DauerSteuerung } from '@/components/zeichnung/bewegung/DauerSteuerung';
import { Aussengeraet } from '@/components/zeichnung/technik/Aussengeraet';
import { WaermefeldEbenen } from '@/components/zeichnung/waerme/Waermefeld';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { HAUSSCHNITT_RAHMEN } from '@/lib/zeichnung/szenen/hausschnitt';
import { HERO, heroLead, heroZweitzeile } from '../content';
import { EINZELHEIT_TEXT, EINZELHEIT_TITEL, KREISLAUF_SATZ, RADIUS_ETIKETT, ZWEITWEG, einstiegMasse, jahreskette, ortsmarke } from './einstieg-text';
import { Szene } from './Szene';
import { mitZiffern } from './ziffern';
import styles from './einstieg.module.css';

/** „SHK-Jobs in Wetzlar.“ → „SHK-Jobs“ / „in Wetzlar.“ (zwei Plakatzeilen ohne Umbruch). */
function plakatzeilen(titel: string): [string, string] {
  const i = titel.indexOf(' ');
  return i < 0 ? [titel, ''] : [titel.slice(0, i), titel.slice(i + 1)];
}

/** „Ehrliches Handwerk. Je nach Stelle flexible Arbeitszeiten.“ → je Satz eine Zeile. */
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

export interface EinstiegProps {
  /** Stichtag für das Jubiläum (E-START-002) und die offenen Stellen; die Seite rendert stündlich neu (revalidate). */
  now: Date;
  /** Id der h1; der Abschnitt zeigt mit aria-labelledby darauf. */
  titleId: string;
}

/**
 * Einstieg der Startseite (Technische Zeichnung 2.0, E-029; Aufbau nach den Bildern des Auftraggebers, E-024):
 * - Desktop: links auf Papier Etikett, h1, Unterzeile, Einleitung, der rote Knopf, Mikrotext, Zweitweg; rechts die
 *   Navy-Fläche vom Kopf bis zur Falz, oben die Maße (35 km, 30 Tage, 1926), darunter der Hausschnitt. Im Himmel
 *   links die Einzelheit „X“: die Außeneinheit von vorn mit Maßketten, deren Rotor dreht, solange die Startbedingung
 *   gilt (Knopf „Anhalten“). Der Vorlauf läuft aus der Anlage links aus der Fläche in den Knopf.
 * - Handy: ein Navy-Block (Etikett, h1 und Unterzeile, Hausschnitt, Maße als Leiste), dann fällt der Vorlauf links
 *   senkrecht auf Papier und zweigt in den Knopf ab; die Einzelheit „X“ steht nach dem Erklärsatz als eigener Block.
 * Leitmotiv „35 km“ (E-027, seit E-029 ohne Zirkel): das Maß in Schrift im Giebel; am Desktop fasst ein Heizkreis das
 * Maß oben in der Fläche, eine Rohrklammer die Unterzeile (E-031, Rohrakzente an freigegebenen Stellen). Im Raum des
 * Hausschnitts liegt das Wärmefeld (E-031): Band 0 als Fläche, die Bänder 1–4 als eigene Ebenen unter der Szene; sie
 * breiten sich nach dem Vorlauf aus (Register `waerme-breitet-sich-aus`, Auslöser `nachlauf`, Ende ≤ 1.920 ms).
 * Reihenfolge im DOM (Lesen, Tab) wie am Handy: Etikett, h1, Zeichnung (dekorativ), Maße, Einleitung, Knopf,
 * Mikrotext, Zweitweg, Erklärsatz T-001, Einzelheit mit „Anhalten“. Am Desktop setzt das Raster die Einzelheit in die
 * Navy-Fläche (gleiche Zelle wie das Bild). So springt der Fokus nicht vom Kopf zum Pausenknopf weit unten und zurück
 * (WCAG 2.4.3, 1.3.2), und beim schrittweisen Aufbau des HTML rutscht die Einzelheit nicht nach (CLS, K-013).
 */
export function Einstieg({ now, titleId }: EinstiegProps) {
  // Die Startseite spricht über alle offenen Stellen (Sammelfläche): Fakten, die für eine davon offen sind, mit Bezug
  const stellen = getActiveJobs().filter((job) => isJobLive(job, now));
  const [zeile1, zeile2] = plakatzeilen(HERO.title);
  const masse = einstiegMasse(stellen);
  const jahre = jahreskette(now);
  // „Einsatzgebiet“ / „rund um Wetzlar“: zwei Zeilen am Maß (nie „rund“ allein am Zeilenende)
  const [radiusWort, ...radiusRest] = RADIUS_ETIKETT.split(' ');
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
            {/* Rohrklammer (E-031): fasst die Unterzeile am Desktop wie eine Rohrschelle, Vorlauf oben, Rücklauf unten */}
            <span className={styles.klammer}>
              <Rohrklammer />
            </span>
            {saetze(heroZweitzeile(stellen)).map((satz, i) => (
              <span key={satz}>
                {i > 0 ? ' ' : null}
                {satz}
              </span>
            ))}
          </span>
        </h1>
      </div>

      {/* Navy-Fläche mit dem Hausschnitt, der Einzelheit und den Maßen */}
      <div className={styles.bild} data-tone="inverse">
        <div className={styles.rahmen}>
          <div className={styles.lage}>
            <WaermefeldEbenen id="hausschnitt" rahmen={{ x: 0, y: 0, ...HAUSSCHNITT_RAHMEN }} />
            <Szene />
            <span className={cn(styles.ablesung, 'font-mass')} aria-hidden="true" data-motion="radius-einrasten">
              {masse.radius.value}
            </span>
          </div>
        </div>
        <div className={styles.leiste}>
          {/* Mobil laufen Vorlauf und Rücklauf durch die Leiste */}
          <span className={cn(styles.leitung, styles.leisteRl)} data-motion="erdleitung" aria-hidden="true" />
          <span className={cn(styles.leitung, styles.leisteVl)} data-motion="erdleitung" aria-hidden="true" />
          <ul className={styles.masse}>
            <li className={cn(styles.mass, styles.massRadius)}>
              {/* Heizkreis (E-031): nur am Desktop gezeichnet, mobil steht das Maß wie die beiden anderen */}
              <Heizkreis
                className={styles.kreis}
                wert={<span className={cn(styles.wert, 'font-display')}>{masse.radius.value}</span>}
                name={
                  <span className={cn(styles.name, styles.trennbar, 'font-sans')}>
                    <span className={styles.zeile}>{radiusWort.replace('Einsatz', 'Einsatz­')}</span>{' '}
                    <span className={styles.zeile}>{radiusRest.join(' ')}</span>
                  </span>
                }
              />
            </li>
            <li className={styles.mass}>
              <span className={cn(styles.wert, 'font-display')}>
                <Sonne />
                {masse.urlaub.value}
              </span>{' '}
              <span className={styles.name}>{masse.urlaub.label}</span>
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
        {/* Mobil: Leitungsschacht links; der Vorlauf kommt von oben aus der Anlage und zweigt auf Knopfhöhe ab */}
        <span className={cn(styles.leitung, styles.schachtRl)} data-motion="erdleitung" aria-hidden="true" />
        <span className={cn(styles.leitung, styles.schachtVlOben)} data-motion="erdleitung" aria-hidden="true" />
        <span className={cn(styles.leitung, styles.schachtVlUnten)} data-motion="erdleitung" aria-hidden="true" />

        <div className={styles.handlung}>
          <p className={styles.lead}>{heroLead(stellen)}</p>
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
        </div>

        <div className={styles.fuss}>
          <p className={styles.satz}>{KREISLAUF_SATZ}</p>
        </div>
      </div>

      {/* Einzelheit „X“ (Navy): im DOM hinter Knopf und Erklärsatz wie am Handy (Tab-Folge, WCAG 2.4.3; kein
          Nachrutschen beim schrittweisen Aufbau, CLS); am Desktop setzt das Raster sie in den Himmel der Navy-Fläche */}
      <div className={styles.einzelheit} data-einzelheit="X" data-tone="inverse">
        <DauerSteuerung
          beschriftung={
            <span className={cn(styles.einzelheitText, 'text-etikett')}>
              {EINZELHEIT_TEXT.split(' · ').map((teil, i) => (
                <span key={teil} className={styles.zusammen}>
                  {i > 0 ? ' · ' : null}
                  {teil}
                </span>
              ))}
            </span>
          }
        >
          <Aussengeraet ansicht="vorne" massketten="haupt" bewegt titel={EINZELHEIT_TITEL} schriftfeld={false} massSchrift={78} />
        </DauerSteuerung>
      </div>

      {/* Desktop: der Vorlauf aus der Anlage, vom Rand der Navy-Fläche (Höhe der Erdleitung) über Bogen, Steigleitung
          und Bogen in den Knopf. Lage über Ankerpositionierung am Knopf (--einstieg-knopf) und an der Fläche
          (--einstieg-flaeche); Zeichnungswerte: 3 = halbe Rohrbreite mit Reserve, 12 = --radius-2, 32 = Abstand der
          Steigleitung zur Fläche. Jeder Pfad ist in Fließrichtung gezeichnet (von der Fläche zum Knopf). */}
      <div className={styles.rohrD} aria-hidden="true">
        <svg className={styles.rohrSvg} aria-hidden="true" focusable="false">
          <svg x="100%" y="100%" overflow="visible">
            <path className={styles.rohrD1} data-motion="erdleitung-d" pathLength={1} d="M0 -3H-20A12 12 0 0 1 -32 -15" />
          </svg>
          <line className={styles.rohrD2} data-motion="erdleitung-d" pathLength={1} x1="100%" y1="100%" x2="100%" y2="30" transform="translate(-32 -15)" />
          <svg x="100%" overflow="visible">
            <path className={styles.rohrD3} data-motion="erdleitung-d" pathLength={1} d="M-32 15A12 12 0 0 0 -44 3" />
          </svg>
          <line className={styles.rohrD4} data-motion="erdleitung-d" pathLength={1} x1="100%" y1="3" x2="44" y2="3" transform="translate(-44 0)" />
        </svg>
      </div>
    </div>
  );
}
