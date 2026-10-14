import Link from 'next/link';
import { JobQuote } from '@/components/jobs/JobQuote';
import { bindSeparators, withSoftHyphens } from '@/components/jobs/text';
import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import { themaPfad } from '@/lib/themen/jsonld';
import { getThema } from '@/lib/themen/registry';
import { geschuetzt, type FahrzeugPageText } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import { Abschnitt, Kontakt, WeitereThemen } from './Bausteine';
import { Servicefahrzeug } from './Servicefahrzeug';
import { ThemaKopf } from './ThemaKopf';
import styles from './stil';

/**
 * Themenseite Fahrzeug und Werkzeug (E-028). Tonfolge: Kopf Papier/Navy (Servicefahrzeug mit offener Schiebetür) ·
 * Stückliste Papier (Positionen im Etiketten-Kästchen, wie Werkzeug & Fuhrpark der Startseite; Tankkarte, iPad und
 * Azubi-Set nur mit den Stellen, zu denen sie gehören) · Je Stelle Wand (Paketzeilen der Anzeigen) · Stimme aus dem
 * Team Navy · Weitere Themen Wand · Kontakt Papier.
 */
export function FahrzeugSeite({ text }: { text: FahrzeugPageText }) {
  return (
    <>
      <ThemaKopf
        text={text}
        pfad={themaPfad(getThema('fahrzeug-und-werkzeug'))}
        bildBreit
        panel={<Servicefahrzeug titel={text.zeichnung.titel} etiketten={text.zeichnung.etiketten} />}
      />

      <Abschnitt kopf={text.stueckliste.kopf} trenner klammer>
        <ol className={styles.stueckliste} aria-label={text.stueckliste.kopf.heading}>
          {text.stueckliste.positionen.map((position) => (
            <li key={position.factId} className={styles.position}>
              <Etikettkasten icon={position.icon}>
                {position.pos} · {position.etikett}
              </Etikettkasten>
              <h3 className="text-title-3 text-brand">{position.titel}</h3>
              <p className={styles.positionText}>{geschuetzt(position.text)}</p>
              {position.giltFuer ? (
                <p className={cn(styles.giltFuer, 'text-etikett text-ink-muted')}>
                  Gehört zu: <span className={styles.giltFuerStellen}>{position.giltFuer.join(' · ')}</span>
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </Abschnitt>

      {text.jeStelle.pakete.length > 0 ? (
        <Abschnitt kopf={text.jeStelle.kopf} tone="wand" trenner="62%">
          <ul className={styles.pakete} aria-label={text.jeStelle.kopf.heading}>
            {text.jeStelle.pakete.map((paket) => (
              <li key={paket.jobId} className={styles.paket}>
                <h3 className="text-title-3 text-brand">
                  <Link href={paket.href} className={styles.stellenLink} data-motion="druck">
                    {bindSeparators(withSoftHyphens(paket.titel, paket.titleShy))}
                  </Link>
                </h3>
                <dl className={styles.paketZeilen}>
                  {paket.zeilen.map((zeile) => (
                    <div key={zeile.etikett} className={styles.paketZeile}>
                      <dt className="text-etikett text-ink-muted">{zeile.etikett}</dt>
                      <dd>{geschuetzt(zeile.text)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </Abschnitt>
      ) : null}

      {text.zitat ? <JobQuote quote={text.zitat} /> : null}

      <WeitereThemen weitere={text.weitere} />
      <Kontakt kontakt={text.kontakt} whatsapp={text.whatsapp} />
    </>
  );
}
