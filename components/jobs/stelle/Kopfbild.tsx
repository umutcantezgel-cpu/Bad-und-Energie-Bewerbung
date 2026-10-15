import type { CSSProperties } from 'react';
import Image from 'next/image';
import { DauerSteuerung } from '@/components/zeichnung/bewegung/DauerSteuerung';
import { ANLAGENSCHEMA_TITEL } from '@/components/zeichnung/technik/Anlagenschema';
import { Aussengeraet } from '@/components/zeichnung/technik/Aussengeraet';
import t from '@/components/zeichnung/technik/technik.module.css';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { KOPF_HAUS_VIEWBOX, kopfSvgPfad } from '@/lib/zeichnung/kopf-svg';
import { SCHRIFTFELD_SCHEMA, versal } from '@/lib/zeichnung/norm';
import { ANLAGENSCHEMA_RAHMEN, ANLAGENSCHEMA_SYMBOLE, ANLAGENSCHEMA_TEXTE } from '@/lib/zeichnung/szenen/anlagenschema';
import { SalaryCard } from '../SalaryCard';
import { kopfZeichnung } from './stelle-text';
import styles from './stelle.module.css';

export interface KopfbildProps {
  job: Job;
}

/** Text links neben dem Knopf „Anhalten“ unter der Gerätezeichnung. */
export const KOPFBILD_GERAET_TEXT = 'Außeneinheit · Maße in mm';

/**
 * Zeichnung im Navy-Panel des Stellenkopfs (E-029) über dem Block „Lohn auf Anfrage“ (E-030, ohne Betrag); welche,
 * wählt `kopfZeichnung` nach dem Beruf:
 * - Kundendienst: die Außeneinheit von vorn mit Maßketten, der Rotor dreht im Sichtfeld (DauerSteuerung, Knopf
 *   „Anhalten“); auf jeder Breite, am Handy schmaler. Der Block steht dann eine Stufe kleiner darunter.
 * - Anlagenmechaniker und Ausbildung: das Anlagenschema, statisch, beschriftet (Außeneinheit, Inneneinheit, Heizkreise,
 *   Erdreich) mit kurzem Schriftfeld; die Legende steht auf /arbeiten-bei-uns/waermepumpen. Erst ab 64em.
 * - alle anderen: der kleine Hausschnitt (dekorativ), ebenfalls erst ab 64em. Am Handy bleibt der Knopf im ersten Bild.
 *
 * Anlagenschema und Hausschnitt kommen als SVG-Datei (lib/zeichnung/kopf-svg.ts) per `<img loading="lazy">`: Am Handy
 * ist ihr Behälter verborgen, der Browser lädt sie dann nicht, und das Dokument trägt sie nicht mehr zweimal (HTML und
 * RSC-Nutzlast; Prüfung E-029, Runde 3: Dokument über der Slow-Start-Grenze, LCP +225 ms). Die Beschriftung des Schemas
 * steht als HTML über dem Bild, in der Schrift der Seite und in denselben Größen wie in der Zeichnung.
 */
export function Kopfbild({ job }: KopfbildProps) {
  const art = kopfZeichnung(job);
  return (
    <div className={cn(styles.kopfbild, art !== 'hausschnitt' && styles.kopfbildBreit)} data-stelle-kopfbild={art}>
      {art === 'aussengeraet' ? (
        <DauerSteuerung className={styles.kopfGeraet} beschriftung={<span className="text-etikett text-ink-2">{KOPFBILD_GERAET_TEXT}</span>}>
          <Aussengeraet ansicht="vorne" massketten="haupt" bewegt schriftfeld={false} massSchrift={64} />
        </DauerSteuerung>
      ) : null}
      {art === 'anlagenschema' ? <KopfSchema /> : null}
      {art === 'hausschnitt' ? (
        <div className={styles.haus} data-zeichnung="hausschnitt-klein">
          <Image
            src={kopfSvgPfad('hausschnitt')}
            alt=""
            width={KOPF_HAUS_VIEWBOX.breite}
            height={KOPF_HAUS_VIEWBOX.hoehe}
            loading="lazy"
            unoptimized
            className={styles.kopfDatei}
          />
        </div>
      ) : null}
      <SalaryCard job={job} size={art === 'aussengeraet' ? 'mittel' : 'gross'} />
    </div>
  );
}

/** Lage einer Beschriftung über dem Bild: Prozent des Rahmens, Anker wie text-anchor (Mitte der Zeile auf y). */
const lage = (x: number, y: number): CSSProperties => ({
  left: `${Math.round((x / ANLAGENSCHEMA_RAHMEN.breite) * 100_000) / 1000}%`,
  top: `${Math.round((y / ANLAGENSCHEMA_RAHMEN.hoehe) * 100_000) / 1000}%`,
});

/**
 * Anlagenschema im Kopf: die Datei ohne Beschriftung, darüber Bereiche (immer) und Symbole (ab 40rem Breite) als HTML,
 * darunter das kurze Schriftfeld. Der zugängliche Name steht am Bild, die Beschriftung ist für Hilfsmittel verborgen.
 */
function KopfSchema() {
  const { breite, hoehe } = ANLAGENSCHEMA_RAHMEN;
  return (
    <figure className={styles.kopfSchema} data-zeichnung="anlagenschema">
      <div className={styles.schemaBild}>
        <Image
          src={kopfSvgPfad('anlagenschema')}
          alt={ANLAGENSCHEMA_TITEL}
          width={breite}
          height={hoehe}
          loading="lazy"
          unoptimized
          className={styles.kopfDatei}
        />
        {ANLAGENSCHEMA_TEXTE.map((text) => (
          <span key={text.wert} className={styles.schemaText} style={lage(text.x, text.y)} data-anker={text.anker} aria-hidden="true">
            {versal(text.wert)}
          </span>
        ))}
        {ANLAGENSCHEMA_SYMBOLE.map((s) =>
          s.text ? (
            <span
              key={s.key}
              className={cn(styles.schemaText, styles.schemaSymbolText)}
              style={lage(s.text.x, s.text.y)}
              data-anker={s.text.anker}
              aria-hidden="true"
            >
              {versal(s.text.wert)}
            </span>
          ) : null,
        )}
      </div>
      <figcaption>
        <div className={t.schriftfeld}>
          <span className="text-etikett">{SCHRIFTFELD_SCHEMA}</span>
        </div>
      </figcaption>
    </figure>
  );
}
