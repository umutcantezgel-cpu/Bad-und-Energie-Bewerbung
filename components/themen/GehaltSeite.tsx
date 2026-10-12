import Link from 'next/link';
import { bindSeparators, withSoftHyphens } from '@/components/jobs/text';
import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import { Heizkreis } from '@/components/zeichnung/Heizkreis';
import { getThema } from '@/lib/themen/registry';
import { themaPfad } from '@/lib/themen/jsonld';
import { geschuetzt, type GehaltPageText } from '@/lib/themen/text';
import { Abschnitt, Kaestenband, Kontakt, Saetze, WeitereThemen } from './Bausteine';
import { Gehaltsleiter } from './Gehaltsleiter';
import { ThemaKopf } from './ThemaKopf';
import styles from './themen.module.css';

/**
 * Themenseite Gehalt (E-028). Tonfolge: Kopf Papier/Navy (Gehaltsleiter: jede live Stelle auf einer Euro-Skala) ·
 * Spannen je Stelle Papier (je Stelle der Heizkreis mit der Spanne, Voraussetzung und Vergütung aus der Anzeige) · Was
 * dazukommt Navy · Ausbildung Papier (nur mit live Ausbildungsstelle) · Weitere Themen Wand · Kontakt Papier.
 */
export function GehaltSeite({ text }: { text: GehaltPageText }) {
  return (
    <>
      <ThemaKopf
        text={text}
        pfad={themaPfad(getThema('gehalt'))}
        bildBreit
        panel={text.leiter ? <Gehaltsleiter leiter={text.leiter} /> : null}
      />

      {text.spannen.karten.length > 0 ? (
        <Abschnitt kopf={text.spannen.kopf} trenner klammer>
          <ul className={styles.spannen} aria-label={text.spannen.kopf.heading}>
            {text.spannen.karten.map((karte) => (
              <li key={karte.jobId} className={styles.spanne}>
                <Heizkreis wert={<span className={styles.spanneBetrag}>{karte.betrag}</span>} name={karte.einheit} />
                <div className={styles.spanneText}>
                  <h3 className="text-title-3 text-brand">
                    <Link href={karte.href} className={styles.stellenLink} data-motion="druck">
                      {bindSeparators(withSoftHyphens(karte.titel, karte.titleShy))}
                    </Link>
                  </h3>
                  <p className="text-etikett text-ink-muted">{karte.anstellung}</p>
                  <dl className={styles.angaben}>
                    {karte.voraussetzung.length > 0 ? (
                      <div>
                        <dt className="text-etikett text-ink-muted">{karte.voraussetzung.length > 1 ? 'Voraussetzungen' : 'Voraussetzung'}</dt>
                        {/* Je Voraussetzung eine Zeile: Die Anzeige nennt sie als eigene Sätze (Kritik 2, P2-5) */}
                        {karte.voraussetzung.map((punkt) => (
                          <dd key={punkt}>{punkt}</dd>
                        ))}
                      </div>
                    ) : null}
                    {karte.verguetung ? (
                      <div>
                        <dt className="text-etikett text-ink-muted">Vergütung</dt>
                        <dd>{karte.verguetung}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </Abschnitt>
      ) : null}

      <Kaestenband kopf={text.dazu.kopf} kaesten={text.dazu.kaesten} />

      {text.ausbildung ? (
        <Abschnitt kopf={text.ausbildung.kopf} tone="papier" trenner>
          <div className={styles.zweiSpalten}>
            <div className={styles.text}>
              <Saetze saetze={text.ausbildung.saetze} lead />
            </div>
            <ul className={styles.kaestchenListe}>
              {text.ausbildung.kaesten.map((kasten) => (
                <li key={kasten.titel} className={styles.kaestchen}>
                  <Etikettkasten icon={kasten.icon} className="whitespace-normal">
                    {kasten.titel}
                  </Etikettkasten>
                  {kasten.text ? <p className={styles.absatz}>{geschuetzt(kasten.text)}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </Abschnitt>
      ) : null}

      <WeitereThemen weitere={text.weitere} />
      <Kontakt kontakt={text.kontakt} whatsapp={text.whatsapp} />
    </>
  );
}
