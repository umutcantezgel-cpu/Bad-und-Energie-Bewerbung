import Link from 'next/link';
import { bindSeparators, withSoftHyphens } from '@/components/jobs/text';
import { Icon } from '@/components/icons';
import { Waermebild } from '@/components/zeichnung/Waermebild';
import { themaPfad } from '@/lib/themen/jsonld';
import { getThema } from '@/lib/themen/registry';
import type { WaermepumpenPageText } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import { Abschnitt, Kaestenband, Kontakt, Saetze, WeitereThemen } from './Bausteine';
import { ThemaKopf } from './ThemaKopf';
import styles from './themen.module.css';

/**
 * Themenseite Wärmepumpen (E-028). Tonfolge: Kopf Papier/Navy (Wärmebild, statisch, Variante 3) · Die Marken Papier
 * (Etiketten-Kästchen der fünf Hersteller, darunter die Partnerstufen mit ihren belegten Zusätzen) · Je Stelle Wand
 * (die Aufgaben mit Wärmepumpen im Wortlaut der Anzeigen) · Lernen Navy · Weitere Themen Wand · Kontakt Papier.
 */
export function WaermepumpenSeite({ text }: { text: WaermepumpenPageText }) {
  return (
    <>
      <ThemaKopf text={text} pfad={themaPfad(getThema('waermepumpen'))} bildBreit panel={<Waermebild />} />

      <Abschnitt kopf={text.marken.kopf} trenner klammer>
        <ul className={styles.marken} aria-label="Hersteller">
          {text.marken.namen.map((name) => (
            <li key={name} className={styles.marke}>
              <Icon name="waermepumpe" size="lg" className="shrink-0" />
              <span>{name}</span>
            </li>
          ))}
        </ul>
        <ul className={styles.partner} aria-label="Partnerstufen">
          {text.marken.partner.map((saeule) => (
            <li key={saeule.name} className={styles.partnerZeile}>
              <p className="text-title-3 text-brand">{saeule.name}</p>
              {saeule.zusatz ? <p className={styles.partnerZusatz}>{saeule.zusatz}</p> : null}
            </li>
          ))}
        </ul>
      </Abschnitt>

      <Abschnitt kopf={text.arbeit.kopf} tone="wand" trenner="62%">
        {text.arbeit.stellen.length > 0 ? (
          <ul className={styles.pakete} aria-label={text.arbeit.kopf.heading}>
            {text.arbeit.stellen.map((stelle) => (
              <li key={stelle.jobId} className={styles.paket}>
                <h3 className="text-title-3 text-brand">
                  <Link href={stelle.href} className={styles.stellenLink} data-motion="druck">
                    {bindSeparators(withSoftHyphens(stelle.titel, stelle.titleShy))}
                  </Link>
                </h3>
                {stelle.einleitung ? <p className={styles.paketText}>{stelle.einleitung}</p> : null}
                <ul className={styles.aufgaben}>
                  {stelle.aufgaben.map((aufgabe) => (
                    <li key={aufgabe}>{aufgabe}</li>
                  ))}
                </ul>
                {stelle.betrag ? (
                  <p className={cn(styles.paketBetrag)}>
                    <span className="font-mass text-callout font-medium text-brand">{stelle.betrag}</span>{' '}
                    <span className="text-etikett text-ink-muted">{stelle.einheit}</span>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        <div className={styles.text}>
          <Saetze saetze={[text.arbeit.schluss]} />
        </div>
      </Abschnitt>

      <Kaestenband kopf={text.lernen.kopf} kaesten={text.lernen.kaesten} />

      <WeitereThemen weitere={text.weitere} />
      <Kontakt kontakt={text.kontakt} whatsapp={text.whatsapp} />
    </>
  );
}
