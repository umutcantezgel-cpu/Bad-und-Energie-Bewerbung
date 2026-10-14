import Link from 'next/link';
import { bindSeparators, withSoftHyphens } from '@/components/jobs/text';
import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import { getThema } from '@/lib/themen/registry';
import { themaPfad } from '@/lib/themen/jsonld';
import { geschuetzt, type GehaltPageText } from '@/lib/themen/text';
import { Abschnitt, Kaestenband, Kontakt, Saetze, WeitereThemen } from './Bausteine';
import { ThemaKopf } from './ThemaKopf';
import styles from './themen.module.css';

/**
 * „Lohn auf Anfrage“ im Navy-Panel des Kopfs (E-030, Plan §A: ein ruhiger Block statt der Gehaltsleiter mit Beträgen):
 * Etikett, die Aussage in Bricolage, darunter die belegten Fakten ohne Zahl.
 */
function LohnBlock({ lohn }: { lohn: GehaltPageText['lohn'] }) {
  return (
    <div className="flex max-w-sm flex-col gap-3 border-t-(length:--m-strich) border-brand pt-4" data-zeichnung="lohn">
      <p className="text-etikett text-ink-2">{lohn.etikett}</p>
      <p className="text-title-1 text-brand">{lohn.titel}</p>
      <ul className="flex flex-col gap-1 text-body text-ink">
        {lohn.zeilen.map((zeile) => (
          <li key={zeile}>{geschuetzt(zeile)}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Themenseite „Bezahlung und Extras“ (E-028, seit E-030 ohne Beträge; Slug `gehalt` bleibt). Tonfolge: Kopf Papier/Navy
 * (Block „Lohn auf Anfrage“) · Extras je Stelle Papier (Anstellung, Voraussetzung und Vergütung aus der Anzeige) · Was
 * dazukommt Navy · Ausbildung Papier (nur mit live Ausbildungsstelle) · Weitere Themen Wand · Kontakt Papier.
 */
export function GehaltSeite({ text }: { text: GehaltPageText }) {
  return (
    <>
      <ThemaKopf text={text} pfad={themaPfad(getThema('gehalt'))} panel={<LohnBlock lohn={text.lohn} />} />

      {text.jeStelle.karten.length > 0 ? (
        <Abschnitt kopf={text.jeStelle.kopf} trenner klammer>
          <ul className={styles.spannen} aria-label={text.jeStelle.kopf.heading}>
            {text.jeStelle.karten.map((karte) => (
              <li key={karte.jobId} className={styles.spanne}>
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
